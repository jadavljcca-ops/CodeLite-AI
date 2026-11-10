"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, ArrowRight, FileCode2, Plus } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchProjects() {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed");
  const data = await res.json();
  return data.projects || [];
}

export default function FilesSelectPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <FileCode2 className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold">File Explorer</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Select a project workspace to inspect, search, and edit files using Monaco Editor.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <Card className="border-border/50 text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Projects Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                Upload or create a project first to browse its source code.
              </p>
            </div>
            <Link href="/projects/new">
              <Button className="gradient-primary text-white border-0">
                <Plus className="w-4 h-4 mr-1.5" /> Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/projects/${project.id}/files`}>
              <Card className="border-border/50 hover:border-blue-500/40 hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center text-blue-400 transition-colors flex-shrink-0">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm group-hover:text-blue-400 transition-colors truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {project.framework || "Standard project"} • {project.language || "TypeScript"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button size="sm" variant="secondary" className="h-8 text-xs font-medium">
                      <FileCode2 className="w-3.5 h-3.5 mr-1" /> Browse Files
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

