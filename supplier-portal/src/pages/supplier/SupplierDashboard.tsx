import React, { useState, useEffect, useMemo } from 'react';
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
import { SupplierProfileGovernanceHeader } from '../../components/dashboard/SupplierProfileGovernanceHeader.js';
import { ActiveSourcingEventsWidget } from '../../components/dashboard/ActiveSourcingEventsWidget.js';
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
  ArrowUpRight
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
    buyerName: 'Meridian Logistics Global',
    buyerLogoText: 'MERID',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-9104',
    connectedSince: 'Nov 2025',
    annualSpendVolume: 110000,
    customRemittanceAccount: {
      bankName: 'Wells Fargo Bank, N.A.',
      accountEnding: '8832',
      routingNumberMasked: '121000248',
      currency: 'USD',
      accountNickName: 'Commercial Freight Remittance Account'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 30 Standard',
      earlyPaymentEligible: false,
      customDiscountRate: 0,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Global Freight & Sensors Tier 2',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 98
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
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { tasks: sharedTasks, pendingTasks: sharedPendingTasks } = useSharedTasks();
  const { events: rfpEvents } = useSharedRfps();
  const { settings } = useSupplierSettings();

  // In Executive Operating Dashboard, display expedited, urgent & active sourcing tender deliverables
  const priorityTasks = sharedPendingTasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH' || t.category === 'RFP');
  const activeRfpCount = rfpEvents.length;
  const totalRfpPipeline = rfpEvents.reduce((acc, e) => acc + (e.estimatedValue || 0), 0);

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

  // Broadcast live Executive Dashboard context to Ava Agent
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

  // Listen to actions dispatched by Ava Agent
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
      setToastMessage('Master Profile & ERP ledger synced across all connected buyers.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const getInvoiceGross = (i: any): number => {
    if (!i) return 0;
    if (i.subtotal && typeof i.taxAmount === 'number' && i.taxAmount > 0 && Math.abs((i.totalAmount || 0) - i.subtotal) < 0.01) {
      return Number((i.subtotal + i.taxAmount).toFixed(2));
    }
    return i.totalAmount || 0;
  };

  // Filter dataset based on selected buyer
  const filteredOrders = useMemo(() => {
    if (selectedBuyerId === 'ALL') return orders;
    return orders.filter(o => o.buyerOrgId === selectedBuyerId);
  }, [orders, selectedBuyerId]);

  const filteredInvoices = useMemo(() => {
    if (selectedBuyerId === 'ALL') return invoices;
    return invoices.filter(i => i.buyerOrgId === selectedBuyerId);
  }, [invoices, selectedBuyerId]);

  const filteredAsns = useMemo(() => {
    if (selectedBuyerId === 'ALL') return asns;
    return asns.filter(a => a.buyerOrgId === selectedBuyerId);
  }, [asns, selectedBuyerId]);

  // Calculations with resilient defaults for Acme Industrial Tech Inc.
  const totalReceivables = filteredInvoices.length > 0
    ? filteredInvoices.filter(i => i.paymentStatus !== 'PAID').reduce((sum, i) => sum + getInvoiceGross(i), 0)
    : 78570.00;

  const totalPOValue = filteredOrders.length > 0
    ? filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    : 214380.00;

  const inTransitAsnCount = filteredAsns.filter(a => a.status === 'IN_TRANSIT').length || 2;

  const rawAccelerated = filteredInvoices
    .filter(i => i.earlyPaymentOffer?.eligible && i.paymentStatus !== 'PAID')
    .reduce((sum, i) => sum + (i.earlyPaymentOffer?.acceleratedPayoutAmount || 0), 0);

  const acceleratedCashAvailable = rawAccelerated > 0 ? rawAccelerated : 51594.30;

  const buyerOptions = [
    { value: 'ALL', label: 'All Connected Buyers (Portfolio View)' },
    ...buyers.map(b => ({ value: b.buyerOrgId, label: b.buyerName }))
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading Executive Supplier Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Row 1: Enterprise Profile Governance & Verification Header */}
      <SupplierProfileGovernanceHeader
        globalProfile={globalProfile}
        buyers={buyers}
        onNavigate={(route, state) => navigate(route, state)}
        onSyncAll={handleManualSync}
        isSyncing={isSyncing}
      />

      {/* Portfolio Scope & Global Multi-Buyer Filter Strip */}
      <div className="bg-white rounded-xl px-4 py-2.5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Buyer Scope:</span>
          </span>
          <div className="w-72">
            <FilterSelect
              value={selectedBuyerId}
              onChange={(e: any) => setSelectedBuyerId(typeof e === 'string' ? e : e?.target?.value || 'ALL')}
              options={buyerOptions}
              icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>
          {selectedBuyerId !== 'ALL' && (
            <button
              onClick={() => setSelectedBuyerId('ALL')}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline underline-offset-2 ml-1 cursor-pointer"
            >
              Reset to Portfolio View
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-slate-500 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ERP Ledger Synced</span>
          </span>
          <span className="text-slate-300">•</span>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1 hover:text-slate-900 transition font-medium cursor-pointer disabled:opacity-50"
            title="Refresh ERP cache & verified records"
          >
            <RotateCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-slate-400'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Minimal 4-KPI Metric Strip with Sparklines & Actionable status badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* KPI 1: Active Receivables */}
        <div 
          onClick={() => navigate('/invoices')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group"
          title="View all active receivables & invoice ledger"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Receivables</span>
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
            <Sparkline data={[52000, 58000, 61000, 69000, 72000, 78570]} color="#10b981" width={68} height={20} />
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
            <Sparkline data={[3, 4, 4, 5, 5, 6]} color="#0284c7" width={68} height={20} />
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
            <Sparkline data={[1, 2, 1, 3, 2, 2]} color="#0d9488" width={68} height={20} />
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
              <Sparkline data={[28000, 34000, 39000, 44000, 51594]} color="#d97706" width={68} height={20} />
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

      {/* Row 2: Order-to-Cash (O2C) Pipeline Waterfall (Full Width Mission Control) */}
      <OrderToCashFunnelChart 
        onNavigate={(route, params) => navigate(route, params)}
        orderCount={filteredOrders.length || 6}
        totalOrderValue={totalPOValue}
        inTransitAsnCount={inTransitAsnCount}
        invoiceCount={filteredInvoices.length || 4}
        totalReceivables={totalReceivables}
      />

      {/* Row 3: Active Sourcing & Tenders + Priority Action Center (Balanced 7 : 5 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left (7 cols): Active Sourcing & Tenders Widget */}
        <div className="lg:col-span-7">
          <ActiveSourcingEventsWidget
            onNavigateToRfps={(rfpId) => navigate('/rfps', rfpId ? { rfpId } : undefined)}
            selectedBuyerOrgId={selectedBuyerId}
          />
        </div>

        {/* Right (5 cols): Priority Action Center */}
        <div className="lg:col-span-5">
          <PriorityActionCenter
            tasks={priorityTasks}
            onExecuteAction={handleExecuteTaskAction}
            onNavigateToTasks={() => navigate('/tasks')}
          />
        </div>
      </div>

      {/* Row 4: Financial Intelligence & Buyer Concentration (Balanced 7 : 5 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left (7 cols): Cash Runway & Liquidity Flow Chart */}
        <div className="lg:col-span-7">
          <CashflowRunwayChart 
            onNavigateToInvoices={(params) => navigate('/invoices', params)}
            earlyPaymentEnabled={settings.earlyPaymentHighlighting}
            onAccelerateCash={() => navigate('/invoices', { earlyPay: true, invoiceNumber: 'INV-2026-022', timestamp: Date.now() })}
          />
        </div>

        {/* Right (5 cols): Buyer Concentration & DSO Donut Chart */}
        <div className="lg:col-span-5">
          <BuyerRevenueDonutChart 
            buyers={buyers}
            onNavigateToOrders={(buyerOrgId) => navigate('/orders', buyerOrgId ? { buyerOrgId } : undefined)}
            onNavigateToAsns={(buyerOrgId) => navigate('/asns', buyerOrgId ? { buyerOrgId } : undefined)}
            onNavigateToInvoices={(buyerOrgId) => navigate('/invoices', buyerOrgId ? { buyerOrgId } : undefined)}
          />
        </div>
      </div>

      {/* Row 5: Operational SLA & Quality Radar */}
      <OperationalSlaTrendChart 
        onNavigateToInvoices={() => navigate('/invoices')}
        onNavigateToAsns={() => navigate('/asns')}
        onNavigateToDocuments={() => navigate('/documents')}
      />

      {/* Row 6: Master Operations & Vault Launchpad (4-Card Grid) */}
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
