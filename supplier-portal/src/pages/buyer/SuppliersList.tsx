import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { ApiClient } from '../../api/client.js';
import { SupplierOrganization } from '../../types/index.js';
import { Building, Search, Plus, ExternalLink, ShieldCheck } from 'lucide-react';

interface SuppliersListProps {
  onCreateSupplierClick: () => void;
}

export const SuppliersList: React.FC<SuppliersListProps> = ({ onCreateSupplierClick }) => {
  const { navigate } = usePortal();
  const [suppliers, setSuppliers] = useState<SupplierOrganization[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, [search]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getSuppliers({ search });
      if (res.suppliers) setSuppliers(res.suppliers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Supplier Master Directory
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {suppliers.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Authoritative vendor master directory and corporate succession lineage.</p>
        </div>

        <button
          onClick={onCreateSupplierClick}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search legal name, Tax ID, or ERP code..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b">
            <tr>
              <th className="py-3 px-4">Legal Supplier Entity</th>
              <th className="py-3 px-4">Tax ID / EIN</th>
              <th className="py-3 px-4">Country</th>
              <th className="py-3 px-4">ERP Vendor ID</th>
              <th className="py-3 px-4">Master Status</th>
              <th className="py-3 px-4">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map(sup => (
              <tr key={sup.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">
                  {sup.legalName}
                  {sup.tradeName && <span className="block text-[11px] text-slate-400 font-normal">DBA: {sup.tradeName}</span>}
                </td>
                <td className="py-3 px-4 font-mono">{sup.taxId || 'Not on file'}</td>
                <td className="py-3 px-4">{sup.country}</td>
                <td className="py-3 px-4 font-mono font-bold text-brand-600">
                  {sup.erpVendorId || 'Pending Activation'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    sup.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}>
                    {sup.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                  {new Date(sup.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
