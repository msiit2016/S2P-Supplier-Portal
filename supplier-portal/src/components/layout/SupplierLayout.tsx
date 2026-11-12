import React, { useRef, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { SupplierHeader } from '../common/SupplierHeader.js';
import { AIAssistantDrawer } from '../ai/AIAssistantDrawer.js';
import { 
  Building2, 
  Globe, 
  Layers, 
  Sparkles, 
  LayoutDashboard, 
  ChevronRight, 
  ClipboardList,
  FileCheck2,
  Package,
  FolderLock
} from 'lucide-react';

interface SupplierLayoutProps {
  children: React.ReactNode;
}

export const SupplierLayout: React.FC<SupplierLayoutProps> = ({ children }) => {
  const { 
    currentRoute, 
    navigate, 
    toggleAiDrawer, 
    selectedBuyerId,
    aiDrawerOpen,
    copilotViewMode,
    routeState
  } = usePortal();

  const mainRef = useRef<HTMLElement>(null);

  // Automatically reset scroll position to top on every route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    const frameId = requestAnimationFrame(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(frameId);
  }, [currentRoute, routeState]);

  // Mobile navigation tabs (Canonical S2P Flow: Catalog & Doc Vault together)
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'RFPs & Bids', icon: FileCheck2, route: '/rfps' },
    { label: 'Catalog Items', icon: Package, route: '/catalog' },
    { label: 'Document Vault', icon: FolderLock, route: '/documents' },
    { label: 'Transactions', icon: Layers, route: '/transactions' },
  ];

  const isCurrentActive = (itemRoute: string) => {
    if (itemRoute === '/dashboard' && (currentRoute === '/' || currentRoute === '/dashboard')) return true;
    if (itemRoute === '/rfps' && (currentRoute.startsWith('/rfps') || currentRoute.startsWith('/sourcing') || currentRoute.startsWith('/bids'))) return true;
    if (itemRoute === '/catalog' && (currentRoute.startsWith('/catalog') || currentRoute.startsWith('/catalog-vault'))) return true;
    if (itemRoute === '/documents' && (currentRoute.startsWith('/documents') || currentRoute.startsWith('/vault') || currentRoute.startsWith('/doc-vault'))) return true;
    if (itemRoute === '/transactions' && currentRoute.startsWith('/transactions')) return true;
    if (itemRoute === '/tasks' && currentRoute.startsWith('/tasks')) return true;
    return false;
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <SupplierHeader onToggleAi={toggleAiDrawer} />

      {/* Mobile-only quick navigation bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto scrollbar-none shrink-0">
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

      {/* Workbench & Content Row (Side-by-side push layout) */}
      <div className="flex-1 flex w-full relative min-h-0 overflow-hidden">
        <main 
          ref={mainRef}
          id="main-scroll-container"
          className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col transition-all duration-200"
        >
          <div className={`flex-1 ${
            currentRoute.startsWith('/onboarding/detail') || currentRoute.startsWith('/onboarding-request')
              ? 'max-w-[1750px] mx-auto px-2 sm:px-4 py-2 w-full pb-10' 
              : aiDrawerOpen && copilotViewMode === 'DOCK'
              ? 'w-full px-3 sm:px-5 py-5 pb-16'
              : 'max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-16'
          }`}>
            {children}
          </div>
        </main>

        {/* AI Assistant Drawer */}
        <AIAssistantDrawer />
      </div>
    </div>
  );
};
