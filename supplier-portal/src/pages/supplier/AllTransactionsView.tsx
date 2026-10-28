import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { PurchaseOrder, Invoice, BuyerSpecificProfile } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { 
  ShoppingCart, 
  Receipt, 
  Zap, 
  CheckCircle2, 
  Building2, 
  Filter, 
  ChevronRight, 
  Clock, 
  CreditCard,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AllTransactionsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = usePortal();

  const [activeTab, setActiveTab] = useState<'ORDERS' | 'INVOICES'>('ORDERS');
  const [selectedBuyerFilter, setSelectedBuyerFilter] = useState<string>('ALL');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [buyers, setBuyers] = useState<BuyerSpecificProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [oRes, iRes, bRes] = await Promise.all([
        ApiClient.getOrders(),
        ApiClient.getInvoices(),
        ApiClient.getBuyerProfiles()
      ]);
      if (oRes?.orders) setOrders(oRes.orders);
      if (iRes?.invoices) setInvoices(iRes.invoices);
      if (bRes?.buyerProfiles) setBuyers(bRes.buyerProfiles);
    } catch (err) {
      console.error('Failed to load all transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const filteredOrders = selectedBuyerFilter === 'ALL'
    ? orders
    : orders.filter(o => o.buyerOrgId === selectedBuyerFilter);

  const filteredInvoices = selectedBuyerFilter === 'ALL'
    ? invoices
    : invoices.filter(i => i.buyerOrgId === selectedBuyerFilter);

  const totalOrderValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalInvoiceValue = filteredInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Cross-Buyer S2P Ledger</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">All Purchase Orders & E-Invoices</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            A single consolidated feed of all incoming enterprise purchase orders, shipping statuses, and electronic invoices across all connected buyers.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total Order Volume</div>
            <div className="text-xl font-extrabold text-white">${totalOrderValue.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Invoiced Volume</div>
            <div className="text-xl font-extrabold text-emerald-400">${totalInvoiceValue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Buyer Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto scrollbar-none text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Buyer Filter:</span>
          </span>
          <button
            onClick={() => setSelectedBuyerFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
              selectedBuyerFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Buyers ({buyers.length})
          </button>
          {buyers.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBuyerFilter(b.buyerOrgId)}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                selectedBuyerFilter === b.buyerOrgId
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b.buyerName}
            </button>
          ))}
        </div>

        {/* Orders vs Invoices View Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'ORDERS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Orders ({filteredOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'INVOICES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Invoices ({filteredInvoices.length})</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="py-3 px-4 font-semibold">PO Number</th>
                  <th className="py-3 px-4 font-semibold">Buyer Enterprise</th>
                  <th className="py-3 px-4 font-semibold">Order Date</th>
                  <th className="py-3 px-4 font-semibold">Payment Terms</th>
                  <th className="py-3 px-4 font-semibold text-right">Order Total</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{po.poNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {buyers.find(b => b.buyerOrgId === po.buyerOrgId)?.buyerName || po.buyerOrgId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{po.paymentTerms}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">${po.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/workspaces')}
                        className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Buyer Enterprise</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold">3-Way Match</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Payment Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {buyers.find(b => b.buyerOrgId === inv.buyerOrgId)?.buyerName || inv.buyerOrgId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.matchStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">${inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/workspaces')}
                        className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
