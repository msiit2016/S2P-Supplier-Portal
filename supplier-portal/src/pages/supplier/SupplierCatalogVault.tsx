import React, { useState, useEffect, useRef } from 'react';
import { ApiClient } from '../../api/client.js';
import { CatalogItem, TransactionComment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
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
  AlertCircle,
  ChevronRight,
  Globe,
  Layers,
  DollarSign,
  MessageSquare,
  Send,
  Edit3,
  Eye,
  FileText,
  Check,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const DEFAULT_CATALOG_COMMENTS: Record<string, TransactionComment[]> = {
  'RATE-SCHEDULE-B': [
    {
      id: 'comm-cat-1',
      entityType: 'CONTRACT',
      entityId: 'RATE-SCHEDULE-B',
      authorId: 'usr-buyer-vance',
      authorName: 'Col. Jonathan Vance (Procurement Contracting Officer)',
      authorRole: 'BUYER',
      text: 'Inquiry regarding Volume Discount Schedule B conformity for Gen-5 NVMe Compute Nodes (ACM-NODE-800). Rate card pre-cleared for Q4 procurement.',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
    }
  ],
  'ACM-NODE-800': [
    {
      id: 'comm-cat-node-1',
      entityType: 'CONTRACT',
      entityId: 'ACM-NODE-800',
      authorId: 'usr-buyer-vance',
      authorName: 'Col. Jonathan Vance (Procurement Contracting Officer)',
      authorRole: 'BUYER',
      text: 'Inquiry regarding Volume Discount Schedule B conformity for Gen-5 NVMe Compute Nodes (ACM-NODE-800). Rate card pre-cleared for Q4 procurement.',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
    }
  ]
};

interface ParsedCsvItem {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  uom: string;
  leadTimeDays: number;
  description?: string;
}

const DEFAULT_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'cat-1',
    supplierOrgId: 'supp-org-1',
    sku: 'ACM-NODE-800',
    name: 'Enterprise AI Telemetry Streaming Ingestion Node',
    description: 'High-throughput dual-redundant stream processor supporting Kafka and S2P event bus with sub-10ms latency.',
    category: 'IT_HARDWARE_SERVICES',
    unitPrice: 18500.00,
    currency: 'USD',
    uom: 'EA',
    leadTimeDays: 7,
    minOrderQty: 1,
    status: 'PUBLISHED',
    lastUpdated: '2026-10-15T12:00:00Z'
  },
  {
    id: 'cat-2',
    supplierOrgId: 'supp-org-1',
    sku: 'ACM-VEC-100',
    name: 'Managed Vector Knowledge Retrieval Cluster',
    description: 'Enterprise semantic search index with 99.99% SLA, compliant with SOC 2 and ISO 27001.',
    category: 'IT_HARDWARE_SERVICES',
    unitPrice: 11500.00,
    currency: 'USD',
    uom: 'YR',
    leadTimeDays: 1,
    minOrderQty: 1,
    status: 'PUBLISHED',
    lastUpdated: '2026-10-15T12:00:00Z'
  },
  {
    id: 'cat-3',
    supplierOrgId: 'supp-org-1',
    sku: 'ACM-SVC-01',
    name: 'S2P Pipeline Integration & Custom Connectors',
    description: 'Professional engineering services for Coupa/SAP custom API mappings and cXML PunchOut setups.',
    category: 'PROFESSIONAL_SERVICES',
    unitPrice: 225.00,
    currency: 'USD',
    uom: 'HRS',
    leadTimeDays: 5,
    minOrderQty: 40,
    status: 'PUBLISHED',
    lastUpdated: '2026-10-16T09:00:00Z'
  },
  {
    id: 'cat-5',
    supplierOrgId: 'supp-org-1',
    sku: 'ACM-SENSOR-40',
    name: 'Precision Multi-Axis Industrial IoT Sensor Array',
    description: 'Ruggedized IP68 submersible telemetry array with vibration, thermal and electromagnetic monitoring.',
    category: 'IT_HARDWARE_SERVICES',
    unitPrice: 640.00,
    currency: 'USD',
    uom: 'EA',
    leadTimeDays: 3,
    minOrderQty: 10,
    status: 'PUBLISHED',
    lastUpdated: '2026-10-21T11:00:00Z'
  },
  {
    id: 'cat-6',
    supplierOrgId: 'supp-org-1',
    sku: 'ACM-EDGE-200',
    name: 'High-Tolerance Modular Edge Compute Node',
    description: 'Enterprise secure server node with TPM 2.0 cryptographic vault, redundant power supply and 10Gbps SFP+.',
    category: 'IT_HARDWARE_SERVICES',
    unitPrice: 9000.00,
    currency: 'USD',
    uom: 'EA',
    leadTimeDays: 10,
    minOrderQty: 2,
    status: 'PUBLISHED',
    lastUpdated: '2026-10-22T14:00:00Z'
  }
];

export const SupplierCatalogVault: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate, routeState } = usePortal();
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(DEFAULT_CATALOG_ITEMS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showCollabDrawer, setShowCollabDrawer] = useState<boolean>(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, TransactionComment[]>>(DEFAULT_CATALOG_COMMENTS);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [aiDrafting, setAiDrafting] = useState<boolean>(false);
  const [selectedSkuForCollab, setSelectedSkuForCollab] = useState<string | null>(null);

  // Helper for file sizes
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '1.8 MB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    if (routeState) {
      if (routeState.openCollab || routeState.openMessages) {
        setShowCollabDrawer(true);
      } else {
        setShowCollabDrawer(false);
      }
    }
  }, [routeState]);

  const activeComments = selectedSkuForCollab
    ? (commentsMap[selectedSkuForCollab] || [])
    : (commentsMap['RATE-SCHEDULE-B'] || []);

  const totalInquiryCount = Object.values(commentsMap).reduce((sum, list) => sum + (list?.length || 0), 0);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const targetEntity = selectedSkuForCollab || 'RATE-SCHEDULE-B';
    const newMsg: TransactionComment = {
      id: `comm-cat-${Date.now()}`,
      entityType: 'CONTRACT',
      entityId: targetEntity,
      authorId: currentUser?.id || 'usr-current',
      authorName: currentUser?.name || 'Elena Rostova (Acme Industrial)',
      authorRole: 'SUPPLIER',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    setCommentsMap(prev => ({
      ...prev,
      [targetEntity]: [...(prev[targetEntity] || []), newMsg]
    }));
    setNewCommentText('');
  };

  const handleAiDraftComment = () => {
    setAiDrafting(true);
    setTimeout(() => {
      const skuContext = selectedSkuForCollab ? ` for ${selectedSkuForCollab}` : '';
      setNewCommentText(`Confirming Volume Discount Schedule B pre-clearance${skuContext}: 12% master volume discount conformed for orders >= 8 units. Electronic cXML PunchOut rate card updated.`);
      setAiDrafting(false);
    }, 400);
  };

  // Add Single Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IT_HARDWARE_SERVICES');
  const [unitPrice, setUnitPrice] = useState<number>(100);
  const [uom, setUom] = useState('EA');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [addAttachmentFile, setAddAttachmentFile] = useState<File | null>(null);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit Single Item Modal State
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('IT_HARDWARE_SERVICES');
  const [editUnitPrice, setEditUnitPrice] = useState<number>(100);
  const [editUom, setEditUom] = useState('EA');
  const [editLeadTimeDays, setEditLeadTimeDays] = useState<number>(7);
  const [editStatus, setEditStatus] = useState<'PUBLISHED' | 'PENDING_APPROVAL' | 'ARCHIVED'>('PUBLISHED');
  const [editMinOrderQty, setEditMinOrderQty] = useState<number>(1);
  const [editReplacementFile, setEditReplacementFile] = useState<File | null>(null);
  const [editReplacementPreviewUrl, setEditReplacementPreviewUrl] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete Item Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<CatalogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Datasheet PDF Preview Modal State
  const [previewDatasheetItem, setPreviewDatasheetItem] = useState<CatalogItem | null>(null);

  const handleOpenEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setEditSku(item.sku);
    setEditName(item.name);
    setEditDescription(item.description || '');
    setEditCategory(item.category || 'IT_HARDWARE_SERVICES');
    setEditUnitPrice(item.unitPrice || 0);
    setEditUom(item.uom || 'EA');
    setEditLeadTimeDays(item.leadTimeDays || 7);
    setEditStatus(item.status || 'PUBLISHED');
    setEditMinOrderQty(item.minOrderQty || 1);
    setEditReplacementFile(null);
    setEditReplacementPreviewUrl(null);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditReplacementFile(file);
      const url = URL.createObjectURL(file);
      setEditReplacementPreviewUrl(url);
    }
  };

  const handleRevertEditFile = () => {
    setEditReplacementFile(null);
    if (editReplacementPreviewUrl) {
      URL.revokeObjectURL(editReplacementPreviewUrl);
      setEditReplacementPreviewUrl(null);
    }
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const updatedItem: CatalogItem = {
        ...editingItem,
        sku: editSku.trim(),
        name: editName.trim(),
        description: editDescription.trim(),
        category: editCategory,
        unitPrice: Number(editUnitPrice),
        uom: editUom.trim().toUpperCase() || 'EA',
        leadTimeDays: Number(editLeadTimeDays),
        status: editStatus,
        minOrderQty: Number(editMinOrderQty),
        lastUpdated: new Date().toISOString(),
        attachmentFileName: editReplacementFile ? editReplacementFile.name : (editingItem.attachmentFileName || `${editSku}_Datasheet_Spec_Sheet.pdf`),
        attachmentSize: editReplacementFile ? formatFileSize(editReplacementFile.size) : (editingItem.attachmentSize || '1.8 MB'),
        attachmentUrl: editReplacementPreviewUrl || editingItem.attachmentUrl
      };

      await ApiClient.upsertCatalogItem(updatedItem);
      setCatalogItems(prev => prev.map(c => c.id === editingItem.id || c.sku === editingItem.sku ? updatedItem : c));
      setActionSuccess(`Item ${updatedItem.sku} (${updatedItem.name}) updated successfully.`);
      setEditingItem(null);
      setEditReplacementFile(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update catalog item');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await ApiClient.deleteCatalogItem(deletingItem.sku);
      setCatalogItems(prev => prev.filter(c => c.id !== deletingItem.id && c.sku !== deletingItem.sku));
      setActionSuccess(`Item ${deletingItem.sku} (${deletingItem.name}) removed from catalog.`);
      setDeletingItem(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      // Local fallback
      setCatalogItems(prev => prev.filter(c => c.id !== deletingItem.id && c.sku !== deletingItem.sku));
      setActionSuccess(`Item ${deletingItem.sku} removed from catalog.`);
      setDeletingItem(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

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
      const res = await ApiClient.getCatalogItems();
      if (res && res.catalogItems && res.catalogItems.length > 0) {
        setCatalogItems(res.catalogItems);
      }
    } catch (err) {
      console.warn('Failed to load live catalog, using default catalog items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [currentUser]);

  // Broadcast live Catalog context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'catalog',
      totalItems: catalogItems.length,
      categoriesCount: 2,
      pricingInquiriesCount: 1,
      minPrice: '$225',
      maxPrice: '$18,500',
      searchQuery,
      selectedCategory,
      items: catalogItems.map(c => ({ sku: c.sku, name: c.name, price: c.unitPrice, category: c.category }))
    });
  }, [catalogItems, searchQuery, selectedCategory]);

  // Listen to actions dispatched by Ava Copilot
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'ADD_CATALOG_ITEM') {
        const p = action.payload;
        const newItem: CatalogItem = {
          id: `cat-${Date.now()}`,
          supplierOrgId: 'supp-org-1',
          sku: p.sku || `SKU-${Date.now().toString().slice(-4)}`,
          name: p.name || 'New Catalog Item',
          description: p.description || p.name || 'Component item added via Ava Copilot',
          category: p.category || 'IT_HARDWARE_SERVICES',
          unitPrice: Number(p.unitPrice) || 100,
          currency: 'USD',
          uom: p.uom || 'EA',
          leadTimeDays: Number(p.leadTimeDays) || 7,
          minOrderQty: 1,
          status: 'PUBLISHED',
          lastUpdated: new Date().toISOString()
        };
        setCatalogItems(prev => [newItem, ...prev]);
        setActionSuccess(`Ava added ${newItem.name} (${newItem.sku}) to catalog`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'DELETE_CATALOG_ITEM') {
        const sku = action.payload.sku;
        setCatalogItems(prev => prev.filter(c => c.sku !== sku));
        setActionSuccess(`Ava deleted catalog item ${sku}`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'UPDATE_CATALOG_ITEM') {
        const { sku, unitPrice, leadTimeDays } = action.payload;
        setCatalogItems(prev => prev.map(c => {
          if (c.sku === sku) {
            return {
              ...c,
              unitPrice: unitPrice !== undefined ? Number(unitPrice) : c.unitPrice,
              leadTimeDays: leadTimeDays !== undefined ? Number(leadTimeDays) : c.leadTimeDays,
              lastUpdated: new Date().toISOString()
            };
          }
          return c;
        }));
        setActionSuccess(`Ava updated catalog item ${sku}`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'OPEN_ADD_SKU_MODAL') {
        setShowAddModal(true);
        setActionSuccess('Ava opened Add SKU item registration modal');
        setTimeout(() => setActionSuccess(null), 3000);
      } else if (action.action === 'OPEN_BULK_IMPORT_MODAL') {
        setShowBulkModal(true);
        setActionSuccess('Ava opened Bulk CSV Import modal');
        setTimeout(() => setActionSuccess(null), 3000);
      } else if (action.action === 'FILTER_CATEGORY' && action.payload?.category) {
        setSelectedCategory(action.payload.category);
        setActionSuccess(`Ava filtered catalog by category: ${action.payload.category}`);
        setTimeout(() => setActionSuccess(null), 3000);
      } else if (action.action === 'SET_PAGE_FILTER') {
        if (action.payload.searchQuery !== undefined) setSearchQuery(action.payload.searchQuery);
        if (action.payload.category !== undefined) setSelectedCategory(action.payload.category);
        setActionSuccess('Ava updated catalog filters');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });
    return cleanup;
  }, [catalogItems]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fileName = addAttachmentFile ? addAttachmentFile.name : `${sku}_Datasheet_Spec_Sheet.pdf`;
      const fileSize = addAttachmentFile ? formatFileSize(addAttachmentFile.size) : '1.4 MB';
      await ApiClient.upsertCatalogItem({
        sku,
        name,
        description,
        category,
        unitPrice,
        uom,
        leadTimeDays,
        attachmentFileName: fileName,
        attachmentSize: fileSize
      });
      setShowAddModal(false);
      setActionSuccess(`Item ${sku} added successfully.`);
      await loadCatalog();
      setSku('');
      setName('');
      setDescription('');
      setAddAttachmentFile(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save item');
    }
  };

  // 1. Download Standard CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = 
      "Item Code,Item Name,Item Description,Category,Unit Price,UOM,Lead Time (Days)\r\n" +
      "IT-SRV-ENT-01,Dedicated Cloud Node 64GB,Dual-redundant 64GB high-throughput compute node,IT_HARDWARE_SERVICES,850.00,MO,2\r\n" +
      "IT-SEC-EDR-50,Endpoint Protection (50 Pack),Managed enterprise endpoint telemetry protection,IT_HARDWARE_SERVICES,2200.00,YR,1\r\n" +
      "DEV-ENG-SPR-01,Senior Fullstack Sprint,Two-week agile sprint delivery with senior cloud engineers,PROFESSIONAL_SERVICES,12500.00,EA,5\r\n" +
      "S2P-API-SYNC,PunchOut Stream Connector,Automated cXML PunchOut connector with 99.99% uptime,SOFTWARE_LICENSES,4200.00,YR,1\r\n";

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

        // Parse header row
        const headerCols = lines[0].split(',').map(c => c.trim().toLowerCase().replace(/^["']|["']$/g, ''));
        
        let skuIdx = headerCols.findIndex(h => h.includes('sku') || h.includes('item code') || h.includes('code'));
        let nameIdx = headerCols.findIndex(h => h === 'item name' || h === 'name' || h.includes('title'));
        let descIdx = headerCols.findIndex(h => h.includes('desc') || h.includes('description'));
        let catIdx = headerCols.findIndex(h => h.includes('cat') || h.includes('category'));
        let priceIdx = headerCols.findIndex(h => h.includes('price') || h.includes('rate') || h.includes('unit'));
        let uomIdx = headerCols.findIndex(h => h.includes('uom') || h.includes('unit of measure'));
        let leadIdx = headerCols.findIndex(h => h.includes('lead') || h.includes('days'));

        // Default positional fallbacks if header names were generic
        if (skuIdx === -1) skuIdx = 0;
        if (nameIdx === -1) nameIdx = 1;
        if (descIdx === -1) descIdx = 2;
        if (catIdx === -1) catIdx = 3;
        if (priceIdx === -1) priceIdx = 4;
        if (uomIdx === -1) uomIdx = 5;
        if (leadIdx === -1) leadIdx = 6;

        const items: ParsedCsvItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const rawRow = lines[i];
          const cols: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < rawRow.length; c++) {
            const char = rawRow[c];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          cols.push(current.trim());

          const cleanedCols = cols.map(c => c.replace(/^["']|["']$/g, '').trim());
          const itemCode = cleanedCols[skuIdx] || '';
          const itemName = cleanedCols[nameIdx] || '';

          if (itemCode || itemName) {
            items.push({
              sku: itemCode || `ITEM-${Date.now().toString().slice(-4)}`,
              name: itemName || 'Item',
              description: descIdx >= 0 && cleanedCols[descIdx] ? cleanedCols[descIdx] : '',
              category: catIdx >= 0 && cleanedCols[catIdx] ? cleanedCols[catIdx] : 'IT_HARDWARE_SERVICES',
              unitPrice: priceIdx >= 0 && parseFloat(cleanedCols[priceIdx]) ? parseFloat(cleanedCols[priceIdx]) : 150.0,
              uom: uomIdx >= 0 && cleanedCols[uomIdx] ? cleanedCols[uomIdx] : 'EA',
              leadTimeDays: leadIdx >= 0 && parseInt(cleanedCols[leadIdx]) ? parseInt(cleanedCols[leadIdx]) : 3
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
      { sku: 'IT-SRV-ENT-01', name: 'Dedicated Cloud Node 64GB', description: 'Dual-redundant 64GB high-throughput compute node', category: 'IT_HARDWARE_SERVICES', unitPrice: 850.00, uom: 'MO', leadTimeDays: 2 },
      { sku: 'IT-SEC-EDR-50', name: 'Endpoint Protection (50 Pack)', description: 'Managed enterprise endpoint telemetry protection', category: 'IT_HARDWARE_SERVICES', unitPrice: 2200.00, uom: 'YR', leadTimeDays: 1 },
      { sku: 'DEV-ENG-SPR-01', name: 'Senior Fullstack Sprint', description: 'Two-week agile sprint delivery with senior cloud engineers', category: 'PROFESSIONAL_SERVICES', unitPrice: 12500.00, uom: 'EA', leadTimeDays: 5 },
      { sku: 'S2P-API-SYNC', name: 'PunchOut Stream Connector', description: 'Automated cXML PunchOut connector with 99.99% uptime', category: 'SOFTWARE_LICENSES', unitPrice: 4200.00, uom: 'YR', leadTimeDays: 1 }
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
          description: item.description || '',
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

  // Dynamic Catalog Analytics
  const prices = catalogItems.map(i => i.unitPrice).filter(p => !isNaN(p) && p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

  const leadTimes = catalogItems.map(i => i.leadTimeDays).filter(d => !isNaN(d) && d > 0);
  const minLead = leadTimes.length > 0 ? Math.min(...leadTimes) : 1;
  const maxLead = leadTimes.length > 0 ? Math.max(...leadTimes) : 7;
  const avgLead = leadTimes.length > 0 ? (leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length).toFixed(1) : '5.0';

  return (
    <div className="space-y-4 pb-16">
      {/* Top Banner (Minimal, Balanced, Clean) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Title, Badge & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <Package className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">Product Catalog</h1>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Contracted rate schedules, item specifications, and catalog sync.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedSkuForCollab(null);
              setShowCollabDrawer(prev => !prev);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              showCollabDrawer 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
            }`}
            title="Catalog Contract & Pricing Inquiries (All SKUs)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>Pricing Inquiries</span>
            {totalInquiryCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                showCollabDrawer ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-700'
              }`}>
                {totalInquiryCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Bulk Import Items"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Add a new catalog item"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* In-Page Catalog Pricing Collaboration Drawer */}
      {showCollabDrawer && (
        <div className="bg-white border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-teal-100">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  {selectedSkuForCollab ? `Pricing Inquiry: ${selectedSkuForCollab}` : 'Contract Rate Cards & Pricing Thread'}
                </h3>
                <span className="text-[10px] text-slate-500">
                  {selectedSkuForCollab 
                    ? `Item-specific rate negotiations and volume discount discussions for ${selectedSkuForCollab}`
                    : 'Direct rate schedule clarification with buyer contracting officers'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                {selectedSkuForCollab || 'RATE-SCHEDULE-B'}
              </span>
              <button
                onClick={() => setShowCollabDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                title="Close message thread"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Thread / SKU Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSkuForCollab(null)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                !selectedSkuForCollab ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              General Schedule B
            </button>
            {catalogItems.map(item => {
              const count = (commentsMap[item.sku] || []).length;
              const isSelected = selectedSkuForCollab === item.sku;
              return (
                <button
                  key={item.sku}
                  type="button"
                  onClick={() => setSelectedSkuForCollab(item.sku)}
                  className={`px-2.5 py-1 rounded-lg font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{item.sku}</span>
                  {count > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-teal-400' : 'bg-teal-600'} animate-pulse`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Message List */}
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {activeComments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="font-medium text-slate-500">No active pricing inquiries</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Start collaboration with enterprise procurement contracting officer.</p>
              </div>
            ) : (
              activeComments.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs ${
                    msg.authorRole === 'SUPPLIER'
                      ? 'bg-teal-50/50 border-teal-200 ml-4'
                      : 'bg-slate-50 border-slate-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-[11px]">
                      {msg.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {msg.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Composer */}
          <form onSubmit={handleSendComment} className="pt-2 border-t border-teal-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reply as Contract Specialist</span>
              <button
                type="button"
                onClick={handleAiDraftComment}
                disabled={aiDrafting}
                className="text-[10px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>{aiDrafting ? 'Drafting...' : 'AI Auto-Draft'}</span>
              </button>
            </div>
            <textarea
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Inquire on volume tiers, lead-time commitments, or PunchOut rate cards..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Rate Response</span>
            </button>
          </form>
        </div>
      )}

      {/* Action Notification */}
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
        {/* KPI 1: Active Items / Catalog Master */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Catalog Master</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {catalogItems.length} <span className="text-xs font-normal text-slate-500 font-sans">Item Codes</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-emerald-700 group-hover:text-emerald-800 font-medium truncate transition">
              Live across buyer network
            </span>
            <Sparkline data={[14, 18, 22, 25, 28, Math.max(30, catalogItems.length)]} color="#10b981" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2: Contract Rate Span (Pricing Tiers) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contract Rate Span</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500 font-sans">USD</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-teal-700 font-medium truncate transition">
              Avg ${avgPrice.toLocaleString()} contracted unit
            </span>
            <Sparkline data={[avgPrice * 0.85, avgPrice * 0.9, avgPrice * 0.95, avgPrice * 0.98, avgPrice]} color="#0d9488" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3: Product Categories & Taxonomies */}
        <div 
          onClick={() => setSelectedCategory('ALL')}
          title="Click to reset category filter"
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Categories</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {categories.length} <span className="text-xs font-normal text-slate-500 font-sans">Taxonomies</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-sky-700 font-medium truncate transition">
              UNSPSC classifications
            </span>
            <Sparkline data={[2, 3, 3, 4, 4, Math.max(5, categories.length)]} color="#0284c7" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4: Fulfillment Lead Time SLA */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fulfillment SLA</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {minLead} – {maxLead} <span className="text-xs font-normal text-slate-500 font-sans">Days</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium truncate transition">
              Avg {avgLead}d dispatch SLA
            </span>
            <Sparkline data={[7, 6, 5, 4, 4, Math.max(2, parseFloat(avgLead) || 5)]} color="#d97706" width={68} height={20} />
          </div>
        </div>
      </div>

      {/* Table Filter & Search Toolbar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Instant Search Input */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Item Code, Name, or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/70"
            />
          </div>

          {/* Category Dropdown */}
          <FilterSelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            title="Filter by category"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </FilterSelect>

          {(selectedCategory !== 'ALL' || searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer px-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Catalog Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1080px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">ITEM CODE</th>
                <th className="py-3 px-3.5 min-w-[140px]">ITEM NAME</th>
                <th className="py-3 px-3 hidden xl:table-cell max-w-xs">ITEM DESCRIPTION</th>
                <th className="py-3 px-3 whitespace-nowrap hidden md:table-cell">CATEGORY</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">UNIT PRICE</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap">UOM</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap">LEAD TIME</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">STATUS</th>
                <th className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.sku}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900 text-xs min-w-[140px] max-w-[220px]">
                    <span className="truncate block" title={item.name}>{item.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-xs leading-relaxed max-w-xs hidden xl:table-cell">
                    <div className="line-clamp-2" title={item.description}>
                      {item.description || '—'}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono whitespace-nowrap text-xs">
                    ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-2.5 text-center text-slate-600 font-semibold whitespace-nowrap">{item.uom}</td>
                  <td className="py-3 px-2.5 text-center text-slate-600 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.leadTimeDays}d</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{item.status || 'PUBLISHED'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Message / Pricing Inquiry Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSkuForCollab(item.sku);
                          setShowCollabDrawer(true);
                        }}
                        className="relative p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title={`Pricing inquiries for ${item.sku}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        {(commentsMap[item.sku] || []).length > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white animate-pulse" />
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title={`Edit ${item.sku} specifications and rates`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title={`Delete ${item.sku}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                      <div className="mt-2.5 pt-2 border-t border-teal-200/60 max-h-36 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="text-slate-500 border-b border-teal-100">
                              <th className="pb-1 font-semibold">Item Code</th>
                              <th className="pb-1 font-semibold">Item Name</th>
                              <th className="pb-1 font-semibold">Item Description</th>
                              <th className="pb-1 font-semibold text-right">Price</th>
                              <th className="pb-1 font-semibold text-center">UOM</th>
                              <th className="pb-1 font-semibold text-center">Lead Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-teal-100/60">
                            {parsedItems.map((item, idx) => (
                              <tr key={idx} className="text-slate-700">
                                <td className="py-1 font-mono font-bold text-slate-900 whitespace-nowrap">{item.sku}</td>
                                <td className="py-1 truncate max-w-[110px] font-medium text-slate-800">{item.name}</td>
                                <td className="py-1 truncate max-w-[140px] text-slate-500">{item.description || '—'}</td>
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
                  <p className="text-xs text-slate-500">Add a contracted item to your catalog.</p>
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
                <label className="block font-semibold text-slate-700 mb-1">Item Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACM-NODE-900"
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
                <label className="block font-semibold text-slate-700 mb-1">Item Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed specifications, operational envelope, SLAs, or technical scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

              {/* Attached Datasheet Section (Add Modal) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Specification / Datasheet (PDF/Doc)
                </label>
                {addAttachmentFile ? (
                  <div className="border border-teal-200 bg-teal-50/60 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate text-[11px]">{addAttachmentFile.name}</div>
                        <div className="text-[10px] text-slate-500">{formatFileSize(addAttachmentFile.size)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddAttachmentFile(null)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => addFileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-3 text-center cursor-pointer bg-slate-50/50 hover:bg-teal-50/30 transition"
                  >
                    <UploadCloud className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-600 font-medium">Click to attach datasheet (PDF, Doc, PNG)</span>
                    <input
                      type="file"
                      ref={addFileInputRef}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setAddAttachmentFile(f);
                      }}
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      className="hidden"
                    />
                  </div>
                )}
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

      {/* Edit Single Item Modal (Matching Snap 2 with Re-upload/Replace) */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Item</h3>
                  <p className="text-xs text-slate-500">Update metadata, classification, validity rates, and attached specification file.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setEditReplacementFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Code (SKU)</label>
                  <input
                    type="text"
                    required
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Publishing Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="PUBLISHED">Active & Published</option>
                    <option value="PENDING_APPROVAL">Pending Review</option>
                    <option value="ARCHIVED">Archived / Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                >
                  <option value="IT_HARDWARE_SERVICES">IT Hardware & Services</option>
                  <option value="PROFESSIONAL_SERVICES">Professional Services</option>
                  <option value="CLOUD_INFRASTRUCTURE">Cloud Infrastructure</option>
                  <option value="SOFTWARE_LICENSES">Software Licenses</option>
                  <option value="FACILITIES_MAINTENANCE">Facilities & Operations</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UOM</label>
                  <input
                    type="text"
                    required
                    value={editUom}
                    onChange={(e) => setEditUom(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold"
                    placeholder="EA, YR, MO, HRS"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={editLeadTimeDays}
                    onChange={(e) => setEditLeadTimeDays(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Detailed specifications, operational envelope, SLAs, or technical scope..."
                />
              </div>

              {/* Attached PDF / Document File Section (Matching Snap 2) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700">Attached PDF / Document File</label>
                  <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified original attached</span>
                  </span>
                </div>

                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditFileSelect}
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  className="hidden"
                />

                {editReplacementFile ? (
                  <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3 flex items-center justify-between gap-3 transition">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {editReplacementFile.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-200 text-emerald-800 uppercase font-mono shrink-0">
                            NEW
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{formatFileSize(editReplacementFile.size)}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">New specification document selected</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
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
                            {editingItem.attachmentFileName || `${editingItem.sku}_Datasheet_Spec_Sheet.pdf`}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200 text-emerald-800 uppercase font-mono shrink-0">
                            PDF
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{editingItem.attachmentSize || '1.8 MB'}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">Original verified file attached</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDatasheetItem(editingItem)}
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setEditReplacementFile(null);
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

      {/* Delete Item Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900">Delete Catalog Item</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900">{deletingItem.name}</strong> (<code className="font-mono text-slate-800">{deletingItem.sku}</code>)?
                </p>
                <div className="mt-3 p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-[11px] text-rose-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Permanent Catalog De-listing</span>
                  </p>
                  <p className="text-rose-700">
                    This contracted SKU will be removed from your catalog and unlinked from connected buyer ERP punchouts.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-700/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Item'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datasheet PDF Preview Modal */}
      {previewDatasheetItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {previewDatasheetItem.attachmentFileName || `${previewDatasheetItem.sku}_Datasheet_Spec_Sheet.pdf`}
                  </h3>
                  <p className="text-[11px] text-slate-500">Official Product Specification & Technical Drawing</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDatasheetItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Sheet Simulation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-sans space-y-4 max-h-[460px] overflow-y-auto shadow-inner text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    ACME INDUSTRIAL CORP • SPEC-2026
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{previewDatasheetItem.name}</h2>
                  <p className="text-[11px] font-mono text-slate-500">PART SKU: {previewDatasheetItem.sku}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    VERIFIED SPECIFICATION
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">ISO 9001:2015 Compliant</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-slate-800">{previewDatasheetItem.category}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Standard Price</span>
                  <span className="font-bold text-slate-900 font-mono">${previewDatasheetItem.unitPrice.toFixed(2)}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">UOM</span>
                  <span className="font-semibold text-slate-800">{previewDatasheetItem.uom}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Dispatch SLA</span>
                  <span className="font-semibold text-slate-800">{previewDatasheetItem.leadTimeDays} Business Days</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engineering Envelope & Description</span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {previewDatasheetItem.description || 'Enterprise-grade component with certified telemetry, vibration tolerance, and bilateral S2P ERP electronic dispatch conformity.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-medium text-slate-700">Digital Integrity Verified via Ledger SHA-256</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">HASH: 9a4f...e3b8</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDatasheetItem(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
