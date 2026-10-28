import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { ApiClient } from '../../api/client.js';
import { CheckSquare, AlertTriangle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const { navigate, setSelectedAppId } = usePortal();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getApplications();
      // Filter applications that require review action
      const reviewApps = (res.applications || []).filter(
        (a: any) => a.status === 'UNDER_REVIEW' || a.status === 'CHANGES_REQUESTED' || a.status === 'SUBMITTED'
      );
      setTasks(reviewApps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Prioritized Review Queue
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {tasks.length} Action Items
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pending human-in-the-loop compliance checks, TIN discrepancy reviews, and corporate succession adjudications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(app => (
          <div
            key={app.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-500 transition"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-600">{app.caseReference}</span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-sm text-slate-900">{app.supplierName}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  app.status === 'UNDER_REVIEW' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">
                {app.aiSummary || 'Compliance review pending for category certificates and bank validation.'}
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-3">
                <span>Category: <strong className="text-slate-600">{app.supplyCategory.replace(/_/g, ' ')}</strong></span>
                <span>Reviewer: <strong className="text-slate-600">{app.assignedReviewerName || 'Unassigned'}</strong></span>
                <span>Risk: <strong className="text-rose-600">{app.riskScore}/100</strong></span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedAppId(app.id);
                navigate(`/supplier-applications/${app.id}/review`);
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <span>Launch Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
