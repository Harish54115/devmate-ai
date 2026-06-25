import React from 'react';
import { Terminal, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="mb-8 border-b border-slate-800/80 pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
              <Terminal size={22} className="stroke-[2.5]" />
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              DevMate AI
            </h1>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Multi-Stack Powered
              </span>
            </div>
          </div>
          
          <p className="mt-2 text-slate-400 text-sm md:text-base font-medium">
            Your daily engineering assistant — saves ~2 hours every day
          </p>
        </div>

        <div className="hidden lg:block text-right">
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Hackathon Edition</div>
          <div className="text-sm font-semibold text-indigo-400/80 mt-0.5">Version 1.0.0</div>
        </div>
      </div>
    </header>
  );
}
