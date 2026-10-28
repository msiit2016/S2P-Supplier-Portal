import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memoryDb.js';
import { EmailIntakeRecord, DocumentType } from '../models/types.js';
import { DocumentService } from './documentService.js';
import { AuditService } from './auditService.js';

export class EmailIntakeService {
  public static ingestEmail(params: {
    buyerOrgId: string;
    senderEmail: string;
    senderName: string;
    subject: string;
    bodyText: string;
    attachments?: { filename: string; fileType: string; size: number; docType?: DocumentType }[];
  }): EmailIntakeRecord {
    const intakeId = `email-in-${uuidv4().slice(0, 6)}`;
    
    // 1. Try to extract case reference from subject or body (e.g. APP-2026-0042)
    const caseRefMatch = params.subject.match(/APP-\d{4}-\d{4}/i) || params.bodyText.match(/APP-\d{4}-\d{4}/i);
    let matchedApp = caseRefMatch ? db.getApplicationByCaseRef(caseRefMatch[0].toUpperCase()) : undefined;

    // 2. If no case ref, try matching supplier by sender email domain
    let suggestedSupplierName: string | undefined;
    let confidenceMatch = 0.0;

    if (!matchedApp) {
      const emailDomain = params.senderEmail.split('@')[1];
      if (emailDomain) {
        const suppliers = db.getAllSupplierOrgs();
        const found = suppliers.find(s => s.businessEmail.includes(emailDomain) || (s.website && s.website.includes(emailDomain)));
        if (found) {
          suggestedSupplierName = found.legalName;
          confidenceMatch = 0.82;
          const apps = db.getApplicationsBySupplierOrg(found.id);
          if (apps.length > 0) {
            matchedApp = apps[0];
          }
        }
      }
    } else {
      suggestedSupplierName = matchedApp.supplierName;
      confidenceMatch = 0.99;
    }

    const intakeRecord: EmailIntakeRecord = {
      id: intakeId,
      buyerOrgId: params.buyerOrgId,
      senderEmail: params.senderEmail,
      senderName: params.senderName,
      subject: params.subject,
      bodySnippet: params.bodyText.slice(0, 300),
      receivedAt: new Date().toISOString(),
      associatedCaseReference: matchedApp ? matchedApp.caseReference : null,
      associatedApplicationId: matchedApp ? matchedApp.id : null,
      status: matchedApp ? 'MATCHED' : 'NEW',
      suggestedMatchSupplierName: suggestedSupplierName,
      confidenceMatch,
      attachments: (params.attachments || []).map(a => ({
        id: `att-${uuidv4().slice(0, 6)}`,
        filename: a.filename,
        fileType: a.fileType,
        size: a.size,
        docType: a.docType,
        processed: false
      }))
    };

    // If matched immediately, process attachments into application documents
    if (matchedApp && intakeRecord.attachments.length > 0) {
      intakeRecord.attachments.forEach(att => {
        const { document } = DocumentService.processUploadedDocument({
          applicationId: matchedApp!.id,
          supplierOrgId: matchedApp!.supplierOrgId,
          buyerOrgId: params.buyerOrgId,
          filename: att.filename,
          fileSize: att.size,
          fileType: att.fileType,
          uploadedBy: `Email Intake (${params.senderEmail})`,
          uploadedRole: 'SUPPLIER',
          forcedDocType: att.docType
        });
        att.processed = true;
        att.documentId = document.id;
      });
      intakeRecord.status = 'PROCESSED';
    }

    db.createEmailIntake(intakeRecord);

    AuditService.log(
      { id: 'email-intake-connector', name: 'Email Intake Connector', role: 'SYSTEM_AI', buyerOrgId: params.buyerOrgId },
      'EMAIL_INGESTED',
      'EMAIL_INTAKE',
      intakeId,
      {
        sender: params.senderEmail,
        subject: params.subject,
        matchedCase: intakeRecord.associatedCaseReference,
        status: intakeRecord.status
      }
    );

    return intakeRecord;
  }

  public static manuallyAssociate(intakeId: string, applicationId: string, actor: { id: string; name: string; role: string }): EmailIntakeRecord | undefined {
    const intake = db.getEmailIntake(intakeId);
    const app = db.getApplication(applicationId);
    if (!intake || !app) return undefined;

    // Process attachments into this application
    intake.attachments.forEach(att => {
      if (!att.processed) {
        const { document } = DocumentService.processUploadedDocument({
          applicationId: app.id,
          supplierOrgId: app.supplierOrgId,
          buyerOrgId: app.buyerOrgId,
          filename: att.filename,
          fileSize: att.size,
          fileType: att.fileType,
          uploadedBy: `Buyer Associated Email (${intake.senderEmail})`,
          uploadedRole: 'BUYER',
          forcedDocType: att.docType
        });
        att.processed = true;
        att.documentId = document.id;
      }
    });

    const updated = db.updateEmailIntake(intakeId, {
      associatedApplicationId: app.id,
      associatedCaseReference: app.caseReference,
      status: 'PROCESSED',
      suggestedMatchSupplierName: app.supplierName,
      confidenceMatch: 1.0
    });

    AuditService.log(actor, 'EMAIL_MANUALLY_ASSOCIATED', 'EMAIL_INTAKE', intakeId, {
      applicationId: app.id,
      caseReference: app.caseReference
    });

    return updated;
  }
}
