import React, { useState, useEffect } from 'react';
import { ApiClient, BASE_URL } from '../../api/client.js';
import { ShoppingCart, Search, FileText, CheckCircle2, Clock, Truck, ChevronRight } from 'lucide-react';

export const BuyerOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/p2p/orders`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        if (data.orders.length > 0) setSelectedOrder(data.orders[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o =>
    o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            P2P Purchase Order Operations
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Enterprise P2P Network
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor vendor commitments, electronic order acknowledgments, and inbound ASN tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PO List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PO number or vendor..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filtered.map(po => {
              const isSelected = selectedOrder?.id === po.id;
              return (
                <div
                  key={po.id}
                  onClick={() => setSelectedOrder(po)}
                  className={`p-4 cursor-pointer transition ${isSelected ? 'bg-brand-50/70 border-l-4 border-brand-600' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-brand-600">{po.poNumber}</span>
                    <span className="font-bold text-slate-900">${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{po.supplierName}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{po.notes}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">Terms: {po.paymentTerms}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      po.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      po.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                      po.status === 'ACKNOWLEDGED' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {po.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PO Detailed Line Items & Delivery Inspector */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between h-[650px] overflow-y-auto space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-brand-600">{selectedOrder.poNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedOrder.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedOrder.supplierName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.notes}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Purchase Commitment</div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    ${selectedOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedOrder.currency}
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Vendor Acknowledgment</div>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    {selectedOrder.acknowledgedAt ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ACK by {selectedOrder.acknowledgedBy}</span>
                      </>
                    ) : (
                      <span className="text-amber-600">Pending Supplier ACK</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">ASN Shipping Status</div>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    {selectedOrder.asnNumber ? (
                      <>
                        <Truck className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-mono">{selectedOrder.asnNumber}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">No ASN Logged</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Payment Terms</div>
                  <div className="font-semibold text-slate-800 mt-0.5 font-mono">
                    {selectedOrder.paymentTerms}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Order Line Items ({selectedOrder.lineItems.length})
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Item / SKU</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.lineItems.map((li: any) => (
                        <tr key={li.id}>
                          <td className="py-2.5 px-3 font-mono">{li.itemNumber}</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{li.partNumber}</td>
                          <td className="py-2.5 px-3 text-slate-700">{li.description}</td>
                          <td className="py-2.5 px-3 font-mono">{li.quantity} {li.uom}</td>
                          <td className="py-2.5 px-3 font-mono">${li.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">
                            ${li.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Ship-To Destination:</strong> {selectedOrder.shippingAddress}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 text-xs">Select a purchase order to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
