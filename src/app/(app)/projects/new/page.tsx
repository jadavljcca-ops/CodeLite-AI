"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Upload, FolderOpen, Loader2, CheckCircle2, ArrowLeft, FileCode2, Bot, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "upload" | "done">("details");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{ filesImported: number; framework: string } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [framework, setFramework] = useState("Next.js");
  const [language, setLanguage] = useState("TypeScript");

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a project name");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, framework, language }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create project");
      }
      const data = await res.json();
      setProjectId(data.project.id);
      setStep("upload");
      toast.success("Project workspace initialized!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !projectId) return;

    if (!file.name.endsWith(".zip")) {
      toast.error("Please upload a .zip archive");
      return;
    }

    setLoading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(45);
      const res = await fetch(`/api/projects/${projectId}/upload`, {
        method: "POST",
        body: formData,
      });
      setUploadProgress(85);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setUploadProgress(100);
      setUploadResult(data);
      setStep("done");
      toast.success(`Successfully imported ${data.filesImported} files!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload extraction failed");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
    maxFiles: 1,
    disabled: loading,
  });

  if (step === "done" && projectId) {
    return (
      <div className="p-6 max-w-lg mx-auto animate-fade-in pt-12">
        <Card className="border-border/50 text-center shadow-lg">
          <CardContent className="pt-8 pb-8 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mx-auto border border-green-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Project Ready!</h2>
              {uploadResult ? (
                <p className="text-muted-foreground text-sm mt-1">
                  Imported <strong>{uploadResult.filesImported}</strong> source files. Auto-detected framework: <strong>{uploadResult.framework}</strong>.
                </p>
              ) : (
                <p className="text-muted-foreground text-sm mt-1">
                  Your project has been initialized and is ready for the autonomous coding agent.
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <Link href={`/projects/${projectId}/agent`}>
                <Button className="gradient-primary text-white border-0 shadow-md">
                  <Bot className="w-4 h-4 mr-2" /> Launch AI Agent
                </Button>
              </Link>
              <Link href={`/projects/${projectId}/files`}>
                <Button variant="outline">
                  <FileCode2 className="w-4 h-4 mr-2" /> Open File Explorer
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Project</h1>
          <p className="text-sm text-muted-foreground">
            {step === "details" ? "Step 1: Set up project metadata" : "Step 2: Connect project files"}
          </p>
        </div>
      </div>

      {step === "details" && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Project Specifications</CardTitle>
            <CardDescription>
              Configure details about the project stack so the agent can optimize tokens and code conventions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Student Management System"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the application features, goals, or architectural context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="framework">Framework</Label>
                  <Input
                    id="framework"
                    placeholder="Next.js, Vite, Express..."
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Primary Language</Label>
                  <Input
                    id="language"
                    placeholder="TypeScript, Python, Go..."
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full gradient-primary text-white border-0" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Continue to Workspace Setup
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === "upload" && projectId && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Upload Project Source Code</CardTitle>
            <CardDescription>
              Drag & drop a ZIP archive of your existing project. Safe extraction filters node_modules, secrets, and binary assets automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              } ${loading ? "opacity-60 pointer-events-none" : ""}`}
            >
              <input {...getInputProps()} />
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              {isDragActive ? (
                <p className="text-sm font-semibold text-primary">Drop the ZIP file here...</p>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">Click to select or drag and drop a ZIP file</p>
                  <p className="text-xs text-muted-foreground">Up to 50MB. Safe traversal & file verification enabled.</p>
                </>
              )}
            </div>

            {loading && uploadProgress > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    Extracting & indexing files safely...
                  </span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="pt-2 border-t border-border/50 flex gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/projects/${projectId}/agent`)}
                disabled={loading}
              >
                Skip Upload — Start with Empty Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

