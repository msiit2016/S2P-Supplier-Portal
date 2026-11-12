import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { TransactionComment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ShoppingCart, 
  Receipt, 
  Clock, 
  User, 
  CheckCircle2, 
  Bot, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  Search,
  Truck,
  FolderLock,
  FileCheck2,
  ShieldCheck,
  FileText,
  ExternalLink,
  ChevronDown,
  Building2,
  DollarSign,
  Check,
  X,
  Filter
} from 'lucide-react';

export type DocumentCategory = 'ALL' | 'ORDERS' | 'INVOICES' | 'VAULT' | 'SOURCING' | 'UNREAD';
export type DocumentTypeCode = 'ALL' | 'PO' | 'INVOICE' | 'ASN' | 'COI_INSURANCE' | 'TAX_W9' | 'RFP' | 'CONTRACT';

export interface ThreadEntity {
  type: 'PO' | 'INVOICE' | 'ASN' | 'COI_INSURANCE' | 'TAX_W9' | 'RFP' | 'CONTRACT';
  id: string;
  label: string;
  amount: string;
  vendorName: string;
  category: 'ORDERS' | 'INVOICES' | 'VAULT' | 'SOURCING';
  status: string;
  date: string;
  contactName: string;
  contactRole: string;
}

export const SupplierCommunications: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    navigate, 
    routeState,
    unreadThreadIds, 
    markThreadAsRead, 
    markThreadAsUnread, 
    toggleThreadRead,
    markAllThreadsAsRead 
  } = usePortal();

  // Multi-Document Thread Entities (Scalable 12+ S2P Documents)
  const [entities] = useState<ThreadEntity[]>([
    { 
      type: 'PO', 
      id: 'po-9450', 
      label: 'PO-2026-9450 (Enterprise Compute Node Deployment)', 
      amount: '$79,920.00', 
      vendorName: 'Apex Global Enterprises',
      category: 'ORDERS',
      status: 'Counter-Signed',
      date: 'Due Nov 25',
      contactName: 'Sarah Chen',
      contactRole: 'VP of Strategic Sourcing'
    },
    { 
      type: 'ASN', 
      id: 'asn-8801', 
      label: 'ASN-2026-8801 (FedEx Freight Bay 14 Intake)', 
      amount: 'PRO #FX-90218820', 
      vendorName: 'Apex Logistics Center',
      category: 'ORDERS',
      status: 'In Transit',
      date: 'Nov 25 09:00 CST',
      contactName: 'Marcus Drake',
      contactRole: 'Dock Receiving Supervisor'
    },
    { 
      type: 'PO', 
      id: 'po-101', 
      label: 'PO-2026-101 (Cloud Server Deployment)', 
      amount: '$45,000.00', 
      vendorName: 'Meridian Health Network',
      category: 'ORDERS',
      status: 'Active Collaboration',
      date: 'Due Nov 12',
      contactName: 'Sarah Chen',
      contactRole: 'Lead Procurement Specialist'
    },
    { 
      type: 'INVOICE', 
      id: 'inv-201', 
      label: 'INV-2026-201 (3-Way Matched Commercial Invoice)', 
      amount: '$14,200.00', 
      vendorName: 'Apex Global Enterprises',
      category: 'INVOICES',
      status: '3-Way Match Verified',
      date: 'Paid Nov 28',
      contactName: 'Marcus Vance',
      contactRole: 'Accounts Payable Lead'
    },
    { 
      type: 'PO', 
      id: 'po-9520', 
      label: 'PO-2026-9520 (Edge Telemetry Streaming Nodes)', 
      amount: '$38,000.00', 
      vendorName: 'NovaTech Aerospace & Defense',
      category: 'ORDERS',
      status: 'Validating Specs',
      date: 'Due Nov 12',
      contactName: 'David Miller',
      contactRole: 'Lead Systems Engineer'
    },
    { 
      type: 'COI_INSURANCE', 
      id: 'doc-coi', 
      label: 'ACORD 25 Certificate of Liability Insurance', 
      amount: '$2,000,000 Coverage', 
      vendorName: 'Apex Global Enterprises',
      category: 'VAULT',
      status: 'Endorsement Requested',
      date: 'Expires in 20d',
      contactName: 'Dr. Clara Oswald',
      contactRole: 'Risk & Compliance Officer'
    },
    { 
      type: 'ASN', 
      id: 'asn-99120', 
      label: 'ASN-US-99120 (Advance Shipping Notice)', 
      amount: 'FedEx Freight Priority #7948', 
      vendorName: 'Apex Global Enterprises',
      category: 'ORDERS',
      status: 'In Transit',
      date: 'Thursday 09:30 AM',
      contactName: 'Dock Receiving Gate 4',
      contactRole: 'Joliet Distribution Center'
    },
    { 
      type: 'TAX_W9', 
      id: 'doc-w9', 
      label: 'IRS Form W-9 (Taxpayer ID & Certification)', 
      amount: 'EIN 84-2910482', 
      vendorName: 'Universal Vault Monitored',
      category: 'VAULT',
      status: 'Verified Monitored',
      date: 'Valid Until 2026',
      contactName: 'Tax Audit Specialist',
      contactRole: 'IRS / Compliance Verification Team'
    },
    { 
      type: 'RFP', 
      id: 'rfp-apex-09', 
      label: 'RFP-2026-APEX-09 (Enterprise Cloud Compute)', 
      amount: '$520,000 Est. Value', 
      vendorName: 'Apex Global Enterprises',
      category: 'SOURCING',
      status: 'Bidding Open',
      date: 'Closes Nov 15',
      contactName: 'Elena Rostova',
      contactRole: 'Global Sourcing Desk'
    },
    { 
      type: 'CONTRACT', 
      id: 'msa-081', 
      label: 'MSA-2026-081 (Master Services Agreement & Rate Schedule B)', 
      amount: 'Precision Rate Schedule B', 
      vendorName: 'Starlight Aerospace & Defense',
      category: 'SOURCING',
      status: 'Active Terms',
      date: 'Term 2026-2029',
      contactName: 'Col. Jonathan Vance',
      contactRole: 'Defense Procurement Group'
    },
    { 
      type: 'PO', 
      id: 'po-102', 
      label: 'PO-2026-102 (Cybersecurity Auditing Services)', 
      amount: '$28,500.00', 
      vendorName: 'Starlight Aerospace & Defense',
      category: 'ORDERS',
      status: 'Issued',
      date: 'Due Nov 20',
      contactName: 'Defense Purchasing Agent',
      contactRole: 'Buyer Team'
    },
    { 
      type: 'INVOICE', 
      id: 'inv-8802', 
      label: 'INV-2026-8802 (Hardware Settlement)', 
      amount: '$8,250.00', 
      vendorName: 'OmniRetail Logistics Network',
      category: 'INVOICES',
      status: 'Under Review',
      date: 'Due Dec 05',
      contactName: 'AP Disbursements',
      contactRole: 'OmniRetail Accounts'
    }
  ]);

  const [activeEntityType, setActiveEntityType] = useState<string>('PO');
  const [activeEntityId, setActiveEntityId] = useState<string>('po-9450');
  const [comments, setComments] = useState<TransactionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory>('ALL');

  // Handle URL deep-linking and in-app navigation routeState
  useEffect(() => {
    if (routeState) {
      const targetDoc = routeState.doc || routeState.activeEntityId || routeState.threadId;
      const targetPo = routeState.poNumber;
      const targetAsn = routeState.asnNumber;
      const targetInv = routeState.invoiceNumber;
      
      const match = entities.find(e => {
        if (targetDoc && (
          e.id.toLowerCase() === targetDoc.toLowerCase() || 
          e.id.toLowerCase().includes(targetDoc.toLowerCase()) || 
          targetDoc.toLowerCase().includes(e.id.toLowerCase())
        )) return true;
        if (targetPo && (e.label.includes(targetPo) || e.id.toLowerCase().includes(targetPo.toLowerCase()))) return true;
        if (targetAsn && (e.label.includes(targetAsn) || e.id.toLowerCase().includes(targetAsn.toLowerCase()))) return true;
        if (targetInv && (e.label.includes(targetInv) || e.id.toLowerCase().includes(targetInv.toLowerCase()))) return true;
        return false;
      });

      if (match) {
        setActiveEntityType(match.type);
        setActiveEntityId(match.id);
        markThreadAsRead(match.id);
        return;
      }
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const docParam = params.get('doc') || params.get('thread');
      if (docParam) {
        const match = entities.find(e => 
          e.id.toLowerCase() === docParam.toLowerCase() || 
          e.id.toLowerCase().includes(docParam.toLowerCase()) || 
          docParam.toLowerCase().includes(e.id.toLowerCase())
        );
        if (match) {
          setActiveEntityType(match.type);
          setActiveEntityId(match.id);
          markThreadAsRead(match.id);
        }
      }
    }
  }, [routeState, entities]);

  const handleSelectThread = (ent: ThreadEntity) => {
    setActiveEntityType(ent.type);
    setActiveEntityId(ent.id);
    markThreadAsRead(ent.id);
  };

  const activeEntity = entities.find(e => e.id === activeEntityId) || entities[0];
  const isCurrentThreadUnread = unreadThreadIds.includes(activeEntity.id);

  // Scalable category filtering
  const filteredEntities = entities.filter(ent => {
    if (categoryFilter === 'UNREAD') {
      if (!unreadThreadIds.includes(ent.id)) return false;
    } else if (categoryFilter === 'ORDERS') {
      if (ent.type !== 'PO' && ent.type !== 'ASN') return false;
    } else if (categoryFilter !== 'ALL' && ent.category !== categoryFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ent.label.toLowerCase().includes(q) || 
        ent.id.toLowerCase().includes(q) || 
        ent.amount.toLowerCase().includes(q) ||
        ent.vendorName.toLowerCase().includes(q) ||
        ent.contactName.toLowerCase().includes(q) ||
        ent.status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Default authentic comments for each document type
  const mockThreads: Record<string, TransactionComment[]> = {
    'po-9450': [
      {
        id: 'c-po9450-1',
        entityType: 'PO',
        entityId: 'po-9450',
        authorId: 'usr-buyer-sarah',
        authorName: 'Sarah Chen (VP of Strategic Sourcing)',
        authorRole: 'BUYER',
        text: 'Confirming expedited delivery date Nov 25 for Bay 14 compute servers. Counter-signature confirmed. Please attach the FAT test report before dispatch.',
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      }
    ],
    'asn-8801': [
      {
        id: 'c-asn8801-1',
        entityType: 'ASN',
        entityId: 'asn-8801',
        authorId: 'usr-buyer-marcus-drake',
        authorName: 'Marcus Drake (Bay 14 Receiving Supervisor)',
        authorRole: 'BUYER',
        text: 'FedEx Freight PRO #FX-90218820 checked in system. Inbound receiving dock appointment scheduled for Nov 25 09:00 CST.',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      }
    ],
    'inv-201': [
      {
        id: 'c-inv-1',
        entityType: 'INVOICE',
        entityId: 'inv-201',
        authorId: 'buyer-user-2',
        authorName: 'Marcus Vance',
        authorRole: 'BUYER',
        text: 'Touchless 3-way match cleared ($51,594.30). Approved for dynamic 2% cash acceleration payout via next-day Nacha settlement.',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'c-inv-2',
        entityType: 'INVOICE',
        entityId: 'inv-201',
        authorId: 'user-supp-acme',
        authorName: 'Elena Rostova',
        authorRole: 'SUPPLIER',
        text: 'Thank you Marcus. We have also activated 2/10 Net 30 terms should Apex Global prefer 48-hour accelerated settlement.',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    'po-101': [
      {
        id: 'c-po1-1',
        entityType: 'PO',
        entityId: 'po-101',
        authorId: 'buyer-user-1',
        authorName: 'Sarah Chen',
        authorRole: 'BUYER',
        text: 'Confirming expedited telemetry delivery for Bay 14 scheduled for Thursday morning. Please confirm your driver has gate clearance codes.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'c-po1-2',
        entityType: 'PO',
        entityId: 'po-101',
        authorId: 'user-supp-acme',
        authorName: 'Elena Rostova',
        authorRole: 'SUPPLIER',
        text: 'Understood Sarah, driver manifest dispatched with badge PIN. All 24 compute sensor nodes are pre-calibrated and scheduled for 09:30 AM arrival.',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    'po-9520': [
      {
        id: 'c-po9520-1',
        entityType: 'PO',
        entityId: 'po-9520',
        authorId: 'usr-buyer-david',
        authorName: 'David Miller (Lead Systems Engineer)',
        authorRole: 'BUYER',
        text: 'Mil-Spec radiation-hardened telemetry module specifications validated against defense standard MIL-STD-810H. Ready for staging.',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
      }
    ],
    'doc-coi': [
      {
        id: 'c-coi-1',
        entityType: 'COI_INSURANCE',
        entityId: 'doc-coi',
        authorId: 'buyer-user-3',
        authorName: 'Dr. Clara Oswald',
        authorRole: 'BUYER',
        text: 'Notice: Certificate expires in 20 days. Apex Global requires endorsement rider naming Apex Global Enterprises Inc. as Additional Insured on the General Liability schedule ($2M aggregate limit).',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'c-coi-2',
        entityType: 'COI_INSURANCE',
        entityId: 'doc-coi',
        authorId: 'user-supp-acme',
        authorName: 'Elena Rostova',
        authorRole: 'SUPPLIER',
        text: 'Understood Dr. Oswald. Our broker Marsh McLennan is issuing the endorsement rider today. Will upload to Document Vault before Friday.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    'asn-99120': [
      {
        id: 'c-asn-1',
        entityType: 'ASN',
        entityId: 'asn-99120',
        authorId: 'buyer-user-1',
        authorName: 'Joliet Dock Receiving',
        authorRole: 'BUYER',
        text: 'Advance Shipping Notice received for Bay 14 delivery. Gate PIN registered for Bay 14 intake.',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    'doc-w9': [
      {
        id: 'c-w9-1',
        entityType: 'TAX_W9',
        entityId: 'doc-w9',
        authorId: 'tax-bot',
        authorName: 'Tax Verification Engine',
        authorRole: 'BUYER',
        text: 'IRS Form W-9 TIN 84-2910482 matches registered corporate legal identity Acme Industrial Tech Inc. Monitored for annual renewal.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    'rfp-apex-09': [
      {
        id: 'c-rfp-1',
        entityType: 'RFP',
        entityId: 'rfp-apex-09',
        authorId: 'sourcing-lead',
        authorName: 'Elena Rostova',
        authorRole: 'BUYER',
        text: 'Vendor clarification response submitted for Enterprise Compute Nodes ($520k est). Electronic bid submission deadline is Nov 15.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    'msa-081': [
      {
        id: 'c-msa-1',
        entityType: 'CONTRACT',
        entityId: 'msa-081',
        authorId: 'buyer-user-4',
        authorName: 'Col. Jonathan Vance',
        authorRole: 'BUYER',
        text: 'Inquiry regarding Volume Discount Schedule B conformity for Gen-5 NVMe Compute Nodes (ACM-NODE-800). Rate card pre-cleared for Q4 procurement.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]
  };

  const loadComments = async (type: string, id: string) => {
    try {
      setLoading(true);
      const res = await ApiClient.getTransactionComments(type, id);
      if (res && res.comments && res.comments.length > 0) {
        setComments(res.comments);
      } else {
        setComments(mockThreads[id] || []);
      }
    } catch (err) {
      setComments(mockThreads[id] || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(activeEntityType, activeEntityId);
  }, [activeEntityType, activeEntityId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newObj: TransactionComment = {
      id: `comm-${Date.now()}`,
      entityType: activeEntityType,
      entityId: activeEntityId,
      authorId: currentUser?.id || 'user-supp-acme',
      authorName: currentUser?.name || 'Elena Rostova',
      authorRole: 'SUPPLIER',
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newObj]);
    setNewComment('');

    try {
      await ApiClient.addTransactionComment(activeEntityType, activeEntityId, newObj.text);
    } catch (err) {
      // client-side state updated
    }
  };

  const handleAiDraftSuggestion = () => {
    setAiDrafting(true);
    setTimeout(() => {
      if (activeEntity.type === 'PO') {
        setNewComment("Hello Sarah, confirming expedited telemetry delivery for Bay 14 is on schedule for Nov 25. Gate clearance codes and FAT report attached.");
      } else if (activeEntity.type === 'INVOICE') {
        setNewComment("Hello Marcus, thank you for verifying the 3-way match. Payment schedule noted for release via next-day Nacha settlement.");
      } else if (activeEntity.type === 'COI_INSURANCE') {
        setNewComment("Hello Dr. Oswald, confirmed that Marsh McLennan has issued the endorsement rider naming Apex Global as Additional Insured. Uploaded to Document Vault.");
      } else if (activeEntity.type === 'ASN') {
        setNewComment("Hello Marcus, driver PIN and Bill of Lading manifest have been verified under FedEx Freight Priority #FX-90218820.");
      } else if (activeEntity.type === 'RFP') {
        setNewComment("Hello Sourcing Team, Acme Industrial Tech has finalized technical compute specifications and will submit the formal proposal by Thursday 17:00 EST.");
      } else {
        setNewComment("Hello Partner Team, confirmed and acknowledged. Updated documentation registered in the audit vault.");
      }
      setAiDrafting(false);
    }, 450);
  };

  const getAiSuggestionChips = () => {
    if (activeEntity.type === 'PO') {
      return [
        { label: 'Confirm Bay 14 Delivery', text: 'Hello Sarah, confirming expedited telemetry delivery for Bay 14 is on schedule for Nov 25. Gate clearance PIN confirmed.' },
        { label: 'Send Tracking & BOL', text: 'Tracking BOL #FX-90218820 is registered with FedEx Freight Priority. Advance Shipping Notice dispatched.' },
        { label: 'Request Gate Clearance PIN', text: 'Please send driver gate PIN for Bay 14 intake at the logistics center.' }
      ];
    }
    if (activeEntity.type === 'INVOICE') {
      return [
        { label: 'Acknowledge Payout Schedule', text: 'Hello Marcus, thank you for confirming the zero-variance match. Payment schedule noted for release.' },
        { label: 'Request 48h Dynamic Payout', text: 'We confirm the 3-way match and would like to proceed with the Dynamic Discounting 48-hour accelerated settlement.' }
      ];
    }
    if (activeEntity.type === 'COI_INSURANCE') {
      return [
        { label: 'Confirm Endorsement Issued', text: 'Confirmed. Marsh McLennan has issued the endorsement rider naming Apex Global as Additional Insured. Uploading now.' },
        { label: 'Verify $2M Policy Limits', text: 'Policy limits are confirmed at $2,000,000 aggregate and $1,000,000 per occurrence with zero deductible.' }
      ];
    }
    if (activeEntity.type === 'ASN') {
      return [
        { label: 'Dispatch Packing Slip Manifest', text: 'Packing slip and line-item serialized sensor manifest attached for dock check-in.' },
        { label: 'Reconfirm 09:00 AM ETA', text: 'Driver ETA reconfirmed for Nov 25 09:00 CST sharp at Bay 14 intake.' }
      ];
    }
    if (activeEntity.type === 'RFP') {
      return [
        { label: 'Confirm Pricing Submission', text: 'Confirming Acme Tech pricing bid of $520,000 will be uploaded prior to closing.' },
        { label: 'Request Specification Clarification', text: 'Requesting confirmation on telemetry bandwidth SLA outlined in Section 4.2.' }
      ];
    }
    return [
      { label: 'Acknowledge Audit Note', text: 'Thank you for the verification confirmation. Audit records updated.' }
    ];
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'PO': return ShoppingCart;
      case 'INVOICE': return Receipt;
      case 'ASN': return Truck;
      case 'COI_INSURANCE': return FolderLock;
      case 'TAX_W9': return FileText;
      case 'RFP': return FileCheck2;
      case 'CONTRACT': return ShieldCheck;
      default: return MessageSquare;
    }
  };

  const getDocumentTypeTheme = (type: string) => {
    switch (type) {
      case 'PO':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
          iconBg: 'bg-emerald-50 text-emerald-600',
          activeRing: 'border-l-emerald-600 bg-emerald-50/40 border-emerald-300'
        };
      case 'INVOICE':
        return {
          badge: 'bg-teal-50 text-teal-700 border-teal-200/70',
          iconBg: 'bg-teal-50 text-teal-600',
          activeRing: 'border-l-teal-600 bg-teal-50/40 border-teal-300'
        };
      case 'ASN':
        return {
          badge: 'bg-sky-50 text-sky-700 border-sky-200/70',
          iconBg: 'bg-sky-50 text-sky-600',
          activeRing: 'border-l-sky-600 bg-sky-50/40 border-sky-300'
        };
      case 'RFP':
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200/70',
          iconBg: 'bg-purple-50 text-purple-600',
          activeRing: 'border-l-purple-600 bg-purple-50/40 border-purple-300'
        };
      case 'COI_INSURANCE':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200/70',
          iconBg: 'bg-rose-50 text-rose-600',
          activeRing: 'border-l-rose-600 bg-rose-50/40 border-rose-300'
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          iconBg: 'bg-slate-100 text-slate-600',
          activeRing: 'border-l-slate-800 bg-slate-50 border-slate-300'
        };
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Minimal Unified Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Collaboration Hub
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate font-normal">
              Transactional messages across orders, invoices, shipments, and RFPs.
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 sm:w-56 text-xs pl-8 pr-7 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sleek Filter Strip (Matching Orders & Invoices Design Language) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {[
          { id: 'ALL', label: `All (${entities.length})`, icon: null },
          { id: 'UNREAD', label: `Unread (${unreadThreadIds.length})`, icon: null, badge: unreadThreadIds.length > 0 },
          { id: 'ORDERS', label: `Orders & Shipments (${entities.filter(e => e.type === 'PO' || e.type === 'ASN').length})`, icon: ShoppingCart },
          { id: 'INVOICES', label: `Invoices (${entities.filter(e => e.type === 'INVOICE').length})`, icon: Receipt },
          { id: 'SOURCING', label: `RFPs & Bids (${entities.filter(e => e.type === 'RFP' || e.type === 'CONTRACT').length})`, icon: FileCheck2 },
          { id: 'VAULT', label: `Compliance (${entities.filter(e => e.category === 'VAULT').length})`, icon: FolderLock }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              categoryFilter === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
            }`}
          >
            {tab.icon && React.createElement(tab.icon, { className: `w-3.5 h-3.5 ${categoryFilter === tab.id ? 'text-white' : 'text-slate-400'}` })}
            <span>{tab.label}</span>
            {tab.badge && categoryFilter !== tab.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Main Split View: Left Channel List & Right Unified Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Thread List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Thread List Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Inbox Channels ({filteredEntities.length})
            </span>
            {unreadThreadIds.length > 0 ? (
              <button
                type="button"
                onClick={markAllThreadsAsRead}
                className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200/90 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Mark all conversations as read"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Mark all read</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>All read</span>
              </span>
            )}
          </div>

          {/* List of Threads */}
          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {filteredEntities.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">No conversations found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try clearing filters or search</p>
              </div>
            ) : (
              filteredEntities.map((ent) => {
                const isSelected = activeEntityId === ent.id;
                const isUnread = unreadThreadIds.includes(ent.id);
                const theme = getDocumentTypeTheme(ent.type);
                const DocIcon = getDocumentTypeIcon(ent.type);

                return (
                  <div
                    key={`${ent.type}-${ent.id}`}
                    onClick={() => handleSelectThread(ent)}
                    className={`p-3.5 transition cursor-pointer relative group ${
                      isSelected
                        ? `border-l-4 ${theme.activeRing} shadow-2xs`
                        : isUnread
                        ? 'bg-emerald-50/25 hover:bg-emerald-50/50'
                        : 'bg-white hover:bg-slate-50/90'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs transition-transform group-hover:scale-105 ${theme.iconBg}`}>
                        <DocIcon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${theme.badge}`}>
                            {ent.id.toUpperCase()}
                          </span>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span className="text-[10px] text-slate-400 font-normal">
                              {ent.date}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 animate-pulse shrink-0" title="Unread Message" />
                            )}
                          </div>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-900 truncate leading-snug group-hover:text-emerald-700 transition-colors">
                          {ent.label}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                          <span className="truncate">{ent.contactName} • {ent.vendorName}</span>
                          <span className="font-mono font-bold text-slate-700 shrink-0 ml-1 text-[11px]">{ent.amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Unified Communication Workspace (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-[710px]">
          {/* Unified Workspace Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getDocumentTypeTheme(activeEntity.type).iconBg}`}>
                {React.createElement(getDocumentTypeIcon(activeEntity.type), { className: 'w-5 h-5' })}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {activeEntity.type === 'PO' ? `Purchase Order: ${activeEntity.label.split(' ')[0]}` :
                     activeEntity.type === 'INVOICE' ? `Commercial Invoice: ${activeEntity.label.split(' ')[0]}` :
                     activeEntity.type === 'COI_INSURANCE' ? 'Insurance COI: ACORD 25' :
                     activeEntity.type === 'TAX_W9' ? 'Tax Record: IRS Form W-9' :
                     activeEntity.type === 'ASN' ? `Advance Shipping Notice: ${activeEntity.label.split(' ')[0]}` :
                     activeEntity.type === 'RFP' ? `Sourcing Tender: ${activeEntity.label.split(' ')[0]}` :
                     `Contract Rate Card: ${activeEntity.label.split(' ')[0]}`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    {activeEntity.amount}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {activeEntity.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-700">{activeEntity.vendorName}</span>
                  <span>•</span>
                  <span>Buyer Contact: <strong>{activeEntity.contactName}</strong> ({activeEntity.contactRole})</span>
                </div>
              </div>
            </div>

            {/* Actions: View in Domain Workspace + Mark Read Toggle */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => toggleThreadRead(activeEntity.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isCurrentThreadUnread
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
                title="Toggle read/unread status for this thread"
              >
                {isCurrentThreadUnread ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mark as Read</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>Mark as Unread</span>
                  </>
                )}
              </button>

              {/* Direct Workspace Jump */}
              {activeEntity.type === 'PO' ? (
                <button
                  type="button"
                  onClick={() => {
                    const poMatch = activeEntity.label.match(/PO-[0-9-]+/);
                    const poNum = poMatch ? poMatch[0] : (activeEntity.id === 'po-9450' ? 'PO-2026-9450' : 'PO-2026-101');
                    navigate('/orders', { poNumber: poNum, openCollab: true, openMessages: true, timestamp: Date.now() });
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Orders Workspace ↗</span>
                </button>
              ) : activeEntity.type === 'INVOICE' ? (
                <button
                  type="button"
                  onClick={() => {
                    const invMatch = activeEntity.label.match(/INV-[0-9-]+/);
                    const invNum = invMatch ? invMatch[0] : 'INV-2026-201';
                    navigate('/invoices', { invoiceNumber: invNum, openCollab: true, openMessages: true, timestamp: Date.now() });
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoice Workspace ↗</span>
                </button>
              ) : activeEntity.type === 'ASN' ? (
                <button
                  type="button"
                  onClick={() => {
                    const asnMatch = activeEntity.label.match(/ASN-[A-Z0-9-]+/);
                    const asnNum = asnMatch ? asnMatch[0] : 'ASN-2026-8801';
                    navigate('/asns', { asnNumber: asnNum, openCollab: true, openMessages: true, timestamp: Date.now() });
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Shipments Workspace ↗</span>
                </button>
              ) : activeEntity.type === 'RFP' ? (
                <button
                  type="button"
                  onClick={() => navigate('/rfps', { eventNumber: 'RFP-2026-APEX-09', openCollab: true, openMessages: true, timestamp: Date.now() })}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Bid Room ↗</span>
                </button>
              ) : activeEntity.type === 'CONTRACT' ? (
                <button
                  type="button"
                  onClick={() => navigate('/catalog/pricing-tiers', { doc: 'RATE-SCHEDULE-B', tier: 'RATE-SCHEDULE-B', openCollab: true, openMessages: true, timestamp: Date.now() })}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Rate Schedule ↗</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/documents', { doc: activeEntity.id, openCollab: true, openMessages: true, timestamp: Date.now() })}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FolderLock className="w-3.5 h-3.5" />
                  <span>Vault ↗</span>
                </button>
              )}
            </div>
          </div>

          {/* Security & Audit Sub-ribbon */}
          <div className="px-4 py-1.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                Secure Audit Channel: Bound to <strong className="text-slate-700">{activeEntity.label.split(' ')[0]}</strong> • Visible to authenticated procurement leads
              </span>
            </div>
            <button
              type="button"
              onClick={handleAiDraftSuggestion}
              disabled={aiDrafting}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer shrink-0 ml-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{aiDrafting ? 'Drafting...' : 'AI Auto-Draft'}</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/20">
            {loading ? (
              <div className="text-center text-slate-400 py-16 text-xs">Loading contextual audit messages...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-slate-400 py-16 text-xs">
                No messages yet on this transaction object. Type below to begin collaboration.
              </div>
            ) : (
              comments.map((c) => {
                const isMe = c.authorRole === 'SUPPLIER';
                return (
                  <div
                    key={c.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span className="font-semibold text-slate-700">{c.authorName}</span>
                      <span>•</span>
                      <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                        isMe ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {c.authorRole}
                      </span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-emerald-50/80 text-slate-900 border border-emerald-200/90 rounded-br-none shadow-2xs font-medium'
                          : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      {c.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* AI Quick Suggestion Chips */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 shrink-0 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Suggestions:</span>
              </span>
              {getAiSuggestionChips().map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewComment(chip.text)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-lg text-[11px] font-medium text-slate-700 hover:text-emerald-800 transition cursor-pointer shrink-0 shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Composer Bar */}
          <form onSubmit={handleSendComment} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Message ${activeEntity.contactName} regarding ${activeEntity.label.split(' ')[0]}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-slate-50/40 text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleAiDraftSuggestion}
              disabled={aiDrafting}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/70 text-emerald-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{aiDrafting ? 'Drafting...' : 'AI Draft'}</span>
            </button>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition shadow-2xs cursor-pointer shrink-0"
              title="Send reply"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
