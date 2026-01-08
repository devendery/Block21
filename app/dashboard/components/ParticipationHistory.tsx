"use client";

import { useState, useEffect } from "react";
import { CheckCircle, ExternalLink, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { GOOGLE_SCRIPT_URL } from "@/lib/utils";

interface HistoryItem {
    date: string;
    wallet: string;
    usdt: number;
    tokens: number;
    txHash: string;
    status?: string;
}

export default function ParticipationHistory({ data = [], loading = false, onRefresh }: { data?: HistoryItem[], loading?: boolean, onRefresh?: () => void }) {
    
    return (
        <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-white">Recent Participations</h3>
                <button 
                    onClick={onRefresh} 
                    disabled={loading}
                    className="p-2 glass-panel hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {data.map((item, i) => (
                    <div key={i} className="glass-panel p-6 flex justify-between items-center group hover:bg-white/5 transition-all">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xl font-bold text-white">{parseFloat(item.tokens.toString()).toLocaleString()} B21</span>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border flex items-center gap-1 ${
                                    (item.status || "PENDING").toLowerCase() === 'confirmed' 
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>
                                    {(item.status || "PENDING").toLowerCase() === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {item.status || "PENDING"}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span suppressHydrationWarning={true}>
                                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parseFloat(item.usdt.toString()))} USDT
                                </span>
                                <span>•</span>
                                <span suppressHydrationWarning={true}>
                                    {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }).format(new Date(item.date))}
                                </span>
                            </div>
                        </div>
                        <div className="w-full sm:w-auto text-left sm:text-right flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                            <a 
                                href={`https://polygonscan.com/tx/${item.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors justify-end group-hover:translate-x-1 duration-300"
                            >
                                View <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="text-xs text-gray-600 font-mono mt-1" title={item.wallet}>
                                {item.wallet.substring(0, 6)}...{item.wallet.substring(item.wallet.length - 4)}
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Empty State */}
                {!loading && history.length === 0 && (
                    <div className="text-center py-12 text-gray-500 glass-panel border-dashed">
                        No recent participation found. Be the first!
                    </div>
                )}

                {loading && history.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Loading history...
                    </div>
                )}
            </div>
        </div>
    );
}
