import React, { useState, useRef } from 'react';
import { 
  FolderLock, 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  UploadCloud, 
  Plus, 
  Search, 
  Eye, 
  Clock, 
  Sparkles,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface ComplianceDoc {
  id: string;
  title: string;
  type: string;
  issuedDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  fileSize: string;
  verifiedBy: string;
  documentCategory: string;
}

export const SupplierDocVault: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRING'>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('CERT_INSURANCE_ACORD');
  const [docCategory, setDocCategory] = useState('Insurance & Liability');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [isPermanent, setIsPermanent] = useState(false);
  const [fileName, setFileName] = useState('certificate_upload.pdf');
  const [showExpiryBanner, setShowExpiryBanner] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<ComplianceDoc | null>(null);

  // Compliance Documents mock data
  const [complianceDocs, setComplianceDocs] = useState<ComplianceDoc[]>([
    {
      id: 'doc-001',
      title: 'IRS Form W-9 (Taxpayer ID & Certification)',
      type: 'IRS_W9',
      documentCategory: 'Tax & Regulatory',
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
      documentCategory: 'Insurance & Liability',
      issuedDate: '2025-11-15',
      expiryDate: '2026-11-15',
      daysRemaining: 20,
      status: 'EXPIRING_SOON',
      fileSize: '1.2 MB',
      verifiedBy: 'Compliance Officer'
    },
    {
      id: 'doc-003',
      title: 'ISO/IEC 27001 Information Security Management Certificate',
      type: 'ISO_27001',
      documentCategory: 'Cybersecurity & Audits',
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
      documentCategory: 'Banking & Treasury',
      issuedDate: '2026-02-10',
      expiryDate: '2027-02-10',
      daysRemaining: 107,
      status: 'ACTIVE',
      fileSize: '540 KB',
      verifiedBy: 'Plaid / Early Warning API'
    }
  ]);

  const handleRenewDoc = (docId: string) => {
    setComplianceDocs(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          issuedDate: new Date().toISOString().split('T')[0],
          expiryDate: '2027-11-15',
          daysRemaining: 365,
          status: 'ACTIVE',
          verifiedBy: 'Auto-Validated Renewal'
        };
      }
      return d;
    }));
    setActionSuccess('Document renewal uploaded and verified.');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    const newDoc: ComplianceDoc = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      title: docTitle,
      type: docType,
      documentCategory: docCategory,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: isPermanent ? 'Permanent' : (expiryDate || '2027-12-31'),
      daysRemaining: isPermanent ? 9999 : 365,
      status: 'ACTIVE',
      fileSize: fileName.includes('.') ? '780 KB' : '650 KB',
      verifiedBy: 'AI Document Extractor'
    };

    setComplianceDocs(prev => [newDoc, ...prev]);
    setShowUploadModal(false);
    setDocTitle('');
    setIsPermanent(false);
    setActionSuccess(`"${newDoc.title}" uploaded successfully.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filteredDocs = complianceDocs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.verifiedBy.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'ACTIVE') return doc.status === 'ACTIVE';
    if (filterStatus === 'EXPIRING') return doc.status === 'EXPIRING_SOON';
    return true;
  });

  const expiringCount = complianceDocs.filter(d => d.status === 'EXPIRING_SOON').length;
  const activeCount = complianceDocs.filter(d => d.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Compact Unified Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Title, Badges & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <FolderLock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Document Vault</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {filteredDocs.length} documents
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Upload and manage your company documents</p>
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
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-44 text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/70"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({complianceDocs.length})
            </button>
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                filterStatus === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('EXPIRING')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                filterStatus === 'EXPIRING'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expiring ({expiringCount})
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Expiry Warning Callout */}
      {showExpiryBanner && expiringCount > 0 && filterStatus !== 'ACTIVE' && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-3 text-xs text-amber-900">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <span className="font-bold">Renewal required:</span> 1 certificate expires in 20 days. Upload an updated policy to avoid order or payment holds.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleRenewDoc('doc-002')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs shrink-0 cursor-pointer transition"
            >
              Renew Policy
            </button>
            <button
              onClick={() => setShowExpiryBanner(false)}
              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100/80 rounded-lg transition cursor-pointer"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Compliance Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const isWarning = doc.status === 'EXPIRING_SOON';
          return (
            <div
              key={doc.id}
              className={`p-5 rounded-2xl border transition bg-white ${
                isWarning
                  ? 'border-amber-300 shadow-sm ring-2 ring-amber-300/40'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isWarning ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : <FileCheck className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{doc.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{doc.type}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400">{doc.fileSize}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500">{doc.documentCategory}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    title="View Details"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActionSuccess(`Downloading "${doc.title}"...`);
                      setTimeout(() => setActionSuccess(null), 3000);
                    }}
                    title="Download Copy"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expiration Details Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valid Until</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{doc.expiryDate}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                  <div className="mt-0.5">
                    {isWarning ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Expires in {doc.daysRemaining}d</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification & Action footer */}
              <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                <span className="truncate pr-2">
                  Verified by: <strong className="text-slate-800 font-medium">{doc.verifiedBy}</strong>
                </span>
                {isWarning ? (
                  <button
                    onClick={() => handleRenewDoc(doc.id)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                  >
                    Renew
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                    Monitored
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FolderLock className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-sm font-bold text-slate-800">No documents found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Try adjusting your search query or status filter.
          </p>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <FolderLock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Document</h3>
                  <p className="text-xs text-slate-500">Upload any business, legal, financial, or operational document.</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Services Agreement / NDA / License / Report"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono"
                  >
                    <option value="GENERAL_DOCUMENT">General Document</option>
                    <option value="LEGAL_CONTRACT">Contract / Agreement</option>
                    <option value="NDA_ENTERPRISE">Executed Mutual NDA</option>
                    <option value="BUSINESS_LICENSE">Business License / Permit</option>
                    <option value="IRS_W9">IRS Form W-9</option>
                    <option value="CERT_INSURANCE_ACORD">ACORD 25 Insurance</option>
                    <option value="BANK_VERIFICATION_LETTER">Bank Letter / Proof</option>
                    <option value="ISO_27001">ISO/IEC 27001</option>
                    <option value="SOC2_TYPE2">SOC 2 Type II</option>
                    <option value="FINANCIAL_REPORT">Financial Statement</option>
                    <option value="OTHER_DOCUMENT">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="General & Operations">General & Operations</option>
                    <option value="Legal & Governance">Legal & Governance</option>
                    <option value="Tax & Regulatory">Tax & Regulatory</option>
                    <option value="Insurance & Liability">Insurance & Liability</option>
                    <option value="Banking & Treasury">Banking & Treasury</option>
                    <option value="Cybersecurity & Audits">Cybersecurity & Audits</option>
                    <option value="Licenses & Permits">Licenses & Permits</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Expiration Date</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPermanent}
                      onChange={(e) => setIsPermanent(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Permanent / No Expiration</span>
                  </label>
                </div>
                <input
                  type="date"
                  disabled={isPermanent}
                  required={!isPermanent}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isPermanent ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'
                  }`}
                />
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">File Attachment</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileName(file.name);
                      if (!docTitle) {
                        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition cursor-pointer group"
                >
                  <UploadCloud className="w-7 h-7 text-emerald-600 mx-auto mb-1 group-hover:scale-105 transition-transform" />
                  <p className="text-xs font-semibold text-slate-800">{fileName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click to choose any document (PDF, DOCX, XLSX, PNG, etc.)</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-700/20 cursor-pointer transition"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 truncate">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-mono font-bold text-slate-800">{previewDoc.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.documentCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issued:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.issuedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expires:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Size:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified by:</span>
                  <span className="font-bold text-emerald-700">{previewDoc.verifiedBy}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc(null);
                    setActionSuccess(`Downloaded ${previewDoc.title}`);
                    setTimeout(() => setActionSuccess(null), 3000);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
