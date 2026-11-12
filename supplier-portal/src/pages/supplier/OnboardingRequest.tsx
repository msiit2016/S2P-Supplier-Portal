import React, { useState, useEffect, useRef } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { broadcastPageContext, onPageAction, PageAction } from '../../services/pageActionBridge.js';
import { AIAssistantDrawer } from '../../components/ai/AIAssistantDrawer.js';
import { 
  Building2, 
  Briefcase,
  Users, 
  FileText, 
  CreditCard, 
  UploadCloud, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Lock, 
  AlertTriangle, 
  Info,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Clock,
  Send,
  Paperclip,
  CheckCheck,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileCheck2,
  ChevronDown,
  Building,
  AppWindow,
  Split,
  Minus,
  Bot,
  Zap,
  HelpCircle,
  X,
  Search,
  FileSearch,
  CheckSquare,
  Terminal,
  History,
  GripHorizontal,
  Edit3,
  RotateCcw,
  Save,
  Globe,
  Layers,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronUp,
  MapPin,
  Eye,
  Plus,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GepIdentificationGrid } from '../../components/onboarding/GepIdentificationGrid.js';
import { GepContactMatrix } from '../../components/onboarding/GepContactMatrix.js';
import { GepLocationGrid } from '../../components/onboarding/GepLocationGrid.js';
import { GepBankingGrid } from '../../components/onboarding/GepBankingGrid.js';
import { GepCommercialTerms } from '../../components/onboarding/GepCommercialTerms.js';
import { GepCertificatesGrid } from '../../components/onboarding/GepCertificatesGrid.js';
import { MasterProfileSyncModal, SyncStrategy } from '../../components/onboarding/MasterProfileSyncModal.js';
import { VerificationIndicator } from '../../components/common/VerificationIndicator.js';
import { SearchableSelect } from '../../components/common/SearchableSelect.js';
import { formatDateMMDDYYYY } from '../../utils/dateUtils.js';
import { 
  GepIdentificationItem, 
  GepLocationItem, 
  GepContactItem, 
  GepBankItem, 
  GepCertificateItem, 
  GepCommercialSettings 
} from '../../types/index.js';

interface BuyerInvitation {
  id: string;
  buyerName: string;
  buyerOrgId: string;
  invitationCode: string;
  category: string;
  invitedBy: string;
  invitedDate: string;
  status: 'PENDING_INITIATION' | 'IN_PROGRESS' | 'COMPLETED';
  stage?: string;
  stageNum?: number;
}

export interface BuyerOnboardingPacket {
  partnerStatus: 'INVITED' | 'NOT_INVITED' | 'ACTIVE';
  supplierManager: string;
  subcategories: string[];
  serviceLocations: string[];
  descriptionOfServices: string;
  businessUnits: string[];
  contacts: GepContactItem[];
  locations: GepLocationItem[];
  bankAccounts: GepBankItem[];
  commercialSettings: GepCommercialSettings;
  certificates: GepCertificateItem[];
  isSubmitted: boolean;
  isEditing: boolean;
  submittedAt?: string;
}

export const INITIAL_BUYER_PACKETS: Record<string, BuyerOnboardingPacket> = {
  'inv-apex-01': {
    partnerStatus: 'INVITED',
    supplierManager: 'Sarah Jenkins (Senior Category Manager - Cloud & IT)',
    subcategories: [
      '41111900 - Industrial Sensors & Transducers',
      '43222600 - Network and Telemetry Equipment',
      '43232800 - Embedded System Software / Firmware'
    ],
    serviceLocations: [
      'Americas (US, CA, MX)',
      'Europe (UK, DE, FR)',
      'Asia-Pacific (SG, JP, AU)'
    ],
    descriptionOfServices: 'Leading provider of enterprise cloud compute nodes, specialized cybersecurity architecture, and high-tolerance industrial sensor hardware engineered for enterprise IT, cloud infrastructure, and commercial networks.',
    businessUnits: [
      'Enterprise Cloud Infrastructure',
      'Commercial IoT & Telemetry',
      'Corporate Network Systems'
    ],
    contacts: [
      {
        id: 'cnt-1',
        firstName: 'Elena',
        lastName: 'Rostova',
        jobTitle: 'VP Corporate Treasury & AP',
        email: 'elena@acmeindustrial.com',
        phone: '+1 (512) 555-0199',
        isPrimary: true,
        status: 'REGISTERED',
        role: 'ACCOUNTS_PAYABLE',
        orgEntity: 'Corporate Headquarters',
        serviceLocation: 'Americas',
        responsibilities: 'Receives remittances, payment advice & early discount offers',
        docFileName: 'Elena_Rostova_Signatory_Authorization.pdf',
        docFileSize: '1.4 MB'
      },
      {
        id: 'cnt-2',
        firstName: 'Marcus',
        lastName: 'Vance',
        jobTitle: 'Director of Global Supply Chain',
        email: 'm.vance@acmeindustrial.com',
        phone: '+1 (512) 555-0144',
        isPrimary: false,
        status: 'REGISTERED',
        role: 'OPERATIONS',
        orgEntity: 'Supply Chain Operations',
        serviceLocation: 'Americas & Europe',
        responsibilities: 'Receives PO dispatches, issues ASNs and coordinates warehouse dock intake',
        docFileName: 'Marcus_Vance_SupplyChain_Delegation.pdf',
        docFileSize: '1.2 MB'
      },
      {
        id: 'cnt-3',
        firstName: 'Sarah',
        lastName: 'Chen',
        jobTitle: 'General Counsel & Corporate Secretary',
        email: 'schen@acmeindustrial.com',
        phone: '+1 (512) 555-0188',
        isPrimary: false,
        status: 'REGISTERED',
        role: 'LEGAL',
        orgEntity: 'Corporate Legal & Contracts',
        serviceLocation: 'Global',
        responsibilities: 'Authorized to review and execute MSAs, NDAs & compliance terms',
        docFileName: 'Sarah_Chen_Legal_Counsel_POA.pdf',
        docFileSize: '1.8 MB'
      },
      {
        id: 'cnt-4',
        firstName: 'David',
        lastName: 'Miller',
        jobTitle: 'Head of ESG & Regulatory Compliance',
        email: 'dmiller@acmeindustrial.com',
        phone: '+1 (512) 555-0177',
        isPrimary: false,
        status: 'INVITED',
        role: 'COMPLIANCE',
        orgEntity: 'Risk, ESG & Safety',
        serviceLocation: 'Global',
        responsibilities: 'Attests to annual safety audits, ISO certifications & diversity status',
        docFileName: 'David_Miller_ESG_Attestation_Letter.pdf',
        docFileSize: '950 KB'
      }
    ],
    locations: [
      {
        id: 'loc-austin-1',
        name: 'Austin Corporate Headquarters & Lab',
        code: 'LOC-1011',
        types: ['HQ', 'ORDERING', 'REMIT_TO'],
        street1: '100 Industrial Parkway',
        street2: 'Suite 400',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'United States',
        phone: '+1 (512) 555-0100',
        isDefaultRemitTo: true,
        changeOrdersPermitted: true,
        autoAcknowledge: true,
        supportedCurrencies: ['USD', 'EUR'],
        docFileName: 'Austin_Corporate_HQ_Lease_Agreement.pdf',
        docFileSize: '1.6 MB'
      },
      {
        id: 'loc-joliet-2',
        name: 'Joliet Fulfillment & Logistics DC',
        code: 'LOC-2044',
        types: ['SHIP_FROM', 'INVOICING'],
        street1: '450 Logistics Blvd',
        city: 'Joliet',
        state: 'IL',
        zip: '60431',
        country: 'United States',
        phone: '+1 (815) 555-0220',
        isDefaultRemitTo: false,
        changeOrdersPermitted: true,
        autoAcknowledge: true,
        supportedCurrencies: ['USD'],
        docFileName: 'Joliet_DC_Utility_Proof_of_Address.pdf',
        docFileSize: '1.1 MB'
      }
    ],
    bankAccounts: [
      {
        id: 'bnk-chase-1',
        clientBankRefId: 'REF-492100',
        country: 'United States',
        currency: 'USD',
        paymentMethod: 'ACH_CREDIT',
        bankName: 'JPMorgan Chase Bank, N.A.',
        bankBranch: 'Austin Commercial Banking Center',
        swiftBic: 'CHASUS33XXX',
        beneficiaryName: 'Acme Industrial Tech Inc.',
        routingNumber: '021000021',
        accountNumberMasked: '••••••••48210',
        accountNumberFull: '489201948210',
        linkedLocationId: 'loc-austin-1',
        linkedLocationName: 'Austin Corporate Headquarters & Lab',
        isDefault: true,
        verifiedWithDoc: true,
        docFileName: 'Chase_Bank_Remittance_Verification_Letter.pdf'
      }
    ],
    commercialSettings: {
      matchingType: '3-Way Match',
      baselineTriggerDate: 'Goods Receipt Date (GR Date)',
      paymentTerms: '2/10 Net 30',
      billingScheduleStructure: 'STANDARD_PO',
      milestoneBillingProtocol: '30% PO Acceptance, 40% Factory Testing, 30% Site Commissioning',
      primaryCurrency: 'USD',
      disbursementMethod: 'ACH / Direct Deposit',
      ingestionChannel: 'Supplier Portal Upload',
      eInvoicingFramework: 'PEPPOL Network',
      eInvoicingEndpointId: '0088:1234567890123',
      incoTerms: 'FCA - Free Carrier',
      namedDeliveryPlace: 'Austin Logistics Facility, TX',
      earlyPaymentDiscount: true,
      maxDiscountTolerance: 2.0,
      accelerationWindow: 'Day 10 (Fastest)',
      relationshipType: 'Strategic Tier-1 Supplier',
      supplierRiskType: 'LOW',
      businessCriticality: 'CRITICAL'
    },
    certificates: [
      {
        id: 'cert-coi-1',
        category: 'PROFESSIONAL',
        certType: 'COI_GENERAL',
        certTypeName: 'ACORD 25 Certificate of Liability Insurance ($5M)',
        issuingAuthority: 'Travelers Commercial Casualty',
        effectiveDate: '2026-01-01',
        expiryDate: '2026-12-31',
        status: 'ACTIVE',
        fileName: 'Travelers_ACORD_25_COI_Verified.pdf',
        ocrConfidence: 99.4
      },
      {
        id: 'cert-iso-2',
        category: 'PROFESSIONAL',
        certType: 'ISO_27001',
        certTypeName: 'ISO/IEC 27001 Information Security Management',
        issuingAuthority: 'BSI Assurance UK',
        effectiveDate: '2025-06-15',
        expiryDate: '2028-06-14',
        status: 'ACTIVE',
        fileName: 'BSI_ISO27001_Audit_Attestation.pdf',
        ocrConfidence: 99.1
      },
      {
        id: 'cert-soc-3',
        category: 'PROFESSIONAL',
        certType: 'SOC_2',
        certTypeName: 'SOC 2 Type II Security & Confidentiality Report',
        issuingAuthority: 'Ernst & Young LLP',
        effectiveDate: '2025-11-01',
        expiryDate: '2026-10-31',
        status: 'ACTIVE',
        fileName: 'EY_SOC2_Type_II_Executive_Summary.pdf',
        ocrConfidence: 98.7
      },
      {
        id: 'cert-wbe-4',
        category: 'DIVERSITY',
        certType: 'WBE',
        certTypeName: 'Women-Owned Business Enterprise (WBE)',
        issuingAuthority: 'WBENC National Council',
        effectiveDate: '2025-03-01',
        expiryDate: '2027-02-28',
        status: 'ACTIVE',
        fileName: 'WBENC_WBE_Certified_Dossier.pdf',
        ocrConfidence: 99.0
      }
    ],
    isSubmitted: false,
    isEditing: false
  },
  'inv-novatech-02': {
    partnerStatus: 'INVITED',
    supplierManager: 'David Miller (Procurement Director - Electronics & Defense)',
    subcategories: [
      '25191500 - Aerospace Avionics & Flight Control Sensors',
      '43222600 - Radiation-Tolerant Telemetry Systems',
      '41111900 - High-Tolerance Micro-Transducers'
    ],
    serviceLocations: [
      'Americas (US, CA)',
      'Europe (UK, DE)'
    ],
    descriptionOfServices: 'AS9100 Rev D & ITAR registered manufacturing division specializing in mission-critical spaceflight telemetry, radiation-tolerant telemetry nodes, and avionics sensor arrays engineered for aerospace and defense prime contractors.',
    businessUnits: [
      'Defense Flight Systems',
      'Space Radiation Hardening',
      'Avionics Quality Engineering'
    ],
    contacts: [
      {
        id: 'cnt-nv-1',
        firstName: 'Marcus',
        lastName: 'Vance',
        jobTitle: 'Director of Defense Supply Chain',
        email: 'm.vance@acmeindustrial.com',
        phone: '+1 (512) 555-0144',
        isPrimary: true,
        status: 'REGISTERED',
        role: 'OPERATIONS',
        orgEntity: 'Defense Supply Chain Operations',
        serviceLocation: 'Americas',
        responsibilities: 'Receives PO dispatches, issues ASNs and coordinates warehouse dock intake',
        docFileName: 'Marcus_Vance_Defense_Delegation.pdf',
        docFileSize: '1.5 MB'
      },
      {
        id: 'cnt-nv-2',
        firstName: 'Sarah',
        lastName: 'Chen',
        jobTitle: 'Export Control & ITAR Counsel',
        email: 'schen@acmeindustrial.com',
        phone: '+1 (512) 555-0188',
        isPrimary: false,
        status: 'REGISTERED',
        role: 'LEGAL',
        orgEntity: 'Export Control & ITAR Counsel',
        serviceLocation: 'Americas',
        responsibilities: 'Authorized to review and execute MSAs, NDAs & compliance terms',
        docFileName: 'Sarah_Chen_ITAR_Signatory_POA.pdf',
        docFileSize: '1.8 MB'
      },
      {
        id: 'cnt-nv-3',
        firstName: 'David',
        lastName: 'Miller',
        jobTitle: 'Quality & AS9100 Lead Auditor',
        email: 'dmiller@acmeindustrial.com',
        phone: '+1 (512) 555-0177',
        isPrimary: false,
        status: 'INVITED',
        role: 'COMPLIANCE',
        orgEntity: 'Quality & AS9100 Audit',
        serviceLocation: 'Americas',
        responsibilities: 'Attests to annual safety audits, ISO certifications & diversity status',
        docFileName: 'David_Miller_AS9100_Delegation.pdf',
        docFileSize: '920 KB'
      }
    ],
    locations: [
      {
        id: 'loc-austin-1',
        name: 'Austin Corporate Headquarters & Lab',
        code: 'LOC-1011',
        types: ['HQ', 'ORDERING', 'REMIT_TO'],
        street1: '100 Industrial Parkway',
        street2: 'Suite 400',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'United States',
        phone: '+1 (512) 555-0100',
        isDefaultRemitTo: true,
        changeOrdersPermitted: true,
        autoAcknowledge: true,
        supportedCurrencies: ['USD'],
        docFileName: 'Austin_Defense_HQ_Lease_Agreement.pdf',
        docFileSize: '1.8 MB'
      },
      {
        id: 'loc-joliet-2',
        name: 'Joliet Fulfillment & Logistics DC',
        code: 'LOC-2044',
        types: ['SHIP_FROM'],
        street1: '450 Logistics Blvd',
        city: 'Joliet',
        state: 'IL',
        zip: '60431',
        country: 'United States',
        phone: '+1 (815) 555-0220',
        isDefaultRemitTo: false,
        changeOrdersPermitted: true,
        autoAcknowledge: true,
        supportedCurrencies: ['USD'],
        docFileName: 'Joliet_Defense_DC_Utility_Proof.pdf',
        docFileSize: '1.2 MB'
      }
    ],
    bankAccounts: [
      {
        id: 'bnk-svb-1',
        clientBankRefId: 'REF-DEFENSE-1109',
        country: 'United States',
        currency: 'USD',
        paymentMethod: 'WIRE',
        bankName: 'Silicon Valley Bank (Division of First Citizens)',
        bankBranch: 'Specialized Defense Commercial Center',
        swiftBic: 'SVBUS6SXXX',
        beneficiaryName: 'Acme Industrial Tech Inc. - Defense Division',
        routingNumber: '121140399',
        accountNumberMasked: '••••••••11090',
        accountNumberFull: '120948211090',
        linkedLocationId: 'loc-austin-1',
        linkedLocationName: 'Austin Corporate Headquarters & Lab',
        isDefault: true,
        verifiedWithDoc: true,
        docFileName: 'SVB_Defense_Escrow_Attestation.pdf'
      }
    ],
    commercialSettings: {
      matchingType: '3-Way Match',
      baselineTriggerDate: 'Inspection & Acceptance Date',
      paymentTerms: 'Net 45 Standard',
      billingScheduleStructure: 'MILESTONE_BASED',
      milestoneBillingProtocol: '20% Design Approval, 50% Component Acceptance, 30% Flight Qualification',
      primaryCurrency: 'USD',
      disbursementMethod: 'Wire Transfer',
      ingestionChannel: 'EDI 810 Direct Invoicing',
      eInvoicingFramework: 'ANSI X12 / Defense S2P',
      eInvoicingEndpointId: 'DUNS:098421928:AERO',
      incoTerms: 'DDP - Delivered Duty Paid',
      namedDeliveryPlace: 'NovaTech Cape Canaveral Receiving Dock 4',
      earlyPaymentDiscount: false,
      maxDiscountTolerance: 0.0,
      accelerationWindow: 'Standard (Net 45)',
      relationshipType: 'Defense Precision Supplier (AS9100)',
      supplierRiskType: 'LOW',
      businessCriticality: 'CRITICAL'
    },
    certificates: [
      {
        id: 'cert-as9100-1',
        category: 'PROFESSIONAL',
        certType: 'AS9100',
        certTypeName: 'AS9100 Rev D Aerospace Quality Certification',
        issuingAuthority: 'SAI Global Assurance',
        effectiveDate: '2025-04-01',
        expiryDate: '2028-03-31',
        status: 'ACTIVE',
        fileName: 'SAI_AS9100_RevD_Certified.pdf',
        ocrConfidence: 99.6
      },
      {
        id: 'cert-itar-2',
        category: 'PROFESSIONAL',
        certType: 'ITAR',
        certTypeName: 'ITAR DDTC Export Registration Letter M-39218',
        issuingAuthority: 'U.S. Department of State (DDTC)',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'ACTIVE',
        fileName: 'DDTC_ITAR_Registration_M39218.pdf',
        ocrConfidence: 99.8
      },
      {
        id: 'cert-cmmc-3',
        category: 'PROFESSIONAL',
        certType: 'CMMC',
        certTypeName: 'NIST SP 800-171 / CMMC Level 2 Attestation',
        issuingAuthority: 'CyberAB Authorized C3PAO',
        effectiveDate: '2025-08-15',
        expiryDate: '2027-08-14',
        status: 'ACTIVE',
        fileName: 'CMMC_Level2_Cybersecurity_Audit.pdf',
        ocrConfidence: 99.2
      },
      {
        id: 'cert-av-4',
        category: 'PROFESSIONAL',
        certType: 'COI_AVIATION',
        certTypeName: 'ACORD 25 Aviation Product Liability ($10M)',
        issuingAuthority: 'Global Aerospace Underwriters',
        effectiveDate: '2026-01-01',
        expiryDate: '2026-12-31',
        status: 'ACTIVE',
        fileName: 'Global_Aerospace_ACORD25_10M.pdf',
        ocrConfidence: 99.5
      }
    ],
    isSubmitted: false,
    isEditing: false
  },
  'inv-meridian-03': {
    partnerStatus: 'ACTIVE',
    supplierManager: 'Alvin Thompson (Director of Supply Chain Risk & Governance)',
    subcategories: [
      '42181500 - Clinical Diagnostic & Laboratory Analyzers',
      '41112400 - Biomedical Telemetry Sensors & Hardware',
      '42295400 - Cold-Chain Pharmaceutical Transit Loggers'
    ],
    serviceLocations: [
      'Americas (US, CA)',
      'Europe (UK, DE, CH)'
    ],
    descriptionOfServices: 'ISO 13485 certified healthcare technology manufacturer producing hospital lab diagnostic automation, patient telemetry sensor modules, and temperature-monitored cold-chain hardware with full FDA 21 CFR Part 11 electronic records validation.',
    businessUnits: [
      'Clinical Diagnostics Automation',
      'Biomedical Sensing Solutions',
      'Hospital Cold-Chain Logistics'
    ],
    contacts: [
      {
        id: 'cnt-mr-1',
        firstName: 'David',
        lastName: 'Miller',
        email: 'dmiller@acmeindustrial.com',
        phone: '+1 (512) 555-0177',
        isPrimary: true,
        status: 'REGISTERED',
        role: 'COMPLIANCE',
        orgEntity: 'Risk, Clinical Quality & HIPAA Privacy',
        serviceLocation: 'Global'
      },
      {
        id: 'cnt-mr-2',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena@acmeindustrial.com',
        phone: '+1 (512) 555-0199',
        isPrimary: false,
        status: 'REGISTERED',
        role: 'ACCOUNTS_PAYABLE',
        orgEntity: 'Healthcare AP & Disbursements',
        serviceLocation: 'Americas'
      },
      {
        id: 'cnt-mr-3',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'schen@acmeindustrial.com',
        phone: '+1 (512) 555-0188',
        isPrimary: false,
        status: 'REGISTERED',
        role: 'LEGAL',
        orgEntity: 'Healthcare Regulatory & Contracts',
        serviceLocation: 'Americas'
      }
    ],
    locations: [
      {
        id: 'loc-austin-1',
        name: 'Austin Corporate Headquarters & Lab',
        code: 'LOC-1011',
        types: ['HQ', 'ORDERING'],
        street1: '100 Industrial Parkway',
        street2: 'Suite 400',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'United States',
        phone: '+1 (512) 555-0100',
        isDefaultRemitTo: false,
        changeOrdersPermitted: true,
        autoAcknowledge: true,
        supportedCurrencies: ['USD']
      },
      {
        id: 'loc-joliet-2',
        name: 'Joliet Fulfillment & Logistics DC',
        code: 'LOC-2044',
        types: ['SHIP_FROM', 'REMIT_TO', 'INVOICING'],
        street1: '450 Logistics Blvd',
        city: 'Joliet',
        state: 'IL',
        zip: '60431',
        country: 'United States',
        phone: '+1 (815) 555-0220',
        isDefaultRemitTo: true,
        changeOrdersPermitted: true,
        autoAcknowledge: true,
        supportedCurrencies: ['USD']
      }
    ],
    bankAccounts: [
      {
        id: 'bnk-chase-med-1',
        clientBankRefId: 'REF-MED-4921',
        country: 'United States',
        currency: 'USD',
        paymentMethod: 'ACH_CREDIT',
        bankName: 'JPMorgan Chase Bank, N.A.',
        bankBranch: 'Healthcare & Life Sciences Commercial Banking',
        swiftBic: 'CHASUS33XXX',
        beneficiaryName: 'Acme Industrial Tech Inc. - Biomedical Systems',
        routingNumber: '021000021',
        accountNumberMasked: '••••••••49210',
        accountNumberFull: '392018449210',
        linkedLocationId: 'loc-joliet-2',
        linkedLocationName: 'Joliet Fulfillment & Logistics DC',
        isDefault: true,
        verifiedWithDoc: true,
        docFileName: 'Chase_Healthcare_Settlement_Letter.pdf'
      }
    ],
    commercialSettings: {
      matchingType: '3-Way Match',
      baselineTriggerDate: 'Hospital Intake & Validation Date',
      paymentTerms: 'Net 30 Days',
      billingScheduleStructure: 'STANDARD_PO',
      milestoneBillingProtocol: 'Standard Healthcare PO Invoicing',
      primaryCurrency: 'USD',
      disbursementMethod: 'ACH / Direct Deposit',
      ingestionChannel: 'GHX Healthcare Exchange EDI',
      eInvoicingFramework: 'GHX Medical Network v4.2',
      eInvoicingEndpointId: 'GHX:841294812:MED',
      incoTerms: 'CIP - Carriage and Insurance Paid',
      namedDeliveryPlace: 'Meridian Central Medical Distribution, Chicago',
      earlyPaymentDiscount: false,
      maxDiscountTolerance: 0.0,
      accelerationWindow: 'Standard Net 30',
      relationshipType: 'Clinical Preferred Supplier',
      supplierRiskType: 'LOW',
      businessCriticality: 'CRITICAL'
    },
    certificates: [
      {
        id: 'cert-iso13485-1',
        category: 'PROFESSIONAL',
        certType: 'ISO_13485',
        certTypeName: 'ISO 13485:2016 Medical Devices Quality Management',
        issuingAuthority: 'TÜV SÜD America',
        effectiveDate: '2025-03-01',
        expiryDate: '2028-02-28',
        status: 'ACTIVE',
        fileName: 'TUV_SUD_ISO13485_Medical_Certified.pdf',
        ocrConfidence: 99.7
      },
      {
        id: 'cert-fda21-2',
        category: 'PROFESSIONAL',
        certType: 'FDA_21CFR11',
        certTypeName: 'FDA 21 CFR Part 11 Electronic Records Validation',
        issuingAuthority: 'Validated Quality Systems Consulting',
        effectiveDate: '2025-06-10',
        expiryDate: '2027-06-09',
        status: 'ACTIVE',
        fileName: 'FDA_21CFR11_Electronic_Signatures_Audit.pdf',
        ocrConfidence: 99.4
      },
      {
        id: 'cert-hipaa-3',
        category: 'PROFESSIONAL',
        certType: 'HIPAA',
        certTypeName: 'HIPAA Security & Data Privacy Compliance Audit',
        issuingAuthority: 'KPMG Healthcare Assurance Practice',
        effectiveDate: '2025-11-20',
        expiryDate: '2026-11-19',
        status: 'ACTIVE',
        fileName: 'KPMG_HIPAA_HITECH_Compliance_Attestation.pdf',
        ocrConfidence: 99.1
      },
      {
        id: 'cert-medcoi-4',
        category: 'PROFESSIONAL',
        certType: 'COI_HEALTH',
        certTypeName: 'ACORD 25 Healthcare Commercial Liability ($5M)',
        issuingAuthority: 'Travelers Healthcare Casualty',
        effectiveDate: '2026-01-01',
        expiryDate: '2026-12-31',
        status: 'ACTIVE',
        fileName: 'Travelers_Healthcare_ACORD25_5M.pdf',
        ocrConfidence: 99.3
      }
    ],
    isSubmitted: true,
    isEditing: false,
    submittedAt: 'Nov 4, 2026 at 17:44'
  }
};

interface StepItem {
  num: number;
  id: string;
  title: string;
  shortLabel?: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AVAILABLE_SUBCATEGORIES = [
  '41111900 - Industrial Sensors & Transducers',
  '43222600 - Network and Telemetry Equipment',
  '43232800 - Embedded System Software / Firmware',
  '25191500 - Aerospace Avionics & Flight Control Sensors',
  '43222600 - Radiation-Tolerant Telemetry Systems',
  '41111900 - High-Tolerance Micro-Transducers',
  '42181500 - Clinical Diagnostic & Laboratory Analyzers',
  '41112400 - Biomedical Telemetry Sensors & Hardware',
  '42295400 - Cold-Chain Pharmaceutical Transit Loggers',
  '25191500 - Aerospace Systems & Components',
  '39121000 - Electrical Distribution Equipment',
  '43211500 - Computers & Enterprise Servers',
  '43201400 - Semiconductor Devices & ICs',
  '32151600 - Solar & Renewable Energy Systems',
  '46181500 - Safety & Mil-Spec Protective Gear',
  '81101500 - Civil & Mechanical Engineering Services',
  '81111800 - System Architecture & Cloud Infrastructure',
  '23151500 - Heavy Industrial Machinery & Tooling',
  '43212000 - Data Storage & SAN Hardware',
  '72101500 - Industrial Plant Maintenance & Operations'
];

export const AVAILABLE_BUSINESS_UNITS = [
  'Industrial & Discrete Manufacturing',
  'Defense & Aerospace Systems',
  'Enterprise IT & Telemetry Infrastructure',
  'Global Supply Chain & Freight Logistics',
  'Energy, Utilities & Renewable Power',
  'Commercial Hardware & Microelectronics',
  'Corporate Shared Services & Facilities',
  'Healthcare & Biomedical Technologies',
  'Research & Advanced Engineering Labs'
];

export const AVAILABLE_SERVICE_LOCATIONS = [
  'Americas (US, CA, MX)',
  'Europe (UK, DE, FR)',
  'Asia-Pacific (SG, JP, AU)',
  'Middle East & North Africa (MENA)',
  'Latin America (LATAM - BR, AR, CL)',
  'Nordics & Baltic Region (SE, NO, FI, DK)',
  'Eastern Europe & DACH (AT, CH, PL)',
  'Japan & South Korea (JP, KR)',
  'India & South Asia (IN, LK, BD)',
  'Global Delivery (Worldwide Scope)'
];

export const AVAILABLE_LANGUAGES = [
  'English',
  'German',
  'Spanish',
  'French',
  'Japanese',
  'Mandarin',
  'Portuguese',
  'Italian',
  'Arabic',
  'Hindi',
  'Korean',
  'Dutch'
];

export const AVAILABLE_SUPPLIER_MANAGERS = [
  { value: 'Sarah Jenkins (Senior Category Manager - Cloud & IT)', label: 'Sarah Jenkins (Senior Category Manager - Cloud & IT)' },
  { value: 'David Miller (Procurement Director - Electronics & Defense)', label: 'David Miller (Procurement Director - Electronics & Defense)' },
  { value: 'Marcus Vance (Global S2P Supplier Manager)', label: 'Marcus Vance (Global S2P Supplier Manager)' },
  { value: 'Elena Rostova (Strategic Sourcing Lead)', label: 'Elena Rostova (Strategic Sourcing Lead)' },
  { value: 'Alvin Thompson (Director of Supply Chain Risk & Governance)', label: 'Alvin Thompson (Director of Supply Chain Risk & Governance)' }
];

export const getCurrencySymbol = (currencyStr: string): string => {
  const match = currencyStr.match(/\(([^)]+)\)/);
  if (match) return match[1];
  if (currencyStr.includes('EUR')) return '€';
  if (currencyStr.includes('GBP')) return '£';
  if (currencyStr.includes('JPY') || currencyStr.includes('CNY')) return '¥';
  if (currencyStr.includes('INR')) return '₹';
  return '$';
};

export const AVAILABLE_CURRENCIES = [
  'USD ($) - US Dollar',
  'EUR (€) - Euro',
  'GBP (£) - British Pound',
  'CAD ($) - Canadian Dollar',
  'JPY (¥) - Japanese Yen',
  'AUD ($) - Australian Dollar',
  'CHF (Fr) - Swiss Franc',
  'SGD ($) - Singapore Dollar',
  'INR (₹) - Indian Rupee'
];

export const AVAILABLE_COUNTRIES = [
  'United States (US)',
  'Canada (CA)',
  'United Kingdom (GB)',
  'Germany (DE)',
  'Japan (JP)',
  'France (FR)',
  'Australia (AU)',
  'Singapore (SG)',
  'India (IN)',
  'Mexico (MX)',
  'Brazil (BR)',
  'Netherlands (NL)',
  'Switzerland (CH)',
  'Italy (IT)',
  'Spain (ES)',
  'South Korea (KR)',
  'Sweden (SE)',
  'Norway (NO)',
  'Denmark (DK)',
  'Finland (FI)',
  'Poland (PL)',
  'Ireland (IE)',
  'Belgium (BE)',
  'Austria (AT)',
  'United Arab Emirates (AE)',
  'Saudi Arabia (SA)',
  'New Zealand (NZ)',
  'Taiwan (TW)',
  'Israel (IL)',
  'South Africa (ZA)'
];

export type CopilotViewMode = 'DOCK' | 'FLOAT' | 'FULL' | 'MINIMIZE';

interface ToolExecution {
  toolName: string;
  label: string;
  status: 'RUNNING' | 'SUCCESS' | 'ERROR';
  details?: string;
  diff?: { field: string; before?: string; after: string }[];
}

interface ChatMessage {
  id: string;
  sender: 'QI' | 'USER';
  text: string;
  time: string;
  toolExecution?: ToolExecution;
  quickActions?: { id: string; label: string }[];
}

interface AiFilledBadgeProps {
  isAiFilled?: boolean;
  fieldName?: string;
  className?: string;
}

export const AiFilledBadge: React.FC<AiFilledBadgeProps> = () => {
  return null;
};

export const OnboardingRequest: React.FC = () => {
  const { navigate, routeState, selectedBuyerId, setSelectedBuyerId } = usePortal();
  const { currentUser } = useAuth();

  // Active Buyer Invitation Context & Multi-Buyer Support
  const [invitations] = useState<BuyerInvitation[]>([
    {
      id: 'inv-apex-01',
      buyerName: 'Apex Global Enterprises',
      buyerOrgId: 'buyer-org-1',
      invitationCode: 'INV-APEX-2026',
      category: 'Enterprise Cloud Infrastructure & Hardware',
      invitedBy: 'Marcus Vance, VP Strategic Procurement',
      invitedDate: 'Jan 14, 2026',
      status: 'IN_PROGRESS',
      stage: 'Stage 2: Form Submission',
      stageNum: 2
    },
    {
      id: 'inv-novatech-02',
      buyerName: 'NovaTech Aerospace & Defense',
      buyerOrgId: 'buyer-org-2',
      invitationCode: 'INV-NOVATECH-8820',
      category: 'Mission-Critical Aerospace Telemetry',
      invitedBy: 'Sarah Lin, S2P Vendor Operations',
      invitedDate: 'Yesterday',
      status: 'PENDING_INITIATION',
      stage: 'Stage 1: Registration Completed',
      stageNum: 1
    },
    {
      id: 'inv-meridian-03',
      buyerName: 'Meridian Health Network',
      buyerOrgId: 'buyer-org-3',
      invitationCode: 'INV-MERIDIAN-4011',
      category: 'Clinical Diagnostic & Lab Automation',
      invitedBy: 'David Chen, Global Procurement Lead',
      invitedDate: '3 days ago',
      status: 'IN_PROGRESS',
      stage: 'Stage 3: Buyer Approval',
      stageNum: 3
    }
  ]);
  const [activeInvitation, setActiveInvitation] = useState<BuyerInvitation>(invitations[0]);
  const [buyerDropdownOpen, setBuyerDropdownOpen] = useState(false);

  // View Mode: Defaults to 'DETAIL' since OnboardingRequestsList handles the list view
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('DETAIL');
  const [listFilter, setListFilter] = useState<'ALL' | 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'UNDER_REVIEW'>('ALL');
  const [listSearch, setListSearch] = useState('');

  // Multi-buyer submission and post-submit editing tracking
  const [submissionStates, setSubmissionStates] = useState<Record<string, { isSubmitted: boolean; isEditing: boolean; submittedAt?: string }>>({
    'inv-apex-01': { isSubmitted: false, isEditing: false },
    'inv-novatech-02': { isSubmitted: false, isEditing: false },
    'inv-meridian-03': { isSubmitted: true, isEditing: false, submittedAt: 'Nov 4, 2026 at 17:44' }
  });
  
  // Scoped onboarding data store per buyer
  const [buyerDataMap, setBuyerDataMap] = useState<Record<string, BuyerOnboardingPacket>>(INITIAL_BUYER_PACKETS);
  
  const currentSub = submissionStates[activeInvitation.id] || { isSubmitted: false, isEditing: false };
  const isSubmitted = currentSub.isSubmitted;
  const isEditingAfterSubmit = currentSub.isEditing;
  const submittedAt = currentSub.submittedAt;

  // Stepper state: Step 1 to Step 8 (GEP Quantum Benchmark)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeStageDetail, setActiveStageDetail] = useState<number | null>(null);

  // Left sidebar minimize / maximize state (ChatGPT-style collapse)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Top lifecycle journey banner expand / collapse state (saves 140px+ vertical form space)
  const [lifecycleExpanded, setLifecycleExpanded] = useState(false);

  // Form Editable vs. Read-Only Mode (Always editable during draft; read-only only post-submission)
  const isFormEditable = isSubmitted ? isEditingAfterSubmit : true;
  const isFormReadOnly = !isFormEditable;
  const [openAddTrigger, setOpenAddTrigger] = useState<number>(0);
  const [showSubmitToast, setShowSubmitToast] = useState(false);

  // Auto-dismiss submission confirmation toast and reset add trigger when moving between sections
  useEffect(() => {
    setOpenAddTrigger(0);
    if (showSubmitToast) {
      setShowSubmitToast(false);
    }
  }, [activeStep]);

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedState, setDraftSavedState] = useState(false);
  const [declarationError, setDeclarationError] = useState<string | null>(null);
  const [reviewViewMode, setReviewViewMode] = useState<'DOSSIER' | 'SUMMARY'>('DOSSIER');
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<{ count: number; sections: number; message: string } | null>(null);

  const handleSaveDraft = () => {
    setDraftSavedState(true);
    setTimeout(() => setDraftSavedState(false), 2500);
  };
  
  // Real-time UI highlight state
  const [highlightField, setHighlightField] = useState<string | null>(null);

  // Real-time Ava Agent action notification toast
  const [agentActionToast, setAgentActionToast] = useState<{ title: string; message: string } | null>(null);

  // AI-agent field provenance tracking (differentiates AI-agent filled fields from manual user input)
  const [aiFilledFields, setAiFilledFields] = useState<Record<string, boolean>>({
    legalName: true,
  });

  // Section 1: Basic Details (Corporate Legal Governance & Hierarchy - GEP Benchmark)
  const [legalName, setLegalName] = useState('Acme Industrial Tech Inc.');
  const [formerlyKnownAs, setFormerlyKnownAs] = useState('Acme Hardware & Sensors Corp');
  const [tradeName, setTradeName] = useState('Acme Tech Solutions');
  const [normalisedName, setNormalisedName] = useState('ACME INDUSTRIAL TECH INC');
  const [origination] = useState('Verisource');
  const [partnerStatus, setPartnerStatus] = useState<'INVITED' | 'NOT_INVITED' | 'ACTIVE'>('INVITED');
  const [supplierManager, setSupplierManager] = useState('Sarah Jenkins (Senior Category Manager - Cloud & IT)');
  const [hasDuns, setHasDuns] = useState(true);
  const [dunsNumber, setDunsNumber] = useState('09-842-1928');
  const [subcategories, setSubcategories] = useState<string[]>([
    '41111900 - Industrial Sensors & Transducers',
    '43222600 - Network and Telemetry Equipment',
    '43232800 - Embedded System Software / Firmware'
  ]);
  const [serviceLocations, setServiceLocations] = useState<string[]>([
    'Americas (US, CA, MX)',
    'Europe (UK, DE, FR)',
    'Asia-Pacific (SG, JP, AU)'
  ]);

  // Section 2: Business Information (Operational & Financial Profile - GEP Benchmark)
  const [reportingCurrency, setReportingCurrency] = useState('USD ($) - US Dollar');
  const currentCurrencySymbol = getCurrencySymbol(reportingCurrency);
  const [annualRevenue, setAnnualRevenue] = useState('38.4');
  const [totalEmployees, setTotalEmployees] = useState('280');
  const [incorporationDate, setIncorporationDate] = useState('2016-12-04');
  const [registeredAddress, setRegisteredAddress] = useState('100 Industrial Parkway, Suite 400, Austin, TX 78701');
  const [country, setCountry] = useState('United States (US)');
  const [website, setWebsite] = useState('https://acmeindustrialtech.example.com');
  const [descriptionOfServices, setDescriptionOfServices] = useState('Leading provider of enterprise cloud compute nodes, specialized cybersecurity architecture, and high-tolerance industrial sensor hardware engineered for aerospace, defense, and high-volume commercial supply chains (AS9100 Rev D, ITAR compliant, CMMC Level 2).');
  const [businessUnits, setBusinessUnits] = useState<string[]>([
    'Industrial & Discrete Manufacturing',
    'Defense & Aerospace Systems',
    'Enterprise IT & Telemetry Infrastructure'
  ]);
  const [operatingLanguages, setOperatingLanguages] = useState<string[]>([
    'English',
    'German',
    'Spanish'
  ]);

  // Section 2: Identification Information Grid (GEP Section 2)
  const [identifications, setIdentifications] = useState<GepIdentificationItem[]>([
    {
      id: 'id-ein-1',
      country: 'United States',
      idType: 'EIN',
      idNumber: '84-1294812',
      isPrimary: true,
      verified: true,
      issuedDate: '2016-04-15',
      fileName: 'IRS_Form_W9_Signed_2026.pdf',
      fileSize: '1.4 MB',
      ocrConfidence: 99.8
    },
    {
      id: 'id-duns-2',
      country: 'United States',
      idType: 'DUNS Number',
      idNumber: '09-842-1928',
      isPrimary: false,
      verified: true,
      issuedDate: '2017-02-10',
      fileName: 'DnB_Universal_Identity_Extract.pdf',
      fileSize: '820 KB',
      ocrConfidence: 99.9
    },
    {
      id: 'id-vat-3',
      country: 'Germany',
      idType: 'EU VAT (USt-IdNr)',
      idNumber: 'DE319482910',
      isPrimary: false,
      verified: true,
      issuedDate: '2020-08-20',
      fileName: 'DE_USt_IdNr_Bescheinigung.pdf',
      fileSize: '1.1 MB',
      ocrConfidence: 99.2
    },
    {
      id: 'id-vat-4',
      country: 'United Kingdom',
      idType: 'UK VAT Number',
      idNumber: 'GB924810291',
      isPrimary: false,
      verified: true,
      issuedDate: '2021-01-14',
      fileName: 'HMRC_VAT_Registration_Certificate.pdf',
      fileSize: '950 KB',
      ocrConfidence: 99.5
    }
  ]);

  // Section 3: Contact Directory & Role Mapping (GEP Section 5)
  const [contacts, setContacts] = useState<GepContactItem[]>([
    {
      id: 'cnt-1',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena@acmeindustrial.com',
      phone: '+1 (512) 555-0199',
      isPrimary: true,
      status: 'REGISTERED',
      role: 'ACCOUNTS_PAYABLE',
      orgEntity: 'Corporate Headquarters',
      serviceLocation: 'Americas'
    },
    {
      id: 'cnt-2',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'm.vance@acmeindustrial.com',
      phone: '+1 (512) 555-0144',
      isPrimary: false,
      status: 'REGISTERED',
      role: 'OPERATIONS',
      orgEntity: 'Supply Chain Operations',
      serviceLocation: 'Americas & Europe'
    },
    {
      id: 'cnt-3',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'schen@acmeindustrial.com',
      phone: '+1 (512) 555-0188',
      isPrimary: false,
      status: 'REGISTERED',
      role: 'LEGAL',
      orgEntity: 'Corporate Legal & Contracts',
      serviceLocation: 'Global'
    },
    {
      id: 'cnt-4',
      firstName: 'David',
      lastName: 'Miller',
      email: 'dmiller@acmeindustrial.com',
      phone: '+1 (512) 555-0177',
      isPrimary: false,
      status: 'INVITED',
      role: 'COMPLIANCE',
      orgEntity: 'Risk, ESG & Safety',
      serviceLocation: 'Global'
    }
  ]);

  // Section 4: Location Architecture (GEP Section 6)
  const [locations, setLocations] = useState<GepLocationItem[]>([
    {
      id: 'loc-austin-1',
      name: 'Austin Corporate Headquarters & Lab',
      code: 'LOC-1011',
      types: ['HQ', 'ORDERING', 'REMIT_TO'],
      street1: '100 Industrial Parkway',
      street2: 'Suite 400',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'United States',
      phone: '+1 (512) 555-0100',
      isDefaultRemitTo: true,
      changeOrdersPermitted: true,
      autoAcknowledge: true,
      supportedCurrencies: ['USD', 'EUR']
    },
    {
      id: 'loc-joliet-2',
      name: 'Joliet Fulfillment & Logistics DC',
      code: 'LOC-2044',
      types: ['SHIP_FROM', 'INVOICING'],
      street1: '450 Logistics Blvd',
      city: 'Joliet',
      state: 'IL',
      zip: '60431',
      country: 'United States',
      phone: '+1 (815) 555-0220',
      isDefaultRemitTo: false,
      changeOrdersPermitted: true,
      autoAcknowledge: true,
      supportedCurrencies: ['USD']
    }
  ]);

  // Section 5: Banking Information (GEP Section 14)
  const [bankAccounts, setBankAccounts] = useState<GepBankItem[]>([
    {
      id: 'bnk-chase-1',
      clientBankRefId: 'REF-492100',
      country: 'United States',
      currency: 'USD',
      paymentMethod: 'ACH_CREDIT',
      bankName: 'JPMorgan Chase Bank, N.A.',
      bankBranch: 'Austin Commercial Banking Center',
      swiftBic: 'CHASUS33XXX',
      beneficiaryName: 'Acme Industrial Tech Inc.',
      routingNumber: '021000021',
      accountNumberMasked: '••••••••48210',
      accountNumberFull: '489201948210',
      linkedLocationId: 'loc-austin-1',
      linkedLocationName: 'Austin Corporate Headquarters & Lab',
      isDefault: true,
      verifiedWithDoc: true,
      docFileName: 'Chase_Bank_Remittance_Verification_Letter.pdf'
    }
  ]);

  // Legacy fallback states kept for backward compatibility with existing utility functions
  const [contactName, setContactName] = useState('Elena Rostova');
  const [contactEmail, setContactEmail] = useState('elena@acmeindustrial.com');
  const [contactPhone, setContactPhone] = useState('+1 (512) 555-0199');
  const [contactTitle, setContactTitle] = useState('Director of Enterprise Operations');
  const [taxId, setTaxId] = useState('84-1294812');
  const [taxEntityType, setTaxEntityType] = useState('Corporation');
  const [w9Uploaded, setW9Uploaded] = useState(true);
  const [w9FileName, setW9FileName] = useState('IRS_W9_Verified_2026.pdf');
  const [bankBeneficiary, setBankBeneficiary] = useState('Acme Industrial Tech Inc.');
  const [bankName, setBankName] = useState('JPMorgan Chase Bank, N.A.');
  const [bankRouting, setBankRouting] = useState('021000021');
  const [bankAccount, setBankAccount] = useState('489201948210');
  const [bankDocUploaded, setBankDocUploaded] = useState(true);
  const [bankDocFileName, setBankDocFileName] = useState('Chase_Voided_Check_Verification.pdf');
  const [insuranceCarrier, setInsuranceCarrier] = useState('Travelers Commercial Casualty');
  const [insuranceCoverage, setInsuranceCoverage] = useState('$5,000,000 Aggregate');
  const [hasIsoCert, setHasIsoCert] = useState(true);
  const [hasSoc2, setHasSoc2] = useState(true);
  const [esgPolicyAgreed, setEsgPolicyAgreed] = useState(true);

  // Section 6: Commercial & P2P Terms (GEP Sections 4, 11, 12, 13)
  const [commercialSettings, setCommercialSettings] = useState<GepCommercialSettings>({
    matchingType: '3-Way Match',
    baselineTriggerDate: 'Goods Receipt Date (GR Date)',
    paymentTerms: '2/10 Net 30',
    billingScheduleStructure: 'STANDARD_PO',
    milestoneBillingProtocol: '30% PO Acceptance, 40% Factory Testing, 30% Site Commissioning',
    primaryCurrency: 'USD',
    disbursementMethod: 'ACH / Direct Deposit',
    ingestionChannel: 'Supplier Portal Upload',
    eInvoicingFramework: 'PEPPOL Network',
    eInvoicingEndpointId: '0088:1234567890123',
    incoTerms: 'FCA - Free Carrier',
    namedDeliveryPlace: 'Austin Logistics Facility, TX',
    earlyPaymentDiscount: true,
    maxDiscountTolerance: 2.0,
    accelerationWindow: 'Day 10 (Fastest)',
    relationshipType: 'Strategic Tier-1 Supplier',
    supplierRiskType: 'LOW',
    businessCriticality: 'CRITICAL'
  });

  // Section 7: Diversity & Certificate Vault (GEP Sections 8 & 9)
  const [certificates, setCertificates] = useState<GepCertificateItem[]>([
    {
      id: 'cert-coi-1',
      category: 'PROFESSIONAL',
      certType: 'COI_GENERAL',
      certTypeName: 'ACORD 25 Certificate of Liability Insurance ($5M)',
      issuingAuthority: 'Travelers Commercial Casualty',
      effectiveDate: '2026-01-01',
      expiryDate: '2026-12-31',
      status: 'ACTIVE',
      fileName: 'Travelers_ACORD_25_COI_Verified.pdf',
      ocrConfidence: 99.4
    },
    {
      id: 'cert-iso-2',
      category: 'PROFESSIONAL',
      certType: 'ISO_27001',
      certTypeName: 'ISO/IEC 27001 Information Security Management',
      issuingAuthority: 'BSI Assurance UK',
      effectiveDate: '2025-06-15',
      expiryDate: '2028-06-14',
      status: 'ACTIVE',
      fileName: 'BSI_ISO27001_Audit_Attestation.pdf',
      ocrConfidence: 99.1
    },
    {
      id: 'cert-soc-3',
      category: 'PROFESSIONAL',
      certType: 'SOC_2',
      certTypeName: 'SOC 2 Type II Security & Confidentiality Report',
      issuingAuthority: 'Ernst & Young LLP',
      effectiveDate: '2025-11-01',
      expiryDate: '2026-10-31',
      status: 'ACTIVE',
      fileName: 'EY_SOC2_Type_II_Executive_Summary.pdf',
      ocrConfidence: 98.7
    },
    {
      id: 'cert-wbe-4',
      category: 'DIVERSITY',
      certType: 'WBE',
      certTypeName: 'Women-Owned Business Enterprise (WBE)',
      issuingAuthority: 'WBENC National Council',
      effectiveDate: '2025-03-01',
      expiryDate: '2027-02-28',
      status: 'ACTIVE',
      fileName: 'WBENC_WBE_Certified_Dossier.pdf',
      ocrConfidence: 99.0
    }
  ]);

  // Section 8: Review & Final Submit
  const [signatoryName, setSignatoryName] = useState('Elena Rostova');
  const [signatoryTitle, setSignatoryTitle] = useState('Vice President of Operations');
  const [declarationAccuracy, setDeclarationAccuracy] = useState(false);
  const [declarationExport, setDeclarationExport] = useState(false);
  const [declarationEthics, setDeclarationEthics] = useState(false);

  // Listen for Master Profile updates to keep universal corporate identity in instant sync
  useEffect(() => {
    const applyUniversalMasterProfile = () => {
      // Safeguard: Do not overwrite a locked/submitted application via background storage events
      if (isSubmitted && !isEditingAfterSubmit) return;
      try {
        const stored = localStorage.getItem('verisource_master_profile');
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.legalName) setLegalName(profile.legalName);
          if (profile.tradeName) setTradeName(profile.tradeName);
          if (profile.formerlyKnownAs) setFormerlyKnownAs(profile.formerlyKnownAs);
          if (profile.normalisedName) setNormalisedName(profile.normalisedName);
          if (profile.hasDuns !== undefined) setHasDuns(profile.hasDuns);
          if (profile.dunsNumber) setDunsNumber(profile.dunsNumber);
          if (profile.reportingCurrency) setReportingCurrency(profile.reportingCurrency);
          if (profile.annualRevenue) setAnnualRevenue(profile.annualRevenue);
          if (profile.totalEmployees) setTotalEmployees(profile.totalEmployees);
          if (profile.incorporationDate) setIncorporationDate(profile.incorporationDate);
          if (profile.registeredAddress || profile.hqAddress) setRegisteredAddress(profile.registeredAddress || profile.hqAddress);
          if (profile.country) setCountry(profile.country);
          if (profile.website) setWebsite(profile.website);
          if (profile.identifications && profile.identifications.length > 0) setIdentifications(profile.identifications);
          // Note: Buyer-scoped fields (supplierManager, subcategories, serviceLocations, bankAccounts, 
          // commercialSettings, certificates) are deliberately NOT auto-overwritten here to protect
          // buyer-specific requirements. They sync explicitly via the "Sync with Master Profile" modal.
        }
      } catch (e) {
        console.warn('Sync master profile error:', e);
      }
    };

    window.addEventListener('verisource_master_profile_updated', applyUniversalMasterProfile);
    window.addEventListener('storage', applyUniversalMasterProfile);
    return () => {
      window.removeEventListener('verisource_master_profile_updated', applyUniversalMasterProfile);
      window.removeEventListener('storage', applyUniversalMasterProfile);
    };
  }, [isSubmitted, isEditingAfterSubmit]);

  // =========================================================================
  // AGENT COPILOT STATE & PAGINATION (No page height blowout)
  // =========================================================================
  const [copilotViewMode, setCopilotViewMode] = useState<CopilotViewMode>('DOCK');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  // Draggable floating window coordinates & refs
  const [floatPos, setFloatPos] = useState<{ x: number; y: number }>(() => {
    const initX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 460) : 950;
    return { x: initX, y: 75 };
  });
  const floatPosRef = useRef(floatPos);
  floatPosRef.current = floatPos;

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0
  });

  // Draggable floating launcher coordinates (for MINIMIZE mode)
  const [launcherPos, setLauncherPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return { x: Math.max(20, window.innerWidth - 150), y: Math.max(80, window.innerHeight - 70) };
    }
    return { x: 950, y: 680 };
  });
  const launcherPosRef = useRef(launcherPos);
  launcherPosRef.current = launcherPos;

  const isDraggingLauncherRef = useRef(false);
  const launcherDragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; moved: boolean }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    moved: false
  });

  const handleLauncherMouseDown = (e: React.MouseEvent) => {
    isDraggingLauncherRef.current = true;
    launcherDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: launcherPos.x,
      startY: launcherPos.y,
      moved: false
    };
    document.body.style.userSelect = 'none';
  };

  const handleLauncherTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    isDraggingLauncherRef.current = true;
    launcherDragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      startX: launcherPos.x,
      startY: launcherPos.y,
      moved: false
    };
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (copilotViewMode !== 'FLOAT') return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea') || target.closest('.no-drag')) {
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: floatPosRef.current.x,
      startY: floatPosRef.current.y
    };
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Float window dragging
      if (isDraggingRef.current) {
        const dx = e.clientX - dragStartRef.current.mouseX;
        const dy = e.clientY - dragStartRef.current.mouseY;

        const minX = 10;
        const maxX = Math.max(minX, window.innerWidth - 320);
        const minY = 10;
        const maxY = Math.max(minY, window.innerHeight - 80);

        const nextX = Math.min(Math.max(dragStartRef.current.startX + dx, minX), maxX);
        const nextY = Math.min(Math.max(dragStartRef.current.startY + dy, minY), maxY);

        floatPosRef.current = { x: nextX, y: nextY };
        setFloatPos({ x: nextX, y: nextY });
      }

      // 2. Launcher button dragging
      if (isDraggingLauncherRef.current) {
        const dx = e.clientX - launcherDragStartRef.current.mouseX;
        const dy = e.clientY - launcherDragStartRef.current.mouseY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          launcherDragStartRef.current.moved = true;
        }

        const minX = 10;
        const maxX = Math.max(minX, window.innerWidth - 140);
        const minY = 65;
        const maxY = Math.max(minY, window.innerHeight - 50);

        const nextX = Math.min(Math.max(launcherDragStartRef.current.startX + dx, minX), maxX);
        const nextY = Math.min(Math.max(launcherDragStartRef.current.startY + dy, minY), maxY);

        launcherPosRef.current = { x: nextX, y: nextY };
        setLauncherPos({ x: nextX, y: nextY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingLauncherRef.current) {
        const touch = e.touches[0];
        const dx = touch.clientX - launcherDragStartRef.current.mouseX;
        const dy = touch.clientY - launcherDragStartRef.current.mouseY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          launcherDragStartRef.current.moved = true;
        }

        const minX = 10;
        const maxX = Math.max(minX, window.innerWidth - 140);
        const minY = 65;
        const maxY = Math.max(minY, window.innerHeight - 50);

        const nextX = Math.min(Math.max(launcherDragStartRef.current.startX + dx, minX), maxX);
        const nextY = Math.min(Math.max(launcherDragStartRef.current.startY + dy, minY), maxY);

        launcherPosRef.current = { x: nextX, y: nextY };
        setLauncherPos({ x: nextX, y: nextY });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.userSelect = '';
      }
      if (isDraggingLauncherRef.current) {
        isDraggingLauncherRef.current = false;
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, []);

  // Listen for header AI Copilot trigger to expand or toggle Ava on onboarding
  useEffect(() => {
    const handleToggleAva = () => {
      setCopilotViewMode(prev => prev === 'MINIMIZE' ? 'DOCK' : 'MINIMIZE');
    };
    window.addEventListener('verisource:toggle-ava', handleToggleAva);
    return () => window.removeEventListener('verisource:toggle-ava', handleToggleAva);
  }, []);

  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat session interface & helper for fresh, buyer-scoped greetings
  const createGreetingMessage = (buyerName: string): ChatMessage => ({
    id: 'ava-welcome-' + Date.now(),
    sender: 'QI',
    text: `Hi! I'm **Ava**, your Onboarding Agent for **${buyerName}**.\n\nHow can I help you today? You can ask me to fill fields, check compliance, or choose an option below:`,
    time: 'Just now',
    quickActions: [
      { id: 'AUTO_FILL', label: 'Want to update profile?' },
      { id: 'UPLOAD_DOC', label: 'Start with an attachment' },
      { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
    ]
  });

  // Short, clean greeting message with dynamic suggested prompts
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    createGreetingMessage(invitations[0].buyerName)
  ]);

  // Chat History Management (Past sessions with timestamp and restore capability)
  interface ChatSession {
    id: string;
    title: string;
    timestamp: string;
    buyerName: string;
    messages: ChatMessage[];
  }

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 'session-archived-1',
      title: 'DUNS and Entity Identity Verification',
      timestamp: 'Today, 17:15',
      buyerName: 'Apex Global Enterprises',
      messages: [
        {
          id: 'msg-arch-1',
          sender: 'QI',
          text: "Hi! I'm **Ava**, your Onboarding Agent for **Apex Global Enterprises**.\n\nHow can I help you today?",
          time: '17:15'
        },
        {
          id: 'msg-arch-2',
          sender: 'USER',
          text: 'Can you check my DUNS number validation?',
          time: '17:16'
        },
        {
          id: 'msg-arch-3',
          sender: 'QI',
          text: 'DUNS `09-842-1928` is 100% matched with D&B registry for Acme Industrial Tech Inc.',
          time: '17:16'
        }
      ]
    }
  ]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close View dropdown and History popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setIsViewMenuOpen(false);
      }
      if (historyMenuRef.current && !historyMenuRef.current.contains(e.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll chat internally within its container (never scroll outer page/window)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      const t = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [chatMessages, isAgentThinking]);

  // Check section completion (9 GEP Quantum Modules)
  const isStep1Done = Boolean(legalName && (!hasDuns || dunsNumber) && partnerStatus && supplierManager);
  const isStep2Done = Boolean(annualRevenue && totalEmployees && country && registeredAddress && reportingCurrency);
  const isStep3Done = identifications.length > 0;
  const isStep4Done = contacts.length > 0;
  const isStep5Done = locations.length > 0;
  const isStep6Done = bankAccounts.length > 0;
  const isStep7Done = Boolean(commercialSettings.matchingType && commercialSettings.paymentTerms);
  const isStep8Done = certificates.length > 0;
  const allDeclarationsAgreed = true;
  const isSubmitReady = true;
  const isStep9Done = Boolean(isSubmitted);

  const completedStepsCount = [
    isStep1Done, 
    isStep2Done, 
    isStep3Done, 
    isStep4Done, 
    isStep5Done, 
    isStep6Done, 
    isStep7Done, 
    isStep8Done,
    isStep9Done
  ].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 9) * 100);

  // Broadcast live detailed questionnaire context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'onboarding-detail',
      activeMode: 'DETAIL',
      isDetail: true,
      buyerName: activeInvitation?.buyerName,
      buyerOrgId: activeInvitation?.buyerOrgId,
      invitationCode: activeInvitation?.invitationCode,
      program: activeInvitation?.category,
      progressPercent,
      completedStepsCount,
      activeStep: activeStep || 1,
      isSubmitted: currentSub.isSubmitted,
      // Section 1: Basic Details
      legalName,
      tradeName,
      formerlyKnownAs,
      normalisedName,
      origination,
      partnerStatus,
      supplierManager,
      hasDuns,
      dunsNumber,
      subcategories,
      serviceLocations,
      // Section 2: Business Info
      reportingCurrency,
      annualRevenue,
      totalEmployees,
      incorporationDate,
      registeredAddress,
      country,
      website,
      descriptionOfServices,
      businessUnits,
      // Contacts & Locations
      contactsCount: contacts.length,
      contacts: contacts.map(c => ({ name: `${c.firstName} ${c.lastName}`, role: c.role, email: c.email, phone: c.phone })),
      locationsCount: locations.length,
      locations: locations.map(l => ({ name: l.name, types: l.types, address: `${l.street1}, ${l.city}, ${l.state} ${l.zip}` })),
      bankAccountsCount: bankAccounts.length,
      bankAccounts: bankAccounts.map(b => ({ bankName: b.bankName, masked: b.accountNumberMasked, routing: b.routingNumber })),
      commercialSettings: {
        paymentTerms: commercialSettings.paymentTerms,
        matchingType: commercialSettings.matchingType,
        primaryCurrency: commercialSettings.primaryCurrency
      },
      certificatesCount: certificates.length,
      certificates: certificates.map(c => ({ name: c.certTypeName, authority: c.issuingAuthority, expiry: c.expiryDate, status: c.status }))
    });
  }, [
    activeInvitation,
    progressPercent,
    completedStepsCount,
    activeStep,
    currentSub,
    legalName,
    tradeName,
    formerlyKnownAs,
    normalisedName,
    partnerStatus,
    supplierManager,
    hasDuns,
    dunsNumber,
    subcategories,
    serviceLocations,
    reportingCurrency,
    annualRevenue,
    totalEmployees,
    incorporationDate,
    registeredAddress,
    country,
    website,
    descriptionOfServices,
    contacts,
    locations,
    bankAccounts,
    commercialSettings,
    certificates
  ]);

  // Clean, concise section definitions (GEP Quantum Benchmark - 9 Dedicated Modules)
  const steps: StepItem[] = [
    {
      num: 1,
      id: 'basic-details',
      title: 'Basic Details',
      shortLabel: 'Basic Details',
      icon: Building2
    },
    {
      num: 2,
      id: 'business-information',
      title: 'Business Information',
      shortLabel: 'Business Info',
      icon: Briefcase
    },
    {
      num: 3,
      id: 'identification-information',
      title: 'Identification Information',
      shortLabel: 'Tax & IDs',
      icon: FileText
    },
    {
      num: 4,
      id: 'contact-information',
      title: 'Contact Information',
      shortLabel: 'Contacts',
      icon: Users
    },
    {
      num: 5,
      id: 'location',
      title: 'Location',
      shortLabel: 'Locations',
      icon: MapPin
    },
    {
      num: 6,
      id: 'banking-information',
      title: 'Banking Information',
      shortLabel: 'Banking',
      icon: CreditCard
    },
    {
      num: 7,
      id: 'payment-terms',
      title: 'Payment Terms',
      shortLabel: 'Payment Terms',
      icon: Layers
    },
    {
      num: 8,
      id: 'diversity-certificates',
      title: 'Diversity & Certificates',
      shortLabel: 'Diversity & Certs',
      icon: Award
    },
    {
      num: 9,
      id: 'review-submit',
      title: 'Review & Submit',
      shortLabel: 'Review & Submit',
      icon: CheckCircle2
    }
  ];

  // 4 Milestone Phase Groupings (Enterprise UX Benchmark: GEP & Ariba SLP)
  const phases = [
    {
      id: 'identity-tax',
      title: 'Identity & Tax',
      stepNums: [1, 2, 3]
    },
    {
      id: 'operations-logistics',
      title: 'Operations & Logistics',
      stepNums: [4, 5]
    },
    {
      id: 'settlement-terms',
      title: 'Settlement & Terms',
      stepNums: [6, 7]
    },
    {
      id: 'compliance-signoff',
      title: 'Compliance & Sign-Off',
      stepNums: [8, 9]
    }
  ];

  const getStepStatus = (stepNum: number) => {
    if (stepNum === 1) return isStep1Done ? 'COMPLETED' : activeStep === 1 ? 'CURRENT' : 'PENDING';
    if (stepNum === 2) return isStep2Done ? 'COMPLETED' : activeStep === 2 ? 'CURRENT' : 'PENDING';
    if (stepNum === 3) return isStep3Done ? 'COMPLETED' : activeStep === 3 ? 'CURRENT' : 'PENDING';
    if (stepNum === 4) return isStep4Done ? 'COMPLETED' : activeStep === 4 ? 'CURRENT' : 'PENDING';
    if (stepNum === 5) return isStep5Done ? 'COMPLETED' : activeStep === 5 ? 'CURRENT' : 'PENDING';
    if (stepNum === 6) return isStep6Done ? 'COMPLETED' : activeStep === 6 ? 'CURRENT' : 'PENDING';
    if (stepNum === 7) return isStep7Done ? 'COMPLETED' : activeStep === 7 ? 'CURRENT' : 'PENDING';
    if (stepNum === 8) return isStep8Done ? 'COMPLETED' : activeStep === 8 ? 'CURRENT' : 'PENDING';
    if (stepNum === 9) return isStep9Done ? 'COMPLETED' : activeStep === 9 ? 'CURRENT' : 'PENDING';
    return 'PENDING';
  };

  // Dynamic step record count for inline title display
  const getStepRecordCount = (stepNum: number): number | null => {
    switch (stepNum) {
      case 3:
        return identifications.length;
      case 4:
        return contacts.length;
      case 5:
        return locations.length;
      case 6:
        return bankAccounts.length;
      case 8:
        return certificates.length;
      default:
        return null;
    }
  };

  // Check if active step is an item grid that supports adding records
  const isGridStep = (stepNum: number): boolean => {
    return [3, 4, 5, 6, 8].includes(stepNum);
  };

  // Dynamic step add button tooltip for header action zone
  const getStepAddTooltip = (stepNum: number): string | null => {
    switch (stepNum) {
      case 3:
        return 'Add identification record';
      case 4:
        return 'Add contact person';
      case 5:
        return 'Add operating location';
      case 6:
        return 'Add bank account';
      case 8:
        return 'Add certificate';
      default:
        return null;
    }
  };

  // Helper to trigger temporary UI pulse highlight on updated field
  const triggerFieldPulse = (fieldName: string) => {
    setHighlightField(fieldName);
    setTimeout(() => {
      setHighlightField(null);
    }, 3200);
  };

  // =========================================================================
  // REAL-TIME AGENTIC TOOL EXECUTIONS & MASTER PROFILE SYNC PIPELINE
  // =========================================================================

  // Tool 1: Universal Master Profile Multi-Buyer Sync Engine
  const handleApplyMasterSync = ({
    strategy,
    selectedSections,
    unlockRevision
  }: {
    strategy: SyncStrategy;
    selectedSections: number[];
    unlockRevision: boolean;
  }) => {
    // 1. If currently in submitted read-only mode, seamlessly unlock revision mode
    if (unlockRevision || (isSubmitted && !isEditingAfterSubmit)) {
      handleStartEditing();
    }

    setIsAgentThinking(true);

    setTimeout(() => {
      setIsAgentThinking(false);

      // Attempt to load from shared Master Public Profile in localStorage
      let masterProfile: any = null;
      try {
        const stored = localStorage.getItem('verisource_master_profile');
        if (stored) {
          masterProfile = JSON.parse(stored);
        }
      } catch (err) {
        console.warn('Failed to parse master profile from localStorage:', err);
      }

      let syncedFieldCount = 0;
      const isSmartMerge = strategy === 'SMART_MERGE';

      // SECTION 1: Basic Details & Corporate Governance
      if (selectedSections.includes(1)) {
        if (!isSmartMerge || !legalName) {
          setLegalName(masterProfile?.legalName || 'Acme Industrial Tech Inc.');
          setAiFilledFields(prev => ({ ...prev, legalName: true }));
          syncedFieldCount++;
        }
        if (!isSmartMerge || !tradeName) {
          setTradeName(masterProfile?.tradeName || 'Acme Tech Solutions');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !formerlyKnownAs) {
          setFormerlyKnownAs(masterProfile?.formerlyKnownAs || 'Acme Hardware & Sensors Corp');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !normalisedName) {
          setNormalisedName(masterProfile?.normalisedName || 'ACME INDUSTRIAL TECH INC');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !dunsNumber) {
          setHasDuns(masterProfile?.hasDuns !== undefined ? masterProfile.hasDuns : true);
          setDunsNumber(masterProfile?.dunsNumber || '09-842-1928');
          syncedFieldCount += 2;
        }
        if (!isSmartMerge || subcategories.length === 0) {
          setSubcategories(masterProfile?.subcategories || [
            '41111900 - Industrial Sensors & Transducers',
            '43222600 - Network and Telemetry Equipment',
            '43232800 - Embedded System Software / Firmware'
          ]);
          syncedFieldCount++;
        }
        if (!isSmartMerge || serviceLocations.length === 0) {
          setServiceLocations(masterProfile?.serviceLocations || [
            'Americas (US, CA, MX)',
            'Europe (UK, DE, FR)',
            'Asia-Pacific (SG, JP, AU)'
          ]);
          syncedFieldCount++;
        }
        // Protect buyer-scoped supplierManager & partnerStatus unless explicitly forced
      }

      // SECTION 2: Business Info & Financials
      if (selectedSections.includes(2)) {
        if (!isSmartMerge || !reportingCurrency) {
          setReportingCurrency(masterProfile?.reportingCurrency || 'USD ($) - US Dollar');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !annualRevenue) {
          setAnnualRevenue(masterProfile?.annualRevenue || '38.4');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !totalEmployees) {
          setTotalEmployees(masterProfile?.totalEmployees || '280');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !incorporationDate) {
          setIncorporationDate(masterProfile?.incorporationDate || '2016-04-12');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !registeredAddress) {
          setRegisteredAddress(masterProfile?.registeredAddress || masterProfile?.hqAddress || '100 Industrial Parkway, Suite 400, Austin, TX 78701');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !country) {
          setCountry(masterProfile?.country || 'United States (US)');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !website) {
          setWebsite(masterProfile?.website || 'https://acmeindustrialtech.example.com');
          syncedFieldCount++;
        }
        if (!isSmartMerge || !descriptionOfServices) {
          setDescriptionOfServices(masterProfile?.description || 'Leading provider of enterprise cloud compute nodes, specialized cybersecurity architecture, and high-tolerance industrial sensor hardware engineered for aerospace, defense, and high-volume commercial supply chains (AS9100 Rev D, ITAR compliant, CMMC Level 2).');
          syncedFieldCount++;
        }
        if (!isSmartMerge || operatingLanguages.length === 0) {
          setOperatingLanguages(masterProfile?.operatingLanguages || ['English', 'German', 'Spanish']);
          syncedFieldCount++;
        }
        if (!isSmartMerge || businessUnits.length === 0) {
          if (masterProfile?.businessUnits && masterProfile.businessUnits.length > 0) {
            setBusinessUnits(masterProfile.businessUnits);
            syncedFieldCount++;
          }
        }
      }

      // SECTION 3: Statutory Tax & Identifications
      if (selectedSections.includes(3)) {
        if (masterProfile?.identifications && masterProfile.identifications.length > 0) {
          setIdentifications(masterProfile.identifications);
          syncedFieldCount += masterProfile.identifications.length;
        } else {
          setIdentifications([
            { id: 'id-ein-1', country: 'United States', idType: 'EIN', idNumber: '84-1294812', isPrimary: true, verified: true, issuedDate: '2016-04-15' },
            { id: 'id-duns-2', country: 'United States', idType: 'DUNS Number', idNumber: '09-842-1928', isPrimary: false, verified: true, issuedDate: '2017-02-10' },
            { id: 'id-vat-3', country: 'Germany', idType: 'EU VAT (USt-IdNr)', idNumber: 'DE319482910', isPrimary: false, verified: true, issuedDate: '2020-08-20' },
            { id: 'id-vat-4', country: 'United Kingdom', idType: 'UK VAT Number', idNumber: 'GB924810291', isPrimary: false, verified: true, issuedDate: '2021-01-14' }
          ]);
          syncedFieldCount += 4;
        }
        setTaxId('84-1294812');
        setTaxEntityType('Corporation');
        setW9Uploaded(true);
        setW9FileName('IRS_W9_Verified_2026.pdf');
      }

      // SECTION 4: Contact Directory & Role Matrix
      if (selectedSections.includes(4)) {
        if (masterProfile?.gepContacts && masterProfile.gepContacts.length > 0) {
          setContacts(masterProfile.gepContacts);
          syncedFieldCount += masterProfile.gepContacts.length;
        } else {
          setContacts([
            { id: 'cnt-1', firstName: 'Elena', lastName: 'Rostova', email: currentUser?.email || 'elena@acmeindustrial.com', phone: '+1 (512) 555-0199', isPrimary: true, status: 'REGISTERED', role: 'ACCOUNTS_PAYABLE', orgEntity: 'Corporate Headquarters', serviceLocation: 'Americas' },
            { id: 'cnt-2', firstName: 'Marcus', lastName: 'Vance', email: 'm.vance@acmeindustrial.com', phone: '+1 (512) 555-0144', isPrimary: false, status: 'REGISTERED', role: 'OPERATIONS', orgEntity: 'Supply Chain Operations', serviceLocation: 'Americas & Europe' },
            { id: 'cnt-3', firstName: 'Sarah', lastName: 'Chen', email: 'schen@acmeindustrial.com', phone: '+1 (512) 555-0188', isPrimary: false, status: 'REGISTERED', role: 'LEGAL', orgEntity: 'Corporate Legal & Contracts', serviceLocation: 'Global' },
            { id: 'cnt-4', firstName: 'David', lastName: 'Miller', email: 'dmiller@acmeindustrial.com', phone: '+1 (512) 555-0177', isPrimary: false, status: 'INVITED', role: 'COMPLIANCE', orgEntity: 'Risk, ESG & Safety', serviceLocation: 'Global' }
          ]);
          syncedFieldCount += 4;
        }
      }

      // SECTION 5: Multi-Facility Locations
      if (selectedSections.includes(5)) {
        if (masterProfile?.locations && masterProfile.locations.length > 0) {
          setLocations(masterProfile.locations);
          syncedFieldCount += masterProfile.locations.length;
        } else {
          setLocations([
            { id: 'loc-austin-1', name: 'Austin Corporate Headquarters & Lab', code: 'LOC-1011', types: ['HQ', 'ORDERING', 'REMIT_TO'], street1: '100 Industrial Parkway', street2: 'Suite 400', city: 'Austin', state: 'TX', zip: '78701', country: 'United States', phone: '+1 (512) 555-0100', isDefaultRemitTo: true, changeOrdersPermitted: true, autoAcknowledge: true, supportedCurrencies: ['USD', 'EUR'] },
            { id: 'loc-joliet-2', name: 'Joliet Fulfillment & Logistics DC', code: 'LOC-2044', types: ['SHIP_FROM', 'INVOICING'], street1: '450 Logistics Blvd', city: 'Joliet', state: 'IL', zip: '60431', country: 'United States', phone: '+1 (815) 555-0220', isDefaultRemitTo: false, changeOrdersPermitted: true, autoAcknowledge: true, supportedCurrencies: ['USD'] }
          ]);
          syncedFieldCount += 2;
        }
      }

      // SECTION 6: Banking & Settlement Coordinates
      if (selectedSections.includes(6)) {
        if (masterProfile?.gepBankAccounts && masterProfile.gepBankAccounts.length > 0) {
          setBankAccounts(masterProfile.gepBankAccounts);
          syncedFieldCount += masterProfile.gepBankAccounts.length;
        } else {
          setBankAccounts([
            { id: 'bnk-chase-1', clientBankRefId: 'REF-492100', country: 'United States', currency: 'USD', paymentMethod: 'ACH_CREDIT', bankName: 'JPMorgan Chase Bank, N.A.', bankBranch: 'Austin Commercial Banking Center', swiftBic: 'CHASUS33XXX', beneficiaryName: 'Acme Industrial Tech Inc.', routingNumber: '021000021', accountNumberMasked: '••••••••48210', accountNumberFull: '489201948210', linkedLocationId: 'loc-austin-1', linkedLocationName: 'Austin Corporate Headquarters & Lab', isDefault: true, verifiedWithDoc: true, docFileName: 'Chase_Bank_Remittance_Verification_Letter.pdf' }
          ]);
          syncedFieldCount += 1;
        }
        setBankBeneficiary('Acme Industrial Tech Inc.');
        setBankName('JPMorgan Chase Bank, N.A.');
        setBankRouting('021000021');
        setBankAccount('489201948210');
        setBankDocUploaded(true);
      }

      // SECTION 7: Commercial Terms (Buyer-Negotiated — Only if explicitly checked!)
      if (selectedSections.includes(7)) {
        if (masterProfile?.commercialSettings) {
          setCommercialSettings(masterProfile.commercialSettings);
          syncedFieldCount += 3;
        }
      }

      // SECTION 8: Diversity & Certificates
      if (selectedSections.includes(8)) {
        if (masterProfile?.gepCertificates && masterProfile.gepCertificates.length > 0) {
          setCertificates(masterProfile.gepCertificates);
          syncedFieldCount += masterProfile.gepCertificates.length;
        } else {
          setCertificates([
            { id: 'cert-coi-1', category: 'PROFESSIONAL', certType: 'COI_GENERAL', certTypeName: 'ACORD 25 Certificate of Liability Insurance ($5M)', issuingAuthority: 'Travelers Commercial Casualty', effectiveDate: '2026-01-01', expiryDate: '2026-12-31', status: 'ACTIVE', fileName: 'Travelers_ACORD_25_COI_Verified.pdf', ocrConfidence: 99.4 },
            { id: 'cert-iso-2', category: 'PROFESSIONAL', certType: 'ISO_27001', certTypeName: 'ISO/IEC 27001 Information Security Management', issuingAuthority: 'BSI Assurance UK', effectiveDate: '2025-06-15', expiryDate: '2028-06-14', status: 'ACTIVE', fileName: 'BSI_ISO27001_Audit_Attestation.pdf', ocrConfidence: 99.1 },
            { id: 'cert-soc-3', category: 'PROFESSIONAL', certType: 'SOC_2', certTypeName: 'SOC 2 Type II Security & Confidentiality Report', issuingAuthority: 'Ernst & Young LLP', effectiveDate: '2025-11-01', expiryDate: '2026-10-31', status: 'ACTIVE', fileName: 'EY_SOC2_Type_II_Executive_Summary.pdf', ocrConfidence: 98.7 },
            { id: 'cert-wbe-4', category: 'DIVERSITY', certType: 'WBE', certTypeName: 'Women-Owned Business Enterprise (WBE)', issuingAuthority: 'WBENC National Council', effectiveDate: '2025-03-01', expiryDate: '2027-02-28', status: 'ACTIVE', fileName: 'WBENC_WBE_Certified_Dossier.pdf', ocrConfidence: 99.0 }
          ]);
          syncedFieldCount += 4;
        }
        setInsuranceCarrier('Travelers Commercial Casualty');
        setInsuranceCoverage('$5,000,000 Aggregate');
        setHasIsoCert(true);
        setHasSoc2(true);
        setEsgPolicyAgreed(true);
      }

      triggerFieldPulse('legalName');
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setSyncSuccessToast({
        count: syncedFieldCount,
        sections: selectedSections.length,
        message: `Synchronized ${syncedFieldCount} verified fields across ${selectedSections.length} modules to ${activeInvitation.buyerName} application at ${timeStr}.`
      });

      setTimeout(() => {
        setSyncSuccessToast(null);
      }, 7000);
    }, 400);
  };

  const handleExecuteAutoFill = () => {
    setSyncModalOpen(true);
  };

  // Tool 2: Compliance Checklist Audit
  const handleExecuteComplianceAudit = () => {
    setIsAgentThinking(true);
    setTimeout(() => {
      setIsAgentThinking(false);
      const auditPassed = isStep1Done && isStep2Done && isStep3Done && isStep4Done && isStep5Done && isStep6Done && isStep7Done;

      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'QI',
          text: `**Enterprise S2P Compliance Audit for ${activeInvitation.buyerName}**:\n\n` +
            `• Section 1 (Basic Details & DUNS): ${isStep1Done ? '[Complete] ($38.4M Revenue)' : '[Incomplete]'}\n` +
            `• Section 2 (Tax & ID Registry): ${isStep2Done ? `[Complete] (${identifications.length} Statutory IDs Verified)` : '[Incomplete]'}\n` +
            `• Section 3 (Contact Persona Matrix): ${isStep3Done ? `[Complete] (${contacts.length} Roles Mapped)` : '[Incomplete]'}\n` +
            `• Section 4 (Location Architecture): ${isStep4Done ? `[Complete] (${locations.length} Facilities)` : '[Incomplete]'}\n` +
            `• Section 5 (Banking Settlement): ${isStep5Done ? '[Complete] (JPMorgan Chase FedACH Active)' : '[Incomplete]'}\n` +
            `• Section 6 (Commercial P2P): ${isStep6Done ? '[Complete] (3-Way Match & 2/10 Net 30)' : '[Incomplete]'}\n` +
            `• Section 7 (Diversity & Certificates): ${isStep7Done ? `[Complete] (${certificates.length} Credentials Verified)` : '[Incomplete]'}\n` +
            `• Section 8 (Review & Attestation): ${isStep8Done ? '[Complete] (Authorized & Ready)' : '[Pending Signature]'}\n\n` +
            (auditPassed 
              ? 'Profile is 100% compliant with Enterprise P2P standard and ready for immediate activation.'
              : 'Complete the remaining items highlighted above to submit.'),
          time: 'Just now',
          quickActions: [
            { id: 'REVIEW', label: 'Proceed to Review & Sign' },
            { id: 'VERIFY_BANK', label: 'Verify bank routing' },
            { id: 'AUTO_FILL', label: 'Want to update profile?' }
          ]
        }
      ]);
    }, 550);
  };

  // Tool 3: Bank Routing Validator
  const handleVerifyBankRouting = () => {
    setIsAgentThinking(true);
    setTimeout(() => {
      setIsAgentThinking(false);
      setActiveStep(6);
      triggerFieldPulse('bankRouting');

      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'QI',
          text: `**FedACH Lookup for \`${bankRouting}\`**:\n• **Institution:** JPMorgan Chase Bank, N.A.\n• **Settlement:** ACH, Fedwire, RTP Supported\n• **Status:** Active (Zero Fraud Flags)\n\nNavigated to **Section 6: Banking Information**.`,
          time: 'Just now',
          quickActions: [
            { id: 'AUDIT', label: 'Do you want to check audit checklist?' },
            { id: 'REVIEW', label: 'Proceed to Review & Sign' }
          ]
        }
      ]);
    }, 500);
  };

  // Tool 4: OCR Document Extraction (Simulated or Native)
  const handleSimulateDocumentUpload = (docName: string, fieldType: 'TAX' | 'BANK' | 'INSURANCE') => {
    setIsAgentThinking(true);
    setTimeout(() => {
      setIsAgentThinking(false);
      if (fieldType === 'TAX') {
        setActiveStep(3);
        setTaxId('84-1294812');
        setTaxEntityType('Corporation');
        setW9Uploaded(true);
        setW9FileName(docName);
        triggerFieldPulse('taxId');
      } else if (fieldType === 'BANK') {
        setActiveStep(6);
        setBankDocUploaded(true);
        setBankDocFileName(docName);
        triggerFieldPulse('bankRouting');
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-doc-' + Date.now(),
          sender: 'QI',
          text: `**OCR Document Extracted: ${docName}**\n• **Doc Type:** IRS Form W-9 (Verified)\n• **Extracted Name:** \`${legalName}\` (99.8% match)\n• **Extracted TIN:** \`84-1294812\` (99.9% match)\n\nNavigated to **Section 3: Identification Information**.`,
          time: 'Just now',
          quickActions: [
            { id: 'VERIFY_BANK', label: 'Verify bank routing' },
            { id: 'AUDIT', label: 'Do you want to check audit checklist?' },
            { id: 'REVIEW', label: 'Proceed to Review & Sign' }
          ]
        }
      ]);
    }, 700);
  };

  // Real Native Attachment Upload & OCR Extraction
  const handleRealDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeStr = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : Math.max(1, Math.round(file.size / 1024)) + ' KB';
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();

    let targetStep = 3;
    let stepTitle = 'Identification Information';
    let docType = 'IRS Form W-9 (Verified Taxpayer Certificate)';
    let extractedDetails = '';

    if (lowerName.includes('bank') || lowerName.includes('check') || lowerName.includes('ach') || lowerName.includes('nacha') || activeStep === 6 || activeStep === 7) {
      targetStep = 6;
      stepTitle = 'Banking Information';
      docType = 'Nacha Voided Check & Direct Deposit Mandate';
      setActiveStep(6);
      setBankDocUploaded(true);
      setBankDocFileName(fileName);
      setBankRouting('021000021');
      setBankAccount('••••••4921');
      triggerFieldPulse('bankRouting');
      extractedDetails = `• **Doc Type:** ${docType}\n• **Extracted Routing:** \`021000021\` (JPMorgan Chase Bank, NA)\n• **Extracted Account:** \`••••••4921\` (Business Checking)\n• **Verification:** Nacha / SOX Section 404 Compliant`;
    } else if (lowerName.includes('coi') || lowerName.includes('insurance') || lowerName.includes('acord') || lowerName.includes('cert') || lowerName.includes('iso') || lowerName.includes('soc') || activeStep === 9) {
      targetStep = 9;
      stepTitle = 'Diversity & Certificates';
      docType = 'ACORD 25 Certificate of Liability & Attestation';
      setActiveStep(9);
      setHasIsoCert(true);
      setHasSoc2(true);
      triggerFieldPulse('certificates');
      extractedDetails = `• **Doc Type:** ${docType}\n• **Coverage:** Commercial General Liability ($5,000,000 Occurrence)\n• **Endorsement:** Additional Insured Rider Attached\n• **Verification:** A.M. Best Rated A+ Carrier Verified`;
    } else {
      targetStep = 3;
      stepTitle = 'Identification Information';
      docType = 'IRS Form W-9 (Verified Taxpayer Certificate)';
      setActiveStep(3);
      setTaxId('84-1294812');
      setTaxEntityType('Corporation');
      setW9Uploaded(true);
      setW9FileName(fileName);
      triggerFieldPulse('taxId');
      extractedDetails = `• **Doc Type:** ${docType}\n• **Extracted Name:** \`${legalName || 'Acme Industrial Tech Inc.'}\` (99.8% match)\n• **Extracted TIN:** \`84-1294812\` (99.9% match)\n• **Verification:** Pre-cleared with IRS TIN matching system`;
    }

    // Add user upload message in chat
    setChatMessages(prev => [
      ...prev,
      {
        id: 'msg-user-up-' + Date.now(),
        sender: 'USER',
        text: `📎 **Attached Document:** \`${fileName}\` (${fileSizeStr}) for automated compliance verification.`,
        time: 'Just now'
      }
    ]);

    setIsAgentThinking(true);
    setTimeout(() => {
      setIsAgentThinking(false);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-doc-' + Date.now(),
          sender: 'QI',
          text: `**OCR Document Extracted: ${fileName}**\n${extractedDetails}\n\nNavigated to **Section ${targetStep}: ${stepTitle}**.`,
          time: 'Just now',
          quickActions: [
            { id: 'VERIFY_BANK', label: 'Verify bank routing' },
            { id: 'AUDIT', label: 'Do you want to check audit checklist?' },
            { id: 'REVIEW', label: 'Proceed to Review & Sign' }
          ]
        }
      ]);
    }, 600);

    e.target.value = '';
  };

  // PROMPT-BASED REAL-TIME AGENT HANDLER
  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAgentThinking) return;

    const userPrompt = chatInput.trim();
    setChatInput('');
    const userMsgId = 'user-' + Date.now();

    setChatMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'USER', text: userPrompt, time: 'Just now' }
    ]);

    setIsAgentThinking(true);

    setTimeout(() => {
      setIsAgentThinking(false);
      const lower = userPrompt.toLowerCase();
      const qiMsgId = 'qi-' + Date.now();

      // 1. Natural Language Intent: AUTO-FILL
      if (lower.includes('fill') || lower.includes('auto') || lower.includes('profile')) {
        handleExecuteAutoFill();
        return;
      }

      // 2. Natural Language Intent: AUDIT / COMPLIANCE
      if (lower.includes('audit') || lower.includes('compliance') || lower.includes('check') || lower.includes('verify') || lower.includes('ready')) {
        handleExecuteComplianceAudit();
        return;
      }

      // 3. Natural Language Intent: NAVIGATION / SWITCH SECTIONS
      if (lower.includes('section 1') || lower.includes('basic details') || lower.includes('governance')) {
        setActiveStep(1);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Navigated to **Section 1: Basic Details**.`,
            time: 'Just now',
            quickActions: [
              { id: 'AUTO_FILL', label: 'Want to update profile?' },
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
            ]
          }
        ]);
        return;
      }
      if (lower.includes('section 2') || lower.includes('business info') || lower.includes('revenue') || lower.includes('employees')) {
        setActiveStep(2);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 2: Business Information**. Operating currency: \`${reportingCurrency}\` • Revenue: \`$${annualRevenue}M\`.`,
            time: 'Just now',
            quickActions: [
              { id: 'AUTO_FILL', label: 'Want to update profile?' },
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
            ]
          }
        ]);
        return;
      }
      if (lower.includes('section 3') || lower.includes('identification') || lower.includes('tax') || lower.includes('tin') || lower.includes('w9')) {
        setActiveStep(3);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 3: Identification Information**. Registered Tax IDs: **${identifications.length}**.`,
            time: 'Just now',
            quickActions: [
              { id: 'UPLOAD_DOC', label: 'Start with an attachment' },
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
            ]
          }
        ]);
        return;
      }
      if (lower.includes('section 4') || lower.includes('contact')) {
        setActiveStep(4);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 4: Contact Information**. Total liaisons: **${contacts.length}**.`,
            time: 'Just now',
            quickActions: [
              { id: 'AUTO_FILL', label: 'Want to update profile?' },
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
            ]
          }
        ]);
        return;
      }
      if (lower.includes('section 5') || lower.includes('location') || lower.includes('address') || lower.includes('facility')) {
        setActiveStep(5);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 5: Location**. Operating facilities: **${locations.length}**.`,
            time: 'Just now',
            quickActions: [
              { id: 'AUTO_FILL', label: 'Want to update profile?' },
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
            ]
          }
        ]);
        return;
      }
      if (lower.includes('section 6') || lower.includes('bank') || lower.includes('routing') || lower.includes('ach')) {
        setActiveStep(6);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 6: Banking Information**. Disbursement accounts: **${bankAccounts.length}**.`,
            time: 'Just now',
            quickActions: [
              { id: 'VERIFY_BANK', label: 'Verify bank routing' },
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
            ]
          }
        ]);
        return;
      }
      if (lower.includes('section 7') || lower.includes('payment terms') || lower.includes('commercial') || lower.includes('inco')) {
        setActiveStep(7);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 7: Payment Terms** (${commercialSettings.paymentTerms}).`,
            time: 'Just now',
            quickActions: [
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' },
              { id: 'REVIEW', label: 'Proceed to Review & Sign' }
            ]
          }
        ]);
        return;
      }
      if (lower.includes('section 8') || lower.includes('diversity') || lower.includes('certificate') || lower.includes('insurance') || lower.includes('iso')) {
        setActiveStep(8);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 8: Diversity & Certificates**. Vaulted credentials: **${certificates.length}**.`,
            time: 'Just now',
            quickActions: [
              { id: 'UPLOAD_DOC', label: 'Start with an attachment' },
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
            ]
          }
        ]);
        return;
      }
      if (lower.includes('section 9') || lower.includes('review') || lower.includes('submit') || lower.includes('sign')) {
        setActiveStep(9);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 9: Review & Submit**. Ready for digital signature.`,
            time: 'Just now',
            quickActions: [
              { id: 'REVIEW', label: 'Proceed to Review & Sign' },
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
            ]
          }
        ]);
        return;
      }

      // 4. Natural Language Intent: FIELD UPDATE
      if (lower.includes('phone') && (lower.includes('change') || lower.includes('update') || lower.includes('set'))) {
        const phoneMatch = userPrompt.match(/(\+?\d[\d\s\-()]{7,}\d)/);
        const newPhone = phoneMatch ? phoneMatch[0] : '+1 (512) 888-0199';
        setContactPhone(newPhone);
        setActiveStep(4);
        triggerFieldPulse('contactPhone');

        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Updated **Business Phone** to \`${newPhone}\` in Section 4 (Contact Information).`,
            time: 'Just now',
            quickActions: [
              { id: 'AUDIT', label: 'Do you want to check audit checklist?' },
              { id: 'REVIEW', label: 'Proceed to Review & Sign' }
            ]
          }
        ]);
        return;
      }

      // 5. Default Intelligent Reply
      setChatMessages(prev => [
        ...prev,
        {
          id: qiMsgId,
          sender: 'QI',
          text: `Understood! I'm monitoring the requirements for **${activeInvitation.buyerName}**.\n\nYou can ask me to update any field, verify tax or bank routing, or choose an option below:`,
          time: 'Just now',
          quickActions: [
            { id: 'AUTO_FILL', label: 'Want to update profile?' },
            { id: 'UPLOAD_DOC', label: 'Start with an attachment' },
            { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
          ]
        }
      ]);
    }, 550);
  };

  // Handle Save / Next Section
  const handleSaveAndContinue = (nextStep: number) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setActiveStep(nextStep);
    }, 200);
  };

  // Handle Final Submit & Resubmit
  const handleFinalSubmit = () => {
    setDeclarationError(null);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setSubmissionStates(prev => ({
        ...prev,
        [activeInvitation.id]: {
          isSubmitted: true,
          isEditing: false,
          submittedAt: timeStr
        }
      }));

      setBuyerDataMap(prev => ({
        ...prev,
        [activeInvitation.id]: {
          ...(prev[activeInvitation.id] || INITIAL_BUYER_PACKETS[activeInvitation.id] || INITIAL_BUYER_PACKETS['inv-apex-01']),
          isSubmitted: true,
          isEditing: false,
          submittedAt: timeStr
        }
      }));

      setShowSubmitToast(true);
      setTimeout(() => {
        setShowSubmitToast(false);
      }, 6000);

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }, 600);
  };

  const handleStartEditing = () => {
    setSubmissionStates(prev => ({
      ...prev,
      [activeInvitation.id]: {
        ...(prev[activeInvitation.id] || { isSubmitted: true }),
        isEditing: true
      }
    }));
    setBuyerDataMap(prev => ({
      ...prev,
      [activeInvitation.id]: {
        ...(prev[activeInvitation.id] || INITIAL_BUYER_PACKETS[activeInvitation.id] || INITIAL_BUYER_PACKETS['inv-apex-01']),
        isEditing: true
      }
    }));
  };

  const handleCancelEditing = () => {
    setSubmissionStates(prev => ({
      ...prev,
      [activeInvitation.id]: {
        ...(prev[activeInvitation.id] || { isSubmitted: true }),
        isEditing: false
      }
    }));
    setBuyerDataMap(prev => ({
      ...prev,
      [activeInvitation.id]: {
        ...(prev[activeInvitation.id] || INITIAL_BUYER_PACKETS[activeInvitation.id] || INITIAL_BUYER_PACKETS['inv-apex-01']),
        isEditing: false
      }
    }));
  };

  // Start a fresh new chat session and archive the previous one if active
  const handleStartNewChat = () => {
    setChatMessages(currentMsgs => {
      if (currentMsgs.length > 1 || currentMsgs.some(m => m.sender === 'USER')) {
        const firstUserMsg = currentMsgs.find(m => m.sender === 'USER');
        const sessionTitle = firstUserMsg 
          ? (firstUserMsg.text.length > 36 ? firstUserMsg.text.slice(0, 36) + '...' : firstUserMsg.text)
          : `${activeInvitation.buyerName} Session`;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatSessions(prev => [
          {
            id: 'session-' + Date.now(),
            title: sessionTitle,
            timestamp: `Today, ${timeStr}`,
            buyerName: activeInvitation.buyerName,
            messages: [...currentMsgs]
          },
          ...prev
        ]);
      }
      return [createGreetingMessage(activeInvitation.buyerName)];
    });
    setIsHistoryOpen(false);
  };

  // Restore an archived chat session from history
  const handleRestoreSession = (session: ChatSession) => {
    setChatMessages(currentMsgs => {
      if (currentMsgs.length > 1 || currentMsgs.some(m => m.sender === 'USER')) {
        const firstUserMsg = currentMsgs.find(m => m.sender === 'USER');
        const sessionTitle = firstUserMsg 
          ? (firstUserMsg.text.length > 36 ? firstUserMsg.text.slice(0, 36) + '...' : firstUserMsg.text)
          : `${activeInvitation.buyerName} Session`;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatSessions(prev => [
          {
            id: 'session-' + Date.now(),
            title: sessionTitle,
            timestamp: `Today, ${timeStr}`,
            buyerName: activeInvitation.buyerName,
            messages: [...currentMsgs]
          },
          ...prev.filter(s => s.id !== session.id)
        ]);
      } else {
        setChatSessions(prev => prev.filter(s => s.id !== session.id));
      }
      return session.messages;
    });
    setIsHistoryOpen(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleClearAllHistory = () => {
    setChatSessions([]);
  };

  // Switch active vendor invitation with full context synchronization:
  // 1. Archives old chat session to history
  // 2. Synchronizes global top navbar buyer
  // 3. Updates buyer-scoped supplier manager on form
  // 4. Starts fresh buyer-specific chat session with updated greeting
  const handleSelectInvitation = (inv: BuyerInvitation) => {
    if (inv.id === activeInvitation.id) return;

    // 1. Snapshot current active buyer's form values into buyerDataMap
    setBuyerDataMap(prev => ({
      ...prev,
      [activeInvitation.id]: {
        partnerStatus,
        supplierManager,
        subcategories,
        serviceLocations,
        descriptionOfServices,
        businessUnits,
        contacts,
        locations,
        bankAccounts,
        commercialSettings,
        certificates,
        isSubmitted,
        isEditing: isEditingAfterSubmit,
        submittedAt
      }
    }));

    // 2. Load the next buyer's specific onboarding packet
    const nextPacket = buyerDataMap[inv.id] || INITIAL_BUYER_PACKETS[inv.id] || INITIAL_BUYER_PACKETS['inv-apex-01'];
    
    setPartnerStatus(nextPacket.partnerStatus);
    setSupplierManager(nextPacket.supplierManager);
    setSubcategories(nextPacket.subcategories);
    setServiceLocations(nextPacket.serviceLocations);
    setDescriptionOfServices(nextPacket.descriptionOfServices);
    setBusinessUnits(nextPacket.businessUnits);
    setContacts(nextPacket.contacts);
    setLocations(nextPacket.locations);
    setBankAccounts(nextPacket.bankAccounts);
    setCommercialSettings(nextPacket.commercialSettings);
    setCertificates(nextPacket.certificates);

    if (nextPacket.bankAccounts[0]) {
      setBankName(nextPacket.bankAccounts[0].bankName);
      setBankRouting(nextPacket.bankAccounts[0].routingNumber);
      setBankAccount(nextPacket.bankAccounts[0].accountNumberFull || nextPacket.bankAccounts[0].accountNumberMasked);
      setBankDocFileName(nextPacket.bankAccounts[0].docFileName || 'Remittance_Letter.pdf');
    }
    if (nextPacket.contacts[0]) {
      setContactName(`${nextPacket.contacts[0].firstName} ${nextPacket.contacts[0].lastName}`);
      setContactEmail(nextPacket.contacts[0].email);
      setContactPhone(nextPacket.contacts[0].phone);
    }

    setSubmissionStates(prev => ({
      ...prev,
      [inv.id]: {
        isSubmitted: nextPacket.isSubmitted,
        isEditing: nextPacket.isEditing,
        submittedAt: nextPacket.submittedAt
      }
    }));

    setActiveInvitation(inv);
    setBuyerDropdownOpen(false);
    setSelectedBuyerId(inv.buyerOrgId);

    // Update Ava Agent greeting & isolate chat session
    setChatMessages(currentMsgs => {
      if (currentMsgs.length > 1 || currentMsgs.some(m => m.sender === 'USER')) {
        const firstUserMsg = currentMsgs.find(m => m.sender === 'USER');
        const sessionTitle = firstUserMsg 
          ? (firstUserMsg.text.length > 36 ? firstUserMsg.text.slice(0, 36) + '...' : firstUserMsg.text)
          : `${activeInvitation.buyerName} Session`;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatSessions(prev => [
          {
            id: 'session-' + Date.now(),
            title: sessionTitle,
            timestamp: `Today, ${timeStr}`,
            buyerName: activeInvitation.buyerName,
            messages: [...currentMsgs]
          },
          ...prev
        ]);
      }
      return [createGreetingMessage(inv.buyerName)];
    });

    setIsHistoryOpen(false);
  };

  // Synchronize active buyer with top navigation portal context and routeState
  useEffect(() => {
    const targetOrgId = routeState?.buyerOrgId || (selectedBuyerId && selectedBuyerId !== 'ALL' ? selectedBuyerId : null);
    if (targetOrgId) {
      setViewMode('DETAIL');
      if (targetOrgId !== activeInvitation.buyerOrgId) {
        const match = invitations.find(inv => inv.buyerOrgId === targetOrgId);
        if (match) {
          handleSelectInvitation(match);
        }
      }
    }
  }, [selectedBuyerId, routeState?.buyerOrgId]);

  // Listen to header workspace dropdown selection event
  useEffect(() => {
    const handleGlobalBuyerChange = (e: any) => {
      const buyerOrgId = e.detail?.buyerOrgId;
      if (buyerOrgId && buyerOrgId !== activeInvitation.buyerOrgId) {
        const match = invitations.find(inv => inv.buyerOrgId === buyerOrgId);
        if (match) {
          handleSelectInvitation(match);
        }
      }
    };
    window.addEventListener('verisource:buyer-change', handleGlobalBuyerChange);
    return () => window.removeEventListener('verisource:buyer-change', handleGlobalBuyerChange);
  }, [activeInvitation]);

  // Handle actions dispatched by Ava Copilot to mutate onboarding questionnaire in real time
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'UPDATE_ONBOARDING_FIELD' || action.action === 'UPDATE_FIELD') {
        const payload = action.payload || {};
        const updatedFields: string[] = [];

        // 1. Legal Company Name
        if (payload.legalName !== undefined && payload.legalName !== null) {
          setLegalName(payload.legalName);
          setAiFilledFields(prev => ({ ...prev, legalName: true }));
          updatedFields.push('Legal Company Name');
        }

        // 2. Doing Business As / Trade Name
        const newTradeName = payload.tradeName || payload.doingBusinessAs || payload.dba;
        if (newTradeName !== undefined && newTradeName !== null) {
          setTradeName(newTradeName);
          setAiFilledFields(prev => ({ ...prev, tradeName: true }));
          updatedFields.push('Doing Business As');
        }

        // 3. Formally Known As
        if (payload.formerlyKnownAs !== undefined && payload.formerlyKnownAs !== null) {
          setFormerlyKnownAs(payload.formerlyKnownAs);
          setAiFilledFields(prev => ({ ...prev, formerlyKnownAs: true }));
          updatedFields.push('Formally Known As');
        }

        // 4. Normalised Corporate Name
        if (payload.normalisedName !== undefined && payload.normalisedName !== null) {
          setNormalisedName(payload.normalisedName);
          updatedFields.push('Normalised Name');
        }

        // 5. DUNS Number
        const newDuns = payload.dunsNumber || payload.duns;
        if (newDuns !== undefined && newDuns !== null) {
          setDunsNumber(newDuns);
          setHasDuns(true);
          setAiFilledFields(prev => ({ ...prev, dunsNumber: true }));
          updatedFields.push('DUNS Number');
        }
        if (payload.hasDuns !== undefined) {
          setHasDuns(Boolean(payload.hasDuns));
        }

        // 6. Partner Status
        if (payload.partnerStatus !== undefined && payload.partnerStatus !== null) {
          setPartnerStatus(payload.partnerStatus as any);
          updatedFields.push('Partner Status');
        }

        // 7. Supplier Manager Name
        if (payload.supplierManager !== undefined && payload.supplierManager !== null) {
          setSupplierManager(payload.supplierManager);
          updatedFields.push('Supplier Manager');
        }

        // 8. Subcategories
        if (payload.subcategories) {
          if (Array.isArray(payload.subcategories)) {
            setSubcategories(payload.subcategories);
          } else if (typeof payload.subcategories === 'string') {
            setSubcategories(prev => prev.includes(payload.subcategories) ? prev : [...prev, payload.subcategories]);
          }
          updatedFields.push('Subcategories');
        }

        // 9. Service Locations
        if (payload.serviceLocations) {
          if (Array.isArray(payload.serviceLocations)) {
            setServiceLocations(payload.serviceLocations);
          } else if (typeof payload.serviceLocations === 'string') {
            setServiceLocations(prev => prev.includes(payload.serviceLocations) ? prev : [...prev, payload.serviceLocations]);
          }
          updatedFields.push('Service Locations');
        }

        // 10. Business Info (Step 2)
        if (payload.annualRevenue !== undefined && payload.annualRevenue !== null) {
          setAnnualRevenue(String(payload.annualRevenue));
          updatedFields.push('Annual Revenue');
        }
        if (payload.reportingCurrency !== undefined && payload.reportingCurrency !== null) {
          setReportingCurrency(payload.reportingCurrency);
          updatedFields.push('Reporting Currency');
        }
        if (payload.totalEmployees !== undefined && payload.totalEmployees !== null) {
          setTotalEmployees(String(payload.totalEmployees));
          updatedFields.push('Total Employees');
        }
        if (payload.incorporationDate !== undefined && payload.incorporationDate !== null) {
          setIncorporationDate(payload.incorporationDate);
          updatedFields.push('Incorporation Date');
        }
        if (payload.registeredAddress !== undefined && payload.registeredAddress !== null) {
          setRegisteredAddress(payload.registeredAddress);
          updatedFields.push('Registered Address');
        }
        if (payload.country !== undefined && payload.country !== null) {
          setCountry(payload.country);
          updatedFields.push('Country');
        }
        if (payload.website !== undefined && payload.website !== null) {
          setWebsite(payload.website);
          updatedFields.push('Website');
        }
        if (payload.descriptionOfServices !== undefined && payload.descriptionOfServices !== null) {
          setDescriptionOfServices(payload.descriptionOfServices);
          updatedFields.push('Description of Services');
        }

        // Update scoped packet storage
        setBuyerDataMap(prev => {
          const cur = prev[activeInvitation.id] || INITIAL_BUYER_PACKETS[activeInvitation.id];
          return {
            ...prev,
            [activeInvitation.id]: {
              ...cur,
              partnerStatus: payload.partnerStatus || cur.partnerStatus,
              supplierManager: payload.supplierManager || cur.supplierManager,
              subcategories: payload.subcategories || cur.subcategories,
              serviceLocations: payload.serviceLocations || cur.serviceLocations,
              descriptionOfServices: payload.descriptionOfServices || cur.descriptionOfServices
            }
          };
        });

        // Trigger visual highlight ring and toast
        if (updatedFields.length > 0) {
          const firstFieldKey = payload.tradeName || payload.doingBusinessAs ? 'tradeName'
            : payload.dunsNumber || payload.duns ? 'dunsNumber'
            : payload.formerlyKnownAs ? 'formerlyKnownAs'
            : payload.supplierManager ? 'supplierManager'
            : payload.partnerStatus ? 'partnerStatus'
            : payload.annualRevenue ? 'annualRevenue'
            : payload.website ? 'website'
            : 'legalName';
          
          setHighlightField(firstFieldKey);
          setTimeout(() => setHighlightField(null), 3500);

          setAgentActionToast({
            title: 'Ava Agent Updated Questionnaire',
            message: `Updated ${updatedFields.join(', ')} for ${activeInvitation.buyerName}`
          });
          setTimeout(() => setAgentActionToast(null), 4500);
        }

      } else if (action.action === 'SET_ONBOARDING_STEP' || action.action === 'NAVIGATE_STEP') {
        const targetStep = Number(action.payload?.step);
        if (targetStep >= 1 && targetStep <= 9) {
          setActiveStep(targetStep);
          setAgentActionToast({
            title: 'Ava Navigated Questionnaire',
            message: `Switched to Step ${targetStep} of 9`
          });
          setTimeout(() => setAgentActionToast(null), 3000);
        }
      } else if (action.action === 'SELECT_BUYER_INVITATION' || action.action === 'SWITCH_BUYER') {
        const buyerTarget = action.payload?.buyerOrgId || action.payload?.invitationCode || action.payload?.id;
        if (buyerTarget) {
          const found = invitations.find(inv => inv.buyerOrgId === buyerTarget || inv.invitationCode === buyerTarget || inv.id === buyerTarget);
          if (found) {
            handleSelectInvitation(found);
            setAgentActionToast({
              title: 'Ava Switched Buyer Dossier',
              message: `Opened onboarding packet for ${found.buyerName}`
            });
            setTimeout(() => setAgentActionToast(null), 3500);
          }
        }
      } else if (action.action === 'AUTO_FILL_FORM' || action.action === 'SYNC_MASTER_PROFILE' || action.action === 'AUTO_FILL_QUESTIONNAIRE') {
        handleApplyMasterSync({
          strategy: 'SMART_MERGE',
          selectedSections: [1, 2, 3, 4, 5, 6, 7, 8],
          unlockRevision: false
        });
      } else if (action.action === 'SAVE_DRAFT') {
        handleSaveDraft();
      }
    });

    return cleanup;
  }, [activeInvitation, invitations, partnerStatus, supplierManager, subcategories, serviceLocations, descriptionOfServices]);

  // Dynamic Prompt Action Metadata & Icons
  const getQuickActionMeta = (id: string, label: string) => {
    switch (id) {
      case 'AUTO_FILL':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          title: 'Update profile',
          desc: 'Sync 14 verified records from Universal Profile',
          category: 'Autofill',
          promptText: 'Update profile from Master Public Profile'
        };
      case 'UPLOAD_DOC':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          title: 'Upload document',
          desc: 'Extract TIN & legal entity via OCR Vision',
          category: 'OCR',
          promptText: 'Upload and parse IRS Form W-9'
        };
      case 'VERIFY_BANK':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          title: 'Verify bank details',
          desc: 'Match FedACH routing & active settlement ABA',
          category: 'FedACH',
          promptText: 'Verify banking details and FedACH routing'
        };
      case 'AUDIT':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          title: 'Audit checklist',
          desc: 'Validate 100% compliance across all 6 sections',
          category: 'Audit',
          promptText: 'Run compliance audit checklist'
        };
      case 'REVIEW':
        return {
          icon: <CheckCheck className="w-3.5 h-3.5 text-teal-400" />,
          badgeBg: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
          title: 'Review & submit',
          desc: 'Proceed to digital signature & final submission',
          category: 'Sign',
          promptText: 'Review packet and prepare for digital signature'
        };
      case 'EDIT_SUBMISSION':
        return {
          icon: <Edit3 className="w-3.5 h-3.5 text-amber-400" />,
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          title: 'Edit application',
          desc: 'Unlock submitted application to revise information',
          category: 'Revise',
          promptText: 'Unlock application to revise submitted details'
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          title: label.replace(/^[^\w\s]+/, '').trim() || 'Execute Action',
          desc: 'Automate onboarding task',
          category: 'Action',
          promptText: label.replace(/^[^\w\s]+/, '').trim()
        };
    }
  };

  // Central dynamic action dispatcher with natural conversational flow
  const handleQuickAction = (actionId: string, customLabel?: string) => {
    const meta = getQuickActionMeta(actionId, customLabel || '');
    
    // Append user message so conversation flow is completely natural
    setChatMessages(prev => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'USER',
        text: customLabel || meta.promptText,
        time: 'Just now'
      }
    ]);

    switch (actionId) {
      case 'AUTO_FILL':
        handleExecuteAutoFill();
        break;
      case 'UPLOAD_DOC':
        fileInputRef.current?.click();
        break;
      case 'VERIFY_BANK':
        handleVerifyBankRouting();
        break;
      case 'AUDIT':
        handleExecuteComplianceAudit();
        break;
      case 'EDIT_SUBMISSION':
        handleStartEditing();
        setActiveStep(1);
        setTimeout(() => {
          setChatMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              sender: 'QI',
              text: `**Revision Mode Enabled!** You can now freely edit Section 1 through Section 8. Once done, go to Section 9 to save and resubmit your updates to **${activeInvitation.buyerName}**.`,
              time: 'Just now',
              quickActions: [
                { id: 'AUTO_FILL', label: 'Want to update profile?' },
                { id: 'AUDIT', label: 'Do you want to check audit checklist?' }
              ]
            }
          ]);
        }, 200);
        break;
      case 'REVIEW':
        setActiveStep(9);
        setTimeout(() => {
          setChatMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              sender: 'QI',
              text: `Switched to **Section 9: Review & Submit**. Your onboarding packet is verified and ready for authorized digital signature.`,
              time: 'Just now',
              quickActions: [
                { id: 'AUDIT', label: 'Do you want to check audit checklist?' },
                { id: 'AUTO_FILL', label: 'Want to update profile?' }
              ]
            }
          ]);
        }, 300);
        break;
      default:
        break;
    }
  };

  // View modes boolean flags
  const isDock = copilotViewMode === 'DOCK';
  const isFloat = copilotViewMode === 'FLOAT';
  const isFull = copilotViewMode === 'FULL';
  const isMinimized = copilotViewMode === 'MINIMIZE';

  // =========================================================================
  // RENDER AGENT COPILOT CONTENT (Strictly bounded height, internal scroll)
  // =========================================================================

  // =========================================================================
  // VIEW MODE: REQUESTS DIRECTORY / LIST VIEW
  // =========================================================================
  if (viewMode === 'LIST') {
    const requestCardsData = [
      {
        id: 'inv-novatech-02',
        orgId: 'buyer-org-2',
        buyerName: 'NovaTech Aerospace & Defense',
        initials: 'NO',
        color: 'from-indigo-600 to-blue-700',
        invitationCode: 'INV-NOVATECH-8820',
        program: 'Defense Avionics & High-Tolerance Telemetry',
        category: 'Mission-Critical Aerospace Telemetry',
        invitedBy: 'Sarah Lin (S2P Vendor Operations)',
        invitedDate: 'Yesterday',
        deadline: 'Nov 20, 2026 (10 days left)',
        progressPercent: 15,
        stageLabel: 'Stage 1 of 5: Registration Completed',
        statusKey: 'ACTION_REQUIRED',
        statusLabel: 'Action Needed',
        statusBadgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
        complianceScope: 'ITAR Defense Attestation, NIST SP 800-171, Mil-Spec Quality Cert',
        ctaText: 'Start Onboarding',
        ctaIcon: ArrowRight
      },
      {
        id: 'inv-apex-01',
        orgId: 'buyer-org-1',
        buyerName: 'Apex Global Enterprises',
        initials: 'AP',
        color: 'from-emerald-600 to-teal-700',
        invitationCode: 'INV-APEX-2026',
        program: 'Cloud Infrastructure & High-Performance Hardware Supply',
        category: 'Enterprise Cloud Infrastructure & Hardware',
        invitedBy: 'Marcus Vance (VP Strategic Procurement)',
        invitedDate: 'Jan 14, 2026',
        deadline: 'Nov 30, 2026 (21 days left)',
        progressPercent: 67,
        stageLabel: 'Stage 2 of 5: Form Submission',
        statusKey: 'IN_PROGRESS',
        statusLabel: 'In Progress (67%)',
        statusBadgeBg: 'bg-sky-50 text-sky-800 border-sky-200/80',
        complianceScope: 'IRS Form W-9, FedACH Remittance, Commercial COI, SOC 2 Type II',
        ctaText: 'Resume Application',
        ctaIcon: ArrowRight
      },
      {
        id: 'inv-meridian-03',
        orgId: 'buyer-org-3',
        buyerName: 'Meridian Health Network',
        initials: 'ME',
        color: 'from-teal-600 to-cyan-700',
        invitationCode: 'INV-MERIDIAN-4011',
        program: 'Clinical Diagnostic & Hospital Lab Automation',
        category: 'Clinical Diagnostic & Lab Automation',
        invitedBy: 'David Chen (Global Procurement Lead)',
        invitedDate: '3 days ago',
        submittedAt: 'Nov 4, 2026 at 17:44',
        progressPercent: 100,
        stageLabel: 'Stage 3 of 5: Buyer Review & Adjudication',
        statusKey: 'UNDER_REVIEW',
        statusLabel: 'Under Buyer Review',
        statusBadgeBg: 'bg-teal-50 text-teal-800 border-teal-200/80',
        complianceScope: 'HIPAA Business Associate (BAA), $5M Malpractice COI, FDA QSR',
        ctaText: 'View Submission Details',
        ctaIcon: Eye
      }
    ];

    const filteredCards = requestCardsData.filter(card => {
      if (listFilter === 'ACTION_REQUIRED' && card.statusKey !== 'ACTION_REQUIRED') return false;
      if (listFilter === 'IN_PROGRESS' && card.statusKey !== 'IN_PROGRESS') return false;
      if (listFilter === 'UNDER_REVIEW' && card.statusKey !== 'UNDER_REVIEW') return false;
      if (listSearch.trim()) {
        const q = listSearch.toLowerCase();
        return card.buyerName.toLowerCase().includes(q) ||
          card.invitationCode.toLowerCase().includes(q) ||
          card.category.toLowerCase().includes(q) ||
          card.invitedBy.toLowerCase().includes(q);
      }
      return true;
    });

    const handleOpenRequest = (invId: string, orgId: string) => {
      const match = invitations.find(i => i.id === invId || i.buyerOrgId === orgId);
      if (match) {
        handleSelectInvitation(match);
      }
      setViewMode('DETAIL');
    };

    return (
      <div className="space-y-4 font-sans text-slate-800">
        {/* Top Breadcrumb & Return to Dashboard */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <button onClick={() => navigate('/dashboard')} className="hover:text-slate-900 font-medium cursor-pointer">
              Dashboard
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900">Buyer Onboarding Requests</span>
          </div>

          <button
            onClick={() => navigate('/public-profile')}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
            title="Review and update canonical Master Public Profile"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Master Public Profile</span>
          </button>
        </div>

        {/* Directory Header Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                  Buyer Onboarding Requests
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review onboarding requests from enterprise buyers, complete compliance requirements, and track approval status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                onClick={() => setViewMode('LIST')}
                className="px-2.5 py-1 rounded-md font-semibold transition cursor-pointer bg-white text-slate-900 shadow-2xs"
              >
                Requests Queue
              </button>
              <button
                onClick={() => setViewMode('DETAIL')}
                className="px-2.5 py-1 rounded-md font-medium transition cursor-pointer text-slate-600 hover:text-slate-900"
              >
                Active Workspace
              </button>
            </div>

            <button
              onClick={() => navigate('/onboarding')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="All Onboarding Requests"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>All Requests</span>
            </button>
          </div>
        </div>

        {/* Minimal 4-KPI Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Invitations</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                3 <span className="text-xs font-normal text-slate-500 font-sans">Active Requests</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5 font-medium truncate">
                100% Verified Passport
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Action Required</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                1 <span className="text-xs font-normal text-amber-700 font-sans">Pending Start</span>
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5 font-medium truncate">
                NovaTech Aerospace (Mil-Spec)
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In Progress</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                1 <span className="text-xs font-normal text-slate-500 font-sans">Drafting</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
                Apex Global (67% complete)
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Under Buyer Review</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                1 <span className="text-xs font-normal text-slate-500 font-sans">In Adjudication</span>
              </div>
              <div className="text-[11px] text-teal-700 mt-0.5 font-medium truncate">
                Meridian Health (Submitted Nov 4)
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setListFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                listFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              All Requests ({requestCardsData.length})
            </button>
            <button
              onClick={() => setListFilter('ACTION_REQUIRED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                listFilter === 'ACTION_REQUIRED'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Action Needed (1)
            </button>
            <button
              onClick={() => setListFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                listFilter === 'IN_PROGRESS'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              In Progress (1)
            </button>
            <button
              onClick={() => setListFilter('UNDER_REVIEW')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                listFilter === 'UNDER_REVIEW'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Under Review (1)
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by buyer, code, category..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/70"
            />
          </div>
        </div>

        {/* 3-Column Onboarding Request Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const Icon = card.ctaIcon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all group"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Initials, Name, Code & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                        {card.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-emerald-700 transition-colors">
                          {card.buyerName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {card.invitationCode}
                          </span>
                          <span className="text-[10px] text-slate-400">• {card.invitedDate}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${card.statusBadgeBg}`}>
                      {card.statusLabel}
                    </span>
                  </div>

                  {/* Specifications & Program Details Box */}
                  <div className="space-y-1.5 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">S2P Program:</span>
                      <span className="font-medium text-slate-800 text-[11px] truncate max-w-[170px]" title={card.program}>
                        {card.program}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Invited By:</span>
                      <span className="font-medium text-slate-700 text-[11px] truncate max-w-[170px]" title={card.invitedBy}>
                        {card.invitedBy}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Required Scope:</span>
                      <span className="font-medium text-slate-700 text-[11px] truncate max-w-[170px]" title={card.complianceScope}>
                        {card.complianceScope}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">{card.stageLabel}</span>
                      <span className="font-mono font-bold text-slate-900">{card.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          card.progressPercent === 100
                            ? 'bg-teal-500'
                            : card.progressPercent > 50
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${card.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenRequest(card.id, card.orgId)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{card.ctaText}</span>
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 flex flex-col h-[calc(100vh-125px)] min-h-[600px]">
      {/* Top Breadcrumb & Return to Directory & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 shrink-0 px-0.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition cursor-pointer shrink-0"
            title="Return to Onboarding directory"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            <span>Onboarding</span>
          </button>

          <span className="text-slate-300 select-none">/</span>

          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md">
            {activeInvitation.invitationCode || activeInvitation.id}
          </span>

          <span className="text-xs font-medium text-slate-500 truncate max-w-[200px] hidden md:inline">
            • {activeInvitation.buyerName}
          </span>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/70">
            {activeInvitation.status === 'COMPLETED' ? 'Completed' : activeInvitation.status === 'IN_PROGRESS' ? 'In Progress' : 'Active Invitation'}
          </span>
        </div>

        {/* Global Action Zone (GEP Quantum Benchmark: Edit Profile, Save Draft, Submit, Sync) */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap">
          {/* Sync from Master Profile */}
          <button
            type="button"
            onClick={handleExecuteAutoFill}
            className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100/90 px-2.5 py-1.5 rounded-xl border border-amber-300 transition shadow-2xs"
            title="Auto-fill verified records from your Verisource Master Profile"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Sync with Master Profile</span>
            <span className="md:hidden">Sync</span>
          </button>

          {/* Standard Pre-Submission Actions: Save Draft and Submit Profile */}
          {!isSubmitted && (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="text-xs text-slate-800 hover:text-slate-900 font-bold flex items-center gap-1.5 cursor-pointer bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 transition shadow-2xs"
                title="Save current progress"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>{draftSavedState ? 'Saved' : 'Save Draft'}</span>
              </button>

              {/* Submit Profile is rendered ONLY on final review step (9) OR when all 9 steps are completed (prevents premature submit & action clustering) */}
              {(activeStep === 9 || completedStepsCount === 9) && (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="text-xs font-bold flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl shadow-xs transition text-white cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                  title="Finalize and submit onboarding dossier"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              )}
            </>
          )}

          {/* When already submitted: Edit / Revision Controls */}
          {isSubmitted && !isEditingAfterSubmit && (
            <button
              type="button"
              onClick={handleStartEditing}
              className="text-xs text-emerald-900 hover:text-emerald-950 font-bold flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 transition shadow-2xs"
              title="Unlock dossier to request updates"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Edit Application</span>
            </button>
          )}

          {isSubmitted && isEditingAfterSubmit && (
            <>
              <button
                type="button"
                onClick={handleCancelEditing}
                className="text-xs text-slate-600 hover:text-slate-800 font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="text-xs font-bold flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl shadow-xs transition text-white cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                title="Resubmit application"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Resubmitting...' : 'Resubmit'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col font-sans bg-slate-50 overflow-hidden relative rounded-xl border border-slate-200/80 shadow-xs">
      
      {/* WORKBENCH: STRICT VIEWPORT BOUNDED ROW (NO PAGE BLOWUP) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 bg-white h-full max-h-full overflow-hidden">
        
        {/* ========================================================
            COLUMN 1: VERTICAL SECTION STEPPER (Left Sidebar)
            (Hidden only in FULL agent view)
           ======================================================== */}
        {!isFull && !sidebarCollapsed && (
          <aside className="w-56 xl:w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-3 shrink-0 h-full overflow-y-auto transition-all duration-200">
            <div className="space-y-3">
              
              {/* Header with Title & ChatGPT-style Minimize Button */}
              <div className="flex items-center justify-between px-1 pb-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Onboarding Steps</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Collapse to icon rail (ChatGPT style)"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Minimalist Active Vendor Onboarding Card */}
              <div className="relative bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 space-y-2 shadow-2xs">
                {/* Vendor Selector Header */}
                <button
                  type="button"
                  onClick={() => setBuyerDropdownOpen(!buyerDropdownOpen)}
                  className="w-full flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition shadow-2xs group text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-2 min-w-0 pr-1">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {activeInvitation.buyerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                        {activeInvitation.buyerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {activeInvitation.invitationCode}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 transition-transform ${buyerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Multi-Vendor Dropdown Menu */}
                {buyerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                      Switch Vendor ({invitations.length})
                    </div>
                    {invitations.map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => {
                          handleSelectInvitation(inv);
                        }}
                        className={`w-full p-2 rounded-lg text-left transition flex items-start justify-between cursor-pointer ${
                          inv.id === activeInvitation.id
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs truncate font-medium">{inv.buyerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{inv.invitationCode} • {inv.category}</div>
                        </div>
                        {inv.id === activeInvitation.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Compact Progress Line */}
                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="font-medium text-slate-500">
                    {isSubmitted ? 'Stage 3: Review' : 'Stage 2: Submission'}
                  </span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {completedStepsCount} of 9 Done ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Vertical Step Progress List Grouped by 4 Milestone Phases */}
              <div className="space-y-3">
                {phases.map((phase) => {
                  const phaseSteps = steps.filter((s) => phase.stepNums.includes(s.num));
                  const phaseDoneCount = phaseSteps.filter((s) => getStepStatus(s.num) === 'COMPLETED').length;
                  const isPhaseDone = phaseDoneCount === phaseSteps.length;
                  const isPhaseActive = phase.stepNums.includes(activeStep);

                  return (
                    <div key={phase.id} className="space-y-1">
                      {/* Milestone Phase Header */}
                      <div className="flex items-center justify-between px-1.5 pt-0.5 pb-0.5 select-none">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                          isPhaseActive ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {phase.title}
                        </span>
                        {isPhaseDone ? (
                          <span className="text-[9px] font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[2]" />
                            <span>Done</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-medium text-slate-400">
                            {phaseDoneCount}/{phase.stepNums.length}
                          </span>
                        )}
                      </div>

                      {/* Phase Steps */}
                      <div className="space-y-0.5">
                        {phaseSteps.map((s) => {
                          const isCurrent = activeStep === s.num;
                          const status = getStepStatus(s.num);
                          const isDone = status === 'COMPLETED';

                          return (
                            <button
                              key={s.id}
                              onClick={() => setActiveStep(s.num)}
                              className={`w-full p-2 rounded-xl text-left transition flex items-center space-x-2.5 border cursor-pointer ${
                                isCurrent
                                  ? 'bg-slate-100 border-slate-300 shadow-2xs font-medium text-slate-900'
                                  : isDone
                                  ? 'bg-white border-transparent hover:bg-slate-50 text-slate-700 font-normal'
                                  : 'bg-white border-transparent hover:bg-slate-50 text-slate-500 font-normal'
                              }`}
                            >
                              {/* Minimalist Circular Step Indicator */}
                              <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-medium text-xs shrink-0 transition ${
                                isCurrent
                                  ? 'bg-slate-900 text-white shadow-2xs text-[11px]'
                                  : isDone
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                                  : 'bg-slate-100 text-slate-500 text-[11px]'
                              }`}>
                                {isCurrent ? (
                                  <span>{s.num}</span>
                                ) : isDone ? (
                                  <Check className="w-3 h-3 stroke-[2]" />
                                ) : (
                                  <span>{s.num}</span>
                                )}
                              </div>

                              {/* Clean Section Name - No Subtitles */}
                              <div className="flex-1 min-w-0">
                                <span className="text-xs truncate block">
                                  {s.title}
                                </span>
                              </div>

                              {/* Subtle Active Indicator or Incomplete Badge */}
                              {isCurrent ? (
                                !isFormEditable ? (
                                  <span title="Viewing section in read-only mode" className="shrink-0 flex items-center">
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  </span>
                                ) : null
                              ) : !isDone ? (
                                <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                                  Pending
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* MINIMIZED SLIM ICON RAIL (ChatGPT Style - Section Icons Visible) */}
        {!isFull && sidebarCollapsed && (
          <aside className="w-14 sm:w-16 bg-white border-r border-slate-200 flex flex-col items-center py-3.5 px-1 space-y-2.5 shrink-0 h-full overflow-y-auto transition-all duration-200 select-none">
            {/* Expand Button */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
              title="Expand steps sidebar (ChatGPT style)"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>

            {/* Mini Progress Ratio */}
            <div className="text-[10px] font-mono font-bold text-slate-400 py-0.5" title={`${completedStepsCount} of 9 sections completed`}>
              {completedStepsCount}/9
            </div>

            <div className="w-8 h-px bg-slate-200" />

            {/* 9 Section Icon Buttons Grouped by Phase */}
            <div className="flex flex-col items-center space-y-1 w-full">
              {phases.map((phase, pIdx) => {
                const phaseSteps = steps.filter((s) => phase.stepNums.includes(s.num));
                return (
                  <React.Fragment key={phase.id}>
                    {pIdx > 0 && <div className="w-6 h-px bg-slate-200/80 my-1" />}
                    {phaseSteps.map((s) => {
                      const Icon = s.icon;
                      const isCurrent = activeStep === s.num;
                      const status = getStepStatus(s.num);
                      const isDone = status === 'COMPLETED';

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActiveStep(s.num)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative cursor-pointer group ${
                            isCurrent
                              ? 'bg-slate-900 text-white ring-2 ring-emerald-500 shadow-xs'
                              : isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900'
                              : 'bg-amber-50/80 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                          title={`${s.num}. ${s.title} (${isDone ? 'Completed' : isCurrent ? 'Active' : 'Pending Details'})`}
                        >
                          <Icon className="w-4 h-4" />
                          {isDone && !isCurrent ? (
                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : !isDone && !isCurrent ? (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" title="Incomplete - Action Required" />
                          ) : null}
                        </button>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </aside>
        )}

        {/* ========================================================
            COLUMN 2: FORM DETAILS PANE (Center - Section by Section)
            (Hidden only in FULL agent view)
           ======================================================== */}
        {!isFull && (
          <main className="flex-1 min-w-0 bg-slate-50 overflow-y-auto h-full p-3 sm:p-4 lg:p-5 space-y-3.5">
            
            {/* Ava Agent Real-Time Live Update Toast Banner */}
            {agentActionToast && (
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white rounded-xl p-3 sm:px-4 sm:py-3 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 border border-emerald-400/30">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4.5 h-4.5 text-amber-300 animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold flex items-center gap-2">
                      <span>{agentActionToast.title}</span>
                      <span className="text-[10px] bg-emerald-400/30 px-1.5 py-0.2 rounded font-mono font-semibold text-emerald-200">
                        DATA FLOW ACTIVE • LIVE
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-100 font-medium truncate mt-0.5">
                      {agentActionToast.message}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAgentActionToast(null)}
                  className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white transition shrink-0 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Master Profile Sync Toast (Auto-dismisses in 7s or on dismiss click) */}
            {syncSuccessToast && (
              <div className="bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600 text-white rounded-xl p-3 sm:px-4 sm:py-3 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Zap className="w-4.5 h-4.5 text-amber-200 fill-amber-200" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold flex items-center gap-2">
                      <span>Master Profile Synchronized Successfully!</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-semibold">
                        {syncSuccessToast.sections} SECTIONS • {syncSuccessToast.count} FIELDS
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-100 mt-0.5 truncate">
                      {syncSuccessToast.message}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSyncSuccessToast(null)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition shrink-0 cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Submission Confirmation Toast (Auto-dismisses in 6s or on step change / dismiss click) */}
            {showSubmitToast && (
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl p-3 sm:px-4 sm:py-3 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold flex items-center gap-2">
                      <span>Application Submitted Successfully to {activeInvitation.buyerName}!</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-semibold">STAGE 3 ACTIVE</span>
                    </div>
                    <div className="text-[11px] text-emerald-100 mt-0.5 truncate">
                      Dossier Ref: <span className="font-mono font-semibold text-white">{activeInvitation.invitationCode}-SUBMITTED</span> • Procurement review is underway ({submittedAt || 'Today'}).
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSubmitToast(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition shrink-0 cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* End-to-End Buyer Onboarding Lifecycle Process Map (Compact by default) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs space-y-2.5">
              {/* Compact Summary Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* 5-Stage Mini Track */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 py-0.5">
                  {[
                    { num: 1, label: 'Registration', done: true, active: false },
                    { num: 2, label: 'Submission', done: isSubmitted, active: !isSubmitted },
                    { num: 3, label: 'Review', done: false, active: isSubmitted },
                    { num: 4, label: 'In Approval', done: false, active: false },
                    { num: 5, label: 'Ready', done: false, active: false }
                  ].map((st) => (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => setActiveStageDetail(st.num)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer whitespace-nowrap ${
                        st.done
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : st.active
                          ? 'bg-slate-900 text-emerald-300 ring-1 ring-emerald-500 font-bold'
                          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title={`Stage ${st.num}: ${st.label} (Click for details)`}
                    >
                      {st.done ? (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-3 h-3 flex items-center justify-center font-mono font-bold">{st.num}</span>
                      )}
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>

                {/* Right Controls: Stage Status Pill & Toggle */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                    {isSubmitted ? 'Submitted' : 'Stage 2 Active'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLifecycleExpanded(!lifecycleExpanded)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 rounded-lg border border-slate-200 transition flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                    title={lifecycleExpanded ? 'Collapse 5-stage pipeline' : 'Expand full 5-stage pipeline'}
                  >
                    <span>{lifecycleExpanded ? 'Hide Pipeline' : 'View Stages'}</span>
                    {lifecycleExpanded ? (
                      <ChevronUp className="w-3 h-3 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Full Expanded 5-Stage Stepper Pipeline (Revealed on Toggle) */}
              {lifecycleExpanded && (
                <div className="pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 space-y-2">
                  <div className="relative pt-1 pb-1">
                    {/* Visual Progress Connector Line Track behind nodes */}
                    <div className="absolute top-[18px] left-[10%] right-[10%] h-1 bg-slate-200 rounded-full z-0 -translate-y-1/2">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: isSubmitted ? '50%' : '25%'
                        }}
                      />
                    </div>

                    {/* 5 Interactive Clickable Stages */}
                    <div className="grid grid-cols-5 gap-2 relative z-10">
                      {/* Step 1: Registration */}
                      <button
                        type="button"
                        onClick={() => setActiveStageDetail(1)}
                        className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                        title="Click to view Stage 1: Registration details"
                      >
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs mb-1 ring-4 ring-emerald-50 group-hover:ring-emerald-200 transition">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition">
                          Registration
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                          Registered
                        </span>
                      </button>

                      {/* Step 2: Profile Submission */}
                      <button
                        type="button"
                        onClick={() => setActiveStageDetail(2)}
                        className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                        title="Click to view Stage 2: Profile Submission details"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-1 ring-4 transition ${
                          isSubmitted 
                            ? 'bg-emerald-600 text-white ring-emerald-50 group-hover:ring-emerald-200' 
                            : 'bg-slate-900 text-emerald-400 ring-emerald-100 border-2 border-emerald-500 group-hover:ring-emerald-300'
                        }`}>
                          {isSubmitted ? <Check className="w-3.5 h-3.5" /> : '2'}
                        </div>
                        <span className={`text-xs font-bold leading-tight transition ${isSubmitted ? 'text-slate-900 group-hover:text-emerald-700' : 'text-emerald-950 font-bold'}`}>
                          Profile Submission
                        </span>
                        <span className={`text-[10px] font-medium mt-0.5 ${isSubmitted ? 'text-emerald-600' : 'text-emerald-700 font-bold'}`}>
                          {isSubmitted ? 'Submitted' : `${progressPercent}% Active`}
                        </span>
                      </button>

                      {/* Step 3: Vendor Review */}
                      <button
                        type="button"
                        onClick={() => setActiveStageDetail(3)}
                        className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                        title="Click to view Stage 3: Vendor Review details"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-1 ring-4 transition ${
                          isSubmitted 
                            ? 'bg-slate-900 text-emerald-400 ring-emerald-100 border-2 border-emerald-500 animate-pulse group-hover:ring-emerald-300' 
                            : 'bg-slate-100 text-slate-400 ring-slate-50 group-hover:ring-slate-200'
                        }`}>
                          3
                        </div>
                        <span className={`text-xs font-bold leading-tight transition ${isSubmitted ? 'text-emerald-950 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          Vendor Review
                        </span>
                        <span className={`text-[10px] font-medium mt-0.5 ${isSubmitted ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          {isSubmitted ? 'Under Review ●' : 'Pending Review'}
                        </span>
                      </button>

                      {/* Step 4: In Approval */}
                      <button
                        type="button"
                        onClick={() => setActiveStageDetail(4)}
                        className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                        title="Click to view Stage 4: In Approval details"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs shadow-xs mb-1 ring-4 ring-slate-50 group-hover:ring-slate-200 transition">
                          4
                        </div>
                        <span className="text-xs font-bold text-slate-600 leading-tight group-hover:text-slate-900 transition">
                          In Approval
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Pending
                        </span>
                      </button>

                      {/* Step 5: Ready for Transaction */}
                      <button
                        type="button"
                        onClick={() => setActiveStageDetail(5)}
                        className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                        title="Click to view Stage 5: Ready for Transaction details"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs shadow-xs mb-1 ring-4 ring-slate-50 group-hover:ring-slate-200 transition">
                          5
                        </div>
                        <span className="text-xs font-bold text-slate-600 leading-tight group-hover:text-slate-900 transition">
                          Ready for Transaction
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                          PO & Invoices
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Stage Info Drawer / Banner */}
              {activeStageDetail && (
                <div className="mt-2 p-4 rounded-xl bg-slate-900 text-white border border-slate-700/80 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                        {activeStageDetail}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>
                            {activeStageDetail === 1 && 'Stage 1: Registration'}
                            {activeStageDetail === 2 && 'Stage 2: Profile Submission'}
                            {activeStageDetail === 3 && 'Stage 3: Vendor Review'}
                            {activeStageDetail === 4 && 'Stage 4: In Approval'}
                            {activeStageDetail === 5 && 'Stage 5: Ready for Transaction'}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            activeStageDetail === 1 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : activeStageDetail === 2
                              ? (isSubmitted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300')
                              : activeStageDetail === 3 && isSubmitted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {activeStageDetail === 1 && 'Vendor Registered'}
                            {activeStageDetail === 2 && (isSubmitted ? 'Submitted by You' : `In Progress • ${progressPercent}%`)}
                            {activeStageDetail === 3 && (isSubmitted ? 'Vendor Reviewing Now ●' : 'Awaiting Your Submission')}
                            {activeStageDetail === 4 && (isSubmitted ? 'Pending Approver Review' : 'Pending Approval')}
                            {activeStageDetail === 5 && 'Authorized for PO, Invoices & Transactions'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          {activeStageDetail === 1 && 'Vendor registered your company and invited you to onboard with preliminary entity details.'}
                          {activeStageDetail === 2 && 'You complete and submit your profile details across all 6 sections: company info, contacts, tax W-9, banking ACH, and compliance.'}
                          {activeStageDetail === 3 && 'Vendor is reviewing the profile details and compliance documents submitted by you.'}
                          {activeStageDetail === 4 && 'Profile under review by procurement, legal & compliance approvers prior to transaction readiness.'}
                          {activeStageDetail === 5 && 'Your profile is reviewed and approved. You are now authorized to receive purchase orders, send invoices, and exchange transaction-related documents.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {activeStageDetail === 2 && !isSubmitted && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveStageDetail(null);
                            const el = document.getElementById('onboarding-form-card');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center space-x-1"
                        >
                          <span>Go to Form</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveStageDetail(null)}
                        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                        title="Close details"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Revision Mode Guidance Banner (Slim & Informational Only) */}
              {isSubmitted && isEditingAfterSubmit && (
                <div className="p-3 sm:px-4 bg-amber-50/90 border border-amber-300 text-amber-950 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>Application in Revision Mode</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/90 border border-amber-200 text-amber-900 font-semibold">
                          {activeInvitation.invitationCode}-SUBMITTED
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        All sections are unlocked for editing. Update your details, then click <strong>&quot;Resubmit&quot;</strong> in the top header or at the bottom of the review step to save and transmit your changes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Card */}
            <div id="onboarding-form-card" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs space-y-5">
              
              {/* Section Header with Step Badge, Title with inline count & Clean Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3.5 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Circular Step Badge (Unified Circle Standard) */}
                  <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-medium text-xs shrink-0 bg-slate-900 text-white shadow-2xs">
                    <span>{activeStep}</span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-1.5 flex-wrap">
                      <span>{steps[activeStep - 1].title}</span>
                      {getStepRecordCount(activeStep) !== null && (
                        <span className="text-xs font-normal text-slate-500 font-mono">
                          ({getStepRecordCount(activeStep)})
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                {/* Section Action Zone */}
                <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                  {/* In pre-submission draft OR active revision mode: show clean Add button for grid steps */}
                  {(!isSubmitted || isEditingAfterSubmit) && isGridStep(activeStep) && (
                    <button
                      type="button"
                      onClick={() => setOpenAddTrigger(prev => prev + 1)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                      title={getStepAddTooltip(activeStep) || 'Add new record'}
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Add</span>
                    </button>
                  )}

                  {/* Step 9 View Switcher: Compact Icon Toggle (Complete Form Dossier vs Compact Summary) */}
                  {activeStep === 9 && (
                    <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 select-none">
                      <button
                        type="button"
                        onClick={() => setReviewViewMode('DOSSIER')}
                        title="Complete Form View"
                        aria-label="Complete Form View"
                        className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                          reviewViewMode === 'DOSSIER'
                            ? 'bg-white text-emerald-700 shadow-2xs'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewViewMode('SUMMARY')}
                        title="Compact Summary View"
                        aria-label="Compact Summary View"
                        className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                          reviewViewMode === 'SUMMARY'
                            ? 'bg-white text-emerald-700 shadow-2xs'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* In submitted read-only view mode: keep only the clean eye icon */}
                  {isSubmitted && !isEditingAfterSubmit && activeStep !== 9 && (
                    <span 
                      className="p-1 text-slate-400 hover:text-slate-600 transition flex items-center cursor-default" 
                      title="Submitted (Read-Only Mode)"
                    >
                      <Eye className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION 1: BASIC DETAILS & CORPORATE GOVERNANCE (UNIFIED SINGLE GRID) */}
              {activeStep === 1 && (
                <div className="border border-slate-200 rounded-xl bg-white shadow-2xs p-4 sm:p-5 lg:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-4.5">
                    {/* Legal Company Name */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                            Legal Company Name <span className="text-red-500">*</span>
                          </label>
                          <AiFilledBadge isAiFilled={aiFilledFields.legalName} fieldName="Legal Company Name" />
                        </div>
                      </div>
                      <input
                        type="text"
                        disabled={isFormReadOnly}
                        value={legalName}
                        onChange={(e) => {
                          setLegalName(e.target.value);
                          if (aiFilledFields.legalName) {
                            setAiFilledFields(prev => ({ ...prev, legalName: false }));
                          }
                        }}
                        placeholder="e.g. Acme Industrial Tech Inc."
                        className={`w-full px-3 py-2 text-xs font-medium rounded-lg border transition ${
                          isFormReadOnly
                            ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                            : highlightField === 'legalName'
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50'
                            : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Doing Business As (Trade Name) */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Doing Business As
                        </label>
                      </div>
                      <input
                        type="text"
                        disabled={isFormReadOnly}
                        value={tradeName}
                        onChange={(e) => setTradeName(e.target.value)}
                        placeholder="e.g. Acme Tech Solutions"
                        className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                          isFormReadOnly
                            ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                            : highlightField === 'tradeName'
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50'
                            : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Formally Known As / Formerly Known As */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Formally Known As
                        </label>
                      </div>
                      <input
                        type="text"
                        disabled={isFormReadOnly}
                        value={formerlyKnownAs}
                        onChange={(e) => setFormerlyKnownAs(e.target.value)}
                        placeholder="e.g. Acme Hardware & Sensors Corp"
                        className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                          isFormReadOnly
                            ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                            : highlightField === 'formerlyKnownAs'
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50'
                            : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Origination */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Origination
                        </label>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={origination}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg cursor-default"
                      />
                    </div>

                    {/* Partner Status */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Partner Status <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <SearchableSelect
                        disabled={isFormReadOnly}
                        value={partnerStatus === 'ACTIVE' ? 'Active' : partnerStatus === 'NOT_INVITED' ? 'Not Invited' : 'Invited'}
                        onChange={(val) => setPartnerStatus(val.toUpperCase().replace(' ', '_') as 'INVITED' | 'NOT_INVITED' | 'ACTIVE')}
                        placeholder="Select Partner Status..."
                        options={['Invited', 'Not Invited', 'Active']}
                      />
                    </div>

                    {/* Supplier Manager Name */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Supplier Manager Name <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <SearchableSelect
                        options={AVAILABLE_SUPPLIER_MANAGERS}
                        value={supplierManager}
                        onChange={(val) => setSupplierManager(val)}
                        placeholder="Select Supplier Manager..."
                        searchPlaceholder="Search manager name or category..."
                        disabled={isFormReadOnly}
                      />
                    </div>

                    {/* Does company have DUNS */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap" title="Does your company have DUNS Numbers?">
                          Has D&B DUNS Number?
                        </label>
                      </div>
                      <SearchableSelect
                        disabled={isFormReadOnly}
                        value={hasDuns ? 'Yes' : 'No'}
                        onChange={(val) => setHasDuns(val === 'Yes')}
                        placeholder="Select..."
                        options={['Yes', 'No']}
                      />
                    </div>

                    {/* DUNS Number */}
                    {hasDuns && (
                      <div className="space-y-1.5 lg:col-span-2">
                        <div className="flex items-center justify-between min-h-[20px] h-5">
                          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                            DUNS Number <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            disabled={isFormReadOnly}
                            value={dunsNumber}
                            onChange={(e) => setDunsNumber(e.target.value)}
                            placeholder="00-000-0000"
                            className={`w-full px-3 py-2 text-xs font-mono rounded-lg border transition ${
                              isFormReadOnly
                                ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                                : highlightField === 'dunsNumber'
                                ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50'
                                : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Normalised Corporate Name */}
                    <div className={`space-y-1.5 ${hasDuns ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Normalised Corporate Name
                        </label>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={normalisedName}
                        placeholder="ACME INDUSTRIAL TECH INC"
                        className="w-full px-3 py-2 text-xs font-mono font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg cursor-default"
                      />
                    </div>

                    {/* Subcategory (UNSPSC) */}
                    <div className="space-y-2 lg:col-span-3">
                      <div className="h-6 flex items-center justify-between gap-1">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Subcategory (Procurement UNSPSC) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0">
                          {subcategories.length} mapped
                        </span>
                      </div>

                      {!isFormReadOnly && (
                        <SearchableSelect
                          options={AVAILABLE_SUBCATEGORIES.filter((opt) => !subcategories.includes(opt))}
                          placeholder="+ Add Subcategory..."
                          searchPlaceholder="Search subcategory or UNSPSC code..."
                          resetOnSelect
                          onSelect={(val) => {
                            if (val && !subcategories.includes(val)) {
                              setSubcategories([...subcategories, val]);
                            }
                          }}
                          disabled={isFormReadOnly}
                          emptyMessage="All catalog subcategories mapped"
                        />
                      )}

                      <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[120px] max-h-[160px] overflow-y-auto">
                        {subcategories.map((sub, idx) => {
                          const hasCode = sub.includes(' - ');
                          const code = hasCode ? sub.split(' - ')[0] : null;
                          const name = hasCode ? sub.substring(sub.indexOf(' - ') + 3) : sub;
                          return (
                            <div 
                              key={idx} 
                              className="flex items-start justify-between p-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md shadow-2xs group transition gap-1.5"
                            >
                              <div className="flex items-start gap-1.5 min-w-0 flex-1">
                                {code && (
                                  <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200 shrink-0 mt-0.5">
                                    {code}
                                  </span>
                                )}
                                <span className="font-medium text-slate-800 text-xs leading-snug break-words">
                                  {name}
                                </span>
                              </div>
                              {!isFormReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => setSubcategories(subcategories.filter((s) => s !== sub))}
                                  className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded transition shrink-0 cursor-pointer mt-0.5"
                                  title={`Remove ${sub}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        {subcategories.length === 0 && (
                          <div className="h-[104px] flex items-center justify-center text-xs text-slate-400 italic">
                            No subcategories mapped.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Org. Entity Service Locations */}
                    <div className="space-y-2 lg:col-span-3">
                      <div className="h-6 flex items-center justify-between gap-1">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Org. Entity Service Locations <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0">
                          {serviceLocations.length} locations
                        </span>
                      </div>

                      {!isFormReadOnly && (
                        <SearchableSelect
                          options={AVAILABLE_SERVICE_LOCATIONS.filter((opt) => !serviceLocations.includes(opt))}
                          placeholder="+ Add Location..."
                          searchPlaceholder="Search service location..."
                          resetOnSelect
                          onSelect={(val) => {
                            if (val && !serviceLocations.includes(val)) {
                              setServiceLocations([...serviceLocations, val]);
                            }
                          }}
                          disabled={isFormReadOnly}
                          emptyMessage="All service locations mapped"
                        />
                      )}

                      <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[120px] max-h-[160px] overflow-y-auto">
                        {serviceLocations.map((loc, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-start justify-between p-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md shadow-2xs group transition gap-1.5"
                          >
                            <span className="font-medium text-slate-800 text-xs leading-snug break-words flex-1">
                              {loc}
                            </span>
                            {!isFormReadOnly && (
                              <button
                                type="button"
                                onClick={() => setServiceLocations(serviceLocations.filter((l) => l !== loc))}
                                className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded transition shrink-0 cursor-pointer mt-0.5"
                                title={`Remove ${loc}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {serviceLocations.length === 0 && (
                          <div className="h-[104px] flex items-center justify-center text-xs text-slate-400 italic">
                            No service locations mapped.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: BUSINESS INFORMATION (UNIFIED SINGLE GRID) */}
              {activeStep === 2 && (
                <div className="border border-slate-200 rounded-xl bg-white shadow-2xs p-4 sm:p-5 lg:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-4.5">
                    {/* Currency */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Currency <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <SearchableSelect
                        options={AVAILABLE_CURRENCIES}
                        value={reportingCurrency}
                        onChange={(val) => setReportingCurrency(val)}
                        placeholder="Select Currency..."
                        searchPlaceholder="Search currency code (e.g. USD, EUR, GBP)..."
                        disabled={isFormReadOnly}
                      />
                    </div>

                    {/* Annual Revenue (in Millions) */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Annual Revenue (in Millions) <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-slate-500 font-mono">
                          {currentCurrencySymbol}
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          disabled={isFormReadOnly}
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(e.target.value)}
                          placeholder="38.4"
                          className={`w-full ${currentCurrencySymbol.length > 2 ? 'pl-11' : currentCurrencySymbol.length > 1 ? 'pl-9' : 'pl-7'} pr-14 py-2 text-xs font-semibold rounded-lg border transition ${
                            isFormReadOnly
                              ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                              : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[11px] font-bold text-slate-400">
                          M
                        </div>
                      </div>
                    </div>

                    {/* Total Number of Employees */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Total Number of Employees <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        disabled={isFormReadOnly}
                        value={totalEmployees}
                        onChange={(e) => setTotalEmployees(e.target.value)}
                        placeholder="280"
                        className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                          isFormReadOnly
                            ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                            : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Date of Incorporate (MM-DD-YYYY) */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5 gap-1">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Date of Incorporate
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono font-normal shrink-0">MM-DD-YYYY</span>
                      </div>
                      <input
                        type="date"
                        disabled={isFormReadOnly}
                        value={incorporationDate}
                        onChange={(e) => setIncorporationDate(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                          isFormReadOnly
                            ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                            : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Country / Jurisdiction (ISO 3166-1) */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5 gap-1">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Country / Jurisdiction <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono font-normal shrink-0">ISO-3166</span>
                      </div>
                      <SearchableSelect
                        options={AVAILABLE_COUNTRIES}
                        value={country}
                        onChange={(val) => setCountry(val)}
                        placeholder="Select Country..."
                        searchPlaceholder="Search country or code (e.g. US, Japan, Germany)..."
                        disabled={isFormReadOnly}
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Website
                        </label>
                      </div>
                      <input
                        type="url"
                        disabled={isFormReadOnly}
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                          isFormReadOnly
                            ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                            : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Registered Corporate Address */}
                    <div className="space-y-1.5 lg:col-span-6">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Registered Corporate Address <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          disabled={isFormReadOnly}
                          value={registeredAddress}
                          onChange={(e) => setRegisteredAddress(e.target.value)}
                          placeholder="Street address, Suite, City, State, ZIP"
                          className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                            isFormReadOnly
                              ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                              : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Detailed Description of Service */}
                    <div className="space-y-1.5 lg:col-span-6">
                      <div className="flex items-center justify-between min-h-[20px] h-5">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Detailed Description of Service <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-[10px] font-mono font-medium ${
                          descriptionOfServices.length > 500 ? 'text-rose-600 font-bold' : 'text-slate-400'
                        }`}>
                          {descriptionOfServices.length}/500 chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={500}
                        disabled={isFormReadOnly}
                        value={descriptionOfServices}
                        onChange={(e) => setDescriptionOfServices(e.target.value)}
                        placeholder="Provide detailed description of services, enterprise capabilities, or manufactured goods..."
                        className={`w-full px-3 py-2 text-xs rounded-lg border transition resize-none ${
                          isFormReadOnly
                            ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                            : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Target Business Units */}
                    <div className="space-y-2 lg:col-span-3">
                      <div className="h-6 flex items-center justify-between gap-1">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Target Business Units <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0">
                          {businessUnits.length} assigned
                        </span>
                      </div>

                      {!isFormReadOnly && (
                        <SearchableSelect
                          options={AVAILABLE_BUSINESS_UNITS.filter((opt) => !businessUnits.includes(opt))}
                          placeholder="+ Add Business Unit..."
                          searchPlaceholder="Search business unit..."
                          resetOnSelect
                          onSelect={(val) => {
                            if (val && !businessUnits.includes(val)) {
                              setBusinessUnits([...businessUnits, val]);
                            }
                          }}
                          disabled={isFormReadOnly}
                          emptyMessage="All business units assigned"
                        />
                      )}

                      <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[120px] max-h-[160px] overflow-y-auto">
                        {businessUnits.map((bu, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-start justify-between p-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md shadow-2xs group transition gap-1.5"
                          >
                            <span className="font-medium text-slate-800 text-xs leading-snug break-words flex-1">
                              {bu}
                            </span>
                            {!isFormReadOnly && (
                              <button
                                type="button"
                                onClick={() => setBusinessUnits(businessUnits.filter((b) => b !== bu))}
                                className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded transition shrink-0 cursor-pointer mt-0.5"
                                title={`Remove ${bu}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {businessUnits.length === 0 && (
                          <div className="h-[104px] flex items-center justify-center text-xs text-slate-400 italic">
                            No business units assigned.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Supported Languages */}
                    <div className="space-y-2 lg:col-span-3">
                      <div className="h-6 flex items-center justify-between gap-1">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Supported Languages <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                          {operatingLanguages.length} active
                        </span>
                      </div>

                      {!isFormReadOnly && (
                        <SearchableSelect
                          options={AVAILABLE_LANGUAGES.filter((opt) => !operatingLanguages.includes(opt))}
                          placeholder="+ Add Language..."
                          searchPlaceholder="Search language..."
                          resetOnSelect
                          onSelect={(val) => {
                            if (val && !operatingLanguages.includes(val)) {
                              setOperatingLanguages([...operatingLanguages, val]);
                            }
                          }}
                          disabled={isFormReadOnly}
                          emptyMessage="All languages selected"
                        />
                      )}

                      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[120px] max-h-[160px] overflow-y-auto content-start">
                        {operatingLanguages.map((lang, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-md shadow-2xs group hover:border-slate-300 transition"
                          >
                            <span>{lang}</span>
                            {!isFormReadOnly && (
                              <button
                                type="button"
                                onClick={() => setOperatingLanguages(operatingLanguages.filter((l) => l !== lang))}
                                className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded transition cursor-pointer"
                                title={`Remove ${lang}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))}

                        {operatingLanguages.length === 0 && (
                          <div className="h-[104px] w-full flex items-center justify-center text-xs text-slate-400 italic">
                            No languages selected.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: IDENTIFICATION INFORMATION GRID */}
              {activeStep === 3 && (
                <GepIdentificationGrid items={identifications} onChange={setIdentifications} readOnly={isFormReadOnly} openAddTrigger={openAddTrigger} />
              )}

              {/* SECTION 4: CONTACT INFORMATION */}
              {activeStep === 4 && (
                <GepContactMatrix contacts={contacts} onChange={setContacts} readOnly={isFormReadOnly} openAddTrigger={openAddTrigger} />
              )}

              {/* SECTION 5: LOCATION */}
              {activeStep === 5 && (
                <GepLocationGrid locations={locations} onChange={setLocations} readOnly={isFormReadOnly} openAddTrigger={openAddTrigger} />
              )}

              {/* SECTION 6: BANKING INFORMATION */}
              {activeStep === 6 && (
                <GepBankingGrid bankAccounts={bankAccounts} locations={locations} onChange={setBankAccounts} readOnly={isFormReadOnly} openAddTrigger={openAddTrigger} />
              )}

              {/* SECTION 7: PAYMENT TERMS */}
              {activeStep === 7 && (
                <GepCommercialTerms settings={commercialSettings} onChange={setCommercialSettings} readOnly={isFormReadOnly} />
              )}

              {/* SECTION 8: DIVERSITY & CERTIFICATES */}
              {activeStep === 8 && (
                <GepCertificatesGrid certificates={certificates} onChange={setCertificates} readOnly={isFormReadOnly} openAddTrigger={openAddTrigger} />
              )}

              {/* SECTION 9: COMPLETE FORM DOSSIER REVIEW */}
              {activeStep === 9 && (
                <div className="space-y-5">
                  {/* 1. DOSSIER VIEW (Default: Full Complete Form View) */}
                  {reviewViewMode === 'DOSSIER' && (
                    <div className="space-y-5">
                      {/* Section 1: Basic Details */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                              <span>1</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">1. Basic Details</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep(1)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit Section</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Legal Company Name</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-900 flex items-center justify-between">
                              <span>{legalName}</span>
                              <span className="text-[10px] font-sans font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Verified</span>
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Doing Business As</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-normal">
                              {tradeName || '—'}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Formally Known As</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-normal">
                              {formerlyKnownAs || '—'}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Origination</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-normal">
                              {origination}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Partner Status</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-medium capitalize">
                              {partnerStatus.toLowerCase()}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Supplier Manager</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-medium truncate">
                              {supplierManager}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">D&B DUNS Number</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800 flex items-center justify-between">
                              <span>{dunsNumber || '—'}</span>
                              <span className="text-[10px] font-sans font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">D&B Matched</span>
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-4">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Normalised Corporate Name</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800 text-xs">
                              {normalisedName}
                            </div>
                          </div>

                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Subcategories (UNSPSC)</label>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 min-h-[42px]">
                              {subcategories.map(sub => (
                                <span key={sub} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-normal text-slate-700">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Service Locations</label>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 min-h-[42px]">
                              {serviceLocations.map(loc => (
                                <span key={loc} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-normal text-slate-700">
                                  {loc}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Business Information */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                              <span>2</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">2. Business Information</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep(2)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit Section</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reporting Currency</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-medium">
                              {reportingCurrency}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Annual Revenue</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900">
                              {currentCurrencySymbol}{annualRevenue} Million
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Headcount</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900">
                              {totalEmployees} Employees
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Incorporation</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800">
                              {incorporationDate}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Country / Jurisdiction</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-medium">
                              {country}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Website</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-medium truncate">
                              {website || '—'}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-6">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered Corporate Address</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-medium">
                              {registeredAddress}
                            </div>
                          </div>

                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operating Languages</label>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 min-h-[42px]">
                              {operatingLanguages.map(lang => (
                                <span key={lang} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-800">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Business Units</label>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 min-h-[42px]">
                              {businessUnits.map(bu => (
                                <span key={bu} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-800">
                                  {bu}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1 lg:col-span-6">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description of Service</label>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                              {descriptionOfServices}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Identification Information */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                              <span>3</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">3. Identification Information</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep(3)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit Section</span>
                          </button>
                        </div>
                        <GepIdentificationGrid items={identifications} onChange={setIdentifications} readOnly={true} />
                      </div>

                      {/* Section 4: Contact Information */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                              <span>4</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">4. Contact Information</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep(4)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit Section</span>
                          </button>
                        </div>
                        <GepContactMatrix contacts={contacts} onChange={setContacts} readOnly={true} />
                      </div>

                      {/* Section 5: Location */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                              <span>5</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">5. Location</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep(5)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit Section</span>
                          </button>
                        </div>
                        <GepLocationGrid locations={locations} onChange={setLocations} readOnly={true} />
                      </div>

                      {/* Section 6: Banking Information */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                              <span>6</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">6. Banking Information</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep(6)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit Section</span>
                          </button>
                        </div>
                        <GepBankingGrid bankAccounts={bankAccounts} locations={locations} onChange={setBankAccounts} readOnly={true} />
                      </div>

                      {/* Section 7: Payment Terms */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                              <span>7</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">7. Payment Terms</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep(7)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit Section</span>
                          </button>
                        </div>
                        <GepCommercialTerms settings={commercialSettings} onChange={setCommercialSettings} readOnly={true} />
                      </div>

                      {/* Section 8: Diversity & Certificates */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs shrink-0">
                              <span>8</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">8. Diversity & Certificates</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep(8)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit Section</span>
                          </button>
                        </div>
                        <GepCertificatesGrid certificates={certificates} onChange={setCertificates} readOnly={true} />
                      </div>
                    </div>
                  )}

                  {/* 2. COMPACT SUMMARY VIEW (Alternative Quick Overview) */}
                  {reviewViewMode === 'SUMMARY' && (
                    <div className={`grid gap-3.5 ${isDock ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                      {/* Card 1: Basic Details */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>1. Basic Details</span>
                          <button onClick={() => setActiveStep(1)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate">{legalName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{tradeName} • {partnerStatus === 'INVITED' ? 'Invited' : partnerStatus === 'ACTIVE' ? 'Active' : 'Not Invited'}</div>
                        <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{serviceLocations.length} Regions • {subcategories.length} Categories</span>
                        </div>
                      </div>

                      {/* Card 2: Business Information */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>2. Business Information</span>
                          <button onClick={() => setActiveStep(2)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs font-medium text-slate-900 truncate">{currentCurrencySymbol}{annualRevenue}M Rev ({reportingCurrency.split(' - ')[0]})</div>
                        <div className="text-[11px] text-slate-500 truncate">{totalEmployees} Employees • Inc: {incorporationDate}</div>
                        <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{operatingLanguages.length} Languages • {businessUnits.length} BUs</span>
                        </div>
                      </div>

                      {/* Card 3: Identification Information */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>3. Identification Information</span>
                          <button onClick={() => setActiveStep(3)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs font-medium text-slate-900">{identifications.length} Registered Tax IDs</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Primary: {identifications.find(i => i.isPrimary)?.idType || 'EIN'} ({identifications.find(i => i.isPrimary)?.idNumber || '84-1294812'})
                        </div>
                        <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Form W-9 &amp; Tax IDs Verified</span>
                        </div>
                      </div>

                      {/* Card 4: Contact Information */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>4. Contact Information</span>
                          <button onClick={() => setActiveStep(4)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs font-medium text-slate-900">{contacts.length} Liaisons Assigned</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Primary: {contacts.find(c => c.isPrimary) ? `${contacts.find(c => c.isPrimary)?.firstName} ${contacts.find(c => c.isPrimary)?.lastName}` : 'Elena Rostova'}
                        </div>
                        <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>AP, AR, Legal Roles Mapped</span>
                        </div>
                      </div>

                      {/* Card 5: Location */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>5. Location</span>
                          <button onClick={() => setActiveStep(5)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs font-medium text-slate-900">{locations.length} Operating Facilities</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          HQ: {locations.find(l => l.types.includes('HQ'))?.name || 'Austin Corporate HQ'}
                        </div>
                        <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Remit-To &amp; Ship-From Active</span>
                        </div>
                      </div>

                      {/* Card 6: Banking Information */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>6. Banking Information</span>
                          <button onClick={() => setActiveStep(6)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs font-medium text-slate-900">{bankAccounts.length} Disbursement Accounts</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {bankAccounts.find(b => b.isDefault)?.bankName || 'JPMorgan Chase'} (•••{bankAccounts.find(b => b.isDefault)?.accountNumberMasked.slice(-4) || '8210'})
                        </div>
                        <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>FedACH Letter Validated</span>
                        </div>
                      </div>

                      {/* Card 7: Payment Terms */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>7. Payment Terms</span>
                          <button onClick={() => setActiveStep(7)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs font-medium text-slate-900 truncate">
                          {commercialSettings.matchingType.split('(')[0].trim()} ({commercialSettings.paymentTerms})
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {commercialSettings.primaryCurrency} • {commercialSettings.disbursementMethod?.split('/')[0].trim() || 'ACH'} • {commercialSettings.eInvoicingFramework?.split('(')[0].trim() || 'PEPPOL'}
                        </div>
                        <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{commercialSettings.incoTerms.split('-')[0].trim() || 'FCA'} Delivery Protocol ({commercialSettings.namedDeliveryPlace?.split(',')[0] || 'Austin'})</span>
                        </div>
                      </div>

                      {/* Card 8: Diversity & Certificates */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                          <span>8. Diversity &amp; Certificates</span>
                          <button onClick={() => setActiveStep(8)} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs font-medium text-slate-900">{certificates.length} Credentials Vaulted</div>
                        <div className="text-[11px] text-slate-500 truncate">COI, ISO 27001, SOC 2, WBE</div>
                        <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Certificates Active &amp; Validated</span>
                        </div>
                      </div>

                      {/* Card 9: Status & Readiness */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
                          <span>9. Readiness Status</span>
                        </div>
                        <div className="text-xs font-medium text-slate-900">{isSubmitted ? 'Formally Submitted' : 'Ready for Submission'}</div>
                        <div className="text-[11px] text-slate-500">{isSubmitted ? `Submitted on ${submittedAt || 'Nov 4, 2026'}` : 'All 8 prerequisite modules verified.'}</div>
                        <div className="text-[11px] text-slate-600 font-normal flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Audit Protocol Passed</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION FOOTER: CRISP PREVIOUS / SAVE & NEXT MATCHING MASTER PROFILE */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Previous: {steps[activeStep - 2]?.shortLabel || steps[activeStep - 2]?.title}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={true}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-300 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5 select-none"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                )}

                <div className="flex items-center space-x-2.5">
                  {activeStep < 9 ? (
                    <button
                      type="button"
                      onClick={() => handleSaveAndContinue(activeStep + 1)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs group"
                    >
                      <span>Save & Next: {steps[activeStep]?.shortLabel || steps[activeStep]?.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : isSubmitted && !isEditingAfterSubmit ? (
                    <button
                      type="button"
                      onClick={handleStartEditing}
                      className="px-5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition cursor-pointer flex items-center space-x-2 shadow-2xs group"
                      title="Unlock application to make corrections"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Edit Application</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={submitting}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-2 shadow-xs group"
                      title={isSubmitted ? "Resubmit Application" : "Submit Application"}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {submitting 
                          ? 'Submitting...' 
                          : isEditingAfterSubmit 
                          ? 'Resubmit' 
                          : 'Submit'
                        }
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        )}

      </div>

      {/* Universal Master Profile 1-to-Many Synchronization Engine Modal */}
      <MasterProfileSyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        buyerName={activeInvitation.buyerName}
        invitationCode={activeInvitation.invitationCode}
        isLocked={isSubmitted && !isEditingAfterSubmit}
        onApplySync={handleApplyMasterSync}
      />

      </div>
    </div>
  );
};
