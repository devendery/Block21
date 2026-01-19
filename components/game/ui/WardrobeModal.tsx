import React from 'react';
import { Smile, Coins, Wand2, Settings, X, Palette, Eye } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative z-10 w-full max-w-5xl h-[85vh] rounded-[32px] border border-sky-600/70 bg-sky-950/95 shadow-[0_0_80px_rgba(56,189,248,0.4)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <div className="flex md:flex-col justify-between w-full md:w-20 bg-sky-900/40 border-b md:border-b-0 md:border-r border-sky-700/50 p-2 md:py-6 items-center gap-2">
          <div className="flex md:flex-col gap-2 w-full md:w-auto justify-center">
            <button 
              onClick={() => setWardrobeTab('skins')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${wardrobeTab === 'skins' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-sky-900/50 text-sky-300 hover:bg-sky-800'}`}
            >
              <Smile className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setWardrobeTab('colors')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${wardrobeTab === 'colors' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'bg-sky-900/50 text-sky-300 hover:bg-sky-800'}`}
            >
              <Palette className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setWardrobeTab('faces')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${wardrobeTab === 'faces' ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/20' : 'bg-sky-900/50 text-sky-300 hover:bg-sky-800'}`}
            >
              <Eye className="w-6 h-6" />
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all ml-auto md:ml-0 md:mt-auto"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-sky-700/30">
            <div>
              <div className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                WARDROBE
                <span className="text-xs font-mono font-normal px-2 py-1 rounded bg-sky-900/50 text-sky-300 border border-sky-700/50">
                  BETA
                </span>
              </div>
              <div className="text-xs text-sky-200/60 font-mono mt-1">
                CUSTOMIZE YOUR BATTLE IDENTITY
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm font-bold text-amber-400">
                <Coins className="w-4 h-4" />
                <span>{profile?.totalB21Earned ?? 0} B21</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Live Preview Area */}
            <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950 opacity-80" />
              
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <AnimatedSnake skin={activeSkin} length={30} interactive animated size={55} />
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 shadow-xl">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">Skin</span>
                  <span className="text-sm font-bold text-emerald-400 capitalize">{activeSkin}</span>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">Eyes</span>
                  <span className="text-sm font-bold text-sky-400 capitalize">{selectedFace.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Selection Panel */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-sky-700/30 bg-sky-950/50 backdrop-blur-sm p-6 flex flex-col gap-6 overflow-y-auto">
              
              {wardrobeTab === 'skins' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-sky-100 uppercase tracking-wider">Available Skins</h3>
                    <span className="text-xs text-sky-400">{skins.length} items</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {skins.map((skin) => (
                      <button
                        key={skin}
                        onClick={() => setActiveSkin(skin)}
                        className={`group relative aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all overflow-hidden ${
                          activeSkin === skin
                            ? 'border-emerald-400 bg-emerald-900/20 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                            : 'border-slate-700 bg-slate-900/50 hover:border-sky-500/50 hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                          skin === 'classic' ? 'from-emerald-400 to-green-600' :
                          skin === 'neon' ? 'from-cyan-400 to-blue-600' :
                          skin === 'shadow' ? 'from-purple-500 to-slate-900' :
                          skin === 'gold' ? 'from-yellow-300 to-amber-600' :
                          skin === 'cyber' ? 'from-pink-500 to-rose-600' :
                          skin === 'toxin' ? 'from-lime-400 to-green-700' :
                          skin === 'crimson' ? 'from-red-500 to-orange-700' :
                          'from-gray-200 to-slate-500'
                        }`} />
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-300 group-hover:text-white">
                          {skin}
                        </span>
                        {activeSkin === skin && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wardrobeTab === 'colors' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-sky-100 uppercase tracking-wider">Accent Colors</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      '#22c55e', '#0ea5e9', '#f97316', '#a855f7',
                      '#e11d48', '#facc15', '#6366f1', '#14b8a6',
                      '#ecfeff', '#f1f5f9', '#1e293b', '#fbbf24'
                    ].map((color) => (
                      <button
                        key={color}
                        className="aspect-square rounded-2xl border-2 border-slate-700 hover:border-white transition-all shadow-lg hover:scale-105"
                        style={{ backgroundColor: color }}
                        onClick={() => {}} // Placeholder for actual color logic if needed
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    Accent colors modify your trail, UI highlights, and particle effects in the arena.
                  </p>
                </div>
              )}

              {wardrobeTab === 'faces' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-sky-100 uppercase tracking-wider">Expressions</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {faceOptions.map((face) => (
                      <button
                        key={face}
                        onClick={() => setSelectedFace(face)}
                        className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl transition-all ${
                          selectedFace === face
                            ? 'border-sky-400 bg-sky-900/30 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                            : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800'
                        }`}
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
                </div>
              )}

              <div className="mt-auto pt-6">
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black tracking-wide shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  EQUIP & CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
