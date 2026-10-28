import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { SupplierApplication } from '../../types/index.js';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const OnboardingStatus: React.FC = () => {
  const { navigate } = usePortal();
  const { currentUser } = useAuth();
  const [app, setApp] = useState<SupplierApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApp();
  }, [currentUser]);

  const loadApp = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getApplications();
      if (res.applications && res.applications.length > 0) {
        const myApp = res.applications.find((a: any) => a.supplierOrgId === currentUser?.organizationId) || res.applications[0];
        setApp(myApp);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !app) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading status timeline...</div>;
  }

  const stages = [
    { key: 'DRAFT', title: 'Application Drafted', desc: 'Company profile and category initialized' },
    { key: 'SUBMITTED', title: 'Submitted to Buyer', desc: 'Application signed and routed for review' },
    { key: 'UNDER_REVIEW', title: 'Compliance Adjudication', desc: 'AI extraction & 4-eye analyst verification' },
    { key: 'APPROVED', title: 'Procurement Approval & ERP Activation', desc: 'Active in Enterprise Vendor Master & Ready for POs' }
  ];

  const getStageStatus = (stageKey: string) => {
    if (app.status === 'APPROVED') return 'COMPLETED';
    if (stageKey === 'DRAFT') return 'COMPLETED';
    if (stageKey === 'SUBMITTED' && app.status !== 'DRAFT') return 'COMPLETED';
    if (stageKey === 'UNDER_REVIEW' && (app.status === 'UNDER_REVIEW' || app.status === 'CHANGES_REQUESTED' || app.status === 'RESUBMITTED')) return 'IN_PROGRESS';
    return 'UPCOMING';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-emerald-600">{app.caseReference}</span>
          <span className="text-xs text-slate-400 font-mono">Last modified: {new Date(app.updatedAt).toLocaleTimeString()}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">{app.supplierName}</h1>
        <p className="text-xs text-slate-500">
          Current State: <strong className="text-emerald-700 uppercase font-bold">{app.status.replace(/_/g, ' ')}</strong>
        </p>
      </div>

      {/* Interactive Milestone Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Lifecycle Progression Milestones
        </h2>

        <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-slate-200">
          {stages.map((stg, idx) => {
            const stgStatus = getStageStatus(stg.key);
            return (
              <div key={stg.key} className="flex items-start space-x-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 z-10 shadow-xs ${
                  stgStatus === 'COMPLETED'
                    ? 'bg-emerald-600 text-white'
                    : stgStatus === 'IN_PROGRESS'
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}>
                  {stgStatus === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{stg.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      stgStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      stgStatus === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {stgStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{stg.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ERP Activation Notification if Approved */}
        {app.status === 'APPROVED' && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-emerald-950">Downstream ERP Vendor Activated</div>
                <div className="text-xs font-mono text-emerald-800">Master Record: {app.erpVendorId}</div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
              Ready for PO Flip
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
