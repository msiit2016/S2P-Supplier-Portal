import React from 'react';
import { usePortal, PortalType } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { VerisourceLogo } from './VerisourceLogo.js';
import { 
  Building2, 
  Store, 
  Sparkles, 
  ShieldCheck, 
  UserCircle2, 
  ChevronDown, 
  Search,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const { portal, setPortal, navigate, toggleAiDrawer } = usePortal();
  const { currentUser, demoUsers, switchUser } = useAuth();

  const handlePortalSwitch = (target: PortalType) => {
    setPortal(target);
    // Automatically switch persona if mismatch
    if (target === 'BUYER' && currentUser?.userType !== 'BUYER') {
      const buyer = demoUsers.find(u => u.userType === 'BUYER') || demoUsers[0];
      if (buyer) switchUser(buyer.id);
    } else if (target === 'SUPPLIER' && currentUser?.userType !== 'SUPPLIER') {
      const supp = demoUsers.find(u => u.userType === 'SUPPLIER');
      if (supp) switchUser(supp.id);
    }
    navigate('/dashboard');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white select-none sticky top-0 z-50">
      {/* Top utility strip */}
      <div className="bg-slate-950 px-4 py-1.5 flex items-center justify-between text-xs border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Agent Supervisor Active
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Apex Global Enterprises • S2P Procurement Network v2.4
          </span>
        </div>

        {/* Demo persona switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 hidden md:inline">Simulate Persona:</span>
          <div className="relative inline-block text-left">
            <select
              value={currentUser?.id || ''}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded px-2.5 py-1 pr-6 appearance-none hover:bg-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {demoUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace(/_/g, ' ')}) - {u.userType}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Portal Selector */}
        <div className="flex items-center space-x-6">
          <div 
            onClick={() => navigate(portal === 'BUYER' ? '/dashboard' : '/')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <VerisourceLogo size="md" theme="dark" showTagline={true} taglineText="Autonomous S2P Collaboration" />
            <span className="text-[10px] font-normal uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {portal}
            </span>
          </div>

          {/* Portal Switcher Buttons */}
          <div className="hidden lg:flex items-center bg-slate-800/90 p-1 rounded-lg border border-slate-700/60">
            <button
              onClick={() => handlePortalSwitch('BUYER')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                portal === 'BUYER'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Buyer Portal</span>
              <span className="text-[10px] opacity-75 font-mono">/buyer</span>
            </button>
            <button
              onClick={() => handlePortalSwitch('SUPPLIER')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                portal === 'SUPPLIER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Supplier Portal</span>
              <span className="text-[10px] opacity-75 font-mono">/supplier</span>
            </button>
          </div>
        </div>

        {/* Right side controls: AI Drawer, search, user pill */}
        <div className="flex items-center space-x-3">
          {/* AI Copilot trigger */}
          <button
            onClick={toggleAiDrawer}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            title="Open Agentic AI Onboarding Assistant"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* User profile pill */}
          <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs border border-slate-600">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-200">{currentUser?.name}</div>
              <div className="text-[10px] text-slate-400">{currentUser?.organizationName}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
