import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  UploadCloud, 
  Clock, 
  X, 
  Award, 
  FileText,
  ChevronDown,
  Paperclip,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { GepCertificateItem } from '../../types/index.js';
import { formatDateMMDDYYYY } from '../../utils/dateUtils.js';
import { SearchableSelect } from '../common/SearchableSelect.js';
import { DocumentPreviewModal, ComplianceDoc } from '../common/DocumentPreviewModal.js';

interface GepCertificatesGridProps {
  certificates: GepCertificateItem[];
  onChange: (certs: GepCertificateItem[]) => void;
  readOnly?: boolean;
  openAddTrigger?: number;
}

const CERT_TYPE_PRESETS: Record<string, { category: 'PROFESSIONAL' | 'DIVERSITY'; label: string; authority: string; validityYears: number }> = {
  COI_GENERAL: { category: 'PROFESSIONAL', label: 'ACORD 25 Certificate of Insurance (COI)', authority: 'Travelers Commercial Casualty', validityYears: 1 },
  ISO_27001: { category: 'PROFESSIONAL', label: 'ISO/IEC 27001 Information Security Management', authority: 'BSI Assurance UK', validityYears: 3 },
  ISO_9001: { category: 'PROFESSIONAL', label: 'ISO 9001 Quality Management System', authority: 'TÜV SÜD America', validityYears: 3 },
  SOC_2: { category: 'PROFESSIONAL', label: 'SOC 2 Type II Security & Confidentiality Audit', authority: 'Ernst & Young LLP', validityYears: 1 },
  AML_COMPLIANCE: { category: 'PROFESSIONAL', label: 'Anti-Money Laundering (AML) Compliance Protocol', authority: 'Corporate Regulatory Council', validityYears: 2 },
  MBE: { category: 'DIVERSITY', label: 'Minority Business Enterprise (MBE)', authority: 'NMSDC Regional Council', validityYears: 1 },
  WBE: { category: 'DIVERSITY', label: 'Women-Owned Business Enterprise (WBE)', authority: 'WBENC National Council', validityYears: 1 },
  VBE: { category: 'DIVERSITY', label: 'Veteran-Owned Small Business (VBE)', authority: 'National Veteran Business Council', validityYears: 1 }
};

const SAMPLE_CERT_DOCUMENTS = [
  {
    name: 'Travelers_ACORD_25_COI_2026.pdf',
    size: '1.6 MB',
    typeKey: 'COI_GENERAL',
    category: 'PROFESSIONAL' as const,
    authority: 'Travelers Commercial Casualty',
    effectiveDate: '2026-01-01',
    expiryDate: '2026-12-31',
    ocrConfidence: 99.6
  },
  {
    name: 'BSI_ISO27001_Audit_Attestation.pdf',
    size: '2.1 MB',
    typeKey: 'ISO_27001',
    category: 'PROFESSIONAL' as const,
    authority: 'BSI Assurance UK',
    effectiveDate: '2025-06-15',
    expiryDate: '2028-06-14',
    ocrConfidence: 99.2
  },
  {
    name: 'EY_SOC2_Type_II_Executive_Summary.pdf',
    size: '1.8 MB',
    typeKey: 'SOC_2',
    category: 'PROFESSIONAL' as const,
    authority: 'Ernst & Young LLP',
    effectiveDate: '2025-11-01',
    expiryDate: '2026-10-31',
    ocrConfidence: 98.9
  },
  {
    name: 'WBENC_Women_Owned_Business_Certificate.pdf',
    size: '1.2 MB',
    typeKey: 'WBE',
    category: 'DIVERSITY' as const,
    authority: 'WBENC National Council',
    effectiveDate: '2026-01-01',
    expiryDate: '2027-01-01',
    ocrConfidence: 99.4
  }
];

interface BulkCertItem {
  id: string;
  fileName: string;
  fileSize: string;
  category: 'PROFESSIONAL' | 'DIVERSITY';
  typeKey: string;
  authority: string;
  effectiveDate: string;
  expiryDate: string;
  ocrConfidence: number;
}

export const GepCertificatesGrid: React.FC<GepCertificatesGridProps> = ({
  certificates,
  onChange,
  readOnly = false,
  openAddTrigger
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<GepCertificateItem | null>(null);
  const [uploadMode, setUploadMode] = useState<'SINGLE' | 'BULK'>('SINGLE');

  // Form State in Modal
  const [formCategory, setFormCategory] = useState<'PROFESSIONAL' | 'DIVERSITY'>('PROFESSIONAL');
  const [formTypeKey, setFormTypeKey] = useState('COI_GENERAL');
  const [formAuthority, setFormAuthority] = useState('');
  const [formEffectiveDate, setFormEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formFileName, setFormFileName] = useState<string | null>(null);
  const [formFileSize, setFormFileSize] = useState<string | null>(null);
  const [formOcrConfidence, setFormOcrConfidence] = useState<number | null>(null);
  const [isReplaced, setIsReplaced] = useState(false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk Upload State
  const [bulkQueue, setBulkQueue] = useState<BulkCertItem[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState<ComplianceDoc | null>(null);
  const [formPreviewBlobUrl, setFormPreviewBlobUrl] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = (mode: 'SINGLE' | 'BULK' = 'SINGLE') => {
    setEditingCert(null);
    setUploadMode(mode);
    setFormCategory('PROFESSIONAL');
    setFormTypeKey('COI_GENERAL');
    setFormAuthority('');
    setFormEffectiveDate(new Date().toISOString().split('T')[0]);
    
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormExpiryDate(nextYear.toISOString().split('T')[0]);
    setFormFileName(null);
    setFormFileSize(null);
    setFormOcrConfidence(null);
    setIsReplaced(false);
    setIsOcrScanning(false);
    setFormPreviewBlobUrl(undefined);
    setBulkQueue([]);
    setFormError(null);
    setModalOpen(true);
  };

  // Only respond to new click triggers
  const prevTriggerRef = useRef(openAddTrigger);
  useEffect(() => {
    if (openAddTrigger && openAddTrigger > 0 && openAddTrigger !== prevTriggerRef.current) {
      handleOpenAdd('SINGLE');
    }
    prevTriggerRef.current = openAddTrigger;
  }, [openAddTrigger]);

  const handleOpenEdit = (cert: GepCertificateItem) => {
    setEditingCert(cert);
    setUploadMode('SINGLE');
    setFormCategory(cert.category);
    setFormTypeKey(cert.certType);
    setFormAuthority(cert.issuingAuthority);
    setFormEffectiveDate(cert.effectiveDate);
    setFormExpiryDate(cert.expiryDate);
    setFormFileName(cert.fileName || null);
    setFormFileSize(cert.fileSize || null);
    setFormOcrConfidence(cert.ocrConfidence || null);
    setIsReplaced(Boolean(cert.isReplaced));
    setIsOcrScanning(false);
    setFormPreviewBlobUrl(cert.previewUrl);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    onChange(certificates.filter(c => c.id !== id));
  };

  const handleClone = (cert: GepCertificateItem) => {
    const cloned: GepCertificateItem = {
      ...cert,
      id: `cert-${Date.now()}`,
      certTypeName: `${cert.certTypeName} (Copy)`,
      fileName: cert.fileName ? `Copy_${cert.fileName}` : undefined
    };
    onChange([...certificates, cloned]);
  };

  // Process uploaded certificate file
  const handleProcessSingleFile = (file: { name: string; size?: string; blobUrl?: string }) => {
    setIsOcrScanning(true);
    setFormError(null);

    setTimeout(() => {
      setIsOcrScanning(false);
      setFormFileName(file.name);
      setFormFileSize(file.size || '1.6 MB');
      setFormOcrConfidence(99.4);
      if (file.blobUrl) {
        setFormPreviewBlobUrl(file.blobUrl);
      }
      if (editingCert) {
        setIsReplaced(true);
      }
    }, 350);
  };

  const handleTriggerReplace = () => {
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  // Process Multi-File Bulk Upload
  const handleProcessBulkFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsBulkProcessing(true);

    const newItems: BulkCertItem[] = [];
    Array.from(files).forEach((file, idx) => {
      const match = SAMPLE_CERT_DOCUMENTS[idx % SAMPLE_CERT_DOCUMENTS.length];
      newItems.push({
        id: `bulk-cert-${Date.now()}-${idx}`,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        category: match.category,
        typeKey: match.typeKey,
        authority: match.authority,
        effectiveDate: match.effectiveDate,
        expiryDate: match.expiryDate,
        ocrConfidence: match.ocrConfidence
      });
    });

    setTimeout(() => {
      setBulkQueue(prev => [...prev, ...newItems]);
      setIsBulkProcessing(false);
    }, 500);
  };

  const handleCommitBulkUpload = () => {
    if (bulkQueue.length === 0) return;

    const newRecords: GepCertificateItem[] = bulkQueue.map(b => {
      const preset = CERT_TYPE_PRESETS[b.typeKey];
      return {
        id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        category: b.category,
        certType: b.typeKey,
        certTypeName: preset?.label || b.typeKey,
        issuingAuthority: b.authority,
        effectiveDate: b.effectiveDate,
        expiryDate: b.expiryDate,
        status: new Date(b.expiryDate) < new Date() ? 'EXPIRED' : 'ACTIVE',
        fileName: b.fileName,
        fileSize: b.fileSize,
        ocrConfidence: b.ocrConfidence,
        isReplaced: false
      };
    });

    onChange([...certificates, ...newRecords]);
    setModalOpen(false);
  };

  const handlePreviewDocument = (cert: { 
    fileName?: string; 
    certType?: string; 
    certTypeName?: string; 
    issuingAuthority?: string;
    effectiveDate?: string;
    expiryDate?: string;
    previewUrl?: string;
  }) => {
    const fn = cert.fileName || 'Compliance_Certificate.pdf';
    const certTypeKey = cert.certType || formTypeKey || '';
    const preset = CERT_TYPE_PRESETS[certTypeKey];
    const typeLabel = cert.certTypeName || preset?.label || 'Compliance Certificate';
    setPreviewDoc({
      id: `doc-cert-${Date.now()}`,
      title: `${typeLabel} (${cert.issuingAuthority || formAuthority || 'Certified'})`,
      type: certTypeKey || typeLabel,
      issuedDate: cert.effectiveDate || formEffectiveDate || '2026-01-01',
      expiryDate: cert.expiryDate || formExpiryDate || '2026-12-31',
      daysRemaining: 180,
      status: 'ACTIVE',
      fileSize: '1.6 MB',
      verifiedBy: cert.issuingAuthority || formAuthority || 'Issuing Registrar Digital Signature Verification',
      documentCategory: 'CERTIFICATES',
      previewUrl: cert.previewUrl || formPreviewBlobUrl
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthority.trim() || !formExpiryDate) {
      setFormError('Issuing Authority and Expiration Date are mandatory.');
      return;
    }

    const preset = CERT_TYPE_PRESETS[formTypeKey];
    const typeLabel = preset ? preset.label : 'Custom Compliance Certificate';

    const isExpired = new Date(formExpiryDate) < new Date();
    const expiryTimestamp = new Date(formExpiryDate).getTime();
    const nowTimestamp = new Date().getTime();
    const daysUntil = Math.floor((expiryTimestamp - nowTimestamp) / (1000 * 60 * 60 * 24));
    const certStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' = 
      isExpired ? 'EXPIRED' : daysUntil <= 30 ? 'EXPIRING_SOON' : 'ACTIVE';

    if (editingCert) {
      onChange(certificates.map(c => {
        if (c.id === editingCert.id) {
          return {
            ...c,
            category: formCategory,
            certType: formTypeKey,
            certTypeName: typeLabel,
            issuingAuthority: formAuthority.trim(),
            effectiveDate: formEffectiveDate,
            expiryDate: formExpiryDate,
            status: certStatus,
            fileName: formFileName || c.fileName || undefined,
            fileSize: formFileName ? (formFileSize || '1.6 MB') : c.fileSize,
            ocrConfidence: formFileName ? (formOcrConfidence || 99.4) : c.ocrConfidence,
            isReplaced: isReplaced || c.isReplaced,
            previewUrl: formPreviewBlobUrl || c.previewUrl
          };
        }
        return c;
      }));
    } else {
      const newCert: GepCertificateItem = {
        id: `cert-${Date.now()}`,
        category: formCategory,
        certType: formTypeKey,
        certTypeName: typeLabel,
        issuingAuthority: formAuthority.trim(),
        effectiveDate: formEffectiveDate,
        expiryDate: formExpiryDate,
        status: certStatus,
        fileName: formFileName || undefined,
        fileSize: formFileName ? (formFileSize || '1.6 MB') : undefined,
        ocrConfidence: formFileName ? (formOcrConfidence || 99.4) : undefined,
        isReplaced: false,
        previewUrl: formPreviewBlobUrl
      };
      onChange([...certificates, newCert]);
    }

    setModalOpen(false);
  };

  const expiringCount = certificates.filter(c => c.status === 'EXPIRING_SOON').length;

  return (
    <div className="space-y-4">
      {/* Dynamic Expiration Alert */}
      {expiringCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Notice: {expiringCount} certificate has an upcoming renewal window within 30 days. Upload an updated policy or endorsement rider to avoid payment holds.</span>
        </div>
      )}

      {/* Certificates Data Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Certificate Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Issuing Authority</th>
                <th className="py-2.5 px-3">Effective Date (MM-DD-YYYY)</th>
                <th className="py-2.5 px-3">Expiration Date (MM-DD-YYYY)</th>
                <th className="py-2.5 px-3">Attached Document</th>
                <th className="py-2.5 px-3">Status</th>
                {!readOnly && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/70 transition group">
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-900 text-xs block">
                      {cert.certTypeName}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200/80">
                      {cert.category === 'DIVERSITY' ? 'Diversity & Inclusion' : 'Professional Certification'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-700 font-normal">
                    {cert.issuingAuthority}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-600 font-normal">
                    {formatDateMMDDYYYY(cert.effectiveDate)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-700 font-normal">
                    {formatDateMMDDYYYY(cert.expiryDate)}
                  </td>
                  <td className="py-2.5 px-3">
                    {cert.fileName ? (
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handlePreviewDocument(cert)}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition cursor-pointer group max-w-[190px]"
                          title="Click to preview attached certificate"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                          <span className="truncate group-hover:underline text-[11px] font-mono text-slate-700 group-hover:text-emerald-800">{cert.fileName}</span>
                          <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>
                        {cert.isReplaced && (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-medium">
                            Resubmitted
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Not attached</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] text-slate-600 font-normal">
                      {cert.status === 'ACTIVE' ? 'Verified' : 'Expiring Soon'}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleClone(cert)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Clone Certificate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cert)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Edit Certificate & Replace Policy Renewal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cert.id)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Certificate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {certificates.length === 0 && (
                <tr>
                  <td colSpan={readOnly ? 7 : 8} className="py-8 text-center text-slate-400">
                    <p className="text-xs">No certificates or accreditations recorded yet. Click &quot;+ Add Certificate&quot; above to upload.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit / Bulk Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-tight">
                  {editingCert ? 'Edit Certificate & Replace Renewal' : uploadMode === 'SINGLE' ? 'Add Compliance Certificate' : 'Bulk Certificate Upload'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs (Only shown when adding new) */}
            {!editingCert && (
              <div className="px-5 pt-3 pb-0 bg-slate-50 border-b border-slate-200 flex space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setUploadMode('SINGLE')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                    uploadMode === 'SINGLE'
                      ? 'border-slate-900 text-slate-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Single Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('BULK')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
                    uploadMode === 'BULK'
                      ? 'border-slate-900 text-slate-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Bulk Upload (Multi-Certificate OCR)</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. SINGLE CERTIFICATE MODE */}
              {uploadMode === 'SINGLE' && (
                <form onSubmit={handleSave} id="cert-single-form" className="space-y-4">
                  {/* ATTACHMENT & OCR SCANNING ZONE FOR CERTIFICATES */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        <span>Attached Digital Policy / Certificate PDF</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">PDF, PNG, JPG (max 25MB)</span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                          handleProcessSingleFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                        }
                      }}
                    />
                    <input
                      ref={replaceFileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                          handleProcessSingleFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                        }
                      }}
                    />

                    {isOcrScanning && (
                      <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center space-x-2.5 text-xs text-slate-700 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                        <span>Scanning certificate credential, authority & expiry date with OCR...</span>
                      </div>
                    )}

                    {!isOcrScanning && formFileName && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                              <FileText className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {formFileName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                                <span>{formFileSize || '1.6 MB'}</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  OCR Match {formOcrConfidence || 99.4}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {isReplaced && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-medium shrink-0">
                              Renewal Resubmitted
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handlePreviewDocument({ 
                              fileName: formFileName || undefined, 
                              certType: formTypeKey, 
                              certTypeName: CERT_TYPE_PRESETS[formTypeKey]?.label, 
                              issuingAuthority: formAuthority,
                              effectiveDate: formEffectiveDate,
                              expiryDate: formExpiryDate,
                              previewUrl: formPreviewBlobUrl
                            })}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Preview Certificate</span>
                          </button>

                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={handleTriggerReplace}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                              title="Upload an updated renewal policy slip"
                            >
                              <RefreshCw className="w-3 h-3 text-slate-500" />
                              <span>Replace / Resubmit Renewal</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormFileName(null);
                                setFormOcrConfidence(null);
                              }}
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Remove Attachment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isOcrScanning && !formFileName && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                            handleProcessSingleFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                          }
                        }}
                        className="p-5 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition text-center cursor-pointer group"
                      >
                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-slate-700 mx-auto mb-1.5 transition-transform group-hover:scale-105" />
                        <p className="text-xs font-bold text-slate-800">
                          Click to browse or drop certificate / COI policy PDF
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Intelligent OCR will automatically detect Certificate Type, Registrar, and Expiration Dates.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Category Radio Toggle */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormCategory('PROFESSIONAL');
                          setFormTypeKey('COI_GENERAL');
                          setFormAuthority(CERT_TYPE_PRESETS.COI_GENERAL.authority);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          formCategory === 'PROFESSIONAL'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Professional Certification
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormCategory('DIVERSITY');
                          setFormTypeKey('MBE');
                          setFormAuthority(CERT_TYPE_PRESETS.MBE.authority);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          formCategory === 'DIVERSITY'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Diversity & Inclusion
                      </button>
                    </div>
                  </div>

                  {/* Certificate Type Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Certificate Type <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={Object.entries(CERT_TYPE_PRESETS)
                        .filter(([_, cfg]) => cfg.category === formCategory)
                        .map(([k, cfg]) => ({
                          value: k,
                          label: cfg.label,
                          sublabel: `Authority: ${cfg.authority}`
                        }))}
                      value={formTypeKey}
                      onChange={(key) => {
                        setFormTypeKey(key);
                        const preset = CERT_TYPE_PRESETS[key];
                        if (preset) {
                          setFormAuthority(preset.authority);
                        }
                      }}
                      placeholder="Select Certificate Type..."
                      searchPlaceholder="Search compliance or diversity certifications..."
                    />
                  </div>

                  {/* Issuing Authority */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Issuing Authority / Registrar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formAuthority}
                      onChange={(e) => setFormAuthority(e.target.value)}
                      placeholder="e.g. Travelers Commercial Casualty"
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Effective and Expiry Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Effective Date</span>
                        <span className="text-[10px] text-slate-400 font-mono">MM-DD-YYYY</span>
                      </label>
                      <input
                        type="date"
                        value={formEffectiveDate}
                        onChange={(e) => setFormEffectiveDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Expiration Date <span className="text-rose-500">*</span></span>
                        <span className="text-[10px] text-slate-400 font-mono">MM-DD-YYYY</span>
                      </label>
                      <input
                        type="date"
                        value={formExpiryDate}
                        onChange={(e) => setFormExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* 2. BULK CERTIFICATE UPLOAD MODE */}
              {uploadMode === 'BULK' && (
                <div className="space-y-4">
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => handleProcessBulkFiles(e.target.files)}
                  />

                  <div
                    onClick={() => bulkFileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleProcessBulkFiles(e.dataTransfer.files);
                    }}
                    className="p-6 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition text-center cursor-pointer group"
                  >
                    <UploadCloud className="w-9 h-9 text-slate-400 group-hover:text-slate-800 mx-auto mb-2 transition-transform group-hover:scale-105" />
                    <p className="text-sm font-bold text-slate-800">
                      Drop multiple certificates here, or <span className="underline text-slate-900 font-bold">browse files</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Batch upload insurance policies, ISO audits, SOC 2 reports, and diversity credentials.
                    </p>
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-slate-300">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <span>Select Certificates</span>
                    </div>
                  </div>

                  {isBulkProcessing && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center space-x-2 text-xs text-slate-600 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing certificate documents with OCR pipeline...</span>
                    </div>
                  )}

                  {bulkQueue.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Extracted Certificates ({bulkQueue.length})</span>
                        <span className="text-[10px] text-slate-400">Review before committing</span>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {bulkQueue.map((item, qIdx) => (
                          <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="font-bold text-slate-900 truncate">{item.fileName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({item.fileSize})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setBulkQueue(prev => prev.filter(q => q.id !== item.id))}
                                className="text-slate-400 hover:text-rose-600 p-0.5 transition cursor-pointer"
                                title="Remove from Queue"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Certificate Type</label>
                                <input
                                  type="text"
                                  value={CERT_TYPE_PRESETS[item.typeKey]?.label || item.typeKey}
                                  readOnly
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 truncate"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                                <input
                                  type="text"
                                  value={item.category === 'DIVERSITY' ? 'Diversity & Inclusion' : 'Professional Certification'}
                                  readOnly
                                  className="w-full px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 truncate font-medium"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Issuing Authority</label>
                                <input
                                  type="text"
                                  value={item.authority}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkQueue(prev => prev.map((q, idx) => idx === qIdx ? { ...q, authority: val } : q));
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Expiration Date</label>
                                <input
                                  type="date"
                                  value={item.expiryDate}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkQueue(prev => prev.map((q, idx) => idx === qIdx ? { ...q, expiryDate: val } : q));
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end space-x-2 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              {uploadMode === 'SINGLE' ? (
                <button
                  type="submit"
                  form="cert-single-form"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingCert ? 'Update Certificate' : 'Save Certificate'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={bulkQueue.length === 0}
                  onClick={handleCommitBulkUpload}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Import All ({bulkQueue.length}) Certificates
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* High-Fidelity Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
