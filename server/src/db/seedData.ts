import { 
  User, 
  BuyerOrganization, 
  SupplierOrganization, 
  SupplierApplication, 
  ApplicationFieldValue, 
  OnboardingDocument, 
  EmailIntakeRecord, 
  ReviewTask, 
  SupplierMessage, 
  AuditEvent,
  PurchaseOrder,
  Invoice,
  CatalogItem,
  TransactionComment
} from '../models/types.js';

export const initialBuyerOrgs: BuyerOrganization[] = [
  {
    id: 'buyer-org-1',
    name: 'Apex Global Enterprises',
    domain: 'apexglobal.com',
    legalTaxId: 'US-94-3382910',
    defaultCurrency: 'USD',
    onboardingPolicies: {
      requiresSupplierConfirmation: true,
      allowBuyerSubmitOnBehalf: true,
      autoApprovalRiskThreshold: 15,
      mandatoryCategories: ['IT_HARDWARE_SERVICES', 'LOGISTICS_FREIGHT', 'DIRECT_RAW_MATERIALS']
    }
  },
  {
    id: 'buyer-org-2',
    name: 'NovaTech Aerospace & Defense',
    domain: 'novatechaerospace.com',
    legalTaxId: 'US-88-2910482',
    defaultCurrency: 'USD',
    onboardingPolicies: {
      requiresSupplierConfirmation: true,
      allowBuyerSubmitOnBehalf: false,
      autoApprovalRiskThreshold: 10,
      mandatoryCategories: ['DEFENSE_AVIONICS', 'IT_HARDWARE_SERVICES', 'CRYOGENIC_SENSORS']
    }
  },
  {
    id: 'buyer-org-3',
    name: 'Meridian Health Network',
    domain: 'meridianhealth.org',
    legalTaxId: 'US-36-4491028',
    defaultCurrency: 'USD',
    onboardingPolicies: {
      requiresSupplierConfirmation: true,
      allowBuyerSubmitOnBehalf: true,
      autoApprovalRiskThreshold: 20,
      mandatoryCategories: ['HEALTHCARE_CLOUD', 'IT_HARDWARE_SERVICES', 'CLINICAL_TELEMETRY']
    }
  }
];

export const initialSupplierOrgs: SupplierOrganization[] = [
  {
    id: 'supp-org-1',
    legalName: 'Acme Industrial Tech Inc.',
    tradeName: 'Acme Tech Solutions',
    country: 'United States',
    taxId: 'XX-XXX8812',
    businessEmail: 'elena@acmeindustrial.com',
    phone: '+1 (512) 555-0199',
    website: 'https://acmeindustrialtech.example.com',
    address: {
      line1: '100 Industrial Parkway, Suite 400',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA'
    },
    status: 'ACTIVE',
    createdAt: '2026-10-10T09:00:00Z'
  },
  {
    id: 'supp-org-2',
    legalName: 'Vanguard Freight Logistics LLC',
    tradeName: 'Vanguard Express',
    country: 'United States',
    taxId: '12-9876543',
    businessEmail: 'operations@vanguardfreight.com',
    phone: '+1 (312) 555-0199',
    website: 'https://vanguardfreight.com',
    address: {
      line1: '1200 S Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60605',
      country: 'USA'
    },
    status: 'ONBOARDING',
    createdAt: '2026-10-12T14:30:00Z'
  },
  {
    id: 'supp-org-3',
    legalName: 'Apex Analytics LLC',
    tradeName: 'Apex Data Services',
    country: 'United States',
    taxId: '84-1294821', // Identical Tax ID to Nexura (Corporate succession scenario)
    businessEmail: 'contact@apexanalytics.archive',
    status: 'ACTIVE',
    erpVendorId: 'VEND-88102',
    createdAt: '2024-03-15T11:00:00Z'
  },
  {
    id: 'supp-org-4',
    legalName: 'BioTech Solutions International',
    tradeName: 'BioTech Lab Partners',
    country: 'Germany',
    taxId: 'DE-289410294',
    businessEmail: 'procurement@biotech-int.de',
    phone: '+49 89 2442 8900',
    status: 'PROSPECT',
    createdAt: '2026-10-18T10:15:00Z'
  },
  {
    id: 'supp-org-5',
    legalName: 'CloudScale Networks Inc.',
    tradeName: 'CloudScale Infrastructure',
    country: 'United States',
    taxId: '77-4029182',
    businessEmail: 'billing@cloudscale.net',
    phone: '+1 (206) 555-7821',
    status: 'ACTIVE',
    erpVendorId: 'VEND-99214',
    createdAt: '2026-09-01T08:00:00Z'
  }
];

export const initialUsers: User[] = [
  {
    id: 'user-supp-acme',
    email: 'elena@acmeindustrial.com',
    name: 'Elena Rostova',
    role: 'SUPPLIER_ADMIN',
    userType: 'SUPPLIER',
    organizationId: 'supp-org-1',
    organizationName: 'Acme Industrial Tech Inc.',
    isEmailVerified: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-buyer-1',
    email: 'sarah.chen@apexglobal.com',
    name: 'Sarah Chen',
    role: 'BUYER_ADMIN',
    userType: 'BUYER',
    organizationId: 'buyer-org-1',
    organizationName: 'Apex Global Enterprises',
    isEmailVerified: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-buyer-2',
    email: 'marcus.vance@apexglobal.com',
    name: 'Marcus Vance',
    role: 'BUYER_REVIEWER',
    userType: 'BUYER',
    organizationId: 'buyer-org-1',
    organizationName: 'Apex Global Enterprises',
    isEmailVerified: true,
    createdAt: '2026-02-15T08:00:00Z'
  },
  {
    id: 'user-buyer-3',
    email: 'elena.rostova@apexglobal.com',
    name: 'Elena Rostova',
    role: 'BUYER_APPROVER',
    userType: 'BUYER',
    organizationId: 'buyer-org-1',
    organizationName: 'Apex Global Enterprises',
    isEmailVerified: true,
    createdAt: '2026-01-05T08:00:00Z'
  },
  {
    id: 'user-supp-1',
    email: 'j.miller@acmeindustrial.com',
    name: 'Jason Miller',
    role: 'SUPPLIER_ADMIN',
    userType: 'SUPPLIER',
    organizationId: 'supp-org-1',
    organizationName: 'Acme Industrial Tech Inc.',
    isEmailVerified: true,
    createdAt: '2026-10-10T09:05:00Z'
  },
  {
    id: 'user-supp-2',
    email: 'operations@vanguardfreight.com',
    name: 'David Reynolds',
    role: 'SUPPLIER_ADMIN',
    userType: 'SUPPLIER',
    organizationId: 'supp-org-2',
    organizationName: 'Vanguard Freight Logistics LLC',
    isEmailVerified: true,
    createdAt: '2026-10-12T14:35:00Z'
  }
];

export const initialApplications: SupplierApplication[] = [
  {
    id: 'app-0042',
    caseReference: 'APP-2026-0042',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-1',
    supplierName: 'Nexura Global Analytics Inc.',
    supplierEmail: 'j.miller@nexuraglobal.com',
    channel: 'EMAIL_ASSISTED',
    status: 'UNDER_REVIEW',
    accountVerificationState: 'EMAIL_VERIFIED',
    assignedReviewerId: 'user-buyer-2',
    assignedReviewerName: 'Marcus Vance',
    approverId: 'user-buyer-3',
    approverName: 'Elena Rostova',
    supplyCategory: 'IT_HARDWARE_SERVICES',
    onboardingReason: 'Enterprise AI & Data Pipeline modernizing S2P analytics',
    riskScore: 28,
    riskLevel: 'MEDIUM',
    aiSummary: 'Corporate Succession Detected: Request names "Nexura Global Analytics Inc." W-9 and Certificate of Merger share EIN 84-1294821 with legacy active vendor Apex Analytics LLC (VEND-88102). Banking details match Secretary of State filing. Recommended: Authorize entity succession and merge vendor lineage.',
    currentStep: 6,
    totalSteps: 7,
    missingFieldsCount: 0,
    conflictingFieldsCount: 1,
    unverifiedDocsCount: 1,
    hasBuyerEdits: true,
    createdAt: '2026-10-15T11:20:00Z',
    updatedAt: '2026-10-23T14:10:00Z',
    submittedAt: '2026-10-22T16:00:00Z'
  },
  {
    id: 'app-0089',
    caseReference: 'APP-2026-0089',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-2',
    supplierName: 'Vanguard Freight Logistics LLC',
    supplierEmail: 'operations@vanguardfreight.com',
    channel: 'SUPPLIER_SELF_SERVICE',
    status: 'CHANGES_REQUESTED',
    accountVerificationState: 'CLAIMED',
    assignedReviewerId: 'user-buyer-2',
    assignedReviewerName: 'Marcus Vance',
    supplyCategory: 'LOGISTICS_FREIGHT',
    onboardingReason: 'Primary LTL freight carrier for Midwest distribution centers',
    riskScore: 64,
    riskLevel: 'HIGH',
    aiSummary: 'Discrepancy & Missing Document: Form TIN (12-3456789) contradicts official IRS W-9 OCR certificate (12-9876543). Mandatory ACORD 25 Certificate of Liability Insurance missing $5M cargo coverage clause. Clarification email drafted with targeted field references.',
    currentStep: 5,
    totalSteps: 7,
    missingFieldsCount: 1,
    conflictingFieldsCount: 1,
    unverifiedDocsCount: 2,
    hasBuyerEdits: false,
    createdAt: '2026-10-18T09:45:00Z',
    updatedAt: '2026-10-23T15:30:00Z',
    submittedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'app-0104',
    caseReference: 'APP-2026-0104',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-4',
    supplierName: 'BioTech Solutions International',
    supplierEmail: 'procurement@biotech-int.de',
    channel: 'BUYER_ASSISTED',
    status: 'DRAFT',
    accountVerificationState: 'UNVERIFIED',
    assignedReviewerId: 'user-buyer-1',
    assignedReviewerName: 'Sarah Chen',
    supplyCategory: 'DIRECT_RAW_MATERIALS',
    onboardingReason: 'Direct biological testing reagents required for Q4 lab testing',
    riskScore: 42,
    riskLevel: 'MEDIUM',
    aiSummary: 'Buyer Prepared Draft: Initiated by Sarah Chen from vendor quote & email intake. German VAT DE-289410294 verified against VIES database. Banking confirmation letter pending supplier sign-off. Supplier invitation link generated.',
    currentStep: 4,
    totalSteps: 7,
    missingFieldsCount: 3,
    conflictingFieldsCount: 0,
    unverifiedDocsCount: 1,
    hasBuyerEdits: true,
    supplierClaimToken: 'claim-tok-bio-9981',
    createdAt: '2026-10-21T13:10:00Z',
    updatedAt: '2026-10-23T12:00:00Z'
  },
  {
    id: 'app-0012',
    caseReference: 'APP-2026-0012',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-5',
    supplierName: 'CloudScale Networks Inc.',
    supplierEmail: 'billing@cloudscale.net',
    channel: 'SUPPLIER_SELF_SERVICE',
    status: 'APPROVED',
    accountVerificationState: 'CLAIMED',
    assignedReviewerId: 'user-buyer-2',
    assignedReviewerName: 'Marcus Vance',
    approverId: 'user-buyer-3',
    approverName: 'Elena Rostova',
    supplyCategory: 'IT_HARDWARE_SERVICES',
    onboardingReason: 'High throughput cloud CDN edge compute infrastructure',
    riskScore: 8,
    riskLevel: 'LOW',
    aiSummary: 'Express Onboarding Completed: All certifications (SOC2 Type II, ISO 27001, IRS W-9) verified. OFAC SDN Sanctions clear. Approved by Elena Rostova. Ready for ERP vendor master sync.',
    currentStep: 7,
    totalSteps: 7,
    missingFieldsCount: 0,
    conflictingFieldsCount: 0,
    unverifiedDocsCount: 0,
    hasBuyerEdits: false,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-05T14:00:00Z',
    submittedAt: '2026-09-03T11:00:00Z',
    reviewedAt: '2026-09-04T16:00:00Z',
    approvedAt: '2026-09-05T14:00:00Z',
    erpVendorId: 'VEND-99214'
  }
];

export const initialFieldValues: ApplicationFieldValue[] = [
  // Fields for APP-2026-0042 (Nexura)
  {
    id: 'fv-0042-1',
    applicationId: 'app-0042',
    fieldKey: 'legal_entity_name',
    value: 'Nexura Global Analytics Inc.',
    provenance: 'DOCUMENT_EXTRACTED',
    sourceReference: 'doc-w9-0042',
    sourcePage: 1,
    confidence: 0.98,
    verificationStatus: 'HUMAN_VERIFIED',
    lastModifiedBy: 'Marcus Vance',
    updatedAt: '2026-10-22T17:00:00Z'
  },
  {
    id: 'fv-0042-2',
    applicationId: 'app-0042',
    fieldKey: 'tax_identifier',
    value: '84-1294821',
    provenance: 'DOCUMENT_EXTRACTED',
    sourceReference: 'doc-w9-0042',
    sourcePage: 1,
    confidence: 0.99,
    verificationStatus: 'HUMAN_VERIFIED',
    conflictValues: [
      {
        value: 'Apex Analytics LLC (Legacy Master)',
        source: 'ERP Master DB (VEND-88102)',
        confidence: 1.0,
        detectedAt: '2026-10-22T16:05:00Z'
      }
    ],
    isSensitive: true,
    lastModifiedBy: 'Marcus Vance',
    updatedAt: '2026-10-22T17:05:00Z'
  },
  {
    id: 'fv-0042-3',
    applicationId: 'app-0042',
    fieldKey: 'registered_address',
    value: '500 Howard Street, Suite 400, San Francisco, CA 94105',
    provenance: 'DOCUMENT_EXTRACTED',
    sourceReference: 'doc-w9-0042',
    sourcePage: 1,
    confidence: 0.95,
    verificationStatus: 'AI_CONFIRMED',
    updatedAt: '2026-10-22T16:02:00Z'
  },
  {
    id: 'fv-0042-4',
    applicationId: 'app-0042',
    fieldKey: 'corporate_succession_predecessor',
    value: 'Apex Analytics LLC (Merged via DE Certificate of Merger)',
    provenance: 'DOCUMENT_EXTRACTED',
    sourceReference: 'doc-merger-0042',
    sourcePage: 2,
    confidence: 0.94,
    verificationStatus: 'AI_CONFIRMED',
    updatedAt: '2026-10-22T16:03:00Z'
  },
  {
    id: 'fv-0042-5',
    applicationId: 'app-0042',
    fieldKey: 'bank_beneficiary_name',
    value: 'Nexura Global Analytics Inc.',
    provenance: 'DOCUMENT_EXTRACTED',
    sourceReference: 'doc-bank-0042',
    sourcePage: 1,
    confidence: 0.96,
    verificationStatus: 'AI_CONFIRMED',
    updatedAt: '2026-10-22T16:04:00Z'
  },
  {
    id: 'fv-0042-6',
    applicationId: 'app-0042',
    fieldKey: 'bank_account_number',
    value: '489201948210',
    provenance: 'DOCUMENT_EXTRACTED',
    sourceReference: 'doc-bank-0042',
    sourcePage: 1,
    confidence: 0.97,
    verificationStatus: 'UNVERIFIED',
    isSensitive: true,
    updatedAt: '2026-10-22T16:04:00Z'
  },
  {
    id: 'fv-0042-7',
    applicationId: 'app-0042',
    fieldKey: 'bank_routing_number',
    value: '121000358',
    provenance: 'DOCUMENT_EXTRACTED',
    sourceReference: 'doc-bank-0042',
    sourcePage: 1,
    confidence: 0.99,
    verificationStatus: 'AI_CONFIRMED',
    isSensitive: true,
    updatedAt: '2026-10-22T16:04:00Z'
  },
  {
    id: 'fv-0042-8',
    applicationId: 'app-0042',
    fieldKey: 'iso_certification',
    value: 'ISO/IEC 27001:2022 Certified (Valid through Nov 2027)',
    provenance: 'DOCUMENT_EXTRACTED',
    sourceReference: 'doc-iso-0042',
    sourcePage: 1,
    confidence: 0.98,
    verificationStatus: 'HUMAN_VERIFIED',
    lastModifiedBy: 'Marcus Vance',
    updatedAt: '2026-10-22T17:15:00Z'
  },

  // Fields for APP-2026-0089 (Vanguard Freight)
  {
    id: 'fv-0089-1',
    applicationId: 'app-0089',
    fieldKey: 'legal_entity_name',
    value: 'Vanguard Freight Logistics LLC',
    provenance: 'SUPPLIER_ENTERED',
    sourceReference: 'supplier-portal-step1',
    confidence: 1.0,
    verificationStatus: 'HUMAN_VERIFIED',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'fv-0089-2',
    applicationId: 'app-0089',
    fieldKey: 'tax_identifier',
    value: '12-3456789',
    provenance: 'SUPPLIER_ENTERED',
    sourceReference: 'supplier-portal-step3',
    confidence: 1.0,
    verificationStatus: 'REJECTED',
    conflictValues: [
      {
        value: '12-9876543',
        source: 'IRS W-9 Certificate (doc-w9-0089, page 1)',
        confidence: 0.99,
        detectedAt: '2026-10-20T10:05:00Z'
      }
    ],
    isSensitive: true,
    updatedAt: '2026-10-23T15:00:00Z'
  },
  {
    id: 'fv-0089-3',
    applicationId: 'app-0089',
    fieldKey: 'bank_account_number',
    value: '992019401294',
    provenance: 'SUPPLIER_ENTERED',
    sourceReference: 'supplier-portal-step4',
    confidence: 1.0,
    verificationStatus: 'UNVERIFIED',
    isSensitive: true,
    updatedAt: '2026-10-20T10:02:00Z'
  },
  {
    id: 'fv-0089-4',
    applicationId: 'app-0089',
    fieldKey: 'cargo_liability_insurance',
    value: 'Missing - Required for Freight Carriers ($5M min)',
    provenance: 'SYSTEM_DERIVED',
    sourceReference: 'category-policy-check',
    confidence: 1.0,
    verificationStatus: 'REJECTED',
    updatedAt: '2026-10-20T10:05:00Z'
  }
];

export const initialDocuments: OnboardingDocument[] = [
  {
    id: 'doc-w9-0042',
    applicationId: 'app-0042',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-1',
    title: 'IRS Form W-9 (Signed October 2026)',
    filename: 'W9_Nexura_Global_Analytics_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 342190,
    checksum: 'sha256:7f9a2e8c1b0d4f5a9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6',
    storagePath: '/uploads/app-0042/W9_Nexura_Global_Analytics_2026.pdf',
    docType: 'IRS_W9',
    isExpired: false,
    verificationStatus: 'VERIFIED',
    uploadedBy: 'Email Intake (j.miller@nexuraglobal.com)',
    uploadedRole: 'SUPPLIER',
    uploadedAt: '2026-10-15T11:25:00Z',
    extractions: [
      {
        fieldKey: 'legal_entity_name',
        label: 'Legal Entity Name',
        value: 'Nexura Global Analytics Inc.',
        confidence: 0.98,
        boundingBox: { page: 1, x: 120, y: 155, w: 320, h: 28 },
        rawSnippet: '1 Name (as shown on your income tax return): Nexura Global Analytics Inc.'
      },
      {
        fieldKey: 'tax_identifier',
        label: 'Employer Identification Number (EIN)',
        value: '84-1294821',
        confidence: 0.99,
        boundingBox: { page: 1, x: 380, y: 520, w: 180, h: 32 },
        rawSnippet: 'Part I: Social Security / Employer ID Number: 84 - 1294821'
      },
      {
        fieldKey: 'registered_address',
        label: 'Address',
        value: '500 Howard Street, Suite 400, San Francisco, CA 94105',
        confidence: 0.95,
        boundingBox: { page: 1, x: 120, y: 240, w: 380, h: 42 },
        rawSnippet: '5 Address: 500 Howard Street, Suite 400\n6 City, state, ZIP: San Francisco, CA 94105'
      }
    ]
  },
  {
    id: 'doc-merger-0042',
    applicationId: 'app-0042',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-1',
    title: 'State of Delaware Certificate of Merger',
    filename: 'DE_Certificate_of_Merger_Apex_Nexura.pdf',
    fileType: 'application/pdf',
    fileSize: 840210,
    checksum: 'sha256:3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    storagePath: '/uploads/app-0042/DE_Certificate_of_Merger_Apex_Nexura.pdf',
    docType: 'CERT_INCORPORATION',
    isExpired: false,
    verificationStatus: 'VERIFIED',
    uploadedBy: 'Email Intake (j.miller@nexuraglobal.com)',
    uploadedRole: 'SUPPLIER',
    uploadedAt: '2026-10-15T11:25:00Z',
    extractions: [
      {
        fieldKey: 'corporate_succession_predecessor',
        label: 'Predecessor Entity',
        value: 'Apex Analytics LLC',
        confidence: 0.94,
        boundingBox: { page: 1, x: 140, y: 190, w: 290, h: 30 },
        rawSnippet: 'Merging entity: Apex Analytics LLC, a Delaware limited liability company'
      },
      {
        fieldKey: 'surviving_entity',
        label: 'Surviving Entity',
        value: 'Nexura Global Analytics Inc.',
        confidence: 0.97,
        boundingBox: { page: 1, x: 140, y: 260, w: 310, h: 30 },
        rawSnippet: 'Surviving Corporation: Nexura Global Analytics Inc., filing effective Sep 2026'
      }
    ]
  },
  {
    id: 'doc-bank-0042',
    applicationId: 'app-0042',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-1',
    title: 'Silicon Valley Bank / First Citizens Bank Letter',
    filename: 'SVB_Account_Verification_Letter.pdf',
    fileType: 'application/pdf',
    fileSize: 420100,
    checksum: 'sha256:8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
    storagePath: '/uploads/app-0042/SVB_Account_Verification_Letter.pdf',
    docType: 'BANK_VERIFICATION_LETTER',
    isExpired: false,
    verificationStatus: 'PENDING',
    uploadedBy: 'Marcus Vance',
    uploadedRole: 'BUYER',
    uploadedAt: '2026-10-16T09:10:00Z',
    extractions: [
      {
        fieldKey: 'bank_beneficiary_name',
        label: 'Account Name',
        value: 'Nexura Global Analytics Inc.',
        confidence: 0.96,
        boundingBox: { page: 1, x: 160, y: 310, w: 280, h: 26 },
        rawSnippet: 'This certifies that the account for Nexura Global Analytics Inc. is active and in good standing.'
      },
      {
        fieldKey: 'bank_routing_number',
        label: 'Routing / ABA',
        value: '121000358',
        confidence: 0.99,
        boundingBox: { page: 1, x: 160, y: 350, w: 160, h: 24 },
        rawSnippet: 'Routing Number (ACH/Wire): 121000358'
      }
    ]
  },
  {
    id: 'doc-iso-0042',
    applicationId: 'app-0042',
    supplierOrgId: 'supp-org-1',
    buyerOrgId: 'buyer-org-1',
    title: 'ISO/IEC 27001:2022 Certificate',
    filename: 'ISO_27001_Certificate_Nexura.pdf',
    fileType: 'application/pdf',
    fileSize: 612400,
    checksum: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    storagePath: '/uploads/app-0042/ISO_27001_Certificate_Nexura.pdf',
    docType: 'ISO_27001',
    expiryDate: '2027-11-15',
    isExpired: false,
    verificationStatus: 'VERIFIED',
    uploadedBy: 'Email Intake',
    uploadedRole: 'SUPPLIER',
    uploadedAt: '2026-10-15T11:25:00Z'
  },
  {
    id: 'doc-w9-0089',
    applicationId: 'app-0089',
    supplierOrgId: 'supp-org-2',
    buyerOrgId: 'buyer-org-1',
    title: 'IRS Form W-9 (Vanguard Freight)',
    filename: 'Vanguard_W9_Signed.pdf',
    fileType: 'application/pdf',
    fileSize: 298400,
    checksum: 'sha256:2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    storagePath: '/uploads/app-0089/Vanguard_W9_Signed.pdf',
    docType: 'IRS_W9',
    isExpired: false,
    verificationStatus: 'FLAGGED',
    uploadedBy: 'David Reynolds',
    uploadedRole: 'SUPPLIER',
    uploadedAt: '2026-10-18T10:00:00Z',
    extractions: [
      {
        fieldKey: 'tax_identifier',
        label: 'EIN from Form',
        value: '12-9876543',
        confidence: 0.99,
        boundingBox: { page: 1, x: 380, y: 520, w: 180, h: 32 },
        rawSnippet: 'Part I: Social Security / Employer ID Number: 12 - 9876543'
      }
    ]
  }
];

export const initialEmailIntake: EmailIntakeRecord[] = [
  {
    id: 'email-in-1',
    buyerOrgId: 'buyer-org-1',
    senderEmail: 'j.miller@nexuraglobal.com',
    senderName: 'Jason Miller',
    subject: '[APP-2026-0042] Re: Apex Global Supplier Onboarding Documentation',
    bodySnippet: 'Hi Sarah and Marcus, Attached please find our updated W-9, our recent Delaware Certificate of Merger documenting our corporate transition from Apex Analytics to Nexura Global Analytics, and our banking confirmation letter from SVB.',
    receivedAt: '2026-10-15T11:20:00Z',
    associatedCaseReference: 'APP-2026-0042',
    associatedApplicationId: 'app-0042',
    status: 'PROCESSED',
    suggestedMatchSupplierName: 'Nexura Global Analytics Inc.',
    confidenceMatch: 0.99,
    attachments: [
      { id: 'att-1', filename: 'W9_Nexura_Global_Analytics_2026.pdf', fileType: 'application/pdf', size: 342190, docType: 'IRS_W9', processed: true, documentId: 'doc-w9-0042' },
      { id: 'att-2', filename: 'DE_Certificate_of_Merger_Apex_Nexura.pdf', fileType: 'application/pdf', size: 840210, docType: 'CERT_INCORPORATION', processed: true, documentId: 'doc-merger-0042' },
      { id: 'att-3', filename: 'ISO_27001_Certificate_Nexura.pdf', fileType: 'application/pdf', size: 612400, docType: 'ISO_27001', processed: true, documentId: 'doc-iso-0042' }
    ]
  },
  {
    id: 'email-in-2',
    buyerOrgId: 'buyer-org-1',
    senderEmail: 'billing@novastream.io',
    senderName: 'Elena Rostova (Forwarded from intake@apexglobal.com)',
    subject: 'Vendor Intake: NovaStream Technologies Inc. Onboarding Pack',
    bodySnippet: 'Hello Procurement Team, We have been awarded the Q4 cloud telemetry RFP. Attached are our vendor registration forms, certificate of insurance, and direct deposit details for Apex Global.',
    receivedAt: '2026-10-23T13:45:00Z',
    associatedCaseReference: null,
    associatedApplicationId: null,
    status: 'NEW',
    suggestedMatchSupplierName: 'NovaStream Technologies Inc. (New Prospect)',
    confidenceMatch: 0.85,
    attachments: [
      { id: 'att-4', filename: 'NovaStream_W9_2026.pdf', fileType: 'application/pdf', size: 285400, docType: 'IRS_W9', processed: false },
      { id: 'att-5', filename: 'ACORD_Insurance_NovaStream.pdf', fileType: 'application/pdf', size: 512000, docType: 'CERT_INSURANCE_ACORD', processed: false }
    ]
  }
];

export const initialReviewTasks: ReviewTask[] = [
  {
    id: 'task-1',
    applicationId: 'app-0042',
    title: 'Adjudicate Corporate Succession (Apex -> Nexura)',
    description: 'Verify Delaware Certificate of Merger and approve continuous master lineage for Tax ID 84-1294821.',
    assignedTo: 'user-buyer-2',
    assignedRole: 'BUYER_REVIEWER',
    type: 'SANCTIONS_ADJUDICATION',
    status: 'PENDING',
    priority: 'HIGH',
    dueDate: '2026-10-24T18:00:00Z',
    createdAt: '2026-10-22T16:10:00Z'
  },
  {
    id: 'task-2',
    applicationId: 'app-0089',
    title: 'Review Tax TIN Conflict & Dispatch Inquiry',
    description: 'Supplier form TIN contradicts IRS W-9 OCR value (12-3456789 vs 12-9876543).',
    assignedTo: 'user-buyer-2',
    assignedRole: 'BUYER_REVIEWER',
    type: 'TAX_VALIDATION',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-10-24T12:00:00Z',
    createdAt: '2026-10-20T10:15:00Z'
  },
  {
    id: 'task-3',
    applicationId: 'app-0042',
    title: 'Final VP S2P Procurement Approval',
    description: 'Executive sign-off on IT Hardware & AI Services vendor onboarding for Nexura Global.',
    assignedTo: 'user-buyer-3',
    assignedRole: 'BUYER_APPROVER',
    type: 'FINAL_APPROVAL',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '2026-10-25T17:00:00Z',
    createdAt: '2026-10-22T16:15:00Z'
  }
];

export const initialMessages: SupplierMessage[] = [
  {
    id: 'msg-1',
    applicationId: 'app-0042',
    senderId: 'user-buyer-2',
    senderName: 'Marcus Vance',
    senderRole: 'BUYER',
    subject: 'Document Received - Under Verification',
    message: 'Hello Jason, we have received your Certificate of Merger and IRS W-9. Our compliance team is currently adjudicating the vendor record transition.',
    isInternalNote: false,
    sentAt: '2026-10-22T16:20:00Z',
    deliveryStatus: 'DELIVERED',
    deliveryCorrelationId: 'CORR-99821'
  },
  {
    id: 'msg-2',
    applicationId: 'app-0042',
    senderId: 'user-buyer-2',
    senderName: 'Marcus Vance',
    senderRole: 'BUYER',
    subject: 'Internal Note: Tax ID Matching Legacy Apex Analytics',
    message: 'EIN 84-1294821 verified against IRS e-Services. Delaware certificate confirms 100% stock purchase and statutory conversion. Recommending approval without duplicate vendor code creation.',
    isInternalNote: true,
    sentAt: '2026-10-22T16:25:00Z',
    deliveryStatus: 'DELIVERED'
  },
  {
    id: 'msg-3',
    applicationId: 'app-0089',
    senderId: 'ai-agent-system',
    senderName: 'Supplier Steward AI Agent',
    senderRole: 'SYSTEM_AI',
    subject: 'Action Required: Tax ID Clarification & Missing Insurance (APP-2026-0089)',
    message: 'Dear Vanguard Freight Team, during automated compliance review, we noticed that your portal entry tax ID (12-3456789) differs from your submitted IRS W-9 (12-9876543). Additionally, our category policy requires an ACORD 25 Certificate of Liability with $5,000,000 minimum cargo coverage. Please update these items in your portal dashboard to proceed.',
    isInternalNote: false,
    sentAt: '2026-10-23T15:30:00Z',
    deliveryStatus: 'SENT',
    deliveryCorrelationId: 'CORR-10029'
  }
];

export const initialAuditEvents: AuditEvent[] = [
  {
    id: 'aud-1',
    buyerOrgId: 'buyer-org-1',
    actorId: 'ai-agent-doc',
    actorName: 'Agentic Document Intelligence',
    actorRole: 'SYSTEM_AI',
    action: 'DOCUMENTS_EXTRACTED',
    entityType: 'DOCUMENT',
    entityId: 'doc-w9-0042',
    details: {
      docType: 'IRS_W9',
      extractedFieldsCount: 3,
      avgConfidence: 0.97,
      source: 'W9_Nexura_Global_Analytics_2026.pdf'
    },
    timestamp: '2026-10-15T11:26:00Z'
  },
  {
    id: 'aud-2',
    buyerOrgId: 'buyer-org-1',
    actorId: 'ai-agent-id',
    actorName: 'Identity & Duplicate Resolution Agent',
    actorRole: 'SYSTEM_AI',
    action: 'SUCCESSION_PATTERN_DETECTED',
    entityType: 'APPLICATION',
    entityId: 'app-0042',
    details: {
      taxId: '84-1294821',
      matchedPredecessor: 'Apex Analytics LLC (VEND-88102)',
      resolutionProposed: 'AUTHORIZE_SUCCESSION'
    },
    timestamp: '2026-10-15T11:27:00Z'
  },
  {
    id: 'aud-3',
    buyerOrgId: 'buyer-org-1',
    actorId: 'user-buyer-2',
    actorName: 'Marcus Vance',
    actorRole: 'BUYER_REVIEWER',
    action: 'FIELD_VERIFIED',
    entityType: 'APPLICATION_FIELD',
    entityId: 'fv-0042-1',
    details: {
      fieldKey: 'legal_entity_name',
      status: 'HUMAN_VERIFIED'
    },
    timestamp: '2026-10-22T17:00:00Z'
  },
  {
    id: 'aud-4',
    buyerOrgId: 'buyer-org-1',
    actorId: 'user-buyer-2',
    actorName: 'Marcus Vance',
    actorRole: 'BUYER_REVIEWER',
    action: 'CHANGES_REQUESTED',
    entityType: 'APPLICATION',
    entityId: 'app-0089',
    details: {
      reason: 'TIN mismatch and missing cargo insurance ACORD certificate',
      supplierEmail: 'operations@vanguardfreight.com'
    },
    timestamp: '2026-10-23T15:30:00Z'
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-101-meridian',
    poNumber: 'PO-2026-101',
    buyerOrgId: 'buyer-org-3',
    supplierOrgId: 'supp-org-1',
    supplierName: 'CloudBridge Solutions LLC',
    status: 'ACKNOWLEDGED',
    orderDate: '2026-10-28T09:00:00Z',
    promisedDate: '2026-11-12T16:00:00Z',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    subtotal: 45000.00,
    taxAmount: 0.00,
    totalAmount: 45000.00,
    shippingAddress: 'Meridian Data Center — Bay 14, Attn: IT Infrastructure Operations, 7800 Technology Boulevard, Dock B, Naperville, IL 60563',
    billingAddress: 'Meridian Health Network AP Division, 4200 Medical Center Way, Suite 800, Chicago, IL 60611',
    buyerContactName: 'Sarah Chen (Lead Procurement Specialist)',
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
        quantity: 1,
        uom: 'EA',
        unitPrice: 28500.00,
        totalPrice: 28500.00,
        deliveryDate: '2026-11-12',
        invoicedQuantity: 1
      },
      {
        id: 'poli-101-m2',
        itemNumber: 2,
        partNumber: 'SEC-SOC2-CONFIG',
        description: 'HIPAA & SOC 2 Type II Compliant Dedicated Gateway & Firewall Cluster Configuration',
        quantity: 2,
        uom: 'SET',
        unitPrice: 6250.00,
        totalPrice: 12500.00,
        deliveryDate: '2026-11-12',
        invoicedQuantity: 1
      },
      {
        id: 'poli-101-m3',
        itemNumber: 3,
        partNumber: 'SVC-VAL-MIG',
        description: 'Data Validation, Backup Redundancy Testing & Production Handover Services',
        quantity: 1,
        uom: 'JOB',
        unitPrice: 4000.00,
        totalPrice: 4000.00,
        deliveryDate: '2026-11-12',
        invoicedQuantity: 0
      }
    ]
  },
  {
    id: 'po-101',
    poNumber: 'PO-2026-8891',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-1',
    supplierName: 'Acme Industrial Tech Inc.',
    status: 'ACKNOWLEDGED',
    orderDate: '2026-10-18T14:00:00Z',
    promisedDate: '2026-11-15T18:00:00Z',
    paymentTerms: '2/10 Net 30',
    currency: 'USD',
    subtotal: 48500.00,
    taxAmount: 3880.00,
    totalAmount: 52380.00,
    shippingAddress: 'Apex Global DC-1, 1400 Procurement Blvd, Austin, TX 78701',
    billingAddress: 'Apex Global Accounts Payable, PO Box 8802, New York, NY 10001',
    buyerContactName: 'Sarah Chen (Lead Procurement Architect)',
    acknowledgedAt: '2026-10-19T09:15:00Z',
    acknowledgedBy: 'Elena Rostova (Acme Industrial)',
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
    id: 'po-104',
    poNumber: 'PO-2026-9104',
    buyerOrgId: 'buyer-org-2',
    supplierOrgId: 'supp-org-1',
    supplierName: 'Acme Industrial Tech Inc.',
    status: 'IN_FULFILLMENT',
    orderDate: '2026-10-21T10:30:00Z',
    promisedDate: '2026-11-10T17:00:00Z',
    paymentTerms: 'Net 45 Standard',
    currency: 'USD',
    subtotal: 118000.00,
    taxAmount: 9440.00,
    totalAmount: 127440.00,
    shippingAddress: 'Starlight Aerospace Defense Facility 4, Huntsville, AL 35805',
    billingAddress: 'Starlight AP Invoicing Desk, PO Box 4010, Los Angeles, CA 90012',
    buyerContactName: 'Col. Jonathan Vance (Procurement Officer)',
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
    id: 'po-105',
    poNumber: 'PO-2026-9280',
    buyerOrgId: 'buyer-org-3',
    supplierOrgId: 'supp-org-1',
    supplierName: 'Acme Industrial Tech Inc.',
    status: 'COMPLETED',
    orderDate: '2026-09-28T09:00:00Z',
    promisedDate: '2026-10-15T16:00:00Z',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    subtotal: 32000.00,
    taxAmount: 2560.00,
    totalAmount: 34560.00,
    shippingAddress: 'OmniRetail National Logistics HQ, Chicago, IL 60601',
    billingAddress: 'OmniRetail Accounts Payable, Atlanta, GA 30303',
    buyerContactName: 'Clara Oswald (Supply Chain VP)',
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
  },
  {
    id: 'po-106',
    poNumber: 'PO-2026-9450',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-1',
    supplierName: 'Acme Industrial Tech Inc.',
    status: 'ISSUED',
    orderDate: '2026-11-04T09:00:00Z',
    promisedDate: '2026-11-25T18:00:00Z',
    paymentTerms: '2/10 Net 30',
    currency: 'USD',
    subtotal: 74000.00,
    taxAmount: 5920.00,
    totalAmount: 79920.00,
    shippingAddress: 'Apex Global Logistics Center - Receiving Bay 14, 1020 Logistics Blvd, Austin, TX 78728',
    billingAddress: 'Apex Global AP Shared Services, PO Box 8802, New York, NY 10001',
    buyerContactName: 'Sarah Chen (Lead Procurement Architect)',
    notes: 'Urgent: Expedited telemetry nodes for Bay 14 cloud expansion. Please acknowledge slot within 24h.',
    lineItems: [
      {
        id: 'poli-106-1',
        itemNumber: 1,
        partNumber: 'ACM-NODE-64GB',
        description: 'Enterprise Compute Node 64GB DDR5 / 32-Core Xeon Scalable Processor',
        quantity: 8,
        uom: 'EA',
        unitPrice: 8200.00,
        totalPrice: 65600.00,
        deliveryDate: '2026-11-20',
        invoicedQuantity: 0
      },
      {
        id: 'poli-106-2',
        itemNumber: 2,
        partNumber: 'ACM-SLA-PREM',
        description: 'Platinum 24/7 Mission-Critical Hardware Maintenance & Remote SRE SLA (1 Yr)',
        quantity: 1,
        uom: 'YR',
        unitPrice: 8400.00,
        totalPrice: 8400.00,
        deliveryDate: '2026-11-25',
        invoicedQuantity: 0
      }
    ]
  },
  {
    id: 'po-107',
    poNumber: 'PO-2026-9520',
    buyerOrgId: 'buyer-org-2',
    supplierOrgId: 'supp-org-1',
    supplierName: 'Acme Industrial Tech Inc.',
    status: 'SHIPPED',
    orderDate: '2026-10-25T11:00:00Z',
    promisedDate: '2026-11-12T16:00:00Z',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    subtotal: 42000.00,
    taxAmount: 3360.00,
    totalAmount: 45360.00,
    shippingAddress: 'NovaTech Flight Systems Facility B - Receiving Dock 3, 4800 Aerospace Parkway, Huntsville, AL 35806',
    billingAddress: 'NovaTech Electronic Invoicing AP Desk, PO Box 3310, Seattle, WA 98101',
    buyerContactName: 'David Miller (Senior Subcontract Specialist)',
    acknowledgedAt: '2026-10-26T08:30:00Z',
    acknowledgedBy: 'Elena Rostova (Acme Industrial)',
    asnNumber: 'ASN-US-99144',
    shippedAt: '2026-10-29T14:15:00Z',
    notes: 'Mil-Spec radiation hardened transceivers. Secure chain of custody manifest required.',
    lineItems: [
      {
        id: 'poli-107-1',
        itemNumber: 1,
        partNumber: 'ACM-RAD-900',
        description: 'Radiation-Hardened Edge Telemetry Array (-40C to +125C Operating Envelope)',
        quantity: 6,
        uom: 'EA',
        unitPrice: 4500.00,
        totalPrice: 27000.00,
        deliveryDate: '2026-11-10',
        invoicedQuantity: 0
      },
      {
        id: 'poli-107-2',
        itemNumber: 2,
        partNumber: 'ACM-NVME-SAN',
        description: 'Ruggedized NVMe Solid State Storage Bank (Mil-Std 810H Shock & Vibe)',
        quantity: 1,
        uom: 'EA',
        unitPrice: 15000.00,
        totalPrice: 15000.00,
        deliveryDate: '2026-11-12',
        invoicedQuantity: 0
      }
    ]
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-9042',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-2',
    supplierName: 'Vanguard Freight Logistics LLC',
    status: 'IN_FULFILLMENT',
    orderDate: '2026-10-20T11:00:00Z',
    promisedDate: '2026-10-28T16:00:00Z',
    paymentTerms: 'Net 30',
    currency: 'USD',
    subtotal: 14200.00,
    taxAmount: 0.00,
    totalAmount: 14200.00,
    shippingAddress: 'Apex Distribution Hub, 800 Logistics Way, Joliet, IL 60431',
    billingAddress: 'Apex Global Accounts Payable, PO Box 8802, New York, NY 10001',
    buyerContactName: 'Marcus Vance',
    asnNumber: 'ASN-US-99120',
    shippedAt: '2026-10-22T08:30:00Z',
    notes: 'Expedited Temperature Controlled LTL Transport Run from Chicago Hub to Detroit DC',
    lineItems: [
      {
        id: 'poli-102-1',
        itemNumber: 1,
        partNumber: 'VAN-REEF-02',
        description: 'Refrigerated Dedicated Freight Route (Chicago -> Detroit)',
        quantity: 4,
        uom: 'RUN',
        unitPrice: 3550.00,
        totalPrice: 14200.00,
        deliveryDate: '2026-10-28',
        invoicedQuantity: 4
      }
    ]
  },
  {
    id: 'po-103',
    poNumber: 'PO-2026-7810',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-5',
    supplierName: 'CloudScale Networks Inc.',
    status: 'COMPLETED',
    orderDate: '2026-09-15T08:00:00Z',
    promisedDate: '2026-10-01T12:00:00Z',
    paymentTerms: '2/10 Net 30',
    currency: 'USD',
    subtotal: 92000.00,
    taxAmount: 0.00,
    totalAmount: 92000.00,
    shippingAddress: 'Edge Compute US-East Data Centers',
    billingAddress: 'Apex Global Accounts Payable, PO Box 8802, New York, NY 10001',
    buyerContactName: 'Elena Rostova (VP S2P Procurement)',
    invoiceIds: ['inv-201'],
    notes: 'Q4 Tier-1 Cloud CDN & Low-Latency Direct Peering Bandwidth Allocation',
    lineItems: [
      {
        id: 'poli-103-1',
        itemNumber: 1,
        partNumber: 'CS-CDN-TB',
        description: 'Global Edge CDN Transit (1,000 TB Bandwidth Commit)',
        quantity: 1,
        uom: 'PKG',
        unitPrice: 92000.00,
        totalPrice: 92000.00,
        deliveryDate: '2026-10-01',
        invoicedQuantity: 1
      }
    ]
  }
];

export const initialInvoices: Invoice[] = [
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
        id: 'inli-201-1',
        poLineItemId: 'poli-101-m1',
        itemNumber: 1,
        description: 'Enterprise Cloud Server Deployment (Bay 14 Rack Infrastructure) - Milestone 1 Deliverable • Infrastructure Provisioned & Verified',
        quantity: 1,
        unitPrice: 28500.00,
        total: 28500.00
      },
      {
        id: 'inli-201-2',
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
    id: 'inv-201',
    invoiceNumber: 'INV-2026-004',
    poId: 'po-103',
    poNumber: 'PO-2026-7810',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-5',
    supplierName: 'CloudScale Networks Inc.',
    invoiceDate: '2026-10-02T10:00:00Z',
    dueDate: '2026-11-01T17:00:00Z',
    currency: 'USD',
    subtotal: 92000.00,
    taxRate: 0.0,
    taxAmount: 0.0,
    totalAmount: 92000.00,
    paymentStatus: 'APPROVED_FOR_PAYMENT',
    matchStatus: '3_WAY_MATCHED',
    matchNotes: 'Touchless 3-Way Match Verified: PO-2026-7810 vs Electronic Receipt GR-88201 vs E-Invoice.',
    lineItems: [
      {
        id: 'inli-201-1-cs',
        poLineItemId: 'poli-103-1',
        itemNumber: 1,
        description: 'Global Edge CDN Transit (1,000 TB Bandwidth Commit)',
        quantity: 1,
        unitPrice: 92000.00,
        total: 92000.00
      }
    ],
    earlyPaymentOffer: {
      eligible: true,
      standardDueDate: '2026-11-01',
      standardAmount: 92000.00,
      acceleratedDays: 20,
      discountPercent: 1.5,
      discountAmount: 1380.00,
      acceleratedPayoutAmount: 90620.00,
      acceleratedDueDate: '2026-10-27',
      status: 'AVAILABLE'
    },
    createdAt: '2026-10-02T10:05:00Z',
    updatedAt: '2026-10-15T14:20:00Z'
  },
  {
    id: 'inv-202',
    invoiceNumber: 'INV-2026-009',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-1',
    supplierName: 'Acme Industrial Tech Inc.',
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
  },
  {
    id: 'inv-204',
    invoiceNumber: 'INV-2026-022',
    poId: 'po-101',
    poNumber: 'PO-2026-8891',
    buyerOrgId: 'buyer-org-2',
    companyName: 'Starlight Aerospace & Defense',
    supplierOrgId: 'supp-org-1',
    supplierName: 'Acme Industrial Tech Inc.',
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
    supplierName: 'Acme Industrial Tech Inc.',
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
    id: 'inv-203',
    invoiceNumber: 'INV-2026-015',
    poId: 'po-102',
    poNumber: 'PO-2026-9042',
    buyerOrgId: 'buyer-org-1',
    supplierOrgId: 'supp-org-2',
    supplierName: 'Vanguard Freight Logistics LLC',
    invoiceDate: '2026-10-23T09:00:00Z',
    dueDate: '2026-11-22T17:00:00Z',
    currency: 'USD',
    subtotal: 14200.00,
    taxRate: 0.0,
    taxAmount: 0.0,
    totalAmount: 14200.00,
    paymentStatus: 'UNDER_REVIEW',
    matchStatus: 'DISCREPANCY_FLAGGED',
    matchNotes: 'Discrepancy: Delivery receipt confirms 3 runs completed; invoice claims 4 runs. Clarification open.',
    lineItems: [
      {
        id: 'inli-203-1',
        poLineItemId: 'poli-102-1',
        itemNumber: 1,
        description: 'Refrigerated Dedicated Freight Route (Chicago -> Detroit)',
        quantity: 4,
        unitPrice: 3550.00,
        total: 14200.00
      }
    ],
    createdAt: '2026-10-23T09:15:00Z',
    updatedAt: '2026-10-23T15:00:00Z'
  }
];

export const initialCatalogItems: CatalogItem[] = [
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
    id: 'cat-4',
    supplierOrgId: 'supp-org-2',
    sku: 'VAN-REEF-02',
    name: 'Refrigerated Dedicated Freight Route (Chicago -> Detroit)',
    description: 'Cold-chain transport adhering to FDA FSMA standards with live IoT temperature telemetry.',
    category: 'LOGISTICS_FREIGHT',
    unitPrice: 3550.00,
    currency: 'USD',
    uom: 'RUN',
    leadTimeDays: 2,
    minOrderQty: 1,
    status: 'PUBLISHED',
    lastUpdated: '2026-10-18T10:00:00Z'
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

export const initialTransactionComments: TransactionComment[] = [
  {
    id: 'comm-1',
    entityType: 'PO',
    entityId: 'po-101',
    authorId: 'user-buyer-1',
    authorName: 'Sarah Chen',
    authorRole: 'BUYER',
    text: 'Please confirm hardware ship date for delivery to our Austin DC by November 10.',
    createdAt: '2026-10-18T15:30:00Z'
  },
  {
    id: 'comm-2',
    entityType: 'PO',
    entityId: 'po-101',
    authorId: 'user-supp-1',
    authorName: 'Jason Miller',
    authorRole: 'SUPPLIER',
    text: 'Confirmed! Tracking numbers will be dispatched as soon as the staging burn-in passes QA.',
    createdAt: '2026-10-19T09:20:00Z'
  },
  {
    id: 'comm-3',
    entityType: 'INVOICE',
    entityId: 'inv-203',
    authorId: 'user-buyer-2',
    authorName: 'Marcus Vance',
    authorRole: 'BUYER',
    text: 'Our loading dock receiver logged 3 delivered runs under BOL-48201. Please clarify line item 1 billing 4 runs.',
    createdAt: '2026-10-23T15:10:00Z'
  }
];

