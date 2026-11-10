"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileCode2,
  Folder,
  FolderOpen,
  Search,
  Save,
  Plus,
  RefreshCw,
  File,
  Code2,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface ProjectFile {
  id: string;
  file_path: string;
  file_size: number;
  content?: string;
  updated_at: string;
}

export default function FileExplorerPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src", "app"]));

  // Fetch project details
  const { data: projectData } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Fetch all files
  const { data: filesData, isLoading, refetch } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const files: ProjectFile[] = filesData?.files || [];

  // When a file is selected, fetch or load its content
  const handleSelectFile = async (filePath: string) => {
    setSelectedPath(filePath);
    try {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (res.ok) {
        // Find existing content or use placeholder
        const target = files.find((f) => f.file_path === filePath);
        setEditorContent(target?.content || `// File: ${filePath}\n// Ready for editing\n`);
      }
    } catch {
      toast.error("Failed to load file content");
    }
  };

  // Save file mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPath) return;
      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: selectedPath,
          content: editorContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to save file");
      return res.json();
    },
    onSuccess: () => {
      toast.success("File saved successfully");
      queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
    },
    onError: () => toast.error("Error saving file"),
  });

  // Determine language for Monaco
  const getLanguage = (path: string | null) => {
    if (!path) return "typescript";
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
    if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".py")) return "python";
    if (path.endsWith(".go")) return "go";
    if (path.endsWith(".sql")) return "sql";
    if (path.endsWith(".md")) return "markdown";
    return "plaintext";
  };

  // Filter files by search
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    return files.filter((f) => f.file_path.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [files, searchQuery]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* LEFT SIDEBAR: File Tree & Search */}
      <div className="w-72 border-r border-border/50 flex flex-col bg-card/40 flex-shrink-0">
        <div className="p-3 border-b border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" /> Workspace Files
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetch()}>
              <RefreshCw className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-8 text-xs bg-background/50"
            />
          </div>
        </div>

        {/* File Tree List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
          {isLoading ? (
            <div className="space-y-1.5 p-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {files.length === 0
                ? "No files in project yet. Upload a ZIP or let the agent generate code."
                : "No matching files."}
            </div>
          ) : (
            filteredFiles.map((file) => {
              const isSelected = selectedPath === file.file_path;
              return (
                <button
                  key={file.file_path}
                  onClick={() => handleSelectFile(file.file_path)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-mono text-left transition-colors truncate ${
                    isSelected
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <FileCode2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{file.file_path}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN AREA: Monaco Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {selectedPath ? (
          <>
            {/* Editor Top Bar */}
            <div className="h-10 border-b border-border/50 px-4 flex items-center justify-between bg-card/30 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode2 className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-semibold truncate">{selectedPath}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {getLanguage(selectedPath)}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs gradient-primary text-white border-0 shadow-sm"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                path={selectedPath}
                language={getLanguage(selectedPath)}
                value={editorContent}
                theme={theme === "light" ? "light" : "vs-dark"}
                onChange={(value) => setEditorContent(value || "")}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
              <Code2 className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-base mb-1">No File Selected</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Select a file from the left explorer tree to view and edit code with Monaco Editor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

