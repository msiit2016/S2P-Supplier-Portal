/**
 * Verisource Multi-Agent Network & Subagents Registry
 * 
 * Defines the specialized domain subagents orchestrated by Ava:
 * 1. Master Orchestrator (Autonomous S2P Intelligence)
 * 2. Onboarding & Qualification Agent (/onboarding)
 * 3. Purchase Order Fulfillment Agent (/orders)
 * 4. Commercial Invoicing & Cash Discounting Agent (/invoices)
 * 5. Logistics & Advance Shipping Notice (ASN) Agent (/asns)
 * 6. Sourcing & RFP Bidding Agent (/rfps)
 * 7. Compliance & Document Vault Agent (/documents)
 * 8. Task & Executive Supervisor Agent (/tasks, /dashboard)
 */

import {
  Sparkles,
  FileCheck2,
  ShoppingCart,
  Receipt,
  Truck,
  FileText,
  ShieldCheck,
  ClipboardList,
  Layers,
  Zap,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Plus,
  Filter,
  Clock,
  RefreshCw
} from 'lucide-react';

export type SubagentId =
  | 'ORCHESTRATOR'
  | 'ONBOARDING'
  | 'ORDERS'
  | 'INVOICES'
  | 'SHIPPING'
  | 'RFPS'
  | 'DOCUMENTS'
  | 'TASKS';

export interface SubagentTool {
  name: string;
  description: string;
  icon?: any;
}

export interface SubagentConfig {
  id: SubagentId;
  name: string;
  shortName: string;
  role: string;
  description: string;
  badge: string;
  badgeColor: string; // Tailwind color classes
  icon: any;
  routeScope: string[];
  tools: SubagentTool[];
  quickPrompts: Array<{ label: string; prompt: string; icon: any }>;
}

export const SUBAGENTS_REGISTRY: Record<SubagentId, SubagentConfig> = {
  ORCHESTRATOR: {
    id: 'ORCHESTRATOR',
    name: 'Executive Operations Supervisor',
    shortName: 'Executive Supervisor',
    role: 'Autonomous Source-to-Pay Intelligence',
    description: 'Context-aware master agent routing requests across all enterprise modules and subagents.',
    badge: 'Executive Supervisor',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: Sparkles,
    routeScope: ['/dashboard', '/all-transactions', '/catalog', '/settings'],
    tools: [
      { name: 'delegateToSubagent', description: 'Routes complex domain intent to specialized subagent' },
      { name: 'retrievePageContext', description: 'Reads real-time state from current page' },
      { name: 'executePageMutation', description: 'Commits verified updates to bilateral database' },
      { name: 'parseUploadedDocument', description: 'OCR extraction of sheets, invoices, or certificates' }
    ],
    quickPrompts: [
      { label: 'Summarize Today\'s Priorities', prompt: 'What are my top bottlenecks across all buyers today?', icon: Zap },
      { label: 'Accelerate Cash Flow', prompt: 'Which invoices are eligible for early payment acceleration?', icon: DollarSign },
      { label: 'Check Compliance Health', prompt: 'Are any certificates or insurance riders expiring soon?', icon: ShieldCheck }
    ]
  },

  ONBOARDING: {
    id: 'ONBOARDING',
    name: 'Onboarding Agent',
    shortName: 'Onboarding',
    role: 'Buyer Dossier & Qualification Specialist',
    description: 'Assists with buyer registration questionnaires, tax certs, KYC verification, and ITAR qualifications.',
    badge: 'Onboarding Agent',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: FileCheck2,
    routeScope: ['/onboarding', '/onboarding/detail', '/onboarding-request'],
    tools: [
      { name: 'extractDocumentOCR', description: 'Extracts company name, GSTIN, PAN, address from uploaded sheets' },
      { name: 'renderInteractiveMiniForm', description: 'Displays partial view form for missing required fields' },
      { name: 'autoFillQuestionnaire', description: 'Pre-populates questionnaire stages from Master Profile' },
      { name: 'validateComplianceStage', description: 'Runs 100% deterministic check on defense/clinical standards' }
    ],
    quickPrompts: [
      { label: 'Which requests need action?', prompt: 'Which buyer onboarding requests require immediate action or attestation?', icon: AlertTriangle },
      { label: 'Open NovaTech ITAR Questionnaire', prompt: 'What compliance items are needed for NovaTech Aerospace onboarding?', icon: ShieldCheck },
      { label: 'Enter Invitation Code', prompt: 'How do I enter and redeem a new buyer invitation code?', icon: Plus }
    ]
  },

  ORDERS: {
    id: 'ORDERS',
    name: 'Purchase Order Agent',
    shortName: 'Purchase Orders',
    role: 'PO Fulfillment & Contracting Specialist',
    description: 'Inspects purchase orders, line item revisions, milestone acknowledgements, and 1-click flips.',
    badge: 'PO Agent',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: ShoppingCart,
    routeScope: ['/orders', '/order-detail'],
    tools: [
      { name: 'inspectActivePO', description: 'Retrieves current purchase order header, line items, and milestones' },
      { name: 'proposePOFieldDiff', description: 'Creates a review version diff with Confirm & Apply button' },
      { name: 'flipPOToInvoice', description: 'Executes 1-click PO-to-Invoice generation with line item matching' },
      { name: 'flipPOToAsn', description: 'Executes 1-click Advance Shipping Notice creation from PO' },
      { name: 'acknowledgeOrder', description: 'Counter-signs purchase order with bilateral timestamp' }
    ],
    quickPrompts: [
      { label: 'Which orders need action?', prompt: 'Which purchase orders are pending review or fulfillment?', icon: ShoppingCart },
      { label: 'Show Orders in Transit', prompt: 'List all purchase orders currently dispatched and in transit', icon: Truck },
      { label: 'Filter by Apex Global', prompt: 'Show purchase orders from Apex Global Enterprises', icon: Filter }
    ]
  },

  INVOICES: {
    id: 'INVOICES',
    name: 'Invoicing & Liquidity Agent',
    shortName: 'Invoicing',
    role: '3-Way Match & Dynamic Discounting Specialist',
    description: 'Validates commercial invoices, checks AP discrepancy flags, and executes early payout calculations.',
    badge: 'Invoice Agent',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    icon: Receipt,
    routeScope: ['/invoices', '/invoice-detail'],
    tools: [
      { name: 'evaluate3WayMatch', description: 'Cross-references invoice line items against PO and ASN' },
      { name: 'renderEarlyPayoutSlider', description: 'Inline interactive early liquidity accelerator partial view' },
      { name: 'proposeInvoiceCorrection', description: 'Creates a proposed review version for discrepancy reconciliation' },
      { name: 'executeNachaFedwirePayout', description: 'Activates same-day liquidity deposit to verified SVB account' }
    ],
    quickPrompts: [
      { label: 'Eligible Early Payouts', prompt: 'Which invoices are eligible for early payment acceleration?', icon: DollarSign },
      { label: 'Check 3-Way Match Status', prompt: 'Show commercial invoices with 100% 3-way matching verified', icon: ShieldCheck },
      { label: 'Summarize Cash Flow', prompt: 'Summarize total approved receivables and pending disbursements', icon: Zap }
    ]
  },

  SHIPPING: {
    id: 'SHIPPING',
    name: 'Logistics & ASN Agent',
    shortName: 'Logistics',
    role: 'Carrier Tracking & EDI 856 ASN Specialist',
    description: 'Manages shipments, carrier PRO numbers, package serialization, and dock clearance notices.',
    badge: 'Logistics Agent',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Truck,
    routeScope: ['/asns', '/shipments'],
    tools: [
      { name: 'inspectActiveASN', description: 'Reads tracking number, freight carrier, and dispatched line units' },
      { name: 'updateCarrierTracking', description: 'Updates carrier PRO number with live status diff' },
      { name: 'dispatchEdi856Asn', description: 'Dispatches Advance Shipping Notice under EDI 856 protocol' },
      { name: 'estimateDockClearance', description: 'Calculates estimated dock arrival and receiver acceptance' }
    ],
    quickPrompts: [
      { label: 'Check In-Transit Shipments', prompt: 'List all shipments currently in transit to buyer depots', icon: Zap },
      { label: 'Carrier Tracking Details', prompt: 'Show carrier tracking and PRO numbers for active shipments', icon: Truck },
      { label: 'Delivered Shipments', prompt: 'Show shipments confirmed as delivered at buyer receiving docks', icon: FileCheck2 }
    ]
  },

  RFPS: {
    id: 'RFPS',
    name: 'Sourcing & RFP Agent',
    shortName: 'Sourcing & RFPs',
    role: 'Tender Analysis & Bid Strategy Specialist',
    description: 'Analyzes enterprise RFPs, calculates competitive margin discounts, and drafts compliant tender proposals.',
    badge: 'RFP Agent',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: FileText,
    routeScope: ['/rfps', '/rfps/detail'],
    tools: [
      { name: 'analyzeTenderScope', description: 'Extracts deliverable units, buyer budget ceiling, and closing SLA' },
      { name: 'draftCompetitiveBid', description: 'Calculates optimal price margin with competitive edge discount' },
      { name: 'submitProposalTender', description: 'Prepares final proposal packet conforming to buyer criteria' }
    ],
    quickPrompts: [
      { label: 'Which tenders close soonest?', prompt: 'Which RFP tenders have the nearest submission deadline?', icon: Clock },
      { label: 'Highest Value Tenders', prompt: 'Show the highest value sourcing opportunities in the pipeline', icon: DollarSign },
      { label: 'Tenders Requiring Action', prompt: 'Filter sourcing events to show tenders requiring proposal preparation', icon: AlertTriangle }
    ]
  },

  DOCUMENTS: {
    id: 'DOCUMENTS',
    name: 'Compliance Vault Agent',
    shortName: 'Compliance Vault',
    role: 'Regulatory & Credentialing Specialist',
    description: 'Monitors ACORD 25 COI, W-9, ISO/SOC-2 certificates, expiry notifications, and audit integrity.',
    badge: 'Vault Agent',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: ShieldCheck,
    routeScope: ['/documents', '/doc-vault'],
    tools: [
      { name: 'verifyCertificateIntegrity', description: 'Inspects SHA-256 checksums and issuing authorities' },
      { name: 'scanExpiringCertificates', description: 'Flags documents due for renewal within 30 days' },
      { name: 'syncMasterProfileCredentials', description: 'Syncs verified credentials across connected buyer dossiers' }
    ],
    quickPrompts: [
      { label: 'Check Expiring Certificates', prompt: 'Are any liability insurance certificates or documents expiring soon?', icon: ShieldCheck },
      { label: 'Audit W-9 Verification', prompt: 'Verify IRS Form W-9 TIN conformity with corporate identity', icon: FileCheck2 },
      { label: 'Re-sync Credentials', prompt: 'Push updated credentials to all connected buyer workspaces', icon: RefreshCw }
    ]
  },

  TASKS: {
    id: 'TASKS',
    name: 'Task Prioritization Agent',
    shortName: 'Tasks & Actions',
    role: 'Bottleneck Resolution & SLA Prioritization',
    description: 'Aggregates urgent enterprise action items, SLA milestones, and unblocks pending transactions.',
    badge: 'Operations Agent',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: ClipboardList,
    routeScope: ['/tasks', '/dashboard'],
    tools: [
      { name: 'gatherBottlenecks', description: 'Scans all connected buyer workflows for action-required items' },
      { name: 'autoResolveTask', description: 'Executes prerequisite step and marks operational task complete' }
    ],
    quickPrompts: [
      { label: 'View Urgent Bottlenecks', prompt: 'Show me urgent tasks needing supplier action today', icon: Zap },
      { label: 'Unblock NovaTech Dossier', prompt: 'What is blocking the NovaTech Aerospace onboarding review?', icon: AlertTriangle }
    ]
  }
};

/**
 * Automatically determine the most relevant subagent based on current route and user query keywords
 */
export function determineSubagent(
  currentRoute: string,
  userQuery: string = '',
  forcedSubagentId?: SubagentId
): SubagentConfig {
  if (forcedSubagentId && forcedSubagentId !== 'ORCHESTRATOR' && SUBAGENTS_REGISTRY[forcedSubagentId]) {
    return SUBAGENTS_REGISTRY[forcedSubagentId];
  }

  const queryLower = userQuery.toLowerCase();

  // Intent keyword routing
  if (
    queryLower.includes('tax certificate') ||
    queryLower.includes('onboard') ||
    queryLower.includes('dossier') ||
    queryLower.includes('kyc') ||
    queryLower.includes('gstin') ||
    queryLower.includes('pan card') ||
    queryLower.includes('basic details')
  ) {
    return SUBAGENTS_REGISTRY.ONBOARDING;
  }

  if (
    queryLower.includes('early pay') ||
    queryLower.includes('discount') ||
    queryLower.includes('liquidity') ||
    queryLower.includes('payout') ||
    queryLower.includes('3-way match') ||
    queryLower.includes('invoice') ||
    queryLower.includes('inv-')
  ) {
    return SUBAGENTS_REGISTRY.INVOICES;
  }

  if (
    queryLower.includes('carrier') ||
    queryLower.includes('tracking') ||
    queryLower.includes('asn') ||
    queryLower.includes('shipment') ||
    queryLower.includes('edi 856') ||
    queryLower.includes('delivery date')
  ) {
    return SUBAGENTS_REGISTRY.SHIPPING;
  }

  if (
    queryLower.includes('purchase order') ||
    queryLower.includes('po-') ||
    queryLower.includes('line item') ||
    queryLower.includes('acknowledge po') ||
    queryLower.includes('payment terms') ||
    queryLower.includes('flip po')
  ) {
    return SUBAGENTS_REGISTRY.ORDERS;
  }

  if (
    queryLower.includes('rfp') ||
    queryLower.includes('tender') ||
    queryLower.includes('bid') ||
    queryLower.includes('proposal')
  ) {
    return SUBAGENTS_REGISTRY.RFPS;
  }

  if (
    queryLower.includes('certificate') ||
    queryLower.includes('coi') ||
    queryLower.includes('insurance') ||
    queryLower.includes('w-9') ||
    queryLower.includes('soc 2') ||
    queryLower.includes('iso')
  ) {
    return SUBAGENTS_REGISTRY.DOCUMENTS;
  }

  // Route-based default
  if (currentRoute.startsWith('/onboarding')) return SUBAGENTS_REGISTRY.ONBOARDING;
  if (currentRoute.startsWith('/orders')) return SUBAGENTS_REGISTRY.ORDERS;
  if (currentRoute.startsWith('/invoices')) return SUBAGENTS_REGISTRY.INVOICES;
  if (currentRoute.startsWith('/asns') || currentRoute.startsWith('/shipments')) return SUBAGENTS_REGISTRY.SHIPPING;
  if (currentRoute.startsWith('/rfps')) return SUBAGENTS_REGISTRY.RFPS;
  if (currentRoute.startsWith('/documents') || currentRoute.startsWith('/doc-vault')) return SUBAGENTS_REGISTRY.DOCUMENTS;
  if (currentRoute.startsWith('/tasks')) return SUBAGENTS_REGISTRY.TASKS;

  return SUBAGENTS_REGISTRY.ORCHESTRATOR;
}

