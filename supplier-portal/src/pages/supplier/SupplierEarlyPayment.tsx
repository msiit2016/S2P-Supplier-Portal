import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { Invoice } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { 
  Zap, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ChevronDown,
  Building2,
  Lock
} from 'lucide-react';

export const SupplierEarlyPayment: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = usePortal();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [daysEarly, setDaysEarly] = useState<number>(20);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getInvoices();
      if (res && res.invoices) {
        setInvoices(res.invoices);
        // Find first eligible invoice
        const eligible = res.invoices.find((i: Invoice) => i.earlyPaymentOffer && i.paymentStatus !== 'PAID');
        if (eligible) {
          setSelectedInvoice(eligible);
          if (eligible.earlyPaymentOffer?.acceleratedDays) {
            setDaysEarly(eligible.earlyPaymentOffer.acceleratedDays);
          }
        } else if (res.invoices.length > 0) {
          setSelectedInvoice(res.invoices[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [currentUser]);

  // Dynamic Discounting Formula (Verisource Liquidity Accelerator sliding scale)
  // Base APR ~ 18-24% annual equivalent, sliding by number of days advanced
  const calculateTerms = () => {
    if (!selectedInvoice) return { discountPercent: 0, discountAmount: 0, netPayout: 0, apr: 0, payoutDate: 'N/A' };
    
    const total = selectedInvoice.totalAmount;
    // Sliding scale: e.g. 20 days early = 1.33% to 1.50%
    const discountPercent = Number(((daysEarly / 30) * 1.8).toFixed(2));
    const discountAmount = Number(((total * discountPercent) / 100).toFixed(2));
    const netPayout = Number((total - discountAmount).toFixed(2));
    const apr = Number((((discountPercent / (100 - discountPercent)) * (365 / Math.max(1, daysEarly))) * 100).toFixed(1));

    // Calculate payout date (today + 2 business days)
    const payout = new Date();
    payout.setDate(payout.getDate() + 2);
    const payoutDate = payout.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return { discountPercent, discountAmount, netPayout, apr, payoutDate };
  };

  const terms = calculateTerms();

  const handleRequestEarlyPayment = async () => {
    if (!selectedInvoice) return;
    try {
      setSubmitting(true);
      const res = await ApiClient.acceptEarlyPayment(selectedInvoice.id, {
        discountPercent: terms.discountPercent,
        daysEarly
      });
      setSuccessMessage(res.message || 'Early payment requested successfully! Funds scheduled.');
      await loadInvoices();
    } catch (err: any) {
      alert(err.message || 'Failed to submit early payment request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Working Capital Accelerator • Verisource Dynamic Discounting</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Get Paid Faster with Dynamic Discounting</h1>
          <p className="text-amber-100 text-sm mt-1 max-w-2xl">
            Eliminate traditional 45-day waiting periods. Convert approved invoices into immediate liquidity within 48 business hours at automated sliding-scale discount rates.
          </p>
        </div>

        <div className="bg-amber-950/40 border border-amber-400/30 rounded-xl p-3 text-right">
          <div className="text-[11px] text-amber-200 uppercase font-semibold">Available Early Liquidity</div>
          <div className="text-2xl font-extrabold text-white">
            ${invoices.filter(i => i.paymentStatus !== 'PAID').reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Interactive Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Invoice & Slider Control (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Invoice Selector Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Approved Invoice for Settlement Acceleration
            </label>
            <div className="relative">
              <select
                value={selectedInvoice?.id || ''}
                onChange={(e) => {
                  const inv = invoices.find(i => i.id === e.target.value);
                  if (inv) setSelectedInvoice(inv);
                }}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 appearance-none bg-slate-50 hover:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — ${inv.totalAmount.toLocaleString()} ({inv.poNumber}) • Due: {inv.dueDate} [{inv.paymentStatus}]
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {selectedInvoice && (
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Invoice Total</span>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    ${selectedInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Contracted Due Date</span>
                  <div className="font-semibold text-slate-700 mt-0.5">{selectedInvoice.dueDate}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Buyer Org</span>
                  <div className="font-semibold text-slate-700 mt-0.5">{selectedInvoice.buyerOrgId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">3-Way Match</span>
                  <div className="font-semibold text-emerald-600 mt-0.5">{selectedInvoice.matchStatus}</div>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Slider Control Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Choose Cash Acceleration Days</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Slide right to receive cash earlier. The discount rate dynamically adjusts to your timing preference.
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {daysEarly} Days Early
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="pt-2">
              <input
                type="range"
                min="1"
                max="28"
                step="1"
                value={daysEarly}
                onChange={(e) => setDaysEarly(parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-2">
                <span>1 Day Early (Minimal Discount)</span>
                <span>14 Days (Balanced)</span>
                <span>28 Days (Maximum Cash Acceleration)</span>
              </div>
            </div>

            {/* Dynamic Comparison Timeline */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div className="border-r border-slate-200 pr-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Standard Contract Maturity</span>
                <div className="text-slate-800 font-semibold mt-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{selectedInvoice?.dueDate || 'Standard Net 45'}</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">Full Payout: ${selectedInvoice?.totalAmount.toFixed(2)}</div>
              </div>

              <div>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Accelerated Settlement</span>
                <div className="text-emerald-700 font-bold mt-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Estimated Payout: {terms.payoutDate}</span>
                </div>
                <div className="text-emerald-600 text-[11px] mt-1 font-semibold">Funds in 48h direct to verified bank account</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Breakdown & Execution Action (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24 space-y-5">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Settlement Financial Breakdown</span>
            </div>

            {/* Breakdown calculations */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Invoice Amount:</span>
                <span className="font-semibold text-slate-900">${selectedInvoice?.totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Cash Acceleration Window:</span>
                <span className="font-semibold text-slate-900">{daysEarly} Days Early</span>
              </div>

              <div className="flex justify-between text-amber-700 font-medium">
                <span>Dynamic Discount Rate:</span>
                <span className="font-bold">{terms.discountPercent}%</span>
              </div>

              <div className="flex justify-between text-amber-700 font-medium">
                <span>Cash Acceleration Fee:</span>
                <span className="font-bold">-${terms.discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Annualized Equivalent Rate (APR):</span>
                <span className="font-mono">{terms.apr}%</span>
              </div>

              {/* Net Payout Callout */}
              <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Net Immediate Payout:</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Direct ACH / Wire Clearing</div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-700">
                  ${terms.netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* AI Advisor Note */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <span className="font-bold">Autonomous Cash Flow Benefit:</span> Accelerating this payment optimizes your working capital cycle (DSO decreased by {daysEarly} days) without requiring third-party factoring or credit facility underwriting.
              </p>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleRequestEarlyPayment}
              disabled={submitting || selectedInvoice?.paymentStatus === 'PAID'}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 ${
                selectedInvoice?.paymentStatus === 'PAID'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 hover:scale-[1.02]'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{submitting ? 'Scheduling Settlement...' : `Confirm & Request Early Payout ($${terms.netPayout.toLocaleString()})`}</span>
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 text-center">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Verisource Treasury Settlement Protocol Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
