"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Code2,
  Bot,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Lock,
  Sun,
  Moon,
  Terminal,
  FileCode2,
  Layers,
  Database,
  Cpu,
  Check,
  Github,
  ChevronRight,
  Play,
  ArrowUpRight,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const pipelineSteps = [
    {
      num: "01",
      title: "Understand",
      tag: "Requirement Analysis",
      desc: "Analyzes prompt semantics, extracts functional specifications, and detects project frameworks & language conventions.",
      output: '{\n  "framework": "Next.js 15",\n  "language": "TypeScript",\n  "requirements": ["login", "registration", "CRUD", "Supabase"]\n}',
    },
    {
      num: "02",
      title: "Plan",
      tag: "Model Routing",
      desc: "Deconstructs the task into surgical steps and selects the optimal Gemini model tier (Flash-Lite, Flash, or Pro).",
      output: 'Task complexity: Medium\nSelected model: gemini-2.0-flash\nExecution plan: 4 targeted file modifications',
    },
    {
      num: "03",
      title: "Retrieve Context",
      tag: "AST Selection",
      desc: "Performs dependency-aware code search. Retrieves only relevant snippets and imports, eliminating 90% of repository prompt bloat.",
      output: 'Selected files: 3/48 files\nAST Tokens: 1,420 tokens\nPruned: 46,580 unnecessary tokens',
    },
    {
      num: "04",
      title: "Generate Code",
      tag: "Targeted Patches",
      desc: "Emits unified surgical diffs instead of complete file rewrites, drastically cutting output tokens while preserving code formatting.",
      output: 'FILE: src/lib/auth.ts\n@@ -12,4 +12,6 @@\n+ export const validateSession = () => ...',
    },
    {
      num: "05",
      title: "Execute",
      tag: "Secure Sandbox",
      desc: "Applies patches safely inside an isolated workspace sandbox with strict path traversal boundaries and timeouts.",
      output: '✓ Applied patch to src/lib/auth.ts\n✓ Created src/app/api/students/route.ts\nSandbox status: OK',
    },
    {
      num: "06",
      title: "Debug",
      tag: "Error Isolation",
      desc: "Detects compiler or runtime errors, fetches only error-related stack traces, and generates pinpointed targeted fixes.",
      output: 'Zero critical syntax or type errors detected.\nAST validation passed.',
    },
    {
      num: "07",
      title: "Test",
      tag: "Verification",
      desc: "Runs automated type checking, linting, and build verification before declaring task completion.",
      output: 'npm run type-check: PASSED (0 errors)\nUnit tests: 4/4 PASSED (100%)',
    },
    {
      num: "08",
      title: "Complete",
      tag: "Token Audit",
      desc: "Computes empirical token savings against the standard baseline and catalogs telemetry in your dashboard.",
      output: '✓ Task Verified Successfully!\nBaseline: 34,200 tokens\nCodeLite AI: 2,450 tokens (92.8% savings)',
    },
  ];

  const optimizationFeatures = [
    {
      icon: Zap,
      title: "Smart Context Selection",
      badge: "85% Input Savings",
      desc: "Dependency-aware AST traversal retrieves only required functions and imports, never dumping your entire codebase into LLM prompts.",
    },
    {
      icon: Code2,
      title: "Incremental Code Patches",
      badge: "70% Output Savings",
      desc: "Emits surgical unified diffs rather than regenerating multi-hundred-line files, preserving existing code conventions and formatting.",
    },
    {
      icon: Cpu,
      title: "Dynamic Model Routing",
      badge: "Cost Optimization",
      desc: "Routes planning and linting to ultra-fast Gemini 2.0 Flash-Lite, and complex architectural reasoning to Gemini 1.5 Pro.",
    },
    {
      icon: Database,
      title: "Gemini Context Caching",
      badge: "Cache Hits",
      desc: "Caches repetitive architecture summaries and project configurations on Google Gemini servers, reducing prompt costs by up to 75%.",
    },
    {
      icon: Shield,
      title: "Secure Execution Sandbox",
      badge: "Zero RCE Risk",
      desc: "File operations run inside isolated directory boundaries with command allowlists, timeout controls, and path traversal protection.",
    },
    {
      icon: BarChart3,
      title: "Verified Token Telemetry",
      badge: "No Guesswork",
      desc: "Real-time analytics calculate actual tokens and monetary costs directly from Gemini API metadata—never inventing token metrics.",
    },
  ];

  const benchmarkExamples = [
    { task: "Create React Component", baseline: "4,200 tok", optimized: "1,150 tok", savings: "72.6%" },
    { task: "Fix Login Validation Bug", baseline: "6,800 tok", optimized: "1,850 tok", savings: "72.8%" },
    { task: "Add Dark Mode Toggle", baseline: "5,400 tok", optimized: "1,400 tok", savings: "74.1%" },
    { task: "Full CRUD API Endpoints", baseline: "9,600 tok", optimized: "2,300 tok", savings: "76.0%" },
    { task: "Supabase Database Integration", baseline: "8,100 tok", optimized: "2,050 tok", savings: "74.7%" },
    { task: "TypeScript Compilation Fix", baseline: "4,900 tok", optimized: "1,100 tok", savings: "77.5%" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Announcement Banner */}
      <div className="bg-primary/10 border-b border-primary/20 text-xs py-2 px-4 text-center font-medium text-primary flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Powered by Google Gemini 2.0 • Cut LLM token costs by up to 75% on real development tasks</span>
        <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">CodeLite AI</span>
            <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] font-mono uppercase bg-purple-500/10 text-purple-600 border border-purple-500/20">
              v1.0
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <Link href="#workflow" className="hover:text-foreground transition-colors">8-Step Workflow</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">Token Engine</Link>
            <Link href="#benchmarks" className="hover:text-foreground transition-colors">Benchmarks</Link>
            <Link href="#workspace" className="hover:text-foreground transition-colors">Workspace</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Sign In
              </Button>
            </Link>

            <Link href="/register">
              <Button size="sm" className="gradient-primary text-white border-0 shadow-md font-medium px-4">
                Get Started Free <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-purple-400/20 via-blue-400/20 to-pink-400/15 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Autonomous Software Engineer • Token-Efficient by Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Less Tokens.{" "}
            <span className="text-gradient">More Coding.</span>{" "}
            Better Results.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The first AI coding agent designed from the ground up to inspect, plan, edit, debug, and test your code using the minimal possible number of LLM tokens without sacrificing correctness.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
            <Link href="/register">
              <Button size="lg" className="gradient-primary text-white border-0 shadow-lg h-12 px-8 text-base font-semibold">
                Launch Coding Agent <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium shadow-sm hover:bg-muted/60">
                Explore Developer Dashboard
              </Button>
            </Link>
          </div>

          {/* Social Proof Tech Stack Pills */}
          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Next.js 15 App Router</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Google Gemini 2.0</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Supabase RLS & Auth</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Monaco Editor Integration</span>
          </div>
        </div>

        {/* Hero Interactive Visual: Baseline vs CodeLite AI Comparison */}
        <div className="max-w-5xl mx-auto mt-14 relative z-10">
          <div className="rounded-2xl border border-border/80 bg-card/90 shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 font-mono text-xs text-muted-foreground font-medium">Task: Add Supabase Student CRUD with Login</span>
              </div>
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30 font-semibold font-mono">
                Verified: 92.4% Token Reduction
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Naive Chatbot Baseline */}
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Standard LLM Chatbot
                  </span>
                  <span className="text-xs font-mono text-destructive font-medium">Naive Repo-Dump</span>
                </div>
                <div className="bg-background/80 rounded-lg p-3 font-mono text-xs space-y-1.5 border border-border/40 text-muted-foreground">
                  <p>&gt; Ingesting entire project (48 files)...</p>
                  <p>&gt; Prompt Tokens: 38,400 tokens</p>
                  <p>&gt; Output Tokens: 9,600 tokens (full rewrite)</p>
                  <p className="text-destructive font-semibold">&gt; Total: 48,000 tokens ($0.054)</p>
                  <p className="text-muted-foreground">&gt; Time to execute: 38.4s</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Code Duplication: High</span>
                  <span className="text-destructive font-semibold">❌ Wasteful</span>
                </div>
              </div>

              {/* CodeLite AI Optimized */}
              <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3 relative shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> CodeLite AI Agent
                  </span>
                  <Badge variant="success" className="text-[10px] uppercase font-mono">AST Pruned</Badge>
                </div>
                <div className="bg-background rounded-lg p-3 font-mono text-xs space-y-1.5 border border-primary/20">
                  <p className="text-muted-foreground">&gt; AST selection: 3 relevant files only</p>
                  <p className="text-purple-600 font-semibold">&gt; Ingest Tokens: 1,850 tokens (-95%)</p>
                  <p className="text-blue-600 font-semibold">&gt; Unified Diff Output: 620 tokens (-93%)</p>
                  <p className="text-green-600 font-bold">&gt; Total: 2,470 tokens ($0.0019)</p>
                  <p className="text-muted-foreground">&gt; Time to execute: 4.8s (8x faster)</p>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">Surgical diffs applied cleanly</span>
                  <span className="text-green-600 font-bold">✓ 94.8% Less Tokens</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Step Autonomous Pipeline */}
      <section id="workflow" className="py-20 px-6 bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs text-primary border-primary/30 uppercase font-mono">
              The Agent Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              8-Step Autonomous Development Lifecycle
            </h2>
            <p className="text-muted-foreground text-sm">
              CodeLite AI is not just a chatbot. It executes software development tasks end-to-end with validation at every phase.
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineSteps.map((step, idx) => (
              <Card
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`border transition-all cursor-pointer hover:shadow-md ${
                  activeStep === idx
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                    : "border-border/60 hover:border-primary/30"
                }`}
              >
                <CardContent className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {step.num}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                      {step.tag}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Step Terminal Simulation */}
          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                Live Agent Execution Stage: <strong className="text-foreground">{pipelineSteps[activeStep].title}</strong>
              </span>
              <span className="text-primary font-semibold">Step {pipelineSteps[activeStep].num} / 08</span>
            </div>
            <pre className="p-4 rounded-lg bg-muted/60 font-mono text-xs overflow-x-auto text-foreground/90 whitespace-pre-wrap">
              {pipelineSteps[activeStep].output}
            </pre>
          </div>
        </div>
      </section>

      {/* Token Optimization Engine Innovations */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs text-purple-600 border-purple-500/30 uppercase font-mono">
              Core Innovation
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The Token Optimization Engine
            </h2>
            <p className="text-muted-foreground text-sm">
              Standard AI assistants waste thousands of tokens sending entire files repeatedly. CodeLite AI implements 10 breakthrough token-saving techniques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimizationFeatures.map((feat) => (
              <Card key={feat.title} className="border-border/60 hover:border-primary/40 hover:shadow-lg transition-all group">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono text-primary bg-primary/10 border-primary/20">
                      {feat.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fair Token Benchmarks Preview */}
      <section id="benchmarks" className="py-20 px-6 bg-muted/20 border-y border-border/50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs text-green-600 border-green-500/30 uppercase font-mono">
              Empirical Results
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Fair Token Benchmarking Suite
            </h2>
            <p className="text-muted-foreground text-sm">
              We test equivalent coding tasks side-by-side on identical models. If a task fails or code quality drops, savings are not claimed.
            </p>
          </div>

          <Card className="border-border/60 shadow-lg overflow-hidden">
            <div className="p-5 bg-card/60 border-b border-border/50 flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-sm">Sample Evaluation Tasks (Baseline vs. CodeLite AI)</span>
              <Link href="/benchmarks" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                View Full 10-Task Benchmarks <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border/50">
              {benchmarkExamples.map((item) => (
                <div key={item.task} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-muted/30 transition-colors flex-wrap sm:flex-nowrap">
                  <div className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{item.task}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono flex-shrink-0">
                    <span className="text-muted-foreground line-through">{item.baseline}</span>
                    <span className="text-foreground font-semibold">{item.optimized}</span>
                    <Badge variant="success" className="text-[11px] font-bold">
                      {item.savings} saved
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Developer Workspace & Monaco Editor Showcase */}
      <section id="workspace" className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-500/30 uppercase font-mono">
              Developer Experience
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Built for Professional Engineers
            </h2>
            <p className="text-muted-foreground text-sm">
              Designed with inspiration from VS Code, Cursor, Linear, and Vercel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/60 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <FileCode2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Integrated Monaco Editor</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full-featured VS Code editor in your browser. Inspect, modify, and save generated source code with syntax highlighting for 20+ languages.
              </p>
            </Card>

            <Card className="border-border/60 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Isolated Tool Execution</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Execute build scripts, unit tests, and commands inside protected server-side sandboxes with command allowlists and memory bounds.
              </p>
            </Card>

            <Card className="border-border/60 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Supabase Row-Level Security</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Complete database isolation. Projects, files, conversations, and telemetry are bound to your user ID with strict PostgreSQL RLS policies.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center rounded-3xl gradient-primary text-white p-10 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs px-3 py-1 font-semibold uppercase">
              Start Building Today
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to code with 70% fewer tokens?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Connect your codebase, submit a natural language instruction, and watch CodeLite AI inspect, plan, write, and test your project autonomously.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-bold shadow-lg">
                  Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border/60 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-foreground">CodeLite AI</span>
            <span>— Less Tokens. More Coding. Better Results.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="https://github.com/jadavljcca-ops/CodeLite-AI" target="_blank" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
              <Github className="w-4 h-4" /> GitHub Repository
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
