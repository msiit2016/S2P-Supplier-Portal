import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { PurchaseOrder, POLineItem, TransactionComment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { formatDateMMDDYYYY } from '../../utils/dateUtils.js';
import { downloadOrderPdf } from '../../utils/documentPdfGenerator.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { useSupplierSettings } from '../../services/supplierSettingsService.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Truck, 
  Receipt, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search, 
  Printer, 
  ArrowLeft, 
  ArrowRight,
  MessageSquare, 
  Send, 
  Sparkles, 
  Download, 
  X, 
  Layers, 
  Building,
  Building2, 
  User,
  Mail,
  Phone,
  MapPin,
  AlertTriangle, 
  DollarSign,
  Edit3,
  Save,
  ShieldCheck,
  Calendar,
  Info,
  Check,
  FileCheck,
  Plus,
  Eye,
  Calculator,
  Trash2,
  Paperclip,
  Upload,
  Tag,
  Globe,
  Percent,
  Hash
} from 'lucide-react';

const SUPPLIER_PRESETS = [
  {
    name: 'CloudBridge Solutions LLC',
    pan: 'AAACB1234F',
    gst: '27AAACB1234F1Z5',
    address: '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
    contacts: [
      { name: 'Elena Rostova', email: 'elena.rostova@cloudbridge.io', phone: '+1 (555) 382-9102' },
      { name: 'Marcus Vance', email: 'marcus.vance@cloudbridge.io', phone: '+1 (555) 491-2094' }
    ]
  },
  {
    name: 'Acme Industrial Tech Inc.',
    pan: 'AAACA5678K',
    gst: '06AAACA5678K1Z2',
    address: '1200 Innovation Way, Suite 400, Chicago, IL 60601',
    contacts: [
      { name: 'Robert Tanaka', email: 'r.tanaka@acmeindustrial.com', phone: '+1 (312) 880-1920' },
      { name: 'Sarah Lin', email: 's.lin@acmeindustrial.com', phone: '+1 (312) 880-1925' }
    ]
  },
  {
    name: 'Apex Global Enterprises',
    pan: 'AAACA9999M',
    gst: '36AAACA9999M1Z9',
    address: '1020 Logistics Blvd, Austin, TX 78728',
    contacts: [
      { name: 'David Vance', email: 'david.vance@apexglobal.com', phone: '+1 (512) 670-3300' }
    ]
  }
];

const BUYER_COMPANY_PRESETS = [
  { id: 'buyer-org-1', name: 'Apex Global Enterprises', billingAddress: 'Apex Global AP Shared Services, PO Box 8802, New York, NY 10001' },
  { id: 'buyer-org-2', name: 'NovaTech Flight Systems', billingAddress: 'NovaTech Aerospace & Defense Electronic Invoicing AP Desk, PO Box 3310, Seattle, WA 98101' },
  { id: 'buyer-org-3', name: 'Meridian Health Network', billingAddress: 'Meridian Health Network AP Shared Services, 4200 Medical Center Way, Chicago, IL 60611' }
];

const DELIVERY_ADDRESS_PRESETS = [
  'Apex Global Logistics Center - Receiving Bay 14, 1020 Logistics Blvd, Austin, TX 78728',
  'NovaTech Flight Systems Facility B - Receiving Dock 3, 4800 Aerospace Parkway, Huntsville, AL 35806',
  'Meridian Data Center — Bay 14, 7800 Technology Boulevard, Dock B, Naperville, IL 60563',
  'Global MedTech Central Distribution Hub - Bay 4, 3400 Life Science Pkwy, Boston, MA 02115'
];

const LINE_ITEM_CATALOG_PRESETS = [
  { name: 'Enterprise Compute Node 64GB', description: 'Enterprise Compute Node 64GB DDR5 / 32-Core Xeon Scalable Processor', partNumber: 'ACM-NODE-64GB', unitPrice: 8200 },
  { name: 'Platinum 24/7 SLA Maintenance', description: 'Platinum 24/7 Mission-Critical Hardware Maintenance & Remote SRE SLA (1 Yr)', partNumber: 'ACM-SLA-PREM', unitPrice: 8400 },
  { name: 'Component Deliverable', description: 'New Milestone / Component Deliverable with Telemetry Validation', partNumber: 'ACM-SPEC-03', unitPrice: 2500 },
  { name: 'Edge Telemetry Gateway', description: 'Radiation-Hardened Edge Telemetry Streaming Gateway for Real-Time Telemetry', partNumber: 'TEL-GW-2026', unitPrice: 3800 },
  { name: 'Optical Transceiver 100G', description: 'Optical Transceiver Module 100G QSFP28 Direct-Attach Copper Cable', partNumber: 'OPT-100G-SR4', unitPrice: 420 },
  { name: 'Rack Mount Rail Kit & PDU', description: 'Rack Mount Rail Kit & Dual-Redundant Power Distribution Unit (PDU)', partNumber: 'ACC-RAIL-PDU', unitPrice: 650 },
  { name: 'S2P Pipeline Integration', description: 'S2P Pipeline Integration & Custom Electronic Data Interchange PunchOut EDI Connector', partNumber: 'ACM-SVC-01', unitPrice: 228.57 }
];

const CONTRACT_PRESETS = [
  'CNT-2026-CLOUD-01',
  'CNT-2026-HEALTH-01',
  'CNT-2026-AERO-99',
  'CNT-2026-GLOBAL-88',
  'Standard Master SOW'
];

export const RICH_DEFAULT_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101-meridian',
    poNumber: 'PO-2026-101',
    poName: 'Enterprise Cloud Server Deployment & Bay 14 Infrastructure',
    buyerOrgId: 'buyer-org-3',
    companyName: 'Meridian Health Network',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    supplierContactName: 'Elena Rostova',
    supplierContactEmail: 'elena.rostova@cloudbridge.io',
    supplierContactPhone: '+1 (555) 382-9102',
    supplierAddress: '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
    supplierPan: 'AAACB1234F',
    supplierGst: '27AAACB1234F1Z5',
    status: 'ACKNOWLEDGED', // Displays as Approved & Released per PDF spec
    orderDate: '2026-10-28T09:00:00Z',
    requestDate: '2026-10-28',
    deliveryDate: '2026-11-12',
    promisedDate: '2026-11-12T16:00:00Z',
    eventReference: 'EVT-RFX-2026-088',
    linkedPrs: 'PR-2026-10928',
    isUrgent: false,
    reasonForOrdering: '',
    projectName: 'Project Hypervisor - Bay 14 Healthcare Private Cloud',
    termsAndConditions: 'Master Healthcare IT Services Agreement v3.4 & HIPAA Security Addendum',
    attachments: ['PO-101-Master-Contract.pdf', 'Bay14-Spec-Architecture.pdf'],
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    exchangeRate: 1.00,
    subtotal: 45000.00,
    taxAmount: 0.00,
    totalAmount: 45000.00,
    shippingAddress: 'Meridian Data Center — Bay 14\nAttn: IT Infrastructure Operations\n7800 Technology Boulevard, Dock B\nNaperville, IL 60563\nReceiving Hours: Mon–Fri, 08:00 – 16:00 CST',
    billingAddress: 'Meridian Health Network\nProcurement & Supply Chain Division\n4200 Medical Center Way, Suite 800\nChicago, IL 60611 • procurement@meridianhealth.org',
    buyerContactName: 'Sarah Chen (Lead Procurement)',
    acknowledgedAt: '2026-10-28T14:20:00Z',
    acknowledgedBy: 'Authorized Representative (CloudBridge)',
    asnNumber: 'ASN-2026-088',
    notes: 'Enterprise Cloud Server Deployment (Bay 14 Rack Infrastructure Provisioning & Hypervisor Setup)',
    lineItems: [
      {
        id: 'poli-101-m1',
        itemNumber: 1,
        partNumber: 'INFRA-SRV-2026-B14',
        description: 'Enterprise Cloud Server Deployment (Bay 14 Rack Infrastructure Provisioning & Hypervisor Setup)',
        contract: 'CNT-2026-HEALTH-01',
        quantity: 1,
        uom: 'EA',
        unitPrice: 28500.00,
        taxCode: 'TAX-EXEMPT',
        taxRate: 0,
        taxAmount: 0.00,
        totalPrice: 28500.00,
        exchangeRate: 1.00,
        priceInBaseCurrency: 28500.00,
        supplierInstructions: 'Deliver directly to Bay 14 Clean Room under anti-static protocols.',
        internalComments: 'CapEx approved under IT infrastructure modernization grant.',
        attachments: ['Rack-Topology.pdf'],
        deliveryDate: '2026-11-12',
        invoicedQuantity: 1
      },
      {
        id: 'poli-101-m2',
        itemNumber: 2,
        partNumber: 'SEC-SOC2-CONFIG',
        description: 'HIPAA & SOC 2 Type II Compliant Dedicated Gateway & Firewall Cluster Configuration',
        contract: 'CNT-2026-HEALTH-01',
        quantity: 2,
        uom: 'SET',
        unitPrice: 6250.00,
        taxCode: 'TAX-EXEMPT',
        taxRate: 0,
        taxAmount: 0.00,
        totalPrice: 12500.00,
        exchangeRate: 1.00,
        priceInBaseCurrency: 12500.00,
        supplierInstructions: 'Firmware must be pre-flashed to certified FIPS 140-3 build.',
        internalComments: 'Validated by Cyber Risk Assessment team.',
        attachments: ['Security-Cert.pdf'],
        deliveryDate: '2026-11-12',
        invoicedQuantity: 1
      },
      {
        id: 'poli-101-m3',
        itemNumber: 3,
        partNumber: 'SVC-VAL-MIG',
        description: 'Data Validation, Backup Redundancy Testing & Production Handover Services',
        contract: 'CNT-2026-HEALTH-01',
        quantity: 1,
        uom: 'JOB',
        unitPrice: 4000.00,
        taxCode: 'TAX-EXEMPT',
        taxRate: 0,
        taxAmount: 0.00,
        totalPrice: 4000.00,
        exchangeRate: 1.00,
        priceInBaseCurrency: 4000.00,
        supplierInstructions: 'Onsite validation signoff by Director of Clinical Systems required.',
        internalComments: 'Milestone 3 final signoff.',
        attachments: ['SOW-Testing.pdf'],
        deliveryDate: '2026-11-12',
        invoicedQuantity: 0
      }
    ]
  },
  {
    id: 'po-106',
    poNumber: 'PO-2026-9450',
    poName: 'Enterprise Compute Node Deployment & Bay 14 Server Rack Expansion',
    buyerOrgId: 'buyer-org-1',
    companyName: 'Apex Global Enterprises',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    supplierContactName: 'Elena Rostova',
    supplierContactEmail: 'elena.rostova@cloudbridge.io',
    supplierContactPhone: '+1 (555) 382-9102',
    supplierAddress: '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
    supplierPan: 'AAACB1234F',
    supplierGst: '27AAACB1234F1Z5',
    status: 'ISSUED',
    orderDate: '2026-11-04T09:00:00Z',
    requestDate: '2026-11-04',
    deliveryDate: '2026-11-25',
    promisedDate: '2026-11-25T18:00:00Z',
    eventReference: 'EVT-RFX-2026-092',
    linkedPrs: 'PR-2026-88192',
    isUrgent: true,
    reasonForOrdering: 'Expedited telemetry nodes for Bay 14 cloud expansion. Mission-critical outage mitigation.',
    projectName: 'Project Apollo - Datacenter Node Scaling',
    termsAndConditions: 'Standard Verisource Network Master Vendor Agreement v4.2 & Dynamic Discounting terms',
    attachments: ['PO-Contract-SOW-2026.pdf', 'Technical-Spec-Sheet.pdf'],
    paymentTerms: '2/10 Net 30',
    currency: 'USD',
    exchangeRate: 1.00,
    subtotal: 74000.00,
    taxAmount: 5920.00,
    totalAmount: 79920.00,
    shippingAddress: 'Apex Global Logistics Center - Receiving Bay 14\nAttn: Hardware Operations\n1020 Logistics Blvd, Austin, TX 78728\nReceiving Hours: Mon–Fri, 07:00 – 17:00 CST',
    billingAddress: 'Apex Global Enterprises\nProcurement & S2P Operations\nPO Box 8802, New York, NY 10001 • ap@apexglobal.com',
    buyerContactName: 'Sarah Chen (Lead Procurement Architect)',
    notes: 'Urgent: Expedited telemetry nodes for Bay 14 cloud expansion. Please acknowledge slot within 24h.',
    lineItems: [
      {
        id: 'poli-106-1',
        itemNumber: 1,
        partNumber: 'ACM-NODE-64GB',
        description: 'Enterprise Compute Node 64GB DDR5 / 32-Core Xeon Scalable Processor',
        contract: 'CNT-2026-CLOUD-01',
        quantity: 8,
        uom: 'EA',
        unitPrice: 8200.00,
        taxCode: 'GST-8',
        taxRate: 8,
        taxAmount: 5248.00,
        totalPrice: 65600.00,
        exchangeRate: 1.00,
        priceInBaseCurrency: 65600.00,
        supplierInstructions: 'ESD sensitive equipment. Ship in dedicated shock-mounted flight cases.',
        internalComments: 'CapEx allocation approved by executive sourcing board.',
        attachments: ['ComputeNode-Spec.pdf'],
        deliveryDate: '2026-11-20',
        invoicedQuantity: 0
      },
      {
        id: 'poli-106-2',
        itemNumber: 2,
        partNumber: 'ACM-SLA-PREM',
        description: 'Platinum 24/7 Mission-Critical Hardware Maintenance & Remote SRE SLA (1 Yr)',
        contract: 'CNT-2026-CLOUD-01',
        quantity: 1,
        uom: 'YR',
        unitPrice: 8400.00,
        taxCode: 'GST-8',
        taxRate: 8,
        taxAmount: 672.00,
        totalPrice: 8400.00,
        exchangeRate: 1.00,
        priceInBaseCurrency: 8400.00,
        supplierInstructions: 'Activate 24/7 priority pager duty bridge upon delivery confirmation.',
        internalComments: 'Mandatory for Bay 14 Tier 4 datacenter compliance.',
        attachments: ['SLA-Terms.pdf'],
        deliveryDate: '2026-11-25',
        invoicedQuantity: 0
      }
    ]
  },
  {
    id: 'po-107',
    poNumber: 'PO-2026-9520',
    poName: 'Avionics Hardened Telemetry Array & NVMe Solid State Storage Bank',
    buyerOrgId: 'buyer-org-2',
    companyName: 'NovaTech Flight Systems',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    supplierContactName: 'Elena Rostova',
    supplierContactEmail: 'elena.rostova@cloudbridge.io',
    supplierContactPhone: '+1 (555) 382-9102',
    supplierAddress: '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
    supplierPan: 'AAACB1234F',
    supplierGst: '27AAACB1234F1Z5',
    status: 'SHIPPED',
    orderDate: '2026-10-25T11:00:00Z',
    requestDate: '2026-10-25',
    deliveryDate: '2026-11-12',
    promisedDate: '2026-11-12T16:00:00Z',
    eventReference: 'EVT-AERO-2026-044',
    linkedPrs: 'PR-2026-55410',
    isUrgent: false,
    reasonForOrdering: '',
    projectName: 'Avionics Subsystem Hardening - Flight Unit Alpha',
    termsAndConditions: 'Federal Aerospace Subcontract Provisions (FAR/DFARS compliant)',
    attachments: ['Aero-Quality-Cert.pdf', 'Chain-of-Custody.pdf'],
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    exchangeRate: 1.00,
    subtotal: 42000.00,
    taxAmount: 3360.00,
    totalAmount: 45360.00,
    shippingAddress: 'NovaTech Flight Systems Facility B - Receiving Dock 3\nAttn: Secure Avionics Intake\n4800 Aerospace Parkway, Huntsville, AL 35806\nReceiving Hours: Mon–Fri, 08:00 – 15:30 CST',
    billingAddress: 'NovaTech Aerospace & Defense\nElectronic Invoicing AP Desk\nPO Box 3310, Seattle, WA 98101 • ap@novatechaerospace.com',
    buyerContactName: 'David Miller (Senior Subcontract Specialist)',
    acknowledgedAt: '2026-10-26T08:30:00Z',
    acknowledgedBy: 'Elena Rostova (Acme Tech / CloudBridge)',
    asnNumber: 'ASN-US-99144',
    shippedAt: '2026-10-29T14:15:00Z',
    notes: 'Mil-Spec radiation hardened transceivers. Secure chain of custody manifest required.',
    lineItems: [
      {
        id: 'poli-107-1',
        itemNumber: 1,
        partNumber: 'ACM-RAD-900',
        description: 'Radiation-Hardened Edge Telemetry Array (-40C to +125C Operating Envelope)',
        contract: 'CNT-2026-AERO-99',
        quantity: 6,
        uom: 'EA',
        unitPrice: 4500.00,
        taxCode: 'GST-8',
        taxRate: 8,
        taxAmount: 2160.00,
        totalPrice: 27000.00,
        exchangeRate: 1.00,
        priceInBaseCurrency: 27000.00,
        supplierInstructions: 'Mil-Spec tamper evident seals required on all packages.',
        internalComments: 'Pre-screened lot with certificate of conformance.',
        attachments: ['CofC-RadHard.pdf'],
        deliveryDate: '2026-11-10',
        invoicedQuantity: 0
      },
      {
        id: 'poli-107-2',
        itemNumber: 2,
        partNumber: 'ACM-NVME-SAN',
        description: 'Ruggedized NVMe Solid State Storage Bank (Mil-Std 810H Shock & Vibe)',
        contract: 'CNT-2026-AERO-99',
        quantity: 1,
        uom: 'EA',
        unitPrice: 15000.00,
        taxCode: 'GST-8',
        taxRate: 8,
        taxAmount: 1200.00,
        totalPrice: 15000.00,
        exchangeRate: 1.00,
        priceInBaseCurrency: 15000.00,
        supplierInstructions: 'Class 100 clean pack and serialized firmware burn-in report.',
        internalComments: 'Critical path component for ground qualification test.',
        attachments: ['BurnIn-Report.pdf'],
        deliveryDate: '2026-11-12',
        invoicedQuantity: 0
      }
    ]
  },
  {
    id: 'po-104',
    poNumber: 'PO-2026-9104',
    buyerOrgId: 'buyer-org-2',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    status: 'IN_FULFILLMENT',
    orderDate: '2026-10-21T10:30:00Z',
    promisedDate: '2026-11-10T17:00:00Z',
    paymentTerms: 'Net 45 Standard',
    currency: 'USD',
    subtotal: 118000.00,
    taxAmount: 9440.00,
    totalAmount: 127440.00,
    shippingAddress: 'NovaTech Flight Systems Facility 4\nAttn: Cryogenic Testing Bay 2\nHuntsville, AL 35805\nReceiving Hours: Mon–Thu, 07:30 – 16:30 CST',
    billingAddress: 'NovaTech Aerospace & Defense\nPO Box 4010, Los Angeles, CA 90012',
    buyerContactName: 'Col. Jonathan Vance (Procurement Officer)',
    acknowledgedAt: '2026-10-22T08:15:00Z',
    acknowledgedBy: 'Elena Rostova (Acme Tech / CloudBridge)',
    asnNumber: 'ASN-US-99120',
    notes: 'ITAR Certified Cryogenic Multi-Axis Telemetry Sensors and Redundant Edge Controllers',
    lineItems: [
      {
        id: 'poli-104-1',
        itemNumber: 1,
        partNumber: 'ACM-SENSOR-40',
        description: 'Precision Multi-Axis Industrial IoT Sensor Array (Mil-Spec)',
        quantity: 100,
        uom: 'EA',
        unitPrice: 640.00,
        totalPrice: 64000.00,
        deliveryDate: '2026-11-05',
        invoicedQuantity: 50
      },
      {
        id: 'poli-104-2',
        itemNumber: 2,
        partNumber: 'ACM-EDGE-200',
        description: 'High-Tolerance Modular Compute Unit (Edge Defense Spec)',
        quantity: 6,
        uom: 'EA',
        unitPrice: 9000.00,
        totalPrice: 54000.00,
        deliveryDate: '2026-11-10',
        invoicedQuantity: 0
      }
    ]
  },
  {
    id: 'po-101',
    poNumber: 'PO-2026-8891',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    status: 'ACKNOWLEDGED',
    orderDate: '2026-10-18T14:00:00Z',
    promisedDate: '2026-11-15T18:00:00Z',
    paymentTerms: '2/10 Net 30',
    currency: 'USD',
    subtotal: 48500.00,
    taxAmount: 3880.00,
    totalAmount: 52380.00,
    shippingAddress: 'Apex Global DC-1\nAttn: Ingestion Ops\n1400 Procurement Blvd, Austin, TX 78701\nReceiving Hours: Mon–Fri, 08:00 – 16:30 CST',
    billingAddress: 'Apex Global Accounts Payable\nPO Box 8802, New York, NY 10001',
    buyerContactName: 'Sarah Chen (Lead Procurement Architect)',
    acknowledgedAt: '2026-10-19T09:15:00Z',
    acknowledgedBy: 'Elena Rostova (Acme Tech / CloudBridge)',
    notes: 'Q4 Enterprise Data Pipeline Telemetry Nodes for Enterprise S2P Analytics Integration',
    lineItems: [
      {
        id: 'poli-101-1',
        itemNumber: 1,
        partNumber: 'ACM-NODE-800',
        description: 'Enterprise AI Telemetry Streaming Ingestion Node (Dual Redundant)',
        quantity: 2,
        uom: 'EA',
        unitPrice: 18500.00,
        totalPrice: 37000.00,
        deliveryDate: '2026-11-10',
        invoicedQuantity: 0
      },
      {
        id: 'poli-101-2',
        itemNumber: 2,
        partNumber: 'ACM-VEC-100',
        description: 'Managed Vector Knowledge Retrieval Cluster License (12 Months)',
        quantity: 1,
        uom: 'YR',
        unitPrice: 11500.00,
        totalPrice: 11500.00,
        deliveryDate: '2026-11-15',
        invoicedQuantity: 0
      }
    ]
  },
  {
    id: 'po-105',
    poNumber: 'PO-2026-9280',
    buyerOrgId: 'buyer-org-3',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    status: 'COMPLETED',
    orderDate: '2026-09-28T09:00:00Z',
    promisedDate: '2026-10-15T16:00:00Z',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    subtotal: 32000.00,
    taxAmount: 2560.00,
    totalAmount: 34560.00,
    shippingAddress: 'Meridian Health Network Logistics Bay 2\n700 Healthcare Blvd, Atlanta, GA 30303\nReceiving Hours: Mon–Fri, 08:00 – 16:00 CST',
    billingAddress: 'Meridian Health AP Invoicing\nPO Box 2020, Atlanta, GA 30301',
    buyerContactName: 'Clara Oswald (Supply Chain VP)',
    acknowledgedAt: '2026-09-29T10:00:00Z',
    acknowledgedBy: 'Elena Rostova (Acme Tech / CloudBridge)',
    notes: 'S2P PunchOut API Connectors & Automated Electronic Data Interchange Deployment',
    lineItems: [
      {
        id: 'poli-105-1',
        itemNumber: 1,
        partNumber: 'ACM-SVC-01',
        description: 'S2P Pipeline Integration & Custom Connectors (Engineering Services)',
        quantity: 140,
        uom: 'HRS',
        unitPrice: 228.57,
        totalPrice: 32000.00,
        deliveryDate: '2026-10-12',
        invoicedQuantity: 140
      }
    ]
  }
];

const DEFAULT_COMMENTS: Record<string, TransactionComment[]> = {
  'PO-2026-101': [
    {
      id: 'comm-101-1',
      entityType: 'PO',
      entityId: 'po-101-meridian',
      authorId: 'usr-buyer-sarah',
      authorName: 'Sarah Chen (Lead Procurement)',
      authorRole: 'BUYER',
      text: 'Confirming expedited telemetry delivery for Bay 14 scheduled for Thursday morning. Please confirm your driver has gate clearance codes.',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: 'comm-101-2',
      entityType: 'PO',
      entityId: 'po-101-meridian',
      authorId: 'usr-supp-elena',
      authorName: 'Elena Rostova (CloudBridge / Acme)',
      authorRole: 'SUPPLIER',
      text: 'Understood Sarah, driver manifest dispatched under FedEx Freight with seal SEC-MER-99410. All 3 line items staged and ready for Naperville dock intake.',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ],
  'PO-2026-9450': [
    {
      id: 'comm-9450-1',
      entityType: 'PO',
      entityId: 'po-106',
      authorId: 'usr-buyer-sarah',
      authorName: 'Sarah Chen (VP of Strategic Sourcing)',
      authorRole: 'BUYER',
      text: 'Confirming expedited delivery date Nov 25 for Bay 14 compute servers. Counter-signature confirmed. Please attach the FAT test report before dispatch.',
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
    }
  ],
  'PO-2026-9520': [
    {
      id: 'comm-9520-1',
      entityType: 'PO',
      entityId: 'po-9520',
      authorId: 'usr-buyer-david',
      authorName: 'David Miller (Lead Systems Engineer - NovaTech)',
      authorRole: 'BUYER',
      text: 'Mil-Spec radiation-hardened telemetry module specifications validated against defense standard MIL-STD-810H. Ready for staging.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    }
  ]
};

export const SupplierOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate, routeState, selectedBuyerId, setSelectedBuyerId } = usePortal();

  // Data state
  const [orders, setOrders] = useState<PurchaseOrder[]>(RICH_DEFAULT_ORDERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    header?: Record<string, string>;
    lines?: Record<number, Record<string, string>>;
  }>({});

  // View state: 'LIST' or 'DETAIL'
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // PDF Preview Modal
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Inline Global & Line Item Edit States
  const [isEditingGlobal, setIsEditingGlobal] = useState<boolean>(false);
  const [showAllHeaderFields, setShowAllHeaderFields] = useState<boolean>(false);
  const [editHeader, setEditHeader] = useState({
    companyName: '',
    poNumber: '',
    poName: '',
    requestDate: '',
    deliveryDate: '',
    eventReference: '',
    linkedPrs: '',
    isUrgent: false,
    reasonForOrdering: '',
    projectName: '',
    supplierName: '',
    supplierContactName: '',
    supplierContactEmail: '',
    supplierContactPhone: '',
    supplierAddress: '',
    supplierPan: '',
    supplierGst: '',
    deliveryAddress: '',
    billingAddress: '',
    paymentTerms: '',
    termsAndConditions: '',
    attachments: [] as string[]
  });
  const [editLines, setEditLines] = useState<POLineItem[]>([]);
  const [lineFulfillmentNotes, setLineFulfillmentNotes] = useState<Record<string, string>>({
    'poli-101-m1': 'Bay 14 Rack unit serialized & hypervisors installed',
    'poli-101-m2': 'Hardware cluster verified with HIPAA certificates',
    'poli-101-m3': 'Scheduled for live customer handover'
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [buyerFilter, setBuyerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('DATE_DESC');

  // Side drawer for collaboration / messages
  const [showCollabDrawer, setShowCollabDrawer] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, TransactionComment[]>>(DEFAULT_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [aiDrafting, setAiDrafting] = useState(false);

  // ASN Modal
  const [showAsnModal, setShowAsnModal] = useState(false);
  const [carrier, setCarrier] = useState('FedEx Freight Priority');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('2026-11-03');
  const { settings } = useSupplierSettings();

  // Flip to Invoice Modal
  const [showFlipModal, setShowFlipModal] = useState(false);
  const [flipInvoiceNum, setFlipInvoiceNum] = useState('');
  const [flipTaxRate, setFlipTaxRate] = useState(0);

  // Create PO Modal State (Confirmation only asks PO number & Buyer name)
  const [showCreatePoModal, setShowCreatePoModal] = useState(false);
  const [newPoNumber, setNewPoNumber] = useState('PO-2026-9580');
  const [newBuyerOrgId, setNewBuyerOrgId] = useState('buyer-org-1');

  // Sync edit fields when an order is opened
  useEffect(() => {
    if (selectedPO) {
      const isNewDraft = (selectedPO as any).isDraftNew;
      const isMeridian = selectedPO.poNumber === 'PO-2026-101';
      const compName = selectedPO.companyName || getBuyerDisplayName(selectedPO.buyerOrgId);
      const buyerPreset = BUYER_COMPANY_PRESETS.find(b => b.id === selectedPO.buyerOrgId);

      if (isNewDraft) {
        setEditHeader({
          companyName: compName,
          poNumber: selectedPO.poNumber,
          poName: selectedPO.poName || '',
          requestDate: selectedPO.requestDate || new Date().toISOString().split('T')[0],
          deliveryDate: selectedPO.deliveryDate || '',
          eventReference: selectedPO.eventReference || '',
          linkedPrs: selectedPO.linkedPrs || '',
          isUrgent: selectedPO.isUrgent ?? false,
          reasonForOrdering: selectedPO.reasonForOrdering || '',
          projectName: selectedPO.projectName || '',
          supplierName: selectedPO.supplierName || 'CloudBridge Solutions LLC',
          supplierContactName: selectedPO.supplierContactName || '',
          supplierContactEmail: selectedPO.supplierContactEmail || '',
          supplierContactPhone: selectedPO.supplierContactPhone || '',
          supplierAddress: selectedPO.supplierAddress || '',
          supplierPan: selectedPO.supplierPan || '',
          supplierGst: selectedPO.supplierGst || '',
          deliveryAddress: selectedPO.shippingAddress || '',
          billingAddress: selectedPO.billingAddress || (buyerPreset?.billingAddress || 'AP Shared Services, PO Box 8802, New York, NY 10001'),
          paymentTerms: selectedPO.paymentTerms || '2/10 Net 30',
          termsAndConditions: selectedPO.termsAndConditions || '',
          attachments: selectedPO.attachments && selectedPO.attachments.length > 0 ? selectedPO.attachments : []
        });

        const lines: POLineItem[] = (selectedPO.lineItems && selectedPO.lineItems.length > 0)
          ? selectedPO.lineItems
          : [
              {
                id: `line-${Date.now()}-1`,
                itemNumber: 1,
                itemName: '',
                partNumber: '',
                description: '',
                contract: '',
                quantity: '' as any,
                uom: 'EA',
                unitPrice: '' as any,
                taxCode: 'GST-8',
                taxRate: 8,
                taxAmount: 0,
                totalPrice: 0,
                exchangeRate: 1.0,
                priceInBaseCurrency: 0,
                supplierInstructions: '',
                internalComments: '',
                deliveryDate: '',
                attachments: []
              }
            ];
        setEditLines(lines);
        setIsEditingGlobal(true);
        setShowAllHeaderFields(true);
      } else {
        setEditHeader({
          companyName: compName,
          poNumber: selectedPO.poNumber,
          poName: selectedPO.poName || (isMeridian ? 'Enterprise Cloud Server Deployment & Bay 14 Infrastructure' : 'Enterprise Compute Node Deployment & Bay 14 Server Rack Expansion'),
          requestDate: selectedPO.requestDate || (selectedPO.orderDate ? selectedPO.orderDate.split('T')[0] : '2026-11-04'),
          deliveryDate: selectedPO.deliveryDate || (selectedPO.promisedDate ? selectedPO.promisedDate.split('T')[0] : '2026-11-25'),
          eventReference: selectedPO.eventReference || (isMeridian ? 'EVT-RFX-2026-088' : 'EVT-RFX-2026-092'),
          linkedPrs: selectedPO.linkedPrs || (isMeridian ? 'PR-2026-10928' : 'PR-2026-88192'),
          isUrgent: selectedPO.isUrgent ?? (selectedPO.poNumber === 'PO-2026-9450'),
          reasonForOrdering: selectedPO.reasonForOrdering || (selectedPO.poNumber === 'PO-2026-9450' ? 'Urgent: Expedited telemetry nodes for Bay 14 cloud expansion. Mission-critical outage mitigation.' : (selectedPO.notes || '')),
          projectName: selectedPO.projectName || (isMeridian ? 'Project Hypervisor - Bay 14 Healthcare Private Cloud' : 'Project Apollo - Datacenter Node Scaling'),
          supplierName: selectedPO.supplierName || 'CloudBridge Solutions LLC',
          supplierContactName: selectedPO.supplierContactName || 'Elena Rostova',
          supplierContactEmail: selectedPO.supplierContactEmail || 'elena.rostova@cloudbridge.io',
          supplierContactPhone: selectedPO.supplierContactPhone || '+1 (555) 382-9102',
          supplierAddress: selectedPO.supplierAddress || '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
          supplierPan: selectedPO.supplierPan || 'AAACB1234F',
          supplierGst: selectedPO.supplierGst || '27AAACB1234F1Z5',
          deliveryAddress: selectedPO.shippingAddress || DELIVERY_ADDRESS_PRESETS[0],
          billingAddress: selectedPO.billingAddress || (buyerPreset?.billingAddress || 'AP Shared Services, PO Box 8802, New York, NY 10001'),
          paymentTerms: selectedPO.paymentTerms || '2/10 Net 30',
          termsAndConditions: selectedPO.termsAndConditions || 'Verisource Network Standard Supply Agreement v4.2 & Touchless 3-Way Invoicing terms',
          attachments: selectedPO.attachments && selectedPO.attachments.length > 0 
            ? selectedPO.attachments 
            : ['PO-Contract-SOW-2026.pdf', 'Technical-Spec-Sheet.pdf']
        });

        const lines = (selectedPO.lineItems && selectedPO.lineItems.length > 0)
          ? selectedPO.lineItems.map((l, i) => ({
              ...l,
              contract: l.contract || (isMeridian ? 'CNT-2026-HEALTH-01' : 'CNT-2026-CLOUD-01'),
              taxCode: l.taxCode || (isMeridian ? 'TAX-EXEMPT' : 'GST-8'),
              taxRate: l.taxRate !== undefined ? l.taxRate : (isMeridian ? 0 : 8),
              taxAmount: l.taxAmount !== undefined ? l.taxAmount : Number(((l.totalPrice || (l.quantity * l.unitPrice)) * (isMeridian ? 0 : 0.08)).toFixed(2)),
              exchangeRate: l.exchangeRate || 1.0,
              priceInBaseCurrency: l.priceInBaseCurrency || l.totalPrice || (l.quantity * l.unitPrice),
              supplierInstructions: l.supplierInstructions || 'ESD sensitive equipment. Ship in static-shielding containers.',
              internalComments: l.internalComments || 'Approved by Procurement & Engineering QA.',
              attachments: l.attachments || ['Item-Spec-Drawing.pdf']
            }))
          : [];
        setEditLines(lines);
        setIsEditingGlobal(false);
      }
    }
  }, [selectedPO]);

  // Handle actions dispatched by Ava Copilot to mutate page in real time
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'VIEW_PO' || action.action === 'SELECT_PO') {
        const poNum = action.payload.poNumber || action.payload.id;
        const target = orders.find(o => o.poNumber === poNum || o.id === poNum);
        if (target) {
          setSelectedPO(target);
          if (action.payload.editMode) setIsEditingGlobal(true);
          setActionSuccess(`Ava opened Purchase Order ${target.poNumber}`);
          setTimeout(() => setActionSuccess(null), 3500);
        }
      } else if (action.action === 'CLOSE_PO_DETAIL') {
        setSelectedPO(null);
        setIsEditingGlobal(false);
        setActionSuccess('Ava returned to orders list');
        setTimeout(() => setActionSuccess(null), 3000);
      } else if (action.action === 'DELETE_PO') {
        const poNum = action.payload.poNumber || selectedPO?.poNumber;
        if (poNum) {
          setOrders(prev => prev.filter(o => o.poNumber !== poNum));
          if (selectedPO?.poNumber === poNum) {
            setSelectedPO(null);
          }
          setActionSuccess(`Ava deleted Purchase Order ${poNum}`);
          setTimeout(() => setActionSuccess(null), 3500);
        }
      } else if (action.action === 'UPDATE_PO_FIELD') {
        const { field, value, poNumber } = action.payload;
        if (poNumber && (!selectedPO || selectedPO.poNumber !== poNumber)) {
          setOrders(prev => prev.map(o => o.poNumber === poNumber ? ({ ...o, [field]: value }) : o));
        }
        setIsEditingGlobal(true);
        setEditHeader(prev => ({ ...prev, [field]: value }));
        if (selectedPO) {
          setSelectedPO(prev => prev ? ({ ...prev, [field]: value }) : null);
        }
        setActionSuccess(`Ava updated order ${field} to "${value}"`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'ADD_PO_LINE') {
        setIsEditingGlobal(true);
        const p = action.payload;
        const qty = Number(p.quantity) || 1;
        const price = Number(p.unitPrice) || 100;
        const newItem: POLineItem = {
          id: `poli-ai-${Date.now()}`,
          itemNumber: editLines.length + 1,
          itemName: p.name || 'New Deliverable',
          description: p.description || p.name || 'Component item added via Ava Copilot',
          partNumber: p.itemCode || p.partNumber || 'ACM-GEN-01',
          contract: p.contractRef || 'CNT-2026-CLOUD-01',
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price,
          uom: p.uom || 'EA',
          taxCode: 'GST-8',
          taxRate: p.taxRate !== undefined ? Number(p.taxRate) : 8,
          taxAmount: Number((qty * price * ((p.taxRate !== undefined ? Number(p.taxRate) : 8) / 100)).toFixed(2)),
          exchangeRate: 1.0,
          priceInBaseCurrency: qty * price,
          deliveryDate: p.deliveryDate || editHeader.deliveryDate || '2026-11-20',
          supplierInstructions: p.costBookingDetails || 'Standard Operational Cost Center',
          internalComments: 'Appended via Ava Autonomous Operations Agent'
        };
        setEditLines(prev => [...prev, newItem]);
        setActionSuccess(`Ava added deliverable line: ${newItem.itemName} (${qty} @ $${price})`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'UPDATE_PO_LINE') {
        const { index, field, value } = action.payload;
        setIsEditingGlobal(true);
        setEditLines(prev => prev.map((item, idx) => {
          if (idx === index) {
            const updated = { ...item, [field]: value };
            if (field === 'quantity' || field === 'unitPrice') {
              const q = field === 'quantity' ? Number(value) : (Number(item.quantity) || 1);
              const pr = field === 'unitPrice' ? Number(value) : (Number(item.unitPrice) || 0);
              const rate = item.taxRate !== undefined ? Number(item.taxRate) : 8;
              updated.totalPrice = q * pr;
              updated.priceInBaseCurrency = q * pr;
              updated.taxAmount = Number((q * pr * (rate / 100)).toFixed(2));
            }
            return updated;
          }
          return item;
        }));
        setActionSuccess(`Ava updated line item #${index + 1}`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'DELETE_PO_LINE') {
        const { index } = action.payload;
        setIsEditingGlobal(true);
        setEditLines(prev => prev.filter((_, idx) => idx !== index));
        setActionSuccess(`Ava removed line item #${index + 1}`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'SET_PAGE_FILTER') {
        const { searchQuery: sq, buyerFilter: bf, statusFilter: sf } = action.payload;
        if (sq !== undefined) setSearchQuery(sq);
        if (bf !== undefined) setBuyerFilter(bf);
        if (sf !== undefined) setStatusFilter(sf);
        setActionSuccess('Ava updated orders filters');
        setTimeout(() => setActionSuccess(null), 3000);
      } else if (action.action === 'CREATE_PO') {
        if (action.payload.poNumber) setNewPoNumber(action.payload.poNumber);
        setShowCreatePoModal(true);
      } else if (action.action === 'FLIP_PO_TO_ASN') {
        setShowAsnModal(true);
      } else if (action.action === 'FLIP_PO_TO_INVOICE') {
        setShowFlipModal(true);
      } else if (action.action === 'SAVE_PO') {
        handleSaveGlobalDetails();
      }
    });

    return cleanup;
  }, [selectedPO, editHeader, editLines, orders]);

  const currentActiveLines = isEditingGlobal ? editLines : (selectedPO?.lineItems || []);
  const liveNetTotal = currentActiveLines.reduce((acc, l) => acc + (Number(l.totalPrice) || (Number(l.quantity) * Number(l.unitPrice)) || 0), 0);
  const liveTotalTax = currentActiveLines.reduce((acc, l) => {
    const rate = l.taxRate !== undefined ? Number(l.taxRate) : 8;
    const lineTot = Number(l.totalPrice) || (Number(l.quantity) * Number(l.unitPrice)) || 0;
    return acc + Number((lineTot * (rate / 100)).toFixed(2));
  }, 0);
  const liveGrossTotal = Number((liveNetTotal + liveTotalTax).toFixed(2));

  // Broadcast live orders context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'orders',
      activeMode: selectedPO ? (isEditingGlobal ? 'EDIT' : 'DETAIL') : 'LIST',
      selectedPoNumber: selectedPO?.poNumber,
      selectedPoName: selectedPO?.poName,
      status: selectedPO?.status,
      header: editHeader,
      lines: editLines,
      lineCount: editLines.length,
      subtotal: liveNetTotal,
      taxTotal: liveTotalTax,
      grossTotal: liveGrossTotal,
      searchQuery,
      buyerFilter,
      statusFilter,
      orders: orders.map(o => ({
        poNumber: o.poNumber,
        poName: o.poName,
        companyName: o.companyName,
        orderDate: o.orderDate,
        deliveryDate: o.deliveryDate,
        status: o.status,
        totalAmount: o.totalAmount,
        paymentTerms: o.paymentTerms,
        lineCount: o.lineItems ? o.lineItems.length : 0,
        lineItems: o.lineItems
      }))
    });
  }, [selectedPO, isEditingGlobal, editHeader, editLines, liveNetTotal, liveTotalTax, liveGrossTotal, searchQuery, buyerFilter, statusFilter, orders]);

  // Cascading logic handlers
  const handleSupplierChange = (suppName: string) => {
    const found = SUPPLIER_PRESETS.find(s => s.name === suppName);
    if (found) {
      const firstContact = found.contacts[0];
      setEditHeader(prev => ({
        ...prev,
        supplierName: suppName,
        supplierPan: found.pan,
        supplierGst: found.gst,
        supplierAddress: found.address,
        supplierContactName: firstContact.name,
        supplierContactEmail: firstContact.email,
        supplierContactPhone: firstContact.phone
      }));
    } else {
      setEditHeader(prev => ({ ...prev, supplierName: suppName }));
    }
  };

  const handleContactChange = (contactName: string) => {
    const currentSupp = SUPPLIER_PRESETS.find(s => s.name === editHeader.supplierName);
    const foundContact = currentSupp?.contacts.find(c => c.name === contactName);
    if (foundContact) {
      setEditHeader(prev => ({
        ...prev,
        supplierContactName: contactName,
        supplierContactEmail: foundContact.email,
        supplierContactPhone: foundContact.phone
      }));
      setValidationErrors(prev => {
        if (!prev.header) return prev;
        const h = { ...prev.header };
        delete h.supplierContactName;
        delete h.supplierContactEmail;
        delete h.supplierContactPhone;
        return { ...prev, header: h };
      });
    } else {
      setEditHeader(prev => ({ ...prev, supplierContactName: contactName }));
      setValidationErrors(prev => {
        if (!prev.header?.supplierContactName) return prev;
        const h = { ...prev.header };
        delete h.supplierContactName;
        return { ...prev, header: h };
      });
    }
  };

  const handleHeaderFieldChange = (field: string, value: any) => {
    setValidationErrors(prev => {
      if (!prev.header?.[field]) return prev;
      const h = { ...prev.header };
      delete h[field];
      return { ...prev, header: h };
    });
    setEditHeader(prev => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (index: number, field: keyof POLineItem, value: any) => {
    // Clear validation error for this line field if present
    setValidationErrors(prev => {
      if (!prev.lines?.[index]?.[field as string]) return prev;
      const updatedLines = { ...prev.lines };
      const updatedLineFields = { ...updatedLines[index] };
      delete updatedLineFields[field as string];
      if (Object.keys(updatedLineFields).length === 0) {
        delete updatedLines[index];
      } else {
        updatedLines[index] = updatedLineFields;
      }
      return { ...prev, lines: updatedLines };
    });

    setEditLines(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const qtyVal = field === 'quantity' ? value : item.quantity;
        const priceVal = field === 'unitPrice' ? value : item.unitPrice;
        const numQty = qtyVal === '' || qtyVal === undefined ? 0 : Math.max(0, Number(qtyVal) || 0);
        const numPrice = priceVal === '' || priceVal === undefined ? 0 : Math.max(0, Number(priceVal) || 0);
        const total = Number((numQty * numPrice).toFixed(2));
        item.quantity = qtyVal;
        item.unitPrice = priceVal;
        item.totalPrice = total;
        const rate = item.taxRate !== undefined ? item.taxRate : 0;
        item.taxAmount = Number((total * (rate / 100)).toFixed(2));
        const exRate = item.exchangeRate || 1.0;
        item.priceInBaseCurrency = Number((total * exRate).toFixed(2));
      } else if (field === 'taxRate') {
        const rate = Math.max(0, Number(value) || 0);
        item.taxRate = rate;
        item.taxAmount = Number(((item.totalPrice || 0) * (rate / 100)).toFixed(2));
      } else if (field === 'taxCode') {
        const code = String(value);
        item.taxCode = code;
        if (code === 'TAX-EXEMPT') {
          item.taxRate = 0;
        } else if (code === 'GST-5') {
          item.taxRate = 5;
        } else if (code === 'GST-12') {
          item.taxRate = 12;
        } else if (code === 'GST-18') {
          item.taxRate = 18;
        } else if (code === 'GST-28') {
          item.taxRate = 28;
        } else if (code === 'SALES-TAX-8.25') {
          item.taxRate = 8.25;
        } else if (!code) {
          item.taxRate = 0;
        }
        item.taxAmount = Number(((item.totalPrice || 0) * ((item.taxRate || 0) / 100)).toFixed(2));
      } else if (field === 'exchangeRate') {
        const ex = Number(value) || 1.0;
        item.exchangeRate = ex;
        item.priceInBaseCurrency = Number(((item.totalPrice || 0) * ex).toFixed(2));
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleItemCatalogSelect = (index: number, selectedValue: string) => {
    if (selectedValue === 'custom') {
      setEditLines(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          itemName: 'Custom Item'
        };
        return updated;
      });
      return;
    }
    if (selectedValue === '') {
      setEditLines(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          itemName: '',
          description: '',
          partNumber: '',
          unitPrice: '' as any,
          totalPrice: 0,
          taxAmount: 0,
          priceInBaseCurrency: 0
        };
        return updated;
      });
      return;
    }
    const match = LINE_ITEM_CATALOG_PRESETS.find(p => p.name === selectedValue || p.description === selectedValue);
    if (match) {
      setValidationErrors(prev => {
        if (!prev.lines?.[index]) return prev;
        const updatedLines = { ...prev.lines };
        const updatedFields = { ...updatedLines[index] };
        delete updatedFields.itemName;
        delete updatedFields.description;
        delete updatedFields.unitPrice;
        delete updatedFields.quantity;
        delete updatedFields.taxCode;
        if (Object.keys(updatedFields).length === 0) {
          delete updatedLines[index];
        } else {
          updatedLines[index] = updatedFields;
        }
        return { ...prev, lines: updatedLines };
      });
      setEditLines(prev => {
        const updated = [...prev];
        const current = { ...updated[index] };
        current.itemName = match.name;
        current.description = match.description;
        current.partNumber = match.partNumber;
        current.unitPrice = match.unitPrice;
        const qty = Number(current.quantity) || 1;
        current.quantity = qty;
        const total = Number((qty * match.unitPrice).toFixed(2));
        current.totalPrice = total;
        const rate = current.taxRate !== undefined && current.taxRate > 0 ? current.taxRate : 18;
        current.taxRate = rate;
        current.taxCode = current.taxCode || 'GST-18';
        current.taxAmount = Number((total * (rate / 100)).toFixed(2));
        const exRate = current.exchangeRate || 1.0;
        current.priceInBaseCurrency = Number((total * exRate).toFixed(2));
        updated[index] = current;
        return updated;
      });
    } else {
      handleLineChange(index, 'itemName', selectedValue);
    }
  };

  const handleAddLineItem = () => {
    const nextIdx = editLines.length + 1;
    const newItem: POLineItem = {
      id: `poli-new-${Date.now()}`,
      itemNumber: nextIdx,
      itemName: '',
      partNumber: '',
      description: '',
      contract: '',
      quantity: '' as any,
      uom: '',
      unitPrice: '' as any,
      totalPrice: 0,
      taxCode: '',
      taxRate: 0,
      taxAmount: 0,
      exchangeRate: 1.00,
      priceInBaseCurrency: 0,
      supplierInstructions: '',
      internalComments: '',
      deliveryDate: editHeader.deliveryDate || '',
      attachments: []
    };
    setEditLines(prev => [...prev, newItem]);
  };

  const validatePOForm = (): { valid: boolean; errors: string[]; headerErrors: Record<string, string>; lineErrors: Record<number, Record<string, string>> } => {
    const headerErrors: Record<string, string> = {};
    const lineErrors: Record<number, Record<string, string>> = {};
    const errorMessages: string[] = [];

    // 1. Header level validations (Mandatory per spec)
    if (!editHeader.companyName?.trim()) {
      headerErrors.companyName = 'Company Name is required';
      errorMessages.push('Company Name is required');
    }
    if (!selectedPO?.poNumber?.trim()) {
      headerErrors.poNumber = 'PO Number is required';
      errorMessages.push('PO Number is required');
    }
    if (!editHeader.poName?.trim()) {
      headerErrors.poName = 'PO Name is required';
      errorMessages.push('PO Name / Description is required');
    }
    if (!editHeader.requestDate?.trim()) {
      headerErrors.requestDate = 'Request Date is required';
      errorMessages.push('Request Date is required');
    }
    if (!editHeader.deliveryDate?.trim()) {
      headerErrors.deliveryDate = 'Delivery Date is required';
      errorMessages.push('Delivery Date is required');
    }
    if (editHeader.isUrgent && !editHeader.reasonForOrdering?.trim()) {
      headerErrors.reasonForOrdering = 'Reason for Ordering is required for urgent orders';
      errorMessages.push('Reason for Ordering is mandatory when order is marked as Urgent');
    }
    if (!editHeader.supplierName?.trim()) {
      headerErrors.supplierName = 'Supplier Name is required';
      errorMessages.push('Supplier Name is required');
    }
    if (!editHeader.supplierContactName?.trim()) {
      headerErrors.supplierContactName = 'Supplier Contact is required';
      errorMessages.push('Supplier Contact Name is required');
    }
    if (!editHeader.supplierContactEmail?.trim()) {
      headerErrors.supplierContactEmail = 'Supplier Email is required';
      errorMessages.push('Supplier Contact Email is required');
    }
    if (!editHeader.supplierContactPhone?.trim()) {
      headerErrors.supplierContactPhone = 'Supplier Phone is required';
      errorMessages.push('Supplier Contact Phone is required');
    }
    if (!editHeader.supplierAddress?.trim()) {
      headerErrors.supplierAddress = 'Supplier Address is required';
      errorMessages.push('Supplier Address is required');
    }
    if (!editHeader.supplierPan?.trim()) {
      headerErrors.supplierPan = 'Supplier PAN is required';
      errorMessages.push('Supplier PAN is required');
    }
    if (!editHeader.supplierGst?.trim()) {
      headerErrors.supplierGst = 'Supplier GST is required';
      errorMessages.push('Supplier GST is required');
    }
    if (!editHeader.deliveryAddress?.trim()) {
      headerErrors.deliveryAddress = 'Delivery Address is required';
      errorMessages.push('Delivery Address is required');
    }
    if (!editHeader.eventReference?.trim()) {
      headerErrors.eventReference = 'Event Reference is required';
      errorMessages.push('Event Reference is required');
    }
    if (!editHeader.linkedPrs?.trim()) {
      headerErrors.linkedPrs = 'Linked PR(s) is required';
      errorMessages.push('Linked PR(s) is required');
    }
    if (!editHeader.attachments || editHeader.attachments.length === 0) {
      headerErrors.attachments = 'At least 1 Attachment document is required';
      errorMessages.push('At least one document Attachment is required');
    }

    // 2. Line Level validations (Mandatory per spec)
    if (!editLines || editLines.length === 0) {
      errorMessages.push('Purchase order must contain at least 1 line item deliverable');
    } else {
      editLines.forEach((line, idx) => {
        const lineErr: Record<string, string> = {};
        const lineNum = idx + 1;

        if (!line.itemName?.trim() && !line.description?.trim()) {
          lineErr.itemName = 'Item Name is required';
          errorMessages.push(`Line #${lineNum}: Item Name is required`);
        }
        if (!line.description?.trim()) {
          lineErr.description = 'Description is required';
          errorMessages.push(`Line #${lineNum}: Description is required`);
        }
        if ((line.quantity as any) === '' || line.quantity === undefined || Number(line.quantity) <= 0) {
          lineErr.quantity = 'Quantity must be > 0';
          errorMessages.push(`Line #${lineNum}: Quantity must be greater than 0`);
        }
        if (!line.uom?.trim()) {
          lineErr.uom = 'UoM is required';
          errorMessages.push(`Line #${lineNum}: Unit of Measure (UoM) is required`);
        }
        if ((line.unitPrice as any) === '' || line.unitPrice === undefined || Number(line.unitPrice) <= 0) {
          lineErr.unitPrice = 'Unit Price must be > 0';
          errorMessages.push(`Line #${lineNum}: Unit Price must be greater than 0`);
        }
        if (!line.taxCode?.trim()) {
          lineErr.taxCode = 'Tax Rate is required';
          errorMessages.push(`Line #${lineNum}: Tax Rate is required`);
        }

        if (Object.keys(lineErr).length > 0) {
          lineErrors[idx] = lineErr;
        }
      });
    }

    return {
      valid: errorMessages.length === 0,
      errors: errorMessages,
      headerErrors,
      lineErrors
    };
  };

  const handleRemoveLineItem = (index: number) => {
    if (editLines.length <= 1) {
      setActionSuccess('A purchase order must contain at least one line item deliverable.');
      setTimeout(() => setActionSuccess(null), 4000);
      return;
    }
    setEditLines(prev => prev.filter((_, idx) => idx !== index));
  };

  // Global & Line Item File Upload Handlers (Single / Bulk support)
  const handleGlobalFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newNames = Array.from(files).map(f => f.name);
    setEditHeader(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newNames]
    }));
    if (selectedPO) {
      setSelectedPO(prev => prev ? ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newNames]
      }) : null);
    }
    setActionSuccess(`${newNames.length} document(s) uploaded successfully to PO attachments.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRemoveGlobalAttachment = (indexToRemove: number) => {
    setEditHeader(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== indexToRemove)
    }));
    if (selectedPO) {
      setSelectedPO(prev => prev ? ({
        ...prev,
        attachments: (prev.attachments || []).filter((_, i) => i !== indexToRemove)
      }) : null);
    }
  };

  const handleLineFileUpload = (lineIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newNames = Array.from(files).map(f => f.name);
    setEditLines(prev => {
      const updated = [...prev];
      const currentAtts = updated[lineIndex]?.attachments || [];
      updated[lineIndex] = {
        ...updated[lineIndex],
        attachments: [...currentAtts, ...newNames]
      };
      return updated;
    });
    setActionSuccess(`${newNames.length} document(s) attached to Line #${String(lineIndex + 1).padStart(2, '0')}.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRemoveLineAttachment = (lineIndex: number, attIndex: number) => {
    setEditLines(prev => {
      const updated = [...prev];
      const currentAtts = updated[lineIndex]?.attachments || [];
      updated[lineIndex] = {
        ...updated[lineIndex],
        attachments: currentAtts.filter((_, i) => i !== attIndex)
      };
      return updated;
    });
  };

  // Handle route params / state
  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  useEffect(() => {
    if (routeState?.buyerOrgId) {
      setBuyerFilter(routeState.buyerOrgId);
    }
    if (routeState?.orderId || routeState?.poNumber) {
      const targetId = routeState.orderId;
      const targetPoNum = routeState.poNumber;
      const matched = orders.find(o => o.id === targetId || o.poNumber === targetPoNum) ||
                      RICH_DEFAULT_ORDERS.find(o => o.id === targetId || o.poNumber === targetPoNum);
      if (matched) {
        setSelectedPO(matched);
        if (routeState.openCollab || routeState.openMessages) {
          setShowCollabDrawer(true);
        } else if (routeState.openFlipModal) {
          setFlipInvoiceNum(`INV-${matched.poNumber.replace('PO-', '')}`);
          setShowFlipModal(true);
          setShowCollabDrawer(false);
        } else if (routeState.openAsnModal) {
          setShowAsnModal(true);
          setShowCollabDrawer(false);
        } else {
          setShowCollabDrawer(false);
        }
      } else if (routeState.openCollab || routeState.openMessages) {
        if (!selectedPO && orders.length > 0) {
          setSelectedPO(orders[0]);
        }
        setShowCollabDrawer(true);
      } else {
        setShowCollabDrawer(false);
      }
    } else if (routeState?.openCollab || routeState?.openMessages) {
      if (!selectedPO && orders.length > 0) {
        setSelectedPO(orders[0]);
      }
      setShowCollabDrawer(true);
    } else {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const poParam = params.get('po') || params.get('id') || params.get('poNumber');
        const openCollabParam = params.get('collab') === 'true' || params.get('messages') === 'true';
        if (poParam) {
          const matched = orders.find(o => o.id === poParam || o.poNumber === poParam);
          if (matched) {
            setSelectedPO(matched);
            if (openCollabParam) setShowCollabDrawer(true);
          }
        }
      }
    }
  }, [routeState, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getOrders();
      if (res && res.orders && res.orders.length > 0) {
        const merged = [...RICH_DEFAULT_ORDERS];
        res.orders.forEach((o: PurchaseOrder) => {
          if (!merged.some(m => m.poNumber === o.poNumber)) {
            merged.push(o);
          }
        });
        setOrders(merged);
      }
    } catch (err) {
      console.warn('Using enriched demo orders:', err);
      setOrders(RICH_DEFAULT_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalDetails = () => {
    if (!selectedPO) return;
    
    const validation = validatePOForm();
    if (!validation.valid) {
      setValidationErrors({
        header: validation.headerErrors,
        lines: validation.lineErrors
      });
      // Automatically expand secondary header fields so the user sees any errors in secondary fields
      if (Object.keys(validation.headerErrors).some(k => ['supplierAddress', 'supplierPan', 'supplierGst', 'deliveryAddress', 'eventReference', 'linkedPrs', 'attachments'].includes(k))) {
        setShowAllHeaderFields(true);
      }
      setActionError(`Cannot Save Purchase Order: ${validation.errors.length} mandatory field${validation.errors.length > 1 ? 's are' : ' is'} missing. Please complete highlighted fields.`);
      setTimeout(() => setActionError(null), 8000);
      return;
    }

    setValidationErrors({});
    setActionError(null);

    const newStatus = selectedPO.status === 'DRAFT' ? 'ISSUED' : selectedPO.status;
    const updatedPO: PurchaseOrder = {
      ...selectedPO,
      status: newStatus,
      companyName: editHeader.companyName,
      poName: editHeader.poName,
      requestDate: editHeader.requestDate,
      deliveryDate: editHeader.deliveryDate,
      promisedDate: `${editHeader.deliveryDate}T18:00:00Z`,
      eventReference: editHeader.eventReference,
      linkedPrs: editHeader.linkedPrs,
      isUrgent: editHeader.isUrgent,
      reasonForOrdering: editHeader.reasonForOrdering,
      projectName: editHeader.projectName,
      supplierName: editHeader.supplierName,
      supplierContactName: editHeader.supplierContactName,
      supplierContactEmail: editHeader.supplierContactEmail,
      supplierContactPhone: editHeader.supplierContactPhone,
      supplierAddress: editHeader.supplierAddress,
      supplierPan: editHeader.supplierPan,
      supplierGst: editHeader.supplierGst,
      shippingAddress: editHeader.deliveryAddress,
      billingAddress: editHeader.billingAddress,
      paymentTerms: editHeader.paymentTerms,
      termsAndConditions: editHeader.termsAndConditions,
      attachments: editHeader.attachments,
      notes: editHeader.reasonForOrdering || selectedPO.notes,
      lineItems: editLines,
      subtotal: liveNetTotal,
      taxAmount: liveTotalTax,
      totalAmount: liveGrossTotal
    };
    delete (updatedPO as any).isDraftNew;

    setSelectedPO(updatedPO);
    setOrders(prev => prev.map(o => o.id === selectedPO.id ? updatedPO : o));
    setIsEditingGlobal(false);
    setActionSuccess(selectedPO.status === 'DRAFT'
      ? `Purchase Order ${selectedPO.poNumber} saved and officially issued to buyer!`
      : `Purchase Order ${selectedPO.poNumber} details and deliverables successfully updated.`);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleAcknowledge = async (poId: string) => {
    try {
      const res = await ApiClient.acknowledgeOrder(poId);
      setActionSuccess(`Order ${res.order?.poNumber || poId} acknowledged! Buyer notified.`);
      setOrders(prev => prev.map(o => o.id === poId ? { ...o, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() } : o));
      if (selectedPO?.id === poId) {
        setSelectedPO(prev => prev ? { ...prev, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() } : null);
      }
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      setOrders(prev => prev.map(o => o.id === poId ? { ...o, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() } : o));
      if (selectedPO?.id === poId) {
        setSelectedPO(prev => prev ? { ...prev, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() } : null);
      }
      setActionSuccess(`Order acknowledged and counter-signature recorded.`);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const handleDispatchASN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    const tracking = trackingNumber || `FXF-${Math.floor(1000 + Math.random() * 9000)}-2026-US`;
    try {
      await ApiClient.dispatchASN(selectedPO.id, {
        carrier,
        trackingNumber: tracking,
        estimatedDelivery
      });
    } catch (err) {
      console.warn('Simulating ASN dispatch locally');
    }
    const asnNum = `ASN-2026-${Math.floor(100 + Math.random() * 900)}`;
    setOrders(prev => prev.map(o => o.id === selectedPO.id ? { ...o, status: 'SHIPPED', asnNumber: asnNum } : o));
    setSelectedPO(prev => prev ? { ...prev, status: 'SHIPPED', asnNumber: asnNum } : null);
    setShowAsnModal(false);
    setActionSuccess(`Advance Shipping Notice ${asnNum} dispatched via ${carrier}. Navigating to Shipments with auto-populated PO details...`);
    setTimeout(() => {
      setActionSuccess(null);
      navigate('/shipments', { asnNumber: asnNum, poNumber: selectedPO.poNumber, flippedPo: selectedPO });
    }, 1200);
  };

  const handleFlipInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    const invNum = flipInvoiceNum || `INV-2026-${selectedPO.poNumber.replace('PO-2026-', '') || '201'}`;
    try {
      await ApiClient.flipPOToInvoice(selectedPO.id, {
        invoiceNumber: invNum,
        taxRate: flipTaxRate
      });
    } catch (err) {
      console.warn('Simulating PO Flip locally');
    }
    setShowFlipModal(false);
    setActionSuccess(`1-Click PO Flip Successful! Commercial Invoice ${invNum} generated with 100% 3-Way Match ready. Navigating to Invoices...`);
    setTimeout(() => {
      setActionSuccess(null);
      navigate('/invoices', { invoiceNumber: invNum, poNumber: selectedPO.poNumber, flippedPo: selectedPO });
    }, 1200);
  };

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const poNum = newPoNumber.trim() || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const buyerPreset = BUYER_COMPANY_PRESETS.find(b => b.id === newBuyerOrgId);
    const compName = buyerPreset?.name || getBuyerDisplayName(newBuyerOrgId);

    const blankPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      poName: '',
      buyerOrgId: newBuyerOrgId,
      companyName: compName,
      supplierOrgId: 'supp-org-1',
      supplierName: 'CloudBridge Solutions LLC',
      supplierContactName: '',
      supplierContactEmail: '',
      supplierContactPhone: '',
      supplierAddress: '',
      supplierPan: '',
      supplierGst: '',
      status: 'DRAFT',
      orderDate: new Date().toISOString().split('T')[0],
      requestDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      promisedDate: '',
      eventReference: '',
      linkedPrs: '',
      isUrgent: false,
      reasonForOrdering: '',
      projectName: '',
      termsAndConditions: '',
      attachments: [],
      paymentTerms: '2/10 Net 30',
      currency: 'USD',
      exchangeRate: 1.00,
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      shippingAddress: '',
      billingAddress: buyerPreset?.billingAddress || 'AP Shared Services, PO Box 8802, New York, NY 10001',
      buyerContactName: newBuyerOrgId === 'buyer-org-1' ? 'Sarah Chen (Lead Procurement)' : newBuyerOrgId === 'buyer-org-2' ? 'David Vance (Director of Sourcing)' : 'Elena Rostova (Chief Logistics)',
      notes: '',
      lineItems: [
        {
          id: `line-${Date.now()}-1`,
          itemNumber: 1,
          itemName: '',
          partNumber: '',
          description: '',
          contract: '',
          quantity: '' as any,
          uom: 'EA',
          unitPrice: '' as any,
          taxCode: 'GST-8',
          taxRate: 8,
          taxAmount: 0,
          totalPrice: 0,
          exchangeRate: 1.00,
          priceInBaseCurrency: 0,
          supplierInstructions: '',
          internalComments: '',
          deliveryDate: '',
          attachments: []
        }
      ]
    };
    (blankPo as any).isDraftNew = true;

    setOrders(prev => [blankPo, ...prev]);
    setShowCreatePoModal(false);
    setSelectedPO(blankPo);
    navigate('/orders', { poNumber: blankPo.poNumber });
    setActionSuccess(`Purchase Order ${blankPo.poNumber} initialized. Fill in header specifications and line item deliverables.`);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO || !newCommentText.trim()) return;
    const newMsg: TransactionComment = {
      id: `comm-${Date.now()}`,
      entityType: 'PO',
      entityId: selectedPO.id,
      authorId: currentUser?.id || 'usr-current',
      authorName: currentUser?.name || 'Elena Rostova (CloudBridge / Acme)',
      authorRole: 'SUPPLIER',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    setCommentsMap(prev => ({
      ...prev,
      [selectedPO.poNumber]: [...(prev[selectedPO.poNumber] || []), newMsg]
    }));
    setNewCommentText('');
  };

  const handleAiDraftComment = () => {
    if (!selectedPO) return;
    setAiDrafting(true);
    setTimeout(() => {
      setNewCommentText(`Confirming scheduled delivery to ${selectedPO.shippingAddress.split('\n')[0]}. All serial numbers verified against packing slip and electronic ASN.`);
      setAiDrafting(false);
    }, 400);
  };

  // Filtered & Sorted orders
  const filteredOrders = orders.filter(po => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPo = po.poNumber.toLowerCase().includes(q);
      const matchBuyer = po.buyerContactName?.toLowerCase().includes(q) || 
        (po.buyerOrgId === 'buyer-org-3' && 'meridian health network'.includes(q)) || 
        (po.buyerOrgId === 'buyer-org-1' && 'apex global'.includes(q)) || 
        (po.buyerOrgId === 'buyer-org-2' && 'novatech'.includes(q));
      const matchNotes = po.notes?.toLowerCase().includes(q);
      const matchItems = po.lineItems?.some(li => li.description.toLowerCase().includes(q) || li.partNumber?.toLowerCase().includes(q));
      if (!matchPo && !matchBuyer && !matchNotes && !matchItems) return false;
    }
    if (buyerFilter !== 'ALL' && po.buyerOrgId !== buyerFilter) return false;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'DRAFT' && po.status !== 'DRAFT') return false;
      if (statusFilter === 'NEEDS_ACTION' && po.status !== 'ISSUED') return false;
      if (statusFilter === 'ACKNOWLEDGED' && po.status !== 'ACKNOWLEDGED') return false;
      if (statusFilter === 'IN_FULFILLMENT' && po.status !== 'IN_FULFILLMENT') return false;
      if (statusFilter === 'SHIPPED' && po.status !== 'SHIPPED') return false;
      if (statusFilter === 'COMPLETED' && po.status !== 'COMPLETED') return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'DATE_DESC') return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    if (sortBy === 'DATE_ASC') return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
    if (sortBy === 'AMOUNT_DESC') return (b.totalAmount || 0) - (a.totalAmount || 0);
    if (sortBy === 'AMOUNT_ASC') return (a.totalAmount || 0) - (b.totalAmount || 0);
    return 0;
  });

  const scopedOrders = buyerFilter === 'ALL' ? orders : orders.filter(o => o.buyerOrgId === buyerFilter);
  const totalPipelineVal = scopedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const needsActionCount = scopedOrders.filter(o => o.status === 'ISSUED').length;
  const inFulfillmentCount = scopedOrders.filter(o => o.status === 'IN_FULFILLMENT' || o.status === 'SHIPPED').length;
  const completedCount = scopedOrders.filter(o => o.status === 'COMPLETED' || o.status === 'ACKNOWLEDGED').length;

  // Live relationship counts for client filter
  const apexPendingAck = orders.filter(o => o.buyerOrgId === 'buyer-org-1' && o.status === 'ISSUED').length;
  const meridianActionReq = orders.filter(o => o.buyerOrgId === 'buyer-org-3').length;
  const novaTechInTransit = orders.filter(o => o.buyerOrgId === 'buyer-org-2').length;

  const getBuyerDisplayName = (buyerOrgId?: string) => {
    if (buyerOrgId === 'buyer-org-3') return 'Meridian Health Network';
    if (buyerOrgId === 'buyer-org-2') return 'NovaTech Aerospace & Defense';
    if (buyerOrgId === 'buyer-org-1') return 'Apex Global Enterprises';
    return 'Enterprise Client';
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

  const getBuyerBadgeInitials = (buyerOrgId?: string) => {
    if (buyerOrgId === 'buyer-org-3') return 'ME';
    if (buyerOrgId === 'buyer-org-2') return 'NO';
    if (buyerOrgId === 'buyer-org-1') return 'AP';
    return 'EC';
  };

  const getStatusBadge = (status: string, poNumber?: string) => {
    if (status === 'DRAFT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Draft (Unsaved)
        </span>
      );
    }
    if (poNumber === 'PO-2026-101') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Approved & Released
        </span>
      );
    }
    switch (status) {
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Needs Acknowledgment
          </span>
        );
      case 'ACKNOWLEDGED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Acknowledged (ACK)
          </span>
        );
      case 'IN_FULFILLMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            In Fulfillment
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-300">
            <Truck className="w-3 h-3 text-teal-600" />
            Shipped (ASN Issued)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3 h-3 text-slate-600" />
            Completed & Billed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // =========================================================================
  // VIEW: PURCHASE ORDER DETAIL VIEW (Dual Mode: Interactive Detail Workspace & PDF Spec)
  // =========================================================================
  if (selectedPO) {
    const isMeridianPDF = selectedPO.poNumber === 'PO-2026-101';
    const comments = commentsMap[selectedPO.poNumber] || [];

    return (
      <div className="space-y-4 pb-16">
        {/* Top Control Bar / Navigation */}
        <div className="bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
          {/* Left: Return button, Breadcrumb & Status */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setSelectedPO(null);
                navigate('/orders', {});
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition cursor-pointer shrink-0"
              title="Return to Orders directory"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
              <span>Orders</span>
            </button>
            
            <span className="text-slate-300 select-none">/</span>
            
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md">
              {selectedPO.poNumber}
            </span>

            <span className="text-xs font-medium text-slate-500 truncate max-w-[160px] hidden md:inline">
              • {getBuyerDisplayName(selectedPO.buyerOrgId)}
            </span>

            <div className="shrink-0">
              {getStatusBadge(selectedPO.status, selectedPO.poNumber)}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
            {/* Edit Global Details */}
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
                  onClick={() => setIsEditingGlobal(false)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Discard changes"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingGlobal(true)}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title="Edit order header specifications and line items"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
            )}

            {/* Collaboration Thread Drawer Toggle */}
            <button
              onClick={() => setShowCollabDrawer(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showCollabDrawer 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Messages</span>
              {comments.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showCollabDrawer ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  {comments.length}
                </span>
              )}
            </button>

            {/* Preview PDF Eye Button */}
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Preview Official Purchase Order PDF"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={() => downloadOrderPdf(selectedPO, getBuyerDisplayName(selectedPO.buyerOrgId))}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Export official Purchase Order PDF document"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>

            {/* Contextual Action: Acknowledge */}
            {selectedPO.status === 'ISSUED' && (
              <button
                onClick={() => handleAcknowledge(selectedPO.id)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            )}

            {/* Contextual Action: Create ASN */}
            <button
              onClick={() => {
                setTrackingNumber(selectedPO.asnNumber ? 'FXF-8849-2016-US' : '');
                setShowAsnModal(true);
              }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Truck className="w-3.5 h-3.5 text-teal-400" />
              <span>Create ASN</span>
            </button>

            {/* Contextual Action: 1-Click PO Flip to Invoice (controlled by Settings) */}
            {settings.autoPoFlip && (
              <button
                onClick={() => {
                  setFlipInvoiceNum(`INV-2026-${selectedPO.poNumber.replace('PO-2026-', '') || '201'}`);
                  setShowFlipModal(true);
                }}
                className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-200" />
                <span>1-Click Flip</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Alert Notification */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-xs flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">
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

        {/* Layout Grid: Main Content Area + Optional Collab Split Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className={`${showCollabDrawer ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-200 space-y-4`}>

            {/* =========================================================================
                INTERACTIVE ENTERPRISE DETAIL WORKSPACE
                ========================================================================= */}
            <div className="space-y-4">
              {/* =========================================================================
                  TIER 1: HEADER FIELDS (SINGLE UNIFIED ENTERPRISE GRID)
                  ========================================================================= */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                {/* Minimal Header Bar */}
                <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-50/70 border-b border-slate-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Order Details</h2>
                    {isEditingGlobal && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Editing
                      </span>
                    )}
                  </div>

                  {(isEditingGlobal ? editHeader.isUrgent : selectedPO.isUrgent) && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 uppercase tracking-wider">
                      Urgent PO
                    </span>
                  )}
                </div>

                {/* Grid for all Header Fields - Uniform 1-Column Horizontal Width */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                    {/* 1. PO Number */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          PO Number <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-100/70 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 flex items-center truncate">
                          {selectedPO.poNumber}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          PO Number
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                          {selectedPO.poNumber}
                        </div>
                      </div>
                    )}

                    {/* 2. PO Name / Description */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          PO Name / Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={editHeader.poName}
                          onChange={e => handleHeaderFieldChange('poName', e.target.value)}
                          placeholder="Enter purchase order title..."
                          className={`w-full h-16 px-2.5 py-1.5 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 resize-none transition shadow-2xs ${
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
                          PO Name / Description
                        </label>
                        <div className="w-full h-16 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 overflow-y-auto leading-relaxed" title={editHeader.poName}>
                          {editHeader.poName || 'Enterprise Compute Node Deployment & Bay 14 Server Rack Expansion'}
                        </div>
                      </div>
                    )}

                    {/* 3. Company Name */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editHeader.companyName}
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
                          {editHeader.companyName || getBuyerDisplayName(selectedPO.buyerOrgId)}
                        </div>
                      </div>
                    )}

                    {/* 4. Project Name */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={editHeader.projectName}
                          onChange={e => handleHeaderFieldChange('projectName', e.target.value)}
                          placeholder="e.g. Project Apollo"
                          className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Project Name
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                          {editHeader.projectName || 'Project Apollo - Datacenter Node Scaling'}
                        </div>
                      </div>
                    )}

                    {/* 5. Request Date */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Request Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={editHeader.requestDate}
                          onChange={e => handleHeaderFieldChange('requestDate', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.requestDate 
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.requestDate && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.requestDate}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Request Date
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                          {formatDateMMDDYYYY(editHeader.requestDate)}
                        </div>
                      </div>
                    )}

                    {/* 6. Delivery Date */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Delivery Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={editHeader.deliveryDate}
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
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                          {formatDateMMDDYYYY(editHeader.deliveryDate)}
                        </div>
                      </div>
                    )}

                    {/* 7. Is Urgent ? */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Is Urgent ?
                        </label>
                        <div className="flex items-center gap-1.5 h-8">
                          <button
                            type="button"
                            onClick={() => handleHeaderFieldChange('isUrgent', false)}
                            className={`flex-1 h-8 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                              !editHeader.isUrgent
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHeaderFieldChange('isUrgent', true)}
                            className={`flex-1 h-8 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                              editHeader.isUrgent
                                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                            }`}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Is Urgent ?
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 h-8">
                          <div className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition border ${
                            !editHeader.isUrgent
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            No
                          </div>
                          <div className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition border ${
                            editHeader.isUrgent
                              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            Yes
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 8. Reason for Ordering */}
                    {isEditingGlobal ? (
                      <div>
                        <label className={`block text-[11px] font-semibold mb-1 ${editHeader.isUrgent ? 'text-amber-700' : 'text-slate-700'}`}>
                          Reason for Ordering {editHeader.isUrgent && <span className="text-red-500 font-bold">*</span>}
                        </label>
                        <textarea
                          rows={2}
                          value={editHeader.reasonForOrdering}
                          onChange={e => handleHeaderFieldChange('reasonForOrdering', e.target.value)}
                          placeholder={editHeader.isUrgent ? "Required: Enter justification for urgent ordering..." : "Optional: Add business justification..."}
                          className={`w-full h-16 px-2.5 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 resize-none transition shadow-2xs ${
                            validationErrors.header?.reasonForOrdering
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : editHeader.isUrgent && !editHeader.reasonForOrdering.trim()
                              ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500/20 focus:border-amber-500'
                              : 'border-slate-300 bg-white focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.reasonForOrdering && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.reasonForOrdering}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Reason for Ordering
                        </label>
                        <div className="w-full h-16 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 overflow-y-auto leading-relaxed" title={editHeader.reasonForOrdering}>
                          {editHeader.reasonForOrdering || (editHeader.isUrgent ? 'Urgent telemetry nodes for Bay 14 cloud expansion outage mitigation.' : 'Standard capacity buffer replenishment.')}
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
                          value={editHeader.supplierName}
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
                          {editHeader.supplierName || 'Acme Industrial Tech Inc.'}
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
                          value={editHeader.supplierContactName}
                          onChange={e => handleContactChange(e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.supplierContactName 
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        >
                          <option value="">-- Select Contact --</option>
                          {(SUPPLIER_PRESETS.find(s => s.name === editHeader.supplierName)?.contacts || [{ name: editHeader.supplierContactName }]).map(c => (
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
                          {editHeader.supplierContactName || 'Elena Rostova'}
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
                          value={editHeader.supplierContactEmail}
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
                          {editHeader.supplierContactEmail || 'elena.rostova@cloudbridge.io'}
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
                          value={editHeader.supplierContactPhone}
                          onChange={e => handleHeaderFieldChange('supplierContactPhone', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
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
                          {editHeader.supplierContactPhone || '+1 (555) 382-9102'}
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
                          <span>View & Edit More Fields (+10 Secondary Fields)</span>
                        </button>
                      </div>
                    )}

                    {/* Secondary 10 Fields: Shown continuously in View Mode, and toggled in Edit Mode */}
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
                              value={editHeader.supplierAddress}
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
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editHeader.supplierAddress}>
                              {editHeader.supplierAddress || '742 Evergreen Terrace, Tech Park, Austin, TX 78728'}
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
                              value={editHeader.supplierPan}
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
                              {editHeader.supplierPan || 'AAACB1234F'}
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
                              value={editHeader.supplierGst}
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
                              {editHeader.supplierGst || '27AAACB1234F1Z5'}
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
                              value={editHeader.deliveryAddress}
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
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editHeader.deliveryAddress}>
                              {editHeader.deliveryAddress || DELIVERY_ADDRESS_PRESETS[0]}
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
                              value={editHeader.billingAddress}
                              onChange={e => handleHeaderFieldChange('billingAddress', e.target.value)}
                              className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Buyer Billing Address
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editHeader.billingAddress}>
                              {editHeader.billingAddress || 'Apex Global AP Shared Services, PO Box 8802, New York, NY 10001'}
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
                              value={editHeader.paymentTerms}
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
                              {editHeader.paymentTerms || '2/10 Net 30'}
                            </div>
                          </div>
                        )}

                        {/* 19. Event Reference */}
                        {isEditingGlobal ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Event Reference <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editHeader.eventReference}
                              onChange={e => handleHeaderFieldChange('eventReference', e.target.value)}
                              placeholder="e.g. EVT-RFX-2026-092"
                              className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                                validationErrors.header?.eventReference 
                                  ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                                  : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                              }`}
                            />
                            {validationErrors.header?.eventReference && (
                              <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.eventReference}</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Event Reference
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 flex items-center truncate">
                              {editHeader.eventReference || 'EVT-RFX-2026-092'}
                            </div>
                          </div>
                        )}

                        {/* 20. Linked PR(s) */}
                        {isEditingGlobal ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Linked PR(s) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editHeader.linkedPrs}
                              onChange={e => handleHeaderFieldChange('linkedPrs', e.target.value)}
                              placeholder="e.g. PR-2026-88192"
                              className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                                validationErrors.header?.linkedPrs 
                                  ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                                  : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                              }`}
                            />
                            {validationErrors.header?.linkedPrs && (
                              <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.linkedPrs}</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Linked PR(s)
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-700 flex items-center truncate">
                              {editHeader.linkedPrs || 'PR-2026-88192'}
                            </div>
                          </div>
                        )}

                        {/* 21. Terms and Condition (Spans 2 columns for comfortable reading/editing) */}
                        {isEditingGlobal ? (
                          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Terms and Condition
                            </label>
                            <input
                              type="text"
                              value={editHeader.termsAndConditions}
                              onChange={e => handleHeaderFieldChange('termsAndConditions', e.target.value)}
                              placeholder="Enter terms and conditions..."
                              className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                            />
                          </div>
                        ) : (
                          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Terms and Condition
                            </label>
                            <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editHeader.termsAndConditions}>
                              {editHeader.termsAndConditions || 'Verisource Network Master Supply Agreement v4.2 & Touchless 3-Way Invoicing terms.'}
                            </div>
                          </div>
                        )}

                        {/* 22. Attachments (Spans 2 columns; Upload strictly in Edit Mode) */}
                        {isEditingGlobal ? (
                          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-slate-700">
                                Attachments <span className="text-red-500">*</span>
                              </label>
                              <label
                                htmlFor="global-po-attachment-file"
                                className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                                title="Upload single or multiple document files"
                              >
                                <Upload className="w-2.5 h-2.5" />
                                <span>Upload Documents</span>
                              </label>
                              <input
                                id="global-po-attachment-file"
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
                              {(editHeader.attachments && editHeader.attachments.length > 0 ? editHeader.attachments : []).map((file, fIdx) => (
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
                              {(!editHeader.attachments || editHeader.attachments.length === 0) && (
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
                              {editHeader.attachments && editHeader.attachments.length > 0 ? (
                                editHeader.attachments.map((file, fIdx) => (
                                  <span key={fIdx} className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                                    <Paperclip className="w-2.5 h-2.5 text-slate-400" />
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
                      {currentActiveLines.length} Item{currentActiveLines.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {isEditingGlobal && (
                    <button
                      onClick={handleAddLineItem}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[1500px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3 min-w-[200px]">ITEM NAME</th>
                        <th className="py-2.5 px-3 min-w-[260px]">DESCRIPTION</th>
                        <th className="py-2.5 px-3 w-36 min-w-[130px]">ITEM CODE</th>
                        <th className="py-2.5 px-3 min-w-[170px]">CONTRACT</th>
                        <th className="py-2.5 px-3 text-center w-20">QTY</th>
                        <th className="py-2.5 px-3 text-center w-20">UOM</th>
                        <th className="py-2.5 px-3 text-right w-28">UNIT PRICE</th>
                        <th className="py-2.5 px-3 text-center w-24">TAX</th>
                        <th className="py-2.5 px-3 text-right w-28">TOTAL PRICE</th>
                        <th className="py-2.5 px-3 text-right w-28">BASE CURRENCY</th>
                        <th className="py-2.5 px-3 min-w-[200px]">COMMENTS</th>
                        <th className="py-2.5 px-3 text-center min-w-[160px]">ATTACHMENTS</th>
                        {isEditingGlobal && <th className="py-2.5 px-3 text-center w-14">ACTION</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {currentActiveLines.length > 0 ? (
                        currentActiveLines.map((item, idx) => {
                          const lineTot = Number(item.totalPrice) || (Number(item.quantity) * Number(item.unitPrice)) || 0;
                          const exRate = item.exchangeRate || 1.0;
                          const basePrice = item.priceInBaseCurrency || (lineTot * exRate);

                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
                              {/* 1. Line Item ID */}
                              <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                                {String(item.itemNumber || idx + 1).padStart(2, '0')}
                              </td>

                              {/* 2. Line Item Name (Dropdown) */}
                              <td className="py-3 px-3">
                                {isEditingGlobal ? (
                                  <div className="space-y-0.5">
                                    <select
                                      value={
                                        LINE_ITEM_CATALOG_PRESETS.some(p => p.name === (item.itemName || item.description))
                                          ? (LINE_ITEM_CATALOG_PRESETS.find(p => p.name === (item.itemName || item.description))?.name || '')
                                          : (item.itemName ? 'custom' : '')
                                      }
                                      onChange={e => handleItemCatalogSelect(idx, e.target.value)}
                                      className={`w-full h-8 px-2 bg-white border rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                                        validationErrors.lines?.[idx]?.itemName 
                                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                                      }`}
                                    >
                                      <option value="">-- Select Item --</option>
                                      {LINE_ITEM_CATALOG_PRESETS.map((p, pIdx) => (
                                        <option key={pIdx} value={p.name}>{p.name}</option>
                                      ))}
                                      <option value="custom">-- Custom Item / Milestone --</option>
                                    </select>
                                    {validationErrors.lines?.[idx]?.itemName && (
                                      <span className="text-[9px] text-rose-600 font-bold block leading-none">{validationErrors.lines[idx].itemName}</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="font-bold text-xs text-slate-900 leading-snug">
                                    {item.itemName || (item.description ? item.description.split('/')[0].trim() : <span className="text-slate-400 italic font-normal">Unspecified</span>)}
                                  </div>
                                )}
                              </td>

                              {/* 3. Description (Dedicated Text Column) */}
                              <td className="py-3 px-3">
                                {isEditingGlobal ? (
                                  <div className="space-y-0.5">
                                    <textarea
                                      rows={2}
                                      value={item.description || ''}
                                      onChange={e => handleLineChange(idx, 'description', e.target.value)}
                                      placeholder="Enter deliverable description..."
                                      className={`w-full h-12 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 resize-none transition shadow-2xs ${
                                        validationErrors.lines?.[idx]?.description 
                                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                                      }`}
                                    />
                                    {validationErrors.lines?.[idx]?.description && (
                                      <span className="text-[9px] text-rose-600 font-bold block leading-none">{validationErrors.lines[idx].description}</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-700 leading-relaxed max-w-[280px]" title={item.description}>
                                    {item.description || <span className="text-slate-400 italic">No description provided</span>}
                                  </div>
                                )}
                              </td>

                              {/* 4. Item Code (Separated Column) */}
                              <td className="py-3 px-3">
                                {isEditingGlobal ? (
                                  <input
                                    type="text"
                                    value={item.partNumber || ''}
                                    onChange={e => handleLineChange(idx, 'partNumber', e.target.value)}
                                    placeholder="e.g. ACM-NODE-64GB"
                                    className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                                  />
                                ) : (
                                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap inline-block">
                                    {item.partNumber || '-'}
                                  </span>
                                )}
                              </td>

                              {/* 5. Contract */}
                              <td className="py-3 px-3">
                                {isEditingGlobal ? (
                                  <select
                                    value={item.contract || ''}
                                    onChange={e => handleLineChange(idx, 'contract', e.target.value)}
                                    className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                                  >
                                    <option value="">-- Select Contract --</option>
                                    {CONTRACT_PRESETS.map(cnt => (
                                      <option key={cnt} value={cnt}>{cnt}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap inline-block">
                                    {item.contract || '-'}
                                  </span>
                                )}
                              </td>

                              {/* 6. Quantity */}
                              <td className="py-3 px-3 text-center">
                                {isEditingGlobal ? (
                                  <div className="space-y-0.5">
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="0"
                                      value={(item.quantity as any) === '' || item.quantity === undefined ? '' : item.quantity}
                                      onChange={e => handleLineChange(idx, 'quantity', e.target.value)}
                                      className={`w-16 h-8 px-1 text-center bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs mx-auto block ${
                                        validationErrors.lines?.[idx]?.quantity 
                                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                                      }`}
                                    />
                                    {validationErrors.lines?.[idx]?.quantity && (
                                      <span className="text-[9px] text-rose-600 font-bold block text-center leading-none">Required</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="font-bold text-slate-900 font-mono text-xs">{item.quantity}</span>
                                )}
                              </td>

                              {/* 7. UoM */}
                              <td className="py-3 px-3 text-center">
                                {isEditingGlobal ? (
                                  <div className="space-y-0.5">
                                    <select
                                      value={item.uom || ''}
                                      onChange={e => handleLineChange(idx, 'uom', e.target.value)}
                                      className={`w-16 h-8 px-1 text-center bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs mx-auto block ${
                                        validationErrors.lines?.[idx]?.uom 
                                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                                      }`}
                                    >
                                      <option value="">--</option>
                                      <option value="EA">EA</option>
                                      <option value="SET">SET</option>
                                      <option value="BOX">BOX</option>
                                      <option value="YR">YR</option>
                                      <option value="HR">HR</option>
                                      <option value="JOB">JOB</option>
                                      <option value="KG">KG</option>
                                    </select>
                                    {validationErrors.lines?.[idx]?.uom && (
                                      <span className="text-[9px] text-rose-600 font-bold block text-center leading-none">Required</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{item.uom || 'EA'}</span>
                                )}
                              </td>

                              {/* 8. Unit Price */}
                              <td className="py-3 px-3 text-right">
                                {isEditingGlobal ? (
                                  <div className="space-y-0.5">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      value={(item.unitPrice as any) === '' || item.unitPrice === undefined ? '' : item.unitPrice}
                                      onChange={e => handleLineChange(idx, 'unitPrice', e.target.value)}
                                      className={`w-24 h-8 px-2 text-right bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ml-auto block ${
                                        validationErrors.lines?.[idx]?.unitPrice 
                                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                                      }`}
                                    />
                                    {validationErrors.lines?.[idx]?.unitPrice && (
                                      <span className="text-[9px] text-rose-600 font-bold block text-right leading-none">Required</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="font-mono text-slate-800 font-medium text-xs">
                                    ${Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                )}
                              </td>

                              {/* 9. Tax */}
                              <td className="py-3 px-3 text-center">
                                {isEditingGlobal ? (
                                  <div className="space-y-0.5">
                                    <select
                                      value={item.taxCode || ''}
                                      onChange={e => handleLineChange(idx, 'taxCode', e.target.value)}
                                      className={`w-20 h-8 px-1 text-center bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs mx-auto block ${
                                        validationErrors.lines?.[idx]?.taxCode 
                                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400' 
                                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                                      }`}
                                    >
                                      <option value="">-- Tax --</option>
                                      <option value="GST-18">18%</option>
                                      <option value="GST-12">12%</option>
                                      <option value="GST-8">8%</option>
                                      <option value="GST-5">5%</option>
                                      <option value="SALES-TAX-8.25">8.25%</option>
                                      <option value="TAX-EXEMPT">0%</option>
                                    </select>
                                    {validationErrors.lines?.[idx]?.taxCode && (
                                      <span className="text-[9px] text-rose-600 font-bold block text-center leading-none">Required</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                                    {item.taxRate ?? 0}% GST
                                  </span>
                                )}
                              </td>

                              {/* 10. Total Price */}
                              <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-xs">
                                ${lineTot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* 11. Price in Base Currency */}
                              <td className="py-3 px-3 text-right">
                                <div className="font-mono text-slate-700 text-xs font-semibold">
                                  ${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">1.00 USD</div>
                              </td>

                              {/* 12. Comments (Single Text Box) */}
                              <td className="py-3 px-3">
                                {isEditingGlobal ? (
                                  <input
                                    type="text"
                                    value={item.internalComments || item.supplierInstructions || ''}
                                    onChange={e => {
                                      handleLineChange(idx, 'internalComments', e.target.value);
                                      handleLineChange(idx, 'supplierInstructions', e.target.value);
                                    }}
                                    placeholder="Add delivery note / comments..."
                                    className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
                                  />
                                ) : (
                                  <div className="text-xs text-slate-600 truncate max-w-[200px]" title={item.internalComments || item.supplierInstructions}>
                                    {item.internalComments || item.supplierInstructions || <span className="text-slate-400 italic">None</span>}
                                  </div>
                                )}
                              </td>

                              {/* 13. Attachments (Single & Bulk upload option; Upload strictly in Edit Mode) */}
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="file"
                                  multiple
                                  id={`line-attachment-${idx}`}
                                  className="hidden"
                                  onChange={e => handleLineFileUpload(idx, e.target.files)}
                                />
                                {isEditingGlobal ? (
                                  <div className="flex flex-col items-center gap-1">
                                    {item.attachments && item.attachments.length > 0 ? (
                                      <div className="flex flex-wrap items-center justify-center gap-1">
                                        {item.attachments.map((file, fIdx) => (
                                          <span key={fIdx} className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                            <Paperclip className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                            <span className="truncate max-w-[70px]" title={file}>{file}</span>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveLineAttachment(idx, fIdx)}
                                              className="text-slate-400 hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                                              title="Remove document"
                                            >
                                              &times;
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    ) : null}
                                    <label
                                      htmlFor={`line-attachment-${idx}`}
                                      className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition shadow-2xs"
                                      title="Upload single or multiple files for this line deliverable"
                                    >
                                      <Upload className="w-2.5 h-2.5" />
                                      <span>{item.attachments && item.attachments.length > 0 ? '+ Add' : 'Upload'}</span>
                                    </label>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    {item.attachments && item.attachments.length > 0 ? (
                                      <div className="flex flex-wrap items-center justify-center gap-1">
                                        {item.attachments.map((file, fIdx) => (
                                          <span key={fIdx} className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                                            <Paperclip className="w-2.5 h-2.5 text-slate-400" />
                                            <span className="truncate max-w-[75px]" title={file}>{file}</span>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 italic">No files</span>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* 14. Actions */}
                              {isEditingGlobal && (
                                <td className="py-3 px-3 text-center">
                                  <button
                                    onClick={() => handleRemoveLineItem(idx)}
                                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer mx-auto"
                                    title="Remove line item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={isEditingGlobal ? 14 : 13} className="py-8 text-center text-slate-400">
                            No deliverables found for this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =========================================================================
                  TIER 3: ORDER SUMMARY (VERTICAL CALCULATION)
                  ========================================================================= */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5 text-slate-500" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Order Summary
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-end">
                    {/* Right: Vertical Calculation Card */}
                    <div className="w-full sm:w-80 md:w-96 bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 text-xs space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Subtotal</span>
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
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900">Gross Total</span>
                          <span className="text-[10px] font-semibold text-slate-500">(USD)</span>
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

          {/* Right Split Drawer: Comments & Collaboration */}
          {showCollabDrawer && (
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Order Collaboration
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
                Messages in this thread are securely bound to <span className="font-bold text-slate-800">{selectedPO.poNumber}</span> and visible to buyer procurement leads.
              </div>

              {/* Message Feed */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No inquiries or messages for this purchase order yet.
                  </div>
                ) : (
                  comments.map(msg => (
                    <div 
                      key={msg.id}
                      className={`p-3 rounded-xl border ${
                        msg.authorRole === 'SUPPLIER'
                          ? 'bg-emerald-50/50 border-emerald-200 ml-4'
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
                    className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>{aiDrafting ? 'Drafting...' : 'AI Auto-Draft'}</span>
                  </button>
                </div>
                <textarea
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="Type an order inquiry, delivery confirmation, or serial spec..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Order Message</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal: Dispatch ASN */}
        {showAsnModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-sm text-slate-900">Dispatch Advance Shipping Notice (ASN)</h3>
                </div>
                <button onClick={() => setShowAsnModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleDispatchASN} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Purchase Order</label>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                    {selectedPO.poNumber} — {getBuyerDisplayName(selectedPO.buyerOrgId)}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Freight Carrier</label>
                  <select
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="FedEx Freight Priority">FedEx Freight Priority (Dedicated Air-Ride)</option>
                    <option value="UPS Supply Chain Solutions">UPS Supply Chain Solutions</option>
                    <option value="Old Dominion Freight Line">Old Dominion Freight Line (LTL)</option>
                    <option value="DHL Global Forwarding">DHL Global Forwarding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tracking / PRO #</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. FXF-8849-2016-US"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Leave blank to auto-generate verified barcode tracking.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Estimated Dock Delivery</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={e => setEstimatedDelivery(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAsnModal(false)}
                    className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    Dispatch ASN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: 1-Click PO Flip to Invoice */}
        {showFlipModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">1-Click PO-to-Invoice Flip</h3>
                </div>
                <button onClick={() => setShowFlipModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFlipInvoice} className="mt-4 space-y-3.5 text-xs">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900">
                  <div className="font-bold text-xs">Automated 3-Way Match Verification</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    All {selectedPO.lineItems?.length || 1} line items, pricing rates, and buyer remittance instructions will be synchronized into an electronic commercial invoice.
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Generated Invoice Number</label>
                  <input
                    type="text"
                    value={flipInvoiceNum}
                    onChange={e => setFlipInvoiceNum(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Invoice Amount (Pre-Matched)</label>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 font-mono">
                    ${selectedPO.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowFlipModal(false)}
                    className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    Generate & Submit Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal: Official PDF Spec Preview */}
        {showPdfModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
              {/* Modal Top Action Bar */}
              <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm tracking-tight font-mono">{selectedPO.poNumber}</span>
                      <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">PDF Spec</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Official High-Fidelity Purchase Order Document</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadOrderPdf(selectedPO, getBuyerDisplayName(selectedPO.buyerOrgId))}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export Purchase Order PDF"
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

              {/* Modal Content - Official PDF Canvas */}
              <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/60">
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 sm:p-10 text-slate-800 font-sans max-w-3xl mx-auto">
                  {/* Header: Buyer Letterhead (Left) vs Document Title & PO # (Right) */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {isMeridianPDF ? 'Meridian Health Network' : getBuyerDisplayName(selectedPO.buyerOrgId)}
                      </h1>
                      <div className="text-xs font-bold text-slate-700 tracking-wider mt-0.5 uppercase">
                        PROCUREMENT & SUPPLY CHAIN DIVISION
                      </div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {isMeridianPDF ? (
                          <>
                            4200 Medical Center Way, Suite 800<br />
                            Chicago, IL 60611 • procurement@meridianhealth.org
                          </>
                        ) : (
                          selectedPO.billingAddress
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right flex flex-col sm:items-end">
                      <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                        PURCHASE ORDER
                      </div>
                      <div className="text-sm font-semibold text-slate-700 mt-1">
                        PO Number: <span className="font-bold text-slate-900 font-mono">{selectedPO.poNumber}</span>
                      </div>
                      <div className="mt-2">
                        {getStatusBadge(selectedPO.status, selectedPO.poNumber)}
                      </div>
                    </div>
                  </div>

                  {/* 5-Box Key Metadata Grid (100% PDF Fidelity) */}
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PO DATE</div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        {isMeridianPDF ? 'Oct 28, 2026' : formatDateMMDDYYYY(selectedPO.orderDate)}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DELIVERY DUE</div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        {isMeridianPDF ? 'Nov 12, 2026' : formatDateMMDDYYYY(selectedPO.promisedDate)}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT TERMS</div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        {selectedPO.paymentTerms || 'Net 30 Days'}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROCUREMENT SPECIALIST</div>
                      <div className="text-xs font-bold text-slate-800 mt-1 truncate px-1">
                        {isMeridianPDF ? 'Sarah Chen' : selectedPO.buyerContactName?.split('(')[0]?.trim() || 'Sarah Chen'}
                      </div>
                    </div>
                    <div className="p-3 col-span-2 sm:col-span-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VENDOR ERP ID</div>
                      <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
                        {isMeridianPDF ? 'VEND-7701' : (selectedPO.buyerOrgId === 'buyer-org-1' ? 'VEND-8821' : 'VEND-4019')}
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Entity Cards: VENDOR / CONTRACTOR vs SHIP TO / DEPLOYMENT SITE */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 bg-white">
                      <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>VENDOR / CONTRACTOR</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {selectedPO.supplierName || 'CloudBridge Solutions LLC'}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                        100 Innovation Parkway, Suite 450<br />
                        San Jose, CA 95134<br />
                        <span className="text-slate-500 font-medium">Contact:</span> enterprise-accounts@cloudbridge.com<br />
                        <span className="text-slate-500 font-medium">Remittance:</span> JPMorgan Chase (Account ending 4921)
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-white">
                      <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>SHIP TO / DEPLOYMENT SITE</span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Dock Receiving</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {isMeridianPDF ? 'Meridian Data Center — Bay 14' : selectedPO.shippingAddress.split('\n')[0]}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isMeridianPDF ? (
                          <>
                            Attn: IT Infrastructure Operations<br />
                            7800 Technology Boulevard, Dock B<br />
                            Naperville, IL 60563<br />
                            <span className="text-slate-500 font-medium">Receiving Hours:</span> Mon–Fri, 08:00 – 16:00 CST
                          </>
                        ) : (
                          selectedPO.shippingAddress
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table with Navy Header (Exact PDF Spec) */}
                  <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1e293b] text-white font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-3 w-10 text-center">#</th>
                          <th className="py-3 px-4">ITEM DESCRIPTION & SPECIFICATIONS</th>
                          <th className="py-3 px-3 text-center w-16">QTY</th>
                          <th className="py-3 px-3 text-center w-16">UOM</th>
                          <th className="py-3 px-4 text-right w-28">UNIT PRICE</th>
                          <th className="py-3 px-4 text-right w-32">TOTAL (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {selectedPO.lineItems && selectedPO.lineItems.length > 0 ? (
                          selectedPO.lineItems.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50/80 transition">
                              <td className="py-3.5 px-3 text-center text-slate-400 font-mono font-medium">
                                {String(idx + 1).padStart(2, '0')}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900 font-mono text-[11px] text-indigo-900">
                                  {item.partNumber || `PART-${idx + 1}`}
                                </div>
                                <div className="text-slate-700 text-xs mt-0.5 leading-snug">
                                  {item.description}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                                {item.quantity}
                              </td>
                              <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                                {item.uom || 'EA'}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                                ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                                ${(item.totalPrice || item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-slate-400">
                              No line items found on this order specification.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Section: Billing Instructions (Left) vs Financial Summary (Right) */}
                  <div className="mt-6 pt-2 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                    <div className="sm:col-span-7 bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs">
                      <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                        Billing & Submission Instructions
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                        <li>
                          All electronic invoices must reference Purchase Order number <span className="font-bold text-slate-900">{selectedPO.poNumber}</span> and Vendor ID <span className="font-bold text-slate-900">{isMeridianPDF ? 'VEND-7701' : 'VEND-8821'}</span>.
                        </li>
                        <li>
                          Submit electronic invoices directly via the Verisource Supplier Portal using <span className="font-bold text-slate-900">1-Click PO-Flip</span> or route PDF files to <span className="text-slate-900 font-medium">procurement@meridianhealth.org</span>.
                        </li>
                        <li>
                          Payment terms are <span className="font-bold text-slate-900">{selectedPO.paymentTerms || 'Net 30 days'}</span> from date of valid invoice approval and delivery acceptance.
                        </li>
                      </ol>
                    </div>

                    <div className="sm:col-span-5 border border-slate-200 rounded-xl p-4 bg-white text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-mono font-semibold text-slate-800">
                          ${(selectedPO.subtotal || selectedPO.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Tax / Regulatory Fees (0.00%)</span>
                        <span className="font-mono text-slate-600">
                          ${(selectedPO.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Freight & Handling</span>
                        <span className="font-mono text-slate-600">$0.00</span>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900">
                          <span className="font-black text-xs uppercase tracking-tight">Total Amount (USD)</span>
                          <span className="font-mono font-black text-base text-slate-950">
                            ${selectedPO.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signatures Section */}
                  <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        AUTHORIZED BUYER SIGNATURE • SARAH CHEN (LEAD PROCUREMENT)
                      </div>
                      <div className="h-10 flex items-center border-b-2 border-dashed border-slate-300 pb-1 font-serif italic text-base text-indigo-950">
                        Sarah Chen (Digital Signature Verified)
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Cryptographically verified via Verisource Network • Released Oct 28, 2026</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        VENDOR ACKNOWLEDGEMENT • AUTHORIZED REPRESENTATIVE
                      </div>
                      {selectedPO.acknowledgedAt ? (
                        <div>
                          <div className="h-10 flex items-center border-b-2 border-dashed border-slate-300 pb-1 font-serif italic text-base text-slate-900">
                            {selectedPO.acknowledgedBy || 'Elena Rostova (Authorized Signatory)'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Acknowledged on {formatDateMMDDYYYY(selectedPO.acknowledgedAt)} • Fully Accepted</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <button
                            onClick={() => handleAcknowledge(selectedPO.id)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Click to Digitally Acknowledge PO</span>
                          </button>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Awaiting vendor counter-signature and delivery timeline confirmation.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Running PDF Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{isMeridianPDF ? 'Meridian Health Network' : getBuyerDisplayName(selectedPO.buyerOrgId)} • Purchase Order {selectedPO.poNumber}</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: PURCHASE ORDERS LIST VIEW (Minimal Unified Header, 4-KPI Strip, Clean Table)
  // =========================================================================
  return (
    <div className="space-y-4 pb-16">
      {/* Top Banner (Minimal, Balanced, Clean) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Title, Badge & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <ShoppingCart className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">Purchase Orders</h1>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Manage purchase orders, confirm delivery, and generate invoices.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["PO Number,Buyer,Date,Due Date,Total,Status", ...orders.map(o => `${o.poNumber},"${getBuyerDisplayName(o.buyerOrgId)}",${o.orderDate},${o.promisedDate},${o.totalAmount},${o.status}`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `Verisource_Purchase_Orders_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Export filtered purchase orders to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (selectedPO) {
                setShowAsnModal(true);
              } else if (orders.length > 0) {
                setSelectedPO(orders[0]);
                setShowAsnModal(true);
              } else {
                navigate('/asns');
              }
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Create Advance Shipping Notice (ASN) for active order fulfillment"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create ASN</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl shadow-xs flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Minimal 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* KPI 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Pipeline</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            ${totalPipelineVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-emerald-700 font-medium truncate transition">
              {buyerFilter === 'ALL'
                ? `${orders.length} active orders`
                : `${scopedOrders.length} orders (${getBuyerDisplayName(buyerFilter)})`}
            </span>
            <Sparkline data={[240000, 275000, 310000, 340000, 365000, totalPipelineVal || 385000]} color="#10b981" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Action Required</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {needsActionCount} <span className="text-xs font-normal text-slate-500 font-sans">Pending</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium truncate transition">
              {needsActionCount > 0 ? 'Awaiting signature' : 'All counter-signed'}
            </span>
            <Sparkline data={[4, 3, 3, 2, 1, Math.max(1, needsActionCount)]} color="#d97706" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In Fulfillment</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {inFulfillmentCount} <span className="text-xs font-normal text-slate-500 font-sans">In Transit</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-teal-700 font-medium truncate transition">
              Active ASNs scheduled
            </span>
            <Sparkline data={[1, 2, 2, 3, 2, Math.max(1, inFulfillmentCount)]} color="#0d9488" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed &amp; Billed</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {completedCount} <span className="text-xs font-normal text-slate-500 font-sans">Fulfilled</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-sky-700 font-medium truncate transition">
              100% matched &amp; cleared
            </span>
            <Sparkline data={[12, 15, 18, 22, 27, Math.max(28, completedCount)]} color="#0284c7" width={68} height={20} />
          </div>
        </div>
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
              placeholder="Search POs, buyers, items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/70"
            />
          </div>

          {/* Client Filter Dropdown with Actionable Live Counts */}
          <FilterSelect
            value={buyerFilter}
            onChange={(e) => setBuyerFilter(e.target.value)}
            title="Filter by enterprise client"
          >
            <option value="ALL">All Clients ({orders.length} POs)</option>
            <option value="buyer-org-1">Apex Global ({apexPendingAck} pending ACK)</option>
            <option value="buyer-org-3">Meridian Health ({meridianActionReq} action req)</option>
            <option value="buyer-org-2">NovaTech Aerospace ({novaTechInTransit} in transit)</option>
          </FilterSelect>

          {/* Status Filter Dropdown */}
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft (Unsaved)</option>
            <option value="NEEDS_ACTION">Needs Action (New Order)</option>
            <option value="ACKNOWLEDGED">Acknowledged (ACK)</option>
            <option value="IN_FULFILLMENT">In Fulfillment</option>
            <option value="SHIPPED">Shipped (ASN)</option>
            <option value="COMPLETED">Completed</option>
          </FilterSelect>

          {(buyerFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setBuyerFilter('ALL');
                setStatusFilter('ALL');
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
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
          <FilterSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            title="Sort orders"
          >
            <option value="DATE_DESC">Date (Newest)</option>
            <option value="DATE_ASC">Date (Oldest)</option>
            <option value="AMOUNT_DESC">Total (High to Low)</option>
            <option value="AMOUNT_ASC">Total (Low to High)</option>
          </FilterSelect>
        </div>
      </div>

      {/* Informative Buyer Workspace / Onboarding Activation Banner */}
      {buyerFilter === 'buyer-org-3' && (
        <div className="bg-sky-50 border border-sky-200/90 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-900 shadow-2xs animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>Meridian Health Network Relationship Workspace</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Stage 3 Review • 9 of 9 Complete
                </span>
              </div>
              <p className="text-[11px] text-sky-700 mt-0.5">
                Clinical compliance review in progress. Touchless electronic invoicing will activate once your ERP Vendor ID is provisioned.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shrink-0 self-end sm:self-auto cursor-pointer shadow-xs"
          >
            <span>View Onboarding Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Orders Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-600" />
            Loading purchase orders from Verisource P2P Network...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div>No purchase orders matched your search or filter criteria.</div>
            {(buyerFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery.trim() !== '') && (
              <button
                onClick={() => {
                  setBuyerFilter('ALL');
                  setStatusFilter('ALL');
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
            <table className="w-full text-left text-xs min-w-[1080px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-40 whitespace-nowrap">PO NUMBER</th>
                  <th className="py-3 px-4 w-48">BUYER / CLIENT</th>
                  <th className="py-3 px-3 w-28 whitespace-nowrap">ORDER DATE</th>
                  <th className="py-3 px-3 w-28 whitespace-nowrap">PROMISED DUE</th>
                  <th className="py-3 px-4 min-w-[180px]">LINE ITEMS</th>
                  <th className="py-3 px-3 w-28 whitespace-nowrap">PAYMENT TERMS</th>
                  <th className="py-3 px-4 text-right w-32 whitespace-nowrap">TOTAL AMOUNT</th>
                  <th className="py-3 px-4 text-center w-36 whitespace-nowrap">STATUS</th>
                  <th className="py-3 px-4 text-right w-40 whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredOrders.map(po => {
                  const isMeridian = po.poNumber === 'PO-2026-101';
                  const buyerName = getBuyerDisplayName(po.buyerOrgId);
                  const initials = getBuyerBadgeInitials(po.buyerOrgId);
                  const itemCount = po.lineItems?.length || 1;

                  return (
                    <tr
                      key={po.id}
                      onClick={() => {
                        setSelectedPO(po);
                        navigate('/orders', { poNumber: po.poNumber });
                      }}
                      className="hover:bg-slate-50/90 cursor-pointer transition group"
                    >
                      {/* PO Number - Fixed with whitespace-nowrap to prevent line breaks */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition flex items-center gap-1.5 font-mono">
                          <ShoppingCart className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                          <span>{po.poNumber}</span>
                        </div>
                        {isMeridian && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 inline-block border border-emerald-200/60">
                            PDF Sample Match
                          </span>
                        )}
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBuyerFilter(po.buyerOrgId);
                              }}
                              className="font-semibold text-slate-800 hover:text-slate-950 hover:underline truncate max-w-[150px] text-left block cursor-pointer transition"
                              title={`Filter orders to ${buyerName}`}
                            >
                              {buyerName}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPO(po);
                                setShowCollabDrawer(true);
                                navigate('/orders', { poNumber: po.poNumber, openCollab: true, openMessages: true, timestamp: Date.now() });
                              }}
                              className="text-[10px] text-slate-400 hover:text-emerald-600 truncate max-w-[150px] text-left block cursor-pointer transition flex items-center gap-1"
                              title={`Chat with ${po.buyerContactName || 'Buyer'}`}
                            >
                              <span className="truncate">{po.buyerContactName?.split('(')[0] || 'Procurement Lead'}</span>
                              <MessageSquare className="w-2.5 h-2.5 text-slate-400 hover:text-emerald-500 inline shrink-0" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Order Date */}
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-medium">
                        {isMeridian ? 'Oct 28, 2026' : formatDateMMDDYYYY(po.orderDate)}
                      </td>

                      {/* Promised Due */}
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-medium">
                        {isMeridian ? 'Nov 12, 2026' : formatDateMMDDYYYY(po.promisedDate)}
                      </td>

                      {/* Line Items Summary */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium truncate max-w-[200px]">
                          {po.lineItems?.[0]?.description || 'Custom Deliverable'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'} • {po.currency || 'USD'}
                        </div>
                      </td>

                      {/* Terms */}
                      <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {po.paymentTerms || 'Net 30'}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status - Actionable Micro-Action Button for Needs Acknowledgment */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        {po.status === 'ISSUED' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcknowledge(po.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs hover:shadow-xs transition cursor-pointer active:scale-[0.98] group/ack"
                            title="Click to directly acknowledge PO and commit promised delivery date"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse group-hover/ack:bg-amber-600"></span>
                            <span>Review & Acknowledge</span>
                            <ArrowRight className="w-3 h-3 text-amber-600 group-hover/ack:translate-x-0.5 transition-transform" />
                          </button>
                        ) : (
                          getStatusBadge(po.status, po.poNumber)
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPO(po);
                              setShowCollabDrawer(true);
                              navigate('/orders', { poNumber: po.poNumber, openCollab: true, openMessages: true, timestamp: Date.now() });
                            }}
                            className="relative p-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Messages & Collaboration"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            {(commentsMap[po.poNumber] || []).length > 0 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPO(po);
                              navigate('/orders', { poNumber: po.poNumber });
                            }}
                            className="w-24 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs inline-flex items-center justify-center"
                          >
                            View PO
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

      {/* Modal: Create Purchase Order Confirmation (ONLY PO Number & Buyer Name) */}
      {showCreatePoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Create Purchase Order</h3>
                  <p className="text-[11px] text-slate-500">Initialize a new PO in bilateral enterprise ledger</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreatePoModal(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PO Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPoNumber}
                  onChange={e => setNewPoNumber(e.target.value)}
                  required
                  placeholder="e.g. PO-2026-9580"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Buyer / Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={newBuyerOrgId}
                  onChange={e => setNewBuyerOrgId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer shadow-2xs"
                >
                  <option value="buyer-org-1">Apex Global Enterprises</option>
                  <option value="buyer-org-2">NovaTech Aerospace & Defense</option>
                  <option value="buyer-org-3">Meridian Health Network</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreatePoModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Purchase Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
