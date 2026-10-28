import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { 
  BuyerSpecificProfile, 
  PurchaseOrder, 
  Invoice, 
  AdvanceShippingNotice,
  GlobalSupplierProfile 
} from '../../types/index.js';
import { 
  Building2, 
  Globe, 
  ShoppingCart, 
  Receipt, 
  Truck, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Plus, 
  Share2, 
  ExternalLink,
  Copy,
  Clock,
  Layers,
  FileText,
  DollarSign,
  FolderLock,
  Package,
  ClipboardList
} from 'lucide-react';

export const SupplierDashboard: React.FC = () => {
  const { navigate, openBuyerWorkspace } = usePortal();
  const { currentUser } = useAuth();
  
  const [buyers, setBuyers] = useState<BuyerSpecificProfile[]>([]);
  const [globalProfile, setGlobalProfile] = useState<GlobalSupplierProfile | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [asns, setAsns] = useState<AdvanceShippingNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bRes, gRes, oRes, iRes, aRes] = await Promise.all([
        ApiClient.getBuyerProfiles(),
        ApiClient.getGlobalProfile(),
        ApiClient.getOrders(),
        ApiClient.getInvoices(),
        ApiClient.getASNs()
      ]);

      if (bRes?.buyerProfiles) setBuyers(bRes.buyerProfiles);
      if (gRes?.profile) setGlobalProfile(gRes.profile);
      if (oRes?.orders) setOrders(oRes.orders);
      if (iRes?.invoices) setInvoices(iRes.invoices);
      if (aRes?.asns) setAsns(aRes.asns);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText('https://verisource.network/p/vanguard-freight');
    setCopiedLink(true);
    setToastMessage('Public Master Profile link copied to clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setToastMessage(null);
    }, 4000);
  };

  // Calculations
  const totalReceivables = invoices
    .filter(i => i.paymentStatus !== 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalPOValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const inTransitAsnCount = asns.filter(a => a.status === 'IN_TRANSIT').length || 2;

  const acceleratedCashAvailable = invoices
    .filter(i => i.earlyPaymentOffer?.eligible && i.paymentStatus !== 'PAID')
    .reduce((sum, i) => sum + (i.earlyPaymentOffer?.acceleratedPayoutAmount || 0), 0);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading Executive Supplier Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Welcome Cockpit */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              {currentUser?.organizationName || 'Vanguard Freight Logistics LLC'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Master Trust Score: 99.4% Verified
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              D-U-N-S: 08-112-9941
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Supplier Operating Dashboard</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Autonomous multi-enterprise collaboration: Discrete buyer workspaces powered by one verified Master Public Profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/public-profile')}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>View Public Profile</span>
          </button>

          <button
            onClick={() => openBuyerWorkspace('buyer-org-1')}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition transform hover:scale-105"
          >
            <Building2 className="w-4 h-4" />
            <span>Open Workspaces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip (Cross-Enterprise) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices / Receivables */}
        <div 
          onClick={() => navigate('/transactions')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Active Receivables</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            ${totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-teal-600 font-semibold flex items-center gap-1">
            <span>{invoices.length} Invoices Across Buyers</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Purchase Orders */}
        <div 
          onClick={() => navigate('/transactions')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Open Purchase Orders</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {orders.length} Orders <span className="text-xs font-normal text-slate-500 font-sans">(${Math.round(totalPOValue / 1000)}k)</span>
          </div>
          <div className="mt-1 text-[11px] text-sky-600 font-semibold flex items-center gap-1">
            <span>1-Click PO Flip Ready</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Shipping & ASNs */}
        <div 
          onClick={() => openBuyerWorkspace('buyer-org-1', 'ASN')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">In-Transit ASNs</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            {inTransitAsnCount} Active Shipments
          </div>
          <div className="mt-1 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
            <span>FedEx Freight & UPS Active</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Dynamic Discounting / Early Cash */}
        <div 
          onClick={() => openBuyerWorkspace('buyer-org-1', 'INVOICES')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-sm cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Early Cash Available ⚡</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            ${acceleratedCashAvailable > 0 ? acceleratedCashAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '30,870.00'}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <span>Instant Payout in 48 Hours</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* ENTERPRISE COMPLIANCE & CATALOG VAULTS + ONBOARDING STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Document Vault Card */}
        <div 
          onClick={() => navigate('/documents')}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-5 rounded-2xl border border-teal-500/30 text-white shadow-sm hover:shadow-md hover:border-teal-400 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform">
                <FolderLock className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Verified
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
              Document Vault
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Upload and manage your company documents, certificates, and compliance records.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-teal-300">
            <span>Open Document Vault</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Catalog Items Card */}
        <div 
          onClick={() => navigate('/catalog')}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 rounded-2xl border border-indigo-500/30 text-white shadow-sm hover:shadow-md hover:border-indigo-400 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Contracted
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              Catalog Items
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Products and services synced with buyer catalogs and punch-out carts.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-indigo-300">
            <span>View Catalog Items</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Onboarding Wizard Card */}
        <div 
          onClick={() => navigate('/onboarding')}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 rounded-2xl border border-emerald-500/30 text-white shadow-sm hover:shadow-md hover:border-emerald-400 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Autonomous
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Onboarding Application Wizard
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Step-by-step guided registration workflow with automated AI extraction, TIN matching, and instant attestation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-emerald-300">
            <span>Launch Onboarding Flow</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* MY TASKS & ACTION ITEMS (EXECUTIVE ACTION CENTER) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>My Tasks & Priority Action Items</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  4 Actionable
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Buyer onboarding invitations, RFPs, and operational transactions requiring your immediate response.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
          >
            <span>Open All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Task 1: NovaTech Onboarding */}
          <div className="p-4 rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/50 to-white hover:border-emerald-400 hover:shadow-xs transition flex flex-col justify-between space-y-3 group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                  Onboarding Request • Urgent
                </span>
                <span className="text-[11px] text-slate-400 font-mono">INV-NOVATECH-8820</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                NovaTech Aerospace & Defense: Complete Vendor Onboarding
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Procurement team requested compliance attestation, W-9, and FedACH banking setup. 94% can be auto-filled from your Master Public Profile.
              </p>
            </div>

            <button
              onClick={() => navigate('/onboarding', { buyerOrgId: 'buyer-org-2', autoCopilot: true })}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Open Onboarding Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task 2: Meridian Health Onboarding */}
          <div className="p-4 rounded-xl border border-teal-200/90 bg-gradient-to-br from-teal-50/50 to-white hover:border-teal-400 hover:shadow-xs transition flex flex-col justify-between space-y-3 group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800 border border-teal-300 uppercase tracking-wider">
                  Onboarding Request • Action Required
                </span>
                <span className="text-[11px] text-slate-400 font-mono">INV-MERIDIAN-5519</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                Meridian Health Systems: Clinical Vendor Compliance
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Hospital procurement network requested vendor onboarding, HIPAA data privacy governance, and $2M liability insurance proof.
              </p>
            </div>

            <button
              onClick={() => navigate('/onboarding', { buyerOrgId: 'buyer-org-3', autoCopilot: true })}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Open Onboarding Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task 3: Sourcing RFP Apex Global */}
          <div className="p-4 rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/50 to-white hover:border-indigo-400 hover:shadow-xs transition flex flex-col justify-between space-y-3 group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 uppercase tracking-wider">
                  Sourcing RFP • Closes in 5 Days
                </span>
                <span className="text-[11px] text-indigo-600 font-mono font-bold">Est. $520,000</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                Apex Global: Enterprise Cloud Compute & Storage RFP
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Competitive bid event for 24 Compute Nodes and high-throughput NVMe SAN cluster. Auto-draft technical specs with AI.
              </p>
            </div>

            <button
              onClick={() => navigate('/rfps')}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Prepare Bid with AI Sourcing Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task 4: PO Flip Ready */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs transition flex flex-col justify-between space-y-3 group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-800 border border-slate-300 uppercase tracking-wider">
                  PO Fulfilled • Ready to Bill
                </span>
                <span className="text-[11px] text-slate-400 font-mono">PO-2026-9042</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                Apex Global: 1-Click PO Flip to Electronic Invoice
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Delivery of compute sensors acknowledged. Convert purchase order to matched 3-way invoice ($14,200.00).
              </p>
            </div>

            <button
              onClick={() => openBuyerWorkspace('buyer-org-1', 'ORDERS')}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Flip PO to Invoice ($14,200.00)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CONNECTED BUYER WORKSPACES GRID (CORE SELF-SERVE COCKPIT) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Connected Enterprise Buyer Workspaces</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a buyer to view onboarding details, purchase orders, shipping notices (ASNs), invoices, and remittance bank routing.
            </p>
          </div>

          <button
            onClick={() => openBuyerWorkspace('buyer-org-1')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
          >
            <span>View All Workspaces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buyers.map((buyer) => {
            const isApproved = buyer.relationshipStatus === 'ACTIVE';
            const buyerOrders = orders.filter(o => o.buyerOrgId === buyer.buyerOrgId);
            const buyerInvoices = invoices.filter(i => i.buyerOrgId === buyer.buyerOrgId);
            const pendingTotal = buyerInvoices.reduce((s, i) => s + i.totalAmount, 0);

            return (
              <div
                key={buyer.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500/80 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {buyer.buyerLogoText.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {buyer.buyerName}
                        </h3>
                        <div className="text-[11px] text-slate-400">
                          Partner since {buyer.connectedSince}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isApproved 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {isApproved ? '100% Verified' : 'Action Needed'}
                    </span>
                  </div>

                  {/* Operational Metrics for this Buyer */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Orders</div>
                      <div className="font-bold text-slate-800 mt-0.5">{buyerOrders.length} POs</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Invoices</div>
                      <div className="font-bold text-slate-800 mt-0.5">${(pendingTotal / 1000).toFixed(1)}k</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Terms</div>
                      <div className="font-bold text-slate-800 mt-0.5">{buyer.negotiatedTerms.paymentTerms}</div>
                    </div>
                  </div>

                  {/* Dedicated Bank & Sync Status */}
                  <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Remittance Bank:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                        {buyer.customRemittanceAccount?.accountNickName || buyer.customRemittanceAccount?.bankName || 'JPMorgan Chase Operating'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Master Data Sync:</span>
                      <span className="font-bold text-emerald-600">
                        {buyer.syncCompletenessScore}% Synced
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    ERP: <code className="text-slate-600 font-mono">{buyer.erpVendorId || 'VEND-8821'}</code>
                  </div>

                  <button
                    onClick={() => openBuyerWorkspace(buyer.buyerOrgId)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl shadow-2xs transition"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MASTER B2B PUBLIC PROFILE SPOTLIGHT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Globe className="w-4 h-4" />
              <span>Universal Master Public Profile</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              One Verified Public Profile, Seamless Enterprise Onboarding
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your public profile allows new enterprise buyers to onboard your company with zero redundant data entry.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleCopyPublicLink}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Public Link'}</span>
            </button>

            <button
              onClick={() => navigate('/public-profile')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <span>View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Verified Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">IRS TIN</div>
              <div className="text-xs font-bold text-slate-800">W-9 Verified</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Banking</div>
              <div className="text-xs font-bold text-slate-800">Plaid Anchored</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Sanctions</div>
              <div className="text-xs font-bold text-slate-800">OFAC Clear</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Security</div>
              <div className="text-xs font-bold text-slate-800">SOC 2 Type II</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-2.5 col-span-2 sm:col-span-1">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Diversity</div>
              <div className="text-xs font-bold text-slate-800">MBE Certified</div>
            </div>
          </div>
        </div>
      </div>

      {/* AGENTIC AI ACTION STREAM */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-4 border border-indigo-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Autonomous Agentic Action Feed</h2>
              <p className="text-[11px] text-slate-400">Proactive actions detected across your connected enterprise buyers</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
            Agentic Copilot Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Action 1: 1-Click PO Flip */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-emerald-400 font-bold">1-Click PO Flip Ready</span>
                <span className="text-[10px] text-slate-400">PO-2026-9042</span>
              </div>
              <p className="text-xs text-slate-300">
                Purchase Order from <strong>Apex Global</strong> has been fulfilled. Generate touchless E-Invoice with 3-way match.
              </p>
            </div>
            <button
              onClick={() => openBuyerWorkspace('buyer-org-1', 'ORDERS')}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Flip PO to Invoice ($14,200)</span>
            </button>
          </div>

          {/* Action 2: Dispatch ASN */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-sky-400 font-bold">Advance Shipping Notice (ASN)</span>
                <span className="text-[10px] text-slate-400">PO-2026-8891</span>
              </div>
              <p className="text-xs text-slate-300">
                Telemetry nodes for <strong>Apex Global</strong> are scheduled for carrier pickup. Dispatch ASN with tracking number.
              </p>
            </div>
            <button
              onClick={() => openBuyerWorkspace('buyer-org-1', 'ASN')}
              className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Create & Dispatch ASN</span>
            </button>
          </div>

          {/* Action 3: Early Payment */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-amber-400 font-bold">Accelerate Cash Payout</span>
                <span className="text-[10px] text-slate-400">INV-202</span>
              </div>
              <p className="text-xs text-slate-300">
                Invoice for <strong>Starlight Aerospace</strong> ($31,500) qualifies for 2/10 Net 30 settlement in 48 business hours.
              </p>
            </div>
            <button
              onClick={() => openBuyerWorkspace('buyer-org-2', 'INVOICES')}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Request Early Cash ($30,870)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
