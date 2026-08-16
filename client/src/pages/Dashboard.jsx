import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Shield, AlertTriangle, TrendingUp, Search, Briefcase, Eye, Calendar, 
  Sparkles, AlertCircle, FileText, CheckCircle2, Bell, User, ArrowUpRight, 
  Layers, ChevronRight, Activity, Filter, Upload, Plus
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, Cell } from 'recharts';
import IsometricHeroGraphic from '../components/IsometricHeroGraphic';
import PdfUploadModal from '../components/PdfUploadModal';

const formatRupee = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString()}`;
};

const categoryBreakdownData = [
  { category: 'Infrastructure', count: 18, risk: 84 },
  { category: 'IT Hardware', count: 14, risk: 92 },
  { category: 'Medical Equipment', count: 9, risk: 18 },
  { category: 'Renewable Energy', count: 6, risk: 24 }
];

const getRiskColor = (risk) => {
  if (risk >= 70) return '#ef4444'; // Red for high risk
  if (risk >= 30) return '#f97316'; // Orange for moderate risk
  return '#22c55e'; // Green for safe
};

export default function Dashboard({ onSelectTender, onLogout, user, onOpenProfile, onOpenTenderVerification }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('Overview');
  const [allTenders, setAllTenders] = useState([]);
  
  // Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const res = await api.getDashboardStats();
      setStats(res.data);
      
      const defaultTenders = [
        {
          tender_id: 'tender-2026-001',
          title: 'Supply of 5,000 Desktop Computers to Public Institutions',
          department: 'Directorate of Information Technology',
          value: 160000000,
          anomaly_score: 0.94,
          status: 'FLAGGED_CCI',
          publish_date: '2026-07-20'
        },
        {
          tender_id: 'tender-2026-002',
          title: 'Four-Laning of NH-48 Highway Bypass (Km 120 to 142)',
          department: 'National Highways Authority',
          value: 1450000000,
          anomaly_score: 0.78,
          status: 'UNDER_INVESTIGATION',
          publish_date: '2026-07-15'
        },
        {
          tender_id: 'tender-2026-003',
          title: 'Procurement of 2,000 Medical Ventilators for State Hospitals',
          department: 'Department of Health & Family Welfare',
          value: 280000000,
          anomaly_score: 0.12,
          status: 'CLEAN',
          publish_date: '2026-07-10'
        },
        {
          tender_id: 'tender-2026-004',
          title: 'Procurement of High-Tensile Steel Bars for Metro Line Phase 3',
          department: 'Metro Rail Corporation',
          value: 850000000,
          anomaly_score: 0.88,
          status: 'FLAGGED_CCI',
          publish_date: '2026-07-05'
        },
        {
          tender_id: 'tender-2026-005',
          title: 'Installation of Rooftop Solar Panels on Government Assets',
          department: 'Ministry of Renewable Energy',
          value: 420000000,
          anomaly_score: 0.24,
          status: 'CLEAN',
          publish_date: '2026-06-28'
        }
      ];

      const savedTenders = JSON.parse(localStorage.getItem('devnexus_tenders') || '[]');
      const mergedTenders = [...savedTenders, ...defaultTenders];
      const uniqueTenders = mergedTenders.filter((tender, index, self) =>
        index === self.findIndex(entry => entry.tender_id === tender.tender_id)
      );

      setAllTenders(uniqueTenders);
      setLoading(false);
    }
    loadStats();
  }, []);

  const handleUploadComplete = (newTender) => {
    const nextTender = Array.isArray(newTender) ? newTender : [newTender];
    const storedTenders = JSON.parse(localStorage.getItem('devnexus_tenders') || '[]');
    const merged = [...nextTender, ...storedTenders];
    localStorage.setItem('devnexus_tenders', JSON.stringify(merged));
    setAllTenders(prev => {
      const unique = [...merged, ...prev].filter((tender, index, self) =>
        index === self.findIndex(entry => entry.tender_id === tender.tender_id)
      );
      return unique;
    });
    if (stats) {
      setStats(prev => ({
        ...prev,
        total_tenders_analyzed: prev.total_tenders_analyzed + 1,
        fraud_detected: prev.fraud_detected + 1
      }));
    }
    onSelectTender(newTender.tender_id);
  };

  const filteredTenders = allTenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tender.tender_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tender.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && tender.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 flex flex-col font-sans pb-16">
      
      {/* TOP NAVIGATION BAR */}
      <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">DevNexus</span>
        </div>

        {/* Center Pill Nav Bar */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
          {['Overview', 'Scanned Tenders', 'Engine 1 BOQ', 'Engine 2 RAG', 'CCI Reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pill-tab ${activeTab === tab ? 'pill-tab-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* User & Upload Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Upload Bid PDF
          </button>

          <button className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-slate-200/80 transition-all">
            <Bell className="w-4 h-4" />
          </button>
          
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-3 pl-2 border-l border-slate-200 hover:opacity-75 transition-opacity cursor-pointer group"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{user?.name || 'Siddhivinayak W.'}</span>
              <span className="block text-[10px] text-slate-500 font-medium">CCI Auditor</span>
            </div>
          </button>

          <button onClick={onLogout} className="text-xs text-slate-400 hover:text-slate-700 ml-3 font-medium">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-8 pt-8 space-y-8">
        
        {/* TOP MULTI-LAYER SAAS DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* HERO BANNER CARD WITH CUSTOM 3D ISOMETRIC SVG GRAPHIC */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-blue-500/10 min-h-[380px]">
            
            {/* EMBEDDED ISOMETRIC 3D SVG ILLUSTRATION */}
            <div className="absolute right-[-40px] bottom-[-20px] w-72 h-72 opacity-90 pointer-events-none">
              <IsometricHeroGraphic />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" /> DevNexus Core Engine
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight mb-3">
                Smart Procurement Security
              </h2>
              <p className="text-blue-100 text-sm font-normal max-w-xs leading-relaxed">
                Automated cartel detection, pricing anomaly clustering, and layout similarity parsing in government contracts.
              </p>
            </div>

            <div className="pt-6 border-t border-white/20 flex items-center justify-between relative z-10">
              <div>
                <span className="block text-xs font-medium text-blue-100">Estimated Public Savings</span>
                <span className="text-2xl font-black text-white">₹42.85 Crore</span>
              </div>
              
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all"
              >
                Scan PDF <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN GRID */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* TOP ROW: 2 METRIC CARDS WITH RADIAL ARC METERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="saas-card p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-slate-700">DBSCAN Anomaly Index</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mb-1">
                      ▲ +5.1%
                    </span>
                    <h3 className="text-4xl font-extrabold text-slate-900">82%</h3>
                  </div>

                  <div className="relative w-24 h-16 flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-500" strokeDasharray="82, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="saas-card p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-slate-700">Layout Similarity Match</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md mb-1">
                      ▼ -2.3%
                    </span>
                    <h3 className="text-4xl font-extrabold text-slate-900">71%</h3>
                  </div>

                  <div className="relative w-24 h-16 flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-orange-500" strokeDasharray="71, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* MIDDLE ROW: CATEGORY BREAKDOWN BAR CHART */}
            <div className="saas-card p-6 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Tender Categories Risk Spread</h4>
                  <span className="text-xs text-slate-500 font-medium">Scanned items by department</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> High Risk (≥70)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500" /> Moderate (30-69)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" /> Safe (&lt;30)</span>
                </div>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="risk" radius={[6, 6, 0, 0]} name="Anomaly %">
                      {categoryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="saas-card p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-slate-800">Ground Leveling Risk</span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">-3.3%</span>
            </div>
            <span className="text-xs text-slate-400 font-medium block mb-4">Latest Scan Audit</span>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[68%]" />
            </div>
          </div>

          <div className="saas-card p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Daily Workforce Output</span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900">1.08</span>
              <span className="text-xs font-semibold text-slate-500">CPI Factor</span>
            </div>
            <div className="flex items-end gap-1 h-8">
              {[40, 60, 35, 70, 90, 85, 95, 60, 40, 70, 85].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t ${i > 4 ? 'bg-orange-500' : 'bg-slate-200'}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          <div className="saas-card p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Progress Velocity (Weekly)</span>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-extrabold text-slate-900">68%</h3>
              <div className="flex items-end gap-1 h-10">
                <div className="w-2.5 bg-blue-500 rounded-t h-full" />
                <div className="w-2.5 bg-orange-500 rounded-t h-[70%]" />
                <div className="w-2.5 bg-blue-500 rounded-t h-[85%]" />
              </div>
            </div>
          </div>
        </div>

        {/* SCANNED TENDERS DATA TABLE */}
        <div className="saas-card overflow-hidden">
          <div className="p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Tender Verification Portal</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time supervision of active tenders and contractor cartels</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search tender or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                {['ALL', 'FLAGGED_CCI', 'UNDER_INVESTIGATION', 'CLEAN'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                      statusFilter === f 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
                  <th className="py-4 px-6">Tender Title</th>
                  <th className="py-4 px-4">Authority</th>
                  <th className="py-4 px-4">Estimated Value</th>
                  <th className="py-4 px-4 text-center">Anomaly Index</th>
                  <th className="py-4 px-4">Status Flag</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenders.map((t) => {
                  const score = Math.round(t.anomaly_score * 100);
                  
                  return (
                    <tr key={t.tender_id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onClick={() => onSelectTender(t.tender_id)}>
                          {t.title}
                        </p>
                        <span className="text-xs text-slate-400 font-mono mt-0.5 block">ID: {t.tender_id}</span>
                      </td>
                      
                      <td className="py-4 px-4 text-sm text-slate-600 font-medium">
                        {t.department}
                      </td>
                      
                      <td className="py-4 px-4 text-sm font-semibold text-slate-900">
                        {formatRupee(t.value)}
                      </td>
                      
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-extrabold ${
                          score >= 80 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : score >= 50 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {score}%
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                          t.status === 'FLAGGED_CCI'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : t.status === 'UNDER_INVESTIGATION'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onSelectTender(t.tender_id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* PDF UPLOAD & PARSING MODAL */}
      <PdfUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
        onOpenTenderVerification={onOpenTenderVerification}
      />
    </div>
  );
}
