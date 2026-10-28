import { Router, Response } from 'express';
import { db } from '../db/memoryDb.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { EmailIntakeService } from '../services/emailIntakeService.js';

const router = Router();

// GET all incoming emails
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const emails = db.getAllEmailIntake(user?.userType === 'BUYER' ? user.organizationId : undefined);
  res.json({
    emailIntakeQueue: emails.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  });
});

// POST simulate incoming email with attachments
router.post('/simulate', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { senderEmail, senderName, subject, bodyText, attachments } = req.body;

  if (!senderEmail || !subject) {
    res.status(400).json({ error: 'senderEmail and subject are required' });
    return;
  }

  const record = EmailIntakeService.ingestEmail({
    buyerOrgId: user?.organizationId || 'buyer-org-1',
    senderEmail,
    senderName: senderName || senderEmail.split('@')[0],
    subject,
    bodyText: bodyText || 'Please find attached our onboarding documentation pack.',
    attachments: attachments || [
      { filename: 'Company_W9_Form_Signed.pdf', fileType: 'application/pdf', size: 310000, docType: 'IRS_W9' },
      { filename: 'Bank_Account_Verification.pdf', fileType: 'application/pdf', size: 245000, docType: 'BANK_VERIFICATION_LETTER' }
    ]
  });

  res.status(201).json({
    message: 'Incoming email processed by autonomous intake connector',
    intakeRecord: record
  });
});

// POST manually associate email intake with an application
router.post('/:id/associate', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { applicationId } = req.body;

  if (!applicationId) {
    res.status(400).json({ error: 'applicationId is required' });
    return;
  }

  const updated = EmailIntakeService.manuallyAssociate(
    req.params.id,
    applicationId,
    { id: user?.id || 'sys', name: user?.name || 'Reviewer', role: user?.role || 'BUYER_REVIEWER' }
  );

  if (!updated) {
    res.status(404).json({ error: 'Email intake record or application not found' });
    return;
  }

  res.json({
    message: 'Email and attached documents successfully associated with application',
    intakeRecord: updated
  });
});

export default router;
