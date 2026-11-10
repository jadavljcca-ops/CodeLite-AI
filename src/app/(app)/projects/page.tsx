"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  Plus,
  Search,
  Trash2,
  Bot,
  Code2,
  Calendar,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  framework: string | null;
  language: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data.projects || [];
}

async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
}

const frameworkColors: Record<string, string> = {
  "Next.js": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Vite/React": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  "Angular": "text-red-400 bg-red-400/10 border-red-400/20",
  "Python": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "Go": "text-teal-400 bg-teal-400/10 border-teal-400/20",
  "Node.js": "text-green-400 bg-green-400/10 border-green-400/20",
};

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: () => toast.error("Failed to delete project"),
  });

  const filtered = (projects || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your connected codebases, run agent tasks, and explore files.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gradient-primary text-white border-0 shadow-md">
            <Plus className="w-4 h-4 mr-1" /> New Project
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl bg-card/50">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-1">
            {search ? "No matching projects" : "No projects yet"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-4">
            {search ? "Try a different search term or clear the filter." : "Create your first project or upload a codebase to let CodeLite AI automate development."}
          </p>
          {!search && (
            <Link href="/projects/new">
              <Button size="sm" className="gradient-primary text-white border-0">
                <Plus className="w-4 h-4 mr-1" /> Create Project
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Card key={project.id} className="border-border/50 hover:border-primary/40 hover:shadow-lg transition-all group">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}/agent`}>
                            <Bot className="w-4 h-4 mr-2 text-primary" /> Run AI Agent
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}/files`}>
                            <Code2 className="w-4 h-4 mr-2" /> Browse Files
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => {
                            if (confirm(`Delete project "${project.name}"? This action cannot be undone.`)) {
                              deleteMutation.mutate(project.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Link href={`/projects/${project.id}/agent`} className="block group-hover:text-primary transition-colors">
                    <h3 className="font-semibold text-base mb-1 truncate">{project.name}</h3>
                  </Link>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
                    {project.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.framework && (
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${frameworkColors[project.framework] || "text-muted-foreground bg-muted border-border"}`}>
                        {project.framework}
                      </span>
                    )}
                    {project.language && (
                      <span className="text-xs px-2 py-0.5 rounded-md border border-border bg-muted/60 text-muted-foreground flex items-center gap-1">
                        <Code2 className="w-3 h-3" /> {project.language}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.updated_at)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link href={`/projects/${project.id}/files`}>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                        Files
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.id}/agent`}>
                      <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs text-primary font-medium">
                        <Bot className="w-3.5 h-3.5 mr-1" /> Agent
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

