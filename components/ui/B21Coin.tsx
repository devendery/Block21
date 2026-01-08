import React from "react";

export default function B21Coin({ className = "", size = 300 }: { className?: string, size?: number }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        <defs>
          {/* Gold Gradients */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF953F" />
            <stop offset="25%" stopColor="#FCF6BA" />
            <stop offset="50%" stopColor="#B38728" />
            <stop offset="75%" stopColor="#FBF5B7" />
            <stop offset="100%" stopColor="#AA771C" />
          </linearGradient>
          <radialGradient id="goldRadial" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
            <stop offset="0%" stopColor="#FFFACD" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#B38728" stopOpacity="0" />
          </radialGradient>

          {/* Platinum/Silver Gradients */}
          <linearGradient id="platinumGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E5E4E2" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#C0C0C0" />
            <stop offset="100%" stopColor="#E5E4E2" />
          </linearGradient>

          {/* Antique Texture Filter */}
          <filter id="antiqueFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
            <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
          </filter>

          {/* Emboss Filter for Text */}
          <filter id="emboss">
             <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
             <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="20" lightingColor="#white" result="specOut">
                <fePointLight x="-5000" y="-10000" z="20000"/>
             </feSpecularLighting>
             <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
             <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
             <feMerge>
                <feMergeNode in="litPaint"/>
             </feMerge>
          </filter>

           <path id="textCircle" d="M 200, 200 m -165, 0 a 165,165 0 1,1 330,0 a 165,165 0 1,1 -330,0" />
        </defs>

        {/* 1. Outer Platinum Rim */}
        <circle cx="200" cy="200" r="198" fill="url(#platinumGradient)" stroke="#888" strokeWidth="1" />
        <circle cx="200" cy="200" r="190" fill="#1a1a1a" /> {/* Groove */}

        {/* 2. Main Gold Face */}
        <circle cx="200" cy="200" r="188" fill="url(#goldGradient)" />
        <circle cx="200" cy="200" r="188" fill="url(#goldRadial)" style={{ mixBlendMode: 'overlay' }} />
        
        {/* Texture Overlay */}
        <circle cx="200" cy="200" r="188" fill="url(#goldGradient)" filter="url(#antiqueFilter)" opacity="0.3" />

        {/* 3. Perimeter Engravings */}
        <text fontSize="9.5" fontWeight="bold" fill="#3E2723" style={{ textShadow: "1px 1px 0px rgba(255,255,255,0.4)" }} letterSpacing="1.2">
          <textPath href="#textCircle" startOffset="50%" textAnchor="middle">
             2009: GENESIS BLOCK • 1 BTC = $0.00076 (OCT 2009) • 10,000 BTC = 2 PIZZAS (MAY 2010) • MAX SUPPLY: 21M BTC •
          </textPath>
        </text>

        {/* 4. Inner Ring (Silver/Platinum) */}
        <circle cx="200" cy="200" r="115" fill="none" stroke="url(#platinumGradient)" strokeWidth="4" filter="url(#emboss)" />
        <circle cx="200" cy="200" r="113" fill="none" stroke="#5c4033" strokeWidth="0.5" opacity="0.5" />

        {/* 5. Center Motif Background (Subtle Map/Network) */}
        <g opacity="0.1">
           <circle cx="200" cy="200" r="100" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="4 4" />
           <path d="M150 150 L250 250 M250 150 L150 250" stroke="#000" strokeWidth="1" />
        </g>

        {/* 6. Central B21 Symbol */}
        <g transform="translate(130, 110) scale(1.4)" filter="url(#emboss)">
           {/* The "B" Body */}
           <path d="M40 10 H80 C100 10 110 20 110 40 C110 55 100 65 90 65 C105 65 115 75 115 95 C115 120 100 130 80 130 H40 V10 Z" 
                 fill="url(#goldGradient)" stroke="#5c4033" strokeWidth="1" />
           
           {/* Inner Holes of B */}
           <path d="M60 30 H80 C90 30 90 35 90 40 C90 45 90 50 80 50 H60 V30 Z" fill="#b8860b" opacity="0.6" />
           <path d="M60 70 H80 C95 70 95 80 95 95 C95 105 90 110 80 110 H60 V70 Z" fill="#b8860b" opacity="0.6" />

           {/* The "21" Integrated */}
           {/* We can stylize the vertical strokes to look like 2 and 1 or overlay them */}
           
           {/* Dollar/Vertical Bars (Platinum) */}
           <rect x="68" y="0" width="6" height="140" fill="url(#platinumGradient)" rx="3" stroke="#333" strokeWidth="0.5" />
           <rect x="82" y="0" width="6" height="140" fill="url(#platinumGradient)" rx="3" stroke="#333" strokeWidth="0.5" />
           
           {/* 21 Overlay or Integration */}
           <text x="30" y="85" fontSize="40" fontWeight="900" fill="url(#platinumGradient)" stroke="#333" strokeWidth="0.5" transform="rotate(-90 30 85)">21</text>
        </g>
        
        {/* Shine/Reflection */}
        <circle cx="200" cy="200" r="188" fill="url(#goldRadial)" style={{ mixBlendMode: 'soft-light' }} pointerEvents="none" />
      </svg>
    </div>
  );
}