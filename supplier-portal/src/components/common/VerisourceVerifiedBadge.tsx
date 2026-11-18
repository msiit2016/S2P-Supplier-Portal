import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface VerisourceVerifiedBadgeProps {
  /**
   * Tooltip placement relative to the badge:
   * 'top': floats above badge with downward arrow (default for dashboard headers)
   * 'bottom': floats below badge with upward arrow (default for profile cards)
   */
  placement?: 'top' | 'bottom';
  /**
   * Whether to display the text "Verified" alongside the shield icon.
   * Defaults to true.
   */
  showText?: boolean;
  className?: string;
  customProofText?: string;
}

export const VerisourceVerifiedBadge: React.FC<VerisourceVerifiedBadgeProps> = ({
  placement = 'top',
  showText = true,
  className = '',
  customProofText = 'IRS TIN Match 100% • Dun & Bradstreet Active • Delaware Secretary of State Validated'
}) => {
  return (
    <div className={`group relative inline-flex items-center select-none ${className}`}>
      {/* Interactive Badge Trigger */}
      <span
        tabIndex={0}
        role="button"
        aria-label="Verisource Verified Enterprise Badge"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-pointer transition hover:bg-emerald-100/80 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {showText && <span>Verified</span>}
      </span>

      {/* Rich Enterprise Provenance Tooltip (Unified across all pages) */}
      <div
        role="tooltip"
        className={`absolute hidden group-hover:flex group-focus-within:flex flex-col bg-slate-900 text-white text-[11px] rounded-xl p-2.5 shadow-2xl border border-slate-700/80 whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100 ${
          placement === 'top'
            ? 'left-1/2 -translate-x-1/2 bottom-full mb-2'
            : 'left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-1.5'
        }`}
      >
        <div className="font-bold flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Verisource Verified Enterprise</span>
        </div>
        <div className="text-slate-300 text-[10px] mt-0.5 font-normal">
          {customProofText}
        </div>

        {/* Directional Beak / Arrow */}
        {placement === 'top' ? (
          <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700/80" />
        ) : (
          <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 absolute -top-1 left-4 sm:left-1/2 sm:-translate-x-1/2 border-l border-t border-slate-700/80" />
        )}
      </div>
    </div>
  );
};
