'use client';

import React, { useEffect, useRef } from 'react';

type AdFormat = 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

interface AdContainerProps {
  slot: string;
  format?: AdFormat;
  layout?: 'display' | 'in-article';
  style?: React.CSSProperties;
  className?: string;
  label?: string; // e.g., "Advertisement" text
}

export default function AdContainer({
  slot,
  format = 'auto',
  style = {},
  className = '',
  label
}: AdContainerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !initialized.current) {
        // Check if the ad slot is already populated to avoid double-push errors
        if (adRef.current && adRef.current.innerHTML === '') {
           const adsbygoogle = (window as any).adsbygoogle || [];
           adsbygoogle.push({});
           initialized.current = true;
        }
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // Default styles to prevent Layout Shift (CLS)
  const defaultStyles: React.CSSProperties = {
    display: 'block',
    minHeight: format === 'horizontal' ? '90px' : format === 'rectangle' ? '250px' : 'auto',
    overflow: 'hidden',
    ...style,
  };

  // We allow rendering even without ENV var for development preview (it will just show blank space)
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div className={`flex flex-col items-center gap-1 my-4 ${className}`}>
      {label && (
        <span className="text-[10px] uppercase tracking-widest text-slate-500">
          {label}
        </span>
      )}
      <div className="bg-slate-900/30 rounded-lg overflow-hidden w-full flex justify-center">
        {clientId ? (
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={defaultStyles}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        ) : (
            // Placeholder for development
            <div 
                style={{...defaultStyles, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}} 
                className="bg-slate-800/50 text-slate-500 text-xs border border-dashed border-slate-600"
            >
                Ad Space ({format}) - Slot: {slot}
            </div>
        )}
      </div>
    </div>
  );
}
