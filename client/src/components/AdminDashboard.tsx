import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Lock, RefreshCw, Download, LogOut, ShieldCheck } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Server-side login: password is sent to the server and compared against
  // the ADMIN_PASSWORD environment variable — never exposed in the bundle.
  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      setIsAuthenticated(true);
      setPassword('');
      setLoginError('');
    },
    onError: (err) => {
      setLoginError(err.message === 'Incorrect password.' ? 'Incorrect password — please try again.' : 'Login failed. Please try again.');
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    loginMutation.mutate({ password });
  };

  const processData = (key: string) => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      const value = (item as Record<string, string | null>)[key];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
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
        row['email']
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey_results.csv';
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#3B4A6B] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-300">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-serif text-white text-center mb-2">Admin Access</h2>
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
            {loginError && (
              <p className="text-red-300 text-sm text-center">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginMutation.isPending || !password}
              className="w-full bg-white text-[#3B4A6B] font-semibold py-3 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? 'Verifying…' : <><ShieldCheck size={18} /> Login</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3B4A6B] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif mb-2">Survey Results</h1>
            <p className="text-indigo-200">Total Responses: {data.length}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => refetch()}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors font-medium"
            >
              <Download size={20} /> Export CSV
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-indigo-200 rounded-xl hover:bg-white/20 transition-colors font-medium"
              title="Log out"
            >
              <LogOut size={20} /> Log out
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Pain Points Chart */}
          <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-serif mb-6">Biggest Starting Barrier</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processData('pain-point')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {processData('pain-point').map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Fit Chart */}
          <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-serif mb-6">Top Requested Feature</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processData('feature-fit')}
                    cx="50%"
                    cy="50%"
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
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Responses Table */}
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
                    <td className="p-4 text-sm text-indigo-300">
                      {new Date(row.timestamp).toLocaleDateString()}
                    </td>
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
    </div>
  );
}
