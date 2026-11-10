import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Bot, FolderOpen, ArrowRight, Zap } from "lucide-react";
import { formatDate, formatTokens, formatCost } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TaskHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user?.id || "");

  const projectIds = (projects || []).map((p: any) => p.id);
  const projectMap = new Map((projects || []).map((p: any) => [p.id, p.name]));

  const { data: tasks } = projectIds.length > 0
    ? await supabase
        .from("agent_tasks")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold">Task History</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Audit log of autonomous agent executions, changes applied, and token consumption.
          </p>
        </div>

        <Badge variant="outline" className="text-xs">
          {tasks?.length || 0} Total Executions
        </Badge>
      </div>

      {!tasks || tasks.length === 0 ? (
        <Card className="border-border/50 text-center py-16">
          <CardContent className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground/40">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Agent Tasks Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                When the autonomous agent completes development tasks, records and token telemetry will be cataloged here.
              </p>
            </div>
            <Link href="/projects">
              <Button className="gradient-primary text-white border-0">
                Go to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task: any) => {
            const projectName = String(projectMap.get(task.project_id) || "Project");
            const durationSec = task.completed_at
              ? Math.max(1, Math.round((new Date(task.completed_at).getTime() - new Date(task.created_at).getTime()) / 1000))
              : null;

            return (
              <Card
                key={task.id}
                className="border-border/50 hover:border-primary/30 transition-all shadow-sm group"
              >
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 flex-shrink-0">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : task.status === "failed" ? (
                        <XCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "success"
                              : task.status === "failed"
                              ? "destructive"
                              : "warning"
                          }
                          className="text-[11px] h-5 capitalize"
                        >
                          {task.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" />
                          <strong>{projectName}</strong>
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-foreground mb-1 line-clamp-2">
                        {task.task_description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Initiated {formatDate(task.created_at)}</span>
                        {durationSec && <span>Duration: {durationSec}s</span>}
                        {task.result?.totalTokenUsage && (
                          <span className="flex items-center gap-1 font-mono text-foreground/80">
                            <Zap className="w-3 h-3 text-purple-400" />
                            {formatTokens(task.result.totalTokenUsage.totalTokens)} tokens
                          </span>
                        )}
                        {task.result?.tokenSavings && (
                          <span className="text-green-400 font-medium">
                            {task.result.tokenSavings}% savings
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link href={`/projects/${task.project_id}/agent`} className="flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Reopen Session
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
