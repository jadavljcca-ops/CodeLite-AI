import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { demoStore } from "@/lib/demo-store";

export async function createClient() {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("codelite_demo_user");

  // If user is in demo mode or Supabase is not yet configured with live credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholder = supabaseUrl.includes("placeholder") || !supabaseUrl.startsWith("https://");

  if (demoCookie?.value || isPlaceholder) {
    let parsed: any = {};
    try {
      parsed = demoCookie?.value ? JSON.parse(demoCookie.value) : {};
    } catch {}

    const demoUser = {
      id: parsed.id || "demo-user-id",
      email: parsed.email || "developer@codelite.ai",
      user_metadata: { full_name: parsed.fullName || "Demo Developer" },
      created_at: new Date().toISOString(),
    };

    return {
      auth: {
        getUser: async () => ({ data: { user: demoUser }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: (table: string) => ({
        select: (cols?: string) => ({
          eq: (col: string, val: any) => ({
            single: async () => {
              if (table === "projects") {
                const p = demoStore.getProject(val);
                return { data: p || null, error: p ? null : { message: "Not found" } };
              }
              return { data: null, error: null };
            },
            order: (orderCol?: string, opts?: any) => Promise.resolve({
              data: table === "projects" ? demoStore.projects :
                    table === "project_files" ? demoStore.getFiles(val) :
                    table === "token_usage" ? demoStore.tokenUsage :
                    table === "agent_tasks" ? demoStore.tasks :
                    table === "benchmark_runs" ? demoStore.benchmarks : [],
              error: null
            }),
            limit: () => Promise.resolve({
              data: table === "projects" ? demoStore.projects :
                    table === "token_usage" ? demoStore.tokenUsage :
                    table === "agent_tasks" ? demoStore.tasks :
                    table === "benchmark_runs" ? demoStore.benchmarks : [],
              error: null
            }),
            data: table === "projects" ? demoStore.projects :
                  table === "project_files" ? demoStore.getFiles(val) : [],
            error: null,
            then: (resolve: any) => resolve({
              data: table === "projects" ? demoStore.projects :
                    table === "project_files" ? demoStore.getFiles(val) : [],
              error: null,
            }),
          }),
          in: (col: string, vals: any[]) => ({
            order: () => ({
              limit: () => Promise.resolve({ data: demoStore.tasks, error: null }),
            }),
          }),
          order: () => ({
            limit: () => Promise.resolve({
              data: table === "projects" ? demoStore.projects :
                    table === "agent_tasks" ? demoStore.tasks :
                    table === "benchmark_runs" ? demoStore.benchmarks : [],
              error: null
            }),
            then: (resolve: any) => resolve({
              data: table === "projects" ? demoStore.projects :
                    table === "agent_tasks" ? demoStore.tasks :
                    table === "benchmark_runs" ? demoStore.benchmarks : [],
              error: null,
            }),
          }),
          limit: () => Promise.resolve({
            data: table === "projects" ? demoStore.projects :
                  table === "agent_tasks" ? demoStore.tasks :
                  table === "benchmark_runs" ? demoStore.benchmarks : [],
            error: null
          }),
          then: (resolve: any) => resolve({
            data: table === "projects" ? demoStore.projects :
                  table === "agent_tasks" ? demoStore.tasks :
                  table === "benchmark_runs" ? demoStore.benchmarks : [],
            error: null,
          }),
        }),
        insert: (data: any) => ({
          select: () => ({
            single: async () => {
              if (table === "projects") {
                const p = demoStore.createProject(data);
                return { data: p, error: null };
              }
              if (table === "agent_tasks") {
                const t = demoStore.addTask({ id: crypto.randomUUID(), ...data, created_at: new Date().toISOString() });
                return { data: t, error: null };
              }
              return { data, error: null };
            }
          }),
          then: (resolve: any) => resolve({ data, error: null }),
        }),
        upsert: (data: any) => ({
          select: () => ({
            single: async () => {
              if (table === "project_files") {
                const f = demoStore.saveFile(data.project_id, data.file_path, data.content);
                return { data: f, error: null };
              }
              return { data, error: null };
            }
          }),
        }),
        delete: () => ({
          eq: (col: string, val: any) => ({
            eq: () => Promise.resolve({ data: null, error: null }),
            then: (resolve: any) => resolve({ data: null, error: null }),
          })
        }),
        update: (data: any) => ({
          eq: (col: string, val: any) => Promise.resolve({ data, error: null }),
        }),
      }),
    } as any;
  }

  return createServerClient<any>(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component context
          }
        },
      },
    }
  );
}
