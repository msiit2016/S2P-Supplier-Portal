import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { PurchaseOrder } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Truck, 
  Receipt, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  PackageCheck,
  Send,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const SupplierOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = usePortal();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // ASN Modal state
  const [showAsnModal, setShowAsnModal] = useState(false);
  const [carrier, setCarrier] = useState('FedEx Freight');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('2026-11-04');

  // Flip Invoice Modal state
  const [showFlipModal, setShowFlipModal] = useState(false);
  const [flipInvoiceNum, setFlipInvoiceNum] = useState('');
  const [flipTaxRate, setFlipTaxRate] = useState(8.25);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getOrders();
      if (res && res.orders) {
        setOrders(res.orders);
        if (res.orders.length > 0 && !selectedPO) {
          setSelectedPO(res.orders[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load POs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const handleAcknowledge = async (poId: string) => {
    try {
      const res = await ApiClient.acknowledgeOrder(poId);
      setActionSuccess(`Order ${res.order?.poNumber || poId} successfully acknowledged! Buyer procurement team notified.`);
      await loadOrders();
      if (selectedPO?.id === poId) {
        setSelectedPO(res.order);
      }
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      alert('Failed to acknowledge order');
    }
  };

  const handleDispatchASN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const res = await ApiClient.dispatchASN(selectedPO.id, {
        carrier,
        trackingNumber,
        estimatedDelivery
      });
      setActionSuccess(`Advance Shipping Notice (ASN) dispatched! Tracking: ${trackingNumber}`);
      setShowAsnModal(false);
      await loadOrders();
      setSelectedPO(res.order);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      alert('Failed to dispatch ASN');
    }
  };

  const handleFlipInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const res = await ApiClient.flipPOToInvoice(selectedPO.id, {
        invoiceNumber: flipInvoiceNum || undefined,
        taxRate: flipTaxRate
      });
      setShowFlipModal(false);
      setActionSuccess(`🎉 1-Click PO Flip Successful! Invoice ${res.invoice?.invoiceNumber} generated and submitted for 3-way matching!`);
      await loadOrders();
      setTimeout(() => {
        setActionSuccess(null);
        navigate('/invoices');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to flip invoice');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">New Order Issued</span>;
      case 'ACKNOWLEDGED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Acknowledged (ACK)</span>;
      case 'IN_FULFILLMENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">In Fulfillment</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Shipped (ASN Issued)</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">Completed & Invoiced</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>P2P Digital Fulfillment & Order Execution</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders & PO-to-Invoice Flip</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            Receive approved purchase orders directly from buyers, acknowledge delivery timelines, dispatch Advance Shipping Notices (ASN), and perform touchless 1-Click PO flips into matched e-invoices.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-right">
            <div className="text-[11px] text-emerald-300 font-medium">Active PO Count</div>
            <div className="text-2xl font-extrabold text-white">{orders.length}</div>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-right">
            <div className="text-[11px] text-emerald-300 font-medium">Order Value</div>
            <div className="text-2xl font-extrabold text-white">
              ${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Orders List & Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Incoming Orders ({orders.length})</h2>
            <span className="text-xs text-slate-500">Live EDI / Network Feed</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">
              <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading purchase orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">
              No purchase orders found for this supplier organization.
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.map((po) => {
                const isSelected = selectedPO?.id === po.id;
                return (
                  <div
                    key={po.id}
                    onClick={() => setSelectedPO(po)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{po.poNumber}</span>
                          {getStatusBadge(po.status)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Buyer: <span className="font-medium text-slate-700">{po.buyerContactName}</span> • Terms: <span className="font-medium text-slate-700">{po.paymentTerms}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-slate-900">
                          ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400">{po.currency}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Ordered: {new Date(po.orderDate).toLocaleDateString()}</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PO Detail Workspace (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPO ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
                    <span>PURCHASE ORDER SPECIFICATION</span>
                    <span>•</span>
                    <span className="font-mono">{selectedPO.id}</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    {selectedPO.poNumber}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Issued to {selectedPO.supplierName} • Buyer Contact: {selectedPO.buyerContactName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPO.status === 'ISSUED' && (
                    <button
                      onClick={() => handleAcknowledge(selectedPO.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-700/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledge PO (ACK)</span>
                    </button>
                  )}

                  {selectedPO.status === 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => setShowAsnModal(true)}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-teal-700/30"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Dispatch Shipping ASN</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setFlipInvoiceNum(`INV-${selectedPO.poNumber.replace('PO-', '')}-01`);
                      setShowFlipModal(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-600/30"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>1-Click PO Flip to Invoice</span>
                  </button>
                </div>
              </div>

              {/* Status and Milestones Bar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Current Status:</span>
                  {getStatusBadge(selectedPO.status)}
                </div>
                {selectedPO.acknowledgedAt && (
                  <div className="text-slate-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ACK at {new Date(selectedPO.acknowledgedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedPO.asnNumber && (
                  <div className="text-slate-600 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-teal-600" />
                    <span>ASN #{selectedPO.asnNumber}</span>
                  </div>
                )}
                <div className="text-slate-600">
                  Payment Terms: <span className="font-semibold text-slate-800">{selectedPO.paymentTerms}</span>
                </div>
              </div>

              {/* Addresses and Logistics info */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Ship-To Delivery Address
                  </div>
                  <div className="text-slate-800 font-medium whitespace-pre-line">
                    {selectedPO.shippingAddress}
                  </div>
                  <div className="mt-2 text-slate-500">Promised Date: <span className="font-bold text-slate-700">{selectedPO.promisedDate}</span></div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Bill-To Accounts Payable Address
                  </div>
                  <div className="text-slate-800 font-medium whitespace-pre-line">
                    {selectedPO.billingAddress}
                  </div>
                  <div className="mt-2 text-slate-500">Currency: <span className="font-bold text-slate-700">{selectedPO.currency}</span></div>
                </div>
              </div>

              {/* Line items table */}
              <div className="p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Ordered Line Items ({selectedPO.lineItems.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3 font-semibold">#</th>
                        <th className="py-2.5 px-3 font-semibold">Part Number</th>
                        <th className="py-2.5 px-3 font-semibold">Description</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Qty</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPO.lineItems.map((li) => (
                        <tr key={li.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono text-slate-400">{li.itemNumber}</td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-700">{li.partNumber}</td>
                          <td className="py-3 px-3 text-slate-900 font-medium">{li.description}</td>
                          <td className="py-3 px-3 text-right font-semibold text-slate-700">{li.quantity} {li.uom}</td>
                          <td className="py-3 px-3 text-right text-slate-600">${li.unitPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">${li.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col items-end text-xs space-y-1.5">
                  <div className="flex justify-between w-48 text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">${selectedPO.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-48 text-slate-600">
                    <span>Estimated Tax:</span>
                    <span className="font-semibold text-slate-900">${selectedPO.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-48 text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                    <span>Total PO Amount:</span>
                    <span className="text-emerald-700">${selectedPO.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* AI Automation Insight Callout */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start space-x-3 text-xs">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">AI PO-to-Invoice Automation Ready:</span>
                    <p className="text-emerald-800 mt-0.5">
                      Flipping this PO will automatically create an electronic invoice matching all line items, quantities, and agreed contracted prices. Upon submission, it will immediately undergo touchless 3-way matching against Goods Receipt, eliminating reconciliation disputes and accelerating settlement approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select an order on the left to inspect line items, acknowledge, ship, or flip into an invoice.
            </div>
          )}
        </div>
      </div>

      {/* Dispatch ASN Modal */}
      {showAsnModal && selectedPO && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center space-x-2 text-teal-600 font-bold text-xs uppercase mb-2">
              <Truck className="w-4 h-4" />
              <span>Advance Shipping Notice (ASN)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Ship Order {selectedPO.poNumber}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter shipping logistics details to notify buyer warehouse receivers.
            </p>

            <form onSubmit={handleDispatchASN} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Carrier Name</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="FedEx Freight">FedEx Freight</option>
                  <option value="UPS Supply Chain Solutions">UPS Supply Chain Solutions</option>
                  <option value="DHL Global Forwarding">DHL Global Forwarding</option>
                  <option value="Old Dominion Freight Line">Old Dominion Freight Line</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Number / Bill of Lading (BOL)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FX-992144810-US"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAsnModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-teal-700/20"
                >
                  Confirm & Dispatch ASN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click PO Flip Modal */}
      {showFlipModal && selectedPO && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase mb-1">
              <Receipt className="w-4 h-4" />
              <span>Touchless PO-to-Invoice Flip Engine</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Generate E-Invoice from {selectedPO.poNumber}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              All line items, quantities, and pre-negotiated contracted rates will be mapped 1:1 into the new invoice for automated 3-way matching.
            </p>

            <form onSubmit={handleFlipInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={flipInvoiceNum}
                  onChange={(e) => setFlipInvoiceNum(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={flipTaxRate}
                    onChange={(e) => setFlipTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <input
                    type="text"
                    disabled
                    value={selectedPO.currency}
                    className="w-full text-xs border border-slate-200 bg-slate-100 rounded-lg p-2.5 text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>PO Line Items:</span>
                  <span className="font-semibold">{selectedPO.lineItems.length} items</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-semibold">${selectedPO.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700 font-bold pt-1 border-t border-slate-200">
                  <span>Estimated Total Invoiced:</span>
                  <span>${(selectedPO.subtotal * (1 + flipTaxRate / 100)).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFlipModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-lg text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Execute 1-Click Flip & Submit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
