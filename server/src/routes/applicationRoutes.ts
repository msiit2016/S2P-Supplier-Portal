import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memoryDb.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { 
  SupplierApplication, 
  ApplicationFieldValue, 
  OnboardingChannel, 
  SupplierOrganization, 
  FieldProvenance 
} from '../models/types.js';
import { WorkflowService } from '../services/workflowService.js';
import { AISupervisorService } from '../services/aiSupervisorService.js';
import { DuplicateDetectionService } from '../services/duplicateDetectionService.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

// Helper to mask sensitive strings like TIN or Bank Account
const maskSensitive = (val: any): string => {
  if (!val) return '';
  const str = String(val);
  if (str.length <= 4) return '••••';
  return '••••••••' + str.slice(-4);
};

// GET all applications with filters
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { status, category, search, channel, supplierOrgId } = req.query;
  const user = req.user;

  let apps = db.getAllApplications(user?.userType === 'BUYER' ? user.organizationId : undefined);

  if (user?.userType === 'SUPPLIER') {
    apps = apps.filter(a => a.supplierOrgId === user.organizationId);
  }

  if (supplierOrgId) {
    apps = apps.filter(a => a.supplierOrgId === supplierOrgId);
  }

  if (status && status !== 'ALL') {
    apps = apps.filter(a => a.status === status);
  }

  if (category && category !== 'ALL') {
    apps = apps.filter(a => a.supplyCategory === category);
  }

  if (channel && channel !== 'ALL') {
    apps = apps.filter(a => a.channel === channel);
  }

  if (search) {
    const q = String(search).toLowerCase();
    apps = apps.filter(a => 
      a.supplierName.toLowerCase().includes(q) || 
      a.caseReference.toLowerCase().includes(q) ||
      a.supplierEmail.toLowerCase().includes(q)
    );
  }

  res.json({
    applications: apps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  });
});

// GET application by ID
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const app = db.getApplication(req.params.id);
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  // Tenant security guard
  const user = req.user;
  if (user?.userType === 'SUPPLIER' && app.supplierOrgId !== user.organizationId) {
    res.status(403).json({ error: 'Access denied to this supplier application' });
    return;
  }

  const fields = db.getFieldValuesByApplication(app.id);
  const documents = db.getDocumentsByApplication(app.id);
  const messages = db.getMessagesByApplication(app.id, user?.userType === 'BUYER');
  const tasks = db.getTasksByApplication(app.id);
  const completeness = AISupervisorService.evaluateCompleteness(app.id);
  const auditEvents = AuditService.getEventsForEntity(app.id);

  // Mask sensitive fields unless explicitly authorized
  const isAuthorizedViewer = user?.role === 'BUYER_ADMIN' || user?.role === 'BUYER_APPROVER' || user?.role === 'BUYER_REVIEWER';
  const processedFields = fields.map(f => {
    if (f.isSensitive) {
      return {
        ...f,
        maskedValue: maskSensitive(f.value),
        value: isAuthorizedViewer ? f.value : maskSensitive(f.value)
      };
    }
    return f;
  });

  res.json({
    application: app,
    fields: processedFields,
    documents,
    messages,
    tasks,
    completeness,
    auditEvents
  });
});

// POST Create new Supplier Application (Supports 3 Modes)
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const {
    supplierName,
    businessEmail,
    supplyCategory,
    onboardingReason,
    channel,
    initialTaxId,
    phone,
    website,
    address,
    inviteSupplier
  } = req.body;

  if (!supplierName || !businessEmail) {
    res.status(400).json({ error: 'Supplier Name and Business Email are required' });
    return;
  }

  // Duplicate pre-check
  const dupCheck = DuplicateDetectionService.checkDuplicate({
    legalName: supplierName,
    taxId: initialTaxId,
    businessEmail
  });

  // Create or resolve supplier organization
  let supplierOrg: SupplierOrganization;
  if (dupCheck.hasConflict && dupCheck.matchType === 'CORPORATE_SUCCESSION' && dupCheck.matchedSupplier) {
    supplierOrg = dupCheck.matchedSupplier;
  } else {
    supplierOrg = {
      id: `supp-org-${uuidv4().slice(0, 6)}`,
      legalName: supplierName,
      businessEmail,
      country: address?.country || 'United States',
      taxId: initialTaxId,
      phone,
      website,
      address,
      status: 'ONBOARDING',
      createdAt: new Date().toISOString()
    };
    db.createSupplierOrg(supplierOrg);
  }

  const caseRef = `APP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const appId = `app-${uuidv4().slice(0, 6)}`;
  const assignedChannel: OnboardingChannel = channel || (user?.userType === 'SUPPLIER' ? 'SUPPLIER_SELF_SERVICE' : 'BUYER_ASSISTED');

  const newApp: SupplierApplication = {
    id: appId,
    caseReference: caseRef,
    buyerOrgId: user?.organizationId || 'buyer-org-1',
    supplierOrgId: supplierOrg.id,
    supplierName,
    supplierEmail: businessEmail,
    channel: assignedChannel,
    status: assignedChannel === 'SUPPLIER_SELF_SERVICE' ? 'REGISTRATION_IN_PROGRESS' : 'DRAFT',
    accountVerificationState: user?.userType === 'SUPPLIER' ? 'CLAIMED' : 'UNVERIFIED',
    assignedReviewerId: user?.userType === 'BUYER' ? user.id : undefined,
    assignedReviewerName: user?.userType === 'BUYER' ? user.name : undefined,
    supplyCategory: supplyCategory || 'IT_HARDWARE_SERVICES',
    onboardingReason: onboardingReason || 'New vendor onboarding initiated',
    riskScore: 25,
    riskLevel: 'LOW',
    currentStep: 1,
    totalSteps: 7,
    missingFieldsCount: 4,
    conflictingFieldsCount: dupCheck.hasConflict ? 1 : 0,
    unverifiedDocsCount: 1,
    hasBuyerEdits: user?.userType === 'BUYER',
    supplierClaimToken: `claim-${uuidv4().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createApplication(newApp);

  // Initialize basic fields
  const provenance: FieldProvenance = user?.userType === 'BUYER' ? 'BUYER_ENTERED' : 'SUPPLIER_ENTERED';
  const initialFields: { key: string; val: any; isSens?: boolean }[] = [
    { key: 'legal_entity_name', val: supplierName },
    { key: 'business_email', val: businessEmail }
  ];
  if (initialTaxId) initialFields.push({ key: 'tax_identifier', val: initialTaxId, isSens: true });
  if (phone) initialFields.push({ key: 'business_phone', val: phone });
  if (website) initialFields.push({ key: 'company_website', val: website });

  initialFields.forEach((f, idx) => {
    db.upsertFieldValue({
      id: `fv-${appId}-${idx + 1}`,
      applicationId: appId,
      fieldKey: f.key,
      value: f.val,
      provenance,
      sourceReference: `${provenance}_INIT`,
      confidence: 1.0,
      verificationStatus: 'UNVERIFIED',
      isSensitive: f.isSens,
      lastModifiedBy: user?.name || 'System',
      updatedAt: new Date().toISOString()
    });
  });

  // Calculate initial AI summary
  newApp.aiSummary = AISupervisorService.generateExecutiveSummary(appId);
  db.updateApplication(appId, { aiSummary: newApp.aiSummary });

  AuditService.log(
    { id: user?.id || 'sys', name: user?.name || 'System', role: user?.role || 'BUYER_ADMIN', buyerOrgId: newApp.buyerOrgId },
    'APPLICATION_CREATED',
    'APPLICATION',
    appId,
    {
      caseReference: caseRef,
      channel: assignedChannel,
      supplierName,
      duplicateCheck: dupCheck.matchType
    }
  );

  res.status(201).json({
    application: newApp,
    duplicateCheck: dupCheck,
    supplierOrganization: supplierOrg
  });
});

// POST State machine transition
router.post('/:id/transition', (req: AuthenticatedRequest, res: Response) => {
  const { targetState, reason } = req.body;
  const user = req.user;

  if (!targetState) {
    res.status(400).json({ error: 'targetState is required' });
    return;
  }

  const result = WorkflowService.transition(
    req.params.id,
    targetState,
    {
      id: user?.id || 'sys',
      name: user?.name || 'System User',
      role: user?.role || 'BUYER_REVIEWER',
      buyerOrgId: user?.organizationId
    },
    reason
  );

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({
    message: `Application transitioned to ${targetState}`,
    application: result.application
  });
});

// PUT / POST upsert field value with provenance
router.post('/:id/fields', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const appId = req.params.id;
  const { fieldKey, value, provenance, isSensitive, sourceReference } = req.body;

  if (!fieldKey) {
    res.status(400).json({ error: 'fieldKey is required' });
    return;
  }

  const prov: FieldProvenance = provenance || (user?.userType === 'BUYER' ? 'BUYER_ENTERED' : 'SUPPLIER_ENTERED');
  const existing = db.getFieldValuesByApplication(appId).find(f => f.fieldKey === fieldKey);

  const fv: ApplicationFieldValue = {
    id: existing ? existing.id : `fv-${uuidv4().slice(0, 8)}`,
    applicationId: appId,
    fieldKey,
    value,
    provenance: prov,
    sourceReference: sourceReference || (user?.name ? `${prov} by ${user.name}` : prov),
    confidence: 1.0,
    verificationStatus: user?.role.startsWith('BUYER') ? 'HUMAN_VERIFIED' : 'UNVERIFIED',
    isSensitive: Boolean(isSensitive),
    lastModifiedBy: user?.name || 'User',
    updatedAt: new Date().toISOString()
  };

  db.upsertFieldValue(fv);

  // Recalculate completeness
  AISupervisorService.evaluateCompleteness(appId);

  AuditService.log(
    { id: user?.id || 'sys', name: user?.name || 'User', role: user?.role || 'USER' },
    'FIELD_VALUE_UPDATED',
    'APPLICATION_FIELD',
    fv.id,
    { fieldKey, provenance: prov }
  );

  res.json({ fieldValue: fv });
});

// POST Verify or Reject field value
router.post('/:id/fields/:fieldId/verify', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { status, correctedValue } = req.body;
  const fv = db.getFieldValue(req.params.fieldId);

  if (!fv) {
    res.status(404).json({ error: 'Field value not found' });
    return;
  }

  fv.verificationStatus = status || 'HUMAN_VERIFIED';
  if (correctedValue !== undefined) {
    fv.value = correctedValue;
    fv.provenance = 'BUYER_ENTERED';
    fv.lastModifiedBy = `${user?.name || 'Reviewer'} (Corrected)`;
  }
  fv.updatedAt = new Date().toISOString();

  db.upsertFieldValue(fv);
  AISupervisorService.evaluateCompleteness(req.params.id);

  AuditService.log(
    { id: user?.id || 'sys', name: user?.name || 'Reviewer', role: user?.role || 'BUYER_REVIEWER' },
    'FIELD_VERIFICATION_UPDATED',
    'APPLICATION_FIELD',
    fv.id,
    { status: fv.verificationStatus, corrected: correctedValue !== undefined }
  );

  res.json({ fieldValue: fv });
});

// POST Unmask sensitive field (Permission protected)
router.post('/:id/fields/unmask', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const allowed = ['BUYER_ADMIN', 'BUYER_APPROVER', 'BUYER_REVIEWER', 'SUPPLIER_ADMIN'];
  if (!user || !allowed.includes(user.role)) {
    res.status(403).json({ error: 'Forbidden: You do not have permissions to reveal sensitive financial or tax records' });
    return;
  }

  const { fieldId } = req.body;
  const fv = db.getFieldValue(fieldId);
  if (!fv) {
    res.status(404).json({ error: 'Field not found' });
    return;
  }

  AuditService.log(
    { id: user.id, name: user.name, role: user.role },
    'SENSITIVE_FIELD_UNMASKED',
    'APPLICATION_FIELD',
    fv.id,
    { fieldKey: fv.fieldKey }
  );

  res.json({ unmaskedValue: fv.value });
});

export default router;
