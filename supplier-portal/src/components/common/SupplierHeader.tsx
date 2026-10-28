import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { ApiClient } from '../../api/client.js';
import { BuyerSpecificProfile } from '../../types/index.js';
import { 
  Sparkles, 
  ShieldCheck, 
  ChevronDown,
  Globe,
  Building2,
  Share2,
  Layers,
  LayoutDashboard,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bell,
  MessageSquare,
  Truck,
  DollarSign,
  FileText,
  User,
  Settings,
  LogOut,
  FolderLock,
  Package,
  ClipboardList,
  FileCheck2
} from 'lucide-react';

interface SupplierHeaderProps {
  onToggleAi: () => void;
}

export const SupplierHeader: React.FC<SupplierHeaderProps> = ({ onToggleAi }) => {
  const { currentUser, switchUser, logout } = useAuth();
  const { 
    currentRoute, 
    navigate, 
    selectedBuyerId, 
    setSelectedBuyerId,
    openBuyerWorkspace 
  } = usePortal();
  
  const [buyers, setBuyers] = useState<BuyerSpecificProfile[]>([]);
  
  // Dropdown states
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Notification unread count
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [unreadMessages, setUnreadMessages] = useState(2);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Load connected buyers for the workspace switcher
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const res = await ApiClient.getBuyerProfiles();
        if (res?.buyerProfiles) {
          setBuyers(res.buyerProfiles);
        }
      } catch (err) {
        console.error('Failed to load buyers in header', err);
      }
    };
    fetchBuyers();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (workspaceRef.current && !workspaceRef.current.contains(target)) {
        setWorkspaceDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (msgRef.current && !msgRef.current.contains(target)) {
        setMessagesOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOnboarding = currentRoute.startsWith('/onboarding');

  const activeBuyer = selectedBuyerId === 'ALL' 
    ? (isOnboarding ? buyers[0] || null : null) 
    : buyers.find(b => b.buyerOrgId === selectedBuyerId) || buyers[0];

  const handleSignOut = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'Public Profile', icon: Globe, route: '/public-profile' },
    { label: 'RFPs & Bids', icon: FileCheck2, route: '/rfps' },
    { label: 'Document Vault', icon: FolderLock, route: '/documents' },
    { label: 'Catalog Items', icon: Package, route: '/catalog' },
    { label: 'All Transactions', icon: Layers, route: '/transactions' }
  ];

  const isLinkActive = (route: string) => {
    if (route === '/dashboard' && (currentRoute === '/' || currentRoute === '/dashboard')) return true;
    if (route === '/public-profile' && (currentRoute.startsWith('/public-profile') || currentRoute.startsWith('/profiles') || currentRoute.startsWith('/master-profile'))) return true;
    if (route === '/workspaces' && currentRoute.startsWith('/workspaces')) return true;
    if (route === '/rfps' && (currentRoute.startsWith('/rfps') || currentRoute.startsWith('/sourcing') || currentRoute.startsWith('/bids'))) return true;
    if (route === '/documents' && (currentRoute.startsWith('/documents') || currentRoute.startsWith('/vault') || currentRoute.startsWith('/doc-vault'))) return true;
    if (route === '/catalog' && (currentRoute.startsWith('/catalog') || currentRoute.startsWith('/catalog-vault'))) return true;
    if (route === '/transactions' && currentRoute.startsWith('/transactions')) return true;
    return false;
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white select-none sticky top-0 z-50 shadow-md">
      {/* Main navigation header */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Verisource
              </div>
            </div>
          </div>

          {/* COMPACT & INTUITIVE WORKSPACE SWITCHER */}
          <div className="relative shrink-0" ref={workspaceRef}>
            <button
              onClick={() => setWorkspaceDropdownOpen(prev => !prev)}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition shadow-xs group"
              title="Switch Active Buyer Workspace"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="text-slate-400 font-normal hidden 2xl:inline">Workspace:</span>
                <span className="font-bold text-white max-w-[130px] sm:max-w-[150px] truncate">
                  {selectedBuyerId === 'ALL' 
                    ? (isOnboarding ? (activeBuyer?.buyerName || 'Apex Global') : 'All Buyers (3)')
                    : (activeBuyer?.buyerName || 'Apex Global')}
                </span>
              </div>
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                selectedBuyerId === 'ALL' && !isOnboarding
                  ? 'bg-indigo-400' 
                  : 'bg-emerald-400'
              }`}></span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${workspaceDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {workspaceDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Client Workspaces & Filters
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {buyers.length} Connected
                  </span>
                </div>

                <div className="py-1 max-h-80 overflow-y-auto">
                  {/* ALL WORKSPACES FILTER (DEFAULT) */}
                  <button
                    onClick={() => {
                      setSelectedBuyerId('ALL');
                      setWorkspaceDropdownOpen(false);
                      navigate('/workspaces');
                    }}
                    className={`w-full px-4 py-3 text-left flex items-start justify-between hover:bg-slate-800/80 transition border-b border-slate-800/60 ${
                      selectedBuyerId === 'ALL' ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-white">🌟 All Workspaces (Cross-Buyer)</span>
                        {selectedBuyerId === 'ALL' && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                            Default Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Consolidated multi-buyer dashboard across all 3 enterprise relationships
                      </div>
                    </div>
                  </button>

                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/50">
                    Individual Enterprise Buyers
                  </div>

                  {buyers.map(b => {
                    const isSelected = selectedBuyerId === b.buyerOrgId;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          openBuyerWorkspace(b.buyerOrgId);
                          setWorkspaceDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-start justify-between hover:bg-slate-800/80 transition ${
                          isSelected ? 'bg-emerald-950/40 border-l-2 border-emerald-500' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-white">{b.buyerName}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Terms: {b.negotiatedTerms.paymentTerms}</span>
                            <span>•</span>
                            <span className={b.syncCompletenessScore === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                              {b.syncCompletenessScore}% Synced
                            </span>
                          </div>
                        </div>

                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 shrink-0 ${
                          b.relationshipStatus === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {b.relationshipStatus === 'ACTIVE' ? 'Active' : 'Action Req.'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 bg-slate-950/80 border-t border-slate-800">
                  <button
                    onClick={() => {
                      openBuyerWorkspace('buyer-org-1');
                      setWorkspaceDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect New Enterprise Buyer</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const active = isLinkActive(item.route);
              const Icon = item.icon;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs transition-all relative ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden xl:inline-block"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side: Bell Notifications, Messages, AI Copilot & Active User Dropdown */}
        <div className="flex items-center space-x-2.5">
          {/* 1. BELL NOTIFICATIONS DROPDOWN */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(prev => !prev);
                setMessagesOpen(false);
                setUserMenuOpen(false);
              }}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Notifications & Alerts"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Notifications & Alerts
                    </span>
                  </div>
                  <button
                    onClick={() => setUnreadNotifications(0)}
                    className="text-[10px] text-emerald-400 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto text-xs">
                  {/* Notif 1 */}
                  <div 
                    onClick={() => { openBuyerWorkspace('buyer-org-1', 'ASN'); setNotificationsOpen(false); }}
                    className="p-3.5 hover:bg-slate-800/80 cursor-pointer transition flex items-start space-x-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Advance Shipping Notice Dispatched</span>
                        <span className="text-[10px] text-slate-500 font-normal">12m ago</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        ASN-US-99120 is in transit with FedEx Freight to Apex Joliet DC.
                      </p>
                    </div>
                  </div>

                  {/* Notif 2 */}
                  <div 
                    onClick={() => { openBuyerWorkspace('buyer-org-2', 'INVOICES'); setNotificationsOpen(false); }}
                    className="p-3.5 hover:bg-slate-800/80 cursor-pointer transition flex items-start space-x-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Early Payment Liquidity Offer</span>
                        <span className="text-[10px] text-slate-500 font-normal">1h ago</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        INV-202 ($31,500) qualifies for 2% discount with 48h settlement.
                      </p>
                    </div>
                  </div>

                  {/* Notif 3 */}
                  <div 
                    onClick={() => { openBuyerWorkspace('buyer-org-3', 'ONBOARDING'); setNotificationsOpen(false); }}
                    className="p-3.5 hover:bg-slate-800/80 cursor-pointer transition flex items-start space-x-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Policy Attestation Required</span>
                        <span className="text-[10px] text-slate-500 font-normal">3h ago</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        OmniRetail requested confirmation of updated safety protocol.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-center">
                  <button
                    onClick={() => { navigate('/dashboard'); setNotificationsOpen(false); }}
                    className="text-xs text-slate-400 hover:text-white font-medium"
                  >
                    View Operational Dashboard Activity ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. MESSAGE / CHAT COLLABORATION DROPDOWN */}
          <div className="relative" ref={msgRef}>
            <button
              onClick={() => {
                setMessagesOpen(prev => !prev);
                setNotificationsOpen(false);
                setUserMenuOpen(false);
              }}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Collaboration & Buyer Chat"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-extrabold flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>

            {/* Messages Popover */}
            {messagesOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Buyer AP & Procurement Messages
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Live</span>
                </div>

                <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto text-xs">
                  <div 
                    onClick={() => { openBuyerWorkspace('buyer-org-1', 'DISPUTES'); setMessagesOpen(false); }}
                    className="p-3.5 hover:bg-slate-800/80 cursor-pointer transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Sarah Chen (Apex Global)</span>
                      <span className="text-[10px] text-slate-500">PO-101</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      "Confirming expedited telemetry delivery for Bay 14 scheduled for Thursday morning."
                    </p>
                  </div>

                  <div 
                    onClick={() => { openBuyerWorkspace('buyer-org-1', 'DISPUTES'); setMessagesOpen(false); }}
                    className="p-3.5 hover:bg-slate-800/80 cursor-pointer transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Marcus Vance (Apex Accounts Payable)</span>
                      <span className="text-[10px] text-slate-500">INV-201</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      "Touchless 3-way match cleared with zero variance. Payment approved for scheduled release."
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-center">
                  <button
                    onClick={() => { navigate('/communications'); setMessagesOpen(false); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Open Full Collaboration Center ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Copilot */}
          <button
            onClick={() => {
              navigate('/onboarding');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition hover:scale-105 active:scale-95 shrink-0"
            title="Open Side-by-Side Onboarding & AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* 3. ACTIVE USER ICON WITH 5-ITEM DROPDOWN + SIGN OUT */}
          <div className="relative pl-2 border-l border-slate-800" ref={userRef}>
            <button
              onClick={() => {
                setUserMenuOpen(prev => !prev);
                setNotificationsOpen(false);
                setMessagesOpen(false);
              }}
              className="flex items-center space-x-2 focus:outline-none group"
              title="User Account & Navigation"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white font-bold text-xs border border-emerald-400/80 shadow-xs group-hover:scale-105 transition-transform">
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu (4-5 Items + Sign Out) */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User info banner */}
                <div className="p-4 bg-slate-950 border-b border-slate-800">
                  <div className="font-bold text-xs text-white truncate">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
                  <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 truncate">
                    {currentUser?.organizationName}
                  </div>
                </div>

                {/* 5 Distinct Navigation Items (Concise & Clean) */}
                <div className="py-1 text-xs">
                  {/* Item 1 */}
                  <button
                    onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Profile & Settings</span>
                  </button>

                  {/* Item 2 */}
                  <button
                    onClick={() => { navigate('/public-profile'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Public Profile</span>
                  </button>

                  {/* Item 3: Document Vault */}
                  <button
                    onClick={() => { navigate('/documents'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <FolderLock className="w-4 h-4 text-teal-400" />
                    <span>Document Vault</span>
                  </button>

                  {/* Item 4: Catalog Vault */}
                  <button
                    onClick={() => { navigate('/catalog'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <Package className="w-4 h-4 text-indigo-400" />
                    <span>Catalog Vault</span>
                  </button>

                  {/* Item 5: Onboarding Request */}
                  <button
                    onClick={() => { navigate('/onboarding'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <ClipboardList className="w-4 h-4 text-amber-400" />
                    <span>Onboarding</span>
                  </button>
                </div>

                {/* Sign Out Option */}
                <div className="p-1.5 bg-slate-950/80 border-t border-slate-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Secondary Nav Strip (lg:hidden) */}
      <div className="lg:hidden px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        {navLinks.map((item) => {
          const active = isLinkActive(item.route);
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs shrink-0 transition ${
                active
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
