import React, { useState } from 'react';
import { Shield, Lock, UserPlus, Server, Eye, FileText, ArrowRight, CheckCircle2, Cpu } from 'lucide-react';

export default function Landing({ onLoginSuccess }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'signup'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('auditor@gem.gov.in');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupDept, setSignupDept] = useState('GeM / Ministry of Commerce');
  const [signupId, setSignupId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginEmail === 'auditor@gem.gov.in' && loginPassword === 'admin123') {
      setLoginError('');
      // Store mock user info
      const mockUser = {
        name: 'Siddhivinayak Waghmode',
        email: loginEmail,
        department: 'Competition Commission of India (CCI) Auditor',
        id: 'CCI-AUD-2026-081',
        role: 'Senior Audit Officer'
      };
      localStorage.setItem('bidshield_user', JSON.stringify(mockUser));
      onLoginSuccess(mockUser);
    } else if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
    } else {
      setLoginError('Invalid credentials. Use auditor@gem.gov.in / admin123 for demo access.');
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
      // Automatically switch to login tab with the new email
      setLoginEmail(signupEmail);
      setLoginPassword(signupPassword);
      setAuthTab('login');
      setSignupSuccess(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-dotted-pattern bg-[#050508] relative overflow-hidden flex flex-col justify-between">
      
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/40 rounded-xl border border-blue-500/20 glow-blue">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white m-0 leading-none">
              BidShield <span className="text-blue-500">AI</span>
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
              SIH 2026 Dev Nexus
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
          className="px-5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 transition-all font-medium text-sm"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center z-10 flex-grow">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/30 border border-blue-500/25 text-blue-300 text-xs font-mono mb-8">
          <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          Smart India Hackathon 2026 Prototype
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
          Real-Time Procurement <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Cartel Interceptor</span>
        </h2>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-10">
          Unmasking bidder collusion, pricing abnormalities, and copy-paste proposal PDFs in government tenders before payouts are authorized.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20 shadow-blue-600/10 glow-blue text-base"
          >
            Access Auditor Portal <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setAuthTab('signup'); setShowAuthModal(true); }}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium rounded-xl border border-zinc-800 transition-all text-base"
          >
            Create Auditor Account
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80">
            <div className="p-3 bg-blue-950/30 border border-blue-500/20 text-blue-400 rounded-xl w-fit mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Engine 1: Statistical DBSCAN</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Ingests pricing breakdowns, microformulas, and submission timestamps. Groups and flags collusive cover bids and regional territory suppression patterns automatically.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80">
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-4">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Engine 2: Layout RAG</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Extracts font structures, low-opacity watermarks, page layouts, and boilerplate clauses. Identifies identical proposal PDFs submitted by "competing" companies.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80">
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">CCI Audit Evidences</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Compiles mathematical price correlations, shared director linkages, and document comparisons into audit-ready packages for the Competition Commission of India.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-zinc-600 border-t border-zinc-900 z-10 bg-zinc-950/20">
        Designed & Built with ❤️ by Team Dev Nexus for Smart India Hackathon 2026
      </footer>

      {/* Auth Modal (Login & Signup) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-filter backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
          <div 
            className="w-full max-w-md glass-panel rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Glow Accent */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

            <div className="p-6">
              
              {/* Modal Close */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>

              {/* Title */}
              <div className="text-center mb-6">
                <div className="inline-flex p-2.5 bg-blue-950/30 border border-blue-500/20 rounded-xl text-blue-400 mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Auditor Identity Verification</h3>
                <p className="text-zinc-400 text-xs mt-1">Access to Government Procurement Intelligence</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-zinc-800 mb-6">
                <button
                  onClick={() => { setAuthTab('login'); setLoginError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                    authTab === 'login' 
                      ? 'border-blue-500 text-white' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  onClick={() => { setAuthTab('signup'); setSignupSuccess(false); }}
                  className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                    authTab === 'signup' 
                      ? 'border-blue-500 text-white' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </button>
              </div>

              {/* Form Content */}
              {authTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-300 text-xs rounded-lg">
                      {loginError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Government Email
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="auditor@gem.gov.in"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white text-sm rounded-xl outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Security PIN / Password
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">Demo: admin123</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white text-sm rounded-xl outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all glow-blue mt-4"
                  >
                    Initiate Secure Session
                  </button>

                  <div className="text-center pt-2 text-[10px] text-zinc-500">
                    ℹ️ For immediate access, click Submit using prefilled credentials.
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {signupSuccess ? (
                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-sm rounded-lg flex flex-col items-center justify-center text-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <div>
                        <p className="font-bold">Registration Submitted</p>
                        <p className="text-xs text-zinc-400 mt-1">Redirecting you to the sign-in form...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            placeholder="Siddhivinayak W."
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-sm rounded-xl outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                            Auditor ID
                          </label>
                          <input
                            type="text"
                            required
                            value={signupId}
                            onChange={(e) => setSignupId(e.target.value)}
                            placeholder="AUD-2026-89"
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-sm rounded-xl outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Department / Entity
                        </label>
                        <select
                          value={signupDept}
                          onChange={(e) => setSignupDept(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-sm rounded-xl outline-none"
                        >
                          <option>GeM / Ministry of Commerce</option>
                          <option>Competition Commission of India (CCI)</option>
                          <option>NHAI Auditor</option>
                          <option>Ministry of Finance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="officer@department.gov.in"
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-sm rounded-xl outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Security Password
                        </label>
                        <input
                          type="password"
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-sm rounded-xl outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all glow-blue mt-4"
                      >
                        Register Credentials
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
