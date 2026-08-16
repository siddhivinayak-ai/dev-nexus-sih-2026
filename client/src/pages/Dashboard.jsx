import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, AlertTriangle, TrendingUp, Search, Briefcase, Eye, Calendar, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

// Format currency in Indian Rupees
const formatRupee = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString()}`;
};

// Simulated chart data
const monthlyTrendData = [
  { month: 'Jan', scanned: 5, flagged: 1, savings: 15000000 },
  { month: 'Feb', scanned: 8, flagged: 2, savings: 32000000 },
  { month: 'Mar', scanned: 12, flagged: 3, savings: 68000000 },
  { month: 'Apr', scanned: 9, flagged: 1, savings: 24000000 },
  { month: 'May', scanned: 14, flagged: 4, savings: 110000000 },
  { month: 'Jun', scanned: 18, flagged: 3, savings: 85000000 },
  { month: 'Jul', scanned: 22, flagged: 5, savings: 142000000 },
  { month: 'Aug', scanned: 25, flagged: 6, savings: 172000000 }
];

export default function Dashboard({ onSelectTender, onLogout, user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [allTenders, setAllTenders] = useState([]);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const res = await api.getDashboardStats();
      setStats(res.data);
      setIsDemoMode(res.isMock);
      
      // Seed table with a set of detailed mock tenders + the ones in recent flags
      const tendersList = [
        {
          tender_id: 'tender-2026-001',
          title: 'Supply of 5,000 Desktop Computers to Government Schools',
          department: 'Directorate of Education',
          value: 160000000,
          anomaly_score: 0.94,
          status: 'FLAGGED_CCI',
          publish_date: '2026-07-20'
        },
        {
          tender_id: 'tender-2026-002',
          title: 'Four-Laning of NH-48 Highway Bypass (Km 120 to 142)',
          department: 'NHAI',
          value: 1450000000,
          anomaly_score: 0.78,
          status: 'UNDER_INVESTIGATION',
          publish_date: '2026-07-15'
        },
        {
          tender_id: 'tender-2026-003',
          title: 'Procurement of 2,000 Medical Ventilators for State Hospitals',
          department: 'Health & Family Welfare',
          value: 280000000,
          anomaly_score: 0.12,
          status: 'CLEAN',
          publish_date: '2026-07-10'
        },
        {
          tender_id: 'tender-2026-004',
          title: 'Procurement of High-Tensile Steel Bars for Metro Phase 3',
          department: 'Delhi Metro Rail Corporation',
          value: 850000000,
          anomaly_score: 0.88,
          status: 'FLAGGED_CCI',
          publish_date: '2026-07-05'
        },
        {
          tender_id: 'tender-2026-005',
          title: 'Supply and Installation of Solar Panels on Government Buildings',
          department: 'Ministry of New & Renewable Energy',
          value: 420000000,
          anomaly_score: 0.24,
          status: 'CLEAN',
          publish_date: '2026-06-28'
        }
      ];
      setAllTenders(tendersList);
      setLoading(false);
    }
    loadStats();
  }, []);

  const filteredTenders = allTenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tender.tender_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tender.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && tender.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#050508] bg-dotted-pattern flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-[#09090b]/80 backdrop-filter backdrop-blur-md flex flex-col justify-between p-6 z-10">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/30 border border-blue-500/25 rounded-xl glow-blue">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white m-0 tracking-tight leading-none">
                BidShield <span className="text-blue-500">AI</span>
              </h2>
              <span className="text-[9px] text-zinc-500 font-mono tracking-widest">PORTAL SECURE</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-950/20 border border-blue-500/20 text-white rounded-xl font-medium text-sm text-left">
              <Shield className="w-4 h-4 text-blue-400" />
              Audit Dashboard
            </button>
          </nav>
        </div>

        {/* User Account Info */}
        <div className="border-t border-zinc-800 pt-6">
          <div className="mb-4">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.department}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-medium transition-all"
          >
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-8 z-10 max-w-7xl mx-auto w-full">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Procurement Collusion Dashboard</h2>
            <p className="text-xs text-zinc-400">Real-time supervision of active tenders and contractor cartels</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isDemoMode && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs rounded-xl font-mono">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                Demo Sandbox Active
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-xl font-mono">
              <Calendar className="w-3.5 h-3.5" />
              16 Aug 2026
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stat Card 1 */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tenders Scanned</p>
              <h3 className="text-3xl font-extrabold text-white mb-1">{stats.total_tenders_analyzed}</h3>
              <p className="text-[10px] text-zinc-500">Across GeM & State departments</p>
            </div>

            {/* Stat Card 2 */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-l-2 border-l-rose-500">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                <AlertTriangle className="w-12 h-12 text-rose-500" />
              </div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Cartels Detected</p>
              <h3 className="text-3xl font-extrabold text-rose-500 mb-1">{stats.fraud_detected}</h3>
              <p className="text-[10px] text-rose-500/80">Pending CCI action</p>
            </div>

            {/* Stat Card 3 */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-l-2 border-l-emerald-500">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                <TrendingUp className="w-12 h-12 text-emerald-500" />
              </div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Saved Public Funds</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mb-1">{formatRupee(stats.money_saved_estimate)}</h3>
              <p className="text-[10px] text-emerald-500/80">From cancelled rigged bids</p>
            </div>

            {/* Stat Card 4 */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-l-2 border-l-amber-500">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                <AlertCircle className="w-12 h-12 text-amber-500" />
              </div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Reviews Pending</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mb-1">{stats.active_alerts}</h3>
              <p className="text-[10px] text-amber-500/80">Auditor review required</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Trend Area Chart */}
          <div className="glass-panel p-5 rounded-2xl lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">Cartel Detection & Savings Trend</h3>
              <span className="text-[10px] text-zinc-500 font-mono">Monthly aggregates</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                  <Area type="monotone" dataKey="savings" stroke="#10b981" fillOpacity={1} fill="url(#colorSavings)" name="Savings (INR)" />
                  <Area type="monotone" dataKey="flagged" stroke="#ef4444" fillOpacity={1} fill="url(#colorFlagged)" name="Cartels Flagged" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomaly Distribution Chart */}
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">Tenders Scanned per Month</h3>
              <span className="text-[10px] text-zinc-500 font-mono">Tender frequency</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                  <Bar dataKey="scanned" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tenders Analyzed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tenders Table Section */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800">
          
          {/* Table Header / Filters */}
          <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white m-0">Tender Verification Portal</h3>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search Tender / ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-60 pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Status filter selection */}
              <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                {['ALL', 'FLAGGED_CCI', 'UNDER_INVESTIGATION', 'CLEAN'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider transition-all uppercase ${
                      statusFilter === f 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              Analyzing procurement records...
            </div>
          ) : filteredTenders.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No matching tenders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/40">
                    <th className="py-4 px-6">Tender Details</th>
                    <th className="py-4 px-4">Publishing Authority</th>
                    <th className="py-4 px-4">Estimated Value</th>
                    <th className="py-4 px-4 text-center">Collusion Index</th>
                    <th className="py-4 px-4">Status Flag</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredTenders.map((t) => {
                    const score = Math.round(t.anomaly_score * 100);
                    
                    return (
                      <tr key={t.tender_id} className="hover:bg-zinc-900/30 transition-all">
                        {/* Title & ID */}
                        <td className="py-4 px-6">
                          <p className="font-semibold text-white text-xs leading-normal hover:text-blue-400 cursor-pointer" onClick={() => onSelectTender(t.tender_id)}>
                            {t.title}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">ID: {t.tender_id}</span>
                        </td>
                        
                        {/* Department */}
                        <td className="py-4 px-4 text-xs text-zinc-400">
                          {t.department}
                        </td>
                        
                        {/* Value */}
                        <td className="py-4 px-4 text-xs font-medium text-white">
                          {formatRupee(t.value)}
                        </td>
                        
                        {/* Collusion score */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-12 py-1 rounded-lg text-xs font-bold ${
                            score >= 80 
                              ? 'bg-rose-950/30 border border-rose-500/20 text-rose-400' 
                              : score >= 50 
                                ? 'bg-amber-950/30 border border-amber-500/20 text-amber-400'
                                : 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-400'
                          }`}>
                            {score}%
                          </span>
                        </td>
                        
                        {/* Status badge */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            t.status === 'FLAGGED_CCI'
                              ? 'bg-rose-950/30 border-rose-500/20 text-rose-400 glow-rose'
                              : t.status === 'UNDER_INVESTIGATION'
                                ? 'bg-amber-950/30 border-amber-500/20 text-amber-400 glow-amber'
                                : 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400 glow-emerald'
                          }`}>
                            {t.status === 'FLAGGED_CCI' && <AlertTriangle className="w-3 h-3" />}
                            {t.status === 'UNDER_INVESTIGATION' && <AlertCircle className="w-3 h-3" />}
                            {t.status === 'CLEAN' && <CheckCircle2 className="w-3 h-3" />}
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        
                        {/* Button action */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => onSelectTender(t.tender_id)}
                            className="px-3.5 py-2 bg-zinc-900 hover:bg-blue-600 border border-zinc-800 hover:border-blue-500 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
