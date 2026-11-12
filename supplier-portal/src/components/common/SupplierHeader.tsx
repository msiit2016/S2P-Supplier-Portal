import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { ApiClient } from '../../api/client.js';
import { BuyerSpecificProfile } from '../../types/index.js';
import { VerisourceLogo } from './VerisourceLogo.js';
import { 
  Sparkles, 
  ShieldCheck, 
  ChevronDown,
  Globe,
  Building2,
  Share2,
  Layers,
  LayoutDashboard,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bell,
  MessageSquare,
  Truck,
  DollarSign,
  FileText,
  User,
  Settings,
  LogOut,
  FolderLock,
  Package,
  ClipboardList,
  FileCheck2,
  LayoutGrid,
  ShoppingCart,
  Receipt,
  CheckCheck,
  Check,
  Clock,
  ChevronRight,
  Inbox,
  X
} from 'lucide-react';

const DEFAULT_BUYERS: BuyerSpecificProfile[] = [
  {
    id: 'bprof-apex',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-1',
    buyerName: 'Apex Global Enterprises',
    buyerLogoText: 'APEX',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-88102',
    connectedSince: 'Jan 2026',
    annualSpendVolume: 380000,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Operating Checking Account'
    },
    negotiatedTerms: {
      paymentTerms: '2/10 Net 30',
      earlyPaymentEligible: true,
      customDiscountRate: 2.0,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Tier-1 Enterprise Preferred (12% Master Volume Discount)',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 100
  },
  {
    id: 'bprof-novatech',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-2',
    buyerName: 'NovaTech Aerospace & Defense',
    buyerLogoText: 'NOVA',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-4019',
    connectedSince: 'Aug 2024',
    annualSpendVolume: 215000,
    customRemittanceAccount: {
      bankName: 'Silicon Valley Bank (Division of First Citizens)',
      accountEnding: '1109',
      routingNumberMasked: '121140399',
      currency: 'USD',
      accountNickName: 'Specialized Defense Tech Escrow Account'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 45 Standard',
      earlyPaymentEligible: true,
      customDiscountRate: 1.25,
      preferredPaymentMethod: 'WIRE'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Defense & Aerospace Precision Rate Card 2026',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 96
  },
  {
    id: 'bprof-meridian',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-3',
    buyerName: 'Meridian Health Network',
    buyerLogoText: 'MERI',
    relationshipStatus: 'CHANGES_REQUESTED',
    erpVendorId: 'Pending Activation',
    connectedSince: 'Oct 2026',
    annualSpendVolume: 34800,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Meridian Clinical Transit Remittance'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 30 Days',
      earlyPaymentEligible: false,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Logistics Hardware & Telemetry Schedule B',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 85
  }
];

const HEADER_THREAD_PREVIEWS: Record<string, { initials: string; name: string; tag: string; tagColor: string; time: string; text: string; buyerOrgId?: string; isWorkspace?: boolean }> = {
  'po-101': {
    initials: 'SC',
    name: 'Sarah Chen',
    tag: 'PO-101',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    time: '12m',
    text: 'Confirming expedited telemetry delivery for Bay 14 scheduled for Thursday morning.',
    buyerOrgId: 'buyer-org-1',
    isWorkspace: true
  },
  'inv-201': {
    initials: 'MV',
    name: 'Marcus Vance',
    tag: 'INV-201',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    time: '1h',
    text: 'Touchless 3-way match cleared with zero variance. Payment approved for scheduled release.',
    buyerOrgId: 'buyer-org-1',
    isWorkspace: true
  },
  'doc-coi': {
    initials: 'DM',
    name: 'David Miller',
    tag: 'COI-25',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    time: '4h',
    text: 'Notice: Certificate expires in 20 days. Endorsement rider naming Apex Global required.',
    buyerOrgId: 'buyer-org-1',
    isWorkspace: false
  },
  'asn-99120': {
    initials: 'DR',
    name: 'Dock Receiving',
    tag: 'ASN-99120',
    tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    time: '2h',
    text: 'Advance Shipping Notice received for Bay 14 delivery. Gate PIN registered for intake.',
    buyerOrgId: 'buyer-org-1',
    isWorkspace: false
  },
  'doc-w9': {
    initials: 'TX',
    name: 'Tax Verification Engine',
    tag: 'TAX-W9',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    time: '5d',
    text: 'IRS Form W-9 TIN matches registered corporate legal identity. Monitored for annual renewal.',
    buyerOrgId: 'buyer-org-1',
    isWorkspace: false
  },
  'rfp-apex-09': {
    initials: 'SS',
    name: 'Strategic Sourcing Team',
    tag: 'RFP-09',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    time: '2d',
    text: 'Vendor clarification window open until Friday. All compute node questions answered.',
    buyerOrgId: 'buyer-org-1',
    isWorkspace: false
  },
  'msa-081': {
    initials: 'CC',
    name: 'Contracts Counsel',
    tag: 'MSA-081',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    time: '3d',
    text: 'Master Services Agreement active. Precision Rate Schedule B applies.',
    buyerOrgId: 'buyer-org-2',
    isWorkspace: false
  },
  'po-102': {
    initials: 'DP',
    name: 'Defense Purchasing Agent',
    tag: 'PO-102',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    time: '4d',
    text: 'Purchase order issued for cybersecurity auditing services.',
    buyerOrgId: 'buyer-org-2',
    isWorkspace: false
  },
  'inv-8802': {
    initials: 'AP',
    name: 'AP Disbursements',
    tag: 'INV-8802',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    time: '6d',
    text: 'Healthcare telemetry hardware invoice under review with Meridian accounts.',
    buyerOrgId: 'buyer-org-3',
    isWorkspace: false
  }
};

interface HeaderMessageItem {
  id: string;
  senderName: string;
  senderRole?: string;
  buyerName: string;
  buyerOrgId?: string;
  category: 'ORDERS' | 'ASNS' | 'INVOICES' | 'RFPS' | 'DOCS' | 'CATALOG';
  categoryLabel: string;
  docTag: string;
  message: string;
  time: string;
  read: boolean;
  route: string;
  routeState?: any;
  initials: string;
  avatarColor: {
    bg: string;
    text: string;
    border: string;
  };
  tagStyle: {
    bg: string;
    text: string;
    border: string;
  };
}

const DEFAULT_HEADER_MESSAGES: HeaderMessageItem[] = [
  {
    id: 'msg-po-9450',
    senderName: 'Sarah Chen',
    senderRole: 'VP of Strategic Sourcing',
    buyerName: 'Apex Global Enterprises',
    buyerOrgId: 'buyer-org-1',
    category: 'ORDERS',
    categoryLabel: 'Orders',
    docTag: 'PO-2026-9450',
    message: 'Confirming expedited delivery date Nov 25 for Bay 14 compute servers. Counter-signature confirmed. Please attach the FAT test report before dispatch.',
    time: '8m ago',
    read: false,
    route: '/orders',
    routeState: { poNumber: 'PO-2026-9450', openCollab: true, openMessages: true },
    initials: 'SC',
    avatarColor: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    },
    tagStyle: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/80'
    }
  },
  {
    id: 'msg-asn-8801',
    senderName: 'Marcus Drake',
    senderRole: 'Bay 14 Dock Receiving Supervisor',
    buyerName: 'Apex Logistics Center',
    buyerOrgId: 'buyer-org-1',
    category: 'ASNS',
    categoryLabel: 'Shipments',
    docTag: 'ASN-2026-8801',
    message: 'FedEx Freight PRO #FX-90218820 checked in system. Inbound receiving dock appointment scheduled for Nov 25 09:00 CST.',
    time: '25m ago',
    read: false,
    route: '/asns',
    routeState: { asnNumber: 'ASN-2026-8801', openCollab: true, openMessages: true },
    initials: 'MD',
    avatarColor: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200'
    },
    tagStyle: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200/80'
    }
  },
  {
    id: 'msg-inv-201',
    senderName: 'Marcus Vance',
    senderRole: 'Disbursements & AP Team',
    buyerName: 'Apex Global Enterprises',
    buyerOrgId: 'buyer-org-1',
    category: 'INVOICES',
    categoryLabel: 'Invoices',
    docTag: 'INV-2026-201',
    message: 'Touchless 3-way match cleared ($51,594.30). Approved for dynamic 2% cash acceleration payout via next-day Nacha settlement.',
    time: '1h ago',
    read: false,
    route: '/invoices',
    routeState: { invoiceNumber: 'INV-2026-201', openCollab: true, openMessages: true },
    initials: 'MV',
    avatarColor: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200'
    },
    tagStyle: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/80'
    }
  },
  {
    id: 'msg-po-9520',
    senderName: 'David Miller',
    senderRole: 'Lead Systems Engineer',
    buyerName: 'NovaTech Aerospace & Defense',
    buyerOrgId: 'buyer-org-2',
    category: 'ORDERS',
    categoryLabel: 'Orders',
    docTag: 'PO-2026-9520',
    message: 'Mil-Spec radiation-hardened telemetry module specifications validated against defense standard MIL-STD-810H. Ready for staging.',
    time: '3h ago',
    read: true,
    route: '/orders',
    routeState: { poNumber: 'PO-2026-9520', openCollab: true, openMessages: true },
    initials: 'DM',
    avatarColor: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200'
    },
    tagStyle: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200/80'
    }
  },
  {
    id: 'msg-rfp-apex',
    senderName: 'Elena Rostova',
    senderRole: 'Sourcing Director',
    buyerName: 'Strategic Sourcing Committee',
    buyerOrgId: 'buyer-org-1',
    category: 'RFPS',
    categoryLabel: 'RFPs & Bids',
    docTag: 'RFP-2026-APEX-09',
    message: 'Vendor clarification response submitted for Enterprise Compute Nodes ($520k est). Electronic bid submission deadline is Nov 15.',
    time: '5h ago',
    read: true,
    route: '/rfps',
    routeState: { eventNumber: 'RFP-2026-APEX-09', openCollab: true, openMessages: true },
    initials: 'ER',
    avatarColor: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    tagStyle: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200/80'
    }
  },
  {
    id: 'msg-doc-meridian',
    senderName: 'Dr. Clara Oswald',
    senderRole: 'Clinical Procurement & Compliance',
    buyerName: 'Meridian Health Network',
    buyerOrgId: 'buyer-org-3',
    category: 'DOCS',
    categoryLabel: 'Compliance',
    docTag: 'COI-ENDORSEMENT',
    message: 'Annual ACORD 25 Certificate of Liability insurance rider verified. Please confirm updated certificate naming Meridian Health as Additional Insured.',
    time: '1d ago',
    read: true,
    route: '/documents',
    routeState: { doc: 'doc-coi', openCollab: true, openMessages: true },
    initials: 'CO',
    avatarColor: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200'
    },
    tagStyle: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200/80'
    }
  },
  {
    id: 'msg-catalog-pricing',
    senderName: 'Col. Jonathan Vance',
    senderRole: 'Procurement Contracting Officer',
    buyerName: 'Starlight Aerospace & Defense',
    buyerOrgId: 'buyer-org-2',
    category: 'CATALOG',
    categoryLabel: 'Catalog & Pricing',
    docTag: 'RATE-SCHEDULE-B',
    message: 'Inquiry regarding Volume Discount Schedule B conformity for Gen-5 NVMe Compute Nodes (ACM-NODE-800). Rate card pre-cleared for Q4 procurement.',
    time: '2d ago',
    read: true,
    route: '/catalog/pricing-tiers',
    routeState: { doc: 'RATE-SCHEDULE-B', tier: 'RATE-SCHEDULE-B', openCollab: true, openMessages: true },
    initials: 'JV',
    avatarColor: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200'
    },
    tagStyle: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200/80'
    }
  }
];

interface SupplierHeaderProps {
  onToggleAi: () => void;
}

const getPageContextTitle = (route: string): string => {
  if (route.startsWith('/onboarding')) return 'Onboarding Agent';
  if (route.startsWith('/orders') || route.startsWith('/purchase-orders')) return 'Purchase Orders Copilot';
  if (route.startsWith('/asns') || route.startsWith('/shipping') || route.startsWith('/shipments')) return 'Logistics & ASN Copilot';
  if (route.startsWith('/invoices') || route.startsWith('/early-payment')) return 'Commercial Invoices Copilot';
  if (route.startsWith('/public-profile') || route.startsWith('/profiles') || route.startsWith('/master-profile')) return 'Master Profile Copilot';
  if (route.startsWith('/rfps') || route.startsWith('/sourcing') || route.startsWith('/bids')) return 'Sourcing & Bids Copilot';
  if (route.startsWith('/documents') || route.startsWith('/vault') || route.startsWith('/doc-vault')) return 'Document Vault Copilot';
  if (route.startsWith('/catalog') || route.startsWith('/catalog-vault')) return 'Catalog & Pricing Copilot';
  if (route.startsWith('/transactions')) return 'AP Settlement Copilot';
  if (route.startsWith('/tasks') || route.startsWith('/queue')) return 'Task Prioritization Copilot';
  if (route.startsWith('/communications') || route.startsWith('/messages')) return 'Collaboration Copilot';
  return 'Dashboard Intelligence Copilot';
};

export interface HeaderNotificationItem {
  id: string;
  category: 'ORDERS' | 'ASNS' | 'INVOICES' | 'RFPS' | 'DOCS' | 'CATALOG' | 'TASKS';
  categoryLabel: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  route: string;
  routeState?: any;
  priority?: 'HIGH' | 'MEDIUM' | 'NORMAL';
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    iconBg: string;
  };
  icon: React.ElementType;
}

const DEFAULT_HEADER_NOTIFICATIONS: HeaderNotificationItem[] = [
  {
    id: 'notif-po-9450',
    category: 'ORDERS',
    categoryLabel: 'Orders',
    title: 'New Order Issued: PO-2026-9450',
    message: 'Apex Global released PO-2026-9450 ($79,920.00) for Datacenter Nodes. Promised due Nov 25.',
    time: '12m ago',
    read: false,
    route: '/orders',
    routeState: { poNumber: 'PO-2026-9450', openCollab: false, openMessages: false },
    icon: ShoppingCart,
    priority: 'HIGH',
    badgeStyle: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/60',
      iconBg: 'bg-emerald-500/10 text-emerald-600'
    }
  },
  {
    id: 'notif-asn-8801',
    category: 'ASNS',
    categoryLabel: 'Shipments',
    title: 'Shipment In Transit: ASN-2026-8801',
    message: 'FedEx Freight Priority (PRO #FX-90218820) in transit to Apex Bay 14 Logistics Center.',
    time: '35m ago',
    read: false,
    route: '/asns',
    routeState: { asnNumber: 'ASN-2026-8801', openCollab: false, openMessages: false },
    icon: Truck,
    priority: 'NORMAL',
    badgeStyle: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200/60',
      iconBg: 'bg-sky-500/10 text-sky-600'
    }
  },
  {
    id: 'notif-inv-201',
    category: 'INVOICES',
    categoryLabel: 'Invoices',
    title: 'Early Cash Liquidity Ready ($51,594.30)',
    message: 'INV-2026-201 3-way matched. Dynamic 2% acceleration unlocked for next-day Nacha settlement.',
    time: '1h ago',
    read: false,
    route: '/invoices',
    routeState: { invoiceNumber: 'INV-2026-201', openCollab: false, openMessages: false },
    icon: DollarSign,
    priority: 'HIGH',
    badgeStyle: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/60',
      iconBg: 'bg-amber-500/10 text-amber-600'
    }
  },
  {
    id: 'notif-rfp-apex',
    category: 'RFPS',
    categoryLabel: 'RFPs & Bids',
    title: 'Sourcing RFP Event: RFP-2026-APEX-09',
    message: 'Apex Global invited Acme to bid on Enterprise Compute Nodes ($520,000 est value). Closes Nov 15.',
    time: '2h ago',
    read: true,
    route: '/rfps',
    routeState: { eventNumber: 'RFP-2026-APEX-09', openCollab: false, openMessages: false },
    icon: FileText,
    priority: 'NORMAL',
    badgeStyle: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200/60',
      iconBg: 'bg-purple-500/10 text-purple-600'
    }
  },
  {
    id: 'notif-doc-coi',
    category: 'DOCS',
    categoryLabel: 'Compliance',
    title: 'COI Endorsement Required in 20 Days',
    message: 'General Liability Certificate expires Nov 15. Additional Insured rider required for Apex Global.',
    time: '4h ago',
    read: true,
    route: '/documents',
    routeState: { doc: 'doc-coi', openCollab: false, openMessages: false },
    icon: AlertTriangle,
    priority: 'HIGH',
    badgeStyle: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200/60',
      iconBg: 'bg-rose-500/10 text-rose-600'
    }
  },
  {
    id: 'notif-catalog-sync',
    category: 'CATALOG',
    categoryLabel: 'Catalog',
    title: 'Catalog Item Codes Published',
    message: 'ACM-NODE-64GB & rate schedule published to enterprise buyer catalogs.',
    time: '1d ago',
    read: true,
    route: '/catalog',
    routeState: { openCollab: false, openMessages: false },
    icon: Package,
    priority: 'NORMAL',
    badgeStyle: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200/60',
      iconBg: 'bg-teal-500/10 text-teal-600'
    }
  },
  {
    id: 'notif-task-novatech',
    category: 'TASKS',
    categoryLabel: 'Tasks',
    title: 'Action Item: NovaTech Onboarding Attestation',
    message: 'Procurement desk requested compliance attestation, W-9, and FedACH banking setup.',
    time: '1d ago',
    read: true,
    route: '/tasks',
    routeState: { taskId: 'task-onboard-novatech', openCollab: false, openMessages: false },
    icon: ClipboardList,
    priority: 'HIGH',
    badgeStyle: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200/60',
      iconBg: 'bg-indigo-500/10 text-indigo-600'
    }
  }
];

export const SupplierHeader: React.FC<SupplierHeaderProps> = ({ onToggleAi }) => {
  const { currentUser, switchUser, logout } = useAuth();
  const { 
    currentRoute, 
    navigate, 
    selectedBuyerId, 
    setSelectedBuyerId,
    openBuyerWorkspace,
    unreadThreadIds,
    markThreadAsRead,
    toggleThreadRead,
    markAllThreadsAsRead,
    aiDrawerOpen,
    toggleAiDrawer
  } = usePortal();
  
  const [buyers, setBuyers] = useState<BuyerSpecificProfile[]>(DEFAULT_BUYERS);
  
  // Dropdown states
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState<HeaderNotificationItem[]>(DEFAULT_HEADER_NOTIFICATIONS);
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<'ALL' | 'UNREAD' | 'ORDERS' | 'ASNS' | 'INVOICES' | 'DOCS'>('ALL');

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(item => {
    if (selectedNotifFilter === 'ALL') return true;
    if (selectedNotifFilter === 'UNREAD') return !item.read;
    return item.category === selectedNotifFilter;
  });

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleNotificationRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const handleNotificationClick = (item: HeaderNotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setNotificationsOpen(false);
    // Bell notifications are operational alerts; they do NOT open message/collab threads
    navigate(item.route, {
      ...(item.routeState || {}),
      openCollab: false,
      openMessages: false,
      timestamp: Date.now()
    });
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Messages state synced with PortalContext unreadThreadIds
  const [selectedMsgFilter, setSelectedMsgFilter] = useState<'ALL' | 'UNREAD' | 'ORDERS' | 'ASNS' | 'INVOICES' | 'RFPS' | 'DOCS'>('ALL');

  const normalizeId = (id: string) => id.replace(/^msg-/, '');

  const unreadMessageCount = unreadThreadIds.length;

  const messages: HeaderMessageItem[] = DEFAULT_HEADER_MESSAGES.map(m => {
    const isUnread = unreadThreadIds.includes(normalizeId(m.id));
    return {
      ...m,
      read: !isUnread
    };
  });

  const filteredMessages = messages.filter(item => {
    if (selectedMsgFilter === 'ALL') return true;
    if (selectedMsgFilter === 'UNREAD') return !item.read;
    return item.category === selectedMsgFilter;
  });

  const handleMarkAllMessagesRead = () => {
    markAllThreadsAsRead();
  };

  const handleToggleMessageRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleThreadRead(id);
  };

  const handleMessageClick = (item: HeaderMessageItem) => {
    markThreadAsRead(item.id);
    setMessagesOpen(false);
    navigate(item.route, {
      ...(item.routeState || {}),
      openCollab: true,
      openMessages: true,
      timestamp: Date.now()
    });
  };

  const handleClearAllMessages = () => {
    markAllThreadsAsRead();
  };

  const moreRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);

  // Hover & Click handlers for Message Icon
  const handleMouseEnterMsg = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setMessagesOpen(true);
      setNotificationsOpen(false);
      setUserMenuOpen(false);
    }, 120);
  };

  const handleMouseLeaveMsg = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setMessagesOpen(false);
    }, 250);
  };

  const handleClickMsg = () => {
    setMessagesOpen(prev => !prev);
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  };

  const handleDoubleClickMsg = () => {
    navigate('/communications');
    setMessagesOpen(false);
  };

  // Load connected buyers for the workspace switcher
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const res = await ApiClient.getBuyerProfiles();
        if (res?.buyerProfiles) {
          setBuyers(res.buyerProfiles);
        }
      } catch (err) {
        console.error('Failed to load buyers in header', err);
      }
    };
    fetchBuyers();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (moreRef.current && !moreRef.current.contains(target)) {
        setMoreDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (msgRef.current && !msgRef.current.contains(target)) {
        setMessagesOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOnboarding = currentRoute.startsWith('/onboarding');
  const isProfilePage = currentRoute.startsWith('/public-profile') || currentRoute.startsWith('/profiles') || currentRoute.startsWith('/master-profile');

  const activeBuyer = (() => {
    if (selectedBuyerId === 'buyer-org-1') return buyers.find(b => b.buyerOrgId === 'buyer-org-1') || DEFAULT_BUYERS[0];
    if (selectedBuyerId === 'buyer-org-2') return { ...DEFAULT_BUYERS[1], ...(buyers.find(b => b.buyerOrgId === 'buyer-org-2') || {}), buyerName: 'NovaTech Aerospace & Defense' };
    if (selectedBuyerId === 'buyer-org-3') return { ...DEFAULT_BUYERS[2], ...(buyers.find(b => b.buyerOrgId === 'buyer-org-3') || {}), buyerName: 'Meridian Health Network' };
    if (selectedBuyerId === 'ALL') return isOnboarding ? DEFAULT_BUYERS[0] : null;
    return buyers.find(b => b.buyerOrgId === selectedBuyerId) || buyers[0] || DEFAULT_BUYERS[0];
  })();

  const handleSignOut = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  // 1. Primary visible links (Canonical Source-to-Pay Lifecycle Order)
  const primaryNavLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', title: 'Executive Supplier Overview' },
    { label: 'Onboarding', icon: FileCheck2, route: '/onboarding', title: 'Buyer Onboarding Requests & Qualifications' },
    { label: 'RFPs & Bids', icon: FileText, route: '/rfps', title: 'Enterprise Sourcing & RFPs' },
    { label: 'Orders', icon: ShoppingCart, route: '/orders', title: 'Purchase Orders & Line Items' },
    { label: 'Shipments', icon: Truck, route: '/asns', title: 'Shipping & Advance Shipping Notices (ASN)' },
    { label: 'Invoices', icon: Receipt, route: '/invoices', title: 'Commercial Invoices & 3-Way Match' },
    { label: 'Documents', icon: FolderLock, route: '/documents', title: 'Enterprise Document Vault' }
  ];

  // 2. Secondary links (Governance, Catalog, Identity & Operations in "More" Hub)
  const secondaryNavLinks = [
    { label: 'Collaboration Hub', icon: MessageSquare, route: '/communications', title: 'Transactional Messaging & Collaboration Hub' },
    { label: 'Catalog', icon: Package, route: '/catalog', title: 'Item Master & Product Catalog' },
    { label: 'Public Profile', icon: Globe, route: '/public-profile', title: 'Master Public Profile & Connected Buyers' },
    { label: 'All Transactions', icon: Layers, route: '/transactions', title: 'Consolidated Cross-Buyer Financial Ledger' },
    { label: 'Task Queue', icon: ClipboardList, route: '/tasks', badge: '4', title: 'Operational Tasks & Approvals' }
  ];

  const isLinkActive = (route: string) => {
    if (route === '/dashboard' && (currentRoute === '/' || currentRoute === '/dashboard')) return true;
    if (route === '/onboarding' && (currentRoute.startsWith('/onboarding') || currentRoute.startsWith('/onboarding-request'))) return true;
    if (route === '/orders' && (currentRoute.startsWith('/orders') || currentRoute.startsWith('/purchase-orders'))) return true;
    if (route === '/asns' && (currentRoute.startsWith('/asns') || currentRoute.startsWith('/shipping') || currentRoute.startsWith('/shipments'))) return true;
    if (route === '/invoices' && currentRoute.startsWith('/invoices')) return true;
    if (route === '/rfps' && (currentRoute.startsWith('/rfps') || currentRoute.startsWith('/sourcing') || currentRoute.startsWith('/bids'))) return true;
    if (route === '/catalog' && (currentRoute.startsWith('/catalog') || currentRoute.startsWith('/catalog-vault'))) return true;
    if (route === '/documents' && (currentRoute.startsWith('/documents') || currentRoute.startsWith('/vault') || currentRoute.startsWith('/doc-vault'))) return true;
    if (route === '/workspaces' && (currentRoute.startsWith('/workspaces') || currentRoute.startsWith('/clients'))) return true;
    if (route === '/transactions' && currentRoute.startsWith('/transactions')) return true;
    if (route === '/tasks' && (currentRoute.startsWith('/tasks') || currentRoute.startsWith('/queue'))) return true;
    if (route === '/public-profile' && (currentRoute.startsWith('/public-profile') || currentRoute.startsWith('/profiles') || currentRoute.startsWith('/master-profile'))) return true;
    if (route === '/communications' && (currentRoute.startsWith('/communications') || currentRoute.startsWith('/messages'))) return true;
    return false;
  };

  const activeSecondaryLink = secondaryNavLinks.find(link => isLinkActive(link.route));
  const allNavModules = [...primaryNavLinks, ...secondaryNavLinks];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white select-none sticky top-0 z-50 shadow-md">
      {/* Main navigation header */}
      <div className="px-3 sm:px-4 lg:px-6 py-2.5 flex items-center justify-between gap-2 lg:gap-4">
        <div className="flex items-center space-x-3 lg:space-x-4 min-w-0">
          {/* Brand Logo & Name */}
          <VerisourceLogo size="sm" theme="dark" onClick={() => navigate('/dashboard')} />

          {/* Subtle Vertical Divider between Brand & Modules */}
          <div className="hidden lg:block h-5 w-px bg-slate-800 shrink-0"></div>

          {/* Primary Navigation Links + Merged Navigation Hub */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
            {primaryNavLinks.map((item) => {
              const active = isLinkActive(item.route);
              const Icon = item.icon;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  title={item.title || item.label}
                  className={`flex items-center space-x-1.5 px-2 xl:px-2.5 py-1.5 rounded-lg text-xs transition-all relative cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'} shrink-0`} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
                  )}
                </button>
              );
            })}

            {/* MERGED "MORE" / NAVIGATION HUB TAB */}
            <div className="relative shrink-0" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(prev => !prev)}
                className={`flex items-center space-x-1.5 px-2 xl:px-2.5 py-1.5 rounded-lg text-xs transition-all relative cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSecondaryLink || moreDropdownOpen
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                }`}
                title={activeSecondaryLink ? `More Modules • Active: ${activeSecondaryLink.label}` : 'More Modules'}
              >
                <LayoutGrid className={`w-3.5 h-3.5 ${activeSecondaryLink || moreDropdownOpen ? 'text-emerald-400' : 'text-slate-400'} shrink-0`} />
                <span>More</span>
                {activeSecondaryLink && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
                )}
                <ChevronDown className={`w-3 h-3 ${activeSecondaryLink || moreDropdownOpen ? 'text-emerald-400' : 'text-slate-400'} transition-transform ${moreDropdownOpen ? 'rotate-180' : ''} shrink-0`} />
              </button>

              {/* PURE OVERFLOW DROPDOWN (ONLY HIDDEN / SECONDARY MODULES - ZERO DUPLICATION) */}
              {moreDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-56 sm:w-60 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Clean Header */}
                  <div className="px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-white tracking-tight">
                        More Modules
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {secondaryNavLinks.length} Modules
                    </span>
                  </div>

                  {/* Single Column List with Module Names Only */}
                  <div className="p-1.5 space-y-0.5">
                    {secondaryNavLinks.map((item) => {
                      const active = isLinkActive(item.route);
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.route}
                          onClick={() => {
                            navigate(item.route);
                            setMoreDropdownOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition group cursor-pointer ${
                            active
                              ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-xs font-bold ${
                              active 
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                                : 'bg-slate-800 border-slate-700 text-slate-300 group-hover:text-emerald-400'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-xs truncate group-hover:text-white flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-slate-950">
                                  {item.badge}
                                </span>
                              )}
                            </span>
                          </div>
                          {active && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right side: Bell Notifications, AI Copilot & Active User Dropdown */}
        <div className="flex items-center space-x-2.5">
          {/* 1. BELL NOTIFICATIONS DROPDOWN */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(prev => !prev);
                setUserMenuOpen(false);
                setMessagesOpen(false);
                setMoreDropdownOpen(false);
              }}
              className={`relative p-2 rounded-xl transition cursor-pointer ${
                notificationsOpen
                  ? 'bg-slate-800 text-white ring-1 ring-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Notifications & Alerts"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Modern Minimalist Notifications Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2.5 w-84 sm:w-[410px] md:w-[430px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800 select-none">
                
                {/* Header */}
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 tracking-tight">
                          Notifications
                        </span>
                        {unreadNotificationCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {unreadNotificationCount} new
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                            All caught up
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">System & operational status alerts</p>
                    </div>
                  </div>

                  {unreadNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Minimalist Horizontal Filter Strip */}
                <div className="px-3.5 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center space-x-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'ALL', label: `All (${notifications.length})` },
                    { id: 'UNREAD', label: `Unread (${unreadNotificationCount})` },
                    { id: 'ORDERS', label: 'Orders' },
                    { id: 'ASNS', label: 'Shipments' },
                    { id: 'INVOICES', label: 'Invoices' },
                    { id: 'DOCS', label: 'Compliance' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedNotifFilter(tab.id as any)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition cursor-pointer shrink-0 ${
                        selectedNotifFilter === tab.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-slate-200/70'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Notification Items List */}
                <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-10 px-4 text-center">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">All caught up</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedNotifFilter === 'UNREAD' ? 'No unread notifications.' : 'No notifications in this category.'}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map(item => {
                      const IconComponent = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3 sm:p-3.5 transition flex items-start space-x-3 cursor-pointer group relative ${
                            !item.read ? 'bg-emerald-50/20 hover:bg-emerald-50/45' : 'hover:bg-slate-50/90'
                          }`}
                        >
                          {/* Category Icon */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 shadow-2xs ${item.badgeStyle.iconBg}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          {/* Text Content */}
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${item.badgeStyle.bg} ${item.badgeStyle.text} ${item.badgeStyle.border}`}>
                                  {item.categoryLabel}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal truncate">
                                  {item.time}
                                </span>
                              </div>
                              
                              {!item.read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" title="Unread"></span>
                              )}
                            </div>

                            <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {item.message}
                            </p>
                          </div>

                          {/* Quick Mark Read / Unread toggle */}
                          <div className="shrink-0 flex items-center pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => handleToggleNotificationRead(item.id, e)}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              title={item.read ? "Mark as unread" : "Mark as read"}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Minimal Footer */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { navigate('/dashboard'); setNotificationsOpen(false); }}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer transition"
                  >
                    <span>Operational Dashboard</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllNotifications}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. MESSAGE / CHAT COLLABORATION ICON WITH HOVER PREVIEW & DOUBLE CLICK */}
          <div 
            className="relative" 
            ref={msgRef}
            onMouseEnter={handleMouseEnterMsg}
            onMouseLeave={handleMouseLeaveMsg}
          >
            <button
              onClick={handleClickMsg}
              onDoubleClick={handleDoubleClickMsg}
              className={`relative p-2 rounded-xl transition cursor-pointer ${
                currentRoute.startsWith('/communications') || currentRoute.startsWith('/messages') || messagesOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={messagesOpen ? undefined : (unreadMessageCount > 0 ? "Messages • Double-click to open Hub" : "Messages")}
            >
              <MessageSquare className="w-4.5 h-4.5" />
              {unreadMessageCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                  {unreadMessageCount}
                </span>
              )}
            </button>

            {/* Minimal & Clear Messages Popover (Aligned with Notifications UI & Latest Pages) */}
            {messagesOpen && (
              <div 
                className="absolute right-0 mt-2 w-88 sm:w-[420px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md"
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                }}
                onMouseLeave={handleMouseLeaveMsg}
              >
                {/* Clean Header */}
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 tracking-tight">
                          Messages
                        </span>
                        {unreadMessageCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {unreadMessageCount} new
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                            All caught up
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">Buyer inquiries & collaboration threads</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {unreadMessageCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllMessagesRead}
                        className="text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer"
                        title="Mark all messages as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMessagesOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs matching Notifications */}
                <div className="px-3 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'UNREAD', label: `Unread (${unreadMessageCount})` },
                    { id: 'ORDERS', label: 'Orders' },
                    { id: 'ASNS', label: 'Shipments' },
                    { id: 'INVOICES', label: 'Invoices' },
                    { id: 'RFPS', label: 'RFPs' },
                    { id: 'DOCS', label: 'Compliance' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedMsgFilter(tab.id as any)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition cursor-pointer shrink-0 ${
                        selectedMsgFilter === tab.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-slate-200/70'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Message Threads List */}
                <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                  {filteredMessages.length === 0 ? (
                    <div className="py-10 px-4 text-center">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">No messages</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedMsgFilter === 'UNREAD' ? 'All conversations are read.' : 'No messages in this category.'}
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleMessageClick(item)}
                        className={`p-3 sm:p-3.5 transition flex items-start space-x-3 cursor-pointer group relative ${
                          !item.read ? 'bg-emerald-50/20 hover:bg-emerald-50/45' : 'hover:bg-slate-50/90'
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-transform group-hover:scale-105 shadow-2xs ${item.avatarColor ? `${item.avatarColor.bg} ${item.avatarColor.text}` : 'bg-slate-100 text-slate-700'}`}>
                          {item.initials || item.senderName.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-xs truncate ${!item.read ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                                {item.senderName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal truncate">
                                • {item.buyerName}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                              {item.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                              {item.docTag}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate">
                              {item.categoryLabel}
                            </span>
                          </div>

                          <p className={`text-[11px] line-clamp-1 ${!item.read ? 'text-slate-800 font-normal' : 'text-slate-500'}`}>
                            {item.message}
                          </p>
                        </div>

                        {/* Unread Indicator & Mark Read Button */}
                        <div className="shrink-0 flex items-center space-x-1 self-center">
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleToggleMessageRead(item.id, e)}
                            className="p-1 rounded-md text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title={item.read ? "Mark unread" : "Mark read"}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Minimal Footer */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { navigate('/communications'); setMessagesOpen(false); }}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer transition"
                  >
                    <span>Open Collaboration Hub</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllMessages}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ava Agent - Universal Autonomous Copilot */}
          <button
            onClick={() => {
              if (currentRoute.startsWith('/onboarding/detail') || currentRoute.startsWith('/onboarding-request')) {
                window.dispatchEvent(new CustomEvent('verisource:toggle-ava'));
                if (onToggleAi) onToggleAi();
              } else {
                if (onToggleAi) {
                  onToggleAi();
                } else {
                  toggleAiDrawer();
                }
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition shadow-xs shrink-0 cursor-pointer text-xs font-semibold ${
              aiDrawerOpen
                ? 'bg-emerald-600 text-white border border-emerald-400/50 shadow-emerald-600/20'
                : 'bg-emerald-600/90 hover:bg-emerald-600 text-white border border-emerald-500/40 hover:border-emerald-400/50 shadow-emerald-600/20'
            }`}
            title={`Ava Agent • ${getPageContextTitle(currentRoute)}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Ava Agent</span>
            <span className={`w-1.5 h-1.5 rounded-full ${aiDrawerOpen ? 'bg-emerald-300' : 'bg-emerald-400'} animate-pulse shrink-0`}></span>
          </button>

          {/* 2. ACTIVE USER ICON WITH 5-ITEM DROPDOWN + SIGN OUT */}
          <div className="relative pl-2 border-l border-slate-800" ref={userRef}>
            <button
              onClick={() => {
                setUserMenuOpen(prev => !prev);
                setNotificationsOpen(false);
                setMessagesOpen(false);
              }}
              className="flex items-center space-x-2 focus:outline-none group"
              title="User Account & Navigation"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white font-bold text-xs border border-emerald-400/80 shadow-xs group-hover:scale-105 transition-transform">
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu (4-5 Items + Sign Out) */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User info banner */}
                <div className="p-4 bg-slate-950 border-b border-slate-800">
                  <div className="font-bold text-xs text-white truncate">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
                  <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 truncate">
                    {currentUser?.organizationName && currentUser.organizationName !== 'Nexura Global Analytics Inc.' ? currentUser.organizationName : 'Acme Industrial Tech Inc.'}
                  </div>
                </div>

                {/* 6 Distinct Navigation Items (Concise & Clean) */}
                <div className="py-1 text-xs">
                  {/* Item 1: Master Public Profile */}
                  <button
                    onClick={() => { navigate('/public-profile'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Master Public Profile</span>
                  </button>

                  {/* Item 2: Buyer Onboarding Requests */}
                  <button
                    onClick={() => { navigate('/onboarding'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span>Buyer Onboarding Requests</span>
                  </button>

                  {/* Item 3: Task Queue */}
                  <button
                    onClick={() => { navigate('/tasks'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <ClipboardList className="w-4 h-4 text-amber-400" />
                    <span>Task Queue</span>
                  </button>

                  {/* Item 4: Document Vault */}
                  <button
                    onClick={() => { navigate('/documents'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <FolderLock className="w-4 h-4 text-teal-400" />
                    <span>Document Vault</span>
                  </button>

                  {/* Item 5: Catalog Vault */}
                  <button
                    onClick={() => { navigate('/catalog'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <Package className="w-4 h-4 text-indigo-400" />
                    <span>Catalog Vault</span>
                  </button>

                  {/* Item 6: Profile & Settings */}
                  <button
                    onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center space-x-2.5 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Profile & Settings</span>
                  </button>
                </div>

                {/* Sign Out Option */}
                <div className="p-1.5 bg-slate-950/80 border-t border-slate-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Secondary Nav Strip (lg:hidden) */}
      <div className="lg:hidden px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        {allNavModules.map((item) => {
          const active = isLinkActive(item.route);
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs shrink-0 transition ${
                active
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
