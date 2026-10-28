import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { SupplierApplication, OnboardingDocument } from '../../types/index.js';
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
  RefreshCw, 
  Lock, 
  AlertTriangle, 
  Info,
  Bot,
  Search,
  Globe,
  FileSearch,
  Split,
  Maximize2,
  Minimize2,
  Check,
  Zap,
  ExternalLink,
  Mail,
  ChevronRight,
  Clock,
  Layers,
  Send,
  HelpCircle,
  X,
  Expand,
  AppWindow,
  Paperclip,
  Wrench,
  CheckCheck,
  FileCode,
  Terminal,
  ChevronDown,
  ChevronUp
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
  requirementsCount: number;
}

export type CopilotViewMode = 'SPLIT' | 'FULL' | 'FLOAT' | 'MINIMIZE';

export interface ToolCall {
  id: string;
  toolName: 'ocr_extraction' | 'registry_search' | 'master_autofill' | 'fedach_verify' | 'tin_verify';
  label: string;
  status: 'running' | 'completed' | 'failed';
  docFilename?: string;
  summary?: string;
  extractedFields?: Array<{ field: string; value: string; confidence?: string }>;
  registryData?: any;
  logs?: string[];
  applied?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'AGENT' | 'USER';
  text: string;
  time: string;
  attachedDoc?: {
    name: string;
    type: string;
    size?: string;
  };
  toolCall?: ToolCall;
}

export const OnboardingWizard: React.FC = () => {
  const { navigate, selectedAppId, routeState } = usePortal();
  const { currentUser } = useAuth();
  
  // Buyer Invitations State
  const [invitations] = useState<BuyerInvitation[]>([
    {
      id: 'inv-apex-01',
      buyerName: 'Apex Global Enterprises',
      buyerOrgId: 'buyer-org-1',
      invitationCode: 'INV-APEX-2026',
      category: 'Enterprise Cloud Infrastructure & Advanced Hardware',
      invitedBy: 'Marcus Vance, VP Strategic Procurement',
      invitedDate: 'Jan 14, 2026',
      status: 'IN_PROGRESS',
      requirementsCount: 6
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
      requirementsCount: 7
    },
    {
      id: 'inv-meridian-03',
      buyerName: 'Meridian Health Systems',
      buyerOrgId: 'buyer-org-3',
      invitationCode: 'INV-MERIDIAN-5519',
      category: 'Clinical Medical Devices & Sensor Nodes',
      invitedBy: 'David Chen, S2P Onboarding Director',
      invitedDate: '3 days ago',
      status: 'PENDING_INITIATION',
      requirementsCount: 5
    }
  ]);

  const [activeInvitation, setActiveInvitation] = useState<BuyerInvitation>(invitations[0]);
  const [app, setApp] = useState<SupplierApplication | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // 4 Copilot Viewing Modes: SPLIT (Side-by-Side), FULL (Full Tab), FLOAT (Draggable Floater), MINIMIZE (Floating Pill)
  const [copilotViewMode, setCopilotViewMode] = useState<CopilotViewMode>('SPLIT');
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [discoveredRegistryData, setDiscoveredRegistryData] = useState<any | null>(null);
  const [ocrExtractions, setOcrExtractions] = useState<any[]>([]);
  const [isCopilotExecuting, setIsCopilotExecuting] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  // Form states
  const [legalName, setLegalName] = useState('Acme Industrial Tech Inc.');
  const [tradeName, setTradeName] = useState('Acme Tech Solutions');
  const [registeredAddress, setRegisteredAddress] = useState('100 Industrial Parkway, Suite 400, Austin, TX 78701');
  const [website, setWebsite] = useState('https://acmeindustrialtech.example.com');

  const [contactName, setContactName] = useState('Elena Rostova');
  const [contactEmail, setContactEmail] = useState('elena@acmeindustrial.com');
  const [contactPhone, setContactPhone] = useState('+1 (512) 555-0199');

  const [taxId, setTaxId] = useState('84-1294812');
  const [taxEntityType, setTaxEntityType] = useState('Corporation');

  const [bankBeneficiary, setBankBeneficiary] = useState('Acme Industrial Tech Inc.');
  const [bankRouting, setBankRouting] = useState('021000021');
  const [bankAccount, setBankAccount] = useState('489201948210');

  const [uploadedDocs, setUploadedDocs] = useState<OnboardingDocument[]>([]);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [signatoryName, setSignatoryName] = useState('Elena Rostova, Managing Director');
  const [customInviteCode, setCustomInviteCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Copilot Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'AGENT',
      text: "👋 Hi! I am your Autonomous Onboarding Copilot. We are working side-by-side to complete vendor onboarding for " + invitations[0].buyerName + ". Ask me to auto-fill fields, verify bank routing, run OCR on certificates, or query official business registries.",
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Handle route state passed from Dashboard Task link
  useEffect(() => {
    if (routeState?.buyerOrgId) {
      const match = invitations.find(i => i.buyerOrgId === routeState.buyerOrgId);
      if (match) {
        setActiveInvitation(match);
      }
    }
    if (routeState?.autoCopilot) {
      setCopilotViewMode('SPLIT');
    }
  }, [routeState]);

  useEffect(() => {
    loadData();
  }, [selectedAppId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getApplications();
      if (res.applications && res.applications.length > 0) {
        const myApp = res.applications.find((a: any) => a.supplierOrgId === currentUser?.organizationId) || res.applications[0];
        setApp(myApp);

        // Fetch detailed fields
        const detail = await ApiClient.getApplication(myApp.id);
        if (detail.fields) {
          const getVal = (k: string) => detail.fields.find((f: any) => f.fieldKey === k)?.value || '';
          if (getVal('legal_entity_name')) setLegalName(getVal('legal_entity_name'));
          if (getVal('trade_name')) setTradeName(getVal('trade_name'));
          if (getVal('registered_address')) setRegisteredAddress(getVal('registered_address'));
          if (getVal('company_website')) setWebsite(getVal('company_website'));

          if (getVal('business_phone')) setContactPhone(getVal('business_phone'));
          if (getVal('tax_identifier')) setTaxId(getVal('tax_identifier'));
          if (getVal('bank_beneficiary_name')) setBankBeneficiary(getVal('bank_beneficiary_name'));
          if (getVal('bank_routing_number')) setBankRouting(getVal('bank_routing_number'));
          if (getVal('bank_account_number')) setBankAccount(getVal('bank_account_number'));
        }
        if (detail.documents) {
          setUploadedDocs(detail.documents);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Auto-Fill from Master Public Profile
  const handleAutoFillFromPublicProfile = () => {
    setLegalName('Acme Industrial Tech Inc.');
    setTradeName('Acme Tech Solutions');
    setRegisteredAddress('100 Industrial Parkway, Suite 400, Austin, TX 78701');
    setWebsite('https://acmeindustrialtech.example.com');
    setContactName(currentUser?.name || 'Elena Rostova');
    setContactEmail(currentUser?.email || 'elena@acmeindustrial.com');
    setContactPhone('+1 (512) 555-0199');
    setTaxId('84-1294812');
    setTaxEntityType('Corporation');
    setBankBeneficiary('Acme Industrial Tech Inc.');
    setBankRouting('021000021');
    setBankAccount('489201948210');
    setDeclarationAgreed(true);
    setSignatoryName(`${currentUser?.name || 'Elena Rostova'}, Authorized Signatory`);

    const mockVerifiedDocs: OnboardingDocument[] = [
      {
        id: 'doc-w9-verified',
        applicationId: app?.id || 'app-1',
        supplierOrgId: app?.supplierOrgId || 'supp-org-1',
        buyerOrgId: activeInvitation.buyerOrgId,
        title: 'IRS Form W-9 (Verified Taxpayer Certificate)',
        filename: 'IRS_W9_Verified_2026.pdf',
        fileType: 'application/pdf',
        storagePath: '/vault/tax/w9_2026.pdf',
        isExpired: false,
        uploadedRole: 'SUPPLIER',
        docType: 'IRS_W9',
        fileSize: 420000,
        checksum: 'sha256-9a4f21b7e029482104921bfe89218491',
        uploadedBy: 'Master Public Profile Sync',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'doc-acord-verified',
        applicationId: app?.id || 'app-1',
        supplierOrgId: app?.supplierOrgId || 'supp-org-1',
        buyerOrgId: activeInvitation.buyerOrgId,
        title: 'ACORD 25 Certificate of Liability ($5M Coverage)',
        filename: 'ACORD_25_Liability_Insurance.pdf',
        fileType: 'application/pdf',
        storagePath: '/vault/insurance/acord25.pdf',
        isExpired: false,
        uploadedRole: 'SUPPLIER',
        docType: 'CERT_INSURANCE_ACORD',
        fileSize: 680000,
        checksum: 'sha256-4b8921cf819401828491028391829104',
        uploadedBy: 'Master Public Profile Sync',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'doc-bank-verified',
        applicationId: app?.id || 'app-1',
        supplierOrgId: app?.supplierOrgId || 'supp-org-1',
        buyerOrgId: activeInvitation.buyerOrgId,
        title: 'JPMorgan Chase Official Bank Verification Letter',
        filename: 'Bank_Account_Verification_Letter.pdf',
        fileType: 'application/pdf',
        storagePath: '/vault/banking/chase_letter.pdf',
        isExpired: false,
        uploadedRole: 'SUPPLIER',
        docType: 'BANK_VERIFICATION_LETTER',
        fileSize: 310000,
        checksum: 'sha256-77192830192849102839102938491029',
        uploadedBy: 'Plaid Bank Sync',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'VERIFIED'
      }
    ];
    setUploadedDocs(mockVerifiedDocs);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setStatusMsg(`🎉 94% of Application Auto-Filled from Master Public Profile! 18 verified attributes populated for ${activeInvitation.buyerName}.`);
    
    setChatMessages(prev => [
      ...prev,
      {
        id: 'msg-sync-' + Date.now(),
        sender: 'AGENT',
        text: `⚡ Master Public Profile Sync Executed! I auto-populated Company Info, Contacts, Tax EIN (84-1294812), FedACH Bank routing (021000021), and attached 3 validated compliance files for ${activeInvitation.buyerName}.`,
        time: 'Just now'
      }
    ]);
  };

  // 1. Tool: Neural OCR Document Extraction
  const executeOcrTool = async (docType: string, filename: string) => {
    setIsCopilotExecuting(true);
    const toolCallId = 'tool-ocr-' + Date.now();
    const userMsgId = 'msg-user-' + Date.now();
    const agentMsgId = 'msg-agent-' + Date.now();

    // Add user prompt & initial calling agent message
    setChatMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'USER',
        text: `📄 Parse & extract verified attributes from ${filename} via Neural Vision OCR.`,
        time: 'Just now',
        attachedDoc: { name: filename, type: 'application/pdf' }
      },
      {
        id: agentMsgId,
        sender: 'AGENT',
        text: `Invoking internal tool: **neural_ocr_extract(document: "${filename}")**... Scanning bounding boxes and cryptographic digital signatures.`,
        time: 'Just now',
        toolCall: {
          id: toolCallId,
          toolName: 'ocr_extraction',
          label: 'Neural OCR Vision Model (IRS & Insurance)',
          status: 'running',
          docFilename: filename
        }
      }
    ]);

    await new Promise(r => setTimeout(r, 700));

    let extractions: any[] = [];
    if (docType === 'IRS_W9') {
      extractions = [
        { field: 'Legal Entity Name', value: 'Acme Industrial Tech Inc.', confidence: '99.8%' },
        { field: 'Employer Identification Number (EIN)', value: '84-1294812', confidence: '99.9%' },
        { field: 'Tax Classification', value: 'C-Corporation', confidence: '98.5%' },
        { field: 'Principal Address', value: '100 Industrial Parkway, Suite 400, Austin, TX 78701', confidence: '99.1%' }
      ];
    } else if (docType === 'ACORD_25') {
      extractions = [
        { field: 'Insurer Name', value: 'Travelers Indemnity Company', confidence: '99.4%' },
        { field: 'General Liability Limit', value: '$5,000,000 Aggregate ($2M Each Occurrence)', confidence: '99.7%' },
        { field: 'Policy Expiry Date', value: '2027-06-30', confidence: '99.5%' },
        { field: 'Additional Insured', value: activeInvitation.buyerName, confidence: '98.9%' }
      ];
    } else {
      extractions = [
        { field: 'Bank Name', value: 'JPMorgan Chase Bank, N.A.', confidence: '99.9%' },
        { field: 'ABA Routing Transit', value: '021000021', confidence: '100.0%' },
        { field: 'Account Number Ending', value: '•••• 8210', confidence: '99.6%' }
      ];
    }
    setOcrExtractions(extractions);

    setChatMessages(prev => prev.map(msg => {
      if (msg.id === agentMsgId && msg.toolCall) {
        return {
          ...msg,
          text: `Neural OCR successfully extracted **${extractions.length} certified attributes** from \`${filename}\` with >99% confidence. Review the results below and apply them to your form.`,
          toolCall: {
            ...msg.toolCall,
            status: 'completed',
            extractedFields: extractions,
            summary: `${extractions.length} attributes extracted with 99.6% avg confidence.`
          }
        };
      }
      return msg;
    }));

    setIsCopilotExecuting(false);
    setStatusMsg(`AI OCR extracted ${extractions.length} verified fields from ${filename}.`);
  };

  // 2. Tool: Official Registry & WebSearch Auto-Discovery
  const executeRegistrySearchTool = async () => {
    setIsCopilotExecuting(true);
    const toolCallId = 'tool-search-' + Date.now();
    const userMsgId = 'msg-user-' + Date.now();
    const agentMsgId = 'msg-agent-' + Date.now();

    setChatMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'USER',
        text: `🔍 Query official corporate registry & D-U-N-S records for "${legalName}".`,
        time: 'Just now'
      },
      {
        id: agentMsgId,
        sender: 'AGENT',
        text: `Invoking internal tool: **registry_web_search(entity: "${legalName}")** across state and federal databases...`,
        time: 'Just now',
        toolCall: {
          id: toolCallId,
          toolName: 'registry_search',
          label: 'Official State Division of Corporations & SEC EDGAR WebSearch',
          status: 'running',
          logs: []
        }
      }
    ]);

    const logs = [
      `[1/4] Querying Delaware Division of Corporations for "${legalName}"...`,
      `[2/4] File #7492102 found. State of Inc: Delaware. Status: ACTIVE / GOOD STANDING.`,
      `[3/4] Cross-referencing IRS TIN 84-1294812 with Federal e-Services database... Match confirmed.`,
      `[4/4] D-U-N-S Registry verified: #08-112-9482 with D&B Paydex rating 84.`
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setChatMessages(prev => prev.map(msg => {
        if (msg.id === agentMsgId && msg.toolCall) {
          return {
            ...msg,
            toolCall: {
              ...msg.toolCall,
              logs: [...(msg.toolCall.logs || []), logs[i]]
            }
          };
        }
        return msg;
      }));
    }

    const regData = {
      legalName: 'Acme Industrial Tech Inc.',
      duns: '08-112-9482',
      stateOfInc: 'Delaware (File #7492102)',
      goodStanding: 'Confirmed - Active',
      industryCode: 'NAICS 541512 - Computer Systems Design Services',
      secCik: '0001849201'
    };
    setDiscoveredRegistryData(regData);

    setChatMessages(prev => prev.map(msg => {
      if (msg.id === agentMsgId && msg.toolCall) {
        return {
          ...msg,
          text: `Corporate registry verification complete! Found Delaware charter #7492102 in **Active Good Standing** and confirmed D-U-N-S #08-112-9482.`,
          toolCall: {
            ...msg.toolCall,
            status: 'completed',
            registryData: regData,
            summary: 'Delaware Charter Active • D-U-N-S #08-112-9482 Confirmed'
          }
        };
      }
      return msg;
    }));

    setIsCopilotExecuting(false);
    setStatusMsg('Registry & Web Search Auto-Discovery complete: Active Good Standing confirmed.');
  };

  // 3. Tool: Universal Master Profile Sync & Auto-Fill
  const executeMasterAutoFillTool = async () => {
    setIsCopilotExecuting(true);
    const toolCallId = 'tool-fill-' + Date.now();
    const userMsgId = 'msg-user-' + Date.now();
    const agentMsgId = 'msg-agent-' + Date.now();

    setChatMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'USER',
        text: `⚡ Auto-fill entire application from Master Public Profile.`,
        time: 'Just now'
      },
      {
        id: agentMsgId,
        sender: 'AGENT',
        text: `Invoking internal tool: **master_profile_autofill()**... Mapping 18 verified attributes and 3 certified documents.`,
        time: 'Just now',
        toolCall: {
          id: toolCallId,
          toolName: 'master_autofill',
          label: 'Master Public Profile Auto-Fill Engine',
          status: 'running'
        }
      }
    ]);

    await new Promise(r => setTimeout(r, 600));

    handleAutoFillFromPublicProfile();

    setChatMessages(prev => prev.map(msg => {
      if (msg.id === agentMsgId && msg.toolCall) {
        return {
          ...msg,
          text: `⚡ Auto-Fill Complete! I populated 18 verified attributes across Steps 1–6 (Company Info, Tax EIN 84-1294812, FedACH Routing 021000021, and 3 attached compliance documents).`,
          toolCall: {
            ...msg.toolCall,
            status: 'completed',
            summary: '18 attributes populated • 3 verified certificates attached'
          }
        };
      }
      return msg;
    }));

    setIsCopilotExecuting(false);
  };

  // 4. Tool: FedACH Routing Verification
  const executeFedAchVerifyTool = async () => {
    setIsCopilotExecuting(true);
    const toolCallId = 'tool-fedach-' + Date.now();
    const userMsgId = 'msg-user-' + Date.now();
    const agentMsgId = 'msg-agent-' + Date.now();

    setChatMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'USER',
        text: `💳 Verify ABA Routing 021000021 with Federal Reserve FedACH directory.`,
        time: 'Just now'
      },
      {
        id: agentMsgId,
        sender: 'AGENT',
        text: `Invoking internal tool: **fedach_routing_lookup(aba: "021000021")**...`,
        time: 'Just now',
        toolCall: {
          id: toolCallId,
          toolName: 'fedach_verify',
          label: 'Federal Reserve FedACH Directory Service',
          status: 'running'
        }
      }
    ]);

    await new Promise(r => setTimeout(r, 500));

    setBankRouting('021000021');
    setBankBeneficiary('Acme Industrial Tech Inc.');

    setChatMessages(prev => prev.map(msg => {
      if (msg.id === agentMsgId && msg.toolCall) {
        return {
          ...msg,
          text: `Routing number \`021000021\` verified with Federal Reserve FedACH directory as **JPMorgan Chase Bank, N.A.**. Fedwire & Same-Day ACH enabled. Populated Step 4.`,
          toolCall: {
            ...msg.toolCall,
            status: 'completed',
            summary: 'JPMorgan Chase Bank, N.A. • Fedwire & ACH Enabled'
          }
        };
      }
      return msg;
    }));

    setIsCopilotExecuting(false);
    setStatusMsg('Bank routing 021000021 verified & populated.');
  };

  // 5. Tool: IRS TIN Matching
  const executeTinVerifyTool = async () => {
    setIsCopilotExecuting(true);
    const toolCallId = 'tool-tin-' + Date.now();
    const userMsgId = 'msg-user-' + Date.now();
    const agentMsgId = 'msg-agent-' + Date.now();

    setChatMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'USER',
        text: `🏢 Cross-check Employer Identification Number (EIN) 84-1294812 with IRS Business Master File.`,
        time: 'Just now'
      },
      {
        id: agentMsgId,
        sender: 'AGENT',
        text: `Invoking internal tool: **irs_tin_match(ein: "84-1294812", name: "${legalName}")**...`,
        time: 'Just now',
        toolCall: {
          id: toolCallId,
          toolName: 'tin_verify',
          label: 'IRS Business Master File & TIN Matching Service',
          status: 'running'
        }
      }
    ]);

    await new Promise(r => setTimeout(r, 500));

    setTaxId('84-1294812');
    setTaxEntityType('Corporation');

    setChatMessages(prev => prev.map(msg => {
      if (msg.id === agentMsgId && msg.toolCall) {
        return {
          ...msg,
          text: `IRS TIN \`84-1294812\` verified! Match confirmed with legal name "**Acme Industrial Tech Inc.**" under C-Corporation filing. Populated Step 3.`,
          toolCall: {
            ...msg.toolCall,
            status: 'completed',
            summary: 'IRS Match Confirmed • Active C-Corporation'
          }
        };
      }
      return msg;
    }));

    setIsCopilotExecuting(false);
    setStatusMsg('IRS TIN 84-1294812 verified & populated.');
  };

  const handleApplyOcrToForm = (toolCallId?: string) => {
    setTaxId('84-1294812');
    setLegalName('Acme Industrial Tech Inc.');
    setBankRouting('021000021');
    setStatusMsg('Applied OCR extracted fields directly to application form.');

    if (toolCallId) {
      setChatMessages(prev => prev.map(msg => {
        if (msg.toolCall && msg.toolCall.id === toolCallId) {
          return {
            ...msg,
            toolCall: { ...msg.toolCall, applied: true }
          };
        }
        return msg;
      }));
    }
  };

  const handleApplyDiscoveredData = (toolCallId?: string) => {
    if (discoveredRegistryData) {
      setLegalName(discoveredRegistryData.legalName);
      setStatusMsg('Applied verified registry entity name and corporate state records to application.');

      if (toolCallId) {
        setChatMessages(prev => prev.map(msg => {
          if (msg.toolCall && msg.toolCall.id === toolCallId) {
            return {
              ...msg,
              toolCall: { ...msg.toolCall, applied: true }
            };
          }
          return msg;
        }));
      }
    }
  };

  // Interactive Real-Time Form Filling via Chat Prompt
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const lower = userText.toLowerCase();
    setChatInput('');

    if (lower.includes('auto') || lower.includes('fill') || lower.includes('passport') || lower.includes('profile')) {
      executeMasterAutoFillTool();
      return;
    }
    if (lower.includes('ocr') || lower.includes('w9') || lower.includes('w-9') || lower.includes('scan') || lower.includes('extract')) {
      executeOcrTool('IRS_W9', 'IRS_W9_Signed_2026.pdf');
      return;
    }
    if (lower.includes('acord') || lower.includes('insurance')) {
      executeOcrTool('ACORD_25', 'ACORD_25_Liability_Insurance.pdf');
      return;
    }
    if (lower.includes('registry') || lower.includes('search') || lower.includes('delaware') || lower.includes('duns') || lower.includes('d-u-n-s')) {
      executeRegistrySearchTool();
      return;
    }
    if (lower.includes('bank') || lower.includes('routing') || lower.includes('ach')) {
      executeFedAchVerifyTool();
      return;
    }
    if (lower.includes('tax') || lower.includes('tin') || lower.includes('ein') || lower.includes('irs')) {
      executeTinVerifyTool();
      return;
    }

    // General conversational query
    const userMsgId = 'msg-user-' + Date.now();
    const agentMsgId = 'msg-agent-' + Date.now();

    setChatMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'USER', text: userText, time: 'Just now' }
    ]);

    setTimeout(() => {
      let reply = `I evaluated your request against ${activeInvitation.buyerName}'s procurement compliance policies for Step ${step} (${wizardSteps[step - 1].title}). Everything is set to continue, or you can trigger my internal tools (OCR, Registry Search, FedACH) using the buttons below.`;
      if (lower.includes('address') || lower.includes('company')) {
        reply = `For Step 1, we currently have legal name "${legalName}" and address "${registeredAddress}". If you want me to verify this against state filings, just tap "Search Official Registry".`;
      } else if (lower.includes('next') || lower.includes('ready')) {
        reply = `You have completed the essential requirements for Step ${step}. You can click "Continue" to advance or ask me to verify bank and tax attributes.`;
      }

      setChatMessages(prev => [
        ...prev,
        { id: agentMsgId, sender: 'AGENT', text: reply, time: 'Just now' }
      ]);
    }, 450);
  };

  const handleSaveStep = async (nextStep?: number) => {
    if (!app) return;
    setSaving(true);
    setStatusMsg('');
    try {
      if (step === 1) {
        await ApiClient.upsertField(app.id, { fieldKey: 'legal_entity_name', value: legalName });
        await ApiClient.upsertField(app.id, { fieldKey: 'trade_name', value: tradeName });
        await ApiClient.upsertField(app.id, { fieldKey: 'registered_address', value: registeredAddress });
        await ApiClient.upsertField(app.id, { fieldKey: 'company_website', value: website });
      } else if (step === 3) {
        await ApiClient.upsertField(app.id, { fieldKey: 'tax_identifier', value: taxId, isSensitive: true });
        await ApiClient.upsertField(app.id, { fieldKey: 'tax_entity_type', value: taxEntityType });
      } else if (step === 4) {
        await ApiClient.upsertField(app.id, { fieldKey: 'bank_beneficiary_name', value: bankBeneficiary });
        await ApiClient.upsertField(app.id, { fieldKey: 'bank_routing_number', value: bankRouting, isSensitive: true });
        await ApiClient.upsertField(app.id, { fieldKey: 'bank_account_number', value: bankAccount, isSensitive: true });
      }

      setStatusMsg('Step progress saved automatically.');
      if (nextStep) setStep(nextStep);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!app) return;
    if (!declarationAgreed || !signatoryName.trim()) {
      alert('Please check the compliance declaration box and provide your digital signature name.');
      return;
    }

    setSubmitting(true);
    try {
      await handleSaveStep();
      const target = app.status === 'CHANGES_REQUESTED' ? 'RESUBMITTED' : 'SUBMITTED';
      const res = await ApiClient.transitionApplication(app.id, target, `Supplier completed onboarding flow for ${activeInvitation.buyerName}.`);
      
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      alert(`Application ${res.application.caseReference} for ${activeInvitation.buyerName} submitted successfully for procurement activation!`);
      navigate('/onboarding/status');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const wizardSteps = [
    { num: 1, title: 'Company Profile', icon: Building2 },
    { num: 2, title: 'Business Contacts', icon: Users },
    { num: 3, title: 'Tax & Legal', icon: FileText },
    { num: 4, title: 'Banking Info', icon: CreditCard },
    { num: 5, title: 'Document Vault', icon: UploadCloud },
    { num: 6, title: 'Compliance & ESG', icon: ShieldCheck },
    { num: 7, title: 'Review & Submit', icon: CheckCircle2 },
  ];

  if (loading || !app) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <span>Loading Autonomous Onboarding Hub...</span>
      </div>
    );
  }

  // Determine container grid classes based on copilotViewMode
  const isSplit = copilotViewMode === 'SPLIT';
  const isFull = copilotViewMode === 'FULL';
  const isFloat = copilotViewMode === 'FLOAT';
  const isMinimized = copilotViewMode === 'MINIMIZE';

  return (
    <div className="space-y-5">
      {/* 1. INCOMING BUYER ONBOARDING REQUESTS & INITIATION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Incoming Buyer Onboarding Requests ({invitations.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise procurement teams initiate requests with customized compliance requirements. Select a request to start onboarding.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3 py-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>+ Enter Buyer Invitation Code</span>
          </button>
        </div>

        {/* Invitation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {invitations.map((inv) => {
            const isSelected = activeInvitation.id === inv.id;
            return (
              <div
                key={inv.id}
                onClick={() => {
                  setActiveInvitation(inv);
                  setStatusMsg(`Switched onboarding workflow to ${inv.buyerName}`);
                  setChatMessages(prev => [
                    ...prev,
                    {
                      id: 'msg-invite-' + Date.now(),
                      sender: 'AGENT',
                      text: `Switched active onboarding context to ${inv.buyerName}. All requirements and questionnaires updated!`,
                      time: 'Just now'
                    }
                  ]);
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{inv.buyerName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      inv.status === 'IN_PROGRESS' 
                        ? 'bg-sky-100 text-sky-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {inv.status === 'IN_PROGRESS' ? 'In Progress' : 'Ready to Onboard'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{inv.category}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{inv.invitationCode}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-600">{inv.requirementsCount} Policy Requirements</span>
                  <span className={`flex items-center gap-1 ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    <span>{isSelected ? 'Active Workflow' : 'Initiate'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 1-CLICK QUICK-FILL FROM MASTER PUBLIC PROFILE BANNER */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
              Universal Master Public Profile
            </span>
            <span className="text-xs text-emerald-100 font-medium">99.4% Verified • Ready to Sync</span>
          </div>
          <h3 className="text-base font-bold tracking-tight">
            Fast-Track Onboarding for {activeInvitation.buyerName}
          </h3>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Your Master Public Profile contains 18 verified attributes (W-9, TIN, FedACH Bank Routing, SOC 2, and ACORD 25). Auto-populate this application with zero manual re-entry.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleAutoFillFromPublicProfile}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-emerald-800 rounded-xl text-xs font-bold shadow-lg transition transform hover:scale-105 flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>1-Click Auto-Fill from Public Profile</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {statusMsg && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-r-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg('')} className="text-emerald-700 font-bold hover:underline">✕</button>
        </div>
      )}

      {/* Wizard Form Header */}
      <div className="flex flex-wrap items-center justify-between text-xs px-1 gap-2 border-b border-slate-100 pb-2">
        <div className="text-slate-500 flex items-center space-x-1.5">
          <span>Onboarding for: <strong className="text-slate-900">{activeInvitation.buyerName}</strong></span>
          <span>•</span>
          <span className="font-semibold text-slate-700">Step {step} of 7: {wizardSteps[step - 1].title}</span>
        </div>

        {/* Quick button to open side view if currently minimized or floating */}
        {(isMinimized || isFloat) && (
          <button
            onClick={() => setCopilotViewMode('SPLIT')}
            className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Open Copilot (Side View)</span>
          </button>
        )}
      </div>

      {/* 3. MAIN WORKBENCH: FORM + DOCKED/SPLIT/FLOAT AI AGENT */}
      <div className={`grid grid-cols-1 ${isSplit ? 'lg:grid-cols-12' : ''} gap-5 items-start`}>
        {/* LEFT PANE: WIZARD FORM (Hidden only when FULL agent view is chosen) */}
        {!isFull && (
          <div className={`${isSplit ? 'lg:col-span-7' : 'w-full'} space-y-4`}>
            {/* Step Progression Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-between min-w-[540px]">
                {wizardSteps.map((s, idx) => {
                  const Icon = s.icon;
                  const isCompleted = step > s.num;
                  const isCurrent = step === s.num;
                  return (
                    <React.Fragment key={s.num}>
                      <div
                        onClick={() => setStep(s.num)}
                        className={`flex flex-col items-center cursor-pointer transition ${
                          isCurrent ? 'scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-slate-900 text-white ring-2 ring-emerald-500'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${
                          isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'
                        }`}>
                          {s.title}
                        </span>
                      </div>
                      {idx < wizardSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              {/* STEP 1: COMPANY PROFILE */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Step 1: Registered Company Profile</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Official entity name as registered with corporate registries.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Legal Entity Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Trade Name / DBA (Optional)
                      </label>
                      <input
                        type="text"
                        value={tradeName}
                        onChange={(e) => setTradeName(e.target.value)}
                        placeholder="e.g. Acme Tech Solutions"
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Headquarters Registered Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={registeredAddress}
                        onChange={(e) => setRegisteredAddress(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Corporate Website
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: BUSINESS CONTACTS */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Step 2: Business & Billing Contacts</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Authorized points of contact for purchase orders, remittance advices, and notices.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary Contact Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Accounts Payable Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Business Phone
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: TAX & LEGAL */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Step 3: Tax Identification & Classification</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Required for IRS Form 1099 reporting and backup withholding certification.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                    <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>
                      Federal procurement guidelines require verifying vendor Taxpayer Identification Numbers (TIN) with IRS databases prior to issuing automated purchase orders.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Employer Identification Number (EIN / TIN) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="e.g. 84-1294812"
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tax Entity Classification <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={taxEntityType}
                        onChange={(e) => setTaxEntityType(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                      >
                        <option value="Corporation">C-Corporation</option>
                        <option value="S_Corporation">S-Corporation</option>
                        <option value="LLC">Limited Liability Company (LLC)</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Non_Profit">Non-Profit / Tax Exempt</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: BANKING INFO */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Step 4: Secure Electronic Remittance</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct deposit ACH and Wire transfer instructions with FedACH validation.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Nacha Anti-Fraud Rule:</strong> Account beneficiary name must match your legal entity. Routing numbers are validated with Federal Reserve FedACH directories.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Beneficiary Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankBeneficiary}
                        onChange={(e) => setBankBeneficiary(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Routing Number (ABA - 9 Digits) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankRouting}
                        onChange={(e) => setBankRouting(e.target.value)}
                        placeholder="021000021"
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bank Account Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: DOCUMENT VAULT & OCR */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Step 5: Compliance Documents & OCR</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Attach tax forms and certificates. AI agent auto-parses key identifiers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => executeOcrTool('IRS_W9', 'IRS_W9_Signed_2026.pdf')}
                      className="p-3.5 border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-center space-y-1 transition hover:bg-emerald-50/20 group"
                    >
                      <UploadCloud className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-slate-800">+ Upload IRS W-9</div>
                      <div className="text-[10px] text-slate-400">PDF, Taxpayer Certificate</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => executeOcrTool('ACORD_25', 'ACORD_25_Liability_Insurance.pdf')}
                      className="p-3.5 border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-center space-y-1 transition hover:bg-emerald-50/20 group"
                    >
                      <UploadCloud className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-slate-800">+ Upload ACORD 25</div>
                      <div className="text-[10px] text-slate-400">PDF, min $2M liability</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => executeOcrTool('BANK_LETTER', 'Bank_Account_Verification_Letter.pdf')}
                      className="p-3.5 border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-center space-y-1 transition hover:bg-emerald-50/20 group"
                    >
                      <UploadCloud className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-slate-800">+ Upload Bank Letter</div>
                      <div className="text-[10px] text-slate-400">Voided check or Plaid letter</div>
                    </button>
                  </div>

                  {/* Attached docs list */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-slate-700">Attached Certificates ({uploadedDocs.length})</h4>
                    {uploadedDocs.map(doc => (
                      <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800">{doc.title}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Verified by: {doc.uploadedBy}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          100% Validated
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: COMPLIANCE & ESG */}
              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Step 6: Compliance Declarations & Policy Governance</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Attestations tailored to {activeInvitation.buyerName}'s supplier code of conduct.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1 text-xs">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-900">Anti-Bribery & FCPA Attestation</div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Supplier certifies compliance with Foreign Corrupt Practices Act and UK Bribery Act standards.
                      </p>
                      <label className="flex items-center space-x-2 pt-1 font-semibold text-emerald-800 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span>Certified & Signed</span>
                      </label>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-900">Human Rights & Fair Labor Declaration</div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Supplier certifies strict adherence to ILO Core Labor Standards and zero child or forced labor in supply operations.
                      </p>
                      <label className="flex items-center space-x-2 pt-1 font-semibold text-emerald-800 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span>Certified & Signed</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: REVIEW & SUBMIT */}
              {step === 7 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Step 7: Final Attestation & Legal Signature</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify complete application summary before routing to {activeInvitation.buyerName}.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div><span className="text-slate-400">Buyer Target:</span> <strong className="text-slate-900">{activeInvitation.buyerName}</strong></div>
                      <div><span className="text-slate-400">Legal Entity:</span> <strong className="text-slate-900">{legalName}</strong></div>
                      <div><span className="text-slate-400">Tax EIN:</span> <strong className="text-slate-900 font-mono">{taxId}</strong></div>
                      <div><span className="text-slate-400">Bank Routing:</span> <strong className="text-slate-900 font-mono">{bankRouting}</strong></div>
                      <div><span className="text-slate-400">Documents Attached:</span> <strong className="text-slate-900">{uploadedDocs.length} Verified Files</strong></div>
                      <div><span className="text-slate-400">Master Profile Score:</span> <strong className="text-emerald-700">99.4% Verified</strong></div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarationAgreed}
                        onChange={(e) => setDeclarationAgreed(e.target.checked)}
                        className="rounded text-emerald-600 mt-0.5"
                      />
                      <span>
                        I declare under penalty of perjury that the information provided is accurate, authorized by corporate officers, and supported by legal certificates.
                      </span>
                    </label>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Digital Signatory Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep(prev => prev - 1)}
                  className="flex items-center space-x-1 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveStep()}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>

                  {step < 7 ? (
                    <button
                      type="button"
                      onClick={() => handleSaveStep(step + 1)}
                      className="flex items-center space-x-1 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting || !declarationAgreed || !signatoryName}
                      onClick={handleSubmitApplication}
                      className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Submit Application to {activeInvitation.buyerName}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PANE: DOCKED / SPLIT / FULL COPILOT AGENT */}
        {(isSplit || isFull) && (
          <div className={`${isFull ? 'w-full' : 'lg:col-span-5'} bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 sm:p-5 text-white space-y-3.5 sticky top-20`}>
            {/* AGENT STRIP: Copilot Identity & Mode Toggles (Side View, Full, Floater, Minimize) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Autonomous Onboarding Copilot
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Claude & GPT Vision
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">Agentic S2P • Real-Time Form Intelligence</div>
                </div>
              </div>

              {/* View Options on Strip: Side View, Full Tab, Floater, Minimize */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCopilotViewMode('SPLIT')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                    copilotViewMode === 'SPLIT'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Side-by-Side Docked View"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Side View</span>
                </button>

                <button
                  onClick={() => setCopilotViewMode('FULL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                    copilotViewMode === 'FULL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Full Tab View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Full</span>
                </button>

                <button
                  onClick={() => setCopilotViewMode('FLOAT')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Floating Window View"
                >
                  <AppWindow className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Floater</span>
                </button>

                <button
                  onClick={() => setCopilotViewMode('MINIMIZE')}
                  className="p-1.5 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Minimize Copilot"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* INTERNAL TOOLS CAPABILITY STRIP (No Separate Tabs!) */}
            <div className="flex flex-wrap items-center justify-between bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800/80 text-xs gap-1.5">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-300">Internal Capabilities:</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60 text-emerald-300 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" /> Neural OCR
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60 text-sky-300 font-medium flex items-center gap-1">
                  <Globe className="w-3 h-3 text-sky-400" /> WebSearch
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60 text-indigo-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Auto-Fill
                </span>
              </div>
            </div>

            {/* CONVERSATION STREAM WITH RICH INLINE TOOL CALL CARDS */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 max-h-[380px] overflow-y-auto text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-xs leading-relaxed space-y-2 transition ${
                    msg.sender === 'AGENT'
                      ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                      : 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-100 ml-4'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {msg.sender === 'AGENT' ? (
                        <>
                          <Bot className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-white font-bold">Autonomous Copilot</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="text-emerald-300 font-bold">You (Supplier)</span>
                        </>
                      )}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                  </div>

                  {/* Attached Document Pill if present */}
                  {msg.attachedDoc && (
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-[10px] text-sky-300 font-mono">
                      <Paperclip className="w-3 h-3 text-sky-400" />
                      <span>{msg.attachedDoc.name}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* INLINE TOOL CALL EXECUTION CARD (Like Claude Artifacts & GPT Tool Calls) */}
                  {msg.toolCall && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 shadow-inner">
                      {/* Tool Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-mono text-[11px] font-bold text-indigo-300">{msg.toolCall.label}</span>
                        </div>
                        {msg.toolCall.status === 'running' ? (
                          <span className="flex items-center space-x-1 text-[10px] text-amber-400 font-mono">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Executing...</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                            <Check className="w-3 h-3" />
                            <span>Completed (99.8% Conf)</span>
                          </span>
                        )}
                      </div>

                      {/* Tool Call 1: OCR Extraction Results */}
                      {msg.toolCall.toolName === 'ocr_extraction' && msg.toolCall.extractedFields && (
                        <div className="space-y-2 pt-1">
                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span>Target: <code className="text-slate-200">{msg.toolCall.docFilename}</code></span>
                            <span className="text-emerald-400 font-mono">Confidence: 99.8%</span>
                          </div>

                          <div className="space-y-1 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                            {msg.toolCall.extractedFields.map((field, fIdx) => (
                              <div key={fIdx} className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">{field.field}:</span>
                                <span className="font-semibold text-white font-mono">{field.value}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => handleApplyOcrToForm(msg.toolCall?.id)}
                            disabled={msg.toolCall.applied}
                            className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                              msg.toolCall.applied
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            }`}
                          >
                            {msg.toolCall.applied ? (
                              <>
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Applied to Step 1 & 3 Fields</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Apply Extracted Fields to Form</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Tool Call 2: Registry Search Streaming Logs & Results */}
                      {msg.toolCall.toolName === 'registry_search' && (
                        <div className="space-y-2 pt-1">
                          {msg.toolCall.logs && msg.toolCall.logs.length > 0 && (
                            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 font-mono text-[10px] text-emerald-400/90 space-y-1">
                              {msg.toolCall.logs.map((log, lIdx) => (
                                <div key={lIdx} className="leading-tight">{log}</div>
                              ))}
                            </div>
                          )}

                          {msg.toolCall.registryData && (
                            <div className="space-y-2">
                              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 text-[11px] space-y-1">
                                <div className="flex items-center justify-between font-bold text-slate-200">
                                  <span>{msg.toolCall.registryData.legalName}</span>
                                  <span className="text-emerald-400 text-[10px]">Good Standing</span>
                                </div>
                                <div className="text-slate-400">
                                  Charter: <strong className="text-slate-200">{msg.toolCall.registryData.stateOfInc}</strong>
                                </div>
                                <div className="text-slate-400">
                                  D-U-N-S: <code className="text-indigo-400 font-mono font-bold">{msg.toolCall.registryData.duns}</code>
                                </div>
                              </div>

                              <button
                                onClick={() => handleApplyDiscoveredData(msg.toolCall?.id)}
                                disabled={msg.toolCall.applied}
                                className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                                  msg.toolCall.applied
                                    ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 cursor-default'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                                }`}
                              >
                                {msg.toolCall.applied ? (
                                  <>
                                    <CheckCheck className="w-3.5 h-3.5 text-indigo-300" />
                                    <span>Applied Registry Records</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Apply Verified Registry Data to Profile</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tool Call 3: Master Profile Auto-Fill */}
                      {msg.toolCall.toolName === 'master_autofill' && (
                        <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                            <CheckCheck className="w-4 h-4" />
                            <span>18 Attributes Populated • 3 Certified Documents Attached</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Populated Step 1 (Company), Step 2 (Contacts), Step 3 (IRS TIN 84-1294812), and Step 4 (FedACH Routing 021000021).
                          </div>
                        </div>
                      )}

                      {/* Tool Call 4: FedACH Verify */}
                      {msg.toolCall.toolName === 'fedach_verify' && (
                        <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">JPMorgan Chase Bank, N.A.</span>
                            <span className="text-[10px] text-emerald-400 font-mono">Routing: 021000021</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Fedwire & Same-Day ACH Active • Head Office: New York, NY
                          </div>
                        </div>
                      )}

                      {/* Tool Call 5: IRS TIN Verify */}
                      {msg.toolCall.toolName === 'tin_verify' && (
                        <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">Acme Industrial Tech Inc.</span>
                            <span className="text-[10px] text-emerald-400 font-mono">EIN: 84-1294812</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            IRS BMF Status: Verified Active C-Corporation
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* QUICK TOOL CAPABILITY SHORTCUTS (Starters) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                <span>Invoke Internal Agent Tools:</span>
                <span className="text-emerald-400">1-Click Auto-Populate</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => executeMasterAutoFillTool()}
                  disabled={isCopilotExecuting}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>⚡ Auto-Fill Everything</span>
                </button>
                <button
                  onClick={() => executeOcrTool('IRS_W9', 'IRS_W9_Signed_2026.pdf')}
                  disabled={isCopilotExecuting}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span>📄 Parse W-9 via OCR</span>
                </button>
                <button
                  onClick={() => executeOcrTool('ACORD_25', 'ACORD_25_Liability_Insurance.pdf')}
                  disabled={isCopilotExecuting}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-sky-400" />
                  <span>🛡️ Parse ACORD 25</span>
                </button>
                <button
                  onClick={() => executeRegistrySearchTool()}
                  disabled={isCopilotExecuting}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition flex items-center gap-1"
                >
                  <Globe className="w-3 h-3 text-indigo-400" />
                  <span>🔍 Search Official Registry</span>
                </button>
                <button
                  onClick={() => executeFedAchVerifyTool()}
                  disabled={isCopilotExecuting}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 transition flex items-center gap-1"
                >
                  <CreditCard className="w-3 h-3 text-sky-400" />
                  <span>💳 Verify Bank Routing</span>
                </button>
                <button
                  onClick={() => executeTinVerifyTool()}
                  disabled={isCopilotExecuting}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition flex items-center gap-1"
                >
                  <Building2 className="w-3 h-3 text-amber-400" />
                  <span>🏢 Verify IRS TIN</span>
                </button>
              </div>
            </div>

            {/* CHAT INPUT AREA (Claude / ChatGPT style with Paperclip Attachment Dropdown) */}
            <div className="relative pt-1">
              {/* Attachment Dropdown Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-14 left-0 z-30 w-72 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Attach Document for Neural OCR
                  </div>
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      executeOcrTool('IRS_W9', 'IRS_W9_Signed_2026.pdf');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition flex items-center space-x-2 text-xs text-white"
                  >
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold">IRS Form W-9 (Signed 2026)</div>
                      <div className="text-[10px] text-slate-400">Extract Tax ID, C-Corp, Address</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      executeOcrTool('ACORD_25', 'ACORD_25_Liability_Insurance.pdf');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition flex items-center space-x-2 text-xs text-white"
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="font-semibold">ACORD 25 Certificate of Liability</div>
                      <div className="text-[10px] text-slate-400">$5M Coverage & Expiry Analysis</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      executeOcrTool('BANK_LETTER', 'JPMorgan_Chase_Bank_Letter.pdf');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition flex items-center space-x-2 text-xs text-white"
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Bank Account Verification Letter</div>
                      <div className="text-[10px] text-slate-400">Verify Account & ABA Transit</div>
                    </div>
                  </button>
                </div>
              )}

              <form onSubmit={handleSendChat} className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={`p-2.5 rounded-xl border transition ${
                    showAttachMenu
                      ? 'bg-slate-800 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Attach document for OCR"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Copilot (e.g., 'Fill bank details', 'Verify insurance')..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* FLOATER VIEW (When copilotViewMode === 'FLOAT') */}
      {isFloat && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[95vw] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-4 text-white space-y-3 animate-in slide-in-from-bottom-5">
          {/* Floater Header Strip with View Toggles */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-white">Copilot Agent (Floater)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCopilotViewMode('SPLIT')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-semibold flex items-center gap-1"
                title="Dock Side-by-Side"
              >
                <Split className="w-3 h-3" />
                <span>Dock Side View</span>
              </button>
              <button
                onClick={() => setCopilotViewMode('FULL')}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Full Tab"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCopilotViewMode('MINIMIZE')}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Floater Chat Messages */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-h-56 overflow-y-auto text-xs space-y-2">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg text-xs leading-relaxed ${
                  msg.sender === 'AGENT'
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-100 ml-3'
                }`}
              >
                <span className="text-[9px] text-slate-400 block font-semibold mb-0.5">
                  {msg.sender === 'AGENT' ? 'Autonomous Copilot' : 'You'}:
                </span>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Quick Trigger Chips in Floater */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => executeMasterAutoFillTool()}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Auto-Fill Everything</span>
            </button>
            <button
              onClick={() => executeOcrTool('IRS_W9', 'IRS_W9_Signed_2026.pdf')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold transition"
            >
              <span>📄 Parse W-9</span>
            </button>
            <button
              onClick={() => executeRegistrySearchTool()}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold transition"
            >
              <span>🔍 Registry Search</span>
            </button>
          </div>

          {/* Input Box in Floater */}
          <form onSubmit={handleSendChat} className="flex items-center space-x-1.5 pt-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Copilot..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* MINIMIZED FLOATING BUTTON (When copilotViewMode === 'MINIMIZE') */}
      {isMinimized && (
        <button
          onClick={() => setCopilotViewMode('SPLIT')}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold rounded-full shadow-2xl transition transform hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Bot className="w-4 h-4 text-white" />
          <span>Autonomous Copilot (Click to Dock Side View)</span>
        </button>
      )}

      {/* MODAL: ENTER BUYER INVITATION CODE */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Enter Buyer Invitation Code</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Suppliers received an onboarding invitation by email from an enterprise buyer procurement team. Enter the invitation token to unlock tailored requirements.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customInviteCode.trim()) return;
                setShowInviteModal(false);
                setStatusMsg(`Invitation code ${customInviteCode} validated! Tailored policy requirements loaded.`);
                setCustomInviteCode('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invitation Code</label>
                <input
                  type="text"
                  value={customInviteCode}
                  onChange={(e) => setCustomInviteCode(e.target.value)}
                  placeholder="e.g. INV-NOVATECH-2026"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-mono uppercase"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Unlock & Initiate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
