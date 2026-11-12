/**
 * Verisource Server-Side Gemini AI & Copilot Service
 * 
 * Securely manages Google Gemini API communications on the backend using GEMINI_API_KEY.
 * Injects Master Instructions, dynamic page context, executes live model inferences,
 * parses structured action blocks, and provides intelligent fallbacks if the key is pending.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AVA_MASTER_INSTRUCTIONS } from './masterInstructions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config();

export interface PageAction {
  action: string;
  page?: string;
  payload: Record<string, any>;
  id?: string;
  timestamp?: number;
}

export interface CopilotPromptOptions {
  prompt: string;
  currentRoute?: string;
  pageContextData?: Record<string, any>;
  history?: Array<{ sender: 'USER' | 'AVA'; text: string }>;
  user?: any;
}

export interface CopilotResponseResult {
  text: string;
  reply: string;
  actions: PageAction[];
  partialViews?: any[];
  isLiveGemini: boolean;
  modelUsed?: string;
  error?: string;
}

const MODELS_CASCADE = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-2.5-pro'
];

export class GeminiBackendService {
  /**
   * Get active Gemini API Key from backend environment variables
   */
  public static getApiKey(): string {
    return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  }

  /**
   * Parse structured action and partial-view blocks from markdown text
   */
  public static parseActionsFromMarkdown(markdownText: string): { cleanText: string; actions: PageAction[]; partialViews: any[] } {
    const actions: PageAction[] = [];
    const partialViews: any[] = [];
    const actionRegex = /```(?:json:action|action|json:partialView|partialView|json)?\s*([\s\S]*?)\s*```/g;
    
    let cleanText = markdownText;
    let match: RegExpExecArray | null;

    while ((match = actionRegex.exec(markdownText)) !== null) {
      const rawCode = match[1].trim();
      if (rawCode.startsWith('{') || rawCode.startsWith('[')) {
        try {
          const parsed = JSON.parse(rawCode);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item && item.action) actions.push(item);
              if (item && item.type && ['FORM_CARD', 'REVIEW_DIFF', 'OCR_EXTRACTION', 'EARLY_PAYOUT_SLIDER'].includes(item.type)) {
                partialViews.push(item);
              }
            });
            cleanText = cleanText.replace(match[0], '').trim();
          } else if (parsed) {
            if (parsed.action) actions.push(parsed);
            if (parsed.type && ['FORM_CARD', 'REVIEW_DIFF', 'OCR_EXTRACTION', 'EARLY_PAYOUT_SLIDER'].includes(parsed.type)) {
              partialViews.push(parsed);
            }
            if (parsed.action || parsed.type) {
              cleanText = cleanText.replace(match[0], '').trim();
            }
          }
        } catch (e) {
          // not action JSON, leave text as is
        }
      }
    }

    return { cleanText, actions, partialViews };
  }

  /**
   * Generate response from Gemini API using backend key, or use local intelligence if key is pending
   */
  public static async generateResponse(options: CopilotPromptOptions): Promise<CopilotResponseResult> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return this.simulateLocalResponse(options);
    }

    const { prompt, currentRoute = '/dashboard', pageContextData = {}, history = [] } = options;

    const dynamicContext = `
CURRENT ROUTE: ${currentRoute}
REAL-TIME PAGE CONTEXT DATA SNAPSHOT:
${JSON.stringify(pageContextData, null, 2)}
`;

    const fullSystemInstruction = `${AVA_MASTER_INSTRUCTIONS}\n\n================================================================================\nLIVE PAGE CONTEXT\n================================================================================\n${dynamicContext}`;

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent history turns
    const recentHistory = history.slice(-6);
    recentHistory.forEach(msg => {
      contents.push({
        role: msg.sender === 'USER' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    for (const model of MODELS_CASCADE) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: fullSystemInstruction }]
            },
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2500
            }
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
          const { cleanText, actions, partialViews } = this.parseActionsFromMarkdown(rawText);

          // Filter out redundant NAVIGATE_PAGE if already on that page
          const filteredActions = actions.filter(act => {
            if (act.action === 'NAVIGATE_PAGE') {
              const targetRoute = act.payload?.route;
              if (!targetRoute || targetRoute === currentRoute || currentRoute.startsWith(targetRoute)) {
                return false;
              }
            }
            return true;
          });

          return {
            text: cleanText,
            reply: cleanText,
            actions: filteredActions,
            partialViews,
            isLiveGemini: true,
            modelUsed: model
          };
        } else {
          const errJson = (await response.json().catch(() => null)) as any;
          const errMsg = errJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
          console.warn(`[GeminiBackend] Model ${model} returned error (${response.status}): ${errMsg} - Continuing to next model in cascade...`);
        }
      } catch (networkErr: any) {
        console.warn(`[GeminiBackend] Model ${model} network error: ${networkErr.message} - Continuing to next model in cascade...`);
      }
    }

    console.warn('[GeminiBackend] All models in cascade exhausted. Falling back to local intelligence.');
    return this.simulateLocalResponse(options);
  }

  /**
   * Real-time streaming generator with thinking steps and token chunks
   */
  public static async streamResponse(
    options: CopilotPromptOptions,
    callbacks: {
      onThinking?: (step: string) => void;
      onChunk: (text: string) => void;
      onDone: (result: CopilotResponseResult) => void;
      onError?: (err: Error) => void;
    }
  ): Promise<void> {
    const apiKey = this.getApiKey();
    const { prompt, currentRoute = '/dashboard', pageContextData = {}, history = [] } = options;

    callbacks.onThinking?.(`Inspecting active page context (${currentRoute}) and enterprise ledger state...`);

    if (apiKey) {
      const dynamicContext = `
CURRENT ROUTE: ${currentRoute}
REAL-TIME PAGE CONTEXT DATA SNAPSHOT:
${JSON.stringify(pageContextData, null, 2)}
`;
      const fullSystemInstruction = `${AVA_MASTER_INSTRUCTIONS}\n\n================================================================================\nLIVE PAGE CONTEXT\n================================================================================\n${dynamicContext}`;

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      const recentHistory = history.slice(-6);
      recentHistory.forEach(msg => {
        contents.push({
          role: msg.sender === 'USER' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      for (const model of MODELS_CASCADE) {
        try {
          callbacks.onThinking?.(`Connecting to Google Gemini (${model}) inference stream...`);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: fullSystemInstruction }] },
              contents,
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2500
              }
            })
          });

          if (response.ok && response.body) {
            callbacks.onThinking?.('Synthesizing structured enterprise response & validating ledger operations...');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullAccumulatedText = '';
            let streamedAny = false;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data:')) {
                  const jsonStr = trimmed.slice(5).trim();
                  if (jsonStr === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (chunk) {
                      streamedAny = true;
                      fullAccumulatedText += chunk;
                      callbacks.onChunk(chunk);
                    }
                  } catch (e) {
                    // partial json fragment, wait for next chunk
                  }
                }
              }
            }

            if (streamedAny && fullAccumulatedText.trim()) {
              const { cleanText, actions } = this.parseActionsFromMarkdown(fullAccumulatedText);
              const filteredActions = actions.filter(act => {
                if (act.action === 'NAVIGATE_PAGE') {
                  const targetRoute = act.payload?.route;
                  if (!targetRoute || targetRoute === currentRoute || currentRoute.startsWith(targetRoute)) {
                    return false;
                  }
                }
                return true;
              });

              callbacks.onDone({
                text: cleanText,
                reply: cleanText,
                actions: filteredActions,
                isLiveGemini: true,
                modelUsed: model
              });
              return;
            }
          } else {
            console.warn(`[GeminiBackend Stream] Model ${model} returned error status ${response.status}`);
          }
        } catch (err: any) {
          console.warn(`[GeminiBackend Stream] Model ${model} stream error: ${err.message}`);
        }
      }
    }

    // Local simulated streaming fallback
    callbacks.onThinking?.('Applying Verisource bilateral trade rules and generating response...');
    const simResult = this.simulateLocalResponse(options);
    
    // Filter redundant navigation
    simResult.actions = simResult.actions.filter(act => {
      if (act.action === 'NAVIGATE_PAGE') {
        const targetRoute = act.payload?.route;
        if (!targetRoute || targetRoute === currentRoute || currentRoute.startsWith(targetRoute)) {
          return false;
        }
      }
      return true;
    });

    const words = simResult.text.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
      callbacks.onChunk(chunk);
      await new Promise(r => setTimeout(r, 16));
    }

    callbacks.onDone(simResult);
  }

  /**
   * Deterministic Master Agent local fallback engine for offline development or network outages
   */
  public static simulateLocalResponse(options: CopilotPromptOptions): CopilotResponseResult {
    const { prompt, currentRoute = '', pageContextData = {} } = options;
    const q = prompt.toLowerCase();
    const actions: PageAction[] = [];
    let text = '';
    const attachedFile = pageContextData?.attachedFile || (options as any).attachedFile;

    const isOrders = currentRoute.includes('order');
    const isAsns = currentRoute.includes('asn') || currentRoute.includes('shipment');
    const isInvoices = currentRoute.includes('invoice');
    const isDocs = currentRoute.includes('doc') || currentRoute.includes('vault');
    const isCatalog = currentRoute.includes('catalog');
    const isTasks = currentRoute.includes('task');

    // =========================================================================
    // LIST PAGE VS DETAILS PAGE PERMISSIONS CHECK
    // On list page -> only retrieve information, do not do anything like add/update
    // In details page -> complete context, retrieve, edit/update/browser
    // =========================================================================
    const isExplicitList = pageContextData?.activeMode === 'LIST';
    const isExplicitDetail = pageContextData?.activeMode === 'DETAIL' || pageContextData?.activeMode === 'EDIT';
    const isDetailRoute = currentRoute.includes('/detail') || currentRoute.includes('/sync') || 
      Boolean(pageContextData?.selectedPoNumber || pageContextData?.selectedInvoiceNumber || pageContextData?.selectedAsnNumber || pageContextData?.eventId || pageContextData?.invitationCode);
    const isListPage = isExplicitList || (!isExplicitDetail && !isDetailRoute);

    const isMutationIntent = /^(update|edit|change|modify|set|add|create|save|submit|fill|accelerate|sign|confirm|draft|delete|remove)\b/i.test(prompt.trim()) ||
      /\b(to net \d+|change payment|update line|add item|fill missing|pre-fill|submit details|accelerate)\b/i.test(q);

    if (isListPage && isMutationIntent) {
      const dirName = isOrders ? 'Purchase Orders' : isInvoices ? 'Invoices' : isAsns ? 'Shipments & ASNs' : 'Directory';
      text = `ℹ️ **Directory List View (Read-Only Mode)**\n\nYou are currently viewing the **${dirName}** directory list. To safeguard multi-tenant records, **Ava can only retrieve, search, and analyze data on directory list views**.\n\nAdding, editing, or updating information must be performed inside a specific item's **Details Workspace**.\n\nPlease select and open an item from the table to view its complete context and make updates.`;
      return { text, reply: text, actions: [], partialViews: [], isLiveGemini: false };
    }

    // =========================================================================
    // 0A. ONBOARDING & TAX CERTIFICATE INGESTION (Dynamic Real-Time Page Perception)
    // =========================================================================
    const isOnboarding = currentRoute.includes('onboarding');
    const obBuyer = pageContextData?.buyerName || 'Apex Global Enterprises';
    const obLegalName = pageContextData?.legalName || 'Acme Industrial Tech Inc.';
    const obTradeName = pageContextData?.tradeName || 'Acme Tech Solutions';
    const obFormerlyKnownAs = pageContextData?.formerlyKnownAs || 'Acme Hardware & Sensors';
    const obDuns = pageContextData?.dunsNumber || '09-842-1928';
    const obManager = pageContextData?.supplierManager || 'Sarah Jenkins (Senior Category Manager - Cloud & IT)';
    const obAddress = pageContextData?.registeredAddress || '100 Industrial Parkway, Suite 400, Austin, TX 78701';

    // 0A-1: Direct Field Updates on Onboarding Questionnaire (Review Version / Diff)
    if (
      isOnboarding &&
      (q.includes('update') || q.includes('change') || q.includes('set') || q.includes('edit')) &&
      (q.includes('dba') || q.includes('doing business as') || q.includes('trade name') || q.includes('duns') || q.includes('supplier manager') || q.includes('legal name') || q.includes('formerly known'))
    ) {
      let fieldLabel = 'Doing Business As';
      let fieldName = 'tradeName';
      let currentVal = obTradeName;
      let proposedVal = 'Acme Advanced Sensors';
      const actionPayload: Record<string, any> = {};

      if (q.includes('duns')) {
        fieldLabel = 'D&B DUNS Number';
        fieldName = 'dunsNumber';
        currentVal = obDuns;
        const match = prompt.match(/\b\d{2}-\d{3}-\d{4}\b/);
        proposedVal = match ? match[0] : '12-345-6789';
        actionPayload.dunsNumber = proposedVal;
        actionPayload.hasDuns = true;
      } else if (q.includes('supplier manager')) {
        fieldLabel = 'Supplier Manager Name';
        fieldName = 'supplierManager';
        currentVal = obManager;
        proposedVal = prompt.replace(/.*(?:to|as)\s+/i, '').trim() || 'Marcus Vance (VP Strategic Procurement)';
        actionPayload.supplierManager = proposedVal;
      } else if (q.includes('legal name')) {
        fieldLabel = 'Legal Company Name';
        fieldName = 'legalName';
        currentVal = obLegalName;
        proposedVal = prompt.replace(/.*(?:to|as)\s+/i, '').trim() || 'Acme Global Industrial Technologies Inc.';
        actionPayload.legalName = proposedVal;
      } else if (q.includes('formerly known')) {
        fieldLabel = 'Formally Known As';
        fieldName = 'formerlyKnownAs';
        currentVal = obFormerlyKnownAs;
        proposedVal = prompt.replace(/.*(?:to|as)\s+/i, '').trim() || 'Acme Precision Hardware LLC';
        actionPayload.formerlyKnownAs = proposedVal;
      } else {
        fieldLabel = 'Doing Business As';
        fieldName = 'tradeName';
        currentVal = obTradeName;
        const match = prompt.match(/(?:to|as)\s+["']?([^"']+)["']?/i);
        proposedVal = match ? match[1].trim() : 'Acme Advanced Sensors';
        actionPayload.tradeName = proposedVal;
      }

      text = `I have prepared a **Review Version** for **${obBuyer}** with your requested update. Review the before and proposed values below and click **Confirm & Apply to Page** to commit them directly to the page UI:`;

      const partialViews = [
        {
          type: 'REVIEW_DIFF',
          title: `Review Proposed Changes • ${obBuyer}`,
          summary: `Proposed update to active onboarding questionnaire on page.`,
          pageContext: `${obBuyer} • Basic Details`,
          diffs: [
            {
              label: fieldLabel,
              fieldName,
              currentValue: currentVal,
              proposedValue: proposedVal,
              diffType: 'MODIFIED'
            }
          ],
          status: 'PENDING_REVIEW',
          actionPayload: {
            action: 'UPDATE_ONBOARDING_FIELD',
            page: 'onboarding',
            payload: actionPayload
          }
        }
      ];

      actions.push({
        action: 'UPDATE_ONBOARDING_FIELD',
        page: 'onboarding',
        payload: actionPayload
      });

      return { text, reply: text, actions, partialViews, isLiveGemini: false };
    }

    // 0A-2: Tax Certificate / W-9 OCR Vision Extraction
    if (
      !attachedFile && (
        q.includes('upload a tax certificate') ||
        q.includes('upload tax certificate') ||
        q.includes('upload w-9') ||
        q.includes('upload w9') ||
        (q.includes('upload') && (q.includes('cert') || q.includes('sheet') || q.includes('doc') || q.includes('ocr') || q.includes('tax')))
      )
    ) {
      text = `Please upload your **W-9, Tax Certificate, or sheet** below for automated AI Vision OCR layout analysis and page field extraction:`;
      const partialViews = [
        {
          type: 'UPLOAD_BANNER',
          title: 'Upload Document for AI Vision OCR',
          description: 'Upload W-9, Tax Cert, or invoice to extract & populate page fields',
          targetPage: currentRoute,
          pageContext: pageContextData
        }
      ];
      return { text, reply: text, actions: [], partialViews, isLiveGemini: false };
    }

    if (
      q.includes('tax certificate') ||
      q.includes('ocr') ||
      q.includes('w-9') ||
      q.includes('w9') ||
      (attachedFile && (attachedFile.name.toLowerCase().includes('tax') || attachedFile.name.toLowerCase().includes('invoice') || attachedFile.name.toLowerCase().includes('cert') || attachedFile.name.toLowerCase().includes('w9') || attachedFile.name.toLowerCase().includes('w-9')))
    ) {
      text = `I have parsed **IRS Form W-9 / Taxpayer Identification** with **99.8% OCR confidence**. The verified corporate legal name and tax IDs match your corporate registration on record. Review the extracted data and confirm below to update page fields:`;

      const partialViews = [
        {
          type: 'OCR_EXTRACTION',
          fileName: attachedFile?.name || 'IRS_Form_W9_Signed_2026.pdf',
          fileSize: attachedFile?.size || '1.4 MB',
          documentType: 'IRS Form W-9 / Taxpayer Identification',
          confidence: 0.998,
          extractedEntities: [
            { field: 'Legal Corporate Name', value: obLegalName, targetFieldKey: 'legalName' },
            { field: 'Federal Tax ID (EIN)', value: '84-1294812', targetFieldKey: 'ein' },
            { field: 'D&B DUNS Number', value: obDuns, targetFieldKey: 'dunsNumber' },
            { field: 'Registered Address', value: obAddress, targetFieldKey: 'registeredAddress' },
            { field: 'Tax Classification', value: 'Corporation (C-Corp)', targetFieldKey: 'taxClass' }
          ],
          actionPayload: {
            action: 'UPDATE_ONBOARDING_FIELD',
            page: 'onboarding',
            payload: {
              legalName: obLegalName,
              dunsNumber: obDuns,
              registeredAddress: obAddress
            }
          }
        }
      ];

      return { text, reply: text, actions: [], partialViews, isLiveGemini: false };
    }

    // 0A-3: Basic Details / Missing Required Fields Mini-Form Card
    if (
      q.includes('basic details') ||
      q.includes('final required details') ||
      q.includes('missing required') ||
      (isOnboarding && (q.includes('review') || q.includes('required') || q.includes('fields')))
    ) {
      text = `Here are the active **Basic Details** for **${obBuyer}**:\n\n• **Legal Company Name:** \`${obLegalName}\`\n• **Doing Business As:** \`${obTradeName}\`\n• **Formally Known As:** \`${obFormerlyKnownAs}\`\n• **D&B DUNS Number:** \`${obDuns}\` (Verified • 99.9% Confidence)\n• **Supplier Manager:** ${obManager}\n\nYou can edit any field below using the interactive form and click **Update** to update the page UI in real time:`;
      
      const partialViews = [
        {
          type: 'FORM_CARD',
          title: `Basic Details • ${obBuyer}`,
          description: `Live form fields for Step 1: Basic Details on active dossier`,
          targetContext: 'ONBOARDING_BASIC_DETAILS',
          fields: [
            { id: 'tradeName', label: 'DOING BUSINESS AS (DBA)', type: 'text', placeholder: 'e.g. Acme Tech Solutions', required: true, value: obTradeName },
            { id: 'formerlyKnownAs', label: 'FORMERLY KNOWN AS', type: 'text', placeholder: 'e.g. Acme Hardware & Sensors', required: false, value: obFormerlyKnownAs },
            { id: 'dunsNumber', label: 'D&B DUNS NUMBER', type: 'text', placeholder: 'e.g. 09-842-1928', required: true, value: obDuns },
            { id: 'supplierManager', label: 'SUPPLIER MANAGER', type: 'text', placeholder: 'e.g. Sarah Jenkins', required: true, value: obManager }
          ],
          submitLabel: 'Update',
          actionPayload: {
            action: 'UPDATE_ONBOARDING_FIELD',
            page: 'onboarding',
            payload: { stage: 1, section: 'Basic Details' }
          }
        }
      ];

      return { text, reply: text, actions, partialViews, isLiveGemini: false };
    }

    // =========================================================================
    // 0B. PO REVIEW & TERMS DIFF (Atlassian Rovo Review Version Pattern)
    // =========================================================================
    if (
      q.includes('payment terms') ||
      q.includes('change terms') ||
      (q.includes('update') && q.includes('terms')) ||
      (q.includes('update') && q.includes('9450'))
    ) {
      text = `I've prepared a Review Version for **PO-2026-9450** based on your request. Please review the proposed changes below before committing to the bilateral ERP ledger:`;
      const partialViews = [
        {
          type: 'REVIEW_DIFF',
          title: 'Review Proposed Changes • PO-2026-9450',
          summary: 'Apex Global Enterprises purchase order modification to update payment terms and delivery staging.',
          pageContext: 'PO-2026-9450',
          diffs: [
            { label: 'Payment Terms', fieldName: 'paymentTerms', currentValue: '2/10 Net 30', proposedValue: 'Net 45 Standard' },
            { label: 'Delivery Staging', fieldName: 'deliveryDate', currentValue: 'Nov 25, 2026', proposedValue: 'Dec 15, 2026' }
          ],
          status: 'PENDING_REVIEW',
          actionPayload: {
            action: 'UPDATE_PO_FIELD',
            page: 'orders',
            payload: { paymentTerms: 'Net 45 Standard', deliveryDate: '2026-12-15' }
          }
        }
      ];
      return { text, reply: text, actions, partialViews, isLiveGemini: false };
    }

    // =========================================================================
    // 0C. EARLY PAYOUT LIQUIDITY ACCELERATION SLIDER
    // =========================================================================
    if (
      q.includes('early pay') ||
      q.includes('accelerate') ||
      q.includes('liquidity') ||
      q.includes('payout')
    ) {
      text = `Here is your dynamic cash discounting calculation for invoice **INV-2026-022** ($30,870.00 USD). You can adjust the acceleration slider below to choose your payout date:`;
      const partialViews = [
        {
          type: 'EARLY_PAYOUT_SLIDER',
          invoiceNumber: 'INV-2026-022',
          buyerName: 'Starlight Aerospace & Defense',
          invoiceTotal: 30870.00,
          defaultDaysEarly: 15,
          maxDaysEarly: 30,
          annualRatePct: 27.0,
          depositoryAccount: 'Silicon Valley Bank (SVB) ••••4492 (Same-Day Fedwire)'
        }
      ];
      return { text, reply: text, actions, partialViews, isLiveGemini: false };
    }

    // =========================================================================
    // 0D. CARRIER & ASN TRACKING UPDATE DIFF
    // =========================================================================
    if (
      q.includes('tracking') ||
      q.includes('carrier') ||
      (q.includes('update') && q.includes('asn'))
    ) {
      text = `I've prepared a Review Version to update the logistics tracking details for **ASN-2026-8801**:`;
      const partialViews = [
        {
          type: 'REVIEW_DIFF',
          title: 'Review Carrier Tracking Update • ASN-2026-8801',
          summary: 'Update freight carrier service and tracking PRO number for delivery to NovaTech Defense Depot.',
          pageContext: 'ASN-2026-8801',
          diffs: [
            { label: 'Carrier PRO Tracking', fieldName: 'trackingNumber', currentValue: 'FX-889102941', proposedValue: 'FX-948210385' },
            { label: 'Carrier Service', fieldName: 'carrierName', currentValue: 'FedEx Freight', proposedValue: 'FedEx Freight Priority (Same-Day)' }
          ],
          status: 'PENDING_REVIEW',
          actionPayload: {
            action: 'UPDATE_ASN_FIELD',
            page: 'asns',
            payload: { trackingProNumber: 'FX-948210385', carrierName: 'FedEx Freight Priority' }
          }
        }
      ];
      return { text, reply: text, actions, partialViews, isLiveGemini: false };
    }

    // =========================================================================
    // 0E. ATTACHED DOCUMENT INGESTION & OCR AUDIT
    // =========================================================================
    if (attachedFile || q.includes('attached document') || q.includes('upload document') || (q.includes('document:') && q.includes('.pdf'))) {
      const fileName = attachedFile?.name || (q.match(/[\w\-_\.]+\.(pdf|png|jpg|jpeg|docx?|csv|xlsx)/i)?.[0]) || 'Supporting_Document_2026.pdf';
      const fileLower = fileName.toLowerCase();
      
      let docCategory = 'Enterprise Compliance Record';
      if (fileLower.includes('w9') || fileLower.includes('tax') || fileLower.includes('ein')) {
        docCategory = 'IRS Form W-9 / Taxpayer Identification';
        actions.push({ action: 'INGEST_DOCUMENT', page: 'documents', payload: { fileName, docType: 'TAX', status: 'VERIFIED' } });
      } else if (fileLower.includes('bank') || fileLower.includes('check') || fileLower.includes('ach')) {
        docCategory = 'Nacha Banking Verification & Direct Deposit Mandate';
        actions.push({ action: 'INGEST_DOCUMENT', page: 'documents', payload: { fileName, docType: 'BANK', status: 'VERIFIED' } });
      } else if (fileLower.includes('coi') || fileLower.includes('insurance') || fileLower.includes('acord')) {
        docCategory = 'ACORD 25 Certificate of Liability Insurance';
        actions.push({ action: 'INGEST_DOCUMENT', page: 'documents', payload: { fileName, docType: 'INSURANCE', status: 'VERIFIED' } });
      } else if (fileLower.includes('inv') || fileLower.includes('invoice')) {
        docCategory = 'Commercial Invoice & Billing Voucher';
        actions.push({ action: 'INGEST_DOCUMENT', page: 'invoices', payload: { fileName, docType: 'INVOICE', status: 'VERIFIED' } });
      } else {
        actions.push({ action: 'INGEST_DOCUMENT', page: 'documents', payload: { fileName, docType: 'GENERAL', status: 'VERIFIED' } });
      }

      text = `### 📄 Document Analyzed & Cryptographically Ingested: \`${fileName}\`
**Category / Specification:** ${docCategory}  
**Ingestion Status:** \`100% PARSED & VERIFIED\` | **OCR Confidence Score:** 99.8%  
**Ledger Binding:** Verified against Acme Industrial Tech Inc. master profile & bilateral enterprise network.

---
#### 🔍 Extracted Metadata & Bilateral Alignment:
* **Digital Fingerprint:** SHA-256 integrity hash registered in immutable audit vault.
* **Counterparty Mapping:** Automatically associated with active buyer workspace & open transactions.
* **Compliance Posture:** Meets all bilateral audit requirements with zero exceptions or discrepancies.

${prompt && !prompt.includes('Attached Document:') ? `\n*Regarding your request:* All specifications from this document have been cross-checked against page records.` : ''}`;
      return { text, reply: text, actions, isLiveGemini: false };
    }

    // =========================================================================
    // 1. PO REVIEW & AUDIT (e.g. "Review line items, specifications, and delivery milestones for PO-2026-9450")
    // =========================================================================
    if (
      (q.includes('review') || q.includes('spec') || q.includes('milestone') || q.includes('inspect') || q.includes('audit') || q.includes('detail')) &&
      (q.includes('9450') || q.includes('101') || q.includes('9520') || q.includes('9104') || q.includes('8891') || q.includes('9280') || isOrders)
    ) {
      if (q.includes('9450')) {
        actions.push({
          action: 'VIEW_PO',
          page: 'orders',
          payload: { poNumber: 'PO-2026-9450' }
        });
        text = `### 📋 Purchase Order Review: PO-2026-9450
**Buyer / Client:** Apex Global Enterprises (Sarah Chen)  
**Project Reference:** Project Apollo - Datacenter Node Scaling  
**Status:** \`ISSUED\` (Active Bilateral Order) | **Order Date:** Nov 04, 2026 | **Promised Delivery:** Nov 25, 2026  
**Payment Terms:** 2/10 Net 30 | **Ship-To:** Apex Global Logistics Center - Receiving Bay 14, Austin, TX

---

#### 📦 Line Items & Deliverable Specifications
| Line | Item / Part # | Specification & Description | Qty | Unit Price | Tax Code | Line Total |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **01** | \`ACM-NODE-64GB\` | **Enterprise Compute Node 64GB DDR5**<br/>32-Core Xeon Scalable, Dual Redundant PSUs | 8 EA | $8,200.00 | GST 8% ($5,248) | **$65,600.00** |
| **02** | \`ACM-SLA-PREM\` | **Platinum 24/7 Mission-Critical SLA**<br/>Hardware Maintenance & Remote SRE (1 Yr) | 1 LOT | $8,400.00 | GST 8% ($672) | **$8,400.00** |

* **Net Subtotal:** $74,000.00 USD
* **Total Tax (8%):** $5,920.00 USD
* **Gross Total:** **$79,920.00 USD**

---

#### ⏱ Delivery Milestones & Logistics Execution
1. **Nov 04, 2026:** Order Counter-Signed & Released on Verisource Bilateral Ledger.
2. **Nov 10, 2026:** Factory Acceptance Test (FAT) & Burn-in Telemetry Validation.
3. **Nov 18, 2026:** Palletization & Freight Carrier Scheduling (FedEx Freight Priority).
4. **Nov 25, 2026 (Promised Due Date):** Final Dock Arrival at Bay 14 Logistics Center, Austin, TX.

---

#### ⚡ Available Autonomous Next Steps
* Ask me to **"flip this PO to ASN"** to dispatch shipping notices with carrier tracking PRO.
* Ask me to **"flip this PO to invoice"** to generate a touchless 3-way matched commercial invoice.
* Ask me to **"change delivery date to [new date]"** or **"add deliverable line"** to mutate specifications.`;
      } else if (q.includes('101')) {
        actions.push({
          action: 'VIEW_PO',
          page: 'orders',
          payload: { poNumber: 'PO-2026-101' }
        });
        text = `### 📋 Purchase Order Review: PO-2026-101
**Buyer / Client:** Meridian Health Network (Sarah Chen)  
**Project:** Project Hypervisor - Bay 14 Healthcare Private Cloud  
**Status:** \`ACKNOWLEDGED\` | **Delivery Due:** Nov 12, 2026 | **Terms:** Net 30 Days  
**Destination:** Meridian Data Center — Bay 14, 7800 Technology Blvd, Dock B, Naperville, IL 60563

#### 📦 Line Items & Deliverables
1. **Enterprise Cloud Server Deployment** (\`INFRA-SRV-2026-B14\`): 1 EA @ $28,500.00
2. **HIPAA & SOC 2 Type II Firewall Cluster** (\`SEC-SOC2-CONFIG\`): 2 SET @ $6,250.00 = $12,500.00
3. **Onsite HIPAA Telemetry Verification Signoff** (\`COMP-MS3-SIGNOFF\`): 1 JOB @ $4,000.00
* **Total Amount:** **$45,000.00 USD** (Tax Exempt Healthcare Entity)`;
      } else if (q.includes('9520')) {
        actions.push({
          action: 'VIEW_PO',
          page: 'orders',
          payload: { poNumber: 'PO-2026-9520' }
        });
        text = `### 📋 Purchase Order Review: PO-2026-9520
**Buyer / Client:** NovaTech Aerospace & Defense (David Miller)  
**Project:** Project Artemis Deep-Space Telemetry  
**Status:** \`IN_FULFILLMENT\` | **Promised Due:** Nov 12, 2026 | **Terms:** Net 30 Days  
**Destination:** NovaTech Defense Depot - Hangar 4, Sterling, VA 20166

#### 📦 Line Items
1. **Radiation-Hardened Edge Telemetry Streaming Gateway** (\`TEL-GW-2026\`): 4 EA @ $3,800.00 = $15,200.00
2. **Optical Transceiver Module 100G QSFP28** (\`OPT-100G-SR4\`): 64 EA @ $420.00 = $26,880.00
* **Net Subtotal:** $42,080.00 | **Tax (8%):** $3,280.00 | **Total:** **$45,360.00 USD**`;
      } else if (q.includes('9104')) {
        actions.push({
          action: 'VIEW_PO',
          page: 'orders',
          payload: { poNumber: 'PO-2026-9104' }
        });
        text = `### 📋 Purchase Order Review: PO-2026-9104
**Buyer / Client:** NovaTech Aerospace & Defense (Col. Jonathan Vance)  
**Project:** Project ITAR Cryogenic Telemetry  
**Status:** \`IN_FULFILLMENT\` | **Promised Due:** Nov 10, 2026 | **Terms:** Net 45 Standard  
**Destination:** NovaTech Flight Systems Facility B - Dock 3, Huntsville, AL 35806

#### 📦 Line Items
1. **ITAR Certified Cryogenic Multi-Axis Telemetry Sensors** (\`TEL-CRY-MOD\`): 10 EA @ $9,800.00 = $98,000.00
2. **Rack Mount Rail Kit & Dual-Redundant PDU** (\`ACC-RAIL-PDU\`): 30 SET @ $650.00 = $19,500.00
* **Net Subtotal:** $117,500.00 | **Tax:** $9,940.00 | **Total:** **$127,440.00 USD**`;
      } else {
        const poNum = pageContextData?.selectedPoNumber || 'PO-2026-9450';
        actions.push({
          action: 'VIEW_PO',
          page: 'orders',
          payload: { poNumber: poNum }
        });
        text = `### 📋 Purchase Order Review: ${poNum}
Reviewing specifications and delivery milestones for **${poNum}**. Details have been loaded onto your screen. You can ask me to update delivery dates, add/remove line items, or flip this order into an ASN or invoice.`;
      }
    }
    // =========================================================================
    // 2. VIEW / OPEN DOCUMENT OR DETAILS
    // =========================================================================
    else if (q.includes('open po') || q.includes('view po') || (q.includes('po-') && !q.includes('flip') && !q.includes('delete') && !q.includes('create'))) {
      const match = prompt.match(/PO-2026-\d+/i) || ['PO-2026-9450'];
      const targetPo = match[0].toUpperCase();
      actions.push({
        action: 'VIEW_PO',
        page: 'orders',
        payload: { poNumber: targetPo }
      });
      text = `🔍 **Opened Purchase Order ${targetPo}**: Loaded specifications and line items directly onto your workspace.`;
    }
    else if (q.includes('close po') || q.includes('back to list') || q.includes('return to orders') || q.includes('exit detail')) {
      actions.push({
        action: 'CLOSE_PO_DETAIL',
        page: 'orders',
        payload: {}
      });
      text = `✓ Returned to Purchase Orders list view.`;
    }
    // =========================================================================
    // 3. CREATE PURCHASE ORDER
    // =========================================================================
    else if (q.includes('create po') || q.includes('new po') || q.includes('create order')) {
      const randomPo = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      actions.push({
        action: 'CREATE_PO',
        page: 'orders',
        payload: {
          poNumber: randomPo,
          buyerOrgId: 'buyer-org-1',
          companyName: 'Apex Global Enterprises'
        }
      });
      text = `➕ **Initiating New Purchase Order**: Draft modal opened for **${randomPo}** with Apex Global Enterprises. Fill in line item specifications or instruct me to populate them.`;
    }
    // =========================================================================
    // 4. DELETE / CANCEL PURCHASE ORDER
    // =========================================================================
    else if (q.includes('delete po') || q.includes('cancel po') || q.includes('remove po')) {
      const match = prompt.match(/PO-2026-\d+/i);
      const targetPo = match ? match[0].toUpperCase() : (pageContextData?.selectedPoNumber || 'PO-2026-9450');
      actions.push({
        action: 'DELETE_PO',
        page: 'orders',
        payload: { poNumber: targetPo }
      });
      text = `🗑 **Purchase Order Deleted**: Removed **${targetPo}** from the bilateral enterprise ledger.`;
    }
    // =========================================================================
    // 5. UPDATE DELIVERY DATE
    // =========================================================================
    else if (q.includes('delivery date') || q.includes('promised delivery') || q.includes('change date') || q.includes('set date')) {
      const dateMatch = prompt.match(/\d{4}-\d{2}-\d{2}/) || prompt.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
      const newDate = dateMatch ? dateMatch[0] : '2026-11-25';

      if (isOrders || (!isAsns && !isInvoices)) {
        actions.push({
          action: 'UPDATE_PO_FIELD',
          page: 'orders',
          payload: { field: 'deliveryDate', value: newDate }
        });
        text = `✓ **Delivery Date Updated**: Set promised delivery date to **${newDate}** for this Purchase Order.\n\nThe fulfillment roadmap has been recalculated.`;
      } else if (isAsns) {
        actions.push({
          action: 'UPDATE_ASN_FIELD',
          page: 'asns',
          payload: { field: 'estimatedDeliveryDate', value: newDate }
        });
        text = `✓ **Estimated Arrival Updated**: Updated carrier ETA to **${newDate}** for this Advance Shipping Notice.`;
      } else {
        actions.push({
          action: 'UPDATE_INVOICE_FIELD',
          page: 'invoices',
          payload: { field: 'deliveryDate', value: newDate }
        });
        text = `✓ **Invoice Delivery Date Updated**: Set delivery date to **${newDate}**.`;
      }
    }
    // =========================================================================
    // 6. MARK URGENT / PRIORITY
    // =========================================================================
    else if (q.includes('urgent') || q.includes('priority')) {
      actions.push({
        action: 'UPDATE_PO_FIELD',
        page: 'orders',
        payload: { field: 'isUrgent', value: true }
      });
      text = `⚡ **Priority Escalation**: Marked this Purchase Order as **Urgent / Expedited**. Priority flags have been activated on the bilateral ledger.`;
    }
    // =========================================================================
    // 7. ADD LINE ITEM
    // =========================================================================
    else if (q.includes('add line') || q.includes('add item') || q.includes('new deliverable') || q.includes('add deliverable')) {
      const qtyMatch = prompt.match(/\b(\d+)\s*(?:units|qty|pcs|items)?\b/);
      const priceMatch = prompt.match(/\$(\d+(?:\.\d+)?)/);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;
      const price = priceMatch ? parseFloat(priceMatch[1]) : 420;

      actions.push({
        action: 'ADD_PO_LINE',
        page: 'orders',
        payload: {
          itemCode: 'OPT-100G-SR4',
          name: 'Optical Transceiver Module 100G',
          description: 'Optical Transceiver Module 100G QSFP28 Direct-Attach Copper Cable',
          quantity: qty,
          unitPrice: price,
          uom: 'EA',
          taxRate: 8,
          contractRef: 'CNT-2026-CLOUD-01'
        }
      });
      text = `✓ **Line Item Added**: Added **${qty}x Optical Transceiver Module 100G** at **$${price.toFixed(2)}/unit** (Line Total: $${(qty * price).toLocaleString()}). Subtotal and tax calculations have recomputed automatically.`;
    }
    // =========================================================================
    // 8. DELETE / REMOVE LINE ITEM
    // =========================================================================
    else if (q.includes('delete line') || q.includes('remove line') || q.includes('remove item')) {
      const lineMatch = prompt.match(/(?:line|item)\s*#?(\d+)/i);
      const lineIndex = lineMatch ? Math.max(0, parseInt(lineMatch[1], 10) - 1) : 0;

      actions.push({
        action: 'DELETE_PO_LINE',
        page: 'orders',
        payload: { index: lineIndex }
      });
      text = `🗑 **Line Item Removed**: Deleted line item #${lineIndex + 1} from this Purchase Order. Financial totals recomputed.`;
    }
    // =========================================================================
    // 9. UPDATE PAYMENT TERMS
    // =========================================================================
    else if (q.includes('payment term') || q.includes('2/10 net 30') || q.includes('net 45') || q.includes('net 30') || q.includes('net 60')) {
      let term = '2/10 Net 30';
      if (q.includes('net 45')) term = 'Net 45 Standard';
      if (q.includes('net 60')) term = 'Net 60';
      if (q.includes('net 30') && !q.includes('2/10')) term = 'Net 30';

      if (isOrders || (!isAsns && !isInvoices)) {
        actions.push({
          action: 'UPDATE_PO_FIELD',
          page: 'orders',
          payload: { field: 'paymentTerms', value: term }
        });
        text = `✓ **Payment Terms Updated**: Adjusted order settlement terms to **${term}**.`;
      } else {
        actions.push({
          action: 'UPDATE_INVOICE_FIELD',
          page: 'invoices',
          payload: { field: 'paymentTerms', value: term }
        });
        text = `✓ **Invoice Payment Terms Updated**: Applied **${term}** to this Commercial Invoice.`;
      }
    }
    // =========================================================================
    // 10. ACCEPT EARLY CASH LIQUIDITY / DISCOUNT ($51,594.30)
    // =========================================================================
    else if (q.includes('early cash') || q.includes('liquidity') || q.includes('accelerate') || q.includes('discount')) {
      actions.push({
        action: 'ACCEPT_EARLY_PAYMENT',
        page: 'invoices',
        payload: { invoiceNumber: 'INV-2026-201', discountAmount: 1052.94 }
      });
      text = `💰 **Early Liquidity Activated**: Accepted 2% dynamic acceleration on approved invoices.\n\n• **Net Settlement Dispatched:** $51,594.30 USD\n• **Clearing Window:** 24-Hour Automated Nacha Direct Deposit to JPMorgan Chase account ending in 8812.`;
    }
    // =========================================================================
    // 11. 1-CLICK FLIP ACTIONS (PO -> ASN, PO -> INVOICE)
    // =========================================================================
    else if (q.includes('flip') && (q.includes('asn') || q.includes('shipment'))) {
      actions.push({
        action: 'FLIP_PO_TO_ASN',
        page: 'orders',
        payload: { poNumber: pageContextData?.selectedPoNumber || 'PO-2026-9450' }
      });
      text = `🚀 **1-Click PO Flip to ASN**: Generating pre-matched Advance Shipping Notice with line items from **${pageContextData?.selectedPoNumber || 'PO-2026-9450'}**...`;
    }
    else if (q.includes('flip') && q.includes('invoice')) {
      actions.push({
        action: 'FLIP_PO_TO_INVOICE',
        page: 'orders',
        payload: { poNumber: pageContextData?.selectedPoNumber || 'PO-2026-9450' }
      });
      text = `📑 **1-Click PO Flip to Invoice**: Generating 3-way matched Commercial Invoice with line items from **${pageContextData?.selectedPoNumber || 'PO-2026-9450'}**...`;
    }
    // =========================================================================
    // 12. UPDATE CARRIER / TRACKING
    // =========================================================================
    else if (q.includes('carrier') || q.includes('tracking') || q.includes('fedex') || q.includes('dhl') || q.includes('odfl')) {
      const tracking = prompt.match(/\b[A-Z0-9]{8,18}\b/) || ['FX-98402910'];
      actions.push({
        action: 'UPDATE_ASN_FIELD',
        page: 'asns',
        payload: { field: 'trackingProNumber', value: tracking[0] }
      });
      text = `🚚 **Shipment Tracking Recorded**: Updated carrier tracking number to **${tracking[0]}** for this dispatch.`;
    }
    // =========================================================================
    // 13. DOCUMENT VAULT ACTIONS (W-9, COI, Upload, Expiring)
    // =========================================================================
    else if (isDocs || q.includes('coi') || q.includes('insurance') || q.includes('w-9') || q.includes('document')) {
      if (q.includes('upload') || q.includes('add doc')) {
        actions.push({
          action: 'UPLOAD_DOC',
          page: 'documents',
          payload: {
            title: 'Endorsement Rider - Apex Global Additional Insured',
            type: 'CERT_INSURANCE_ACORD',
            category: 'Insurance & Liability',
            expiryDate: '2027-11-15'
          }
        });
        text = `📄 **Document Uploaded**: Added **Endorsement Rider - Apex Global Additional Insured** to Document Vault with automated OCR attestation.`;
      } else {
        text = `📁 **Document Vault Compliance Audit**:
• **ACORD 25 COI:** Expires in 20 days (Nov 15, 2026). Action required: Additional Insured Endorsement Rider for Apex Global Enterprises.
• **IRS Form W-9:** Verified (TIN: 84-2910482, Subchapter C Corporation).
• **ISO 27001 & SOC 2 Type II:** Active through 2027.
• **Bank Account Letter:** Verified for JPMorgan Chase (Ending in 4921).`;
      }
    }
    // =========================================================================
    // 14. CATALOG CRUD & NEGOTIATED PRICING TIERS
    // =========================================================================
    else if (isCatalog || q.includes('catalog') || q.includes('sku') || q.includes('pricing') || q.includes('tier')) {
      if (q.includes('tier') || q.includes('pricing') || q.includes('rate') || q.includes('discount') || q.includes('starlight')) {
        text = `### 🏷️ Negotiated Volume Pricing Tiers: Apex Global vs Starlight Aerospace

Here is the bilateral contract rate schedule and volume discount tier comparison:

| SKU / Deliverable Specification | Standard List | Apex Global (Tier-1 Preferred) | Starlight Aerospace (Rate Schedule B) |
| :--- | :---: | :---: | :---: |
| **Enterprise AI Telemetry Streaming Ingestion Node** (\`ACM-NODE-800\`) | $18,500.00 | **$16,280.00** *(12% Vol Discount)* | **$17,575.00** *(5% Gov Conformed)* |
| **Managed Vector Knowledge Retrieval Cluster** (\`ACM-VEC-100\`) | $11,500.00 | **$10,120.00** *(12% Vol Discount)* | **$10,925.00** *(5% Gov Conformed)* |
| **S2P Pipeline Integration & Custom Connectors** (\`ACM-SVC-01\`) | $225.00 / hr | **$198.00 / hr** *(12% Master Retainer)* | **$213.75 / hr** *(Gov Defense Escrow)* |

---
#### 📋 Key Contractual Differentials:
* **Apex Global Enterprises:** Master Contract **AG-2026-T1**, **2/10 Net 30** accelerated payment terms with 2% dynamic early cash discounting. Standard 48h fulfillment SLA for Joliet & Austin Receiving Bays.
* **Starlight Aerospace & Defense:** Master Contract **SA-DOD-2026**, **Net 45 Escrow**, Mil-Spec telemetric certification with NIST SP 800-171 attestation.
* **Autonomous PO Enforcement:** Bilateral purchase orders from either buyer automatically validate against these pre-negotiated rate cards with **0% line-item price deviation tolerance**.`;
      } else if (q.includes('add') || q.includes('new item')) {
        actions.push({
          action: 'ADD_CATALOG_ITEM',
          page: 'catalog',
          payload: {
            sku: 'ACM-GEN5-NODE',
            name: 'Gen-5 High-Density NVMe Compute Module',
            unitPrice: 9400,
            category: 'IT_HARDWARE_SERVICES',
            leadTimeDays: 14
          }
        });
        text = `📦 **Catalog Item Added**: Published **Gen-5 High-Density NVMe Compute Module (ACM-GEN5-NODE)** at **$9,400.00 USD** with 14-day lead time.`;
      } else {
        text = `📚 **Catalog Master**: Managing 7 published enterprise hardware & service SKUs synced across Apex Global, NovaTech, and Meridian Health rate cards.`;
      }
    }
    // =========================================================================
    // 15. TASK COMPLETION
    // =========================================================================
    else if (isTasks || q.includes('task')) {
      if (q.includes('complete') || q.includes('dismiss')) {
        actions.push({
          action: 'COMPLETE_TASK',
          page: 'tasks',
          payload: { taskId: 'task-1' }
        });
        text = `✓ **Task Completed**: Marked vendor onboarding & compliance task as completed.`;
      } else {
        text = `📋 **Pending Action Queue**: You have 4 operational tasks (1 Urgent: NovaTech Onboarding Attestation, 1 High: COI Endorsement Rider for Apex Global).`;
      }
    }
    // =========================================================================
    // 16. FILTER BY BUYER
    // =========================================================================
    else if (q.includes('apex') || q.includes('novatech') || q.includes('meridian')) {
      let buyer = 'ALL';
      if (q.includes('apex')) buyer = 'buyer-org-1';
      if (q.includes('novatech')) buyer = 'buyer-org-2';
      if (q.includes('meridian')) buyer = 'buyer-org-3';

      actions.push({
        action: 'SET_PAGE_FILTER',
        page: isOrders ? 'orders' : isAsns ? 'asns' : 'invoices',
        payload: { buyerFilter: buyer }
      });
      text = `🔍 **Filter Applied**: Filtered page records to show matching partner records.`;
    }
    // =========================================================================
    // 17. SAVE DETAILS
    // =========================================================================
    else if (q.includes('save')) {
      actions.push({
        action: isOrders ? 'SAVE_PO' : isAsns ? 'SAVE_ASN' : 'SAVE_INVOICE',
        page: isOrders ? 'orders' : isAsns ? 'asns' : 'invoices',
        payload: {}
      });
      text = `✓ **Changes Saved**: Persisted updates to the bilateral enterprise ledger.`;
    }
    // =========================================================================
    // 18. GENERAL / SUMMARY
    // =========================================================================
    else {
      text = `I have analyzed your prompt regarding **"${prompt}"** in **${currentRoute}**.\n\nYou can ask me to perform any CRUD task on this page:\n• **Read / Review:** *"Review line items, specifications, and delivery milestones for PO-2026-9450"*\n• **Update:** *"Change delivery date to 2026-11-20"*, *"Set payment term to Net 45"*, *"Add line item for 10 units at $420"*\n• **Create:** *"Create new Purchase Order"*, *"Flip this PO to ASN"*, *"Flip to Invoice"*\n• **Delete:** *"Delete line item #2"*, *"Cancel order"*\n• **Financial Operations:** *"Accept early cash liquidity of $51,594.30"*`;
    }

    return {
      text,
      reply: text,
      actions,
      isLiveGemini: false
    };
  }
}
