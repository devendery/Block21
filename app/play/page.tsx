import Link from "next/link";
import SnakeGame from "@/components/phase1/snake/SnakeGame";
import LeaderboardPanel from "@/components/phase1/LeaderboardPanel";
import RewardsPanel from "@/components/phase1/RewardsPanel";
import { Meteors } from "@/components/ui/meteors";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";
import Wardrobe from "@/components/phase1/snake/Wardrobe";
import WormAvatar from "@/components/phase1/snake/WormAvatar";

export default async function PlayPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; screen?: string }> | { mode?: string; screen?: string };
}) {
  const sp = (await (searchParams as any)) as { mode?: string; screen?: string } | undefined;
  const mode =
    sp?.mode === "match"
      ? "match"
      : sp?.mode === "practice"
        ? "practice"
        : sp?.mode === "tournament"
          ? "tournament"
          : "arena";
  const screen =
    sp?.screen === "battle"
      ? "battle"
      : sp?.screen === "play"
        ? "play"
        : sp?.screen === "wardrobe"
          ? "wardrobe"
        : sp?.mode
          ? "play"
          : "home";
  const roomName = mode === "match" ? "snake" : mode === "practice" ? "snake_practice" : "snake_arena";

  if (screen === "wardrobe") {
    return <Wardrobe />;
  }

  if (screen === "home") {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0b1f3a] text-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_10%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(900px_circle_at_80%_70%,rgba(124,58,237,0.18),transparent_50%)]" />
        <Meteors number={18} className="bg-white/60" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WormAvatar className="bg-white/10 border-white/20" />
              <div className="h-10 w-48 rounded-full bg-black/25 border border-white/10 backdrop-blur" />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-black/25 border border-white/10 rounded-xl px-3 py-2 backdrop-blur">
                <div className="size-6 rounded-full bg-red-500/80" />
                <div className="text-white font-black tabular-nums">20/20</div>
              </div>
              <div className="flex items-center gap-2 bg-black/25 border border-white/10 rounded-xl px-3 py-2 backdrop-blur">
                <div className="size-6 rounded-full bg-yellow-400/80" />
                <div className="text-white font-black tabular-nums">500</div>
              </div>
              <Link
                href="/profile"
                className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-black px-4 py-2 transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs text-white/80 backdrop-blur">
              <span className="font-bold tracking-widest">BLOCK21</span>
              <span className="text-white/40">/</span>
              <span className="font-bold tracking-widest">SNAKE ARENA</span>
            </div>

            <h1 className="mt-6 text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
              WORMS ZONE
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/70 max-w-xl">
              Smooth free-field movement. Neon glow. Pick a mode and drop in.
            </p>

            <div className="mt-12">
              <Link
                href="/play?screen=battle"
                className="inline-flex items-center justify-center rounded-2xl px-16 py-6 text-3xl font-black tracking-wide text-black bg-gradient-to-b from-lime-300 to-emerald-500 shadow-[0_20px_60px_rgba(16,185,129,0.35)] border border-white/20 hover:brightness-110 transition"
              >
                To battle!
              </Link>
            </div>

            <div className="mt-6">
              <Link
                href="/play?screen=wardrobe"
                className="inline-flex items-center justify-center rounded-xl px-10 py-3 text-sm font-black text-white bg-black/25 border border-white/10 backdrop-blur hover:bg-black/35 transition"
              >
                Worm wardrobe
              </Link>
              <div className="mt-2 text-xs text-white/60">Choose the skin for your worm</div>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-2xl bg-black/25 border border-white/10 backdrop-blur" />
              <div className="size-14 rounded-2xl bg-black/25 border border-white/10 backdrop-blur" />
            </div>
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-2xl bg-black/25 border border-white/10 backdrop-blur" />
              <div className="size-14 rounded-2xl bg-black/25 border border-white/10 backdrop-blur" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "battle") {
    const options: Array<{
      key: "arena" | "practice" | "match" | "tournament";
      title: string;
      desc: string;
      accent: string;
      cta: string;
      disabled?: boolean;
    }> = [
      { key: "arena", title: "Arena", desc: "Drop-in arena. Survive and grow.", accent: "#FF0033", cta: "Play" },
      { key: "practice", title: "Practice", desc: "Solo warmup with bots.", accent: "#3b82f6", cta: "Play" },
      { key: "match", title: "Match", desc: "Starts when enough players join.", accent: "#22c55e", cta: "Play" },
      { key: "tournament", title: "Tournament", desc: "Bracket mode (coming soon).", accent: "#eab308", cta: "Soon", disabled: true },
    ];

    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0b1f3a] text-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_10%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(900px_circle_at_80%_70%,rgba(59,130,246,0.18),transparent_50%)]" />
        <Meteors number={14} className="bg-white/60" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-12">
          <div className="flex items-center justify-between">
            <div className="text-white font-black tracking-widest">Choose Mode</div>
            <Link
              href="/play"
              className="rounded-xl bg-black/25 border border-white/10 backdrop-blur px-4 py-2 text-white font-black hover:bg-black/35 transition"
            >
              ✕
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {options.map((o) => (
              <MagicCard
                key={o.key}
                className={cn(
                  "p-6 bg-zinc-900/40 border border-white/10 rounded-2xl backdrop-blur",
                  o.disabled && "opacity-60"
                )}
                gradientColor={o.accent}
              >
                <BorderBeam size={110} duration={10} delay={0} colorFrom={o.accent} colorTo={o.accent} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl font-black text-white">{o.title}</div>
                    <div className="mt-1 text-sm text-white/70">{o.desc}</div>
                  </div>
                    <WormAvatar className="size-14" />
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="text-xs text-white/60">
                    {o.key === "arena" ? "Large lobby" : o.key === "practice" ? "∞" : o.key === "match" ? "2 players" : "—"}
                  </div>
                  {o.disabled ? (
                    <div className="rounded-xl px-6 py-3 text-sm font-black bg-white/10 text-white/70 border border-white/10">
                      {o.cta}
                    </div>
                  ) : (
                    <Link
                      href={`/play?screen=play&mode=${o.key}`}
                      className="rounded-xl px-6 py-3 text-sm font-black bg-gradient-to-b from-lime-300 to-emerald-500 text-black border border-white/20 hover:brightness-110 transition"
                    >
                      {o.cta}
                    </Link>
                  )}
                </div>
              </MagicCard>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center">
            <Link
              href="/play"
              className="text-sm font-black text-white/80 hover:text-white transition"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-foreground">
      <div className="absolute inset-0">
        <SnakeGame roomName={roomName} />
      </div>

      <div className="absolute top-4 left-4 z-40 w-[280px] max-w-[80vw] space-y-3 pointer-events-auto">
        <div className="glass-panel px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <WormAvatar className="size-9 rounded-xl" />
                <div className="text-white font-black leading-tight">
                {mode === "arena" ? "Arena" : mode === "practice" ? "Practice" : mode === "match" ? "Match" : "Tournament"}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {mode === "practice"
                  ? "Solo warmup with bots."
                  : mode === "match"
                    ? "Match starts when enough players join."
                    : "Drop-in arena. Survive and grow."}
              </div>
            </div>
            <Link
              href="/play?screen=battle"
              className="text-xs font-black px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/15 transition"
            >
              Modes
            </Link>
          </div>
        </div>
        <div className="scale-[0.94] origin-top-left">
          <LeaderboardPanel />
        </div>
        <div className="scale-[0.94] origin-top-left">
          <RewardsPanel />
        </div>
      </div>

      <div className="absolute top-4 right-4 z-40 w-[220px] h-[220px] max-w-[45vw] max-h-[45vw] pointer-events-auto">
        <div className="glass-panel w-full h-full p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-white">Radar</div>
            <div className="text-[10px] text-white/50">beta</div>
          </div>
          <div className="mt-2 w-full h-[calc(100%-22px)] rounded-lg bg-black/50 border border-white/10" />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-40 pointer-events-auto flex items-center gap-2">
        <Link
          href="/play"
          className="rounded-xl bg-black/40 border border-white/10 backdrop-blur px-4 py-2 text-white font-black hover:bg-black/55 transition"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
