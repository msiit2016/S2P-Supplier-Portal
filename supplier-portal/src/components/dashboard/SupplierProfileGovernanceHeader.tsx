import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ShieldCheck,
  Globe,
  ChevronDown,
  Check,
  Layers,
  Search,
  X,
  Users,
  CheckSquare
} from 'lucide-react';
import { BuyerSpecificProfile, GlobalSupplierProfile } from '../../types/index.js';

interface SupplierProfileGovernanceHeaderProps {
  globalProfile: GlobalSupplierProfile | null;
  buyers: BuyerSpecificProfile[];
  selectedBuyerIds?: string[];
  selectedBuyerId?: string; // backwards-compatible
  onSelectBuyerIds?: (ids: string[]) => void;
  onSelectBuyerId?: (id: string) => void; // backwards-compatible
  onNavigate?: (route: string, state?: any) => void;
}

export const SupplierProfileGovernanceHeader: React.FC<SupplierProfileGovernanceHeaderProps> = ({
  globalProfile,
  buyers,
  selectedBuyerIds: controlledBuyerIds,
  selectedBuyerId: controlledBuyerId,
  onSelectBuyerIds,
  onSelectBuyerId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const legalName = globalProfile?.legalName || 'Acme Industrial Tech Inc.';

  // Helper for clean 2-letter monograms (AG, NT, MH)
  const getMonogram = (name: string) => {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Normalize selected IDs (support single-select prop or multi-select array)
  const currentSelectedIds = useMemo(() => {
    if (controlledBuyerIds && controlledBuyerIds.length > 0) {
      return controlledBuyerIds;
    }
    if (controlledBuyerId) {
      return [controlledBuyerId];
    }
    return ['ALL'];
  }, [controlledBuyerIds, controlledBuyerId]);

  const isAll = currentSelectedIds.includes('ALL') || currentSelectedIds.length === 0 || currentSelectedIds.length === buyers.length;

  const handleUpdateSelection = (newIds: string[]) => {
    if (onSelectBuyerIds) {
      onSelectBuyerIds(newIds);
    }
    if (onSelectBuyerId) {
      onSelectBuyerId(newIds.length === 1 ? newIds[0] : newIds.includes('ALL') ? 'ALL' : newIds[0] || 'ALL');
    }
  };

  const handleToggleBuyer = (buyerOrgId: string) => {
    if (isAll) {
      // If currently all were selected, clicking a specific buyer isolates to that buyer
      handleUpdateSelection([buyerOrgId]);
      return;
    }

    if (currentSelectedIds.includes(buyerOrgId)) {
      const remaining = currentSelectedIds.filter(id => id !== buyerOrgId);
      if (remaining.length === 0) {
        handleUpdateSelection(['ALL']);
      } else {
        handleUpdateSelection(remaining);
      }
    } else {
      const updated = [...currentSelectedIds, buyerOrgId];
      if (updated.length === buyers.length) {
        handleUpdateSelection(['ALL']);
      } else {
        handleUpdateSelection(updated);
      }
    }
  };

  const handleSelectOnly = (buyerOrgId: string) => {
    handleUpdateSelection([buyerOrgId]);
  };

  const handleSelectAll = () => {
    handleUpdateSelection(['ALL']);
  };

  const handleClearAll = () => {
    handleUpdateSelection(['ALL']);
  };

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

  // Filter buyers for search
  const filteredBuyers = useMemo(() => {
    if (!searchQuery.trim()) return buyers;
    const query = searchQuery.toLowerCase();
    return buyers.filter(b => 
      b.buyerName.toLowerCase().includes(query) ||
      b.buyerOrgId.toLowerCase().includes(query)
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

  // Determine active selection display label
  const singleBuyer = !isAll && currentSelectedIds.length === 1 
    ? buyers.find(b => b.buyerOrgId === currentSelectedIds[0]) 
    : null;

  const selectedCombinedSpend = useMemo(() => {
    if (isAll) {
      return buyers.reduce((sum, b) => sum + (b.annualSpendVolume || 0), 0);
    }
    return buyers
      .filter(b => currentSelectedIds.includes(b.buyerOrgId))
      .reduce((sum, b) => sum + (b.annualSpendVolume || 0), 0);
  }, [buyers, isAll, currentSelectedIds]);

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

            {/* Clean Enterprise Subline */}
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 tracking-normal">
              Multi-Enterprise Commercial &amp; Sourcing Operations
            </p>
          </div>
        </div>

        {/* Right: Modern, Sleek Client Filter (Multi-Select & Streamlined Width) */}
        <div className="relative self-start md:self-auto shrink-0" ref={dropdownRef}>
          {/* Sleek Compact Trigger Button (Clean, no redundant badges) */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`h-9 w-56 sm:w-64 flex items-center justify-between gap-2 px-2.5 rounded-xl border text-left transition cursor-pointer shadow-2xs ${
              isOpen 
                ? 'bg-slate-50 border-slate-300 ring-2 ring-slate-900/5' 
                : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isAll ? (
                <div className="w-5.5 h-5.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              ) : singleBuyer ? (
                <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 ${buyerColors[singleBuyer.buyerOrgId] ? `${buyerColors[singleBuyer.buyerOrgId].bg} ${buyerColors[singleBuyer.buyerOrgId].text}` : 'bg-slate-900 text-white'}`}>
                  {getMonogram(singleBuyer.buyerName)}
                </div>
              ) : (
                <div className="w-5.5 h-5.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              )}
              
              <span className="text-xs font-semibold text-slate-800 truncate">
                {isAll 
                  ? 'All Clients' 
                  : singleBuyer 
                  ? singleBuyer.buyerName 
                  : `${currentSelectedIds.length} Clients`}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-slate-700' : ''}`} />
          </button>

          {/* Balanced Sleek Popover Menu (Aligned Width, Clean Design) */}
          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200/95 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Popover Header */}
              <div className="p-2.5 bg-slate-50/90 border-b border-slate-100">
                <div className="flex items-center justify-between pb-2">
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Client Accounts</span>
                  </div>
                  
                  {/* Quick Select All / Reset Actions */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Instant Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full pl-8 pr-7 py-1 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
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

              {/* Options List with Multi-Select Checkboxes */}
              <div className="p-1.5 space-y-1 max-h-64 overflow-y-auto visible-scrollbar">
                {/* Option 1: All Clients (Portfolio Overview) */}
                {(!searchQuery || 'all clients portfolio'.includes(searchQuery.toLowerCase())) && (
                  <div
                    onClick={handleSelectAll}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                      isAll 
                        ? 'bg-indigo-50/70 border border-indigo-200/80 text-indigo-950' 
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Checkbox indicator */}
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition ${
                        isAll ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isAll && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">
                          All Clients
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Consolidated multi-client overview
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section Separator */}
                <div className="px-2 pt-1.5 pb-1 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                  <span>Connected Clients</span>
                  <span>{filteredBuyers.length} shown</span>
                </div>

                {/* Multi-Select Buyer List with 2-Letter Clean Monograms */}
                {filteredBuyers.map((b, idx) => {
                  const isChecked = isAll || currentSelectedIds.includes(b.buyerOrgId);
                  const colorConfig = getBuyerColor(b.buyerOrgId, idx);
                  
                  return (
                    <div
                      key={b.buyerOrgId}
                      onClick={() => handleToggleBuyer(b.buyerOrgId)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer group ${
                        isChecked && !isAll
                          ? 'bg-indigo-50/70 border border-indigo-200/80 text-indigo-950' 
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Custom Enterprise Checkbox */}
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition ${
                          isChecked ? 'bg-indigo-600 text-white shadow-2xs' : 'border border-slate-300 hover:border-slate-400 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        {/* Clean 2-Letter Monogram Avatar */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${colorConfig.bg} ${colorConfig.text} shadow-2xs`}>
                          {getMonogram(b.buyerName)}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {b.buyerName}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="text-emerald-700 font-medium">Active</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">${Math.round((b.annualSpendVolume || 0) / 1000)}k / yr</span>
                          </div>
                        </div>
                      </div>

                      {/* "Only" button on hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOnly(b.buyerOrgId);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-200 px-1.5 py-0.5 rounded transition shrink-0 ml-2"
                        title={`Filter exclusively to ${b.buyerName}`}
                      >
                        Only
                      </button>
                    </div>
                  );
                })}

                {/* Empty State when search has no match */}
                {filteredBuyers.length === 0 && (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs text-slate-500">No clients found matching &ldquo;{searchQuery}&rdquo;</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>

              {/* Popover Footer with Dynamic Selection Summary & Apply Action */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] px-3">
                <span className="text-slate-600 font-medium">
                  {isAll 
                    ? 'All Clients Active' 
                    : `${currentSelectedIds.length} of ${buyers.length} Selected`}
                  <span className="text-slate-400 font-normal ml-1">
                    (${Math.round(selectedCombinedSpend / 1000)}k)
                  </span>
                </span>
                
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
