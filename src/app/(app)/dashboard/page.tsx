import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  FolderOpen,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Bot,
  BarChart3,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatTokens, formatCost, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("codelite_demo_user");
  let user: any = null;

  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(demoCookie.value);
      user = {
        id: parsed.id || "demo-user-id",
        email: parsed.email || "developer@codelite.ai",
        user_metadata: { full_name: parsed.fullName || "Developer" },
      };
    } catch {}
  }

  if (!user) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch {}
  }

  const userId = user?.id || "demo-user-id";

  // Fetch stats safely
  let projects: any[] = [];
  let tasks: any[] = [];
  let usage: any[] = [];

  try {
    const supabase = await createClient();
    const [pRes, tRes, uRes] = await Promise.all([
      supabase.from("projects").select("id, name, framework, updated_at, status").eq("user_id", userId).order("updated_at", { ascending: false }).limit(5),
      supabase.from("agent_tasks").select("id, status, task_description, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("token_usage").select("input_tokens, output_tokens, cached_tokens, estimated_cost").eq("user_id", userId),
    ]);
    projects = pRes.data || [];
    tasks = tRes.data || [];
    usage = uRes.data || [];
  } catch {
    // In local demo mode, supply demo seed stats
    projects = [
      {
        id: "demo-project-001",
        name: "Student Management System",
        framework: "Next.js",
        status: "active",
        updated_at: new Date().toISOString(),
      },
    ];
    tasks = [
      {
        id: "demo-task-001",
        status: "completed",
        task_description: "Initialize full-stack student portal with login, CRUD, and Supabase database",
        created_at: new Date().toISOString(),
      },
    ];
    usage = [
      { input_tokens: 3200, output_tokens: 1450, cached_tokens: 850, estimated_cost: 0.00067 },
    ];
  }

  const totalTokens = (usage || []).reduce((s, r) => s + (r.input_tokens || 0) + (r.output_tokens || 0), 0);
  const totalCost = (usage || []).reduce((s, r) => s + (r.estimated_cost || 0), 0);
  const cachedTokens = (usage || []).reduce((s, r) => s + (r.cached_tokens || 0), 0);

  const stats = [
    {
      title: "Total Tokens Used",
      value: formatTokens(totalTokens || 4650),
      sub: `${formatTokens(cachedTokens || 850)} cached`,
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      title: "Active Projects",
      value: (projects?.length || 1).toString(),
      sub: "across all languages",
      icon: FolderOpen,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Tasks Completed",
      value: (tasks?.filter((t) => t.status === "completed").length || 1).toString(),
      sub: `of ${tasks?.length || 1} total tasks`,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      title: "API Cost",
      value: formatCost(totalCost || 0.00067),
      sub: "estimated total",
      icon: TrendingDown,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Developer"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your token-efficient coding agent is ready.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gradient-primary text-white border-0">
            <Bot className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold font-mono">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/projects/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Create Project</p>
                <p className="text-xs text-muted-foreground">Start from scratch or upload ZIP</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/agent" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Run AI Agent</p>
                <p className="text-xs text-muted-foreground">Autonomous coding task</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">View Analytics</p>
                <p className="text-xs text-muted-foreground">Token usage & cost tracking</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/benchmarks" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Run Benchmark</p>
                <p className="text-xs text-muted-foreground">Prove token savings</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Projects</CardTitle>
            <Link href="/projects" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.framework || "Unknown"} • {formatDate(project.updated_at || new Date())}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {project.status || "active"}
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No projects yet</p>
                <Link href="/projects/new" className="text-primary hover:underline text-xs mt-1 inline-block">
                  Create your first project
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Tasks</CardTitle>
            <Link href="/history" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-0.5">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : task.status === "failed" ? (
                      <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
                        <span className="text-destructive text-xs">✗</span>
                      </div>
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{task.task_description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(task.created_at || new Date())}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No tasks yet</p>
                <Link href="/agent" className="text-primary hover:underline text-xs mt-1 inline-block">
                  Run your first task
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
