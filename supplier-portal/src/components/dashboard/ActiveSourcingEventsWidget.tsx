import React from 'react';
import { 
  Layers, 
  ArrowUpRight, 
  ChevronRight, 
  CheckCircle2
} from 'lucide-react';
import { useSharedRfps, SourcingEvent } from '../../services/rfpService.js';

interface ActiveSourcingEventsWidgetProps {
  onNavigateToRfps: (rfpId?: string) => void;
  selectedBuyerOrgIds?: string[];
  selectedBuyerOrgId?: string;
}

export const ActiveSourcingEventsWidget: React.FC<ActiveSourcingEventsWidgetProps> = ({
  onNavigateToRfps,
  selectedBuyerOrgIds,
  selectedBuyerOrgId
}) => {
  const { events } = useSharedRfps();

  // Filter by buyer if a specific buyer is selected (supports multi-select)
  const filteredEvents = React.useMemo(() => {
    if (selectedBuyerOrgIds && selectedBuyerOrgIds.length > 0) {
      if (selectedBuyerOrgIds.includes('ALL')) return events;
      return events.filter((e: SourcingEvent) => selectedBuyerOrgIds.includes(e.buyerOrgId));
    }
    if (!selectedBuyerOrgId || selectedBuyerOrgId === 'ALL') {
      return events;
    }
    return events.filter((e: SourcingEvent) => e.buyerOrgId === selectedBuyerOrgId);
  }, [events, selectedBuyerOrgIds, selectedBuyerOrgId]);

  const activeEvents = filteredEvents.filter((e: SourcingEvent) => e.status !== 'AWARDED');
  const totalPipeline = activeEvents.reduce((acc: number, curr: SourcingEvent) => acc + (curr.estimatedValue || 0), 0);

  const getStatusBadge = (status: SourcingEvent['status']) => {
    switch (status) {
      case 'INVITED':
        return (
          <span className="w-[74px] h-[22px] rounded-md inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>Invited</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="w-[74px] h-[22px] rounded-md inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Drafting</span>
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_EVALUATION':
        return (
          <span className="w-[74px] h-[22px] rounded-md inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Submitted</span>
          </span>
        );
      default:
        return (
          <span className="w-[74px] h-[22px] rounded-md inline-flex items-center justify-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span className="truncate">{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between h-[390px]">
      {/* Header (Aligned h-[54px]) */}
      <div className="h-[54px] px-3.5 sm:px-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Active Sourcing &amp; Tenders</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              {activeEvents.length} Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Pipeline</span>
            <span className="font-semibold font-mono text-slate-900">${totalPipeline.toLocaleString()}</span>
          </div>
          <button
            onClick={() => onNavigateToRfps()}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 group cursor-pointer"
          >
            <span>All Bids</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-slate-400" />
          </button>
        </div>
      </div>

      {/* Table Column Headers (Strict h-9 Sub-Bar) */}
      <div className="h-9 px-3 sm:px-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider select-none shrink-0">
        <span className="flex-1 min-w-0">Opportunity / Client</span>
        <span className="w-[74px] shrink-0 text-center">Status</span>
        <span className="w-16 shrink-0 text-right">Est. Value</span>
        <span className="w-14 shrink-0 text-right">Action</span>
      </div>

      {/* Events List (Columnar Alignment: Title & Client | Status | Value | Action) */}
      <div 
        className="divide-y divide-slate-100 flex-1 min-h-0 overflow-y-auto pr-1.5 focus:outline-none scroll-smooth visible-scrollbar"
      >
        {activeEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 h-full flex flex-col items-center justify-center">
            <Layers className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-medium">No active tenders for the selected view.</p>
            <button
              onClick={() => onNavigateToRfps()}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Browse Sourcing Portal &rarr;
            </button>
          </div>
        ) : (
          activeEvents.map((event: SourcingEvent) => {
            const isInvited = event.status === 'INVITED';
            const shortBuyer = event.buyerName.replace(/\s+(Enterprises|Aerospace & Defense|Systems|Health Network|Corporation|Inc\.)/i, '').trim();
            const estFormatted = `$${Math.round((event.estimatedValue || 0) / 1000)}k`;
            const deadlineShort = event.submissionDeadline.replace(', 2026', '');

            return (
              <div 
                key={event.id}
                onClick={() => onNavigateToRfps(event.id)}
                className="px-3 sm:px-4 py-2.5 hover:bg-slate-50/80 transition cursor-pointer flex items-center gap-3 group"
              >
                {/* Column 1: Title & Client Meta (Flex-1) */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium text-slate-900 group-hover:text-indigo-600 transition truncate">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                    <span className="text-slate-700 font-medium truncate">{shortBuyer}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-400 text-[10px]">{event.eventNumber}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">Due {deadlineShort}</span>
                  </div>
                </div>

                {/* Column 2: Status Badge (Uniform 74px Width, Centered & Aligned) */}
                <div className="w-[74px] shrink-0 flex items-center justify-center">
                  {getStatusBadge(event.status)}
                </div>

                {/* Column 3: Value (Fixed Width, Right Aligned) */}
                <div className="w-16 shrink-0 text-right">
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {estFormatted}
                  </span>
                </div>

                {/* Column 4: Standardized Action Button (Fixed Width, Aligned) */}
                <div className="w-14 shrink-0 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToRfps(event.id);
                    }}
                    className={`w-14 h-7 rounded-lg text-[11px] font-medium transition flex items-center justify-center gap-0.5 cursor-pointer ${
                      isInvited
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{isInvited ? 'Bid' : 'View'}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar */}
      <div className="p-2.5 px-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span className="font-medium text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Bidding Gateway Active</span>
        </span>
        <button
          onClick={() => onNavigateToRfps()}
          className="font-semibold text-indigo-700 hover:text-indigo-800 transition cursor-pointer"
        >
          View All RFPs &rarr;
        </button>
      </div>
    </div>
  );
};
