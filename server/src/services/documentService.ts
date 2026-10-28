import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memoryDb.js';
import { OnboardingDocument, DocumentType, ExtractedFieldItem, ApplicationFieldValue } from '../models/types.js';
import { AuditService } from './auditService.js';

export class DocumentService {
  public static processUploadedDocument(params: {
    applicationId: string;
    supplierOrgId: string;
    buyerOrgId: string;
    filename: string;
    fileBuffer?: Buffer;
    fileSize: number;
    fileType: string;
    uploadedBy: string;
    uploadedRole: 'BUYER' | 'SUPPLIER';
    forcedDocType?: DocumentType;
  }): { document: OnboardingDocument; extractions: ExtractedFieldItem[] } {
    const docId = `doc-${uuidv4().slice(0, 8)}`;
    const checksum = params.fileBuffer 
      ? `sha256:${crypto.createHash('sha256').update(params.fileBuffer).digest('hex')}`
      : `sha256:${crypto.createHash('sha256').update(params.filename + Date.now()).digest('hex')}`;

    // Auto classify document type from filename / content
    const docType = params.forcedDocType || this.classifyDocumentType(params.filename);
    const extractions = this.extractFieldsFromDocType(docType, params.filename);

    const doc: OnboardingDocument = {
      id: docId,
      applicationId: params.applicationId,
      supplierOrgId: params.supplierOrgId,
      buyerOrgId: params.buyerOrgId,
      title: this.getReadableTitle(docType, params.filename),
      filename: params.filename,
      fileType: params.fileType || 'application/pdf',
      fileSize: params.fileSize,
      checksum,
      storagePath: `/uploads/${params.applicationId}/${params.filename}`,
      docType,
      isExpired: false,
      verificationStatus: 'PENDING',
      uploadedBy: params.uploadedBy,
      uploadedRole: params.uploadedRole,
      uploadedAt: new Date().toISOString(),
      extractions
    };

    db.addDocument(doc);

    // Save extractions as candidate ApplicationFieldValues with DOCUMENT_EXTRACTED provenance
    extractions.forEach((ext, idx) => {
      const fvId = `fv-ext-${docId.slice(4)}-${idx + 1}`;
      const fv: ApplicationFieldValue = {
        id: fvId,
        applicationId: params.applicationId,
        fieldKey: ext.fieldKey,
        value: ext.value,
        provenance: 'DOCUMENT_EXTRACTED',
        sourceReference: doc.id,
        sourcePage: ext.boundingBox?.page || 1,
        confidence: ext.confidence,
        verificationStatus: ext.confidence > 0.95 ? 'AI_CONFIRMED' : 'UNVERIFIED',
        isSensitive: ['tax_identifier', 'bank_account_number', 'bank_routing_number'].includes(ext.fieldKey),
        lastModifiedBy: 'Document Intelligence Agent',
        updatedAt: new Date().toISOString()
      };

      // Check if value contradicts an existing value
      const existing = db.getFieldValuesByApplication(params.applicationId).find(f => f.fieldKey === ext.fieldKey);
      if (existing && existing.value !== ext.value) {
        fv.conflictValues = [
          {
            value: existing.value,
            source: `${existing.provenance} (${existing.sourceReference})`,
            confidence: existing.confidence,
            detectedAt: new Date().toISOString()
          }
        ];
      }

      db.upsertFieldValue(fv);
    });

    AuditService.log(
      { id: 'ai-agent-doc', name: 'Document Intelligence Agent', role: 'SYSTEM_AI', buyerOrgId: params.buyerOrgId },
      'DOCUMENT_EXTRACTED',
      'DOCUMENT',
      docId,
      {
        filename: params.filename,
        docType,
        extractedCount: extractions.length,
        applicationId: params.applicationId
      }
    );

    return { document: doc, extractions };
  }

  private static classifyDocumentType(filename: string): DocumentType {
    const lower = filename.toLowerCase();
    if (lower.includes('w9') || lower.includes('w-9')) return 'IRS_W9';
    if (lower.includes('w8') || lower.includes('w-8')) return 'W8_BENE';
    if (lower.includes('merger') || lower.includes('incorporation') || lower.includes('articles')) return 'CERT_INCORPORATION';
    if (lower.includes('bank') || lower.includes('svb') || lower.includes('voided') || lower.includes('deposit')) return 'BANK_VERIFICATION_LETTER';
    if (lower.includes('acord') || lower.includes('insurance') || lower.includes('liability')) return 'CERT_INSURANCE_ACORD';
    if (lower.includes('iso') || lower.includes('27001') || lower.includes('soc2')) return 'ISO_27001';
    if (lower.includes('license') || lower.includes('permit')) return 'BUSINESS_LICENSE';
    return 'OTHER';
  }

  private static getReadableTitle(type: DocumentType, filename: string): string {
    switch (type) {
      case 'IRS_W9': return 'IRS Form W-9 (Tax Certification)';
      case 'W8_BENE': return 'IRS Form W-8BEN-E (Non-US Entity)';
      case 'CERT_INCORPORATION': return 'Certificate of Incorporation / Merger';
      case 'BANK_VERIFICATION_LETTER': return 'Bank Account Verification Letter';
      case 'CERT_INSURANCE_ACORD': return 'ACORD 25 Certificate of Liability Insurance';
      case 'ISO_27001': return 'ISO 27001 Information Security Certificate';
      case 'BUSINESS_LICENSE': return 'Official Municipal Business License';
      default: return filename;
    }
  }

  private static extractFieldsFromDocType(type: DocumentType, filename: string): ExtractedFieldItem[] {
    switch (type) {
      case 'IRS_W9':
        return [
          {
            fieldKey: 'legal_entity_name',
            label: 'Legal Entity Name',
            value: filename.includes('NovaStream') ? 'NovaStream Technologies Inc.' : 'Nexura Global Analytics Inc.',
            confidence: 0.98,
            boundingBox: { page: 1, x: 120, y: 155, w: 320, h: 28 },
            rawSnippet: '1 Name (as shown on your income tax return): ' + (filename.includes('NovaStream') ? 'NovaStream Technologies Inc.' : 'Nexura Global Analytics Inc.')
          },
          {
            fieldKey: 'tax_identifier',
            label: 'Employer Identification Number (EIN)',
            value: filename.includes('NovaStream') ? '47-9201948' : '84-1294821',
            confidence: 0.99,
            boundingBox: { page: 1, x: 380, y: 520, w: 180, h: 32 },
            rawSnippet: 'Part I Employer Identification Number: ' + (filename.includes('NovaStream') ? '47-9201948' : '84-1294821')
          },
          {
            fieldKey: 'registered_address',
            label: 'Registered Tax Address',
            value: filename.includes('NovaStream') ? '101 California St, Suite 2200, San Francisco, CA 94111' : '500 Howard Street, Suite 400, San Francisco, CA 94105',
            confidence: 0.96,
            boundingBox: { page: 1, x: 120, y: 240, w: 380, h: 42 },
            rawSnippet: 'Address: ' + (filename.includes('NovaStream') ? '101 California St, Suite 2200, San Francisco, CA 94111' : '500 Howard Street, Suite 400, San Francisco, CA 94105')
          }
        ];
      case 'BANK_VERIFICATION_LETTER':
        return [
          {
            fieldKey: 'bank_beneficiary_name',
            label: 'Account Name',
            value: 'Nexura Global Analytics Inc.',
            confidence: 0.97,
            boundingBox: { page: 1, x: 160, y: 310, w: 280, h: 26 },
            rawSnippet: 'Beneficiary Name: Nexura Global Analytics Inc.'
          },
          {
            fieldKey: 'bank_account_number',
            label: 'Account Number',
            value: '489201948210',
            confidence: 0.98,
            boundingBox: { page: 1, x: 160, y: 340, w: 190, h: 24 },
            rawSnippet: 'Account Number: 489201948210'
          },
          {
            fieldKey: 'bank_routing_number',
            label: 'Routing (ABA)',
            value: '121000358',
            confidence: 0.99,
            boundingBox: { page: 1, x: 160, y: 370, w: 150, h: 24 },
            rawSnippet: 'ABA Routing: 121000358'
          }
        ];
      case 'CERT_INSURANCE_ACORD':
        return [
          {
            fieldKey: 'commercial_general_liability',
            label: 'General Liability Limit',
            value: '$2,000,000 Each Occurrence / $4,000,000 Aggregate',
            confidence: 0.95,
            boundingBox: { page: 1, x: 220, y: 440, w: 260, h: 30 },
            rawSnippet: 'COMMERCIAL GENERAL LIABILITY: EACH OCCURRENCE $2,000,000'
          },
          {
            fieldKey: 'insurance_carrier',
            label: 'Insurance Carrier',
            value: 'Travelers Property Casualty Co of America (AM Best A++)',
            confidence: 0.96,
            boundingBox: { page: 1, x: 120, y: 180, w: 310, h: 28 },
            rawSnippet: 'INSURER A: Travelers Property Casualty Co of America'
          }
        ];
      default:
        return [];
    }
  }
}
