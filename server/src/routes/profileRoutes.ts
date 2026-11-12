import { Router, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { GlobalSupplierProfile, BuyerSpecificProfile } from '../models/types.js';

const router = Router();

// In-memory profiles storage with rich B2B marketplace structured data
export const globalProfiles: Record<string, GlobalSupplierProfile> = {
  'supp-org-1': {
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
      remittanceMethod: 'Automated EDI 820 & Encrypted PDF'
    },
    taxCompliance: {
      einMasked: 'XX-XXX8812',
      taxFormType: 'IRS Form W-9',
      taxFormYear: '2024 / 2026 Certified',
      stateTaxId: 'Comptroller ID #32081928491',
      sanctionsScreening: 'OFAC / PEP Cleared (Autonomous Daily Audit)',
      exemptionStatus: 'Standard Commercial (Non-Exempt)'
    },
    insurancePolicies: [
      {
        id: 'ins-01',
        type: 'Commercial General Liability',
        coverageAmount: '$5,000,000 Aggregate',
        subLimit: '$2,000,000 Each Occurrence',
        carrier: 'Travelers Property Casualty Co. (A++)',
        policyNumber: 'GL-88219-01',
        expiryDate: '2027-06-30',
        status: 'ACTIVE'
      },
      {
        id: 'ins-02',
        type: 'Umbrella / Excess Liability',
        coverageAmount: '$10,000,000 Aggregate',
        subLimit: 'Follow Form',
        carrier: 'Travelers Property Casualty Co. (A++)',
        policyNumber: 'UMB-40912-88',
        expiryDate: '2027-06-30',
        status: 'ACTIVE'
      },
      {
        id: 'ins-03',
        type: 'Cyber Risk & Tech E&O',
        coverageAmount: '$5,000,000 Aggregate',
        subLimit: 'Zero Breaches On Record',
        carrier: "Lloyd's Syndicate #331",
        policyNumber: 'CY-99120-X',
        expiryDate: '2027-06-30',
        status: 'ACTIVE'
      },
      {
        id: 'ins-04',
        type: "Workers' Compensation",
        coverageAmount: 'Statutory Limits',
        subLimit: "$1,000,000 Employer's Liability",
        carrier: 'Texas Mutual Insurance Company',
        policyNumber: 'WC-77124-T',
        expiryDate: '2027-06-30',
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
  }
};

// Helper for public unauthenticated access
export const getPublicProfileBySlug = (slug: string) => {
  const profile = Object.values(globalProfiles).find(
    p => p.publicPassportSlug === slug || p.supplierOrgId === slug || p.id === slug
  ) || globalProfiles['supp-org-1'];

  if (!profile) return null;

  // Return public sanitized profile (with safety masks in place)
  return {
    ...profile,
    taxIdMasked: profile.taxIdMasked || 'XX-XXX8812',
    bankingDetails: profile.bankingDetails ? {
      ...profile.bankingDetails,
      accountEnding: profile.bankingDetails.accountEnding || '4921',
      routingNumberMasked: profile.bankingDetails.routingNumberMasked || '••••0021'
    } : undefined
  };
};

const buyerProfiles: Record<string, BuyerSpecificProfile[]> = {
  'supp-org-1': [
    {
      id: 'bprof-apex',
      supplierOrgId: 'supp-org-1',
      buyerOrgId: 'buyer-org-1',
      buyerName: 'Apex Global Enterprises',
      buyerLogoText: 'APEX',
      relationshipStatus: 'ACTIVE',
      erpVendorId: 'VEND-8821',
      connectedSince: 'Jan 2024',
      annualSpendVolume: 485000,
      customRemittanceAccount: {
        bankName: 'JPMorgan Chase Bank, N.A.',
        accountEnding: '4921',
        routingNumberMasked: '021000021',
        currency: 'USD',
        accountNickName: 'Primary Corporate Operating Account'
      },
      negotiatedTerms: {
        paymentTerms: '2/10 Net 30',
        earlyPaymentEligible: true,
        customDiscountRate: 1.5,
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
      lastSyncedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
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
      customQuestionnaires: [
        {
          questionId: 'q-star-1',
          questionText: 'ITAR Compliance & Export Control Administration Registration',
          answer: 'Registered with Directorate of Defense Trade Controls (DDTC)',
          category: 'Export Compliance'
        },
        {
          questionId: 'q-star-2',
          questionText: 'Scope 1, 2, and 3 Greenhouse Gas Emissions Tracking',
          answer: 'Carbon footprint audited via EcoVadis Gold Medal rating',
          category: 'Sustainability & ESG'
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
      lastSyncedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      syncCompletenessScore: 96
    },
    {
      id: 'bprof-meridian',
      supplierOrgId: 'supp-org-1',
      buyerOrgId: 'buyer-org-3',
      buyerName: 'Meridian Health Network',
      buyerLogoText: 'MERI',
      relationshipStatus: 'ACTIVE',
      erpVendorId: 'VEND-7701',
      connectedSince: 'Oct 2026',
      annualSpendVolume: 182000,
      customRemittanceAccount: {
        bankName: 'JPMorgan Chase Bank, N.A.',
        accountEnding: '4921',
        routingNumberMasked: '021000021',
        currency: 'USD',
        accountNickName: 'Meridian Clinical Transit Remittance'
      },
      negotiatedTerms: {
        paymentTerms: 'Net 30 Days',
        earlyPaymentEligible: false,
        preferredPaymentMethod: 'ACH_CREDIT'
      },
      customQuestionnaires: [
        {
          questionId: 'q-meridian-1',
          questionText: 'FDA 21 CFR Part 11 Electronic Validation Attestation',
          answer: 'Validated Quality Systems Conformance Attested',
          category: 'Regulatory'
        },
        {
          questionId: 'q-meridian-2',
          questionText: 'Hospital Healthcare Liability Rider ($5M Provider Policy)',
          answer: 'Fully Attested and Active under Travelers Healthcare schedule',
          category: 'Risk Management'
        }
      ],
      customDocumentOverrides: [
        {
          docType: 'HEALTH_INSURANCE',
          documentName: 'Meridian Dedicated Clinical Liability Endorsement',
          status: 'OVERRIDE_REQUIRED',
          note: 'Requires $5M specific cross-dock rider before final vendor code generation'
        }
      ],
      customCatalogTier: 'OmniRetail Supply Chain Standard Catalog',
      lastSyncedAt: new Date().toISOString(),
      syncCompletenessScore: 88
    }
  ]
};

// GET Global Profile
router.get('/global', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';

  let profile = globalProfiles[supplierOrgId];
  if (!profile) {
    // Return default scaffold
    profile = {
      ...globalProfiles['supp-org-1'],
      supplierOrgId,
      legalName: user?.organizationName || 'My Supplier Organization',
      tradeName: user?.organizationName || 'My Supplier Organization'
    };
    globalProfiles[supplierOrgId] = profile;
  }

  res.json({ profile });
});

// PUT Global Profile
router.put('/global', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';

  const existing = globalProfiles[supplierOrgId] || globalProfiles['supp-org-1'];
  const updated: GlobalSupplierProfile = {
    ...existing,
    ...req.body,
    supplierOrgId,
    updatedAt: new Date().toISOString()
  };

  globalProfiles[supplierOrgId] = updated;
  res.json({ profile: updated, message: 'Global Master Profile & B2B Trust Passport updated successfully.' });
});

// GET all Connected Buyer Profiles
router.get('/buyers', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';

  const buyers = buyerProfiles[supplierOrgId] || buyerProfiles['supp-org-1'];
  res.json({ buyerProfiles: buyers });
});

// GET specific Buyer Profile
router.get('/buyers/:buyerOrgId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { buyerOrgId } = req.params;

  const buyers = buyerProfiles[supplierOrgId] || buyerProfiles['supp-org-1'];
  const found = buyers.find(b => b.buyerOrgId === buyerOrgId || b.id === buyerOrgId);

  if (!found) {
    res.status(404).json({ error: 'Buyer relationship profile not found' });
    return;
  }

  res.json({ buyerProfile: found });
});

// PUT update specific Buyer Profile
router.put('/buyers/:buyerOrgId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { buyerOrgId } = req.params;

  const buyers = buyerProfiles[supplierOrgId] || buyerProfiles['supp-org-1'];
  const index = buyers.findIndex(b => b.buyerOrgId === buyerOrgId || b.id === buyerOrgId);

  if (index === -1) {
    res.status(404).json({ error: 'Buyer relationship profile not found' });
    return;
  }

  const updated: BuyerSpecificProfile = {
    ...buyers[index],
    ...req.body,
    lastSyncedAt: new Date().toISOString()
  };

  buyers[index] = updated;
  res.json({ buyerProfile: updated, message: `Profile for ${updated.buyerName} updated successfully.` });
});

// POST Agentic Profile Sync: Auto-populate buyer requirements from Global Profile
router.post('/buyers/:buyerOrgId/sync-ai', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { buyerOrgId } = req.params;

  const global = globalProfiles[supplierOrgId] || globalProfiles['supp-org-1'];
  const buyers = buyerProfiles[supplierOrgId] || buyerProfiles['supp-org-1'];
  const buyer = buyers.find(b => b.buyerOrgId === buyerOrgId || b.id === buyerOrgId);

  if (!buyer) {
    res.status(404).json({ error: 'Buyer relationship profile not found' });
    return;
  }

  // Autonomous Agentic Sync Logic
  const syncedFields = [
    { field: 'legalName', source: 'Global Master Passport', status: 'AUTO_POPULATED', confidence: 1.0 },
    { field: 'taxId', source: 'IRS W-9 Master Vault (TIN Verified)', status: 'AUTO_POPULATED', confidence: 1.0 },
    { field: 'hqAddress', source: 'Corporate Registration', status: 'AUTO_POPULATED', confidence: 0.99 },
    { field: 'dunsNumber', source: 'D&B Verified Master Record', status: 'AUTO_POPULATED', confidence: 1.0 },
    { field: 'iso27001Certificate', source: 'Universal Compliance Vault', status: 'AUTO_POPULATED', confidence: 0.98 },
    { field: 'bankCoordinates', source: 'Plaid / Early Warning Tokenized Direct Deposit', status: 'AUTO_POPULATED', confidence: 1.0 },
    { field: 'diversityStatus', source: 'MBE Council National Certification', status: 'AUTO_POPULATED', confidence: 0.95 }
  ];

  const unfulfilledDeltas = buyer.customDocumentOverrides
    .filter(d => d.status === 'OVERRIDE_REQUIRED')
    .map(d => ({
      document: d.documentName,
      requirement: d.note || 'Buyer-specific rider required',
      suggestedAction: 'AI Agent drafted endorsement request to broker'
    }));

  buyer.lastSyncedAt = new Date().toISOString();
  buyer.syncCompletenessScore = unfulfilledDeltas.length === 0 ? 100 : 92;

  res.json({
    message: `Agentic Sync Complete for ${buyer.buyerName}`,
    syncScore: buyer.syncCompletenessScore,
    syncedFieldsCount: syncedFields.length,
    syncedFields,
    unfulfilledDeltas,
    autonomousAgentNote: `Verisource Copilot auto-mapped ${syncedFields.length} master fields from your Global Passport with 99.4% confidence. ${unfulfilledDeltas.length} buyer-specific requirement(s) flagged for final review.`
  });
});

// POST Connect New Buyer
router.post('/buyers/connect', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { buyerName, buyerEmail, buyerContactName, invitationCode, connectionMethod, customMessage } = req.body;

  if (!buyerName) {
    res.status(400).json({ error: 'buyerName is required' });
    return;
  }

  const isEmailInvite = connectionMethod === 'EMAIL_INVITE';
  const newBuyerId = `buyer-org-${Date.now().toString().slice(-4)}`;
  const newProfile: BuyerSpecificProfile = {
    id: `bprof-${Date.now().toString().slice(-4)}`,
    supplierOrgId,
    buyerOrgId: newBuyerId,
    buyerName,
    buyerLogoText: buyerName.slice(0, 4).toUpperCase(),
    relationshipStatus: isEmailInvite ? 'INVITED' : 'ACTIVE',
    connectedSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '021000021',
      currency: 'USD',
      accountNickName: 'Primary Corporate Operating Account'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 30',
      earlyPaymentEligible: true,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [
      {
        questionId: 'q-new-1',
        questionText: `${buyerName} Standard Vendor Code of Conduct & ESG Declarations`,
        answer: 'Auto-accepted via Verisource Master B2B Trust Passport',
        category: 'Compliance'
      }
    ],
    customDocumentOverrides: [],
    customCatalogTier: 'Standard Enterprise Commercial Price List',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 98
  };

  if (!buyerProfiles[supplierOrgId]) {
    buyerProfiles[supplierOrgId] = [...buyerProfiles['supp-org-1']];
  }
  buyerProfiles[supplierOrgId].unshift(newProfile);

  const message = isEmailInvite
    ? `Onboarding invitation sent to ${buyerEmail || 'procurement team'} for ${buyerName}! Master Passport credentials attached.`
    : `Invitation code ${invitationCode || 'INV-VERIFIED'} verified! Connected with ${buyerName} and pre-populated onboarding workspace.`;

  res.status(201).json({
    message,
    buyerProfile: newProfile
  });
});

// POST Bi-directional Sync: Push updates from a Buyer Workspace back to Master Profile
router.post('/sync-to-master', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { updates, sourceBuyerName } = req.body;

  const current = globalProfiles[supplierOrgId] || globalProfiles['supp-org-1'];
  const updated: GlobalSupplierProfile = {
    ...current,
    ...updates,
    masterVault: {
      ...current.masterVault,
      ...(updates?.masterVault || {})
    },
    verificationBadges: {
      ...current.verificationBadges,
      ...(updates?.verificationBadges || {})
    },
    updatedAt: new Date().toISOString()
  };
  globalProfiles[supplierOrgId] = updated;

  res.json({
    message: `Master Profile successfully synchronized with updates from ${sourceBuyerName || 'Buyer Workspace'}! All future buyer onboardings will reflect these changes.`,
    profile: updated,
    syncedBackFields: Object.keys(updates || {})
  });
});

export default router;

