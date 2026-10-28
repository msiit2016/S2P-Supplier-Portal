import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { ApiClient } from '../../api/client.js';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Globe
} from 'lucide-react';

interface SupplierAuthProps {
  initialTab?: 'LOGIN' | 'SIGNUP';
}

export const SupplierAuth: React.FC<SupplierAuthProps> = ({ initialTab = 'LOGIN' }) => {
  const { switchUser, demoUsers } = useAuth();
  const { navigate } = usePortal();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP'>(initialTab);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup fields
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [dunsNumber, setDunsNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const supplierUsers = demoUsers.filter(u => u.userType === 'SUPPLIER');

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    navigate('/dashboard');
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setErrorMsg('Please enter your business email.');
      return;
    }
    // Match with demo user or default
    const matched = demoUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (matched) {
      switchUser(matched.id);
    } else {
      // Default to first supplier user
      if (supplierUsers.length > 0) {
        switchUser(supplierUsers[0].id);
      }
    }
    navigate('/dashboard');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !businessEmail) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await ApiClient.registerSupplier({
        legalName: orgName,
        businessEmail,
        contactName,
        country: 'United States',
        password: signupPassword || 'Verisource2026!'
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Account and Master Public Profile created! Signing you in...');
        setTimeout(() => {
          if (supplierUsers.length > 0) {
            switchUser(supplierUsers[0].id);
          }
          navigate('/onboarding');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            Verisource
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SUPPLIER OS
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous Multi-Enterprise B2B Supplier Portal & Master Public Profile
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 space-y-6">
          {/* Tab Selector: Sign In vs Sign Up */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'LOGIN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('SIGNUP'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'SIGNUP'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {activeTab === 'LOGIN' && (
            <div className="space-y-5">
              {/* Quick Persona 1-Click Access */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick 1-Click Demo Login
                </label>
                <div className="space-y-2">
                  {supplierUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u.id)}
                      className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-left flex items-center justify-between transition group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{u.organizationName}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Sign In ➔
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-bold tracking-wider">or sign in with credentials</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Standard Form */}
              <form onSubmit={handleManualLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Corporate Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="david@vanguardfreight.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20 transition flex items-center justify-center space-x-1.5"
                >
                  <span>Sign In to Supplier OS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* SIGN UP VIEW */}
          {activeTab === 'SIGNUP' && (
            <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Legal Company Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Industrial Systems LLC"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Primary Authorized Contact</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan (VP Operations)"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="alex@apexindustrial.com"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">D-U-N-S (Optional)</label>
                  <input
                    type="text"
                    placeholder="08-112-9941"
                    value={dunsNumber}
                    onChange={(e) => setDunsNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>Creating an account automatically provisions your Universal Master Public Profile for zero-training onboarding.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20 transition flex items-center justify-center space-x-1.5"
              >
                <span>{loading ? 'Registering...' : 'Create Account & Public Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span>Looking for Buyer Portal? </span>
            <a href="http://localhost:3002/" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-semibold">
              Open Buyer Operations Cockpit (Port 3002) ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
