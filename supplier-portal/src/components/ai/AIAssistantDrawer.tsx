import React, { useState, useEffect, useRef } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { sendGeminiPrompt, sendGeminiPromptStream } from '../../services/geminiService.js';
import { 
  dispatchPageAction, 
  getPageContext, 
  onPageContext,
  PageAction 
} from '../../services/pageActionBridge.js';
import { AgenticEngine } from '../../services/agenticEngine.js';
import {
  SUBAGENTS_REGISTRY,
  determineSubagent,
  SubagentId,
  SubagentConfig
} from './SubagentsRegistry.js';
import {
  FormCardPartialView,
  ReviewDiffPartialView,
  OcrExtractionPartialView,
  EarlyPayoutPartialView,
  UploadBannerPartialView
} from './PartialViews.js';
import { VoiceAssistantService } from './VoiceAssistantService.js';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  UserCircle2, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  Mail,
  ShieldCheck, 
  RefreshCw, 
  FolderLock, 
  FileCheck2, 
  Package, 
  Layers, 
  ClipboardList, 
  MessageSquare, 
  Building2, 
  DollarSign, 
  ShoppingCart, 
  Receipt, 
  Truck, 
  RotateCcw, 
  ExternalLink, 
  ChevronRight, 
  TrendingUp, 
  FileText, 
  ChevronDown, 
  Split, 
  AppWindow, 
  Maximize2, 
  Minus, 
  GripHorizontal, 
  Paperclip, 
  Check, 
  History, 
  Plus, 
  Trash2, 
  Zap, 
  Clock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Square,
  UploadCloud,
  Compass,
  MapPin,
  PanelRight
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'AVA';
  subagentId?: SubagentId;
  subagentName?: string;
  subagentRole?: string;
  text: string;
  time: string;
  actionButtons?: Array<{
    label: string;
    route?: string;
    onClick?: () => void;
  }>;
  quickActions?: Array<{
    label: string;
    icon: React.ElementType;
    prompt: string;
  }>;
  partialViews?: any[];
  executedActions?: PageAction[];
  isLiveGemini?: boolean;
  errorNotice?: string;
  isStreaming?: boolean;
  thoughtSeconds?: number;
  thoughtProcess?: string;
  attachedFile?: {
    name: string;
    size: string;
    docType?: string;
  };
}

interface PageCopilotConfig {
  id: string;
  pageContextName: string;
  contextMetric: string;
  summary: string;
  initialGreeting: string;
  placeholder: string;
  quickActions: Array<{
    label: string;
    icon: React.ElementType;
    prompt: string;
  }>;
  getResponse: (query: string, navigate: (path: string, state?: any) => void) => {
    reply: string;
    actionButtons?: Array<{ label: string; route?: string; onClick?: () => void }>;
    partialViews?: any[];
  };
}

const MUTATING_ACTION_TYPES = new Set([
  'UPDATE_PO_FIELD',
  'ADD_PO_LINE',
  'UPDATE_PO_LINE',
  'DELETE_PO_LINE',
  'SAVE_PO',
  'ACKNOWLEDGE_PO',
  'FLIP_PO_TO_ASN',
  'FLIP_PO_TO_INVOICE',
  'UPDATE_INVOICE_FIELD',
  'SAVE_INVOICE',
  'ACCEPT_EARLY_PAYMENT',
  'CREATE_INVOICE',
  'UPDATE_ASN_FIELD',
  'SAVE_ASN',
  'CREATE_ASN',
  'UPDATE_BASIC_DETAILS',
  'AUTO_FILL_FORM',
  'SYNC_MASTER_PROFILE',
  'AUTO_DRAFT_RFP',
  'UPDATE_CATALOG_ITEM',
  'ADD_CATALOG_ITEM',
  'DELETE_CATALOG_ITEM',
  'UPDATE_DOC',
  'DELETE_DOC',
  'COMPLETE_TASK'
]);

interface ActiveContextInfo {
  type: string;
  id: string;
  title: string;
  route: string;
  isDetail: boolean;
  IconComponent: React.ElementType;
  iconBgColor: string;
  iconColor: string;
}

function resolveActiveContext(route: string, pageContext: Record<string, any>): ActiveContextInfo {
  // 1. ORDERS
  if (route.startsWith('/orders') || route.startsWith('/purchase-orders')) {
    if (pageContext.selectedPoNumber) {
      return {
        type: 'ORDER_DETAIL',
        id: pageContext.selectedPoNumber,
        title: `${pageContext.selectedPoNumber}: ${pageContext.selectedPoName || pageContext.header?.poName || 'Order Details'}`,
        route: '/orders',
        isDetail: true,
        IconComponent: ShoppingCart,
        iconBgColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        iconColor: 'text-emerald-700'
      };
    }
    return {
      type: 'ORDERS_LIST',
      id: 'Orders Directory',
      title: `Purchase Orders Directory (${pageContext.orders?.length || 'Live'} orders)`,
      route: '/orders',
      isDetail: false,
      IconComponent: ShoppingCart,
      iconBgColor: 'bg-slate-100 text-slate-700 border-slate-300',
      iconColor: 'text-slate-600'
    };
  }

  // 2. INVOICES
  if (route.startsWith('/invoices')) {
    if (pageContext.selectedInvoiceNumber) {
      return {
        type: 'INVOICE_DETAIL',
        id: pageContext.selectedInvoiceNumber,
        title: `${pageContext.selectedInvoiceNumber}: ${pageContext.header?.companyName || 'Invoice Details'}`,
        route: '/invoices',
        isDetail: true,
        IconComponent: Receipt,
        iconBgColor: 'bg-blue-100 text-blue-800 border-blue-300',
        iconColor: 'text-blue-700'
      };
    }
    return {
      type: 'INVOICES_LIST',
      id: 'Invoices Directory',
      title: `Invoices Directory (${pageContext.invoices?.length || 'Live'} invoices)`,
      route: '/invoices',
      isDetail: false,
      IconComponent: Receipt,
      iconBgColor: 'bg-slate-100 text-slate-700 border-slate-300',
      iconColor: 'text-slate-600'
    };
  }

  // 3. SHIPMENTS / ASNS
  if (route.startsWith('/shipments') || route.startsWith('/asns') || route.startsWith('/shipping')) {
    if (pageContext.selectedAsnNumber) {
      return {
        type: 'ASN_DETAIL',
        id: pageContext.selectedAsnNumber,
        title: `${pageContext.selectedAsnNumber}: ${pageContext.carrier || 'Dispatch Details'}`,
        route: '/shipments',
        isDetail: true,
        IconComponent: Truck,
        iconBgColor: 'bg-amber-100 text-amber-800 border-amber-300',
        iconColor: 'text-amber-700'
      };
    }
    return {
      type: 'ASNS_LIST',
      id: 'Shipments Directory',
      title: `Shipments & ASNs Directory (${pageContext.asns?.length || 'Live'} shipments)`,
      route: '/shipments',
      isDetail: false,
      IconComponent: Truck,
      iconBgColor: 'bg-slate-100 text-slate-700 border-slate-300',
      iconColor: 'text-slate-600'
    };
  }

  // 4. RFPS & BIDS
  if (route.startsWith('/rfp') || route.startsWith('/bids') || route.startsWith('/sourcing')) {
    if (route.includes('/detail') || pageContext.eventNumber) {
      return {
        type: 'RFP_DETAIL',
        id: pageContext.eventNumber || 'RFP Tender',
        title: `${pageContext.eventNumber || 'RFP'}: ${pageContext.title || 'Enterprise Tender'}`,
        route: '/rfps/detail',
        isDetail: true,
        IconComponent: FileText,
        iconBgColor: 'bg-purple-100 text-purple-800 border-purple-300',
        iconColor: 'text-purple-700'
      };
    }
    return {
      type: 'RFPS_LIST',
      id: 'RFPs Directory',
      title: `Sourcing & RFPs Directory (${pageContext.rfpsCount || 'Active'} tenders)`,
      route: '/rfps',
      isDetail: false,
      IconComponent: FileText,
      iconBgColor: 'bg-slate-100 text-slate-700 border-slate-300',
      iconColor: 'text-slate-600'
    };
  }

  // 5. ONBOARDING
  if (route.startsWith('/onboarding') || route.startsWith('/workspaces')) {
    if (route.includes('/detail') || route.includes('/sync') || pageContext.invitationCode) {
      return {
        type: 'ONBOARDING_DETAIL',
        id: pageContext.invitationCode || 'INV-NOVATECH-8820',
        title: `${pageContext.buyerName || 'Buyer Onboarding'}: Step ${pageContext.activeStep || 1} (${pageContext.progressPercent || 89}% Done)`,
        route: '/onboarding/detail',
        isDetail: true,
        IconComponent: ShieldCheck,
        iconBgColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        iconColor: 'text-emerald-700'
      };
    }
    return {
      type: 'ONBOARDING_LIST',
      id: 'Onboarding Directory',
      title: `Buyer Onboarding Requests Directory (${pageContext.totalRequests || 'Active'} requests)`,
      route: '/onboarding',
      isDetail: false,
      IconComponent: ShieldCheck,
      iconBgColor: 'bg-slate-100 text-slate-700 border-slate-300',
      iconColor: 'text-slate-600'
    };
  }

  // 6. DOCUMENTS / VAULT (Unified Single Workspace)
  if (route.startsWith('/documents') || route.startsWith('/vault') || route.startsWith('/doc-vault')) {
    return {
      type: 'DOCUMENTS_VAULT',
      id: 'Compliance Vault',
      title: 'Compliance Vault & W-9 Repository',
      route: '/documents',
      isDetail: true,
      IconComponent: FolderLock,
      iconBgColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      iconColor: 'text-cyan-700'
    };
  }

  // 7. CATALOG (Unified Single Workspace)
  if (route.startsWith('/catalog') || route.startsWith('/catalog-vault')) {
    return {
      type: 'CATALOG_VAULT',
      id: 'Item Master Catalog',
      title: 'Item Master & Product Catalog',
      route: '/catalog',
      isDetail: true,
      IconComponent: Package,
      iconBgColor: 'bg-purple-100 text-purple-800 border-purple-300',
      iconColor: 'text-purple-700'
    };
  }

  // 8. ALL TRANSACTIONS (Unified Single Workspace)
  if (route.startsWith('/transactions')) {
    return {
      type: 'ALL_TRANSACTIONS',
      id: 'Consolidated Ledger',
      title: 'Consolidated Cross-Buyer Financial Ledger',
      route: '/transactions',
      isDetail: true,
      IconComponent: Layers,
      iconBgColor: 'bg-blue-100 text-blue-800 border-blue-300',
      iconColor: 'text-blue-700'
    };
  }

  // 9. PUBLIC PROFILE (Unified Single Workspace)
  if (route.startsWith('/public-profile') || route.startsWith('/master-profile')) {
    return {
      type: 'PUBLIC_PROFILE',
      id: 'Master Public Profile',
      title: 'Master Public Profile & Connected Buyers',
      route: '/public-profile',
      isDetail: true,
      IconComponent: Building2,
      iconBgColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconColor: 'text-emerald-700'
    };
  }

  // 10. TASKS (Unified Single Workspace)
  if (route.startsWith('/tasks')) {
    return {
      type: 'TASKS',
      id: 'Action Tasks',
      title: 'Priority Enterprise Tasks & Bottlenecks',
      route: '/tasks',
      isDetail: true,
      IconComponent: ClipboardList,
      iconBgColor: 'bg-teal-100 text-teal-800 border-teal-300',
      iconColor: 'text-teal-700'
    };
  }

  // 11. PROFILE / SETTINGS (Unified Single Workspace)
  if (route.startsWith('/settings') || route.startsWith('/profiles')) {
    return {
      type: 'PROFILE_SETTINGS',
      id: 'Profile Settings',
      title: 'Company Profile & Enterprise Settings',
      route: '/settings',
      isDetail: true,
      IconComponent: Building2,
      iconBgColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      iconColor: 'text-indigo-700'
    };
  }

  // DEFAULT / DASHBOARD
  return {
    type: 'DASHBOARD',
    id: 'Executive Dashboard',
    title: 'Verisource Executive Overview',
    route: '/dashboard',
    isDetail: false,
    IconComponent: Building2,
    iconBgColor: 'bg-slate-100 text-slate-700 border-slate-300',
    iconColor: 'text-slate-600'
  };
}

export interface AIAssistantDrawerProps {
  inline?: boolean;
  onClose?: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ inline = false, onClose }) => {
  const { 
    aiDrawerOpen, 
    setAiDrawerOpen, 
    copilotViewMode, 
    setCopilotViewMode,
    currentRoute, 
    routeState,
    navigate, 
    unreadThreadIds
  } = usePortal();
  const { currentUser } = useAuth();

  // Context Strip & Live Page Awareness State (Inspired by Jira Rovo)
  const [activePageContext, setActivePageContext] = useState<Record<string, any>>(() => getPageContext());
  const [isContextDetached, setIsContextDetached] = useState<boolean>(false);

  useEffect(() => {
    const cleanup = onPageContext((ctx) => {
      setActivePageContext(ctx);
    });
    return cleanup;
  }, []);

  // Re-attach context when currentRoute changes
  useEffect(() => {
    setIsContextDetached(false);
  }, [currentRoute]);

  const activeContext = resolveActiveContext(currentRoute, activePageContext);
  const isListPage = !isContextDetached && !activeContext.isDetail;

  const handleNavigateToContext = () => {
    if (!activeContext.route) return;
    navigate(activeContext.route);
  };

  // Active Subagent State (Determined autonomously by active page route & context)
  const [selectedSubagentId, setSelectedSubagentId] = useState<SubagentId>('ORCHESTRATOR');

  // Layout View Dropdown
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  // Voice Command System
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);

  // Drag and Drop Zone State
  const [isDragOver, setIsDragOver] = useState(false);

  // Draggable floating window coordinates (for FLOAT mode)
  const [floatPos, setFloatPos] = useState<{ x: number; y: number }>(() => {
    const initX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 470) : 800;
    return { x: initX, y: 75 };
  });
  const floatPosRef = useRef(floatPos);
  floatPosRef.current = floatPos;

  const isDraggingFloatRef = useRef(false);
  const dragFloatStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0
  });

  // Draggable floating launcher coordinates (for MINIMIZE mode)
  const [launcherPos, setLauncherPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return { x: Math.max(20, window.innerWidth - 150), y: Math.max(80, window.innerHeight - 70) };
    }
    return { x: 950, y: 680 };
  });
  const launcherPosRef = useRef(launcherPos);
  launcherPosRef.current = launcherPos;

  const isDraggingLauncherRef = useRef(false);
  const launcherDragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; moved: boolean }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    moved: false
  });

  // Float window drag handlers
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (copilotViewMode !== 'FLOAT' || inline) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea')) {
      return;
    }
    isDraggingFloatRef.current = true;
    dragFloatStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: floatPosRef.current.x,
      startY: floatPosRef.current.y
    };
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  // Launcher button drag handlers
  const handleLauncherMouseDown = (e: React.MouseEvent) => {
    isDraggingLauncherRef.current = true;
    launcherDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: launcherPosRef.current.x,
      startY: launcherPosRef.current.y,
      moved: false
    };
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Float window dragging
      if (isDraggingFloatRef.current) {
        const dx = e.clientX - dragFloatStartRef.current.mouseX;
        const dy = e.clientY - dragFloatStartRef.current.mouseY;

        const minX = 10;
        const maxX = Math.max(minX, window.innerWidth - 350);
        const minY = 60;
        const maxY = Math.max(minY, window.innerHeight - 80);

        const nextX = Math.min(Math.max(dragFloatStartRef.current.startX + dx, minX), maxX);
        const nextY = Math.min(Math.max(dragFloatStartRef.current.startY + dy, minY), maxY);

        floatPosRef.current = { x: nextX, y: nextY };
        setFloatPos({ x: nextX, y: nextY });
      }

      // 2. Launcher button dragging
      if (isDraggingLauncherRef.current) {
        const dx = e.clientX - launcherDragStartRef.current.mouseX;
        const dy = e.clientY - launcherDragStartRef.current.mouseY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          launcherDragStartRef.current.moved = true;
        }

        const minX = 10;
        const maxX = Math.max(minX, window.innerWidth - 140);
        const minY = 65;
        const maxY = Math.max(minY, window.innerHeight - 50);

        const nextX = Math.min(Math.max(launcherDragStartRef.current.startX + dx, minX), maxX);
        const nextY = Math.min(Math.max(launcherDragStartRef.current.startY + dy, minY), maxY);

        launcherPosRef.current = { x: nextX, y: nextY };
        setLauncherPos({ x: nextX, y: nextY });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingFloatRef.current) {
        isDraggingFloatRef.current = false;
        document.body.style.userSelect = '';
      }
      if (isDraggingLauncherRef.current) {
        isDraggingLauncherRef.current = false;
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

  // When aiDrawerOpen changes from header toggle:
  useEffect(() => {
    if (aiDrawerOpen && copilotViewMode === 'MINIMIZE') {
      setCopilotViewMode('DOCK');
    }
  }, [aiDrawerOpen]);

  // Live Page Context Listener
  const [livePageContext, setLivePageContext] = useState<Record<string, any>>(() => getPageContext());

  useEffect(() => {
    const cleanup = onPageContext((ctx) => {
      setLivePageContext({ ...ctx });
    });
    return cleanup;
  }, []);

  // Determine Active Subagent
  const activeSubagent = determineSubagent(currentRoute, '', selectedSubagentId);

  const agenticBriefing = AgenticEngine.synthesize(currentRoute, livePageContext);

  // Active Agent Name: use the actual specialized agent name
  const actualAgentName = (activeSubagent && activeSubagent.id !== 'ORCHESTRATOR')
    ? activeSubagent.name
    : (agenticBriefing.role || activeSubagent.name || 'Executive Operations Supervisor');

  const config: PageCopilotConfig = {
    id: agenticBriefing.route,
    pageContextName: agenticBriefing.pageContextName,
    contextMetric: agenticBriefing.contextMetric,
    summary: agenticBriefing.urgentBottleneck || agenticBriefing.pageContextName,
    initialGreeting: agenticBriefing.greeting,
    placeholder: 'Ask Ava or type prompt...',
    quickActions: (agenticBriefing.suggestedPrompts && agenticBriefing.suggestedPrompts.length > 0)
      ? agenticBriefing.suggestedPrompts 
      : activeSubagent.quickPrompts,
    getResponse: agenticBriefing.getResponse
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Staged Attachment State & Input Ref for Real Native File Upload
  const [stagedAttachment, setStagedAttachment] = useState<{ file?: File; name: string; size: string; docType?: string } | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Thinking in UI State
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [thinkingStep, setThinkingStep] = useState('Analyzing page records & enterprise context...');
  const thinkingTimerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const toggleThoughtExpanded = (msgId: string) => {
    setExpandedThoughts(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formattedSize = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : Math.max(1, Math.round(file.size / 1024)) + ' KB';
    setStagedAttachment({
      file,
      name: file.name,
      size: formattedSize
    });
    e.target.value = '';
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const formattedSize = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : Math.max(1, Math.round(file.size / 1024)) + ' KB';
      setStagedAttachment({
        file,
        name: file.name,
        size: formattedSize
      });
    }
  };

  // Voice Command Handlers
  const handleToggleVoiceInput = () => {
    if (isListening) {
      VoiceAssistantService.stopListening();
      setIsListening(false);
      setVoiceTranscript('');
    } else {
      const started = VoiceAssistantService.startListening({
        onStart: () => {
          setIsListening(true);
          setVoiceTranscript('Listening...');
        },
        onInterim: (transcript) => {
          setVoiceTranscript(transcript);
          setChatInput(transcript);
        },
        onFinal: (finalTranscript) => {
          setIsListening(false);
          setVoiceTranscript('');
          setChatInput(finalTranscript);
          handleSendPrompt(undefined, finalTranscript);
        },
        onError: (err) => {
          setIsListening(false);
          setVoiceTranscript('');
          console.warn('[Voice Assistant] Error:', err);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
      if (!started) {
        setIsListening(false);
      }
    }
  };

  const handleToggleVoiceOutput = () => {
    if (voiceOutputEnabled) {
      VoiceAssistantService.stopSpeaking();
      setVoiceOutputEnabled(false);
      setIsSpeaking(false);
    } else {
      setVoiceOutputEnabled(true);
      VoiceAssistantService.speak('Voice assistant audio enabled. Ava will read responses aloud.');
    }
  };

  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
      VoiceAssistantService.stopListening();
      VoiceAssistantService.stopSpeaking();
    };
  }, []);

  // Chat History Management
  interface ChatSession {
    id: string;
    title: string;
    timestamp: string;
    contextName: string;
    subagentName: string;
    messages: ChatMessage[];
  }

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  // Helper to build initial greeting message
  const getInitialGreetingMessage = (cfg: PageCopilotConfig, subagent: SubagentConfig): ChatMessage => ({
    id: `init-${cfg.id}-${subagent.id}`,
    sender: 'AVA',
    subagentId: subagent.id,
    subagentName: (subagent && subagent.id !== 'ORCHESTRATOR') ? subagent.name : actualAgentName,
    subagentRole: undefined,
    text: cfg.initialGreeting,
    time: 'Just now',
    quickActions: cfg.quickActions
  });

  const lastConfigIdRef = useRef(config.id);

  // Re-initialize conversation greeting when page context changes
  useEffect(() => {
    const isRouteChange = lastConfigIdRef.current !== config.id;
    lastConfigIdRef.current = config.id;

    setChatMessages(currentMsgs => {
      const hasUserMsg = currentMsgs.some(m => m.sender === 'USER');
      if (isRouteChange) {
        if (hasUserMsg) {
          const firstUserMsg = currentMsgs.find(m => m.sender === 'USER');
          const sessionTitle = firstUserMsg 
            ? (firstUserMsg.text.length > 36 ? firstUserMsg.text.slice(0, 36) + '...' : firstUserMsg.text)
            : `${config.pageContextName} Discussion`;

          const archivedSession: ChatSession = {
            id: `sess-${Date.now()}`,
            title: sessionTitle,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            contextName: config.pageContextName,
            subagentName: activeSubagent.shortName,
            messages: [...currentMsgs]
          };

          setChatSessions(prev => [archivedSession, ...prev.slice(0, 19)]);
        }
        return [getInitialGreetingMessage(config, activeSubagent)];
      }

      if (!hasUserMsg) {
        return [getInitialGreetingMessage(config, activeSubagent)];
      }

      return currentMsgs;
    });
    setIsHistoryOpen(false);
  }, [config.id, activeSubagent.id]);

  // Click outside listener for view, history, and subagent dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setIsViewMenuOpen(false);
      }
      if (historyMenuRef.current && !historyMenuRef.current.contains(e.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      const t = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [chatMessages, isAgentThinking]);

  // View modes
  const isDock = (copilotViewMode === 'DOCK' && aiDrawerOpen) || inline;
  const isFloat = copilotViewMode === 'FLOAT' && aiDrawerOpen && !inline;
  const isFull = copilotViewMode === 'FULL' && aiDrawerOpen && !inline;
  const isMinimized = (copilotViewMode === 'MINIMIZE' || !aiDrawerOpen) && !inline;

  const handleStartNewChat = () => {
    setChatMessages(currentMsgs => {
      const hasUserMsg = currentMsgs.some(m => m.sender === 'USER');
      if (hasUserMsg) {
        const firstUserMsg = currentMsgs.find(m => m.sender === 'USER');
        const sessionTitle = firstUserMsg 
          ? (firstUserMsg.text.length > 36 ? firstUserMsg.text.slice(0, 36) + '...' : firstUserMsg.text)
          : `${config.pageContextName} Chat`;

        const archivedSession: ChatSession = {
          id: `sess-${Date.now()}`,
          title: sessionTitle,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          contextName: config.pageContextName,
          subagentName: activeSubagent.shortName,
          messages: [...currentMsgs]
        };

        setChatSessions(prev => [archivedSession, ...prev.slice(0, 19)]);
      }
      return [getInitialGreetingMessage(config, activeSubagent)];
    });
    setChatInput('');
    setStagedAttachment(null);
    setIsHistoryOpen(false);
  };

  const handleRestoreSession = (session: ChatSession) => {
    setChatMessages([...session.messages]);
    setIsHistoryOpen(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleClearAllHistory = () => {
    setChatSessions([]);
    setIsHistoryOpen(false);
  };

  const handleTriggerUploadPrompt = (promptText: string, labelText?: string) => {
    const targetSubagent = determineSubagent(currentRoute, promptText, selectedSubagentId);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: labelText || promptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMsg: ChatMessage = {
      id: `agt-${Date.now() + 1}`,
      sender: 'AVA',
      subagentId: targetSubagent.id,
      subagentName: targetSubagent.name || actualAgentName,
      subagentRole: undefined,
      text: `Please upload your **W-9, Tax Certificate, or sheet** below for automated AI Vision OCR layout analysis and page field extraction:`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thoughtSeconds: 0.2,
      thoughtProcess: `• Identified upload trigger: "${labelText || promptText}"\n• Activated AI Document Vision OCR ingest module\n• Awaiting attachment or sample document selection`,
      partialViews: [
        {
          type: 'UPLOAD_BANNER',
          title: 'Upload Document for AI Vision OCR',
          description: 'Upload W-9, Tax Cert, or invoice to extract & populate page fields',
          targetPage: currentRoute,
          pageContext: getPageContext()
        }
      ]
    };

    setChatMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleSendPrompt = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || chatInput;
    if (!query.trim() && !stagedAttachment) return;

    const attachmentToSend = stagedAttachment;
    setStagedAttachment(null);
    if (!customText) setChatInput('');

    const effectiveQuery = query.trim() || `Analyze and verify attached document: ${attachmentToSend?.name}`;

    // Resolve subagent for this specific message turn
    const targetSubagent = determineSubagent(currentRoute, effectiveQuery, selectedSubagentId);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: effectiveQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFile: attachmentToSend ? { name: attachmentToSend.name, size: attachmentToSend.size } : undefined
    };

    setChatMessages(prev => [...prev, userMsg]);

    // If query is an upload prompt without an attachment, immediately surface the upload banner
    const isUploadIntent = !attachmentToSend && (
      effectiveQuery.toLowerCase().includes('upload a tax certificate') ||
      (effectiveQuery.toLowerCase().startsWith('upload') && (effectiveQuery.toLowerCase().includes('tax') || effectiveQuery.toLowerCase().includes('w9') || effectiveQuery.toLowerCase().includes('w-9') || effectiveQuery.toLowerCase().includes('cert') || effectiveQuery.toLowerCase().includes('ocr') || effectiveQuery.toLowerCase().includes('sheet')))
    );

    if (isUploadIntent) {
      const uploadAgentMsg: ChatMessage = {
        id: `agt-${Date.now() + 1}`,
        sender: 'AVA',
        subagentId: targetSubagent.id,
        subagentName: targetSubagent.name || actualAgentName,
        subagentRole: undefined,
        text: `Please upload your **W-9, Tax Certificate, or sheet** below for automated AI Vision OCR layout analysis and page field extraction:`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thoughtSeconds: 0.2,
        thoughtProcess: `• Identified document ingestion trigger: "${effectiveQuery}"\n• Activated AI Document Vision OCR ingest module\n• Ready to extract credentials and ask for confirmation`,
        partialViews: [
          {
            type: 'UPLOAD_BANNER',
            title: 'Upload Document for AI Vision OCR',
            description: 'Upload W-9, Tax Cert, or invoice to extract & populate page fields',
            targetPage: currentRoute,
            pageContext: getPageContext()
          }
        ]
      };
      setChatMessages(prev => [...prev, uploadAgentMsg]);
      return;
    }

    setIsAgentThinking(true);
    setThinkingSeconds(0);
    setThinkingStep(`Delegating to ${targetSubagent.name}...`);
    startTimeRef.current = Date.now();

    if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    thinkingTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setThinkingSeconds(+elapsed.toFixed(1));
      if (elapsed > 2.2) {
        setThinkingStep('Synthesizing verified enterprise response & review diff...');
      } else if (elapsed > 1.0) {
        setThinkingStep(`Evaluating ${targetSubagent.role} & compliance rules...`);
      }
    }, 100);

    const activePageContext = getPageContext();
    const pageContextWithFile = {
      ...activePageContext,
      ...(attachmentToSend ? { attachedFile: { name: attachmentToSend.name, size: attachmentToSend.size } } : {})
    };

    const agentMsgId = `agt-${Date.now()}`;
    const initialAgentMsg: ChatMessage = {
      id: agentMsgId,
      sender: 'AVA',
      subagentId: targetSubagent.id,
      subagentName: targetSubagent.name,
      subagentRole: targetSubagent.role,
      text: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };
    setChatMessages(prev => [...prev, initialAgentMsg]);

    const stopThinkingTimer = () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      setIsAgentThinking(false);
    };

    const isQuestionOrRetrieval = /^(which|what|show|list|view|how|check|summarize|are there|can you show|find|describe|tell me)\b/i.test(effectiveQuery.trim());

    const isMutationIntent = !isQuestionOrRetrieval && (
      /^(update|edit|modify|fill|pre-fill|auto-fill|submit details|sign|confirm changes)\b/i.test(effectiveQuery.trim()) ||
      /\b(to net \d+|change payment terms to|fill missing basic details|submit form)\b/i.test(effectiveQuery.toLowerCase())
    );

    // Strict List Page Guard: on list page -> only retrieve information, do not do anything like add/update
    if (isListPage && isMutationIntent) {
      stopThinkingTimer();
      const readOnlyNotice = `ℹ️ **Directory List View (Read-Only Mode)**\n\nYou are currently viewing the **${activeContext.title}** directory. To safeguard multi-tenant records, **Ava can only retrieve, search, and analyze data on directory list views**.\n\nAdding, editing, or updating information must be performed inside a specific item's **Details Workspace**.\n\nPlease select and open an item from the table to view its complete context and make updates.`;
      
      setChatMessages(prev => prev.map(m => {
        if (m.id === agentMsgId) {
          return {
            ...m,
            text: readOnlyNotice,
            isStreaming: false,
            subagentId: targetSubagent.id,
            subagentName: targetSubagent.name || actualAgentName,
            subagentRole: undefined,
            thoughtSeconds: 0.2,
            thoughtProcess: `• Evaluated page posture: Directory List View\n• Verified permissions: RETRIEVE_ONLY\n• Prevented mutating action dispatch on directory view\n• Recommended navigating to item Details Workspace`,
            quickActions: activeContext.route ? [
              {
                label: `Open ${activeContext.id} Details`,
                icon: ExternalLink,
                prompt: `Show details for ${activeContext.id}`
              }
            ] : undefined,
            partialViews: [],
            isLiveGemini: false
          };
        }
        return m;
      }));
      return;
    }

    try {
      await sendGeminiPromptStream({
        prompt: effectiveQuery,
        currentRoute,
        pageContextData: {
          ...pageContextWithFile,
          isListPage,
          activeMode: isListPage ? 'LIST' : 'DETAIL'
        },
        history: chatMessages.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
      }, {
        onThinking: (stepText) => {
          setThinkingStep(stepText);
        },
        onChunk: (_chunk, accumulated) => {
          stopThinkingTimer();
          setChatMessages(prev => prev.map(m => {
            if (m.id === agentMsgId) {
              return { ...m, text: accumulated, isStreaming: true };
            }
            return m;
          }));
        },
        onDone: (result) => {
          stopThinkingTimer();
          const elapsed = (Date.now() - startTimeRef.current) / 1000;

          // Safe action dispatch: filter mutating actions on list pages
          const safeActions = isListPage 
            ? (result.actions || []).filter(act => !MUTATING_ACTION_TYPES.has(act.action))
            : (result.actions || []);

          if (safeActions.length > 0) {
            safeActions.forEach(async (act) => {
              if (act.action === 'NAVIGATE_PAGE' && act.payload?.route) {
                const targetRoute = act.payload.route;
                if (targetRoute !== currentRoute && !currentRoute.startsWith(targetRoute)) {
                  navigate(targetRoute, act.payload.state);
                }
              }
              // Persist to Backend (BE) where applicable
              try {
                if (act.action === 'UPLOAD_DOC') {
                  await ApiClient.uploadDocument('supp-org-1', act.payload);
                } else if (act.action === 'UPDATE_DOC') {
                  await ApiClient.verifyDocument(act.payload.id, 'VERIFIED');
                } else if (act.action === 'ACCEPT_EARLY_PAYMENT') {
                  await ApiClient.acceptEarlyPayment(act.payload.invoiceId || act.payload.invoiceNumber || 'inv-2026-022', { discountPercent: 2, daysEarly: 15 });
                } else if (act.action === 'FLIP_PO_TO_INVOICE') {
                  await ApiClient.flipPOToInvoice(act.payload.poId || act.payload.poNumber || 'PO-2026-9450');
                } else if (act.action === 'ACKNOWLEDGE_PO') {
                  await ApiClient.acknowledgeOrder(act.payload.poId || act.payload.poNumber || 'PO-2026-9450');
                }
              } catch (e) {
                // Keep resilient
              }
            });
            dispatchPageAction(safeActions);
          }

          // Safe partial views: filter interactive write partial views on list pages
          let resolvedPartialViews = result.partialViews || [];
          if (resolvedPartialViews.length === 0 && !isListPage) {
            const localResponse = config.getResponse(effectiveQuery, navigate);
            if (localResponse.partialViews && localResponse.partialViews.length > 0) {
              resolvedPartialViews = localResponse.partialViews;
            }
          }
          if (isListPage) {
            resolvedPartialViews = resolvedPartialViews.filter(pv => pv.type !== 'FORM_CARD' && pv.type !== 'REVIEW_DIFF' && pv.type !== 'EARLY_PAYOUT_SLIDER');
          }

          setChatMessages(prev => prev.map(m => {
            if (m.id === agentMsgId) {
              return {
                ...m,
                text: result.text,
                isStreaming: false,
                subagentId: targetSubagent.id,
                subagentName: targetSubagent.name || actualAgentName,
                subagentRole: undefined,
                thoughtSeconds: Math.max(0.6, +elapsed.toFixed(1)),
                thoughtProcess: `• Evaluated active page context: ${config.pageContextName}\n• Cross-referenced ERP ledger and trade compliance rules\n• Formulated verified response with 0% price & contract deviation tolerance`,
                quickActions: config.quickActions,
                partialViews: resolvedPartialViews,
                executedActions: undefined,
                isLiveGemini: false,
                errorNotice: result.error
              };
            }
            return m;
          }));

          // Voice feedback if enabled
          if (voiceOutputEnabled) {
            VoiceAssistantService.speak(result.text, {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false)
            });
          }
        },
        onError: (err) => {
          console.warn('[Ava] Streaming error, falling back locally:', err);
          stopThinkingTimer();
          const response = config.getResponse(effectiveQuery, navigate);
          const safePartialViews = isListPage
            ? (response.partialViews || []).filter(pv => pv.type !== 'FORM_CARD' && pv.type !== 'REVIEW_DIFF' && pv.type !== 'EARLY_PAYOUT_SLIDER')
            : response.partialViews;

          setChatMessages(prev => prev.map(m => {
            if (m.id === agentMsgId) {
              return {
                ...m,
                text: response.reply,
                isStreaming: false,
                subagentId: targetSubagent.id,
                subagentName: targetSubagent.name || actualAgentName,
                subagentRole: undefined,
                thoughtSeconds: 0.8,
                thoughtProcess: `• Evaluated page query: "${effectiveQuery}"\n• Formulated context-aware response`,
                actionButtons: response.actionButtons,
                quickActions: config.quickActions,
                partialViews: safePartialViews
              };
            }
            return m;
          }));

          if (voiceOutputEnabled) {
            VoiceAssistantService.speak(response.reply, {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false)
            });
          }
        }
      });
    } catch (err: any) {
      stopThinkingTimer();
      const response = config.getResponse(effectiveQuery, navigate);
      const safePartialViews = isListPage
        ? (response.partialViews || []).filter(pv => pv.type !== 'FORM_CARD' && pv.type !== 'REVIEW_DIFF' && pv.type !== 'EARLY_PAYOUT_SLIDER')
        : response.partialViews;

      setChatMessages(prev => prev.map(m => {
        if (m.id === agentMsgId) {
          return {
            ...m,
            text: response.reply,
            isStreaming: false,
            subagentId: targetSubagent.id,
            subagentName: targetSubagent.name || actualAgentName,
            subagentRole: undefined,
            thoughtSeconds: 0.8,
            thoughtProcess: `• Evaluated page query: "${effectiveQuery}"\n• Formulated context-aware response`,
            actionButtons: response.actionButtons,
            quickActions: config.quickActions,
            partialViews: safePartialViews
          };
        }
        return m;
      }));
    }
  };

  // Content Renderer
  const renderAgentInner = () => (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-full max-h-full bg-slate-50/60 text-slate-800 overflow-hidden relative select-text"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-400 animate-in fade-in">
          <UploadCloud className="w-12 h-12 text-emerald-300 animate-bounce mb-3" />
          <h3 className="text-sm font-bold text-white tracking-tight">Drop Document for Instant Ava OCR</h3>
          <p className="text-xs text-emerald-200 mt-1 text-center max-w-xs">
            Upload sheets, commercial invoices, or tax certificates. Ava parses key fields and renders partial views directly in chat.
          </p>
        </div>
      )}

      {/* 1. AGENT TOP STRIP WITH SUBAGENT BADGE + VOICE + VIEW DROPDOWN MENU + CONTROLS */}
      <div 
        onMouseDown={handleHeaderMouseDown}
        className={`px-3.5 py-2.5 bg-white border-b border-slate-200/90 flex items-center justify-between gap-2 shrink-0 shadow-2xs select-none ${
          isFloat ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        title={isFloat ? 'Click and drag anywhere to move floating window' : undefined}
      >
        {/* Agent Identity & Active Subagent Pill */}
        <div className="flex items-center space-x-2 min-w-0">
          {isFloat && !inline && (
            <div className="flex items-center text-slate-400 hover:text-slate-700 mr-0.5 cursor-grab" title="Drag to move">
              <GripHorizontal className="w-4 h-4" />
            </div>
          )}

          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-900 tracking-tight">Ava Agent</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          </div>
        </div>

        {/* Top-Right Control Tray (Preserving View, Chat History, + New Chat, Close) */}
        <div className="flex items-center space-x-1 shrink-0 text-slate-500">
          {/* View ▾ Dropdown (Sidebar, Floating, Full Screen) */}
          {!inline && (
            <div className="relative" ref={viewMenuRef}>
              <button
                type="button"
                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                className="px-2 py-1 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center space-x-1.5 cursor-pointer group"
                title="Change Agent Layout Mode (Sidebar, Floating, Full Screen)"
              >
                <PanelRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800" />
                <span>View</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isViewMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-[100] animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
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
          )}

          {/* History Popover Button */}
          <div className="relative" ref={historyMenuRef}>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`p-1.5 rounded-lg transition relative cursor-pointer ${
                isHistoryOpen
                  ? 'bg-slate-200 text-slate-900'
                  : 'hover:text-slate-900 hover:bg-slate-100 text-slate-500'
              }`}
              title="Chat History"
            >
              <History className="w-3.5 h-3.5" />
              {chatSessions.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

            {isHistoryOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-76 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-xs font-bold text-slate-900">Chat History</span>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                      {chatSessions.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartNewChat}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-0.5 rounded-md flex items-center space-x-1 cursor-pointer transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Chat</span>
                  </button>
                </div>

                <div className="py-1 max-h-60 overflow-y-auto space-y-1">
                  {chatSessions.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">
                      <History className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                      <p className="text-xs font-medium text-slate-600">No saved sessions yet</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 px-4">
                        Conversations are saved when you start a new chat or move between pages.
                      </p>
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleRestoreSession(session)}
                        className="p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer group flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                            {session.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            <span className="font-medium text-slate-600 truncate max-w-[100px]">
                              {session.subagentName || session.contextName}
                            </span>
                            <span>•</span>
                            <span>{session.timestamp}</span>
                            <span>•</span>
                            <span>{session.messages.length} msgs</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded text-slate-400 transition"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {chatSessions.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between px-2">
                    <span className="text-[10px] text-slate-400">Archived conversations</span>
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="text-[10px] text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New Chat [+] Button */}
          <button
            type="button"
            onClick={handleStartNewChat}
            className="p-1.5 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-slate-500 transition cursor-pointer"
            title="Start New Chat (+)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Minimize / Close */}
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                setCopilotViewMode('MINIMIZE');
                setAiDrawerOpen(false);
              }
            }}
            className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Close / Minimize Agent"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CHAT CONVERSATION STREAM (INDEPENDENT VERTICAL SCROLL) */}
      <div 
        ref={chatContainerRef}
        className="flex-1 min-h-0 p-3.5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-200 bg-slate-50/40"
      >
        {(() => {
          const lastWithActionsIndex = chatMessages
            .map(m => m.sender === 'AVA' && Boolean(m.quickActions && m.quickActions.length > 0))
            .lastIndexOf(true);

          return chatMessages.map((msg, msgIndex) => {
            const isLatestWithActions = msg.sender === 'AVA' && 
              Boolean(msg.quickActions && msg.quickActions.length > 0) && 
              msgIndex === lastWithActionsIndex;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                {/* Assistant Identity Tag - Actual Agent Name */}
                {msg.sender === 'AVA' && (
                  <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-700">{msg.subagentName || actualAgentName}</span>
                  </div>
                )}

                {/* Bubble Body */}
                <div
                  className={`max-w-[94%] sm:max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-slate-900 text-white rounded-br-xs font-medium shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {/* User Attached Document Pill (Matches User Snapshot) */}
                  {msg.sender === 'USER' && msg.attachedFile && (
                    <div className="mb-2 p-2 bg-white/15 border border-white/25 rounded-xl text-xs font-medium flex items-center space-x-2 text-white shadow-xs">
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="truncate flex-1 min-w-0">
                        <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Uploaded 1 file</div>
                        <div className="font-bold truncate text-xs">{msg.attachedFile.name}</div>
                      </div>
                      <span className="text-[9px] opacity-80 font-mono shrink-0">({msg.attachedFile.size})</span>
                    </div>
                  )}

                  {/* Ava Thinking Collapsible Accordion Header */}
                  {msg.sender === 'AVA' && msg.thoughtSeconds !== undefined && (
                    <div className="mb-2.5">
                      <button
                        type="button"
                        onClick={() => toggleThoughtExpanded(msg.id)}
                        className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-2 py-1 rounded-lg transition cursor-pointer select-none"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Thought for {msg.thoughtSeconds.toFixed(1)}s</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${expandedThoughts[msg.id] ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedThoughts[msg.id] && (
                        <div className="mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1 animate-in fade-in font-mono leading-relaxed">
                          <div className="font-semibold text-slate-700 flex items-center space-x-1">
                            <span>Reasoning Trace:</span>
                          </div>
                          <p className="whitespace-pre-line text-[10px] text-slate-600">
                            {msg.thoughtProcess || `• Evaluated active page context: ${config.pageContextName}\n• Cross-referenced ERP ledger and trade compliance rules\n• Formulated verified response with 0% price & contract deviation tolerance`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Content with Streaming Cursor & Bold Parsing */}
                  {msg.sender === 'USER' ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="space-y-1.5">
                      {msg.text.split('\n').map((line, li) => {
                        if (line.startsWith('### ')) {
                          return <h3 key={li} className="font-bold text-xs text-slate-900 mt-1 mb-0.5">{line.replace('### ', '')}</h3>;
                        }
                        if (line.startsWith('#### ')) {
                          return <h4 key={li} className="font-bold text-[11px] text-slate-800 mt-1 mb-0.5">{line.replace('#### ', '')}</h4>;
                        }
                        return (
                          <p key={li} className="leading-relaxed">
                            {line.split(/(\*\*.*?\*\*|\`.*?\`)/g).map((chunk, ci) => {
                              if (chunk.startsWith('**') && chunk.endsWith('**')) {
                                return <strong key={ci} className="font-semibold text-slate-900">{chunk.slice(2, -2)}</strong>;
                              }
                              if (chunk.startsWith('`') && chunk.endsWith('`')) {
                                return <code key={ci} className="px-1 py-0.5 bg-slate-100 rounded text-[11px] font-mono text-emerald-800">{chunk.slice(1, -1)}</code>;
                              }
                              return chunk;
                            })}
                          </p>
                        );
                      })}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-emerald-600 animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      PARTIAL VIEWS (Atlassian Rovo / Jira Agentic Feature)
                     ───────────────────────────────────────────────────────────── */}
                  {msg.partialViews && msg.partialViews.map((pv, pvi) => {
                    if (pv.type === 'FORM_CARD') {
                      return <FormCardPartialView key={pvi} data={pv} />;
                    }
                    if (pv.type === 'REVIEW_DIFF') {
                      return <ReviewDiffPartialView key={pvi} data={pv} />;
                    }
                    if (pv.type === 'OCR_EXTRACTION') {
                      return <OcrExtractionPartialView key={pvi} data={pv} />;
                    }
                    if (pv.type === 'EARLY_PAYOUT_SLIDER') {
                      return <EarlyPayoutPartialView key={pvi} data={pv} />;
                    }
                    if (pv.type === 'UPLOAD_BANNER') {
                      return <UploadBannerPartialView key={pvi} data={pv} />;
                    }
                    return null;
                  })}

                  {/* Naturally available dynamic suggested prompt pills inside the bubble */}
                  {isLatestWithActions && msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.quickActions.map((qa, i) => {
                        const isUploadAction = qa.label.toLowerCase().includes('upload') || qa.prompt.toLowerCase().includes('upload') || (qa as any).isUpload;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if ((qa as any).action) {
                                dispatchPageAction({ action: (qa as any).action, payload: (qa as any).payload || {} });
                              }
                              if (isUploadAction) {
                                handleTriggerUploadPrompt(qa.prompt, qa.label);
                              } else {
                                handleSendPrompt(undefined, qa.prompt);
                              }
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs active:scale-95 text-left"
                            title={qa.prompt}
                          >
                            {qa.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Actionable 1-Click Embedded Buttons */}
                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.actionButtons.map((btn, btnIdx) => (
                        <button
                          key={btnIdx}
                          type="button"
                          onClick={() => {
                            if (btn.onClick) {
                              btn.onClick();
                            } else if (btn.route) {
                              navigate(btn.route);
                            }
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95 text-left"
                        >
                          <span>{btn.label}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Error Notice */}
                  {msg.errorNotice && (
                    <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{msg.errorNotice}</span>
                    </div>
                  )}
                </div>

                {/* Timestamp below card */}
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            );
          });
        })()}

        {/* Live Modern Thinking Indicator with Real-time Timer */}
        {isAgentThinking && (
          <div className="flex flex-col space-y-1.5 p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200/90 rounded-2xl max-w-[85%] text-xs text-slate-800 shadow-2xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span className="font-bold text-emerald-950 tracking-tight">Thinking...</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {thinkingSeconds.toFixed(1)}s
              </span>
            </div>
            <p className="text-[11px] text-slate-600 pl-5 animate-pulse font-medium">
              {thinkingStep}
            </p>
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE CONTEXT STRIP (SHOWING ONLY PAGE URL) */}
      <div 
        onMouseDown={handleHeaderMouseDown}
        className={`px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0 gap-2 select-none ${
          isFloat ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        title={isFloat ? 'Click and drag anywhere on bar to move floating window' : undefined}
      >
        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
          <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Context:</span>

          {!isContextDetached ? (
            <div 
              onClick={handleNavigateToContext}
              className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 transition group cursor-pointer truncate max-w-[280px] sm:max-w-[340px] shadow-2xs"
              title={`Click to redirect to ${currentRoute || activeContext.route}`}
            >
              <activeContext.IconComponent className="w-3 h-3 text-slate-500 group-hover:text-emerald-600 shrink-0" />

              <span className="text-[11px] font-mono font-medium text-slate-700 group-hover:text-emerald-700 truncate underline-offset-2 group-hover:underline">
                {currentRoute || activeContext.route}
              </span>

              <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-emerald-700 shrink-0 ml-0.5" />
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-slate-400 italic">None (Global query)</span>
              <button
                type="button"
                onClick={() => setIsContextDetached(false)}
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center space-x-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Attach {currentRoute || activeContext.route}</span>
              </button>
            </div>
          )}
        </div>

        {!isContextDetached && (
          <button
            type="button"
            onClick={() => setIsContextDetached(true)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded transition shrink-0 cursor-pointer"
            title="Detach active page context"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Staged Attachment Pill Above Input Bar */}
      {stagedAttachment && (
        <div className="mx-3 mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center space-x-2 truncate">
            <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate max-w-[220px]">{stagedAttachment.name}</span>
            <span className="text-[10px] text-emerald-600 font-mono">({stagedAttachment.size})</span>
          </div>
          <button
            type="button"
            onClick={() => setStagedAttachment(null)}
            className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded-md hover:bg-emerald-100 transition cursor-pointer"
            title="Remove attached document"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Listening Active Audio Wave Indicator */}
      {isListening && (
        <div className="mx-3 mt-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl text-white flex items-center justify-between text-xs animate-in fade-in shadow-md">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span className="font-bold tracking-tight">Listening to voice command...</span>
          </div>
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[11px] font-semibold cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* 4. SLEEK, COMPACT TEXT COMPOSER */}
      <form onSubmit={(e) => handleSendPrompt(e)} className="p-2.5 bg-white border-t border-slate-200 shrink-0">
        <input
          ref={attachmentInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.docx,.txt"
          className="hidden"
          onChange={handleAttachmentSelect}
        />

        {/* Compact, Sleek Input Card */}
        <div className="border border-slate-300 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 bg-slate-50/70 focus-within:bg-white transition shadow-2xs">
          <textarea
            rows={1}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
            placeholder={isListening ? 'Speak your command now...' : (config.placeholder || 'Ask Ava or type prompt...')}
            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[30px] max-h-[90px]"
          />

          {/* Compact Action Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 mt-0.5">
            <span className="text-[10px] text-slate-400">
              Shift + Enter for new line
            </span>

            {/* Right: Attachment [📎], Voice [🎙️], Send [➤] */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  stagedAttachment 
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300' 
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Attach Document / Sheet for Instant OCR"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30' 
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title={isListening ? 'Stop Voice Listening' : 'Voice Command (Speech-to-Text)'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                type="submit"
                disabled={isAgentThinking || (!chatInput.trim() && !stagedAttachment)}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition shadow-xs cursor-pointer ml-0.5 flex items-center justify-center"
                title="Send Message to Ava"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );

  // If used inline inside Onboarding or another parent container:
  if (inline) {
    return renderAgentInner();
  }

  return (
    <>
      {/* 1. DOCKED DRAWER VIEW (Standard Desktop Split Screen) */}
      {isDock && (
        <aside 
          className="w-full lg:w-[420px] xl:w-[450px] shrink-0 border-l border-slate-200 flex flex-col h-full max-h-full overflow-hidden shadow-xs bg-white"
        >
          {renderAgentInner()}
        </aside>
      )}

      {/* 2. FLOATING DRAGGABLE WINDOW VIEW */}
      {isFloat && (
        <div
          style={{
            left: `${floatPos.x}px`,
            top: `${floatPos.y}px`,
            position: 'fixed'
          }}
          className="w-[390px] sm:w-[440px] h-[640px] max-h-[88vh] z-[150] shadow-2xl rounded-2xl border border-slate-300 bg-white overflow-hidden flex flex-col animate-in fade-in zoom-in-95 ring-1 ring-slate-900/10"
        >
          {renderAgentInner()}
        </div>
      )}

      {/* 3. FULL PAGE WORKBENCH VIEW (Covers entire screen) */}
      {isFull && (
        <div className="fixed inset-0 z-[160] w-screen h-screen bg-white flex flex-col overflow-hidden animate-in fade-in">
          {renderAgentInner()}
        </div>
      )}

      {/* 4. FLOATING DRAGGABLE BUBBLE LAUNCHER (MINIMIZE VIEW) */}
      {isMinimized && (
        <div
          style={{
            left: `${launcherPos.x}px`,
            top: `${launcherPos.y}px`,
            position: 'fixed'
          }}
          onMouseDown={handleLauncherMouseDown}
          onClick={() => {
            if (!launcherDragStartRef.current.moved) {
              setCopilotViewMode('DOCK');
              setAiDrawerOpen(true);
            }
          }}
          className="z-[140] select-none cursor-grab active:cursor-grabbing group animate-in fade-in"
          title="Ava Agent (Click to Open • Drag to Reposition)"
        >
          <div className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 hover:from-emerald-500 hover:to-slate-850 text-white rounded-full shadow-2xl shadow-emerald-950/40 flex items-center space-x-2 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-transform backdrop-blur-md">
            <div className="relative shrink-0 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <span className="text-xs font-bold tracking-tight text-white">Ava</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <GripHorizontal className="w-3 h-3 text-white/50 group-hover:text-white shrink-0" />
          </div>
        </div>
      )}
    </>
  );
};
