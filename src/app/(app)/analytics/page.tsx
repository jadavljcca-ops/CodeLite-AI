"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatTokens, formatCost } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Zap,
  TrendingDown,
  CheckCircle2,
  Clock,
  DollarSign,
  Database,
  Layers,
  Sparkles,
  BarChart3,
  Bot,
} from "lucide-react";

async function fetchAnalytics() {
  const res = await fetch("/api/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

const COLORS = ["#a855f7", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 text-xs shadow-xl space-y-1">
        <p className="font-semibold">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-mono font-medium">{formatTokens(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    refetchInterval: 20000,
  });

  const summary = data?.summary || {};
  const dailyData = data?.dailyData || [];
  const modelDist = data?.modelDistribution || [];
  const recentTasks = data?.recentTasks || [];

  const stats = [
    {
      label: "Total Tokens Processed",
      value: formatTokens(summary.totalTokens || 0),
      sub: "Input + Output",
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Cached Tokens",
      value: formatTokens(summary.totalCachedTokens || 0),
      sub: "Gemini Cache Hits",
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Total API Cost",
      value: formatCost(summary.totalCost || 0),
      sub: "Verified Pricing",
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Total API Invocations",
      value: (summary.totalRequests || 0).toString(),
      sub: "All Model Requests",
      icon: TrendingDown,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Successful Tasks",
      value: (summary.successfulTasks || 0).toString(),
      sub: `${summary.failedTasks || 0} failed`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Avg Execution Time",
      value: summary.avgCompletionTimeMs ? `${Math.round(summary.avgCompletionTimeMs / 1000)}s` : "—",
      sub: "Per Task Cycle",
      icon: Clock,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-9 w-60" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold">Token Analytics & Cost Telemetry</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Live metrics gathered directly from Gemini API token metadata.
          </p>
        </div>

        <Badge variant="outline" className="text-xs py-1 px-3 border-primary/30 text-primary">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Auto-Refreshing Telemetry
        </Badge>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2.5`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold font-mono">{stat.value}</p>
              <p className="text-xs font-semibold text-foreground/90 mt-0.5 truncate">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Consumption Area Chart */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Daily Token Consumption</CardTitle>
              <CardDescription>Input vs Output Tokens tracked per day</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Input Tokens
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Output Tokens
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dailyData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
              <Zap className="w-8 h-8 opacity-30 mb-2" />
              <p>No token telemetry recorded yet.</p>
              <p className="text-xs text-muted-foreground mt-0.5">Execute your first agent task to populate telemetry.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="inputGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => formatTokens(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="input"
                  name="Input Tokens"
                  stroke="#a855f7"
                  fill="url(#inputGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="output"
                  name="Output Tokens"
                  stroke="#3b82f6"
                  fill="url(#outputGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Model-Wise Distribution & Recent Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Model-Wise Token Distribution</CardTitle>
            <CardDescription>Breakdown by Gemini tier (Flash vs Pro)</CardDescription>
          </CardHeader>
          <CardContent>
            {modelDist.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-xs">
                No model telemetry recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={modelDist}
                    dataKey="tokens"
                    nameKey="model"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {modelDist.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatTokens(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Task Executions</CardTitle>
            <CardDescription>Status and verification logs</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-xs">
                No task history available.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin">
                {recentTasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          t.status === "completed"
                            ? "bg-green-400"
                            : t.status === "failed"
                            ? "bg-destructive"
                            : "bg-yellow-400"
                        }`}
                      />
                      <span className="font-medium truncate">{t.task_description}</span>
                    </div>
                    <Badge
                      variant={
                        t.status === "completed"
                          ? "success"
                          : t.status === "failed"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[10px] capitalize flex-shrink-0"
                    >
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

