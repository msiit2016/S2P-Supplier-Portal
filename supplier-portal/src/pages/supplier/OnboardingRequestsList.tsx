import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
import { 
  FileCheck2, 
  Search, 
  Eye, 
  Building2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Plus, 
  LayoutGrid, 
  Table as TableIcon,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';

interface OnboardingRequestCard {
  id: string;
  orgId: string;
  buyerName: string;
  initials: string;
  color: string;
  invitationCode: string;
  program: string;
  category: string;
  invitedBy: string;
  invitedDate: string;
  deadline: string;
  progressPercent: number;
  stageLabel: string;
  statusKey: 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'ACTIVE';
  statusLabel: string;
  statusBadgeBg: string;
  complianceScope: string;
  ctaText: string;
}

export const OnboardingRequestsList: React.FC = () => {
  const { navigate, setSelectedBuyerId } = usePortal();

  // State management
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'DATE_DESC' | 'PROGRESS_DESC'>('PRIORITY');
  
  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  // Canonical Mock Data for Onboarding Requests
  const requestCardsData: OnboardingRequestCard[] = [
    {
      id: 'inv-novatech-02',
      orgId: 'buyer-org-2',
      buyerName: 'NovaTech Aerospace & Defense',
      initials: 'NO',
      color: 'from-indigo-600 to-blue-700',
      invitationCode: 'INV-NOVATECH-8820',
      program: 'Defense Avionics & High-Tolerance Telemetry',
      category: 'Mission-Critical Aerospace Telemetry',
      invitedBy: 'Sarah Lin (S2P Vendor Operations)',
      invitedDate: 'Yesterday',
      deadline: 'Nov 20, 2026 (10d left)',
      progressPercent: 15,
      stageLabel: 'Stage 1 of 5: Registration Completed',
      statusKey: 'ACTION_REQUIRED',
      statusLabel: 'Action Needed',
      statusBadgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      complianceScope: 'ITAR Defense Attestation, NIST SP 800-171, Mil-Spec Quality Cert',
      ctaText: 'Start'
    },
    {
      id: 'inv-apex-01',
      orgId: 'buyer-org-1',
      buyerName: 'Apex Global Enterprises',
      initials: 'AP',
      color: 'from-emerald-600 to-teal-700',
      invitationCode: 'INV-APEX-2026',
      program: 'Cloud Infrastructure & High-Performance Hardware Supply',
      category: 'Enterprise Cloud Infrastructure & Hardware',
      invitedBy: 'Marcus Vance (VP Strategic Procurement)',
      invitedDate: 'Jan 14, 2026',
      deadline: 'Nov 30, 2026 (20d left)',
      progressPercent: 67,
      stageLabel: 'Stage 2 of 5: Form Submission',
      statusKey: 'IN_PROGRESS',
      statusLabel: 'In Progress (67%)',
      statusBadgeBg: 'bg-sky-50 text-sky-800 border-sky-200/80',
      complianceScope: 'IRS Form W-9, FedACH Remittance, Commercial COI, SOC 2 Type II',
      ctaText: 'Resume'
    },
    {
      id: 'inv-meridian-03',
      orgId: 'buyer-org-3',
      buyerName: 'Meridian Health Network',
      initials: 'ME',
      color: 'from-teal-600 to-cyan-700',
      invitationCode: 'INV-MERIDIAN-4011',
      program: 'Clinical Diagnostic & Hospital Lab Automation',
      category: 'Clinical Diagnostic & Lab Automation',
      invitedBy: 'David Chen (Global Procurement Lead)',
      invitedDate: '3 days ago',
      deadline: 'Under Buyer SLA Review',
      progressPercent: 100,
      stageLabel: 'Stage 3 of 5: Buyer Review & Adjudication',
      statusKey: 'UNDER_REVIEW',
      statusLabel: 'Under Buyer Review',
      statusBadgeBg: 'bg-teal-50 text-teal-800 border-teal-200/80',
      complianceScope: 'HIPAA Business Associate (BAA), $5M Malpractice COI, FDA QSR',
      ctaText: 'View Details'
    }
  ];

  // Filtering & Sorting
  const filteredCards = requestCardsData.filter(card => {
    if (clientFilter !== 'ALL' && card.orgId !== clientFilter) return false;
    if (statusFilter !== 'ALL' && card.statusKey !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        card.buyerName.toLowerCase().includes(q) ||
        card.invitationCode.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q) ||
        card.invitedBy.toLowerCase().includes(q) ||
        card.program.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'PRIORITY') {
      const order = { ACTION_REQUIRED: 1, IN_PROGRESS: 2, UNDER_REVIEW: 3, ACTIVE: 4 };
      return (order[a.statusKey] || 99) - (order[b.statusKey] || 99);
    }
    if (sortBy === 'PROGRESS_DESC') {
      return b.progressPercent - a.progressPercent;
    }
    return 0;
  });

  const handleOpenDetail = (card: OnboardingRequestCard) => {
    setSelectedBuyerId(card.orgId);
    navigate('/onboarding/detail', { 
      buyerOrgId: card.orgId, 
      invitationId: card.id,
      autoCopilot: card.statusKey === 'ACTION_REQUIRED'
    });
  };

  const getDetectedBuyer = (code: string) => {
    const c = code.trim().toUpperCase();
    if (!c) return null;
    if (c.includes('NOVA') || c.includes('AERO') || c.includes('8820')) {
      return { name: 'NovaTech Aerospace & Defense', program: 'Defense Avionics & High-Tolerance Telemetry', orgId: 'buyer-org-2' };
    }
    if (c.includes('APEX') || c.includes('2026')) {
      return { name: 'Apex Global Enterprises', program: 'Cloud Infrastructure & High-Performance Hardware', orgId: 'buyer-org-1' };
    }
    if (c.includes('MERI') || c.includes('4011')) {
      return { name: 'Meridian Health Network', program: 'Clinical Diagnostic & Hospital Lab Automation', orgId: 'buyer-org-3' };
    }
    return null;
  };

  const detectedBuyer = getDetectedBuyer(inviteCodeInput);

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    const detected = getDetectedBuyer(inviteCodeInput);
    setShowInviteModal(false);
    navigate('/onboarding/detail', { 
      invitationCode: inviteCodeInput.trim().toUpperCase(),
      buyerOrgId: detected?.orgId || 'buyer-org-2',
      autoCopilot: true 
    });
  };

  // Broadcast live Onboarding context to Ava
  useEffect(() => {
    broadcastPageContext({
      page: 'onboarding',
      totalRequests: requestCardsData.length,
      pendingCount: requestCardsData.filter(r => r.statusKey === 'ACTION_REQUIRED').length,
      inProgressCount: requestCardsData.filter(r => r.statusKey === 'IN_PROGRESS').length,
      underReviewCount: requestCardsData.filter(r => r.statusKey === 'UNDER_REVIEW').length,
      requests: requestCardsData.map(r => ({
        id: r.id,
        buyerOrgId: r.orgId,
        buyerName: r.buyerName,
        status: r.statusKey,
        deadlineDays: 10
      }))
    });
  }, [requestCardsData]);

  // Listen to actions dispatched by Ava
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'OPEN_INVITE_MODAL') {
        setShowInviteModal(true);
      } else if (action.action === 'FILTER_ONBOARDING_STATUS' && action.payload?.status) {
        setStatusFilter(action.payload.status);
      } else if (action.action === 'START_BUYER_DOSSIER' && action.payload?.buyerOrgId) {
        navigate('/onboarding/detail', { buyerOrgId: action.payload.buyerOrgId, autoCopilot: true });
      } else if (action.action === 'AUTO_FILL_QUESTIONNAIRE' && action.payload?.buyerOrgId) {
        navigate('/onboarding/detail', { buyerOrgId: action.payload.buyerOrgId, autoCopilot: true, autoFill: true });
      }
    });
    return cleanup;
  }, [navigate]);

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 1. Minimal Header Card (Matching Invoices & Orders) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Buyer Onboarding Requests
            </h1>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Manage invitations, compliance requirements, and buyer approvals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Enter Invitation Code CTA */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Redeem an invitation code from an enterprise buyer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Enter Invitation Code</span>
          </button>
        </div>
      </div>

      {/* 2. Minimal 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Widget 1: Total Requests */}
        <div 
          onClick={() => {
            setStatusFilter('ALL');
            setClientFilter('ALL');
          }}
          className={`bg-white p-3.5 rounded-xl border shadow-2xs hover:border-slate-300 transition-all cursor-pointer group ${
            statusFilter === 'ALL' && clientFilter === 'ALL' ? 'border-slate-400 ring-1 ring-slate-400/20' : 'border-slate-200/90'
          }`}
          title="Click to view all onboarding requests"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-600 transition-colors">
              Total Requests
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            3 <span className="text-xs font-normal text-slate-500 font-sans">Active</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-slate-700 font-medium truncate transition">
              Across 3 enterprise buyers
            </span>
            <Sparkline data={[1, 2, 2, 3, 3, 3]} color="#64748b" width={68} height={20} />
          </div>
        </div>

        {/* Widget 2: Action Required */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'ACTION_REQUIRED' ? 'ALL' : 'ACTION_REQUIRED')}
          className={`bg-white p-3.5 rounded-xl border shadow-2xs hover:border-amber-300 transition-all cursor-pointer group ${
            statusFilter === 'ACTION_REQUIRED' ? 'border-amber-400 ring-1 ring-amber-400/20 bg-amber-50/20' : 'border-slate-200/90'
          }`}
          title="Filter to requests requiring your action"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-amber-800 transition-colors">
              Action Required
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            1 <span className="text-xs font-normal text-slate-500 font-sans">Pending</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium truncate transition">
              NovaTech • Due in 10d
            </span>
            <Sparkline data={[3, 2, 2, 2, 1, 1]} color="#d97706" width={68} height={20} />
          </div>
        </div>

        {/* Widget 3: In Progress */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
          className={`bg-white p-3.5 rounded-xl border shadow-2xs hover:border-sky-300 transition-all cursor-pointer group ${
            statusFilter === 'IN_PROGRESS' ? 'border-sky-400 ring-1 ring-sky-400/20 bg-sky-50/20' : 'border-slate-200/90'
          }`}
          title="Filter to requests in progress"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-sky-800 transition-colors">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            1 <span className="text-xs font-normal text-slate-500 font-sans">In Draft</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-sky-700 font-medium truncate transition">
              Apex Global • 67% done
            </span>
            <Sparkline data={[35, 45, 52, 60, 67, 67]} color="#0284c7" width={68} height={20} />
          </div>
        </div>

        {/* Widget 4: Under Review */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'UNDER_REVIEW' ? 'ALL' : 'UNDER_REVIEW')}
          className={`bg-white p-3.5 rounded-xl border shadow-2xs hover:border-teal-300 transition-all cursor-pointer group ${
            statusFilter === 'UNDER_REVIEW' ? 'border-teal-400 ring-1 ring-teal-400/20 bg-teal-50/20' : 'border-slate-200/90'
          }`}
          title="Filter to requests under buyer review"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-teal-800 transition-colors">
              Under Review
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            1 <span className="text-xs font-normal text-slate-500 font-sans">Submitted</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-teal-700 group-hover:text-teal-800 font-medium truncate transition">
              Meridian • Nov 4
            </span>
            <Sparkline data={[0, 0, 1, 1, 1, 1]} color="#0d9488" width={68} height={20} />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls Toolbar (Consistent with RFPs & Tasks single-tier layout) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 text-xs">
          {/* Search Bar with Clear Button (Flexible Left) */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search requests, buyers, codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/70"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters, Sort & View Mode Cluster (Cohesive Right) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Buyer Filter Dropdown */}
            <FilterSelect
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              title="Filter by enterprise buyer"
            >
              <option value="ALL">All Buyers ({requestCardsData.length})</option>
              <option value="buyer-org-2">NovaTech Aerospace (1 action req)</option>
              <option value="buyer-org-1">Apex Global (1 in draft)</option>
              <option value="buyer-org-3">Meridian Health (1 under review)</option>
            </FilterSelect>

            {/* Status Filter Dropdown */}
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by onboarding status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTION_REQUIRED">Action Needed (1)</option>
              <option value="IN_PROGRESS">In Progress (1)</option>
              <option value="UNDER_REVIEW">Under Review (1)</option>
            </FilterSelect>

            {/* Sort Dropdown */}
            <FilterSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              title="Sort Onboarding Requests"
            >
              <option value="PRIORITY">Priority (Action First)</option>
              <option value="PROGRESS_DESC">Highest Progress</option>
            </FilterSelect>

            {/* Reset Filters Shortcut */}
            {(clientFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery.trim() !== '') && (
              <button
                onClick={() => {
                  setClientFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer px-1"
              >
                Reset Filters
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">List</span>
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MINIMAL GRID / CARD VIEW                                               */}
      {/* ========================================================================= */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            return (
              <div
                key={card.id}
                onClick={() => handleOpenDetail(card)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-xs transition-all group cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Card Header: Initials, Buyer Name, Program & Status Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}>
                        {card.initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-emerald-700 transition-colors truncate">
                          {card.buyerName}
                        </h3>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {card.program}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${card.statusBadgeBg}`}>
                      {card.statusLabel}
                    </span>
                  </div>

                  {/* Minimal 2-Column Metadata Strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                    <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invitation Code</div>
                      <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 truncate">
                        {card.invitationCode}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deadline</div>
                      <div className="font-semibold text-slate-800 text-[11px] mt-0.5 truncate">
                        {card.deadline}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Stage Indicator */}
                  <div className="pt-0.5">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium truncate">{card.stageLabel}</span>
                      <span className="font-mono font-bold text-slate-900 ml-2">{card.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          card.progressPercent === 100
                            ? 'bg-teal-500'
                            : card.progressPercent > 50
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${card.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Zone */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(card);
                    }}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition flex items-center justify-center cursor-pointer"
                  >
                    <span>{card.ctaText}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/communications', { buyerOrgId: card.orgId });
                    }}
                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer"
                    title={`Message ${card.buyerName} Procurement Lead`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DENSE TABLE / LEDGER VIEW                                              */}
      {/* ========================================================================= */}
      {viewMode === 'TABLE' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[960px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4">ENTERPRISE BUYER</th>
                  <th className="py-3 px-3">INVITATION CODE</th>
                  <th className="py-3 px-3">S2P PROGRAM</th>
                  <th className="py-3 px-3">STAGE &amp; STATUS</th>
                  <th className="py-3 px-3">PROGRESS</th>
                  <th className="py-3 px-3">DEADLINE</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCards.map((card) => {
                  return (
                    <tr
                      key={card.id}
                      onClick={() => handleOpenDetail(card)}
                      className="hover:bg-slate-50/90 cursor-pointer transition group"
                    >
                      {/* Buyer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${card.color} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                            {card.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                              {card.buyerName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Invited {card.invitedDate}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Invitation Code */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-800 border border-slate-200/60">
                          {card.invitationCode}
                        </span>
                      </td>

                      {/* Program */}
                      <td className="py-3.5 px-3 max-w-[260px]">
                        <div className="font-semibold text-slate-900 truncate" title={card.program}>
                          {card.program}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.statusBadgeBg}`}>
                          {card.statusLabel}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {card.stageLabel}
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                card.progressPercent === 100
                                  ? 'bg-teal-500'
                                  : card.progressPercent > 50
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${card.progressPercent}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-slate-800">
                            {card.progressPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                        {card.deadline}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(card);
                            }}
                            className={`w-28 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                              card.statusKey === 'UNDER_REVIEW'
                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            }`}
                          >
                            {card.ctaText}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MINIMAL MODAL: ENTER INVITATION CODE                                   */}
      {/* ========================================================================= */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Minimal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-4 h-4 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Enter Invitation Code</h3>
                  <p className="text-xs text-slate-500">Enter code to start onboarding with an enterprise buyer</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRedeemCode} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Invitation Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-NOVATECH-8820"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                  autoFocus
                />

                {/* Quick-select chips for zero-friction testing */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                  <span className="text-slate-400 font-medium">Sample codes:</span>
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('INV-NOVATECH-8820')}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    NovaTech
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('INV-APEX-2026')}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    Apex Global
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('INV-MERIDIAN-4011')}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    Meridian
                  </button>
                </div>
              </div>

              {/* Detected Buyer Match Preview */}
              {detectedBuyer && (
                <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-emerald-950 truncate">{detectedBuyer.name}</div>
                    <div className="text-[11px] text-emerald-800 truncate">{detectedBuyer.program}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                    Matched
                  </span>
                </div>
              )}

              {/* Minimal Pre-Fill Note */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified Master Profile records (W-9, ACH, COI) will automatically pre-fill.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inviteCodeInput.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-semibold shadow-2xs transition cursor-pointer"
                >
                  Start Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
