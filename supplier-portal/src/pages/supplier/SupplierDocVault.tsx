import React, { useState, useRef, useEffect } from 'react';
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
  X,
  FileText,
  ChevronRight,
  Pencil,
  Trash2,
  MessageSquare,
  LayoutGrid,
  List,
  Table as TableIcon,
  ArrowUpDown,
  RotateCw,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { DocumentPreviewModal, ComplianceDoc } from '../../components/common/DocumentPreviewModal.js';
import { SearchableSelect } from '../../components/common/SearchableSelect.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
import { downloadComplianceDocument, getCleanDocumentFilename } from '../../utils/documentPdfGenerator.js';
import { formatDateMMDDYYYY, calculateDocExpiryStatus } from '../../utils/dateUtils.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';

interface QueuedBulkDoc {
  id: string;
  file?: File;
  fileName: string;
  fileSize: string;
  title: string;
  type: string;
  documentCategory: string;
  issuedDate: string;
  expiryDate: string;
  isPermanent: boolean;
  previewUrl?: string;
}

export const SupplierDocVault: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = usePortal();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<ComplianceDoc | null>(null);

  // Interactive Renewal modal state
  const [renewingDoc, setRenewingDoc] = useState<ComplianceDoc | null>(null);
  const [renewalExpiryDate, setRenewalExpiryDate] = useState<string>('2027-11-02');
  const [renewalIssueDate, setRenewalIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [renewalFile, setRenewalFile] = useState<File | null>(null);
  const [isRenewingSubmitting, setIsRenewingSubmitting] = useState(false);
  const renewalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<'EXPIRY_URGENT' | 'NAME_ASC' | 'DATE_RECENT'>('EXPIRY_URGENT');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  
  // Single upload form fields
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('CERT_INSURANCE_ACORD');
  const [docCategory, setDocCategory] = useState('Insurance & Liability');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [isPermanent, setIsPermanent] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Bulk upload state
  const [bulkDocs, setBulkDocs] = useState<QueuedBulkDoc[]>([]);
  const [editingBulkDocId, setEditingBulkDocId] = useState<string | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingBulkItemId, setReplacingBulkItemId] = useState<string | null>(null);
  const replaceBulkItemRef = useRef<HTMLInputElement | null>(null);

  // Edit existing document modal state
  const [editingDoc, setEditingDoc] = useState<ComplianceDoc | null>(null);
  const [editReplacementFile, setEditReplacementFile] = useState<File | null>(null);
  const [editReplacementPreviewUrl, setEditReplacementPreviewUrl] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const [editForm, setEditForm] = useState<{
    title: string;
    type: string;
    category: string;
    issuedDate: string;
    expiryDate: string;
    isPermanent: boolean;
    status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  }>({
    title: '',
    type: 'GENERAL_DOCUMENT',
    category: 'General & Operations',
    issuedDate: '',
    expiryDate: '',
    isPermanent: false,
    status: 'ACTIVE'
  });

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<ComplianceDoc | null>(null);
  const [previewShowInquiries, setPreviewShowInquiries] = useState<boolean>(false);
  const [showExpiryBanner, setShowExpiryBanner] = useState(true);

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
      issuedDate: '2025-11-02',
      expiryDate: '2026-11-02',
      daysRemaining: -8,
      status: 'EXPIRED',
      fileSize: '1.2 MB',
      verifiedBy: 'AI Document Extractor'
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
    },
    {
      id: 'doc-005',
      title: 'State of Delaware Certificate of Incorporation',
      type: 'CERT_INCORPORATION',
      documentCategory: 'Legal & Corporate Identity',
      issuedDate: '2016-04-12',
      expiryDate: 'Permanent',
      daysRemaining: 9999,
      status: 'ACTIVE',
      fileSize: '780 KB',
      verifiedBy: 'Delaware Division of Corporations'
    },
    {
      id: 'doc-006',
      title: 'Deloitte SOC 2 Type II Attestation Report',
      type: 'SOC2_REPORT',
      documentCategory: 'Cybersecurity & Audits',
      issuedDate: '2026-01-10',
      expiryDate: '2026-12-31',
      daysRemaining: 66,
      status: 'ACTIVE',
      fileSize: '2.4 MB',
      verifiedBy: 'Deloitte & Touche LLP'
    }
  ]);

  // Dynamically compute status and days remaining for all documents in vault based on today's date
  const computedDocs: ComplianceDoc[] = complianceDocs.map(doc => {
    const statusResult = calculateDocExpiryStatus(doc.expiryDate);
    return {
      ...doc,
      status: statusResult.status,
      daysRemaining: statusResult.daysRemaining
    };
  });

  const totalCount = computedDocs.length;
  const activeCount = computedDocs.filter(d => d.status === 'ACTIVE').length;
  const expiringCount = computedDocs.filter(d => d.status === 'EXPIRING_SOON').length;
  const expiredCount = computedDocs.filter(d => d.status === 'EXPIRED').length;
  const expiredDocs = computedDocs.filter(d => d.status === 'EXPIRED');
  const expiringDocs = computedDocs.filter(d => d.status === 'EXPIRING_SOON');

  // Broadcast live Document Vault context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'documents',
      totalDocs: totalCount,
      searchQuery,
      filterStatus,
      activeCount,
      expiringCount,
      expiredCount,
      expiredDocs: expiredDocs.map(d => ({ id: d.id, title: d.title, expiryDate: d.expiryDate })),
      docs: computedDocs.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        category: d.documentCategory,
        expiryDate: d.expiryDate,
        daysRemaining: d.daysRemaining,
        status: d.status
      }))
    });
  }, [complianceDocs, searchQuery, filterStatus, totalCount, activeCount, expiringCount, expiredCount]);

  // Listen to actions dispatched by Ava Copilot
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'UPLOAD_DOC') {
        const p = action.payload;
        const targetExpiry = p.expiryDate || '2027-11-15';
        const statusRes = calculateDocExpiryStatus(targetExpiry);
        const newDoc: ComplianceDoc = {
          id: `doc-${Date.now()}`,
          title: p.title || 'New Compliance Document',
          type: p.type || 'CERT_INSURANCE_ACORD',
          documentCategory: p.category || 'Insurance & Liability',
          issuedDate: new Date().toISOString().split('T')[0],
          expiryDate: targetExpiry,
          daysRemaining: statusRes.daysRemaining,
          status: statusRes.status,
          fileSize: '1.2 MB',
          verifiedBy: 'AI Document Extractor'
        };
        setComplianceDocs(prev => [newDoc, ...prev]);
        setActionSuccess(`Ava uploaded and ${statusRes.status === 'EXPIRED' ? 'flagged as Expired' : 'verified'}: ${newDoc.title}`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'UPDATE_DOC') {
        const { id, title, expiryDate: newExpiry } = action.payload;
        setComplianceDocs(prev => prev.map(d => {
          if (d.id === id || d.title.toLowerCase().includes((id || '').toLowerCase())) {
            const exp = newExpiry || d.expiryDate;
            const statusRes = calculateDocExpiryStatus(exp);
            return {
              ...d,
              title: title || d.title,
              expiryDate: exp,
              daysRemaining: statusRes.daysRemaining,
              status: statusRes.status,
              verifiedBy: 'Ava Copilot Attested'
            };
          }
          return d;
        }));
        setActionSuccess('Ava updated document metadata');
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'DELETE_DOC') {
        const targetId = action.payload.id;
        setComplianceDocs(prev => prev.filter(d => d.id !== targetId && !d.title.toLowerCase().includes((targetId || '').toLowerCase())));
        setActionSuccess(`Ava removed document from Vault`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'SET_PAGE_FILTER') {
        if (action.payload.searchQuery !== undefined) setSearchQuery(action.payload.searchQuery);
        if (action.payload.filterStatus !== undefined) setFilterStatus(action.payload.filterStatus);
        setActionSuccess('Ava updated document filters');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });

    return cleanup;
  }, []);

  const inferDocMetadata = (name: string) => {
    const cleanName = name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const lower = name.toLowerCase();

    let type = 'GENERAL_DOCUMENT';
    let category = 'General & Operations';

    if (lower.includes('w9') || lower.includes('w-9') || lower.includes('tax')) {
      type = 'IRS_W9';
      category = 'Tax & Regulatory';
    } else if (lower.includes('acord') || lower.includes('insurance') || lower.includes('liability')) {
      type = 'CERT_INSURANCE_ACORD';
      category = 'Insurance & Liability';
    } else if (lower.includes('bank') || lower.includes('ach') || lower.includes('voided') || lower.includes('treasury')) {
      type = 'BANK_VERIFICATION_LETTER';
      category = 'Banking & Treasury';
    } else if (lower.includes('iso') || lower.includes('27001') || lower.includes('security')) {
      type = 'ISO_27001';
      category = 'Cybersecurity & Audits';
    } else if (lower.includes('soc') || lower.includes('soc2')) {
      type = 'SOC2_REPORT';
      category = 'Cybersecurity & Audits';
    } else if (lower.includes('incorporation') || lower.includes('delaware') || lower.includes('articles')) {
      type = 'CERT_INCORPORATION';
      category = 'Legal & Corporate Identity';
    } else if (lower.includes('nda') || lower.includes('agreement') || lower.includes('contract')) {
      type = 'LEGAL_CONTRACT';
      category = 'Legal & Governance';
    } else if (lower.includes('license') || lower.includes('permit')) {
      type = 'BUSINESS_LICENSE';
      category = 'Licenses & Permits';
    }

    return { formattedTitle, type, category };
  };

  const handleStartRenewDoc = (doc: ComplianceDoc) => {
    setRenewingDoc(doc);
    setRenewalIssueDate(new Date().toISOString().split('T')[0]);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const yyyy = nextYear.getFullYear();
    const mm = String(nextYear.getMonth() + 1).padStart(2, '0');
    const dd = String(nextYear.getDate()).padStart(2, '0');
    setRenewalExpiryDate(`${yyyy}-${mm}-${dd}`);
    setRenewalFile(null);
  };

  const handleRenewDoc = (docId: string) => {
    const doc = complianceDocs.find(d => d.id === docId);
    if (doc) {
      handleStartRenewDoc(doc);
    }
  };

  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingDoc) return;
    setIsRenewingSubmitting(true);

    setTimeout(() => {
      const statusRes = calculateDocExpiryStatus(renewalExpiryDate);
      const updatedDoc: ComplianceDoc = {
        ...renewingDoc,
        issuedDate: renewalIssueDate,
        expiryDate: renewalExpiryDate,
        daysRemaining: statusRes.daysRemaining,
        status: statusRes.status,
        fileSize: renewalFile ? formatFileSize(renewalFile.size) : renewingDoc.fileSize,
        verifiedBy: 'AI Document Extractor (Re-verified)'
      };

      setComplianceDocs(prev => prev.map(d => d.id === renewingDoc.id ? updatedDoc : d));
      setIsRenewingSubmitting(false);
      const title = renewingDoc.title;
      setRenewingDoc(null);
      setRenewalFile(null);
      setActionSuccess(`Certificate "${title}" successfully renewed and verified until ${formatDateMMDDYYYY(renewalExpiryDate)}.`);
      setTimeout(() => setActionSuccess(null), 4000);
    }, 500);
  };

  const handleConfirmDeleteDoc = () => {
    if (!docToDelete) return;
    const title = docToDelete.title;
    setComplianceDocs(prev => prev.filter(d => d.id !== docToDelete.id));
    setDocToDelete(null);
    setActionSuccess(`Certificate "${title}" successfully removed from Document Vault.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleDownloadDocument = (doc: ComplianceDoc) => {
    downloadComplianceDocument(doc);
    const fname = getCleanDocumentFilename(doc);
    setActionSuccess(`Downloaded official certificate: "${fname}"`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setDocTitle('');
    setDocType('CERT_INSURANCE_ACORD');
    setDocCategory('Insurance & Liability');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('2027-12-31');
    setIsPermanent(false);
    setSelectedFile(null);
    setFileName('');
    setFilePreviewUrl(null);
    setBulkDocs([]);
    setEditingBulkDocId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      const { formattedTitle, type, category } = inferDocMetadata(file.name);
      if (!docTitle.trim()) {
        setDocTitle(formattedTitle);
        setDocType(type);
        setDocCategory(category);
      }
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: QueuedBulkDoc[] = Array.from(files).map((file, idx) => {
      const { formattedTitle, type, category } = inferDocMetadata(file.name);
      let previewUrl: string | undefined = undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }
      return {
        id: `bulk-${Date.now()}-${idx}`,
        file,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        title: formattedTitle,
        type,
        documentCategory: category,
        issuedDate: new Date().toISOString().split('T')[0],
        expiryDate: '2027-12-31',
        isPermanent: type === 'CERT_INCORPORATION',
        previewUrl
      };
    });

    setBulkDocs(prev => [...prev, ...newItems]);
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = '';
    }
  };

  const updateBulkDoc = (id: string, updates: Partial<QueuedBulkDoc>) => {
    setBulkDocs(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleRemoveSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFileName('');
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Preview attached document copy before final upload action
  const handlePreviewAttachedDoc = () => {
    const finalExpiry = isPermanent ? 'Permanent' : (expiryDate || '2027-12-31');
    const statusRes = calculateDocExpiryStatus(finalExpiry);
    setPreviewDoc({
      id: 'pending-upload-preview',
      title: docTitle.trim() || fileName || 'Document Preview',
      type: docType,
      documentCategory: docCategory,
      issuedDate: issueDate || new Date().toISOString().split('T')[0],
      expiryDate: finalExpiry,
      daysRemaining: statusRes.daysRemaining,
      status: statusRes.status,
      fileSize: selectedFile ? formatFileSize(selectedFile.size) : '1.2 MB',
      verifiedBy: 'Pre-Upload Inspection',
      previewUrl: filePreviewUrl || undefined
    });
  };

  const handleUploadSingleDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const sizeStr = selectedFile ? formatFileSize(selectedFile.size) : (fileName ? '780 KB' : '650 KB');
    const finalExpiry = isPermanent ? 'Permanent' : (expiryDate || '2027-12-31');
    const statusRes = calculateDocExpiryStatus(finalExpiry);

    const newDoc: ComplianceDoc = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      title: docTitle.trim(),
      type: docType,
      documentCategory: docCategory,
      issuedDate: issueDate || new Date().toISOString().split('T')[0],
      expiryDate: finalExpiry,
      daysRemaining: statusRes.daysRemaining,
      status: statusRes.status,
      fileSize: sizeStr,
      previewUrl: filePreviewUrl || undefined,
      verifiedBy: 'AI Document Extractor'
    };

    setComplianceDocs(prev => [newDoc, ...prev]);
    handleCloseUploadModal();
    setActionSuccess(`"${newDoc.title}" uploaded and ${statusRes.status === 'EXPIRED' ? 'flagged as Expired' : 'verified'} successfully.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleCommitBulkUpload = () => {
    if (bulkDocs.length === 0) return;

    const newDocs: ComplianceDoc[] = bulkDocs.map((item, idx) => {
      const finalExpiry = item.isPermanent ? 'Permanent' : (item.expiryDate || '2027-12-31');
      const statusRes = calculateDocExpiryStatus(finalExpiry);
      return {
        id: `doc-${Date.now().toString().slice(-4)}-${idx}`,
        title: item.title.trim() || item.fileName,
        type: item.type,
        documentCategory: item.documentCategory,
        issuedDate: item.issuedDate,
        expiryDate: finalExpiry,
        daysRemaining: statusRes.daysRemaining,
        status: statusRes.status,
        fileSize: item.fileSize,
        previewUrl: item.previewUrl,
        verifiedBy: 'AI Document Extractor'
      };
    });

    setComplianceDocs(prev => [...newDocs, ...prev]);
    const count = newDocs.length;
    handleCloseUploadModal();
    setActionSuccess(`Successfully bulk uploaded ${count} document${count > 1 ? 's' : ''} to vault.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Edit existing document from vault grid
  const handleStartEditDoc = (doc: ComplianceDoc) => {
    setEditingDoc(doc);
    setEditReplacementFile(null);
    setEditReplacementPreviewUrl(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setEditForm({
      title: doc.title,
      type: doc.type,
      category: doc.documentCategory,
      issuedDate: doc.issuedDate,
      expiryDate: doc.expiryDate === 'Permanent' ? '2027-12-31' : doc.expiryDate,
      isPermanent: doc.expiryDate === 'Permanent',
      status: doc.status
    });
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditReplacementFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setEditReplacementPreviewUrl(url);
      } else {
        setEditReplacementPreviewUrl(null);
      }
    }
  };

  const handleRevertEditFile = () => {
    setEditReplacementFile(null);
    setEditReplacementPreviewUrl(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handlePreviewEditReplacementDoc = () => {
    if (!editingDoc) return;
    setPreviewDoc({
      id: `preview-repl-${editingDoc.id}`,
      title: editForm.title.trim() || editReplacementFile?.name || editingDoc.title,
      type: editForm.type,
      documentCategory: editForm.category,
      issuedDate: editForm.issuedDate,
      expiryDate: editForm.isPermanent ? 'Permanent' : editForm.expiryDate,
      daysRemaining: editForm.isPermanent ? 9999 : 365,
      status: editForm.status,
      fileSize: editReplacementFile ? formatFileSize(editReplacementFile.size) : editingDoc.fileSize,
      verifiedBy: 'Replacement File Inspection',
      previewUrl: editReplacementPreviewUrl || undefined
    });
  };

  const handleSaveDocEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    const sizeStr = editReplacementFile 
      ? formatFileSize(editReplacementFile.size) 
      : editingDoc.fileSize;

    const finalExpiry = editForm.isPermanent ? 'Permanent' : editForm.expiryDate;
    const statusRes = calculateDocExpiryStatus(finalExpiry);

    const updatedDoc: ComplianceDoc = {
      ...editingDoc,
      title: editForm.title.trim(),
      type: editForm.type,
      documentCategory: editForm.category,
      issuedDate: editForm.issuedDate,
      expiryDate: finalExpiry,
      daysRemaining: statusRes.daysRemaining,
      status: editForm.status || statusRes.status,
      fileSize: sizeStr,
      previewUrl: editReplacementPreviewUrl || editingDoc.previewUrl,
      verifiedBy: editReplacementFile ? 'Manual Re-upload & Verified' : editingDoc.verifiedBy
    };

    setComplianceDocs(prev => prev.map(d => d.id === editingDoc.id ? updatedDoc : d));
    setEditingDoc(null);
    setEditReplacementFile(null);
    setEditReplacementPreviewUrl(null);
    setActionSuccess(
      editReplacementFile
        ? `Document "${updatedDoc.title}" and its replacement PDF file were successfully updated.`
        : `Document "${updatedDoc.title}" updated successfully.`
    );
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filteredDocs = computedDocs
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.documentCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.verifiedBy.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterStatus === 'ACTIVE') return doc.status === 'ACTIVE';
      if (filterStatus === 'EXPIRING') return doc.status === 'EXPIRING_SOON';
      if (filterStatus === 'EXPIRED') return doc.status === 'EXPIRED';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'EXPIRY_URGENT') {
        return a.daysRemaining - b.daysRemaining;
      }
      if (sortBy === 'NAME_ASC') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'DATE_RECENT') {
        return new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-4 pb-16">
      {/* Top Banner (Minimal, Balanced, Clean) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Title, Badge & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <FolderLock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">Document Vault</h1>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Manage verified compliance certificates, tax forms, and corporate documents.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => {
              setUploadMode('BULK');
              setShowUploadModal(true);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Bulk Upload Multiple Files"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={() => {
              setUploadMode('SINGLE');
              setShowUploadModal(true);
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Upload Document"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
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
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Minimal 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* KPI 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vault Total</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {totalCount} <span className="text-xs font-normal text-slate-500 font-sans">Documents</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-emerald-700 font-medium truncate transition">
              Tax, legal &amp; certificates
            </span>
            <Sparkline data={[6, 8, 9, 11, 12, Math.max(13, totalCount)]} color="#10b981" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active &amp; Verified</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {activeCount} <span className="text-xs font-normal text-slate-500 font-sans">Compliant</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-teal-700 group-hover:text-teal-800 font-medium truncate transition">
              Cleared for all buyers
            </span>
            <Sparkline data={[85, 90, 92, 95, 98, 100]} color="#0d9488" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expiring Soon</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {expiringCount} <span className="text-xs font-normal text-slate-500 font-sans">Policies</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium truncate transition">
              {expiringCount > 0 ? 'Renewal required <30d' : 'No upcoming expirations'}
            </span>
            <Sparkline data={[3, 2, 2, 1, 1, Math.max(0, expiringCount)]} color="#d97706" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4 */}
        {expiredCount > 0 ? (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expired Policies</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              {expiredCount} <span className="text-xs font-normal text-amber-700 font-sans font-medium">Action Needed</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 group-hover:text-slate-700 font-medium truncate transition">
                1 policy pending renewal
              </span>
              <Sparkline data={[2, 2, 1, 1, 1, expiredCount]} color="#f59e0b" width={68} height={20} />
            </div>
          </div>
        ) : (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trust Score</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              98% <span className="text-xs font-normal text-slate-500 font-sans">Verified</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 group-hover:text-indigo-700 font-medium truncate transition">
                Enterprise audited ledger
              </span>
              <Sparkline data={[91, 93, 94, 96, 97, 98]} color="#6366f1" width={68} height={20} />
            </div>
          </div>
        )}
      </div>

      {/* Expiry Warning Callout (Modern dark slate notice bar - zero harsh neon reds) */}
      {showExpiryBanner && (expiredCount > 0 || expiringCount > 0) && filterStatus !== 'ACTIVE' && (
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in border border-slate-800">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-xs">Compliance Renewal Action</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {expiredCount > 0 ? `${expiredCount} Expired` : `${expiringCount} Expiring Soon`}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {expiredCount > 0 
                  ? `${expiredDocs[0]?.title || 'A compliance certificate'} expired on ${formatDateMMDDYYYY(expiredDocs[0]?.expiryDate)}. Upload a renewed policy to clear buyer holds.`
                  : `${expiringDocs[0]?.title || 'A certificate'} expires in ${expiringDocs[0]?.daysRemaining || 20} days. Upload updated documentation.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => {
                const target = expiredDocs[0] || expiringDocs[0] || computedDocs[0];
                if (target) handleStartRenewDoc(target);
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-700" />
              <span>Replace Policy</span>
            </button>
            <button
              onClick={() => setShowExpiryBanner(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table Filter & Search Toolbar (Directly precedes the Table/Grid) */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input with Instant Clear (X) */}
          <div className="relative flex-1 min-w-[200px] max-w-sm sm:max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents, IDs, categories, verifiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/70"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                filterStatus === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('EXPIRING')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                filterStatus === 'EXPIRING'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expiring ({expiringCount})
            </button>
            {expiredCount > 0 && (
              <button
                onClick={() => setFilterStatus('EXPIRED')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'EXPIRED'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Expired ({expiredCount})</span>
              </button>
            )}
          </div>

          {/* Interactive Sort Dropdown */}
          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <FilterSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              title="Sort documents"
            >
              <option value="EXPIRY_URGENT">Sort: Expiry (Urgent First)</option>
              <option value="NAME_ASC">Sort: Name (A-Z)</option>
              <option value="DATE_RECENT">Sort: Most Recent</option>
            </FilterSelect>
          </div>
        </div>

        {/* View Toggle (Consistent across RFPs, Onboarding, Tasks, and Vault) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewMode('LIST')}
            className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'LIST' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Dense List View"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">List</span>
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Grid Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Grid</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRID VIEW                                                                 */}
      {/* ========================================================================= */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const isExpired = doc.status === 'EXPIRED';
            const isWarning = doc.status === 'EXPIRING_SOON';
            return (
              <div
                key={doc.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start space-x-3 min-w-0 flex-1 pr-1">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isExpired
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20'
                          : isWarning 
                            ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/20' 
                            : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20'
                      }`}>
                        {isExpired ? <AlertTriangle className="w-4.5 h-4.5 text-amber-600" /> : isWarning ? <Clock className="w-4.5 h-4.5 text-amber-600" /> : <FileCheck className="w-4.5 h-4.5 text-emerald-600" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 
                          onClick={() => { setPreviewShowInquiries(false); setPreviewDoc(doc); }}
                          className="font-bold text-sm text-slate-900 leading-snug hover:text-emerald-700 cursor-pointer transition truncate block"
                          title={doc.title}
                        >
                          {doc.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                          <span className="text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 truncate max-w-[130px] font-semibold">{doc.type}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 shrink-0">{doc.fileSize}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 truncate max-w-[130px]">{doc.documentCategory}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions: Eye Preview, Compliance Inquiries, Edit Pencil, Download, Delete */}
                    <div className="flex items-center gap-0.5 shrink-0 bg-slate-50/90 p-0.5 rounded-lg border border-slate-200/70 shadow-2xs">
                      <button
                        onClick={() => {
                          setPreviewShowInquiries(false);
                          setPreviewDoc(doc);
                        }}
                        title="Preview Document Copy"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setPreviewShowInquiries(true);
                          setPreviewDoc(doc);
                        }}
                        title="Audit & Compliance Inquiries"
                        className="relative p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {doc.type.includes('ACORD') || doc.type.includes('INSURANCE') ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1 ring-2 ring-white"></span>
                        ) : null}
                      </button>
                      <button
                        onClick={() => handleStartEditDoc(doc)}
                        title="Edit Document"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        title="Download Official PDF Copy"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDocToDelete(doc)}
                        title="Delete Certificate"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expiration Details Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valid Until</div>
                      <div className="font-semibold text-slate-800 mt-0.5">{formatDateMMDDYYYY(doc.expiryDate)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                      <div className="mt-0.5">
                        {isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/90 inline-flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Expired ({Math.abs(doc.daysRemaining)}d ago)</span>
                          </span>
                        ) : isWarning ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70 inline-flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Expires in {doc.daysRemaining}d</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification & Action footer */}
                <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="truncate pr-2">
                    Verified by: <strong className="text-slate-800 font-medium">{doc.verifiedBy}</strong>
                  </span>
                  {isExpired ? (
                    <button
                      onClick={() => handleStartRenewDoc(doc)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Replace Policy</span>
                    </button>
                  ) : isWarning ? (
                    <button
                      onClick={() => handleStartRenewDoc(doc)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-2xs transition cursor-pointer shrink-0"
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
      )}

      {/* ========================================================================= */}
      {/* LIST / TABLE VIEW                                                         */}
      {/* ========================================================================= */}
      {viewMode === 'LIST' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1080px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 min-w-[260px]">DOCUMENT / CERTIFICATE</th>
                  <th className="py-3 px-3 w-40 whitespace-nowrap">CLASSIFICATION</th>
                  <th className="py-3 px-3 w-28 whitespace-nowrap">ISSUED DATE</th>
                  <th className="py-3 px-3 w-28 whitespace-nowrap">VALID UNTIL</th>
                  <th className="py-3 px-3 w-36 whitespace-nowrap">STATUS</th>
                  <th className="py-3 px-3 w-52 whitespace-nowrap">VERIFIED PROVENANCE</th>
                  <th className="py-3 px-4 w-36 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const isExpired = doc.status === 'EXPIRED';
                  const isWarning = doc.status === 'EXPIRING_SOON';

                  return (
                    <tr 
                      key={doc.id} 
                      className={`transition-colors ${
                        isExpired 
                          ? 'hover:bg-amber-50/20 border-l-4 border-l-amber-500' 
                          : isWarning
                            ? 'hover:bg-amber-50/20 border-l-4 border-l-amber-400'
                            : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isExpired 
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20'
                              : isWarning
                                ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/20'
                                : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20'
                          }`}>
                            {isExpired ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : isWarning ? <Clock className="w-4 h-4 text-amber-600" /> : <FileCheck className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div 
                              className="font-semibold text-slate-900 truncate hover:text-emerald-700 cursor-pointer text-xs" 
                              onClick={() => { setPreviewShowInquiries(false); setPreviewDoc(doc); }}
                              title={doc.title}
                            >
                              {doc.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{doc.documentCategory}</span>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-slate-400">{doc.fileSize}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] text-slate-700 font-mono font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap text-xs">
                        {formatDateMMDDYYYY(doc.issuedDate)}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800 whitespace-nowrap text-xs">
                        {formatDateMMDDYYYY(doc.expiryDate)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isExpired ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 inline-flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Expired ({Math.abs(doc.daysRemaining)}d ago)</span>
                          </span>
                        ) : isWarning ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Expires in {doc.daysRemaining}d</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Verified</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700 text-xs whitespace-nowrap font-medium">
                        {doc.verifiedBy}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap w-36 sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setPreviewShowInquiries(false); setPreviewDoc(doc); }}
                            title="Preview Document"
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setPreviewShowInquiries(true); setPreviewDoc(doc); }}
                            title="Audit Inquiries"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartEditDoc(doc)}
                            title="Edit Document"
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            title="Download PDF"
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDocToDelete(doc)}
                            title="Delete Certificate"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredDocs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FolderLock className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-sm font-bold text-slate-800">No documents found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Try adjusting your search query or status filter.
          </p>
        </div>
      )}

      {/* Upload Document Modal (Supports Single Document and Bulk Upload) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <FolderLock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {uploadMode === 'SINGLE' ? 'Upload Document' : 'Bulk Document Upload'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {uploadMode === 'SINGLE' 
                      ? 'Upload and verify individual compliance records.'
                      : 'Upload and configure multiple compliance certificates at once.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseUploadModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadMode('SINGLE')}
                className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                  uploadMode === 'SINGLE'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Document
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('BULK')}
                className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                  uploadMode === 'BULK'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulk Upload (Multi-File)
              </button>
            </div>

            {/* SINGLE DOCUMENT FORM */}
            {uploadMode === 'SINGLE' && (
              <form onSubmit={handleUploadSingleDocument} className="space-y-3.5 text-xs">
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
                    <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                    <SearchableSelect
                      options={[
                        { value: 'GENERAL_DOCUMENT', label: 'General Document' },
                        { value: 'LEGAL_CONTRACT', label: 'Contract / Agreement' },
                        { value: 'NDA_ENTERPRISE', label: 'Executed Mutual NDA' },
                        { value: 'BUSINESS_LICENSE', label: 'Business License / Permit' },
                        { value: 'IRS_W9', label: 'IRS Form W-9 Tax Certification' },
                        { value: 'CERT_INSURANCE_ACORD', label: 'ACORD 25 Certificate of Insurance' },
                        { value: 'BANK_VERIFICATION_LETTER', label: 'Bank Verification Letter / Proof' },
                        { value: 'ISO_27001', label: 'ISO/IEC 27001 Information Security' },
                        { value: 'SOC2_REPORT', label: 'SOC 2 Type II Security Report' },
                        { value: 'CERT_INCORPORATION', label: 'Certificate of Incorporation' },
                        { value: 'FINANCIAL_REPORT', label: 'Audited Financial Statement' },
                        { value: 'OTHER_DOCUMENT', label: 'Other Document' }
                      ]}
                      value={docType}
                      onChange={(val) => setDocType(val)}
                      placeholder="Select document type..."
                      searchPlaceholder="Search document type..."
                    />
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
                      <option value="Legal & Corporate Identity">Legal & Corporate Identity</option>
                      <option value="Tax & Regulatory">Tax & Regulatory</option>
                      <option value="Insurance & Liability">Insurance & Liability</option>
                      <option value="Banking & Treasury">Banking & Treasury</option>
                      <option value="Cybersecurity & Audits">Cybersecurity & Audits</option>
                      <option value="Licenses & Permits">Licenses & Permits</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Issue Date & Expiration Date (Side-by-Side 2 columns) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-sans text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Expiration Date</label>
                      <label className="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isPermanent}
                          onChange={(e) => setIsPermanent(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Permanent</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      disabled={isPermanent}
                      required={!isPermanent}
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans text-xs ${
                        isPermanent 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-300' 
                          : (() => {
                              const exp = calculateDocExpiryStatus(expiryDate);
                              if (exp.status === 'EXPIRED') return 'bg-rose-50/50 border-rose-300 text-rose-900';
                              if (exp.status === 'EXPIRING_SOON') return 'bg-amber-50/50 border-amber-300 text-amber-900';
                              return 'bg-white border-slate-300';
                            })()
                      }`}
                    />
                    {!isPermanent && expiryDate && (() => {
                      const exp = calculateDocExpiryStatus(expiryDate);
                      if (exp.status === 'EXPIRED') {
                        return (
                          <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span><strong>Expired:</strong> This date is in the past ({formatDateMMDDYYYY(expiryDate)}). This document will be marked as EXPIRED in the Vault.</span>
                          </div>
                        );
                      }
                      if (exp.status === 'EXPIRING_SOON') {
                        return (
                          <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span><strong>Renewal Notice:</strong> This policy expires in {exp.daysRemaining} days and will flag a renewal requirement.</span>
                          </div>
                        );
                      }
                      return (
                        <div className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Valid through {formatDateMMDDYYYY(expiryDate)} ({exp.daysRemaining} days remaining)</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Attached PDF / File Section with Eye Preview and Re-upload / Replace */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-700">Attached PDF / Document</label>
                    {(selectedFile || fileName) && (
                      <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Ready to upload
                      </span>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {selectedFile || fileName ? (
                    <div className="border border-emerald-300 bg-emerald-50/50 rounded-xl p-3.5 flex items-center justify-between gap-3 transition">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {selectedFile?.name || fileName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200 text-emerald-800 uppercase font-mono shrink-0">
                              {(selectedFile?.name || fileName).split('.').pop() || 'PDF'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{selectedFile ? formatFileSize(selectedFile.size) : '1.2 MB'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Ready to upload</span>
                          </div>
                        </div>
                      </div>

                      {/* Doc Preview Eye Icon, Replace / Re-upload Button, and Remove Icon */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={handlePreviewAttachedDoc}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/70 rounded-lg transition cursor-pointer"
                          title="Preview Document Copy"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Re-upload or replace file"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Replace</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveSelectedFile}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition cursor-pointer group"
                    >
                      <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1.5 group-hover:scale-105 transition-transform" />
                      <p className="text-xs font-semibold text-slate-800">Click to choose document or drag and drop</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, DOCX, XLSX, PNG, JPG (up to 25MB)</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseUploadModal}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer transition"
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
            )}

            {/* BULK UPLOAD FORM */}
            {uploadMode === 'BULK' && (
              <div className="space-y-4 text-xs">
                {bulkDocs.length === 0 ? (
                  <div
                    onClick={() => bulkFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition cursor-pointer group"
                  >
                    <input
                      ref={bulkFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleBulkFileSelect}
                    />
                    <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2 group-hover:scale-105 transition-transform" />
                    <p className="text-sm font-bold text-slate-800">Choose multiple documents for bulk upload</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Select multiple certificates, policies, licenses, or agreements at once. You can edit each document's details before uploading.
                    </p>
                    <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Select Multiple Files</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Queued Documents</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {bulkDocs.length} ready
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => bulkFileInputRef.current?.click()}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add More</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setBulkDocs([])}
                          className="text-xs text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <input
                      ref={bulkFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleBulkFileSelect}
                    />

                    <input
                      ref={replaceBulkItemRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && replacingBulkItemId) {
                          const { formattedTitle, type, category } = inferDocMetadata(file.name);
                          let previewUrl: string | undefined = undefined;
                          if (file.type.startsWith('image/')) {
                            previewUrl = URL.createObjectURL(file);
                          }
                          updateBulkDoc(replacingBulkItemId, {
                            file,
                            fileName: file.name,
                            fileSize: formatFileSize(file.size),
                            title: formattedTitle,
                            type,
                            documentCategory: category,
                            previewUrl
                          });
                          setReplacingBulkItemId(null);
                        }
                      }}
                    />

                    {/* Scrollable List of Queued Bulk Documents */}
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {bulkDocs.map((item) => (
                        <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition">
                          {editingBulkDocId === item.id ? (
                            /* Inline Edit Form for this specific queued file */
                            <div className="space-y-2 pt-0.5">
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                                  <Pencil className="w-3 h-3 text-emerald-600" />
                                  Edit Document Details
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingBulkDocId(null)}
                                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                                >
                                  Done
                                </button>
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Title</label>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => updateBulkDoc(item.id, { title: e.target.value })}
                                  className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Type</label>
                                  <select
                                    value={item.type}
                                    onChange={(e) => updateBulkDoc(item.id, { type: e.target.value })}
                                    className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white font-mono"
                                  >
                                    <option value="GENERAL_DOCUMENT">General Document</option>
                                    <option value="LEGAL_CONTRACT">Contract / Agreement</option>
                                    <option value="NDA_ENTERPRISE">Executed Mutual NDA</option>
                                    <option value="BUSINESS_LICENSE">Business License</option>
                                    <option value="IRS_W9">IRS Form W-9</option>
                                    <option value="CERT_INSURANCE_ACORD">ACORD 25 Insurance</option>
                                    <option value="BANK_VERIFICATION_LETTER">Bank Letter</option>
                                    <option value="ISO_27001">ISO/IEC 27001</option>
                                    <option value="SOC2_REPORT">SOC 2 Report</option>
                                    <option value="CERT_INCORPORATION">Cert of Incorporation</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Category</label>
                                  <select
                                    value={item.documentCategory}
                                    onChange={(e) => updateBulkDoc(item.id, { documentCategory: e.target.value })}
                                    className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                                  >
                                    <option value="General & Operations">General & Operations</option>
                                    <option value="Legal & Governance">Legal & Governance</option>
                                    <option value="Tax & Regulatory">Tax & Regulatory</option>
                                    <option value="Insurance & Liability">Insurance & Liability</option>
                                    <option value="Banking & Treasury">Banking & Treasury</option>
                                    <option value="Cybersecurity & Audits">Cybersecurity & Audits</option>
                                    <option value="Licenses & Permits">Licenses & Permits</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Issue Date</label>
                                  <input
                                    type="date"
                                    value={item.issuedDate}
                                    onChange={(e) => updateBulkDoc(item.id, { issuedDate: e.target.value })}
                                    className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-0.5">
                                    <label className="text-[10px] font-semibold text-slate-600">Expiry Date</label>
                                    <label className="flex items-center gap-1 text-[9px] text-slate-500 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={item.isPermanent}
                                        onChange={(e) => updateBulkDoc(item.id, { isPermanent: e.target.checked })}
                                      />
                                      <span>Perm</span>
                                    </label>
                                  </div>
                                  <input
                                    type="date"
                                    disabled={item.isPermanent}
                                    value={item.expiryDate}
                                    onChange={(e) => updateBulkDoc(item.id, { expiryDate: e.target.value })}
                                    className={`w-full border border-slate-300 rounded p-1.5 text-xs ${
                                      item.isPermanent ? 'bg-slate-100 text-slate-400' : 'bg-white'
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Summary Row with Preview Eye, Edit Pencil, Replace File, and Remove Trash */
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-slate-900 truncate">{item.title}</div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{item.type}</span>
                                    <span>•</span>
                                    <span>{item.fileSize}</span>
                                    <span>•</span>
                                    <span className="text-slate-600">{item.documentCategory}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewDoc({
                                      id: item.id,
                                      title: item.title,
                                      type: item.type,
                                      documentCategory: item.documentCategory,
                                      issuedDate: item.issuedDate,
                                      expiryDate: item.isPermanent ? 'Permanent' : item.expiryDate,
                                      daysRemaining: item.isPermanent ? 9999 : 365,
                                      status: 'ACTIVE',
                                      fileSize: item.fileSize,
                                      verifiedBy: 'Pre-Upload Inspection',
                                      previewUrl: item.previewUrl
                                    });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                  title="Preview Document Copy"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingBulkDocId(item.id)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="Edit Document Info"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplacingBulkItemId(item.id);
                                    replaceBulkItemRef.current?.click();
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="Re-upload or replace this file"
                                >
                                  <UploadCloud className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBulkDocs(prev => prev.filter(d => d.id !== item.id))}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleCloseUploadModal}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer transition text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCommitBulkUpload}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-700/20 cursor-pointer transition text-xs flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload All ({bulkDocs.length}) Documents</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Document Modal (For Each Document in Document Vault) */}
      {editingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Document</h3>
                  <p className="text-xs text-slate-500">Update metadata, classification, validity dates, and attached file.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingDoc(null);
                  setEditReplacementFile(null);
                  setEditReplacementPreviewUrl(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono"
                  >
                    <option value="IRS_W9">IRS Form W-9</option>
                    <option value="CERT_INSURANCE_ACORD">ACORD 25 Insurance</option>
                    <option value="BANK_VERIFICATION_LETTER">Bank Letter</option>
                    <option value="ISO_27001">ISO/IEC 27001</option>
                    <option value="SOC2_REPORT">SOC 2 Report</option>
                    <option value="SOC2_TYPE2">SOC 2 Type II</option>
                    <option value="CERT_INCORPORATION">Cert of Incorporation</option>
                    <option value="LEGAL_CONTRACT">Contract / Agreement</option>
                    <option value="NDA_ENTERPRISE">Executed Mutual NDA</option>
                    <option value="BUSINESS_LICENSE">Business License</option>
                    <option value="GENERAL_DOCUMENT">General Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="General & Operations">General & Operations</option>
                    <option value="Legal & Governance">Legal & Governance</option>
                    <option value="Legal & Corporate Identity">Legal & Corporate Identity</option>
                    <option value="Tax & Regulatory">Tax & Regulatory</option>
                    <option value="Insurance & Liability">Insurance & Liability</option>
                    <option value="Banking & Treasury">Banking & Treasury</option>
                    <option value="Cybersecurity & Audits">Cybersecurity & Audits</option>
                    <option value="Licenses & Permits">Licenses & Permits</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={editForm.issuedDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, issuedDate: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-sans text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Expiration Date</label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editForm.isPermanent}
                        onChange={(e) => {
                          const isPerm = e.target.checked;
                          setEditForm(prev => ({
                            ...prev,
                            isPermanent: isPerm,
                            status: isPerm ? 'ACTIVE' : calculateDocExpiryStatus(prev.expiryDate).status
                          }));
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Permanent</span>
                    </label>
                  </div>
                  <input
                    type="date"
                    disabled={editForm.isPermanent}
                    required={!editForm.isPermanent}
                    value={editForm.expiryDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const calc = calculateDocExpiryStatus(newDate);
                      setEditForm(prev => ({
                        ...prev,
                        expiryDate: newDate,
                        status: calc.status
                      }));
                    }}
                    className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans text-xs ${
                      editForm.isPermanent 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-300' 
                        : calculateDocExpiryStatus(editForm.expiryDate).status === 'EXPIRED'
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 font-medium'
                          : calculateDocExpiryStatus(editForm.expiryDate).status === 'EXPIRING_SOON'
                            ? 'border-amber-300 bg-amber-50/30 text-amber-900'
                            : 'bg-white border-slate-300'
                    }`}
                  />
                  {!editForm.isPermanent && editForm.expiryDate && (
                    <div className="mt-1">
                      {calculateDocExpiryStatus(editForm.expiryDate).status === 'EXPIRED' ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold bg-rose-50 border border-rose-200 rounded-lg p-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Expired ({Math.abs(calculateDocExpiryStatus(editForm.expiryDate).daysRemaining)}d ago). Cannot be set as Active.</span>
                        </div>
                      ) : calculateDocExpiryStatus(editForm.expiryDate).status === 'EXPIRING_SOON' ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium bg-amber-50 border border-amber-200 rounded-lg p-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Expiring soon ({calculateDocExpiryStatus(editForm.expiryDate).daysRemaining} days left).</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Valid until {calculateDocExpiryStatus(editForm.expiryDate).daysRemaining} days from now</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs"
                >
                  <option value="ACTIVE" disabled={!editForm.isPermanent && calculateDocExpiryStatus(editForm.expiryDate).status === 'EXPIRED'}>
                    Active & Verified
                  </option>
                  <option value="EXPIRING_SOON">Expiring Soon (Attention Required)</option>
                  <option value="EXPIRED">Expired (Immediate Replacement Required)</option>
                </select>
                {!editForm.isPermanent && calculateDocExpiryStatus(editForm.expiryDate).status === 'EXPIRED' && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    Because this document's expiration date has passed, its status must remain Expired until renewed.
                  </p>
                )}
              </div>

              {/* Attached PDF Section with Preview, Re-upload & Replace Option */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Attached PDF / Document File</label>
                  {editReplacementFile ? (
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Pending Replacement
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified original attached
                    </span>
                  )}
                </div>

                <input
                  ref={editFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleEditFileSelect}
                />

                {editReplacementFile ? (
                  <div className="border border-amber-300 bg-amber-50/50 rounded-xl p-3 flex items-center justify-between gap-3 transition">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {editReplacementFile.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-800 uppercase font-mono shrink-0">
                            {editReplacementFile.name.split('.').pop() || 'PDF'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{formatFileSize(editReplacementFile.size)}</span>
                          <span>•</span>
                          <span className="text-amber-700 font-semibold">New file ready to replace</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handlePreviewEditReplacementDoc}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg transition cursor-pointer border border-transparent hover:border-slate-200"
                        title="Preview Replacement Document Copy"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Choose a different file"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                        <span>Re-upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRevertEditFile}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Cancel replacement & keep original"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-3 flex items-center justify-between gap-3 transition">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {getCleanDocumentFilename(editingDoc)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200 text-emerald-800 uppercase font-mono shrink-0">
                            PDF
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{editingDoc.fileSize}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">Original verified file attached</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(editingDoc)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg transition cursor-pointer border border-transparent hover:border-slate-200"
                        title="Preview Attached PDF Copy"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title="Re-upload or replace this document file"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Re-upload / Replace</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoc(null);
                    setEditReplacementFile(null);
                    setEditReplacementPreviewUrl(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-700/20 cursor-pointer transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Renewal & Policy Replacement Modal */}
      {renewingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs">
                  <RefreshCw className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Renew & Replace Certificate</h3>
                  <p className="text-xs text-slate-500">Autonomous Compliance Refresh</p>
                </div>
              </div>
              <button
                onClick={() => setRenewingDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRenewal} className="mt-4 space-y-4">
              {/* Target Document Summary */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs">{renewingDoc.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                    {renewingDoc.type}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Category: {renewingDoc.documentCategory}</span>
                  <span className="text-amber-700 font-semibold">
                    Current: Expired ({formatDateMMDDYYYY(renewingDoc.expiryDate)})
                  </span>
                </div>
              </div>

              {/* Upload Replacement File Zone */}
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                  Upload Replacement Certificate / Rider PDF *
                </label>
                <input
                  ref={renewalFileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setRenewalFile(file);
                  }}
                />
                <div
                  onClick={() => renewalFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                    renewalFile
                      ? 'border-emerald-400 bg-emerald-50/40 text-emerald-900'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 text-slate-600'
                  }`}
                >
                  {renewalFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="text-left min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-xs">{renewalFile.name}</div>
                        <div className="text-[11px] text-slate-500">{formatFileSize(renewalFile.size)} • Ready for automated AI extraction</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <div className="text-xs font-semibold text-slate-700">Click to upload replacement PDF or drag & drop</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">ACORD 25 COI, State Endorsement, or Certificate Rider (up to 25MB)</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Issue Date</label>
                  <input
                    type="date"
                    required
                    value={renewalIssueDate}
                    onChange={(e) => setRenewalIssueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-slate-400 focus:outline-none bg-white text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={renewalExpiryDate}
                    onChange={(e) => setRenewalExpiryDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-slate-400 focus:outline-none bg-white text-xs font-sans"
                  />
                </div>
              </div>

              {/* Live Preview Outcome */}
              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  New standing: <strong>Active & Verified</strong> for 365 days across connected buyer workspaces.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRenewingDoc(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenewingSubmitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isRenewingSubmitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying & Syncing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verify & Update Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Certificate</h3>
                  <p className="text-xs text-slate-500">Document Vault De-provisioning</p>
                </div>
              </div>
              <button
                onClick={() => setDocToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900 font-semibold">{docToDelete.title}</strong>?
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-mono font-semibold text-slate-800">{docToDelete.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="text-slate-700">{docToDelete.documentCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expiration Status:</span>
                  <span className={`font-semibold ${
                    docToDelete.status === 'EXPIRED' ? 'text-rose-600' :
                    docToDelete.status === 'EXPIRING_SOON' ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {docToDelete.status === 'EXPIRED' ? 'Expired' : docToDelete.status === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start space-x-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Deleting this compliance record will invalidate its verified standing across active buyer onboarding dossiers (e.g. NovaTech Aerospace).
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDoc}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-700/20 cursor-pointer transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Fidelity Document Preview Modal */}
      <DocumentPreviewModal
        doc={previewDoc}
        initialShowInquiries={previewShowInquiries}
        onClose={() => {
          setPreviewDoc(null);
          setPreviewShowInquiries(false);
        }}
        onDownload={handleDownloadDocument}
        onRenew={handleRenewDoc}
        onOpenCentralMessages={(docId, docType) => {
          setPreviewDoc(null);
          setPreviewShowInquiries(false);
          navigate(`/communications?doc=${docId}&type=${docType}`);
        }}
      />
    </div>
  );
};
