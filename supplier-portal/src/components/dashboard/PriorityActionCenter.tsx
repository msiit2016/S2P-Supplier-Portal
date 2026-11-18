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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between h-[390px]">
      {/* Header (Aligned h-[54px]) */}
      <div className="h-[54px] px-3.5 sm:px-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0">
            <ClipboardList className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Priority Action Center
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 font-mono">
              {tasks.length} Pending
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateToTasks}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 group cursor-pointer"
          title="Open full Task Queue"
        >
          <span>Full Queue</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-slate-400" />
        </button>
      </div>

      {/* Filter Pills Toolbar (Strict h-9 Sub-Bar) */}
      <div className="h-9 px-3 sm:px-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-[11px] ${
            categoryFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setCategoryFilter('ORDER')}
          className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-[11px] ${
            categoryFilter === 'ORDER'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Orders ({tasks.filter(t => t.category === 'ORDER').length})
        </button>
        <button
          onClick={() => setCategoryFilter('ASN')}
          className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-[11px] ${
            categoryFilter === 'ASN'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          ASNs ({tasks.filter(t => t.category === 'ASN').length})
        </button>
        <button
          onClick={() => setCategoryFilter('INVOICE')}
          className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-[11px] ${
            categoryFilter === 'INVOICE'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Cash ({tasks.filter(t => t.category === 'FINANCE').length})
        </button>
        <button
          onClick={() => setCategoryFilter('ONBOARDING')}
          className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-[11px] ${
            categoryFilter === 'ONBOARDING'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Onboarding ({tasks.filter(t => t.category === 'ONBOARDING').length})
        </button>
      </div>

      {/* Scrollable Action Cards Container (Visible Scrollbar) */}
      <div 
        className="p-3 sm:p-3.5 space-y-2 flex-1 min-h-0 overflow-y-auto pr-1.5 focus:outline-none scroll-smooth visible-scrollbar"
      >
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
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold border uppercase tracking-wider shrink-0 ${getBadgeStyle(task.category)}`}>
                      {task.categoryLabel}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate">
                      {task.buyerName.split(' ')[0]}
                    </span>
                  </div>

                  {task.metricHighlight && (
                    <div className="shrink-0 text-right">
                      {task.metricHighlightType === 'CURRENCY' ? (
                        <span className="text-xs font-semibold font-mono text-slate-900">
                          {task.metricHighlight}
                        </span>
                      ) : task.metricHighlight === '94% Auto-Ready' ? (
                        <span className="text-[10px] font-semibold font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">
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

                {/* Card Body: Title & 1-Click Action (Aligned standard button) */}
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

                  <div className="shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onExecuteAction(task); }}
                      className={`min-w-[68px] h-7 px-2 rounded-lg text-[11px] font-medium transition flex items-center justify-center cursor-pointer ${getActionBtnClass(task.category)}`}
                    >
                      <span>{task.actionLabel}</span>
                    </button>
                  </div>
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

      {/* Footer bar (Aligned with Sourcing Widget) */}
      <div className="p-2.5 px-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span className="font-medium text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Action Queue Active</span>
        </span>
        <button
          onClick={onNavigateToTasks}
          className="font-semibold text-indigo-700 hover:text-indigo-800 transition cursor-pointer"
        >
          Full Queue &rarr;
        </button>
      </div>
    </div>
  );
};

