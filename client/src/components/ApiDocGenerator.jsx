import React, { useState } from 'react';
import { BookOpen, Play, Check, Copy, AlertTriangle, FileCode, Terminal, Lock, Unlock } from 'lucide-react';

export default function ApiDocGenerator() {
  const [routeCode, setRouteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [shake, setShake] = useState(false);

  const examples = [
    {
      label: 'Node.js login route',
      code: `app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email } });
});`
    },
    {
      label: 'Python Flask route',
      code: `@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid password'}), 401
    token = create_access_token(identity=user.id)
    return jsonify({'token': token, 'user': {'id': user.id, 'email': user.email}})`
    },
    {
      label: 'PHP Laravel route',
      code: `// routes/api.php
// Route::post('/api/users/login', [AuthController::class, 'login']);

public function login(Request $request) {
    $request->validate(['email' => 'required|email', 'password' => 'required']);
    $user = User::where('email', $request->email)->first();
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Invalid credentials'], 401);
    }
    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json(['token' => $token, 'user' => $user]);
}`
    }
  ];

  const handleExampleClick = (code) => {
    setRouteCode(code);
    setError(null);
  };

  const handleCopyMarkdown = () => {
    if (!result) return;

    let md = `# \`${result.method}\` ${result.endpoint}\n\n`;
    if (result.language) {
      md += `**Detected Stack/Language:** ${result.language}\n\n`;
    }
    md += `${result.description}\n\n`;
    md += `**Authentication Required:** ${result.authRequired ? 'Yes 🔒' : 'No 🔓'}\n\n`;

    if (result.requestBody && Object.keys(result.requestBody).length > 0) {
      md += `### Request Body\n\n`;
      md += `| Field | Type |\n`;
      md += `| :--- | :--- |\n`;
      Object.entries(result.requestBody).forEach(([key, val]) => {
        md += `| \`${key}\` | ${val} |\n`;
      });
      md += `\n`;
    }

    if (result.queryParams && Object.keys(result.queryParams).length > 0) {
      md += `### Query Parameters\n\n`;
      md += `| Parameter | Type |\n`;
      md += `| :--- | :--- |\n`;
      Object.entries(result.queryParams).forEach(([key, val]) => {
        md += `| \`${key}\` | ${val} |\n`;
      });
      md += `\n`;
    }

    md += `### Success Response\n\n`;
    md += `- **Status Code:** \`${result.successResponse.statusCode}\`\n`;
    md += `- **Response Body:**\n`;
    md += `\`\`\`json\n`;
    md += `${JSON.stringify(result.successResponse.body, null, 2)}\n`;
    md += `\`\`\`\n\n`;

    if (result.errorResponses && result.errorResponses.length > 0) {
      md += `### Error Responses\n\n`;
      md += `| Status Code | Reason |\n`;
      md += `| :--- | :--- |\n`;
      result.errorResponses.forEach(err => {
        md += `| \`${err.statusCode}\` | ${err.reason} |\n`;
      });
      md += `\n`;
    }

    md += `### cURL Example\n\n`;
    md += `\`\`\`bash\n`;
    md += `${result.curlExample}\n`;
    md += `\`\`\`\n\n`;

    md += `---\n`;
    md += `*API Documentation generated with DevMate AI*\n`;

    navigator.clipboard.writeText(md).then(() => {
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    });
  };

  const handleCopyCurl = () => {
    if (!result || !result.curlExample) return;
    navigator.clipboard.writeText(result.curlExample).then(() => {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!routeCode.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const prompt = `You are a senior backend engineer writing API documentation. First, detect the programming language and framework used in this code (e.g. Node.js/Express, Python/Flask, Python/Django, PHP/Laravel, Java/Spring, etc). Then analyze the route handler and return ONLY JSON (no markdown, no backticks):

Code:
\`\`\`
${routeCode}
\`\`\`

{
  "language": "detected language and framework, e.g. 'Python (Flask)'",
  "method": "POST|GET|PUT|DELETE",
  "endpoint": "/api/path",
  "description": "one line description of what this endpoint does",
  "authRequired": true,
  "requestBody": { "fieldName": "type (required/optional)" },
  "queryParams": { "paramName": "type (required/optional)" },
  "successResponse": { "statusCode": 200, "body": { "exampleField": "exampleValue" } },
  "errorResponses": [
    { "statusCode": 404, "reason": "explanation" }
  ],
  "curlExample": "full curl command as a single string"
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
    if (l.includes('python') || l.includes('flask') || l.includes('django')) return '🐍';
    if (l.includes('node') || l.includes('express') || l.includes('javascript') || l.includes('typescript')) return '🟢';
    if (l.includes('php') || l.includes('laravel')) return '🐘';
    if (l.includes('java') || l.includes('spring')) return '☕';
    return '💻';
  };

  const getMethodBadgeStyles = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'POST':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700/50';
    }
  };

  const hasRequestBody = result?.requestBody && Object.keys(result.requestBody).length > 0;
  const hasQueryParams = result?.queryParams && Object.keys(result.queryParams).length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-200 mb-2">
          <BookOpen size={20} className="text-indigo-400" />
          API Documentation Generator
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Paste an API route or endpoint handler from any language (Node.js, Python, PHP, Java...) to automatically generate structured API documentation, including request/response examples and cURL commands.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={shake ? 'animate-shake' : ''}>
            <textarea
              value={routeCode}
              onChange={(e) => {
                setRouteCode(e.target.value);
                if (e.target.value.trim()) setError(null);
              }}
              disabled={loading}
              placeholder="Paste your API route definition, controller/handler function, or both (e.g. Node.js, Python, PHP, Laravel...)"
              className="w-full h-64 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono text-xs leading-relaxed resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-semibold block mb-2 uppercase tracking-wider">Examples:</span>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExampleClick(ex.code)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:border-slate-700 active:scale-[0.98] transition-all"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg whitespace-nowrap shrink-0 ${
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
                  <span>Analyzing the route...</span>
                </>
              ) : (
                <>
                  <Play size={15} className="fill-white" />
                  <span>Generate Documentation</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-slide-up">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6 border-t border-slate-800/80 pt-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
                Generated API Documentation
              </h3>

              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
              >
                {copiedMarkdown ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy as Markdown</span>
                  </>
                )}
              </button>
            </div>

            {/* Method, Endpoint, and Auth */}
            <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-md tracking-wider ${getMethodBadgeStyles(result.method)}`}>
                  {result.method || 'GET'}
                </span>
                <span className="font-mono text-sm md:text-base font-extrabold text-slate-100 leading-relaxed select-all">
                  {result.endpoint}
                </span>

                {result.language && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800/80 flex items-center gap-1 font-sans">
                    {getLanguageIcon(result.language)} {result.language}
                  </span>
                )}
                
                {result.authRequired ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1">
                    <Lock size={10} className="stroke-[2.5]" />
                    Auth Required
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 flex items-center gap-1">
                    <Unlock size={10} className="stroke-[2.5]" />
                    Public Route
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {result.description}
              </p>
            </div>

            {/* Request Body parameters */}
            {hasRequestBody && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FileCode size={14} className="text-indigo-400" />
                  Request Body Payload
                </h5>
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2 shadow-inner font-mono text-xs text-slate-300">
                  <div className="text-slate-500 font-bold border-b border-slate-900 pb-2 mb-2 grid grid-cols-2">
                    <span>Field Name</span>
                    <span>Type / Requirement</span>
                  </div>
                  {Object.entries(result.requestBody).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 py-1 border-b border-slate-900/40 last:border-b-0">
                      <span className="text-indigo-400 font-bold">{key}</span>
                      <span className="text-slate-400">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query parameters */}
            {hasQueryParams && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FileCode size={14} className="text-indigo-400" />
                  Query Parameters
                </h5>
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2 shadow-inner font-mono text-xs text-slate-300">
                  <div className="text-slate-500 font-bold border-b border-slate-900 pb-2 mb-2 grid grid-cols-2">
                    <span>Parameter</span>
                    <span>Type / Requirement</span>
                  </div>
                  {Object.entries(result.queryParams).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 py-1 border-b border-slate-900/40 last:border-b-0">
                      <span className="text-indigo-400 font-bold">{key}</span>
                      <span className="text-slate-400">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Response */}
            {result.successResponse && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Success Response</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Status {result.successResponse.statusCode}
                    </span>
                  </div>
                  <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto leading-relaxed max-h-60">
                    {JSON.stringify(result.successResponse.body, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Error Responses */}
            {result.errorResponses && result.errorResponses.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Error Responses</h5>
                <div className="space-y-2">
                  {result.errorResponses.map((err, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-900 rounded-xl shadow-inner">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                        Status {err.statusCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 leading-relaxed">
                        {err.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* cURL Example */}
            {result.curlExample && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Terminal size={14} className="text-slate-400" />
                    cURL Example
                  </h5>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
                  >
                    {copiedCurl ? (
                      <>
                        <Check size={11} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied cURL!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy cURL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                  {result.curlExample}
                </pre>
              </div>
            )}

            {/* Time saved banner */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
              <p className="text-xs text-emerald-400/90 font-medium">
                ⚡ Documented in ~7 seconds — Manually writing API docs takes 10-15 minutes per endpoint
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
