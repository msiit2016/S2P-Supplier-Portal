import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Globe, 
  Zap, 
  ExternalLink,
  Copy,
  Check,
  Filter,
  ChevronDown
} from 'lucide-react';
import { BuyerSpecificProfile, GlobalSupplierProfile } from '../../types/index.js';
import { FilterSelect } from '../common/FilterSelect.js';

interface SupplierProfileGovernanceHeaderProps {
  globalProfile: GlobalSupplierProfile | null;
  buyers: BuyerSpecificProfile[];
  selectedBuyerId: string;
  onSelectBuyerId: (id: string) => void;
  onNavigate: (route: string, state?: any) => void;
  onSyncAll: () => void;
  isSyncing?: boolean;
}

export const SupplierProfileGovernanceHeader: React.FC<SupplierProfileGovernanceHeaderProps> = ({
  globalProfile,
  buyers,
  selectedBuyerId,
  onSelectBuyerId,
  onNavigate,
  onSyncAll,
  isSyncing = false
}) => {
  const [copied, setCopied] = useState(false);

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
    setTimeout(() => setCopied(false), 2500);
  };

  const buyerOptions = [
    { value: 'ALL', label: 'All Connected Buyers (Portfolio View)' },
    ...buyers.map(b => ({ value: b.buyerOrgId, label: b.buyerName }))
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:px-5 sm:py-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left: Organization Identity & Verified Trust Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-slate-800">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
                {legalName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Tier-1</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5 flex-wrap">
              <span>DUNS: <strong className="text-slate-700 font-semibold">{dunsNumber}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Tax ID: <strong className="text-slate-700 font-semibold">{taxId}</strong></span>
              <span className="text-slate-300">•</span>
              <span>ERP: <strong className="text-slate-700 font-semibold">{erpId}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Embedded Buyer Scope Selector & Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto shrink-0">
          {/* Multi-Buyer Filter Dropdown */}
          <div className="w-60 sm:w-64 text-xs">
            <FilterSelect
              value={selectedBuyerId}
              onChange={(e: any) => onSelectBuyerId(typeof e === 'string' ? e : e?.target?.value || 'ALL')}
              options={buyerOptions}
              icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Auto-sync verified records across connected buyer ERPs"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Profile'}</span>
          </button>

          {/* View Master Profile Button */}
          <button
            type="button"
            onClick={() => onNavigate('/public-profile')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1 cursor-pointer"
            title="View verified Master Profile"
          >
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Master Profile</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1 cursor-pointer"
            title="Copy shareable link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
