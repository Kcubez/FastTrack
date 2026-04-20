"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Key, User, Shield, CheckCircle2, Trash2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();

  // API key state
  const [geminiKey, setGeminiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [loadingKey, setLoadingKey] = useState(true);

  // Load current key status
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey ?? false);
        setApiKeyPreview(data.apiKeyPreview ?? null);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoadingKey(false));
  }, []);

  const handleSave = async () => {
    if (!geminiKey.trim()) {
      toast.error("Enter your Gemini API key");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: geminiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      setHasApiKey(data.hasApiKey);
      setApiKeyPreview(data.apiKeyPreview);
      setGeminiKey("");
      setShowKey(false);
      toast.success("API key saved successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove your saved API key? Content generation will use the platform default.")) return;
    setRemoving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: null }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      setHasApiKey(false);
      setApiKeyPreview(null);
      toast.success("API key removed.");
    } catch {
      toast.error("Failed to remove API key");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </span>
          Settings
        </h1>
        <p className="text-slate-400 mt-2">Manage your account and API configuration.</p>
      </div>

      {/* Profile */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-violet-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</label>
              <div className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm">
                {session?.user?.name ?? "—"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
              <div className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm">
                {session?.user?.email ?? "—"}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
            <div className="mt-1.5">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                session?.user?.role === "admin"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {session?.user?.role === "admin" ? "⚡ Administrator" : "✍️ Content Generator"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            Gemini API Key
          </CardTitle>
          <CardDescription className="text-slate-400">
            Your personal key is used for all your content generation. It stays private and is never shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Current key status */}
          {loadingKey ? (
            <div className="h-14 bg-slate-800 rounded-xl animate-pulse" />
          ) : hasApiKey ? (
            <div className="flex items-center justify-between gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-300">API key saved</p>
                  <p className="text-xs text-emerald-400/70 font-mono mt-0.5">{apiKeyPreview}</p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Key className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">No API key saved</p>
                <p className="text-xs text-amber-400/70 mt-0.5">The platform default key will be used for generation.</p>
              </div>
            </div>
          )}

          {/* Input to set / update key */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              {hasApiKey ? "Replace with a new key" : "Enter your Gemini API key"}
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="AIza..."
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !geminiKey.trim()}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Key"}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Get your free key at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
              >
                Google AI Studio
              </a>
              . Your key is stored securely and only used for your requests.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-300 text-sm font-medium">✅ Session active and secure</p>
            <p className="text-emerald-200/70 text-xs mt-1">
              Session expires in 7 days. Powered by Better Auth with secure cookie handling.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
