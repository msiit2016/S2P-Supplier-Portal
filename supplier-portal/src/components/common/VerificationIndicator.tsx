import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface VerificationIndicatorProps {
  type: 'sparkles' | 'check';
  badgeText: string;
  tooltip?: string;
  className?: string;
}

export const VerificationIndicator: React.FC<VerificationIndicatorProps> = ({
  type,
  badgeText,
  tooltip,
  className = ''
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverOpen]);

  return (
    <div ref={containerRef} className={`relative inline-flex items-center group ${className}`}>
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="inline-flex items-center justify-center p-1 rounded-md transition cursor-pointer hover:bg-slate-100 select-none"
        title={popoverOpen ? 'Click to close verification details' : 'Click to view verification details'}
      >
        {type === 'sparkles' ? (
          <Sparkles className="w-3.5 h-3.5 text-slate-900 shrink-0" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        )}
      </button>

      {/* Floating Hover Tooltip (Shown on hover when popover is closed) */}
      {!popoverOpen && (
        <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover:flex flex-col items-end z-30 animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1.5">
            {type === 'sparkles' ? (
              <Sparkles className="w-3 h-3 text-amber-300" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            )}
            <span>{badgeText}</span>
          </div>
          <div className="w-2 h-1 bg-slate-900 [clip-path:polygon(50%_100%,0_0,100%_0)] mr-2" />
        </div>
      )}

      {/* Interactive Click Popover (Pinned floating card) */}
      {popoverOpen && (
        <div className="absolute bottom-full right-0 mb-2 z-40 bg-white border border-slate-200 shadow-xl rounded-lg p-2.5 w-60 animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-1.5">
            <div className="flex items-center gap-1.5">
              {type === 'sparkles' ? (
                <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className="text-xs font-bold text-slate-800">{badgeText}</span>
            </div>
            <button
              type="button"
              onClick={() => setPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {tooltip || 'Certified by Verisource enterprise provenance pipeline.'}
          </p>
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Status: Verified</span>
            <span className="text-emerald-600 font-bold">100% Match</span>
          </div>
        </div>
      )}
    </div>
  );
};
