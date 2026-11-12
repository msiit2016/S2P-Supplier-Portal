import React, { useState, useMemo, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { broadcastPageContext, onPageAction, PageAction } from '../../services/pageActionBridge.js';
import { useSharedRfps, SourcingEvent } from '../../services/rfpService.js';
import { TransactionComment } from '../../types/index.js';
import { calculateDaysRemaining } from '../../utils/dateUtils.js';
import { useSupplierSettings } from '../../services/supplierSettingsService.js';
import { 
  FileText, 
  Send, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  Download, 
  Percent, 
  RotateCcw, 
  MessageSquare, 
  X, 
  ShieldCheck, 
  FileCheck2, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Check,
  Calendar,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SupplierRfpDetail: React.FC = () => {
  const { navigate, routeState } = usePortal();
  const { currentUser } = useAuth();
  const { 
    events, 
    getEventById, 
    updateLineItemPrice, 
    updateLineItemDiscount,
    updateTechnicalAnswer, 
    autoDraftResponses, 
    submitProposal, 
    reviseProposal,
    getComments,
    addComment
  } = useSharedRfps();

  // Find active event from routeState (eventId or eventNumber) or fallback to first event
  const targetId = routeState?.eventId || routeState?.eventNumber || routeState?.doc || 'src-apex-01';
  const activeEvent = useMemo(() => {
    return getEventById(targetId) || events[0];
  }, [events, targetId, getEventById]);

  // Page local state
  const { settings } = useSupplierSettings();
  const [showCollabDrawer, setShowCollabDrawer] = useState<boolean>(Boolean(routeState?.openCollab || routeState?.openMessages));
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [aiDrafting, setAiDrafting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Comments for this event
  const activeComments = activeEvent ? getComments(activeEvent.eventNumber) : [];

  // Bid calculations
  const totalBidAmount = useMemo(() => {
    if (!activeEvent) return 0;
    return activeEvent.lineItems.reduce((sum, item) => sum + (item.quantity * item.bidUnitPrice), 0);
  }, [activeEvent]);

  const totalTargetAmount = useMemo(() => {
    if (!activeEvent) return 0;
    return activeEvent.lineItems.reduce((sum, item) => sum + (item.quantity * (item.targetPrice || item.bidUnitPrice)), 0);
  }, [activeEvent]);

  const variancePercent = totalTargetAmount > 0 
    ? (((totalBidAmount - totalTargetAmount) / totalTargetAmount) * 100).toFixed(1) 
    : '0';

  // Accurate days remaining calculated dynamically from today's date
  const deadlineInfo = activeEvent ? calculateDaysRemaining(activeEvent.submissionDeadline) : null;

  // Broadcast live RFP detail context to Ava Copilot
  useEffect(() => {
    if (activeEvent) {
      broadcastPageContext({
        page: 'rfp-detail',
        eventId: activeEvent.id,
        eventNumber: activeEvent.eventNumber,
        title: activeEvent.title,
        buyerName: activeEvent.buyerName,
        estimatedValue: `$${activeEvent.estimatedValue.toLocaleString()}.00`,
        currentBid: `$${totalBidAmount.toLocaleString()}.00`,
        deadline: activeEvent.submissionDeadline,
        status: activeEvent.status,
        lineItemsCount: activeEvent.lineItems.length,
        variancePercent: `${variancePercent}%`
      });
    }
  }, [activeEvent, totalBidAmount, variancePercent]);

  // Listen to actions dispatched by Ava Copilot
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'OPEN_RFP_CLARIFICATION') {
        setShowCollabDrawer(true);
      } else if (action.action === 'AUTO_DRAFT_RFP') {
        handleAiDraftResponses();
      }
    });
    return cleanup;
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Tender Event Not Found</h2>
        <p className="text-xs text-slate-500">The requested sourcing proposal could not be loaded.</p>
        <button
          onClick={() => navigate('/rfps')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
        >
          ← Back to RFPs & Bids
        </button>
      </div>
    );
  }

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newMsg: TransactionComment = {
      id: `comm-rfp-${Date.now()}`,
      entityType: 'RFP',
      entityId: activeEvent.id,
      authorId: currentUser?.id || 'usr-current',
      authorName: currentUser?.name || 'Elena Rostova (Acme Industrial)',
      authorRole: 'SUPPLIER',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    addComment(activeEvent.eventNumber, newMsg);
    setNewCommentText('');
    setToastMsg('Tender clarification message sent to Buyer Sourcing Desk.');
  };

  const handleAiDraftComment = () => {
    setAiDrafting(true);
    setTimeout(() => {
      setNewCommentText(`Confirming proposal clarification for ${activeEvent.eventNumber}: High-throughput compute node cluster conforms to 99.99% availability SLA with sub-4 hour on-site MTTR. SOC 2 Type II and ISO 27001 certificates validated.`);
      setAiDrafting(false);
    }, 400);
  };

  const handleAiDraftResponses = async () => {
    setAiDrafting(true);
    setToastMsg('AI Sourcing Copilot analyzing RFP specifications against your Master Public Profile and Document Vault...');
    await new Promise(r => setTimeout(r, 1100));
    autoDraftResponses(activeEvent.id);
    setAiDrafting(false);
    setToastMsg('AI Sourcing Copilot successfully drafted technical questionnaire responses with verified citations.');
    setTimeout(() => setToastMsg(null), 5000);
  };



  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    submitProposal(activeEvent.id);
    setIsSubmitting(false);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    setToastMsg(`Bid for ${activeEvent.eventNumber} successfully submitted to ${activeEvent.buyerName}! Procurement team notified.`);
    setTimeout(() => setToastMsg(null), 6000);
  };

  const handleRevise = () => {
    reviseProposal(activeEvent.id);
    setToastMsg(`Proposal for ${activeEvent.eventNumber} unlocked for editing.`);
  };

  const handleExportTenderCsv = () => {
    const headers = ['Item Code', 'Description', 'Quantity', 'UOM', 'Target Price (USD)', 'Bid Unit Price (USD)', 'Extended Amount (USD)'];
    const rows = activeEvent.lineItems.map(it => [
      `"${it.itemNumber}"`,
      `"${it.description.replace(/"/g, '""')}"`,
      it.quantity,
      `"${it.uom}"`,
      it.targetPrice || '',
      it.bidUnitPrice,
      it.quantity * it.bidUnitPrice
    ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeEvent.eventNumber}_Pricing_Schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMsg(`Exported pricing schedule for ${activeEvent.eventNumber} to CSV.`);
  };

  const getBuyerInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-24 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-r-xl shadow-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 font-bold hover:underline text-xs cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Unified Master Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        {/* Top Bar: Return Link, Breadcrumbs, Badges & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          {/* Left: Back button & Breadcrumb cluster */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate('/rfps')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition cursor-pointer shrink-0"
              title="Return to RFPs & Bids directory"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
              <span>RFPs & Bids</span>
            </button>

            <span className="text-slate-300">/</span>

            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md">
              {activeEvent.eventNumber}
            </span>

            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
              activeEvent.type === 'RFP' ? 'bg-sky-50 text-sky-700 border-sky-200/70' :
              activeEvent.type === 'RFI' ? 'bg-teal-50 text-teal-700 border-teal-200/70' :
              'bg-indigo-50 text-indigo-700 border-indigo-200/70'
            }`}>
              {activeEvent.type} Tender
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              activeEvent.status === 'SUBMITTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
              activeEvent.status === 'IN_PROGRESS' ? 'bg-sky-50 text-sky-700 border-sky-200/80' :
              'bg-amber-50 text-amber-800 border-amber-200/80'
            }`}>
              {activeEvent.status === 'SUBMITTED' ? 'Proposal Submitted' : activeEvent.status === 'IN_PROGRESS' ? 'Drafting' : 'Needs Action'}
            </span>
          </div>

          {/* Right: Messages Toggle & Export CSV */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowCollabDrawer(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                showCollabDrawer 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span>Messages</span>
              {activeComments.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showCollabDrawer ? 'bg-purple-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  {activeComments.length}
                </span>
              )}
            </button>

            <button
              onClick={handleExportTenderCsv}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Middle Content: Title, Description, and Structured Meta Badges */}
        <div className="space-y-3 pt-1">
          {/* Header Title with High-Contrast Typography */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {activeEvent.title}
          </h1>

          {/* Scope Statement / Description: Highly Legible Prose Without Clunky Box */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
            {activeEvent.description}
          </p>

          {/* Structured Metadata Badges Strip (Clean chips, no messy bullet dots, no duplicate deadline) */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {/* Enterprise Buyer Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200/90 text-xs font-semibold text-slate-800 transition shadow-2xs">
              <div className="w-4 h-4 rounded bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                {getBuyerInitials(activeEvent.buyerName)}
              </div>
              <span>{activeEvent.buyerName}</span>
              <span className="text-[10px] text-slate-400 font-normal">Buyer</span>
            </div>

            {/* Category Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium shadow-2xs">
              <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Category: <strong className="text-slate-900 font-semibold">{activeEvent.category}</strong></span>
            </div>

            {/* Published Date Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Published: <strong className="text-slate-800 font-semibold">{activeEvent.publishedDate}</strong></span>
            </div>

            {/* Deliverables Summary Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-800 font-semibold shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{activeEvent.lineItems.length} Deliverable Items ({activeEvent.lineItems.reduce((acc, it) => acc + it.quantity, 0)} Units)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-KPI Commercial Metric Strip (Clean, Balanced & Consistent) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* KPI 1: Proposed Bid Value */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Proposed Bid</div>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
              ${totalBidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] mt-0.5 truncate font-medium">
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border inline-block ${
                Number(variancePercent) <= 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                  : 'bg-amber-50 text-amber-700 border-amber-200/80'
              }`}>
                {Number(variancePercent) <= 0 ? `${variancePercent}% Competitive Edge` : `+${variancePercent}% vs Target`}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Buyer Target Budget */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Buyer Target Budget</div>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
              ${activeEvent.estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
              Target procurement ceiling
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: Closing SLA */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Closing SLA</div>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
              {activeEvent.submissionDeadline}
            </div>
            <div className={`text-[11px] mt-0.5 truncate font-semibold ${deadlineInfo?.urgent ? 'text-rose-600' : 'text-slate-500'}`}>
              {deadlineInfo?.text} • Submission countdown
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Deliverables Scope */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Deliverables Scope</div>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
              {activeEvent.lineItems.length} <span className="text-xs font-normal text-slate-500 font-sans">Line Items</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
              {activeEvent.lineItems.reduce((acc, it) => acc + it.quantity, 0)} total units conformed
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Sourcing Desk Messages Drawer / Panel (Expandable) */}
      {showCollabDrawer && (
        <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Sourcing Desk Collaboration Thread
                </h3>
                <span className="text-[11px] text-slate-500">
                  Direct tender clarification channel with {activeEvent.buyerName} procurement desk
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                {activeEvent.eventNumber}
              </span>
              <button
                onClick={() => setShowCollabDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message History */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {activeComments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="font-medium text-slate-500">No tender clarification messages yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ask questions on specifications, milestones, or submission terms.</p>
              </div>
            ) : (
              activeComments.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs ${
                    msg.authorRole === 'SUPPLIER'
                      ? 'bg-purple-50/50 border-purple-200 ml-6'
                      : 'bg-white border-slate-200 mr-6 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-[11px]">
                      {msg.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {msg.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Reply Box */}
          <form onSubmit={handleSendComment} className="pt-2 border-t border-purple-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reply to Sourcing Desk</span>
              <button
                type="button"
                onClick={handleAiDraftComment}
                disabled={aiDrafting}
                className="text-[11px] font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>{aiDrafting ? 'Drafting...' : 'AI Auto-Draft'}</span>
              </button>
            </div>
            <textarea
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Inquire on RFP specification addenda, MTTR requirements, or delivery schedule..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Clarification</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bill of Materials & Pricing Schedule (Interactive Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Bill of Materials & Pricing Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeEvent.lineItems.length} Deliverable Line Items • Real-time line-item pricing and editable discount calculations
          </p>
        </div>

        {/* Pricing Schedule Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap w-36 text-left font-semibold text-[11px]">
                  ITEM CODE
                </th>
                <th className="py-3 px-3.5 min-w-[240px] text-left font-semibold text-[11px]">
                  DESCRIPTION & SPECIFICATIONS
                </th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap w-24 font-semibold text-[11px]">
                  QTY / UOM
                </th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap w-32 font-semibold text-[11px]">
                  TARGET PRICE
                </th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap w-36 font-semibold text-[11px]">
                  YOUR UNIT BID (USD)
                </th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap w-32 font-semibold text-[11px]">
                  DISCOUNT (%)
                </th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap w-36 font-semibold text-[11px]">
                  EXTENDED TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeEvent.lineItems.map((item, idx) => {
                const variance = item.targetPrice 
                  ? (((item.bidUnitPrice - item.targetPrice) / item.targetPrice) * 100).toFixed(1)
                  : null;
                const isUnder = variance !== null && Number(variance) < 0;
                const isOver = variance !== null && Number(variance) > 0;
                const discountDisplay = variance !== null 
                  ? (Number(variance) <= 0 ? Math.abs(Number(variance)).toFixed(1) : (-Number(variance)).toFixed(1)) 
                  : '0.0';

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    {/* Col 1: Item Code (Split) */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap text-left">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md inline-block">
                        {item.itemNumber}
                      </span>
                    </td>

                    {/* Col 2: Description & Specifications (Split) */}
                    <td className="py-3.5 px-3.5 text-left">
                      <div className="text-slate-800 text-xs font-medium leading-relaxed">
                        {item.description}
                      </div>
                    </td>

                    {/* Col 3: Qty / UOM */}
                    <td className="py-3.5 px-3.5 text-center text-slate-700 font-semibold font-mono whitespace-nowrap">
                      {item.quantity} {item.uom}
                    </td>

                    {/* Col 4: Target Price */}
                    <td className="py-3.5 px-3.5 text-right font-mono text-slate-500 whitespace-nowrap">
                      ${item.targetPrice ? item.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                    </td>

                    {/* Col 5: Your Unit Bid (USD) with Integrated Prefix */}
                    <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                      <div className="relative inline-flex items-center">
                        <span className="absolute left-2.5 text-slate-400 font-mono text-xs pointer-events-none select-none font-semibold">$</span>
                        <input
                          type="number"
                          value={item.bidUnitPrice}
                          onChange={(e) => updateLineItemPrice(activeEvent.id, idx, parseFloat(e.target.value) || 0)}
                          className="w-28 pl-6 pr-2.5 py-1 text-right font-mono font-bold text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none shadow-2xs"
                        />
                      </div>
                    </td>

                    {/* Col 6: Editable Discount (%) */}
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                      <div className="relative inline-flex items-center">
                        <input
                          type="number"
                          step="0.5"
                          value={discountDisplay}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              updateLineItemDiscount(activeEvent.id, idx, val);
                            }
                          }}
                          className={`w-20 pr-6 pl-2.5 py-1 text-right font-mono font-bold text-xs border rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none shadow-2xs ${
                            isUnder 
                              ? 'bg-emerald-50/70 text-emerald-800 border-emerald-300' 
                              : isOver 
                                ? 'bg-amber-50/70 text-amber-800 border-amber-300' 
                                : 'bg-white text-slate-800 border-slate-300'
                          }`}
                          title="Set discount percentage relative to target ceiling price"
                        />
                        <span className="absolute right-2 text-slate-400 font-mono text-xs pointer-events-none select-none font-semibold">%</span>
                      </div>
                    </td>

                    {/* Col 7: Extended Total */}
                    <td className="py-3.5 px-3.5 text-right font-bold text-slate-900 font-mono text-xs whitespace-nowrap">
                      ${(item.quantity * item.bidUnitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50/90 border-t border-slate-200 font-semibold">
              <tr>
                <td colSpan={5} className="py-3 px-3.5 text-right text-xs text-slate-600">
                  Total Extended Proposed Schedule:
                </td>
                <td className="py-3 px-3.5 text-center font-mono text-xs whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                    Number(variancePercent) <= 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                      : 'bg-amber-50 text-amber-700 border-amber-200/80'
                  }`}>
                    {Number(variancePercent) <= 0 ? `${Math.abs(Number(variancePercent)).toFixed(1)}% Discount` : `+${variancePercent}% vs Target`}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono text-sm whitespace-nowrap">
                  ${totalBidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Technical Specifications & Compliance Attestations Studio */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Technical Specifications & Compliance Attestations</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise buyer compliance questions evaluating SLAs, security controls, and facility certifications.
            </p>
          </div>

          <button
            onClick={handleAiDraftResponses}
            disabled={aiDrafting}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{aiDrafting ? 'Drafting from Profile...' : 'Auto-Draft with AI'}</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {activeEvent.technicalQuestions.map((q, idx) => (
            <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 leading-snug">
                  Q{idx + 1}: {q.question}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {q.aiDrafted && (
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0 animate-in fade-in zoom-in-95 duration-200"
                      title="Auto-filled from Master Public Profile"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>AI Filled</span>
                    </span>
                  )}
                  {q.answer && (
                    <button
                      type="button"
                      onClick={() => updateTechnicalAnswer(activeEvent.id, idx, '')}
                      className="text-[10px] text-slate-400 hover:text-rose-600 font-medium transition cursor-pointer"
                      title="Clear answer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={2}
                value={q.answer}
                onChange={(e) => updateTechnicalAnswer(activeEvent.id, idx, e.target.value)}
                placeholder="Enter your response or click 'Auto-Draft with AI' to populate from your Master Public Profile and Document Vault..."
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Proposal Submission Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-4 sm:px-8 shadow-lg z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
              {getBuyerInitials(activeEvent.buyerName)}
            </div>
            <div>
              <div className="text-slate-900 font-semibold">
                Submitting as {currentUser?.organizationName || 'Acme Industrial Tech Inc.'}
              </div>
              <div className="text-[11px] text-slate-500">
                To: <strong className="text-slate-700">{activeEvent.buyerName}</strong> • {activeEvent.eventNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto sm:pr-28">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bid Value</div>
              <div className="text-sm font-bold font-mono text-slate-900">
                ${totalBidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setToastMsg('Draft proposal saved locally.')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Save Draft
            </button>

            {activeEvent.status === 'SUBMITTED' ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Proposal Submitted</span>
                </span>
                <button
                  type="button"
                  onClick={handleRevise}
                  className="px-3.5 py-2 text-xs font-semibold text-sky-700 hover:text-sky-900 border border-sky-200 bg-sky-50 rounded-xl transition cursor-pointer hover:bg-sky-100 shadow-2xs"
                  title="Unlock to make adjustments to your bid unit prices or questionnaire"
                >
                  Revise Proposal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting Proposal...' : 'Submit Formal Proposal'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

