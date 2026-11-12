import React, { useState } from 'react';
import { 
  ShoppingCart, 
  CheckCheck, 
  Truck, 
  Receipt, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface StageData {
  id: string;
  label: string;
  count: number;
  countLabel: string;
  value: string;
  conversion: string;
  cycleTime: string;
  status: 'OPTIMAL' | 'ACTIVE' | 'FLAGGED';
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  route: string;
}

interface OrderToCashFunnelChartProps {
  onNavigate: (route: string, params?: any) => void;
  orderCount?: number;
  totalOrderValue?: number;
  inTransitAsnCount?: number;
  invoiceCount?: number;
  totalReceivables?: number;
}

export const OrderToCashFunnelChart: React.FC<OrderToCashFunnelChartProps> = ({
  onNavigate,
  orderCount = 6,
  totalOrderValue = 385000,
  inTransitAsnCount = 1,
  invoiceCount = 4,
  totalReceivables = 94384.80
}) => {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const stages: StageData[] = [
    {
      id: 'po',
      label: '1. PO Received',
      count: orderCount,
      countLabel: 'Orders',
      value: `$${Math.round(totalOrderValue / 1000)}k`,
      conversion: '100%',
      cycleTime: 'New Arrival',
      status: 'OPTIMAL',
      icon: ShoppingCart,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200/80',
      route: '/orders'
    },
    {
      id: 'ack',
      label: '2. Acknowledged',
      count: orderCount,
      countLabel: 'Orders',
      value: '100% Rate',
      conversion: '100%',
      cycleTime: '4.2h avg response',
      status: 'OPTIMAL',
      icon: CheckCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200/80',
      route: '/orders'
    },
    {
      id: 'asn',
      label: '3. In-Transit ASN',
      count: inTransitAsnCount,
      countLabel: 'Shipment',
      value: '$92.4k',
      conversion: '100%',
      cycleTime: 'FedEx & UPS',
      status: 'ACTIVE',
      icon: Truck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200/80',
      route: '/asns'
    },
    {
      id: 'match',
      label: '4. Invoiced & 3-Way Match',
      count: invoiceCount,
      countLabel: 'Invoices',
      value: `$${Math.round(totalReceivables / 1000)}k`,
      conversion: '98.4%',
      cycleTime: 'Touchless Auto-Match',
      status: 'OPTIMAL',
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200/80',
      route: '/invoices'
    },
    {
      id: 'settled',
      label: '5. Settled & Paid',
      count: 32,
      countLabel: 'Past Cleared',
      value: '$115.5k',
      conversion: '100%',
      cycleTime: '24.2d DSO Top Decile',
      status: 'OPTIMAL',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200/80',
      route: '/invoices'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200/70 text-sky-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Order-to-Cash (O2C) Pipeline Waterfall
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono">
              98.4% Touchless Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            End-to-end transaction velocity from buyer purchase order to settled bank cash
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => onNavigate('/transactions')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-lg text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Open comprehensive Cross-Buyer Transactions Ledger"
          >
            <span>Transactions Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Visual Funnel / Multi-Stage Flow Strip (Full 5-Column Grid with No Truncation) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isHovered = hoveredStage === stage.id;

          return (
            <div
              key={stage.id}
              onClick={() => onNavigate(stage.route)}
              onMouseEnter={() => setHoveredStage(stage.id)}
              onMouseLeave={() => setHoveredStage(null)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isHovered 
                  ? 'border-slate-300 bg-slate-50 shadow-xs -translate-y-0.5' 
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
              }`}
            >
              <div>
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${stage.bgColor} ${stage.color} border ${stage.borderColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                    Step {idx + 1}
                  </span>
                </div>

                {/* Stage Name */}
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {stage.label}
                </div>

                {/* Stage Value */}
                <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                  {stage.value}
                </div>
              </div>

              {/* Sub-meta */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-medium truncate">{stage.count} {stage.countLabel}</span>
                <span className="font-mono text-emerald-700 font-semibold">{stage.cycleTime}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Velocity Progress Bar */}
      <div className="pt-1 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Zero Friction Points: 0 Held Invoices • 0 Disputed Shipments</span>
          </span>
          <span className="font-mono text-slate-700 font-semibold">Overall Funnel Health: 99.4%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
          <div className="bg-sky-500 h-full" style={{ width: '25%' }} title="PO Received: 100%"></div>
          <div className="bg-indigo-500 h-full" style={{ width: '25%' }} title="Acknowledged: 100%"></div>
          <div className="bg-teal-500 h-full" style={{ width: '20%' }} title="In-Transit: 100%"></div>
          <div className="bg-purple-500 h-full" style={{ width: '15%' }} title="Matched: 98.4%"></div>
          <div className="bg-emerald-500 h-full" style={{ width: '15%' }} title="Settled: 100%"></div>
        </div>
      </div>
    </div>
  );
};

