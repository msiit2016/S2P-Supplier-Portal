import React, { useState, useEffect, useRef } from 'react';
import { ApiClient } from '../../api/client.js';
import { 
  GlobalSupplierProfile, 
  BuyerSpecificProfile,
  GepIdentificationItem,
  GepContactItem,
  GepLocationItem,
  GepBankItem,
  GepCommercialSettings,
  GepCertificateItem
} from '../../types/index.js';
import { onPageAction, broadcastPageContext, PageAction } from '../../services/pageActionBridge.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { SearchableSelect } from '../../components/common/SearchableSelect.js';
import { VerificationIndicator } from '../../components/common/VerificationIndicator.js';
import { 
  AiFilledBadge, 
  AVAILABLE_SUBCATEGORIES, 
  AVAILABLE_BUSINESS_UNITS, 
  AVAILABLE_SERVICE_LOCATIONS, 
  AVAILABLE_LANGUAGES, 
  AVAILABLE_SUPPLIER_MANAGERS, 
  getCurrencySymbol, 
  AVAILABLE_CURRENCIES, 
  AVAILABLE_COUNTRIES 
} from './OnboardingRequest.js';
import { GepIdentificationGrid } from '../../components/onboarding/GepIdentificationGrid.js';
import { GepContactMatrix } from '../../components/onboarding/GepContactMatrix.js';
import { GepLocationGrid } from '../../components/onboarding/GepLocationGrid.js';
import { GepBankingGrid } from '../../components/onboarding/GepBankingGrid.js';
import { GepCommercialTerms } from '../../components/onboarding/GepCommercialTerms.js';
import { GepCertificatesGrid } from '../../components/onboarding/GepCertificatesGrid.js';
import { 
  Globe, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  CreditCard, 
  FileText, 
  ChevronRight, 
  Plus, 
  Sliders, 
  Share2, 
  Eye, 
  Award,
  Clock,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  Briefcase,
  UserCheck,
  FileCheck2,
  BadgePercent,
  Check,
  Search,
  Landmark,
  Shield,
  Layers,
  CheckCheck,
  ArrowDownUp,
  UploadCloud,
  CheckSquare,
  X,
  Send,
  KeyRound,
  Edit3,
  Save,
  Printer,
  Download,
  Trash2,
  ArrowUpRight,
  Zap,
  HelpCircle,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  ChevronLeft,
  Camera,
  Link2,
  RotateCcw,
  Info
} from 'lucide-react';

const MASTER_PROFILE_STORAGE_KEY = 'verisource_master_profile';

export const createBlankSupplierProfile = (
  legalName: string,
  contactName: string,
  email: string,
  country: string = 'United States'
): GlobalSupplierProfile => {
  const parts = (contactName || '').trim().split(' ');
  const firstName = parts[0] || 'Primary';
  const lastName = parts.slice(1).join(' ') || 'Contact';
  const cleanOrg = (legalName || '').trim() || 'New Supplier';
  const slug = cleanOrg.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'supplier-profile';

  return {
    id: `gprof-${Date.now()}`,
    supplierOrgId: `supp-org-${Date.now()}`,
    legalName: cleanOrg,
    tradeName: '',
    formerlyKnownAs: '',
    normalisedName: cleanOrg.toUpperCase(),
    origination: 'Verisource',
    partnerStatus: 'ACTIVE',
    supplierManager: '',
    hasDuns: false,
    dunsNumber: '',
    taxIdMasked: '',
    incorporationDate: '',
    entityStructure: '',
    stateOfIncorporation: '',
    primaryNaicsCode: '',
    country: country || 'United States',
    hqAddress: '',
    registeredAddress: '',
    website: '',
    businessEmail: email || '',
    phone: '',
    industryCategory: '',
    employeeCountRange: '',
    reportingCurrency: 'USD ($) - US Dollar',
    annualRevenue: '',
    totalEmployees: '',
    description: '',
    subcategories: [],
    serviceLocations: [],
    businessUnits: [],
    operatingLanguages: ['English'],
    publicPassportSlug: slug,
    passportUrl: `https://verisource.network/p/${slug}`,
    isPubliclyListed: false,
    profileCompletionScore: 15,
    verificationBadges: {
      tinVerified: false,
      bankVerified: false,
      sanctionsClear: false,
      securityAssured: false
    },
    masterVault: {
      w9Status: 'PENDING',
      insuranceStatus: 'EXPIRED',
      insuranceExpiryDate: '',
      insuranceCoverageAmount: '',
      iso27001Status: 'NOT_APPLICABLE',
      soc2Status: 'IN_PROGRESS',
      bankLetterStatus: 'PENDING'
    },
    defaultPaymentTerms: 'Net 30',
    updatedAt: new Date().toISOString(),
    identifications: [],
    gepContacts: [
      {
        id: `cnt-${Date.now()}`,
        firstName,
        lastName,
        email: email || '',
        phone: '',
        isPrimary: true,
        status: 'REGISTERED',
        role: 'OPERATIONS',
        orgEntity: 'Executive Management',
        serviceLocation: 'Headquarters'
      }
    ],
    locations: [],
    gepBankAccounts: [],
    commercialSettings: {
      matchingType: '3-Way Match',
      baselineTriggerDate: 'Goods Receipt Date (GR Date)',
      paymentTerms: 'Net 30',
      billingScheduleStructure: 'STANDARD_PO',
      milestoneBillingProtocol: '',
      primaryCurrency: 'USD',
      disbursementMethod: 'ACH / Direct Deposit',
      ingestionChannel: 'Supplier Portal Upload',
      eInvoicingFramework: 'Standard',
      eInvoicingEndpointId: '',
      incoTerms: 'FOB - Free on Board',
      namedDeliveryPlace: '',
      earlyPaymentDiscount: false,
      maxDiscountTolerance: 0,
      accelerationWindow: 'Standard Net 30',
      relationshipType: 'Standard Supplier',
      supplierRiskType: 'LOW',
      businessCriticality: 'ROUTINE'
    },
    gepCertificates: []
  };
};

export const computeProfileScore = (p: Partial<GlobalSupplierProfile>): number => {
  let score = 0;
  if (p.legalName && p.businessEmail && p.country) score += 15;
  if (p.tradeName || p.formerlyKnownAs) score += 5;
  if (p.hqAddress || p.stateOfIncorporation) score += 10;
  if (p.gepContacts && p.gepContacts.length > 0) score += 15;
  if (p.locations && p.locations.length > 0) score += 10;
  if ((p.identifications && p.identifications.length > 0) || p.taxIdMasked) score += 15;
  if (p.gepBankAccounts && p.gepBankAccounts.length > 0) score += 15;
  if (p.gepCertificates && p.gepCertificates.length > 0) score += 15;
  return Math.min(100, Math.max(15, score));
};

const DEFAULT_ACME_PROFILE: GlobalSupplierProfile = {
  id: 'gprof-001',
  supplierOrgId: 'supp-org-1',
  legalName: 'Acme Industrial Tech Inc.',
  tradeName: 'Acme Tech Solutions',
  formerlyKnownAs: 'Acme Hardware & Sensors Corp',
  normalisedName: 'ACME INDUSTRIAL TECH INC',
  origination: 'Verisource',
  partnerStatus: 'INVITED',
  supplierManager: 'Sarah Jenkins (Senior Category Manager - Cloud & IT)',
  hasDuns: true,
  dunsNumber: '09-842-1928',
  taxIdMasked: '84-1294812',
  incorporationDate: '2016-04-12',
  entityStructure: 'C-Corporation (Private)',
  stateOfIncorporation: 'Delaware, USA',
  primaryNaicsCode: '334111 - Electronic Computer Manufacturing',
  country: 'United States (US)',
  hqAddress: '100 Industrial Parkway, Suite 400, Austin, TX 78701',
  registeredAddress: '100 Industrial Parkway, Suite 400, Austin, TX 78701',
  website: 'https://acmeindustrialtech.example.com',
  businessEmail: 'elena@acmeindustrial.com',
  phone: '+1 (512) 555-0199',
  industryCategory: 'IT Hardware, Cloud Infrastructure & Advanced Engineering',
  employeeCountRange: '280 Employees',
  reportingCurrency: 'USD ($) - US Dollar',
  annualRevenue: '38.4',
  totalEmployees: '280',
  description: 'Leading provider of enterprise cloud compute nodes, specialized cybersecurity architecture, and high-tolerance industrial sensor hardware engineered for aerospace, defense, and high-volume commercial supply chains (AS9100 Rev D, ITAR compliant, CMMC Level 2).',
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
  businessUnits: [
    'Industrial & Discrete Manufacturing',
    'Defense & Aerospace Systems',
    'Enterprise IT & Telemetry Infrastructure'
  ],
  operatingLanguages: [
    'English',
    'German',
    'Spanish'
  ],
  publicPassportSlug: 'acme-industrial-tech',
  passportUrl: 'https://verisource.network/p/acme-industrial-tech',
  isPubliclyListed: true,
  profileCompletionScore: 98,
  verificationBadges: {
    tinVerified: true,
    bankVerified: true,
    sanctionsClear: true,
    securityAssured: true,
    diversityCertified: 'Women-Owned Business Enterprise (WBE Certified)'
  },
  masterVault: {
    w9Status: 'VERIFIED',
    insuranceStatus: 'VERIFIED',
    insuranceExpiryDate: '2026-12-31',
    insuranceCoverageAmount: '$5,000,000 Aggregate Commercial General Liability',
    iso27001Status: 'VERIFIED',
    soc2Status: 'VERIFIED',
    bankLetterStatus: 'VERIFIED'
  },
  defaultPaymentTerms: '2/10 Net 30',
  updatedAt: new Date().toISOString(),
  identifications: [
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
      fileName: 'Federal_Central_Tax_Office_VAT_Cert.pdf',
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
  ],
  gepContacts: [
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
  ],
  gepBankAccounts: [
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
  gepCertificates: [
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
  keyContacts: [
    {
      id: 'cnt-01',
      role: 'Executive & Business',
      name: 'Elena Rostova',
      title: 'VP of Enterprise Partnerships',
      email: 'elena@acmeindustrial.com',
      phone: '+1 (512) 555-0199',
      isSignatory: true,
      verificationStatus: 'VERIFIED'
    },
    {
      id: 'cnt-02',
      role: 'Billing & Accounts Receivable',
      name: 'Marcus Vance',
      title: 'Corporate Controller / Treasury',
      email: 'billing@acmeindustrial.com',
      phone: '+1 (512) 555-0199 x104',
      isSignatory: false,
      verificationStatus: 'VERIFIED'
    },
    {
      id: 'cnt-03',
      role: 'Cybersecurity & Compliance',
      name: 'David K. Chen',
      title: 'Chief Information Security Officer',
      email: 'security@acmeindustrial.com',
      phone: '+1 (512) 555-0199 x108',
      isSignatory: false,
      verificationStatus: 'VERIFIED'
    },
    {
      id: 'cnt-04',
      role: 'Legal & Contract Signatory',
      name: 'Sarah Jenkins, Esq.',
      title: 'General Counsel',
      email: 'legal@acmeindustrial.com',
      phone: '+1 (512) 555-0199 x110',
      isSignatory: true,
      verificationStatus: 'VERIFIED'
    }
  ],
  bankingDetails: {
    bankName: 'JPMorgan Chase Bank, N.A.',
    accountNickName: 'Primary Corporate Operating Checking',
    accountEnding: '4921',
    routingNumberMasked: '••••0021',
    swiftBic: 'CHASUS33',
    currency: 'USD',
    paymentRails: ['ACH Credit (CCD+)', 'Fedwire', 'Virtual Card (Single-Use)'],
    defaultPaymentTerms: 'Net 30 Days',
    remittanceMethod: 'Plaid / Early Warning Direct API Match (ACH & Fedwire)'
  },
  taxCompliance: {
    einMasked: 'XX-XXX8812',
    taxFormType: 'IRS Form W-9 (Rev. March 2024)',
    taxFormYear: '2026',
    stateTaxId: 'DE-8821092',
    sanctionsScreening: 'OFAC & SAM.gov Clear (Zero Exclusions)',
    exemptionStatus: 'Exempt payee code 5, FATCA exemption code A'
  },
  insurancePolicies: [
    {
      id: 'ins-01',
      type: 'Commercial General Liability (ACORD 25)',
      carrier: 'Travelers Property Casualty Company of America',
      policyNumber: 'CGL-982019-B',
      coverageAmount: '$5,000,000 Each Occurrence / $10,000,000 Aggregate',
      expiryDate: '2027-06-30',
      status: 'ACTIVE'
    },
    {
      id: 'ins-02',
      type: 'Technology Errors & Omissions / Cyber Liability',
      carrier: 'Chubb Insurance Group',
      policyNumber: 'CYB-441209-X',
      coverageAmount: '$10,000,000 Aggregate',
      expiryDate: '2027-04-15',
      status: 'ACTIVE'
    },
    {
      id: 'ins-03',
      type: 'Workers Compensation & Employers Liability',
      carrier: 'The Hartford Insurance',
      policyNumber: 'WC-110293-A',
      coverageAmount: '$1,000,000 Statutory Limit',
      expiryDate: '2027-09-30',
      status: 'ACTIVE'
    }
  ],
  certifications: [
    {
      id: 'cert-01',
      name: 'ISO / IEC 27001',
      badgeText: 'Audited & Active',
      certNumber: 'ISMS-782190',
      issuer: 'British Standards Institution (BSI)',
      scope: 'Information Security Management System & Cloud Operations',
      expiryDate: '2027-11-15',
      status: 'VERIFIED'
    },
    {
      id: 'cert-02',
      name: 'SOC 2 Type II',
      badgeText: 'Verified Attestation',
      certNumber: 'SOC2-DELOITTE-2025',
      issuer: 'Deloitte & Touche LLP',
      scope: 'Trust Services Criteria: Security, Availability & Confidentiality',
      expiryDate: '2026-12-31',
      status: 'VERIFIED'
    },
    {
      id: 'cert-03',
      name: 'Minority Business Enterprise (MBE)',
      badgeText: 'Certified Diversity',
      certNumber: 'MBE-TX-2024-91',
      issuer: 'National Minority Supplier Development Council (NMSDC)',
      scope: 'Minority-Owned Commercial Technology Manufacturer',
      expiryDate: '2027-03-31',
      status: 'VERIFIED'
    },
    {
      id: 'cert-04',
      name: 'EcoVadis Gold Sustainability',
      badgeText: 'Top 5% Globally',
      certNumber: 'ECO-2026-749',
      issuer: 'EcoVadis CSR Rating Authority',
      scope: 'Scope 1, 2, 3 Greenhouse Gas Emissions & Sustainable Procurement',
      expiryDate: '2027-05-30',
      status: 'VERIFIED'
    }
  ],
  productCapabilities: [
    {
      id: 'cap-01',
      title: 'Enterprise Cloud Compute Nodes (Edge & Core)',
      category: 'IT Hardware & Compute Infrastructure',
      leadTime: '7-14 Days',
      moq: '5 Units',
      certifications: 'UL Listed • CE • ISO 9001',
      description: 'High-density modular compute units with redundant power feeds, cryptographic key-vault hardware acceleration, and telemetry.'
    },
    {
      id: 'cap-02',
      title: 'Industrial IoT Telemetry Sensor Arrays',
      category: 'Hardware & Sensor Engineering',
      leadTime: '3-5 Days',
      moq: '25 Units',
      certifications: 'IP68 Submersible • ATEX Zone 2',
      description: 'Precision multi-axis vibration, cryogenic temperature, and magnetic monitoring sensors with native AS2 and LoRaWAN connectivity.'
    },
    {
      id: 'cap-03',
      title: 'Zero-Trust Defense Cybersecurity Architecture',
      category: 'Enterprise Professional Services',
      leadTime: 'Immediate Deployment',
      moq: '1 Engagement',
      certifications: 'NIST 800-171 • CMMC Ready',
      description: 'Turnkey zero-keying architecture, PKI mutual TLS authentication, and ERP integration consulting for high-compliance enterprise buyers.'
    }
  ]
};

const DEFAULT_BUYER_PROFILES: BuyerSpecificProfile[] = [
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
    customQuestionnaires: [
      {
        questionId: 'q-apex-1',
        questionText: 'Apex Global Supplier Human Rights & Labor Standards Code of Conduct',
        answer: 'Fully Attested & Signed by Legal Counsel on Jan 14, 2026',
        category: 'Ethics & Compliance'
      },
      {
        questionId: 'q-apex-2',
        questionText: 'Subcontractor Information Security Screening Protocol',
        answer: 'All Tier-2 subcontractors pass NIST 800-171 compliant background checks',
        category: 'Cybersecurity'
      }
    ],
    customDocumentOverrides: [
      {
        docType: 'NDA',
        documentName: 'Apex Global Mutual Non-Disclosure Agreement (Executed)',
        status: 'COMPLIANT'
      },
      {
        docType: 'CERT_INSURANCE',
        documentName: 'ACORD 25 with Apex Global Named as Additional Insured',
        status: 'COMPLIANT'
      }
    ],
    customCatalogTier: 'Tier-1 Enterprise Preferred (12% Master Volume Discount)',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 100
  },
  {
    id: 'bprof-starlight',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-2',
    buyerName: 'Starlight Aerospace & Defense',
    buyerLogoText: 'STAR',
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
    customQuestionnaires: [
      {
        questionId: 'q-star-1',
        questionText: 'ITAR Compliance & Export Control Administration Registration',
        answer: 'Registered with Directorate of Defense Trade Controls (DDTC)',
        category: 'Export Compliance'
      }
    ],
    customDocumentOverrides: [
      {
        docType: 'ITAR_CERT',
        documentName: 'DDTC Export Registration Letter M-39218',
        status: 'COMPLIANT'
      }
    ],
    customCatalogTier: 'Defense & Aerospace Precision Rate Card 2026',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 96
  },
  {
    id: 'bprof-omni',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-3',
    buyerName: 'OmniRetail Logistics Network',
    buyerLogoText: 'OMNI',
    relationshipStatus: 'CHANGES_REQUESTED',
    erpVendorId: 'Pending Activation',
    connectedSince: 'Oct 2026',
    annualSpendVolume: 34800,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Omni Retail High-Volume Transit Remittance'
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
  },
  {
    id: 'bprof-biotech',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-4',
    buyerName: 'BioTech Solutions International',
    buyerLogoText: 'BIO',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-9921',
    connectedSince: 'Sep 2025',
    annualSpendVolume: 94000,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Standard Operations Checking'
    },
    negotiatedTerms: {
      paymentTerms: '2/10 Net 30',
      earlyPaymentEligible: true,
      customDiscountRate: 2.0,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Life Sciences & Sensor Telemetry Standard Rate',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 100
  },
  {
    id: 'bprof-nexus',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-5',
    buyerName: 'Nexus Clean Energy Corp',
    buyerLogoText: 'NEX',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-5510',
    connectedSince: 'Feb 2025',
    annualSpendVolume: 182000,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Standard Operations Checking'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 30 Days',
      earlyPaymentEligible: true,
      customDiscountRate: 1.5,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Clean Tech Telemetry Infrastructure Tier A',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 100
  },
  {
    id: 'bprof-quantum',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-6',
    buyerName: 'Quantum Computing Systems Inc.',
    buyerLogoText: 'QCS',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-7730',
    connectedSince: 'Jun 2025',
    annualSpendVolume: 420000,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'High-Performance Node Remittance'
    },
    negotiatedTerms: {
      paymentTerms: '2/10 Net 30',
      earlyPaymentEligible: true,
      customDiscountRate: 2.0,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Cryogenic Hardware & Micro-Sensor Preferred Schedule',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 98
  },
  {
    id: 'bprof-horizon',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-7',
    buyerName: 'Horizon Healthcare Alliance',
    buyerLogoText: 'HHA',
    relationshipStatus: 'CHANGES_REQUESTED',
    erpVendorId: 'Pending Activation',
    connectedSince: 'Nov 2026',
    annualSpendVolume: 65000,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Healthcare Telemetry Remittance'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 45 Standard',
      earlyPaymentEligible: false,
      preferredPaymentMethod: 'WIRE'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Medical Device Telemetry Standard Catalog',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 88
  },
  {
    id: 'bprof-gad',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-8',
    buyerName: 'Global Automotive Dynamics',
    buyerLogoText: 'GAD',
    relationshipStatus: 'ACTIVE',
    erpVendorId: 'VEND-6290',
    connectedSince: 'Apr 2024',
    annualSpendVolume: 510000,
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '••••0021',
      currency: 'USD',
      accountNickName: 'Automotive Robotics Remittance'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 60 EOM',
      earlyPaymentEligible: true,
      customDiscountRate: 1.0,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [],
    customDocumentOverrides: [],
    customCatalogTier: 'Autonomous Mobility Sensor Master Tier 1',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 100
  }
];

export const mergeAcmeProfile = (source?: Partial<GlobalSupplierProfile> | null): GlobalSupplierProfile => {
  if (!source) return JSON.parse(JSON.stringify(DEFAULT_ACME_PROFILE));

  const clone: GlobalSupplierProfile = JSON.parse(JSON.stringify(DEFAULT_ACME_PROFILE));

  return {
    ...clone,
    ...source,
    legalName: source.legalName || clone.legalName,
    tradeName: source.tradeName ?? clone.tradeName,
    formerlyKnownAs: source.formerlyKnownAs ?? clone.formerlyKnownAs,
    normalisedName: source.normalisedName || clone.normalisedName,
    taxIdMasked: source.taxIdMasked || clone.taxIdMasked,
    dunsNumber: source.dunsNumber || clone.dunsNumber,
    incorporationDate: source.incorporationDate || clone.incorporationDate,
    entityStructure: source.entityStructure || clone.entityStructure,
    stateOfIncorporation: source.stateOfIncorporation || clone.stateOfIncorporation,
    primaryNaicsCode: source.primaryNaicsCode || clone.primaryNaicsCode,
    country: source.country || clone.country,
    hqAddress: source.hqAddress || clone.hqAddress,
    registeredAddress: source.registeredAddress || clone.registeredAddress,
    website: source.website || clone.website,
    businessEmail: source.businessEmail || clone.businessEmail,
    phone: source.phone || clone.phone,
    industryCategory: source.industryCategory || clone.industryCategory,
    employeeCountRange: source.employeeCountRange || clone.employeeCountRange,
    reportingCurrency: source.reportingCurrency || clone.reportingCurrency,
    annualRevenue: source.annualRevenue || clone.annualRevenue,
    totalEmployees: source.totalEmployees || clone.totalEmployees,
    description: source.description || clone.description,
    profileCompletionScore: Math.max(source.profileCompletionScore || 0, clone.profileCompletionScore),
    subcategories: (source.subcategories && source.subcategories.length > 0)
      ? source.subcategories
      : clone.subcategories,
    serviceLocations: (source.serviceLocations && source.serviceLocations.length > 0)
      ? source.serviceLocations
      : clone.serviceLocations,
    businessUnits: (source.businessUnits && source.businessUnits.length > 0)
      ? source.businessUnits
      : clone.businessUnits,
    operatingLanguages: (source.operatingLanguages && source.operatingLanguages.length > 0)
      ? source.operatingLanguages
      : clone.operatingLanguages,
    identifications: (source.identifications && source.identifications.length > 0)
      ? source.identifications
      : clone.identifications,
    gepContacts: (source.gepContacts && source.gepContacts.length > 0)
      ? source.gepContacts
      : clone.gepContacts,
    locations: (source.locations && source.locations.length > 0)
      ? source.locations
      : clone.locations,
    gepBankAccounts: (source.gepBankAccounts && source.gepBankAccounts.length > 0)
      ? source.gepBankAccounts
      : clone.gepBankAccounts,
    commercialSettings: source.commercialSettings
      ? { ...clone.commercialSettings!, ...source.commercialSettings }
      : clone.commercialSettings,
    gepCertificates: (source.gepCertificates && source.gepCertificates.length > 0)
      ? source.gepCertificates
      : clone.gepCertificates,
    keyContacts: (source.keyContacts && source.keyContacts.length > 0)
      ? source.keyContacts
      : clone.keyContacts,
    bankingDetails: source.bankingDetails
      ? { ...clone.bankingDetails!, ...source.bankingDetails }
      : clone.bankingDetails,
    taxCompliance: source.taxCompliance
      ? { ...clone.taxCompliance!, ...source.taxCompliance }
      : clone.taxCompliance,
    insurancePolicies: (source.insurancePolicies && source.insurancePolicies.length > 0)
      ? source.insurancePolicies
      : clone.insurancePolicies,
    certifications: (source.certifications && source.certifications.length > 0)
      ? source.certifications
      : clone.certifications,
    productCapabilities: (source.productCapabilities && source.productCapabilities.length > 0)
      ? source.productCapabilities
      : clone.productCapabilities,
    verificationBadges: {
      ...clone.verificationBadges,
      ...(source.verificationBadges || {})
    },
    masterVault: {
      ...clone.masterVault,
      ...(source.masterVault || {})
    }
  };
};

interface SupplierMultiProfileProps {
  isPublicView?: boolean;
  publicSlug?: string;
  initialTab?: string;
}

export const SupplierMultiProfile: React.FC<SupplierMultiProfileProps> = ({ 
  isPublicView: isPublicViewProp = false,
  publicSlug = 'acme-industrial-tech',
  initialTab
}) => {
  const { currentUser, switchUser } = useAuth();
  const { navigate, routeState, openBuyerWorkspace } = usePortal();

  // If viewing via dedicated public route or unauthenticated, force view-only mode
  const isEnforcedPublic = isPublicViewProp || (!currentUser);

  // Check if this is an explicit new registration redirect from signup
  const isNewRegistration = Boolean(
    routeState?.isNewRegistration &&
    currentUser && currentUser.organizationName && currentUser.organizationName !== 'Acme Industrial Tech Inc.'
  );

  // View mode for supplier owner: default to 'EDIT' for new registrations, otherwise 'PUBLIC_VIEW'
  const [viewMode, setViewMode] = useState<'EDIT' | 'PUBLIC_VIEW'>(
    (isNewRegistration || routeState?.editMode) && !isEnforcedPublic ? 'EDIT' : 'PUBLIC_VIEW'
  );

  const getInitialProfile = (): GlobalSupplierProfile => {
    // If explicitly in a new registration redirect, use clean blank template
    if (isNewRegistration && currentUser && currentUser.organizationName !== 'Acme Industrial Tech Inc.') {
      return createBlankSupplierProfile(
        currentUser.organizationName || 'New Supplier',
        currentUser.name || 'Primary Contact',
        currentUser.email || '',
        'United States'
      );
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // If viewing Acme or user is Acme, ensure full verified Acme profile is returned
          if (!currentUser || currentUser.organizationName === 'Acme Industrial Tech Inc.' || parsed.legalName === 'Acme Industrial Tech Inc.') {
            return mergeAcmeProfile(parsed);
          }
          if (parsed.legalName && parsed.legalName !== DEFAULT_ACME_PROFILE.legalName) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Error reading master profile from localStorage:', e);
      }
    }
    return mergeAcmeProfile();
  };

  // Tab navigation: default to 'BASIC' for new registrations so they are guided step by step
  const [activeTab, setActiveTab] = useState<string>(
    initialTab || routeState?.tab || (isNewRegistration ? 'BASIC' : 'ALL')
  );
  const [globalProfile, setGlobalProfile] = useState<GlobalSupplierProfile>(getInitialProfile);
  const [formData, setFormData] = useState<GlobalSupplierProfile>(getInitialProfile);
  const [buyerProfiles, setBuyerProfiles] = useState<BuyerSpecificProfile[]>(
    isNewRegistration ? [] : DEFAULT_BUYER_PROFILES
  );
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('buyer-org-1');
  const [showConnectBuyerModal, setShowConnectBuyerModal] = useState<boolean>(false);
  const [newBuyerOrgName, setNewBuyerOrgName] = useState<string>('');
  const [newBuyerInviteCode, setNewBuyerInviteCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncingToMaster, setSyncingToMaster] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1-Click Revert to full Acme Industrial Tech Inc. verified master profile
  const handleRevertToAcme = () => {
    const acmeFull = mergeAcmeProfile();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('is_new_registration');
      localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(acmeFull));
    }
    setGlobalProfile(acmeFull);
    setFormData(JSON.parse(JSON.stringify(acmeFull)));
    setBuyerProfiles(DEFAULT_BUYER_PROFILES);
    setViewMode('PUBLIC_VIEW');
    setActiveTab('ALL');
    switchUser('user-supp-acme', 'Acme Industrial Tech Inc.', 'Elena Rostova');
    setSuccessMessage('Successfully reverted to Acme Industrial Tech Inc. verified master profile.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Auto-revert to Acme if visiting standard public profile URL without explicit new registration state
  useEffect(() => {
    if (!routeState?.isNewRegistration) {
      if (typeof window !== 'undefined') {
        const isNewFlag = localStorage.getItem('is_new_registration');
        const stored = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
        let storedOrg = '';
        let hasMissingArrays = false;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            storedOrg = parsed.legalName;
            if (
              !parsed.gepCertificates || parsed.gepCertificates.length === 0 ||
              !parsed.locations || parsed.locations.length === 0 ||
              !parsed.gepBankAccounts || parsed.gepBankAccounts.length === 0 ||
              !parsed.identifications || parsed.identifications.length === 0
            ) {
              hasMissingArrays = true;
            }
          } catch (e) {}
        }

        if (
          isNewFlag === 'true' || 
          (storedOrg && storedOrg !== 'Acme Industrial Tech Inc.') ||
          (!storedOrg || hasMissingArrays)
        ) {
          const acmeFull = mergeAcmeProfile();
          localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(acmeFull));
          localStorage.removeItem('is_new_registration');
          setGlobalProfile(acmeFull);
          setFormData(JSON.parse(JSON.stringify(acmeFull)));
          setBuyerProfiles(DEFAULT_BUYER_PROFILES);
          if (currentUser && currentUser.organizationName !== 'Acme Industrial Tech Inc.') {
            switchUser('user-supp-acme', 'Acme Industrial Tech Inc.', 'Elena Rostova');
          }
        }
      }
    }
  }, [routeState]);

  // Section Add Record Triggers (sync with enterprise onboarding modal flows)
  const [idAddTrigger, setIdAddTrigger] = useState<number>(0);
  const [contactAddTrigger, setContactAddTrigger] = useState<number>(0);
  const [locationAddTrigger, setLocationAddTrigger] = useState<number>(0);
  const [bankingAddTrigger, setBankingAddTrigger] = useState<number>(0);
  const [certAddTrigger, setCertAddTrigger] = useState<number>(0);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (routeState?.tab) {
      setActiveTab(routeState.tab);
    }
  }, [initialTab, routeState]);

  // Broadcast live Master Profile context to Ava Copilot
  useEffect(() => {
    broadcastPageContext({
      page: 'public-profile',
      legalName: globalProfile.legalName,
      tradeName: globalProfile.tradeName,
      formerlyKnownAs: globalProfile.formerlyKnownAs,
      taxId: globalProfile.taxIdMasked || '84-1294812',
      taxIdMasked: globalProfile.taxIdMasked,
      dunsNumber: globalProfile.dunsNumber,
      hqAddress: globalProfile.hqAddress || '100 Industrial Parkway, Suite 400, Austin, TX 78701',
      profileCompleteness: globalProfile.profileCompletionScore || 98,
      serviceLocations: globalProfile.serviceLocations,
      businessUnits: globalProfile.businessUnits,
      connectedBuyersCount: buyerProfiles.length,
      connectedBuyers: buyerProfiles.map(b => b.buyerName),
      activeTab,
      viewMode,
      missingRequirement: 'Upload ISO 14001 Environmental attestation in Diversity & Certificates to reach 100% profile score.'
    });
  }, [globalProfile, buyerProfiles, activeTab, viewMode]);

  // Listen to actions dispatched by Ava Copilot
  useEffect(() => {
    const cleanup = onPageAction((action: PageAction) => {
      if (action.action === 'SYNC_MASTER_PROFILE') {
        handleRunAiSync();
      } else if (action.action === 'COPY_PROFILE_LINK') {
        handleCopyLink();
      } else if (action.action === 'NAVIGATE_TAB' && action.payload?.tab) {
        setActiveTab(action.payload.tab);
      } else if (action.action === 'EDIT_PROFILE') {
        setViewMode('EDIT');
      }
    });
    return cleanup;
  }, []);
  const [showSyncDetails, setShowSyncDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        updateFormField('logoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Section in active edit mode (null means all editable when viewMode is EDIT, or specific section)
  const [activeEditSection, setActiveEditSection] = useState<string | null>(null);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOnePagerModal, setShowOnePagerModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showQuickSnap, setShowQuickSnap] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    buyerCompany: '',
    contactName: '',
    contactEmail: '',
    rfpSubject: 'Invitation to Enterprise RFP / Supplier Onboarding',
    message: ''
  });

  // Connect New Buyer Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMethod, setConnectMethod] = useState<'EMAIL_INVITE' | 'ENTER_CODE'>('EMAIL_INVITE');
  const [newBuyerName, setNewBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerContactName, setBuyerContactName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [customMessage, setCustomMessage] = useState(
    'We would like to share our verified Verisource Master Profile, IRS Form W-9, and banking coordinates for zero-keying onboarding.'
  );
  const [isSubmittingConnect, setIsSubmittingConnect] = useState(false);

  const loadProfileData = async () => {
    try {
      if (isEnforcedPublic || !currentUser || currentUser.organizationName === 'Acme Industrial Tech Inc.') {
        // Unauthenticated public profile or Acme user: ensure full Acme verified master profile
        let currentStored: any = null;
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem(MASTER_PROFILE_STORAGE_KEY) : null;
          if (raw) currentStored = JSON.parse(raw);
        } catch (e) {}

        let serverProfile: any = null;
        try {
          const res = await ApiClient.getPublicSupplierProfile(publicSlug);
          if (res?.profile) serverProfile = res.profile;
        } catch (e) {}

        const merged = mergeAcmeProfile({
          ...(serverProfile || {}),
          ...(currentStored && currentStored.legalName === 'Acme Industrial Tech Inc.' ? currentStored : {})
        });

        setGlobalProfile(merged);
        setFormData(JSON.parse(JSON.stringify(merged)));
        setBuyerProfiles(DEFAULT_BUYER_PROFILES);
        if (typeof window !== 'undefined') {
          localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(merged));
        }
        return;
      }

      if (isNewRegistration) {
        // Newly registered supplier: retain clean blank registration profile and 0 buyers
        const raw = typeof window !== 'undefined' ? localStorage.getItem(MASTER_PROFILE_STORAGE_KEY) : null;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setGlobalProfile(parsed);
            setFormData(JSON.parse(JSON.stringify(parsed)));
          } catch (e) {}
        }
        setBuyerProfiles([]);
        setLoading(false);
        return;
      }

      const [gRes, bRes] = await Promise.allSettled([
        ApiClient.getGlobalProfile(),
        ApiClient.getBuyerProfiles()
      ]);
      if (gRes.status === 'fulfilled' && gRes.value?.profile) {
        let currentStored: any = null;
        try {
          const raw = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
          if (raw) currentStored = JSON.parse(raw);
        } catch (e) {}

        const storedToMerge = (currentStored && currentStored.legalName === 'Acme Industrial Tech Inc.')
          ? currentStored
          : {};
        const merged = mergeAcmeProfile({ ...(gRes.value.profile || {}), ...storedToMerge });
        setGlobalProfile(merged);
        setFormData(JSON.parse(JSON.stringify(merged)));
        if (typeof window !== 'undefined') {
          localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(merged));
        }
      } else {
        const fallback = mergeAcmeProfile();
        setGlobalProfile(fallback);
        setFormData(JSON.parse(JSON.stringify(fallback)));
      }
      if (bRes.status === 'fulfilled' && bRes.value?.buyerProfiles && bRes.value.buyerProfiles.length > 0) {
        setBuyerProfiles(bRes.value.buyerProfiles);
        if (!selectedBuyerId) {
          setSelectedBuyerId(bRes.value.buyerProfiles[0].buyerOrgId);
        }
      } else {
        setBuyerProfiles(DEFAULT_BUYER_PROFILES);
      }
    } catch (err) {
      console.warn('Network API offline or proxy warming up, using default Acme profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [currentUser, publicSlug, isEnforcedPublic]);

  const selectedBuyer = buyerProfiles.find(b => b.buyerOrgId === selectedBuyerId) || buyerProfiles[0];

  const getShareableUrl = () => {
    if (typeof window !== 'undefined') {
      const slug = globalProfile?.publicPassportSlug || 'acme-industrial-tech';
      return `${window.location.origin}/p/${slug}`;
    }
    return `https://verisource.network/p/${globalProfile?.publicPassportSlug || 'acme-industrial-tech'}`;
  };

  const handleCopyLink = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleEmailShare = () => {
    const url = getShareableUrl();
    const company = globalProfile?.legalName || 'Acme Industrial Tech Inc.';
    const subject = `${company} - Verified Supplier Public Profile`;
    const body = `Hello,\n\nPlease review our verified Verisource B2B supplier profile and compliance credentials:\n\n${url}\n\nBest regards,\n${company}`;

    // 1. Copy formatted text to clipboard so user can immediately paste in Gmail / Outlook
    try {
      navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3500);
    } catch (e) {
      console.warn('Clipboard write error:', e);
    }

    // 2. Also invoke mailto: link
    try {
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } catch (e) {
      console.warn('Mail client launch error:', e);
    }
  };

  // Form data mutators
  const updateFormField = (field: keyof GlobalSupplierProfile, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const updateNestedField = (parent: 'bankingDetails' | 'taxCompliance', field: string, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [parent]: {
        ...(formData[parent] as any),
        [field]: value
      }
    });
  };

  // Save changes to backend
  const handleSaveProfile = async (e?: React.FormEvent, stayInEditMode: boolean = false) => {
    if (e) e.preventDefault();
    if (!formData) return;
    try {
      setSaving(true);
      const updatedScore = computeProfileScore(formData);
      const basePayload: GlobalSupplierProfile = {
        ...formData,
        profileCompletionScore: updatedScore,
        updatedAt: new Date().toISOString()
      };
      const payload: GlobalSupplierProfile = (formData.legalName === 'Acme Industrial Tech Inc.')
        ? mergeAcmeProfile(basePayload)
        : basePayload;

      if (typeof window !== 'undefined') {
        localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('verisource_master_profile_updated', { detail: payload }));
      }

      setFormData(payload);
      setGlobalProfile(payload);

      const res = await ApiClient.updateGlobalProfile(payload);
      if (res?.profile) {
        const merged = (formData.legalName === 'Acme Industrial Tech Inc.')
          ? mergeAcmeProfile({ ...payload, ...res.profile })
          : { ...payload, ...res.profile };
        setGlobalProfile(merged);
        setFormData(JSON.parse(JSON.stringify(merged)));
        if (typeof window !== 'undefined') {
          localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(merged));
        }
      }
      setSuccessMessage('Master Public Profile successfully updated. Your verified credentials are saved and synced across all modules and onboarding requests.');
      if (!stayInEditMode) {
        setActiveEditSection(null);
        setViewMode('PUBLIC_VIEW');
      }
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.warn('Backend update failed, using local persistence:', err);
      setSuccessMessage('Master Public Profile saved locally. Changes will sync to your onboarding requests and connected workspaces.');
      if (!stayInEditMode) {
        setActiveEditSection(null);
        setViewMode('PUBLIC_VIEW');
      }
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (globalProfile) {
      const restored = (globalProfile.legalName === 'Acme Industrial Tech Inc.')
        ? mergeAcmeProfile(globalProfile)
        : globalProfile;
      setFormData(JSON.parse(JSON.stringify(restored)));
      setActiveEditSection(null);
      setViewMode('PUBLIC_VIEW');
    }
  };

  // Contact list handlers
  const handleUpdateContact = (id: string, field: string, value: any) => {
    if (!formData?.keyContacts) return;
    const updated = formData.keyContacts.map(c => c.id === id ? { ...c, [field]: value } : c);
    setFormData({ ...formData, keyContacts: updated });
  };

  const handleAddContact = () => {
    if (!formData) return;
    const current = formData.keyContacts || [];
    const newContact = {
      id: `cnt-${Date.now().toString().slice(-4)}`,
      role: 'Operations & Procurement',
      name: 'New Corporate Contact',
      title: 'Procurement Specialist',
      email: 'contact@acmeindustrial.com',
      phone: '+1 (512) 555-0100',
      isSignatory: false,
      verificationStatus: 'PENDING'
    };
    setFormData({ ...formData, keyContacts: [...current, newContact] });
  };

  const handleRemoveContact = (id: string) => {
    if (!formData?.keyContacts) return;
    const updated = formData.keyContacts.filter(c => c.id !== id);
    setFormData({ ...formData, keyContacts: updated });
  };

  // Insurance handlers
  const handleUpdateInsurance = (id: string, field: string, value: any) => {
    if (!formData?.insurancePolicies) return;
    const updated = formData.insurancePolicies.map(ins => ins.id === id ? { ...ins, [field]: value } : ins);
    setFormData({ ...formData, insurancePolicies: updated });
  };

  // Capability handlers
  const handleUpdateCapability = (id: string, field: string, value: any) => {
    if (!formData?.productCapabilities) return;
    const updated = formData.productCapabilities.map(cap => cap.id === id ? { ...cap, [field]: value } : cap);
    setFormData({ ...formData, productCapabilities: updated });
  };

  const handleAddCapability = () => {
    if (!formData) return;
    const current = formData.productCapabilities || [];
    const newCap = {
      id: `cap-${Date.now().toString().slice(-4)}`,
      title: 'Precision Additive Manufacturing Node',
      category: 'Specialized Industrial Hardware',
      leadTime: '5-10 Days',
      moq: '10 Units',
      certifications: 'ISO 9001 • AS9100 Ready',
      description: 'High-tolerance component fabrication with automated telemetry and multi-spectral quality assurance inspection.'
    };
    setFormData({ ...formData, productCapabilities: [...current, newCap] });
  };

  const handleRemoveCapability = (id: string) => {
    if (!formData?.productCapabilities) return;
    const updated = formData.productCapabilities.filter(c => c.id !== id);
    setFormData({ ...formData, productCapabilities: updated });
  };

  // AI Sync logic
  const handleRunAiSync = async () => {
    if (!selectedBuyer) return;
    try {
      setSyncing(true);
      const res = await ApiClient.syncBuyerProfileAi(selectedBuyer.buyerOrgId);
      setSyncResult(res);
      setSuccessMessage(`AI Autonomous Sync Completed: ${res.syncedFieldsCount} fields verified and aligned with ${selectedBuyer.buyerName}.`);
      setShowSyncDetails(true);
      await loadProfileData();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      alert('Failed to run AI sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncToMaster = async () => {
    if (!selectedBuyer) return;
    try {
      setSyncingToMaster(true);
      const updates = {
        defaultPaymentTerms: selectedBuyer.negotiatedTerms.paymentTerms,
        description: globalProfile?.description
      };
      const res = await ApiClient.syncToMaster(updates, selectedBuyer.buyerName);
      setSuccessMessage(`Bi-Directional Sync Completed: Master Public Profile aligned with updates from ${selectedBuyer.buyerName}. Zero data inconsistencies!`);
      await loadProfileData();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      alert('Failed to sync updates to Master Profile');
    } finally {
      setSyncingToMaster(false);
    }
  };

  const handleConnectBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingConnect(true);
      const res = await ApiClient.connectNewBuyer({
        buyerName: newBuyerName,
        buyerEmail: connectMethod === 'EMAIL_INVITE' ? buyerEmail : undefined,
        buyerContactName: connectMethod === 'EMAIL_INVITE' ? buyerContactName : undefined,
        invitationCode: connectMethod === 'ENTER_CODE' ? invitationCode : undefined,
        connectionMethod: connectMethod,
        customMessage
      });
      setShowConnectModal(false);
      setNewBuyerName('');
      setBuyerEmail('');
      setBuyerContactName('');
      setInvitationCode('');
      setSuccessMessage(res.message);
      await loadProfileData();
      if (res.buyerProfile) {
        setSelectedBuyerId(res.buyerProfile.buyerOrgId);
        setActiveTab('BASIC');
      }
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      alert('Failed to connect new buyer');
    } finally {
      setIsSubmittingConnect(false);
    }
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setShowInquiryModal(false);
      alert(`Inquiry sent to ${globalProfile?.legalName}! Elena Rostova (Authorized Signatory) has been notified.`);
    }, 1500);
  };

  if (loading && !globalProfile) {
    return (
      <div className="p-16 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        <RefreshCw className="w-7 h-7 animate-spin mx-auto text-emerald-600 mb-3" />
        <span className="font-semibold text-slate-700">Loading Verisource B2B Verified Supplier Profile...</span>
      </div>
    );
  }

  // Active data source: in edit mode use formData, otherwise globalProfile
  const profile = (viewMode === 'EDIT' && !isEnforcedPublic) ? formData : globalProfile;
  const isEditing = viewMode === 'EDIT' && !isEnforcedPublic;

  const PROFILE_CATEGORIES = [
    {
      id: 'identity-tax',
      title: 'Identity & Tax',
      stepIds: ['BASIC', 'BUSINESS', 'IDENTIFICATION']
    },
    {
      id: 'operations-logistics',
      title: 'Operations & Logistics',
      stepIds: ['CONTACTS', 'LOCATIONS']
    },
    {
      id: 'settlement-terms',
      title: 'Settlement & Terms',
      stepIds: ['BANKING', 'TERMS']
    },
    {
      id: 'compliance-signoff',
      title: 'Compliance & Accreditations',
      stepIds: ['CERTS']
    }
  ];

  const PROFILE_SECTIONS_LIST = [
    { id: 'BASIC', num: 1, label: 'Basic Details', shortLabel: 'Basic Details', category: 'identity-tax' },
    { id: 'BUSINESS', num: 2, label: 'Business Information', shortLabel: 'Business Info', category: 'identity-tax' },
    { id: 'IDENTIFICATION', num: 3, label: 'Identification Information', shortLabel: 'Tax & IDs', count: (profile.identifications || []).length, category: 'identity-tax' },
    { id: 'CONTACTS', num: 4, label: 'Contact Information', shortLabel: 'Contacts', count: (profile.gepContacts || []).length, category: 'operations-logistics' },
    { id: 'LOCATIONS', num: 5, label: 'Location', shortLabel: 'Locations', count: (profile.locations || []).length, category: 'operations-logistics' },
    { id: 'BANKING', num: 6, label: 'Banking Information', shortLabel: 'Banking', count: (profile.gepBankAccounts || []).length, category: 'settlement-terms' },
    { id: 'TERMS', num: 7, label: 'Payment Terms', shortLabel: 'Payment Terms', category: 'settlement-terms' },
    { id: 'CERTS', num: 8, label: 'Diversity & Certificates', shortLabel: 'Diversity & Certs', count: (profile.gepCertificates || []).length, category: 'compliance-signoff' }
  ];

  const handleNavigateSection = async (targetId: string, shouldSave: boolean = false) => {
    if (shouldSave && isEditing) {
      await handleSaveProfile(undefined, true);
    }
    setActiveTab(targetId);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('profile-content-container') || document.getElementById('section-content-top');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
    }
  };

  const renderSectionFooterNav = (currentTabId: string) => {
    const currentIndex = PROFILE_SECTIONS_LIST.findIndex(s => s.id === currentTabId);
    if (currentIndex === -1) return null;

    const prevSection = currentIndex > 0 ? PROFILE_SECTIONS_LIST[currentIndex - 1] : null;
    const nextSection = currentIndex < PROFILE_SECTIONS_LIST.length - 1 ? PROFILE_SECTIONS_LIST[currentIndex + 1] : null;

    return (
      <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-200">
        {/* Previous Button: Disabled on first step, clean & standard */}
        {prevSection ? (
          <button
            type="button"
            onClick={() => handleNavigateSection(prevSection.id, false)}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Previous: {prevSection.shortLabel}</span>
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

        {/* Right Action Group */}
        <div className="flex items-center gap-2">
          {/* Next Button */}
          {nextSection ? (
            <button
              type="button"
              onClick={() => handleNavigateSection(nextSection.id, isEditing)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs group"
            >
              <span>{isEditing ? `Save & Next: ${nextSection.shortLabel}` : `Next: ${nextSection.shortLabel}`}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigateSection('ALL', isEditing)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs group"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isEditing ? 'Save & View All' : 'All Sections Completed'}</span>
            </button>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">

      {/* Notice & Revert Banner if viewing custom registration profile */}
      {profile.legalName !== 'Acme Industrial Tech Inc.' && (
        <div className="bg-amber-50 border border-amber-200/90 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold">Custom Registered Profile: </span>
              <span className="font-mono text-amber-900 font-bold">{profile.legalName}</span>
              <span className="text-amber-800 hidden sm:inline"> — Click Revert anytime to restore the complete verified Acme Industrial Tech Inc. master profile.</span>
            </div>
          </div>
          <button
            onClick={handleRevertToAcme}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-2xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revert to Acme Master Profile</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. RE-DESIGNED FIRST STRIP / HERO BANNER                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          {/* Top Row: Brand Emblem, Legal Identity, Clean Verified Icon with Tooltip on Left; Actions on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Column: Organization Emblem & Enterprise Identity */}
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Company Logo Avatar with Upload Capability in Edit Mode */}
              <div className="relative group shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <div
                  onClick={() => isEditing && fileInputRef.current?.click()}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base tracking-tight shrink-0 overflow-hidden transition relative ${
                    isEditing ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2' : ''
                  } ${
                    profile.logoUrl
                      ? 'bg-white border border-slate-200 p-1 shadow-2xs'
                      : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs'
                  }`}
                  title={isEditing ? 'Click to upload custom organization logo' : profile.legalName}
                >
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt={profile.legalName}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <span>{profile.legalName.slice(0, 2).toUpperCase()}</span>
                  )}

                  {/* Hover Overlay in Edit Mode */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition rounded-xl">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[7px] font-bold mt-0.5 uppercase tracking-wider">Logo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Name & Clean Verified Icon (Hover reveals full Verisource Certified text) */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {profile.legalName}
                  </h1>

                  {/* Status Badge: Verified for existing mature profile, or In Progress for new registration */}
                  {isNewRegistration || (profile.profileCompletionScore || 0) < 60 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Registration In Progress</span>
                    </span>
                  ) : (
                    <div className="group relative inline-flex items-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 cursor-pointer transition hover:bg-emerald-100/70">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Verified</span>
                      </span>

                      {/* Rich Hover Tooltip with Verisource Certified Details */}
                      <div className="absolute left-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-slate-900 text-white text-[11px] rounded-xl p-2.5 shadow-2xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Verisource Verified Enterprise</span>
                        </div>
                        <div className="text-slate-300 text-[10px] mt-0.5">
                          IRS TIN Match 100% • Dun & Bradstreet Active • Delaware Secretary of State Validated
                        </div>
                        <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 absolute -top-1 left-4 border-l border-t border-slate-700"></div>
                      </div>
                    </div>
                  )}

                  {/* Minimal Profile Completeness Pill Badge with Quick Snap Popover */}
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowQuickSnap(!showQuickSnap)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer border ${
                        showQuickSnap
                          ? 'bg-slate-200 text-slate-900 border-slate-300 shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80'
                      }`}
                      title="Click to view complete & pending audit snapshot"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-slate-800">{profile.profileCompletionScore}%</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showQuickSnap ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Quick Snap Popover Dropdown */}
                    {showQuickSnap && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowQuickSnap(false)}
                        />
                        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                          {/* Popover Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs">Profile Health & Readiness</h4>
                                <p className="text-[10px] text-slate-500">Tier-1 Enterprise Qualification Audit</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowQuickSnap(false)}
                              className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Progress Bar & Summary Pill */}
                          <div className="py-2.5">
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                              <span className="font-semibold text-slate-700">Audit Score: {profile.profileCompletionScore}%</span>
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                7 Complete • 1 Pending
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${profile.profileCompletionScore}%` }}
                              />
                            </div>
                          </div>

                          {/* Completed Items Roster */}
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Completed & Verified (7)
                            </div>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center gap-2 text-slate-700 py-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="flex-1 truncate">Legal Entity: D&B Active & DE Good Standing</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-700 py-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="flex-1 truncate">Tax: W-9 Verified (IRS TIN Match 100%)</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-700 py-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="flex-1 truncate">Banking: Plaid Tokenized FedACH Verified</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-700 py-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="flex-1 truncate">Insurance: $5M Commercial General Liability</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-700 py-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="flex-1 truncate">Security: ISO 27001 & SOC 2 Type II Current</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-700 py-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="flex-1 truncate">Compliance: ITAR Registered & MBE Certified</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-700 py-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="flex-1 truncate">Key Contacts: 4 Authorized Signatories Active</span>
                              </div>
                            </div>
                          </div>

                          {/* Pending Action Item */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">
                              Pending Action (1)
                            </div>
                            <div className="p-2 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <div className="font-semibold">Cyber Liability Policy Renewal</div>
                                <div className="text-[10px] text-amber-800 mt-0.5">Annual renewal due in 45 days (Dec 15, 2026). Upload updated binder to achieve 100%.</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Actions (Edit Details, Save Profile, Discard, Share, Copy Link) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
              {!isEnforcedPublic && (
                <>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleDiscardChanges}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                        title="Discard unsaved edits"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Discard</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleSaveProfile(e, false)}
                        disabled={saving}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Save changes to Master Profile"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {profile.legalName !== 'Acme Industrial Tech Inc.' && (
                        <button
                          type="button"
                          onClick={handleRevertToAcme}
                          className="px-3.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                          title="Revert and restore complete verified Acme Industrial Tech Inc. master profile"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                          <span>Revert Acme</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setViewMode('EDIT')}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
                        title="Toggle edit mode for full master profile"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowShareModal(true)}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Share View-Only Profile Link with Buyers"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Share Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Copy shareable Public Profile link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                      </button>
                    </>
                  )}
                </>
              )}

              {isEnforcedPublic && (
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Contact Supplier</span>
                </button>
              )}
            </div>
          </div>

          {/* Middle Row: Full Bio / Capabilities Overview */}
          <div className="pt-2.5 border-t border-slate-100">
            {isEditing ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-xs font-semibold text-slate-700">
                    Executive Summary
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(formData.description || '').length} / 500 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formData.description || ''}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  placeholder="Enter enterprise supplier executive overview, core manufacturing capabilities, and defense/aerospace compliance highlights..."
                  className="w-full text-xs sm:text-[13px] leading-relaxed p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition shadow-2xs"
                />
              </div>
            ) : (
              <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed max-w-5xl">
                {profile.description}
              </p>
            )}
          </div>

          {/* Bottom Row: Metadata Details (View vs Edit Mode) */}
          <div className="pt-3 border-t border-slate-100">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-xs font-semibold text-slate-700">
                    Corporate Details
                  </label>
                  <span className="text-[10px] text-slate-400">Syncs directly to Master Profile</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {/* HQ Address */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      HQ Address
                    </label>
                    <input
                      type="text"
                      value={formData.hqAddress || ''}
                      onChange={(e) => updateFormField('hqAddress', e.target.value)}
                      placeholder="e.g. 100 Enterprise Way, Suite 400, Chicago, IL 60601"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>

                  {/* Incorporation Date & Structure */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Inc Date / Structure
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={formData.incorporationDate || ''}
                        onChange={(e) => updateFormField('incorporationDate', e.target.value)}
                        placeholder="YYYY-MM-DD"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
                      />
                      <input
                        type="text"
                        value={formData.entityStructure || ''}
                        onChange={(e) => updateFormField('entityStructure', e.target.value)}
                        placeholder="e.g. C-Corp, LLC"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* EIN */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      EIN / Tax ID
                    </label>
                    <input
                      type="text"
                      value={formData.taxIdMasked || ''}
                      onChange={(e) => updateFormField('taxIdMasked', e.target.value)}
                      placeholder="e.g. 12-3456789"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>

                  {/* Business Email */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      value={formData.businessEmail || ''}
                      onChange={(e) => updateFormField('businessEmail', e.target.value)}
                      placeholder="e.g. contact@company.com"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => updateFormField('phone', e.target.value)}
                      placeholder="e.g. +1 (555) 000-0000"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs">
                  <span className="font-medium text-slate-700">
                    <span className="text-slate-400 font-normal mr-1">HQ:</span>
                    <span>{profile.hqAddress}</span>
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-700">
                    <span className="text-slate-400 font-normal mr-1">Inc:</span>
                    <span>{profile.incorporationDate.slice(0, 4)} ({profile.entityStructure || 'C-Corp'})</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono font-medium text-slate-700">
                    <span className="text-slate-400 font-normal font-sans mr-1">EIN:</span>
                    <span>{profile.taxIdMasked}</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-medium text-slate-700">
                    <span>{profile.businessEmail}</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-medium text-slate-700">
                    <span>{profile.phone}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-xs animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-emerald-800 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {!isEnforcedPublic && (
              <button
                onClick={() => navigate('/orders')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <span>View Orders</span>
              </button>
            )}
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer px-2 py-1">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Live Editing Mode Bar */}
      {isEditing && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white tracking-tight">Live Editing Mode Active</span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-300 text-xs">Changes sync directly to Verisource Master Profile</span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION NAVIGATION (Vertical Stepper on Desktop, Horizontal on Mobile)  */}
      {/* ========================================================================= */}

      {/* On Mobile/Tablet: Horizontal Scrollable Tabs (< lg) */}
      <div className="lg:hidden p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto no-scrollbar select-none">
        {[
          { id: 'ALL', label: 'All Sections' },
          ...PROFILE_SECTIONS_LIST
        ].map((tab: any) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavigateSection(tab.id, false)}
              className={`px-3 py-1.5 rounded-xl text-xs transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isSelected ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout (Sidebar Stepper on Left, Active Section on Right) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Vertical Stepper Sidebar */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-4 space-y-2 hidden lg:block">
          {/* Header */}
          <div className="flex items-center justify-between px-1.5 py-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Profile Sections</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-semibold">
              {PROFILE_SECTIONS_LIST.length} Sections
            </span>
          </div>

          {/* Stepper Buttons List: Direct, clean, no repeated company card! */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 space-y-1 shadow-2xs">
            {/* All Sections Button */}
            <button
              type="button"
              onClick={() => handleNavigateSection('ALL', false)}
              className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between border cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs font-bold text-emerald-950'
                  : 'bg-white border-transparent hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                  activeTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <Layers className="w-3 h-3" />
                </div>
                <span className="text-xs truncate">All Sections (Overview)</span>
              </div>
              {activeTab === 'ALL' && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              )}
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* Categorized Sections Grouped by 4 Milestone Phases Matching Onboarding */}
            <div className="space-y-3 pt-0.5">
              {PROFILE_CATEGORIES.map((cat) => {
                const catSections = PROFILE_SECTIONS_LIST.filter(s => cat.stepIds.includes(s.id));
                const isCatActive = cat.stepIds.includes(activeTab);

                return (
                  <div key={cat.id} className="space-y-1">
                    {/* Milestone Phase Header matching OnboardingRequest */}
                    <div className="flex items-center justify-between px-1.5 pt-0.5 pb-0.5 select-none">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCatActive ? 'text-emerald-700 font-extrabold' : 'text-slate-400'
                      }`}>
                        {cat.title}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Done</span>
                      </span>
                    </div>

                    {/* Phase Steps */}
                    <div className="space-y-0.5">
                      {catSections.map((sec) => {
                        const isCurrent = activeTab === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => handleNavigateSection(sec.id, false)}
                            className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between border cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs font-bold text-emerald-950'
                                : 'bg-white border-transparent hover:bg-slate-50 text-slate-700 font-medium'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {/* Circular Checkmark Indicator matching Onboarding */}
                              <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition bg-emerald-600 text-white shadow-2xs">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs truncate">{sec.label}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                              {sec.count !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                                  isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {sec.count}
                                </span>
                              )}
                              {isCurrent && (
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                              )}
                            </div>
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

        {/* Right Content Area: Sections Container */}
        <div id="profile-content-container" className="flex-1 min-w-0 space-y-4 w-full">

      {/* ========================================================================= */}
      {/* SECTION 1: Basic Details                                                  */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'BASIC') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Basic Details</h3>
            </div>
            <div className="group relative inline-flex items-center shrink-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition shadow-2xs cursor-help">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30">
                IRS & Secretary of State Verified
              </div>
            </div>
          </div>

          {/* Unified Single Grid */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-2xs p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-4.5">
              {/* Legal Company Name */}
              <div className="space-y-1.5 lg:col-span-2">
                <div className="flex items-center justify-between min-h-[20px] h-5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                      Legal Company Name <span className="text-red-500">*</span>
                    </label>
                    <AiFilledBadge isAiFilled={true} fieldName="Legal Company Name" />
                  </div>
                </div>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.legalName || ''}
                  onChange={(e) => updateFormField('legalName', e.target.value)}
                  placeholder="e.g. Acme Industrial Tech Inc."
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border transition ${
                    !isEditing
                      ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default font-semibold'
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
                  disabled={!isEditing}
                  value={profile.tradeName || ''}
                  onChange={(e) => updateFormField('tradeName', e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                    !isEditing
                      ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                      : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                  }`}
                />
              </div>

              {/* Formally Known As */}
              <div className="space-y-1.5 lg:col-span-2">
                <div className="flex items-center justify-between min-h-[20px] h-5">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Formally Known As
                  </label>
                </div>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.formerlyKnownAs || ''}
                  onChange={(e) => updateFormField('formerlyKnownAs', e.target.value)}
                  placeholder="e.g. Acme Hardware & Sensors Corp"
                  className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                    !isEditing
                      ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
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
                  value={profile.origination || 'Verisource'}
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
                  disabled={!isEditing}
                  value={profile.partnerStatus === 'ACTIVE' ? 'Active' : profile.partnerStatus === 'NOT_INVITED' ? 'Not Invited' : 'Invited'}
                  onChange={(val) => updateFormField('partnerStatus', val.toUpperCase().replace(' ', '_'))}
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
                  value={profile.supplierManager || 'Sarah Jenkins (Senior Category Manager - Cloud & IT)'}
                  onChange={(val) => updateFormField('supplierManager', val)}
                  placeholder="Select Supplier Manager..."
                  searchPlaceholder="Search manager name or category..."
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                  value={profile.hasDuns ? 'Yes' : 'No'}
                  onChange={(val) => updateFormField('hasDuns', val === 'Yes')}
                  placeholder="Select..."
                  options={['Yes', 'No']}
                />
              </div>

              {/* DUNS Number */}
              {profile.hasDuns !== false && (
                <div className="space-y-1.5 lg:col-span-2">
                  <div className="flex items-center justify-between min-h-[20px] h-5">
                    <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                      DUNS Number <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profile.dunsNumber || ''}
                      onChange={(e) => updateFormField('dunsNumber', e.target.value)}
                      placeholder="00-000-0000"
                      className={`w-full pl-3 pr-9 py-2 text-xs font-mono rounded-lg border transition ${
                        !isEditing
                          ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default font-bold'
                          : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                      <VerificationIndicator 
                        type="check" 
                        badgeText="D&B Verified" 
                        tooltip="Verified via Dun & Bradstreet API (09-842-1928)" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Normalised Corporate Name */}
              <div className={`space-y-1.5 ${profile.hasDuns !== false ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
                <div className="flex items-center justify-between min-h-[20px] h-5">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Normalised Corporate Name
                  </label>
                </div>
                <input
                  type="text"
                  disabled
                  value={profile.normalisedName || 'ACME INDUSTRIAL TECH INC'}
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
                    {(profile.subcategories || []).length} mapped
                  </span>
                </div>

                {isEditing && (
                  <SearchableSelect
                    options={AVAILABLE_SUBCATEGORIES.filter((opt) => !(profile.subcategories || []).includes(opt))}
                    placeholder="+ Add Subcategory..."
                    searchPlaceholder="Search subcategory or UNSPSC code..."
                    resetOnSelect
                    onSelect={(val) => {
                      if (val && !(profile.subcategories || []).includes(val)) {
                        updateFormField('subcategories', [...(profile.subcategories || []), val]);
                      }
                    }}
                    emptyMessage="All catalog subcategories mapped"
                  />
                )}

                <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[120px] max-h-[160px] overflow-y-auto">
                  {(profile.subcategories || []).map((sub, idx) => {
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
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => updateFormField('subcategories', (profile.subcategories || []).filter((s) => s !== sub))}
                            className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded transition shrink-0 cursor-pointer mt-0.5"
                            title={`Remove ${sub}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {(profile.subcategories || []).length === 0 && (
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
                    {(profile.serviceLocations || []).length} locations
                  </span>
                </div>

                {isEditing && (
                  <SearchableSelect
                    options={AVAILABLE_SERVICE_LOCATIONS.filter((opt) => !(profile.serviceLocations || []).includes(opt))}
                    placeholder="+ Add Location..."
                    searchPlaceholder="Search service location..."
                    resetOnSelect
                    onSelect={(val) => {
                      if (val && !(profile.serviceLocations || []).includes(val)) {
                        updateFormField('serviceLocations', [...(profile.serviceLocations || []), val]);
                      }
                    }}
                    emptyMessage="All service locations mapped"
                  />
                )}

                <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[120px] max-h-[160px] overflow-y-auto">
                  {(profile.serviceLocations || []).map((loc, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start justify-between p-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md shadow-2xs group transition gap-1.5"
                    >
                      <span className="font-medium text-slate-800 text-xs leading-snug break-words flex-1">
                        {loc}
                      </span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => updateFormField('serviceLocations', (profile.serviceLocations || []).filter((l) => l !== loc))}
                          className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded transition shrink-0 cursor-pointer mt-0.5"
                          title={`Remove ${loc}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(profile.serviceLocations || []).length === 0 && (
                    <div className="h-[104px] flex items-center justify-center text-xs text-slate-400 italic">
                      No service locations mapped.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {activeTab !== 'ALL' && renderSectionFooterNav('BASIC')}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: Business Information                                           */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'BUSINESS') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Business Information</h3>
            </div>
            <div className="group relative inline-flex items-center shrink-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition shadow-2xs cursor-help">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30">
                D&B Financial & USPS Verified
              </div>
            </div>
          </div>

          {/* Unified Single Grid */}
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
                  value={profile.reportingCurrency || 'USD ($) - US Dollar'}
                  onChange={(val) => updateFormField('reportingCurrency', val)}
                  placeholder="Select Currency..."
                  searchPlaceholder="Search currency code (e.g. USD, EUR, GBP)..."
                  disabled={!isEditing}
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
                    {getCurrencySymbol(profile.reportingCurrency || 'USD ($) - US Dollar')}
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditing}
                    value={profile.annualRevenue || ''}
                    onChange={(e) => updateFormField('annualRevenue', e.target.value)}
                    placeholder="38.4"
                    className={`w-full ${getCurrencySymbol(profile.reportingCurrency || 'USD').length > 2 ? 'pl-11' : getCurrencySymbol(profile.reportingCurrency || 'USD').length > 1 ? 'pl-9' : 'pl-7'} pr-14 py-2 text-xs font-semibold rounded-lg border transition ${
                      !isEditing
                        ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default font-bold'
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
                  disabled={!isEditing}
                  value={profile.totalEmployees || ''}
                  onChange={(e) => updateFormField('totalEmployees', e.target.value)}
                  placeholder="280"
                  className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                    !isEditing
                      ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default font-medium'
                      : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                  }`}
                />
              </div>

              {/* Date of Incorporate */}
              <div className="space-y-1.5 lg:col-span-2">
                <div className="flex items-center justify-between min-h-[20px] h-5 gap-1">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Date of Incorporate
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono font-normal shrink-0">MM-DD-YYYY</span>
                </div>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={profile.incorporationDate || ''}
                  onChange={(e) => updateFormField('incorporationDate', e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                    !isEditing
                      ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default font-mono'
                      : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                  }`}
                />
              </div>

              {/* Country / Jurisdiction */}
              <div className="space-y-1.5 lg:col-span-2">
                <div className="flex items-center justify-between min-h-[20px] h-5 gap-1">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Country / Jurisdiction <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono font-normal shrink-0">ISO-3166</span>
                </div>
                <SearchableSelect
                  options={AVAILABLE_COUNTRIES}
                  value={profile.country || 'United States (US)'}
                  onChange={(val) => updateFormField('country', val)}
                  placeholder="Select Country..."
                  searchPlaceholder="Search country or code (e.g. US, Japan, Germany)..."
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                  value={profile.website || ''}
                  onChange={(e) => updateFormField('website', e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                    !isEditing
                      ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default font-mono text-[11px]'
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
                    disabled={!isEditing}
                    value={profile.registeredAddress || profile.hqAddress || ''}
                    onChange={(e) => {
                      updateFormField('registeredAddress', e.target.value);
                      updateFormField('hqAddress', e.target.value);
                    }}
                    placeholder="Street address, Suite, City, State, ZIP"
                    className={`w-full pl-3 pr-9 py-2 text-xs rounded-lg border transition ${
                      !isEditing
                        ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default font-medium'
                        : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <VerificationIndicator 
                      type="check" 
                      badgeText="Address Verified" 
                      tooltip="Verified via Google Places API & USPS Postal Database" 
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Description of Service */}
              <div className="space-y-1.5 lg:col-span-6">
                <div className="flex items-center justify-between min-h-[20px] h-5">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Detailed Description of Service <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono font-medium ${
                    (profile.description || '').length > 500 ? 'text-rose-600 font-bold' : 'text-slate-400'
                  }`}>
                    {(profile.description || '').length}/500 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  disabled={!isEditing}
                  value={profile.description || ''}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  placeholder="Provide detailed description of services, enterprise capabilities, or manufactured goods..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border transition resize-none leading-relaxed ${
                    !isEditing
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
                    {(profile.businessUnits || []).length} assigned
                  </span>
                </div>

                {isEditing && (
                  <SearchableSelect
                    options={AVAILABLE_BUSINESS_UNITS.filter((opt) => !(profile.businessUnits || []).includes(opt))}
                    placeholder="+ Add Business Unit..."
                    searchPlaceholder="Search business unit..."
                    resetOnSelect
                    onSelect={(val) => {
                      if (val && !(profile.businessUnits || []).includes(val)) {
                        updateFormField('businessUnits', [...(profile.businessUnits || []), val]);
                      }
                    }}
                    emptyMessage="All business units assigned"
                  />
                )}

                <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[120px] max-h-[160px] overflow-y-auto">
                  {(profile.businessUnits || []).map((bu, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start justify-between p-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-md shadow-2xs group transition gap-1.5"
                    >
                      <span className="font-medium text-slate-800 text-xs leading-snug break-words flex-1">
                        {bu}
                      </span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => updateFormField('businessUnits', (profile.businessUnits || []).filter((b) => b !== bu))}
                          className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded transition shrink-0 cursor-pointer mt-0.5"
                          title={`Remove ${bu}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(profile.businessUnits || []).length === 0 && (
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
                    {(profile.operatingLanguages || []).length} active
                  </span>
                </div>

                {isEditing && (
                  <SearchableSelect
                    options={AVAILABLE_LANGUAGES.filter((opt) => !(profile.operatingLanguages || []).includes(opt))}
                    placeholder="+ Add Language..."
                    searchPlaceholder="Search language..."
                    resetOnSelect
                    onSelect={(val) => {
                      if (val && !(profile.operatingLanguages || []).includes(val)) {
                        updateFormField('operatingLanguages', [...(profile.operatingLanguages || []), val]);
                      }
                    }}
                    emptyMessage="All languages selected"
                  />
                )}

                <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[120px] max-h-[160px] overflow-y-auto content-start">
                  {(profile.operatingLanguages || []).map((lang, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-md shadow-2xs group hover:border-slate-300 transition"
                    >
                      <span>{lang}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => updateFormField('operatingLanguages', (profile.operatingLanguages || []).filter((l) => l !== lang))}
                          className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-0.5 rounded transition cursor-pointer"
                          title={`Remove ${lang}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}

                  {(profile.operatingLanguages || []).length === 0 && (
                    <div className="h-[104px] w-full flex items-center justify-center text-xs text-slate-400 italic">
                      No languages selected.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {activeTab !== 'ALL' && renderSectionFooterNav('BUSINESS')}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: Identification Information                                     */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'IDENTIFICATION') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Identification Information</h3>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIdAddTrigger(prev => prev + 1)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  title="Add statutory tax identification record"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Record</span>
                </button>
              )}
              <div className="group relative inline-flex items-center shrink-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition shadow-2xs cursor-help">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30">
                  {(profile.identifications || []).length} Verified Tax IDs
                </div>
              </div>
            </div>
          </div>

          <GepIdentificationGrid 
            items={profile.identifications || []} 
            onChange={(items) => updateFormField('identifications', items)} 
            readOnly={!isEditing} 
            openAddTrigger={idAddTrigger}
          />
          {activeTab !== 'ALL' && renderSectionFooterNav('IDENTIFICATION')}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: Contact Information                                            */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'CONTACTS') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Contact Information</h3>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setContactAddTrigger(prev => prev + 1)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  title="Add corporate contact liaison"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Contact</span>
                </button>
              )}
              <div className="group relative inline-flex items-center shrink-0">
                <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition shadow-2xs cursor-help">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30">
                  {(profile.gepContacts || []).length} Verified Officers
                </div>
              </div>
            </div>
          </div>

          <GepContactMatrix 
            contacts={profile.gepContacts || []} 
            onChange={(contacts) => updateFormField('gepContacts', contacts)} 
            readOnly={!isEditing} 
            openAddTrigger={contactAddTrigger}
          />
          {activeTab !== 'ALL' && renderSectionFooterNav('CONTACTS')}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: Location                                                       */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'LOCATIONS') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Location</h3>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setLocationAddTrigger(prev => prev + 1)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  title="Add operating location or warehouse"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Location</span>
                </button>
              )}
              <div className="group relative inline-flex items-center shrink-0">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition shadow-2xs cursor-help">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30">
                  {(profile.locations || []).length} Corporate Sites
                </div>
              </div>
            </div>
          </div>

          <GepLocationGrid 
            locations={profile.locations || []} 
            onChange={(locations) => updateFormField('locations', locations)} 
            readOnly={!isEditing} 
            openAddTrigger={locationAddTrigger}
          />
          {activeTab !== 'ALL' && renderSectionFooterNav('LOCATIONS')}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: Banking Information                                            */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'BANKING') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Banking Information</h3>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setBankingAddTrigger(prev => prev + 1)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  title="Add bank account for electronic disbursements"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Bank Account</span>
                </button>
              )}
              <div className="group relative inline-flex items-center shrink-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition shadow-2xs cursor-help">
                  <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30">
                  Plaid & Nacha Tokenized
                </div>
              </div>
            </div>
          </div>

          <GepBankingGrid 
            bankAccounts={profile.gepBankAccounts || []} 
            locations={profile.locations || []} 
            onChange={(accounts) => updateFormField('gepBankAccounts', accounts)} 
            readOnly={!isEditing} 
            openAddTrigger={bankingAddTrigger}
            defaultBeneficiary={profile.legalName || ''}
          />
          {activeTab !== 'ALL' && renderSectionFooterNav('BANKING')}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: Payment Terms                                                  */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'TERMS') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Payment Terms</h3>
            </div>
            <div className="group relative inline-flex items-center shrink-0">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 hover:bg-amber-100 transition shadow-2xs cursor-help">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30">
                Net Terms & IncoTerms Configured
              </div>
            </div>
          </div>

          <GepCommercialTerms 
            settings={profile.commercialSettings || DEFAULT_ACME_PROFILE.commercialSettings!} 
            onChange={(settings) => updateFormField('commercialSettings', settings)} 
            readOnly={!isEditing} 
          />
          {activeTab !== 'ALL' && renderSectionFooterNav('TERMS')}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: Diversity & Certificates                                       */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'CERTS') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Diversity & Certificates</h3>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setCertAddTrigger(prev => prev + 1)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  title="Add diversity or compliance certification"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Certificate</span>
                </button>
              )}
              <div className="group relative inline-flex items-center shrink-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition shadow-2xs cursor-help">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30">
                  {(profile.gepCertificates || []).length} Active Accreditations
                </div>
              </div>
            </div>
          </div>

          <GepCertificatesGrid 
            certificates={profile.gepCertificates || []} 
            onChange={(certs) => updateFormField('gepCertificates', certs)} 
            readOnly={!isEditing} 
            openAddTrigger={certAddTrigger}
          />
          {activeTab !== 'ALL' && renderSectionFooterNav('CERTS')}
        </div>
      )}
        </div>
      </div>
      {/* ========================================================================= */}
      {/* 4. MODALS: SHARE PASSPORT, EXPORT ONE-PAGER, CONNECT BUYER, INQUIRY       */}
      {/* ========================================================================= */}

      {/* Modal 1: Share Profile URL Modal (Minimal Modern Design) */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 pt-5 pb-2 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Share Public Profile</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    View Only
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct view-only access for enterprise buyers &amp; partners.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer shrink-0 focus:outline-none"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Link Input Row */}
            <div className="px-5 py-3">
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition shadow-2xs">
                <div className="pl-2.5 text-slate-400 shrink-0">
                  <Link2 className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={getShareableUrl()}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 bg-transparent border-none text-xs font-mono text-slate-800 focus:outline-none truncate px-1 py-1 selection:bg-emerald-100"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs focus:outline-none ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Note */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 px-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified coordinates, W-9, insurance &amp; certifications included</span>
              </div>
            </div>

            {/* Email Copied Notification Toast */}
            {emailCopied && (
              <div className="mx-5 mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Email invitation copied to clipboard!</span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-5 py-3.5 mt-1 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={getShareableUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5 shadow-2xs focus:outline-none"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </a>
                <button
                  type="button"
                  onClick={handleEmailShare}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer focus:outline-none"
                  title="Copy email invitation and launch mail client"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{emailCopied ? 'Email Copied!' : 'Email to Buyer'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs focus:outline-none"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: B2B Trust One-Pager Print / Export Summary */}
      {showOnePagerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Verisource Executive B2B Supplier One-Pager</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowOnePagerModal(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs print:p-0">
              {/* Printable Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{profile.legalName}</h2>
                  <div className="text-slate-500 font-medium">DBA: {profile.tradeName} • DUNS: {profile.dunsNumber}</div>
                  <div className="text-slate-500 mt-1">{profile.hqAddress} • {profile.businessEmail}</div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Verisource Verified 98%
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Audit Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Core Credentials Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Verified Corporate Identifiers</h4>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div><strong>Legal Entity:</strong> {profile.entityStructure || 'C-Corporation (Private)'}</div>
                  <div><strong>EIN:</strong> {profile.taxIdMasked} (IRS TIN Match 100%)</div>
                  <div><strong>Incorporation:</strong> {profile.stateOfIncorporation || 'Delaware, USA'} ({profile.incorporationDate.slice(0, 4)})</div>
                  <div><strong>Depository Bank:</strong> {profile.bankingDetails?.bankName} (Plaid Tokenized)</div>
                  <div><strong>Standard Terms:</strong> {profile.defaultPaymentTerms}</div>
                  <div><strong>Liability Coverage:</strong> {profile.masterVault?.insuranceCoverageAmount}</div>
                </div>
              </div>

              {/* Accreditations */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Accreditations & Security Attestations</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(profile.certifications || []).map((c) => (
                    <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.issuer} • Cert #{c.certNumber}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Signatories */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Authorized Representatives</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(profile.keyContacts || []).map((c) => (
                    <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.title} • {c.email}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t text-center text-slate-400 text-[10px]">
                Verified by Verisource Multi-Enterprise Supplier Network • Cryptographically Sealed Record
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Public Visitor Inquiry / Connect Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Connect with {profile.legalName}</h3>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInquiry} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Enterprise Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lockheed Precision Systems Inc."
                  value={inquiryData.buyerCompany}
                  onChange={(e) => setInquiryData({ ...inquiryData, buyerCompany: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sourcing Lead"
                    value={inquiryData.contactName}
                    onChange={(e) => setInquiryData({ ...inquiryData, contactName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="buyer@enterprise.com"
                    value={inquiryData.contactEmail}
                    onChange={(e) => setInquiryData({ ...inquiryData, contactEmail: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Procurement Inquiry Note</label>
                <textarea
                  rows={2}
                  placeholder="We would like to request vendor onboarding or invite you to bid on our upcoming compute and sensor RFP."
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inquirySent}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{inquirySent ? 'Sending...' : 'Send Inquiry to Officers'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
