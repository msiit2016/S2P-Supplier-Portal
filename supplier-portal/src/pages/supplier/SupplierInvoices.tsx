import React, { useState, useEffect, useRef } from 'react';
import { ApiClient } from '../../api/client.js';
import { Invoice, TransactionComment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { formatDateMMDDYYYY, calculateDaysRemaining } from '../../utils/dateUtils.js';
import { downloadInvoicePdf } from '../../utils/documentPdfGenerator.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { useSupplierSettings } from '../../services/supplierSettingsService.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Building2, 
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  DollarSign,
  Download,
  Printer,
  Search,
  MessageSquare,
  Send,
  Sparkles,
  X,
  FileText,
  Layers,
  Edit3,
  Save,
  Check,
  Calendar,
  Info,
  CheckCheck,
  Plus,
  Trash2,
  Eye,
  Calculator,
  Paperclip,
  Upload,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

export const BUYER_COMPANY_PRESETS = [
  { id: 'buyer-org-1', name: 'Apex Global Enterprises', billingAddress: 'Apex Global AP Shared Services, PO Box 8802, New York, NY 10001' },
  { id: 'buyer-org-2', name: 'NovaTech Aerospace & Defense', billingAddress: 'NovaTech Aerospace Electronic Invoicing AP Desk, PO Box 3310, Seattle, WA 98101' },
  { id: 'buyer-org-3', name: 'Meridian Health Network', billingAddress: 'Meridian Health Network AP Shared Services, 4200 Medical Center Way, Chicago, IL 60611' }
];

export const DELIVERY_ADDRESS_PRESETS = [
  'Meridian Health Inpatient Intake Dock B, 7800 Technology Blvd, Naperville, IL 60563',
  'Apex Global Logistics Center - Receiving Bay 14, 1020 Logistics Blvd, Austin, TX 78728',
  'NovaTech Space Systems - High Bay receiving, 4000 Space Center Pkwy, Houston, TX 77058',
];

export const SUPPLIER_PRESETS = [
  {
    name: 'CloudBridge Solutions LLC',
    pan: 'AAACB1234F',
    gst: '27AAACB1234F1Z5',
    address: '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
    contacts: [
      { name: 'Elena Rostova', email: 'elena.rostova@cloudbridge.io', phone: '+1 (555) 382-9102' },
      { name: 'Marcus Vance', email: 'marcus.vance@cloudbridge.io', phone: '+1 (555) 819-3301' }
    ]
  },
  {
    name: 'Acme Industrial Tech Inc.',
    pan: 'BCDE5678G',
    gst: '29BCDE5678G1Z2',
    address: '100 Industrial Pkwy, Sector 4, Silicon Valley, CA 94025',
    contacts: [
      { name: 'Robert Tanaka', email: 'r.tanaka@acmetech.com', phone: '+1 (555) 234-5678' }
    ]
  }
];

export const RICH_DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-201-meridian',
    invoiceNumber: 'INV-2026-201',
    poId: 'po-101-meridian',
    poNumber: 'PO-2026-101',
    buyerOrgId: 'buyer-org-3',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    invoiceDate: '2026-11-02T09:00:00Z',
    dueDate: '2026-12-02T17:00:00Z',
    currency: 'USD',
    subtotal: 34560.00,
    taxRate: 0.08,
    taxAmount: 2764.80,
    totalAmount: 37324.80,
    paymentStatus: 'APPROVED_FOR_PAYMENT',
    matchStatus: '3_WAY_MATCHED',
    matchNotes: 'Touchless 3-Way Match Verified: PO-2026-101 vs ASN-2026-088 vs E-Invoice. Zero discrepancy.',
    lineItems: [
      {
        id: 'inli-201-m1',
        poLineItemId: 'poli-101-m1',
        itemNumber: 1,
        description: 'Enterprise Cloud Server Deployment (Bay 14 Rack Infrastructure) - Milestone 1 Deliverable • Infrastructure Provisioned & Verified',
        quantity: 1,
        unitPrice: 28500.00,
        total: 28500.00
      },
      {
        id: 'inli-201-m2',
        poLineItemId: 'poli-101-m2',
        itemNumber: 2,
        description: 'Dedicated Gateway & Firewall Cluster Configuration (HIPAA/SOC2) - Partial Milestone Completed • Gateway Cluster 1 Active',
        quantity: 1,
        unitPrice: 6060.00,
        total: 6060.00
      }
    ],
    remittanceAdvice: {
      paymentReference: 'REM-3WAY-OK-9921',
      settlementDate: '2026-12-02',
      paymentMethod: 'ACH_CREDIT',
      bankTraceNumber: 'TRC-JPMC-4921-9921'
    },
    earlyPaymentOffer: {
      eligible: true,
      standardDueDate: '2026-12-02',
      standardAmount: 37324.80,
      acceleratedDays: 20,
      discountPercent: 1.5,
      discountAmount: 559.87,
      acceleratedPayoutAmount: 36764.93,
      acceleratedDueDate: '2026-11-13',
      status: 'AVAILABLE'
    },
    createdAt: '2026-11-02T09:15:00Z',
    updatedAt: '2026-11-03T11:00:00Z'
  },
  {
    id: 'inv-204',
    invoiceNumber: 'INV-2026-022',
    poId: 'po-101',
    poNumber: 'PO-2026-8891',
    buyerOrgId: 'buyer-org-2',
    companyName: 'Starlight Aerospace & Defense',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    invoiceDate: '2026-11-02T09:00:00Z',
    dueDate: '2026-12-02T17:00:00Z',
    paymentTerms: '2/10 Net 30',
    currency: 'USD',
    subtotal: 28583.33,
    taxRate: 0.08,
    taxAmount: 2286.67,
    totalAmount: 30870.00,
    paymentStatus: 'APPROVED_FOR_PAYMENT',
    matchStatus: '3_WAY_MATCHED',
    matchNotes: 'Touchless 3-Way Match Verified: PO-2026-8891 vs Goods Receipt GR-9011 vs E-Invoice.',
    lineItems: [
      {
        id: 'inli-204-1',
        poLineItemId: 'poli-101-1',
        itemNumber: 1,
        description: 'Enterprise AI Telemetry Streaming Ingestion Node (Dual Redundant)',
        quantity: 1,
        unitPrice: 20000.00,
        total: 20000.00
      },
      {
        id: 'inli-204-2',
        poLineItemId: 'poli-101-2',
        itemNumber: 2,
        description: 'Managed Vector Knowledge Retrieval Hardware & Aerospace Sensor Array',
        quantity: 1,
        unitPrice: 8583.33,
        total: 8583.33
      }
    ],
    earlyPaymentOffer: {
      eligible: true,
      standardDueDate: '2026-12-02',
      standardAmount: 30870.00,
      acceleratedDays: 20,
      discountPercent: 1.5,
      discountAmount: 463.05,
      acceleratedPayoutAmount: 30406.95,
      acceleratedDueDate: '2026-11-13',
      status: 'AVAILABLE'
    },
    createdAt: '2026-11-02T09:15:00Z',
    updatedAt: '2026-11-03T10:00:00Z'
  },
  {
    id: 'inv-205',
    invoiceNumber: 'INV-2026-031',
    poId: 'po-105',
    poNumber: 'PO-2026-9280',
    buyerOrgId: 'buyer-org-3',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    invoiceDate: '2026-10-12T08:00:00Z',
    dueDate: '2026-10-25T17:00:00Z',
    currency: 'USD',
    subtotal: 32000.00,
    taxRate: 0.08,
    taxAmount: 2560.00,
    totalAmount: 34560.00,
    paymentStatus: 'PAID',
    matchStatus: '3_WAY_MATCHED',
    matchNotes: 'Settled via Fedwire Direct Electronic Funds Transfer.',
    lineItems: [
      {
        id: 'inli-205-1',
        poLineItemId: 'poli-105-1',
        itemNumber: 1,
        description: 'S2P Pipeline Integration & Custom Connectors (Engineering Services)',
        quantity: 140,
        unitPrice: 228.57,
        total: 32000.00
      }
    ],
    remittanceAdvice: {
      paymentReference: 'REM-WIRE-449102',
      settlementDate: '2026-10-25',
      paymentMethod: 'WIRE',
      bankTraceNumber: 'TRC-FEDWIRE-104928'
    },
    createdAt: '2026-10-12T08:05:00Z',
    updatedAt: '2026-10-25T10:00:00Z'
  },
  {
    id: 'inv-202',
    invoiceNumber: 'INV-2026-009',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    invoiceDate: '2026-10-19T16:00:00Z',
    dueDate: '2026-11-18T17:00:00Z',
    currency: 'USD',
    subtotal: 24250.00,
    taxRate: 0.08,
    taxAmount: 1940.00,
    totalAmount: 26190.00,
    paymentStatus: 'SCHEDULED',
    matchStatus: '2_WAY_MATCHED',
    matchNotes: '2-Way Matched to Master Agreement #MA-9921. Remittance scheduled via ACH Direct Deposit.',
    lineItems: [
      {
        id: 'inli-202-1',
        itemNumber: 1,
        description: 'S2P Pipeline Modernization Architecture Consulting - Milestone 1',
        quantity: 1,
        unitPrice: 24250.00,
        total: 24250.00
      }
    ],
    remittanceAdvice: {
      paymentReference: 'REM-ACH-889021',
      settlementDate: '2026-10-29',
      paymentMethod: 'ACH_CREDIT',
      bankTraceNumber: 'TRC-JPMC-94821035'
    },
    createdAt: '2026-10-19T16:10:00Z',
    updatedAt: '2026-10-24T11:00:00Z'
  }
];

const DEFAULT_INVOICE_COMMENTS: Record<string, TransactionComment[]> = {
  'INV-2026-201': [
    {
      id: 'comm-inv-201-1',
      entityType: 'INVOICE',
      entityId: 'inv-201-meridian',
      authorId: 'usr-buyer-marcus',
      authorName: 'Marcus Vance (Accounts Payable)',
      authorRole: 'BUYER',
      text: 'Touchless 3-way match cleared with zero variance. Receiving Dock Bay 14 confirmed goods arrival with seal SEC-MER-99410. Payment approved for scheduled release under standard Net 30 terms.',
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
    }
  ]
};

export const SupplierInvoices: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate, routeState, selectedBuyerId, setSelectedBuyerId } = usePortal();

  // Data state
  const [invoices, setInvoices] = useState<Invoice[]>(RICH_DEFAULT_INVOICES);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const actionSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHandledEarlyPayRouteRef = useRef<string | null>(null);

  const showSuccessBanner = (msg: string, durationMs: number = 5000) => {
    if (actionSuccessTimerRef.current) {
      clearTimeout(actionSuccessTimerRef.current);
    }
    setActionSuccess(msg);
    actionSuccessTimerRef.current = setTimeout(() => {
      setActionSuccess(null);
      actionSuccessTimerRef.current = null;
    }, durationMs);
  };

  const dismissSuccessBanner = () => {
    if (actionSuccessTimerRef.current) {
      clearTimeout(actionSuccessTimerRef.current);
      actionSuccessTimerRef.current = null;
    }
    setActionSuccess(null);
  };

  useEffect(() => {
    return () => {
      if (actionSuccessTimerRef.current) {
        clearTimeout(actionSuccessTimerRef.current);
      }
    };
  }, []);

  // View state: 'LIST' or 'DETAIL'
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // PDF Preview Modal
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Inline Global & Line Edit States
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [showAllHeaderFields, setShowAllHeaderFields] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    header?: Record<string, string>;
    lines?: Record<number, Record<string, string>>;
  }>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const [editInvoiceHeader, setEditInvoiceHeader] = useState<{
    companyName: string;
    invoiceNumber: string;
    invoiceName: string;
    invoiceUid: string;
    poNumber: string;
    poName: string;
    invoiceDate: string;
    deliveryDate: string;
    supplierName: string;
    supplierContactName: string;
    supplierContactEmail: string;
    supplierContactPhone: string;
    supplierAddress: string;
    supplierPan: string;
    supplierGst: string;
    deliveryAddress: string;
    billingAddress: string;
    paymentTerms: string;
    attachments: string[];
  }>({
    companyName: 'Meridian Health Network',
    invoiceNumber: 'INV-2026-201',
    invoiceName: 'Enterprise Cloud Server Deployment Milestone 1 & Hardware Intake',
    invoiceUid: 'UID-INV-2026-9021',
    poNumber: 'PO-2026-101',
    poName: 'Enterprise Cloud Compute Node Deployment & Bay 14 Server Rack Expansion',
    invoiceDate: '2026-11-02',
    deliveryDate: '2026-12-02',
    supplierName: 'CloudBridge Solutions LLC',
    supplierContactName: 'Elena Rostova',
    supplierContactEmail: 'elena.rostova@cloudbridge.io',
    supplierContactPhone: '+1 (555) 382-9102',
    supplierAddress: '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
    supplierPan: 'AAACB1234F',
    supplierGst: '27AAACB1234F1Z5',
    deliveryAddress: 'Meridian Health Inpatient Intake Dock B, 7800 Technology Blvd, Naperville, IL 60563',
    billingAddress: 'Meridian Health Shared AP Center, PO Box 9910, Chicago, IL 60601',
    paymentTerms: '2/10 Net 30',
    attachments: ['Commercial-Invoice-INV-2026-201.pdf', 'Milestone-1-Signoff.pdf']
  });

  const [editedLines, setEditedLines] = useState<any[]>([]);
  const { settings } = useSupplierSettings();

  // Create Invoice Modal State (ONLY Invoice Number & Buyer)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInvNum, setCreateInvNum] = useState(`INV-2026-${Math.floor(210 + Math.random() * 800)}`);
  const [createBuyerOrg, setCreateBuyerOrg] = useState('buyer-org-1');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [buyerFilter, setBuyerFilter] = useState<string>('ALL');
  const [matchStatusFilter, setMatchStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('DATE_DESC');

  // Collaboration Drawer
  const [showCollabDrawer, setShowCollabDrawer] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, TransactionComment[]>>(DEFAULT_INVOICE_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [aiDrafting, setAiDrafting] = useState(false);

  // Early Payment Slider State
  const [daysEarly, setDaysEarly] = useState<number>(20);
  const [requestingEarlyPay, setRequestingEarlyPay] = useState(false);
  const [earlyPayInvoice, setEarlyPayInvoice] = useState<Invoice | null>(null);

  // Sync default acceleration days from Treasury Settings when modal opens
  useEffect(() => {
    if (settings?.defaultAccelerationDays) {
      setDaysEarly(settings.defaultAccelerationDays);
    }
  }, [settings?.defaultAccelerationDays]);

  useEffect(() => {
    loadInvoices();
  }, [currentUser]);

  useEffect(() => {
    if (selectedInvoice) {
      const isDraftNew = (selectedInvoice as any).isDraftNew;
      const buyerName = selectedInvoice.companyName || getBuyerDisplayName(selectedInvoice.buyerOrgId);
      const buyerPreset = BUYER_COMPANY_PRESETS.find(b => b.id === selectedInvoice.buyerOrgId);

      if (isDraftNew) {
        setEditInvoiceHeader({
          companyName: buyerName || '',
          invoiceNumber: selectedInvoice.invoiceNumber,
          invoiceName: (selectedInvoice as any).invoiceName || '',
          invoiceUid: (selectedInvoice as any).invoiceUid || `UID-${selectedInvoice.invoiceNumber}`,
          poNumber: selectedInvoice.poNumber || '',
          poName: (selectedInvoice as any).poName || '',
          invoiceDate: selectedInvoice.invoiceDate ? selectedInvoice.invoiceDate.split('T')[0] : new Date().toISOString().split('T')[0],
          deliveryDate: selectedInvoice.dueDate ? selectedInvoice.dueDate.split('T')[0] : '',
          supplierName: selectedInvoice.supplierName || 'CloudBridge Solutions LLC',
          supplierContactName: (selectedInvoice as any).supplierContactName || '',
          supplierContactEmail: (selectedInvoice as any).supplierContactEmail || '',
          supplierContactPhone: (selectedInvoice as any).supplierContactPhone || '',
          supplierAddress: (selectedInvoice as any).supplierAddress || '',
          supplierPan: (selectedInvoice as any).supplierPan || '',
          supplierGst: (selectedInvoice as any).supplierGst || '',
          deliveryAddress: (selectedInvoice as any).deliveryAddress || '',
          billingAddress: (selectedInvoice as any).billingAddress || (buyerPreset?.billingAddress || 'AP Shared Services, PO Box 8802, New York, NY 10001'),
          paymentTerms: (selectedInvoice as any).paymentTerms || '2/10 Net 30',
          attachments: (selectedInvoice as any).attachments && (selectedInvoice as any).attachments.length > 0 ? (selectedInvoice as any).attachments : []
        });

        const lines = (selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0)
          ? selectedInvoice.lineItems.map((l: any, i) => ({
              id: l.id || `inli-${i + 1}`,
              itemNumber: l.itemNumber || (i + 1),
              itemName: (l as any).itemName || l.description || '',
              contract: (l as any).contract || '',
              quantity: l.quantity ?? '',
              uom: (l as any).uom || 'EA',
              unitPrice: l.unitPrice ?? '',
              taxCode: (l as any).taxCode || 'GST-8',
              taxRate: (l as any).taxRate ?? 8,
              total: (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0),
              exchangeRate: (l as any).exchangeRate || 1.0,
              priceInBaseCurrency: (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0),
              costBookingDetails: (l as any).costBookingDetails || ''
            }))
          : [
              {
                id: `inli-${Date.now()}-1`,
                itemNumber: 1,
                itemName: '',
                contract: '',
                quantity: '' as any,
                uom: 'EA',
                unitPrice: '' as any,
                taxCode: 'GST-8',
                taxRate: 8,
                total: 0,
                exchangeRate: 1.0,
                priceInBaseCurrency: 0,
                costBookingDetails: ''
              }
            ];

        setEditedLines(lines);
        setIsEditingGlobal(true);
        setShowAllHeaderFields(true);
        setValidationErrors({});
        setActionError(null);
      } else {
        setEditInvoiceHeader({
          companyName: buyerName || 'Meridian Health Network',
          invoiceNumber: selectedInvoice.invoiceNumber || 'INV-2026-201',
          invoiceName: (selectedInvoice as any).invoiceName || 'Enterprise Cloud Server Deployment Milestone 1 & Hardware Intake',
          invoiceUid: (selectedInvoice as any).invoiceUid || `UID-${selectedInvoice.invoiceNumber || 'INV-2026-201'}`,
          poNumber: selectedInvoice.poNumber || 'PO-2026-101',
          poName: (selectedInvoice as any).poName || 'Enterprise Cloud Compute Node Deployment & Bay 14 Server Rack Expansion',
          invoiceDate: selectedInvoice.invoiceDate ? selectedInvoice.invoiceDate.split('T')[0] : '2026-11-02',
          deliveryDate: selectedInvoice.dueDate ? selectedInvoice.dueDate.split('T')[0] : '2026-12-02',
          supplierName: selectedInvoice.supplierName || 'CloudBridge Solutions LLC',
          supplierContactName: (selectedInvoice as any).supplierContactName || 'Elena Rostova',
          supplierContactEmail: (selectedInvoice as any).supplierContactEmail || 'elena.rostova@cloudbridge.io',
          supplierContactPhone: (selectedInvoice as any).supplierContactPhone || '+1 (555) 382-9102',
          supplierAddress: (selectedInvoice as any).supplierAddress || '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
          supplierPan: (selectedInvoice as any).supplierPan || 'AAACB1234F',
          supplierGst: (selectedInvoice as any).supplierGst || '27AAACB1234F1Z5',
          deliveryAddress: (selectedInvoice as any).deliveryAddress || DELIVERY_ADDRESS_PRESETS[0],
          billingAddress: (selectedInvoice as any).billingAddress || 'Meridian Health Shared AP Center, PO Box 9910, Chicago, IL 60601',
          paymentTerms: (selectedInvoice as any).paymentTerms || '2/10 Net 30',
          attachments: (selectedInvoice as any).attachments || ['Commercial-Invoice-INV-2026-201.pdf', 'Milestone-1-Signoff.pdf']
        });

        const lines = (selectedInvoice.lineItems || []).map((l, i) => ({
          id: l.id || `inli-${i + 1}`,
          itemNumber: l.itemNumber || (i + 1),
          itemName: (l as any).itemName || (l.description ? l.description.split(' - ')[0] : 'Enterprise Cloud Server Deployment'),
          contract: (l as any).contract || 'CNT-2026-CLOUD-01',
          quantity: l.quantity || 1,
          uom: (l as any).uom || 'EA',
          unitPrice: l.unitPrice || 0,
          taxCode: (l as any).taxCode || 'GST-8',
          taxRate: (l as any).taxRate ?? 8,
          total: (l.quantity || 1) * (l.unitPrice || 0),
          exchangeRate: (l as any).exchangeRate || 1.0,
          priceInBaseCurrency: (l.quantity || 1) * (l.unitPrice || 0),
          costBookingDetails: (l as any).costBookingDetails || 'CC-ENG-4910 / WBS-CAPEX-BAY14'
        }));
        setEditedLines(lines);
        setIsEditingGlobal(false);
        setShowAllHeaderFields(false);
        setValidationErrors({});
        setActionError(null);
      }
    }
  }, [selectedInvoice]);

  useEffect(() => {
    if (routeState?.buyerOrgId) {
      setBuyerFilter(routeState.buyerOrgId);
    }
    if (routeState?.flippedPo) {
      const po = routeState.flippedPo;
      const invNum = routeState.invoiceNumber || `INV-2026-${po.poNumber.replace(/[^0-9]/g, '') || Math.floor(210 + Math.random() * 800)}`;
      const existing = invoices.find(i => i.poNumber === po.poNumber || i.invoiceNumber === invNum);
      if (existing) {
        setSelectedInvoice(existing);
      } else {
        const buyerPreset = BUYER_COMPANY_PRESETS.find(b => b.id === po.buyerOrgId);
        const compName = po.companyName || buyerPreset?.name || getBuyerDisplayName(po.buyerOrgId);
        const lines = (po.lineItems || []).map((li: any, idx: number) => {
          const qty = Number(li.quantity) || 1;
          const price = Number(li.unitPrice) || 0;
          const rate = Number(li.taxRate) || 8;
          return {
            id: `inli-flipped-${idx + 1}`,
            itemNumber: idx + 1,
            itemName: li.itemName || li.description || 'Deliverable Item',
            contract: li.contract || 'CNT-2026-CLOUD-01',
            quantity: qty,
            uom: li.uom || 'EA',
            unitPrice: price,
            taxCode: li.taxCode || 'GST-8',
            taxRate: rate,
            total: qty * price,
            exchangeRate: li.exchangeRate || 1.0,
            priceInBaseCurrency: qty * price,
            costBookingDetails: 'CC-ENG-4910 / WBS-CAPEX-BAY14'
          };
        });
        const subtotal = lines.reduce((acc: number, l: any) => acc + l.total, 0);
        const taxAmount = lines.reduce((acc: number, l: any) => acc + (l.total * (l.taxRate / 100)), 0);
        const totalAmount = subtotal + taxAmount;
        const flippedInvoice: Invoice = {
          id: `inv-flipped-${Date.now()}`,
          invoiceNumber: invNum,
          invoiceName: po.poName ? `Commercial Invoice: ${po.poName}` : `Commercial Invoice for ${po.poNumber}`,
          invoiceUid: `UID-${invNum}`,
          poNumber: po.poNumber,
          poName: po.poName || '',
          buyerOrgId: po.buyerOrgId,
          companyName: compName,
          supplierOrgId: po.supplierOrgId || 'supp-org-1',
          supplierName: po.supplierName || 'CloudBridge Solutions LLC',
          supplierContactName: po.supplierContactName || 'Elena Rostova',
          supplierContactEmail: po.supplierContactEmail || 'elena.rostova@cloudbridge.io',
          supplierContactPhone: po.supplierContactPhone || '+1 (555) 382-9102',
          supplierAddress: po.supplierAddress || '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
          supplierPan: po.supplierPan || 'AAACB1234F',
          supplierGst: po.supplierGst || '27AAACB1234F1Z5',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: po.deliveryDate || po.promisedDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          currency: po.currency || 'USD',
          subtotal: subtotal || po.subtotal || 0,
          taxRate: 0.08,
          taxAmount: taxAmount || po.taxAmount || 0,
          totalAmount: totalAmount || po.totalAmount || 0,
          paymentStatus: 'APPROVED_FOR_PAYMENT',
          matchStatus: '3_WAY_MATCHED',
          matchNotes: `Touchless 3-Way Match Verified against ${po.poNumber}. Zero line variance detected.`,
          deliveryAddress: po.shippingAddress || po.deliveryAddress || DELIVERY_ADDRESS_PRESETS[0],
          billingAddress: po.billingAddress || (buyerPreset?.billingAddress || 'AP Shared Services, PO Box 8802, New York, NY 10001'),
          paymentTerms: po.paymentTerms || '2/10 Net 30',
          attachments: po.attachments && po.attachments.length > 0 ? po.attachments : ['Commercial-Invoice.pdf'],
          lineItems: lines,
          remittanceAdvice: {
            paymentReference: `REM-3WAY-${Math.floor(1000 + Math.random() * 9000)}`,
            settlementDate: po.deliveryDate || '2026-12-02',
            paymentMethod: 'ACH_CREDIT',
            bankTraceNumber: `TRC-JPMC-4921-${Math.floor(1000 + Math.random() * 9000)}`
          },
          createdAt: new Date().toISOString()
        };
        setInvoices(prev => [flippedInvoice, ...prev]);
        setSelectedInvoice(flippedInvoice);
        showSuccessBanner(`1-Click PO Flip Successful! Commercial Invoice ${invNum} generated from ${po.poNumber} with 100% 3-Way Match.`, 5000);
      }
    } else if (routeState?.openCreateModal) {
      if (routeState?.invoiceNumber) setCreateInvNum(routeState.invoiceNumber);
      setShowCreateModal(true);
    } else if (routeState?.earlyPay) {
      const targetNum = routeState.invoiceNumber;
      const target = targetNum ? (invoices.find(i => i.invoiceNumber === targetNum) || RICH_DEFAULT_INVOICES.find(i => i.invoiceNumber === targetNum)) : null;
      const eligible = target || invoices.find(i => i.earlyPaymentOffer?.eligible && i.paymentStatus !== 'PAID') || invoices.find(i => i.earlyPaymentOffer?.eligible);
      if (eligible) {
        setSelectedInvoice(eligible);
        const navToken = `${eligible.id}-${routeState.timestamp || targetNum || 'early'}`;
        if (
          eligible.paymentStatus !== 'PAID' &&
          eligible.earlyPaymentOffer?.status !== 'SETTLED' &&
          hasHandledEarlyPayRouteRef.current !== navToken
        ) {
          hasHandledEarlyPayRouteRef.current = navToken;
          setEarlyPayInvoice(eligible);
        }
      }
    } else if (routeState?.invoiceNumber || routeState?.invoiceId) {
      const targetNum = routeState.invoiceNumber;
      const targetId = routeState.invoiceId;
      const matched = invoices.find(i => i.invoiceNumber === targetNum || i.id === targetId) ||
                      RICH_DEFAULT_INVOICES.find(i => i.invoiceNumber === targetNum || i.id === targetId);
      if (matched) {
        setSelectedInvoice(matched);
        if (routeState.openCollab || routeState.openMessages) {
          setShowCollabDrawer(true);
        } else {
          setShowCollabDrawer(false);
        }
      } else if (routeState.openCollab || routeState.openMessages) {
        if (!selectedInvoice && invoices.length > 0) {
          setSelectedInvoice(invoices[0]);
        }
        setShowCollabDrawer(true);
      } else {
        setShowCollabDrawer(false);
      }
    } else if (routeState?.poNumber) {
      const matched = invoices.find(i => i.poNumber === routeState.poNumber) ||
                      RICH_DEFAULT_INVOICES.find(i => i.poNumber === routeState.poNumber);
      if (matched) {
        setSelectedInvoice(matched);
        if (routeState.openCollab || routeState.openMessages) {
          setShowCollabDrawer(true);
        } else {
          setShowCollabDrawer(false);
        }
      } else if (routeState.openCollab || routeState.openMessages) {
        if (!selectedInvoice && invoices.length > 0) {
          setSelectedInvoice(invoices[0]);
        }
        setShowCollabDrawer(true);
      } else {
        setShowCollabDrawer(false);
      }
    } else if (routeState?.openCollab || routeState?.openMessages) {
      if (!selectedInvoice && invoices.length > 0) {
        setSelectedInvoice(invoices[0]);
      }
      setShowCollabDrawer(true);
    } else if (routeState) {
      setShowCollabDrawer(false);
    } else {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const invParam = params.get('inv') || params.get('id') || params.get('invoiceNumber');
        const openCollabParam = params.get('collab') === 'true' || params.get('messages') === 'true';
        if (invParam) {
          const matched = invoices.find(i => i.invoiceNumber === invParam || i.id === invParam);
          if (matched) {
            setSelectedInvoice(matched);
            if (openCollabParam) setShowCollabDrawer(true);
          }
        }
      }
    }
  }, [routeState, invoices]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getInvoices();
      if (res && res.invoices && res.invoices.length > 0) {
        const merged = [...RICH_DEFAULT_INVOICES];
        res.invoices.forEach((i: Invoice) => {
          if (!merged.some(m => m.invoiceNumber === i.invoiceNumber)) {
            merged.push(i);
          }
        });
        setInvoices(merged);
      }
    } catch (err) {
      console.warn('Using default invoices:', err);
      setInvoices(RICH_DEFAULT_INVOICES);
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderFieldChange = (field: keyof typeof editInvoiceHeader, value: any) => {
    setEditInvoiceHeader(prev => ({
      ...prev,
      [field]: value
    }));
    if (validationErrors.header?.[field as string]) {
      setValidationErrors(prev => ({
        ...prev,
        header: {
          ...prev.header,
          [field as string]: ''
        }
      }));
    }
  };

  const handleSupplierChange = (suppName: string) => {
    const found = SUPPLIER_PRESETS.find(s => s.name === suppName);
    if (found) {
      setEditInvoiceHeader(prev => ({
        ...prev,
        supplierName: suppName,
        supplierPan: found.pan,
        supplierGst: found.gst,
        supplierAddress: found.address,
        supplierContactName: found.contacts[0]?.name || '',
        supplierContactEmail: found.contacts[0]?.email || '',
        supplierContactPhone: found.contacts[0]?.phone || ''
      }));
    } else {
      setEditInvoiceHeader(prev => ({
        ...prev,
        supplierName: suppName
      }));
    }
  };

  const handleContactChange = (contactName: string) => {
    const supp = SUPPLIER_PRESETS.find(s => s.name === editInvoiceHeader.supplierName);
    const contact = supp?.contacts.find(c => c.name === contactName);
    if (contact) {
      setEditInvoiceHeader(prev => ({
        ...prev,
        supplierContactName: contact.name,
        supplierContactEmail: contact.email,
        supplierContactPhone: contact.phone
      }));
    } else {
      setEditInvoiceHeader(prev => ({
        ...prev,
        supplierContactName: contactName
      }));
    }
  };

  const handleGlobalFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newNames = Array.from(files).map(f => f.name);
    setEditInvoiceHeader(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newNames]
    }));
    if (validationErrors.header?.attachments) {
      setValidationErrors(prev => ({
        ...prev,
        header: { ...prev.header, attachments: '' }
      }));
    }
  };

  const handleRemoveGlobalAttachment = (idx: number) => {
    setEditInvoiceHeader(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateLine = (index: number, field: string, value: any) => {
    setEditedLines(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = (field === 'quantity' ? value : item.quantity);
        const p = (field === 'unitPrice' ? value : item.unitPrice);
        const qtyNum = q === '' ? 0 : Number(q);
        const priceNum = p === '' ? 0 : Number(p);
        item.total = qtyNum * priceNum;
        item.priceInBaseCurrency = item.total * (item.exchangeRate || 1.0);
      }
      if (field === 'exchangeRate') {
        item.priceInBaseCurrency = (item.total || 0) * (Number(value) || 1.0);
      }
      if (field === 'taxCode') {
        if (value === 'GST-18') item.taxRate = 18;
        else if (value === 'GST-8') item.taxRate = 8;
        else if (value === 'GST-5') item.taxRate = 5;
        else if (value === 'SALES-TAX-8.25') item.taxRate = 8.25;
        else if (value === 'TAX-EXEMPT') item.taxRate = 0;
      }
      updated[index] = item;
      return updated;
    });

    if (validationErrors.lines?.[index]?.[field]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        if (copy.lines && copy.lines[index]) {
          delete copy.lines[index][field];
          if (Object.keys(copy.lines[index]).length === 0) delete copy.lines[index];
        }
        return copy;
      });
    }
  };

  const handleAddLine = () => {
    const newItem = {
      id: `inli-new-${Date.now()}`,
      itemNumber: editedLines.length + 1,
      itemName: '',
      contract: '',
      quantity: '' as any,
      uom: 'EA',
      unitPrice: '' as any,
      taxCode: 'GST-8',
      taxRate: 8,
      total: 0,
      exchangeRate: 1.0,
      priceInBaseCurrency: 0,
      costBookingDetails: ''
    };
    setEditedLines(prev => [...prev, newItem]);
  };

  const handleRemoveLine = (index: number) => {
    if (editedLines.length <= 1) return;
    setEditedLines(prev => prev.filter((_, i) => i !== index));
  };

  const liveNetTotal = editedLines.reduce((acc, l) => {
    const q = (l.quantity as any) === '' ? 0 : (Number(l.quantity) || 0);
    const p = (l.unitPrice as any) === '' ? 0 : (Number(l.unitPrice) || 0);
    return acc + (q * p);
  }, 0);
  const liveTotalTax = editedLines.reduce((acc, l) => {
    const q = (l.quantity as any) === '' ? 0 : (Number(l.quantity) || 0);
    const p = (l.unitPrice as any) === '' ? 0 : (Number(l.unitPrice) || 0);
    const lineTotal = q * p;
    const rate = Number(l.taxRate) || 0;
    return acc + (lineTotal * (rate / 100));
  }, 0);
  const liveGrossTotal = liveNetTotal + liveTotalTax;

  // Handle actions dispatched by Ava Copilot to mutate page in real time
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'VIEW_INVOICE' || action.action === 'SELECT_INVOICE') {
        const invNum = action.payload.invoiceNumber || action.payload.id;
        const target = invoices.find(i => i.invoiceNumber === invNum || i.id === invNum);
        if (target) {
          setSelectedInvoice(target);
          if (action.payload.editMode) setIsEditingGlobal(true);
          showSuccessBanner(`Ava opened Invoice ${target.invoiceNumber}`, 3500);
        }
      } else if (action.action === 'CLOSE_INVOICE_DETAIL') {
        setSelectedInvoice(null);
        setIsEditingGlobal(false);
        showSuccessBanner('Ava returned to invoices list', 3000);
      } else if (action.action === 'DELETE_INVOICE') {
        const invNum = action.payload.invoiceNumber || selectedInvoice?.invoiceNumber;
        if (invNum) {
          setInvoices(prev => prev.filter(i => i.invoiceNumber !== invNum));
          if (selectedInvoice?.invoiceNumber === invNum) {
            setSelectedInvoice(null);
          }
          showSuccessBanner(`Ava deleted Invoice ${invNum}`, 3500);
        }
      } else if (action.action === 'UPDATE_INVOICE_FIELD') {
        const { field, value, invoiceNumber } = action.payload;
        if (invoiceNumber && (!selectedInvoice || selectedInvoice.invoiceNumber !== invoiceNumber)) {
          setInvoices(prev => prev.map(i => i.invoiceNumber === invoiceNumber ? ({ ...i, [field]: value }) : i));
        }
        setIsEditingGlobal(true);
        setEditInvoiceHeader(prev => ({ ...prev, [field]: value }));
        if (selectedInvoice) {
          setSelectedInvoice(prev => prev ? ({ ...prev, [field]: value }) : null);
        }
        showSuccessBanner(`Ava updated invoice ${field} to "${value}"`, 3500);
      } else if (action.action === 'ACCEPT_EARLY_PAYMENT') {
        showSuccessBanner('💰 Early Liquidity Acceleration Activated: $51,594.30 USD scheduled for direct Nacha transfer.', 5000);
      } else if (action.action === 'SET_PAGE_FILTER') {
        const { searchQuery: sq, buyerFilter: bf, matchStatusFilter: mf } = action.payload;
        if (sq !== undefined) setSearchQuery(sq);
        if (bf !== undefined) setBuyerFilter(bf);
        if (mf !== undefined) setMatchStatusFilter(mf);
        showSuccessBanner('Ava updated invoice filters', 3000);
      } else if (action.action === 'CREATE_INVOICE') {
        if (action.payload.invoiceNumber) setCreateInvNum(action.payload.invoiceNumber);
        setShowCreateModal(true);
      } else if (action.action === 'SAVE_INVOICE' || action.action === 'SAVE_PO') {
        handleSaveGlobalDetails();
      }
    });

    return cleanup;
  }, [selectedInvoice, editInvoiceHeader, invoices]);

  // Broadcast live Invoices context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'invoices',
      activeMode: selectedInvoice ? (isEditingGlobal ? 'EDIT' : 'DETAIL') : 'LIST',
      selectedInvoiceNumber: selectedInvoice?.invoiceNumber,
      selectedPoNumber: selectedInvoice?.poNumber,
      paymentTerms: editInvoiceHeader.paymentTerms,
      status: selectedInvoice?.paymentStatus || 'APPROVED_FOR_PAYMENT',
      header: editInvoiceHeader,
      lines: editedLines,
      lineCount: editedLines.length,
      netTotal: liveNetTotal,
      taxTotal: liveTotalTax,
      grossTotal: liveGrossTotal,
      availableEarlyCash: 51594.30,
      searchQuery,
      buyerFilter,
      matchStatusFilter,
      paymentStatusFilter,
      invoices: invoices.map(i => ({
        invoiceNumber: i.invoiceNumber,
        poNumber: i.poNumber,
        companyName: i.companyName,
        invoiceDate: i.invoiceDate,
        dueDate: i.dueDate,
        totalAmount: i.totalAmount,
        currency: i.currency,
        matchStatus: i.matchStatus,
        paymentStatus: i.paymentStatus,
        lineCount: i.lineItems ? i.lineItems.length : 0
      }))
    });
  }, [selectedInvoice, isEditingGlobal, editInvoiceHeader, editedLines, liveNetTotal, liveTotalTax, liveGrossTotal, searchQuery, buyerFilter, matchStatusFilter, paymentStatusFilter, invoices]);

  const validateInvoice = () => {
    const headerErrors: Record<string, string> = {};
    if (!editInvoiceHeader.companyName.trim()) headerErrors.companyName = 'Company name is required';
    if (!editInvoiceHeader.invoiceNumber.trim()) headerErrors.invoiceNumber = 'Invoice number is required';
    if (!editInvoiceHeader.invoiceName.trim()) headerErrors.invoiceName = 'Invoice name is required';
    if (!editInvoiceHeader.invoiceUid.trim()) headerErrors.invoiceUid = 'Invoice UID is required';
    if (!editInvoiceHeader.poNumber.trim()) headerErrors.poNumber = 'PO number is required';
    if (!editInvoiceHeader.poName.trim()) headerErrors.poName = 'PO name is required';
    if (!editInvoiceHeader.invoiceDate.trim()) headerErrors.invoiceDate = 'Invoice date is required';
    if (!editInvoiceHeader.deliveryDate.trim()) headerErrors.deliveryDate = 'Delivery date is required';
    if (!editInvoiceHeader.supplierName.trim()) headerErrors.supplierName = 'Supplier name is required';
    if (!editInvoiceHeader.supplierContactName.trim()) headerErrors.supplierContactName = 'Supplier contact is required';
    if (!editInvoiceHeader.supplierContactEmail.trim()) headerErrors.supplierContactEmail = 'Supplier email is required';
    if (!editInvoiceHeader.supplierContactPhone.trim()) headerErrors.supplierContactPhone = 'Supplier phone is required';
    if (!editInvoiceHeader.supplierAddress.trim()) headerErrors.supplierAddress = 'Supplier address is required';
    if (!editInvoiceHeader.supplierPan.trim()) headerErrors.supplierPan = 'Supplier PAN is required';
    if (!editInvoiceHeader.supplierGst.trim()) headerErrors.supplierGst = 'Supplier GST is required';
    if (!editInvoiceHeader.deliveryAddress.trim()) headerErrors.deliveryAddress = 'Delivery address is required';
    if (!editInvoiceHeader.attachments || editInvoiceHeader.attachments.length === 0) {
      headerErrors.attachments = 'At least 1 invoice document attachment is required';
    }

    const lineErrors: Record<number, Record<string, string>> = {};
    editedLines.forEach((line, idx) => {
      const errs: Record<string, string> = {};
      if (!line.itemName?.trim()) errs.itemName = 'Required';
      if ((line.quantity as any) === '' || line.quantity === undefined || Number(line.quantity) <= 0) errs.quantity = 'Invalid';
      if ((line.unitPrice as any) === '' || line.unitPrice === undefined || Number(line.unitPrice) <= 0) errs.unitPrice = 'Invalid';
      if (!line.uom?.trim()) errs.uom = 'Required';
      if (!line.taxCode?.trim()) errs.taxCode = 'Required';
      if (!line.costBookingDetails?.trim()) errs.costBookingDetails = 'Required';
      if (Object.keys(errs).length > 0) lineErrors[idx] = errs;
    });

    const hasErrors = Object.keys(headerErrors).length > 0 || Object.keys(lineErrors).length > 0;
    setValidationErrors({ header: headerErrors, lines: lineErrors });
    return !hasErrors;
  };

  const handleSaveGlobalDetails = () => {
    if (!selectedInvoice) return;
    if (!validateInvoice()) {
      setActionError('Please fill in all mandatory Invoice Header and Line fields highlighted in red.');
      setTimeout(() => setActionError(null), 6000);
      return;
    }

    const newPaymentStatus = selectedInvoice.paymentStatus === 'DRAFT' ? 'APPROVED_FOR_PAYMENT' : selectedInvoice.paymentStatus;
    const newMatchStatus = selectedInvoice.matchStatus === 'PENDING' ? '3_WAY_MATCHED' : selectedInvoice.matchStatus;

    const updated: Invoice = {
      ...selectedInvoice,
      paymentStatus: newPaymentStatus,
      matchStatus: newMatchStatus,
      invoiceNumber: editInvoiceHeader.invoiceNumber,
      poNumber: editInvoiceHeader.poNumber,
      supplierName: editInvoiceHeader.supplierName,
      invoiceDate: `${editInvoiceHeader.invoiceDate}T09:00:00Z`,
      dueDate: `${editInvoiceHeader.deliveryDate}T17:00:00Z`,
      subtotal: liveNetTotal,
      taxAmount: liveTotalTax,
      totalAmount: liveGrossTotal,
      lineItems: editedLines.map(l => ({
        id: l.id,
        itemNumber: l.itemNumber,
        description: l.contract ? `${l.itemName} (Contract: ${l.contract})` : l.itemName,
        quantity: Number(l.quantity) || 1,
        unitPrice: Number(l.unitPrice) || 0,
        total: (Number(l.quantity) || 1) * (Number(l.unitPrice) || 0)
      })),
      remittanceAdvice: {
        ...(selectedInvoice.remittanceAdvice || {
          paymentMethod: 'ACH_CREDIT',
          settlementDate: '2026-12-02',
          bankTraceNumber: 'TRC-JPMC-4921-9921'
        }),
        paymentReference: editInvoiceHeader.paymentTerms || 'REM-3WAY-OK-9921',
        bankTraceNumber: selectedInvoice.remittanceAdvice?.bankTraceNumber || 'TRC-JPMC-4921-9921'
      }
    };
    delete (updated as any).isDraftNew;
    setSelectedInvoice(updated);
    setInvoices(prev => prev.map(i => i.id === selectedInvoice.id ? updated : i));
    setIsEditingGlobal(false);
    setActionError(null);
    showSuccessBanner(selectedInvoice.paymentStatus === 'DRAFT'
      ? `Commercial Invoice ${editInvoiceHeader.invoiceNumber} saved and submitted for 3-way match payment!`
      : `Commercial Invoice ${editInvoiceHeader.invoiceNumber} details and line items successfully saved.`, 5000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invNum = createInvNum.trim() || `INV-2026-${Math.floor(210 + Math.random() * 800)}`;
    const buyerPreset = BUYER_COMPANY_PRESETS.find(b => b.id === createBuyerOrg);
    const compName = buyerPreset?.name || getBuyerDisplayName(createBuyerOrg);

    const blankInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      invoiceName: '',
      invoiceUid: `UID-${invNum}`,
      poNumber: '',
      poName: '',
      buyerOrgId: createBuyerOrg,
      companyName: compName,
      supplierOrgId: 'supp-org-1',
      supplierName: 'CloudBridge Solutions LLC',
      supplierContactName: '',
      supplierContactEmail: '',
      supplierContactPhone: '',
      supplierAddress: '',
      supplierPan: '',
      supplierGst: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      currency: 'USD',
      subtotal: 0,
      taxRate: 0.08,
      taxAmount: 0,
      totalAmount: 0,
      paymentStatus: 'DRAFT',
      matchStatus: 'PENDING',
      matchNotes: 'Newly initialized commercial invoice awaiting line item submission.',
      deliveryAddress: '',
      billingAddress: buyerPreset?.billingAddress || 'AP Shared Services, PO Box 8802, New York, NY 10001',
      paymentTerms: '2/10 Net 30',
      attachments: [],
      lineItems: [
        {
          id: `inli-${Date.now()}-1`,
          itemNumber: 1,
          itemName: '',
          contract: '',
          quantity: '' as any,
          uom: 'EA',
          unitPrice: '' as any,
          taxCode: 'GST-8',
          taxRate: 8,
          total: 0,
          exchangeRate: 1.0,
          priceInBaseCurrency: 0,
          costBookingDetails: ''
        } as any
      ],
      createdAt: new Date().toISOString()
    };
    (blankInvoice as any).isDraftNew = true;

    setInvoices(prev => [blankInvoice, ...prev]);
    setSelectedInvoice(blankInvoice);
    navigate('/invoices', { invoiceNumber: blankInvoice.invoiceNumber });
    setShowCreateModal(false);
    showSuccessBanner(`Commercial Invoice ${invNum} initialized. Fill in header specifications and line item deliverables.`, 5000);
  };

  const handleAcceptEarlyPayment = async (invId: string) => {
    // 1. Immediately close modal & mark route handled
    setEarlyPayInvoice(null);
    hasHandledEarlyPayRouteRef.current = 'dismissed';

    setRequestingEarlyPay(true);
    const targetInvoice = invoices.find(i => i.id === invId) || (selectedInvoice?.id === invId ? selectedInvoice : null);
    const grossAmount = targetInvoice ? getInvoiceGrossTotal(targetInvoice) : 30870;
    const discountPct = Number(((daysEarly / 20) * 1.5).toFixed(2));
    const discountAmt = Number((grossAmount * (discountPct / 100)).toFixed(2));
    const netPayout = Number((grossAmount - discountAmt).toFixed(2));
    const netFormatted = `$${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Clear earlyPay flag from router navigation state immediately
    if (targetInvoice?.invoiceNumber) {
      navigate('/invoices', { invoiceNumber: targetInvoice.invoiceNumber, earlyPay: false });
    }

    try {
      await ApiClient.acceptEarlyPayment(invId, {
        discountPercent: discountPct,
        daysEarly
      });
      showSuccessBanner(`Early Settlement confirmed! ${netFormatted} accelerated payout queued for execution via Fedwire.`, 5000);
      setInvoices(prev => prev.map(inv => inv.id === invId ? { 
        ...inv, 
        paymentStatus: 'PAID',
        earlyPaymentOffer: inv.earlyPaymentOffer ? { ...inv.earlyPaymentOffer, status: 'SETTLED' } : undefined
      } : inv));
      if (selectedInvoice?.id === invId) {
        setSelectedInvoice(prev => prev ? { 
          ...prev, 
          paymentStatus: 'PAID',
          earlyPaymentOffer: prev.earlyPaymentOffer ? { ...prev.earlyPaymentOffer, status: 'SETTLED' } : undefined
        } : null);
      }
    } catch (err) {
      showSuccessBanner(`Early Settlement confirmed! ${netFormatted} accelerated payout queued for execution via Fedwire.`, 5000);
      setInvoices(prev => prev.map(inv => inv.id === invId ? { 
        ...inv, 
        paymentStatus: 'PAID',
        earlyPaymentOffer: inv.earlyPaymentOffer ? { ...inv.earlyPaymentOffer, status: 'SETTLED' } : undefined
      } : inv));
      if (selectedInvoice?.id === invId) {
        setSelectedInvoice(prev => prev ? { 
          ...prev, 
          paymentStatus: 'PAID',
          earlyPaymentOffer: prev.earlyPaymentOffer ? { ...prev.earlyPaymentOffer, status: 'SETTLED' } : undefined
        } : null);
      }
    } finally {
      setRequestingEarlyPay(false);
      setEarlyPayInvoice(null);
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !newCommentText.trim()) return;
    const newMsg: TransactionComment = {
      id: `comm-${Date.now()}`,
      entityType: 'INVOICE',
      entityId: selectedInvoice.id,
      authorId: currentUser?.id || 'usr-current',
      authorName: currentUser?.name || 'Elena Rostova (CloudBridge / Acme)',
      authorRole: 'SUPPLIER',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    setCommentsMap(prev => ({
      ...prev,
      [selectedInvoice.invoiceNumber]: [...(prev[selectedInvoice.invoiceNumber] || []), newMsg]
    }));
    setNewCommentText('');
  };

  const handleAiDraftComment = () => {
    if (!selectedInvoice) return;
    setAiDrafting(true);
    setTimeout(() => {
      setNewCommentText(`Confirming banking remittance details: JPMorgan Chase (account ending 4921). Zero line variance matched against PO ${selectedInvoice.poNumber || 'PO-2026-101'}.`);
      setAiDrafting(false);
    }, 400);
  };

  const getBuyerDisplayName = (buyerOrgId?: string) => {
    if (buyerOrgId === 'buyer-org-3') return 'Meridian Health Network';
    if (buyerOrgId === 'buyer-org-2') return 'NovaTech Aerospace & Defense';
    if (buyerOrgId === 'buyer-org-1') return 'Apex Global Enterprises';
    return 'Enterprise Client';
  };

  const getBuyerBadgeInitials = (buyerOrgId?: string) => {
    if (buyerOrgId === 'buyer-org-3') return 'ME';
    if (buyerOrgId === 'buyer-org-2') return 'NO';
    if (buyerOrgId === 'buyer-org-1') return 'AP';
    return 'EC';
  };

  const getBuyerErpId = (buyerOrgId?: string) => {
    if (buyerOrgId === 'buyer-org-3') return 'VEND-7701';
    if (buyerOrgId === 'buyer-org-2') return 'VEND-3304';
    if (buyerOrgId === 'buyer-org-1') return 'VEND-8821';
    return 'VEND-9900';
  };

  const getBuyerTerms = (buyerOrgId?: string) => {
    if (buyerOrgId === 'buyer-org-3') return 'Net 30 Days';
    if (buyerOrgId === 'buyer-org-2') return 'Net 45 Standard';
    if (buyerOrgId === 'buyer-org-1') return '2/10 Net 30';
    return 'Net 30';
  };

  const getInvoiceGrossTotal = (inv: Invoice): number => {
    if (!inv) return 0;
    // If taxAmount is positive and totalAmount equals subtotal, add tax to reflect full gross invoice value
    if (inv.subtotal && typeof inv.taxAmount === 'number' && inv.taxAmount > 0) {
      if (!inv.totalAmount || Math.abs(inv.totalAmount - inv.subtotal) < 0.01) {
        return Number((inv.subtotal + inv.taxAmount).toFixed(2));
      }
    }
    if (typeof inv.totalAmount === 'number' && inv.totalAmount > 0) {
      return inv.totalAmount;
    }
    if (inv.subtotal) {
      return Number((inv.subtotal + (inv.taxAmount || 0)).toFixed(2));
    }
    return 0;
  };

  const scopedInvoices = buyerFilter === 'ALL' ? invoices : invoices.filter(i => i.buyerOrgId === buyerFilter);
  const totalInvoicedVal = scopedInvoices.reduce((sum, i) => sum + getInvoiceGrossTotal(i), 0);
  const threeWayMatchedCount = scopedInvoices.filter(i => i.matchStatus === '3_WAY_MATCHED').length;
  const pendingClearanceCount = scopedInvoices.filter(i => i.paymentStatus === 'SCHEDULED' || i.paymentStatus === 'UNDER_REVIEW' || i.paymentStatus === 'APPROVED_FOR_PAYMENT').length;
  const earlyPayEligibleVal = scopedInvoices.filter(i => i.earlyPaymentOffer?.eligible && i.paymentStatus !== 'PAID').reduce((sum, i) => sum + getInvoiceGrossTotal(i), 0);
  const paidVal = scopedInvoices.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + getInvoiceGrossTotal(i), 0);

  const filteredInvoices = invoices.filter(inv => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchPo = inv.poNumber?.toLowerCase().includes(q);
      const matchBuyer = getBuyerDisplayName(inv.buyerOrgId).toLowerCase().includes(q);
      const matchItems = inv.lineItems?.some(li => li.description.toLowerCase().includes(q));
      if (!matchNum && !matchPo && !matchBuyer && !matchItems) return false;
    }
    if (buyerFilter !== 'ALL' && inv.buyerOrgId !== buyerFilter) return false;
    if (matchStatusFilter !== 'ALL' && inv.matchStatus !== matchStatusFilter) return false;
    if (paymentStatusFilter !== 'ALL' && inv.paymentStatus !== paymentStatusFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'DATE_DESC') return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    if (sortBy === 'DATE_ASC') return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
    if (sortBy === 'AMOUNT_DESC') return getInvoiceGrossTotal(b) - getInvoiceGrossTotal(a);
    if (sortBy === 'AMOUNT_ASC') return getInvoiceGrossTotal(a) - getInvoiceGrossTotal(b);
    return 0;
  });

  const getMatchBadge = (matchStatus?: string) => {
    switch (matchStatus) {
      case '3_WAY_MATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            100% 3-Way Matched
          </span>
        );
      case '2_WAY_MATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            2-Way Matched
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Discrepancy Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            Pending Match
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Draft (Unsaved)
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Settled & Paid
          </span>
        );
      case 'APPROVED_FOR_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Check className="w-3 h-3 text-teal-600" />
            Approved for Payment
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Scheduled for Release
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            {status || 'Submitted'}
          </span>
        );
    }
  };

  // Close and clean up early payment modal
  const handleCloseEarlyPayModal = () => {
    setEarlyPayInvoice(null);
    hasHandledEarlyPayRouteRef.current = 'dismissed';
    if (earlyPayInvoice?.invoiceNumber) {
      navigate('/invoices', { invoiceNumber: earlyPayInvoice.invoiceNumber, earlyPay: false });
    }
  };

  // Modal: Interactive Early Payment Cashout Settlement (Universal for Detail & List views)
  const renderEarlyPayModal = () => {
    if (!earlyPayInvoice) return null;

    const grossAmount = getInvoiceGrossTotal(earlyPayInvoice);
    const discountPct = Number(((daysEarly / 20) * 1.5).toFixed(2));
    const discountAmt = Number((grossAmount * (discountPct / 100)).toFixed(2));
    const netPayout = Number((grossAmount - discountAmt).toFixed(2));
    const buyerDisplay = earlyPayInvoice.companyName || getBuyerDisplayName(earlyPayInvoice.buyerOrgId);

    // Calculate effective target settlement date based on days accelerated from due date
    const baselineDueDate = new Date(earlyPayInvoice.dueDate);
    const targetTimestamp = baselineDueDate.getTime() - (daysEarly * 24 * 60 * 60 * 1000);
    const nowTimestamp = Date.now();
    const effectivePayoutDate = targetTimestamp > nowTimestamp 
      ? new Date(targetTimestamp) 
      : new Date(nowTimestamp + (24 * 60 * 60 * 1000));

    // Dynamic slider fill percentage (min 5, max 30)
    const sliderFillPct = Math.min(100, Math.max(0, ((daysEarly - 5) / 25) * 100));

    return (
      <div 
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={handleCloseEarlyPayModal}
      >
        <div 
          className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200/90 shadow-2xl animate-in fade-in zoom-in-95"
          onClick={e => e.stopPropagation()}
        >
          {/* Header (Unified Icon, Title & Invoice Reference) */}
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center font-bold shrink-0">
                <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Accelerate Early Payment</h3>
                <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-bold text-slate-800">{earlyPayInvoice.invoiceNumber}</span>
                  <span>•</span>
                  <span className="truncate">{buyerDisplay}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseEarlyPayModal}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer shrink-0 ml-2"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Smart Interactive Acceleration Slider with Precision Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Accelerate payout by:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{daysEarly} days early</span>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                    -{discountPct}% fee
                  </span>
                  {daysEarly === (settings?.defaultAccelerationDays || 20) && (
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded-md">
                      Target
                    </span>
                  )}
                  {discountPct > (settings?.maxDiscountTolerance || 2.0) && (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                      <span>Exceeds {settings?.maxDiscountTolerance || 2.0}% Policy Cap</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Slider Grid Track */}
              <div className="relative pt-1">
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={daysEarly}
                  onChange={(e) => setDaysEarly(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${sliderFillPct}%, #e2e8f0 ${sliderFillPct}%, #e2e8f0 100%)`
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-2 rounded-full appearance-none transition-all focus:outline-none relative z-10"
                />

                {/* Minimal Precision Grid Ruler (5d, 10d, 15d, 20d, 25d, 30d) */}
                <div className="flex justify-between items-center px-1 pt-1.5 select-none">
                  {[5, 10, 15, 20, 25, 30].map((step) => {
                    const isSelected = daysEarly === step;
                    const isPast = daysEarly >= step;
                    const isTarget = step === (settings?.defaultAccelerationDays || 20);
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setDaysEarly(step)}
                        className="flex flex-col items-center cursor-pointer group focus:outline-none py-0.5"
                        title={`Snap to ${step} days early`}
                      >
                        <span className={`w-0.5 h-1.5 rounded-full transition-colors ${
                          isSelected 
                            ? 'bg-amber-600 h-2' 
                            : isPast 
                              ? 'bg-amber-400' 
                              : 'bg-slate-300 group-hover:bg-slate-400'
                        }`} />
                        <span className={`text-[10px] mt-1 font-mono transition-colors ${
                          isSelected 
                            ? 'font-bold text-amber-900 scale-105' 
                            : isTarget 
                              ? 'font-bold text-slate-700' 
                              : 'text-slate-400 group-hover:text-slate-600'
                        }`}>
                          {step}d{isTarget ? '•' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Streamlined Settlement Summary Card */}
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Invoice Total</span>
                  <span className="font-mono font-bold text-slate-900">${grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>Early Payment Discount ({discountPct}%)</span>
                  <span className="font-mono font-semibold">-${discountAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/80 pt-2 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Immediate Payout</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 leading-tight">
                    ${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[11px] font-sans text-slate-500 font-medium">USD</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Payout</div>
                  <div className="text-xs font-semibold text-slate-800 font-mono mt-0.5">
                    {formatDateMMDDYYYY(effectivePayoutDate.toISOString())}
                  </div>
                </div>
              </div>
            </div>

            {/* Depository 1-Liner (Connected to Verified Banking Vault & Settings) */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Direct deposit to <strong>{settings?.preferredLiquidityBank || 'Silicon Valley Bank (SVB) ••••4492'}</strong></span>
              </span>
              <span className="font-semibold text-teal-700 bg-teal-50 border border-teal-200/70 px-1.5 py-0.2 rounded text-[10px] shrink-0">
                Same-Day Fedwire
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={handleCloseEarlyPayModal}
              className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-medium text-xs rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={requestingEarlyPay}
              onClick={async () => {
                const targetId = earlyPayInvoice.id;
                const targetInv = earlyPayInvoice;
                // 1. Immediately close modal so it disappears instantly
                setEarlyPayInvoice(null);
                hasHandledEarlyPayRouteRef.current = 'dismissed';
                if (targetInv.invoiceNumber) {
                  navigate('/invoices', { invoiceNumber: targetInv.invoiceNumber, earlyPay: false });
                }
                // 2. Process early payout and show success banner
                await handleAcceptEarlyPayment(targetId);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>
                {requestingEarlyPay 
                  ? 'Processing...' 
                  : `Confirm Payout ($${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // VIEW: INVOICE DETAIL VIEW (Dual Mode: Interactive Workspace & Official PDF)
  // =========================================================================
  if (selectedInvoice) {
    const isMeridianPDF = selectedInvoice.invoiceNumber === 'INV-2026-201';
    const comments = commentsMap[selectedInvoice.invoiceNumber] || [];
    const discountAmt = (selectedInvoice.totalAmount * 0.015);
    const acceleratedPayout = selectedInvoice.totalAmount - discountAmt;
    const currentLines = isEditingGlobal ? editedLines : (selectedInvoice.lineItems || []);
    const currentTotal = isEditingGlobal ? currentLines.reduce((acc, l) => acc + (Number(l.total) || 0), 0) : selectedInvoice.totalAmount;

    return (
      <div className="space-y-4 pb-16">
        {/* Top Control Bar / Navigation */}
        <div className="bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
          {/* Left: Return button, Breadcrumb & Status Badges */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setSelectedInvoice(null);
                navigate('/invoices', {});
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition cursor-pointer shrink-0"
              title="Return to Invoices directory"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
              <span>Invoices</span>
            </button>
            
            <span className="text-slate-300 select-none">/</span>
            
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md">
              {selectedInvoice.invoiceNumber}
            </span>

            <span className="text-xs font-medium text-slate-500 truncate max-w-[160px] hidden md:inline">
              • {getBuyerDisplayName(selectedInvoice.buyerOrgId)}
            </span>

            <div className="shrink-0 flex items-center gap-1.5">
              {getPaymentStatusBadge(selectedInvoice.paymentStatus)}
              {selectedInvoice.paymentStatus !== 'DRAFT' && getMatchBadge(selectedInvoice.matchStatus)}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
            {/* View Linked PO Button */}
            {selectedInvoice.poNumber && (
              <button
                onClick={() => navigate('/orders', { poNumber: selectedInvoice.poNumber })}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title="View original Purchase Order specification"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedInvoice.poNumber.startsWith('PO') ? selectedInvoice.poNumber : `PO-${selectedInvoice.poNumber}`}</span>
              </button>
            )}

            {/* Edit Mode Controls */}
            {isEditingGlobal ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleSaveGlobalDetails}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditingGlobal(false);
                    setValidationErrors({});
                    setActionError(null);
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                  title="Cancel editing without saving"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingGlobal(true)}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title="Edit invoice coordinates, payment terms, or line items"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
            )}

            {/* Early Payment Offer Button */}
            {settings.earlyPaymentHighlighting && selectedInvoice.earlyPaymentOffer?.eligible && selectedInvoice.paymentStatus !== 'PAID' && (
              <button
                type="button"
                onClick={() => setEarlyPayInvoice(selectedInvoice)}
                className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 active:scale-95"
                title="Early Settlement Offer Available"
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                <span>Early Pay</span>
              </button>
            )}

            {/* AP Collaboration Drawer Toggle */}
            <button
              onClick={() => setShowCollabDrawer(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showCollabDrawer 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
              <span>AP Thread</span>
              {comments.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showCollabDrawer ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  {comments.length}
                </span>
              )}
            </button>

            {/* Preview PDF Eye Button */}
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Preview Official Commercial Invoice PDF"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={() => downloadInvoicePdf(selectedInvoice, getBuyerDisplayName(selectedInvoice.buyerOrgId))}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Export official Invoice PDF document"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200/90 p-3 rounded-xl shadow-xs flex items-center justify-between text-xs animate-in fade-in transition-all">
            <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button 
              onClick={dismissSuccessBanner} 
              className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer p-0.5 rounded hover:bg-emerald-100/70 transition shrink-0 ml-2"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Validation Error Alert Banner */}
        {actionError && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl shadow-xs flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center space-x-2.5 text-rose-900 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-800 font-bold cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Layout Grid: Invoice Canvas & Collaboration Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className={`${showCollabDrawer ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-200 space-y-4`}>
            
            {/* =========================================================================
                ENTERPRISE DETAIL WORKSPACE
                ========================================================================= */}
            <div className="space-y-4">
              {/* =========================================================================
                  TIER 1: INVOICE DETAILS (SINGLE UNIFIED ENTERPRISE GRID)
                  ========================================================================= */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                {/* Minimal Header Bar */}
                <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Invoice Details</h2>
                    {isEditingGlobal && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Editing
                      </span>
                    )}
                  </div>
                  <div className="shrink-0">
                    {getMatchBadge(selectedInvoice.matchStatus)}
                  </div>
                </div>

                {/* Grid for all Header Fields - Uniform 4-Column Matrix */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                    {/* 1. Invoice Number */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Invoice Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editInvoiceHeader.invoiceNumber}
                          onChange={e => handleHeaderFieldChange('invoiceNumber', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.invoiceNumber
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.invoiceNumber && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.invoiceNumber}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Invoice Number
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                          {editInvoiceHeader.invoiceNumber}
                        </div>
                      </div>
                    )}

                    {/* 2. Invoice Name */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Invoice Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editInvoiceHeader.invoiceName}
                          onChange={e => handleHeaderFieldChange('invoiceName', e.target.value)}
                          placeholder="Enter invoice title / scope..."
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.invoiceName
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.invoiceName && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.invoiceName}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Invoice Name
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editInvoiceHeader.invoiceName}>
                          {editInvoiceHeader.invoiceName}
                        </div>
                      </div>
                    )}

                    {/* 3. Invoice UID */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Invoice UID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editInvoiceHeader.invoiceUid}
                          onChange={e => handleHeaderFieldChange('invoiceUid', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-slate-100/80 border rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.invoiceUid
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.invoiceUid && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.invoiceUid}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Invoice UID
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 flex items-center truncate">
                          {editInvoiceHeader.invoiceUid}
                        </div>
                      </div>
                    )}

                    {/* 4. Company Name */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editInvoiceHeader.companyName}
                          onChange={e => handleHeaderFieldChange('companyName', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.companyName
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        >
                          <option value="">-- Select Buyer Company --</option>
                          {BUYER_COMPANY_PRESETS.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                        {validationErrors.header?.companyName && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.companyName}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Company Name
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                          {editInvoiceHeader.companyName}
                        </div>
                      </div>
                    )}

                    {/* 5. PO Number */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          PO Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editInvoiceHeader.poNumber}
                          onChange={e => handleHeaderFieldChange('poNumber', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.poNumber
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.poNumber && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.poNumber}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          PO Number
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                          {editInvoiceHeader.poNumber}
                        </div>
                      </div>
                    )}

                    {/* 6. PO Name */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          PO Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editInvoiceHeader.poName}
                          onChange={e => handleHeaderFieldChange('poName', e.target.value)}
                          placeholder="e.g. Enterprise Cloud Compute Deployment"
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.poName
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.poName && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.poName}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          PO Name
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editInvoiceHeader.poName}>
                          {editInvoiceHeader.poName}
                        </div>
                      </div>
                    )}

                    {/* 7. Invoice Date */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Invoice Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={editInvoiceHeader.invoiceDate}
                          onChange={e => handleHeaderFieldChange('invoiceDate', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.invoiceDate
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.invoiceDate && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.invoiceDate}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Invoice Date
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                          {formatDateMMDDYYYY(editInvoiceHeader.invoiceDate)}
                        </div>
                      </div>
                    )}

                    {/* 8. Delivery Date */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Delivery Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={editInvoiceHeader.deliveryDate}
                          onChange={e => handleHeaderFieldChange('deliveryDate', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.deliveryDate
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.deliveryDate && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.deliveryDate}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Delivery Date
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between truncate">
                          <span>{formatDateMMDDYYYY(editInvoiceHeader.deliveryDate)}</span>
                          {editInvoiceHeader.deliveryDate && (
                            <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200/60 px-1.5 py-0.2 rounded font-sans shrink-0">
                              {(() => {
                                const daysLeft = calculateDaysRemaining(editInvoiceHeader.deliveryDate);
                                return daysLeft.days > 0 ? `${daysLeft.days}d left` : daysLeft.text;
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 9. Supplier Name */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editInvoiceHeader.supplierName}
                          onChange={e => handleSupplierChange(e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.supplierName
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        >
                          <option value="">-- Select Supplier --</option>
                          {SUPPLIER_PRESETS.map(s => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                        {validationErrors.header?.supplierName && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.supplierName}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier Name
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                          {editInvoiceHeader.supplierName}
                        </div>
                      </div>
                    )}

                    {/* 10. Supplier Contact Name */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier Contact <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editInvoiceHeader.supplierContactName}
                          onChange={e => handleContactChange(e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.supplierContactName
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        >
                          <option value="">-- Select Contact --</option>
                          {(SUPPLIER_PRESETS.find(s => s.name === editInvoiceHeader.supplierName)?.contacts || [{ name: editInvoiceHeader.supplierContactName }]).map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        {validationErrors.header?.supplierContactName && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.supplierContactName}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier Contact
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                          {editInvoiceHeader.supplierContactName}
                        </div>
                      </div>
                    )}

                    {/* 11. Supplier Contact Email ID */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={editInvoiceHeader.supplierContactEmail}
                          onChange={e => handleHeaderFieldChange('supplierContactEmail', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.supplierContactEmail
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.supplierContactEmail && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.supplierContactEmail}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier Email
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 flex items-center truncate">
                          {editInvoiceHeader.supplierContactEmail}
                        </div>
                      </div>
                    )}

                    {/* 12. Supplier Contact Phone No */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editInvoiceHeader.supplierContactPhone}
                          onChange={e => handleHeaderFieldChange('supplierContactPhone', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.supplierContactPhone
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.supplierContactPhone && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.supplierContactPhone}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier Phone
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 flex items-center truncate">
                          {editInvoiceHeader.supplierContactPhone}
                        </div>
                      </div>
                    )}

                    {/* In Edit Mode: Smart Button to View More Fields within the grid */}
                    {isEditingGlobal && !showAllHeaderFields && (
                      <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAllHeaderFields(true)}
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View & Edit More Fields (+7 Secondary Fields)</span>
                        </button>
                      </div>
                    )}

                    {/* Secondary 7 Fields: Shown continuously in View Mode, and toggled in Edit Mode */}
                    {(!isEditingGlobal || showAllHeaderFields) && (
                      <>
                        {/* 13. Supplier Address */}
                        {isEditingGlobal ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Supplier Address <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editInvoiceHeader.supplierAddress}
                              onChange={e => handleHeaderFieldChange('supplierAddress', e.target.value)}
                              className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                                validationErrors.header?.supplierAddress
                                  ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                                  : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                              }`}
                            />
                            {validationErrors.header?.supplierAddress && (
                              <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.supplierAddress}</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Supplier Address
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editInvoiceHeader.supplierAddress}>
                              {editInvoiceHeader.supplierAddress}
                            </div>
                          </div>
                        )}

                        {/* 14. Supplier PAN */}
                        {isEditingGlobal ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Supplier PAN <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editInvoiceHeader.supplierPan}
                              onChange={e => handleHeaderFieldChange('supplierPan', e.target.value)}
                              className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                                validationErrors.header?.supplierPan
                                  ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                                  : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                              }`}
                            />
                            {validationErrors.header?.supplierPan && (
                              <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.supplierPan}</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Supplier PAN
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                              {editInvoiceHeader.supplierPan}
                            </div>
                          </div>
                        )}

                        {/* 15. Supplier GST */}
                        {isEditingGlobal ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Supplier GST <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editInvoiceHeader.supplierGst}
                              onChange={e => handleHeaderFieldChange('supplierGst', e.target.value)}
                              className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                                validationErrors.header?.supplierGst
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                              }`}
                            />
                            {validationErrors.header?.supplierGst && (
                              <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.supplierGst}</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Supplier GST
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                              {editInvoiceHeader.supplierGst}
                            </div>
                          </div>
                        )}

                        {/* 16. Delivery Address */}
                        {isEditingGlobal ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Delivery Address <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={editInvoiceHeader.deliveryAddress}
                              onChange={e => handleHeaderFieldChange('deliveryAddress', e.target.value)}
                              className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs truncate ${
                                validationErrors.header?.deliveryAddress
                                  ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                                  : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                              }`}
                            >
                              <option value="">-- Select Delivery Facility --</option>
                              {DELIVERY_ADDRESS_PRESETS.map((addr, idx) => (
                                <option key={idx} value={addr}>{addr}</option>
                              ))}
                            </select>
                            {validationErrors.header?.deliveryAddress && (
                              <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.deliveryAddress}</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Delivery Address
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editInvoiceHeader.deliveryAddress}>
                              {editInvoiceHeader.deliveryAddress}
                            </div>
                          </div>
                        )}

                        {/* 17. Buyer Billing Address */}
                        {isEditingGlobal ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Buyer Billing Address
                            </label>
                            <input
                              type="text"
                              value={editInvoiceHeader.billingAddress}
                              onChange={e => handleHeaderFieldChange('billingAddress', e.target.value)}
                              className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Buyer Billing Address
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editInvoiceHeader.billingAddress}>
                              {editInvoiceHeader.billingAddress}
                            </div>
                          </div>
                        )}

                        {/* 18. Payment Term */}
                        {isEditingGlobal ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Payment Term
                            </label>
                            <select
                              value={editInvoiceHeader.paymentTerms}
                              onChange={e => handleHeaderFieldChange('paymentTerms', e.target.value)}
                              className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                            >
                              <option value="2/10 Net 30">2/10 Net 30</option>
                              <option value="Net 30 Days">Net 30 Days</option>
                              <option value="Net 45 Standard">Net 45 Standard</option>
                              <option value="Net 60 Days">Net 60 Days</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Payment Term
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center truncate">
                              {editInvoiceHeader.paymentTerms}
                            </div>
                          </div>
                        )}

                        {/* 19. Attachments (Spans 2 columns; Upload strictly in Edit Mode) */}
                        {isEditingGlobal ? (
                          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-slate-700">
                                Attachments <span className="text-red-500">*</span>
                              </label>
                              <label
                                htmlFor="global-inv-attachment-file"
                                className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                                title="Upload single or multiple invoice document files"
                              >
                                <Upload className="w-2.5 h-2.5" />
                                <span>Upload Documents</span>
                              </label>
                              <input
                                id="global-inv-attachment-file"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={e => handleGlobalFileUpload(e.target.files)}
                              />
                            </div>
                            <div className={`p-1.5 bg-white border rounded-lg text-xs min-h-[32px] flex flex-wrap items-center gap-1.5 transition ${
                              validationErrors.header?.attachments 
                                ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' 
                                : 'border-slate-300'
                            }`}>
                              {(editInvoiceHeader.attachments && editInvoiceHeader.attachments.length > 0 ? editInvoiceHeader.attachments : []).map((file, fIdx) => (
                                <span key={fIdx} className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                                  <Paperclip className="w-2.5 h-2.5 text-slate-400" />
                                  <span className="truncate max-w-[120px]" title={file}>{file}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGlobalAttachment(fIdx)}
                                    className="text-slate-400 hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                                    title="Remove document"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                              {(!editInvoiceHeader.attachments || editInvoiceHeader.attachments.length === 0) && (
                                <span className="text-[11px] text-slate-400 italic">No files attached. Upload at least 1 document to fulfill mandatory requirement.</span>
                              )}
                            </div>
                            {validationErrors.header?.attachments && (
                              <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.attachments}</span>
                            )}
                          </div>
                        ) : (
                          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Attachments
                            </label>
                            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs min-h-[32px] flex flex-wrap items-center gap-1.5">
                              {editInvoiceHeader.attachments && editInvoiceHeader.attachments.length > 0 ? (
                                editInvoiceHeader.attachments.map((file, fIdx) => (
                                  <span key={fIdx} className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                                    <Paperclip className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[140px]" title={file}>{file}</span>
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No files attached</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* In Edit Mode: Smart Button to Collapse within the grid */}
                        {isEditingGlobal && showAllHeaderFields && (
                          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAllHeaderFields(false)}
                              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                              <span>Show Less (12 Primary Fields)</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  TIER 2: LINE ITEMS (EDITABLE)
                  ========================================================================= */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Line Items
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      {editedLines.length} Item{editedLines.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {isEditingGlobal && (
                    <button
                      onClick={handleAddLine}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[1400px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3 min-w-[200px]">LINE ITEM NAME</th>
                        <th className="py-2.5 px-3 min-w-[150px]">CONTRACT</th>
                        <th className="py-2.5 px-3 text-center w-20">QTY</th>
                        <th className="py-2.5 px-3 text-center w-20">UOM</th>
                        <th className="py-2.5 px-3 text-right w-28">UNIT PRICE</th>
                        <th className="py-2.5 px-3 text-center w-28">TAX CODE</th>
                        <th className="py-2.5 px-3 text-center w-20">TAX RATE</th>
                        <th className="py-2.5 px-3 text-right w-28">TOTAL PRICE</th>
                        <th className="py-2.5 px-3 text-right w-24">EXCHANGE RATE</th>
                        <th className="py-2.5 px-3 text-right w-28">BASE CURRENCY</th>
                        <th className="py-2.5 px-3 min-w-[180px]">COST BOOKING DETAILS</th>
                        {isEditingGlobal && <th className="py-2.5 px-3 text-center w-14">ACTION</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {editedLines.map((item, idx) => {
                        const qty = (item.quantity as any) === '' ? 0 : (Number(item.quantity) || 0);
                        const unitPrice = (item.unitPrice as any) === '' ? 0 : (Number(item.unitPrice) || 0);
                        const lineTot = qty * unitPrice;
                        const basePrice = lineTot * (Number(item.exchangeRate) || 1.0);

                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
                            {/* 1. Line Item ID */}
                            <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold text-xs">
                              {String(idx + 1).padStart(2, '0')}
                            </td>

                            {/* 2. Line Item Name */}
                            <td className="py-3 px-3">
                              {isEditingGlobal ? (
                                <div>
                                  <input
                                    type="text"
                                    value={item.itemName || ''}
                                    onChange={e => handleUpdateLine(idx, 'itemName', e.target.value)}
                                    placeholder="Enter item name..."
                                    className={`w-full h-8 px-2 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs ${
                                      validationErrors.lines?.[idx]?.itemName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    }`}
                                  />
                                  {validationErrors.lines?.[idx]?.itemName && (
                                    <span className="text-[9px] text-rose-600 font-bold block mt-0.5 leading-none">Required</span>
                                  )}
                                </div>
                              ) : (
                                <div className="font-semibold text-slate-900 text-xs">
                                  {item.itemName || 'Enterprise Deliverable Milestone'}
                                </div>
                              )}
                            </td>

                            {/* 3. Contract */}
                            <td className="py-3 px-3">
                              {isEditingGlobal ? (
                                <input
                                  type="text"
                                  value={item.contract || ''}
                                  onChange={e => handleUpdateLine(idx, 'contract', e.target.value)}
                                  placeholder="e.g. CNT-2026-01"
                                  className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                                />
                              ) : (
                                <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {item.contract || 'None'}
                                </span>
                              )}
                            </td>

                            {/* 4. Quantity */}
                            <td className="py-3 px-3 text-center">
                              {isEditingGlobal ? (
                                <div>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={e => handleUpdateLine(idx, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                                    className={`w-16 h-8 text-center bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs ${
                                      validationErrors.lines?.[idx]?.quantity ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    }`}
                                  />
                                  {validationErrors.lines?.[idx]?.quantity && (
                                    <span className="text-[9px] text-rose-600 font-bold block mt-0.5 leading-none">Required</span>
                                  )}
                                </div>
                              ) : (
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  {qty}
                                </span>
                              )}
                            </td>

                            {/* 5. UoM */}
                            <td className="py-3 px-3 text-center">
                              {isEditingGlobal ? (
                                <div>
                                  <input
                                    type="text"
                                    value={item.uom || ''}
                                    onChange={e => handleUpdateLine(idx, 'uom', e.target.value)}
                                    placeholder="EA"
                                    className={`w-14 h-8 text-center bg-white border rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs ${
                                      validationErrors.lines?.[idx]?.uom ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    }`}
                                  />
                                  {validationErrors.lines?.[idx]?.uom && (
                                    <span className="text-[9px] text-rose-600 font-bold block mt-0.5 leading-none">Required</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600 font-medium text-xs">
                                  {item.uom || 'EA'}
                                </span>
                              )}
                            </td>

                            {/* 6. Unit Price */}
                            <td className="py-3 px-3 text-right">
                              {isEditingGlobal ? (
                                <div>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={item.unitPrice}
                                    onChange={e => handleUpdateLine(idx, 'unitPrice', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                    className={`w-24 h-8 text-right px-2 bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs ${
                                      validationErrors.lines?.[idx]?.unitPrice ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    }`}
                                  />
                                  {validationErrors.lines?.[idx]?.unitPrice && (
                                    <span className="text-[9px] text-rose-600 font-bold block mt-0.5 leading-none">Required</span>
                                  )}
                                </div>
                              ) : (
                                <span className="font-mono text-slate-800 text-xs font-semibold">
                                  ${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>

                            {/* 7. Tax Code */}
                            <td className="py-3 px-3 text-center">
                              {isEditingGlobal ? (
                                <select
                                  value={item.taxCode || 'GST-8'}
                                  onChange={e => handleUpdateLine(idx, 'taxCode', e.target.value)}
                                  className="h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                                >
                                  <option value="GST-18">GST-18</option>
                                  <option value="GST-8">GST-8</option>
                                  <option value="GST-5">GST-5</option>
                                  <option value="SALES-TAX-8.25">SALES-8.25</option>
                                  <option value="TAX-EXEMPT">EXEMPT-0</option>
                                </select>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-semibold border border-slate-200">
                                  {item.taxCode || 'GST-8'}
                                </span>
                              )}
                            </td>

                            {/* 8. Tax Rate */}
                            <td className="py-3 px-3 text-center">
                              {isEditingGlobal ? (
                                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800">
                                  {item.taxRate ?? 8}%
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                                  {item.taxRate ?? 8}%
                                </span>
                              )}
                            </td>

                            {/* 9. Total Price */}
                            <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-xs">
                              ${lineTot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* 10. Exchange Rate */}
                            <td className="py-3 px-3 text-right">
                              {isEditingGlobal ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.exchangeRate ?? 1.0}
                                  onChange={e => handleUpdateLine(idx, 'exchangeRate', parseFloat(e.target.value) || 1.0)}
                                  className="w-16 h-8 text-right px-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                                />
                              ) : (
                                <span className="font-mono text-xs text-slate-600">
                                  {(item.exchangeRate ?? 1.0).toFixed(2)}
                                </span>
                              )}
                            </td>

                            {/* 11. Price in Base Currency */}
                            <td className="py-3 px-3 text-right">
                              <div className="font-mono text-slate-700 text-xs font-semibold">
                                ${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">USD Base</div>
                            </td>

                            {/* 12. Cost Booking Details */}
                            <td className="py-3 px-3">
                              {isEditingGlobal ? (
                                <div>
                                  <input
                                    type="text"
                                    value={item.costBookingDetails || ''}
                                    onChange={e => handleUpdateLine(idx, 'costBookingDetails', e.target.value)}
                                    placeholder="e.g. CC-ENG-4910 / WBS-CAPEX"
                                    className={`w-full h-8 px-2 bg-white border rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs ${
                                      validationErrors.lines?.[idx]?.costBookingDetails ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                    }`}
                                  />
                                  {validationErrors.lines?.[idx]?.costBookingDetails && (
                                    <span className="text-[9px] text-rose-600 font-bold block mt-0.5 leading-none">Required</span>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs font-mono text-slate-700 truncate max-w-[200px]" title={item.costBookingDetails}>
                                  {item.costBookingDetails || 'CC-ENG-4910 / WBS-CAPEX-BAY14'}
                                </div>
                              )}
                            </td>

                            {/* 13. Actions */}
                            {isEditingGlobal && (
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLine(idx)}
                                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer mx-auto"
                                  title="Remove line item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =========================================================================
                  TIER 3: INVOICE SUMMARY (VERTICAL CALCULATION)
                  ========================================================================= */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5 text-slate-500" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Invoice Summary
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-end">
                    {/* Right: Vertical Calculation Card */}
                    <div className="w-full sm:w-80 md:w-96 bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 text-xs space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Subtotal (Net Total)</span>
                        <span className="font-mono font-bold text-slate-900">
                          ${liveNetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Total Tax</span>
                        <span className="font-mono font-bold text-slate-900">
                          ${liveTotalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900">Total Invoice Value</span>
                          <span className="text-[10px] font-semibold text-slate-500">(Gross Total USD)</span>
                        </div>
                        <div className="text-base font-mono font-black text-emerald-700">
                          ${liveGrossTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Split Tab: AP Collaboration Thread */}
          {showCollabDrawer && (
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    AP Invoicing Collaboration
                  </span>
                </div>
                <button
                  onClick={() => setShowCollabDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-slate-500 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Inquiries are transmitted directly to buyer AP shared services and anchored to <span className="font-bold text-slate-800">{selectedInvoice.invoiceNumber}</span>.
              </div>

              {/* Message Feed */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No active inquiries or payment notices on this invoice.
                  </div>
                ) : (
                  comments.map(msg => (
                    <div 
                      key={msg.id}
                      className={`p-3 rounded-xl border ${
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
              <form onSubmit={handleSendComment} className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reply as Supplier</span>
                  <button
                    type="button"
                    onClick={handleAiDraftComment}
                    disabled={aiDrafting}
                    className="text-[10px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-teal-500" />
                    <span>{aiDrafting ? 'Drafting...' : 'AI Auto-Draft'}</span>
                  </button>
                </div>
                <textarea
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="Inquire on remittance schedule, tax codes, or remittance trace..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send AP Inquiry</span>
                </button>
              </form>
            </div>
          )}
        </div>
        {/* Modal: Official Commercial Invoice PDF Spec Preview */}
        {showPdfModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
              {/* Modal Top Action Bar */}
              <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm tracking-tight font-mono">{selectedInvoice.invoiceNumber}</span>
                      <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">PDF Spec</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Official High-Fidelity Commercial Invoice Document</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadInvoicePdf(selectedInvoice, getBuyerDisplayName(selectedInvoice.buyerOrgId))}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export Commercial Invoice PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    title="Print Document or Save as PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-300" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setShowPdfModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Close Preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Content - Official Invoice PDF Canvas */}
              <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/60">
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 sm:p-10 text-slate-800 font-sans max-w-3xl mx-auto">
                  {/* Header: Supplier Letterhead (Left) vs Commercial Invoice Title (Right) */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {selectedInvoice.supplierName || 'CloudBridge Solutions LLC'}
                      </h1>
                      <div className="text-xs font-bold text-teal-700 tracking-wider mt-0.5">
                        Enterprise Cloud Infrastructure & Security Services
                      </div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                        100 Innovation Parkway, Suite 450<br />
                        San Jose, CA 95134 • billing@cloudbridge.com<br />
                        Tax ID (EIN): XX-XXX7701
                      </div>
                    </div>

                    <div className="sm:text-right flex flex-col sm:items-end">
                      <div className="text-2xl sm:text-3xl font-black tracking-tight text-teal-800 uppercase">
                        COMMERCIAL INVOICE
                      </div>
                      <div className="text-sm font-semibold text-slate-700 mt-1">
                        Invoice #: <span className="font-bold text-slate-900 font-mono">{selectedInvoice.invoiceNumber}</span>
                      </div>
                      <div className="mt-2">
                        {getMatchBadge(selectedInvoice.matchStatus)}
                      </div>
                    </div>
                  </div>

                  {/* 5-Box Key Metadata Grid */}
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">INVOICE DATE</div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        {isMeridianPDF ? 'Nov 02, 2026' : formatDateMMDDYYYY(selectedInvoice.invoiceDate)}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DUE DATE</div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        {isMeridianPDF ? 'Dec 02, 2026' : formatDateMMDDYYYY(selectedInvoice.dueDate)}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PO REFERENCE</div>
                      <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
                        {selectedInvoice.poNumber || 'PO-2026-101'}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT TERMS</div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        Net 30 Days
                      </div>
                    </div>
                    <div className="p-3 col-span-2 sm:col-span-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VENDOR ERP ID</div>
                      <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
                        VEND-7701
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Entity Cards: BILLED TO vs DELIVERY / SERVICE SITE */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 bg-white">
                      <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>BILLED TO (CLIENT)</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active Buyer</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {isMeridianPDF ? 'Meridian Health Network' : getBuyerDisplayName(selectedInvoice.buyerOrgId)}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Accounts Payable Department<br />
                        4200 Medical Center Way, Suite 800<br />
                        Chicago, IL 60611<br />
                        <span className="text-slate-500 font-medium">Contact:</span> Sarah Chen (Lead Procurement)
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-white">
                      <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>DELIVERY / SERVICE SITE</span>
                        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Verified & Signed Off</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        Meridian Data Center — Bay 14
                      </div>
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                        7800 Technology Boulevard, Dock B<br />
                        Naperville, IL 60563<br />
                        <span className="text-slate-500 font-medium">ASN Confirmation:</span> <span className="font-mono font-bold text-slate-800">ASN-2026-088</span><br />
                        <span className="text-slate-500 font-medium">Acceptance Status:</span> <span className="text-emerald-700 font-semibold">Verified & Signed Off</span>
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table with Dark Navy Header */}
                  <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0f172a] text-white font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-3 w-10 text-center">#</th>
                          <th className="py-3 px-4">ITEM / SERVICE DESCRIPTION</th>
                          <th className="py-3 px-3 text-center w-16">QTY</th>
                          <th className="py-3 px-3 text-center w-16">UOM</th>
                          <th className="py-3 px-4 text-right w-28">UNIT PRICE</th>
                          <th className="py-3 px-4 text-right w-32">TOTAL (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {currentLines.length > 0 ? (
                          currentLines.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50/80 transition">
                              <td className="py-3.5 px-3 text-center text-slate-400 font-mono font-medium">
                                {String(idx + 1).padStart(2, '0')}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900 font-mono text-[11px] text-teal-900">
                                  {item.description.includes(' - ') ? item.description.split(' - ')[0] : item.description}
                                </div>
                                <div className="text-slate-700 text-xs mt-0.5 leading-snug">
                                  {item.description.includes(' - ') ? item.description.split(' - ')[1] : 'Matched Line Delivery'}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                                {item.quantity}
                              </td>
                              <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                                EA
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                                ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                                ${(item.total || item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-slate-400">
                              No itemized lines registered on this invoice specification.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Section: Payment Remittance Details (Left) vs Financial Summary (Right) */}
                  <div className="mt-6 pt-2 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                    <div className="sm:col-span-7 bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs">
                      <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                        Remittance & Electronic Payment Instructions
                      </div>
                      <div className="space-y-1.5 text-slate-600 leading-relaxed">
                        <div><span className="font-semibold text-slate-800">Bank Name:</span> JPMorgan Chase Commercial Banking</div>
                        <div><span className="font-semibold text-slate-800">Beneficiary:</span> CloudBridge Solutions LLC</div>
                        <div><span className="font-semibold text-slate-800">Routing (ABA / Fedwire):</span> 122000496</div>
                        <div><span className="font-semibold text-slate-800">Operating Account:</span> ••••••••4921</div>
                        <div className="text-[11px] text-slate-500 pt-1">
                          Please include invoice number <span className="font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span> on ACH/Wire addenda records.
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-5 border border-slate-200 rounded-xl p-4 bg-white text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Invoiced Subtotal</span>
                        <span className="font-mono font-semibold text-slate-800">
                          ${(selectedInvoice.subtotal || liveNetTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Total Tax (GST / Taxes)</span>
                        <span className="font-mono text-slate-600">
                          ${(selectedInvoice.taxAmount || liveTotalTax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Credits / Retainage</span>
                        <span className="font-mono text-slate-600">$0.00</span>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-950">
                          <span className="font-black text-xs uppercase tracking-tight">Total Invoice Value (USD)</span>
                          <span className="font-mono font-black text-base text-teal-950">
                            ${getInvoiceGrossTotal(selectedInvoice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Running Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>CloudBridge Solutions LLC • Invoice {selectedInvoice.invoiceNumber} (Ref {selectedInvoice.poNumber || 'PO-2026-101'})</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Interactive Early Payment Cashout Settlement */}
        {renderEarlyPayModal()}
      </div>
    );
  }

  // =========================================================================
  // VIEW: INVOICES LIST VIEW (Compact Unified Header, Minimal 4-KPIs, Clean Table)
  // =========================================================================
  return (
    <div className="space-y-4 pb-16">
      {/* Top Banner (Minimal, Balanced, Clean) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Title, Badge & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <Receipt className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">Commercial Invoices</h1>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Track electronic billing status, 3-way matching, and payments.
            </p>
          </div>
        </div>

        {/* Right: Actions Only */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["Invoice #,Buyer,PO Ref,Date,Due Date,Total Invoice Value,Match Status,Payment Status", ...invoices.map(i => `${i.invoiceNumber},"${getBuyerDisplayName(i.buyerOrgId)}",${i.poNumber || ''},${i.invoiceDate},${i.dueDate},${getInvoiceGrossTotal(i)},${i.matchStatus},${i.paymentStatus}`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `Verisource_Commercial_Invoices_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Export filtered invoices to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setCreateInvNum(`INV-2026-${Math.floor(210 + Math.random() * 800)}`);
              setShowCreateModal(true);
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Create a new commercial invoice"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Action Alert Banner */}
      {actionSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl shadow-xs flex items-center justify-between text-xs animate-in fade-in transition-all">
          <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button 
            onClick={dismissSuccessBanner} 
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer p-0.5 rounded hover:bg-emerald-100/70 transition shrink-0 ml-2"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Minimal 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* KPI 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Invoiced</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            ${totalInvoicedVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-teal-700 font-medium truncate transition">
              {buyerFilter === 'ALL'
                ? `${invoices.length} active invoices`
                : `${scopedInvoices.length} invoices (${getBuyerDisplayName(buyerFilter)})`}
            </span>
            <Sparkline data={[54000, 61000, 68000, 75000, 84000, totalInvoicedVal || 94384]} color="#0d9488" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">3-Way Matched</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {threeWayMatchedCount} <span className="text-xs font-normal text-slate-500 font-sans">Invoices</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-emerald-700 group-hover:text-emerald-800 font-medium truncate transition">
              Zero variance vs PO &amp; ASN
            </span>
            <Sparkline data={[88, 92, 94, 96, 98, 100]} color="#10b981" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Clearance</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {pendingClearanceCount} <span className="text-xs font-normal text-slate-500 font-sans">In Review</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-amber-700 font-medium truncate transition">
              Scheduled auto-settlement
            </span>
            <Sparkline data={[3, 4, 3, 2, 2, Math.max(1, pendingClearanceCount)]} color="#d97706" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4: Early Liquidity OR Total Settled */}
        {settings.earlyPaymentHighlighting ? (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Early Liquidity</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              </div>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              ${earlyPayEligibleVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium truncate transition">
                Instant payout available
              </span>
              <Sparkline data={[22000, 26000, 31000, 39000, 48000, earlyPayEligibleVal || 67171]} color="#f59e0b" width={68} height={20} />
            </div>
          </div>
        ) : (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Settled &amp; Paid</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              ${paidVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-emerald-700 group-hover:text-emerald-800 font-medium truncate transition">
                Completed disbursements
              </span>
              <Sparkline data={[65000, 78000, 89000, 102000, paidVal || 115480]} color="#10b981" width={68} height={20} />
            </div>
          </div>
        )}
      </div>

      {/* Table Filter & Search Toolbar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left Filter Cluster */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Instant Search Input */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices, POs, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/70"
            />
          </div>

          {/* Client Filter Dropdown */}
          <FilterSelect
            value={buyerFilter}
            onChange={(e) => setBuyerFilter(e.target.value)}
            title="Filter by enterprise client"
          >
            <option value="ALL">All Clients (3)</option>
            <option value="buyer-org-3">Meridian Health Network</option>
            <option value="buyer-org-1">Apex Global Enterprises</option>
            <option value="buyer-org-2">NovaTech Aerospace & Defense</option>
          </FilterSelect>

          {/* Match Status Filter */}
          <FilterSelect
            value={matchStatusFilter}
            onChange={(e) => setMatchStatusFilter(e.target.value)}
            title="Filter by match status"
          >
            <option value="ALL">All Match Statuses</option>
            <option value="3_WAY_MATCHED">3-Way Matched</option>
            <option value="2_WAY_MATCHED">2-Way Matched</option>
            <option value="DISCREPANCY_FLAGGED">Discrepancy Flagged</option>
          </FilterSelect>

          {/* Payment Status Filter */}
          <FilterSelect
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            title="Filter by payment status"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="DRAFT">Draft (Unsaved)</option>
            <option value="PAID">Settled & Paid</option>
            <option value="APPROVED_FOR_PAYMENT">Approved for Payment</option>
            <option value="SCHEDULED">Scheduled</option>
          </FilterSelect>

          {(buyerFilter !== 'ALL' || matchStatusFilter !== 'ALL' || paymentStatusFilter !== 'ALL' || searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setBuyerFilter('ALL');
                setMatchStatusFilter('ALL');
                setPaymentStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer px-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right Sort & Result Count */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
          <FilterSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            title="Sort invoices"
          >
            <option value="DATE_DESC">Date (Newest)</option>
            <option value="DATE_ASC">Date (Oldest)</option>
            <option value="AMOUNT_DESC">Total (High to Low)</option>
            <option value="AMOUNT_ASC">Total (Low to High)</option>
          </FilterSelect>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-600" />
            Loading invoices from electronic ledger...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div>No commercial invoices matched your search or filter criteria.</div>
            {(buyerFilter !== 'ALL' || matchStatusFilter !== 'ALL' || paymentStatusFilter !== 'ALL' || searchQuery.trim() !== '') && (
              <button
                onClick={() => {
                  setBuyerFilter('ALL');
                  setMatchStatusFilter('ALL');
                  setPaymentStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 whitespace-nowrap">INVOICE NUMBER</th>
                  <th className="py-3 px-2.5 min-w-[130px]">BUYER / CLIENT</th>
                  <th className="py-3 px-2 whitespace-nowrap">PO REFERENCE</th>
                  <th className="py-3 px-2 whitespace-nowrap">INVOICE DATE</th>
                  <th className="py-3 px-2 whitespace-nowrap">DUE DATE</th>
                  <th className="py-3 px-2.5 text-right whitespace-nowrap" title="Total Invoice Value including GST / Taxes">TOTAL INVOICE VALUE</th>
                  <th className="py-3 px-2 text-center whitespace-nowrap">MATCH STATUS</th>
                  <th className="py-3 px-2 text-center whitespace-nowrap">PAYMENT STATUS</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredInvoices.map(inv => {
                  const isMeridian = inv.invoiceNumber === 'INV-2026-201';
                  const buyerName = getBuyerDisplayName(inv.buyerOrgId);
                  const initials = getBuyerBadgeInitials(inv.buyerOrgId);

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => {
                        setSelectedInvoice(inv);
                        navigate('/invoices', { invoiceNumber: inv.invoiceNumber });
                      }}
                      className="hover:bg-slate-50/90 cursor-pointer transition group"
                    >
                      {/* Invoice Number */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 group-hover:text-teal-700 transition flex items-center gap-1.5 font-mono">
                          <Receipt className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                          <span>{inv.invoiceNumber}</span>
                        </div>
                        {isMeridian && (
                          <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.2 rounded mt-0.5 inline-block border border-teal-200/60">
                            PDF Sample Match
                          </span>
                        )}
                      </td>

                      {/* Buyer */}
                      <td className="py-3 px-2.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-teal-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setBuyerFilter(inv.buyerOrgId);
                              }}
                              className="font-semibold text-slate-800 hover:text-slate-950 hover:underline truncate max-w-[140px] cursor-pointer"
                              title={`Filter invoices to ${buyerName}`}
                            >
                              {buyerName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              AP Shared Services
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* PO Reference */}
                      <td className="py-3 px-2 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {inv.poNumber ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/orders', { poNumber: inv.poNumber, buyerOrgId: inv.buyerOrgId });
                            }}
                            className="hover:text-slate-950 hover:underline cursor-pointer"
                            title={`View order ${inv.poNumber} in Orders Hub`}
                          >
                            {inv.poNumber}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Invoice Date */}
                      <td className="py-3 px-2 text-slate-600 whitespace-nowrap font-medium">
                        {formatDateMMDDYYYY(inv.invoiceDate)}
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-2 text-slate-600 whitespace-nowrap font-medium">
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

                      {/* Total Invoice Value */}
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div>
                          ${getInvoiceGrossTotal(inv).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {typeof inv.taxAmount === 'number' && inv.taxAmount > 0 && (
                          <div className="text-[10px] text-slate-400 font-sans font-normal">
                            incl. ${inv.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GST
                          </div>
                        )}
                      </td>

                      {/* Match Status */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {getMatchBadge(inv.matchStatus)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {getPaymentStatusBadge(inv.paymentStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Early Pay (when eligible, not paid, and enabled in settings) */}
                          {settings.earlyPaymentHighlighting && inv.earlyPaymentOffer?.eligible && inv.paymentStatus !== 'PAID' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEarlyPayInvoice(inv);
                              }}
                              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                              title="Accelerate Liquidity - Instant Early Settlement"
                            >
                              <Zap className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                              <span>Early Pay</span>
                            </button>
                          )}

                          {/* 2. Message icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(inv);
                              setShowCollabDrawer(true);
                              navigate('/invoices', { invoiceNumber: inv.invoiceNumber, openCollab: true, openMessages: true, timestamp: Date.now() });
                            }}
                            className="relative p-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shadow-2xs shrink-0"
                            title="Messages & Collaboration"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                            {(commentsMap[inv.invoiceNumber] || []).length > 0 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white animate-pulse" />
                            )}
                          </button>

                          {/* 3. View */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              navigate('/invoices', { invoiceNumber: inv.invoiceNumber });
                            }}
                            className="w-16 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs shrink-0 inline-flex items-center justify-center"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Commercial Invoice Confirmation (ONLY Invoice Number & Buyer Name) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Create Commercial Invoice</h3>
                  <p className="text-[11px] text-slate-500">Initialize a new electronic invoice for billing</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createInvNum}
                  onChange={e => setCreateInvNum(e.target.value)}
                  required
                  placeholder="e.g. INV-2026-250"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Buyer / Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={createBuyerOrg}
                  onChange={e => setCreateBuyerOrg(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer shadow-2xs"
                >
                  <option value="buyer-org-1">Apex Global Enterprises</option>
                  <option value="buyer-org-2">NovaTech Aerospace & Defense</option>
                  <option value="buyer-org-3">Meridian Health Network</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-teal-400" />
                  <span>Create Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Interactive Early Payment Cashout Settlement */}
      {renderEarlyPayModal()}
    </div>
  );
};
