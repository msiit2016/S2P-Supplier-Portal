import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../api/client.js';
import { Receipt, Search, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';

export const BuyerInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/p2p/invoices`);
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
        if (data.invoices.length > 0) setSelectedInvoice(data.invoices[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(i =>
    i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    i.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Accounts Payable & E-Invoicing Hub
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Touchless 3-Way Match Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated PO-to-Invoice matching, early payment discounting capture, and electronic settlement clearing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice number or vendor..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filtered.map(inv => {
              const isSelected = selectedInvoice?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 cursor-pointer transition ${isSelected ? 'bg-brand-50/70 border-l-4 border-brand-600' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                    <span className="font-bold text-slate-900">${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{inv.supplierName}</div>
                  <div className="text-[11px] text-slate-500 mt-1">PO Ref: <strong className="font-mono text-brand-600">{inv.poNumber || 'Contract Invoiced'}</strong></div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      inv.matchStatus === '3_WAY_MATCHED' ? 'bg-emerald-100 text-emerald-800' :
                      inv.matchStatus === '2_WAY_MATCHED' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.matchStatus.replace(/_/g, ' ')}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      inv.paymentStatus === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-800' :
                      inv.paymentStatus === 'APPROVED_FOR_PAYMENT' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.paymentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice Detailed Inspector */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between h-[650px] overflow-y-auto space-y-6">
          {selectedInvoice ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedInvoice.matchStatus === '3_WAY_MATCHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedInvoice.matchStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedInvoice.supplierName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">PO Linked: <strong className="font-mono text-brand-600">{selectedInvoice.poNumber || 'Direct PO Flip'}</strong></p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Billed</div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    ${selectedInvoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedInvoice.currency}
                  </div>
                </div>
              </div>

              {/* 3-Way Match Verification Diagnostic */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Autonomous AP Match Verification Engine</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-sans">
                  {selectedInvoice.matchNotes || 'Touchless comparison between PO lines, warehouse Goods Receipts (GR), and E-Invoice data.'}
                </p>
              </div>

              {/* Dynamic Discounting Banner if eligible */}
              {selectedInvoice.earlyPaymentOffer?.eligible && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-300 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Dynamic Discounting Working Capital Capture
                    </span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      ${selectedInvoice.earlyPaymentOffer.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} AP Savings
                    </span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed">
                    Supplier offered {selectedInvoice.earlyPaymentOffer.discountPercent}% early payment discount for payment {selectedInvoice.earlyPaymentOffer.acceleratedDays} days ahead of standard Net 30 terms.
                  </p>
                </div>
              )}

              {/* Line Items */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Billed Line Items ({selectedInvoice.lineItems.length})
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.lineItems.map((li: any) => (
                        <tr key={li.id}>
                          <td className="py-2.5 px-3 font-mono">{li.itemNumber}</td>
                          <td className="py-2.5 px-3 text-slate-800">{li.description}</td>
                          <td className="py-2.5 px-3 font-mono">{li.quantity}</td>
                          <td className="py-2.5 px-3 font-mono">${li.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">
                            ${li.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remittance Information */}
              {selectedInvoice.remittanceAdvice && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg text-xs space-y-1 text-indigo-950 font-mono">
                  <div className="font-bold font-sans text-indigo-900">Electronic Remittance Scheduled</div>
                  <div>Payment Ref: {selectedInvoice.remittanceAdvice.paymentReference} • Settlement Date: {selectedInvoice.remittanceAdvice.settlementDate}</div>
                  <div>Bank Trace: {selectedInvoice.remittanceAdvice.bankTraceNumber} • Method: {selectedInvoice.remittanceAdvice.paymentMethod}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 text-xs">Select an invoice to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
