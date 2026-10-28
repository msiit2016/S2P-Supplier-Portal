import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { 
  BuyerSpecificProfile, 
  PurchaseOrder, 
  Invoice, 
  AdvanceShippingNotice,
  TransactionComment,
  GlobalSupplierProfile 
} from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { 
  Building2, 
  Globe, 
  ShoppingCart, 
  Receipt, 
  Zap, 
  FileCheck2, 
  MessageSquare, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Plus, 
  RefreshCw, 
  Truck, 
  Clock, 
  Send, 
  Lock, 
  Download,
  Share2,
  Calendar,
  Layers,
  FileText,
  ExternalLink,
  DollarSign,
  ClipboardList
} from 'lucide-react';

export const BuyerWorkspaceHub: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    navigate, 
    selectedBuyerId, 
    setSelectedBuyerId,
    selectedBuyerTab,
    setSelectedBuyerTab
  } = usePortal();

  // Core Data
  const [buyers, setBuyers] = useState<BuyerSpecificProfile[]>([]);
  const [globalProfile, setGlobalProfile] = useState<GlobalSupplierProfile | null>(null);
  
  // Workspace Tab
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'ONBOARDING' | 'ORDERS' | 'ASN' | 'INVOICES' | 'DISPUTES' | 'SETTINGS'>('ONBOARDING');
  
  // Data for selected buyer
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [asns, setAsns] = useState<AdvanceShippingNotice[]>([]);
  const [comments, setComments] = useState<TransactionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals & Sliders
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newInvitationCode, setNewInvitationCode] = useState('');
  
  // PO actions
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showAsnModal, setShowAsnModal] = useState(false);
  const [carrier, setCarrier] = useState('FedEx Freight Priority');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [asnEstimatedDelivery, setAsnEstimatedDelivery] = useState('2026-11-04');
  const [asnPackageCount, setAsnPackageCount] = useState(2);
  
  // 1-Click PO Flip modal
  const [showFlipModal, setShowFlipModal] = useState(false);
  const [flipInvoiceNum, setFlipInvoiceNum] = useState('');
  const [flipTaxRate, setFlipTaxRate] = useState(8.25);

  // Early Payment (Dynamic Discounting)
  const [daysEarly, setDaysEarly] = useState<number>(20);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [submittingEarlyPay, setSubmittingEarlyPay] = useState(false);

  // Bi-directional sync state
  const [syncingBiDirectional, setSyncingBiDirectional] = useState(false);

  // Sync tab with portal context if passed
  useEffect(() => {
    if (selectedBuyerTab && ['ONBOARDING', 'ORDERS', 'ASN', 'INVOICES', 'DISPUTES', 'SETTINGS'].includes(selectedBuyerTab)) {
      setActiveWorkspaceTab(selectedBuyerTab as any);
    }
  }, [selectedBuyerTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, gRes] = await Promise.all([
        ApiClient.getBuyerProfiles(),
        ApiClient.getGlobalProfile()
      ]);

      if (bRes?.buyerProfiles) {
        setBuyers(bRes.buyerProfiles);
        const buyerToUse = selectedBuyerId || bRes.buyerProfiles[0]?.buyerOrgId || 'buyer-org-1';
        if (!selectedBuyerId) {
          setSelectedBuyerId(buyerToUse);
        }
        await loadBuyerScopedTransactions(buyerToUse);
      }
      if (gRes?.profile) {
        setGlobalProfile(gRes.profile);
      }
    } catch (err) {
      console.error('Failed to load buyer workspaces', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerScopedTransactions = async (buyerOrgId: string) => {
    try {
      const param = buyerOrgId === 'ALL' ? undefined : buyerOrgId;
      const [orderRes, invRes, asnRes] = await Promise.all([
        ApiClient.getOrders(param),
        ApiClient.getInvoices(param),
        ApiClient.getASNs(param)
      ]);

      if (orderRes?.orders) {
        setOrders(orderRes.orders);
        if (orderRes.orders.length > 0) {
          setSelectedPO(orderRes.orders[0]);
        } else {
          setSelectedPO(null);
        }
      }
      if (invRes?.invoices) {
        setInvoices(invRes.invoices);
        if (invRes.invoices.length > 0) {
          setSelectedInvoice(invRes.invoices[0]);
        } else {
          setSelectedInvoice(null);
        }
      }
      if (asnRes?.asns) {
        setAsns(asnRes.asns);
      }
    } catch (err) {
      console.error('Failed to load buyer transactions', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedBuyerId) {
      loadBuyerScopedTransactions(selectedBuyerId);
    }
  }, [selectedBuyerId]);

  const isAllWorkspaces = selectedBuyerId === 'ALL';

  const activeBuyer = isAllWorkspaces
    ? {
        id: 'all-buyers',
        buyerOrgId: 'ALL',
        buyerName: 'All Enterprise Client Workspaces',
        buyerDomain: 'verisource.network',
        buyerLogoText: 'ALL',
        relationshipStatus: 'ACTIVE' as const,
        erpVendorId: 'MULTI-CLIENT',
        connectedSince: 'Jan 2024 - Present',
        syncCompletenessScore: 96,
        negotiatedTerms: { paymentTerms: 'Multi-Buyer (2/10 Net 30, Net 45)', earlyPaymentEligible: true, preferredPaymentMethod: 'ACH_CREDIT' as const },
        customRemittanceAccount: { bankName: 'Multi-Bank Corporate Routing Active', accountEnding: 'Chase & SVB', routingNumberMasked: '••••', currency: 'USD', accountNickName: 'Multi-Account Escrow & Operating' },
        customQuestionnaires: [],
        customDocumentOverrides: [],
        customCatalogTier: 'ENTERPRISE',
        lastSyncedAt: new Date().toISOString()
      }
    : (buyers.find(b => b.buyerOrgId === selectedBuyerId) || buyers[0]);

  // Dynamic Discounting calculation
  const calculateDiscount = () => {
    if (!selectedInvoice) return { discountPercent: 2.0, discountAmount: 0, netPayout: 0, payoutDate: '48 Hours' };
    const ratePerDay = 0.001; // 0.1% per day
    const discountPercent = Math.min(3.5, Math.max(1.0, Math.round(daysEarly * ratePerDay * 100 * 10) / 10));
    const discountAmount = Math.round(selectedInvoice.totalAmount * (discountPercent / 100) * 100) / 100;
    const netPayout = Math.round((selectedInvoice.totalAmount - discountAmount) * 100) / 100;
    const payoutDate = new Date(Date.now() + 48 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { discountPercent, discountAmount, netPayout, payoutDate };
  };

  const discountTerms = calculateDiscount();

  const getPOStatusBadge = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'ACKNOWLEDGED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'DELIVERED':
      case 'CLOSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'THREE_WAY_MATCHED':
      case 'MATCHED':
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING_CLEARANCE':
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DISPUTED':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // PO Acknowledgment (ACK)
  const handleAcknowledgePO = async (poId: string) => {
    try {
      const res = await ApiClient.acknowledgeOrder(poId);
      setActionSuccess(`Order ${res.order.poNumber} Acknowledged with zero delay.`);
      await loadBuyerScopedTransactions(selectedBuyerId);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to acknowledge order');
    }
  };

  // Dispatch ASN
  const handleDispatchASN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const track = trackingNumber || `7948-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await ApiClient.dispatchASN(selectedPO.id, {
        carrier,
        trackingNumber: track,
        estimatedDelivery: asnEstimatedDelivery
      });
      setShowAsnModal(false);
      setTrackingNumber('');
      setActionSuccess(`🚚 Advance Shipping Notice dispatched for ${selectedPO.poNumber}! Tracking: ${track}`);
      await loadBuyerScopedTransactions(selectedBuyerId);
      setActiveWorkspaceTab('ASN');
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch ASN');
    }
  };

  // Generate Tracking Number
  const handleGenerateTracking = () => {
    const prefix = carrier.includes('FedEx') ? '7948' : carrier.includes('UPS') ? '1Z99' : 'DHL';
    setTrackingNumber(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // 1-Click PO Flip to Invoice
  const handleFlipInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const res = await ApiClient.flipPOToInvoice(selectedPO.id, {
        invoiceNumber: flipInvoiceNum,
        taxRate: flipTaxRate / 100
      });
      setShowFlipModal(false);
      setActionSuccess(`🎉 1-Click PO Flip Complete! ${res.invoice.invoiceNumber} created with 3-Way Match Confirmed.`);
      await loadBuyerScopedTransactions(selectedBuyerId);
      setActiveWorkspaceTab('INVOICES');
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to flip PO to invoice');
    }
  };

  // Accept Early Payment
  const handleAcceptEarlyPayment = async () => {
    if (!selectedInvoice) return;
    try {
      setSubmittingEarlyPay(true);
      const res = await ApiClient.acceptEarlyPayment(selectedInvoice.id, {
        discountPercent: discountTerms.discountPercent,
        daysEarly
      });
      setActionSuccess(res.message || 'Early settlement scheduled! Funds deposited in 48 business hours.');
      await loadBuyerScopedTransactions(selectedBuyerId);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to accept early payment');
    } finally {
      setSubmittingEarlyPay(false);
    }
  };

  // Bi-Directional Sync: Buyer Workspace -> Master Profile ("vica versa")
  const handleSyncToMaster = async () => {
    if (!activeBuyer) return;
    try {
      setSyncingBiDirectional(true);
      const updates = {
        masterVault: {
          insuranceStatus: 'VERIFIED',
          insuranceCoverageAmount: '$5,000,000 Aggregated Commercial & Cargo Endorsed',
          insuranceExpiryDate: '2027-11-30'
        }
      };
      const res = await ApiClient.syncToMaster(updates, activeBuyer.buyerName);
      setActionSuccess(res.message);
      await loadData();
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (err) {
      alert('Failed to sync changes to Master Profile');
    } finally {
      setSyncingBiDirectional(false);
    }
  };

  // Agentic Auto-fill: Master Profile -> Buyer Workspace
  const handleAutoFillFromMaster = async () => {
    if (!activeBuyer) return;
    try {
      setSyncingBiDirectional(true);
      const res = await ApiClient.syncBuyerProfileAi(activeBuyer.buyerOrgId);
      setActionSuccess(`🎉 1-Click Auto-Fill Complete: ${res.syncedFieldsCount} fields populated from Master Profile! Completeness: ${res.syncScore}%`);
      await loadData();
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (err) {
      alert('Failed to auto-fill from Master Profile');
    } finally {
      setSyncingBiDirectional(false);
    }
  };

  // Connect new buyer
  const handleConnectNewBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.connectNewBuyer({
        buyerName: newBuyerName,
        invitationCode: newInvitationCode
      });
      setShowConnectModal(false);
      setNewBuyerName('');
      setNewInvitationCode('');
      setActionSuccess(res.message);
      await loadData();
      if (res.buyerProfile) {
        setSelectedBuyerId(res.buyerProfile.buyerOrgId);
      }
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      alert('Failed to connect new buyer');
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const item: TransactionComment = {
      id: `comm-${Date.now()}`,
      entityType: 'PO',
      entityId: selectedPO?.id || 'po-101',
      authorId: currentUser?.id || 'usr',
      authorName: currentUser?.name || 'David Reynolds',
      authorRole: 'SUPPLIER',
      text: newComment,
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, item]);
    setNewComment('');
  };

  if (loading || !activeBuyer) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
        Loading your Enterprise Buyer Workspaces...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-r-xl shadow-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center space-x-2.5 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:underline text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* CLEAN WORKSPACE BREADCRUMB & BUYER CONTEXT BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Top row: Breadcrumb + Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs text-slate-500 flex-wrap gap-y-1">
            <button onClick={() => navigate('/dashboard')} className="hover:text-emerald-600 font-medium">Dashboard</button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button onClick={() => setSelectedBuyerId('ALL')} className="hover:text-emerald-600 font-medium">Workspaces</button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900">{activeBuyer.buyerName}</span>
            {selectedBuyerId !== 'ALL' && (
              <button
                onClick={() => setSelectedBuyerId('ALL')}
                className="ml-2 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition flex items-center gap-1"
                title="Switch back to All Workspaces cross-buyer view"
              >
                <span>← View All Workspaces</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSyncToMaster}
              disabled={syncingBiDirectional}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              title="Push updates from this buyer back to your Master Profile"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${syncingBiDirectional ? 'animate-spin' : ''}`} />
              <span>Sync to Master Profile</span>
            </button>

            <button
              onClick={handleAutoFillFromMaster}
              disabled={syncingBiDirectional}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
              title="Auto-fill requirements from Master Profile"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto-Fill from Master</span>
            </button>
          </div>
        </div>

        {/* Middle row: Buyer title + quick meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              {activeBuyer.buyerLogoText.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {activeBuyer.buyerName} Workspace
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeBuyer.relationshipStatus === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {activeBuyer.relationshipStatus === 'ACTIVE' ? '100% Verified' : 'Action Needed'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2.5">
                <span>ERP Code: <code className="text-slate-700 font-mono font-semibold">{activeBuyer.erpVendorId || 'VEND-8821'}</code></span>
                <span>•</span>
                <span>Partner Since: <strong className="text-slate-700">{activeBuyer.connectedSince}</strong></span>
                <span>•</span>
                <span>Terms: <strong className="text-slate-700">{activeBuyer.negotiatedTerms.paymentTerms}</strong></span>
                <span>•</span>
                <span>Remittance: <strong className="text-slate-700">{activeBuyer.customRemittanceAccount?.accountNickName || activeBuyer.customRemittanceAccount?.bankName?.split(' ')[0] || 'Chase Operating'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600">Master Data Synced: <strong className="text-slate-900">{activeBuyer.syncCompletenessScore}%</strong></span>
          </div>
        </div>

        {/* Bottom row: Quick buyer switcher pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Switch Buyer:</span>
          <button
            onClick={() => setSelectedBuyerId('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shrink-0 ${
              selectedBuyerId === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🌟 All Workspaces</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
          </button>
          {buyers.map((b) => {
            const isSelected = activeBuyer.buyerOrgId === b.buyerOrgId;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBuyerId(b.buyerOrgId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{b.buyerName}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${b.relationshipStatus === 'ACTIVE' ? 'bg-emerald-300' : 'bg-amber-400'}`}></span>
              </button>
            );
          })}

          <button
            onClick={() => setShowConnectModal(true)}
            className="px-3 py-1.5 border border-dashed border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Buyer</span>
          </button>
        </div>
      </div>

      {/* BUYER OPERATIONS COCKPIT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Sub-Tabs Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center space-x-2 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveWorkspaceTab('ONBOARDING')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeWorkspaceTab === 'ONBOARDING'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Onboarding & Compliance</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {activeBuyer.syncCompletenessScore}%
            </span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('ORDERS')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeWorkspaceTab === 'ORDERS'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Orders ({orders.length})</span>
          </button>

          {/* DEDICATED SHIPPING & ASNs TAB */}
          <button
            onClick={() => setActiveWorkspaceTab('ASN')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeWorkspaceTab === 'ASN'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Shipping & ASNs ({asns.length})</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('INVOICES')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeWorkspaceTab === 'INVOICES'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Invoices & Payments ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('SETTINGS')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeWorkspaceTab === 'SETTINGS'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Remittance Bank & Terms</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('DISPUTES')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeWorkspaceTab === 'DISPUTES'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Disputes & Inquiries</span>
          </button>
        </div>

        {/* TAB PANES */}
        <div className="p-6">
          {/* 1. ONBOARDING & COMPLIANCE PANE */}
          {activeWorkspaceTab === 'ONBOARDING' && (
            <div className="space-y-6">
              {/* Progress & Bi-directional sync card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Self-Serve Autonomous Onboarding Readiness</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {activeBuyer.syncCompletenessScore === 100 
                      ? 'Fully Verified & Ready for Automated Purchase Orders' 
                      : `${100 - activeBuyer.syncCompletenessScore}% Action Needed for Vendor Activation`}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                    This buyer has specific policy questions. <strong>94% was auto-populated from your Master Public Profile</strong> with zero manual entry.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                    title="Launch multi-step self-service onboarding wizard"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Launch Onboarding Wizard</span>
                  </button>
                  <button
                    onClick={handleAutoFillFromMaster}
                    disabled={syncingBiDirectional}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Auto-Fill from Master</span>
                  </button>
                </div>
              </div>

              {/* Specific Buyer Declarations & Questionnaires */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {activeBuyer.buyerName} Specific Policy Declarations
                </h4>
                {activeBuyer.customQuestionnaires.map((q) => (
                  <div key={q.questionId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{q.questionText}</span>
                      <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {q.category}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                      {q.answer}
                    </div>
                  </div>
                ))}
              </div>

              {/* Document Overrides */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Buyer-Dedicated Certificates & Endorsements
                </h4>
                {activeBuyer.customDocumentOverrides.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    No custom document overrides required. This buyer accepts your universal Master Vault documents (IRS W-9, ACORD 25, ISO 27001).
                  </div>
                ) : (
                  activeBuyer.customDocumentOverrides.map((doc, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{doc.documentName}</div>
                          {doc.note && <div className="text-[11px] text-amber-800 mt-0.5 font-medium">{doc.note}</div>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'COMPLIANT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {doc.status.replace(/_/g, ' ')}
                        </span>
                        {doc.status !== 'COMPLIANT' && (
                          <button
                            onClick={handleSyncToMaster}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
                          >
                            Upload & Sync to Master
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. PURCHASE ORDERS PANE */}
          {activeWorkspaceTab === 'ORDERS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Purchase Orders from {activeBuyer.buyerName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Receive and acknowledge approved purchase orders, dispatch shipping notices (ASN), and perform 1-click PO flips into matched invoices.
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  Total Orders: <strong>{orders.length}</strong> (${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()})
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs border border-slate-200 rounded-2xl bg-slate-50">
                  No purchase orders issued yet by {activeBuyer.buyerName}.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left List */}
                  <div className="lg:col-span-5 space-y-3">
                    {orders.map((po) => {
                      const isSelected = selectedPO?.id === po.id;
                      return (
                        <div
                          key={po.id}
                          onClick={() => setSelectedPO(po)}
                          className={`p-4 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{po.poNumber}</div>
                              <div className="text-xs text-slate-500 mt-0.5">Terms: {po.paymentTerms}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-slate-900 font-mono">
                                ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPOStatusBadge(po.status)}`}>
                                {po.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Detail & Actions */}
                  <div className="lg:col-span-7">
                    {selectedPO ? (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <div>
                            <div className="text-lg font-bold text-slate-900">{selectedPO.poNumber}</div>
                            <div className="text-xs text-slate-500">Promised Delivery: {selectedPO.promisedDate}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedPO.status === 'ISSUED' && (
                              <button
                                onClick={() => handleAcknowledgePO(selectedPO.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Acknowledge</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setShowAsnModal(true);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Create ASN</span>
                            </button>
                            <button
                              onClick={() => {
                                setFlipInvoiceNum(`INV-${selectedPO.poNumber.replace('PO-', '')}-01`);
                                setShowFlipModal(true);
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>1-Click PO Flip</span>
                            </button>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500">
                                <th className="py-2">Part Number</th>
                                <th className="py-2">Description</th>
                                <th className="py-2 text-right">Qty</th>
                                <th className="py-2 text-right">Unit Price</th>
                                <th className="py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {selectedPO.lineItems.map((li) => (
                                <tr key={li.id}>
                                  <td className="py-2.5 font-mono text-slate-700">{li.partNumber}</td>
                                  <td className="py-2.5 font-medium text-slate-900">{li.description}</td>
                                  <td className="py-2.5 text-right font-semibold">{li.quantity} {li.uom}</td>
                                  <td className="py-2.5 text-right">${li.unitPrice.toFixed(2)}</td>
                                  <td className="py-2.5 text-right font-bold text-slate-900">${li.totalPrice.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="pt-2 flex justify-between text-xs font-bold border-t border-slate-200">
                          <span>Total Order Value:</span>
                          <span className="text-emerald-700 text-sm">${selectedPO.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs">Select an order on the left.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. DEDICATED SHIPPING & ASNs (ADVANCE SHIPPING NOTICES) PANE */}
          {activeWorkspaceTab === 'ASN' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>Advance Shipping Notices (ASNs) & Fulfillment</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-advise {activeBuyer.buyerName}'s warehouse and receiving docks with tracking numbers and line item packing manifests.
                  </p>
                </div>

                <button
                  onClick={() => setShowAsnModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dispatch New ASN</span>
                </button>
              </div>

              {/* ASN List */}
              {asns.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs border border-slate-200 rounded-2xl bg-slate-50">
                  No shipping notices dispatched to {activeBuyer.buyerName} yet. Click "Dispatch New ASN" or create one from a Purchase Order.
                </div>
              ) : (
                <div className="space-y-3">
                  {asns.map((asn) => (
                    <div 
                      key={asn.id}
                      className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 hover:border-indigo-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            <Truck className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-slate-900 font-mono">{asn.asnNumber}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-700">Ref: <strong className="font-mono">{asn.poNumber}</strong></span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Carrier: <strong className="text-slate-700">{asn.carrier}</strong> • Tracking: <code className="text-indigo-600 font-bold">{asn.trackingNumber}</code>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right text-xs">
                            <div className="text-[10px] text-slate-400">ETA Delivery</div>
                            <div className="font-bold text-slate-800">{new Date(asn.estimatedDeliveryDate).toLocaleDateString()}</div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {asn.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Line Items in ASN */}
                      <div className="bg-white rounded-xl p-3 border border-slate-200">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Dispatched Line Items ({asn.shippedItems.length}) • {asn.packageCount} Packages
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {asn.shippedItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-slate-700">
                              <span className="font-medium">
                                <code className="text-slate-500 mr-2 font-mono">{item.partNumber}</code>
                                {item.description}
                              </span>
                              <span className="font-bold text-slate-900">
                                {item.shippedQuantity} {item.uom}
                              </span>
                            </div>
                          ))}
                        </div>
                        {asn.notes && (
                          <div className="mt-2 text-[11px] text-slate-500 italic border-t border-slate-100 pt-1.5">
                            Dock Note: {asn.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. INVOICES & PAYMENTS PANE */}
          {activeWorkspaceTab === 'INVOICES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">E-Invoicing & Accounts Payable with {activeBuyer.buyerName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track real-time 3-way matching, invoice clearance statuses, and convert approved invoices into immediate liquidity.
                  </p>
                </div>
              </div>

              {invoices.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs border border-slate-200 rounded-2xl bg-slate-50">
                  No invoices billed to {activeBuyer.buyerName} yet. Flip an order under the Purchase Orders tab to create one!
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Invoices List */}
                  <div className="lg:col-span-5 space-y-3">
                    {invoices.map((inv) => {
                      const isSelected = selectedInvoice?.id === inv.id;
                      return (
                        <div
                          key={inv.id}
                          onClick={() => setSelectedInvoice(inv)}
                          className={`p-4 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</div>
                              <div className="text-xs text-slate-500 mt-0.5">Due: {inv.dueDate}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-slate-900 font-mono">
                                ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getInvoiceStatusBadge(inv.matchStatus)}`}>
                                {inv.matchStatus.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Dynamic Discounting / Early Payment Workbench */}
                  <div className="lg:col-span-7">
                    {selectedInvoice ? (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <div>
                            <div className="text-lg font-bold text-slate-900">{selectedInvoice.invoiceNumber}</div>
                            <div className="text-xs text-slate-500">Maturity Date: {selectedInvoice.dueDate} • Status: {selectedInvoice.paymentStatus}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-extrabold text-slate-900">${selectedInvoice.totalAmount.toLocaleString()}</div>
                          </div>
                        </div>

                        {/* Early Settlement Accelerator Card */}
                        {selectedInvoice.paymentStatus !== 'PAID' && (
                          <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span>Get Paid Faster: Dynamic Settlement Accelerator</span>
                              </span>
                              <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                {daysEarly} Days Early
                              </span>
                            </div>

                            <input
                              type="range"
                              min="1"
                              max="28"
                              step="1"
                              value={daysEarly}
                              onChange={(e) => setDaysEarly(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />

                            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Discount Fee</span>
                                <div className="font-bold text-slate-800">-${discountTerms.discountAmount.toFixed(2)} ({discountTerms.discountPercent}%)</div>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Direct Deposit</span>
                                <div className="font-bold text-emerald-700">{discountTerms.payoutDate}</div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Net Payout</span>
                                <div className="font-extrabold text-emerald-700 text-sm">${discountTerms.netPayout.toLocaleString()}</div>
                              </div>
                            </div>

                            <button
                              onClick={handleAcceptEarlyPayment}
                              disabled={submittingEarlyPay}
                              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition"
                            >
                              {submittingEarlyPay ? 'Scheduling Payout...' : `Confirm & Request Early Payout ($${discountTerms.netPayout.toLocaleString()})`}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs">Select an invoice on the left.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. REMITTANCE & TERMS SETTINGS PANE */}
          {activeWorkspaceTab === 'SETTINGS' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Dedicated Remittance Bank Account</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Where {activeBuyer.buyerName} sends payments. You can isolate accounts between different buyers.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active & Encrypted
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Selected Routing Account:</span>
                    <strong className="text-slate-900 font-semibold">
                      {activeBuyer.customRemittanceAccount?.bankName} ({activeBuyer.customRemittanceAccount?.accountEnding})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Delivery Protocol:</span>
                    <span className="font-mono text-slate-800">
                      {activeBuyer.negotiatedTerms.preferredPaymentMethod === 'WIRE' ? 'FedWire Direct Deposit' : 'NACHA Automated Clearing House (ACH)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Security Verification:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>EWS & Plaid Direct Bank Anchor Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Negotiated Terms */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Contracted Commercial Terms</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Standard Terms</div>
                    <div className="text-slate-900 font-bold mt-0.5">{activeBuyer.negotiatedTerms.paymentTerms}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Billing Currency</div>
                    <div className="text-slate-900 font-bold mt-0.5">{activeBuyer.customRemittanceAccount?.currency || 'USD'}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Payment Method</div>
                    <div className="text-slate-900 font-bold mt-0.5">{activeBuyer.negotiatedTerms.preferredPaymentMethod}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. DISPUTES & MESSAGES PANE */}
          {activeWorkspaceTab === 'DISPUTES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Direct Collaboration with {activeBuyer.buyerName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Messages here attach directly to your customer account and active transactions.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 flex flex-col h-[450px]">
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No active dispute inquiries from {activeBuyer.buyerName}.
                    </div>
                  ) : (
                    comments.map((c) => {
                      const isMe = c.authorRole === 'SUPPLIER';
                      return (
                        <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="text-[10px] text-slate-400 px-1 mb-1">
                            {c.authorName} • {c.authorRole}
                          </div>
                          <div className={`p-3 rounded-2xl text-xs max-w-md ${
                            isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                          }`}>
                            {c.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 bg-white rounded-b-2xl flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Message ${activeBuyer.buyerName} procurement or accounts payable...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button type="submit" className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dispatch ASN Modal */}
      {showAsnModal && selectedPO && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2.5 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Truck className="w-4.5 h-4.5" />
              <span>Dispatch Shipping Notice (ASN)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Advance Shipping Notice</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Pre-advise <strong>{activeBuyer.buyerName}</strong> for receiving order <strong className="font-mono">{selectedPO.poNumber}</strong>.
            </p>

            <form onSubmit={handleDispatchASN} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Logistics Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="FedEx Freight Priority">FedEx Freight Priority</option>
                  <option value="UPS Supply Chain Solutions">UPS Supply Chain Solutions</option>
                  <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                  <option value="Estes Express Lines">Estes Express Lines</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Tracking Number / BOL</label>
                  <button
                    type="button"
                    onClick={handleGenerateTracking}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7948-2910-4821"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Delivery</label>
                  <input
                    type="date"
                    value={asnEstimatedDelivery}
                    onChange={(e) => setAsnEstimatedDelivery(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Count</label>
                  <input
                    type="number"
                    min="1"
                    value={asnPackageCount}
                    onChange={(e) => setAsnPackageCount(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button" 
                  onClick={() => setShowAsnModal(false)} 
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                >
                  Dispatch ASN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click PO Flip Modal */}
      {showFlipModal && selectedPO && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Touchless PO-to-Invoice Flip</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Converts {selectedPO.poNumber} 1:1 into an electronic invoice for 3-way matching.</p>
            <form onSubmit={handleFlipInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={flipInvoiceNum}
                  onChange={(e) => setFlipInvoiceNum(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={flipTaxRate}
                  onChange={(e) => setFlipTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowFlipModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-bold shadow-md shadow-amber-500/20">
                  Execute Flip & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect New Buyer Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Connect New Enterprise Buyer</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter buyer details. Your Master Public Profile will automatically pre-populate 95%+ of their onboarding requirements.
            </p>
            <form onSubmit={handleConnectNewBuyer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer Organization Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lockheed Precision Systems Inc."
                  value={newBuyerName}
                  onChange={(e) => setNewBuyerName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invitation Code / Token (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. INV-BUYER-9921"
                  value={newInvitationCode}
                  onChange={(e) => setNewInvitationCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowConnectModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20">
                  Connect & Auto-Fill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
