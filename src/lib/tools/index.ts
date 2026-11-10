import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Allowed commands allowlist for secure execution
const ALLOWED_COMMANDS = new Set([
  "npm test",
  "npm run test",
  "npm run build",
  "npm run lint",
  "npm run type-check",
  "npx tsc --noEmit",
  "npx eslint .",
  "git status",
  "git diff",
  "git log",
  "python -m pytest",
  "pytest",
  "go test ./...",
  "cargo test",
]);

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTimeMs?: number;
  outputFiltered?: boolean;
}

export interface WorkspaceContext {
  projectId: string;
  projectRoot: string;
  virtualFiles?: Map<string, string>;
}

export class ExecutionSandbox {
  private allowedBaseDir: string;
  private timeoutMs: number;
  private maxOutputBytes: number;

  constructor(allowedBaseDir: string, timeoutMs = 15000, maxOutputBytes = 100 * 1024) {
    this.allowedBaseDir = path.resolve(allowedBaseDir);
    this.timeoutMs = timeoutMs;
    this.maxOutputBytes = maxOutputBytes;
  }

  // Path safety verification against directory traversal
  private resolveSafePath(filePath: string): string {
    const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
    const fullPath = path.resolve(this.allowedBaseDir, normalized);
    if (!fullPath.startsWith(this.allowedBaseDir)) {
      throw new Error(`Security Violation: Path traversal outside project directory is prohibited: ${filePath}`);
    }
    return fullPath;
  }

  // 1. read_file
  async readFile(filePath: string): Promise<ToolResult> {
    try {
      const safe = this.resolveSafePath(filePath);
      const content = await fs.readFile(safe, "utf-8");
      return { success: true, data: { path: filePath, content } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 2. list_files
  async listFiles(subDir = ""): Promise<ToolResult> {
    try {
      const safeDir = this.resolveSafePath(subDir);
      const entries = await fs.readdir(safeDir, { withFileTypes: true, recursive: true });
      const files = entries
        .filter((e) => e.isFile() && !e.name.startsWith(".") && !e.name.includes("node_modules"))
        .map((e) => {
          const full = path.join(e.parentPath || safeDir, e.name);
          return path.relative(this.allowedBaseDir, full).replace(/\\/g, "/");
        });
      return { success: true, data: { files } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 3. search_code
  async searchCode(query: string, maxResults = 20): Promise<ToolResult> {
    try {
      const listRes = await this.listFiles();
      if (!listRes.success) return listRes;

      const matches: Array<{ path: string; line: number; snippet: string }> = [];
      for (const relPath of listRes.data.files) {
        if (matches.length >= maxResults) break;
        const readRes = await this.readFile(relPath);
        if (!readRes.success) continue;

        const lines = (readRes.data.content as string).split("\n");
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes(query.toLowerCase()) && matches.length < maxResults) {
            matches.push({
              path: relPath,
              line: idx + 1,
              snippet: line.trim(),
            });
          }
        });
      }
      return { success: true, data: { matches, total: matches.length } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 4. create_file
  async createFile(filePath: string, content: string): Promise<ToolResult> {
    try {
      const safe = this.resolveSafePath(filePath);
      await fs.mkdir(path.dirname(safe), { recursive: true });
      await fs.writeFile(safe, content, "utf-8");
      return { success: true, data: { path: filePath, bytesWritten: Buffer.byteLength(content) } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 5. edit_file (targeted search/replace)
  async editFile(filePath: string, target: string, replacement: string): Promise<ToolResult> {
    try {
      const safe = this.resolveSafePath(filePath);
      const original = await fs.readFile(safe, "utf-8");
      if (!original.includes(target)) {
        return { success: false, error: `Target snippet not found in ${filePath}` };
      }
      const updated = original.replace(target, replacement);
      await fs.writeFile(safe, updated, "utf-8");
      return { success: true, data: { path: filePath, modified: true } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 6. apply_patch
  async applyPatch(filePath: string, patchContent: string): Promise<ToolResult> {
    try {
      const safe = this.resolveSafePath(filePath);
      // For clean incremental patch application
      await fs.writeFile(safe, patchContent, "utf-8");
      return { success: true, data: { path: filePath, patched: true } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 7. delete_file
  async deleteFile(filePath: string): Promise<ToolResult> {
    try {
      const safe = this.resolveSafePath(filePath);
      await fs.unlink(safe);
      return { success: true, data: { path: filePath, deleted: true } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 8. run_command (sandboxed, allowlisted only)
  async runCommand(command: string): Promise<ToolResult> {
    const trimmed = command.trim();
    const isAllowed = Array.from(ALLOWED_COMMANDS).some((allowed) => trimmed.startsWith(allowed));
    if (!isAllowed) {
      return {
        success: false,
        error: `Security Policy Violation: Command '${command}' is not in the execution allowlist. Allowed commands: ${Array.from(ALLOWED_COMMANDS).join(", ")}`,
      };
    }

    const start = Date.now();
    try {
      const { stdout, stderr } = await execAsync(trimmed, {
        cwd: this.allowedBaseDir,
        timeout: this.timeoutMs,
        maxBuffer: this.maxOutputBytes,
        env: {
          ...process.env,
          NODE_ENV: "test",
          CI: "true",
        },
      });

      return {
        success: true,
        data: {
          stdout: stdout.slice(0, 4000),
          stderr: stderr.slice(0, 4000),
        },
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Command failed",
        data: {
          stdout: err.stdout?.slice(0, 4000) || "",
          stderr: err.stderr?.slice(0, 4000) || "",
        },
        executionTimeMs: Date.now() - start,
      };
    }
  }

  // 9. run_tests
  async runTests(): Promise<ToolResult> {
    return this.runCommand("npm test");
  }

  // 10. run_build
  async runBuild(): Promise<ToolResult> {
    return this.runCommand("npm run build");
  }

  // 11. inspect_dependencies
  async inspectDependencies(): Promise<ToolResult> {
    try {
      const pkgPath = this.resolveSafePath("package.json");
      const content = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      return {
        success: true,
        data: {
          dependencies: pkg.dependencies || {},
          devDependencies: pkg.devDependencies || {},
          scripts: pkg.scripts || {},
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 12. git_diff
  async gitDiff(): Promise<ToolResult> {
    return this.runCommand("git diff");
  }
}

