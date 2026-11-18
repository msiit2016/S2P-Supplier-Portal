import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Globe, 
  Share2, 
  Zap, 
  FileCheck2, 
  FolderLock, 
  Layers, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { BuyerSpecificProfile, GlobalSupplierProfile } from '../../types/index.js';

interface SupplierProfileGovernanceHeaderProps {
  globalProfile: GlobalSupplierProfile | null;
  buyers: BuyerSpecificProfile[];
  onNavigate: (route: string, state?: any) => void;
  onSyncAll: () => void;
  isSyncing?: boolean;
}

export const SupplierProfileGovernanceHeader: React.FC<SupplierProfileGovernanceHeaderProps> = ({
  globalProfile,
  buyers,
  onNavigate,
  onSyncAll,
  isSyncing = false
}) => {
  const [copied, setCopied] = React.useState(false);

  const legalName = globalProfile?.legalName || 'Acme Industrial Tech Inc.';
  const dunsNumber = globalProfile?.dunsNumber || '09-842-1928';
  const taxId = globalProfile?.taxIdMasked || 'XX-XXX4812';
  const erpId = buyers[0]?.erpVendorId || 'VEND-88102';

  const handleCopyLink = () => {
    const slug = (globalProfile as any)?.publicProfileSlug || 'acme-industrial-tech';
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/p/${slug}`
      : `https://verisource.network/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Top Banner: Entity Identity, Verification Standing & Global Actions */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        {/* Left: Organization Identity & Trust Standing */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-slate-800">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                {legalName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Tier-1 Supplier</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5 flex-wrap">
              <span>D&amp;B DUNS: <strong className="text-slate-700 font-semibold">{dunsNumber}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Tax ID: <strong className="text-slate-700 font-semibold">{taxId}</strong></span>
              <span className="text-slate-300">•</span>
              <span>ERP Ref: <strong className="text-slate-700 font-semibold">{erpId}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Master Profile Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-300/80 rounded-lg text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Auto-sync verified records across all connected buyers"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Master Profile'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/public-profile')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="View verified Master Profile & credentials"
          >
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <span>View Master Profile</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1 cursor-pointer"
            title="Copy shareable link to Master Profile"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Track: 4 Live Governance & Relationship Indicators */}
      <div className="bg-slate-50/70 p-3 sm:px-5 sm:py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
        {/* Metric 1: Connected Buyers & Invitations */}
        <div 
          onClick={() => onNavigate('/onboarding')}
          className="pt-2 sm:pt-0 sm:pr-3 cursor-pointer group flex items-center justify-between"
          title="Manage buyer onboarding requests and invitations"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Buyer Relationships
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                {buyers.length} Connected • 1 Action Req.
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Metric 2: Master Profile Sync Status */}
        <div className="pt-2 sm:pt-0 sm:px-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Profile Completeness
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                100% Synced Across Buyers
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            Verified
          </span>
        </div>

        {/* Metric 3: Compliance & Document Vault Health */}
        <div 
          onClick={() => onNavigate('/documents')}
          className="pt-2 sm:pt-0 sm:px-3 cursor-pointer group flex items-center justify-between"
          title="View verified compliance certificates & tax documents"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-100/80 text-sky-800 flex items-center justify-center shrink-0">
              <FolderLock className="w-3.5 h-3.5 text-sky-700" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Compliance Credentials
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition truncate">
                6 Verified Vault Docs
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Metric 4: Commercial Status & Term Agreements */}
        <div className="pt-2 sm:pt-0 sm:pl-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Settlement Standing
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                Early Payout Active (2/10 Net 30)
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
            Eligible
          </span>
        </div>
      </div>
    </div>
  );
};
