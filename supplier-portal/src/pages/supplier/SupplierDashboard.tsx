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
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { useSharedTasks, TaskItem } from '../../services/taskService.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { useSupplierSettings } from '../../services/supplierSettingsService.js';
import { useSharedRfps } from '../../services/rfpService.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
import { CashflowRunwayChart } from '../../components/dashboard/CashflowRunwayChart.js';
import { BuyerRevenueDonutChart } from '../../components/dashboard/BuyerRevenueDonutChart.js';
import { OrderToCashFunnelChart } from '../../components/dashboard/OrderToCashFunnelChart.js';
import { OperationalSlaTrendChart } from '../../components/dashboard/OperationalSlaTrendChart.js';
import { PriorityActionCenter } from '../../components/dashboard/PriorityActionCenter.js';
import { RICH_DEFAULT_ORDERS } from './SupplierOrders.js';
import { RICH_DEFAULT_INVOICES } from './SupplierInvoices.js';
import { 
  LayoutDashboard,
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
  ClipboardList,
  TrendingUp,
  CheckCheck,
  CalendarCheck,
  BarChart3,
  Percent,
  RotateCw,
  Filter,
  FileCheck2,
  ArrowUpRight,
  X,
  AlertCircle
} from 'lucide-react';

const DEFAULT_BUYERS: BuyerSpecificProfile[] = [
  {
    id: 'bprof-apex',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-1',
    buyerName: 'Apex Global Enterprises',
    buyerLogoText: 'APEX',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-88102',
    connectedSince: 'Jan 2026',
    annualSpendVolume: 380000,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Operating Checking Account'
    },
    negotiatedTerms: {
      paymentTerms: '2/10 Net 30',
      earlyPaymentEligible: true,
      customDiscountRate: 2.0,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Tier-1 Enterprise Preferred (12% Master Volume Discount)',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 100
  },
  {
    id: 'bprof-novatech',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-2',
    buyerName: 'NovaTech Aerospace & Defense',
    buyerLogoText: 'NOVA',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-3304',
    connectedSince: 'Aug 2024',
    annualSpendVolume: 215000,
    customRemittanceAccount: {
      bankName: 'Silicon Valley Bank (Division of First Citizens)',
      accountEnding: '1109',
      routingNumberMasked: '121140399',
      currency: 'USD',
      accountNickName: 'Specialized Defense Tech Escrow Account'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 45 Standard',
      earlyPaymentEligible: true,
      customDiscountRate: 1.25,
      preferredPaymentMethod: 'WIRE'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Defense & Aerospace Precision Rate Card 2026',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 94
  },
  {
    id: 'bprof-meridian',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-3',
    buyerName: 'Meridian Health Network',
    buyerLogoText: 'MERI',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-7701',
    connectedSince: 'Oct 2026',
    annualSpendVolume: 185000,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Operating Checking Account'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 30 Days',
      earlyPaymentEligible: false,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Healthcare Equipment & S2P Telemetry',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 100
  }
];

export const SupplierDashboard: React.FC = () => {
  const { navigate } = usePortal();
  const { currentUser } = useAuth();
  
  const [buyers, setBuyers] = useState<BuyerSpecificProfile[]>(DEFAULT_BUYERS);
  const [globalProfile, setGlobalProfile] = useState<GlobalSupplierProfile | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [asns, setAsns] = useState<AdvanceShippingNotice[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'ALL' | 'ORDER' | 'ASN' | 'INVOICE' | 'ONBOARDING' | 'RFP'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just Now');

  // Enterprise Client Scope Filter (Multi-Buyer vs Dedicated Buyer View)
  const [selectedBuyerFilter, setSelectedBuyerFilter] = useState<string>('ALL');

  // 1-Click PO-to-Invoice Flip Modal State
  const [showPoFlipModal, setShowPoFlipModal] = useState(false);
  const [selectedFlipPoId, setSelectedFlipPoId] = useState<string>('');
  const [flipInvoiceNumber, setFlipInvoiceNumber] = useState<string>('');

  const { tasks: sharedTasks, pendingTasks: sharedPendingTasks } = useSharedTasks();
  const { events: rfpEvents } = useSharedRfps();
  const { settings } = useSupplierSettings();

  // In Executive Operating Dashboard, display expedited, urgent & active sourcing tender deliverables
  const priorityTasks = sharedPendingTasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH' || t.category === 'RFP');
  const activeRfpCount = rfpEvents.length;
  const totalRfpPipeline = rfpEvents.reduce((acc, e) => acc + (e.estimatedValue || 0), 0);

  // Fallback resilient data sources
  const effectiveOrders = orders.length > 0 ? orders : RICH_DEFAULT_ORDERS;
  const effectiveInvoices = invoices.length > 0 ? invoices : RICH_DEFAULT_INVOICES;

  // Active buyer-filtered data slices
  const filteredOrders = selectedBuyerFilter === 'ALL'
    ? effectiveOrders
    : effectiveOrders.filter(o => o.buyerOrgId === selectedBuyerFilter);

  const filteredInvoices = selectedBuyerFilter === 'ALL'
    ? effectiveInvoices
    : effectiveInvoices.filter(i => i.buyerOrgId === selectedBuyerFilter);

  const filteredAsns = selectedBuyerFilter === 'ALL'
    ? asns
    : asns.filter(a => a.buyerOrgId === selectedBuyerFilter);

  const filteredBuyers = selectedBuyerFilter === 'ALL'
    ? buyers
    : buyers.filter(b => b.buyerOrgId === selectedBuyerFilter);

  // Eligible POs for 1-Click PO Flip
  const flippableOrders = effectiveOrders.filter(
    (o: any) => o.status === 'ISSUED' || o.status === 'ACKNOWLEDGED' || o.status === 'IN_FULFILLMENT' || o.status === 'SHIPPED' || o.status === 'CONFIRMED' || o.status === 'OPEN' || !o.status
  );

  const currentFlipPo = flippableOrders.find(o => o.id === selectedFlipPoId) || flippableOrders[0];

  useEffect(() => {
    if (currentFlipPo) {
      const cleanNum = currentFlipPo.poNumber.replace('PO-2026-', '').replace('PO-', '');
      setFlipInvoiceNumber(`INV-2026-${cleanNum || '9450'}`);
    }
  }, [selectedFlipPoId, currentFlipPo]);

  const handleExecutePoFlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFlipPo) return;
    setShowPoFlipModal(false);
    setToastMessage(`🎉 1-Click PO Flip Complete: Invoice ${flipInvoiceNumber} generated with 100% 3-Way Match ready.`);
    setTimeout(() => {
      navigate('/invoices', {
        invoiceNumber: flipInvoiceNumber,
        poNumber: currentFlipPo.poNumber,
        buyerOrgId: currentFlipPo.buyerOrgId,
        timestamp: Date.now()
      });
    }, 700);
  };

  const handleExecuteTaskAction = (task: TaskItem) => {
    switch (task.actionType) {
      case 'NAV_ONBOARDING':
        navigate('/onboarding/detail', task.actionPayload);
        break;
      case 'NAV_RFP':
        navigate('/rfps', task.actionPayload);
        break;
      case 'NAV_ORDER':
        navigate('/orders', task.actionPayload || { poNumber: task.refCode });
        break;
      case 'NAV_ASN':
        navigate('/asns', task.actionPayload || { asnNumber: task.refCode });
        break;
      case 'NAV_INVOICE':
        navigate('/invoices', { ...(task.actionPayload || { invoiceNumber: task.refCode }), timestamp: Date.now() });
        break;
      case 'NAV_DOCS':
        navigate('/documents');
        break;
      default:
        navigate('/tasks');
        break;
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  // Broadcast live Executive Dashboard context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'dashboard',
      availableEarlyCash: 51594.30,
      activeBuyersCount: buyers.length,
      buyers: buyers.map(b => ({ name: b.buyerName, erpId: b.erpVendorId, spend: b.annualSpendVolume })),
      pipelineTotal: 384660.00,
      totalOrders: orders.length || 6,
      totalInvoices: invoices.length || 3,
      totalAsns: asns.length || 3
    });
  }, [buyers, orders, invoices, asns]);

  // Listen to actions dispatched by Ava Copilot
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'ACCEPT_EARLY_PAYMENT') {
        setToastMessage('💰 Early Liquidity Acceleration Activated: $51,594.30 USD scheduled for direct Nacha transfer.');
        setTimeout(() => setToastMessage(null), 5000);
      } else if (action.action === 'REFRESH_DATA') {
        handleManualSync();
      }
    });
    return cleanup;
  }, []);

  const loadDashboardData = async () => {
    try {
      const [bRes, gRes, oRes, iRes, aRes] = await Promise.allSettled([
        ApiClient.getBuyerProfiles(),
        ApiClient.getGlobalProfile(),
        ApiClient.getOrders(),
        ApiClient.getInvoices(),
        ApiClient.getASNs()
      ]);

      if (bRes.status === 'fulfilled' && bRes.value?.buyerProfiles && bRes.value.buyerProfiles.length > 0) {
        setBuyers(bRes.value.buyerProfiles);
      }
      if (gRes.status === 'fulfilled' && gRes.value?.profile) {
        setGlobalProfile(gRes.value.profile);
      }
      if (oRes.status === 'fulfilled' && oRes.value?.orders && oRes.value.orders.length > 0) {
        setOrders(oRes.value.orders);
      }
      if (iRes.status === 'fulfilled' && iRes.value?.invoices && iRes.value.invoices.length > 0) {
        setInvoices(iRes.value.invoices);
      }
      if (aRes.status === 'fulfilled' && aRes.value?.asns && aRes.value.asns.length > 0) {
        setAsns(aRes.value.asns);
      }
    } catch (err) {
      console.warn('Dashboard data offline fallback active:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await loadDashboardData();
      const now = new Date();
      setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setToastMessage('Live telemetry and ERP vendor masters synchronized successfully');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handleCopyPublicLink = () => {
    const slug = globalProfile?.publicPassportSlug || 'acme-industrial-tech';
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/p/${slug}`
      : `https://verisource.network/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setToastMessage('Public Master Profile share link copied to clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setToastMessage(null);
    }, 4000);
  };

  const getInvoiceGross = (i: any): number => {
    if (!i) return 0;
    if (i.subtotal && typeof i.taxAmount === 'number' && i.taxAmount > 0 && Math.abs((i.totalAmount || 0) - i.subtotal) < 0.01) {
      return Number((i.subtotal + i.taxAmount).toFixed(2));
    }
    return i.totalAmount || 0;
  };

  // Calculations scoped dynamically by the active Enterprise Client Scope
  const totalReceivables = filteredInvoices.length > 0
    ? filteredInvoices.filter(i => i.paymentStatus !== 'PAID').reduce((sum, i) => sum + getInvoiceGross(i), 0)
    : (selectedBuyerFilter === 'ALL' ? 78570.00 : 28400.00);

  const totalPOValue = filteredOrders.length > 0
    ? filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    : (selectedBuyerFilter === 'ALL' ? 214380.00 : 64000.00);

  const inTransitAsnCount = filteredAsns.filter(a => a.status === 'IN_TRANSIT').length || (selectedBuyerFilter === 'ALL' ? 2 : 1);

  const rawAccelerated = filteredInvoices
    .filter(i => i.earlyPaymentOffer?.eligible && i.paymentStatus !== 'PAID')
    .reduce((sum, i) => sum + (i.earlyPaymentOffer?.acceleratedPayoutAmount || 0), 0);

  const acceleratedCashAvailable = rawAccelerated > 0 
    ? rawAccelerated 
    : (selectedBuyerFilter === 'ALL' ? 51594.30 : Math.round(totalReceivables * 0.7));

  // Match hold invoices detection for 3-way match exception warnings
  const matchHoldInvoices = filteredInvoices.filter(
    i => i.matchStatus === '2_WAY_MATCHED' || i.paymentStatus === 'DRAFT' || i.invoiceNumber === 'INV-2026-202'
  );
  const hasMatchHold = matchHoldInvoices.length > 0;

  // Filter tasks dynamically by selected buyer scope
  const scopedPriorityTasks = selectedBuyerFilter === 'ALL'
    ? priorityTasks
    : priorityTasks.filter(t => t.buyerOrgId === selectedBuyerFilter);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading Executive Supplier Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl shadow-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 text-xs font-semibold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner (Executive Multi-Buyer Scope & 1-Click Action Bar) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon, Title & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Real-time overview of cash pipeline, orders, and fulfillment.
            </p>
          </div>
        </div>

        {/* Right: Client Scope Dropdown, 1-Click PO Flip, Telemetry Sync Status & Master Profile Quick Action */}
        <div className="flex items-center flex-wrap gap-2.5 self-end sm:self-auto shrink-0">
          {/* 1. Enterprise Client Scope Selector */}
          <div className="w-44 sm:w-52">
            <FilterSelect
              value={selectedBuyerFilter}
              onChange={(e: any) => setSelectedBuyerFilter(typeof e === 'string' ? e : e?.target?.value || 'ALL')}
              options={[
                { value: 'ALL', label: 'All Enterprise Buyers (3)' },
                { value: 'buyer-org-1', label: 'Apex Global Enterprises' },
                { value: 'buyer-org-2', label: 'NovaTech Aerospace & Defense' },
                { value: 'buyer-org-3', label: 'Meridian Health Network' }
              ]}
              className="h-8 text-xs font-semibold rounded-lg bg-slate-50 border-slate-200"
            />
          </div>

          {/* 2. 1-Click PO Flip Quick Action */}
          <button
            onClick={() => setShowPoFlipModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Flip confirmed purchase order into invoice with 1-click 3-way match"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>1-Click PO Flip</span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90 rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Synchronize ERP telemetry and live ledgers"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="text-[11px] font-medium">{isSyncing ? 'Syncing...' : lastSyncedTime}</span>
          </button>

          <button
            onClick={() => navigate('/public-profile')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="View verified master public profile & passport"
          >
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <span>Master Profile</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Active Buyer Scope Indicator Chip (When Filtered) */}
      {selectedBuyerFilter !== 'ALL' && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Scoped Enterprise View: <strong>{buyers.find(b => b.buyerOrgId === selectedBuyerFilter)?.buyerName || selectedBuyerFilter}</strong> (All KPIs, pipeline funnel, and cash projections focused)
            </span>
          </div>
          <button
            onClick={() => setSelectedBuyerFilter('ALL')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Scope (Show All Buyers)</span>
          </button>
        </div>
      )}

      {/* Minimal 4-KPI Metric Strip with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* KPI 1: Active Receivables */}
        <div 
          onClick={() => navigate('/invoices')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group"
          title="View all active receivables & invoice ledger"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Receivables</span>
              {hasMatchHold && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/invoices', { matchFilter: '2_WAY_MATCHED', timestamp: Date.now() });
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
                  title="1 invoice has a 3-way match exception hold. Click to review in invoice ledger."
                >
                  <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                  <span>1 Match Hold</span>
                </span>
              )}
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            ${totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-emerald-700 font-medium truncate transition">
              {filteredInvoices.length} active invoices
            </span>
            <Sparkline data={[52000, 58000, 61000, 69000, 72000, totalReceivables]} color="#10b981" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2: Open Purchase Orders */}
        <div 
          onClick={() => navigate('/orders')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group"
          title="View all purchase orders across enterprise vendors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Open Orders</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {filteredOrders.length} <span className="text-xs font-normal text-slate-500 font-sans">Orders</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-sky-700 font-medium mt-0.5 truncate transition">
              ${Math.round(totalPOValue / 1000)}k pipeline
            </span>
            <Sparkline data={[3, 4, 4, 5, 5, filteredOrders.length]} color="#0284c7" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3: In-Transit ASNs */}
        <div 
          onClick={() => navigate('/asns')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group"
          title="Track active carrier shipments & dispatch new ASNs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In-Transit Shipments</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {inTransitAsnCount} <span className="text-xs font-normal text-slate-500 font-sans">Shipments</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-teal-700 font-medium mt-0.5 truncate transition">
              On schedule
            </span>
            <Sparkline data={[1, 2, 1, 3, 2, inTransitAsnCount]} color="#0d9488" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4: Early Cash Available OR Settled Invoices */}
        {settings.earlyPaymentHighlighting ? (
          <div 
            onClick={() => navigate('/invoices', { earlyPay: true, invoiceNumber: 'INV-2026-022', timestamp: Date.now() })}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group"
            title="View accelerated cash payout offers"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Early Cash Available</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              ${acceleratedCashAvailable > 0 ? acceleratedCashAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '30,870.00'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium mt-0.5 truncate transition">
                Instant eligible
              </span>
              <Sparkline data={[28000, 34000, 39000, 44000, acceleratedCashAvailable]} color="#d97706" width={68} height={20} />
            </div>
          </div>
        ) : (
          <div 
            onClick={() => navigate('/invoices')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group"
            title="View settled invoice history"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Settled &amp; Paid</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              $115,480.00
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-emerald-700 group-hover:text-emerald-800 font-medium mt-0.5 truncate transition">
                100% on-time
              </span>
              <Sparkline data={[82000, 91000, 98000, 104000, 115480]} color="#10b981" width={68} height={20} />
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ROW 2: ORDER-TO-CASH (O2C) PIPELINE WATERFALL (FULL WIDTH MISSION CONTROL)
          ========================================================================= */}
      <OrderToCashFunnelChart 
        onNavigate={(route, params) => navigate(route, params)}
        orderCount={filteredOrders.length}
        totalOrderValue={totalPOValue}
        inTransitAsnCount={inTransitAsnCount}
        invoiceCount={filteredInvoices.length}
        totalReceivables={totalReceivables}
      />

      {/* =========================================================================
          ROW 3: FINANCIAL INTELLIGENCE & PRIORITY ACTION CENTER (BALANCED 7 : 5)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left (7 cols): Cash Runway & Liquidity Flow Chart */}
        <div className="lg:col-span-7">
          <CashflowRunwayChart 
            onNavigateToInvoices={(params) => navigate('/invoices', params)}
            earlyPaymentEnabled={settings.earlyPaymentHighlighting}
            onAccelerateCash={() => navigate('/invoices', { earlyPay: true, invoiceNumber: 'INV-2026-022', timestamp: Date.now() })}
          />
        </div>

        {/* Right (5 cols): Compact, Ergonomic Priority Action Center */}
        <div className="lg:col-span-5">
          <PriorityActionCenter
            tasks={scopedPriorityTasks}
            onExecuteAction={handleExecuteTaskAction}
            onNavigateToTasks={() => navigate('/tasks')}
          />
        </div>
      </div>

      {/* =========================================================================
          ROW 4: OPERATIONAL QUALITY RADAR & BUYER CONCENTRATION DONUT (BALANCED 7 : 5)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left (7 cols): Operational SLA & Quality Radar */}
        <div className="lg:col-span-7">
          <OperationalSlaTrendChart 
            onNavigateToInvoices={() => navigate('/invoices')}
            onNavigateToAsns={() => navigate('/asns')}
            onNavigateToDocuments={() => navigate('/documents')}
          />
        </div>

        {/* Right (5 cols): Buyer Concentration & DSO Donut Chart */}
        <div className="lg:col-span-5">
          <BuyerRevenueDonutChart 
            buyers={filteredBuyers}
            onNavigateToOrders={(buyerOrgId) => navigate('/orders', buyerOrgId ? { buyerOrgId } : undefined)}
            onNavigateToAsns={(buyerOrgId) => navigate('/asns', buyerOrgId ? { buyerOrgId } : undefined)}
            onNavigateToInvoices={(buyerOrgId) => navigate('/invoices', buyerOrgId ? { buyerOrgId } : undefined)}
          />
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: OPERATIONS & MASTER VAULTS (BALANCED 4-CARD LAUNCHPAD)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Buyer Onboarding Card */}
        <div 
          onClick={() => navigate('/onboarding')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition">
              Buyer Onboarding Requests
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium">3 Active • 1 Action Required</p>
          </div>
        </div>

        {/* Sourcing RFPs & Bids Card */}
        <div 
          onClick={() => navigate('/rfps')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition">
              Sourcing RFPs &amp; Bids
            </h3>
            <p className="text-[11px] text-purple-700 font-medium">
              {activeRfpCount} Active • ${Math.round(totalRfpPipeline / 1000)}k Pipeline
            </p>
          </div>
        </div>

        {/* Document Vault Card */}
        <div 
          onClick={() => navigate('/documents')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FolderLock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition">
              Document Vault
            </h3>
            <p className="text-[11px] text-sky-700 font-medium">6 Verified Credentials</p>
          </div>
        </div>

        {/* Catalog Items Card */}
        <div 
          onClick={() => navigate('/catalog')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition">
              Catalog Items
            </h3>
            <p className="text-[11px] text-indigo-700 font-medium">5 Standard Item Codes</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: 1-CLICK PO-TO-INVOICE FLIP ENGINE (COUPA / SAP ARIBA BENCHMARK)
          ========================================================================= */}
      {showPoFlipModal && currentFlipPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1-Click Purchase Order Flip</h3>
                  <p className="text-[11px] text-slate-500">Transform confirmed PO into commercial invoice with automated 3-way match.</p>
                </div>
              </div>
              <button
                onClick={() => setShowPoFlipModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleExecutePoFlip} className="p-5 space-y-4 text-xs text-slate-700">
              {/* Select Purchase Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Select Purchase Order to Flip</label>
                <FilterSelect
                  value={currentFlipPo.id}
                  onChange={(e: any) => setSelectedFlipPoId(typeof e === 'string' ? e : e?.target?.value || '')}
                  options={flippableOrders.map(o => ({
                    value: o.id,
                    label: `${o.poNumber} — ${(o as any).buyerName || o.companyName || 'Enterprise Buyer'} ($${(o.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})`
                  }))}
                  className="w-full text-xs font-semibold rounded-lg"
                />
              </div>

              {/* Order Metadata Strip */}
              <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Buyer</span>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate">{(currentFlipPo as any).buyerName || currentFlipPo.companyName || 'Apex Global Enterprises'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Payment Terms</span>
                  <div className="font-semibold text-emerald-700 mt-0.5">{currentFlipPo.paymentTerms || '2/10 Net 30'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pre-Match Status</span>
                  <div className="font-semibold text-teal-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    <span>100% 3-Way Verified</span>
                  </div>
                </div>
              </div>

              {/* Line Items Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>PO Line Items Included (Auto-populated)</span>
                  <span>{(currentFlipPo as any).lines?.length || currentFlipPo.lineItems?.length || 3} Lines</span>
                </div>
                <div className="border border-slate-200 rounded-xl max-h-36 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {(((currentFlipPo as any).lines || currentFlipPo.lineItems || []).length > 0 ? ((currentFlipPo as any).lines || currentFlipPo.lineItems) : [
                    { lineNumber: 1, description: 'Industrial Telemetry Sensor Node Series 900', quantity: 200, unitPrice: 42.50 },
                    { lineNumber: 2, description: 'Mil-Spec Ruggedized Wire Harness', quantity: 50, unitPrice: 85.00 },
                    { lineNumber: 3, description: 'Factory Calibration & Testing Certificate', quantity: 1, unitPrice: 1450.00 }
                  ]).map((line: any, idx: number) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-[11px]">
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-900 truncate">Line {line.lineNumber || idx + 1}: {line.description}</div>
                        <div className="text-slate-400 text-[10px]">Qty: {line.quantity} × ${Number(line.unitPrice || 0).toFixed(2)}</div>
                      </div>
                      <div className="font-mono font-bold text-slate-800 shrink-0">
                        ${((line.quantity || 1) * (line.unitPrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Number & Totals */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Commercial Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={flipInvoiceNumber}
                    onChange={(e) => setFlipInvoiceNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                    placeholder="INV-2026-9450"
                  />
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-center text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gross Invoice Amount</span>
                  <span className="font-mono font-bold text-base text-slate-900 mt-0.5">
                    ${(currentFlipPo.totalAmount || 14200.00).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPoFlipModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Execute 1-Click Flip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: OPERATIONS & MASTER VAULTS (BALANCED 4-CARD LAUNCHPAD)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Buyer Onboarding Card */}
        <div 
          onClick={() => navigate('/onboarding')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition">
              Buyer Onboarding Requests
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium">3 Active • 1 Action Required</p>
          </div>
        </div>

        {/* Sourcing RFPs & Bids Card */}
        <div 
          onClick={() => navigate('/rfps')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition">
              Sourcing RFPs &amp; Bids
            </h3>
            <p className="text-[11px] text-purple-700 font-medium">
              {activeRfpCount} Active • ${Math.round(totalRfpPipeline / 1000)}k Pipeline
            </p>
          </div>
        </div>

        {/* Document Vault Card */}
        <div 
          onClick={() => navigate('/documents')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FolderLock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition">
              Document Vault
            </h3>
            <p className="text-[11px] text-sky-700 font-medium">6 Verified Credentials</p>
          </div>
        </div>

        {/* Catalog Items Card */}
        <div 
          onClick={() => navigate('/catalog')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition">
              Catalog Items
            </h3>
            <p className="text-[11px] text-indigo-700 font-medium">5 Standard Item Codes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
