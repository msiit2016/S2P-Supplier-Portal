import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/memoryDb.js';
import { WorkflowService } from '../services/workflowService.js';
import { DuplicateDetectionService } from '../services/duplicateDetectionService.js';
import { DocumentService } from '../services/documentService.js';
import { AISupervisorService } from '../services/aiSupervisorService.js';
import { EmailIntakeService } from '../services/emailIntakeService.js';
import { ExternalVerificationAdapters } from '../services/verificationAdapters.js';

describe('Agentic Supplier Onboarding Core Test Suite', () => {
  beforeEach(() => {
    db.seed();
  });

  it('1. Enforces strict state machine transitions and role authorization for approval', () => {
    const app = db.getApplication('app-0042')!;
    expect(app.status).toBe('UNDER_REVIEW');

    // Attempt invalid transition: directly to APPROVED by an unauthorized supplier user
    const unauthorizedActor = {
      id: 'user-supp-1',
      name: 'Jason Miller',
      role: 'SUPPLIER_ADMIN'
    };
    const invalidResult = WorkflowService.transition('app-0042', 'APPROVED', unauthorizedActor);
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toContain('not authorized to give final approval');

    // Authorized buyer approver executes approval
    const authorizedApprover = {
      id: 'user-buyer-3',
      name: 'Elena Rostova',
      role: 'BUYER_APPROVER',
      buyerOrgId: 'buyer-org-1'
    };
    const validResult = WorkflowService.transition('app-0042', 'APPROVED', authorizedApprover);
    expect(validResult.success).toBe(true);
    expect(validResult.application?.status).toBe('APPROVED');
    expect(validResult.application?.erpVendorId).toMatch(/^VEND-\d{5}$/);

    // Supplier organization is also automatically marked ACTIVE
    const suppOrg = db.getSupplierOrg(app.supplierOrgId)!;
    expect(suppOrg.status).toBe('ACTIVE');
    expect(suppOrg.erpVendorId).toBe(validResult.application?.erpVendorId);
  });

  it('2. Distinguishes between exact duplicates and corporate succession rebranding', () => {
    // A: Exact duplicate match
    const dupResult = DuplicateDetectionService.checkDuplicate({
      legalName: 'Apex Analytics LLC',
      taxId: '84-1294821'
    });
    expect(dupResult.hasConflict).toBe(true);
    expect(dupResult.matchType).toBe('EXACT_DUPLICATE');
    expect(dupResult.recommendedAction).toBe('ABORT_NEW_RECORD_USE_EXISTING');

    // B: Corporate succession (same Tax ID, different legal name)
    const successionResult = DuplicateDetectionService.checkDuplicate({
      legalName: 'Nexura Data Corporation',
      taxId: '84-1294821'
    });
    expect(successionResult.hasConflict).toBe(true);
    expect(successionResult.matchType).toBe('CORPORATE_SUCCESSION');
    expect(successionResult.explanation).toContain('indicates corporate succession');
    expect(successionResult.recommendedAction).toBe('AUTHORIZE_SUCCESSION_MERGE_LINEAGE');

    // C: Fresh supplier with no matches
    const cleanResult = DuplicateDetectionService.checkDuplicate({
      legalName: 'Quantum Robotics Ltd',
      taxId: '99-8877665'
    });
    expect(cleanResult.hasConflict).toBe(false);
    expect(cleanResult.matchType).toBe('NO_MATCH');
  });

  it('3. Extracts structured data from documents while preserving source provenance and flags conflicts', () => {
    const { document, extractions } = DocumentService.processUploadedDocument({
      applicationId: 'app-0042',
      supplierOrgId: 'supp-org-1',
      buyerOrgId: 'buyer-org-1',
      filename: 'W9_Nexura_Global_Analytics_2026.pdf',
      fileSize: 342000,
      fileType: 'application/pdf',
      uploadedBy: 'Email Intake',
      uploadedRole: 'SUPPLIER'
    });

    expect(document.docType).toBe('IRS_W9');
    expect(extractions.length).toBeGreaterThan(0);
    expect(document.verificationStatus).toBe('PENDING'); // Verification is NOT confused with extraction!

    // Verify fields stored with DOCUMENT_EXTRACTED provenance
    const fields = db.getFieldValuesByApplication('app-0042');
    const taxField = fields.find(f => f.fieldKey === 'tax_identifier');
    expect(taxField).toBeDefined();
    expect(taxField?.provenance).toBe('DOCUMENT_EXTRACTED');
    expect(taxField?.confidence).toBeGreaterThan(0.9);
  });

  it('4. Dual-brain completeness and deterministic risk penalty calculation', () => {
    // Vanguard Freight app-0089 has planted discrepancies (TIN mismatch & missing cargo insurance)
    const report = AISupervisorService.evaluateCompleteness('app-0089');
    expect(report.isComplete).toBe(false);
    expect(report.riskScore).toBeGreaterThan(50); // High risk penalty
    expect(report.conflictingFields.some(c => c.fieldKey === 'tax_identifier')).toBe(true);
    expect(report.missingDocs.some(d => d.includes('ACORD 25'))).toBe(true);

    // AI clarification email drafter references the exact discrepant fields
    const draft = AISupervisorService.draftClarificationEmail('app-0089');
    expect(draft.subject).toContain('Action Required');
    expect(draft.body).toContain('tax_identifier');
    expect(draft.body).toContain('ACORD 25');
  });

  it('5. Secure email intake correlates with case reference and ingests attachments', () => {
    const intake = EmailIntakeService.ingestEmail({
      buyerOrgId: 'buyer-org-1',
      senderEmail: 'cfo@vanguardfreight.com',
      senderName: 'David Reynolds',
      subject: '[APP-2026-0089] Updated Insurance ACORD Certificate',
      bodyText: 'Here is our revised ACORD 25 cargo certificate with $5M coverage.',
      attachments: [
        {
          filename: 'ACORD_25_Vanguard_Freight_5M.pdf',
          fileType: 'application/pdf',
          size: 450000,
          docType: 'CERT_INSURANCE_ACORD'
        }
      ]
    });

    expect(intake.status).toBe('PROCESSED');
    expect(intake.associatedCaseReference).toBe('APP-2026-0089');
    expect(intake.associatedApplicationId).toBe('app-0089');
    expect(intake.attachments[0].processed).toBe(true);

    // Verify document now exists in app-0089
    const docs = db.getDocumentsByApplication('app-0089');
    const acordDoc = docs.find(d => d.filename.includes('ACORD_25'));
    expect(acordDoc).toBeDefined();
  });

  it('6. External verification adapters return clearly labeled mock responses', () => {
    const taxRes = ExternalVerificationAdapters.verifyTaxId('84-1294821', 'Nexura Global');
    expect(taxRes.isMock).toBe(true); // Must be explicitly labeled
    expect(taxRes.status).toBe('VERIFIED');

    const sanctionsRes = ExternalVerificationAdapters.screenSanctions('Nexura Global');
    expect(sanctionsRes.isMock).toBe(true);
    expect(sanctionsRes.status).toBe('VERIFIED');

    const badBankRes = ExternalVerificationAdapters.verifyBankAccount('123', '9982', 'Nexura');
    expect(badBankRes.status).toBe('FAILED');
  });

  it('7. Touchless 1-Click PO-to-Invoice Flip generates verified 3-way match invoice', async () => {
    const { P2PTransactionService } = await import('../services/p2pTransactionService.js');
    const po = db.getPurchaseOrder('po-101')!;
    expect(po.status).toBe('ACKNOWLEDGED');

    const flipResult = P2PTransactionService.flipPOToInvoice({
      poId: 'po-101',
      invoiceNumber: 'INV-TEST-001',
      actor: { id: 'user-supp-1', name: 'Jason Miller', role: 'SUPPLIER_ADMIN' }
    });

    expect(flipResult.invoice.invoiceNumber).toBe('INV-TEST-001');
    expect(flipResult.invoice.totalAmount).toBe(po.totalAmount);
    expect(flipResult.invoice.matchStatus).toBe('3_WAY_MATCHED');
    expect(flipResult.invoice.paymentStatus).toBe('APPROVED_FOR_PAYMENT');
    expect(flipResult.invoice.earlyPaymentOffer?.eligible).toBe(true);
  });

  it('8. Dynamic Discounting calculates accelerated payout and schedules early settlement', async () => {
    const { P2PTransactionService } = await import('../services/p2pTransactionService.js');
    const result = P2PTransactionService.acceptEarlyPayment({
      invoiceId: 'inv-201',
      discountPercent: 1.5,
      daysEarly: 20,
      actor: { id: 'user-supp-1', name: 'Jason Miller', role: 'SUPPLIER_ADMIN' }
    });

    expect(result.discountSavings).toBe(1380.00);
    expect(result.payoutAmount).toBe(90620.00);
    expect(result.invoice.paymentStatus).toBe('SCHEDULED');
    expect(result.invoice.remittanceAdvice?.paymentReference).toMatch(/^REM-ACCEL-\d{5}$/);
  });

  it('9. Supplier order acknowledgment and Advance Shipping Notice (ASN) dispatch', async () => {
    const { P2PTransactionService } = await import('../services/p2pTransactionService.js');
    const po = db.getPurchaseOrder('po-101')!;

    const updated = P2PTransactionService.dispatchASN({
      poId: 'po-101',
      carrier: 'FedEx Priority Freight',
      trackingNumber: '794820194821',
      estimatedDelivery: '2026-11-08',
      actor: { id: 'user-supp-1', name: 'Jason Miller', role: 'SUPPLIER_ADMIN' }
    });

    expect(updated.status).toBe('SHIPPED');
    expect(updated.asnNumber).toMatch(/^ASN-FED-\d{5}$/);
    expect(updated.notes).toContain('794820194821');
  });
});
