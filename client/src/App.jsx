import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import TimeEstimator from './components/TimeEstimator';
import CodeReview from './components/CodeReview';
import ApiDocGenerator from './components/ApiDocGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState('estimator');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'estimator':
        return <TimeEstimator />;
      case 'review':
        return <CodeReview />;
      case 'api-docs':
        return <ApiDocGenerator />;
      default:
        return <TimeEstimator />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden select-none px-4 md:px-8 py-6">
      
      {/* Decorative premium radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[30%] -right-[10%] w-[350px] h-[350px] bg-violet-650/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] -left-[10%] w-[350px] h-[350px] bg-indigo-650/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="w-full max-w-6xl mx-auto z-10 flex-grow">
        {/* Header Section */}
        <Header />

        {/* Tab Controls */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Panel Content */}
        <main className="mb-16">
          {renderTabContent()}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900/80 mt-auto py-6 text-center z-10">
        <p className="text-slate-500 hover:text-slate-400 text-xs font-semibold tracking-wide transition-colors">
          DevMate AI &middot; Your daily engineering assistant
        </p>
      </footer>
    </div>
  );
}
