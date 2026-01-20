"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { MagicCard } from "@/components/ui/magic-card";
import { Meteors } from "@/components/ui/meteors";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

const SKIN_OPTIONS = ["classic", "neon", "magma", "toxic", "void", "scales", "custom"] as const;
const EYES_OPTIONS = ["cat", "round", "angry"] as const;
const MOUTH_OPTIONS = ["tongue", "smile", "fangs"] as const;

type TabKey = "skins" | "customize" | "faces";

const SKIN_PREVIEW: Record<(typeof SKIN_OPTIONS)[number], { primary: string; secondary: string }> = {
  classic: { primary: "#3AFF9E", secondary: "#1B8F32" },
  neon: { primary: "#4FC3F7", secondary: "#2563EB" },
  magma: { primary: "#FFA94D", secondary: "#FFE066" },
  toxic: { primary: "#9C6BFF", secondary: "#C4B5FD" },
  void: { primary: "#0F172A", secondary: "#5EEAD4" },
  scales: { primary: "#5EEAD4", secondary: "#3AFF9E" },
  custom: { primary: "#7c3aed", secondary: "#22c55e" },
};

const SKIN_LABELS: Record<(typeof SKIN_OPTIONS)[number], string> = {
  classic: "Leaf Runner",
  neon: "Sky Glide",
  magma: "Sunvine",
  toxic: "Bloom Serpent",
  void: "Night Root",
  scales: "Garden Scales",
  custom: "Custom",
};

function useGuestIdentity(isConnected: boolean, address?: string) {
  const [guestAddress, setGuestAddress] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) return;
    try {
      const key = "b21_guest_address";
      const existing = window.localStorage.getItem(key);
      if (existing && typeof existing === "string") {
        setGuestAddress(existing);
        return;
      }
      const next = `guest-${crypto.randomUUID()}`;
      window.localStorage.setItem(key, next);
      setGuestAddress(next);
    } catch {
      setGuestAddress("guest");
    }
  }, [address, isConnected]);

  return useMemo(() => {
    if (isConnected && address) return address.toLowerCase();
    if (guestAddress) return guestAddress.toLowerCase();
    return null;
  }, [address, guestAddress, isConnected]);
}

function WormPreview({
  skin,
  eyes,
  mouth,
  primary,
  secondary,
}: {
  skin: (typeof SKIN_OPTIONS)[number];
  eyes: (typeof EYES_OPTIONS)[number];
  mouth: (typeof MOUTH_OPTIONS)[number];
  primary: string;
  secondary: string;
}) {
  const segments = 26;
  const radius = 10;
  const pts = useMemo(() => {
    const out: Array<{ x: number; y: number; r: number }> = [];
    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      const x = 75 + t * 160 + Math.sin(t * Math.PI * 2) * 14;
      const y = 180 - t * 140 + Math.cos(t * Math.PI * 1.5) * 10;
      const r = radius * (0.55 + (1 - t) * 0.55);
      out.push({ x, y, r });
    }
    return out;
  }, []);

  const head = pts[0];
  const neck = pts[1];
  const angle = Math.atan2(head.y - neck.y, head.x - neck.x);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const eyeOff = 6.5;
  const eyeR = 3.6;

  const lx = head.x - cos * 2 - sin * eyeOff;
  const ly = head.y - sin * 2 + cos * eyeOff;
  const rx = head.x - cos * 2 + sin * eyeOff;
  const ry = head.y - sin * 2 - cos * eyeOff;

  return (
    <svg viewBox="0 0 320 260" className="w-full h-full">
      <defs>
        <radialGradient id="bgGlow" cx="55%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="320" height="260" fill="url(#bgGlow)" />

      <g filter="url(#softGlow)">
        {pts
          .slice()
          .reverse()
          .map((p, idx) => {
            const i = pts.length - 1 - idx;
            const fill = i % 2 === 0 ? secondary : primary;
            const opacity = 0.95 - i * 0.01;
            const overlays =
              skin === "scales"
                ? [
                    { ox: -p.r * 0.3, oy: -p.r * 0.2 },
                    { ox: 0, oy: -p.r * 0.45 },
                    { ox: p.r * 0.32, oy: -p.r * 0.18 },
                    { ox: -p.r * 0.05, oy: p.r * 0.25 },
                    { ox: p.r * 0.2, oy: p.r * 0.28 },
                  ]
                : [];
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={p.r} fill={fill} opacity={opacity} />
                {overlays.map((o, j) => {
                  const cx = p.x + o.ox;
                  const cy = p.y + o.oy;
                  const s = Math.max(2.5, p.r * 0.23);
                  return (
                    <path
                      key={j}
                      d={`M ${cx} ${cy - s} L ${cx + s} ${cy} L ${cx} ${cy + s} L ${cx - s} ${cy} Z`}
                      fill="#0b1020"
                      opacity={0.16}
                    />
                  );
                })}
              </g>
            );
          })}
      </g>

      <g>
        {eyes === "cat" ? (
          <>
            <ellipse cx={lx} cy={ly} rx={eyeR * 1.1} ry={eyeR * 0.9} fill="#fff" />
            <ellipse cx={rx} cy={ry} rx={eyeR * 1.1} ry={eyeR * 0.9} fill="#fff" />
            <ellipse cx={lx + cos * 1.2} cy={ly + sin * 1.2} rx={eyeR * 0.35} ry={eyeR * 0.6} fill="#0b1020" />
            <ellipse cx={rx + cos * 1.2} cy={ry + sin * 1.2} rx={eyeR * 0.35} ry={eyeR * 0.6} fill="#0b1020" />
          </>
        ) : eyes === "angry" ? (
          <>
            <path
              d={`M ${lx - 5} ${ly - 2} Q ${lx} ${ly - 6} ${lx + 6} ${ly - 3}`}
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${rx - 6} ${ry - 3} Q ${rx} ${ry - 6} ${rx + 5} ${ry - 2}`}
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={lx + cos * 1.4} cy={ly + sin * 1.4} r={eyeR * 0.75} fill="#0b1020" />
            <circle cx={rx + cos * 1.4} cy={ry + sin * 1.4} r={eyeR * 0.75} fill="#0b1020" />
          </>
        ) : (
          <>
            <circle cx={lx} cy={ly} r={eyeR} fill="#fff" />
            <circle cx={rx} cy={ry} r={eyeR} fill="#fff" />
            <circle cx={lx + cos * 1.4} cy={ly + sin * 1.4} r={eyeR * 0.55} fill="#0b1020" />
            <circle cx={rx + cos * 1.4} cy={ry + sin * 1.4} r={eyeR * 0.55} fill="#0b1020" />
          </>
        )}

        {mouth === "tongue" ? (
          <>
            <ellipse cx={head.x + cos * 9} cy={head.y + sin * 9} rx="9" ry="6.5" fill="#ef4444" />
            <ellipse cx={head.x + cos * 11} cy={head.y + sin * 10} rx="5" ry="3.4" fill="#fb7185" />
          </>
        ) : mouth === "fangs" ? (
          <>
            <path
              d={`M ${head.x + cos * 8} ${head.y + sin * 8} Q ${head.x + cos * 12} ${head.y + sin * 12} ${head.x + cos * 16} ${head.y + sin * 8}`}
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${head.x + cos * 11} ${head.y + sin * 9} l 3 7 l -6 0 z`}
              fill="#ffffff"
              opacity="0.95"
            />
          </>
        ) : (
          <path
            d={`M ${head.x + cos * 8} ${head.y + sin * 8} Q ${head.x + cos * 12} ${head.y + sin * 14} ${head.x + cos * 16} ${head.y + sin * 8}`}
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </g>

      <g opacity="0.5">
        {skin === "void" ? (
          <circle cx="260" cy="55" r="5" fill="#f43f5e" />
        ) : skin === "magma" ? (
          <circle cx="260" cy="55" r="5" fill="#f59e0b" />
        ) : skin === "toxic" ? (
          <circle cx="260" cy="55" r="5" fill="#84cc16" />
        ) : skin === "neon" ? (
          <circle cx="260" cy="55" r="5" fill="#06b6d4" />
        ) : (
          <circle cx="260" cy="55" r="5" fill="#4ade80" />
        )}
      </g>
    </svg>
  );
}

function toHex(v: number) {
  const n = Math.max(0, Math.min(0xffffff, Math.floor(v)));
  return `#${n.toString(16).padStart(6, "0")}`;
}

export default function Wardrobe() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const identityKey = useGuestIdentity(isConnected, address);

  const [tab, setTab] = useState<TabKey>("skins");
  const [skin, setSkin] = useState<(typeof SKIN_OPTIONS)[number]>("classic");
  const [eyes, setEyes] = useState<(typeof EYES_OPTIONS)[number]>("cat");
  const [mouth, setMouth] = useState<(typeof MOUTH_OPTIONS)[number]>("tongue");

  const [customPrimary, setCustomPrimary] = useState("#7c3aed");
  const [customSecondary, setCustomSecondary] = useState("#22c55e");

  const cosmeticKey = identityKey ? `b21_snake_cosmetic:${identityKey}` : null;
  const customKey = identityKey ? `b21_snake_custom_palette:${identityKey}` : null;
  const [loadedFromServer, setLoadedFromServer] = useState(false);

  useEffect(() => {
    if (!cosmeticKey) return;
    try {
      const raw = window.localStorage.getItem(cosmeticKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      if (SKIN_OPTIONS.includes(parsed?.skin)) setSkin(parsed.skin);
      if (EYES_OPTIONS.includes(parsed?.eyes)) setEyes(parsed.eyes);
      if (MOUTH_OPTIONS.includes(parsed?.mouth)) setMouth(parsed.mouth);
    } catch {
    }
  }, [cosmeticKey]);

  useEffect(() => {
    if (!customKey) return;
    try {
      const raw = window.localStorage.getItem(customKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      if (typeof parsed?.primary === "string") setCustomPrimary(parsed.primary);
      if (typeof parsed?.secondary === "string") setCustomSecondary(parsed.secondary);
    } catch {
    }
  }, [customKey]);

  useEffect(() => {
    if (!isConnected || !address) return;
    if (loadedFromServer) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/phase1/cosmetic", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as any;
        const c = data?.cosmetic;
        if (!c) return;
        if (cancelled) return;
        if (SKIN_OPTIONS.includes(c?.skin)) setSkin(c.skin);
        if (EYES_OPTIONS.includes(c?.eyes)) setEyes(c.eyes);
        if (MOUTH_OPTIONS.includes(c?.mouth)) setMouth(c.mouth);
        const cp = c?.customPalette;
        if (cp && typeof cp === "object") {
          if (typeof cp.primary === "number") setCustomPrimary(toHex(cp.primary));
          if (typeof cp.secondary === "number") setCustomSecondary(toHex(cp.secondary));
        }
        try {
          if (cosmeticKey) window.localStorage.setItem(cosmeticKey, JSON.stringify({ skin: c.skin, eyes: c.eyes, mouth: c.mouth }));
          if (customKey && cp && typeof cp.primary === "number" && typeof cp.secondary === "number") {
            window.localStorage.setItem(customKey, JSON.stringify({ primary: toHex(cp.primary), secondary: toHex(cp.secondary) }));
          }
          window.dispatchEvent(new Event("b21_snake_cosmetic_updated"));
        } catch {
        }
      } finally {
        if (!cancelled) setLoadedFromServer(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [address, cosmeticKey, customKey, isConnected, loadedFromServer]);

  const save = async () => {
    if (!cosmeticKey) return;
    try {
      window.localStorage.setItem(cosmeticKey, JSON.stringify({ skin, eyes, mouth }));
      if (customKey) {
        window.localStorage.setItem(customKey, JSON.stringify({ primary: customPrimary, secondary: customSecondary }));
      }
      window.dispatchEvent(new Event("b21_snake_cosmetic_updated"));
    } catch {
    }
    if (isConnected && address) {
      try {
        await fetch("/api/phase1/cosmetic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skin,
            eyes,
            mouth,
            customPalette: { primary: customPrimary, secondary: customSecondary },
          }),
        });
      } catch {
      }
    }
  };

  const useNow = () => {
    void save();
    router.push("/play?screen=battle");
  };

  const close = () => {
    void save();
    router.push("/play");
  };

  const previewPrimary = skin === "custom" ? customPrimary : SKIN_PREVIEW[skin].primary;
  const previewSecondary = skin === "custom" ? customSecondary : SKIN_PREVIEW[skin].secondary;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b1f3a] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_10%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(900px_circle_at_75%_80%,rgba(59,130,246,0.18),transparent_50%)]" />
      <Meteors number={18} className="bg-white/60" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-10">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-black text-white tracking-tight">Wardrobe</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/25 border border-white/10 rounded-xl px-3 py-2 backdrop-blur">
              <div className="size-6 rounded-full bg-yellow-400/80" />
              <div className="text-white font-black tabular-nums">500</div>
              <div className="size-8 rounded-lg bg-white/10 border border-white/10" />
            </div>
            <button
              onClick={close}
              className="rounded-xl bg-black/25 border border-white/10 backdrop-blur px-4 py-2 text-white font-black hover:bg-black/35 transition"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[84px_1fr_360px] gap-5 items-stretch">
          <div className="flex flex-col items-center gap-3">
            {["skins", "customize", "faces", "shop", "video"].map((k, idx) => (
              <button
                key={k}
                onClick={() => {
                  if (k === "skins") setTab("skins");
                  if (k === "customize") setTab("customize");
                  if (k === "faces") setTab("faces");
                }}
                className={cn(
                  "size-[64px] rounded-2xl border backdrop-blur transition",
                  k === tab ? "bg-white/15 border-white/20" : "bg-black/25 border-white/10 hover:bg-black/35"
                )}
                type="button"
                aria-label={k}
              >
                <div className={cn("mx-auto mt-4 size-7 rounded-full", idx % 2 === 0 ? "bg-white/70" : "bg-white/30")} />
              </button>
            ))}
          </div>

          <div className="relative">
            <MagicCard className="h-full rounded-3xl bg-zinc-900/35 border border-white/10 backdrop-blur">
              <BorderBeam size={130} duration={12} delay={0} colorFrom="#3b82f6" colorTo="#7c3aed" />
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-center text-3xl font-black text-yellow-300">Mony</div>
                <div className="mt-2 flex-1 flex items-center justify-center">
                  <div className="w-full max-w-[520px] h-[360px] md:h-[420px]">
                    <WormPreview skin={skin} eyes={eyes} mouth={mouth} primary={previewPrimary} secondary={previewSecondary} />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-4">
                  <button
                    onClick={useNow}
                    disabled={!identityKey}
                    className={cn(
                      "rounded-2xl px-14 py-5 text-3xl font-black text-white bg-gradient-to-b from-lime-300 to-emerald-500 border border-white/20 shadow-[0_20px_60px_rgba(16,185,129,0.35)] transition",
                      identityKey ? "hover:brightness-110" : "opacity-60 cursor-not-allowed"
                    )}
                    type="button"
                  >
                    Use
                  </button>
                  <button
                    onClick={close}
                    className="size-[70px] rounded-2xl bg-black/25 border border-white/10 backdrop-blur text-white text-3xl font-black hover:bg-black/35 transition"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
            </MagicCard>
          </div>

          <div className="h-full">
            <MagicCard className="h-full rounded-3xl bg-zinc-900/35 border border-white/10 backdrop-blur">
              <div className="p-5 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="text-white font-black tracking-wide">
                    {tab === "skins" ? "Skins" : tab === "customize" ? "Customize" : "Faces"}
                  </div>
                  <div className="text-xs text-white/60 font-black">{identityKey ? "Saved" : "Guest"}</div>
                </div>

                {tab === "skins" ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {SKIN_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSkin(s)}
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-left transition",
                          skin === s ? "bg-white/15 border-white/25" : "bg-black/25 border-white/10 hover:bg-black/35"
                        )}
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-white font-black">{SKIN_LABELS[s]}</div>
                          {skin === s ? <div className="text-emerald-300 font-black">✓</div> : null}
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width:
                                s === "custom"
                                  ? "100%"
                                  : s === "classic"
                                    ? "60%"
                                    : s === "neon"
                                      ? "70%"
                                      : s === "magma"
                                        ? "75%"
                                        : s === "toxic"
                                          ? "80%"
                                          : s === "scales"
                                            ? "90%"
                                            : "85%",
                              background:
                                s === "custom"
                                  ? "linear-gradient(90deg, #7c3aed, #22c55e)"
                                  : s === "classic"
                                    ? "linear-gradient(90deg, #3AFF9E, #1B8F32)"
                                    : s === "neon"
                                      ? "linear-gradient(90deg, #4FC3F7, #2563EB)"
                                      : s === "magma"
                                        ? "linear-gradient(90deg, #FFA94D, #FFE066)"
                                        : s === "toxic"
                                          ? "linear-gradient(90deg, #9C6BFF, #C4B5FD)"
                                          : s === "scales"
                                            ? "linear-gradient(90deg, #5EEAD4, #3AFF9E)"
                                            : "linear-gradient(90deg, #0F172A, #5EEAD4)",
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : tab === "customize" ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-black/25 border border-white/10 p-4">
                      <div className="text-white font-black">Custom Colors</div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="text-xs font-black text-white/70">Primary</div>
                          <input
                            type="color"
                            value={customPrimary}
                            onChange={(e) => {
                              setCustomPrimary(e.target.value);
                              setSkin("custom");
                            }}
                            className="w-full h-10 rounded-lg bg-transparent border border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-black text-white/70">Secondary</div>
                          <input
                            type="color"
                            value={customSecondary}
                            onChange={(e) => {
                              setCustomSecondary(e.target.value);
                              setSkin("custom");
                            }}
                            className="w-full h-10 rounded-lg bg-transparent border border-white/10"
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-white/60">Changing colors automatically selects “custom” skin.</div>
                    </div>

                    <div className="rounded-2xl bg-black/25 border border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-black">Loadout</div>
                        <button
                          type="button"
                          onClick={save}
                          className="rounded-xl px-4 py-2 text-xs font-black bg-white/10 border border-white/10 text-white hover:bg-white/15 transition"
                        >
                          Save
                        </button>
                      </div>
                      <div className="mt-3 space-y-3">
                        {[
                          { label: "Glow", value: 7 },
                          { label: "Trail", value: 6 },
                          { label: "Outline", value: 5 },
                          { label: "Spark", value: 4 },
                          { label: "Aura", value: 8 },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center gap-3">
                            <div className="w-16 text-xs font-black text-white/70">{row.label}</div>
                            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(row.value / 10) * 100}%`,
                                  background: "linear-gradient(90deg, rgba(59,130,246,0.9), rgba(124,58,237,0.9))",
                                }}
                              />
                            </div>
                            <div className="text-xs font-black text-white/80 tabular-nums">{row.value}/10</div>
                            <div className="size-9 rounded-xl bg-white/10 border border-white/10 grid place-items-center text-white font-black">
                              +
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="text-xs font-black text-white/70 mb-2">Eyes</div>
                      <div className="grid grid-cols-4 gap-2">
                        {EYES_OPTIONS.map((e) => (
                          <button
                            key={e}
                            onClick={() => setEyes(e)}
                            className={cn(
                              "aspect-square rounded-2xl border grid place-items-center transition",
                              eyes === e ? "bg-white/15 border-white/25" : "bg-black/25 border-white/10 hover:bg-black/35"
                            )}
                            type="button"
                            aria-label={e}
                          >
                            <div className={cn("size-8 rounded-full bg-white/80", e === "angry" && "bg-white/70")} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black text-white/70 mb-2">Mouth</div>
                      <div className="grid grid-cols-4 gap-2">
                        {MOUTH_OPTIONS.map((m) => (
                          <button
                            key={m}
                            onClick={() => setMouth(m)}
                            className={cn(
                              "aspect-square rounded-2xl border grid place-items-center transition",
                              mouth === m ? "bg-white/15 border-white/25" : "bg-black/25 border-white/10 hover:bg-black/35"
                            )}
                            type="button"
                            aria-label={m}
                          >
                            <div className={cn("h-4 w-10 rounded-full", m === "tongue" ? "bg-rose-500" : m === "fangs" ? "bg-white/80" : "bg-white/60")} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-5">
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { key: "skins", label: "Skins" },
                      { key: "customize", label: "Customize" },
                      { key: "faces", label: "Faces" },
                    ] as const).map((b) => (
                      <button
                        key={b.key}
                        onClick={() => setTab(b.key)}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-sm font-black transition",
                          tab === b.key ? "bg-white/15 border-white/25 text-white" : "bg-black/25 border-white/10 text-white/70 hover:bg-black/35 hover:text-white"
                        )}
                        type="button"
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
