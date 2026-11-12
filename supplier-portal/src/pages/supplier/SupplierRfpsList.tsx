import React, { useState, useMemo, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { broadcastPageContext, onPageAction, PageAction } from '../../services/pageActionBridge.js';
import { useSharedRfps, SourcingEvent } from '../../services/rfpService.js';
import { calculateDaysRemaining } from '../../utils/dateUtils.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
import { 
  FileCheck2, 
  Search, 
  Building2, 
  Clock, 
  DollarSign, 
  Download, 
  Layers, 
  RotateCcw, 
  X, 
  TrendingUp, 
  ArrowUpDown, 
  CheckCircle2, 
  ArrowRight, 
  LayoutGrid, 
  Table as TableIcon,
  Tag,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';

export const SupplierRfpsList: React.FC = () => {
  const { navigate } = usePortal();
  const { currentUser } = useAuth();
  const { events } = useSharedRfps();

  // Filters & Controls
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'SUBMITTED'>('ALL');
  const [sortBy, setSortBy] = useState<'DEADLINE' | 'VALUE_DESC' | 'STATUS'>('DEADLINE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [deadlineFilter, setDeadlineFilter] = useState<string | null>(null);
  const [showDeadlineModal, setShowDeadlineModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Buyer list
  const uniqueBuyers = Array.from(new Map(events.map(e => [e.buyerOrgId, e.buyerName])).entries());

  // Helper for computing days remaining dynamically relative to today's date
  const calculateDaysLeft = (dateStr: string): { days: number; text: string; urgent: boolean } => {
    const res = calculateDaysRemaining(dateStr);
    return {
      days: res.days,
      text: res.text,
      urgent: res.urgent
    };
  };

  // Strategic KPI Metrics
  const totalPipelineValue = events.reduce((sum, e) => sum + e.estimatedValue, 0);
  const submittedPipelineValue = events.filter(e => e.status === 'SUBMITTED').reduce((sum, e) => sum + e.estimatedValue, 0);
  const inPlayPipelineValue = totalPipelineValue - submittedPipelineValue;

  const activeEventsCount = events.length;
  const openEventsCount = events.filter(e => e.status !== 'SUBMITTED').length;
  const submittedEventsCount = events.filter(e => e.status === 'SUBMITTED').length;
  const actionNeededCount = events.filter(e => e.status === 'INVITED').length;

  // Earliest deadline among open proposals
  const openEvents = [...events]
    .filter(e => e.status !== 'SUBMITTED')
    .sort((a, b) => new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime());

  const earliestDate = openEvents.length > 0 ? openEvents[0].submissionDeadline : null;
  const tiedEarliestEvents = earliestDate 
    ? openEvents.filter(e => e.submissionDeadline === earliestDate)
    : [];
  const earliestOpenEvent = openEvents[0] || events[0];
  const earliestDeadlineInfo = earliestOpenEvent ? calculateDaysLeft(earliestOpenEvent.submissionDeadline) : null;
  const hasMultipleTiedDeadlines = tiedEarliestEvents.length > 1;

  const earliestDeadlineSubtext = useMemo(() => {
    if (!earliestDate || tiedEarliestEvents.length === 0) return 'No open deadlines';
    if (tiedEarliestEvents.length === 1) {
      return `${tiedEarliestEvents[0].eventNumber}: ${tiedEarliestEvents[0].buyerName}`;
    }
    const b1 = tiedEarliestEvents[0].buyerName.split(' ')[0];
    return `${b1} + ${tiedEarliestEvents.length - 1} other tenders`;
  }, [earliestDate, tiedEarliestEvents]);

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (deadlineFilter && e.submissionDeadline !== deadlineFilter) return false;
      if (filterType !== 'ALL' && e.type !== filterType) return false;
      if (selectedBuyer !== 'ALL' && e.buyerOrgId !== selectedBuyer) return false;
      if (statusFilter === 'ACTION_REQUIRED' && e.status !== 'INVITED') return false;
      if (statusFilter === 'IN_PROGRESS' && e.status !== 'IN_PROGRESS') return false;
      if (statusFilter === 'SUBMITTED' && e.status !== 'SUBMITTED') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.eventNumber.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.buyerName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.submissionDeadline.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (sortBy === 'VALUE_DESC') return b.estimatedValue - a.estimatedValue;
      if (sortBy === 'STATUS') {
        const rank: Record<string, number> = { INVITED: 1, IN_PROGRESS: 2, SUBMITTED: 3 };
        return (rank[a.status] || 99) - (rank[b.status] || 99);
      }
      return new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime();
    });
  }, [events, filterType, selectedBuyer, statusFilter, sortBy, searchQuery, deadlineFilter]);

  // Ava Copilot broadcast
  useEffect(() => {
    broadcastPageContext({
      page: 'rfps',
      rfpsCount: events.length,
      totalContractValue: `$${totalPipelineValue.toLocaleString()}.00`,
      closingInDays: earliestDeadlineInfo?.days || 5,
      events: events.map(e => ({
        eventNumber: e.eventNumber,
        title: e.title,
        buyerName: e.buyerName,
        estimatedValue: e.estimatedValue,
        deadline: e.submissionDeadline,
        status: e.status
      }))
    });
  }, [events, totalPipelineValue, earliestDeadlineInfo]);

  // Listen to actions dispatched by Ava Copilot
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'FILTER_RFP_STATUS' && action.payload?.status) {
        setStatusFilter(action.payload.status);
      }
    });
    return cleanup;
  }, []);

  const handleOpenDetail = (ev: SourcingEvent) => {
    navigate('/rfps/detail', { 
      eventId: ev.id, 
      eventNumber: ev.eventNumber 
    });
  };

  const handleExportBids = () => {
    const headers = ['Event Number', 'Type', 'Title', 'Buyer Name', 'Category', 'Est. Value (USD)', 'Bid Value (USD)', 'Submission Deadline', 'Status'];
    const rows = filteredEvents.map(ev => {
      const evBidVal = ev.lineItems.reduce((s, it) => s + (it.quantity * it.bidUnitPrice), 0);
      return [
        `"${ev.eventNumber}"`,
        `"${ev.type}"`,
        `"${ev.title.replace(/"/g, '""')}"`,
        `"${ev.buyerName.replace(/"/g, '""')}"`,
        `"${ev.category.replace(/"/g, '""')}"`,
        ev.estimatedValue,
        evBidVal,
        `"${ev.submissionDeadline}"`,
        `"${ev.status}"`
      ].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Verisource_Tenders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMsg(`Exported ${filteredEvents.length} tenders to CSV.`);
  };

  const getBuyerInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const hasActiveFilters = searchQuery || filterType !== 'ALL' || selectedBuyer !== 'ALL' || statusFilter !== 'ALL' || deadlineFilter;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 font-sans">
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

      {/* Top Banner (Consistent Minimal Style) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Title, Badge & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <FileCheck2 className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">RFPs &amp; Bids</h1>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Review enterprise tenders, configure pricing, and submit proposals.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleExportBids}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Export tender list and pricing schedule to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Bids</span>
          </button>

          <button
            onClick={() => navigate('/catalog')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Inspect Master Product Catalog and contracted rate cards"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Catalog Rates</span>
          </button>
        </div>
      </div>

      {/* Minimal 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* KPI 1: Total Pipeline */}
        <div 
          onClick={() => {
            setStatusFilter('ALL');
            setFilterType('ALL');
            setSelectedBuyer('ALL');
            setDeadlineFilter(null);
            setSearchQuery('');
            setToastMsg('Showing full active tender pipeline.');
          }}
          title="Click to reset filters and view full pipeline"
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Pipeline</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            ${(totalPipelineValue / 1000).toLocaleString()}k
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-emerald-700 font-medium truncate transition">
              ${(inPlayPipelineValue / 1000).toFixed(0)}k Open • ${(submittedPipelineValue / 1000).toFixed(0)}k Sent
            </span>
            <Sparkline data={[140, 180, 210, 260, 310, Math.round(totalPipelineValue / 1000) || 350]} color="#10b981" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2: Active Events */}
        <div 
          onClick={() => {
            setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS');
            setToastMsg(statusFilter === 'IN_PROGRESS' ? 'Showing all events.' : 'Filtered to In Progress events.');
          }}
          title="Click to toggle In Progress tender proposals"
          className={`p-3.5 rounded-xl border shadow-2xs transition cursor-pointer active:scale-[0.99] group ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-sky-50/40 border-sky-400 ring-2 ring-sky-400/20'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Events</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {activeEventsCount} <span className="text-xs font-normal text-slate-500 font-sans">Opportunities</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-sky-700 font-medium truncate transition">
              {openEventsCount} In Progress • {submittedEventsCount} Submitted
            </span>
            <Sparkline data={[2, 3, 3, 4, 4, Math.max(5, activeEventsCount)]} color="#0284c7" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3: Next Due */}
        <div 
          onClick={() => setShowDeadlineModal(true)}
          title="Click to see all tenders closing on next due date"
          className={`p-3.5 rounded-xl border shadow-2xs cursor-pointer transition active:scale-[0.99] group ${
            deadlineFilter === earliestDate
              ? 'bg-rose-50/50 border-rose-400 ring-2 ring-rose-400/30'
              : 'bg-white border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/15'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Next Due</span>
              {hasMultipleTiedDeadlines && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-800 border border-rose-200/80 font-bold font-sans">
                  {tiedEarliestEvents.length} Due
                </span>
              )}
            </div>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5 font-mono">
            <span>{earliestDate ? earliestDate.split(',')[0] : 'None'}</span>
            {earliestDeadlineInfo && (
              <span className="text-xs font-semibold text-rose-600 font-sans">
                ({earliestDeadlineInfo.text})
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-rose-700 font-medium truncate transition">
              {earliestDeadlineSubtext}
            </span>
            <Sparkline data={[14, 10, 7, 5, 3, 2]} color="#e11d48" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4: Competitive Edge */}
        <div 
          onClick={() => {
            setSortBy(sortBy === 'VALUE_DESC' ? 'DEADLINE' : 'VALUE_DESC');
            setToastMsg(sortBy === 'VALUE_DESC' ? 'Sorted by submission deadline.' : 'Sorted by highest contract value.');
          }}
          title="Click to toggle sorting by highest tender value"
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Competitive Edge</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5 font-mono">
            <span>84% Win Rate</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold font-sans">
              -6.4%
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-indigo-700 font-medium truncate transition">
              Avg pricing advantage
            </span>
            <Sparkline data={[71, 74, 78, 80, 82, 84]} color="#6366f1" width={68} height={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Toolbar (Compact Single-Tier Toolbar) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Bar with Clear Button */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search RFPs by number, buyer, title, scope..."
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

          {/* Dropdown Filters Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Event Type Filter */}
            <FilterSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              title="Filter by event type"
            >
              <option value="ALL">All Event Types ({events.length})</option>
              <option value="RFP">RFPs (Proposals)</option>
              <option value="RFI">RFIs (Information)</option>
              <option value="BID">Formal Bids</option>
            </FilterSelect>

            {/* Buyer Filter */}
            <FilterSelect
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)}
              title="Filter by buyer enterprise"
            >
              <option value="ALL">All Buyers ({uniqueBuyers.length})</option>
              {uniqueBuyers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </FilterSelect>

            {/* Status Filter */}
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              title="Filter by status"
            >
              <option value="ALL">All Statuses ({events.length})</option>
              <option value="ACTION_REQUIRED">Action Required ({actionNeededCount})</option>
              <option value="IN_PROGRESS">Drafting ({events.filter(e => e.status === 'IN_PROGRESS').length})</option>
              <option value="SUBMITTED">Submitted ({submittedEventsCount})</option>
            </FilterSelect>

            {/* Sort Dropdown */}
            <FilterSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              title="Sort tenders"
            >
              <option value="DEADLINE">Sort: Deadline</option>
              <option value="VALUE_DESC">Sort: Value (High)</option>
              <option value="STATUS">Sort: Status</option>
            </FilterSelect>

            {/* Reset Shortcut */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('ALL');
                  setSelectedBuyer('ALL');
                  setStatusFilter('ALL');
                  setDeadlineFilter(null);
                  setToastMsg('All filters reset.');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer px-1 flex items-center gap-1"
                title="Reset all filters"
              >
                <span>Reset Filters</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
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

        {/* Active Deadline Banner */}
        {deadlineFilter && (
          <div className="mt-2.5 bg-rose-50 border border-rose-200/90 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between text-rose-900">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="text-[11px]">
                Filtered to deadline: <strong>{deadlineFilter}</strong> ({filteredEvents.length} {filteredEvents.length === 1 ? 'tender' : 'tenders'})
              </span>
            </div>
            <button
              onClick={() => setDeadlineFilter(null)}
              className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Show All</span>
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Table vs Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-xs space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="font-bold text-slate-800 text-sm">No matching sourcing events</div>
          <p className="text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clear buyer or status filters to view all active enterprise tenders.
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDeadlineFilter(null);
                setFilterType('ALL');
                setSelectedBuyer('ALL');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : viewMode === 'TABLE' ? (
        /* ========================================================================= */
        /* FULL-WIDTH ENTERPRISE TABLE VIEW                                         */
        /* ========================================================================= */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap w-36 text-left">
                    EVENT CODE
                  </th>
                  <th className="py-3 px-3.5 min-w-[200px] text-left">
                    TENDER TITLE
                  </th>
                  <th className="py-3 px-3.5 min-w-[220px] text-left">
                    DELIVERABLES &amp; SCOPE
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap w-20 text-center">
                    TYPE
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[160px] text-left">
                    ENTERPRISE BUYER
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[140px] text-left">
                    CATEGORY
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-right w-28">
                    EST. VALUE
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap w-32 text-left">
                    DEADLINE
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap w-28 text-center">
                    STATUS
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap w-36">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map(ev => {
                  const deadlineInfo = calculateDaysLeft(ev.submissionDeadline);
                  const isSubmitted = ev.status === 'SUBMITTED';
                  const totalLineItemQty = ev.lineItems.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr 
                      key={ev.id}
                      onClick={() => handleOpenDetail(ev)}
                      className="transition-colors group hover:bg-slate-50/80 cursor-pointer"
                    >
                      {/* Col 1: Event Code */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-left">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md inline-block">
                          {ev.eventNumber}
                        </span>
                      </td>

                      {/* Col 2: Tender Title (Split) */}
                      <td className="py-3.5 px-3.5 text-left">
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                          {ev.title}
                        </div>
                      </td>

                      {/* Col 3: Deliverables & Scope (Split) */}
                      <td className="py-3.5 px-3.5 text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                            {ev.lineItems.length} Items ({totalLineItemQty} units)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={ev.description}>
                          {ev.description}
                        </p>
                      </td>

                      {/* Col 4: Type Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          ev.type === 'RFP' ? 'bg-sky-50 text-sky-700 border-sky-200/70' :
                          ev.type === 'RFI' ? 'bg-teal-50 text-teal-700 border-teal-200/70' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200/70'
                        }`}>
                          {ev.type}
                        </span>
                      </td>

                      {/* Col 5: Enterprise Buyer */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-left">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {getBuyerInitials(ev.buyerName)}
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-[140px]" title={ev.buyerName}>
                            {ev.buyerName}
                          </span>
                        </div>
                      </td>

                      {/* Col 6: Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-left">
                        <span className="text-[11px] text-slate-600 truncate max-w-[150px] inline-block" title={ev.category}>
                          {ev.category}
                        </span>
                      </td>

                      {/* Col 7: Est. Value */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                        <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                          ${(ev.estimatedValue / 1000).toFixed(0)}k
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          USD Est.
                        </div>
                      </td>

                      {/* Col 8: Deadline */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-left">
                        <div className="text-slate-800 font-medium text-xs">
                          {ev.submissionDeadline}
                        </div>
                        <div className="mt-0.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                            deadlineInfo.urgent ? 'text-amber-700' : 'text-slate-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{deadlineInfo.text}</span>
                          </span>
                        </div>
                      </td>

                      {/* Col 9: Status */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-center">
                        {ev.status === 'SUBMITTED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Submitted</span>
                          </span>
                        ) : ev.status === 'IN_PROGRESS' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            <span>Drafting</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Needs Action</span>
                          </span>
                        )}
                      </td>

                      {/* Col 10: Action (Uniform Width & Standard Alignment) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          {isSubmitted ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(ev);
                              }}
                              className="w-28 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition inline-flex items-center justify-center cursor-pointer"
                            >
                              View Proposal
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(ev);
                              }}
                              className="w-28 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition inline-flex items-center justify-center cursor-pointer"
                            >
                              Prepare Bid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* RESPONSIVE GRID / CARDS VIEW                                              */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(ev => {
            const deadlineInfo = calculateDaysLeft(ev.submissionDeadline);
            const isSubmitted = ev.status === 'SUBMITTED';

            return (
              <div
                key={ev.id}
                onClick={() => handleOpenDetail(ev)}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top: Code, Type & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                        {ev.eventNumber}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        ev.type === 'RFP' ? 'bg-sky-50 text-sky-700 border-sky-200/70' :
                        ev.type === 'RFI' ? 'bg-teal-50 text-teal-700 border-teal-200/70' :
                        'bg-indigo-50 text-indigo-700 border-indigo-200/70'
                      }`}>
                        {ev.type}
                      </span>
                    </div>

                    {isSubmitted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Submitted</span>
                      </span>
                    ) : ev.status === 'IN_PROGRESS' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
                        Drafting
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                        Needs Action
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700 transition leading-snug mt-2.5 line-clamp-2">
                    {ev.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>

                  {/* Line Items & Scope Highlight */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                      {ev.lineItems.length} Deliverable items
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Category: {ev.category.split('&')[0]}
                    </span>
                  </div>
                </div>

                {/* Footer: Buyer, Value, Deadline & Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 min-w-0 pr-2">
                      <div className="w-5 h-5 rounded bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                        {getBuyerInitials(ev.buyerName)}
                      </div>
                      <span className="font-semibold text-slate-700 truncate text-[11px]">
                        {ev.buyerName}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        ${(ev.estimatedValue / 1000).toFixed(0)}k Est.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className={`flex items-center gap-1 text-[11px] font-medium ${
                      deadlineInfo.urgent ? 'text-amber-800 font-semibold' : 'text-slate-500'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{deadlineInfo.text}</span>
                    </div>

                    {isSubmitted ? (
                      <span className="text-xs font-semibold text-slate-700 group-hover:underline">
                        View Proposal
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 group-hover:underline">
                        Prepare Bid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deadline Details Modal */}
      {showDeadlineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Next Due Tenders: {earliestDate}
                    </h3>
                    {earliestDeadlineInfo && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                        {earliestDeadlineInfo.text}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tiedEarliestEvents.length} {tiedEarliestEvents.length === 1 ? 'tender closes' : 'tenders close'} on this date.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeadlineModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {tiedEarliestEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setShowDeadlineModal(false);
                    handleOpenDetail(ev);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{ev.eventNumber}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold border bg-sky-50 text-sky-700 border-sky-200/70">
                        {ev.type}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      ${(ev.estimatedValue / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900 mt-1.5 line-clamp-1">
                    {ev.title}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{ev.buyerName}</span>
                    <span className="text-emerald-600 font-semibold">
                      Open Proposal
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeadlineFilter(deadlineFilter === earliestDate ? null : earliestDate);
                  setShowDeadlineModal(false);
                }}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {deadlineFilter === earliestDate ? 'Clear Filter' : `Filter List to ${earliestDate?.split(',')[0]}`}
              </button>
              <button
                type="button"
                onClick={() => setShowDeadlineModal(false)}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

