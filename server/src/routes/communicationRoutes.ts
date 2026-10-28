import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memoryDb.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { SupplierMessage } from '../models/types.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

// GET messages for application
router.get('/:applicationId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const isBuyer = user?.userType === 'BUYER';
  const messages = db.getMessagesByApplication(req.params.applicationId, isBuyer);
  res.json({ messages });
});

// POST send new message or internal note
router.post('/:applicationId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { subject, message, isInternalNote } = req.body;

  if (!message) {
    res.status(400).json({ error: 'message text is required' });
    return;
  }

  const msgId = `msg-${uuidv4().slice(0, 6)}`;
  const correlationId = `CORR-${Math.floor(10000 + Math.random() * 90000)}`;

  const newMsg: SupplierMessage = {
    id: msgId,
    applicationId: req.params.applicationId,
    senderId: user?.id || 'sys',
    senderName: user?.name || 'System',
    senderRole: user?.userType === 'BUYER' ? 'BUYER' : 'SUPPLIER',
    subject: subject || (isInternalNote ? 'Internal Compliance Note' : 'Supplier Onboarding Notification'),
    message,
    isInternalNote: Boolean(isInternalNote),
    sentAt: new Date().toISOString(),
    deliveryStatus: isInternalNote ? 'DELIVERED' : 'SENT',
    deliveryCorrelationId: isInternalNote ? undefined : correlationId
  };

  db.createMessage(newMsg);

  AuditService.log(
    { id: user?.id || 'sys', name: user?.name || 'User', role: user?.role || 'BUYER_REVIEWER' },
    isInternalNote ? 'INTERNAL_NOTE_RECORDED' : 'SUPPLIER_MESSAGE_SENT',
    'MESSAGE',
    msgId,
    {
      applicationId: req.params.applicationId,
      deliveryCorrelationId: correlationId,
      isInternalNote
    }
  );

  res.status(201).json({
    message: isInternalNote ? 'Internal note added' : 'Message dispatched to supplier',
    supplierMessage: newMsg
  });
});

export default router;
