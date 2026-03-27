import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Lock, RefreshCw, Download, LogOut, ShieldCheck, ShieldAlert,
  BarChart2, Mail, CheckCircle2, AlertCircle, Eye, EyeOff, Send, Save,
} from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

type Tab = 'survey' | 'email-config';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('survey');

  // Countdown timer for lockout
  useEffect(() => {
    if (lockedUntil === null) return;
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setSecondsLeft(0);
        setLoginError('');
      } else {
        setSecondsLeft(remaining);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      setIsAuthenticated(true);
      setPassword('');
      setLoginError('');
      setLockedUntil(null);
    },
    onError: (err) => {
      const tooMany = err.message.startsWith('Too many failed attempts');
      if (tooMany) {
        const match = err.message.match(/(\d+)\s*second/);
        const secs = match ? parseInt(match[1], 10) : 15 * 60;
        setLockedUntil(Date.now() + secs * 1000);
        setLoginError('');
      } else {
        setLoginError(err.message || 'Login failed. Please try again.');
      }
    },
  });

  const { data: rawData = [], refetch } = trpc.admin.getSurveyResponses.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const data = rawData.map(row => ({
    'role-validation': row.roleValidation,
    'pain-point': row.painPoint,
    'feature-fit': row.featureFit,
    email: row.email,
    timestamp: row.createdAt.toISOString(),
  }));

  const isLocked = lockedUntil !== null && secondsLeft > 0;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setLoginError('');
    loginMutation.mutate({ password });
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const processData = (key: string) => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      const value = (item as Record<string, string | null>)[key];
      if (value) counts[value] = (counts[value] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Role Validation', 'Pain Point', 'Feature Fit', 'Email'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.timestamp,
        row['role-validation'],
        row['pain-point'],
        row['feature-fit'],
        row['email'],
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey_results.csv';
    a.click();
  };

  // ── Login screen ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#3B4A6B] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isLocked ? 'bg-red-500/20 text-red-300' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {isLocked ? <ShieldAlert size={32} /> : <Lock size={32} />}
            </div>
          </div>
          <h2 className="text-2xl font-serif text-white text-center mb-2">Admin Access</h2>
          {isLocked ? (
            <div className="text-center space-y-3">
              <p className="text-red-300 text-sm">Too many failed attempts. This IP is locked out.</p>
              <div className="bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-3">
                <p className="text-red-200 text-xs uppercase tracking-widest mb-1">Try again in</p>
                <p className="text-red-100 text-3xl font-mono font-bold">{formatCountdown(secondsLeft)}</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-indigo-300 text-sm text-center mb-6">Password is verified server-side.</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                  placeholder="Enter admin password"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400"
                  disabled={loginMutation.isPending}
                  autoFocus
                />
                {loginError && <p className="text-red-300 text-sm text-center">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loginMutation.isPending || !password}
                  className="w-full bg-white text-[#3B4A6B] font-semibold py-3 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loginMutation.isPending ? 'Verifying…' : <><ShieldCheck size={18} /> Login</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Authenticated dashboard ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#3B4A6B] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-serif">Admin Dashboard</h1>
          <div className="flex gap-3">
            {activeTab === 'survey' && (
              <>
                <button
                  onClick={() => refetch()}
                  className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors font-medium text-sm"
                >
                  <Download size={16} /> Export CSV
                </button>
              </>
            )}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-indigo-200 rounded-xl hover:bg-white/20 transition-colors font-medium text-sm"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-white/10 px-8">
        <div className="max-w-7xl mx-auto flex gap-1">
          {([
            { id: 'survey', label: 'Survey Results', icon: BarChart2 },
            { id: 'email-config', label: 'Email Configuration', icon: Mail },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-indigo-300 hover:text-white hover:border-white/30'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'survey' && <SurveyTab data={data} processData={processData} />}
        {activeTab === 'email-config' && <EmailConfigTab />}
      </div>
    </div>
  );
}

// ── Survey Results Tab ────────────────────────────────────────────────────────
function SurveyTab({
  data,
  processData,
}: {
  data: { 'role-validation': string | null | undefined; 'pain-point': string | null | undefined; 'feature-fit': string | null | undefined; email: string | null | undefined; timestamp: string }[];
  processData: (key: string) => { name: string; value: number }[];
}) {
  return (
    <div className="space-y-8">
      <p className="text-indigo-200">Total Responses: {data.length}</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
          <h3 className="text-xl font-serif mb-6">Biggest Starting Barrier</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processData('pain-point')}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} />
                <YAxis stroke="#cbd5e1" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                  {processData('pain-point').map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
          <h3 className="text-xl font-serif mb-6">Top Requested Feature</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processData('feature-fit')}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {processData('feature-fit').map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-serif">Recent Responses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-indigo-200">
              <tr>
                <th className="p-4 font-medium">Time</th>
                <th className="p-4 font-medium">Role Check</th>
                <th className="p-4 font-medium">Pain Point</th>
                <th className="p-4 font-medium">Feature</th>
                <th className="p-4 font-medium">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.slice().reverse().map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-indigo-300">{new Date(row.timestamp).toLocaleDateString()}</td>
                  <td className="p-4">{row['role-validation'] ?? '—'}</td>
                  <td className="p-4">{row['pain-point'] ?? '—'}</td>
                  <td className="p-4">{row['feature-fit'] ?? '—'}</td>
                  <td className="p-4 font-mono text-sm text-indigo-300">{row['email'] ?? '—'}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-indigo-300">No responses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Email Configuration Tab ───────────────────────────────────────────────────
function EmailConfigTab() {
  const { data: config, isLoading, refetch } = trpc.admin.getResendConfig.useQuery();

  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  // Pre-fill from email / name when config loads
  useEffect(() => {
    if (config) {
      setFromEmail(config.fromEmail);
      setFromName(config.fromName);
    }
  }, [config]);

  const saveMutation = trpc.admin.saveResendConfig.useMutation({
    onSuccess: () => {
      setSaveStatus('saved');
      setApiKey(''); // Clear the key field after saving for security
      refetch();
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: () => {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    },
  });

  const testMutation = trpc.admin.testResendEmail.useMutation({
    onSuccess: () => {
      setTestStatus('sent');
      setTimeout(() => setTestStatus('idle'), 5000);
    },
    onError: (err) => {
      setTestStatus('error');
      setTestError(err.message);
      setTimeout(() => { setTestStatus('idle'); setTestError(''); }, 6000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !fromEmail || !fromName) return;
    setSaveStatus('saving');
    saveMutation.mutate({ apiKey, fromEmail, fromName });
  };

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setTestStatus('sending');
    setTestError('');
    testMutation.mutate({ toEmail: testEmail });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-indigo-300">
        <RefreshCw size={20} className="animate-spin mr-3" /> Loading configuration…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Status banner */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${
        config?.apiKeyConfigured
          ? 'bg-green-500/10 border-green-500/20 text-green-300'
          : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
      }`}>
        {config?.apiKeyConfigured
          ? <><CheckCircle2 size={18} /> <span>Resend is configured. Current key: <span className="font-mono text-sm">{config.apiKeyMasked}</span></span></>
          : <><AlertCircle size={18} /> <span>Resend is not yet configured. Enter your credentials below to activate email reminders.</span></>
        }
      </div>

      {/* Credentials form */}
      <div className="bg-black/20 rounded-3xl border border-white/5 p-8">
        <h2 className="text-xl font-serif mb-1">Resend Credentials</h2>
        <p className="text-indigo-300 text-sm mb-6">
          Your API key and sender details are stored securely in the database.
          The key is never returned to the browser after saving.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1.5">
              Resend API Key
              {config?.apiKeyConfigured && (
                <span className="ml-2 text-xs text-green-400 font-normal">(a key is already saved — enter a new one to replace it)</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={config?.apiKeyConfigured ? 'Enter new key to replace…' : 're_xxxxxxxxxxxxxxxxxxxx'}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400 font-mono text-sm"
                required={!config?.apiKeyConfigured}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-indigo-400 mt-1.5">
              Find your API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-200">resend.com/api-keys</a>
            </p>
          </div>

          {/* Sender name */}
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1.5">Sender Name</label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Taskbloom"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400"
              required
            />
          </div>

          {/* Sender email */}
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1.5">Sender Email Address</label>
            <input
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="reminders@yourdomain.com"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400"
              required
            />
            <p className="text-xs text-indigo-400 mt-1.5">
              Must be a domain you have verified in Resend. Resend's free tier allows sending from any address on a verified domain.
            </p>
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending || (!apiKey && !!config?.apiKeyConfigured) || !fromEmail || !fromName}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {saveStatus === 'saving' ? (
              <><RefreshCw size={16} className="animate-spin" /> Saving…</>
            ) : saveStatus === 'saved' ? (
              <><CheckCircle2 size={16} /> Saved</>
            ) : saveStatus === 'error' ? (
              <><AlertCircle size={16} /> Save failed</>
            ) : (
              <><Save size={16} /> Save Configuration</>
            )}
          </button>
        </form>
      </div>

      {/* Test email form — only shown when a key is configured */}
      {config?.apiKeyConfigured && (
        <div className="bg-black/20 rounded-3xl border border-white/5 p-8">
          <h2 className="text-xl font-serif mb-1">Send a Test Email</h2>
          <p className="text-indigo-300 text-sm mb-6">
            Verify your Resend integration is working by sending a test email to any address.
          </p>
          <form onSubmit={handleTest} className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400"
              required
            />
            <button
              type="submit"
              disabled={testMutation.isPending || !testEmail}
              className="flex items-center gap-2 px-5 py-3 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              {testStatus === 'sending' ? (
                <><RefreshCw size={16} className="animate-spin" /> Sending…</>
              ) : testStatus === 'sent' ? (
                <><CheckCircle2 size={16} /> Email sent!</>
              ) : testStatus === 'error' ? (
                <><AlertCircle size={16} /> Failed</>
              ) : (
                <><Send size={16} /> Send Test</>
              )}
            </button>
          </form>
          {testStatus === 'sent' && (
            <p className="text-green-400 text-sm mt-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Test email delivered successfully. Your Resend integration is working.
            </p>
          )}
          {testStatus === 'error' && testError && (
            <p className="text-red-400 text-sm mt-3 flex items-center gap-1.5">
              <AlertCircle size={14} /> {testError}
            </p>
          )}
        </div>
      )}

      {/* Setup guide */}
      <div className="bg-black/10 rounded-2xl border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest mb-3">Setup Guide</h3>
        <ol className="space-y-2 text-sm text-indigo-300 list-decimal list-inside">
          <li>Sign up for a free account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-100">resend.com</a></li>
          <li>Add and verify your sending domain under <strong className="text-indigo-200">Domains</strong></li>
          <li>Create an API key under <strong className="text-indigo-200">API Keys</strong> with "Sending access"</li>
          <li>Paste the key and your verified sender email above, then click <strong className="text-indigo-200">Save Configuration</strong></li>
          <li>Use the test email form to confirm everything is working before activating reminders</li>
        </ol>
      </div>
    </div>
  );
}
