import React from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { SupplierHeader } from '../common/SupplierHeader.js';
import { AIAssistantDrawer } from '../ai/AIAssistantDrawer.js';
import { 
  Building2, 
  Globe, 
  Layers, 
  Sparkles, 
  ShieldCheck,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';

interface SupplierLayoutProps {
  children: React.ReactNode;
}

export const SupplierLayout: React.FC<SupplierLayoutProps> = ({ children }) => {
  const { currentRoute, navigate, toggleAiDrawer, selectedBuyerId } = usePortal();

  // Mobile navigation tabs
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'Public Profile', icon: Globe, route: '/public-profile' },
    { label: 'Workspaces', icon: Building2, route: '/workspaces' },
    { label: 'All Transactions', icon: Layers, route: '/transactions' },
  ];

  const isCurrentActive = (itemRoute: string) => {
    if (itemRoute === '/dashboard' && (currentRoute === '/' || currentRoute === '/dashboard')) return true;
    if (itemRoute === '/public-profile' && (currentRoute.startsWith('/public-profile') || currentRoute.startsWith('/profiles') || currentRoute.startsWith('/master-profile'))) return true;
    if (itemRoute === '/workspaces' && currentRoute.startsWith('/workspaces')) return true;
    if (itemRoute === '/transactions' && currentRoute.startsWith('/transactions')) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SupplierHeader onToggleAi={toggleAiDrawer} />

      {/* Mobile-only quick navigation bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const active = isCurrentActive(item.route);
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${
        currentRoute.startsWith('/onboarding') 
          ? 'max-w-[1750px] px-2 sm:px-4 py-2' 
          : 'max-w-7xl px-4 sm:px-6 py-6'
      }`}>
        {children}
      </main>

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer />

      {/* Footer */}
      <footer className={`bg-white border-t border-slate-200 text-slate-500 ${
        currentRoute.startsWith('/onboarding') ? 'py-2.5 text-[11px]' : 'py-6 text-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verisource Autonomous Multi-Enterprise B2B Supplier Network • One Master Public Profile, Infinite Enterprise Connections</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">Verisource Portal Port: <code className="text-emerald-600 font-bold">3003</code></span>
            <span>•</span>
            <a href="http://localhost:3002/" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline flex items-center gap-1 font-medium">
              <span>Switch to Buyer Operations Cockpit (Port 3002)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
