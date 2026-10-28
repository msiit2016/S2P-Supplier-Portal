import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { CatalogItem } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  Layers, 
  UploadCloud, 
  Plus, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  FileText,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Package,
  FolderLock
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext.js';

interface SupplierDataExchangeProps {
  defaultTab?: 'CATALOG' | 'DOCUMENTS';
}

export const SupplierDataExchange: React.FC<SupplierDataExchangeProps> = ({ defaultTab }) => {
  const { currentUser } = useAuth();
  const { currentRoute } = usePortal();
  const initial = defaultTab || (currentRoute.startsWith('/documents') || currentRoute.startsWith('/vault') ? 'DOCUMENTS' : 'CATALOG');
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'DOCUMENTS'>(initial);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('IT_HARDWARE_SERVICES');
  const [unitPrice, setUnitPrice] = useState<number>(100);
  const [uom, setUom] = useState('EA');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);

  // Compliance Documents mock data
  const [complianceDocs, setComplianceDocs] = useState([
    {
      id: 'doc-001',
      title: 'IRS Form W-9 (Taxpayer ID & Certification)',
      type: 'IRS_W9',
      issuedDate: '2026-01-15',
      expiryDate: '2026-12-31',
      daysRemaining: 66,
      status: 'ACTIVE',
      fileSize: '412 KB',
      verifiedBy: 'AI Tax Verification Agent'
    },
    {
      id: 'doc-002',
      title: 'ACORD 25 Certificate of Liability Insurance',
      type: 'CERT_INSURANCE_ACORD',
      issuedDate: '2025-11-15',
      expiryDate: '2026-11-15',
      daysRemaining: 20,
      status: 'EXPIRING_SOON',
      fileSize: '1.2 MB',
      verifiedBy: 'Compliance Officer (Human Verified)'
    },
    {
      id: 'doc-003',
      title: 'ISO/IEC 27001 Information Security Management Certificate',
      type: 'ISO_27001',
      issuedDate: '2025-06-01',
      expiryDate: '2027-06-01',
      daysRemaining: 218,
      status: 'ACTIVE',
      fileSize: '890 KB',
      verifiedBy: 'AI Document Extractor'
    },
    {
      id: 'doc-004',
      title: 'Official Bank Account Verification Letter',
      type: 'BANK_VERIFICATION_LETTER',
      issuedDate: '2026-02-10',
      expiryDate: '2027-02-10',
      daysRemaining: 107,
      status: 'ACTIVE',
      fileSize: '540 KB',
      verifiedBy: 'Plaid / Early Warning System API'
    }
  ]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getCatalogItems();
      if (res && res.catalogItems) {
        setCatalogItems(res.catalogItems);
      }
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [currentUser]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.upsertCatalogItem({
        sku,
        name,
        category,
        unitPrice,
        uom,
        leadTimeDays
      });
      setShowAddModal(false);
      setActionSuccess(`Catalog item ${sku} successfully published to buyer network!`);
      await loadCatalog();
      setSku('');
      setName('');
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to save catalog item');
    }
  };

  const handleSimulateBulkCsv = async () => {
    try {
      const sampleItems = [
        { sku: 'IT-SRV-ENT-01', name: 'Dedicated Cloud Enterprise Node 64GB', unitPrice: 850.00, uom: 'MO', leadTimeDays: 2 },
        { sku: 'IT-SEC-EDR-50', name: 'Endpoint Detection & Response (50 Pack)', unitPrice: 2200.00, uom: 'YR', leadTimeDays: 1 },
        { sku: 'DEV-ENG-SPR-01', name: 'Senior Fullstack Engineering Sprint', unitPrice: 12500.00, uom: 'EA', leadTimeDays: 5 }
      ];
      for (const it of sampleItems) {
        await ApiClient.upsertCatalogItem(it);
      }
      setActionSuccess('🎉 Bulk CSV Import Simulation Complete: 3 enterprise items loaded and mapped.');
      await loadCatalog();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      alert('Failed to simulate bulk import');
    }
  };

  const handleRenewDoc = (docId: string) => {
    setComplianceDocs(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          issuedDate: new Date().toISOString().split('T')[0],
          expiryDate: '2027-11-15',
          daysRemaining: 365,
          status: 'ACTIVE',
          verifiedBy: 'AI Auto-Validated Renewal'
        };
      }
      return d;
    }));
    setActionSuccess('Document renewal certificate uploaded and automatically verified via AI OCR engine!');
    setTimeout(() => setActionSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>S2P Data Exchange & Enterprise Compliance Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Catalog Management & Document Vault</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Synchronize negotiated item catalogs, SKUs, and pricing directly with buyer procurement systems. Monitor compliance certifications with automated expiration warning agents.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'CATALOG'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-300" />
            <span>Product Catalogs ({catalogItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'DOCUMENTS'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <FolderLock className="w-4 h-4 text-teal-300" />
            <span>Compliance Vault ({complianceDocs.length})</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-xl shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center space-x-3 text-teal-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-teal-600 hover:text-teal-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* CATALOG VIEW */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Contracted Products & Services Catalog</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                These items are indexed by buyer procurement punch-outs and requisition carts.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSimulateBulkCsv}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>Bulk CSV / cXML Import</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item / SKU</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-3 px-4 font-semibold">SKU / Code</th>
                    <th className="py-3 px-4 font-semibold">Item Name & Description</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
                    <th className="py-3 px-4 font-semibold text-center">UOM</th>
                    <th className="py-3 px-4 font-semibold text-center">Lead Time</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.sku}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-slate-400 text-[11px]">{item.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-mono">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{item.uom}</td>
                      <td className="py-3.5 px-4 text-center text-slate-600">{item.leadTimeDays} days</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COMPLIANCE VAULT VIEW */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Enterprise Compliance Document Vault</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proactively monitor certifications, liability insurance, and tax forms to prevent invoice clearing holds.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>1 Certificate Expiring in 20 Days</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceDocs.map((doc) => {
              const isWarning = doc.status === 'EXPIRING_SOON';
              return (
                <div
                  key={doc.id}
                  className={`p-5 rounded-2xl border transition bg-white ${
                    isWarning
                      ? 'border-amber-300 shadow-xs ring-1 ring-amber-300'
                      : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{doc.title}</h3>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.type} • {doc.fileSize}</div>
                      </div>
                    </div>
                  </div>

                  {/* Expiration bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Valid Until</div>
                      <div className="font-semibold text-slate-800">{doc.expiryDate}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
                      {isWarning ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Expires in {doc.daysRemaining} days
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active & Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg flex items-center justify-between">
                    <span>Verified by: <strong className="text-slate-700">{doc.verifiedBy}</strong></span>
                    {isWarning && (
                      <button
                        onClick={() => handleRenewDoc(doc.id)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold shadow-xs transition"
                      >
                        Upload Renewal
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Catalog Product / Service</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter SKU details to publish directly to buyer requisition systems.
            </p>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SRV-CLOUD-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Managed Kubernetes Cluster 32GB"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UOM</label>
                  <input
                    type="text"
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
                <input
                  type="number"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-md shadow-teal-700/20"
                >
                  Save & Publish Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
