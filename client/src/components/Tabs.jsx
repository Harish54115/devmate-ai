import React from 'react';
import { Clock, ShieldAlert, BookOpen } from 'lucide-react';

export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'estimator', label: 'Time Estimator', icon: Clock },
    { id: 'review', label: 'Code Review', icon: ShieldAlert },
    { id: 'api-docs', label: 'API Docs', icon: BookOpen }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex p-1.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-inner backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-md shadow-slate-950/40 border border-slate-700/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon size={16} className={`transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
