import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Building2, 
  ShieldCheck,
  Globe,
  ChevronDown,
  Check,
  Layers,
  Search,
  X,
  Users
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
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const legalName = globalProfile?.legalName || 'Acme Industrial Tech Inc.';

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedBuyer = buyers.find(b => b.buyerOrgId === selectedBuyerId);
  const isAll = selectedBuyerId === 'ALL' || !selectedBuyerId;

  // Filter buyers for search - scalable for 100+ connected buyers
  const filteredBuyers = useMemo(() => {
    if (!searchQuery.trim()) return buyers;
    const query = searchQuery.toLowerCase();
    return buyers.filter(b => 
      b.buyerName.toLowerCase().includes(query) ||
      b.buyerOrgId.toLowerCase().includes(query) ||
      (b.buyerLogoText && b.buyerLogoText.toLowerCase().includes(query))
    );
  }, [buyers, searchQuery]);

  const buyerColors: Record<string, { bg: string; text: string }> = {
    'org-buyer-001': { bg: 'bg-indigo-600', text: 'text-white' },
    'org-buyer-002': { bg: 'bg-emerald-600', text: 'text-white' },
    'org-buyer-003': { bg: 'bg-sky-600', text: 'text-white' },
  };

  const getBuyerColor = (buyerId: string, idx: number) => {
    if (buyerColors[buyerId]) return buyerColors[buyerId];
    const palettes = [
      { bg: 'bg-indigo-600', text: 'text-white' },
      { bg: 'bg-emerald-600', text: 'text-white' },
      { bg: 'bg-sky-600', text: 'text-white' },
      { bg: 'bg-purple-600', text: 'text-white' },
      { bg: 'bg-amber-600', text: 'text-white' },
      { bg: 'bg-rose-600', text: 'text-white' },
      { bg: 'bg-teal-600', text: 'text-white' },
    ];
    return palettes[idx % palettes.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:px-5 sm:py-3.5">
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
              
              {/* Verified Badge with Instant Sleek Hover Tooltip */}
              <div className="relative group inline-flex items-center">
                <button
                  type="button"
                  aria-label="Verified by Verisource"
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs hover:bg-emerald-100 transition cursor-help shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
                {/* Micro-animated Instant Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Verified by Verisource</span>
                  {/* Tooltip Down Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
              </div>
            </div>

            {/* Improved, High-Authority Enterprise Subline */}
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Authorized Tier-1 Partner
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">
                Multi-Buyer Commercial &amp; Sourcing Hub
              </span>
            </p>
          </div>
        </div>

        {/* Right: Modern, Scalable Connected Buyer Workspace Filter (Engineered for 100+ Buyers) */}
        <div className="relative self-start md:self-auto shrink-0" ref={dropdownRef}>
          {/* Sleek Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-72 sm:w-80 flex items-center justify-between gap-2.5 px-3 py-1.5 sm:py-2 rounded-xl border text-left transition cursor-pointer shadow-2xs ${
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
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {isAll ? `${buyers.length} Buyers` : 'Filtered'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </div>
          </button>

          {/* Popover Menu with Instant Search (Scales to 100+ Connected Buyers) */}
          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-84 sm:w-96 bg-white rounded-2xl border border-slate-200/95 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Popover Header */}
              <div className="p-3 bg-slate-50/90 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Switch Connected Buyer</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                    {buyers.length} Available
                  </span>
                </div>

                {/* Instant Search Bar for 100+ Enterprise Buyers */}
                <div className="relative mt-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search buyers by name, ID, or spend..."
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
                {/* Option 1: Consolidated Portfolio View (Pinned when no search, or matching) */}
                {(!searchQuery || 'all connected buyers portfolio'.includes(searchQuery.toLowerCase())) && (
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
                )}

                {/* Section Separator */}
                <div className="px-2 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                  <span>Buyer Workspaces</span>
                  <span>{filteredBuyers.length} shown</span>
                </div>

                {/* Filtered Buyers */}
                {filteredBuyers.map((b, idx) => {
                  const isSelected = selectedBuyerId === b.buyerOrgId;
                  const colorConfig = getBuyerColor(b.buyerOrgId, idx);
                  
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
                            <span className="font-mono text-slate-600">${(b.annualSpendVolume || 0).toLocaleString()} / yr</span>
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

                {/* Empty State when search has no match */}
                {filteredBuyers.length === 0 && (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs text-slate-500">No buyers found matching &ldquo;{searchQuery}&rdquo;</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  </div>
                )}
              </div>

              {/* Popover Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500 flex items-center justify-between px-3">
                <span>Enterprise Buyer Network</span>
                <span className="font-mono text-emerald-700 font-medium">Real-Time Sync Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
