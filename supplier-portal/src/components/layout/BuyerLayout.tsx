import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { HeaderBar } from '../common/HeaderBar.js';
import { AIAssistantDrawer } from '../ai/AIAssistantDrawer.js';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Inbox, 
  CheckSquare, 
  Settings, 
  History, 
  PlusCircle, 
  ChevronRight,
  ShieldAlert,
  Building,
  Menu,
  X
} from 'lucide-react';

interface BuyerLayoutProps {
  children: React.ReactNode;
  onCreateSupplierClick: () => void;
}

export const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children, onCreateSupplierClick }) => {
  const { currentRoute, navigate } = usePortal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'Suppliers Directory', icon: Building, route: '/suppliers' },
    { label: 'Supplier Applications', icon: FileText, route: '/supplier-applications' },
    { label: 'Review Queue', icon: CheckSquare, route: '/review-queue', badge: '2 Pending' },
    { label: 'Email Intake Queue', icon: Inbox, route: '/email-intake', badge: '1 New' },
    { label: 'Audit Trail', icon: History, route: '/audit-log' },
    { label: 'Procurement Team', icon: Users, route: '/users' },
    { label: 'Governance Settings', icon: Settings, route: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <HeaderBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Buyer Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex-shrink-0 hidden md:flex md:flex-col justify-between">
          <div className="p-4 space-y-6">
            {/* Primary Action Button */}
            <button
              onClick={onCreateSupplierClick}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-md shadow-brand-600/30 transition-all hover:shadow-lg active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Supplier</span>
            </button>

            {/* Navigation links */}
            <nav className="space-y-1">
              <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                S2P Procurement Navigation
              </div>
              {navItems.map((item) => {
                const isActive = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    onClick={() => navigate(item.route)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400 border border-amber-400/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Compliance & Policy Status Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs">
            <div className="flex items-center space-x-2 text-slate-400 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-400" />
              <span className="font-semibold text-slate-300">Policy Mode: Strict</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              SOX 404 & Nacha Anti-Fraud 4-eye verification mandatory for banking modifications.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <AIAssistantDrawer />
    </div>
  );
};
