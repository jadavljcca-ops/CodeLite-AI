"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, Key, Bot, Zap, Save, Info, ShieldCheck, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

interface AgentSettings {
  defaultModel: string;
  maxRetries: number;
  contextSizeLimit: number;
  enableCaching: boolean;
  enableSmartRouting: boolean;
  tokenBudgetPerTask: number;
}

const DEFAULT_SETTINGS: AgentSettings = {
  defaultModel: "gemini-2.0-flash",
  maxRetries: 3,
  contextSizeLimit: 8000,
  enableCaching: true,
  enableSmartRouting: true,
  tokenBudgetPerTask: 50000,
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("codelite_agent_settings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem("codelite_agent_settings", JSON.stringify(settings));
      await new Promise((r) => setTimeout(r, 250));
      toast.success("Preferences updated successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl space-y-6 animate-fade-in mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white">
            <Settings className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold">Settings & Agent Configuration</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Fine-tune model routing, token budgets, context limits, and security controls.
        </p>
      </div>

      {/* Security & API Key Notice */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" /> Gemini API & Secret Management
          </CardTitle>
          <CardDescription>
            CodeLite AI enforces strict server-side environment variable security. API keys are never stored in browser memory or database rows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Secure Configuration Architecture</p>
              <p className="text-muted-foreground">
                Set <code>GEMINI_API_KEY</code> and Supabase credentials in your server's <code>.env.local</code> file or Vercel Environment Variables. All tool invocations run exclusively inside server routes with allowlisted safety checks.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Active Server Gemini Provider</Label>
            <div className="flex items-center gap-3">
              <Input value="Server Environment (GEMINI_API_KEY)" disabled className="font-mono text-xs bg-muted/50" />
              <Badge variant="success" className="text-xs h-7 px-3 flex-shrink-0">
                Active Provider
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Model & Execution Preferences */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" /> Model Routing & Execution Parameters
          </CardTitle>
          <CardDescription>
            Control how the agent plans and selects models to optimize LLM tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs">Primary Default Model</Label>
            <Select
              value={settings.defaultModel}
              onValueChange={(v) => setSettings((s) => ({ ...s, defaultModel: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash">gemini-2.0-flash (Recommended — Fast & Ultra-Efficient)</SelectItem>
                <SelectItem value="gemini-2.0-flash-lite">gemini-2.0-flash-lite (Lightweight / Low Cost)</SelectItem>
                <SelectItem value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning / Deep Context)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Token Budget Per Task</Label>
              <Select
                value={settings.tokenBudgetPerTask.toString()}
                onValueChange={(v) => setSettings((s) => ({ ...s, tokenBudgetPerTask: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25000">25,000 Tokens (Strict Budget)</SelectItem>
                  <SelectItem value="50000">50,000 Tokens (Standard Task)</SelectItem>
                  <SelectItem value="100000">100,000 Tokens (Full-Stack Feature)</SelectItem>
                  <SelectItem value="250000">250,000 Tokens (Complex Refactor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Max Autonomous Retries (Debugging)</Label>
              <Select
                value={settings.maxRetries.toString()}
                onValueChange={(v) => setSettings((s) => ({ ...s, maxRetries: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Attempt (No Retries)</SelectItem>
                  <SelectItem value="3">3 Attempts (Recommended)</SelectItem>
                  <SelectItem value="5">5 Attempts (Complex Tasks)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer text-sm">Dynamic Model Routing</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically switch to lighter models (flash-lite) for planning/validation and capable models for deep logic.
                </p>
              </div>
              <Switch
                checked={settings.enableSmartRouting}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, enableSmartRouting: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer text-sm">Gemini Context Caching</Label>
                <p className="text-xs text-muted-foreground">
                  Leverage cached prompt prefixes for repeated architecture context to slash token charges.
                </p>
              </div>
              <Switch
                checked={settings.enableCaching}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, enableCaching: v }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Preference */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="w-4 h-4 text-orange-400" /> Interface Theme
          </CardTitle>
          <CardDescription>Toggle between premium dark developer theme and light theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="gap-1.5"
            >
              <Sun className="w-4 h-4 text-amber-500" /> Light Mode (Default)
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="gap-1.5"
            >
              <Moon className="w-4 h-4" /> Dark Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="gradient-primary text-white border-0 shadow-md px-6"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving Changes..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}

