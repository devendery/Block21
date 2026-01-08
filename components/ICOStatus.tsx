"use client";

import { useEffect, useState } from "react";
import { getICOStatus } from "@/lib/api";

export interface Status {
  round: number;
  total: number;
  remaining: number;
}

interface ICOStatusProps {
    status?: Status;
}

export default function ICOStatus({ status: propStatus }: ICOStatusProps) {
  const [status, setStatus] = useState<Status | null>(propStatus || null);

  useEffect(() => {
    if (propStatus) {
        setStatus(propStatus);
        return;
    }

    getICOStatus().then(setStatus);
    const interval = setInterval(() => {
        getICOStatus().then(setStatus);
    }, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [propStatus]);

  if (!status) return <div className="animate-pulse h-24 bg-gray-900 rounded-lg"></div>;

  const progress = ((status.total - status.remaining) / status.total) * 100;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-heading font-bold mb-4 text-center">ICO Round {status.round} Status</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-400">
            <span>Remaining Supply</span>
            <span className="font-mono text-white">{status.remaining.toLocaleString('en-US')} B21</span>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>{progress.toFixed(1)}% Sold</span>
            <span>100%</span>
        </div>

        <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
                Hard Cap: $2,520 • Price: $0.012 = 1 B21
            </p>
        </div>
      </div>
    </div>
  );
}
