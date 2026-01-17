"use client";

import React from "react";
import { Construction, Gamepad2, Hammer, Sparkles } from "lucide-react";
import Link from "next/link";
import WormsGame from "@/components/game/WormsGame";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.8)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono uppercase tracking-[0.25em] text-slate-400">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/5 px-3 py-1">
            <Construction className="h-3 w-3 text-green-400" />
            <span>Multiplayer Snake Arena</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              <span>Power-ups, skins, leaderboards</span>
            </div>
            <div className="hidden items-center gap-1 md:flex">
              <Gamepad2 className="h-3 w-3 text-sky-400" />
              <span>Play in browser</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-10 xl:flex-row xl:items-stretch xl:gap-14">
          <div className="w-full max-w-xl space-y-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
                  Block 21
                </span>
                <span className="mt-1 block text-2xl font-semibold uppercase tracking-[0.3em] text-slate-400 sm:text-3xl">
                  Worms Arena
                </span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                Slide into a crowded arena, eat glowing food, steal mass from
                fallen rivals, and climb the size ladder. One rule: do not hit
                another worm&apos;s body.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/worms"
                className="group inline-flex items-center gap-3 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_25px_rgba(34,197,94,0.7)] transition hover:bg-green-400"
              >
                <span>Play in browser</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10">
                  <Gamepad2 className="h-4 w-4" />
                </span>
              </Link>

              <Link
                href="/downloads"
                className="inline-flex items-center gap-2 rounded-full border border-slate-600/80 bg-slate-900/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-200 hover:border-green-400/80 hover:text-green-300"
              >
                <span>More downloads</span>
                <Sparkles className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-300 sm:text-sm">
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
                <div className="font-semibold text-slate-100">Dynamic modes</div>
                <div className="mt-1 text-xs text-slate-400">
                  Infinity, time assault, and treasure hunt with live score
                  tracking.
                </div>
              </div>
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
                <div className="font-semibold text-slate-100">Power-up chaos</div>
                <div className="mt-1 text-xs text-slate-400">
                  Magnets, zoom, speed boosts, and radar to outplay the lobby.
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-xs font-mono uppercase tracking-[0.28em] text-slate-500">
                Available on
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="https://play.google.com/store/apps/details?id=com.wildspike.wormszone"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-left transition hover:border-green-400/80 hover:bg-slate-900/80"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <Gamepad2 className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100">
                      Android / Android TV
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      Free download on Google Play
                    </div>
                  </div>
                </a>

                <a
                  href="https://apps.apple.com/us/app/wormszone-io-hungry-snake/id1357967682"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-left transition hover:border-green-400/80 hover:bg-slate-900/80"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100/10">
                    <Sparkles className="h-4 w-4 text-slate-100" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100">
                      Apple / Apple TV
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      Free on the App Store
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.crazygames.com/game/worms-zone"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-left transition hover:border-green-400/80 hover:bg-slate-900/80"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                    <Gamepad2 className="h-4 w-4 text-purple-300" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100">
                      CrazyGames
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      Browser version on CrazyGames
                    </div>
                  </div>
                </a>

                <a
                  href="https://gamedistribution.com/games/worms-zone-a-slithery-snake"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-left transition hover:border-green-400/80 hover:bg-slate-900/80"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20">
                    <Gamepad2 className="h-4 w-4 text-sky-300" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100">
                      GameDistribution
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      Embed-ready web version
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="relative w-full flex-1">
            <div className="relative h-full min-h-[360px] rounded-[32px] border border-green-500/25 bg-black/60 shadow-[0_0_80px_rgba(34,197,94,0.35)] backdrop-blur-md">
              <div className="flex h-11 items-center justify-between border-b border-green-500/20 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 px-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500/90" />
                  <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-400/90" />
                  <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-400/90" />
                  <span className="ml-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                    Block 21 · Worms Arena
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="h-1 w-6 rounded-full bg-emerald-400/70" />
                  <span>Online</span>
                </div>
              </div>

              <div className="relative h-[min(520px,70vh)] w-full p-3 sm:p-4">
                <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/90">
                  <WormsGame playerName="Guest" skinId="neon" mode="infinity" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/70 px-3 py-1 font-mono uppercase tracking-[0.25em]">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              <span>Best played full-screen</span>
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-green-300"
          >
            <Hammer className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-[0.25em]">
              Return to home base
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
