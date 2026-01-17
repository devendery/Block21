import React from 'react';
import { BarChart3, MessageCircle, Settings, HelpCircle } from 'lucide-react';

export default function ArenaFooter() {
  return (
    <>
      {/* Bottom Left Utilities */}
      <div className="fixed bottom-4 left-4 flex gap-3 z-20">
        <button className="w-12 h-12 bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl border-b-4 border-[#1d4ed8] active:border-b-0 active:translate-y-1 text-white flex items-center justify-center shadow-lg transition-all">
            <BarChart3 className="w-6 h-6" />
        </button>
        <button className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 text-[#3b82f6] flex items-center justify-center shadow-lg transition-all">
            <MessageCircle className="w-6 h-6 fill-current" />
        </button>
      </div>

      {/* Bottom Right Utilities */}
      <div className="fixed bottom-4 right-4 flex gap-3 z-20">
        <button className="w-12 h-12 bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl border-b-4 border-[#1d4ed8] active:border-b-0 active:translate-y-1 text-white flex items-center justify-center shadow-lg transition-all">
            <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Help Tab */}
      <div className="fixed top-1/2 right-0 -translate-y-1/2 translate-x-1/2 hover:translate-x-0 transition-transform z-30">
        <button className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center border border-white/20">
            <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
