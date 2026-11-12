import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { PurchaseOrder, Invoice, BuyerSpecificProfile } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { formatDateMMDDYYYY, calculateDaysRemaining } from '../../utils/dateUtils.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
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
  const { navigate, openBuyerWorkspace, routeState } = usePortal();

  const [activeTab, setActiveTab] = useState<'ORDERS' | 'INVOICES'>(
    routeState?.tab === 'INVOICES' ? 'INVOICES' : 'ORDERS'
  );

  useEffect(() => {
    if (routeState?.tab === 'INVOICES') {
      setActiveTab('INVOICES');
    } else if (routeState?.tab === 'ORDERS') {
      setActiveTab('ORDERS');
    }
  }, [routeState]);
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

  // Broadcast live Transactions context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'transactions',
      ordersCount: orders.length,
      invoicesCount: invoices.length,
      activeTab,
      selectedBuyerFilter,
      totalOrdersValue: '$384,660.00',
      totalInvoicesValue: '$440,840.00'
    });
  }, [orders, invoices, activeTab, selectedBuyerFilter]);

  // Listen to actions dispatched by Ava Copilot
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'FILTER_LEDGER_BUYER' && action.payload?.buyerOrgId) {
        setSelectedBuyerFilter(action.payload.buyerOrgId);
      }
    });
    return cleanup;
  }, []);

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
        'Vendor Enterprise',
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
          `"${formatDateMMDDYYYY(po.orderDate)}"`,
          `"${po.promisedDate ? formatDateMMDDYYYY(po.promisedDate) : 'N/A'}"`,
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
        'Vendor Enterprise',
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
    const s = status.toUpperCase();
    if (s.includes('PAID') || s.includes('CONFIRM') || s.includes('MATCHED') || s.includes('ACKNOWLEDGED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/70';
    }
    if (s.includes('PENDING') || s.includes('HOLD') || s.includes('REVIEW')) {
      return 'bg-amber-50 text-amber-800 border-amber-200/70';
    }
    if (s.includes('OPEN') || s.includes('PARTIAL') || s.includes('PROCESSING')) {
      return 'bg-sky-50 text-sky-700 border-sky-200/70';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Compact Unified Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Left: Title, Badge & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">All Transactions</h1>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">Consolidated order and invoice ledger across all enterprise buyers.</p>
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
              placeholder={activeTab === 'ORDERS' ? "Search POs, vendors..." : "Search invoices, vendors..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-44 text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/70"
            />
          </div>

          {/* Vendor Filter Dropdown */}
          <FilterSelect
            value={selectedBuyerFilter}
            onChange={(e) => setSelectedBuyerFilter(e.target.value)}
            title="Filter by vendor enterprise"
          >
            <option value="ALL">All Vendors ({buyers.length})</option>
            {buyers.map((b) => (
              <option key={b.id || b.buyerOrgId} value={b.buyerOrgId}>
                {b.buyerName}
              </option>
            ))}
          </FilterSelect>

          {(selectedBuyerFilter !== 'ALL' || searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setSelectedBuyerFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer px-1"
            >
              Reset Filters
            </button>
          )}

          {/* Orders vs Invoices Pill Switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ORDERS'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3 h-3 text-slate-600" />
              <span>Orders ({filteredOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'INVOICES'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3 h-3 text-slate-600" />
              <span>Invoices ({filteredInvoices.length})</span>
            </button>
          </div>

          {/* Export to Excel Button */}
          <button
            onClick={handleExportToExcel}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer"
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
        {/* KPI 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            ${totalOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-sky-700 font-medium truncate transition">
              {orders.length} orders across network
            </span>
            <Sparkline data={[240000, 275000, 310000, 340000, 365000, totalOrderValue || 385000]} color="#0284c7" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoiced Total</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-emerald-700 mt-1 font-mono">
            ${totalInvoiceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-emerald-700 font-medium truncate transition">
              {invoices.length} billed invoices
            </span>
            <Sparkline data={[54000, 61000, 68000, 75000, 84000, totalInvoiceValue || 94384]} color="#10b981" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Settlement</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-amber-700 mt-1 font-mono">
            ${pendingPaymentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium truncate transition">
              Scheduled payout cycle
            </span>
            <Sparkline data={[48000, 56000, 62000, 70000, 74000, pendingPaymentValue || 78570]} color="#d97706" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              {selectedBuyerFilter === 'ALL' ? 'Enterprise Vendors' : 'Selected Vendor'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div 
            className="text-base font-bold text-slate-900 mt-1 truncate"
            title={selectedBuyerFilter === 'ALL' ? `All Vendors (${buyers.length})` : selectedBuyerName}
          >
            {selectedBuyerFilter === 'ALL' ? `All Vendors (${buyers.length})` : selectedBuyerName}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-teal-700 font-medium truncate transition">
              Active buyer partnerships
            </span>
            <Sparkline data={[1, 2, 2, 3, 3, Math.max(3, buyers.length)]} color="#0d9488" width={68} height={20} />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1080px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">PO NUMBER</th>
                  <th className="py-3 px-4">BUYER / CLIENT</th>
                  <th className="py-3 px-4">ORDER DATE</th>
                  <th className="py-3 px-4">PAYMENT TERMS</th>
                  <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
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
                        {formatDateMMDDYYYY(po.orderDate)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {po.paymentTerms}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                        ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusBadge(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => navigate('/orders', { poNumber: po.poNumber })}
                            className="w-28 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center justify-center"
                          >
                            View PO
                          </button>
                        </div>
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1080px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">INVOICE NUMBER</th>
                  <th className="py-3 px-4">BUYER / CLIENT</th>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4 text-center">3-WAY MATCH</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap" title="Total Invoice Value including GST / Taxes">TOTAL INVOICE VALUE</th>
                  <th className="py-3 px-4 text-center">PAYMENT STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {(() => {
                          const daysLeft = calculateDaysRemaining(inv.dueDate);
                          return (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 text-xs">{formatDateMMDDYYYY(inv.dueDate)}</span>
                              {inv.paymentStatus === 'PAID' ? (
                                <span className="text-[10px] font-semibold text-emerald-600">Settled</span>
                              ) : (
                                <span className={`text-[10px] font-medium ${
                                  daysLeft.isOverdue 
                                    ? 'text-rose-600 font-bold' 
                                    : daysLeft.days <= 7 
                                      ? 'text-amber-600 font-bold' 
                                      : 'text-slate-400'
                                }`}>
                                  {daysLeft.days > 0 ? `Due in ${daysLeft.days}d` : daysLeft.text}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getStatusBadge(inv.matchStatus)}`}>
                          {inv.matchStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                        ${((inv.subtotal && typeof inv.taxAmount === 'number' && inv.taxAmount > 0 && (!inv.totalAmount || Math.abs(inv.totalAmount - inv.subtotal) < 0.01))
                          ? (inv.subtotal + inv.taxAmount)
                          : (inv.totalAmount || 0)
                        ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusBadge(inv.paymentStatus)}`}>
                          {inv.paymentStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => navigate('/invoices', { invoiceNumber: inv.invoiceNumber })}
                            className="w-28 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center justify-center"
                          >
                            View Invoice
                          </button>
                        </div>
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
