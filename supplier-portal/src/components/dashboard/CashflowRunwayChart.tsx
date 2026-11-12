import React, { useState } from 'react';
import { 
  CalendarCheck, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  ArrowUpRight,
  Clock,
  Layers,
  Info
} from 'lucide-react';

interface CashflowPoint {
  period: string;
  invoiced: number;
  collected: number;
  projected?: number;
}

const CASHFLOW_6M: CashflowPoint[] = [
  { period: 'Jun', invoiced: 48000, collected: 44000 },
  { period: 'Jul', invoiced: 62000, collected: 59000 },
  { period: 'Aug', invoiced: 55000, collected: 52000 },
  { period: 'Sep', invoiced: 71000, collected: 68000 },
  { period: 'Oct', invoiced: 84000, collected: 79000 },
  { period: 'Nov (Proj)', invoiced: 92000, collected: 78570, projected: 88000 },
];

const CASHFLOW_90D: CashflowPoint[] = [
  { period: 'W1 Sep', invoiced: 16000, collected: 15500 },
  { period: 'W3 Sep', invoiced: 19500, collected: 18000 },
  { period: 'W1 Oct', invoiced: 22000, collected: 21000 },
  { period: 'W3 Oct', invoiced: 24000, collected: 23500 },
  { period: 'W1 Nov', invoiced: 26000, collected: 25000 },
  { period: 'W3 Nov', invoiced: 28500, collected: 21500, projected: 27000 },
];

const CASHFLOW_30D: CashflowPoint[] = [
  { period: 'Nov 01', invoiced: 8500, collected: 8500 },
  { period: 'Nov 08', invoiced: 14200, collected: 14200 },
  { period: 'Nov 15', invoiced: 18400, collected: 16000 },
  { period: 'Nov 22', invoiced: 22500, collected: 18200, projected: 22000 },
  { period: 'Nov 29', invoiced: 28400, collected: 21670, projected: 28000 },
];

interface CashflowRunwayChartProps {
  onNavigateToInvoices: (params?: any) => void;
  earlyPaymentEnabled?: boolean;
  onAccelerateCash?: () => void;
}

export const CashflowRunwayChart: React.FC<CashflowRunwayChartProps> = ({
  onNavigateToInvoices,
  earlyPaymentEnabled = true,
  onAccelerateCash
}) => {
  const [timeframe, setTimeframe] = useState<'30D' | '90D' | '6M'>('6M');
  const [viewMode, setViewMode] = useState<'TREND' | 'AGING'>('TREND');
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(null);

  const data = timeframe === '30D' ? CASHFLOW_30D : timeframe === '90D' ? CASHFLOW_90D : CASHFLOW_6M;

  const maxVal = Math.max(...data.map(d => Math.max(d.invoiced, d.collected, d.projected || 0))) * 1.15;
  const svgWidth = 560;
  const svgHeight = 180;
  const padLeft = 46;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 26;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getX = (idx: number) => padLeft + (idx / (data.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - (val / maxVal) * chartH;

  const invoicedPoints = data.map((d, i) => `${getX(i).toFixed(1)},${getY(d.invoiced).toFixed(1)}`);
  const collectedPoints = data.map((d, i) => `${getX(i).toFixed(1)},${getY(d.collected).toFixed(1)}`);

  const invoicedPath = `M ${invoicedPoints.join(' L ')}`;
  const collectedPath = `M ${collectedPoints.join(' L ')}`;

  const collectedArea = `${collectedPath} L ${getX(data.length - 1)},${padTop + chartH} L ${padLeft},${padTop + chartH} Z`;
  const invoicedArea = `${invoicedPath} L ${getX(data.length - 1)},${padTop + chartH} L ${padLeft},${padTop + chartH} Z`;

  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  const activePoint = activeHoverIdx !== null ? data[activeHoverIdx] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Cash Runway &amp; Liquidity Flow
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              +14.8% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Billed receivables vs. cash collected across verified buyer accounts
          </p>
        </div>

        {/* Controls: Mode Switcher & Timeframe Tabs */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium text-slate-600">
            <button
              onClick={() => setViewMode('TREND')}
              className={`px-2.5 py-1 rounded-md transition ${viewMode === 'TREND' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'}`}
            >
              Trend Flow
            </button>
            <button
              onClick={() => setViewMode('AGING')}
              className={`px-2.5 py-1 rounded-md transition ${viewMode === 'AGING' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'}`}
            >
              Aging Buckets
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-[11px] font-semibold text-slate-600">
            {(['30D', '90D', '6M'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded transition ${timeframe === tf ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Body */}
      {viewMode === 'TREND' ? (
        <div className="space-y-3">
          {/* Chart Canvas */}
          <div className="relative w-full">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-44 sm:h-48 overflow-visible select-none"
              onMouseLeave={() => setActiveHoverIdx(null)}
            >
              <defs>
                <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="invoicedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yTicks.map((tick, i) => {
                const y = getY(tick);
                return (
                  <g key={i}>
                    <line 
                      x1={padLeft} 
                      y1={y} 
                      x2={svgWidth - padRight} 
                      y2={y} 
                      stroke="#f1f5f9" 
                      strokeWidth="1" 
                      strokeDasharray={i === 0 ? undefined : '3 3'}
                    />
                    <text 
                      x={padLeft - 8} 
                      y={y + 3} 
                      textAnchor="end" 
                      className="text-[9px] fill-slate-400 font-mono font-medium"
                    >
                      ${Math.round(tick / 1000)}k
                    </text>
                  </g>
                );
              })}

              {/* Invoiced Area & Line */}
              <path d={invoicedArea} fill="url(#invoicedGrad)" />
              <path 
                d={invoicedPath} 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2" 
                strokeDasharray="4 4"
              />

              {/* Collected Area & Line */}
              <path d={collectedArea} fill="url(#collectedGrad)" />
              <path 
                d={collectedPath} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Data Points & Hover Targets */}
              {data.map((d, i) => {
                const x = getX(i);
                const yInvoiced = getY(d.invoiced);
                const yCollected = getY(d.collected);
                const isHovered = activeHoverIdx === i;

                return (
                  <g key={i}>
                    {/* X-Axis Labels */}
                    <text 
                      x={x} 
                      y={svgHeight - 6} 
                      textAnchor="middle" 
                      className={`text-[10px] font-medium transition ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'}`}
                    >
                      {d.period}
                    </text>

                    {/* Vertical guideline on hover */}
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

                    {/* Collected Dot */}
                    <circle 
                      cx={x} 
                      cy={yCollected} 
                      r={isHovered ? 5 : 3} 
                      fill="#10b981" 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                      className="transition-all"
                    />

                    {/* Invoiced Dot */}
                    <circle 
                      cx={x} 
                      cy={yInvoiced} 
                      r={isHovered ? 4.5 : 2.5} 
                      fill="#6366f1" 
                      stroke="#ffffff" 
                      strokeWidth="1.5" 
                      className="transition-all"
                    />

                    {/* Invisible full-height hit area */}
                    <rect 
                      x={x - chartW / (data.length * 2)} 
                      y={padTop} 
                      width={chartW / data.length} 
                      height={chartH} 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveHoverIdx(i)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Floating Tooltip */}
            {activePoint && activeHoverIdx !== null && (
              <div 
                className="absolute z-20 pointer-events-none bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1.5 transition-all -translate-x-1/2"
                style={{ 
                  left: `${(getX(activeHoverIdx) / svgWidth) * 100}%`, 
                  top: '10px' 
                }}
              >
                <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-1 flex items-center justify-between gap-3">
                  <span>{activePoint.period}</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-normal">
                    {Math.round((activePoint.collected / activePoint.invoiced) * 100)}% Cleared
                  </span>
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Collected:
                    </span>
                    <span className="font-mono font-bold text-emerald-300">
                      ${activePoint.collected.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      Invoiced:
                    </span>
                    <span className="font-mono font-bold text-indigo-200">
                      ${activePoint.invoiced.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend and Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-1 rounded-full bg-emerald-500"></span>
                <span>Collected Cash</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-1 rounded-full bg-indigo-500 border border-indigo-300"></span>
                <span>Billed Invoices</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">30-Day Inflow Target:</span>
              <span className="font-mono font-bold text-slate-900 text-xs">$78,570.00</span>
            </div>
          </div>
        </div>
      ) : (
        /* Aging Buckets View (Coupa / SAP Ariba Standard) */
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Bucket 1: 0-15 Days */}
            <div 
              onClick={() => onNavigateToInvoices({ status: 'PENDING', days: '15' })}
              className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 hover:border-emerald-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                <span>0–15 Days (Current)</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">100% On-Time</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900 mt-1">
                $42,320.00
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5 truncate">
                Apex Global • ACH scheduled Nov 18
              </p>
            </div>

            {/* Bucket 2: 16-30 Days */}
            <div 
              onClick={() => onNavigateToInvoices({ status: 'PENDING', days: '30' })}
              className="p-3 rounded-xl bg-sky-50/60 border border-sky-200/70 hover:border-sky-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                <span>16–30 Days (Upcoming)</span>
                <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-mono">2/10 Net 30</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900 mt-1">
                $36,250.00
              </div>
              <p className="text-[11px] text-sky-700 mt-0.5 truncate">
                NovaTech &amp; Meridian • Discount eligible
              </p>
            </div>

            {/* Bucket 3: >30 Days / Overdue */}
            <div 
              onClick={() => onNavigateToInvoices({ status: 'OVERDUE' })}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Overdue (&gt;30 Days)</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">Zero Overdue</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900 mt-1">
                $0.00
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                0 disputes • Top decile payment health
              </p>
            </div>
          </div>

          {/* Aging Progress Visualizer */}
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Aging Spread</span>
              <span>Total Active Receivables: $78,570.00</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: '53.8%' }} title="0-15d: $42,320 (54%)"></div>
              <div className="bg-sky-500 h-full transition-all" style={{ width: '46.2%' }} title="16-30d: $36,250 (46%)"></div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Line Early Cash Callout Banner */}
      {earlyPaymentEnabled && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-950">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">Early Liquidity Acceleration: </span>
              <span className="text-amber-800">Unlock $30,870.00 today (NovaTech 2/10 Net 30, 1.25% APR discount).</span>
            </div>
          </div>
          <button
            onClick={onAccelerateCash || (() => onNavigateToInvoices({ earlyPay: true }))}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Accelerate Payout</span>
          </button>
        </div>
      )}
    </div>
  );
};

