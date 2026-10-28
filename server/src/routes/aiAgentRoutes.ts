import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AISupervisorService } from '../services/aiSupervisorService.js';
import { DuplicateDetectionService } from '../services/duplicateDetectionService.js';
import { ExternalVerificationAdapters } from '../services/verificationAdapters.js';

const router = Router();

// Pre-screen duplicate check
router.post('/duplicate-check', (req: AuthenticatedRequest, res: Response) => {
  const { legalName, tradeName, taxId, country, businessEmail } = req.body;
  if (!legalName) {
    res.status(400).json({ error: 'legalName is required' });
    return;
  }

  const result = DuplicateDetectionService.checkDuplicate({
    legalName,
    tradeName,
    taxId,
    country,
    businessEmail
  });

  res.json({ duplicateCheck: result });
});

// Completeness & deterministic risk score
router.post('/completeness-check', (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.body;
  if (!applicationId) {
    res.status(400).json({ error: 'applicationId is required' });
    return;
  }

  try {
    const report = AISupervisorService.evaluateCompleteness(applicationId);
    res.json({ report });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Executive summary generation
router.post('/executive-summary', (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.body;
  if (!applicationId) {
    res.status(400).json({ error: 'applicationId is required' });
    return;
  }

  const summary = AISupervisorService.generateExecutiveSummary(applicationId);
  res.json({ summary });
});

// AI draft clarification email
router.post('/draft-clarification', (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.body;
  if (!applicationId) {
    res.status(400).json({ error: 'applicationId is required' });
    return;
  }

  try {
    const draft = AISupervisorService.draftClarificationEmail(applicationId);
    res.json({ draft });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Interactive AI Copilot assistant
router.post('/copilot-chat', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { applicationId, message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const reply = AISupervisorService.chatCopilot({
    applicationId,
    userRole: user?.role || 'BUYER_REVIEWER',
    userType: user?.userType || 'BUYER',
    message
  });

  res.json({
    reply,
    sender: 'Supervisor Agent',
    timestamp: new Date().toISOString()
  });
});

// Run external mock verification adapters
router.post('/verify-external', (req: AuthenticatedRequest, res: Response) => {
  const { type, taxId, legalName, routing, account } = req.body;

  if (type === 'TAX_ID') {
    const result = ExternalVerificationAdapters.verifyTaxId(taxId || '84-1294821', legalName || 'Nexura Global');
    res.json({ result });
    return;
  }

  if (type === 'SANCTIONS') {
    const result = ExternalVerificationAdapters.screenSanctions(legalName || 'Nexura Global');
    res.json({ result });
    return;
  }

  if (type === 'BANK_ACCOUNT') {
    const result = ExternalVerificationAdapters.verifyBankAccount(
      routing || '121000358',
      account || '489201948210',
      legalName || 'Nexura Global'
    );
    res.json({ result });
    return;
  }

  res.status(400).json({ error: `Unknown verification adapter type: ${type}` });
});

export default router;
