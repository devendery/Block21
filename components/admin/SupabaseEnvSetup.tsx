"use client";

import { useEffect, useState } from "react";

export default function SupabaseEnvSetup() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/admin/env", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as any;
        if (data?.urlPreview) setPreview(data.urlPreview);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseUrl, serviceRoleKey }),
      });
      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setError(data?.error || "Failed to save");
        return;
      }
      setSaved(true);
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="text-white font-bold mb-2">Connect Supabase</div>
      <div className="text-sm text-gray-400 mb-4">
        Enter your Supabase project URL + service role key. They will be saved into <span className="font-mono">.env.local</span>{" "}
        for local development only.
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : preview ? (
        <div className="text-xs text-gray-500 mb-4">Current SUPABASE_URL: {preview}</div>
      ) : null}

      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">SUPABASE_URL</div>
          <input
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://xxxx.supabase.co"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
          />
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">SUPABASE_SERVICE_ROLE_KEY</div>
          <input
            type="password"
            value={serviceRoleKey}
            onChange={(e) => setServiceRoleKey(e.target.value)}
            placeholder="service_role key"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
          />
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}
        {saved ? <div className="text-sm text-green-300">Saved. Reloading…</div> : null}

        <button
          onClick={save}
          disabled={saving || !supabaseUrl.trim() || !serviceRoleKey.trim()}
          className="bg-primary disabled:opacity-50 text-black font-bold py-2 px-4 rounded-lg transition-colors hover:bg-primary/90"
        >
          {saving ? "Saving..." : "Save to .env.local"}
        </button>
      </div>
    </div>
  );
}
