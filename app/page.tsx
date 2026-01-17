import type { Metadata } from "next";
import { Gamepad2, Gift, Sparkles, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Block21 - Worms Lobby",
  description:
    "Arcade-style worms lobby with animated background and quick access to battle.",
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="snake-track">
          <div className="snake-body-main" />
        </div>
      </div>
      <main className="mx-auto flex max-w-6xl items-center justify-center">
        <div className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-sky-500/40 bg-gradient-to-b from-sky-800 via-sky-900 to-sky-950 shadow-[0_0_60px_rgba(56,189,248,0.6)]">
          <header className="flex items-center justify-between bg-sky-950/80 px-6 py-3 text-xs font-semibold text-sky-50">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-sky-200">
                Block21
              </div>
              <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px]">
                <span className="font-semibold text-slate-100">Get it on</span>
                <span className="text-sky-100">Google Play</span>
                <span className="text-slate-400">·</span>
                <span className="text-sky-100">App Store</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1 rounded-full bg-black/40 px-3 py-1">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="font-semibold text-orange-100">109</span>
                <span className="text-orange-200/80">/ 20</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-black/40 px-3 py-1">
                <Trophy className="h-3 w-3 text-yellow-300" />
                <span className="font-semibold text-yellow-100">8,325</span>
              </div>
            </div>
          </header>
          <div className="relative flex h-[min(620px,80vh)] flex-1">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.1),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(15,118,220,0.45),transparent_55%),radial-gradient(circle_at_0%_80%,rgba(56,189,248,0.35),transparent_55%)] opacity-60" />
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
            </div>
            <div className="relative flex h-full w-full flex-col items-center justify-between px-6 pb-8 pt-6">
              <div className="flex w-full items-start justify-between">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-black/40 px-3 py-2">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-300 to-sky-500 text-black shadow-md shadow-sky-900/70">
                      <div className="flex h-full w-full items-center justify-center text-xs font-black">
                        18
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-[11px] font-semibold text-sky-100">
                        Devender Yadav
                      </div>
                      <div className="mt-1 h-1.5 w-32 rounded-full bg-sky-900/80">
                        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-300 to-lime-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 text-xs font-bold text-white shadow-md shadow-orange-900/60">
                      ADS
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-emerald-400 text-xs font-bold text-white shadow-md shadow-sky-900/60">
                      Bonus
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-bold text-white shadow-md shadow-yellow-900/60">
                      2d
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 text-xs font-bold text-white shadow-md shadow-sky-900/60">
                      Bag
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-300 to-orange-500 text-base font-bold text-amber-950 shadow-md shadow-amber-900/60">
                    %
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-300 to-sky-500 text-base font-bold text-sky-950 shadow-md shadow-sky-900/60">
                    10k
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 text-base font-bold text-rose-950 shadow-md shadow-rose-900/60">
                    ?
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 text-base font-bold text-emerald-950 shadow-md shadow-emerald-900/60">
                    🎯
                  </button>
                </div>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black tracking-[0.1em] text-yellow-300 drop-shadow-[0_4px_0_rgba(15,23,42,0.9)] sm:text-4xl md:text-5xl">
                    Worms Zone
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-100">
                    Block21 arcade lobby
                  </div>
                </div>
                <div className="flex flex-col items-center gap-5 md:flex-row">
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-red-400 to-orange-500 shadow-[0_0_40px_rgba(248,113,113,0.9)]">
                    <Gift className="h-12 w-12 text-amber-50" />
                  </div>
                  <div className="flex min-w-[220px] flex-col items-center rounded-3xl bg-gradient-to-b from-amber-200 via-amber-100 to-yellow-200 px-6 py-4 text-center shadow-[0_10px_0_rgba(251,191,36,1)]">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                      No Ads pack
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-amber-900">
                      <span>2 500</span>
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-1 text-[11px] text-amber-700">
                      Sly fox skin included
                    </div>
                    <div className="mt-3 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-950 shadow-[0_4px_0_rgba(5,150,105,1)]">
                      2.99 USD
                    </div>
                  </div>
                  <button className="mt-2 inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-100 md:mt-0">
                    <Sparkles className="h-3 w-3 text-yellow-300" />
                    Video bonus
                  </button>
                </div>
              </div>
              <div className="flex w-full flex-col items-center gap-3">
                <button className="inline-flex min-w-[260px] items-center justify-center rounded-[999px] bg-gradient-to-b from-emerald-400 to-emerald-600 px-12 py-3 text-2xl font-black tracking-wide text-white shadow-[0_10px_0_rgba(5,150,105,1),0_0_40px_rgba(34,197,94,0.9)] hover:translate-y-[1px] hover:shadow-[0_7px_0_rgba(5,150,105,1),0_0_32px_rgba(34,197,94,0.9)] transition-all">
                  To battle!
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-sky-900/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-100">
                  <Gamepad2 className="h-4 w-4 text-sky-300" />
                  Worm wardrobe
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
