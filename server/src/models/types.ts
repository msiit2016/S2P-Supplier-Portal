export type UserRole = 
  | 'BUYER_ADMIN'
  | 'BUYER_REVIEWER'
  | 'BUYER_APPROVER'
  | 'SUPPLIER_ADMIN'
  | 'SUPPLIER_USER';

export type UserType = 'BUYER' | 'SUPPLIER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  userType: UserType;
  organizationId: string;
  organizationName: string;
  passwordHash?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface BuyerOrganization {
  id: string;
  name: string;
  domain: string;
  legalTaxId: string;
  defaultCurrency: string;
  onboardingPolicies: {
    requiresSupplierConfirmation: boolean;
    allowBuyerSubmitOnBehalf: boolean;
    autoApprovalRiskThreshold: number;
    mandatoryCategories: string[];
  };
}

export interface SupplierOrganization {
  id: string;
  legalName: string;
  tradeName?: string;
  country: string;
  taxId?: string;
  businessEmail: string;
  phone?: string;
  website?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: 'PROSPECT' | 'ONBOARDING' | 'ACTIVE' | 'BLOCKED';
  erpVendorId?: string;
  createdAt: string;
}

export type OnboardingChannel = 'SUPPLIER_SELF_SERVICE' | 'EMAIL_ASSISTED' | 'BUYER_ASSISTED';

export type ApplicationState = 
  | 'DRAFT'
  | 'REGISTRATION_IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CANCELLED';

export type FieldProvenance = 
  | 'SUPPLIER_ENTERED'
  | 'BUYER_ENTERED'
  | 'DOCUMENT_EXTRACTED'
  | 'EXTERNAL_VERIFICATION'
  | 'SYSTEM_DERIVED';

export type VerificationStatus = 
  | 'UNVERIFIED'
  | 'AI_CONFIRMED'
  | 'HUMAN_VERIFIED'
  | 'REJECTED';

export interface ConflictValue {
  value: any;
  source: string;
  confidence: number;
  detectedAt: string;
}

export interface ApplicationFieldValue {
  id: string;
  applicationId: string;
  fieldKey: string;
  value: any;
  provenance: FieldProvenance;
  sourceReference: string;
  sourcePage?: number | null;
  confidence: number; // 0.0 - 1.0
  verificationStatus: VerificationStatus;
  conflictValues?: ConflictValue[];
  isSensitive?: boolean;
  lastModifiedBy?: string;
  updatedAt: string;
}

export type DocumentType = 
  | 'IRS_W9'
  | 'W8_BENE'
  | 'CERT_INCORPORATION'
  | 'BANK_VERIFICATION_LETTER'
  | 'CERT_INSURANCE_ACORD'
  | 'ISO_27001'
  | 'BUSINESS_LICENSE'
  | 'OTHER';

export interface BoundingBox {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ExtractedFieldItem {
  fieldKey: string;
  label: string;
  value: any;
  confidence: number;
  boundingBox?: BoundingBox;
  rawSnippet?: string;
}

export interface OnboardingDocument {
  id: string;
  applicationId: string;
  supplierOrgId: string;
  buyerOrgId: string;
  title: string;
  filename: string;
  fileType: string;
  fileSize: number;
  checksum: string;
  storagePath: string;
  docType: DocumentType;
  expiryDate?: string | null;
  isExpired: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'FLAGGED';
  uploadedBy: string;
  uploadedRole: UserType;
  uploadedAt: string;
  extractions?: ExtractedFieldItem[];
}

export interface SupplierApplication {
  id: string;
  caseReference: string;
  buyerOrgId: string;
  supplierOrgId: string;
  supplierName: string;
  supplierEmail: string;
  channel: OnboardingChannel;
  status: ApplicationState;
  accountVerificationState: 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'CLAIMED';
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  approverId?: string;
  approverName?: string;
  supplyCategory: string;
  onboardingReason: string;
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  aiSummary?: string;
  currentStep: number;
  totalSteps: number;
  missingFieldsCount: number;
  conflictingFieldsCount: number;
  unverifiedDocsCount: number;
  hasBuyerEdits: boolean;
  supplierClaimToken?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  activatedAt?: string;
  erpVendorId?: string;
}

export interface EmailIntakeRecord {
  id: string;
  buyerOrgId: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  bodySnippet: string;
  receivedAt: string;
  associatedCaseReference?: string | null;
  associatedApplicationId?: string | null;
  status: 'NEW' | 'MATCHED' | 'PROCESSED' | 'UNRESOLVED';
  suggestedMatchSupplierName?: string;
  confidenceMatch?: number;
  attachments: {
    id: string;
    filename: string;
    fileType: string;
    size: number;
    docType?: DocumentType;
    processed: boolean;
    documentId?: string;
  }[];
}

export interface ReviewTask {
  id: string;
  applicationId: string;
  title: string;
  description: string;
  assignedTo?: string;
  assignedRole: UserRole;
  type: 'DOCUMENT_VERIFICATION' | 'TAX_VALIDATION' | 'BANK_CONFIRMATION' | 'SANCTIONS_ADJUDICATION' | 'MISSING_INFO' | 'FINAL_APPROVAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  createdAt: string;
}

export interface SupplierMessage {
  id: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'BUYER' | 'SUPPLIER' | 'SYSTEM_AI';
  subject: string;
  message: string;
  isInternalNote: boolean;
  sentAt: string;
  deliveryStatus: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  deliveryCorrelationId?: string;
}

export interface AuditEvent {
  id: string;
  buyerOrgId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

// ==========================================
// P2P / S2P Transaction & Data Sharing Models
// ==========================================

export type POStatus = 
  | 'ISSUED'
  | 'ACKNOWLEDGED'
  | 'IN_FULFILLMENT'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface POLineItem {
  id: string;
  itemNumber: number;
  partNumber: string;
  description: string;
  quantity: number;
  uom: string; // EA, BOX, HRS, MO
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  invoicedQuantity?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  buyerOrgId: string;
  supplierOrgId: string;
  supplierName: string;
  status: POStatus;
  orderDate: string;
  promisedDate: string;
  paymentTerms: string; // e.g. "2/10 Net 30", "Net 45"
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: POLineItem[];
  shippingAddress: string;
  billingAddress: string;
  buyerContactName: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  asnNumber?: string; // Advance Shipping Notice
  shippedAt?: string;
  invoiceIds?: string[];
  notes?: string;
}

export interface AdvanceShippingNotice {
  id: string;
  asnNumber: string;
  poId: string;
  poNumber: string;
  buyerOrgId: string;
  supplierOrgId: string;
  carrier: string;
  trackingNumber: string;
  shippingDate: string;
  estimatedDeliveryDate: string;
  status: 'IN_TRANSIT' | 'DELIVERED';
  shippedItems: {
    itemNumber: number;
    partNumber: string;
    description: string;
    shippedQuantity: number;
    uom: string;
  }[];
  packageCount: number;
  notes?: string;
  createdAt: string;
}

export type InvoicePaymentStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MATCHED'
  | 'UNDER_REVIEW'
  | 'APPROVED_FOR_PAYMENT'
  | 'SCHEDULED'
  | 'PAID'
  | 'REJECTED';

export type ThreeWayMatchStatus = 
  | 'PENDING'
  | '2_WAY_MATCHED'
  | '3_WAY_MATCHED'
  | 'DISCREPANCY_FLAGGED';

export interface InvoiceLineItem {
  id: string;
  poLineItemId?: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface EarlyPaymentOffer {
  eligible: boolean;
  standardDueDate: string;
  standardAmount: number;
  acceleratedDays: number; // e.g. 20 days early
  discountPercent: number; // e.g. 1.5%
  discountAmount: number;
  acceleratedPayoutAmount: number;
  acceleratedDueDate: string;
  status: 'AVAILABLE' | 'REQUESTED' | 'CONFIRMED' | 'SETTLED';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poId?: string;
  poNumber?: string;
  buyerOrgId: string;
  supplierOrgId: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: InvoicePaymentStatus;
  matchStatus: ThreeWayMatchStatus;
  matchNotes?: string;
  lineItems: InvoiceLineItem[];
  earlyPaymentOffer?: EarlyPaymentOffer;
  remittanceAdvice?: {
    paymentReference: string;
    settlementDate: string;
    paymentMethod: 'ACH_CREDIT' | 'WIRE' | 'VCARD';
    bankTraceNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  id: string;
  supplierOrgId: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  currency: string;
  uom: string;
  leadTimeDays: number;
  minOrderQty: number;
  status: 'PUBLISHED' | 'PENDING_APPROVAL' | 'ARCHIVED';
  lastUpdated: string;
}

export interface TransactionComment {
  id: string;
  entityType: 'PO' | 'INVOICE' | 'ONBOARDING' | 'CATALOG';
  entityId: string;
  authorId: string;
  authorName: string;
  authorRole: 'BUYER' | 'SUPPLIER' | 'AI_ASSISTANT';
  text: string;
  createdAt: string;
}

// ==========================================
// Verisource Multi-Enterprise Profile Models
// ==========================================

export interface GlobalSupplierProfile {
  id: string;
  supplierOrgId: string;
  legalName: string;
  tradeName: string;
  dunsNumber: string;
  taxIdMasked: string;
  incorporationDate: string;
  country: string;
  hqAddress: string;
  website: string;
  businessEmail: string;
  phone: string;
  industryCategory: string;
  employeeCountRange: string;
  description: string;
  publicPassportSlug: string;
  passportUrl: string;
  isPubliclyListed: boolean;
  profileCompletionScore: number;
  verificationBadges: {
    tinVerified: boolean;
    bankVerified: boolean;
    sanctionsClear: boolean;
    securityAssured: boolean;
    diversityCertified?: string;
  };
  masterVault: {
    w9Status: 'VERIFIED' | 'PENDING' | 'EXPIRED';
    insuranceStatus: 'VERIFIED' | 'EXPIRING_SOON' | 'EXPIRED';
    insuranceExpiryDate: string;
    insuranceCoverageAmount: string;
    iso27001Status: 'VERIFIED' | 'NOT_APPLICABLE';
    soc2Status: 'VERIFIED' | 'IN_PROGRESS';
    bankLetterStatus: 'VERIFIED' | 'PENDING';
  };
  defaultPaymentTerms: string;
  updatedAt: string;
}

export interface BuyerSpecificProfile {
  id: string;
  supplierOrgId: string;
  buyerOrgId: string;
  buyerName: string;
  buyerLogoText: string;
  relationshipStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'CHANGES_REQUESTED' | 'INVITED';
  erpVendorId?: string;
  connectedSince: string;
  annualSpendVolume?: number;
  customRemittanceAccount: {
    bankName: string;
    accountEnding: string;
    routingNumberMasked: string;
    currency: string;
    accountNickName: string;
  };
  negotiatedTerms: {
    paymentTerms: string;
    earlyPaymentEligible: boolean;
    customDiscountRate?: number;
    preferredPaymentMethod: 'ACH_CREDIT' | 'WIRE' | 'VCARD';
  };
  customQuestionnaires: {
    questionId: string;
    questionText: string;
    answer: string;
    category: string;
  }[];
  customDocumentOverrides: {
    docType: string;
    documentName: string;
    status: 'COMPLIANT' | 'OVERRIDE_REQUIRED' | 'EXEMPT';
    note?: string;
  }[];
  customCatalogTier: string;
  lastSyncedAt: string;
  syncCompletenessScore: number;
}


