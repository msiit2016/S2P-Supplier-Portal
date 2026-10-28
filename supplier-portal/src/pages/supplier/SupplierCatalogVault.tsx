import React, { useState, useEffect, useRef } from 'react';
import { ApiClient } from '../../api/client.js';
import { CatalogItem } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  Package, 
  UploadCloud, 
  Plus, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  X, 
  FileSpreadsheet, 
  Clock, 
  Download, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';

interface ParsedCsvItem {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  uom: string;
  leadTimeDays: number;
  description?: string;
}

export const SupplierCatalogVault: React.FC = () => {
  const { currentUser } = useAuth();
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Add Single Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IT_HARDWARE_SERVICES');
  const [unitPrice, setUnitPrice] = useState<number>(100);
  const [uom, setUom] = useState('EA');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);

  // Bulk CSV Import Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedCsvItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      await ApiClient.upsertCatalogItem({
        sku,
        name,
        category,
        unitPrice,
        uom,
        leadTimeDays
      });
      setShowAddModal(false);
      setActionSuccess(`Item ${sku} added successfully.`);
      await loadCatalog();
      setSku('');
      setName('');
      setDescription('');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save item');
    }
  };

  // 1. Download Standard CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = 
      "SKU,Name,Category,UnitPrice,UOM,LeadTimeDays,Description\r\n" +
      "IT-SRV-ENT-01,Dedicated Cloud Node 64GB,IT_HARDWARE_SERVICES,850.00,MO,2,Dual-redundant 64GB node\r\n" +
      "IT-SEC-EDR-50,Endpoint Protection (50 Pack),IT_HARDWARE_SERVICES,2200.00,YR,1,Managed enterprise telemetry protection\r\n" +
      "DEV-ENG-SPR-01,Senior Fullstack Sprint,PROFESSIONAL_SERVICES,12500.00,EA,5,Two-week agile sprint delivery\r\n" +
      "S2P-API-SYNC,PunchOut Stream Connector,SOFTWARE_LICENSES,4200.00,YR,1,Automated cXML PunchOut connector\r\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalog_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCsvFile(file);
  };

  // Process and parse CSV File content
  const processCsvFile = (file: File) => {
    setImportError(null);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('File is empty.');

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          throw new Error('CSV file has no data rows.');
        }

        const items: ParsedCsvItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length >= 2 && cols[0]) {
            items.push({
              sku: cols[0] || `SKU-${Date.now().toString().slice(-4)}`,
              name: cols[1] || 'Item',
              category: cols[2] || 'IT_HARDWARE_SERVICES',
              unitPrice: parseFloat(cols[3]) || 150.0,
              uom: cols[4] || 'EA',
              leadTimeDays: parseInt(cols[5]) || 3,
              description: cols[6] || ''
            });
          }
        }

        if (items.length === 0) {
          throw new Error('No valid rows found. Please check columns.');
        }

        setParsedItems(items);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse CSV. Please use the template.');
        setParsedItems([]);
      }
    };
    reader.readAsText(file);
  };

  // Load Sample Data
  const handleLoadSampleData = () => {
    setImportError(null);
    setUploadedFileName('catalog_batch_sample.csv');
    setUploadedFileSize('1.8 KB');
    setParsedItems([
      { sku: 'IT-SRV-ENT-01', name: 'Dedicated Cloud Node 64GB', category: 'IT_HARDWARE_SERVICES', unitPrice: 850.00, uom: 'MO', leadTimeDays: 2, description: 'Dual redundant node' },
      { sku: 'IT-SEC-EDR-50', name: 'Endpoint Protection (50 Pack)', category: 'IT_HARDWARE_SERVICES', unitPrice: 2200.00, uom: 'YR', leadTimeDays: 1, description: 'Managed security telemetry' },
      { sku: 'DEV-ENG-SPR-01', name: 'Senior Fullstack Sprint', category: 'PROFESSIONAL_SERVICES', unitPrice: 12500.00, uom: 'EA', leadTimeDays: 5, description: 'Agile engineering sprint' },
      { sku: 'S2P-API-SYNC', name: 'PunchOut Connector License', category: 'SOFTWARE_LICENSES', unitPrice: 4200.00, uom: 'YR', leadTimeDays: 1, description: 'Automated cXML stream' }
    ]);
  };

  // 3. Submit Bulk Import
  const handleSubmitBulkImport = async () => {
    if (parsedItems.length === 0) {
      setImportError('Please select a valid CSV file before importing.');
      return;
    }

    try {
      setIsImporting(true);
      setImportError(null);

      for (const item of parsedItems) {
        await ApiClient.upsertCatalogItem({
          sku: item.sku,
          name: item.name,
          category: item.category,
          unitPrice: item.unitPrice,
          uom: item.uom,
          leadTimeDays: item.leadTimeDays
        });
      }

      await loadCatalog();
      setShowBulkModal(false);
      setActionSuccess(`Successfully imported ${parsedItems.length} items.`);

      setUploadedFileName(null);
      setUploadedFileSize(null);
      setParsedItems([]);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setImportError(err.message || 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setParsedItems([]);
    setImportError(null);
  };

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  const categories = Array.from(new Set(catalogItems.map(item => item.category)));

  return (
    <div className="space-y-6">
      {/* Compact Unified Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Title, Badge & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Catalog Items</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  {filteredItems.length} items
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Products and services available to buyers</p>
            </div>
          </div>
        </div>

        {/* Integrated Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items or SKUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/70"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Action Buttons */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="bg-teal-50 border-l-4 border-teal-500 p-3 rounded-r-xl shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center space-x-2 text-teal-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-teal-700 hover:text-teal-900 text-xs font-semibold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Catalog Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/80">
                <th className="py-3 px-4 font-semibold text-[11px]">SKU</th>
                <th className="py-3 px-4 font-semibold text-[11px]">Item Name</th>
                <th className="py-3 px-4 font-semibold text-[11px]">Category</th>
                <th className="py-3 px-4 font-semibold text-[11px] text-right">Unit Price</th>
                <th className="py-3 px-4 font-semibold text-[11px] text-center">UOM</th>
                <th className="py-3 px-4 font-semibold text-[11px] text-center">Lead Time</th>
                <th className="py-3 px-4 font-semibold text-[11px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.sku}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 text-xs">{item.name}</div>
                    {item.description && (
                      <div className="text-slate-400 text-[11px] mt-0.5 max-w-md line-clamp-1">{item.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono whitespace-nowrap text-xs">
                    ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-semibold">{item.uom}</td>
                  <td className="py-3 px-4 text-center text-slate-600 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.leadTimeDays}d</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{item.status || 'PUBLISHED'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-slate-800">No items found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              No products match your criteria. Click "Add Item" or "Bulk Import" to get started.
            </p>
          </div>
        )}
      </div>

      {/* BULK CSV IMPORT MODAL - MINIMAL & CLEAR */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bulk Import Items</h3>
                  <p className="text-xs text-slate-500">Upload products and pricing via CSV template.</p>
                </div>
              </div>
              <button
                onClick={handleCloseBulkModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Notification */}
            {importError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Step 1: Template Download */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">1. CSV Template</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Download the pre-formatted template with standard columns.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>Download</span>
                </button>
              </div>

              {/* Step 2: Upload CSV File */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">2. Upload CSV</h4>
                  <button
                    type="button"
                    onClick={handleLoadSampleData}
                    className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Load sample data</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.txt,.cxml"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!uploadedFileName ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/20 rounded-xl p-6 text-center cursor-pointer transition group"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-teal-600 mx-auto mb-1.5 transition" />
                    <p className="text-xs font-semibold text-slate-800">
                      Drop CSV file here or click to browse
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports .csv or .cxml (max 15 MB)
                    </p>
                  </div>
                ) : (
                  <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{uploadedFileName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({uploadedFileSize})</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{parsedItems.length} items ready to import</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1 text-[11px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFileName(null);
                            setUploadedFileSize(null);
                            setParsedItems([]);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Table */}
                    {parsedItems.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-teal-200/60 max-h-32 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="text-slate-500 border-b border-teal-100">
                              <th className="pb-1 font-semibold">SKU</th>
                              <th className="pb-1 font-semibold">Name</th>
                              <th className="pb-1 font-semibold text-right">Price</th>
                              <th className="pb-1 font-semibold text-center">UOM</th>
                              <th className="pb-1 font-semibold text-center">Lead Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-teal-100/60">
                            {parsedItems.map((item, idx) => (
                              <tr key={idx} className="text-slate-700">
                                <td className="py-1 font-mono font-bold text-slate-900">{item.sku}</td>
                                <td className="py-1 truncate max-w-[160px]">{item.name}</td>
                                <td className="py-1 text-right font-mono font-bold text-slate-900">${item.unitPrice.toFixed(2)}</td>
                                <td className="py-1 text-center text-slate-500">{item.uom}</td>
                                <td className="py-1 text-center text-slate-500">{item.leadTimeDays}d</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500">
                  {parsedItems.length > 0 ? (
                    <span className="text-emerald-700 font-semibold">{parsedItems.length} items selected</span>
                  ) : (
                    <span>Select a file to continue</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseBulkModal}
                    className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={parsedItems.length === 0 || isImporting}
                    onClick={handleSubmitBulkImport}
                    className={`px-4 py-1.5 rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                      parsedItems.length === 0 || isImporting
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-700/20'
                    }`}
                  >
                    {isImporting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Importing...</span>
                      </>
                    ) : (
                      <span>Import Items</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Item</h3>
                  <p className="text-xs text-slate-500">Add a contracted SKU to your catalog.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SKU</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Managed Kubernetes Cluster 32GB"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="IT_HARDWARE_SERVICES">IT Hardware & Services</option>
                  <option value="PROFESSIONAL_SERVICES">Professional Services</option>
                  <option value="CLOUD_INFRASTRUCTURE">Cloud Infrastructure</option>
                  <option value="SOFTWARE_LICENSES">Software Licenses</option>
                  <option value="FACILITIES_MAINTENANCE">Facilities & Operations</option>
                </select>
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
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UOM</label>
                  <input
                    type="text"
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="EA, YR, MO, HRS"
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

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-md shadow-teal-700/20 cursor-pointer transition"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
