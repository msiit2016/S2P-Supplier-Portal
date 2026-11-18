import React from 'react';
import { 
  Layers, 
  ArrowUpRight, 
  Clock, 
  DollarSign, 
  Building2, 
  ChevronRight, 
  Send, 
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useSharedRfps, SourcingEvent } from '../../services/rfpService.js';

interface ActiveSourcingEventsWidgetProps {
  onNavigateToRfps: (rfpId?: string) => void;
  selectedBuyerOrgId?: string;
}

export const ActiveSourcingEventsWidget: React.FC<ActiveSourcingEventsWidgetProps> = ({
  onNavigateToRfps,
  selectedBuyerOrgId
}) => {
  const { events } = useSharedRfps();

  // Filter by buyer if a specific buyer is selected
  const filteredEvents = React.useMemo(() => {
    if (!selectedBuyerOrgId || selectedBuyerOrgId === 'ALL') {
      return events;
    }
    return events.filter((e: SourcingEvent) => e.buyerOrgId === selectedBuyerOrgId);
  }, [events, selectedBuyerOrgId]);

  const activeEvents = filteredEvents.filter((e: SourcingEvent) => e.status !== 'AWARDED');
  const totalPipeline = activeEvents.reduce((acc: number, curr: SourcingEvent) => acc + (curr.estimatedValue || 0), 0);

  const getStatusBadge = (status: SourcingEvent['status']) => {
    switch (status) {
      case 'INVITED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            Invited to Bid
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Draft In Progress
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_EVALUATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Bid Submitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-4.5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Active Sourcing &amp; Tenders</h2>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {activeEvents.length} Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enterprise RFPs, RFIs, and reverse auction opportunities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tender Pipeline</div>
            <div className="text-xs font-bold font-mono text-purple-700">
              ${totalPipeline.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => onNavigateToRfps()}
            className="text-xs text-purple-700 hover:text-purple-900 font-semibold inline-flex items-center gap-1 group cursor-pointer"
          >
            <span>All Bids</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-[220px]">
        {activeEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-medium">No active tenders for the selected view.</p>
            <button
              onClick={() => onNavigateToRfps()}
              className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              Browse Sourcing Portal &rarr;
            </button>
          </div>
        ) : (
          activeEvents.slice(0, 3).map((event: SourcingEvent) => {
            const isInvited = event.status === 'INVITED';
            return (
              <div 
                key={event.id}
                onClick={() => onNavigateToRfps(event.id)}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {event.eventNumber}
                    </span>
                    <span className="text-[11px] font-bold text-purple-700">
                      [{event.type}]
                    </span>
                    {getStatusBadge(event.status)}
                    <span className="text-[11px] text-slate-400 hidden sm:inline">•</span>
                    <span className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {event.buyerName}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition mt-1 truncate">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-emerald-700 font-bold">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      Est. ${(event.estimatedValue || 0).toLocaleString()}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500 font-mono">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Deadline: {event.submissionDeadline}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">
                      {event.lineItems?.length || 0} Line Items
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToRfps(event.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1 cursor-pointer ${
                      isInvited
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{isInvited ? 'Submit Bid' : 'View Tender'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar */}
      <div className="p-2.5 px-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-600" />
          <span>Ava AI can auto-draft technical compliance responses from your Master Profile</span>
        </span>
        <button
          onClick={() => onNavigateToRfps()}
          className="font-semibold text-purple-700 hover:text-purple-800 transition cursor-pointer"
        >
          View All RFPs ({activeEvents.length}) &rarr;
        </button>
      </div>
    </div>
  );
};
