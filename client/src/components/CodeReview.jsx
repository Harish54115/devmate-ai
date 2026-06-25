import React, { useState } from 'react';
import { ShieldAlert, Play, Check, Copy, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';

export default function CodeReview() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);

  const sampleVulnerableCode = `app.get('/user/:id', async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE id = ' + req.params.id);
  res.json(user);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = "' + email + '"', (err, results) => {
    if (results[0].password == password) {
      res.json({ success: true, token: results[0].id });
    }
  });
});`;

  const handleSampleClick = () => {
    setCode(sampleVulnerableCode);
    setError(null);
  };

  const handleCopy = () => {
    if (!result) return;

    let markdown = `### 🛡️ DevMate AI Code Review Report\n`;
    if (result.language) {
      markdown += `**Stack/Language:** ${result.language}\n`;
    }
    markdown += `**Score:** ${result.score}/100\n`;
    markdown += `**Assessment:** ${result.summary}\n`;
    markdown += `**Manual Review Time Saved:** ${result.timeSaved}\n\n`;

    markdown += `#### ⚠️ Key Issues Identified\n`;
    markdown += `${result.issues.map(i => `- **[${i.severity} Severity]** Line \`${i.line}\`: ${i.issue}\n  *Fix:* ${i.fix}`).join('\n')}\n\n`;

    markdown += `#### 🟢 Positive Elements Observed\n`;
    markdown += `${result.positives.map(p => `- ${p}`).join('\n')}\n\n`;

    markdown += `*Generated via DevMate AI*`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const prompt = `You are a senior engineer doing a thorough code review. First, detect the programming language and framework/library used in this code (e.g. React, Node.js/Express, PHP/WordPress, PHP/Laravel, Python/Flask, Python/Django, etc). Focus specifically on syntax and compilation errors (e.g. missing brackets, unclosed HTML/JSX tags, invalid imports), security vulnerabilities (e.g. SQL/NoSQL injection, XSS, CSRF), common bugs, error handling, performance issues, hardcoded secrets, and framework-specific best practices. Return ONLY JSON (no markdown, no backticks):

Code:
\`\`\`
${code}
\`\`\`

{
  "language": "detected language and framework/library, e.g. 'React' or 'PHP (WordPress)'",
  "score": 35,
  "summary": "one line overall assessment",
  "issues": [
    {"severity": "High|Medium|Low", "line": "line reference or 'general'", "issue": "what is wrong", "fix": "how to fix it with language/framework specific solution"}
  ],
  "positives": ["good thing 1"],
  "timeSaved": "X minutes vs manual review"
}`;

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

  // Score colors utility
  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-400', border: 'stroke-emerald-500', bg: 'bg-emerald-500/10', borderLight: 'border-emerald-500/20' };
    if (score >= 60) return { text: 'text-amber-400', border: 'stroke-amber-500', bg: 'bg-amber-500/10', borderLight: 'border-amber-500/20' };
    return { text: 'text-rose-400', border: 'stroke-rose-500', bg: 'bg-rose-500/10', borderLight: 'border-rose-500/20' };
  };

  const scoreColors = result ? getScoreColor(result.score) : null;
  const strokeDashoffset = result ? 251.2 - (251.2 * result.score) / 100 : 251.2;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-200 mb-2">
          <ShieldAlert size={20} className="text-indigo-400" />
          Code Review
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Submit your React, Node.js, PHP (Laravel/WordPress), Python, or other code for analysis on security vulnerabilities, common bugs, performance issues, and structural design.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={shake ? 'animate-shake' : ''}>
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (e.target.value.trim()) setError(null);
              }}
              disabled={loading}
              placeholder="// Paste your code here — any language (React, Node.js, PHP, WordPress, Laravel, Python...)"
              className="w-full h-64 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono text-xs leading-relaxed resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSampleClick}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:border-slate-700 active:scale-[0.98] transition-all"
            >
              Try sample vulnerable code
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg whitespace-nowrap shrink-0 ${
                loading
                  ? 'bg-indigo-750 text-indigo-200 cursor-not-allowed border border-indigo-700/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.99] border border-indigo-500/30'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Reviewing...</span>
                </>
              ) : (
                <>
                  <Play size={15} className="fill-white" />
                  <span>Review Code</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-slide-up">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && scoreColors && (
          <div className="mt-8 space-y-6 border-t border-slate-800/80 pt-6 animate-slide-up">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
                  Review Summary
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
                    <span>Copy Summary</span>
                  </>
                )}
              </button>
            </div>

            {/* Score donut & Assessment */}
            <div className={`p-6 rounded-2xl border ${scoreColors.borderLight} ${scoreColors.bg} flex flex-col sm:flex-row items-center gap-6 shadow-sm`}>
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="stroke-slate-950/40"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className={`${scoreColors.border} transition-all duration-1000 ease-out`}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{result.score}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                </div>
              </div>

              <div className="text-center sm:text-left space-y-1.5">
                <h4 className="text-base font-bold text-slate-100">Overall Assessment</h4>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                ⚠️ Issues Found ({result.issues ? result.issues.length : 0})
              </h4>
              {result.issues && result.issues.length > 0 ? (
                <div className="space-y-3">
                  {result.issues.map((issue, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3 shadow-inner hover:border-slate-800 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            issue.severity?.toLowerCase() === 'high'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                              : issue.severity?.toLowerCase() === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          }`}>
                            {issue.severity} Severity
                          </span>
                          <span className="font-mono text-xs text-indigo-400 flex items-center gap-1">
                            <FileCode size={12} />
                            Line: {issue.line}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-200 leading-relaxed">
                        {issue.issue}
                      </div>

                      <div className="pl-3.5 border-l-2 border-indigo-500/30 py-0.5 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Suggested Fix</div>
                        <div className="text-xs font-medium text-indigo-200 leading-relaxed font-mono bg-slate-950 p-2 rounded-lg border border-slate-900/50">
                          {issue.fix}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-900/20 border border-slate-800/40 rounded-xl text-center text-slate-500 text-xs font-semibold">
                  No critical issues found! Your code matches common JS standards.
                </div>
              )}
            </div>

            {/* Positives Box */}
            {result.positives && result.positives.length > 0 && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Good Practices Found
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-none pl-0">
                  {result.positives.map((positive, idx) => (
                    <li key={idx} className="flex items-center gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span className="text-slate-300 font-medium">{positive}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Time saved banner */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
              <p className="text-xs text-emerald-400/90 font-medium">
                ⚡ Reviewed in ~8 seconds — {result.timeSaved || 'Saves 15-20 min compared to manual inspection'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
