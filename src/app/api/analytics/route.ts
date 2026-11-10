import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch token usage for the user
    const { data: usage } = await supabase
      .from("token_usage")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);

    const { data: tasks } = await supabase
      .from("agent_tasks")
      .select("id, status, created_at, completed_at, task_description")
      .in("project_id",
        (await supabase.from("projects").select("id").eq("user_id", user.id)).data?.map((p) => p.id) || []
      )
      .order("created_at", { ascending: false })
      .limit(100);

    const records = usage || [];
    const totalInput = records.reduce((s, r) => s + (r.input_tokens || 0), 0);
    const totalOutput = records.reduce((s, r) => s + (r.output_tokens || 0), 0);
    const totalCached = records.reduce((s, r) => s + (r.cached_tokens || 0), 0);
    const totalCost = records.reduce((s, r) => s + (r.estimated_cost || 0), 0);

    // Group by day
    const byDay: Record<string, { input: number; output: number; cached: number; cost: number }> = {};
    for (const r of records) {
      const day = r.created_at.slice(0, 10);
      if (!byDay[day]) byDay[day] = { input: 0, output: 0, cached: 0, cost: 0 };
      byDay[day].input += r.input_tokens || 0;
      byDay[day].output += r.output_tokens || 0;
      byDay[day].cached += r.cached_tokens || 0;
      byDay[day].cost += r.estimated_cost || 0;
    }

    const dailyData = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, data]) => ({ date, ...data }));

    // Model distribution
    const byModel: Record<string, number> = {};
    for (const r of records) {
      byModel[r.model_name] = (byModel[r.model_name] || 0) + (r.input_tokens + r.output_tokens);
    }

    const taskStats = tasks || [];
    const successfulTasks = taskStats.filter((t) => t.status === "completed").length;
    const failedTasks = taskStats.filter((t) => t.status === "failed").length;
    const avgCompletionTime = taskStats
      .filter((t) => t.completed_at)
      .reduce((sum, t) => {
        const ms = new Date(t.completed_at!).getTime() - new Date(t.created_at).getTime();
        return sum + ms;
      }, 0) / Math.max(1, taskStats.filter((t) => t.completed_at).length);

    return NextResponse.json({
      summary: {
        totalInputTokens: totalInput,
        totalOutputTokens: totalOutput,
        totalCachedTokens: totalCached,
        totalTokens: totalInput + totalOutput,
        totalCost,
        totalRequests: records.length,
        successfulTasks,
        failedTasks,
        avgCompletionTimeMs: Math.round(avgCompletionTime),
      },
      dailyData,
      modelDistribution: Object.entries(byModel).map(([model, tokens]) => ({ model, tokens })),
      recentTasks: taskStats.slice(0, 10),
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
