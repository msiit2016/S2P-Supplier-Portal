/**
 * Verisource Enterprise Agentic Engine
 * ====================================
 * 
 * Mirrors the Python S2P Agent Network (agents.py) for real-time frontend synthesis.
 * Provides specialized page agents with dynamic context perception, real-time briefings,
 * and executable page action prompts.
 */

import {
  FileCheck2,
  AlertTriangle,
  Zap,
  Clock,
  Plus,
  Package,
  HelpCircle,
  Percent,
  TrendingUp,
  Filter,
  ShoppingCart,
  Receipt,
  Truck,
  ShieldCheck,
  DollarSign,
  FileText,
  Download,
  RefreshCw,
  Share2,
  CreditCard,
  Layers,
  Key,
  Edit3
} from 'lucide-react';

export interface AgenticPrompt {
  label: string;
  prompt: string;
  icon: any;
  action?: string;
  payload?: Record<string, any>;
}

export interface AgenticBriefing {
  agentName: string;
  role: string;
  route: string;
  pageContextName: string;
  contextMetric: string;
  greeting: string;
  suggestedPrompts: AgenticPrompt[];
  urgentBottleneck?: string;
  tools: Array<{ name: string; description: string }>;
  getResponse: (query: string, navigate: (route: string, state?: any) => void) => {
    reply: string;
    actionButtons?: Array<{ label: string; onClick?: () => void; route?: string }>;
    partialViews?: any[];
  };
}

// ==============================================================================
// 1. BUYER ONBOARDING AGENT (/onboarding)
// ==============================================================================
function synthesizeOnboardingAgent(context: Record<string, any> = {}): AgenticBriefing {
  const total = context.totalRequests ?? 3;
  const pending = context.pendingCount ?? 1;
  const inProgress = context.inProgressCount ?? 1;
  const underReview = context.underReviewCount ?? 1;

  const bottleneck = pending > 0
    ? `${pending} Action Required: NovaTech Aerospace ITAR attestation pending start (Due in 10 days).`
    : `All ${total} buyer onboarding requests in progress or conformed.`;

  const greeting = `Hi! I'm **Ava**.

Here is your live buyer onboarding pipeline:
• **Total Active Requests:** ${total} enterprise buyers
• **Action Required:** ${pending} pending start (NovaTech Aerospace • ITAR Defense Attestation)
• **In Progress:** ${inProgress} in drafting (Apex Global • 67% completed)
• **Under Review:** ${underReview} submitted (Meridian Health • In Adjudication)

**Priority Focus:** ${bottleneck}

How can I assist with your buyer onboarding today?`;

  const prompts: AgenticPrompt[] = [
    {
      label: 'Which requests require action?',
      prompt: 'Which buyer onboarding requests require immediate action or attestation?',
      icon: AlertTriangle
    },
    {
      label: 'Open NovaTech Attestation',
      prompt: 'What compliance items are needed for NovaTech Aerospace onboarding?',
      icon: ShieldCheck,
      action: 'START_BUYER_DOSSIER',
      payload: { buyerOrgId: 'buyer-org-2' }
    },
    {
      label: 'Check Meridian Review SLA',
      prompt: 'What is the current status and review SLA for Meridian Health Network?',
      icon: Clock
    },
    {
      label: 'Enter Invitation Code',
      prompt: 'How do I enter and redeem a new buyer invitation code?',
      icon: Plus,
      action: 'OPEN_INVITE_MODAL',
      payload: {}
    }
  ];

  return {
    agentName: 'OnboardingQualificationAgent',
    role: 'Buyer Onboarding & Compliance Agent',
    route: '/onboarding',
    pageContextName: 'Buyer Onboarding',
    contextMetric: `${pending} Action Needed • ${total} Requests`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'OPEN_INVITE_MODAL', description: 'Open modal to enter a new buyer invitation code.' },
      { name: 'FILTER_ONBOARDING_STATUS', description: 'Filter onboarding requests by status.' },
      { name: 'START_BUYER_DOSSIER', description: 'Navigate directly to a buyer onboarding questionnaire.' },
      { name: 'AUTO_FILL_QUESTIONNAIRE', description: 'Auto-populate questionnaire with Master Profile records.' }
    ],
    getResponse: (q, nav) => {
      const lower = q.toLowerCase();
      if (lower.includes('novatech') || lower.includes('itar') || lower.includes('mil-spec')) {
        return {
          reply: `**NovaTech Aerospace & Defense Compliance Requirements:**\n• **Invitation Code:** \`INV-NOVATECH-8820\`\n• **Program:** Defense Avionics & High-Tolerance Telemetry\n• **Current Progress:** 15% (Stage 1: Registration Completed)\n• **Mandatory Compliance Items:**\n  1. **ITAR Registration:** DDTC Export Control attestation & defense clearance certification\n  2. **NIST SP 800-171:** Cybersecurity self-assessment score (SPRS)\n  3. **Mil-Spec Quality:** AS9100D or ISO 9001 certified QA manual\n  4. **FedACH Remittance:** Dedicated US defense wire escrow account (Silicon Valley Bank ••••1109)\n\nMaster Profile data is 94% pre-populated and ready for your final attestation.`,
          actionButtons: [
            { label: 'Start NovaTech Onboarding ↗', onClick: () => nav('/onboarding/detail', { buyerOrgId: 'buyer-org-2', autoCopilot: true }) }
          ]
        };
      }
      if (lower.includes('apex') || lower.includes('auto-fill') || lower.includes('w-9')) {
        return {
          reply: `**Apex Global Enterprises Onboarding Packet (67% Completed):**\n• **Remaining Requirements:** Final review of W-9 and FedACH direct deposit authorization.\n• **Master Profile Pre-Fill:** 100% of legal, tax, and banking credentials have been verified and conformed to Apex AP Shared Services requirements.\n\nYou can submit this application touchlessly with one click.`,
          actionButtons: [
            { label: 'Resume Apex Application ↗', onClick: () => nav('/onboarding/detail', { buyerOrgId: 'buyer-org-1' }) }
          ]
        };
      }
      if (lower.includes('meridian') || lower.includes('sla') || lower.includes('review')) {
        return {
          reply: `**Meridian Health Network Submission Status:**\n• **Stage:** Stage 3 of 5: Buyer Review & Adjudication\n• **Submitted Date:** Nov 04, 2026\n• **Current SLA:** Meridian AP operates on a 5-business-day review cycle. Expected adjudication completion: **Nov 11, 2026**.\n• **Status:** No defects or deficiencies flagged.`,
          actionButtons: [
            { label: 'View Submission Details ↗', onClick: () => nav('/onboarding/detail', { buyerOrgId: 'buyer-org-3' }) }
          ]
        };
      }
      return {
        reply: `I am monitoring all ${total} buyer onboarding requests across NovaTech, Apex Global, and Meridian Health. Let me know which compliance dossier or invitation code you would like to work on.`
      };
    }
  };
}

// ==============================================================================
// 1B. DETAILED ONBOARDING QUESTIONNAIRE AGENT (/onboarding/detail)
// ==============================================================================
function synthesizeOnboardingDetailAgent(context: Record<string, any> = {}): AgenticBriefing {
  const buyer = context.buyerName || 'Apex Global Enterprises';
  const code = context.invitationCode || 'INV-APEX-2026';
  const progress = context.progressPercent ?? 89;
  const completed = context.completedStepsCount ?? 8;
  const activeStep = context.activeStep ?? 1;

  // Real page values from live context
  const legalName = context.legalName || 'Acme Industrial Tech Inc.';
  const tradeName = context.tradeName || 'Acme Tech Solutions';
  const formerlyKnownAs = context.formerlyKnownAs || 'Acme Hardware & Sensors';
  const dunsNumber = context.dunsNumber || '09-842-1928';
  const partnerStatus = context.partnerStatus || 'INVITED';
  const supplierManager = context.supplierManager || 'Sarah Jenkins (Senior Category Manager - Cloud & IT)';
  const annualRevenue = context.annualRevenue || '38.4';
  const reportingCurrency = context.reportingCurrency || 'USD ($) - US Dollar';
  const registeredAddress = context.registeredAddress || '100 Industrial Parkway, Suite 400, Austin, TX 78701';
  const website = context.website || 'https://acmeindustrialtech.example.com';
  const subcategories: string[] = context.subcategories || [
    '41111900 - Industrial Sensors & Transducers',
    '43222600 - Network and Telemetry Equipment',
    '43232800 - Embedded System Software / Firmware'
  ];

  const stepNames: Record<number, string> = {
    1: 'Basic Details',
    2: 'Business Information',
    3: 'Identification Information',
    4: 'Contact Information',
    5: 'Location Architecture',
    6: 'Banking Information',
    7: 'Payment Terms & Commercial Settings',
    8: 'Diversity & Certificates',
    9: 'Review & Final Submit'
  };
  const activeStepName = stepNames[activeStep] || 'Basic Details';

  const bottleneck = context.isSubmitted
    ? 'Application submitted to buyer procurement review committee.'
    : `Stage ${activeStep} of 9: ${9 - completed} sections remaining before final submission.`;

  const greeting = `Hi! I'm **Ava**.

I am actively assisting with your **${buyer}** vendor onboarding questionnaire:
• **Invitation Code:** \`${code}\`
• **Progress:** ${progress}% (${completed} of 9 sections finalized)
• **Current Section:** Step ${activeStep}: ${activeStepName}
• **Corporate Legal Entity:** \`${legalName}\` (DBA: \`${tradeName}\`)
• **D&B DUNS:** \`${dunsNumber}\` (Verified • 99.9% Confidence)

You can ask me to retrieve any page details, update form fields in real time, or run OCR on tax certificates. How can I assist you?`;

  const prompts: AgenticPrompt[] = [
    {
      label: 'Review Basic Details',
      prompt: 'Show and review active basic details for this dossier',
      icon: FileCheck2
    },
    {
      label: 'Update Doing Business As',
      prompt: 'Update Doing Business As to Acme Advanced Sensors',
      icon: Edit3
    },
    {
      label: 'Upload W-9 / Tax Cert for OCR',
      prompt: 'Upload a tax certificate',
      icon: Zap
    },
    {
      label: 'Auto-fill from Master Profile',
      prompt: 'Sync and pre-fill my onboarding questionnaire from Master Profile',
      icon: RefreshCw,
      action: 'AUTO_FILL_QUESTIONNAIRE'
    }
  ];

  return {
    agentName: 'OnboardingAttestationCopilot',
    role: 'Onboarding Agent',
    route: '/onboarding/detail',
    pageContextName: `${buyer} Onboarding`,
    contextMetric: `${progress}% • Step ${activeStep}/9`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'UPDATE_ONBOARDING_FIELD', description: 'Update fields directly on active questionnaire page.' },
      { name: 'SET_ONBOARDING_STEP', description: 'Navigate to a specific section of the questionnaire.' },
      { name: 'SYNC_MASTER_PROFILE', description: 'Auto-fill form using verified Master Profile golden records.' },
      { name: 'PARSE_DOCUMENT_OCR', description: 'OCR extraction of W-9, tax certs, or business filings.' }
    ],
    getResponse: (query: string, navigate?: (path: string, state?: any) => void) => {
      const q = query.toLowerCase();

      // =========================================================================
      // 1. UPDATE FIELD VIA NATURAL LANGUAGE (REVIEW DIFF / PROPOSED CHANGES)
      // =========================================================================
      if (
        (q.includes('update') || q.includes('change') || q.includes('set') || q.includes('edit')) &&
        (q.includes('dba') || q.includes('doing business as') || q.includes('trade name') || q.includes('duns') || q.includes('supplier manager') || q.includes('legal name') || q.includes('formerly known') || q.includes('revenue') || q.includes('website'))
      ) {
        let fieldLabel = 'Doing Business As';
        let fieldName = 'tradeName';
        let currentVal = tradeName;
        let proposedVal = 'Acme Advanced Sensors';
        const actionPayload: Record<string, any> = {};

        if (q.includes('duns')) {
          fieldLabel = 'D&B DUNS Number';
          fieldName = 'dunsNumber';
          currentVal = dunsNumber;
          const match = query.match(/\b\d{2}-\d{3}-\d{4}\b/);
          proposedVal = match ? match[0] : '12-345-6789';
          actionPayload.dunsNumber = proposedVal;
          actionPayload.hasDuns = true;
        } else if (q.includes('supplier manager')) {
          fieldLabel = 'Supplier Manager Name';
          fieldName = 'supplierManager';
          currentVal = supplierManager;
          proposedVal = query.replace(/.*(?:to|as)\s+/i, '').trim() || 'Marcus Vance (VP Strategic Procurement)';
          actionPayload.supplierManager = proposedVal;
        } else if (q.includes('legal name')) {
          fieldLabel = 'Legal Company Name';
          fieldName = 'legalName';
          currentVal = legalName;
          proposedVal = query.replace(/.*(?:to|as)\s+/i, '').trim() || 'Acme Global Industrial Technologies Inc.';
          actionPayload.legalName = proposedVal;
        } else if (q.includes('formerly known')) {
          fieldLabel = 'Formally Known As';
          fieldName = 'formerlyKnownAs';
          currentVal = formerlyKnownAs;
          proposedVal = query.replace(/.*(?:to|as)\s+/i, '').trim() || 'Acme Precision Hardware LLC';
          actionPayload.formerlyKnownAs = proposedVal;
        } else if (q.includes('revenue')) {
          fieldLabel = 'Annual Revenue ($M)';
          fieldName = 'annualRevenue';
          currentVal = annualRevenue;
          const numMatch = query.match(/\b\d+(?:\.\d+)?\b/);
          proposedVal = numMatch ? numMatch[0] : '45.2';
          actionPayload.annualRevenue = proposedVal;
        } else if (q.includes('website')) {
          fieldLabel = 'Corporate Website';
          fieldName = 'website';
          currentVal = website;
          const urlMatch = query.match(/https?:\/\/[^\s]+/i);
          proposedVal = urlMatch ? urlMatch[0] : 'https://acme-advanced-sensors.com';
          actionPayload.website = proposedVal;
        } else {
          // Default: Doing Business As / DBA
          fieldLabel = 'Doing Business As';
          fieldName = 'tradeName';
          currentVal = tradeName;
          const match = query.match(/(?:to|as)\s+["']?([^"']+)["']?/i);
          proposedVal = match ? match[1].trim() : 'Acme Advanced Sensors';
          actionPayload.tradeName = proposedVal;
        }

        return {
          reply: `I have prepared a **Review Version** for **${buyer}** with your requested change. Please review the proposed update below and click **Confirm & Apply to Page** to commit it directly to the page form:`,
          partialViews: [
            {
              type: 'REVIEW_DIFF',
              title: `Review Proposed Changes • ${buyer}`,
              summary: `Proposed update to Step ${activeStep} (${activeStepName}) on active onboarding questionnaire.`,
              pageContext: `${buyer} • ${activeStepName}`,
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
          ]
        };
      }

      // =========================================================================
      // 2. OCR EXTRACTION (W-9, TAX CERTIFICATE, REGISTRATION DOCUMENT)
      // =========================================================================
      if (
        q.includes('tax') ||
        q.includes('upload') ||
        q.includes('ocr') ||
        q.includes('w-9') ||
        q.includes('w9') ||
        q.includes('certificate')
      ) {
        return {
          reply: `Extracted verification credentials from **IRS Form W-9 / Taxpayer Identification** with **99.8% OCR confidence**.\n\nThe extracted corporate legal name and tax IDs match your corporate registration on record. Click **Apply to Page** below to populate the active questionnaire:`,
          partialViews: [
            {
              type: 'OCR_EXTRACTION',
              fileName: 'IRS_Form_W9_Signed_2026.pdf',
              fileSize: '1.4 MB',
              documentType: 'IRS Form W-9 / Taxpayer Identification',
              confidence: 0.998,
              extractedEntities: [
                { field: 'Legal Corporate Name', value: legalName, targetFieldKey: 'legalName' },
                { field: 'Federal Tax ID (EIN)', value: '84-1294812', targetFieldKey: 'ein' },
                { field: 'D&B DUNS Number', value: dunsNumber, targetFieldKey: 'dunsNumber' },
                { field: 'Registered Address', value: registeredAddress, targetFieldKey: 'registeredAddress' },
                { field: 'Tax Classification', value: 'Corporation (C-Corp)', targetFieldKey: 'taxClass' }
              ],
              actionPayload: {
                action: 'UPDATE_ONBOARDING_FIELD',
                page: 'onboarding',
                payload: {
                  legalName,
                  dunsNumber,
                  registeredAddress
                }
              }
            }
          ]
        };
      }

      // =========================================================================
      // 3. REVIEW BASIC DETAILS / REQUIRED FIELDS / INTERACTIVE MINI-FORM
      // =========================================================================
      if (
        q.includes('basic') ||
        q.includes('detail') ||
        q.includes('missing') ||
        q.includes('require') ||
        q.includes('form')
      ) {
        return {
          reply: `Here are the active **Basic Details** for **${buyer}** (Stage ${activeStep} of 9):\n\n• **Legal Company Name:** \`${legalName}\`\n• **Doing Business As:** \`${tradeName}\`\n• **Formally Known As:** \`${formerlyKnownAs}\`\n• **D&B DUNS Number:** \`${dunsNumber}\` (Verified • 99.9% Confidence)\n• **Partner Status:** \`${partnerStatus}\`\n• **Supplier Manager:** ${supplierManager}\n\nYou can edit any field below using the interactive form and click **Update** to update the page UI in real time:`,
          partialViews: [
            {
              type: 'FORM_CARD',
              title: `Basic Details • ${buyer}`,
              description: `Live form fields for Step 1: Basic Details (${code})`,
              targetContext: 'ONBOARDING_BASIC_DETAILS',
              fields: [
                { id: 'tradeName', label: 'DOING BUSINESS AS (DBA)', type: 'text', placeholder: 'e.g. Acme Tech Solutions', required: true, value: tradeName },
                { id: 'formerlyKnownAs', label: 'FORMERLY KNOWN AS', type: 'text', placeholder: 'e.g. Acme Hardware & Sensors', required: false, value: formerlyKnownAs },
                { id: 'dunsNumber', label: 'D&B DUNS NUMBER', type: 'text', placeholder: 'e.g. 09-842-1928', required: true, value: dunsNumber },
                { id: 'supplierManager', label: 'SUPPLIER MANAGER', type: 'text', placeholder: 'e.g. Sarah Jenkins', required: true, value: supplierManager }
              ],
              submitLabel: 'Update',
              actionPayload: {
                action: 'UPDATE_ONBOARDING_FIELD',
                page: 'onboarding',
                payload: { stage: 1, buyerOrgId: context.buyerOrgId }
              }
            }
          ]
        };
      }

      // =========================================================================
      // 3B. UPLOAD TAX CERTIFICATE / W-9 / OCR SCANNER BANNER
      // =========================================================================
      if (q.includes('upload') || q.includes('tax certificate') || q.includes('w-9') || q.includes('w9') || q.includes('ocr')) {
        return {
          reply: `Please upload your **W-9, Tax Certificate, or sheet** below for automated AI Vision OCR layout analysis and page field extraction:`,
          partialViews: [
            {
              type: 'UPLOAD_BANNER',
              title: 'Upload Document for AI Vision OCR',
              description: 'Upload W-9, Tax Cert, or invoice to extract & populate page fields',
              targetPage: '/onboarding/detail',
              pageContext: context
            }
          ]
        };
      }

      // =========================================================================
      // 4. RETRIEVE PAGE INFORMATION (DUNS, CONTACTS, BANKING, CERTS, PROGRESS)
      // =========================================================================
      if (q.includes('duns') || q.includes('tax id') || q.includes('ein')) {
        return {
          reply: `**Corporate Tax & Identity Records for ${buyer}:**\n• **D&B DUNS Number:** \`${dunsNumber}\` (D&B Universal Identity Extract, OCR Confidence: 99.9%)\n• **Federal Tax ID (EIN):** \`84-1294812\` (IRS Form W-9 Verified)\n• **EU VAT Number:** \`DE319482910\`\n• **UK VAT Number:** \`GB924810291\`\n\nAll tax credentials are verified and locked to your corporate master golden record.`
        };
      }

      if (q.includes('supplier manager') || q.includes('manager')) {
        return {
          reply: `Your assigned supplier manager for **${buyer}** is **${supplierManager}**.`
        };
      }

      if (q.includes('contact') || q.includes('who is registered') || q.includes('directory')) {
        return {
          reply: `**Registered Contacts for ${buyer}:**\n1. **Elena Rostova:** VP Corporate Treasury & AP (\`elena@acmeindustrial.com\` • Primary Contact)\n2. **Marcus Vance:** Director of Global Supply Chain (\`m.vance@acmeindustrial.com\` • Operations)\n3. **Sarah Chen:** General Counsel & Corporate Secretary (\`schen@acmeindustrial.com\` • Legal)\n4. **David Miller:** Head of ESG & Regulatory Compliance (\`dmiller@acmeindustrial.com\` • Compliance)`
        };
      }

      if (q.includes('bank') || q.includes('remit') || q.includes('ach') || q.includes('wire')) {
        return {
          reply: `**Settlement & Banking Information for ${buyer}:**\n• **Bank Name:** JPMorgan Chase Bank, N.A. (Austin Commercial Banking Center)\n• **Routing Number:** \`021000021\`\n• **Account Number:** \`••••••••48210\` (Direct ACH Credit)\n• **Verification:** Remittance Verification Letter on file (Verified with 100% match)`
        };
      }

      if (q.includes('cert') || q.includes('insurance') || q.includes('coi') || q.includes('iso')) {
        return {
          reply: `**Active Compliance Certificates for ${buyer}:**\n• **ACORD 25 COI ($5M Liability):** Travelers Commercial Casualty — Active through Dec 31, 2026\n• **ISO/IEC 27001:** BSI Assurance UK — Active through Jun 14, 2028\n• **SOC 2 Type II:** Ernst & Young LLP — Active through Oct 31, 2026\n• **WBENC WBE:** Women-Owned Business Enterprise — Active through Feb 28, 2027`
        };
      }

      if (q.includes('progress') || q.includes('status') || q.includes('how far') || q.includes('completion')) {
        return {
          reply: `**Onboarding Progress for ${buyer}:**\n• **Completion Rate:** ${progress}% (${completed} of 9 sections finalized)\n• **Active Section:** Step ${activeStep}: ${activeStepName}\n• **Status:** ${bottleneck}`
        };
      }

      // =========================================================================
      // 5. MASTER PROFILE SYNC & PRE-FILL
      // =========================================================================
      if (q.includes('sync') || q.includes('master profile') || q.includes('auto-fill')) {
        return {
          reply: `I have initiated synchronization with your verified **Master Profile golden record**. 18 corporate identity, tax, location, and banking fields are being populated into the **${buyer}** dossier with zero manual re-entry.`,
          actionButtons: [
            { label: 'View Synced Sections', route: '/onboarding/detail' }
          ]
        };
      }

      // =========================================================================
      // 6. SECTION STEP NAVIGATION
      // =========================================================================
      if (q.includes('business info') || q.includes('step 2')) {
        return {
          reply: `Navigating to **Step 2: Business Information** for **${buyer}**...`,
          actionButtons: [
            { label: 'Open Step 2: Business Info', onClick: () => navigate && navigate('/onboarding/detail', { activeStep: 2 }) }
          ]
        };
      }

      return {
        reply: `I am actively monitoring the **${buyer}** questionnaire (${progress}% complete • Step ${activeStep}: ${activeStepName}).\n\nYou can ask me to:\n• **Review or edit Basic Details**\n• **Update Doing Business As or DUNS Number**\n• **Check registered contacts, bank accounts, or compliance certificates**\n• **Upload and extract W-9 / tax documents**`
      };
    }
  };
}

// ==============================================================================
// 2. CATALOG & PRICING AGENT (/catalog)
// ==============================================================================
function synthesizeCatalogAgent(context: Record<string, any> = {}): AgenticBriefing {
  const total = context.totalItems ?? 5;
  const categories = context.categoriesCount ?? 2;
  const minPrice = context.minPrice ?? '$225';
  const maxPrice = context.maxPrice ?? '$18,500';
  const inquiries = context.pricingInquiriesCount ?? 1;

  const bottleneck = inquiries > 0
    ? `${inquiries} Pricing Inquiry pending review from Apex Global for ACM-NODE-800.`
    : `All catalog rates conformed to buyer ERP schedules with 0% variance.`;

  const greeting = `Hi! I'm **Ava**.

Here is your live SKU catalog and contract rate schedule:
• **Active Catalog:** ${total} standard item codes across ${categories} taxonomies
• **Contract Rate Span:** ${minPrice} – ${maxPrice} USD (Avg $7,973/contracted unit)
• **Active Tier:** Tier-1 Enterprise Preferred (12% Master Volume Discount)
• **ERP Conformance:** Conformed to Apex Global and NovaTech ERP rate cards

**Immediate Attention:** ${bottleneck}

How can I help you manage your catalog today?`;

  const prompts: AgenticPrompt[] = [
    {
      label: 'Resolve Pricing Inquiry',
      prompt: 'Show me the pending pricing inquiry for ACM-NODE-800 from Apex Global.',
      icon: HelpCircle,
      action: 'OPEN_PRICING_INQUIRY',
      payload: { inquiryId: 'inq-1' }
    },
    {
      label: 'Add New SKU Item',
      prompt: 'Open modal to add a new SKU item code to the catalog.',
      icon: Plus,
      action: 'OPEN_ADD_SKU_MODAL',
      payload: {}
    },
    {
      label: 'Review Volume Discount Tiers',
      prompt: 'Show me the contracted volume discount tiers for enterprise buyers.',
      icon: Percent,
      action: 'SIMULATE_VOLUME_DISCOUNT',
      payload: { sku: 'ACM-NODE-800', qty: 10 }
    },
    {
      label: 'Check Delivery Lead-Time SLAs',
      prompt: 'What are our committed fulfillment lead times for Bay 14 intake?',
      icon: Clock
    }
  ];

  return {
    agentName: 'CatalogPricingAgent',
    role: 'Catalog & Pricing Agent',
    route: '/catalog',
    pageContextName: 'Catalog & Pricing',
    contextMetric: `${total} Live SKUs • ${inquiries} Inquiry`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'OPEN_ADD_SKU_MODAL', description: 'Open modal to register a new SKU item code.' },
      { name: 'FILTER_CATEGORY', description: 'Filter catalog list by UNSPSC classification.' },
      { name: 'SIMULATE_VOLUME_DISCOUNT', description: 'Calculate tiered volume pricing.' },
      { name: 'OPEN_PRICING_INQUIRY', description: 'View and respond to pending buyer pricing inquiries.' }
    ],
    getResponse: (q) => {
      const lower = q.toLowerCase();
      if (lower.includes('inquiry') || lower.includes('acm-node-800') || lower.includes('pricing inquiry')) {
        return {
          reply: `**Pending Pricing Inquiry on ACM-NODE-800:**\n• **Buyer:** Apex Global Enterprises (Sarah Chen, VP Procurement)\n• **Current Unit Price:** $18,500.00 USD\n• **Inquiry:** Apex is requesting a 50-node volume quote for Q1 2027 datacenter expansion.\n• **Contracted Tier:** Tier-1 Enterprise Preferred yields a **12% discount** ($16,280.00/unit), totaling **$814,000.00 USD**.`
        };
      }
      if (lower.includes('discount') || lower.includes('volume') || lower.includes('tier')) {
        return {
          reply: `**Contracted Enterprise Volume Discount Schedules:**\n• **1 – 4 Units:** Standard Contracted Base Price\n• **5 – 19 Units:** Tier-1 Enterprise Preferred (**12% Discount**)\n• **20 – 49 Units:** Tier-2 Strategic Volume (**16% Discount**)\n• **50+ Units:** Custom Master Rate Agreement (**18.5% Discount**)\n\nAll pricing is automatically synchronized to connected buyer ERP systems.`
        };
      }
      if (lower.includes('lead time') || lower.includes('sla') || lower.includes('delivery')) {
        return {
          reply: `**Fulfillment Lead-Time Commitments:**\n• **Standard Edge Hardware (ACM-SENSOR-40, ACM-EDGE-200):** 48–72h dispatch commitment\n• **Compute Clusters (ACM-NODE-800, ACM-VEC-100):** 7–10 days with factory telemetry burn-in\n• **Dock Intake:** Pre-registered ASN with carrier gate pass enables immediate intake at Bay 14.`
        };
      }
      return {
        reply: `Your catalog contains ${total} active item codes across IT Hardware and Professional Services. I can help add new SKUs, verify contract price schedules, or review buyer inquiries.`
      };
    }
  };
}

// ==============================================================================
// 3. PURCHASE ORDERS AGENT (/orders)
// ==============================================================================
function synthesizeOrdersAgent(context: Record<string, any> = {}): AgenticBriefing {
  const count = context.orders?.length ?? context.ordersCount ?? 6;
  const pipeline = context.subtotal 
    ? `$${Number(context.grossTotal || context.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    : (context.totalPipeline ?? '$384,660.00 USD');
  const inTransit = context.inTransitCount ?? 2;

  const bottleneck = context.selectedPoNumber
    ? `Inspecting order ${context.selectedPoNumber} (${context.selectedPoName || ''}).`
    : "PO-2026-9450 ($79,920.00 from Apex Global) is awaiting your order review and counter-signature.";

  const isDetail = Boolean(context.selectedPoNumber);

  const greeting = isDetail
    ? `Hi! I'm **Ava**.

Viewing purchase order **${context.selectedPoNumber}** (${context.selectedPoName || context.header?.poName || 'Order Details'}):
• **Buyer Client:** ${context.header?.companyName || 'Enterprise Buyer'}
• **Total Value:** ${context.header?.totalAmount || '$45,360.00 USD'}
• **Status:** ${context.header?.status || 'Active'}
• **Promised Delivery:** ${context.header?.deliveryDate || '11-12-2026'}

How can I assist with this purchase order?`
    : `Hi! I'm **Ava**.

Here is your live purchase order pipeline:
• **Total Pipeline Value:** ${pipeline} across ${count} orders
• **Action Required:** 1 order awaiting review (Apex Global • $79,920.00)
• **In Fulfillment:** ${inTransit} orders dispatched to buyer receiving bays
• **Matching SLA:** 100% catalog contract alignment with zero line-item variance

**Action Item:** ${bottleneck}

How can I assist with your purchase orders today?`;

  const prompts: AgenticPrompt[] = isDetail
    ? [
        {
          label: 'Review Line Items & Milestones',
          prompt: `Inspect order ${context.selectedPoNumber} line items, specifications, and deliverable milestones.`,
          icon: ShoppingCart
        },
        {
          label: '1-Click PO to Invoice Flip',
          prompt: `Flip purchase order ${context.selectedPoNumber} into a verified commercial invoice.`,
          icon: Receipt,
          action: 'FLIP_PO_TO_INVOICE',
          payload: { poNumber: context.selectedPoNumber }
        },
        {
          label: 'Create Advance Shipping Notice',
          prompt: `Generate an Advance Shipping Notice (ASN) for ${context.selectedPoNumber}.`,
          icon: Truck,
          action: 'FLIP_PO_TO_ASN',
          payload: { poNumber: context.selectedPoNumber }
        },
        {
          label: 'Back to Orders Directory',
          prompt: 'Return to purchase orders list.',
          icon: Filter,
          action: 'CLOSE_PO_DETAIL'
        }
      ]
    : [
        {
          label: 'Which orders need review?',
          prompt: 'Which purchase orders are pending supplier review or counter-signature?',
          icon: AlertTriangle
        },
        {
          label: 'Open PO-2026-9450 Details',
          prompt: 'Review specifications and acknowledge Apex Global PO-2026-9450 ($79,920.00).',
          icon: FileCheck2,
          action: 'VIEW_PO',
          payload: { poNumber: 'PO-2026-9450' }
        },
        {
          label: 'Show Orders in Transit',
          prompt: 'Which purchase orders are currently dispatched and in transit?',
          icon: Truck
        },
        {
          label: 'Filter to Apex Global',
          prompt: 'Filter table to Apex Global Enterprises purchase orders.',
          icon: Filter,
          action: 'FILTER_PO_BUYER',
          payload: { buyerOrgId: 'buyer-org-1' }
        }
      ];

  return {
    agentName: 'OrderFulfillmentAgent',
    role: 'Purchase Orders & Fulfillment Agent',
    route: '/orders',
    pageContextName: 'Purchase Orders',
    contextMetric: `${count} Orders • ${pipeline}`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'ACKNOWLEDGE_PO', description: 'Acknowledge and counter-sign an issued Purchase Order.' },
      { name: 'FLIP_PO_TO_INVOICE', description: 'Generate a verified 3-way match invoice from a PO.' },
      { name: 'FLIP_PO_TO_ASN', description: 'Generate an Advance Shipping Notice from PO lines.' },
      { name: 'FILTER_PO_BUYER', description: 'Filter purchase orders by buyer organization.' }
    ],
    getResponse: (q) => {
      const lower = q.toLowerCase();
      if (lower.includes('payment terms') || lower.includes('change terms') || lower.includes('net 45') || lower.includes('update po')) {
        return {
          reply: `I've prepared a Review Version for **PO-2026-9450** based on your request. Please review the proposed changes below before committing to the bilateral ERP ledger:`,
          partialViews: [
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
                payload: { field: 'paymentTerms', value: 'Net 45 Standard' }
              }
            }
          ]
        };
      }
      if (lower.includes('po-2026-9450') || lower.includes('acknowledge') || lower.includes('apex')) {
        return {
          reply: `**PO-2026-9450 Review (Apex Global Enterprises):**\n• **Amount:** $79,920.00 USD (Net 30, 2/10 Early Pay)\n• **Line 1:** 8x Enterprise Compute Node 64GB ($65,600.00)\n• **Line 2:** 1x Platinum Hardware SLA Maintenance ($8,400.00)\n• **Tax:** 8% ($5,920.00)\n• **Destination:** Apex Bay 14 Receiving Dock, Austin, TX\n• **Milestone:** Delivery promised by Nov 25, 2026.\n\nAll pricing matches catalog contract schedules with zero variance.`
        };
      }
      return {
        reply: `You have ${count} orders totaling ${pipeline}. I can help acknowledge issued orders, create ASNs, or flip delivered orders to matched invoices.`
      };
    }
  };
}

// ==============================================================================
// 4. SHIPMENTS & ASNS AGENT (/asns, /shipments)
// ==============================================================================
function synthesizeShipmentsAgent(context: Record<string, any> = {}): AgenticBriefing {
  const count = context.asns?.length ?? 3;
  const carrier = context.carrier || 'FedEx Freight Priority';
  const proNumber = context.trackingNumber || 'FX-90218820';

  const bottleneck = `ASN-2026-8801 in transit via ${carrier} (PRO: ${proNumber}) to Apex Bay 14 (Gate PIN: 9021).`;

  const greeting = `Hi! I'm **Ava**, your **Logistics & Shipments Agent**.

Here is your live delivery operations status:
• **Active ASNs:** ${count} shipments across freight carriers
• **In Transit:** 2 ASNs dispatched and en route
• **Delivered & Cleared:** 1 ASN confirmed at Meridian Dock B
• **Dock Appointments:** Bay 14 intake active with pre-cleared gate PIN

**Logistics Status:** ${bottleneck}

How can I assist with your shipping operations today?`;

  const prompts: AgenticPrompt[] = [
    {
      label: 'Track FedEx Freight PRO FX-9021',
      prompt: `Check delivery milestone status for FedEx Freight PRO ${proNumber}.`,
      icon: Truck,
      action: 'TRACK_CARRIER',
      payload: { proNumber }
    },
    {
      label: 'Generate ASN for Staged Batch',
      prompt: 'Create Advance Shipping Notice for staged NovaTech hardware.',
      icon: Plus,
      action: 'CREATE_ASN',
      payload: { poNumber: 'PO-2026-9520' }
    },
    {
      label: 'View Bay 14 Gate Appointment Pass',
      prompt: 'Retrieve gate intake PIN and dock pass for Bay 14 Austin facility.',
      icon: Key,
      action: 'OPEN_DOCK_GATE_PASS',
      payload: { asnNumber: 'ASN-2026-8801' }
    }
  ];

  return {
    agentName: 'LogisticsAsnAgent',
    role: 'Logistics & Shipments Agent',
    route: '/asns',
    pageContextName: 'Shipments & ASNs',
    contextMetric: `${count} Active ASNs • In Transit`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'CREATE_ASN', description: 'Generate a new Advance Shipping Notice.' },
      { name: 'TRACK_CARRIER', description: 'Query carrier tracking status for a PRO number.' },
      { name: 'OPEN_DOCK_GATE_PASS', description: 'View dock intake appointment gate PIN.' }
    ],
    getResponse: (q) => {
      const lower = q.toLowerCase();
      if (lower.includes('tracking') || lower.includes('carrier') || lower.includes('update') || lower.includes('pro')) {
        return {
          reply: `I've prepared a Review Version to update the logistics tracking details for **ASN-2026-8801**:`,
          partialViews: [
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
                payload: { trackingProNumber: 'FX-948210385', carrierName: 'FedEx Freight Priority' }
              }
            }
          ]
        };
      }
      return {
        reply: `Tracking ${count} active freight shipments. ${carrier} PRO ${proNumber} is on schedule for Bay 14 arrival tomorrow.`
      };
    }
  };
}

// ==============================================================================
// 5. INVOICES & SETTLEMENT AGENT (/invoices)
// ==============================================================================
function synthesizeInvoicesAgent(context: Record<string, any> = {}): AgenticBriefing {
  const count = context.invoices?.length ?? 4;
  const receivables = context.grossTotal 
    ? `$${Number(context.grossTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    : (context.totalReceivables ?? '$440,840.00 USD');
  const cash = context.availableEarlyCash 
    ? `$${Number(context.availableEarlyCash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    : '$51,594.30 USD';

  const bottleneck = `${cash} available in early cash liquidity across approved invoices.`;

  const isDetail = Boolean(context.selectedInvoiceNumber);

  const greeting = isDetail
    ? `Hi! I'm **Ava**.

Viewing commercial invoice **${context.selectedInvoiceNumber}** (${context.header?.companyName || 'Buyer Client'}):
• **Invoice Total:** ${context.header?.totalAmount || '$30,870.00 USD'}
• **Matching Standing:** 100% 3-Way Matched against PO & carrier proof-of-delivery
• **Early Liquidity:** Eligible for accelerated same-day payout ($30,521.17 Net)
• **Direct Remittance:** Silicon Valley Bank (SVB) ••••4492 (Fedwire rail)

How can I assist with this invoice?`
    : `Hi! I'm **Ava**.

Here is your live accounts receivable ledger:
• **Active Receivables:** ${receivables} across ${count} commercial invoices
• **3-Way Match Verification:** 100% verified against PO line items & delivery receipts
• **Accelerated Liquidity Available:** ${bottleneck}

How can I help optimize your cash flow today?`;

  const prompts: AgenticPrompt[] = isDetail
    ? [
        {
          label: 'Accelerate Payment Payout',
          prompt: `Calculate and accept dynamic discount payout for invoice ${context.selectedInvoiceNumber}.`,
          icon: DollarSign,
          action: 'ACCEPT_DYNAMIC_DISCOUNT',
          payload: { invoiceNumber: context.selectedInvoiceNumber }
        },
        {
          label: 'Verify 3-Way Match Audit Trail',
          prompt: `Inspect line-level PO and delivery match audit trail for ${context.selectedInvoiceNumber}.`,
          icon: ShieldCheck,
          action: 'VERIFY_3WAY_MATCH',
          payload: { invoiceNumber: context.selectedInvoiceNumber }
        },
        {
          label: 'Back to Invoices Directory',
          prompt: 'Return to invoices list.',
          icon: Filter,
          action: 'CLOSE_INVOICE_DETAIL'
        }
      ]
    : [
        {
          label: 'Eligible Early Payouts',
          prompt: 'Which invoices are eligible for dynamic 2% early cash acceleration?',
          icon: DollarSign
        },
        {
          label: 'Open INV-2026-022 Details',
          prompt: 'Show early liquidity acceleration options for INV-2026-022.',
          icon: Receipt,
          action: 'VIEW_INVOICE',
          payload: { invoiceNumber: 'INV-2026-022' }
        },
        {
          label: 'Check 3-Way Match Status',
          prompt: 'Show invoices with 100% 3-way matching verified.',
          icon: ShieldCheck
        },
        {
          label: 'Filter Early-Pay Eligible',
          prompt: 'Filter invoice table to invoices eligible for dynamic discounting.',
          icon: Filter,
          action: 'FILTER_INVOICE_STATUS',
          payload: { status: 'EARLY_PAY' }
        }
      ];

  return {
    agentName: 'InvoicingSettlementAgent',
    role: 'Invoicing & Cash Settlement Agent',
    route: '/invoices',
    pageContextName: 'Invoices & Settlement',
    contextMetric: `${receivables} • 3-Way Matched`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'ACCEPT_DYNAMIC_DISCOUNT', description: 'Accelerate payment payout via dynamic discounting.' },
      { name: 'VERIFY_3WAY_MATCH', description: 'Inspect line-level 3-way match audit trail.' },
      { name: 'FILTER_INVOICE_STATUS', description: 'Filter invoices by matching or payment status.' }
    ],
    getResponse: (q) => {
      const lower = q.toLowerCase();
      if (lower.includes('early pay') || lower.includes('accelerate') || lower.includes('discount') || lower.includes('liquidity') || lower.includes('payout')) {
        return {
          reply: `Here is your dynamic cash discounting calculation for invoice **INV-2026-022** ($30,870.00 USD). You can adjust the acceleration slider below to choose your payout date:`,
          partialViews: [
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
          ]
        };
      }
      return {
        reply: `All ${count} invoices are conformed to buyer ERPs. ${cash} is ready for instant 2% discount acceleration.`
      };
    }
  };
}

// ==============================================================================
// 6. SOURCING & RFPS AGENT (/rfps)
// ==============================================================================
function synthesizeRfpsAgent(context: Record<string, any> = {}): AgenticBriefing {
  const count = context.rfpsCount ?? context.events?.length ?? 2;
  const totalValue = context.totalContractValue ?? '$840,000.00 USD';
  const activeRfp = context.activeRfpNumber || 'RFP-2026-APEX-09';
  const activeVal = context.estimatedValue || '$520,000.00 USD';
  const days = context.closingInDays || 5;

  const bottleneck = `${activeRfp} (${activeVal}) closes in ${days} days with 100% technical specification match.`;

  const isDetail = Boolean(context.eventNumber || context.activeEventId);

  const greeting = isDetail
    ? `Hi! I'm **Ava**.

Viewing tender opportunity **${context.eventNumber || 'RFP Tender'}** (${context.title || 'Enterprise Sourcing Event'}):
• **Buyer Client:** ${context.buyerName || 'Enterprise Buyer'}
• **Estimated Contract Value:** ${context.estimatedValue ? '$' + Number(context.estimatedValue).toLocaleString() + '.00 USD' : '$520,000.00 USD'}
• **Submission Deadline:** ${context.deadline || 'Closing soon'}
• **Technical Match:** 100% conformed to specifications

How can I help configure your bid proposal?`
    : `Hi! I'm **Ava**.

Here is your live enterprise sourcing pipeline:
• **Active Sourcing Events:** ${count} open tenders (${totalValue} total contract value)
• **Immediate Opportunity:** ${bottleneck}
• **Specification Match:** 100% conformed to Acme Node Spec v4

How can I assist with your proposals today?`;

  const prompts: AgenticPrompt[] = isDetail
    ? [
        {
          label: 'Calculate Competitive Margin',
          prompt: 'Calculate an optimal price margin with competitive edge discount for this tender.',
          icon: DollarSign
        },
        {
          label: 'Auto-Draft Bid Proposal',
          prompt: 'Auto-draft a compliant proposal submission package for this tender.',
          icon: FileText
        },
        {
          label: 'Check Compliance Terms',
          prompt: 'Verify all buyer criteria, delivery SLAs, and warranty terms for this tender.',
          icon: ShieldCheck
        },
        {
          label: 'Back to Sourcing Directory',
          prompt: 'Return to tenders directory list.',
          icon: Filter
        }
      ]
    : [
        {
          label: 'Which tenders close soonest?',
          prompt: 'Which RFP tenders have the nearest submission deadline?',
          icon: Clock
        },
        {
          label: 'Highest Value Tenders',
          prompt: 'Show the highest value sourcing opportunities in the pipeline.',
          icon: DollarSign
        },
        {
          label: 'Filter by Action Required',
          prompt: 'Filter tenders to show items requiring proposal submission.',
          icon: AlertTriangle
        }
      ];

  return {
    agentName: 'SourcingBidsAgent',
    role: 'Sourcing & Bids Agent',
    route: '/rfps',
    pageContextName: 'Sourcing & RFPs',
    contextMetric: `${count} Active Tenders • ${totalValue}`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'SUBMIT_BID_PROPOSAL', description: 'Submit a completed bid proposal package.' },
      { name: 'CALCULATE_WIN_PROBABILITY', description: 'Run competitive win probability scoring.' },
      { name: 'OPEN_RFP_CLARIFICATION', description: 'Ask a technical clarification question to buyer sourcing team.' }
    ],
    getResponse: () => ({
      reply: `Monitoring ${count} tenders. Apex RFP-09 has a 92% win probability score based on historical pricing and past performance.`
    })
  };
}

// ==============================================================================
// 7. COMPLIANCE & DOCUMENT VAULT AGENT (/documents)
// ==============================================================================
function synthesizeDocumentsAgent(context: Record<string, any> = {}): AgenticBriefing {
  const count = context.totalDocs ?? context.docs?.length ?? 6;
  const expired = context.expiredCount ?? 0;
  const expiring = context.expiringCount ?? 0;
  const taxId = context.taxId || '84-1294812';

  const bottleneck = expired > 0
    ? `${expired} certificate is EXPIRED (ACORD 25 Certificate of Liability Insurance). Immediate replacement required to prevent order or payment holds.`
    : expiring > 0
      ? "ACORD 25 Certificate of Insurance expires soon. Endorsement rider requested by Apex Global."
      : "All compliance documents and certifications active and conformed.";

  const greeting = `Hi! I'm **Ava**.

Here is your live compliance posture:
• **Verified Credentials:** ${count} active legal, tax, and insurance records
• **IRS W-9 Verification:** 100% matched to corporate legal identity (TIN ${taxId})
• **SOC 2 Type II:** Compliant and verified via Deloitte annual audit
${expired > 0 ? `• **⚠️ Action Required:** ${expired} certificate is **EXPIRED** (ACORD 25 COI)` : ''}
${expiring > 0 ? `• **Expiring Credentials:** ${expiring} certificate requiring attention` : ''}

**Regulatory Alert:** ${bottleneck}

How can I help protect your compliance standing today?`;

  const prompts: AgenticPrompt[] = [
    ...(expired > 0 ? [{
      label: 'Replace Expired Certificate',
      prompt: 'Upload replacement for expired ACORD 25 Certificate of Liability Insurance.',
      icon: AlertTriangle,
      action: 'UPLOAD_DOC',
      payload: { mode: 'SINGLE', type: 'CERT_INSURANCE_ACORD' }
    }] : []),
    {
      label: 'Request COI Endorsement Rider',
      prompt: 'Generate broker request for Apex Global endorsement rider on ACORD 25 COI.',
      icon: ShieldCheck,
      action: 'REQUEST_COI_RENEWAL',
      payload: {}
    },
    {
      label: 'Download Verified Form W-9',
      prompt: 'Download IRS-verified corporate Form W-9 with matching TIN.',
      icon: Download,
      action: 'DOWNLOAD_VERIFIED_W9',
      payload: {}
    },
    {
      label: 'Re-sync Vault to Buyer ERPs',
      prompt: 'Push updated credential certificates to Apex, NovaTech, and Meridian.',
      icon: RefreshCw,
      action: 'SYNC_VAULT_TO_BUYERS',
      payload: {}
    }
  ];

  return {
    agentName: 'ComplianceVaultAgent',
    role: 'Compliance & Regulatory Vault Agent',
    route: '/documents',
    pageContextName: 'Document Vault',
    contextMetric: expired > 0 ? `${expired} Expired • ${count} Records` : `${count} Verified • ${expiring} Expiring`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'UPLOAD_DOC', description: 'Upload a renewed or replacement compliance certificate.' },
      { name: 'REQUEST_COI_RENEWAL', description: 'Request an updated ACORD 25 insurance certificate from broker.' },
      { name: 'DOWNLOAD_VERIFIED_W9', description: 'Download IRS-verified Form W-9 PDF.' },
      { name: 'SYNC_VAULT_TO_BUYERS', description: 'Re-sync updated credentials to all connected buyer ERPs.' }
    ],
    getResponse: () => ({
      reply: expired > 0
        ? `Attention required: ACORD 25 Certificate of Liability Insurance expired on 11-02-2026. Please upload a renewed certificate to clear buyer holds.`
        : `All ${count} compliance records are monitored. I recommend uploading the Apex endorsement rider before the 20-day window closes.`
    })
  };
}

// ==============================================================================
// 8. EXECUTIVE OPERATIONS SUPERVISOR AGENT (/dashboard, /)
// ==============================================================================
function synthesizeDashboardAgent(context: Record<string, any> = {}): AgenticBriefing {
  const cash = context.availableEarlyCash 
    ? `$${Number(context.availableEarlyCash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    : '$51,594.30 USD';
  const buyers = context.activeBuyersCount ?? 3;
  const pipeline = context.pipelineTotal 
    ? `$${Number(context.pipelineTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    : '$384,660.00 USD';

  const bottleneck = "1 high-priority action: NovaTech Aerospace ITAR attestation pending start (Due in 10 days).";

  const greeting = `Hi! I'm **Ava**.

Here is your enterprise operating posture:
• **Available Early Liquidity:** **${cash}** across approved invoices
• **Active Buyer Connections:** ${buyers} enterprise clients (Apex Global, NovaTech, Meridian Health)
• **Committed Pipeline:** ${pipeline} across active purchase orders
• **Fulfillment Velocity:** PO-2026-101 in transit to Joliet DC

**High-Priority Bottleneck:** ${bottleneck}

How can I help optimize your enterprise operations today?`;

  const prompts: AgenticPrompt[] = [
    {
      label: 'Resolve NovaTech Onboarding',
      prompt: 'Jump to Onboarding and complete NovaTech Aerospace ITAR attestation.',
      icon: FileCheck2,
      action: 'NAVIGATE_PAGE',
      payload: { route: '/onboarding' }
    },
    {
      label: 'Accelerate Receivables Cash',
      prompt: 'Show approved invoices eligible for dynamic 2% early cash payout.',
      icon: DollarSign,
      action: 'NAVIGATE_PAGE',
      payload: { route: '/invoices' }
    },
    {
      label: 'Review Apex PO-9450 Specs',
      prompt: 'Open purchase orders to review and counter-sign PO-2026-9450.',
      icon: ShoppingCart,
      action: 'NAVIGATE_PAGE',
      payload: { route: '/orders' }
    }
  ];

  return {
    agentName: 'ExecutiveSupervisorAgent',
    role: 'Executive Operations Supervisor',
    route: '/dashboard',
    pageContextName: 'Executive Dashboard',
    contextMetric: 'Live Operational Pulse',
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'NAVIGATE_PAGE', description: 'Jump to a specific operational module.' },
      { name: 'EXECUTE_MORNING_SWEEP', description: 'Run autonomous cross-module compliance & order sweep.' }
    ],
    getResponse: () => ({
      reply: `Portfolio standing: ${pipeline} in active purchase orders, ${cash} available liquidity, and 1 high-priority onboarding attestation for NovaTech.`
    })
  };
}

// ==============================================================================
// 9. MASTER PUBLIC PROFILE AGENT (/public-profile, /master-profile)
// ==============================================================================
function synthesizeProfileAgent(context: Record<string, any> = {}): AgenticBriefing {
  const legal = context.legalName || 'Acme Industrial Tech Inc.';
  const trade = context.tradeName ? ` (Doing Business As ${context.tradeName})` : '';
  const taxId = context.taxId || '84-1294812';
  const duns = context.dunsNumber || '09-842-1928';
  const completeness = context.profileCompleteness ?? 98;
  const buyersCount = context.connectedBuyersCount ?? 3;
  const missing = context.missingRequirement || 'Complete Diversity & Certificates section to reach 100% profile score.';

  const bottleneck = completeness < 100
    ? `Profile is at ${completeness}% completeness. ${missing}`
    : `Master Public Profile is 100% complete and synchronized across ${buyersCount} enterprise buyer workspaces.`;

  const greeting = `Hi! I'm **Ava**.

Your Master Public Profile serves as your universal golden record across the Verisource network:
• **Legal Entity:** ${legal}${trade}
• **Verified TIN:** ${taxId} (W-9 matched with zero IRS discrepancy)
• **DUNS Number:** ${duns} (D&B Verified)
• **Trust & Completeness:** ${completeness}% Verified (${100 - completeness}% remaining)
• **Bilateral Sync Status:** Synchronized across ${buyersCount} enterprise buyer workspaces.

**Action Focus:** ${bottleneck}

How can I assist with your enterprise profile credentials today?`;

  const prompts: AgenticPrompt[] = [];

  if (completeness < 100) {
    prompts.push({
      label: `Complete Remaining ${100 - completeness}% in Diversity`,
      prompt: `Navigate to Diversity & Certificates tab to complete profile to 100%.`,
      icon: ShieldCheck,
      action: 'NAVIGATE_TAB',
      payload: { tab: 'diversity' }
    });
  }

  prompts.push(
    {
      label: 'Sync Profile Across All Buyers',
      prompt: 'Synchronize verified Master Profile records to Apex Global, NovaTech, and Meridian.',
      icon: RefreshCw,
      action: 'SYNC_MASTER_PROFILE',
      payload: {}
    },
    {
      label: 'Verify Bank Remittance Route',
      prompt: 'Inspect verified JPMorgan Chase ACH and wire settlement routing numbers.',
      icon: CreditCard,
      action: 'NAVIGATE_TAB',
      payload: { tab: 'banking' }
    },
    {
      label: 'Copy Shareable Profile Link',
      prompt: 'Generate and copy secure shareable Master Profile link.',
      icon: Share2,
      action: 'COPY_PROFILE_LINK',
      payload: {}
    }
  );

  return {
    agentName: 'MasterPassportAgent',
    role: 'Master Passport & Trust Agent',
    route: '/public-profile',
    pageContextName: 'Master Public Profile',
    contextMetric: `${completeness}% Verified Golden Record`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'SYNC_MASTER_PROFILE', description: 'Sync verified Master Profile to all connected buyer ERPs.' },
      { name: 'NAVIGATE_TAB', description: 'Switch active section tab in Master Profile.' },
      { name: 'COPY_PROFILE_LINK', description: 'Copy shareable link to clipboard.' }
    ],
    getResponse: () => ({
      reply: `Master Public Profile is conformed with TIN ${taxId} and DUNS ${duns}. Any verified profile updates propagate bilaterally to your ${buyersCount} connected enterprise buyers.`
    })
  };
}

// ==============================================================================
// 10. TASK PRIORITIZATION AGENT (/tasks)
// ==============================================================================
function synthesizeTasksAgent(context: Record<string, any> = {}): AgenticBriefing {
  const total = context.totalTasks ?? 8;
  const urgent = context.urgentCount ?? 1;

  const bottleneck = `${urgent} Urgent Task: Complete NovaTech Aerospace Vendor Onboarding & Attestation (INV-NOVATECH-8820).`;

  const greeting = `Hi! I'm **Ava**.

I triage all actionable tasks across your connected buyer accounts:
• **Total Action Items:** ${total} across onboarding, billing, orders, and compliance
• **Urgent Bottleneck:** Complete NovaTech Aerospace vendor attestation (Due in 2 days)
• **PO to Bill:** Apex Global PO-2026-9042 ($14,200.00 ready to flip)
• **Cash Liquidity:** Starlight Aerospace early payment ($30,870.00 payout available)

Which deliverable would you like guidance on completing first?`;

  const prompts: AgenticPrompt[] = [
    {
      label: 'Complete NovaTech Onboarding',
      prompt: 'Navigate to NovaTech onboarding questionnaire and auto-fill with Master Profile.',
      icon: ShieldCheck,
      action: 'COMPLETE_TASK',
      payload: { taskId: 'task-onb-1' }
    },
    {
      label: 'Flip Apex PO to Invoice',
      prompt: 'Convert Apex Global PO-2026-9042 into matched electronic invoice ($14,200.00).',
      icon: Zap,
      action: 'COMPLETE_TASK',
      payload: { taskId: 'task-ord-1' }
    }
  ];

  return {
    agentName: 'TaskPrioritizationAgent',
    role: 'Workflow & Prioritization Agent',
    route: '/tasks',
    pageContextName: 'Task Queue',
    contextMetric: `${total} Action Items Pending`,
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'COMPLETE_TASK', description: 'Mark a prioritized task as resolved.' },
      { name: 'FILTER_TASK_PRIORITY', description: 'Filter task queue by priority tier.' }
    ],
    getResponse: () => ({
      reply: `Managing ${total} active tasks across your enterprise buyer network. Completing the NovaTech ITAR & W-9 onboarding packet is the highest priority item.`
    })
  };
}

// ==============================================================================
// 11. FINANCIAL LEDGER AGENT (/transactions)
// ==============================================================================
function synthesizeTransactionsAgent(context: Record<string, any> = {}): AgenticBriefing {
  const poVol = context.totalPoVolume || '$384,660.00 USD';
  const invVol = context.totalInvoiceVolume || '$440,840.00 USD';
  const bottleneck = "All cross-buyer transactions reconciled with zero variance across SAP and Oracle ERPs.";

  const greeting = `Hi! I'm **Ava**.

Here is your consolidated multi-buyer transaction audit status:
• **PO Volume:** ${poVol} across 6 orders
• **Invoice Volume:** ${invVol} across 4 commercial invoices
• **Audit Standing:** ${bottleneck}

How can I assist with your transaction reconciliation today?`;

  const prompts: AgenticPrompt[] = [
    {
      label: 'Export Transaction Ledger CSV',
      prompt: 'Export consolidated multi-buyer ledger to CSV for financial audit.',
      icon: Download,
      action: 'EXPORT_LEDGER_CSV',
      payload: {}
    },
    {
      label: 'Filter to Apex Global Ledger',
      prompt: 'Filter transactions to show only Apex Global Enterprises records.',
      icon: Filter,
      action: 'FILTER_LEDGER_BUYER',
      payload: { buyerOrgId: 'buyer-org-1' }
    }
  ];

  return {
    agentName: 'FinancialLedgerAgent',
    role: 'Financial Ledger & Audit Agent',
    route: '/transactions',
    pageContextName: 'All Transactions',
    contextMetric: 'Full Cross-Buyer Ledger',
    greeting,
    suggestedPrompts: prompts,
    urgentBottleneck: bottleneck,
    tools: [
      { name: 'EXPORT_LEDGER_CSV', description: 'Export cross-buyer transaction ledger to CSV.' },
      { name: 'FILTER_LEDGER_BUYER', description: 'Filter transaction ledger by buyer organization.' }
    ],
    getResponse: () => ({
      reply: `Cross-buyer ledger reconciled across all POs and invoices with verified 3-way matching.`
    })
  };
}

// ==============================================================================
// AGENTIC ENGINE ROUTER
// ==============================================================================
export class AgenticEngine {
  public static synthesize(route: string, context: Record<string, any> = {}): AgenticBriefing {
    const normalized = (route || '').trim().toLowerCase();

    if (normalized.startsWith('/onboarding/detail')) {
      return synthesizeOnboardingDetailAgent(context);
    }
    if (normalized.startsWith('/onboarding')) {
      return synthesizeOnboardingAgent(context);
    }
    if (normalized.startsWith('/catalog')) {
      return synthesizeCatalogAgent(context);
    }
    if (normalized.startsWith('/orders') || normalized.startsWith('/purchase-orders')) {
      return synthesizeOrdersAgent(context);
    }
    if (normalized.startsWith('/asns') || normalized.startsWith('/shipping') || normalized.startsWith('/shipments')) {
      return synthesizeShipmentsAgent(context);
    }
    if (normalized.startsWith('/invoices')) {
      return synthesizeInvoicesAgent(context);
    }
    if (normalized.startsWith('/rfps') || normalized.startsWith('/sourcing') || normalized.startsWith('/bids')) {
      return synthesizeRfpsAgent(context);
    }
    if (normalized.startsWith('/documents') || normalized.startsWith('/vault') || normalized.startsWith('/doc-vault')) {
      return synthesizeDocumentsAgent(context);
    }
    if (normalized.startsWith('/public-profile') || normalized.startsWith('/master-profile') || normalized.startsWith('/profiles') || normalized.startsWith('/workspaces')) {
      return synthesizeProfileAgent(context);
    }
    if (normalized.startsWith('/tasks')) {
      return synthesizeTasksAgent(context);
    }
    if (normalized.startsWith('/transactions')) {
      return synthesizeTransactionsAgent(context);
    }

    // Default to Executive Supervisor
    return synthesizeDashboardAgent(context);
  }
}
