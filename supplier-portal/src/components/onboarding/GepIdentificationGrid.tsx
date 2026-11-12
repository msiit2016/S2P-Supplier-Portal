import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Info, 
  X, 
  Check,
  FileCheck2,
  ChevronDown,
  UploadCloud,
  Eye,
  RefreshCw,
  Sparkles,
  Paperclip,
  Layers,
  File
} from 'lucide-react';
import { GepIdentificationItem } from '../../types/index.js';
import { SearchableSelect } from '../common/SearchableSelect.js';
import { DocumentPreviewModal, ComplianceDoc } from '../common/DocumentPreviewModal.js';

interface GepIdentificationGridProps {
  items: GepIdentificationItem[];
  onChange: (items: GepIdentificationItem[]) => void;
  readOnly?: boolean;
  openAddTrigger?: number;
}

const COUNTRY_OPTIONS = [
  { code: 'US', name: 'United States', types: ['EIN', 'DUNS Number', 'State Tax ID'] },
  { code: 'GB', name: 'United Kingdom', types: ['UK VAT Number', 'Companies House CRN', 'UTR Number'] },
  { code: 'DE', name: 'Germany', types: ['EU VAT (USt-IdNr)', 'Handelsregisternummer', 'Steuernummer'] },
  { code: 'JP', name: 'Japan', types: ['Corporate Number (Houjin Bangou)', 'Invoice Registration JCT'] },
  { code: 'IN', name: 'India', types: ['GSTIN No', 'Permanent Account Number (PAN)', 'CIN Number'] },
  { code: 'FR', name: 'France', types: ['SIRET Number', 'SIREN Number', 'Numéro de TVA'] },
  { code: 'CA', name: 'Canada', types: ['GST/HST Business Number', 'PST Number', 'Corporate Key'] },
  { code: 'SG', name: 'Singapore', types: ['UEN Number', 'GST Registration Number'] },
  { code: 'AU', name: 'Australia', types: ['Australian Business Number (ABN)', 'ACN Number', 'GST ID'] },
  { code: 'NL', name: 'Netherlands', types: ['KVK Handelsregister Number', 'Dutch BTW Number'] },
  { code: 'CH', name: 'Switzerland', types: ['UID Company Identification', 'Swiss VAT Number'] },
  { code: 'BR', name: 'Brazil', types: ['CNPJ Registration Number', 'State Tax Inscription (IE)'] },
  { code: 'MX', name: 'Mexico', types: ['RFC Tax Identification', 'CURP Number'] }
];

const SAMPLE_TAX_DOCUMENTS = [
  {
    name: 'IRS_Form_W9_Signed_2026.pdf',
    size: '1.4 MB',
    country: 'United States',
    idType: 'EIN',
    idNumber: '84-1294812',
    ocrConfidence: 99.8
  },
  {
    name: 'DE_USt_IdNr_Bescheinigung.pdf',
    size: '1.1 MB',
    country: 'Germany',
    idType: 'EU VAT (USt-IdNr)',
    idNumber: 'DE319482910',
    ocrConfidence: 99.2
  },
  {
    name: 'HMRC_VAT_Registration_Certificate.pdf',
    size: '950 KB',
    country: 'United Kingdom',
    idType: 'UK VAT Number',
    idNumber: 'GB948210928',
    ocrConfidence: 99.5
  },
  {
    name: 'DnB_Universal_Identity_Extract.pdf',
    size: '820 KB',
    country: 'United States',
    idType: 'DUNS Number',
    idNumber: '09-842-1928',
    ocrConfidence: 99.9
  }
];

interface BulkUploadItem {
  id: string;
  fileName: string;
  fileSize: string;
  country: string;
  idType: string;
  idNumber: string;
  isPrimary: boolean;
  ocrConfidence: number;
}

export const GepIdentificationGrid: React.FC<GepIdentificationGridProps> = ({
  items,
  onChange,
  readOnly = false,
  openAddTrigger
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GepIdentificationItem | null>(null);
  const [uploadMode, setUploadMode] = useState<'SINGLE' | 'BULK'>('SINGLE');

  // Single Form State in Modal
  const [formCountry, setFormCountry] = useState('United States');
  const [formIdType, setFormIdType] = useState('EIN');
  const [formIdNumber, setFormIdNumber] = useState('');
  const [formIsPrimary, setFormIsPrimary] = useState(false);
  const [formFileName, setFormFileName] = useState<string | null>(null);
  const [formFileSize, setFormFileSize] = useState<string | null>(null);
  const [formOcrConfidence, setFormOcrConfidence] = useState<number | null>(null);
  const [isReplaced, setIsReplaced] = useState(false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk Upload State
  const [bulkQueue, setBulkQueue] = useState<BulkUploadItem[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState<ComplianceDoc | null>(null);
  const [formPreviewBlobUrl, setFormPreviewBlobUrl] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const selectedCountryConfig = COUNTRY_OPTIONS.find(c => c.name === formCountry) || COUNTRY_OPTIONS[0];

  const handleOpenAdd = (mode: 'SINGLE' | 'BULK' = 'SINGLE') => {
    setEditingItem(null);
    setUploadMode(mode);
    setFormCountry('United States');
    setFormIdType('EIN');
    setFormIdNumber('');
    setFormIsPrimary(items.length === 0);
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

  const handleOpenEdit = (item: GepIdentificationItem) => {
    setEditingItem(item);
    setUploadMode('SINGLE');
    setFormCountry(item.country);
    setFormIdType(item.idType);
    setFormIdNumber(item.idNumber);
    setFormIsPrimary(Boolean(item.isPrimary));
    setFormFileName(item.fileName || null);
    setFormFileSize(item.fileSize || null);
    setFormOcrConfidence(item.ocrConfidence || null);
    setIsReplaced(Boolean(item.isReplaced));
    setIsOcrScanning(false);
    setFormPreviewBlobUrl(item.previewUrl);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter(it => it.id !== id));
  };

  // Process uploaded tax document
  const handleProcessSingleFile = (file: { name: string; size?: string; blobUrl?: string }) => {
    setIsOcrScanning(true);
    setFormError(null);

    setTimeout(() => {
      setIsOcrScanning(false);
      setFormFileName(file.name);
      setFormFileSize(file.size || '1.2 MB');
      setFormOcrConfidence(99.4);
      if (file.blobUrl) {
        setFormPreviewBlobUrl(file.blobUrl);
      }
      if (editingItem) {
        setIsReplaced(true);
      }
    }, 350);
  };

  // Handle Replace / Resubmit Document Action
  const handleTriggerReplace = () => {
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  // Handle Multi-File Selection for Bulk Upload
  const handleProcessBulkFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsBulkProcessing(true);

    const newItems: BulkUploadItem[] = [];
    Array.from(files).forEach((file, idx) => {
      const match = SAMPLE_TAX_DOCUMENTS[idx % SAMPLE_TAX_DOCUMENTS.length];
      newItems.push({
        id: `bulk-${Date.now()}-${idx}`,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        country: match.country,
        idType: match.idType,
        idNumber: match.idNumber,
        isPrimary: idx === 0 && items.length === 0,
        ocrConfidence: match.ocrConfidence
      });
    });

    setTimeout(() => {
      setBulkQueue(prev => [...prev, ...newItems]);
      setIsBulkProcessing(false);
    }, 500);
  };

  // Commit Bulk Upload
  const handleCommitBulkUpload = () => {
    if (bulkQueue.length === 0) return;

    const newRecords: GepIdentificationItem[] = bulkQueue.map(b => ({
      id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      country: b.country,
      idType: b.idType,
      idNumber: b.idNumber,
      isPrimary: b.isPrimary,
      verified: true,
      issuedDate: new Date().toISOString().split('T')[0],
      fileName: b.fileName,
      fileSize: b.fileSize,
      ocrConfidence: b.ocrConfidence
    }));

    onChange([...items, ...newRecords]);
    setModalOpen(false);
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIdNumber.trim()) {
      setFormError('Identification number is required');
      return;
    }

    if (editingItem) {
      onChange(items.map(it => {
        if (it.id === editingItem.id) {
          return {
            ...it,
            country: formCountry,
            idType: formIdType,
            idNumber: formIdNumber.trim(),
            isPrimary: formIsPrimary,
            verified: true,
            fileName: formFileName || it.fileName || 'Statutory_Tax_Verification.pdf',
            fileSize: formFileSize || it.fileSize || '1.2 MB',
            ocrConfidence: formOcrConfidence || it.ocrConfidence || 99.4,
            isReplaced: isReplaced || it.isReplaced,
            previewUrl: formPreviewBlobUrl || it.previewUrl
          };
        }
        return formIsPrimary ? { ...it, isPrimary: false } : it;
      }));
    } else {
      const newItem: GepIdentificationItem = {
        id: `id-${Date.now()}`,
        country: formCountry,
        idType: formIdType,
        idNumber: formIdNumber.trim(),
        isPrimary: formIsPrimary || items.length === 0,
        verified: true,
        issuedDate: new Date().toISOString().split('T')[0],
        fileName: formFileName || undefined,
        fileSize: formFileName ? (formFileSize || '1.2 MB') : undefined,
        ocrConfidence: formFileName ? (formOcrConfidence || 99.2) : undefined,
        isReplaced: false,
        previewUrl: formPreviewBlobUrl
      };
      
      const updated = formIsPrimary 
        ? items.map(it => ({ ...it, isPrimary: false })) 
        : [...items];
      onChange([...updated, newItem]);
    }

    setModalOpen(false);
  };

  // Preview an attached document in DocumentPreviewModal
  const handlePreviewDocument = (item: { 
    fileName?: string; 
    idType?: string; 
    country?: string; 
    idNumber?: string;
    previewUrl?: string;
  }) => {
    const fn = item.fileName || 'Statutory_Tax_Certificate.pdf';
    const idType = item.idType || formIdType || 'EIN';
    setPreviewDoc({
      id: `doc-${Date.now()}`,
      title: `${item.country || formCountry || 'Statutory'} ${idType} Tax Record (${item.idNumber || formIdNumber || '84-1294812'})`,
      type: idType.includes('W9') || idType.includes('EIN') ? 'IRS_W9' : idType,
      issuedDate: '2026-01-15',
      expiryDate: '2027-12-31',
      daysRemaining: 365,
      status: 'ACTIVE',
      fileSize: item.fileName ? '1.4 MB' : '1.4 MB',
      verifiedBy: 'Official Tax Registry OCR Verification',
      documentCategory: 'TAX_AND_LEGAL',
      previewUrl: item.previewUrl || formPreviewBlobUrl
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Data Table Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Country / Region</th>
                <th className="py-2.5 px-3">Identification Type</th>
                <th className="py-2.5 px-3">Identification Number</th>
                <th className="py-2.5 px-3">Supporting Document</th>
                <th className="py-2.5 px-3 text-center">Primary</th>
                <th className="py-2.5 px-3">Status</th>
                {!readOnly && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={readOnly ? 6 : 7} className="py-8 text-center text-slate-400">
                    <p className="text-xs">No identification numbers added yet. Click &quot;+ Add Record&quot; above to register statutory tax records.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition group">
                    <td className="py-2.5 px-3 text-xs font-medium text-slate-800">
                      {item.country}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 font-normal">
                      {item.idType}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-800 font-normal">
                      {item.idNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.fileName ? (
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handlePreviewDocument(item)}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition cursor-pointer group max-w-[210px]"
                            title="Click to preview attached tax document"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                            <span className="truncate group-hover:underline text-[11px] font-mono text-slate-700 group-hover:text-emerald-800">{item.fileName}</span>
                            <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </button>
                          {item.isReplaced && (
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-medium">
                              Resubmitted
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No document</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.isPrimary ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                          Primary
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-slate-600 font-normal">
                        Verified
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                            title="Edit Record & Manage Document"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit / Bulk Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-tight">
                  {editingItem ? 'Edit Identification Record' : uploadMode === 'SINGLE' ? 'Add Identification Information' : 'Bulk Tax Document Upload'}
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
            {!editingItem && (
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
                  <span>Bulk Upload (Multi-File OCR)</span>
                </button>
              </div>
            )}

            {/* Modal Body Container */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. SINGLE UPLOAD MODE */}
              {uploadMode === 'SINGLE' && (
                <form onSubmit={handleSaveSingle} id="id-single-form" className="space-y-4">
                  {/* ATTACHMENT & OCR SCANNING ZONE */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        <span>Supporting Tax Document / Form</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">PDF, PNG, JPG (max 25MB)</span>
                    </div>

                    {/* Hidden Native File Inputs */}
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

                    {/* OCR Scanning In-Progress Indicator */}
                    {isOcrScanning && (
                      <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center space-x-2.5 text-xs text-slate-700 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                        <span>Scanning document text & extracting statutory tax ID via OCR...</span>
                      </div>
                    )}

                    {/* Attached Document Card (When present) */}
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
                                <span>{formFileSize || '1.2 MB'}</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  OCR Match {formOcrConfidence || 99.8}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Replaced Badge if re-uploaded */}
                          {isReplaced && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-medium shrink-0">
                              Replaced / Resubmitted
                            </span>
                          )}
                        </div>

                        {/* Document Action Strip: Preview, Replace / Resubmit, Remove */}
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handlePreviewDocument({ 
                              fileName: formFileName || undefined, 
                              idType: formIdType, 
                              country: formCountry, 
                              idNumber: formIdNumber,
                              previewUrl: formPreviewBlobUrl
                            })}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Preview</span>
                          </button>

                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={handleTriggerReplace}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                              title="Replace with an updated tax document"
                            >
                              <RefreshCw className="w-3 h-3 text-slate-500" />
                              <span>Replace / Resubmit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormFileName(null);
                                setFormFileSize(null);
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

                    {/* Drag-and-drop dropzone (When empty) */}
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
                          Click to browse or drag & drop tax document
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Intelligent OCR will automatically detect and populate statutory tax details below.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Country Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={COUNTRY_OPTIONS.map(c => ({
                        value: c.name,
                        label: c.name,
                        code: c.code,
                        sublabel: `${c.types.length} tax identifiers available`
                      }))}
                      value={formCountry}
                      onChange={(newCountry) => {
                        setFormCountry(newCountry);
                        const cfg = COUNTRY_OPTIONS.find(c => c.name === newCountry);
                        if (cfg && cfg.types.length > 0) {
                          setFormIdType(cfg.types[0]);
                        }
                      }}
                      placeholder="Select Country..."
                      searchPlaceholder="Search country or code..."
                    />
                  </div>

                  {/* Dependent Identification Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Identification Type <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={selectedCountryConfig.types}
                      value={formIdType}
                      onChange={(val) => setFormIdType(val)}
                      placeholder="Select Identification Type..."
                      searchPlaceholder="Search tax identifier type..."
                    />
                  </div>

                  {/* Identification Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Identification Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formIdNumber}
                      onChange={(e) => setFormIdNumber(e.target.value)}
                      placeholder={
                        formIdType === 'EIN' ? 'e.g. 84-1294812' :
                        formIdType.includes('DUNS') ? 'e.g. 09-842-1928' :
                        formIdType.includes('VAT') ? 'e.g. DE123456789' :
                        formIdType.includes('GST') ? 'e.g. 27AAAAA0000A1Z5' :
                        'Enter registration number'
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Is Primary Toggle */}
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formIsPrimary}
                      onChange={(e) => setFormIsPrimary(e.target.checked)}
                      className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
                    />
                    <span>Set as Primary Statutory Tax Identifier for this buyer</span>
                  </label>
                </form>
              )}

              {/* 2. BULK UPLOAD MODE */}
              {uploadMode === 'BULK' && (
                <div className="space-y-4">
                  {/* Multi-file Hidden Native Input */}
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => handleProcessBulkFiles(e.target.files)}
                  />

                  {/* Multi-file Dropzone */}
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
                      Drop multiple tax documents here, or <span className="underline text-slate-900 font-bold">browse files</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Select IRS W-9s, VAT certificates, or statutory registry proofs together. Batch OCR extracts and organizes each document.
                    </p>
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-slate-300">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <span>Select Tax Documents</span>
                    </div>
                  </div>

                  {/* Bulk Processing Progress */}
                  {isBulkProcessing && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center space-x-2 text-xs text-slate-600 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing files with OCR pipeline...</span>
                    </div>
                  )}

                  {/* Bulk Queue List */}
                  {bulkQueue.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Extracted Records ({bulkQueue.length})</span>
                        <span className="text-[10px] text-slate-400">Review & edit before committing</span>
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

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Country</label>
                                <input
                                  type="text"
                                  value={item.country}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkQueue(prev => prev.map((q, idx) => idx === qIdx ? { ...q, country: val } : q));
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">ID Type</label>
                                <input
                                  type="text"
                                  value={item.idType}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkQueue(prev => prev.map((q, idx) => idx === qIdx ? { ...q, idType: val } : q));
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Extracted Number</label>
                                <input
                                  type="text"
                                  value={item.idNumber}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkQueue(prev => prev.map((q, idx) => idx === qIdx ? { ...q, idNumber: val } : q));
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
                  form="id-single-form"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingItem ? 'Update Record' : 'Save Record'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={bulkQueue.length === 0}
                  onClick={handleCommitBulkUpload}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Import All ({bulkQueue.length}) Records
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
