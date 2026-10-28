import React from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Clock, 
  FileCheck2,
  Globe,
  Share2
} from 'lucide-react';

export const SupplierLanding: React.FC = () => {
  const { navigate, setPortal } = usePortal();
  const { demoUsers, switchUser } = useAuth();

  const handleQuickSupplierLogin = (suppEmail: string) => {
    const user = demoUsers.find(u => u.email === suppEmail);
    if (user) {
      switchUser(user.id);
      setPortal('SUPPLIER');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Public Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
              Verisource
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                SUPPLIER OS
              </span>
            </div>
            <div className="text-[11px] text-slate-500">Autonomous Multi-Enterprise B2B Supplier Network</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuickSupplierLogin('elena@acmeindustrial.com')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-xs transition"
          >
            Create Public Profile
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Independent B2B Supplier Identity • One Master Public Profile, Infinite Enterprise Connections</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Manage Your Global Profile Once. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600">
            Connect Tailored Workspaces to Every Buyer.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Eliminate repetitive 50-page questionnaires. Verisource enables suppliers to maintain a verified Master Public Profile and auto-share customized profiles, dedicated bank remittance accounts, and contracted rates with enterprise buyers.
        </p>

        {/* Quick Persona Logins */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4 text-left">
          {/* Persona 1: Acme Industrial Tech */}
          <div 
            onClick={() => handleQuickSupplierLogin('elena@acmeindustrial.com')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition group"
          >
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Active Multi-Buyer Partner</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="font-bold text-sm text-slate-900">Acme Industrial Tech Inc.</div>
            <p className="text-xs text-slate-500 mt-1">
              Active in 3 enterprise buyer workspaces (Apex Global, Starlight, OmniRetail).
            </p>
          </div>

          {/* Persona 2: Nexura Global Analytics */}
          <div 
            onClick={() => handleQuickSupplierLogin('j.miller@nexuraglobal.com')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md cursor-pointer transition group"
          >
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Succession Review</span>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="font-bold text-sm text-slate-900">Nexura Global Analytics Inc.</div>
            <p className="text-xs text-slate-500 mt-1">
              Corporate succession & lineage verification application (APP-2026-0042).
            </p>
          </div>

          {/* Persona 3: Vanguard Freight */}
          <div 
            onClick={() => handleQuickSupplierLogin('operations@vanguardfreight.com')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md cursor-pointer transition group"
          >
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Action Items Flagged</span>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="font-bold text-sm text-slate-900">Vanguard Freight Logistics LLC</div>
            <p className="text-xs text-slate-500 mt-1">
              Resolve planted TIN discrepancy & cargo insurance endorsement.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-white py-12 border-t border-slate-200 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Master Public Profile</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify your IRS TIN, D-U-N-S, banking tokens, and certifications once. Share your verified public profile with any prospective buyer.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Isolated Buyer Workspaces</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintain tailored remittance bank accounts, buyer-specific insurance riders, and negotiated payment terms for each customer enterprise.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Autonomous Profile Sync</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a buyer requests an onboarding update, Verisource AI auto-populates 95%+ of their schema directly from your Master Vault.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
