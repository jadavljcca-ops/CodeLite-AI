import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify project ownership
    const { data: project } = await supabase.from("projects").select("id").eq("id", id).eq("user_id", user.id).single();
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("project_files")
      .select("id, file_path, file_size, metadata, created_at, updated_at")
      .eq("project_id", id)
      .order("file_path");

    if (error) throw error;
    return NextResponse.json({ files: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: project } = await supabase.from("projects").select("id").eq("id", id).eq("user_id", user.id).single();
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { filePath, content } = body;

    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Path traversal protection
    const normalizedPath = filePath.replace(/\\/g, "/").replace(/\.\.\/|^\//, "");

    const hash = createHash("sha256").update(content || "").digest("hex");
    const size = Buffer.byteLength(content || "", "utf8");

    // Upsert file
    const { data, error } = await supabase
      .from("project_files")
      .upsert({
        project_id: id,
        file_path: normalizedPath,
        content: content || "",
        file_hash: hash,
        file_size: size,
        updated_at: new Date().toISOString(),
      }, { onConflict: "project_id,file_path" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ file: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
