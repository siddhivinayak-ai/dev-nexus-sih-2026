import React, { useState } from 'react';
import { Shield, Lock, UserPlus, Server, Eye, FileText, ArrowRight, CheckCircle2, Layers, Cpu, Activity, ChevronRight } from 'lucide-react';

export default function Landing({ onLoginSuccess }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('auditor@devnexus.io');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupDept, setSignupDept] = useState('Competition Commission Auditor');
  const [signupId, setSignupId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginEmail === 'auditor@devnexus.io' && loginPassword === 'admin123') {
      setLoginError('');
      const mockUser = {
        name: 'Siddhivinayak Waghmode',
        email: loginEmail,
        department: 'Competition Commission (CCI) Bureau',
        id: 'DNX-AUD-2026-081',
        role: 'Chief Audit Officer'
      };
      localStorage.setItem('devnexus_user', JSON.stringify(mockUser));
      onLoginSuccess(mockUser);
    } else if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
    } else {
      setLoginError('Invalid credentials. Use auditor@devnexus.io / admin123 for demo access.');
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupId) {
      alert('Please fill out all fields.');
      return;
    }
    setSignupSuccess(true);
    setTimeout(() => {
      setLoginEmail(signupEmail);
      setLoginPassword(signupPassword);
      setAuthTab('login');
      setSignupSuccess(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] bg-grid-light flex flex-col justify-between">
      
      {/* Top SaaS Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0 leading-none">
              DevNexus <span className="text-blue-600 font-semibold">Intelligence</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
              Procurement Security
            </span>
          </div>
        </div>

        {/* Center Pill Nav Bar */}
        <div className="hidden md:flex items-center gap-1 bg-slate-200/60 p-1 rounded-full border border-slate-300/50">
          <button className="pill-tab pill-tab-active">Platform Overview</button>
          <button className="pill-tab">DBSCAN Engine</button>
          <button className="pill-tab">Layout RAG</button>
          <button className="pill-tab">CCI Audits</button>
        </div>
        
        <button 
          onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium text-sm transition-all shadow-sm"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center z-10 flex-grow">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-6 shadow-xs">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          Real-Time Public Procurement Anti-Cartel System
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15] mb-6">
          Real-Time Fraud Interceptor for <span className="text-blue-600">Government Tenders</span>
        </h2>

        <p className="text-slate-600 text-lg md:text-xl max-w-2xl font-normal leading-relaxed mb-10">
          Detect bidder collusion, cover bids, and copy-paste proposal documents in public procurement before payments are authorized.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 text-base"
          >
            Access Auditor Portal <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setAuthTab('signup'); setShowAuthModal(true); }}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 transition-all shadow-sm text-base"
          >
            Register Auditor
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          <div className="saas-card p-6 saas-card-hover">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4 border border-blue-100">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Engine 1: Statistical DBSCAN</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Analyzes pricing breakdowns, formulas, and submission timestamps. Groups and flags collusive cover bids and regional territory suppression patterns automatically.
            </p>
          </div>

          <div className="saas-card p-6 saas-card-hover">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4 border border-indigo-100">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Engine 2: Layout RAG</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Extracts font structures, low-opacity watermarks, page layouts, and boilerplate clauses. Identifies identical proposal PDFs submitted by "competing" vendors.
            </p>
          </div>

          <div className="saas-card p-6 saas-card-hover">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4 border border-emerald-100">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">CCI Audit Evidences</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Compiles mathematical price correlations, shared director linkages, and document comparison sheets into audit-ready packages for regulatory enforcement.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 DevNexus Intelligence Platform — All Rights Reserved
      </footer>

      {/* Light Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div 
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-blue-600 mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">DevNexus Auditor Authentication</h3>
                <p className="text-slate-500 text-xs mt-1">Access Procurement Intelligence Portal</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  onClick={() => { setAuthTab('login'); setLoginError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                    authTab === 'login' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  onClick={() => { setAuthTab('signup'); setSignupSuccess(false); }}
                  className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                    authTab === 'signup' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </button>
              </div>

              {authTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      {loginError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Government Email
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="auditor@devnexus.io"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-900 text-sm rounded-xl outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Security PIN / Password
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Demo: admin123</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-900 text-sm rounded-xl outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 mt-2"
                  >
                    Initiate Auditor Session
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {signupSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex flex-col items-center justify-center text-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="font-bold">Registration Complete</p>
                        <p className="text-xs text-slate-500 mt-1">Redirecting to sign in...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            placeholder="Siddhivinayak W."
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 text-slate-900 text-sm rounded-xl outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Auditor ID
                          </label>
                          <input
                            type="text"
                            required
                            value={signupId}
                            onChange={(e) => setSignupId(e.target.value)}
                            placeholder="AUD-2026-89"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 text-slate-900 text-sm rounded-xl outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Department
                        </label>
                        <select
                          value={signupDept}
                          onChange={(e) => setSignupDept(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 text-slate-900 text-sm rounded-xl outline-none"
                        >
                          <option>Competition Commission Auditor</option>
                          <option>Highways Authority Supervision</option>
                          <option>Ministry of Finance Oversight</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="officer@devnexus.io"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 text-slate-900 text-sm rounded-xl outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 text-slate-900 text-sm rounded-xl outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 mt-2"
                      >
                        Register Auditor Credentials
                      </button>
                    </>
                  )}
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
