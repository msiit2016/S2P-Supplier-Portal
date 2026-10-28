import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { Invoice } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Building2, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  DollarSign,
  Download
} from 'lucide-react';

export const SupplierInvoices: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = usePortal();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getInvoices();
      if (res && res.invoices) {
        setInvoices(res.invoices);
        if (res.invoices.length > 0 && !selectedInvoice) {
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

  const getMatchBadge = (matchStatus: string) => {
    switch (matchStatus) {
      case '3_WAY_MATCHED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            3-Way Matched (Touchless)
          </span>
        );
      case '2_WAY_MATCHED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            2-Way Matched (PO Matched)
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Variance Discrepancy Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            Pending Match
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Paid & Settled</span>;
      case 'APPROVED_FOR_PAYMENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Approved for Payment</span>;
      case 'SCHEDULED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Settlement Scheduled</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">AP Review in Progress</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Automated S2P Accounts Payable & Settlement Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">E-Invoicing & 3-Way Match Verification</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Track invoice clearing statuses, real-time 3-way matching audits against POs and Goods Receipts, payment remittances, and accelerate receivables with Dynamic Discounting.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate('/early-payment')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition transform hover:scale-105"
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>Unlock Working Capital ⚡</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Invoice List & Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Invoice List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All E-Invoices ({invoices.length})</h2>
            <span className="text-xs text-slate-500">Live Clearing Ledger</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">
              <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">
              No electronic invoices submitted yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                          {getMatchBadge(inv.matchStatus)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          PO: <span className="font-semibold text-slate-700">{inv.poNumber || 'Direct Inv'}</span> • Due: <span className="font-semibold text-slate-700">{inv.dueDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-slate-900">
                          ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400">{inv.currency}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>{getPaymentStatusBadge(inv.paymentStatus)}</div>
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        View Audit <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Invoice Detail & 3-Way Audit (7 cols) */}
        <div className="lg:col-span-7">
          {selectedInvoice ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
                    <span>ELECTRONIC INVOICE RECORD</span>
                    <span>•</span>
                    <span className="font-mono">{selectedInvoice.id}</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    {selectedInvoice.invoiceNumber}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Associated PO: <span className="text-white font-semibold">{selectedInvoice.poNumber}</span> • Billed to Buyer Org
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedInvoice.earlyPaymentOffer && selectedInvoice.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => navigate('/early-payment')}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-600/30"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Accelerate Cash ⚡</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status strip */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Matching:</span>
                  {getMatchBadge(selectedInvoice.matchStatus)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">AP State:</span>
                  {getPaymentStatusBadge(selectedInvoice.paymentStatus)}
                </div>
                <div className="text-slate-600">
                  Standard Maturity: <span className="font-bold text-slate-800">{selectedInvoice.dueDate}</span>
                </div>
              </div>

              {/* 3-Way Match Verification Card */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Touchless 3-Way Match Engine Result</span>
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Confidence: 99.8%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] font-bold uppercase">1. Purchase Order Match</div>
                    <div className="font-semibold text-slate-800 mt-1">{selectedInvoice.poNumber}</div>
                    <div className="text-emerald-600 text-[11px] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Prices & lines aligned
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] font-bold uppercase">2. Goods Receipt (GR)</div>
                    <div className="font-semibold text-slate-800 mt-1">GR-Confirmed</div>
                    <div className="text-emerald-600 text-[11px] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Quantity 100% verified
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] font-bold uppercase">3. Invoice Variance</div>
                    <div className="font-semibold text-slate-800 mt-1">$0.00 Variance</div>
                    <div className="text-emerald-600 text-[11px] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Zero discrepancy
                    </div>
                  </div>
                </div>

                {selectedInvoice.matchNotes && (
                  <p className="mt-3 text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{selectedInvoice.matchNotes}"
                  </p>
                )}
              </div>

              {/* Invoiced Line Items */}
              <div className="p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Invoiced Line Items ({selectedInvoice.lineItems.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                        <th className="py-2 px-3 font-semibold">#</th>
                        <th className="py-2 px-3 font-semibold">Description</th>
                        <th className="py-2 px-3 font-semibold text-right">Qty</th>
                        <th className="py-2 px-3 font-semibold text-right">Unit Price</th>
                        <th className="py-2 px-3 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.lineItems.map((li) => (
                        <tr key={li.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{li.itemNumber}</td>
                          <td className="py-2.5 px-3 text-slate-900 font-medium">{li.description}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{li.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">${li.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">${li.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col items-end text-xs space-y-1.5">
                  <div className="flex justify-between w-52 text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-52 text-slate-600">
                    <span>Tax ({selectedInvoice.taxRate}%):</span>
                    <span className="font-semibold text-slate-900">${selectedInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-52 text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                    <span>Total Amount:</span>
                    <span className="text-emerald-700">${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Remittance Advice (If Paid) */}
                {selectedInvoice.remittanceAdvice && (
                  <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Settlement & Remittance Advice</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Payment Ref</div>
                        <div className="font-mono font-bold">{selectedInvoice.remittanceAdvice.paymentReference}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Settlement Date</div>
                        <div className="font-semibold">{selectedInvoice.remittanceAdvice.settlementDate}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Method</div>
                        <div className="font-semibold">{selectedInvoice.remittanceAdvice.paymentMethod}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">ACH Trace #</div>
                        <div className="font-mono text-[11px] text-slate-600">{selectedInvoice.remittanceAdvice.bankTraceNumber}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select an invoice on the left to review line details, matching verification, and remittance advice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
