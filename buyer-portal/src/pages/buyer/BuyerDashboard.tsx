import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { SupplierApplication } from '../../types/index.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Inbox, 
  ShieldAlert, 
  Filter, 
  Search, 
  Plus, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Building2
} from 'lucide-react';

interface BuyerDashboardProps {
  onCreateSupplierClick: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onCreateSupplierClick }) => {
  const { navigate, setSelectedAppId, toggleAiDrawer } = usePortal();
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<SupplierApplication[]>([]);
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [filterChannel, filterStatus, search]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterChannel !== 'ALL') params.channel = filterChannel;
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (search) params.search = search;
      const data = await ApiClient.getApplications(params);
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate high-level metrics
  const awaitingReview = applications.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED').length;
  const changesRequested = applications.filter(a => a.status === 'CHANGES_REQUESTED').length;
  const approvedActive = applications.filter(a => a.status === 'APPROVED').length;
  const highRisk = applications.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length;

  const handleOpenApp = (appId: string) => {
    setSelectedAppId(appId);
    navigate(`/supplier-applications/${appId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Procurement Operations Cockpit
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Coupa / SAP Aligned
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-channel supplier onboarding, corporate succession resolution, and compliance governance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onCreateSupplierClick}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Supplier Case</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Awaiting Review */}
        <div 
          onClick={() => setFilterStatus('UNDER_REVIEW')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-brand-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Review</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{awaitingReview}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Includes 1 corporate succession</span>
          </div>
        </div>

        {/* Card 2: Changes Requested */}
        <div 
          onClick={() => setFilterStatus('CHANGES_REQUESTED')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clarification Needed</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{changesRequested}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Awaiting supplier document update
          </div>
        </div>

        {/* Card 3: High Risk / Planted Discrepancy */}
        <div 
          onClick={() => setFilterStatus('ALL')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-rose-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Risk Collisions</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{highRisk}</div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            TIN mismatch flagged by Critic
          </div>
        </div>

        {/* Card 4: Approved & ERP Activated */}
        <div 
          onClick={() => setFilterStatus('APPROVED')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activated ERP Vendors</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{approvedActive}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Downstream ERP sync confirmed
          </div>
        </div>
      </div>

      {/* AI Cognitive Highlight Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/40 text-amber-300 border border-indigo-400/30 flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Agent Finding Adjudication</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
                APP-2026-0042 • Corporate Succession
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Nexura Global Analytics submitted Delaware Certificate of Merger. Predecessor Apex Analytics LLC (VEND-88102) shares identical Tax ID 84-1294821.
              The agent recommends: <strong className="text-white">Authorize entity succession and merge vendor master lineage</strong> instead of creating a duplicate vendor.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenApp('app-0042')}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
        >
          <span>Open Review Workspace</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Applications Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Strip */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search case ref, supplier name, or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Channel filter */}
            <FilterSelect
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              title="Filter by intake channel"
            >
              <option value="ALL">All Intake Channels</option>
              <option value="SUPPLIER_SELF_SERVICE">Self-Service</option>
              <option value="EMAIL_ASSISTED">Email Assisted</option>
              <option value="BUYER_ASSISTED">Buyer Assisted</option>
            </FilterSelect>

            {/* Status filter */}
            <FilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              title="Filter by application status"
            >
              <option value="ALL">All Application States</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved (Active)</option>
            </FilterSelect>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">Case Reference</th>
                <th className="py-3 px-4">Supplier Organization</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Intake Channel</th>
                <th className="py-3 px-4">Application State</th>
                <th className="py-3 px-4">Risk Assessment</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No supplier applications match current filters.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    onClick={() => handleOpenApp(app.id)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-brand-600">
                      {app.caseReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.supplierName}</div>
                      <div className="text-[11px] text-slate-400">{app.supplierEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {app.supplyCategory.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        app.channel === 'EMAIL_ASSISTED' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : app.channel === 'BUYER_ASSISTED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {app.channel.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'UNDER_REVIEW'
                          ? 'bg-sky-100 text-sky-800'
                          : app.status === 'CHANGES_REQUESTED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              app.riskLevel === 'HIGH' || app.riskLevel === 'CRITICAL'
                                ? 'bg-rose-500'
                                : app.riskLevel === 'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${app.riskScore}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[11px] font-bold ${
                          app.riskLevel === 'HIGH' || app.riskLevel === 'CRITICAL'
                            ? 'text-rose-600'
                            : app.riskLevel === 'MEDIUM'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}>
                          {app.riskScore}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {app.assignedReviewerName || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenApp(app.id);
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
