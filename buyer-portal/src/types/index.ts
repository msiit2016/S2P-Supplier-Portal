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
  isEmailVerified: boolean;
}

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

export type OnboardingChannel = 'SUPPLIER_SELF_SERVICE' | 'EMAIL_ASSISTED' | 'BUYER_ASSISTED';

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
  maskedValue?: string;
  provenance: FieldProvenance;
  sourceReference: string;
  sourcePage?: number | null;
  confidence: number;
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
  riskScore: number;
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
  type: string;
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
  status: 'PROSPECT' | 'ONBOARDING' | 'ACTIVE' | 'BLOCKED';
  erpVendorId?: string;
  createdAt: string;
}
