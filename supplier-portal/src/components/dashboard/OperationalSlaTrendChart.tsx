import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Receipt, 
  Truck, 
  FolderLock,
  ArrowUpRight
} from 'lucide-react';

interface SlaDataPoint {
  month: string;
  otif: number;
  threeWay: number;
  dso: number;
}

const SLA_MONTHLY: SlaDataPoint[] = [
  { month: 'Jun', otif: 97.5, threeWay: 96.0, dso: 27.5 },
  { month: 'Jul', otif: 98.0, threeWay: 96.8, dso: 26.2 },
  { month: 'Aug', otif: 98.4, threeWay: 97.2, dso: 25.8 },
  { month: 'Sep', otif: 98.8, threeWay: 97.9, dso: 25.1 },
  { month: 'Oct', otif: 99.0, threeWay: 98.1, dso: 24.6 },
  { month: 'Nov', otif: 99.2, threeWay: 98.4, dso: 24.2 },
];

interface OperationalSlaTrendChartProps {
  onNavigateToInvoices: () => void;
  onNavigateToAsns: () => void;
  onNavigateToDocuments: () => void;
}

export const OperationalSlaTrendChart: React.FC<OperationalSlaTrendChartProps> = ({
  onNavigateToInvoices,
  onNavigateToAsns,
  onNavigateToDocuments
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const svgWidth = 460;
  const svgHeight = 140;
  const padLeft = 38;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 24;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const minVal = 94.0;
  const maxVal = 100.0;
  const range = maxVal - minVal;

  const getX = (i: number) => padLeft + (i / (SLA_MONTHLY.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - ((val - minVal) / range) * chartH;

  const otifPoints = SLA_MONTHLY.map((d, i) => `${getX(i).toFixed(1)},${getY(d.otif).toFixed(1)}`);
  const threeWayPoints = SLA_MONTHLY.map((d, i) => `${getX(i).toFixed(1)},${getY(d.threeWay).toFixed(1)}`);

  const otifPath = `M ${otifPoints.join(' L ')}`;
  const threeWayPath = `M ${threeWayPoints.join(' L ')}`;

  const targetOtifY = getY(97.0);
  const targetThreeWayY = getY(95.0);

  const activeData = activeIdx !== null ? SLA_MONTHLY[activeIdx] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Operational SLA &amp; Quality Radar
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono">
              Tier-1 Enterprise Rating
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            6-Month carrier delivery telemetry and touchless 3-way match precision
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
            Live Telemetry
          </span>
        </div>
      </div>

      {/* 4 B2B Core KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        {/* DSO */}
        <div 
          onClick={onNavigateToInvoices}
          className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer group"
          title="View invoice payment settlement timeline"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>DSO (Velocity)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">Top Decile</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            24.2 <span className="text-xs font-normal text-slate-500 font-sans">Days</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5 truncate">
            ↓ 14.3d vs industry median
          </p>
        </div>

        {/* 3-Way Match */}
        <div 
          onClick={onNavigateToInvoices}
          className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer group"
          title="View touchless 3-way match invoice ledger"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>3-Way Match</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">Touchless</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            98.4% <span className="text-xs font-normal text-slate-500 font-sans">Auto</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            32 of 33 Invoices Matched
          </p>
        </div>

        {/* OTIF */}
        <div 
          onClick={onNavigateToAsns}
          className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer group"
          title="Track on-time in-full carrier delivery telemetry"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>OTIF Delivery</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/70">SLA 97%</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            99.2% <span className="text-xs font-normal text-slate-500 font-sans">Tier-1</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            FedEx &amp; UPS Telemetry
          </p>
        </div>

        {/* Compliance */}
        <div 
          onClick={onNavigateToDocuments}
          className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer group"
          title="View verified compliance vault"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Compliance Vault</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">Audit Ready</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            100% <span className="text-xs font-normal text-slate-500 font-sans">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            6 of 6 Master Credentials
          </p>
        </div>
      </div>

      {/* 6-Month SLA Trendline Canvas */}
      <div className="relative pt-2">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-32 sm:h-36 overflow-visible select-none"
          onMouseLeave={() => setActiveIdx(null)}
        >
          {/* Target Reference Line: 97% OTIF Contractual Target */}
          <line 
            x1={padLeft} 
            y1={targetOtifY} 
            x2={svgWidth - padRight} 
            y2={targetOtifY} 
            stroke="#cbd5e1" 
            strokeWidth="1" 
            strokeDasharray="4 4"
          />
          <text 
            x={svgWidth - padRight + 2} 
            y={targetOtifY + 3} 
            className="text-[8px] fill-slate-400 font-mono"
          >
            SLA 97%
          </text>

          {/* Y Axis ticks */}
          {[94, 96, 98, 100].map(tick => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line 
                  x1={padLeft} 
                  y1={y} 
                  x2={svgWidth - padRight} 
                  y2={y} 
                  stroke="#f8fafc" 
                  strokeWidth="1" 
                />
                <text 
                  x={padLeft - 6} 
                  y={y + 3} 
                  textAnchor="end" 
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* 3-Way Match Line */}
          <path 
            d={threeWayPath} 
            fill="none" 
            stroke="#8b5cf6" 
            strokeWidth="2" 
            strokeDasharray="3 3"
          />

          {/* OTIF Line */}
          <path 
            d={otifPath} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Data points */}
          {SLA_MONTHLY.map((d, i) => {
            const x = getX(i);
            const yOtif = getY(d.otif);
            const yThreeWay = getY(d.threeWay);
            const isHovered = activeIdx === i;

            return (
              <g key={i}>
                <text 
                  x={x} 
                  y={svgHeight - 6} 
                  textAnchor="middle" 
                  className={`text-[10px] font-medium transition ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'}`}
                >
                  {d.month}
                </text>

                {isHovered && (
                  <line 
                    x1={x} 
                    y1={padTop} 
                    x2={x} 
                    y2={padTop + chartH} 
                    stroke="#94a3b8" 
                    strokeWidth="1" 
                    strokeDasharray="2 2"
                  />
                )}

                <circle 
                  cx={x} 
                  cy={yOtif} 
                  r={isHovered ? 5 : 3} 
                  fill="#10b981" 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                />
                <circle 
                  cx={x} 
                  cy={yThreeWay} 
                  r={isHovered ? 4.5 : 2.5} 
                  fill="#8b5cf6" 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                />

                <rect 
                  x={x - chartW / (SLA_MONTHLY.length * 2)} 
                  y={padTop} 
                  width={chartW / SLA_MONTHLY.length} 
                  height={chartH} 
                  fill="transparent" 
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIdx(i)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {activeData && activeIdx !== null && (
          <div 
            className="absolute z-20 pointer-events-none bg-slate-900 text-white p-2 rounded-xl shadow-xl text-xs space-y-1 transition-all -translate-x-1/2"
            style={{ 
              left: `${(getX(activeIdx) / svgWidth) * 100}%`, 
              top: '5px' 
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-0.5 flex items-center justify-between gap-3">
              <span>{activeData.month} Telemetry</span>
              <span className="text-[10px] text-emerald-400 font-mono">DSO: {activeData.dso}d</span>
            </div>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  OTIF Delivery:
                </span>
                <span className="font-mono font-bold text-emerald-300">{activeData.otif}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  3-Way Match:
                </span>
                <span className="font-mono font-bold text-purple-300">{activeData.threeWay}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Contract Compliance Note */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-1 rounded-full bg-emerald-500"></span>
            <span>OTIF Delivery (Actual 99.2%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-1 rounded-full bg-purple-500 border border-purple-300"></span>
            <span>3-Way Match (98.4%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-400"></span>
            <span>SLA Target (97.0%)</span>
          </span>
        </div>

        <span className="text-[11px] text-emerald-700 font-medium">
          Zero breach events recorded across 2026
        </span>
      </div>
    </div>
  );
};

