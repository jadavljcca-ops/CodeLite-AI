import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAgentTask, type AgentTask, type AgentStepResult } from "@/lib/agent/executor";
import { estimateCost } from "@/lib/gemini/client";
import { z } from "zod";

const RunAgentSchema = z.object({
  projectId: z.string().uuid(),
  taskDescription: z.string().min(10).max(2000),
  conversationId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = RunAgentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.issues }, { status: 400 });
    }

    const { projectId, taskDescription, conversationId } = validation.data;

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Load project files
    const { data: projectFiles } = await supabase
      .from("project_files")
      .select("file_path, content, file_size")
      .eq("project_id", projectId)
      .order("file_path");

    const files = (projectFiles || []).map((f) => ({
      path: f.file_path,
      content: f.content || "",
      size: f.file_size || 0,
    }));

    // Create task record
    const { data: taskRecord } = await supabase
      .from("agent_tasks")
      .insert({
        project_id: projectId,
        conversation_id: conversationId,
        task_description: taskDescription,
        status: "running",
      })
      .select()
      .single();

    const agentTask: AgentTask = {
      id: taskRecord?.id || crypto.randomUUID(),
      projectId,
      taskDescription,
      files,
      framework: project.framework || "unknown",
      language: project.language || "typescript",
      maxRetries: 3,
    };

    // Stream response using SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = async (data: object) => {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    // Run agent asynchronously
    (async () => {
      try {
        const result = await runAgentTask(agentTask, async (step: AgentStepResult) => {
          await sendEvent({ type: "step", step });
        });

        // Save results to database
        if (taskRecord) {
          await supabase.from("agent_tasks").update({
            status: result.success ? "completed" : "failed",
            result: result as never,
            completed_at: new Date().toISOString(),
          }).eq("id", taskRecord.id);

          // Record token usage
          await supabase.from("token_usage").insert({
            user_id: user.id,
            project_id: projectId,
            task_id: taskRecord.id,
            model_name: "gemini-2.0-flash",
            input_tokens: result.totalTokenUsage.inputTokens,
            output_tokens: result.totalTokenUsage.outputTokens,
            cached_tokens: result.totalTokenUsage.cachedTokens,
            estimated_cost: result.totalCost,
          });
        }

        await sendEvent({ type: "complete", result });
      } catch (err) {
        await sendEvent({ type: "error", error: err instanceof Error ? err.message : "Unknown error" });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("Agent run error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
