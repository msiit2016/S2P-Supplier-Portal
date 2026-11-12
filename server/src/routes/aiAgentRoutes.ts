import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AISupervisorService } from '../services/aiSupervisorService.js';
import { DuplicateDetectionService } from '../services/duplicateDetectionService.js';
import { ExternalVerificationAdapters } from '../services/verificationAdapters.js';
import { GeminiBackendService } from '../services/geminiBackendService.js';

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

// Interactive AI Copilot assistant (Backend-driven Gemini 2.5 Flash + Master Instructions)
router.post('/copilot-chat', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { applicationId, message, prompt, currentRoute, pageContextData, history, stream } = req.body;
  const query = prompt || message;

  if (!query) {
    res.status(400).json({ error: 'message or prompt is required' });
    return;
  }

  // If streaming is requested (stream: true or Accept: text/event-stream)
  if (stream || req.headers.accept === 'text/event-stream') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    const sendSSE = (eventData: any) => {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    try {
      await GeminiBackendService.streamResponse({
        prompt: query,
        currentRoute: currentRoute || '/dashboard',
        pageContextData,
        history,
        user
      }, {
        onThinking: (stepText) => {
          sendSSE({ type: 'thinking', text: stepText });
        },
        onChunk: (textChunk) => {
          sendSSE({ type: 'chunk', text: textChunk });
        },
        onDone: (result) => {
          sendSSE({
            type: 'done',
            text: result.text,
            reply: result.text,
            actions: result.actions || [],
            partialViews: result.partialViews || [],
            modelUsed: result.modelUsed,
            isLiveGemini: result.isLiveGemini
          });
          res.end();
        },
        onError: (err) => {
          sendSSE({ type: 'error', error: err.message });
          res.end();
        }
      });
    } catch (err: any) {
      console.error('[Copilot Chat Stream Error]', err);
      sendSSE({ type: 'error', error: err.message });
      res.end();
    }
    return;
  }

  // If this is an onboarding application review query without a route or page context:
  if (applicationId && !currentRoute && !pageContextData) {
    const reply = AISupervisorService.chatCopilot({
      applicationId,
      userRole: user?.role || 'BUYER_REVIEWER',
      userType: user?.userType || 'BUYER',
      message: query
    });
    res.json({
      reply,
      text: reply,
      actions: [],
      sender: 'Supervisor Agent',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const result = await GeminiBackendService.generateResponse({
      prompt: query,
      currentRoute: currentRoute || '/dashboard',
      pageContextData,
      history,
      user
    });

    res.json({
      reply: result.text,
      text: result.text,
      actions: result.actions || [],
      partialViews: result.partialViews || [],
      isLiveGemini: result.isLiveGemini,
      modelUsed: result.modelUsed,
      sender: 'Ava',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[Copilot Chat Error]', err);
    res.status(500).json({ error: err.message || 'Error processing AI chat' });
  }
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
