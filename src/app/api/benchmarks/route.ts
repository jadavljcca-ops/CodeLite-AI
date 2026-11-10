import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContent, estimateCost } from "@/lib/gemini/client";
import { TokenOptimizer } from "@/lib/agent/token-optimizer";
import { z } from "zod";

const BENCHMARK_TASKS = [
  { name: "Create React Component", description: "Create a reusable React button component with variants" },
  { name: "Fix Login Bug", description: "Fix validation bug in login form — email field not properly validated" },
  { name: "Add Dark Mode", description: "Add dark mode toggle to existing Next.js project using next-themes" },
  { name: "CRUD Operations", description: "Create full CRUD API endpoints for a users resource" },
  { name: "Database Integration", description: "Add Supabase database connection and queries" },
  { name: "Fix TypeScript Error", description: "Fix TypeScript type error: Property does not exist on type" },
  { name: "Write Unit Tests", description: "Write Jest unit tests for utility functions" },
  { name: "Refactor Duplicate Code", description: "Refactor repeated API call logic into a custom hook" },
  { name: "Add API Endpoint", description: "Add a new REST API endpoint with authentication middleware" },
  { name: "Debug Failed Build", description: "Debug and fix a failing Next.js build with module not found error" },
];

const RunBenchmarkSchema = z.object({
  taskName: z.string(),
  modelName: z.string().default("gemini-2.0-flash"),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("benchmark_runs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({ benchmarkTasks: BENCHMARK_TASKS, runs: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch benchmarks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = RunBenchmarkSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { taskName, modelName } = validation.data;
    const task = BENCHMARK_TASKS.find((t) => t.name === taskName);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const startTime = Date.now();

    // BASELINE: Naive prompt (all context, no optimization)
    const baselinePrompt = `You are a coding assistant. Complete this task: ${task.description}

Please provide complete implementation with all necessary code, explanations, imports, type definitions, error handling, comments, and documentation. Be thorough and detailed.`;

    const baselineResult = await generateContent(baselinePrompt, "flash");
    const baselineDuration = Date.now() - startTime;

    // OPTIMIZED: Token-efficient prompt
    const optimizedStart = Date.now();
    const keywords = task.description.toLowerCase().split(" ").filter((w) => w.length > 4);
    const optimizedPrompt = `Task: ${task.description}
Output: minimal working code only. No explanations.`;

    const optimizedResult = await generateContent(optimizedPrompt, "flash");
    const optimizedDuration = Date.now() - optimizedStart;

    // Record both runs
    const baselineRun = {
      user_id: user.id,
      task_name: taskName,
      workflow_type: "baseline",
      model_name: modelName,
      input_tokens: baselineResult.usage.inputTokens,
      output_tokens: baselineResult.usage.outputTokens,
      cached_tokens: baselineResult.usage.cachedTokens,
      task_success: baselineResult.text.length > 50,
      test_results: { output_preview: baselineResult.text.slice(0, 200) } as never,
      execution_time: baselineDuration,
    };

    const optimizedRun = {
      user_id: user.id,
      task_name: taskName,
      workflow_type: "optimized",
      model_name: modelName,
      input_tokens: optimizedResult.usage.inputTokens,
      output_tokens: optimizedResult.usage.outputTokens,
      cached_tokens: optimizedResult.usage.cachedTokens,
      task_success: optimizedResult.text.length > 50,
      test_results: { output_preview: optimizedResult.text.slice(0, 200) } as never,
      execution_time: optimizedDuration,
    };

    await supabase.from("benchmark_runs").insert([baselineRun, optimizedRun]);

    const baselineTotal = baselineResult.usage.inputTokens + baselineResult.usage.outputTokens;
    const optimizedTotal = optimizedResult.usage.inputTokens + optimizedResult.usage.outputTokens;
    const savings = baselineTotal > 0 ? Math.round(((baselineTotal - optimizedTotal) / baselineTotal) * 100) : 0;

    return NextResponse.json({
      taskName,
      baseline: { ...baselineRun, totalTokens: baselineTotal, cost: estimateCost(baselineResult.usage, modelName) },
      optimized: { ...optimizedRun, totalTokens: optimizedTotal, cost: estimateCost(optimizedResult.usage, modelName) },
      tokenSavings: savings,
      timeSavings: baselineDuration - optimizedDuration,
    });
  } catch (err) {
    console.error("Benchmark error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Benchmark failed" }, { status: 500 });
  }
}
