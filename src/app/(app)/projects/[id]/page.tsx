"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  Bot,
  FileCode2,
  Calendar,
  Sparkles,
  Zap,
  Code2,
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Project not found");
      return res.json();
    },
  });

  const { data: filesData } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (!res.ok) return { files: [] };
      return res.json();
    },
  });

  const project = data?.project;
  const files = filesData?.files || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <Link href="/projects">
          <Button className="mt-4">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Created {formatDate(project.created_at)} • Last updated {formatDate(project.updated_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}/files`}>
            <Button variant="outline" size="sm">
              <FileCode2 className="w-4 h-4 mr-1.5" /> File Explorer
            </Button>
          </Link>
          <Link href={`/projects/${projectId}/agent`}>
            <Button size="sm" className="gradient-primary text-white border-0 shadow-md">
              <Bot className="w-4 h-4 mr-1.5" /> Open Coding Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Project Meta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">Tech Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Framework:</span>
              <Badge variant="outline">{project.framework || "Standard"}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Language:</span>
              <Badge variant="secondary">{project.language || "TypeScript"}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Files Indexed:</span>
              <span className="font-mono font-medium">{files.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">Token Engine Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Context Optimization:</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Model Routing:</span>
              <span className="text-xs text-purple-400 font-medium">Flash / Pro Dynamic</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target Savings:</span>
              <span className="text-xs text-green-400 font-bold font-mono">~65%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/projects/${projectId}/agent`} className="block">
              <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs font-normal">
                <span>Start Autonomous Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href={`/projects/${projectId}/files`} className="block">
              <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs font-normal">
                <span>Inspect Workspace Files</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Description & Overview */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">About this Project</CardTitle>
          <CardDescription>
            {project.description || "No project description provided. Update your task prompts to guide the agent."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Ready to build or refactor code?
              </p>
              <p className="text-xs text-muted-foreground">
                Describe your requirements in natural language and the agent will plan, edit, and test code.
              </p>
            </div>
            <Link href={`/projects/${projectId}/agent`}>
              <Button className="gradient-primary text-white border-0 text-xs">
                Run Coding Task
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

