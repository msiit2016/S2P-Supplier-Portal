import React, { useState, useEffect, useRef } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  Building2, 
  Users, 
  FileText, 
  CreditCard, 
  UploadCloud, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Lock, 
  AlertTriangle, 
  Info,
  ExternalLink,
  ChevronRight,
  Clock,
  Send,
  Paperclip,
  CheckCheck,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileCheck2,
  ChevronDown,
  Building,
  AppWindow,
  Split,
  Minus,
  Bot,
  Zap,
  HelpCircle,
  X,
  FileSearch,
  CheckSquare,
  Terminal,
  History,
  GripHorizontal,
  Edit3,
  RotateCcw,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuyerInvitation {
  id: string;
  buyerName: string;
  buyerOrgId: string;
  invitationCode: string;
  category: string;
  invitedBy: string;
  invitedDate: string;
  status: 'PENDING_INITIATION' | 'IN_PROGRESS' | 'COMPLETED';
  stage?: string;
  stageNum?: number;
}

interface StepItem {
  num: number;
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type CopilotViewMode = 'DOCK' | 'FLOAT' | 'FULL' | 'MINIMIZE';

interface ToolExecution {
  toolName: string;
  label: string;
  status: 'RUNNING' | 'SUCCESS' | 'ERROR';
  details?: string;
  diff?: { field: string; before?: string; after: string }[];
}

interface ChatMessage {
  id: string;
  sender: 'QI' | 'USER';
  text: string;
  time: string;
  toolExecution?: ToolExecution;
  quickActions?: { id: string; label: string }[];
}

export const OnboardingRequest: React.FC = () => {
  const { navigate, routeState } = usePortal();
  const { currentUser } = useAuth();

  // Active Buyer Invitation Context & Multi-Buyer Support
  const [invitations] = useState<BuyerInvitation[]>([
    {
      id: 'inv-apex-01',
      buyerName: 'Apex Global Enterprises',
      buyerOrgId: 'buyer-org-1',
      invitationCode: 'INV-APEX-2026',
      category: 'Enterprise Cloud Infrastructure & Hardware',
      invitedBy: 'Marcus Vance, VP Strategic Procurement',
      invitedDate: 'Jan 14, 2026',
      status: 'IN_PROGRESS',
      stage: 'Stage 2: Form Submission',
      stageNum: 2
    },
    {
      id: 'inv-novatech-02',
      buyerName: 'NovaTech Aerospace & Defense',
      buyerOrgId: 'buyer-org-2',
      invitationCode: 'INV-NOVATECH-8820',
      category: 'Mission-Critical Aerospace Telemetry',
      invitedBy: 'Sarah Lin, S2P Vendor Operations',
      invitedDate: 'Yesterday',
      status: 'PENDING_INITIATION',
      stage: 'Stage 1: Registration Completed',
      stageNum: 1
    },
    {
      id: 'inv-meridian-03',
      buyerName: 'Meridian Health Network',
      buyerOrgId: 'buyer-org-3',
      invitationCode: 'INV-MERIDIAN-4011',
      category: 'Clinical Diagnostic & Lab Automation',
      invitedBy: 'David Chen, Global Procurement Lead',
      invitedDate: '3 days ago',
      status: 'IN_PROGRESS',
      stage: 'Stage 3: Buyer Approval',
      stageNum: 3
    }
  ]);
  const [activeInvitation, setActiveInvitation] = useState<BuyerInvitation>(invitations[0]);
  const [buyerDropdownOpen, setBuyerDropdownOpen] = useState(false);

  // Multi-buyer submission and post-submit editing tracking
  const [submissionStates, setSubmissionStates] = useState<Record<string, { isSubmitted: boolean; isEditing: boolean; submittedAt?: string }>>({});
  
  const currentSub = submissionStates[activeInvitation.id] || { isSubmitted: false, isEditing: false };
  const isSubmitted = currentSub.isSubmitted;
  const isEditingAfterSubmit = currentSub.isEditing;
  const submittedAt = currentSub.submittedAt;

  // Stepper state: Step 1 to Step 6
  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeStageDetail, setActiveStageDetail] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedState, setDraftSavedState] = useState(false);
  const [declarationError, setDeclarationError] = useState<string | null>(null);

  const handleSaveDraft = () => {
    setDraftSavedState(true);
    setTimeout(() => setDraftSavedState(false), 2500);
  };
  
  // Real-time UI highlight state
  const [highlightField, setHighlightField] = useState<string | null>(null);

  // Section 1: Company Profile
  const [legalName, setLegalName] = useState('Acme Industrial Tech Inc.');
  const [tradeName, setTradeName] = useState('Acme Tech Solutions');
  const [registeredAddress, setRegisteredAddress] = useState('100 Industrial Parkway, Suite 400, Austin, TX 78701');
  const [country, setCountry] = useState('United States');
  const [website, setWebsite] = useState('https://acmeindustrialtech.example.com');

  // Section 2: Business Contacts
  const [contactName, setContactName] = useState('Elena Rostova');
  const [contactEmail, setContactEmail] = useState('elena@acmeindustrial.com');
  const [contactPhone, setContactPhone] = useState('+1 (512) 555-0199');
  const [contactTitle, setContactTitle] = useState('Director of Enterprise Operations');

  // Section 3: Tax & Legal Identity
  const [taxId, setTaxId] = useState('84-1294812');
  const [taxEntityType, setTaxEntityType] = useState('Corporation');
  const [w9Uploaded, setW9Uploaded] = useState(true);
  const [w9FileName, setW9FileName] = useState('IRS_W9_Verified_2026.pdf');

  // Section 4: Banking & Settlement
  const [bankBeneficiary, setBankBeneficiary] = useState('Acme Industrial Tech Inc.');
  const [bankName, setBankName] = useState('JPMorgan Chase Bank, N.A.');
  const [bankRouting, setBankRouting] = useState('021000021');
  const [bankAccount, setBankAccount] = useState('489201948210');
  const [bankDocUploaded, setBankDocUploaded] = useState(true);
  const [bankDocFileName, setBankDocFileName] = useState('Chase_Voided_Check_Verification.pdf');

  // Section 5: Compliance & Certifications
  const [insuranceCarrier, setInsuranceCarrier] = useState('Travelers Commercial Casualty');
  const [insuranceCoverage, setInsuranceCoverage] = useState('$5,000,000 Aggregate');
  const [hasIsoCert, setHasIsoCert] = useState(true);
  const [hasSoc2, setHasSoc2] = useState(true);
  const [esgPolicyAgreed, setEsgPolicyAgreed] = useState(true);

  // Section 6: Review & Final Submit
  const [signatoryName, setSignatoryName] = useState('Elena Rostova');
  const [signatoryTitle, setSignatoryTitle] = useState('Authorized Corporate Officer');
  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  // =========================================================================
  // AGENT COPILOT STATE & PAGINATION (No page height blowout)
  // =========================================================================
  const [copilotViewMode, setCopilotViewMode] = useState<CopilotViewMode>('DOCK');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  // Draggable floating window coordinates & refs
  const [floatPos, setFloatPos] = useState<{ x: number; y: number }>(() => {
    const initX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 460) : 950;
    return { x: initX, y: 75 };
  });
  const floatPosRef = useRef(floatPos);
  floatPosRef.current = floatPos;

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0
  });

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (copilotViewMode !== 'FLOAT') return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea') || target.closest('.no-drag')) {
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: floatPosRef.current.x,
      startY: floatPosRef.current.y
    };
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      // Allow moving smoothly across the entire onboarding page
      const minX = 10;
      const maxX = Math.max(minX, window.innerWidth - 320);
      const minY = 10;
      const maxY = Math.max(minY, window.innerHeight - 80);

      const nextX = Math.min(Math.max(dragStartRef.current.startX + dx, minX), maxX);
      const nextY = Math.min(Math.max(dragStartRef.current.startY + dy, minY), maxY);

      floatPosRef.current = { x: nextX, y: nextY };
      setFloatPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, []);

  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Short, clean greeting message with dynamic suggested prompts
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'ava-welcome',
      sender: 'QI',
      text: `👋 Hi! I'm **Ava**, your Onboarding Agent for **${invitations[0].buyerName}**.\n\nAsk me to fill fields, check compliance, parse documents, or auto-complete any section.`,
      time: 'Just now',
      quickActions: [
        { id: 'AUTO_FILL', label: 'Update profile' },
        { id: 'UPLOAD_DOC', label: 'Upload document' },
        { id: 'AUDIT', label: 'Audit checklist' }
      ]
    }
  ]);

  // Click outside to close View dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setIsViewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll chat internally within its container (never scroll outer page/window)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAgentThinking]);

  // Check section completion
  const isStep1Done = Boolean(legalName && registeredAddress);
  const isStep2Done = Boolean(contactName && contactEmail && contactPhone);
  const isStep3Done = Boolean(taxId && taxEntityType && w9Uploaded);
  const isStep4Done = Boolean(bankBeneficiary && bankRouting && bankAccount);
  const isStep5Done = Boolean(insuranceCarrier && esgPolicyAgreed);
  const isStep6Done = Boolean(declarationAgreed && signatoryName);

  const completedStepsCount = [isStep1Done, isStep2Done, isStep3Done, isStep4Done, isStep5Done, isStep6Done].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 6) * 100);

  // Vertical Stepper Definitions
  const steps: StepItem[] = [
    {
      num: 1,
      id: 'company-profile',
      title: 'Company Profile',
      subtitle: 'Legal name, address & jurisdiction',
      icon: Building2
    },
    {
      num: 2,
      id: 'business-contacts',
      title: 'Business Contacts',
      subtitle: 'Primary account liaison & leader',
      icon: Users
    },
    {
      num: 3,
      id: 'tax-legal',
      title: 'Tax & Legal Identity',
      subtitle: 'TIN / EIN & official Form W-9',
      icon: FileText
    },
    {
      num: 4,
      id: 'banking-settlement',
      title: 'Banking & Settlement',
      subtitle: 'ACH, routing & voided check',
      icon: CreditCard
    },
    {
      num: 5,
      id: 'compliance-vault',
      title: 'Compliance & Documents',
      subtitle: 'Insurance, ISO/SOC 2 & ESG',
      icon: ShieldCheck
    },
    {
      num: 6,
      id: 'review-submit',
      title: 'Review & Submit',
      subtitle: 'Digital signature & submission',
      icon: CheckCircle2
    }
  ];

  const getStepStatus = (stepNum: number) => {
    if (stepNum === 1) return isStep1Done ? 'COMPLETED' : activeStep === 1 ? 'CURRENT' : 'PENDING';
    if (stepNum === 2) return isStep2Done ? 'COMPLETED' : activeStep === 2 ? 'CURRENT' : 'PENDING';
    if (stepNum === 3) return isStep3Done ? 'COMPLETED' : activeStep === 3 ? 'CURRENT' : 'PENDING';
    if (stepNum === 4) return isStep4Done ? 'COMPLETED' : activeStep === 4 ? 'CURRENT' : 'PENDING';
    if (stepNum === 5) return isStep5Done ? 'COMPLETED' : activeStep === 5 ? 'CURRENT' : 'PENDING';
    if (stepNum === 6) return isStep6Done ? 'COMPLETED' : activeStep === 6 ? 'CURRENT' : 'PENDING';
    return 'PENDING';
  };

  // Helper to trigger temporary UI pulse highlight on updated field
  const triggerFieldPulse = (fieldName: string) => {
    setHighlightField(fieldName);
    setTimeout(() => {
      setHighlightField(null);
    }, 3200);
  };

  // =========================================================================
  // REAL-TIME AGENTIC TOOL EXECUTIONS
  // =========================================================================

  // Tool 1: Master Profile Auto-Fill
  const handleExecuteAutoFill = () => {
    setIsAgentThinking(true);
    setTimeout(() => {
      setIsAgentThinking(false);
      setLegalName('Acme Industrial Tech Inc.');
      setTradeName('Acme Tech Solutions');
      setRegisteredAddress('100 Industrial Parkway, Suite 400, Austin, TX 78701');
      setCountry('United States');
      setWebsite('https://acmeindustrialtech.example.com');

      setContactName(currentUser?.name || 'Elena Rostova');
      setContactEmail(currentUser?.email || 'elena@acmeindustrial.com');
      setContactPhone('+1 (512) 555-0199');
      setContactTitle('Director of Enterprise Operations');

      setTaxId('84-1294812');
      setTaxEntityType('Corporation');
      setW9Uploaded(true);
      setW9FileName('IRS_W9_Verified_2026.pdf');

      setBankBeneficiary('Acme Industrial Tech Inc.');
      setBankName('JPMorgan Chase Bank, N.A.');
      setBankRouting('021000021');
      setBankAccount('489201948210');
      setBankDocUploaded(true);

      setInsuranceCarrier('Travelers Commercial Casualty');
      setInsuranceCoverage('$5,000,000 Aggregate');
      setHasIsoCert(true);
      setHasSoc2(true);
      setEsgPolicyAgreed(true);

      setSignatoryName(currentUser?.name || 'Elena Rostova');
      setSignatoryTitle('Authorized Corporate Officer');
      setDeclarationAgreed(true);

      triggerFieldPulse('legalName');
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });

      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'QI',
          text: `⚡ **Master Profile Synced!**\n\nI populated verified records from your Universal Profile:\n• **Entity:** Acme Industrial Tech Inc. (EIN: 84-1294812)\n• **Settlement:** JPMorgan Chase Bank (ABA: 021000021)\n• **Compliance:** $5M Liability + ISO 27001 verified.\n\nAll 6 sections are ready for final submission to ${activeInvitation.buyerName}!`,
          time: 'Just now',
          toolExecution: {
            toolName: 'master_profile_autofill',
            label: 'Universal Profile Data Pipeline',
            status: 'SUCCESS',
            details: 'Fetched 14 verified fields from sovereign supplier vault',
            diff: [
              { field: 'legalName', after: 'Acme Industrial Tech Inc.' },
              { field: 'taxId', after: '84-1294812' },
              { field: 'bankRouting', after: '021000021' }
            ]
          },
          quickActions: [
            { id: 'VERIFY_BANK', label: '🏦 Verify bank details' },
            { id: 'AUDIT', label: '🛡️ Audit checklist' },
            { id: 'REVIEW', label: '🚀 Review & submit' }
          ]
        }
      ]);
    }, 600);
  };

  // Tool 2: Compliance Checklist Audit
  const handleExecuteComplianceAudit = () => {
    setIsAgentThinking(true);
    setTimeout(() => {
      setIsAgentThinking(false);
      const auditPassed = isStep1Done && isStep2Done && isStep3Done && isStep4Done && isStep5Done;

      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'QI',
          text: `🛡️ **Compliance Audit for ${activeInvitation.buyerName}**:\n\n` +
            `• Section 1 (Company Profile): ${isStep1Done ? '✅ Complete' : '⚠️ Incomplete'}\n` +
            `• Section 2 (Contacts): ${isStep2Done ? '✅ Complete' : '⚠️ Incomplete'}\n` +
            `• Section 3 (Tax & Legal): ${isStep3Done ? '✅ Form W-9 Verified' : '⚠️ Incomplete'}\n` +
            `• Section 4 (Banking): ${isStep4Done ? '✅ FedACH Active' : '⚠️ Incomplete'}\n` +
            `• Section 5 (Compliance): ${isStep5Done ? '✅ $5M Policy Active' : '⚠️ Incomplete'}\n` +
            `• Section 6 (Review & Sign): ${isStep6Done ? '✅ Ready to Submit' : '⏳ Digital Signature Pending'}\n\n` +
            (auditPassed 
              ? '🎉 Profile is 100% compliant and ready for procurement activation!'
              : '⚠️ Complete the remaining items highlighted above to submit.'),
          time: 'Just now',
          toolExecution: {
            toolName: 'compliance_audit_engine',
            label: 'Enterprise S2P Verification Engine',
            status: 'SUCCESS',
            details: 'Audited against Apex Global Enterprises S2P standard'
          },
          quickActions: [
            { id: 'REVIEW', label: '🚀 Proceed to Review & Sign' },
            { id: 'VERIFY_BANK', label: '🏦 Check ABA routing' }
          ]
        }
      ]);
    }, 550);
  };

  // Tool 3: Bank Routing Validator
  const handleVerifyBankRouting = () => {
    setIsAgentThinking(true);
    setTimeout(() => {
      setIsAgentThinking(false);
      setActiveStep(4);
      triggerFieldPulse('bankRouting');

      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'QI',
          text: `🏦 **FedACH Lookup for \`${bankRouting}\`**:\n• **Institution:** JPMorgan Chase Bank, N.A.\n• **Settlement:** ACH, Fedwire, RTP Supported\n• **Status:** Active (Zero Fraud Flags)\n\nNavigated to **Section 4: Banking & Settlement**.`,
          time: 'Just now',
          toolExecution: {
            toolName: 'fedach_routing_verifier',
            label: 'Federal Reserve FedACH Directory',
            status: 'SUCCESS',
            details: 'Direct API match with US Federal Reserve Bank Registry'
          },
          quickActions: [
            { id: 'AUDIT', label: '🛡️ Audit checklist' },
            { id: 'REVIEW', label: '🚀 Review & submit' }
          ]
        }
      ]);
    }, 500);
  };

  // Tool 4: OCR Document Extraction
  const handleSimulateDocumentUpload = (docName: string, fieldType: 'TAX' | 'BANK' | 'INSURANCE') => {
    setIsAgentThinking(true);
    setTimeout(() => {
      setIsAgentThinking(false);
      if (fieldType === 'TAX') {
        setActiveStep(3);
        setTaxId('84-1294812');
        setTaxEntityType('Corporation');
        setW9Uploaded(true);
        setW9FileName(docName);
        triggerFieldPulse('taxId');
      } else if (fieldType === 'BANK') {
        setActiveStep(4);
        setBankDocUploaded(true);
        setBankDocFileName(docName);
        triggerFieldPulse('bankRouting');
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-doc-' + Date.now(),
          sender: 'QI',
          text: `📄 **OCR Document Extracted: ${docName}**\n• **Doc Type:** IRS Form W-9 (Verified)\n• **Extracted Name:** \`${legalName}\` (99.8% match)\n• **Extracted TIN:** \`84-1294812\` (99.9% match)\n\nNavigated to **Section 3: Tax & Legal Identity**.`,
          time: 'Just now',
          toolExecution: {
            toolName: 'ocr_vision_extraction',
            label: 'Document Intelligence & Extraction',
            status: 'SUCCESS',
            details: `Extracted 4 fields with 99.8% OCR confidence`,
            diff: [
              { field: 'taxId', after: '84-1294812' },
              { field: 'taxEntityType', after: 'Corporation' }
            ]
          },
          quickActions: [
            { id: 'VERIFY_BANK', label: '🏦 Continue to Banking' },
            { id: 'AUDIT', label: '🛡️ Run compliance audit' }
          ]
        }
      ]);
    }, 700);
  };

  // PROMPT-BASED REAL-TIME AGENT HANDLER
  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAgentThinking) return;

    const userPrompt = chatInput.trim();
    setChatInput('');
    const userMsgId = 'user-' + Date.now();

    setChatMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'USER', text: userPrompt, time: 'Just now' }
    ]);

    setIsAgentThinking(true);

    setTimeout(() => {
      setIsAgentThinking(false);
      const lower = userPrompt.toLowerCase();
      const qiMsgId = 'qi-' + Date.now();

      // 1. Natural Language Intent: AUTO-FILL
      if (lower.includes('fill') || lower.includes('auto') || lower.includes('profile')) {
        handleExecuteAutoFill();
        return;
      }

      // 2. Natural Language Intent: AUDIT / COMPLIANCE
      if (lower.includes('audit') || lower.includes('compliance') || lower.includes('check') || lower.includes('verify') || lower.includes('ready')) {
        handleExecuteComplianceAudit();
        return;
      }

      // 3. Natural Language Intent: NAVIGATION / SWITCH SECTIONS
      if (lower.includes('section 1') || lower.includes('company profile')) {
        setActiveStep(1);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Navigated to **Section 1: Company Profile**.`,
            time: 'Just now',
            toolExecution: { toolName: 'ui_navigate_section', label: 'Form Navigation', status: 'SUCCESS' }
          }
        ]);
        return;
      }
      if (lower.includes('section 2') || lower.includes('contact')) {
        setActiveStep(2);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 2: Business Contacts**. Primary contact is **${contactName}**.`,
            time: 'Just now',
            toolExecution: { toolName: 'ui_navigate_section', label: 'Form Navigation', status: 'SUCCESS' }
          }
        ]);
        return;
      }
      if (lower.includes('section 3') || lower.includes('tax') || lower.includes('tin') || lower.includes('w9')) {
        setActiveStep(3);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 3: Tax & Legal Identity**. Tax ID: **${taxId}**.`,
            time: 'Just now',
            toolExecution: { toolName: 'ui_navigate_section', label: 'Form Navigation', status: 'SUCCESS' }
          }
        ]);
        return;
      }
      if (lower.includes('section 4') || lower.includes('bank') || lower.includes('routing') || lower.includes('ach')) {
        setActiveStep(4);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 4: Banking & Settlement** (ABA: \`${bankRouting}\`).`,
            time: 'Just now',
            toolExecution: { toolName: 'ui_navigate_section', label: 'Form Navigation', status: 'SUCCESS' }
          }
        ]);
        return;
      }
      if (lower.includes('section 5') || lower.includes('insurance') || lower.includes('esg') || lower.includes('iso')) {
        setActiveStep(5);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 5: Compliance & Documents**.`,
            time: 'Just now',
            toolExecution: { toolName: 'ui_navigate_section', label: 'Form Navigation', status: 'SUCCESS' }
          }
        ]);
        return;
      }
      if (lower.includes('section 6') || lower.includes('review') || lower.includes('submit')) {
        setActiveStep(6);
        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `Switched to **Section 6: Review & Submit**. Ready for digital signature.`,
            time: 'Just now',
            toolExecution: { toolName: 'ui_navigate_section', label: 'Form Navigation', status: 'SUCCESS' }
          }
        ]);
        return;
      }

      // 4. Natural Language Intent: FIELD UPDATE
      if (lower.includes('phone') && (lower.includes('change') || lower.includes('update') || lower.includes('set'))) {
        const phoneMatch = userPrompt.match(/(\+?\d[\d\s\-()]{7,}\d)/);
        const newPhone = phoneMatch ? phoneMatch[0] : '+1 (512) 888-0199';
        setContactPhone(newPhone);
        setActiveStep(2);
        triggerFieldPulse('contactPhone');

        setChatMessages(prev => [
          ...prev,
          {
            id: qiMsgId,
            sender: 'QI',
            text: `✓ Updated **Business Phone** to \`${newPhone}\` in Section 2.`,
            time: 'Just now',
            toolExecution: {
              toolName: 'update_form_field',
              label: 'Real-Time Form State Mutator',
              status: 'SUCCESS',
              diff: [{ field: 'contactPhone', before: contactPhone, after: newPhone }]
            }
          }
        ]);
        return;
      }

      // 5. Default Intelligent Reply
      setChatMessages(prev => [
        ...prev,
        {
          id: qiMsgId,
          sender: 'QI',
          text: `Understood! I'm monitoring the requirements for **${activeInvitation.buyerName}**.\n\nYou can ask me to update any field, verify tax or bank routing, or click any dynamic action below:`,
          time: 'Just now',
          quickActions: [
            { id: 'AUTO_FILL', label: '⚡ Update profile' },
            { id: 'UPLOAD_DOC', label: '📄 Upload document' },
            { id: 'VERIFY_BANK', label: '🏦 Verify bank details' },
            { id: 'AUDIT', label: '🛡️ Audit checklist' }
          ]
        }
      ]);
    }, 550);
  };

  // Handle Save / Next Section
  const handleSaveAndContinue = (nextStep: number) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setActiveStep(nextStep);
    }, 200);
  };

  // Handle Final Submit & Resubmit
  const handleFinalSubmit = () => {
    if (!declarationAgreed || !signatoryName.trim()) {
      setDeclarationError('Please review and check the digital declaration box below, then confirm your authorized signatory name to submit.');
      setActiveStep(6);
      setTimeout(() => {
        const declEl = document.getElementById('digital-declaration-box');
        if (declEl) {
          declEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    setDeclarationError(null);

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setSubmissionStates(prev => ({
        ...prev,
        [activeInvitation.id]: {
          isSubmitted: true,
          isEditing: false,
          submittedAt: timeStr
        }
      }));

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      
      setChatMessages(prev => [
        ...prev,
        {
          id: 'ava-submit-' + Date.now(),
          sender: 'QI',
          text: `🎉 **Application Transmitted to ${activeInvitation.buyerName}!**\n\n• **Reference:** \`${activeInvitation.invitationCode}-SUBMITTED\`\n• **Status:** Stage 3: Buyer Adjudication & Compliance Review\n• **Timestamp:** ${timeStr}\n\n*Procurement review is underway. If you need to make changes, click **"Edit Application"** at any time.*`,
          time: 'Just now',
          toolExecution: { toolName: 'submit_application_dossier', label: 'Dossier Submission', status: 'SUCCESS' },
          quickActions: [
            { id: 'EDIT_SUBMISSION', label: '✏️ Edit application' },
            { id: 'AUDIT', label: '🛡️ Audit checklist' }
          ]
        }
      ]);
    }, 600);
  };

  const handleStartEditing = () => {
    setSubmissionStates(prev => ({
      ...prev,
      [activeInvitation.id]: {
        ...(prev[activeInvitation.id] || { isSubmitted: true }),
        isEditing: true
      }
    }));
  };

  const handleCancelEditing = () => {
    setSubmissionStates(prev => ({
      ...prev,
      [activeInvitation.id]: {
        ...(prev[activeInvitation.id] || { isSubmitted: true }),
        isEditing: false
      }
    }));
  };

  // Clear chat conversation
  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'ava-welcome-' + Date.now(),
        sender: 'QI',
        text: `👋 Chat reset. I'm **Ava**, your Onboarding Agent for **${activeInvitation.buyerName}**. How can I help you?`,
        time: 'Just now',
        quickActions: [
          { id: 'AUTO_FILL', label: '⚡ Update profile' },
          { id: 'UPLOAD_DOC', label: '📄 Upload document' },
          { id: 'VERIFY_BANK', label: '🏦 Verify bank details' },
          { id: 'AUDIT', label: '🛡️ Audit checklist' }
        ]
      }
    ]);
  };

  // Dynamic Prompt Action Metadata & Icons
  const getQuickActionMeta = (id: string, label: string) => {
    switch (id) {
      case 'AUTO_FILL':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          title: 'Update profile',
          desc: 'Sync 14 verified records from Universal Profile',
          category: 'Autofill',
          promptText: 'Update profile from Master Public Profile'
        };
      case 'UPLOAD_DOC':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          title: 'Upload document',
          desc: 'Extract TIN & legal entity via OCR Vision',
          category: 'OCR',
          promptText: 'Upload and parse IRS Form W-9'
        };
      case 'VERIFY_BANK':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          title: 'Verify bank details',
          desc: 'Match FedACH routing & active settlement ABA',
          category: 'FedACH',
          promptText: 'Verify banking details and FedACH routing'
        };
      case 'AUDIT':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          title: 'Audit checklist',
          desc: 'Validate 100% compliance across all 6 sections',
          category: 'Audit',
          promptText: 'Run compliance audit checklist'
        };
      case 'REVIEW':
        return {
          icon: <CheckCheck className="w-3.5 h-3.5 text-teal-400" />,
          badgeBg: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
          title: 'Review & submit',
          desc: 'Proceed to digital signature & final submission',
          category: 'Sign',
          promptText: 'Review packet and prepare for digital signature'
        };
      case 'EDIT_SUBMISSION':
        return {
          icon: <Edit3 className="w-3.5 h-3.5 text-amber-400" />,
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          title: 'Edit application',
          desc: 'Unlock submitted application to revise information',
          category: 'Revise',
          promptText: 'Unlock application to revise submitted details'
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          title: label.replace(/^[^\w\s]+/, '').trim() || 'Execute Action',
          desc: 'Automate onboarding task',
          category: 'Action',
          promptText: label.replace(/^[^\w\s]+/, '').trim()
        };
    }
  };

  // Central dynamic action dispatcher with natural conversational flow
  const handleQuickAction = (actionId: string, customLabel?: string) => {
    const meta = getQuickActionMeta(actionId, customLabel || '');
    
    // Append user message so conversation flow is completely natural
    setChatMessages(prev => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'USER',
        text: meta.promptText,
        time: 'Just now'
      }
    ]);

    switch (actionId) {
      case 'AUTO_FILL':
        handleExecuteAutoFill();
        break;
      case 'UPLOAD_DOC':
        handleSimulateDocumentUpload('IRS_W9_Verified_2026.pdf', 'TAX');
        break;
      case 'VERIFY_BANK':
        handleVerifyBankRouting();
        break;
      case 'AUDIT':
        handleExecuteComplianceAudit();
        break;
      case 'EDIT_SUBMISSION':
        handleStartEditing();
        setActiveStep(1);
        setTimeout(() => {
          setChatMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              sender: 'QI',
              text: `✏️ **Revision Mode Enabled!** You can now freely edit Section 1 through Section 5. Once done, go to Section 6 to save and resubmit your updates to **${activeInvitation.buyerName}**.`,
              time: 'Just now',
              toolExecution: { toolName: 'unlock_dossier_revision', label: 'Revision Mode', status: 'SUCCESS' }
            }
          ]);
        }, 200);
        break;
      case 'REVIEW':
        setActiveStep(6);
        setTimeout(() => {
          setChatMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              sender: 'QI',
              text: `Switched to **Section 6: Review & Submit**. Your onboarding packet is verified and ready for authorized digital signature.`,
              time: 'Just now',
              toolExecution: { toolName: 'ui_navigate_section', label: 'Form Navigation', status: 'SUCCESS' },
              quickActions: [
                { id: 'AUDIT', label: 'Audit checklist' }
              ]
            }
          ]);
        }, 300);
        break;
      default:
        break;
    }
  };

  // View modes boolean flags
  const isDock = copilotViewMode === 'DOCK';
  const isFloat = copilotViewMode === 'FLOAT';
  const isFull = copilotViewMode === 'FULL';
  const isMinimized = copilotViewMode === 'MINIMIZE';

  // =========================================================================
  // RENDER AGENT COPILOT CONTENT (Strictly bounded height, internal scroll)
  // =========================================================================
  const renderCopilotContent = () => (
    <div className="flex flex-col h-full max-h-full bg-slate-50/60 text-slate-800 overflow-hidden">
      
      {/* 1. AGENT TOP STRIP WITH VIEW DROPDOWN MENU + MINIMIZE [-] + CLOSE [X] */}
      <div 
        onMouseDown={handleHeaderMouseDown}
        className={`px-3.5 py-2.5 bg-white border-b border-slate-200/90 flex items-center justify-between gap-2 shrink-0 shadow-2xs ${
          isFloat ? 'cursor-grab active:cursor-grabbing select-none' : ''
        }`}
        title={isFloat ? 'Click and drag anywhere to move floating window' : undefined}
      >
        
        {/* Agent Identity & Drag Handle */}
        <div className="flex items-center space-x-2 min-w-0">
          {isFloat && (
            <div className="flex items-center text-slate-400 hover:text-slate-700 mr-0.5 cursor-grab" title="Drag to move">
              <GripHorizontal className="w-4 h-4" />
            </div>
          )}
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-900">Ava</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Agent
            </span>
          </div>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center space-x-1 shrink-0 text-slate-500">
          
          {/* View ▾ Dropdown */}
          <div className="relative" ref={viewMenuRef}>
            <button
              type="button"
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
              className="px-2 py-1 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 transition flex items-center space-x-1 cursor-pointer"
              title="Change Agent Layout Mode"
            >
              <span>View</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isViewMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-[100] animate-in fade-in zoom-in-95">
                <div className="text-[9px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Layout
                </div>
                
                <button
                  type="button"
                  onClick={() => { setCopilotViewMode('DOCK'); setIsViewMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition cursor-pointer ${
                    isDock ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Split className="w-3.5 h-3.5" />
                    <span>Dock</span>
                  </span>
                  {isDock && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => { setCopilotViewMode('FLOAT'); setIsViewMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition cursor-pointer ${
                    isFloat ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <AppWindow className="w-3.5 h-3.5" />
                    <span>Float</span>
                  </span>
                  {isFloat && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => { setCopilotViewMode('FULL'); setIsViewMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition cursor-pointer ${
                    isFull ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Full</span>
                  </span>
                  {isFull && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          {/* History Icon */}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Chat History & Reset"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {/* Minimize [-] */}
          <button
            type="button"
            onClick={() => setCopilotViewMode('MINIMIZE')}
            className="p-1.5 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Minimize Agent (-)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close [X] */}
          <button
            type="button"
            onClick={() => setCopilotViewMode('MINIMIZE')}
            className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Close Agent"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CHAT CONVERSATION STREAM (Clean, scrolls internally) */}
      <div 
        ref={chatContainerRef}
        className="flex-1 min-h-0 p-3.5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-200"
      >
        {(() => {
          const lastWithActionsIndex = chatMessages
            .map(m => m.sender !== 'USER' && Boolean(m.quickActions && m.quickActions.length > 0))
            .lastIndexOf(true);

          return chatMessages.map((msg, msgIndex) => {
            const isLatestWithActions = msg.sender !== 'USER' && 
              Boolean(msg.quickActions && msg.quickActions.length > 0) && 
              msgIndex === lastWithActionsIndex;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[92%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs font-medium shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {/* Tool Execution Card */}
                  {msg.toolExecution && (
                    <div className="mb-2.5 p-2.5 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-emerald-800 flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-emerald-600" />
                          TOOL: {msg.toolExecution.toolName}
                        </span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {msg.toolExecution.status}
                        </span>
                      </div>

                      {msg.toolExecution.diff && msg.toolExecution.diff.length > 0 && (
                        <div className="pt-1.5 border-t border-emerald-200/80 space-y-0.5 text-[9px] font-mono">
                          {msg.toolExecution.diff.map((d, i) => (
                            <div key={i} className="text-emerald-700">
                              + {d.field}: {d.after}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message text with bold markdown support */}
                  <div className="whitespace-pre-line text-slate-800">
                    {msg.sender === 'USER' ? (
                      msg.text
                    ) : (
                      msg.text.split(/(\*\*.*?\*\*)/g).map((chunk, ci) => {
                        if (chunk.startsWith('**') && chunk.endsWith('**')) {
                          return (
                            <strong key={ci} className="font-semibold text-slate-900">
                              {chunk.slice(2, -2)}
                            </strong>
                          );
                        }
                        return chunk;
                      })
                    )}
                  </div>

                  {/* Naturally available dynamic next possible action prompts */}
                  {isLatestWithActions && msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                      {msg.quickActions.map((qa, i) => {
                        const meta = getQuickActionMeta(qa.id, qa.label);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleQuickAction(qa.id, qa.label)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 hover:border-emerald-300 text-emerald-800 hover:text-emerald-950 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-2xs active:scale-95 group"
                          >
                            <span className="shrink-0 text-emerald-600">{meta.icon}</span>
                            <span>{meta.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            );
          });
        })()}

        {/* Agent Thinking indicator */}
        {isAgentThinking && (
          <div className="flex items-center space-x-2 p-2.5 bg-white border border-emerald-300 rounded-2xl max-w-[80%] text-xs text-emerald-700 shadow-2xs animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-500 shrink-0" />
            <span>Ava is updating form state...</span>
          </div>
        )}
      </div>

      {/* 3. CONTEXT STRIP: Single clean line (Section, Profile Name, % Completion) */}
      <div 
        onMouseDown={handleHeaderMouseDown}
        className={`px-3.5 py-1.5 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-[11px] shrink-0 gap-2 ${
          isFloat ? 'cursor-grab active:cursor-grabbing select-none' : ''
        }`}
        title={isFloat ? 'Click and drag anywhere to move floating window' : undefined}
      >
        <div className="flex items-center space-x-2 truncate min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="text-slate-700 font-semibold truncate">
            Sec {activeStep}: {steps[activeStep - 1].title}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 truncate max-w-[150px]" title={`${legalName} • ${website}`}>
            {legalName}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-md">
            {progressPercent}% Complete
          </span>
        </div>
      </div>

      {/* 4. CHAT INPUT BAR WITH ATTACHMENT */}
      <form onSubmit={handleSendPrompt} className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0">
        <button
          type="button"
          onClick={() => handleSimulateDocumentUpload('IRS_W9_Verified_2026.pdf', 'TAX')}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition shrink-0 cursor-pointer"
          title="Upload / Attach Document for OCR parsing"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask Ava or type a prompt..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20"
        />

        <button
          type="submit"
          disabled={isAgentThinking || !chatInput.trim()}
          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition shadow-xs shrink-0 cursor-pointer"
          title="Send Prompt to Ava"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] min-h-[580px] max-h-[calc(100vh-140px)] flex flex-col font-sans bg-slate-50 overflow-hidden relative rounded-xl border border-slate-200/80 shadow-xs">
      
      {/* WORKBENCH: STRICT VIEWPORT BOUNDED ROW (NO PAGE BLOWUP) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 bg-white h-full max-h-full overflow-hidden">
        
        {/* ========================================================
            COLUMN 1: VERTICAL SECTION STEPPER (Left Sidebar)
            (Hidden only in FULL agent view)
           ======================================================== */}
        {!isFull && (
          <aside className="w-full lg:w-72 xl:w-80 bg-white border-r border-slate-200 flex flex-col justify-between p-4 sm:p-5 shrink-0 h-full overflow-y-auto">
            <div className="space-y-4">
              
              {/* Active Buyer Onboarding Card & Multi-Buyer Switcher */}
              <div className="relative bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Buyer Onboarding</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    {isSubmitted ? 'STAGE 3 OF 5' : 'STAGE 2 OF 5'}
                  </span>
                </div>

                {/* Buyer Switcher Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setBuyerDropdownOpen(!buyerDropdownOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition shadow-2xs group text-left"
                >
                  <div className="min-w-0 pr-1">
                    <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                      {activeInvitation.buyerName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      Ref: <span className="font-mono font-medium text-slate-700">{activeInvitation.invitationCode}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 transition-transform ${buyerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Multi-Buyer Dropdown Menu */}
                {buyerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                      Switch Buyer Onboarding ({invitations.length})
                    </div>
                    {invitations.map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => {
                          setActiveInvitation(inv);
                          setBuyerDropdownOpen(false);
                        }}
                        className={`w-full p-2 rounded-lg text-left transition flex items-start justify-between ${
                          inv.id === activeInvitation.id
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs truncate font-medium">{inv.buyerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{inv.invitationCode} • {inv.category}</div>
                        </div>
                        {inv.id === activeInvitation.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                  <span className="font-mono text-slate-600 font-medium">Ref: {activeInvitation.invitationCode}</span>
                  <span className={`font-semibold ${isSubmitted ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[9px]' : 'text-emerald-700'}`}>
                    {isSubmitted ? 'SUBMITTED' : `Sec ${activeStep} of 6`}
                  </span>
                </div>
              </div>

              {/* Vertical Step Progress List */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-2">
                  Onboarding Sections
                </div>

                <div className="space-y-1.5">
                  {steps.map((s) => {
                    const Icon = s.icon;
                    const isCurrent = activeStep === s.num;
                    const status = getStepStatus(s.num);
                    const isDone = status === 'COMPLETED';

                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveStep(s.num)}
                        className={`w-full p-2.5 rounded-xl text-left transition flex items-start space-x-3 border ${
                          isCurrent
                            ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                            : isDone
                            ? 'bg-white border-slate-200 hover:bg-slate-50/80'
                            : 'bg-white border-transparent hover:bg-slate-100/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {/* Step Circle / Check Indicator */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-slate-900 text-white ring-2 ring-emerald-500'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isDone ? <Check className="w-4 h-4" /> : <span>{s.num}</span>}
                        </div>

                        {/* Step Title & Subtitle */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold truncate ${
                              isCurrent ? 'text-emerald-900' : 'text-slate-800'
                            }`}>
                              {s.title}
                            </span>
                            {isDone && (
                              <span className="text-[9px] font-bold text-emerald-600 font-mono">
                                DONE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {s.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ========================================================
            COLUMN 2: FORM DETAILS PANE (Center - Section by Section)
            (Hidden only in FULL agent view)
           ======================================================== */}
        {!isFull && (
          <main className="flex-1 min-w-0 bg-slate-50 overflow-y-auto h-full p-4 sm:p-5 lg:p-6 space-y-4">
            
            {/* Prominent Submission Confirmation Banner */}
            {isSubmitted && !isEditingAfterSubmit && (
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-2">
                      <span>Application Submitted Successfully to {activeInvitation.buyerName}!</span>
                      <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-semibold">STAGE 3 ACTIVE</span>
                    </div>
                    <div className="text-[11px] text-emerald-100 mt-0.5">
                      Dossier Ref: <span className="font-mono font-semibold text-white">{activeInvitation.invitationCode}-SUBMITTED</span> • Procurement adjudication is underway ({submittedAt || 'Today'}).
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="px-3.5 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Edit Application</span>
                  </button>
                </div>
              </div>
            )}

            {/* End-to-End Buyer Onboarding Lifecycle Process Map */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buyer Onboarding Lifecycle:</span>
                  <span className="text-xs font-extrabold text-slate-900">{activeInvitation.buyerName}</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] font-mono text-slate-500 font-medium">Ref: {activeInvitation.invitationCode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 font-medium">Lifecycle Journey:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    {isSubmitted 
                      ? 'Stage 3: Buyer Review (Application Submitted)' 
                      : isEditingAfterSubmit 
                      ? 'Stage 2: Profile Submission (Revision Mode)' 
                      : `Stage 2: Profile Submission (Active • ${progressPercent}%)`
                    }
                  </span>
                </div>
              </div>

              {/* Connected 5-Stage Stepper Pipeline with Continuous Track */}
              <div className="relative pt-1 pb-1">
                {/* Visual Progress Connector Line Track behind nodes */}
                <div className="absolute top-[18px] left-[10%] right-[10%] h-1 bg-slate-200 rounded-full z-0 -translate-y-1/2">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: isSubmitted ? '50%' : '25%'
                    }}
                  />
                </div>

                {/* 5 Interactive Clickable Stages */}
                <div className="grid grid-cols-5 gap-2 relative z-10">
                  {/* Step 1: Registration */}
                  <button
                    type="button"
                    onClick={() => setActiveStageDetail(1)}
                    className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                    title="Click to view Stage 1: Registration details"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 ring-4 ring-emerald-50 group-hover:ring-emerald-200 transition">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="min-h-[28px] flex items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition">
                        Registration
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      Buyer Registered ✓
                    </span>
                  </button>

                  {/* Step 2: Profile Submission */}
                  <button
                    type="button"
                    onClick={() => setActiveStageDetail(2)}
                    className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                    title="Click to view Stage 2: Profile Submission details"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 ring-4 transition ${
                      isSubmitted 
                        ? 'bg-emerald-600 text-white ring-emerald-50 group-hover:ring-emerald-200' 
                        : 'bg-slate-900 text-emerald-400 ring-emerald-100 border-2 border-emerald-500 group-hover:ring-emerald-300'
                    }`}>
                      {isSubmitted ? <Check className="w-4 h-4" /> : '2'}
                    </div>
                    <div className="min-h-[28px] flex items-center justify-center text-center">
                      <span className={`text-xs font-bold leading-tight transition ${isSubmitted ? 'text-slate-900 group-hover:text-emerald-700' : 'text-emerald-950 font-extrabold'}`}>
                        Profile Submission
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium mt-0.5 ${isSubmitted ? 'text-emerald-600' : 'text-emerald-700 font-bold'}`}>
                      {isSubmitted ? 'Submitted ✓' : `${progressPercent}% Active`}
                    </span>
                  </button>

                  {/* Step 3: Buyer Review */}
                  <button
                    type="button"
                    onClick={() => setActiveStageDetail(3)}
                    className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                    title="Click to view Stage 3: Buyer Review details"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 ring-4 transition ${
                      isSubmitted 
                        ? 'bg-slate-900 text-emerald-400 ring-emerald-100 border-2 border-emerald-500 animate-pulse group-hover:ring-emerald-300' 
                        : 'bg-slate-100 text-slate-400 ring-slate-50 group-hover:ring-slate-200'
                    }`}>
                      3
                    </div>
                    <div className="min-h-[28px] flex items-center justify-center text-center">
                      <span className={`text-xs font-bold leading-tight transition ${isSubmitted ? 'text-emerald-950 font-extrabold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                        Buyer Review
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium mt-0.5 ${isSubmitted ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      {isSubmitted ? 'Under Review ●' : 'Pending Review'}
                    </span>
                  </button>

                  {/* Step 4: Approved */}
                  <button
                    type="button"
                    onClick={() => setActiveStageDetail(4)}
                    className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                    title="Click to view Stage 4: Approved details"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 ring-4 ring-slate-50 group-hover:ring-slate-200 transition">
                      4
                    </div>
                    <div className="min-h-[28px] flex items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-600 leading-tight group-hover:text-slate-900 transition">
                        Approved
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Pending
                    </span>
                  </button>

                  {/* Step 5: Ready for Transaction */}
                  <button
                    type="button"
                    onClick={() => setActiveStageDetail(5)}
                    className="flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
                    title="Click to view Stage 5: Ready for Transaction details"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 ring-4 ring-slate-50 group-hover:ring-slate-200 transition">
                      5
                    </div>
                    <div className="min-h-[28px] flex items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-600 leading-tight group-hover:text-slate-900 transition">
                        Ready for Transaction
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      PO, Invoices & Docs
                    </span>
                  </button>
                </div>
              </div>

              {/* Interactive Stage Info Drawer / Banner */}
              {activeStageDetail && (
                <div className="mt-2 p-4 rounded-xl bg-slate-900 text-white border border-slate-700/80 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                        {activeStageDetail}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>
                            {activeStageDetail === 1 && 'Stage 1: Registration'}
                            {activeStageDetail === 2 && 'Stage 2: Profile Submission'}
                            {activeStageDetail === 3 && 'Stage 3: Buyer Review'}
                            {activeStageDetail === 4 && 'Stage 4: Approved'}
                            {activeStageDetail === 5 && 'Stage 5: Ready for Transaction'}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            activeStageDetail === 1 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : activeStageDetail === 2
                              ? (isSubmitted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300')
                              : activeStageDetail === 3 && isSubmitted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {activeStageDetail === 1 && 'Buyer Registered ✓'}
                            {activeStageDetail === 2 && (isSubmitted ? 'Submitted by You ✓' : `In Progress • ${progressPercent}%`)}
                            {activeStageDetail === 3 && (isSubmitted ? 'Buyer Reviewing Now ●' : 'Awaiting Your Submission')}
                            {activeStageDetail === 4 && (isSubmitted ? 'Pending Buyer Approval' : 'Pending Review')}
                            {activeStageDetail === 5 && 'Authorized for PO, Invoices & Transactions'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          {activeStageDetail === 1 && 'Buyer registered your company and invited you to onboard with preliminary entity details.'}
                          {activeStageDetail === 2 && 'You complete and submit your profile details across all 6 sections: company info, contacts, tax W-9, banking ACH, and compliance.'}
                          {activeStageDetail === 3 && 'Buyer is reviewing the profile details and compliance documents submitted by you.'}
                          {activeStageDetail === 4 && 'Buyer approved the profile details and compliance documents submitted by you.'}
                          {activeStageDetail === 5 && 'Your profile is reviewed and approved. You are now authorized to receive purchase orders, send invoices, and exchange transaction-related documents.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {activeStageDetail === 2 && !isSubmitted && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveStageDetail(null);
                            const el = document.getElementById('onboarding-form-card');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center space-x-1"
                        >
                          <span>Go to Form</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveStageDetail(null)}
                        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                        title="Close details"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Post-Submission Status & Edit Option Banner */}
              {isSubmitted && (
                <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isEditingAfterSubmit 
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950' 
                    : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                }`}>
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isEditingAfterSubmit ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {isEditingAfterSubmit ? <Edit3 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>{isEditingAfterSubmit ? 'Application in Revision Mode' : 'Application Formally Submitted & Under Review'}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-current font-normal">
                          {activeInvitation.invitationCode}-SUBMITTED
                        </span>
                      </div>
                      <p className="text-[11px] opacity-85 mt-0.5">
                        {isEditingAfterSubmit 
                          ? 'You can now update any section. When finished, go to Section 6 to save and resubmit your updates.'
                          : `Submitted on ${submittedAt || 'Today'}. Procurement is reviewing your compliance records.`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isEditingAfterSubmit ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCancelEditing}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveStep(6)}
                          className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition shadow-xs flex items-center space-x-1"
                        >
                          <span>Review & Resubmit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="px-3.5 py-1.5 text-xs font-bold bg-white border border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-900 rounded-lg shadow-2xs transition flex items-center space-x-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Edit Application</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section Card */}
            <div id="onboarding-form-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Section Header with Context & Progress & Top Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>{isSubmitted ? 'STAGE 3: BUYER REVIEW' : 'STAGE 2: PROFILE SUBMISSION'}</span>
                    <span>/</span>
                    <span className="text-slate-600">SECTION {activeStep} OF 6</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{activeInvitation.buyerName}</span>
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-900 mt-1 flex items-center space-x-2">
                    <span>Section {activeStep}: {steps[activeStep - 1].title}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {steps[activeStep - 1].subtitle}
                  </p>
                </div>

                {/* Top Action Buttons (Save Draft, Edit, Resubmit, Submit) */}
                <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                  {/* Save Draft Button */}
                  {(!isSubmitted || isEditingAfterSubmit) && (
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                      title="Save Current Draft"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>{draftSavedState ? 'Draft Saved ✓' : 'Save Draft'}</span>
                    </button>
                  )}

                  {/* When already submitted and NOT in editing mode: Show Edit Application button */}
                  {isSubmitted && !isEditingAfterSubmit && (
                    <button
                      type="button"
                      onClick={handleStartEditing}
                      className="px-3.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-xl shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
                      title="Unlock sections to edit application"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Edit Application</span>
                    </button>
                  )}

                  {/* When in editing mode after submission: Show Cancel Edit & Resubmit buttons */}
                  {isEditingAfterSubmit && (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleFinalSubmit}
                        disabled={submitting}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submitting ? 'Resubmitting...' : 'Save & Resubmit'}</span>
                      </button>
                    </>
                  )}

                  {/* When on Section 6 and not submitted yet: Show Submit Application button at the top too! */}
                  {!isSubmitted && activeStep === 6 && (
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={submitting}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                    </button>
                  )}

                  <div className="border-l border-slate-200 pl-2 ml-1 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                      getStepStatus(activeStep) === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {getStepStatus(activeStep) === 'COMPLETED' ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5 font-mono">
                      {progressPercent}% Complete
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1: COMPANY PROFILE */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Legal Entity Name <span className="text-red-500">*</span></span>
                        <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">DOC</span>
                      </label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="e.g. Acme Industrial Tech Inc."
                        className={`w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border rounded-xl focus:outline-none transition-all ${
                          highlightField === 'legalName'
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50'
                            : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Doing Business As (Trade Name)
                      </label>
                      <input
                        type="text"
                        value={tradeName}
                        onChange={(e) => setTradeName(e.target.value)}
                        placeholder="e.g. Acme Tech Solutions"
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Registered Corporate Address <span className="text-red-500">*</span></span>
                        <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">DOC</span>
                      </label>
                      <input
                        type="text"
                        value={registeredAddress}
                        onChange={(e) => setRegisteredAddress(e.target.value)}
                        placeholder="Street address, Suite, City, State, ZIP"
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Country / Jurisdiction <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="United States">United States</option>
                        <option value="India">India</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: BUSINESS CONTACTS */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Primary Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Designation / Role
                      </label>
                      <input
                        type="text"
                        value={contactTitle}
                        onChange={(e) => setContactTitle(e.target.value)}
                        placeholder="e.g. Director of Operations"
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Official Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="elena@acmeindustrial.com"
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Business Phone <span className="text-red-500">*</span></span>
                        <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">DOC</span>
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+1 (512) 555-0199"
                        className={`w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border rounded-xl focus:outline-none transition-all ${
                          highlightField === 'contactPhone'
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50'
                            : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: TAX & LEGAL IDENTITY */}
              {activeStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Taxpayer Identification Number (EIN / TIN / GSTIN) <span className="text-red-500">*</span></span>
                        <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">DOC</span>
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="e.g. 84-1294812"
                        className={`w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border rounded-xl focus:outline-none transition-all ${
                          highlightField === 'taxId'
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50'
                            : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Entity Legal Classification <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={taxEntityType}
                        onChange={(e) => setTaxEntityType(e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Corporation">Corporation (C-Corp / S-Corp)</option>
                        <option value="LLC">Limited Liability Company (LLC)</option>
                        <option value="Private Limited">Private Limited Company</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Sole Proprietor">Sole Proprietorship</option>
                      </select>
                    </div>
                  </div>

                  {/* Tax Document Upload Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>IRS Form W-9 / Tax Residence Certificate</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Required for withholding compliance and 1099 annual filings.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSimulateDocumentUpload('IRS_W9_Verified_2026.pdf', 'TAX')}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition"
                      >
                        Upload / Replace W-9
                      </button>
                    </div>

                    {w9Uploaded && (
                      <div className="bg-white border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-slate-800">{w9FileName}</span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">VERIFIED</span>
                        </div>
                        <span className="text-[10px] text-slate-400">420 KB • SHA-256 Validated</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 4: BANKING & SETTLEMENT */}
              {activeStep === 4 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Beneficiary Account Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankBeneficiary}
                        onChange={(e) => setBankBeneficiary(e.target.value)}
                        placeholder="Acme Industrial Tech Inc."
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. JPMorgan Chase Bank"
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>ABA Routing Number / IFSC / SWIFT <span className="text-red-500">*</span></span>
                        <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">DOC</span>
                      </label>
                      <input
                        type="text"
                        value={bankRouting}
                        onChange={(e) => setBankRouting(e.target.value)}
                        placeholder="9-digit ABA Routing"
                        className={`w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border rounded-xl focus:outline-none transition-all ${
                          highlightField === 'bankRouting'
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50'
                            : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Account Number <span className="text-red-500">*</span></span>
                        <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">DOC</span>
                      </label>
                      <input
                        type="password"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Account Number"
                        className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bank Verification Letter / Voided Check */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span>Official Bank Letter or Voided Check</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Automated FedACH verification prevents electronic payment redirection fraud.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSimulateDocumentUpload('Chase_Voided_Check_Verification.pdf', 'BANK')}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition"
                      >
                        Upload Voided Check
                      </button>
                    </div>

                    {bankDocUploaded && (
                      <div className="bg-white border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-slate-800">{bankDocFileName}</span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">FEDACH VERIFIED</span>
                        </div>
                        <span className="text-[10px] text-slate-400">JPMorgan Chase Certified</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 5: COMPLIANCE & CERTIFICATIONS */}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Commercial Liability Carrier <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={insuranceCarrier}
                        onChange={(e) => setInsuranceCarrier(e.target.value)}
                        placeholder="e.g. Travelers Commercial Casualty"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        General Liability Coverage Limit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={insuranceCoverage}
                        onChange={(e) => setInsuranceCoverage(e.target.value)}
                        placeholder="$5,000,000 Aggregate"
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-800">Security & Operational Certifications</div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasIsoCert}
                          onChange={(e) => setHasIsoCert(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">ISO 27001 Certified</div>
                          <div className="text-[10px] text-slate-500">Information Security Management</div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasSoc2}
                          onChange={(e) => setHasSoc2(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">SOC 2 Type II Attestation</div>
                          <div className="text-[10px] text-slate-500">AICPA Trust Security Principles</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="esg-check"
                      checked={esgPolicyAgreed}
                      onChange={(e) => setEsgPolicyAgreed(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-0.5"
                    />
                    <label htmlFor="esg-check" className="text-xs text-emerald-950 cursor-pointer leading-relaxed">
                      <span className="font-bold">Enterprise Code of Conduct & Anti-Bribery Compliance:</span> We confirm compliance with {activeInvitation.buyerName}’s Supplier Code of Conduct, FCPA regulations, and modern labor standard policies.
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 6: REVIEW & SUBMIT */}
              {activeStep === 6 && (
                <div className="space-y-6">
                  
                  {/* Review Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>1. Company Profile</span>
                        <button onClick={() => setActiveStep(1)} className="text-emerald-700 hover:underline">Edit</button>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{legalName}</div>
                      <div className="text-[11px] text-slate-600 truncate">{registeredAddress}</div>
                      <div className="text-[11px] text-slate-500">{country} • {website}</div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>2. Business Contact</span>
                        <button onClick={() => setActiveStep(2)} className="text-emerald-700 hover:underline">Edit</button>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{contactName} ({contactTitle})</div>
                      <div className="text-[11px] text-slate-600">{contactEmail}</div>
                      <div className="text-[11px] text-slate-500">{contactPhone}</div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>3. Tax & Legal</span>
                        <button onClick={() => setActiveStep(3)} className="text-emerald-700 hover:underline">Edit</button>
                      </div>
                      <div className="text-xs font-bold text-slate-900">TIN: {taxId}</div>
                      <div className="text-[11px] text-slate-600">{taxEntityType}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">✓ Form W-9 attached & verified</div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>4. Banking & Settlement</span>
                        <button onClick={() => setActiveStep(4)} className="text-emerald-700 hover:underline">Edit</button>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{bankBeneficiary}</div>
                      <div className="text-[11px] text-slate-600">{bankName} (ABA: {bankRouting})</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">✓ Account ending in •••• 8210</div>
                    </div>
                  </div>

                  {/* When already submitted and NOT in editing mode: Show Submitted Dossier Card */}
                  {isSubmitted && !isEditingAfterSubmit ? (
                    <div className="bg-emerald-50/70 border-2 border-emerald-500/40 rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/80">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <CheckCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-950">
                              Application Formally Submitted to {activeInvitation.buyerName}
                            </div>
                            <div className="text-[11px] text-emerald-800 font-mono mt-0.5">
                              Ref: {activeInvitation.invitationCode}-SUBMITTED • {submittedAt || 'Today'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleStartEditing}
                          className="px-3.5 py-1.5 text-xs font-bold bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 rounded-xl shadow-2xs transition flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Edit Application</span>
                        </button>
                      </div>

                      <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-1">
                        <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Status: Stage 3 — Buyer Adjudication & Compliance Review</span>
                        </div>
                        <div className="text-[11px] text-slate-600 leading-relaxed">
                          Your compliance records and financial settlement details have been transmitted to procurement operations. If you need to make corrections or revise banking/tax details, click <strong>"Edit Application"</strong> above to unlock the form.
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Signatory Box (When drafting or in revision mode) */
                    <div className="space-y-3">
                      {declarationError && (
                        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-1">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-semibold">{declarationError}</span>
                        </div>
                      )}

                      <div 
                        id="digital-declaration-box" 
                        className={`bg-white border-2 rounded-xl p-5 space-y-4 transition-all ${
                          declarationError ? 'border-amber-400 ring-2 ring-amber-300/40' : 'border-emerald-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-900">
                            {isEditingAfterSubmit ? 'Revision Declaration & Re-Authorization' : 'Digital Signature & Formal Declaration'}
                          </div>
                          {isEditingAfterSubmit && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              REVISION MODE
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              Authorized Signatory Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={signatoryName}
                              onChange={(e) => {
                                setSignatoryName(e.target.value);
                                if (e.target.value.trim()) setDeclarationError(null);
                              }}
                              placeholder="Elena Rostova"
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              Corporate Title
                            </label>
                            <input
                              type="text"
                              value={signatoryTitle}
                              onChange={(e) => setSignatoryTitle(e.target.value)}
                              placeholder="Authorized Corporate Officer"
                              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <label className="flex items-start space-x-3 pt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={declarationAgreed}
                            onChange={(e) => {
                              setDeclarationAgreed(e.target.checked);
                              if (e.target.checked) setDeclarationError(null);
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-0.5 cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 leading-relaxed">
                            I declare under penalty of perjury that the information supplied is true, accurate, and complete. I am an authorized signatory legally empowered to bind {legalName} for B2B supplier onboarding.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION FOOTER: CRISP SINGLE-ARROW PREVIOUS, SAVE & NEXT / SUBMIT ACTIONS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition flex items-center space-x-1.5 ${
                    activeStep === 1
                      ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span>{draftSavedState ? 'Draft Saved ✓' : 'Save Draft'}</span>
                  </button>

                  {activeStep < 6 ? (
                    <button
                      type="button"
                      onClick={() => handleSaveAndContinue(activeStep + 1)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Next Section</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={submitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {submitting 
                          ? 'Transmitting Application...' 
                          : isEditingAfterSubmit 
                          ? 'Save & Resubmit Application' 
                          : isSubmitted 
                          ? 'Resubmit Application' 
                          : 'Submit Onboarding Application'
                        }
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            COLUMN 3: COPILOT AGENT PANEL (DOCK VIEW)
            (Strictly locked to h-full and never stretches outer page)
           ======================================================== */}
        {isDock && (
          <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-l border-slate-200 flex flex-col h-full max-h-full overflow-hidden shadow-xs bg-white">
            {renderCopilotContent()}
          </aside>
        )}

        {/* ========================================================
            FULL VIEW (Takes over whole workbench space)
           ======================================================== */}
        {isFull && (
          <div className="flex-1 h-full max-h-full flex flex-col overflow-hidden bg-slate-50">
            {renderCopilotContent()}
          </div>
        )}

      </div>

      {/* ========================================================
          FLOATER VIEW: DETACHED MOVABLE DRAGGABLE AGENT WINDOW
         ======================================================== */}
      {isFloat && (
        <div 
          style={{ 
            left: `${floatPos.x}px`, 
            top: `${floatPos.y}px` 
          }}
          className="fixed w-[430px] h-[620px] max-h-[85vh] z-[140] rounded-2xl shadow-2xl border border-slate-300 bg-white flex flex-col overflow-hidden animate-in fade-in"
        >
          {renderCopilotContent()}
        </div>
      )}

      {/* ========================================================
          MINIMIZED VIEW: FLOATING EXPAND ACTION BUTTON
         ======================================================== */}
      {isMinimized && (
        <button
          onClick={() => setCopilotViewMode('DOCK')}
          className="fixed bottom-6 right-6 z-[110] px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white rounded-2xl shadow-2xl shadow-emerald-950/40 flex items-center space-x-3 hover:scale-105 transition-all group border border-emerald-400/40 animate-in fade-in cursor-pointer"
          title="Click to open Ava Copilot Agent"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Ava Copilot</span>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-bold">ONLINE</span>
            </div>
            <div className="text-[10px] text-white/80">Click to expand assistant</div>
          </div>
        </button>
      )}

    </div>
  );
};
