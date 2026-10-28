import { Router, Response } from 'express';
import { db } from '../db/memoryDb.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// GET audit log
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { entityId, limit } = req.query;

  let events = db.getAuditEvents(user?.userType === 'BUYER' ? user.organizationId : undefined, entityId as string);

  if (limit) {
    events = events.slice(0, parseInt(String(limit), 10));
  }

  res.json({ auditEvents: events });
});

export default router;
