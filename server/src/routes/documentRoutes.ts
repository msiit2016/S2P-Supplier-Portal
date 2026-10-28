import { Router, Response } from 'express';
import multer from 'multer';
import { db } from '../db/memoryDb.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { DocumentService } from '../services/documentService.js';
import { DocumentType } from '../models/types.js';
import { AuditService } from '../services/auditService.js';

const router = Router();
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

// GET documents for application
router.get('/:applicationId', (req: AuthenticatedRequest, res: Response) => {
  const docs = db.getDocumentsByApplication(req.params.applicationId);
  res.json({ documents: docs });
});

// POST upload new document
router.post('/:applicationId/upload', upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  const appId = req.params.applicationId;
  const app = db.getApplication(appId);
  const user = req.user;

  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const filename = req.file?.originalname || req.body.filename || 'Uploaded_Document.pdf';
  const fileSize = req.file?.size || req.body.fileSize || 320000;
  const fileType = req.file?.mimetype || req.body.fileType || 'application/pdf';
  const forcedDocType = req.body.docType as DocumentType | undefined;

  const result = DocumentService.processUploadedDocument({
    applicationId: app.id,
    supplierOrgId: app.supplierOrgId,
    buyerOrgId: app.buyerOrgId,
    filename,
    fileBuffer: req.file?.buffer,
    fileSize,
    fileType,
    uploadedBy: user?.name || 'Authorized User',
    uploadedRole: user?.userType || 'BUYER',
    forcedDocType
  });

  res.status(201).json({
    message: 'Document uploaded and analyzed by AI agent',
    document: result.document,
    extractions: result.extractions
  });
});

// PATCH verify or flag document
router.patch('/:id/verify', (req: AuthenticatedRequest, res: Response) => {
  const doc = db.getDocument(req.params.id);
  const user = req.user;

  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const { status, note } = req.body;
  const updated = db.updateDocument(doc.id, {
    verificationStatus: status || 'VERIFIED'
  });

  AuditService.log(
    { id: user?.id || 'sys', name: user?.name || 'Reviewer', role: user?.role || 'BUYER_REVIEWER' },
    'DOCUMENT_VERIFICATION_STATUS_UPDATED',
    'DOCUMENT',
    doc.id,
    { status, note, documentTitle: doc.title }
  );

  res.json({ document: updated });
});

export default router;
