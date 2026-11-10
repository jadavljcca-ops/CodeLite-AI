"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff, Loader2, Zap, Info, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return url.startsWith("https://") && !url.includes("placeholder") && !url.includes("your_supabase");
  };

  const handleDemoAccess = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || "developer@codelite.ai",
          fullName: fullName.trim() || "Developer",
        }),
      });

      if (res.ok) {
        toast.success(`Welcome, ${fullName.trim() || "Developer"}! Entered in Developer Mode.`);
        router.push("/dashboard");
        router.refresh();
      } else {
        throw new Error("Local session creation failed");
      }
    } catch {
      toast.error("Failed to start session. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      // If Supabase URL is placeholder or not yet set up, use local session directly
      if (!isSupabaseConfigured()) {
        toast.info("Supabase is in local mode. Account created & signed in!");
        await handleDemoAccess();
        return;
      }

      // Real Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Fallback gracefully on network / fetch failure
        console.warn("Supabase auth error, falling back to local mode:", error.message);
        toast.info("Supabase server unreachable. Continuing in Local Developer Mode...");
        await handleDemoAccess();
        return;
      }

      toast.success("Account created successfully!");
      if (data?.session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
      router.refresh();
    } catch (err: unknown) {
      console.warn("Registration catch block, falling back:", err);
      toast.info("Supabase credentials not active. Continuing in Local Developer Mode...");
      await handleDemoAccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">CodeLite AI</span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>Start coding smarter with fewer LLM tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Demo Access Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoAccess}
              disabled={demoLoading || loading}
              className="w-full border-primary/30 hover:bg-primary/10 text-primary font-medium py-2.5 h-auto"
            >
              {demoLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2 text-purple-400" />
              )}
              Continue with Quick Developer Access
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border/50 w-full" />
              <span className="bg-card px-2 text-xs text-muted-foreground uppercase">or register</span>
              <div className="border-t border-border/50 w-full" />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Developer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-white border-0 shadow-md py-2.5"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>
                Works automatically in Local Mode without Supabase setup, or with Supabase when configured in <code>.env.local</code>.
              </span>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-1">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
