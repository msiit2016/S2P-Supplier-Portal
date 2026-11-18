import React from 'react';
import { 
  Building2, 
  ShieldCheck
} from 'lucide-react';
import { BuyerSpecificProfile, GlobalSupplierProfile } from '../../types/index.js';
import { FilterSelect } from '../common/FilterSelect.js';

interface SupplierProfileGovernanceHeaderProps {
  globalProfile: GlobalSupplierProfile | null;
  buyers: BuyerSpecificProfile[];
  selectedBuyerId: string;
  onSelectBuyerId: (id: string) => void;
  onNavigate?: (route: string, state?: any) => void;
}

export const SupplierProfileGovernanceHeader: React.FC<SupplierProfileGovernanceHeaderProps> = ({
  globalProfile,
  buyers,
  selectedBuyerId,
  onSelectBuyerId
}) => {
  const legalName = globalProfile?.legalName || 'Acme Industrial Tech Inc.';
  const dunsNumber = globalProfile?.dunsNumber || '09-842-1928';
  const taxId = globalProfile?.taxIdMasked || '84-1294812';

  const buyerOptions = [
    { value: 'ALL', label: 'All Connected Buyers (Portfolio View)' },
    ...buyers.map(b => ({ value: b.buyerOrgId, label: b.buyerName }))
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:px-5 sm:py-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Organization Identity & Trust Standing */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 font-bold text-sm tracking-wider flex items-center justify-center shrink-0 shadow-xs border border-slate-800 select-none">
            AC
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
                {legalName}
              </h1>
              <span 
                title="Verified by Verisource"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs hover:bg-emerald-100 transition cursor-help shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
              <span>DUNS: <strong className="text-slate-700 font-semibold">{dunsNumber}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Tax ID: <strong className="text-slate-700 font-semibold">{taxId}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Buyer Scope Selector */}
        <div className="w-64 sm:w-72 text-xs self-start md:self-auto shrink-0">
          <FilterSelect
            value={selectedBuyerId}
            onChange={(e: any) => onSelectBuyerId(typeof e === 'string' ? e : e?.target?.value || 'ALL')}
            options={buyerOptions}
            icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
          />
        </div>
      </div>
    </div>
  );
};
