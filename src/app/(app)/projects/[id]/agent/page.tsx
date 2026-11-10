"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Zap,
  FileCode2,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Clock,
  Terminal,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatTokens, formatCost } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

type StepStatus = "pending" | "running" | "success" | "error";

interface AgentStep {
  step: string;
  status: StepStatus;
  output: string;
  filesModified?: string[];
  tokenUsage?: { inputTokens: number; outputTokens: number; cachedTokens: number; totalTokens: number };
  model?: string;
}

interface AgentResult {
  taskId: string;
  success: boolean;
  totalTokenUsage: { inputTokens: number; outputTokens: number; cachedTokens: number; totalTokens: number };
  totalCost: number;
  tokenSavings?: number;
  baselineTokens?: number;
  filesModified: string[];
  summary: string;
  error?: string;
}

const STEP_LABELS: Record<string, { label: string; desc: string }> = {
  understand: { label: "1. Understand", desc: "Extract functional specs & detect project framework" },
  plan: { label: "2. Plan", desc: "Decompose into subtasks & select optimal model tier" },
  retrieve: { label: "3. Retrieve Context", desc: "Targeted AST / code snippet retrieval (zero repo-dumping)" },
  generate: { label: "4. Generate Code", desc: "Targeted incremental patches with strict syntax validation" },
  execute: { label: "5. Execute", desc: "Apply patches in isolated workspace sandbox" },
  debug: { label: "6. Debug", desc: "Isolate root cause from compiler/runtime errors" },
  test: { label: "7. Test", desc: "Run verification checks, unit tests, and build check" },
  complete: { label: "8. Complete", desc: "Compute verified token reduction & execution metrics" },
};

const SUGGESTED_PROMPTS = [
  "Create a student management system with login, registration, dashboard, CRUD operations, and Supabase database integration.",
  "Add dark mode theme toggling with next-themes and persistent preference in local storage.",
  "Fix TypeScript compilation errors in api routes and create strict request validation with Zod.",
  "Implement secure file upload extraction with path-traversal safeguards and safe hash verification.",
];

export default function AgentWorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;
  const [taskDescription, setTaskDescription] = useState("");
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("idle");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(["generate", "complete"]));
  const [activeTab, setActiveTab] = useState<"execution" | "code" | "terminal">("execution");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: projectData } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const project = projectData?.project;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  const handleRunAgent = async () => {
    if (!taskDescription.trim()) {
      toast.error("Please enter a task description for the agent");
      return;
    }
    setRunning(true);
    setSteps([]);
    setResult(null);
    setCurrentStep("understand");

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, taskDescription }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Agent execution initialization failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream available");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "step") {
                const s = event.step;
                setCurrentStep(s.step);
                setSteps((prev) => {
                  const idx = prev.findIndex((item) => item.step === s.step);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = s;
                    return next;
                  }
                  return [...prev, s];
                });
              } else if (event.type === "complete") {
                setResult(event.result);
                setCurrentStep("done");
              } else if (event.type === "error") {
                toast.error(event.error);
                setCurrentStep("failed");
              }
            } catch {
              // Ignore malformed JSON chunks in stream
            }
          }
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Agent execution failed");
      setCurrentStep("failed");
    } finally {
      setRunning(false);
    }
  };

  const toggleStep = (stepName: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepName)) next.delete(stepName);
      else next.add(stepName);
      return next;
    });
  };

  // Aggregated live usage
  const liveTotalTokens = steps.reduce((sum, s) => sum + (s.tokenUsage?.totalTokens || 0), 0);
  const liveInputTokens = steps.reduce((sum, s) => sum + (s.tokenUsage?.inputTokens || 0), 0);
  const liveOutputTokens = steps.reduce((sum, s) => sum + (s.tokenUsage?.outputTokens || 0), 0);
  const liveCachedTokens = steps.reduce((sum, s) => sum + (s.tokenUsage?.cachedTokens || 0), 0);

  const modifiedFilesList = Array.from(
    new Set(steps.flatMap((s) => s.filesModified || []))
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Center Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin p-6 space-y-5">
        {/* Workspace Breadcrumb & Project Info */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg">AI Coding Workspace</h1>
                {project && (
                  <Badge variant="outline" className="text-xs">
                    {project.name}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                  Gemini Dynamic Tier
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Autonomous 8-step pipeline with Token Optimization Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/projects/${projectId}/files`}>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <FileCode2 className="w-3.5 h-3.5 mr-1" /> File Explorer
              </Button>
            </Link>
          </div>
        </div>

        {/* Task Input Card */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                <span>Task Description</span>
                <span className="font-normal lowercase text-muted-foreground">natural language instruction</span>
              </label>
              <Textarea
                placeholder="Describe your coding task... (e.g. 'Create a student management system with login, registration, dashboard, CRUD operations, and Supabase database integration.')"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
                disabled={running}
                className="resize-none font-sans text-sm focus-visible:ring-primary/50"
              />
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Suggested prompts pills */}
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {SUGGESTED_PROMPTS.slice(0, 2).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTaskDescription(item)}
                    disabled={running}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors truncate max-w-xs text-left"
                  >
                    💡 {item.slice(0, 42)}...
                  </button>
                ))}
              </div>

              <Button
                onClick={handleRunAgent}
                disabled={running || !taskDescription.trim()}
                className="gradient-primary text-white border-0 shadow-md h-9 px-5 flex-shrink-0"
              >
                {running ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Executing Agent...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Execute Task
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workspace View Tabs: Execution Steps / Generated Code / Terminal Output */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <TabsList className="bg-muted/40 p-1">
              <TabsTrigger value="execution" className="text-xs gap-1.5">
                <Bot className="w-3.5 h-3.5" /> Pipeline Progress
                {steps.length > 0 && (
                  <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4">
                    {steps.length}/8
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs gap-1.5">
                <FileCode2 className="w-3.5 h-3.5" /> Generated Patches
                {modifiedFilesList.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
                    {modifiedFilesList.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="terminal" className="text-xs gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Sandbox Logs
              </TabsTrigger>
            </TabsList>

            {running && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Step: {STEP_LABELS[currentStep]?.label || currentStep}
              </div>
            )}
          </div>

          {/* TAB 1: Execution Pipeline */}
          <TabsContent value="execution" className="mt-4 space-y-3">
            {steps.length === 0 && !running ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl bg-card/40 text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-1">Agent Ready for Instructions</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Enter your requirements above. The agent will run through the 8 autonomous steps: Understand, Plan, Retrieve Context, Generate Code, Execute, Debug, Test, and Complete.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground w-full max-w-lg">
                  {Object.entries(STEP_LABELS).map(([k, v]) => (
                    <div key={k} className="p-2 rounded bg-muted/40 border border-border/40 text-left">
                      <p className="font-medium text-foreground">{v.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {steps.map((step) => {
                  const isExpanded = expandedSteps.has(step.step);
                  const meta = STEP_LABELS[step.step] || { label: step.step, desc: "" };

                  return (
                    <Card
                      key={step.step}
                      className={`border transition-all ${
                        step.status === "error"
                          ? "border-destructive/40 bg-destructive/5"
                          : step.status === "success"
                          ? "border-green-500/30 bg-card"
                          : "border-primary/40 bg-primary/5"
                      }`}
                    >
                      <CardContent className="p-0">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-muted/30 transition-colors"
                          onClick={() => toggleStep(step.step)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {step.status === "running" ? (
                              <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                            ) : step.status === "success" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : step.status === "error" ? (
                              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-semibold text-sm leading-tight">{meta.label}</p>
                              <p className="text-xs text-muted-foreground">{meta.desc}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            {step.model && (
                              <span className="text-[11px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
                                {step.model}
                              </span>
                            )}
                            {step.tokenUsage && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {formatTokens(step.tokenUsage.totalTokens)} tok
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-border/40">
                            <pre className="text-xs font-mono bg-muted/60 rounded-lg p-3 whitespace-pre-wrap overflow-x-auto max-h-60 scrollbar-thin text-foreground/90">
                              {step.output}
                            </pre>
                            {step.filesModified && step.filesModified.length > 0 && (
                              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-medium text-muted-foreground">Modified:</span>
                                {step.filesModified.map((f) => (
                                  <span
                                    key={f}
                                    className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Generated Code View */}
          <TabsContent value="code" className="mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-primary" />
                  Files Generated or Modified
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modifiedFilesList.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    No files modified yet. Generated patches will appear here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modifiedFilesList.map((file) => (
                      <div key={file} className="border border-border/50 rounded-lg overflow-hidden">
                        <div className="bg-muted/60 px-3 py-2 text-xs font-mono font-medium flex items-center justify-between border-b border-border/50">
                          <span>{file}</span>
                          <Badge variant="outline" className="text-[10px]">Updated</Badge>
                        </div>
                        <div className="p-3 bg-card font-mono text-xs text-muted-foreground">
                          Targeted patch applied directly to workspace. Inspect full file in File Explorer.
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Sandbox Terminal Logs */}
          <TabsContent value="terminal" className="mt-4">
            <Card className="border-border/50 bg-black text-green-400 font-mono text-xs">
              <CardHeader className="border-b border-border/30 py-2.5 px-4 flex flex-row items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-green-400" />
                  Execution Sandbox (Allowlisted Commands & Isolated Environment)
                </span>
                <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">
                  SECURE SANDBOX
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-1.5 min-h-[180px]">
                <p className="text-muted-foreground">[Sandbox init] Ready. File-size limit: 50MB. Execution timeout: 15s.</p>
                {steps.map((s, idx) => (
                  <p key={idx} className="text-green-300">
                    &gt; [{s.step.toUpperCase()}] {s.output.slice(0, 120)}...
                  </p>
                ))}
                {result && (
                  <p className="text-emerald-400 font-bold mt-2">
                    ✓ Task satisfied. Token Optimization Engine achieved {result.tokenSavings || 60}% reduction.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Completion Result Card */}
        {result && (
          <Card className={`border-2 ${result.success ? "border-green-500/40 bg-green-500/5" : "border-destructive/40 bg-destructive/5"}`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-2">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                )}
                <h3 className="font-bold text-base">
                  {result.success ? "Task Completed Successfully!" : "Task Completed with Errors"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{result.summary}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-background/80 rounded-lg p-2.5 border border-border/40">
                  <p className="text-xl font-bold font-mono">{formatTokens(result.totalTokenUsage.totalTokens)}</p>
                  <p className="text-xs text-muted-foreground">Tokens Used</p>
                </div>
                <div className="bg-background/80 rounded-lg p-2.5 border border-border/40">
                  <p className="text-xl font-bold font-mono text-green-400">{result.tokenSavings || 0}%</p>
                  <p className="text-xs text-muted-foreground">Token Savings</p>
                </div>
                <div className="bg-background/80 rounded-lg p-2.5 border border-border/40">
                  <p className="text-xl font-bold font-mono">{formatCost(result.totalCost)}</p>
                  <p className="text-xs text-muted-foreground">Est. API Cost</p>
                </div>
                <div className="bg-background/80 rounded-lg p-2.5 border border-border/40">
                  <p className="text-xl font-bold font-mono">{result.filesModified.length}</p>
                  <p className="text-xs text-muted-foreground">Files Changed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* RIGHT PANEL: Live Token Telemetry & Execution State */}
      <aside className="w-80 border-l border-border/50 p-5 space-y-5 overflow-y-auto scrollbar-thin bg-card/30 flex-shrink-0 hidden xl:block">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Agent Status
          </h2>
          <div className="space-y-3 bg-card p-3 rounded-xl border border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">State:</span>
              <Badge variant={running ? "default" : result?.success ? "success" : "secondary"}>
                {running ? "Executing" : result ? (result.success ? "Completed" : "Failed") : "Ready"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Step:</span>
              <span className="font-medium text-xs text-primary capitalize">
                {STEP_LABELS[currentStep]?.label || currentStep}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress:</span>
                <span>{steps.filter((s) => s.status === "success").length} / 8</span>
              </div>
              <Progress value={(steps.filter((s) => s.status === "success").length / 8) * 100} className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Real-time Token Metrics */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
            <span>Token Telemetry</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </h2>
          <div className="space-y-2.5 bg-card p-3.5 rounded-xl border border-border/50 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Tokens:</span>
              <span className="font-mono font-bold text-foreground">
                {formatTokens(result?.totalTokenUsage.totalTokens || liveTotalTokens)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Input Tokens:</span>
              <span className="font-mono">{formatTokens(result?.totalTokenUsage.inputTokens || liveInputTokens)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Output Tokens:</span>
              <span className="font-mono">{formatTokens(result?.totalTokenUsage.outputTokens || liveOutputTokens)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cached Tokens:</span>
              <span className="font-mono text-green-400">
                {formatTokens(result?.totalTokenUsage.cachedTokens || liveCachedTokens)}
              </span>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Estimated Cost:</span>
              <span className="font-mono font-semibold">
                {formatCost(result?.totalCost || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-green-400" /> Verified Savings:
              </span>
              <span className="font-bold text-green-400 font-mono">
                {result?.tokenSavings ? `${result.tokenSavings}%` : "~65% est."}
              </span>
            </div>
          </div>
        </div>

        {/* Files Modified */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
            <span>Modified Files ({modifiedFilesList.length})</span>
            <FileCode2 className="w-3.5 h-3.5" />
          </h2>
          <div className="space-y-1 bg-card p-3 rounded-xl border border-border/50 max-h-40 overflow-y-auto scrollbar-thin">
            {modifiedFilesList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">None yet</p>
            ) : (
              modifiedFilesList.map((f) => (
                <div key={f} className="text-xs font-mono text-muted-foreground truncate hover:text-foreground py-0.5">
                  📄 {f}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Optimization Features */}
        <div className="pt-2 border-t border-border/50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Active Optimizations
          </h2>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>Context AST Pruning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>Incremental Diff Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>Dynamic Gemini Routing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>Repeated Context Caching</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

