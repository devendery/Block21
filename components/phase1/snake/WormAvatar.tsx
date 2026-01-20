"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";

const SKIN_OPTIONS = ["classic", "neon", "magma", "toxic", "void", "scales", "custom"] as const;
const EYES_OPTIONS = ["cat", "round", "angry"] as const;
const MOUTH_OPTIONS = ["tongue", "smile", "fangs"] as const;

const SKIN_PREVIEW: Record<(typeof SKIN_OPTIONS)[number], { primary: string; secondary: string }> = {
  classic: { primary: "#3AFF9E", secondary: "#1B8F32" },
  neon: { primary: "#4FC3F7", secondary: "#2563EB" },
  magma: { primary: "#FFA94D", secondary: "#FFE066" },
  toxic: { primary: "#9C6BFF", secondary: "#C4B5FD" },
  void: { primary: "#0F172A", secondary: "#5EEAD4" },
  scales: { primary: "#5EEAD4", secondary: "#3AFF9E" },
  custom: { primary: "#7c3aed", secondary: "#22c55e" },
};

function parseColor(v: any) {
  if (typeof v === "number" && Number.isFinite(v)) return `#${v.toString(16).padStart(6, "0")}`;
  if (typeof v === "string") {
    const s = v.trim().replace("#", "");
    const n = Number.parseInt(s.slice(0, 6), 16);
    if (Number.isFinite(n)) return `#${n.toString(16).padStart(6, "0")}`;
  }
  return null;
}

function useIdentityKey() {
  const { isConnected, address } = useAccount();
  const [guest, setGuest] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) return;
    try {
      const key = "b21_guest_address";
      const existing = window.localStorage.getItem(key);
      if (existing && typeof existing === "string") {
        setGuest(existing);
        return;
      }
      const next = `guest-${crypto.randomUUID()}`;
      window.localStorage.setItem(key, next);
      setGuest(next);
    } catch {
      setGuest("guest");
    }
  }, [address, isConnected]);

  return useMemo(() => {
    if (isConnected && address) return address.toLowerCase();
    if (guest) return guest.toLowerCase();
    return null;
  }, [address, guest, isConnected]);
}

function WormHeadSvg({
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
  const cx = 18;
  const cy = 18;

  const eyeOff = 5.2;
  const eyeR = 2.7;
  const lx = cx - eyeOff;
  const rx = cx + eyeOff;
  const ey = cy - 2.8;

  return (
    <svg viewBox="0 0 36 36" className="w-full h-full">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r="15.6" fill={secondary} opacity="0.95" filter="url(#glow)" />
      <circle cx={cx} cy={cy} r="11.2" fill={primary} opacity="0.95" />
      {skin === "scales" ? (
        <>
          {[
            { x: cx - 6.2, y: cy + 0.5 },
            { x: cx, y: cy - 4.2 },
            { x: cx + 6.1, y: cy + 0.7 },
            { x: cx - 2.8, y: cy + 6.2 },
            { x: cx + 3.0, y: cy + 6.0 },
          ].map((p, idx) => (
            <path
              key={idx}
              d={`M ${p.x} ${p.y - 2.0} L ${p.x + 2.1} ${p.y} L ${p.x} ${p.y + 2.0} L ${p.x - 2.1} ${p.y} Z`}
              fill="#0b1020"
              opacity="0.22"
            />
          ))}
        </>
      ) : null}

      {eyes === "cat" ? (
        <>
          <ellipse cx={lx} cy={ey} rx={eyeR * 1.1} ry={eyeR * 0.95} fill="#fff" />
          <ellipse cx={rx} cy={ey} rx={eyeR * 1.1} ry={eyeR * 0.95} fill="#fff" />
          <ellipse cx={lx + 0.9} cy={ey + 0.2} rx={eyeR * 0.35} ry={eyeR * 0.75} fill="#0b1020" />
          <ellipse cx={rx + 0.9} cy={ey + 0.2} rx={eyeR * 0.35} ry={eyeR * 0.75} fill="#0b1020" />
        </>
      ) : eyes === "angry" ? (
        <>
          <path d={`M ${lx - 3.6} ${ey - 2.2} Q ${lx} ${ey - 4.8} ${lx + 3.8} ${ey - 2.4}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d={`M ${rx - 3.8} ${ey - 2.4} Q ${rx} ${ey - 4.8} ${rx + 3.6} ${ey - 2.2}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx={lx + 1} cy={ey + 0.6} r={eyeR * 0.75} fill="#0b1020" />
          <circle cx={rx + 1} cy={ey + 0.6} r={eyeR * 0.75} fill="#0b1020" />
        </>
      ) : (
        <>
          <circle cx={lx} cy={ey} r={eyeR} fill="#fff" />
          <circle cx={rx} cy={ey} r={eyeR} fill="#fff" />
          <circle cx={lx + 1.1} cy={ey + 0.6} r={eyeR * 0.55} fill="#0b1020" />
          <circle cx={rx + 1.1} cy={ey + 0.6} r={eyeR * 0.55} fill="#0b1020" />
        </>
      )}

      {mouth === "tongue" ? (
        <>
          <ellipse cx={cx + 5.3} cy={cy + 5.6} rx="5.2" ry="3.8" fill="#ef4444" />
          <ellipse cx={cx + 6.4} cy={cy + 6.0} rx="2.7" ry="1.8" fill="#fb7185" />
        </>
      ) : mouth === "fangs" ? (
        <>
          <path d={`M ${cx + 2} ${cy + 5.2} Q ${cx + 5.4} ${cy + 8.2} ${cx + 9.2} ${cy + 5.2}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d={`M ${cx + 5.4} ${cy + 5.8} l 1.5 3.8 l -3 0 z`} fill="#fff" opacity="0.95" />
        </>
      ) : (
        <path d={`M ${cx + 2} ${cy + 5.2} Q ${cx + 5.6} ${cy + 9.2} ${cx + 9.2} ${cy + 5.2}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}

      <circle
        cx="30"
        cy="7"
        r="2.2"
        fill={
          skin === "void"
            ? "#5EEAD4"
            : skin === "magma"
              ? "#FFE066"
              : skin === "toxic"
                ? "#9C6BFF"
                : skin === "neon"
                  ? "#4FC3F7"
                  : skin === "scales"
                    ? "#3AFF9E"
                    : "#3AFF9E"
        }
        opacity="0.6"
      />
    </svg>
  );
}

export default function WormAvatar({
  className,
}: {
  className?: string;
}) {
  const { isConnected, address } = useAccount();
  const identityKey = useIdentityKey();
  const [skin, setSkin] = useState<(typeof SKIN_OPTIONS)[number]>("classic");
  const [eyes, setEyes] = useState<(typeof EYES_OPTIONS)[number]>("cat");
  const [mouth, setMouth] = useState<(typeof MOUTH_OPTIONS)[number]>("tongue");
  const [customPrimary, setCustomPrimary] = useState<string | null>(null);
  const [customSecondary, setCustomSecondary] = useState<string | null>(null);
  const [loadedFromServer, setLoadedFromServer] = useState(false);

  const load = () => {
    if (!identityKey) return;
    try {
      const raw = window.localStorage.getItem(`b21_snake_cosmetic:${identityKey}`);
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        if (SKIN_OPTIONS.includes(parsed?.skin)) setSkin(parsed.skin);
        if (EYES_OPTIONS.includes(parsed?.eyes)) setEyes(parsed.eyes);
        if (MOUTH_OPTIONS.includes(parsed?.mouth)) setMouth(parsed.mouth);
      }
      const rawPalette = window.localStorage.getItem(`b21_snake_custom_palette:${identityKey}`);
      if (rawPalette) {
        const parsed = JSON.parse(rawPalette) as any;
        const p = parseColor(parsed?.primary);
        const s = parseColor(parsed?.secondary);
        setCustomPrimary(p);
        setCustomSecondary(s);
      }
    } catch {
    }
  };

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("b21_snake_cosmetic_updated", onUpdate as any);
    return () => window.removeEventListener("b21_snake_cosmetic_updated", onUpdate as any);
  }, [identityKey]);

  useEffect(() => {
    if (!identityKey) return;
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
        try {
          window.localStorage.setItem(`b21_snake_cosmetic:${identityKey}`, JSON.stringify({ skin: c.skin, eyes: c.eyes, mouth: c.mouth }));
          if (c?.customPalette) {
            const p = parseColor(c.customPalette.primary);
            const s = parseColor(c.customPalette.secondary);
            if (p && s) {
              window.localStorage.setItem(`b21_snake_custom_palette:${identityKey}`, JSON.stringify({ primary: p, secondary: s }));
            }
          }
          window.dispatchEvent(new Event("b21_snake_cosmetic_updated"));
        } catch {
        }
        load();
      } finally {
        if (!cancelled) setLoadedFromServer(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [address, identityKey, isConnected, loadedFromServer]);

  const colors = skin === "custom" && customPrimary && customSecondary ? { primary: customPrimary, secondary: customSecondary } : SKIN_PREVIEW[skin];

  return (
    <div className={cn("size-12 rounded-2xl bg-black/25 border border-white/10 backdrop-blur grid place-items-center", className)}>
      <div className="size-9">
        <WormHeadSvg skin={skin} eyes={eyes} mouth={mouth} primary={colors.primary} secondary={colors.secondary} />
      </div>
    </div>
  );
}
