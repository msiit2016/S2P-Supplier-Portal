import React, { useState } from 'react';
import { 
  BarChart3, 
  ExternalLink, 
  ChevronRight, 
  ShoppingCart, 
  Truck, 
  Receipt,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { BuyerSpecificProfile } from '../../types/index.js';

interface BuyerRevenueDonutChartProps {
  buyers: BuyerSpecificProfile[];
  onNavigateToOrders: (buyerOrgId?: string) => void;
  onNavigateToAsns: (buyerOrgId?: string) => void;
  onNavigateToInvoices: (buyerOrgId?: string) => void;
  onNavigateToClients?: () => void;
}

interface BuyerSlice {
  id: string;
  name: string;
  logoText: string;
  spend: number;
  pct: number;
  dso: number;
  terms: string;
  color: string;
  strokeColor: string;
  buyerOrgId: string;
}

export const BuyerRevenueDonutChart: React.FC<BuyerRevenueDonutChartProps> = ({
  buyers,
  onNavigateToOrders,
  onNavigateToAsns,
  onNavigateToInvoices,
  onNavigateToClients
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Expanded color palette supporting 8+ distinct categorical slices
  const colors = [
    { fill: '#4f46e5', stroke: '#4338ca' }, // Indigo
    { fill: '#0284c7', stroke: '#0369a1' }, // Sky
    { fill: '#10b981', stroke: '#059669' }, // Emerald
    { fill: '#f59e0b', stroke: '#d97706' }, // Amber
    { fill: '#8b5cf6', stroke: '#7c3aed' }, // Purple
    { fill: '#ec4899', stroke: '#db2777' }, // Rose/Pink
    { fill: '#14b8a6', stroke: '#0d9488' }, // Teal
    { fill: '#64748b', stroke: '#475569' }, // Slate
  ];

  const getDsoForBuyer = (index: number, buyerId: string) => {
    if (buyerId.includes('001') || index === 0) return 21.4;
    if (buyerId.includes('002') || index === 1) return 28.1;
    if (buyerId.includes('003') || index === 2) return 24.0;
    return 26.5;
  };

  const totalSpend = buyers.reduce((sum, b) => sum + (b.annualSpendVolume || 0), 0) || 882000;

  const slices: BuyerSlice[] = buyers.map((b, i) => {
    const spend = b.annualSpendVolume || (i === 0 ? 485000 : i === 1 ? 215000 : 182000);
    const pct = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;
    const dso = getDsoForBuyer(i, b.buyerOrgId || b.id);
    return {
      id: b.id,
      name: b.buyerName,
      logoText: b.buyerLogoText || b.buyerName.slice(0, 2).toUpperCase(),
      spend,
      pct,
      dso,
      terms: b.negotiatedTerms?.paymentTerms || 'Net 30',
      color: colors[i % colors.length].fill,
      strokeColor: colors[i % colors.length].stroke,
      buyerOrgId: b.buyerOrgId
    };
  });

  // Calculate dynamic portfolio concentration insights
  const sortedSlices = [...slices].sort((a, b) => b.spend - a.spend);
  const topSlice = sortedSlices[0] || slices[0];

  const weightedDso = totalSpend > 0 
    ? (slices.reduce((sum, s) => sum + (s.spend * s.dso), 0) / totalSpend).toFixed(1)
    : '24.2';

  const topSharePct = topSlice ? topSlice.pct : 0;
  const isHighConcentration = topSharePct > 65;
  const isModerateConcentration = topSharePct > 45 && topSharePct <= 65;

  const concentrationLabel = isHighConcentration 
    ? 'High Concentration' 
    : isModerateConcentration 
    ? 'Moderate Concentration' 
    : 'Balanced Portfolio';

  const concentrationColor = isHighConcentration 
    ? 'bg-amber-500' 
    : isModerateConcentration 
    ? 'bg-sky-500' 
    : 'bg-emerald-500';

  // Calculate SVG arc paths
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 62;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;
  const arcSegments = slices.map((slice, index) => {
    const strokeDasharray = `${(slice.pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle;
    cumulativeAngle += (slice.pct / 100) * circumference;
    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
      index
    };
  });

  const activeSlice = activeIdx !== null ? slices[activeIdx] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Client Concentration &amp; DSO
            </h3>
          </div>
          <span className="text-xs font-semibold font-mono text-slate-900 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
            ${Math.round(totalSpend / 1000)}k Volume
          </span>
        </div>

        {/* Donut Chart Visual & Active Metric Display */}
        <div className="py-2 flex items-center justify-center sm:justify-around gap-4">
          {/* Donut Canvas */}
          <div className="relative shrink-0 select-none">
            <svg 
              width={size} 
              height={size} 
              viewBox={`0 0 ${size} ${size}`} 
              className="rotate-[-90deg] overflow-visible"
              onMouseLeave={() => setActiveIdx(null)}
            >
              {/* Background ring */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {/* Data segments */}
              {arcSegments.map((segment) => {
                const isHovered = activeIdx === segment.index;
                return (
                  <circle
                    key={segment.id}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setActiveIdx(segment.index)}
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {activeSlice ? activeSlice.logoText : 'Total'}
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 leading-none mt-0.5">
                {activeSlice ? `${activeSlice.pct.toFixed(0)}%` : `$${Math.round(totalSpend / 1000)}k`}
              </span>
              <span className="text-[9px] text-slate-500 font-medium">
                {activeSlice ? `${activeSlice.dso}d DSO` : `${buyers.length} Clients`}
              </span>
            </div>
          </div>

          {/* Quick Dynamic Insights pill */}
          <div className="space-y-1.5 text-xs min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate">
              {activeSlice ? `${activeSlice.name} Snapshot` : 'Concentration Health'}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${activeSlice ? 'bg-indigo-500' : concentrationColor}`}></span>
              <span className="font-semibold text-slate-800 truncate">
                {activeSlice ? `${activeSlice.pct.toFixed(1)}% Share (${activeSlice.dso}d DSO)` : concentrationLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {activeSlice 
                ? `$${activeSlice.spend.toLocaleString()} volume • Terms: ${activeSlice.terms}. Click row to open workspace.`
                : `${topSlice?.name || 'Top client'} accounts for ${topSlice?.pct.toFixed(0)}% of turnover. Portfolio weighted DSO is ${weightedDso}d.`
              }
            </p>
          </div>
        </div>

        {/* Interactive Client List (Scrollable & Scalable for 3 to 100+ clients) */}
        <div className="space-y-1.5 pt-1 max-h-[175px] overflow-y-auto pr-1 visible-scrollbar">
          {slices.map((slice, idx) => {
            const isHovered = activeIdx === idx;

            return (
              <div
                key={slice.id}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => onNavigateToClients ? onNavigateToClients() : onNavigateToOrders(slice.buyerOrgId)}
                className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer group ${
                  isHovered 
                    ? 'border-indigo-300 bg-indigo-50/50 shadow-2xs' 
                    : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200'
                }`}
                title={`Open ${slice.name} Client Workspace`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div 
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs"
                    style={{ backgroundColor: slice.color }}
                  >
                    {slice.logoText.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-xs text-slate-900 truncate flex items-center gap-1.5">
                      <span className="group-hover:text-indigo-600 transition truncate">{slice.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">({slice.pct.toFixed(0)}%)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span className="font-mono font-medium text-slate-700">${slice.spend.toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">{slice.dso}d DSO</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline text-slate-400 truncate">{slice.terms}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onNavigateToOrders(slice.buyerOrgId); }}
                    className="px-2 py-1 text-[10px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition cursor-pointer shadow-2xs"
                    title={`View ${slice.name} Orders`}
                  >
                    Orders
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onNavigateToInvoices(slice.buyerOrgId); }}
                    className="px-2 py-1 text-[10px] font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 rounded-md transition cursor-pointer shadow-2xs"
                    title={`View ${slice.name} Invoices`}
                  >
                    Invoices
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Strip (Aligned & Relevant Hyperlinks) */}
      <div className="pt-2 border-t border-slate-100 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{buyers.length} Connected Client Workspaces</span>
          </span>
          <button
            onClick={() => onNavigateToClients ? onNavigateToClients() : onNavigateToOrders()}
            className="hover:text-indigo-700 text-slate-700 inline-flex items-center gap-1 font-semibold cursor-pointer transition text-[11px]"
            title="Browse all connected client workspaces & invitations"
          >
            <span>All Client Workspaces</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

