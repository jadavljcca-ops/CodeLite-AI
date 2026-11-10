/**
 * Token Optimization Engine
 * Implements 10 techniques to reduce LLM token usage without sacrificing quality.
 */

export interface ProjectContext {
  files: Array<{ path: string; content: string; size: number }>;
  architecture?: string;
  dependencies?: Record<string, string>;
  framework?: string;
  language?: string;
}

export interface OptimizedContext {
  relevantFiles: Array<{ path: string; content: string; snippet?: string }>;
  architectureSummary: string;
  estimatedTokens: number;
  reductionPercentage: number;
}

// A: Smart Context Selection — retrieve only relevant files
export function selectRelevantFiles(
  files: Array<{ path: string; content: string; size: number }>,
  taskDescription: string,
  maxFiles = 10
): Array<{ path: string; content: string; size: number }> {
  const taskLower = taskDescription.toLowerCase();

  // Score files by relevance
  const scored = files.map((file) => {
    let score = 0;
    const pathLower = file.path.toLowerCase();

    // Direct keyword matches in path
    const keywords = extractKeywords(taskDescription);
    for (const kw of keywords) {
      if (pathLower.includes(kw)) score += 10;
      if (file.content.toLowerCase().includes(kw)) score += 2;
    }

    // Framework-specific scoring
    if (taskLower.includes("auth") && (pathLower.includes("auth") || pathLower.includes("login"))) score += 20;
    if (taskLower.includes("api") && pathLower.includes("api")) score += 15;
    if (taskLower.includes("database") && (pathLower.includes("db") || pathLower.includes("model") || pathLower.includes("schema"))) score += 15;
    if (taskLower.includes("test") && (pathLower.includes("test") || pathLower.includes("spec"))) score += 15;
    if (taskLower.includes("style") && (pathLower.includes("css") || pathLower.includes("style"))) score += 10;

    // Prefer smaller files (less tokens)
    score -= Math.floor(file.size / 1000);

    // Prefer config and entry files
    if (pathLower.match(/package\.json|tsconfig|\.env\.example|readme/)) score += 5;

    return { ...file, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, maxFiles);
}

// B: Context Compression — summarize and deduplicate
export function compressContext(content: string, maxChars = 2000): string {
  if (content.length <= maxChars) return content;

  // Remove comments and blank lines for code files
  const lines = content.split("\n");
  const compressed = lines
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith("//") && !trimmed.startsWith("*") && !trimmed.startsWith("#");
    })
    .join("\n");

  if (compressed.length <= maxChars) return compressed;
  return compressed.slice(0, maxChars) + "\n... [truncated for token efficiency]";
}

// C: Incremental Code Editing — prefer patches over full rewrites
export function prefersPatch(originalContent: string, newContent: string): boolean {
  const originalLines = originalContent.split("\n").length;
  const changedLines = countChangedLines(originalContent, newContent);
  return changedLines / originalLines < 0.5; // prefer patch if <50% lines changed
}

function countChangedLines(a: string, b: string): number {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  let changed = 0;
  const maxLen = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < maxLen; i++) {
    if (aLines[i] !== bLines[i]) changed++;
  }
  return changed;
}

// D: Complexity estimator for model routing
export function estimateTaskComplexity(
  taskDescription: string,
  fileCount: number
): "simple" | "medium" | "complex" {
  const desc = taskDescription.toLowerCase();
  const complexSignals = ["refactor", "architecture", "migrate", "optimize", "debug complex", "integrate", "full-stack", "real-time", "authentication system"];
  const simpleSignals = ["fix typo", "rename", "add comment", "update text", "change color", "simple", "minor"];

  if (simpleSignals.some((s) => desc.includes(s)) && fileCount <= 2) return "simple";
  if (complexSignals.some((s) => desc.includes(s)) || fileCount > 10) return "complex";
  return "medium";
}

// E: Smart Memory — build architecture summaries
export function buildArchitectureSummary(
  files: Array<{ path: string; content: string }>,
  framework: string
): string {
  const fileTree = files.map((f) => `  ${f.path}`).join("\n");
  const entryPoints = files.filter((f) => f.path.match(/index\.|app\.|main\.|page\./)).map((f) => f.path);
  const configs = files.filter((f) => f.path.match(/\.json$|\.config\.|\.env/)).map((f) => f.path);

  return `Architecture: ${framework}
Entry points: ${entryPoints.join(", ") || "none detected"}
Config files: ${configs.join(", ") || "none"}
Total files: ${files.length}
File tree:
${fileTree}`;
}

// F: Error-based context retrieval — extract only relevant error snippets
export function extractErrorContext(
  errorOutput: string,
  files: Array<{ path: string; content: string }>
): { errorSummary: string; relevantFiles: string[] } {
  const lines = errorOutput.split("\n");
  const errorLines = lines.filter((l) => l.match(/error|Error|FAIL|✗|TypeError|SyntaxError/i));
  const fileRefs = [...new Set(lines.flatMap((l) => {
    const match = l.match(/([a-zA-Z0-9_/.-]+\.(ts|tsx|js|jsx|py|go))/g);
    return match || [];
  }))];

  const relevantFiles = files
    .filter((f) => fileRefs.some((ref) => f.path.includes(ref) || ref.includes(f.path)))
    .map((f) => f.path);

  return {
    errorSummary: errorLines.slice(0, 20).join("\n"),
    relevantFiles,
  };
}

// G: Token estimation (rough heuristic: ~4 chars per token)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// H: Tool output filtering
export function filterToolOutput(output: string, maxLines = 50): string {
  const lines = output.split("\n");
  if (lines.length <= maxLines) return output;

  // Keep error lines and first/last N lines
  const errorLines = lines.filter((l) => l.match(/error|Error|FAIL|warning|Warning/i));
  const firstN = lines.slice(0, 10);
  const lastN = lines.slice(-10);

  const combined = [...new Set([...firstN, ...errorLines.slice(0, 20), ...lastN])];
  return combined.join("\n") + `\n[Output filtered from ${lines.length} to ${combined.length} lines for token efficiency]`;
}

// I: Duplicate request detection cache
const requestCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedRequest(key: string): string | null {
  const cached = requestCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    requestCache.delete(key);
    return null;
  }
  return cached.result;
}

export function setCachedRequest(key: string, result: string): void {
  requestCache.set(key, { result, timestamp: Date.now() });
}

export function hashRequest(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// J: Intelligent stop conditions
export function shouldStopRetrying(
  attempts: number,
  maxAttempts: number,
  lastError: string
): { stop: boolean; reason: string } {
  if (attempts >= maxAttempts) {
    return { stop: true, reason: `Max retry limit (${maxAttempts}) reached` };
  }
  // Stop on unrecoverable errors
  const unrecoverable = ["AUTHENTICATION_ERROR", "API_KEY_INVALID", "QUOTA_EXCEEDED", "PERMISSION_DENIED"];
  if (unrecoverable.some((e) => lastError.includes(e))) {
    return { stop: true, reason: `Unrecoverable error: ${lastError}` };
  }
  return { stop: false, reason: "" };
}

// Utility
function extractKeywords(text: string): string[] {
  const stopWords = new Set(["a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can", "need", "dare", "ought", "used", "to", "and", "or", "but", "if", "in", "on", "at", "by", "for", "with", "about", "into", "through", "during", "before", "after", "above", "below", "from", "up", "down", "out", "off", "over", "under", "again", "then", "once", "here", "there", "when", "where", "why", "how", "all", "both", "each", "few", "more", "most", "other", "some", "such", "no", "not", "only", "same", "so", "than", "too", "very", "just", "create", "add", "make", "build", "implement", "write", "fix", "update", "change", "modify"]);
  return text.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w));
}

export const TokenOptimizer = {
  selectRelevantFiles,
  compressContext,
  prefersPatch,
  estimateTaskComplexity,
  buildArchitectureSummary,
  extractErrorContext,
  estimateTokens,
  filterToolOutput,
  getCachedRequest,
  setCachedRequest,
  hashRequest,
  shouldStopRetrying,
};
