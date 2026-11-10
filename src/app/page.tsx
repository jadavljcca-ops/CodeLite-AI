"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Token-Efficient by Design",
    desc: "Smart context selection, incremental patches, and intelligent caching cut token usage by up to 70%.",
  },
  {
    icon: Bot,
    title: "Truly Autonomous Agent",
    desc: "8-step workflow: Understand → Plan → Retrieve → Generate → Execute → Debug → Test → Complete.",
  },
  {
    icon: Shield,
    title: "Secure Execution Sandbox",
    desc: "Isolated code execution with allowlists, timeouts, and resource limits. Your server stays safe.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Token Analytics",
    desc: "Track input, output, and cached tokens with live charts, cost estimates, and savings metrics.",
  },
  {
    icon: Code2,
    title: "Full-Stack Code Generation",
    desc: "Creates, edits, debugs, and tests real code across any framework — not just boilerplate.",
  },
  {
    icon: TrendingDown,
    title: "Benchmarked Savings",
    desc: "Side-by-side baseline vs optimised comparisons with downloadable reports.",
  },
];

const stats = [
  { label: "Avg Token Reduction", value: "~65%", sub: "vs baseline" },
  { label: "Agent Steps", value: "8", sub: "fully autonomous" },
  { label: "Optimization Techniques", value: "10+", sub: "built-in" },
  { label: "Powered by", value: "Gemini", sub: "Google AI" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">CodeLite AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link href="#benchmarks" className="hover:text-foreground transition-colors">Benchmarks</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gradient-primary text-white border-0">
                Get Started <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 text-purple-400 border-purple-400/30 bg-purple-400/10">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by Google Gemini
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Less Tokens.{" "}
            <span className="text-gradient">More Coding.</span>{" "}
            Better Results.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            CodeLite AI is a token-efficient autonomous coding agent that completes real software
            development tasks — with measurably fewer LLM tokens and no sacrifices on quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gradient-primary text-white border-0 h-12 px-8">
                Start Building Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold text-gradient mb-1">{s.value}</div>
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for real development tasks
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Not another chatbot. A complete autonomous agent that inspects, plans, edits, executes, and tests your code.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-card/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">8-Step Autonomous Workflow</h2>
            <p className="text-muted-foreground">The agent runs end-to-end — you just describe the task.</p>
          </div>
          <div className="space-y-4">
            {[
              { n: "01", t: "Understand", d: "Extracts requirements, identifies framework and language." },
              { n: "02", t: "Plan", d: "Breaks the task into steps. Selects the right model." },
              { n: "03", t: "Retrieve Context", d: "Smart search — only relevant files, not the whole repo." },
              { n: "04", t: "Generate Code", d: "Targeted patches. Preserves your coding style." },
              { n: "05", t: "Execute", d: "Applies changes. Runs installs and scripts safely." },
              { n: "06", t: "Debug", d: "Detects errors, retrieves context, generates precise fixes." },
              { n: "07", t: "Test", d: "Runs unit tests, build checks, linting." },
              { n: "08", t: "Complete", d: "Verifies task satisfaction. Reports token savings." },
            ].map((step) => (
              <div key={step.n} className="flex gap-4 p-4 rounded-lg border border-border/50 bg-card">
                <div className="text-2xl font-bold text-primary/40 font-mono w-10 flex-shrink-0">{step.n}</div>
                <div>
                  <div className="font-semibold mb-0.5">{step.t}</div>
                  <div className="text-sm text-muted-foreground">{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-2xl gradient-primary text-white">
            <Lock className="w-10 h-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-3">Ready to code smarter?</h2>
            <p className="mb-6 opacity-90">
              Start with your existing project or create a new one. No credit card required.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="h-12 px-8">
                Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded gradient-primary flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-foreground">CodeLite AI</span>
        </div>
        <p>Token-Efficient Autonomous Coding Agent • Built with Next.js + Gemini + Supabase</p>
      </footer>
    </div>
  );
}

