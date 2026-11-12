import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { AdvanceShippingNotice, TransactionComment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { formatDateMMDDYYYY } from '../../utils/dateUtils.js';
import { downloadAsnPdf } from '../../utils/documentPdfGenerator.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { FilterSelect } from '../../components/common/FilterSelect.js';
import { Sparkline } from '../../components/dashboard/Sparkline.js';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft, 
  Printer, 
  Search, 
  Download, 
  Package, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Receipt, 
  X, 
  Plus, 
  QrCode, 
  Lock, 
  Layers, 
  MapPin, 
  Edit3, 
  Save, 
  Check, 
  Info,
  CheckCheck,
  Trash2,
  Eye,
  Calculator,
  Paperclip,
  Upload,
  ChevronUp,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';

export interface RichAsnItem {
  itemNumber: number;
  itemName?: string;
  poLine: string;
  partNumber: string;
  description: string;
  serialNumber?: string;
  macAddress?: string;
  qtyOrdered: number;
  qtyShipped: number;
  uom: string;
  unitPrice?: number;
  packageId: string;
  comments?: string;
  attachments?: string[];
}

export interface RichAsn {
  id: string;
  asnNumber: string;
  asnName?: string;
  asnUid?: string;
  poId: string;
  poNumber: string;
  poName?: string;
  buyerOrgId: string;
  companyName?: string;
  supplierOrgId: string;
  supplierName: string;
  supplierContactName?: string;
  supplierContactEmail?: string;
  supplierContactPhone?: string;
  supplierAddress?: string;
  supplierPan?: string;
  supplierGst?: string;
  shipmentDate: string;
  estimatedDeliveryDate: string;
  status: 'DRAFT' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DOCK_ACCEPTED';
  totalPackages: string;
  grossWeight: string;
  shipFrom: {
    depotName: string;
    address: string;
    dispatchLead: string;
    phone: string;
    ediId: string;
  };
  shipTo: {
    facilityName: string;
    address: string;
    attn: string;
    buyerContact: string;
  };
  carrier: {
    name: string;
    trackingProNumber: string;
    bolNumber: string;
    shippingMethod: string;
    sealNumber: string;
  };
  shippedItems: RichAsnItem[];
  receivingInstructions: string;
  driverSignature: string;
  dockSpecialistSignature: string;
  createdAt: string;
  attachments?: string[];
}

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

const CARRIER_PRESETS = [
  'FedEx Freight Priority',
  'Old Dominion Freight Line',
  'R+L Carriers',
  'XPO Logistics',
  'Estes Express Lines',
  'UPS Freight / TForce'
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

const RICH_DEFAULT_ASNS: RichAsn[] = [
  {
    id: 'asn-8801',
    asnNumber: 'ASN-2026-8801',
    poId: 'po-106',
    poNumber: 'PO-2026-9450',
    buyerOrgId: 'buyer-org-1',
    companyName: 'Apex Global Enterprises',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    shipmentDate: '2026-11-04T09:00:00Z',
    estimatedDeliveryDate: '2026-11-25T14:00:00Z',
    status: 'IN_TRANSIT',
    totalPackages: '2 Pallets / 4 Crates',
    grossWeight: '420 lbs (190 kg)',
    shipFrom: {
      depotName: 'CloudBridge High-Throughput Depot',
      address: '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
      dispatchLead: 'Elena Rostova',
      phone: '+1 (555) 382-9102',
      ediId: '856-CB-90219'
    },
    shipTo: {
      facilityName: 'Apex Global Logistics Center - Receiving Bay 14',
      address: '1020 Logistics Blvd, Austin, TX 78728',
      attn: 'Bay 14 Receiving Supervisor',
      buyerContact: 'Marcus Drake'
    },
    carrier: {
      name: 'FedEx Freight Priority',
      trackingProNumber: 'FX-90218820',
      bolNumber: 'BOL-2026-9450-8801',
      shippingMethod: 'Dedicated Air-Ride LTL',
      sealNumber: 'SEC-APEX-88192'
    },
    shippedItems: [
      {
        itemNumber: 1,
        poLine: 'Line 1',
        partNumber: 'ACM-NODE-64GB',
        description: 'Enterprise Compute Node 64GB DDR5 / 32-Core Xeon Scalable Processor',
        serialNumber: 'SRV-B14-NODE-01 to 08',
        macAddress: '00:1A:2B:64:99:A1',
        qtyOrdered: 8,
        qtyShipped: 8,
        uom: 'EA',
        unitPrice: 8200,
        packageId: 'PLT-01 (Crates 1-4)'
      }
    ],
    receivingInstructions: 'Inbound receiving dock appointment scheduled for Nov 25 09:00 CST. Verify seal SEC-APEX-88192 prior to unloading. Contact Marcus Drake at Bay 14 intake desk.',
    driverSignature: 'FedEx Freight Priority Operator Verified (Nov 04, 2026)',
    dockSpecialistSignature: 'Marcus Drake (Bay 14 Receiving Supervisor - Scheduled)',
    createdAt: '2026-11-04T09:00:00Z'
  },
  {
    id: 'asn-088',
    asnNumber: 'ASN-2026-088',
    poId: 'po-101-meridian',
    poNumber: 'PO-2026-101',
    buyerOrgId: 'buyer-org-3',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    shipmentDate: '2026-10-30T09:00:00Z',
    estimatedDeliveryDate: '2026-11-03T16:00:00Z',
    status: 'OUT_FOR_DELIVERY',
    totalPackages: '2 Pallets / 4 Crates',
    grossWeight: '348 lbs (158 kg)',
    shipFrom: {
      depotName: 'CloudBridge Logistics Depot West',
      address: '100 Innovation Parkway, Dock 12\nSan Jose, CA 95134',
      dispatchLead: 'Marcus Vance',
      phone: '408-555-0199',
      ediId: '856-CB-90219'
    },
    shipTo: {
      facilityName: 'Meridian Health Network — Data Center',
      address: '7800 Technology Boulevard, Dock B\nNaperville, IL 60563',
      attn: 'IT Infrastructure Operations (Bay 14)',
      buyerContact: 'Sarah Chen (Lead Procurement)'
    },
    carrier: {
      name: 'FedEx Freight Priority',
      trackingProNumber: 'FXF-8849-2016-US',
      bolNumber: 'BOL-2026-101-088',
      shippingMethod: 'Dedicated Air-Ride LTL',
      sealNumber: 'SEC-MER-99410'
    },
    shippedItems: [
      {
        itemNumber: 1,
        poLine: 'Line 1',
        partNumber: 'INFRA-SRV-2026-B14',
        description: 'Enterprise Cloud Server Deployment Hardware (Bay 14 Rack Unit)',
        serialNumber: 'SRV-B14-9921-A',
        macAddress: '00:1A:2B:3C:4D:5E',
        qtyOrdered: 1,
        qtyShipped: 1,
        uom: 'EA',
        packageId: 'PLT-01 (Crate A)'
      },
      {
        itemNumber: 2,
        poLine: 'Line 2',
        partNumber: 'SEC-SOC2-CONFIG',
        description: 'HIPAA/SOC2 Dedicated Gateway & Firewall Appliance (Cluster Unit 1 of 2)',
        serialNumber: 'FWAL-SOC2-401',
        macAddress: '00:1A:2B:88:99:11',
        qtyOrdered: 2,
        qtyShipped: 1,
        uom: 'SET',
        packageId: 'PLT-02 (Crate B)'
      }
    ],
    receivingInstructions: 'Inspect outer anti-tamper security seal SEC-MER-99410 prior to opening cargo bay doors. Verify serial numbers against the packing slip inside Crate A. Scan barcodes into Verisource Receiving Module to trigger automated goods receipt (GRN) and 3-way invoice matching for INV-2026-201.',
    driverSignature: 'Carrier Driver Signature & Date • FedEx Freight Priority (Verified Oct 30, 2026)',
    dockSpecialistSignature: 'Dock Receiving Specialist Signature & Badge # • Meridian Health Network (Pending Intake)',
    createdAt: '2026-10-30T09:00:00Z'
  },
  {
    id: 'asn-99144',
    asnNumber: 'ASN-US-99144',
    poId: 'po-107',
    poNumber: 'PO-2026-9520',
    buyerOrgId: 'buyer-org-2',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    shipmentDate: '2026-10-29T14:15:00Z',
    estimatedDeliveryDate: '2026-11-12T16:00:00Z',
    status: 'IN_TRANSIT',
    totalPackages: '2 Pallets / 2 Crates',
    grossWeight: '210 lbs (95 kg)',
    shipFrom: {
      depotName: 'CloudBridge Aerospace Depot South',
      address: '100 Innovation Parkway, Dock 4\nSan Jose, CA 95134',
      dispatchLead: 'Jason Miller',
      phone: '512-555-0199',
      ediId: '856-CB-90144'
    },
    shipTo: {
      facilityName: 'NovaTech Flight Systems Facility B',
      address: '4800 Aerospace Parkway, Receiving Dock 3\nHuntsville, AL 35806',
      attn: 'Secure Avionics Intake',
      buyerContact: 'David Miller (Senior Subcontract Specialist)'
    },
    carrier: {
      name: 'FedEx Freight Priority',
      trackingProNumber: 'FXF-7712-4019-US',
      bolNumber: 'BOL-2026-9520-001',
      shippingMethod: 'Secure Air-Ride Dedicated',
      sealNumber: 'SEC-NOVA-8812'
    },
    shippedItems: [
      {
        itemNumber: 1,
        poLine: 'Line 1',
        partNumber: 'ACM-RAD-900',
        description: 'Radiation-Hardened Edge Telemetry Array (-40C to +125C Operating Envelope)',
        serialNumber: 'RAD-900-8812-A',
        macAddress: '00:1A:2B:99:88:77',
        qtyOrdered: 6,
        qtyShipped: 6,
        uom: 'EA',
        packageId: 'PLT-01 (Crate 1)'
      }
    ],
    receivingInstructions: 'ITAR Certified chain of custody manifest. Verify cryogenic seal integrity prior to intake.',
    driverSignature: 'FedEx Dedicated Driver (Verified Oct 29, 2026)',
    dockSpecialistSignature: 'NovaTech Secure Intake (Badge # NT-4019)',
    createdAt: '2026-10-29T14:15:00Z'
  },
  {
    id: 'asn-99120',
    asnNumber: 'ASN-US-99120',
    poId: 'po-102',
    poNumber: 'PO-2026-9042',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    shipmentDate: '2026-10-22T08:30:00Z',
    estimatedDeliveryDate: '2026-10-28T16:00:00Z',
    status: 'DOCK_ACCEPTED',
    totalPackages: '4 Pallets',
    grossWeight: '520 lbs (236 kg)',
    shipFrom: {
      depotName: 'CloudBridge Distribution West',
      address: '100 Innovation Parkway, Dock 2\nSan Jose, CA 95134',
      dispatchLead: 'Elena Rostova',
      phone: '312-555-0199',
      ediId: '856-CB-88102'
    },
    shipTo: {
      facilityName: 'Apex Distribution Hub',
      address: '800 Logistics Way, Bay 14\nJoliet, IL 60431',
      attn: 'Logistics Reception',
      buyerContact: 'Marcus Vance'
    },
    carrier: {
      name: 'FedEx Freight Priority',
      trackingProNumber: '7948-2910-4821',
      bolNumber: 'BOL-2026-9042-01',
      shippingMethod: 'Refrigerated Dedicated Route',
      sealNumber: 'SEC-APEX-9921'
    },
    shippedItems: [
      {
        itemNumber: 1,
        poLine: 'Line 1',
        partNumber: 'VAN-REEF-02',
        description: 'Refrigerated Dedicated Freight Route (Chicago -> Detroit)',
        qtyOrdered: 4,
        qtyShipped: 4,
        uom: 'RUN',
        packageId: 'PLT-01 to PLT-04'
      }
    ],
    receivingInstructions: 'Cold-chain telemetry logs verified. Dock temperature maintained at -20C.',
    driverSignature: 'Dedicated Freight Operator (Verified Oct 22, 2026)',
    dockSpecialistSignature: 'Apex Logistics Bay 14 Verified & Logged',
    createdAt: '2026-10-22T08:30:00Z'
  }
];

const DEFAULT_ASN_COMMENTS: Record<string, TransactionComment[]> = {
  'ASN-2026-8801': [
    {
      id: 'comm-asn-8801-1',
      entityType: 'ASN',
      entityId: 'asn-8801',
      authorId: 'usr-buyer-marcus-drake',
      authorName: 'Marcus Drake (Bay 14 Receiving Supervisor)',
      authorRole: 'BUYER',
      text: 'FedEx Freight PRO #FX-90218820 checked in system. Inbound receiving dock appointment scheduled for Nov 25 09:00 CST. Gate PIN registered for intake.',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    }
  ],
  'ASN-2026-088': [
    {
      id: 'comm-asn-088-1',
      entityType: 'ASN',
      entityId: 'asn-088',
      authorId: 'usr-buyer-dock',
      authorName: 'Dock Specialist (Naperville Medical Center)',
      authorRole: 'BUYER',
      text: 'Driver manifest verified and electronic seal inspected. Pallet 1 and Pallet 2 transferred to cold staging.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ]
};

export const SupplierAsns: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate, routeState, selectedBuyerId, setSelectedBuyerId } = usePortal();

  // Data state
  const [asns, setAsns] = useState<RichAsn[]>(RICH_DEFAULT_ASNS);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // View state: 'LIST' or 'DETAIL'
  const [selectedAsn, setSelectedAsn] = useState<RichAsn | null>(null);

  // Collaboration Drawer
  const [showCollabDrawer, setShowCollabDrawer] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, TransactionComment[]>>(DEFAULT_ASN_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [aiDrafting, setAiDrafting] = useState(false);

  // PDF Preview Modal
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Inline Global & Line Edit States
  const [isEditingGlobal, setIsEditingGlobal] = useState<boolean>(false);
  const [showAllHeaderFields, setShowAllHeaderFields] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    header?: Record<string, string>;
    lines?: Record<number, Record<string, string>>;
  }>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const [editAsnHeader, setEditAsnHeader] = useState({
    asnNumber: '',
    shipmentName: '',
    companyName: '',
    asnUid: '',
    poNumber: '',
    poName: '',
    shipmentDate: '',
    estimatedDeliveryDate: '',
    supplierName: '',
    supplierContactName: '',
    supplierContactEmail: '',
    supplierContactPhone: '',
    carrierName: '',
    trackingProNumber: '',
    bolNumber: '',
    sealNumber: '',
    shipFromAddress: '',
    shipToAddress: '',
    supplierPan: '',
    supplierGst: '',
    handlingInstructions: '',
    totalPackages: '',
    grossWeight: '',
    attachments: [] as string[]
  });
  const [editedShippedItems, setEditedShippedItems] = useState<RichAsnItem[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [buyerFilter, setBuyerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC'>('DATE_DESC');

  // Create / Dispatch ASN Modal State (ONLY ASN Number & Buyer)
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [newAsnNum, setNewAsnNum] = useState(`ASN-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newBuyerOrgId, setNewBuyerOrgId] = useState('buyer-org-1');

  useEffect(() => {
    loadAsns();
  }, [currentUser]);

  useEffect(() => {
    if (selectedAsn) {
      const isDraftNew = (selectedAsn as any).isDraftNew;
      const isMeridian = selectedAsn.poNumber === 'PO-2026-101';
      const compName = selectedAsn.companyName || getBuyerDisplayName(selectedAsn.buyerOrgId);
      const suppPreset = SUPPLIER_PRESETS.find(s => s.name === selectedAsn.supplierName) || SUPPLIER_PRESETS[0];

      if (isDraftNew) {
        setEditAsnHeader({
          asnNumber: selectedAsn.asnNumber,
          shipmentName: selectedAsn.asnName || '',
          companyName: compName,
          asnUid: selectedAsn.asnUid || `UID-ASN-2026-${selectedAsn.asnNumber.replace(/[^0-9]/g, '') || Math.floor(10000 + Math.random() * 90000)}`,
          poNumber: selectedAsn.poNumber || '',
          poName: selectedAsn.poName || '',
          shipmentDate: selectedAsn.shipmentDate ? selectedAsn.shipmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
          estimatedDeliveryDate: selectedAsn.estimatedDeliveryDate ? selectedAsn.estimatedDeliveryDate.split('T')[0] : '',
          supplierName: selectedAsn.supplierName || 'CloudBridge Solutions LLC',
          supplierContactName: selectedAsn.supplierContactName || '',
          supplierContactEmail: selectedAsn.supplierContactEmail || '',
          supplierContactPhone: selectedAsn.supplierContactPhone || '',
          carrierName: selectedAsn.carrier?.name || '',
          trackingProNumber: selectedAsn.carrier?.trackingProNumber || '',
          bolNumber: selectedAsn.carrier?.bolNumber || '',
          sealNumber: selectedAsn.carrier?.sealNumber || '',
          shipFromAddress: selectedAsn.shipFrom?.address || '',
          shipToAddress: selectedAsn.shipTo?.address || '',
          supplierPan: selectedAsn.supplierPan || '',
          supplierGst: selectedAsn.supplierGst || '',
          handlingInstructions: selectedAsn.receivingInstructions || '',
          totalPackages: selectedAsn.totalPackages || '',
          grossWeight: selectedAsn.grossWeight || '',
          attachments: selectedAsn.attachments && selectedAsn.attachments.length > 0 ? selectedAsn.attachments : []
        });

        const lines: RichAsnItem[] = (selectedAsn.shippedItems && selectedAsn.shippedItems.length > 0)
          ? selectedAsn.shippedItems
          : [
              {
                itemNumber: 1,
                poLine: 'Line 01',
                partNumber: '',
                itemName: '',
                description: '',
                serialNumber: '',
                macAddress: '',
                qtyOrdered: '' as any,
                qtyShipped: '' as any,
                uom: 'EA',
                unitPrice: '' as any,
                packageId: '',
                comments: '',
                attachments: []
              }
            ];

        setEditedShippedItems(lines);
        setIsEditingGlobal(true);
        setShowAllHeaderFields(true);
        setValidationErrors({});
        setActionError(null);
      } else {
        setEditAsnHeader({
          asnNumber: selectedAsn.asnNumber,
          shipmentName: selectedAsn.asnName || (isMeridian ? 'Bay 14 Enterprise Infrastructure Telemetry Deployment' : 'Project Apollo Compute Node Hardware Intake'),
          companyName: compName,
          asnUid: selectedAsn.asnUid || `UID-ASN-2026-${selectedAsn.asnNumber.replace(/[^0-9]/g, '') || '90412'}`,
          poNumber: selectedAsn.poNumber,
          poName: selectedAsn.poName || (isMeridian ? 'Enterprise Cloud Server Deployment & Bay 14 Infrastructure' : 'Enterprise Compute Node Deployment & Bay 14 Server Rack Expansion'),
          shipmentDate: selectedAsn.shipmentDate ? selectedAsn.shipmentDate.split('T')[0] : '2026-10-30',
          estimatedDeliveryDate: selectedAsn.estimatedDeliveryDate ? selectedAsn.estimatedDeliveryDate.split('T')[0] : '2026-11-03',
          supplierName: selectedAsn.supplierName || suppPreset.name,
          supplierContactName: selectedAsn.supplierContactName || suppPreset.contacts[0].name,
          supplierContactEmail: selectedAsn.supplierContactEmail || suppPreset.contacts[0].email,
          supplierContactPhone: selectedAsn.supplierContactPhone || suppPreset.contacts[0].phone,
          carrierName: selectedAsn.carrier?.name || 'FedEx Freight Priority',
          trackingProNumber: selectedAsn.carrier?.trackingProNumber || 'FXF-8849-2016-US',
          bolNumber: selectedAsn.carrier?.bolNumber || 'BOL-2026-101-088',
          sealNumber: selectedAsn.carrier?.sealNumber || 'SEC-MER-99410',
          shipFromAddress: selectedAsn.shipFrom?.address || suppPreset.address,
          shipToAddress: selectedAsn.shipTo?.address || DELIVERY_ADDRESS_PRESETS[0],
          supplierPan: selectedAsn.supplierPan || suppPreset.pan,
          supplierGst: selectedAsn.supplierGst || suppPreset.gst,
          handlingInstructions: selectedAsn.receivingInstructions || 'Air-ride trailer required. Keep dry. Sensitive electronics. Gate clearance SEC-MER-99410.',
          totalPackages: selectedAsn.totalPackages || '2 Pallets / 4 Crates',
          grossWeight: selectedAsn.grossWeight || '348 lbs (158 kg)',
          attachments: selectedAsn.attachments && selectedAsn.attachments.length > 0
            ? selectedAsn.attachments
            : ['BOL-Manifest-Signed.pdf', 'Packing-Slip-Verified.pdf']
        });

        const lines: RichAsnItem[] = (selectedAsn.shippedItems && selectedAsn.shippedItems.length > 0)
          ? selectedAsn.shippedItems.map((item, idx) => ({
              ...item,
              itemName: item.itemName || (item.partNumber ? `${item.partNumber} Component` : (LINE_ITEM_CATALOG_PRESETS[idx % LINE_ITEM_CATALOG_PRESETS.length]?.name || 'Enterprise Hardware Component')),
              description: item.description || 'Hardware Deliverable Component Spec',
              partNumber: item.partNumber || `ACM-ITEM-${idx + 1}`,
              poLine: item.poLine || `Line ${String(idx + 1).padStart(2, '0')}`,
              qtyShipped: item.qtyShipped ?? 1,
              qtyOrdered: item.qtyOrdered ?? item.qtyShipped ?? 1,
              uom: item.uom || 'EA',
              unitPrice: item.unitPrice || (idx === 0 ? 18500 : 11500),
              packageId: item.packageId || `PLT-0${idx + 1} (Crate ${String.fromCharCode(65 + idx)})`,
              serialNumber: item.serialNumber || `SRV-B14-${9920 + idx}-A`,
              comments: item.comments || 'Verified against electronic manifest & packing slip.',
              attachments: item.attachments || ['Item-Quality-Cert.pdf']
            }))
          : [];

        setEditedShippedItems(lines);
        setIsEditingGlobal(false);
        setShowAllHeaderFields(false);
        setValidationErrors({});
        setActionError(null);
      }
    }
  }, [selectedAsn]);

  // Handle actions dispatched by Ava Copilot to mutate page in real time
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'VIEW_ASN' || action.action === 'SELECT_ASN') {
        const asnNum = action.payload.asnNumber || action.payload.id;
        const target = asns.find(a => a.asnNumber === asnNum || a.id === asnNum);
        if (target) {
          setSelectedAsn(target);
          if (action.payload.editMode) setIsEditingGlobal(true);
          setActionSuccess(`Ava opened Advance Shipping Notice ${target.asnNumber}`);
          setTimeout(() => setActionSuccess(null), 3500);
        }
      } else if (action.action === 'CLOSE_ASN_DETAIL') {
        setSelectedAsn(null);
        setIsEditingGlobal(false);
        setActionSuccess('Ava returned to shipments list');
        setTimeout(() => setActionSuccess(null), 3000);
      } else if (action.action === 'DELETE_ASN') {
        const asnNum = action.payload.asnNumber || selectedAsn?.asnNumber;
        if (asnNum) {
          setAsns(prev => prev.filter(a => a.asnNumber !== asnNum));
          if (selectedAsn?.asnNumber === asnNum) {
            setSelectedAsn(null);
          }
          setActionSuccess(`Ava deleted Shipment ${asnNum}`);
          setTimeout(() => setActionSuccess(null), 3500);
        }
      } else if (action.action === 'UPDATE_ASN_FIELD') {
        const { field, value, asnNumber } = action.payload;
        if (asnNumber && (!selectedAsn || selectedAsn.asnNumber !== asnNumber)) {
          setAsns(prev => prev.map(a => a.asnNumber === asnNumber ? ({ ...a, [field]: value }) : a));
        }
        setIsEditingGlobal(true);
        setEditAsnHeader(prev => ({ ...prev, [field]: value }));
        if (selectedAsn) {
          setSelectedAsn(prev => prev ? ({ ...prev, [field]: value }) : null);
        }
        setActionSuccess(`Ava updated shipment ${field} to "${value}"`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else if (action.action === 'SET_PAGE_FILTER') {
        const { searchQuery: sq, buyerFilter: bf, statusFilter: sf } = action.payload;
        if (sq !== undefined) setSearchQuery(sq);
        if (bf !== undefined) setBuyerFilter(bf);
        if (sf !== undefined) setStatusFilter(sf);
        setActionSuccess('Ava updated shipment filters');
        setTimeout(() => setActionSuccess(null), 3000);
      } else if (action.action === 'CREATE_ASN') {
        if (action.payload.asnNumber) setNewAsnNum(action.payload.asnNumber);
        setShowDispatchModal(true);
      } else if (action.action === 'SAVE_ASN' || action.action === 'SAVE_PO') {
        handleSaveGlobalDetails();
      }
    });

    return cleanup;
  }, [selectedAsn, editAsnHeader, asns]);

  // Live Logistics Calculations
  const currentActiveItems = isEditingGlobal ? editedShippedItems : (selectedAsn?.shippedItems || []);
  const liveTotalShippedUnits = currentActiveItems.reduce((acc, item) => acc + (Number(item.qtyShipped) || 0), 0);
  const liveTotalDeclaredValue = currentActiveItems.reduce((acc, item) => {
    const price = item.unitPrice || 12500;
    const qty = Number(item.qtyShipped) || 0;
    return acc + (qty * price);
  }, 0);

  // Broadcast live ASN context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'asns',
      activeMode: selectedAsn ? (isEditingGlobal ? 'EDIT' : 'DETAIL') : 'LIST',
      selectedAsnNumber: selectedAsn?.asnNumber,
      selectedPoNumber: selectedAsn?.poNumber,
      status: selectedAsn?.status,
      header: editAsnHeader,
      carrier: editAsnHeader.carrierName,
      trackingNumber: editAsnHeader.trackingProNumber,
      shippedItems: editedShippedItems,
      totalUnits: liveTotalShippedUnits,
      declaredValue: liveTotalDeclaredValue,
      searchQuery,
      buyerFilter,
      statusFilter,
      asns: asns.map(a => ({
        asnNumber: a.asnNumber,
        poNumber: a.poNumber,
        companyName: a.companyName,
        carrierName: a.carrier?.name,
        trackingProNumber: a.carrier?.trackingProNumber,
        status: a.status,
        shipDate: a.shipmentDate,
        estimatedDeliveryDate: a.estimatedDeliveryDate,
        itemCount: a.shippedItems ? a.shippedItems.length : 0
      }))
    });
  }, [selectedAsn, isEditingGlobal, editAsnHeader, editedShippedItems, liveTotalShippedUnits, liveTotalDeclaredValue, searchQuery, buyerFilter, statusFilter, asns]);

  // Cascading logic handlers
  const handleSupplierChange = (suppName: string) => {
    const found = SUPPLIER_PRESETS.find(s => s.name === suppName);
    if (found) {
      const firstContact = found.contacts[0];
      setEditAsnHeader(prev => ({
        ...prev,
        supplierName: suppName,
        supplierPan: found.pan,
        supplierGst: found.gst,
        shipFromAddress: found.address,
        supplierContactName: firstContact.name,
        supplierContactEmail: firstContact.email,
        supplierContactPhone: firstContact.phone
      }));
    } else {
      setEditAsnHeader(prev => ({ ...prev, supplierName: suppName }));
    }
  };

  const handleContactChange = (contactName: string) => {
    const currentSupp = SUPPLIER_PRESETS.find(s => s.name === editAsnHeader.supplierName);
    const foundContact = currentSupp?.contacts.find(c => c.name === contactName);
    if (foundContact) {
      setEditAsnHeader(prev => ({
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
      setEditAsnHeader(prev => ({ ...prev, supplierContactName: contactName }));
    }
  };

  const handleHeaderFieldChange = (field: string, value: any) => {
    setEditAsnHeader(prev => ({ ...prev, [field]: value }));
    if (validationErrors.header?.[field]) {
      setValidationErrors(prev => {
        const h = { ...(prev.header || {}) };
        delete h[field];
        return { ...prev, header: h };
      });
    }
  };

  // Attachments Management
  const handleGlobalFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newNames = Array.from(files).map(f => f.name);
    setEditAsnHeader(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newNames]
    }));
    setActionSuccess(`${newNames.length} document(s) attached to Shipment.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRemoveGlobalAttachment = (index: number) => {
    setEditAsnHeader(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleLineFileUpload = (lineIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newNames = Array.from(files).map(f => f.name);
    setEditedShippedItems(prev => {
      const updated = [...prev];
      const curAtts = updated[lineIndex]?.attachments || [];
      updated[lineIndex] = {
        ...updated[lineIndex],
        attachments: [...curAtts, ...newNames]
      };
      return updated;
    });
    setActionSuccess(`${newNames.length} file(s) attached to Line #${String(lineIndex + 1).padStart(2, '0')}.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRemoveLineAttachment = (lineIndex: number, attIndex: number) => {
    setEditedShippedItems(prev => {
      const updated = [...prev];
      const curAtts = updated[lineIndex]?.attachments || [];
      updated[lineIndex] = {
        ...updated[lineIndex],
        attachments: curAtts.filter((_, i) => i !== attIndex)
      };
      return updated;
    });
  };

  // Line item handlers
  const handleLineChange = (index: number, field: string, value: any) => {
    setEditedShippedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (validationErrors.lines?.[index]?.[field]) {
      setValidationErrors(prev => {
        const linesCopy = { ...(prev.lines || {}) };
        if (linesCopy[index]) {
          const rowCopy = { ...linesCopy[index] };
          delete rowCopy[field];
          if (Object.keys(rowCopy).length === 0) {
            delete linesCopy[index];
          } else {
            linesCopy[index] = rowCopy;
          }
        }
        return { ...prev, lines: linesCopy };
      });
    }
  };

  const handleItemCatalogSelect = (index: number, val: string) => {
    const found = LINE_ITEM_CATALOG_PRESETS.find(p => p.name === val);
    if (found) {
      setEditedShippedItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          itemName: found.name,
          description: found.description,
          partNumber: found.partNumber,
          unitPrice: found.unitPrice
        };
        return updated;
      });
    } else {
      setEditedShippedItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          itemName: val === 'custom' ? 'Custom Deliverable' : val
        };
        return updated;
      });
    }
  };

  const handleAddItem = () => {
    const newItem: RichAsnItem = {
      itemNumber: editedShippedItems.length + 1,
      poLine: `Line ${String(editedShippedItems.length + 1).padStart(2, '0')}`,
      partNumber: '',
      itemName: '',
      description: '',
      serialNumber: '',
      macAddress: '',
      qtyOrdered: 1,
      qtyShipped: 1,
      uom: 'EA',
      unitPrice: 0,
      packageId: '',
      comments: '',
      attachments: []
    };
    setEditedShippedItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (editedShippedItems.length <= 1) return;
    setEditedShippedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Form Validation
  const validateAsnForm = () => {
    const headerErrors: Record<string, string> = {};
    const lineErrors: Record<number, Record<string, string>> = {};
    const errors: string[] = [];

    if (!editAsnHeader.asnNumber?.trim()) {
      headerErrors.asnNumber = 'ASN Number is required';
      errors.push('ASN Number');
    }
    if (!editAsnHeader.shipmentName?.trim()) {
      headerErrors.shipmentName = 'Shipment Name is required';
      errors.push('Shipment Name');
    }
    if (!editAsnHeader.companyName?.trim()) {
      headerErrors.companyName = 'Company Name is required';
      errors.push('Company Name');
    }
    if (!editAsnHeader.poNumber?.trim()) {
      headerErrors.poNumber = 'PO Number is required';
      errors.push('PO Number');
    }
    if (!editAsnHeader.shipmentDate?.trim()) {
      headerErrors.shipmentDate = 'Shipment Date is required';
      errors.push('Shipment Date');
    }
    if (!editAsnHeader.estimatedDeliveryDate?.trim()) {
      headerErrors.estimatedDeliveryDate = 'Estimated Delivery Date is required';
      errors.push('Estimated Delivery Date');
    }
    if (!editAsnHeader.supplierName?.trim()) {
      headerErrors.supplierName = 'Supplier Name is required';
      errors.push('Supplier Name');
    }
    if (!editAsnHeader.supplierContactName?.trim()) {
      headerErrors.supplierContactName = 'Supplier Contact is required';
      errors.push('Supplier Contact');
    }
    if (!editAsnHeader.supplierContactEmail?.trim()) {
      headerErrors.supplierContactEmail = 'Supplier Email is required';
      errors.push('Supplier Email');
    }
    if (!editAsnHeader.supplierContactPhone?.trim()) {
      headerErrors.supplierContactPhone = 'Supplier Phone is required';
      errors.push('Supplier Phone');
    }
    if (!editAsnHeader.carrierName?.trim()) {
      headerErrors.carrierName = 'Carrier is required';
      errors.push('Carrier');
    }
    if (!editAsnHeader.trackingProNumber?.trim()) {
      headerErrors.trackingProNumber = 'Tracking Number is required';
      errors.push('Tracking Number');
    }
    if (!editAsnHeader.shipFromAddress?.trim()) {
      headerErrors.shipFromAddress = 'Ship-From Address is required';
      errors.push('Ship-From Address');
    }
    if (!editAsnHeader.shipToAddress?.trim()) {
      headerErrors.shipToAddress = 'Ship-To Address is required';
      errors.push('Ship-To Address');
    }
    if (!editAsnHeader.attachments || editAsnHeader.attachments.length === 0) {
      headerErrors.attachments = 'At least 1 document (BOL/Packing Slip) is required';
      errors.push('Attachments');
    }

    editedShippedItems.forEach((line, idx) => {
      const lErr: Record<string, string> = {};
      if (!line.itemName?.trim() && !line.description?.trim()) {
        lErr.itemName = 'Item name is required';
        errors.push(`Line #${idx + 1} Item Name`);
      }
      if (!line.description?.trim()) {
        lErr.description = 'Description is required';
        errors.push(`Line #${idx + 1} Description`);
      }
      if (line.qtyShipped === undefined || line.qtyShipped === null || (line.qtyShipped as any) === '' || Number(line.qtyShipped) <= 0) {
        lErr.qtyShipped = 'Qty shipped must be > 0';
        errors.push(`Line #${idx + 1} Qty Shipped`);
      }
      if (!line.uom?.trim()) {
        lErr.uom = 'UoM is required';
        errors.push(`Line #${idx + 1} UoM`);
      }
      if (Object.keys(lErr).length > 0) {
        lineErrors[idx] = lErr;
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      headerErrors,
      lineErrors
    };
  };

  const handleSaveGlobalDetails = () => {
    if (!selectedAsn) return;
    
    const validation = validateAsnForm();
    if (!validation.valid) {
      setValidationErrors({
        header: validation.headerErrors,
        lines: validation.lineErrors
      });
      if (Object.keys(validation.headerErrors).some(k => ['carrierName', 'trackingProNumber', 'bolNumber', 'sealNumber', 'shipFromAddress', 'shipToAddress', 'supplierPan', 'supplierGst', 'handlingInstructions', 'attachments'].includes(k))) {
        setShowAllHeaderFields(true);
      }
      setActionError(`Cannot Save Advance Shipping Notice: ${validation.errors.length} mandatory field${validation.errors.length > 1 ? 's are' : ' is'} missing. Please complete highlighted fields.`);
      setTimeout(() => setActionError(null), 8000);
      return;
    }

    setValidationErrors({});
    setActionError(null);

    const newStatus = selectedAsn.status === 'DRAFT' ? 'OUT_FOR_DELIVERY' : selectedAsn.status;
    const updated: RichAsn = {
      ...selectedAsn,
      status: newStatus,
      asnName: editAsnHeader.shipmentName,
      asnUid: editAsnHeader.asnUid,
      poName: editAsnHeader.poName,
      supplierName: editAsnHeader.supplierName,
      supplierContactName: editAsnHeader.supplierContactName,
      supplierContactEmail: editAsnHeader.supplierContactEmail,
      supplierContactPhone: editAsnHeader.supplierContactPhone,
      supplierAddress: editAsnHeader.shipFromAddress,
      supplierPan: editAsnHeader.supplierPan,
      supplierGst: editAsnHeader.supplierGst,
      estimatedDeliveryDate: `${editAsnHeader.estimatedDeliveryDate}T16:00:00Z`,
      receivingInstructions: editAsnHeader.handlingInstructions,
      totalPackages: editAsnHeader.totalPackages,
      grossWeight: editAsnHeader.grossWeight,
      attachments: editAsnHeader.attachments,
      shippedItems: editedShippedItems,
      shipFrom: {
        ...selectedAsn.shipFrom,
        address: editAsnHeader.shipFromAddress,
        dispatchLead: editAsnHeader.supplierContactName,
        phone: editAsnHeader.supplierContactPhone
      },
      shipTo: {
        ...selectedAsn.shipTo,
        address: editAsnHeader.shipToAddress
      },
      carrier: {
        ...selectedAsn.carrier,
        name: editAsnHeader.carrierName,
        trackingProNumber: editAsnHeader.trackingProNumber,
        bolNumber: editAsnHeader.bolNumber,
        sealNumber: editAsnHeader.sealNumber
      }
    };

    delete (updated as any).isDraftNew;
    setSelectedAsn(updated);
    setAsns(prev => prev.map(a => a.id === selectedAsn.id ? updated : a));
    setIsEditingGlobal(false);
    setActionSuccess(selectedAsn.status === 'DRAFT'
      ? `Advance Shipping Notice ${selectedAsn.asnNumber} saved and dispatched under EDI 856 protocol!`
      : `Advance Shipping Notice ${selectedAsn.asnNumber} successfully updated and synced with Logistics ERP.`);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  useEffect(() => {
    if (routeState?.buyerOrgId) {
      setBuyerFilter(routeState.buyerOrgId);
    }
    if (routeState?.flippedPo) {
      const po = routeState.flippedPo;
      const targetAsnNum = routeState.asnNumber || `ASN-2026-${po.poNumber.replace(/[^0-9]/g, '') || Math.floor(100 + Math.random() * 900)}`;
      const existing = asns.find(a => a.poNumber === po.poNumber || a.asnNumber === targetAsnNum);
      if (existing) {
        setSelectedAsn(existing);
      } else {
        const buyerPreset = BUYER_COMPANY_PRESETS.find(b => b.id === po.buyerOrgId);
        const compName = po.companyName || buyerPreset?.name || getBuyerDisplayName(po.buyerOrgId);
        const flippedAsn: RichAsn = {
          id: `asn-flipped-${Date.now()}`,
          asnNumber: targetAsnNum,
          asnName: po.poName ? `Shipment: ${po.poName}` : `Shipment for ${po.poNumber}`,
          asnUid: `UID-${targetAsnNum}`,
          poId: po.id,
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
          shipmentDate: new Date().toISOString().split('T')[0],
          estimatedDeliveryDate: po.deliveryDate || po.promisedDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          status: 'OUT_FOR_DELIVERY',
          totalPackages: '2 Pallets / 4 Crates',
          grossWeight: '348 lbs (158 kg)',
          shipFrom: {
            depotName: 'CloudBridge Logistics Hub',
            address: po.supplierAddress || '742 Evergreen Terrace, Tech Park, Austin, TX 78728',
            dispatchLead: po.supplierContactName || 'Elena Rostova',
            phone: po.supplierContactPhone || '+1 (555) 382-9102',
            ediId: '856-CB-90219'
          },
          shipTo: {
            facilityName: compName,
            address: po.shippingAddress || DELIVERY_ADDRESS_PRESETS[0],
            attn: po.buyerContactName || 'Receiving Dock Logistics Lead',
            buyerContact: po.buyerContactName || 'Sarah Chen'
          },
          carrier: {
            name: 'FedEx Freight Priority',
            trackingProNumber: `FXF-${Math.floor(1000 + Math.random() * 9000)}-2026-US`,
            bolNumber: `BOL-${po.poNumber.replace(/[^0-9]/g, '') || '2026'}-088`,
            shippingMethod: 'Dedicated Air-Ride LTL',
            sealNumber: `SEC-MER-${Math.floor(10000 + Math.random() * 89999)}`
          },
          shippedItems: (po.lineItems || []).map((li: any, idx: number) => ({
            itemNumber: idx + 1,
            poLine: `Line ${String(idx + 1).padStart(2, '0')}`,
            partNumber: li.partNumber || `PART-${idx + 1}`,
            itemName: li.itemName || li.description || 'Hardware Deliverable Component Spec',
            description: li.description || li.itemName || '',
            serialNumber: `SRV-B14-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + idx)}`,
            macAddress: '00:1A:2B:3C:4D:5E',
            qtyOrdered: Number(li.quantity) || 1,
            qtyShipped: Number(li.quantity) || 1,
            uom: li.uom || 'EA',
            unitPrice: Number(li.unitPrice) || 0,
            packageId: `PLT-0${idx + 1} (Crate ${String.fromCharCode(65 + idx)})`,
            comments: li.supplierInstructions || li.internalComments || 'Auto-flipped from PO line item.',
            attachments: li.attachments || []
          })),
          receivingInstructions: po.termsAndConditions || 'Inspect security seals prior to unloading cargo bay. Verify serial numbers against electronic manifest.',
          driverSignature: 'FedEx Freight Priority Driver Verified',
          dockSpecialistSignature: 'Pending Dock Intake Verification',
          createdAt: new Date().toISOString(),
          attachments: po.attachments && po.attachments.length > 0 ? po.attachments : ['BOL-Manifest-Signed.pdf', 'Packing-Slip-Verified.pdf']
        };
        setAsns(prev => [flippedAsn, ...prev]);
        setSelectedAsn(flippedAsn);
        setActionSuccess(`Advance Shipping Notice ${targetAsnNum} successfully auto-populated from ${po.poNumber}!`);
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } else if (routeState?.openDispatchModal) {
      if (routeState?.asnNumber) setNewAsnNum(routeState.asnNumber);
      setShowDispatchModal(true);
    } else if (routeState?.asnNumber || routeState?.asnId) {
      const targetNum = routeState.asnNumber;
      const targetId = routeState.asnId;
      const matched = asns.find(a => a.asnNumber === targetNum || a.id === targetId) ||
                      RICH_DEFAULT_ASNS.find(a => a.asnNumber === targetNum || a.id === targetId);
      if (matched) {
        setSelectedAsn(matched);
        if (routeState.openCollab || routeState.openMessages) {
          setShowCollabDrawer(true);
        } else {
          setShowCollabDrawer(false);
        }
      } else if (routeState.openCollab || routeState.openMessages) {
        if (!selectedAsn && asns.length > 0) {
          setSelectedAsn(asns[0]);
        }
        setShowCollabDrawer(true);
      } else {
        setShowCollabDrawer(false);
      }
    } else if (routeState?.poNumber) {
      const matched = asns.find(a => a.poNumber === routeState.poNumber) ||
                      RICH_DEFAULT_ASNS.find(a => a.poNumber === routeState.poNumber);
      if (matched) {
        setSelectedAsn(matched);
        if (routeState.openCollab || routeState.openMessages) {
          setShowCollabDrawer(true);
        } else {
          setShowCollabDrawer(false);
        }
      } else if (routeState.openCollab || routeState.openMessages) {
        if (!selectedAsn && asns.length > 0) {
          setSelectedAsn(asns[0]);
        }
        setShowCollabDrawer(true);
      } else {
        setShowCollabDrawer(false);
      }
    } else if (routeState?.openCollab || routeState?.openMessages) {
      if (!selectedAsn && asns.length > 0) {
        setSelectedAsn(asns[0]);
      }
      setShowCollabDrawer(true);
    } else if (routeState) {
      setShowCollabDrawer(false);
    } else {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const asnParam = params.get('asn') || params.get('id') || params.get('asnNumber');
        const openCollabParam = params.get('collab') === 'true' || params.get('messages') === 'true';
        if (asnParam) {
          const matched = asns.find(a => a.asnNumber === asnParam || a.id === asnParam);
          if (matched) {
            setSelectedAsn(matched);
            if (openCollabParam) setShowCollabDrawer(true);
          }
        }
      }
    }
  }, [routeState, asns]);

  const loadAsns = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getASNs();
      if (res && res.asns && res.asns.length > 0) {
        const merged = [...RICH_DEFAULT_ASNS];
        res.asns.forEach((a: any) => {
          if (!merged.some(m => m.asnNumber === a.asnNumber)) {
            merged.push(a);
          }
        });
        setAsns(merged);
      }
    } catch (err) {
      console.warn('Using enriched demo ASNs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsn = (e: React.FormEvent) => {
    e.preventDefault();
    const asnNum = newAsnNum.trim() || `ASN-2026-${Math.floor(100 + Math.random() * 900)}`;
    const buyerPreset = BUYER_COMPANY_PRESETS.find(b => b.id === newBuyerOrgId);
    const compName = buyerPreset?.name || getBuyerDisplayName(newBuyerOrgId);

    const blankAsn: RichAsn = {
      id: `asn-${Date.now()}`,
      asnNumber: asnNum,
      asnName: '',
      asnUid: `UID-${asnNum}`,
      poId: '',
      poNumber: '',
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
      shipmentDate: new Date().toISOString().split('T')[0],
      estimatedDeliveryDate: '',
      status: 'DRAFT',
      totalPackages: '',
      grossWeight: '',
      shipFrom: {
        depotName: '',
        address: '',
        dispatchLead: '',
        phone: '',
        ediId: ''
      },
      shipTo: {
        facilityName: compName,
        address: '',
        attn: '',
        buyerContact: ''
      },
      carrier: {
        name: '',
        trackingProNumber: '',
        bolNumber: '',
        shippingMethod: 'Dedicated Air-Ride LTL',
        sealNumber: ''
      },
      shippedItems: [
        {
          itemNumber: 1,
          poLine: 'Line 01',
          partNumber: '',
          itemName: '',
          description: '',
          serialNumber: '',
          macAddress: '',
          qtyOrdered: '' as any,
          qtyShipped: '' as any,
          uom: 'EA',
          unitPrice: '' as any,
          packageId: '',
          comments: '',
          attachments: []
        }
      ],
      receivingInstructions: '',
      driverSignature: '',
      dockSpecialistSignature: '',
      createdAt: new Date().toISOString(),
      attachments: []
    };
    (blankAsn as any).isDraftNew = true;

    setAsns(prev => [blankAsn, ...prev]);
    setSelectedAsn(blankAsn);
    navigate('/asns', { asnNumber: blankAsn.asnNumber });
    setShowDispatchModal(false);
    setActionSuccess(`Advance Shipping Notice ${asnNum} initialized. Fill in shipment specifications and deliverables.`);
    setTimeout(() => setActionSuccess(null), 5000);
  };

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

  const getStatusBadge = (status: string, asnNumber?: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Draft (Unsaved)
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Out for Delivery
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-300">
            <Truck className="w-3 h-3 text-teal-600" />
            In Transit (LTL)
          </span>
        );
      case 'DOCK_ACCEPTED':
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Dock Accepted & Verified
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

  const filteredAsns = asns.filter(asn => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = asn.asnNumber.toLowerCase().includes(q);
      const matchPo = asn.poNumber.toLowerCase().includes(q);
      const matchTracking = asn.carrier.trackingProNumber.toLowerCase().includes(q);
      const matchCarrier = asn.carrier.name.toLowerCase().includes(q);
      const matchBuyer = getBuyerDisplayName(asn.buyerOrgId).toLowerCase().includes(q);
      if (!matchNum && !matchPo && !matchTracking && !matchCarrier && !matchBuyer) return false;
    }
    if (buyerFilter !== 'ALL' && asn.buyerOrgId !== buyerFilter) return false;
    if (statusFilter !== 'ALL' && asn.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'DATE_DESC') return new Date(b.shipmentDate).getTime() - new Date(a.shipmentDate).getTime();
    if (sortBy === 'DATE_ASC') return new Date(a.shipmentDate).getTime() - new Date(b.shipmentDate).getTime();
    return 0;
  });

  const scopedAsns = buyerFilter === 'ALL' ? asns : asns.filter(a => a.buyerOrgId === buyerFilter);
  const activeInTransitCount = scopedAsns.filter(a => a.status === 'IN_TRANSIT' || a.status === 'OUT_FOR_DELIVERY').length;
  const dockAcceptedCount = scopedAsns.filter(a => a.status === 'DOCK_ACCEPTED' || a.status === 'DELIVERED').length;
  const totalPackagesCount = scopedAsns.reduce((acc, a) => {
    const parsed = parseInt(a.totalPackages, 10);
    return acc + (isNaN(parsed) ? (a.shippedItems?.length || 4) : parsed);
  }, 0);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsn || !newCommentText.trim()) return;
    const newMsg: TransactionComment = {
      id: `comm-${Date.now()}`,
      entityType: 'ASN',
      entityId: selectedAsn.id,
      authorId: currentUser?.id || 'usr-current',
      authorName: currentUser?.name || 'Elena Rostova (CloudBridge / Acme)',
      authorRole: 'SUPPLIER',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    setCommentsMap(prev => ({
      ...prev,
      [selectedAsn.asnNumber]: [...(prev[selectedAsn.asnNumber] || []), newMsg]
    }));
    setNewCommentText('');
  };

  const handleAiDraftComment = () => {
    if (!selectedAsn) return;
    setAiDrafting(true);
    setTimeout(() => {
      setNewCommentText(`Confirming dock delivery appointment: carrier PRO #${selectedAsn.carrier?.trackingProNumber || 'FX-90218820'} dispatched with electronic seal ${selectedAsn.carrier?.sealNumber || 'SEC-MER-99410'}.`);
      setAiDrafting(false);
    }, 400);
  };

  // =========================================================================
  // VIEW: ASN DETAIL VIEW (Enterprise 3-Tier Interactive Workspace)
  // =========================================================================
  if (selectedAsn) {
    const isMeridianPDF = selectedAsn.asnNumber === 'ASN-2026-088';
    const comments = commentsMap[selectedAsn.asnNumber] || [];
    return (
      <div className="space-y-4 pb-16">
        {/* Top Control Bar / Navigation */}
        <div className="bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
          {/* Left: Return button, Breadcrumb & Status */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setSelectedAsn(null);
                navigate('/asns', {});
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition cursor-pointer shrink-0"
              title="Return to Shipments & ASN directory"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
              <span>Shipments</span>
            </button>
            
            <span className="text-slate-300 select-none">/</span>
            
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md">
              {selectedAsn.asnNumber}
            </span>

            <span className="text-xs font-medium text-slate-500 truncate max-w-[160px] hidden md:inline">
              • {getBuyerDisplayName(selectedAsn.buyerOrgId)}
            </span>

            <div className="shrink-0">
              {getStatusBadge(selectedAsn.status, selectedAsn.asnNumber)}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
            {/* View Linked PO Button */}
            {selectedAsn.poNumber && (
              <button
                onClick={() => navigate('/orders', { poNumber: selectedAsn.poNumber })}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title="View original Purchase Order specification"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedAsn.poNumber.startsWith('PO') ? selectedAsn.poNumber : `PO-${selectedAsn.poNumber}`}</span>
              </button>
            )}

            {/* View Linked Invoice Button */}
            {selectedAsn.poNumber && (
              <button
                onClick={() => navigate('/invoices', { poNumber: selectedAsn.poNumber })}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title="View linked Invoice"
              >
                <Receipt className="w-3.5 h-3.5 text-teal-600" />
                <span>Invoice</span>
              </button>
            )}

            {/* Logistics Collaboration Thread Drawer Toggle */}
            <button
              onClick={() => setShowCollabDrawer(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showCollabDrawer 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
              title="Logistics & Dock Collaboration thread"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
              <span>Messages</span>
              {comments.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showCollabDrawer ? 'bg-sky-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  {comments.length}
                </span>
              )}
            </button>

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
                title="Edit logistics coordinates, freight carrier, or deliverables"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
            )}

            {/* Preview PDF Eye Button */}
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Preview Official Advance Shipping Notice PDF"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={() => downloadAsnPdf(selectedAsn, getBuyerDisplayName(selectedAsn.buyerOrgId))}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Export official Advance Shipping Notice PDF document"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Global Action Success Alert */}
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

        {/* =========================================================================
            ENTERPRISE DETAIL WORKSPACE (3-TIER UNIFIED ARCHITECTURE)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className={`${showCollabDrawer ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-200 space-y-4`}>
          {/* =========================================================================
              TIER 1: SHIPMENT DETAILS (SINGLE UNIFIED ENTERPRISE GRID)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Minimal Header Bar */}
            <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Shipment Details</h2>
                {isEditingGlobal && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Editing
                  </span>
                )}
              </div>
              <div className="shrink-0">
                {getStatusBadge(selectedAsn.status, selectedAsn.asnNumber)}
              </div>
            </div>

            {/* Grid for all Header Fields - Uniform 4-Column Matrix */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. ASN Number */}
                {isEditingGlobal ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ASN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editAsnHeader.asnNumber}
                      onChange={e => handleHeaderFieldChange('asnNumber', e.target.value)}
                      className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                        validationErrors.header?.asnNumber
                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                    {validationErrors.header?.asnNumber && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.asnNumber}</span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ASN Number
                    </label>
                    <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                      {editAsnHeader.asnNumber}
                    </div>
                  </div>
                )}

                {/* 2. Shipment Name / Description */}
                {isEditingGlobal ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Shipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editAsnHeader.shipmentName}
                      onChange={e => handleHeaderFieldChange('shipmentName', e.target.value)}
                      placeholder="Enter shipment title..."
                      className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                        validationErrors.header?.shipmentName
                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                    {validationErrors.header?.shipmentName && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.shipmentName}</span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Shipment Name
                    </label>
                    <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editAsnHeader.shipmentName}>
                      {editAsnHeader.shipmentName}
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
                      value={editAsnHeader.companyName}
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
                      {editAsnHeader.companyName}
                    </div>
                  </div>
                )}

                {/* 4. ASN UID */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ASN UID
                  </label>
                  <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                    {editAsnHeader.asnUid}
                  </div>
                </div>

                {/* 5. PO Number */}
                {isEditingGlobal ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      PO Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editAsnHeader.poNumber}
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
                      {editAsnHeader.poNumber}
                    </div>
                  </div>
                )}

                {/* 6. PO Name */}
                {isEditingGlobal ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      PO Name
                    </label>
                    <input
                      type="text"
                      value={editAsnHeader.poName}
                      onChange={e => handleHeaderFieldChange('poName', e.target.value)}
                      placeholder="PO scope / description..."
                      className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      PO Name
                    </label>
                    <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editAsnHeader.poName}>
                      {editAsnHeader.poName}
                    </div>
                  </div>
                )}

                {/* 7. Shipment Date */}
                {isEditingGlobal ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Shipment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editAsnHeader.shipmentDate}
                      onChange={e => handleHeaderFieldChange('shipmentDate', e.target.value)}
                      className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                        validationErrors.header?.shipmentDate
                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                    {validationErrors.header?.shipmentDate && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.shipmentDate}</span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Shipment Date
                    </label>
                    <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                      {formatDateMMDDYYYY(editAsnHeader.shipmentDate)}
                    </div>
                  </div>
                )}

                {/* 8. Estimated Delivery Date */}
                {isEditingGlobal ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Estimated Delivery <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editAsnHeader.estimatedDeliveryDate}
                      onChange={e => handleHeaderFieldChange('estimatedDeliveryDate', e.target.value)}
                      className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                        validationErrors.header?.estimatedDeliveryDate
                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                    {validationErrors.header?.estimatedDeliveryDate && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.estimatedDeliveryDate}</span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Estimated Delivery
                    </label>
                    <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate">
                      {formatDateMMDDYYYY(editAsnHeader.estimatedDeliveryDate)}
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
                      value={editAsnHeader.supplierName}
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
                      {editAsnHeader.supplierName}
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
                      value={editAsnHeader.supplierContactName}
                      onChange={e => handleContactChange(e.target.value)}
                      className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                        validationErrors.header?.supplierContactName
                          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    >
                      <option value="">-- Select Contact --</option>
                      {(SUPPLIER_PRESETS.find(s => s.name === editAsnHeader.supplierName)?.contacts || [{ name: editAsnHeader.supplierContactName }]).map(c => (
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
                      {editAsnHeader.supplierContactName}
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
                      value={editAsnHeader.supplierContactEmail}
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
                      {editAsnHeader.supplierContactEmail}
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
                      value={editAsnHeader.supplierContactPhone}
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
                      {editAsnHeader.supplierContactPhone}
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
                    {/* 13. Freight Carrier */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Freight Carrier <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editAsnHeader.carrierName}
                          onChange={e => handleHeaderFieldChange('carrierName', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.carrierName
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        >
                          {CARRIER_PRESETS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        {validationErrors.header?.carrierName && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.carrierName}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Freight Carrier
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center truncate">
                          {editAsnHeader.carrierName}
                        </div>
                      </div>
                    )}

                    {/* 14. Tracking / PRO Number */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tracking Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editAsnHeader.trackingProNumber}
                          onChange={e => handleHeaderFieldChange('trackingProNumber', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.trackingProNumber
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.trackingProNumber && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.trackingProNumber}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tracking / PRO Number
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700 flex items-center truncate">
                          {editAsnHeader.trackingProNumber}
                        </div>
                      </div>
                    )}

                    {/* 15. Bill of Lading (BOL) */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Bill of Lading (BOL)
                        </label>
                        <input
                          type="text"
                          value={editAsnHeader.bolNumber}
                          onChange={e => handleHeaderFieldChange('bolNumber', e.target.value)}
                          className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Bill of Lading (BOL)
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 flex items-center truncate">
                          {editAsnHeader.bolNumber}
                        </div>
                      </div>
                    )}

                    {/* 16. Security Seal Number */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Security Seal ID
                        </label>
                        <input
                          type="text"
                          value={editAsnHeader.sealNumber}
                          onChange={e => handleHeaderFieldChange('sealNumber', e.target.value)}
                          className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Security Seal ID
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                          {editAsnHeader.sealNumber}
                        </div>
                      </div>
                    )}

                    {/* 17. Ship-From Address */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ship-From Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editAsnHeader.shipFromAddress}
                          onChange={e => handleHeaderFieldChange('shipFromAddress', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.shipFromAddress
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        />
                        {validationErrors.header?.shipFromAddress && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.shipFromAddress}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ship-From Address
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editAsnHeader.shipFromAddress}>
                          {editAsnHeader.shipFromAddress}
                        </div>
                      </div>
                    )}

                    {/* 18. Ship-To Address */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ship-To Address <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editAsnHeader.shipToAddress}
                          onChange={e => handleHeaderFieldChange('shipToAddress', e.target.value)}
                          className={`w-full h-8 px-2.5 py-1 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition shadow-2xs ${
                            validationErrors.header?.shipToAddress
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-rose-400'
                              : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        >
                          {DELIVERY_ADDRESS_PRESETS.map((addr, idx) => (
                            <option key={idx} value={addr}>{addr}</option>
                          ))}
                        </select>
                        {validationErrors.header?.shipToAddress && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.shipToAddress}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ship-To Address
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editAsnHeader.shipToAddress}>
                          {editAsnHeader.shipToAddress}
                        </div>
                      </div>
                    )}

                    {/* 19. Supplier PAN */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier PAN
                        </label>
                        <input
                          type="text"
                          value={editAsnHeader.supplierPan}
                          onChange={e => handleHeaderFieldChange('supplierPan', e.target.value)}
                          className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier PAN
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                          {editAsnHeader.supplierPan}
                        </div>
                      </div>
                    )}

                    {/* 20. Supplier GST */}
                    {isEditingGlobal ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier GST
                        </label>
                        <input
                          type="text"
                          value={editAsnHeader.supplierGst}
                          onChange={e => handleHeaderFieldChange('supplierGst', e.target.value)}
                          className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Supplier GST
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center truncate">
                          {editAsnHeader.supplierGst}
                        </div>
                      </div>
                    )}

                    {/* 21. Handling Instructions (Spans 2 columns) */}
                    {isEditingGlobal ? (
                      <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Handling & Receiving Instructions
                        </label>
                        <input
                          type="text"
                          value={editAsnHeader.handlingInstructions}
                          onChange={e => handleHeaderFieldChange('handlingInstructions', e.target.value)}
                          placeholder="Enter dock handling or gate clearance instructions..."
                          className="w-full h-8 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                        />
                      </div>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Handling & Receiving Instructions
                        </label>
                        <div className="w-full h-8 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center truncate" title={editAsnHeader.handlingInstructions}>
                          {editAsnHeader.handlingInstructions || 'Air-ride trailer required. Keep dry. Sensitive electronics.'}
                        </div>
                      </div>
                    )}

                    {/* 22. Attachments (Spans 2 columns; Upload strictly in Edit Mode) */}
                    {isEditingGlobal ? (
                      <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Attachments (BOL / Packing Slip) <span className="text-red-500">*</span>
                          </label>
                          <label
                            htmlFor="global-asn-attachment-file"
                            className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                            title="Upload single or multiple shipping documents"
                          >
                            <Upload className="w-2.5 h-2.5" />
                            <span>Upload Documents</span>
                          </label>
                          <input
                            id="global-asn-attachment-file"
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
                          {(editAsnHeader.attachments && editAsnHeader.attachments.length > 0 ? editAsnHeader.attachments : []).map((file, fIdx) => (
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
                          {(!editAsnHeader.attachments || editAsnHeader.attachments.length === 0) && (
                            <span className="text-[11px] text-slate-400 italic">No files attached. Upload at least 1 document (BOL/Packing slip).</span>
                          )}
                        </div>
                        {validationErrors.header?.attachments && (
                          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{validationErrors.header.attachments}</span>
                        )}
                      </div>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Attachments (BOL / Packing Slip)
                        </label>
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs min-h-[32px] flex flex-wrap items-center gap-1.5">
                          {editAsnHeader.attachments && editAsnHeader.attachments.length > 0 ? (
                            editAsnHeader.attachments.map((file, fIdx) => (
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
              TIER 2: SHIPPED DELIVERABLES (LINE ITEMS)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Shipped Deliverables
                </h3>
                <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {currentActiveItems.length} Item{currentActiveItems.length > 1 ? 's' : ''}
                </span>
              </div>

              {isEditingGlobal && (
                <button
                  onClick={handleAddItem}
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
                    <th className="py-2.5 px-3 min-w-[200px]">ITEM NAME</th>
                    <th className="py-2.5 px-3 min-w-[240px]">DESCRIPTION</th>
                    <th className="py-2.5 px-3 text-center w-24">PO LINE REF</th>
                    <th className="py-2.5 px-3 text-center w-24">QTY SHIPPED</th>
                    <th className="py-2.5 px-3 text-center w-24">QTY ORDERED</th>
                    <th className="py-2.5 px-3 text-center w-20">UOM</th>
                    <th className="py-2.5 px-3 min-w-[150px]">PACKAGE / PALLET ID</th>
                    <th className="py-2.5 px-3 min-w-[160px]">SERIAL / LOT NO</th>
                    <th className="py-2.5 px-3 min-w-[200px]">COMMENTS</th>
                    <th className="py-2.5 px-3 text-center min-w-[160px]">ATTACHMENTS</th>
                    {isEditingGlobal && <th className="py-2.5 px-3 text-center w-14">ACTION</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentActiveItems.length > 0 ? (
                    currentActiveItems.map((item, idx) => {
                      return (
                        <tr key={idx} className="hover:bg-slate-50/70 transition">
                          {/* 1. Item Number */}
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                            {String(idx + 1).padStart(2, '0')}
                          </td>

                          {/* 2. Item Name (Dropdown / Catalog) */}
                          <td className="py-3 px-3">
                            {isEditingGlobal ? (
                              <div className="space-y-0.5">
                                <select
                                  value={
                                    LINE_ITEM_CATALOG_PRESETS.some(p => p.name === item.itemName)
                                      ? (LINE_ITEM_CATALOG_PRESETS.find(p => p.name === item.itemName)?.name || '')
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
                                  <option value="custom">-- Custom Deliverable --</option>
                                </select>
                                {(!LINE_ITEM_CATALOG_PRESETS.some(p => p.name === item.itemName)) && (
                                  <input
                                    type="text"
                                    value={item.itemName || ''}
                                    onChange={e => handleLineChange(idx, 'itemName', e.target.value)}
                                    placeholder="Enter custom item name..."
                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                )}
                                {validationErrors.lines?.[idx]?.itemName && (
                                  <span className="text-[10px] text-rose-600 font-semibold block">{validationErrors.lines[idx].itemName}</span>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="font-semibold text-slate-900 block truncate max-w-[200px]" title={item.itemName || item.description}>
                                  {item.itemName || item.description}
                                </span>
                                {item.partNumber && (
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    Part: {item.partNumber}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 3. Description (Separate Column) */}
                          <td className="py-3 px-3">
                            {isEditingGlobal ? (
                              <div>
                                <textarea
                                  rows={1}
                                  value={item.description || ''}
                                  onChange={e => handleLineChange(idx, 'description', e.target.value)}
                                  placeholder="Item deliverable spec / cargo details..."
                                  className={`w-full min-h-[32px] px-2 py-1 bg-white border rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition shadow-2xs resize-none ${
                                    validationErrors.lines?.[idx]?.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                  }`}
                                />
                                {validationErrors.lines?.[idx]?.description && (
                                  <span className="text-[10px] text-rose-600 font-semibold block">{validationErrors.lines[idx].description}</span>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-700 max-w-[240px] truncate" title={item.description}>
                                {item.description}
                              </div>
                            )}
                          </td>

                          {/* 4. PO Line Ref */}
                          <td className="py-3 px-3 text-center">
                            {isEditingGlobal ? (
                              <input
                                type="text"
                                value={item.poLine || `Line ${String(idx + 1).padStart(2, '0')}`}
                                onChange={e => handleLineChange(idx, 'poLine', e.target.value)}
                                className="w-20 h-8 text-center px-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                              />
                            ) : (
                              <span className="font-mono text-xs font-medium text-slate-700">
                                {item.poLine || `Line ${String(idx + 1).padStart(2, '0')}`}
                              </span>
                            )}
                          </td>

                          {/* 5. Qty Shipped */}
                          <td className="py-3 px-3 text-center">
                            {isEditingGlobal ? (
                              <div>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.qtyShipped ?? ''}
                                  onChange={e => handleLineChange(idx, 'qtyShipped', e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
                                  className={`w-16 h-8 text-center px-1 bg-white border rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs ${
                                    validationErrors.lines?.[idx]?.qtyShipped ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                  }`}
                                />
                                {validationErrors.lines?.[idx]?.qtyShipped && (
                                  <span className="text-[9px] text-rose-600 font-bold block mt-0.5 leading-none">Required</span>
                                )}
                              </div>
                            ) : (
                              <span className="font-bold text-slate-900 text-xs">
                                {item.qtyShipped}
                              </span>
                            )}
                          </td>

                          {/* 6. Qty Ordered */}
                          <td className="py-3 px-3 text-center">
                            {isEditingGlobal ? (
                              <input
                                type="number"
                                min={1}
                                value={item.qtyOrdered ?? item.qtyShipped ?? 1}
                                onChange={e => handleLineChange(idx, 'qtyOrdered', parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-center px-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                              />
                            ) : (
                              <span className="text-slate-600 text-xs">
                                {item.qtyOrdered ?? item.qtyShipped ?? 1}
                              </span>
                            )}
                          </td>

                          {/* 7. UoM */}
                          <td className="py-3 px-3 text-center">
                            {isEditingGlobal ? (
                              <select
                                value={item.uom || 'EA'}
                                onChange={e => handleLineChange(idx, 'uom', e.target.value)}
                                className="w-16 h-8 px-1 text-center bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                              >
                                <option value="EA">EA</option>
                                <option value="YR">YR</option>
                                <option value="SET">SET</option>
                                <option value="RUN">RUN</option>
                                <option value="HRS">HRS</option>
                              </select>
                            ) : (
                              <span className="font-semibold text-slate-700 text-xs">
                                {item.uom || 'EA'}
                              </span>
                            )}
                          </td>

                          {/* 8. Package / Pallet ID */}
                          <td className="py-3 px-3">
                            {isEditingGlobal ? (
                              <input
                                type="text"
                                value={item.packageId || ''}
                                onChange={e => handleLineChange(idx, 'packageId', e.target.value)}
                                placeholder="PLT-01 (Crate A)"
                                className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                              />
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                <Package className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[120px]">{item.packageId || 'PLT-01 (Crate A)'}</span>
                              </span>
                            )}
                          </td>

                          {/* 9. Serial / Lot No */}
                          <td className="py-3 px-3">
                            {isEditingGlobal ? (
                              <input
                                type="text"
                                value={item.serialNumber || ''}
                                onChange={e => handleLineChange(idx, 'serialNumber', e.target.value)}
                                placeholder="SRV-B14-9921-A"
                                className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                              />
                            ) : (
                              <span className="font-mono text-xs text-slate-700 truncate max-w-[150px] block" title={item.serialNumber}>
                                {item.serialNumber || <span className="text-slate-400 italic">N/A</span>}
                              </span>
                            )}
                          </td>

                          {/* 10. Comments (Single Text Box) */}
                          <td className="py-3 px-3">
                            {isEditingGlobal ? (
                              <input
                                type="text"
                                value={item.comments || ''}
                                onChange={e => handleLineChange(idx, 'comments', e.target.value)}
                                placeholder="Inspection / intake notes..."
                                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                              />
                            ) : (
                              <div className="text-xs text-slate-600 truncate max-w-[200px]" title={item.comments}>
                                {item.comments || <span className="text-slate-400 italic">None</span>}
                              </div>
                            )}
                          </td>

                          {/* 11. Attachments (Upload strictly in Edit Mode) */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="file"
                              multiple
                              id={`asn-line-attachment-${idx}`}
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
                                          title="Remove file"
                                        >
                                          &times;
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                                <label
                                  htmlFor={`asn-line-attachment-${idx}`}
                                  className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition shadow-2xs"
                                  title="Upload documents for this line deliverable"
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

                          {/* 12. Actions */}
                          {isEditingGlobal && (
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
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
                      <td colSpan={isEditingGlobal ? 12 : 11} className="py-8 text-center text-slate-400 italic text-xs">
                        No shipped items recorded. Click "+ Add Item" to register line deliverables.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================================
              TIER 3: SHIPMENT SUMMARY (VERTICAL LOGISTICS CALCULATION)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Shipment Summary
                </h3>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-end">
                {/* Right: Vertical Calculation Card */}
                <div className="w-full sm:w-80 md:w-96 bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 text-xs space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Total Shipped Units</span>
                    <span className="font-mono font-bold text-slate-900">
                      {liveTotalShippedUnits} Unit{liveTotalShippedUnits !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Total Packages / Pallets</span>
                    <span className="font-mono font-bold text-slate-900">
                      {editAsnHeader.totalPackages || '2 Pallets / 4 Crates'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Certified Gross Weight</span>
                    <span className="font-mono font-bold text-slate-900">
                      {editAsnHeader.grossWeight || '348 lbs (158 kg)'}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-900">Declared Value</span>
                      <span className="text-[10px] font-semibold text-slate-500">(USD)</span>
                    </div>
                    <div className="text-base font-mono font-black text-emerald-700">
                      ${liveTotalDeclaredValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Right Split Tab: Logistics & Dock Collaboration */}
          {showCollabDrawer && (
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Logistics & Dock Collaboration
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
                    {selectedAsn.asnNumber}
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

              {/* In-Thread Context Banner */}
              <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl mb-4 text-xs">
                <div className="flex items-center justify-between font-semibold text-sky-900 mb-1">
                  <span>Inbound Dock Intake Desk</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded text-sky-700 border border-sky-200 font-mono">
                    {selectedAsn.carrier?.trackingProNumber || 'FXF-2026-US'}
                  </span>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  Real-time dock appointment confirmation, seal verification, and electronic gate pass coordination with receiving supervisors.
                </p>
              </div>

              {/* Message List */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-500">No dock messages yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Start collaboration with logistics receiving lead below.</p>
                  </div>
                ) : (
                  comments.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl border text-xs ${
                        msg.authorRole === 'SUPPLIER'
                          ? 'bg-sky-50/40 border-sky-200 ml-4'
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reply as Dispatcher</span>
                  <button
                    type="button"
                    onClick={handleAiDraftComment}
                    disabled={aiDrafting}
                    className="text-[10px] font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-sky-500" />
                    <span>{aiDrafting ? 'Drafting...' : 'AI Auto-Draft'}</span>
                  </button>
                </div>
                <textarea
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="Inquire on dock bay availability, gate PIN, or seal inspection..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Dock Update</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal: Official ASN PDF Spec Preview */}
        {showPdfModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
              {/* Modal Top Action Bar */}
              <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm tracking-tight font-mono">{selectedAsn.asnNumber}</span>
                      <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">PDF Spec</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Official High-Fidelity Advance Shipping Notice Document</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadAsnPdf(selectedAsn, getBuyerDisplayName(selectedAsn.buyerOrgId))}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export Advance Shipping Notice PDF"
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

              {/* Modal Content - Official ASN PDF Canvas */}
              <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/60">
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 sm:p-10 text-slate-800 font-sans max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
            {/* Header: Supplier Letterhead (Left) vs ADVANCE SHIPPING NOTICE (Right) */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedAsn.supplierName || 'CloudBridge Solutions LLC'}
                </h1>
                <div className="text-xs font-bold text-blue-700 tracking-wider mt-0.5">
                  Logistics & Hardware Fulfillment Operations
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Fulfillment Center #4 • 100 Innovation Parkway<br />
                  San Jose, CA 95134 • logistics@cloudbridge.com<br />
                  Vendor ERP ID: <span className="font-mono font-bold text-slate-700">VEND-7701</span>
                </div>
              </div>

              <div className="sm:text-right flex flex-col sm:items-end">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-blue-900 uppercase">
                  ADVANCE SHIPPING NOTICE
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1">
                  ASN #: <span className="font-bold text-slate-900 font-mono">{selectedAsn.asnNumber}</span>
                </div>
                <div className="mt-2">
                  {getStatusBadge(selectedAsn.status, selectedAsn.asnNumber)}
                </div>
              </div>
            </div>

            {/* 5-Box Key Metadata Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SHIPMENT DATE</div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {isMeridianPDF ? 'Oct 30, 2026' : formatDateMMDDYYYY(selectedAsn.shipmentDate)}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EST. DELIVERY</div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {isMeridianPDF ? 'Nov 03, 2026' : formatDateMMDDYYYY(selectedAsn.estimatedDeliveryDate)}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PO REFERENCE</div>
                <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
                  {selectedAsn.poNumber}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PACKAGES</div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {selectedAsn.totalPackages}
                </div>
              </div>
              <div className="p-3 col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GROSS WEIGHT</div>
                <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
                  {selectedAsn.grossWeight}
                </div>
              </div>
            </div>

            {/* 2-Column Entity Cards: SHIP FROM vs SHIP TO */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>SHIP FROM (ORIGIN)</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Origin Depot</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedAsn.shipFrom.depotName}
                </div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedAsn.shipFrom.address}<br />
                  <span className="text-slate-500 font-medium">Dispatch Lead:</span> {selectedAsn.shipFrom.dispatchLead} (Ph: {selectedAsn.shipFrom.phone})<br />
                  <span className="text-slate-500 font-medium">EDI Transaction ID:</span> <span className="font-mono text-slate-700">{selectedAsn.shipFrom.ediId}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>SHIP TO (DESTINATION)</span>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Dock Intake</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedAsn.shipTo.facilityName}
                </div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedAsn.shipTo.address}<br />
                  <span className="text-slate-500 font-medium">Attn:</span> {selectedAsn.shipTo.attn}<br />
                  <span className="text-slate-500 font-medium">Buyer Contact:</span> {selectedAsn.shipTo.buyerContact}
                </div>
              </div>
            </div>

            {/* Carrier Manifest Box */}
            <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center justify-between">
                <span>CARRIER & LOGISTICS MANIFEST</span>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Dedicated Route</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">CARRIER</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedAsn.carrier.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">TRACKING / PRO #</span>
                  <span className="font-mono font-bold text-blue-700 mt-0.5 block">{selectedAsn.carrier.trackingProNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">BILL OF LADING</span>
                  <span className="font-mono text-slate-800 mt-0.5 block">{selectedAsn.carrier.bolNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">TAMPER SEAL #</span>
                  <span className="font-mono font-bold text-amber-700 mt-0.5 block">{selectedAsn.carrier.sealNumber}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table with Dark Navy Header */}
            <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e293b] text-white font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-4">PART NUMBER & DELIVERABLE DESCRIPTION</th>
                    <th className="py-3 px-3 text-center w-20">PO LINE</th>
                    <th className="py-3 px-4 w-48">SERIAL / MAC NUMBERS</th>
                    <th className="py-3 px-3 text-center w-16">QTY</th>
                    <th className="py-3 px-3 text-center w-16">UOM</th>
                    <th className="py-3 px-4 text-center w-32">PACKAGE ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {selectedAsn.shippedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3 text-center text-slate-400 font-mono font-medium">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-mono text-[11px] text-blue-900">
                          {item.partNumber}
                        </div>
                        <div className="text-slate-700 text-xs mt-0.5 leading-snug">
                          {item.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-600 font-medium font-mono">
                        {item.poLine}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.serialNumber ? (
                          <div className="space-y-0.5">
                            <div className="font-mono text-slate-800 font-semibold text-[11px]">
                              S/N: {item.serialNumber}
                            </div>
                            {item.macAddress && (
                              <div className="font-mono text-[10px] text-slate-500">
                                MAC: {item.macAddress}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                        {item.qtyShipped}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                        {item.uom}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.packageId}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Receiving & Dock Instructions */}
            <div className="mt-6 bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                SPECIAL RECEIVING & INSPECTION INSTRUCTIONS
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                {selectedAsn.receivingInstructions}
              </p>
            </div>

            {/* Dual Verification Signatures */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  CARRIER DRIVER SIGNATURE & DATE (PICKUP VERIFIED)
                </div>
                <div className="h-10 flex items-center border-b-2 border-dashed border-slate-300 pb-1 font-serif italic text-base text-blue-950">
                  {selectedAsn.driverSignature}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Chain of custody verified • Bill of Lading acknowledged</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  DOCK RECEIVING SPECIALIST (MERIDIAN HEALTH DOCK B)
                </div>
                <div className="h-10 flex items-center border-b-2 border-dashed border-slate-300 pb-1 font-serif italic text-base text-slate-800">
                  {selectedAsn.dockSpecialistSignature}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>Electronic goods receipt (GRN) pending dock intake scan</span>
                </div>
              </div>
            </div>

            {/* Running Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>CloudBridge Solutions LLC • Advance Shipping Notice {selectedAsn.asnNumber}</span>
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
  // VIEW: ASNS LIST VIEW (Compact Unified Header, Minimal 4-KPIs, Clean Table)
  // =========================================================================
  return (
    <div className="space-y-4 pb-16">
      {/* Top Banner (Minimal, Balanced, Clean) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Title, Badge & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <Truck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">Advance Shipping Notices (ASN)</h1>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Track serialized logistics manifests, carrier transit, and deliveries.
            </p>
          </div>
        </div>

        {/* Right: Actions Only */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["ASN #,Buyer,PO Ref,Carrier,Tracking,Ship Date,Est Delivery,Status", ...asns.map(a => `${a.asnNumber},"${getBuyerDisplayName(a.buyerOrgId)}",${a.poNumber},"${a.carrier.name}",${a.carrier.trackingProNumber},${a.shipmentDate},${a.estimatedDeliveryDate},${a.status}`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `Verisource_ASNs_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Export filtered ASNs to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export ASNs</span>
          </button>

          <button
            onClick={() => {
              setNewAsnNum(`ASN-2026-${Math.floor(100 + Math.random() * 900)}`);
              setShowDispatchModal(true);
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Create a new Advance Shipping Notice"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
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
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Shipments</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {activeInTransitCount} <span className="text-xs font-normal text-slate-500 font-sans">Dispatched</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-teal-700 group-hover:text-teal-800 font-medium truncate transition">
              EDI 856 protocol active
            </span>
            <Sparkline data={[1, 2, 1, 3, 2, Math.max(1, activeInTransitCount)]} color="#0d9488" width={68} height={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dock Accepted</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {dockAcceptedCount} <span className="text-xs font-normal text-slate-500 font-sans">Delivered</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-emerald-700 group-hover:text-emerald-800 font-medium truncate transition">
              Full custody handoff signed
            </span>
            <Sparkline data={[8, 11, 14, 18, 21, Math.max(22, dockAcceptedCount)]} color="#10b981" width={68} height={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Packages</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            {totalPackagesCount} <span className="text-xs font-normal text-slate-500 font-sans">Pallets &amp; Crates</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 group-hover:text-sky-700 font-medium truncate transition">
              Serialized barcode packing
            </span>
            <Sparkline data={[42, 58, 64, 76, 85, Math.max(88, totalPackagesCount)]} color="#0284c7" width={68} height={20} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tamper Seals</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono">
            100% <span className="text-xs font-normal text-slate-500 font-sans">Intact</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-amber-700 group-hover:text-amber-800 font-medium truncate transition">
              Cryptographic seal IDs verified
            </span>
            <Sparkline data={[100, 100, 100, 100, 100, 100]} color="#10b981" width={68} height={20} />
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
              placeholder="Search ASNs, tracking, PO..."
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

          {/* Status Filter Dropdown */}
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter by shipping status"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft (Unsaved)</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DOCK_ACCEPTED">Dock Accepted</option>
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
            Showing {filteredAsns.length} of {asns.length} shipments
          </span>
          <FilterSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            title="Sort shipments"
          >
            <option value="DATE_DESC">Date (Newest)</option>
            <option value="DATE_ASC">Date (Oldest)</option>
          </FilterSelect>
        </div>
      </div>

      {/* ASNs Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-600" />
            Loading advance shipping notices from Verisource Logistics Network...
          </div>
        ) : filteredAsns.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div>No advance shipping notices match your filters.</div>
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
                  <th className="py-3 px-4 w-40 whitespace-nowrap">ASN #</th>
                  <th className="py-3 px-4 w-48">BUYER / CLIENT</th>
                  <th className="py-3 px-3 w-32 whitespace-nowrap">PO REFERENCE</th>
                  <th className="py-3 px-4 min-w-[190px]">CARRIER & PRO #</th>
                  <th className="py-3 px-3 w-28 whitespace-nowrap">SHIP DATE</th>
                  <th className="py-3 px-3 w-28 whitespace-nowrap">EST. DELIVERY</th>
                  <th className="py-3 px-4 w-36 whitespace-nowrap">PACKAGES & WEIGHT</th>
                  <th className="py-3 px-4 text-center w-36 whitespace-nowrap">STATUS</th>
                  <th className="py-3 px-4 text-right w-36 whitespace-nowrap">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredAsns.map(asn => {
                  const isMeridian = asn.asnNumber === 'ASN-2026-088';
                  const buyerName = getBuyerDisplayName(asn.buyerOrgId);
                  const initials = getBuyerBadgeInitials(asn.buyerOrgId);

                  return (
                    <tr
                      key={asn.id}
                      onClick={() => {
                        setSelectedAsn(asn);
                        navigate('/asns', { asnNumber: asn.asnNumber });
                      }}
                      className="hover:bg-slate-50/90 cursor-pointer transition group"
                    >
                      {/* ASN # */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition flex items-center gap-1.5 font-mono">
                          <Truck className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          <span>{asn.asnNumber}</span>
                        </div>
                        {isMeridian && (
                          <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded mt-0.5 inline-block border border-blue-200/60">
                            PDF Sample Match
                          </span>
                        )}
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-blue-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setBuyerFilter(asn.buyerOrgId);
                            }}
                            className="font-semibold text-slate-800 hover:text-slate-950 hover:underline truncate max-w-[150px] cursor-pointer"
                            title={`Filter shipments to ${buyerName}`}
                          >
                            {buyerName}
                          </span>
                        </div>
                      </td>

                      {/* PO Reference */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/orders', { poNumber: asn.poNumber, buyerOrgId: asn.buyerOrgId });
                          }}
                          className="hover:text-slate-950 hover:underline cursor-pointer"
                          title={`View order ${asn.poNumber} in Orders Hub`}
                        >
                          {asn.poNumber}
                        </button>
                      </td>

                      {/* Carrier & PRO # */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-semibold truncate text-slate-900 max-w-[180px]">
                          {asn.carrier.name}
                        </div>
                        <div className="text-[11px] text-blue-700 font-mono truncate max-w-[180px]">
                          {asn.carrier.trackingProNumber}
                        </div>
                      </td>

                      {/* Ship Date */}
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-medium">
                        {isMeridian ? 'Oct 30, 2026' : formatDateMMDDYYYY(asn.shipmentDate)}
                      </td>

                      {/* Est. Delivery */}
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-medium">
                        {isMeridian ? 'Nov 03, 2026' : formatDateMMDDYYYY(asn.estimatedDeliveryDate)}
                      </td>

                      {/* Packages & Weight */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{asn.totalPackages}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{asn.grossWeight}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(asn.status, asn.asnNumber)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAsn(asn);
                              setShowCollabDrawer(true);
                              navigate('/asns', { asnNumber: asn.asnNumber, openCollab: true, openMessages: true, timestamp: Date.now() });
                            }}
                            className="relative p-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Messages & Collaboration"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                            {(commentsMap[asn.asnNumber] || []).length > 0 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white animate-pulse" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAsn(asn);
                              navigate('/asns', { asnNumber: asn.asnNumber });
                            }}
                            className="w-24 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center justify-center"
                          >
                            View ASN
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

      {/* Modal: Create Advance Shipping Notice Confirmation (ONLY ASN Number & Buyer Name) */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Create Advance Shipping Notice</h3>
                  <p className="text-[11px] text-slate-500">Initialize a new ASN in logistics ledger</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDispatchModal(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsn} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ASN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAsnNum}
                  onChange={e => setNewAsnNum(e.target.value)}
                  required
                  placeholder="e.g. ASN-2026-095"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs"
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
                  onClick={() => setShowDispatchModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-teal-400" />
                  <span>Create ASN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
