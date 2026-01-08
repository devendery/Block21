export default function CoinVisual({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
      
      {/* Coin Body - Digital/Glass Effect */}
      <div className="relative w-full h-full rounded-full bg-slate-900 border-2 border-primary/50 flex items-center justify-center transform hover:scale-105 transition-transform duration-500 shadow-[0_0_30px_rgba(14,165,233,0.15)] backdrop-blur-sm overflow-hidden">
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

        {/* Animated Rings */}
        <div className="absolute inset-2 rounded-full border border-primary/20" />
        <div className="absolute inset-4 rounded-full border border-dashed border-primary/40 animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full border border-dashed border-primary/20 animate-[spin_15s_linear_infinite_reverse]" />
        
        {/* Symbol */}
        <div className="text-white font-bold text-4xl tracking-tighter drop-shadow-[0_0_15px_rgba(14,165,233,0.8)] z-10">
          B<span className="text-primary">21</span>
        </div>
        
        {/* Shine Effect */}
        <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" />
      </div>
    </div>
  );
}
