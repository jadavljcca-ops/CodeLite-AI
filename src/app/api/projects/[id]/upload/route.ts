import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";
import { createHash } from "crypto";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_SINGLE_FILE = 5 * 1024 * 1024; // 5MB per file
const ALLOWED_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "json", "md", "mdx", "css", "scss",
  "html", "xml", "yaml", "yml", "toml", "env", "txt", "gitignore",
  "py", "rb", "go", "rs", "java", "kt", "swift", "php", "sql",
  "sh", "bash", "zsh", "dockerfile", "prisma", "graphql",
]);

const BLOCKED_PATHS = [".git", "node_modules", ".next", ".env", "__pycache__", ".DS_Store", "dist", "build", ".cache"];

function isSafePath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/");
  if (normalized.includes("../") || normalized.startsWith("/")) return false;
  if (BLOCKED_PATHS.some((b) => normalized.includes(b))) return false;
  return true;
}

function isAllowedFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return false;
  return ALLOWED_EXTENSIONS.has(ext);
}

function detectFramework(files: string[]): { framework: string; language: string } {
  const fileSet = new Set(files.map((f) => f.split("/").pop()?.toLowerCase()));
  if (fileSet.has("next.config.js") || fileSet.has("next.config.mjs")) return { framework: "Next.js", language: "TypeScript" };
  if (fileSet.has("vite.config.ts") || fileSet.has("vite.config.js")) return { framework: "Vite/React", language: "TypeScript" };
  if (fileSet.has("angular.json")) return { framework: "Angular", language: "TypeScript" };
  if (fileSet.has("nuxt.config.js") || fileSet.has("nuxt.config.ts")) return { framework: "Nuxt.js", language: "TypeScript" };
  if (fileSet.has("requirements.txt") || fileSet.has("setup.py")) return { framework: "Python", language: "Python" };
  if (fileSet.has("go.mod")) return { framework: "Go", language: "Go" };
  if (fileSet.has("package.json")) return { framework: "Node.js", language: "JavaScript" };
  return { framework: "Unknown", language: "Unknown" };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: project } = await supabase.from("projects").select("id").eq("id", id).eq("user_id", user.id).single();
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB` }, { status: 400 });
    }

    const zip = await JSZip.loadAsync(buffer);
    const fileEntries: Array<{ path: string; content: string; size: number }> = [];

    for (const [filePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      if (!isSafePath(filePath)) continue;
      if (!isAllowedFile(filePath)) continue;

      const content = await zipEntry.async("string");
      const size = Buffer.byteLength(content, "utf8");
      if (size > MAX_SINGLE_FILE) continue;

      // Strip leading directory from zip
      const cleanPath = filePath.replace(/^[^/]+\//, "");
      fileEntries.push({ path: cleanPath, content, size });
    }

    if (fileEntries.length === 0) {
      return NextResponse.json({ error: "No valid source files found in ZIP" }, { status: 400 });
    }

    // Detect framework
    const { framework, language } = detectFramework(fileEntries.map((f) => f.path));

    // Batch insert files
    const fileRecords = fileEntries.map((f) => ({
      project_id: id,
      file_path: f.path,
      content: f.content,
      file_hash: createHash("sha256").update(f.content).digest("hex"),
      file_size: f.size,
    }));

    // Delete existing and re-insert (clean upload)
    await supabase.from("project_files").delete().eq("project_id", id);
    
    // Insert in batches of 100
    for (let i = 0; i < fileRecords.length; i += 100) {
      await supabase.from("project_files").insert(fileRecords.slice(i, i + 100));
    }

    // Update project with detected framework
    await supabase.from("projects").update({ framework, language, updated_at: new Date().toISOString() }).eq("id", id);

    return NextResponse.json({
      success: true,
      filesImported: fileEntries.length,
      framework,
      language,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to process ZIP file" }, { status: 500 });
  }
}
