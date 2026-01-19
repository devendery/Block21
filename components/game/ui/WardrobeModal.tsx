import React from 'react';
import { Smile, Coins, Wand2, Settings, X, Palette } from 'lucide-react';
import AnimatedSnake from '@/components/showcase/AnimatedSnake';
import { UserProfile } from '@/types/game';

type WardrobeModalProps = {
  profile: UserProfile | null;
  activeSkin: string;
  selectedFace: string;
  wardrobeTab: 'skins' | 'colors' | 'faces';
  setActiveSkin: (skin: string) => void;
  setSelectedFace: (face: string) => void;
  setWardrobeTab: (tab: 'skins' | 'colors' | 'faces') => void;
  onClose: () => void;
};

export default function WardrobeModal({
  profile,
  activeSkin,
  selectedFace,
  wardrobeTab,
  setActiveSkin,
  setSelectedFace,
  setWardrobeTab,
  onClose,
}: WardrobeModalProps) {
  const skins = ['classic', 'neon', 'shadow', 'gold', 'cyber', 'toxin', 'crimson', 'void'];
  const faceOptions = [
    'classic-eyes',
    'wide-eyes',
    'sleepy-eyes',
    'alien-eyes',
    'angry-eyes',
    'happy-eyes',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04132c]">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#12346b] via-transparent to-[#020817]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl h-[80vh] rounded-3xl border border-sky-600/70 bg-sky-950/90 shadow-[0_0_60px_rgba(56,189,248,0.8)] overflow-hidden flex">
        <div className="flex flex-col justify-between w-16 bg-sky-900/80 border-r border-sky-700/80 py-4 items-center gap-3">
          <button className="w-10 h-10 rounded-2xl bg-sky-800 flex items-center justify-center">
            <Smile className="w-5 h-5 text-yellow-300" />
          </button>
          <button className="w-10 h-10 rounded-2xl bg-sky-800 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-300" />
          </button>
          <button className="w-10 h-10 rounded-2xl bg-sky-800 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-purple-300" />
          </button>
          <button className="mt-auto w-10 h-10 rounded-2xl bg-sky-800 flex items-center justify-center">
            <Settings className="w-5 h-5 text-sky-300" />
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-sky-700/70">
            <div>
              <div className="text-2xl font-extrabold tracking-wide text-yellow-300 drop-shadow-[0_3px_0_rgba(0,0,0,0.7)]">
                Wardrobe
              </div>
              <div className="text-xs text-sky-100/70 uppercase tracking-[0.24em]">
                Customize your worm before battle
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-sky-900/80 border border-sky-500/70 text-xs">
                <Coins className="w-4 h-4 text-amber-300" />
                <span className="font-mono">{profile?.totalB21Earned ?? 0}</span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-sky-900/80 border border-sky-500/70 flex items-center justify-center hover:bg-sky-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <AnimatedSnake skin={activeSkin} length={24} interactive animated size={40} />
              <div className="mt-6 px-4 py-2 rounded-full bg-slate-950/80 border border-slate-700/80 text-xs text-slate-100 flex items-center gap-2">
                <span className="font-semibold">Selected skin:</span>
                <span className="capitalize text-emerald-300">{activeSkin}</span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold">Face:</span>
                <span className="capitalize text-sky-300">{selectedFace.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="w-72 border-l border-sky-700/70 bg-sky-950/90 px-5 py-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setWardrobeTab('skins')}
                  className={[
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold border',
                    wardrobeTab === 'skins'
                      ? 'bg-emerald-400 text-black border-emerald-500'
                      : 'bg-sky-900/80 border-sky-600 text-sky-100',
                  ].join(' ')}
                >
                  <Smile className="w-3 h-3" />
                  Skins
                </button>
                <button
                  onClick={() => setWardrobeTab('colors')}
                  className={[
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold border',
                    wardrobeTab === 'colors'
                      ? 'bg-sky-400 text-black border-sky-500'
                      : 'bg-sky-900/80 border-sky-600 text-sky-100',
                  ].join(' ')}
                >
                  <Palette className="w-3 h-3" />
                  Colors
                </button>
                <button
                  onClick={() => setWardrobeTab('faces')}
                  className={[
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold border',
                    wardrobeTab === 'faces'
                      ? 'bg-purple-400 text-black border-purple-500'
                      : 'bg-sky-900/80 border-sky-600 text-sky-100',
                  ].join(' ')}
                >
                  <Smile className="w-3 h-3" />
                  Faces
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                {wardrobeTab === 'skins' && (
                  <>
                    <div className="text-sm font-semibold text-sky-100 mb-1">Skins</div>
                    <div className="grid grid-cols-2 gap-3">
                      {skins.map((skin) => (
                        <button
                          key={skin}
                          onClick={() => setActiveSkin(skin)}
                          className={[
                            'relative rounded-2xl border-2 p-2 flex flex-col items-center gap-2 bg-slate-950/80 transition-transform',
                            activeSkin === skin
                              ? 'border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)] scale-[1.03]'
                              : 'border-slate-700 hover:border-slate-500',
                          ].join(' ')}
                        >
                          <div
                            className={[
                              'w-full h-8 rounded-full bg-gradient-to-r',
                              skin === 'classic'
                                ? 'from-emerald-400 to-green-500'
                                : skin === 'neon'
                                ? 'from-cyan-400 to-blue-500'
                                : skin === 'shadow'
                                ? 'from-purple-400 to-indigo-500'
                                : skin === 'gold'
                                ? 'from-yellow-400 to-amber-500'
                                : skin === 'cyber'
                                ? 'from-pink-400 to-rose-500'
                                : skin === 'toxin'
                                ? 'from-lime-400 to-green-500'
                                : skin === 'crimson'
                                ? 'from-red-400 to-rose-500'
                                : 'from-slate-500 to-slate-800',
                            ].join(' ')}
                          />
                          <span className="text-[11px] uppercase tracking-wide text-slate-200">
                            {skin}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {wardrobeTab === 'colors' && (
                  <>
                    <div className="text-sm font-semibold text-sky-100 mb-1">Accent colors</div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        '#22c55e',
                        '#0ea5e9',
                        '#f97316',
                        '#a855f7',
                        '#e11d48',
                        '#facc15',
                        '#6366f1',
                        '#14b8a6',
                        '#ecfeff',
                        '#f1f5f9',
                      ].map((color) => (
                        <div
                          key={color}
                          className="w-9 h-9 rounded-full border border-slate-600 shadow-md"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Color presets layer on top of your selected skin for UI accents and trails.
                    </p>
                  </>
                )}

                {wardrobeTab === 'faces' && (
                  <>
                    <div className="text-sm font-semibold text-sky-100 mb-1">Faces</div>
                    <div className="grid grid-cols-3 gap-2">
                      {faceOptions.map((face) => (
                        <button
                          key={face}
                          onClick={() => setSelectedFace(face)}
                          className={[
                            'aspect-square rounded-2xl border-2 bg-slate-950/90 flex items-center justify-center text-2xl',
                            selectedFace === face
                              ? 'border-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.8)]'
                              : 'border-slate-700 hover:border-slate-500',
                          ].join(' ')}
                        >
                          {face === 'classic-eyes' && '👀'}
                          {face === 'wide-eyes' && '😳'}
                          {face === 'sleepy-eyes' && '😴'}
                          {face === 'alien-eyes' && '👽'}
                          {face === 'angry-eyes' && '😠'}
                          {face === 'happy-eyes' && '😁'}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Faces are visual only in this version and sync with your arena identity later.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-sky-700/70 flex items-center justify-between bg-sky-950/95">
            <div className="flex items-center gap-2 text-xs text-sky-100/80">
              <Wand2 className="w-4 h-4 text-emerald-300" />
              <span>Equip your look before heading back to the arena.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-slate-900/80 border border-slate-600/80 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-emerald-500 text-black text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:bg-emerald-400"
              >
                Use this look
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
