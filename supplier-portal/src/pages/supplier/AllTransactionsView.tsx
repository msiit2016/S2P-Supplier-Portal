import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { PurchaseOrder, Invoice, BuyerSpecificProfile } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { 
  ShoppingCart, 
  Receipt, 
  CheckCircle2, 
  ChevronRight, 
  Layers,
  Search,
  Download,
  Clock,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  X,
  CreditCard,
  Building2
} from 'lucide-react';

export const AllTransactionsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate, openBuyerWorkspace } = usePortal();

  const [activeTab, setActiveTab] = useState<'ORDERS' | 'INVOICES'>('ORDERS');
  const [selectedBuyerFilter, setSelectedBuyerFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [buyers, setBuyers] = useState<BuyerSpecificProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesBuyer = selectedBuyerFilter === 'ALL' || o.buyerOrgId === selectedBuyerFilter;
    if (!matchesBuyer) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const buyerName = buyers.find((b) => b.buyerOrgId === o.buyerOrgId)?.buyerName || '';
    return (
      o.poNumber.toLowerCase().includes(q) ||
      buyerName.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      (o.paymentTerms && o.paymentTerms.toLowerCase().includes(q))
    );
  });

  // Filtered Invoices
  const filteredInvoices = invoices.filter((i) => {
    const matchesBuyer = selectedBuyerFilter === 'ALL' || i.buyerOrgId === selectedBuyerFilter;
    if (!matchesBuyer) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const buyerName = buyers.find((b) => b.buyerOrgId === i.buyerOrgId)?.buyerName || '';
    return (
      i.invoiceNumber.toLowerCase().includes(q) ||
      (i.poNumber && i.poNumber.toLowerCase().includes(q)) ||
      buyerName.toLowerCase().includes(q) ||
      i.paymentStatus.toLowerCase().includes(q) ||
      (i.matchStatus && i.matchStatus.toLowerCase().includes(q))
    );
  });

  const totalOrderValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalInvoiceValue = filteredInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const pendingPaymentValue = filteredInvoices
    .filter((i) => i.paymentStatus !== 'PAID')
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const selectedBuyerObj = buyers.find((b) => b.buyerOrgId === selectedBuyerFilter);
  const selectedBuyerName = selectedBuyerObj ? selectedBuyerObj.buyerName : selectedBuyerFilter;

  // Export to Excel / CSV
  const handleExportToExcel = () => {
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'ORDERS') {
      if (filteredOrders.length === 0) {
        alert('No purchase orders to export.');
        return;
      }
      const headers = [
        'PO Number',
        'Buyer Enterprise',
        'Order Date',
        'Promised Delivery',
        'Payment Terms',
        'Order Total ($)',
        'Currency',
        'Status'
      ];
      const rows = filteredOrders.map((po) => {
        const buyerName = buyers.find((b) => b.buyerOrgId === po.buyerOrgId)?.buyerName || po.buyerOrgId;
        return [
          `"${po.poNumber}"`,
          `"${buyerName.replace(/"/g, '""')}"`,
          `"${new Date(po.orderDate).toLocaleDateString()}"`,
          `"${po.promisedDate ? new Date(po.promisedDate).toLocaleDateString() : 'N/A'}"`,
          `"${po.paymentTerms || 'Net 30'}"`,
          po.totalAmount.toFixed(2),
          `"${po.currency || 'USD'}"`,
          `"${po.status}"`
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      downloadCsvFile(csvContent, `Purchase_Orders_${today}.csv`);
      setActionSuccess(`Exported ${filteredOrders.length} purchase orders to Excel.`);
    } else {
      if (filteredInvoices.length === 0) {
        alert('No invoices to export.');
        return;
      }
      const headers = [
        'Invoice Number',
        'Buyer Enterprise',
        'Related PO',
        'Invoice Date',
        'Due Date',
        '3-Way Match Status',
        'Invoice Amount ($)',
        'Currency',
        'Payment Status'
      ];
      const rows = filteredInvoices.map((inv) => {
        const buyerName = buyers.find((b) => b.buyerOrgId === inv.buyerOrgId)?.buyerName || inv.buyerOrgId;
        return [
          `"${inv.invoiceNumber}"`,
          `"${buyerName.replace(/"/g, '""')}"`,
          `"${inv.poNumber || 'N/A'}"`,
          `"${inv.invoiceDate || 'N/A'}"`,
          `"${inv.dueDate || 'N/A'}"`,
          `"${inv.matchStatus || 'PENDING'}"`,
          inv.totalAmount.toFixed(2),
          `"${inv.currency || 'USD'}"`,
          `"${inv.paymentStatus || 'SUBMITTED'}"`
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      downloadCsvFile(csvContent, `Invoices_${today}.csv`);
      setActionSuccess(`Exported ${filteredInvoices.length} invoices to Excel.`);
    }

    setTimeout(() => setActionSuccess(null), 4000);
  };

  const downloadCsvFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACKNOWLEDGED':
      case 'PAID':
      case '3_WAY_MATCHED':
      case 'APPROVED_FOR_PAYMENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ISSUED':
      case 'SUBMITTED':
      case 'SCHEDULED':
      case 'PENDING':
      case '2_WAY_MATCHED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'DISCREPANCY_FLAGGED':
      case 'REJECTED':
      case 'UNDER_REVIEW':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Unified Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Left: Title, Badge & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">All Transactions</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeTab === 'ORDERS' ? `${filteredOrders.length} orders` : `${filteredInvoices.length} invoices`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Purchase orders and electronic invoices across connected buyers</p>
            </div>
          </div>
        </div>

        {/* Right: Integrated Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'ORDERS' ? "Search POs, buyers..." : "Search invoices, buyers..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-44 text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/70"
            />
          </div>

          {/* Buyer Filter Dropdown */}
          <select
            value={selectedBuyerFilter}
            onChange={(e) => setSelectedBuyerFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            title="Filter by buyer enterprise"
          >
            <option value="ALL">All Buyers ({buyers.length})</option>
            {buyers.map((b) => (
              <option key={b.id || b.buyerOrgId} value={b.buyerOrgId}>
                {b.buyerName}
              </option>
            ))}
          </select>

          {/* Orders vs Invoices Pill Switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ORDERS'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3 h-3 text-indigo-600" />
              <span>Orders ({filteredOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'INVOICES'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3 h-3 text-emerald-600" />
              <span>Invoices ({filteredInvoices.length})</span>
            </button>
          </div>

          {/* Export to Excel Button */}
          <button
            onClick={handleExportToExcel}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Export filtered records to Microsoft Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Slim Financial Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
              ${totalOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoiced Total</div>
            <div className="text-sm font-extrabold text-emerald-700 mt-0.5 font-mono">
              ${totalInvoiceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Settlement</div>
            <div className="text-sm font-extrabold text-amber-700 mt-0.5 font-mono">
              ${pendingPaymentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              {selectedBuyerFilter === 'ALL' ? 'Enterprise Buyers' : 'Selected Buyer'}
            </div>
            <div 
              className="text-sm font-extrabold text-slate-900 mt-0.5 truncate"
              title={selectedBuyerFilter === 'ALL' ? `All Buyers (${buyers.length})` : selectedBuyerName}
            >
              {selectedBuyerFilter === 'ALL' ? `All Buyers (${buyers.length})` : selectedBuyerName}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/80">
                  <th className="py-3 px-4 font-semibold text-[11px]">PO Number</th>
                  <th className="py-3 px-4 font-semibold text-[11px]">Buyer Enterprise</th>
                  <th className="py-3 px-4 font-semibold text-[11px]">Order Date</th>
                  <th className="py-3 px-4 font-semibold text-[11px]">Payment Terms</th>
                  <th className="py-3 px-4 font-semibold text-[11px] text-right">Order Total</th>
                  <th className="py-3 px-4 font-semibold text-[11px] text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-[11px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((po) => {
                  const buyer = buyers.find((b) => b.buyerOrgId === po.buyerOrgId);
                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {po.poNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {buyer?.buyerName || po.buyerOrgId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(po.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {po.paymentTerms}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-mono whitespace-nowrap">
                        ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusBadge(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openBuyerWorkspace(po.buyerOrgId, 'ORDERS')}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Workspace</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && !loading && (
            <div className="p-12 text-center">
              <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
              <h3 className="text-sm font-bold text-slate-800">No purchase orders found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No orders match your filter criteria or search query.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Invoices Table */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/80">
                  <th className="py-3 px-4 font-semibold text-[11px]">Invoice #</th>
                  <th className="py-3 px-4 font-semibold text-[11px]">Buyer Enterprise</th>
                  <th className="py-3 px-4 font-semibold text-[11px]">Due Date</th>
                  <th className="py-3 px-4 font-semibold text-[11px] text-center">3-Way Match</th>
                  <th className="py-3 px-4 font-semibold text-[11px] text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-[11px] text-center">Payment Status</th>
                  <th className="py-3 px-4 font-semibold text-[11px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const buyer = buyers.find((b) => b.buyerOrgId === inv.buyerOrgId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {buyer?.buyerName || inv.buyerOrgId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getStatusBadge(inv.matchStatus)}`}>
                          {inv.matchStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-mono whitespace-nowrap">
                        ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusBadge(inv.paymentStatus)}`}>
                          {inv.paymentStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openBuyerWorkspace(inv.buyerOrgId, 'INVOICES')}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Workspace</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && !loading && (
            <div className="p-12 text-center">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
              <h3 className="text-sm font-bold text-slate-800">No invoices found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No invoices match your filter criteria or search query.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
