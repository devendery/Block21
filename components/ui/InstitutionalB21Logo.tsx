import React from "react";

export default function InstitutionalB21Logo({ 
  className = "", 
  size = 64,
  variant = "v5", // Defaulting to the new "Crystal Monolith"
  theme = "obsidian" // platinum | gold | neon | obsidian
}: { 
  className?: string;
  size?: number;
  variant?: "v1" | "v2" | "v3" | "v4" | "v5";
  theme?: "platinum" | "gold" | "neon" | "obsidian";
}) {
  
  // Dynamic Palette based on Theme
  const getPalette = () => {
    switch(theme) {
      case "gold":
        return {
          bg: "#1a1000",
          primary: "#FFD700",    // Gold
          secondary: "#B8860B",  // Dark Goldenrod
          shadow: "#5C4033",     // Dark Brown
          accent: "#FFFACD",     // Lemon Chiffon (Highlight)
          core: "#FFFFFF",       // White Core
          glow: "#FFD700"
        };
      case "neon":
        return {
          bg: "#051010",
          primary: "#4ade80",    // Neon Green
          secondary: "#3b82f6",  // Blue
          shadow: "#1e293b",     // Slate
          accent: "#22d3ee",     // Cyan
          core: "#ffffff",       // White
          glow: "#4ade80"
        };
      case "obsidian":
        return {
          bg: "#080808",         // Lighter Black for contrast
          primary: "#525252",    // Neutral Grey (Metallic) - Much clearer
          secondary: "#262626",  // Dark Grey
          shadow: "#000000",     // Pure Black
          accent: "#FF3355",     // Bright Crimson (Rim)
          core: "#FF0033",       // Neon Red Core
          glow: "#FF0033"
        };
      case "platinum":
      default:
        return {
          bg: "#111111",
          primary: "#F5F5F5",    // White Platinum (High Brightness)
          secondary: "#D4D4D8",  // Light Silver
          shadow: "#71797E",     // Steel
          accent: "#FFFFFF",     // Pure White
          core: "#D4AF37",       // Gold Core
          glow: "#FFFFFF"
        };
    }
  };

  const c = getPalette();

  const renderContent = () => {
    switch (variant) {
      case "v5": // The "Crystal Monolith" (High Clarity / Attractive)
        return (
          <g transform="translate(256, 256) scale(1.15)">
             {/* 1. The Shield Base (Hexagonal Diamond) */}
             <path 
               d="M0 -210 L180 -105 L180 105 L0 210 L-180 105 L-180 -105 Z" 
               fill={c.secondary} 
               stroke={c.accent} 
               strokeWidth="2" 
               opacity="0.8"
             />
             
             {/* 2. The "B" Monolith - Bold & Clear */}
             <path 
               d="M-90 -130 H20 C90 -130 130 -90 130 -30 C130 15 100 30 70 30 C110 30 140 60 140 100 C140 160 90 190 20 190 H-90 V-130 Z" 
               fill={c.primary} 
               filter="url(#bevel)"
             />
             
             {/* 3. The "21" Cutout - Absolute Clarity */}
             {/* We cut the 21 INTO the B, or float it on top. Floating is clearer. */}
             <g transform="translate(0, 30) scale(1.2)">
                <text 
                  x="0" 
                  y="0" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fill={c.core}
                  fontSize="120"
                  fontWeight="900"
                  fontFamily="Arial, sans-serif" // Using standard font for max readability
                  filter={theme === 'obsidian' || theme === 'neon' ? 'url(#glow-strong)' : undefined}
                  style={{ letterSpacing: '-5px' }}
                >
                  21
                </text>
             </g>

             {/* 4. Decorative Circuit/Diamond Lines */}
             <path d="M-90 -130 L-90 190" stroke={c.shadow} strokeWidth="8" />
             <path d="M0 -210 L0 -130" stroke={c.accent} strokeWidth="2" opacity="0.5" />
             <path d="M0 190 L0 210" stroke={c.accent} strokeWidth="2" opacity="0.5" />
          </g>
        );

      case "v1": // The Sovereign (Refined for Clarity)
        return (
          <g transform="translate(2, -26) scale(1.1)">
             <path d="M100 50 L200 50 L200 462 L100 462 L50 256 Z" fill={c.primary} stroke={c.bg} strokeWidth="4" />
             <path d="M210 50 L412 150 L350 250 L210 250 Z" fill={c.secondary} stroke={c.bg} strokeWidth="4" />
             <path d="M210 262 L350 262 L412 362 L210 462 Z" fill={c.secondary} stroke={c.bg} strokeWidth="4" />
             
             {/* Inner Facets */}
             <path d="M210 50 L210 250 L300 150 Z" fill={c.shadow} />
             <path d="M210 462 L210 262 L300 362 Z" fill={c.shadow} />
             
             {/* The "21" Core - Made Larger & Clearer */}
             <g transform="scale(1.3) translate(-50, -60)">
               <path 
                 d="M230 210 L270 210 L270 225 L245 250 L270 250 L270 270 L230 270 L230 255 L255 230 L230 230 Z" 
                 fill={c.core} 
                 filter={theme === 'neon' || theme === 'obsidian' ? 'url(#glow)' : undefined} 
                 stroke={c.bg}
                 strokeWidth="2"
               />
               <path 
                 d="M285 210 L305 210 L305 270 L285 270 Z" 
                 fill={c.core} 
                 filter={theme === 'neon' || theme === 'obsidian' ? 'url(#glow)' : undefined}
                 stroke={c.bg}
                 strokeWidth="2"
               />
             </g>
          </g>
         );
      
      // ... keep other cases if needed, but we focus on V1 and V5
      default: return null;
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} title={`B21 ${variant} ${theme}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none drop-shadow-2xl"
      >
        <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="bevel" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
              <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.5" specularExponent="10" lightingColor="white" result="specOut">
                <fePointLight x="-5000" y="-10000" z="20000"/>
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
              <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
            </filter>
        </defs>

        {/* Background - Removed Circle */}
        {/* <circle cx="256" cy="256" r="256" fill={c.bg} /> */}
        
        {/* Rim Light for V5/Obsidian - Removed Circle */}
        {/* <circle cx="256" cy="256" r="252" stroke={c.accent} strokeWidth={variant === 'v5' ? 4 : 2} opacity={theme === 'obsidian' ? 0.6 : 0.3} filter={theme === 'obsidian' ? 'url(#glow)' : undefined} /> */}
        
        {renderContent()}

      </svg>
    </div>
  );
}
