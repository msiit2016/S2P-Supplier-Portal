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
  onNavigateToInvoices
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const colors = [
    { fill: '#4f46e5', stroke: '#4338ca' }, // Indigo
    { fill: '#0284c7', stroke: '#0369a1' }, // Sky
    { fill: '#10b981', stroke: '#059669' }, // Emerald
    { fill: '#f59e0b', stroke: '#d97706' }, // Amber
  ];

  const totalSpend = buyers.reduce((sum, b) => sum + (b.annualSpendVolume || 0), 0) || 629800;

  const slices: BuyerSlice[] = buyers.map((b, i) => {
    const spend = b.annualSpendVolume || (i === 0 ? 380000 : i === 1 ? 215000 : 34800);
    const pct = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;
    const dso = i === 0 ? 21.4 : i === 1 ? 28.1 : 24.0;
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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Buyer Concentration &amp; DSO
            </h3>
          </div>
          <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
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
                {activeSlice ? `${activeSlice.dso}d DSO` : `${buyers.length} Buyers`}
              </span>
            </div>
          </div>

          {/* Quick Insights pill */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Concentration Health</div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-800">Balanced Portfolio</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Apex Global represents 60% of invoice turnover with 21.4-day rapid settlement.
            </p>
          </div>
        </div>

        {/* Interactive Buyer List */}
        <div className="space-y-1.5 pt-1">
          {slices.map((slice, idx) => {
            const isHovered = activeIdx === idx;

            return (
              <div
                key={slice.id}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                  isHovered 
                    ? 'border-indigo-300 bg-indigo-50/40 shadow-2xs' 
                    : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200'
                }`}
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
                      <span>{slice.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({slice.pct.toFixed(0)}%)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span className="font-mono font-medium">${slice.spend.toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">{slice.dso}d DSO</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline truncate">{slice.terms}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateToOrders(slice.buyerOrgId); }}
                    className="px-2 py-1 text-[10px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition cursor-pointer"
                    title={`View ${slice.name} Orders`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateToInvoices(slice.buyerOrgId); }}
                    className="px-2 py-1 text-[10px] font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 rounded-md transition cursor-pointer"
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

      {/* Footer Navigation Strip */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-medium">Multi-Buyer ERP Links: Active</span>
          <button
            onClick={() => onNavigateToOrders()}
            className="hover:text-slate-900 inline-flex items-center gap-1 font-semibold text-slate-700 cursor-pointer transition text-[11px]"
          >
            <span>View All Transacting Buyers</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

