import React, { useState } from 'react';
import { Settings, ShieldAlert, Sliders, CheckCircle2, Lock } from 'lucide-react';

export const BuyerSettings: React.FC = () => {
  const [allowBuyerSubmit, setAllowBuyerSubmit] = useState(true);
  const [requireSupplierConfirm, setRequireSupplierConfirm] = useState(true);
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(15);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Onboarding Governance & Policy Rules
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure multi-channel intake controls, approval gates, and compliance thresholds.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Policy configurations saved successfully.</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand-600" />
            Channel & Submission Controls
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="font-bold text-slate-900">Allow Buyer-Assisted Direct Submission</div>
              <div className="text-slate-500 mt-0.5">Permit authorized buyers to submit onboarding drafts on behalf of offline suppliers.</div>
            </div>
            <input
              type="checkbox"
              checked={allowBuyerSubmit}
              onChange={(e) => setAllowBuyerSubmit(e.target.checked)}
              className="h-4 w-4 rounded text-brand-600"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="font-bold text-slate-900">Mandatory Supplier Confirmation for Banking</div>
              <div className="text-slate-500 mt-0.5">Require supplier officer electronic sign-off prior to bank account activation.</div>
            </div>
            <input
              type="checkbox"
              checked={requireSupplierConfirm}
              onChange={(e) => setRequireSupplierConfirm(e.target.checked)}
              className="h-4 w-4 rounded text-brand-600"
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Express Auto-Approval Risk Score Ceiling</div>
                <div className="text-slate-500 mt-0.5">Cases with deterministic risk penalties below this threshold qualify for express auto-routing.</div>
              </div>
              <span className="font-mono font-bold text-sm text-brand-600">{autoApprovalThreshold} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={autoApprovalThreshold}
              onChange={(e) => setAutoApprovalThreshold(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            Save Policy Rules
          </button>
        </div>
      </div>
    </div>
  );
};
