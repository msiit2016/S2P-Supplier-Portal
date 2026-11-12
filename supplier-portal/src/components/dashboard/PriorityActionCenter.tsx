import React, { useState } from 'react';
import { 
  ClipboardList, 
  ArrowUpRight, 
  CheckCircle2, 
  Filter, 
  Zap, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  FileCheck2, 
  Layers 
} from 'lucide-react';
import { TaskItem } from '../../services/taskService.js';
import { FilterSelect } from '../common/FilterSelect.js';

interface PriorityActionCenterProps {
  tasks: TaskItem[];
  onExecuteAction: (task: TaskItem) => void;
  onNavigateToTasks: () => void;
}

export const PriorityActionCenter: React.FC<PriorityActionCenterProps> = ({
  tasks,
  onExecuteAction,
  onNavigateToTasks
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ORDER' | 'ASN' | 'INVOICE' | 'ONBOARDING' | 'RFP'>('ALL');

  const filteredTasks = tasks.filter(t => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'ORDER') return t.category === 'ORDER';
    if (categoryFilter === 'ASN') return t.category === 'ASN';
    if (categoryFilter === 'INVOICE') return t.category === 'FINANCE';
    if (categoryFilter === 'ONBOARDING') return t.category === 'ONBOARDING';
    if (categoryFilter === 'RFP') return t.category === 'RFP';
    return true;
  });

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'ORDER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/70';
      case 'ASN':
        return 'bg-blue-50 text-blue-700 border-blue-200/70';
      case 'FINANCE':
        return 'bg-amber-50 text-amber-800 border-amber-200/70';
      case 'ONBOARDING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/70';
      case 'RFP':
        return 'bg-purple-50 text-purple-700 border-purple-200/70';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActionBtnClass = (category: string) => {
    if (category === 'FINANCE') return 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs';
    return 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center shrink-0">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Priority Action Center
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 font-mono">
                {tasks.length} Pending
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateToTasks}
            className="text-xs font-semibold px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Open full Task Queue"
          >
            <span>Queue</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto text-[11px] no-scrollbar">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
              categoryFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setCategoryFilter('ORDER')}
            className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
              categoryFilter === 'ORDER'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Orders ({tasks.filter(t => t.category === 'ORDER').length})
          </button>
          <button
            onClick={() => setCategoryFilter('ASN')}
            className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
              categoryFilter === 'ASN'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ASNs ({tasks.filter(t => t.category === 'ASN').length})
          </button>
          <button
            onClick={() => setCategoryFilter('INVOICE')}
            className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
              categoryFilter === 'INVOICE'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cash ({tasks.filter(t => t.category === 'FINANCE').length})
          </button>
          <button
            onClick={() => setCategoryFilter('ONBOARDING')}
            className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
              categoryFilter === 'ONBOARDING'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Onboarding ({tasks.filter(t => t.category === 'ONBOARDING').length})
          </button>
        </div>

        {/* Scrollable Compact Task Cards */}
        <div className="space-y-2 flex-1 min-h-[280px] max-h-[295px] overflow-y-auto pr-1">
          {filteredTasks.map(task => {
            return (
              <div
                key={task.id}
                onClick={() => onExecuteAction(task)}
                className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/90 hover:border-slate-300 transition cursor-pointer group shadow-2xs"
              >
                {/* Card Header: Category & Buyer & Metric */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border uppercase tracking-wider shrink-0 ${getBadgeStyle(task.category)}`}>
                      {task.categoryLabel}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate">
                      {task.buyerName.split(' ')[0]}
                    </span>
                  </div>

                  {task.metricHighlight && (
                    <div className="shrink-0">
                      {task.metricHighlightType === 'CURRENCY' ? (
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {task.metricHighlight}
                        </span>
                      ) : task.metricHighlight === '94% Auto-Ready' ? (
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          {task.metricHighlight}
                        </span>
                      ) : task.metricHighlight === 'Dock In-Transit' ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                          {task.metricHighlight}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {task.metricHighlight}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Body: Title & 1-Click Action */}
                <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-slate-100/80">
                  <div className="min-w-0 flex-1">
                    <p 
                      className="text-xs font-medium text-slate-900 group-hover:text-slate-950 transition truncate"
                      title={task.title}
                    >
                      {task.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {task.refCode}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onExecuteAction(task); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${getActionBtnClass(task.category)}`}
                  >
                    <span>{task.actionLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-700">No action items in this filter</p>
              <p className="text-[11px] text-slate-400 mt-0.5">All urgent requests have been acknowledged.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Strip */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px]">SLA Response Avg: 4.2h</span>
        <button
          onClick={onNavigateToTasks}
          className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View All Deliverables</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

