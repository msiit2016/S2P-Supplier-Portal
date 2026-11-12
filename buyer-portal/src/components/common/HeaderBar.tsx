import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ExternalLink,
  Search,
  Bell
} from 'lucide-react';

interface HeaderBarProps {
  onToggleAi: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleAi }) => {
  const { currentUser, demoUsers, switchUser } = useAuth();
  const buyerUsers = demoUsers.filter(u => u.userType === 'BUYER');
  const supplierPortalUrl = (import.meta as any).env?.VITE_SUPPLIER_PORTAL_URL || 'http://localhost:3003/';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white select-none sticky top-0 z-50 shadow-md">
      {/* Top utility strip */}
      <div className="bg-slate-950 px-6 py-1.5 flex items-center justify-between text-xs border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            S2P Engine Active • Port 3002
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Apex Global Enterprises • Autonomous S2P Procurement Operations
          </span>
        </div>

        {/* Link to separate Supplier Portal */}
        <div className="flex items-center space-x-4">
          <a
            href={supplierPortalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
          >
            <span>Open Supplier Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Persona switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 hidden md:inline">Buyer Persona:</span>
            <div className="relative inline-block text-left">
              <select
                value={currentUser?.id || ''}
                onChange={(e) => switchUser(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded px-2.5 py-1 pr-6 appearance-none hover:bg-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              >
                {buyerUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Apex S2P Buyer Cockpit
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  BUYER PORTAL
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Enterprise Onboarding, Compliance & P2P Operations</div>
            </div>
          </div>
        </div>

        {/* Right side: AI Copilot trigger & user badge */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleAi}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            title="Open Agentic AI Procurement Assistant"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>AI Procurement Copilot</span>
          </button>

          <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-xs border border-brand-500">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'B'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-200">{currentUser?.name}</div>
              <div className="text-[10px] text-slate-400">{currentUser?.role.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
