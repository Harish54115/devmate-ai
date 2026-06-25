import React, { useState } from 'react';
import { Clock, Play, AlertTriangle, Lightbulb, Check, Copy, Package, ShieldAlert } from 'lucide-react';

export default function TimeEstimator() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');

  const examples = [
    {
      label: 'E-Commerce Website',
      text: 'Create a fully-featured e-commerce website with user auth, cart management, checkout with payments, and an admin dashboard to manage catalog.'
    },
    {
      label: 'Real-Estate Portal',
      text: 'Build a real-estate search portal with property listings, advanced geographic filters, agent dashboards, and a scheduling book visits feature.'
    },
    {
      label: 'Multi-User Blog',
      text: 'Develop a blogging platform with role-based auth, post editor, category tags, nested comment threads, and automatic email digests.'
    }
  ];

  const getLanguageIcon = (lang) => {
    const l = lang?.toLowerCase() || '';
    if (l.includes('react')) return '⚛️';
    if (l.includes('wordpress')) return '📝';
    if (l.includes('laravel')) return '🐘';
    if (l.includes('php')) return '🐘';
    if (l.includes('python')) return '🐍';
    if (l.includes('node') || l.includes('express') || l.includes('javascript') || l.includes('typescript')) return '🟢';
    if (l.includes('java') || l.includes('spring')) return '☕';
    return '💻';
  };

  const getPackageHeader = (lang) => {
    const l = lang?.toLowerCase() || '';
    if (l.includes('react') || l.includes('node') || l.includes('javascript') || l.includes('typescript')) {
      return 'Suggested npm Packages';
    }
    if (l.includes('laravel') || l.includes('php')) {
      return 'Suggested Composer Packages';
    }
    if (l.includes('wordpress')) {
      return 'Suggested Plugins & Libraries';
    }
    if (l.includes('python')) {
      return 'Suggested pip Packages';
    }
    if (l.includes('java') || l.includes('spring')) {
      return 'Suggested Maven Dependencies';
    }
    return 'Suggested packages / libraries';
  };

  const handleExampleClick = (text) => {
    setInput(text);
    setError(null);
  };

  const handleCopy = () => {
    if (!result) return;
    
    let markdown = `### ⏱️ DevMate AI Time Estimate\n`;
    markdown += `**Requirement:** ${input}\n`;
    if (result.language) {
      markdown += `**Target Stack/Language:** ${result.language}\n`;
    }
    markdown += `**Total Estimate:** ${result.totalHours} hours (~${result.totalDays} days)\n\n`;
    
    markdown += `#### 📋 Task Breakdown\n`;
    markdown += `${result.breakdown.map(t => `- **${t.task}** (${t.complexity} Complexity) — *${t.hours}h*\n  *Description:* ${t.description || 'No description provided.'}`).join('\n')}\n\n`;
    
    markdown += `#### 📦 Suggested Packages/Libraries\n`;
    markdown += `${result.npmPackages.map(p => `- \`${p}\``).join('\n')}\n\n`;
    
    markdown += `#### ⚠️ Technical Challenges & Bottlenecks\n`;
    markdown += `${result.risks.map(r => `- ${r}`).join('\n')}\n\n`;
    
    markdown += `#### 💡 Senior Architect Advice\n`;
    markdown += `${result.recommendation}\n\n`;
    
    markdown += `*Generated via DevMate AI*`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const getPromptInstructions = () => {
      const selectionText = selectedLanguage === 'auto'
        ? "First, detect the target programming language and framework/library required by this feature (e.g. React, Node.js/Express, PHP/Laravel, PHP/WordPress, Python/Django/Flask, Java/Spring Boot, etc)."
        : `Estimate this feature specifically using the developer's selected stack: ${selectedLanguage}.`;

      return `You are a senior software architect doing project proposal estimations for clients. ${selectionText}

Strict Guidelines for Estimation & Breakdown:
1. Divide the project into logical, functional milestones/phases arranged step-by-step (e.g., 'Phase 1: Setup & Initial Architecture', 'Phase 2: Core Storefront Features', 'Phase 3: Checkout & Integrations', 'Phase 4: Admin Backoffice & QA'). Do NOT list generic technical layers like 'Frontend UI' or 'Database setup' as standalone tasks.
2. Account for built-in vs manual coding overhead based on the target stack/language:
   - PHP (WordPress): Highly plugin-driven. The estimate must focus on installation, plugins (like WooCommerce or custom search), theme styling (CSS), custom hooks, settings configuration, and shipping/payment gateways. Hours must be much shorter (typically 30-70 hours total for a standard site, or 80-120 hours for complex sites) since features are not custom-coded from scratch.
   - PHP (Laravel) / Python (Django): Moderate overhead. Leverage built-in scaffolding (like Laravel Breeze/Sanctum or Django admin/ORM). Focus tasks on database migrations, custom controller endpoints, business services, and API controllers. Total hours should range between 120-220 hours.
   - Java (Spring Boot): High overhead. Require writing custom class configurations, manual JPA entities, custom Spring Security filters, DTO objects, and controller logic from scratch. Total hours should scale higher (typically 240-400+ total hours).
   - React (Frontend-only): Focus on custom React components, router structures, state management (Redux/Context), styled components, form validation, and mock API connectivity.
3. Analyze Benchmark Platforms & Archetypes:
   - If the requirement references a complex platform (e.g., 'like Meesho', 'like Amazon', 'like Uber', 'like Airbnb', 'like Oyo', 'like Instagram', 'like WhatsApp'), do NOT treat it as a standard website. You must identify the unique core architectures required for that specific benchmark (e.g., multi-vendor seller interfaces, reseller margin margins sharing, geolocational mapping and routing, real-time socket connections, escrow payments).
   - Scale the total hours realistically to a full product build. For example, a custom-coded Meesho clone should range between **800 to 1200+ total hours** (100-150 days) on Java/Node/Laravel, and **160-250 hours** on WordPress using WooCommerce + Multi-vendor plugins.
   - Expand the task checklist to output 8 to 10 highly detailed sequential steps representing these advanced components.
4. Ignore Placeholder Anchors:
   - Do NOT let the small hours (e.g., 16 or 28 hours) in the JSON template below anchor your estimates. Make the totals represent a realistic engineering proposal.
5. Under the 'description' key in each breakdown item, write a thorough, detailed explanation of what database tables/models, API routes, security mechanisms, and frontend screens are implemented in that step, explaining why the hours were allocated. Mention stack-specific tools (e.g. Eloquent ORM, Redux, JWT, wp hooks, Spring Security, etc.) where appropriate.

Return ONLY JSON (no markdown, no backticks):

Requirement: "${input.replace(/"/g, '\\"')}"

{
  "language": "detected or selected language and framework/library, e.g. 'PHP (Laravel)'",
  "breakdown": [
    {
      "task": "Phase/Module Name (e.g., 'Phase 1: Setup & Database Schema')", 
      "hours": 16, 
      "complexity": "Low|Medium|High",
      "description": "Thorough, clear explanation of the database schemas, API routes, security guards, and UI views implemented in this module."
    }
  ],
  "totalHours": 28,
  "totalDays": 3.5,
  "npmPackages": ["library-or-package-1", "library-or-package-2"],
  "risks": ["2-3 highly specific technical challenges or implementation bottlenecks unique to this project requirement (e.g. 'Stripe webhook concurrency handling' or 'Heavy image optimization pipeline'). Do NOT return generic terms like 'Security vulnerabilities' or 'Performance issues'."],
  "recommendation": "1 specific, actionable senior architecture recommendation tailored strictly to this stack and project requirement (e.g. 'Use Redis for cart session caching' or 'Implement Spatie package for role management'). Avoid generic advice like 'use a microservices architecture'."
}`;
    };

    const prompt = getPromptInstructions();

    try {
      const response = await fetch('http://localhost:5000/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const resData = await response.json();
      if (resData.success) {
        setResult(resData.data);
      } else {
        setError(resData.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please check if backend server is running on port 5000 and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-200 mb-2">
          <Clock size={20} className="text-indigo-400" />
          Time Estimator
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Paste your product feature requirements (supporting React, Node.js, PHP, Python...) to get a detailed development breakdown, timeline, risk list, and recommended libraries.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={shake ? 'animate-shake' : ''}>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.trim()) setError(null);
              }}
              disabled={loading}
              placeholder="e.g. Build a Laravel user authentication REST API, or a React dashboard with charts, or a WordPress plugin for SEO..."
              className="w-full h-32 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm font-medium leading-relaxed resize-none"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:w-auto flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap">Target Stack:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={loading}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all cursor-pointer font-semibold"
              >
                <option value="auto">✨ Auto-Detect Stack</option>
                <option value="React">⚛️ React (Frontend Only)</option>
                <option value="Node.js (Express)">🟢 Node.js (Express - Backend)</option>
                <option value="PHP (Laravel)">🐘 PHP (Laravel - Full-Stack)</option>
                <option value="PHP (WordPress)">📝 PHP (WordPress - CMS)</option>
                <option value="Python (Flask/Django)">🐍 Python (Flask/Django - Backend)</option>
                <option value="Java (Spring Boot)">☕ Java (Spring Boot - Backend/Full-Stack)</option>
              </select>
            </div>

            <div className="w-full md:w-auto">
              <span className="text-xs text-slate-500 font-semibold block mb-2 uppercase tracking-wider">Examples:</span>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExampleClick(ex.text)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:border-slate-700 active:scale-[0.98] transition-all"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg whitespace-nowrap shrink-0 ${
              loading
                ? 'bg-indigo-750 text-indigo-200 cursor-not-allowed border border-indigo-700/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.99] border border-indigo-500/30'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing requirement...</span>
              </>
            ) : (
              <>
                <Play size={16} className="fill-white" />
                <span>Generate Time Estimate</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-slide-up">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6 border-t border-slate-800/80 pt-6 animate-slide-up">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
                  Estimated Breakdown
                </h3>
                {result.language && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800/80 flex items-center gap-1 font-sans">
                    {getLanguageIcon(result.language)} {result.language}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            </div>

            {/* Tasks list */}
            <div className="bg-slate-950/50 rounded-2xl border border-slate-900 overflow-hidden divide-y divide-slate-900/60">
              {result.breakdown && result.breakdown.map((t, idx) => (
                <div key={idx} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-900/25 transition-colors">
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-slate-200">{t.task}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.complexity?.toLowerCase() === 'high' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' 
                          : t.complexity?.toLowerCase() === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                      }`}>
                        {t.complexity}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-bold text-indigo-400 whitespace-nowrap bg-indigo-500/5 border border-indigo-500/10 px-3 py-1.5 rounded-xl self-start md:self-auto shrink-0">
                    {t.hours} hrs
                  </div>
                </div>
              ))}
              
              {/* Total row */}
              <div className="p-4 bg-slate-900/40 flex items-center justify-between text-base font-bold text-slate-100">
                <span>Total estimate:</span>
                <span className="text-indigo-400">
                  {result.totalHours}h / {result.totalDays} days
                </span>
              </div>
            </div>

            {/* Extra details (npm packages, risks, recommendations) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Packages */}
              <div className="p-4 bg-slate-900/40 border border-slate-800/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Package size={14} className="text-indigo-400" />
                  {result.language ? getPackageHeader(result.language) : 'Suggested packages / libraries'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.npmPackages && result.npmPackages.map((pkg, idx) => (
                    <span key={idx} className="font-mono text-xs px-2 py-1 bg-slate-950/80 border border-slate-800 rounded-md text-slate-300">
                      {pkg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Risks */}
              {/* Technical Challenges & Bottlenecks */}
              <div className="p-4 bg-slate-900/40 border border-slate-800/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <AlertTriangle size={14} className="text-amber-400" />
                  Technical Challenges & Bottlenecks
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-none pl-0">
                  {result.risks && result.risks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation info box */}
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-3 items-start">
              <Lightbulb size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Senior Architect Advice</div>
                <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                  {result.recommendation}
                </p>
              </div>
            </div>

            {/* Time saved banner */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
              <p className="text-xs text-emerald-400/90 font-medium">
                ⚡ Generated in ~10 seconds — Manual estimation usually takes 20-30 min in a planning meeting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
