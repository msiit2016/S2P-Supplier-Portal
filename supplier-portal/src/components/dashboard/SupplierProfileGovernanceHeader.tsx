import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck,
  Globe,
  ChevronDown,
  Check,
  Layers
} from 'lucide-react';
import { BuyerSpecificProfile, GlobalSupplierProfile } from '../../types/index.js';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const legalName = globalProfile?.legalName || 'Acme Industrial Tech Inc.';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedBuyer = buyers.find(b => b.buyerOrgId === selectedBuyerId);
  const isAll = selectedBuyerId === 'ALL' || !selectedBuyerId;

  const buyerColors: Record<string, { bg: string; text: string }> = {
    'org-buyer-001': { bg: 'bg-indigo-600', text: 'text-white' },
    'org-buyer-002': { bg: 'bg-emerald-600', text: 'text-white' },
    'org-buyer-003': { bg: 'bg-sky-600', text: 'text-white' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:px-5 sm:py-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Organization Identity & Trust Standing (No DUNS or Tax ID) */}
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
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              Enterprise Supplier Commercial Portal
            </p>
          </div>
        </div>

        {/* Right: Industry Standard Connected Buyer Switcher */}
        <div className="relative self-start md:self-auto shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-72 sm:w-80 flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border text-left transition cursor-pointer shadow-2xs ${
              isOpen 
                ? 'bg-slate-50 border-indigo-400 ring-2 ring-indigo-500/10' 
                : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isAll ? (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
              ) : (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${buyerColors[selectedBuyer?.buyerOrgId || ''] ? `${buyerColors[selectedBuyer?.buyerOrgId || ''].bg} ${buyerColors[selectedBuyer?.buyerOrgId || ''].text}` : 'bg-slate-900 text-white'}`}>
                  {selectedBuyer?.buyerLogoText || selectedBuyer?.buyerName.slice(0, 2).toUpperCase() || 'BY'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                  Connected Buyer Scope
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {isAll ? 'All Connected Buyers' : selectedBuyer?.buyerName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {isAll ? `${buyers.length} Buyers` : 'Filtered'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </div>
          </button>

          {/* Popover Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-88 bg-white rounded-2xl border border-slate-200/95 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Popover Header */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-900">Switch Buyer Workspace</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Filter orders, invoices, and performance telemetry by customer
                </div>
              </div>

              {/* Options List */}
              <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
                {/* Option 1: Portfolio View (All) */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectBuyerId('ALL');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                    isAll 
                      ? 'bg-indigo-50/70 border border-indigo-200/80 text-indigo-950' 
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>All Connected Buyers</span>
                        <span className="text-[10px] font-normal text-slate-500">(Portfolio View)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Consolidated multi-buyer operational view
                      </div>
                    </div>
                  </div>
                  {isAll && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Section Separator */}
                <div className="px-2 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                  Connected Buyer Workspaces ({buyers.length})
                </div>

                {/* Buyer Options */}
                {buyers.map((b) => {
                  const isSelected = selectedBuyerId === b.buyerOrgId;
                  const colorConfig = buyerColors[b.buyerOrgId] || { bg: 'bg-slate-900', text: 'text-white' };
                  
                  return (
                    <button
                      key={b.buyerOrgId}
                      type="button"
                      onClick={() => {
                        onSelectBuyerId(b.buyerOrgId);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-50/70 border border-indigo-200/80 text-indigo-950' 
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${colorConfig.bg} ${colorConfig.text} shadow-2xs`}>
                          {b.buyerLogoText || b.buyerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {b.buyerName}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="text-emerald-700 font-medium">Active</span>
                            <span>•</span>
                            <span className="font-mono">${(b.annualSpendVolume || 0).toLocaleString()} / yr</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Popover Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500">
                Real-time synchronization active across all connected buyers
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
