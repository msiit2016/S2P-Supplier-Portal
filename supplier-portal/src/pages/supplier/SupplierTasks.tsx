import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { useSharedTasks, TaskItem } from '../../services/taskService.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { useSupplierSettings } from '../../services/supplierSettingsService.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
import { 
  ClipboardList, 
  Search, 
  Sparkles, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  Filter, 
  Check, 
  Layers, 
  ExternalLink,
  FolderLock,
  Zap,
  Calendar,
  Grid,
  List,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Receipt,
  Truck,
  RotateCcw,
  X
} from 'lucide-react';

export const SupplierTasks: React.FC = () => {
  const { navigate, openBuyerWorkspace } = usePortal();
  const { 
    tasks, 
    pendingTasks, 
    completedTasks, 
    urgentTasks, 
    toggleTaskStatus, 
    completeTask, 
    createTask, 
    dismissTask,
    setTasks 
  } = useSharedTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('LIST');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const { settings } = useSupplierSettings();

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Hide early payment finance tasks if early payment highlighting is turned off in Settings
    if (!settings.earlyPaymentHighlighting && task.category === 'FINANCE') return false;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === '' ||
      task.title.toLowerCase().includes(q) ||
      task.buyerName.toLowerCase().includes(q) ||
      task.refCode.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.categoryLabel.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'ALL' || task.category === selectedCategory;
    const matchesBuyer = selectedBuyer === 'ALL' || task.buyerOrgId === selectedBuyer;
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

    return matchesSearch && matchesCategory && matchesBuyer && matchesStatus;
  });

  const pendingCount = pendingTasks.length;
  const urgentCount = urgentTasks.length;
  const completedCount = completedTasks.length;

  const handleToggleTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleTaskStatus(id);
    if (updated) {
      setActionNotice(
        updated.status === 'COMPLETED' 
          ? `Task "${updated.refCode}" marked as completed!` 
          : `Task "${updated.refCode}" reopened as pending.`
      );
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  // Broadcast live Tasks context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'tasks',
      totalTasks: tasks.length,
      pendingCount,
      urgentCount,
      completedCount,
      tasks: tasks.map(t => ({ 
        id: t.id, 
        title: t.title, 
        refCode: t.refCode, 
        priority: t.priority, 
        category: t.category,
        status: t.status 
      }))
    });
  }, [tasks, pendingCount, urgentCount, completedCount]);

  // Listen to actions dispatched by Ava Copilot
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'COMPLETE_TASK') {
        const taskId = action.payload.taskId || action.payload.id;
        completeTask(taskId);
        setActionNotice(`Ava completed task ${taskId}`);
        setTimeout(() => setActionNotice(null), 3500);
      } else if (action.action === 'DISMISS_TASK' || action.action === 'DELETE_TASK') {
        const taskId = action.payload.taskId || action.payload.id;
        dismissTask(taskId);
        setActionNotice(`Ava dismissed task ${taskId}`);
        setTimeout(() => setActionNotice(null), 3500);
      } else if (action.action === 'CREATE_TASK') {
        const p = action.payload;
        const created = createTask({
          title: p.title || 'New Operational Task',
          buyerName: p.buyerName || 'Apex Global Enterprises',
          buyerOrgId: p.buyerOrgId || 'buyer-org-1',
          buyerInitials: p.buyerInitials || 'AP',
          category: p.category || 'ORDER',
          categoryLabel: p.categoryLabel || 'Orders',
          priority: p.priority || 'HIGH',
          priorityLabel: p.priorityLabel || 'High',
          refCode: p.refCode || `TSK-${Date.now().toString().slice(-4)}`,
          dueDate: p.dueDate || 'In 3 Days',
          dueUrgency: p.dueUrgency || 'WARNING',
          description: p.description || 'Action item generated by Ava Copilot Operations Agent.',
          actionLabel: 'View Task',
          actionType: 'NAV_ORDER'
        });
        setActionNotice(`Ava created task: ${created.title}`);
        setTimeout(() => setActionNotice(null), 3500);
      }
    });
    return cleanup;
  }, [completeTask, dismissTask, createTask]);

  const handleExecuteAction = (task: TaskItem) => {
    // If pending, executing the action resolves and closes the task
    if (task.status === 'PENDING') {
      completeTask(task.id);
      setActionNotice(`Action taken: "${task.refCode}" marked as Resolved & Closed!`);
      setTimeout(() => setActionNotice(null), 4000);
    }

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
      case 'NAV_WORKSPACE':
        if (task.actionPayload?.buyerOrgId) {
          openBuyerWorkspace(task.actionPayload.buyerOrgId, task.actionPayload.tab);
        } else {
          openBuyerWorkspace('ALL');
        }
        break;
      case 'NAV_DOCS':
        navigate('/documents');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const uniqueBuyers = Array.from(new Set(tasks.map(t => JSON.stringify({ id: t.buyerOrgId, name: t.buyerName }))))
    .map(s => JSON.parse(s) as { id: string; name: string });

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'ONBOARDING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'ORDER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'ASN':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'FINANCE':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'RFP':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'COMPLIANCE':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/80';
    }
  };

  const getButtonClass = (task: TaskItem) => {
    if (task.status === 'COMPLETED') {
      return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs';
    }
    if (task.category === 'FINANCE') {
      return 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs';
    }
    return 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs';
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Banner (Minimal, Balanced, Clean) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Title, Badge & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <ClipboardList className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">Task Queue</h1>
            </div>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Action items, onboarding requests, and vendor deliverables requiring your review
            </p>
          </div>
        </div>

        {/* Right: Quick Progress Metric */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-xs">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Queue Progress</div>
            <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
              {completedCount} of {tasks.length} Completed
            </div>
            <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden ml-auto">
              <div 
                className="h-full bg-slate-900 rounded-full transition-all duration-300" 
                style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Toast Alert */}
      {actionNotice && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Minimal 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* KPI 1: Queue Total */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Queue Total</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {tasks.length} <span className="text-xs font-normal text-slate-500 font-sans">Tasks</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-slate-700 font-medium truncate transition">
              Across all connected buyers
            </span>
            <Sparkline data={[4, 5, 5, 6, 7, Math.max(7, tasks.length)]} color="#64748b" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2: Pending Review */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {pendingCount} <span className="text-xs font-normal text-slate-500 font-sans">Actionable</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium truncate transition">
              Awaiting supplier action
            </span>
            <Sparkline data={[6, 5, 5, 4, 4, Math.max(1, pendingCount)]} color="#d97706" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3: Urgent Priority */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Urgent Priority</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {urgentCount} <span className="text-xs font-normal text-slate-500 font-sans">Expedited</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-rose-600 font-medium truncate">
              {urgentCount > 0 ? 'Due within 24-48 hours' : 'Zero overdue items'}
            </span>
            <Sparkline data={[3, 3, 2, 2, 1, Math.max(0, urgentCount)]} color="#e11d48" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4: Resolved */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resolved</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {completedCount} <span className="text-xs font-normal text-slate-500 font-sans">Done</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-teal-700 group-hover:text-teal-800 font-medium truncate transition">
              100% verified &amp; signed
            </span>
            <Sparkline data={[12, 16, 21, 26, 30, Math.max(32, completedCount + 30)]} color="#0d9488" width={68} height={20} />
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
              placeholder="Search tasks by title, vendor, category, or reference ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg bg-slate-50/70 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Dropdown */}
            <FilterSelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              title="Filter by Category"
            >
              <option value="ALL">All Categories ({tasks.length})</option>
              <option value="ONBOARDING">Onboarding ({tasks.filter(t => t.category === 'ONBOARDING').length})</option>
              <option value="ORDER">PO Billing & Orders ({tasks.filter(t => t.category === 'ORDER').length})</option>
              <option value="ASN">Shipment ASNs ({tasks.filter(t => t.category === 'ASN').length})</option>
              <option value="FINANCE">Early Payments ({tasks.filter(t => t.category === 'FINANCE').length})</option>
              <option value="RFP">Sourcing & RFPs ({tasks.filter(t => t.category === 'RFP').length})</option>
              <option value="COMPLIANCE">Compliance & ITAR ({tasks.filter(t => t.category === 'COMPLIANCE').length})</option>
            </FilterSelect>

            {/* Vendor Filter */}
            <FilterSelect
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)}
              title="Filter by Enterprise Buyer"
            >
              <option value="ALL">All Enterprise Vendors ({uniqueBuyers.length})</option>
              {uniqueBuyers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </FilterSelect>

            {/* Status Filter */}
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              title="Filter by Status"
            >
              <option value="ALL">All Statuses ({tasks.length})</option>
              <option value="PENDING">Active Only ({pendingCount})</option>
              <option value="COMPLETED">Completed ({completedCount})</option>
            </FilterSelect>

            {/* Reset Filters Button */}
            {(searchQuery.trim() !== '' || selectedBuyer !== 'ALL' || statusFilter !== 'ALL' || selectedCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBuyer('ALL');
                  setStatusFilter('ALL');
                  setSelectedCategory('ALL');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer px-1 flex items-center gap-1"
                title="Reset all filters"
              >
                <span>Reset Filters</span>
              </button>
            )}

            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap hidden xl:inline">
              Showing {filteredTasks.length} of {tasks.length}
            </span>

            {/* View Mode Toggle (Consistent across RFPs, Onboarding, and Tasks) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'LIST' 
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table / List View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">List</span>
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'GRID' 
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRID VIEW (Interactive Modern Cards)                                      */}
      {/* ========================================================================= */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map(task => {
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div 
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${
                  isCompleted 
                    ? 'bg-slate-50/80 border-slate-200 opacity-60' 
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header: Category & Priority on left, Code + Checkbox on right */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getCategoryBadgeStyle(task.category)}`}>
                        {task.categoryLabel}
                      </span>
                      {task.priority === 'URGENT' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          <span>Urgent</span>
                        </span>
                      ) : task.priority === 'HIGH' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                          {task.priorityLabel}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {task.priorityLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70">
                        {task.refCode}
                      </span>
                      {isCompleted ? (
                        <button
                          onClick={(e) => handleToggleTask(task.id, e)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1 hover:bg-emerald-100 transition cursor-pointer"
                          title="Task Resolved. Click to reopen"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Resolved</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleToggleTask(task.id, e)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 inline-flex items-center gap-1 hover:bg-amber-100 transition cursor-pointer"
                          title="Actionable. Click to resolve"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Actionable</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 
                    onClick={() => handleExecuteAction(task)}
                    className={`font-semibold text-sm leading-snug mt-2.5 cursor-pointer transition ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-900 hover:text-emerald-700'
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </h3>

                  {/* Description / Scope */}
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2" title={task.description}>
                    {task.description}
                  </p>

                  {/* Metric Highlight Pill (if available) */}
                  {task.metricHighlight && (
                    <div className="mt-2.5 flex items-center">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold font-mono px-2 py-0.5 rounded-md border ${
                        task.metricHighlightType === 'CURRENCY'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : task.metricHighlightType === 'PERCENT'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        <span>{task.metricHighlight}</span>
                      </span>
                    </div>
                  )}

                  {/* Buyer & Due Date Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1.5 min-w-0 pr-2">
                      <div className="w-5 h-5 rounded bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                        {task.buyerInitials}
                      </div>
                      <span className="font-semibold text-slate-700 truncate" title={task.buyerName}>
                        {task.buyerName}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1 shrink-0 font-medium ${
                      task.dueUrgency === 'URGENT' 
                        ? 'text-rose-600 font-semibold' 
                        : task.dueUrgency === 'WARNING'
                          ? 'text-amber-800'
                          : 'text-slate-500'
                    }`}>
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button with Closure State */}
                <div className="pt-2">
                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center space-x-1.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                        <span>Closed</span>
                      </div>
                      <button
                        onClick={(e) => handleToggleTask(task.id, e)}
                        className="py-2 px-3 rounded-xl text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer"
                        title="Reopen this task"
                      >
                        Reopen
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleExecuteAction(task)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs ${getButtonClass(task)}`}
                      title={`Execute ${task.actionLabel} and resolve task`}
                    >
                      <span>{task.actionLabel}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* SPLIT DENSE LIST VIEW (Professional Table Layout)                         */
        /* ========================================================================= */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[980px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap w-28">
                    REF CODE
                  </th>
                  <th className="py-3 px-3 min-w-[240px]">
                    TASK &amp; SCOPE
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap w-24">
                    CATEGORY
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap w-20">
                    PRIORITY
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap w-28">
                    IMPACT / VALUE
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap min-w-[150px]">
                    ENTERPRISE BUYER
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap w-24">
                    DUE DATE
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap w-28 text-center">
                    STATUS
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] w-36">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => {
                  const isCompleted = task.status === 'COMPLETED';

                  return (
                    <tr 
                      key={task.id}
                      className={`transition-colors group hover:bg-slate-50/80 ${
                        isCompleted ? 'bg-slate-50/60 opacity-80' : 'bg-white'
                      }`}
                    >
                      {/* Col 1: Dedicated Reference Code */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md inline-block">
                          {task.refCode}
                        </span>
                      </td>

                      {/* Col 2: Dedicated Task & Scope */}
                      <td className="py-3 px-3">
                        <div 
                          onClick={() => handleExecuteAction(task)}
                          className={`font-semibold text-xs leading-snug cursor-pointer transition ${
                            isCompleted 
                              ? 'line-through text-slate-400' 
                              : 'text-slate-900 group-hover:text-emerald-700'
                          }`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-1 mt-0.5" title={task.description}>
                          {task.description}
                        </p>
                      </td>

                      {/* Col 3: Dedicated Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getCategoryBadgeStyle(task.category)}`}>
                          {task.categoryLabel}
                        </span>
                      </td>

                      {/* Col 4: Dedicated Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {task.priority === 'URGENT' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                            <span>Urgent</span>
                          </span>
                        ) : task.priority === 'HIGH' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            {task.priorityLabel}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {task.priorityLabel}
                          </span>
                        )}
                      </td>

                      {/* Col 5: Dedicated Impact / Value Metric */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {task.metricHighlight ? (
                          <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            task.metricHighlightType === 'CURRENCY'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : task.metricHighlightType === 'PERCENT'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            <span>{task.metricHighlight}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">—</span>
                        )}
                      </td>

                      {/* Col 7: Dedicated Enterprise Buyer */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {task.buyerInitials}
                          </div>
                          <span className="font-semibold text-slate-800 text-xs truncate max-w-[150px]" title={task.buyerName}>
                            {task.buyerName}
                          </span>
                        </div>
                      </td>

                      {/* Col 8: Dedicated Due Date */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${
                          task.dueUrgency === 'URGENT' 
                            ? 'text-rose-600 font-semibold' 
                            : task.dueUrgency === 'WARNING'
                              ? 'text-amber-800 font-medium'
                              : 'text-slate-600'
                        }`}>
                          <Clock className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span>{task.dueDate}</span>
                        </div>
                      </td>

                      {/* Col 9: Dedicated STATUS Column (Adjacent to Action) */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        {isCompleted ? (
                          <button
                            onClick={(e) => handleToggleTask(task.id, e)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition cursor-pointer"
                            title="Task resolved. Click to reopen as actionable."
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Resolved</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleToggleTask(task.id, e)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition cursor-pointer"
                            title="Awaiting supplier action. Click to mark resolved."
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                            <span>Actionable</span>
                          </button>
                        )}
                      </td>

                      {/* Col 9: Action Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] transition-colors" onClick={(e) => e.stopPropagation()}>
                        {isCompleted ? (
                          <div className="flex items-center justify-end">
                            <span className="w-28 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 inline-flex items-center justify-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              <span>Closed</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleExecuteAction(task)}
                              className={`w-28 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center justify-center cursor-pointer whitespace-nowrap shadow-xs ${getButtonClass(task)}`}
                              title={`Execute ${task.actionLabel} and resolve task`}
                            >
                              <span>{task.actionLabel}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No matching action tasks</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You're all caught up or no tasks matched your selected search and filters.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedBuyer('ALL'); setStatusFilter('ALL'); }}
            className="mt-3 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SupplierTasks;
