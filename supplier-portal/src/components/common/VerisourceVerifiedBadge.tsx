import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface VerisourceVerifiedBadgeProps {
  /**
   * Tooltip placement relative to the badge:
   * 'top': floats above badge with downward arrow (default)
   * 'bottom': floats below badge with upward arrow
   */
  placement?: 'top' | 'bottom';
  className?: string;
  tooltipText?: string;
}

export const VerisourceVerifiedBadge: React.FC<VerisourceVerifiedBadgeProps> = ({
  placement = 'top',
  className = '',
  tooltipText = 'Verified by Verisource'
}) => {
  return (
    <div className={`group relative inline-flex items-center select-none ${className}`}>
      {/* Minimal Circular Icon Badge (Matches First Snap) */}
      <button
        type="button"
        aria-label={tooltipText}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs hover:bg-emerald-100 transition cursor-help shrink-0 focus:outline-none focus:ring-1 focus:ring-emerald-400"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
      </button>

      {/* Sleek Minimal Hover Tooltip (Matches First Snap) */}
      <div
        role="tooltip"
        className={`absolute hidden group-hover:flex group-focus-within:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100 ${
          placement === 'top'
            ? 'left-1/2 -translate-x-1/2 bottom-full mb-2'
            : 'left-1/2 -translate-x-1/2 top-full mt-2'
        }`}
      >
        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>{tooltipText}</span>

        {/* Crisp Directional Arrow */}
        {placement === 'top' ? (
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        ) : (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
        )}
      </div>
    </div>
  );
};
