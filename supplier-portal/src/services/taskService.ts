import React, { useState, useEffect } from 'react';

export interface TaskItem {
  id: string;
  refCode: string;
  title: string;
  category: 'ONBOARDING' | 'ORDER' | 'ASN' | 'FINANCE' | 'RFP' | 'COMPLIANCE';
  categoryLabel: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  priorityLabel: string;
  buyerName: string;
  buyerOrgId: string;
  buyerInitials: string;
  dueDate: string;
  dueUrgency: 'URGENT' | 'WARNING' | 'NORMAL';
  description: string;
  metricHighlight?: string;
  metricHighlightType?: 'CURRENCY' | 'PERCENT' | 'STATUS';
  actionLabel: string;
  actionType: 'NAV_ONBOARDING' | 'NAV_RFP' | 'NAV_ORDER' | 'NAV_DOCS' | 'NAV_INVOICE' | 'NAV_ASN' | 'NAV_WORKSPACE';
  actionPayload?: any;
  status: 'PENDING' | 'COMPLETED';
  completedAt?: string;
}

export const INITIAL_SHARED_TASKS: TaskItem[] = [
  {
    id: 'task-onb-1',
    refCode: 'INV-NOVATECH-8820',
    title: 'Complete Vendor Onboarding & Attestation',
    category: 'ONBOARDING',
    categoryLabel: 'Onboarding',
    priority: 'URGENT',
    priorityLabel: 'Urgent',
    buyerName: 'NovaTech Aerospace & Defense',
    buyerOrgId: 'buyer-org-2',
    buyerInitials: 'NO',
    dueDate: 'In 2 Days',
    dueUrgency: 'URGENT',
    description: 'Procurement team requested compliance attestation, W-9, and FedACH banking setup. 94% can be auto-filled from Master Profile.',
    metricHighlight: '94% Auto-Ready',
    metricHighlightType: 'PERCENT',
    actionLabel: 'Start',
    actionType: 'NAV_ONBOARDING',
    actionPayload: { buyerOrgId: 'buyer-org-2', autoCopilot: true },
    status: 'PENDING'
  },
  {
    id: 'task-ord-1',
    refCode: 'PO-2026-9042',
    title: '1-Click PO Flip to Electronic Invoice',
    category: 'ORDER',
    categoryLabel: 'PO to Bill',
    priority: 'HIGH',
    priorityLabel: 'High',
    buyerName: 'Apex Global Enterprises',
    buyerOrgId: 'buyer-org-1',
    buyerInitials: 'AP',
    dueDate: 'Immediate Ready',
    dueUrgency: 'WARNING',
    description: 'Delivery of compute sensors acknowledged. Convert purchase order to matched 3-way electronic invoice ($14,200.00).',
    metricHighlight: '$14,200.00',
    metricHighlightType: 'CURRENCY',
    actionLabel: 'Flip PO ↗',
    actionType: 'NAV_ORDER',
    actionPayload: { poNumber: 'PO-2026-9042', openFlipModal: true },
    status: 'PENDING'
  },
  {
    id: 'task-ord-2',
    refCode: 'PO-2026-101',
    title: 'Acknowledge Purchase Order & Delivery SLA',
    category: 'ORDER',
    categoryLabel: 'PO Action',
    priority: 'HIGH',
    priorityLabel: 'High',
    buyerName: 'Meridian Health Network',
    buyerOrgId: 'buyer-org-3',
    buyerInitials: 'ME',
    dueDate: 'In 3 Days',
    dueUrgency: 'WARNING',
    description: 'Purchase order for Cloud Server Deployment issued. Confirm delivery schedule and counter-sign order ($45,000.00).',
    metricHighlight: '$45,000.00',
    metricHighlightType: 'CURRENCY',
    actionLabel: 'View PO',
    actionType: 'NAV_ORDER',
    actionPayload: { poNumber: 'PO-2026-101' },
    status: 'PENDING'
  },
  {
    id: 'task-asn-1',
    refCode: 'ASN-2026-088',
    title: 'Dispatch Shipping Notice & Carrier Manifest',
    category: 'ASN',
    categoryLabel: 'Shipment ASN',
    priority: 'HIGH',
    priorityLabel: 'High',
    buyerName: 'Meridian Health Network',
    buyerOrgId: 'buyer-org-3',
    buyerInitials: 'ME',
    dueDate: 'In Transit',
    dueUrgency: 'WARNING',
    description: 'Bay 14 Server Rack Hardware in transit. Upload electronic bill of lading, package barcode serials, and carrier tracking.',
    metricHighlight: 'Dock In-Transit',
    metricHighlightType: 'STATUS',
    actionLabel: 'View ASN',
    actionType: 'NAV_ASN',
    actionPayload: { asnNumber: 'ASN-2026-088' },
    status: 'PENDING'
  },
  {
    id: 'task-fin-1',
    refCode: 'INV-2026-022',
    title: 'Claim Accelerated Early Payout Discount',
    category: 'FINANCE',
    categoryLabel: 'Early Cash',
    priority: 'HIGH',
    priorityLabel: 'High',
    buyerName: 'Starlight Aerospace & Defense',
    buyerOrgId: 'buyer-org-2',
    buyerInitials: 'ST',
    dueDate: 'Available Today',
    dueUrgency: 'WARNING',
    description: 'Invoice #INV-2026-022 ($30,870.00) is pre-cleared for accelerated settlement under 2/10 Net 30 terms with 48h payout.',
    metricHighlight: '$30,870.00',
    metricHighlightType: 'CURRENCY',
    actionLabel: 'Cashout ⚡',
    actionType: 'NAV_INVOICE',
    actionPayload: { earlyPay: true, invoiceNumber: 'INV-2026-022' },
    status: 'PENDING'
  },
  {
    id: 'task-onb-2',
    refCode: 'INV-MERIDIAN-5519',
    title: 'Clinical Vendor Compliance & HIPAA Governance',
    category: 'ONBOARDING',
    categoryLabel: 'Compliance',
    priority: 'HIGH',
    priorityLabel: 'Action Req',
    buyerName: 'Meridian Health Network',
    buyerOrgId: 'buyer-org-3',
    buyerInitials: 'ME',
    dueDate: 'In 4 Days',
    dueUrgency: 'WARNING',
    description: 'Hospital procurement network requested vendor onboarding, HIPAA data privacy governance, and $2M liability proof.',
    metricHighlight: 'Action Req',
    metricHighlightType: 'STATUS',
    actionLabel: 'Review',
    actionType: 'NAV_ONBOARDING',
    actionPayload: { buyerOrgId: 'buyer-org-3', autoCopilot: true },
    status: 'PENDING'
  },
  {
    id: 'task-rfp-1',
    refCode: 'RFP-2026-APEX-09',
    title: 'Enterprise Cloud Compute & Storage RFP',
    category: 'RFP',
    categoryLabel: 'Sourcing RFP',
    priority: 'MEDIUM',
    priorityLabel: 'Normal',
    buyerName: 'Apex Global Enterprises',
    buyerOrgId: 'buyer-org-1',
    buyerInitials: 'AP',
    dueDate: 'In 5 Days',
    dueUrgency: 'WARNING',
    description: 'Competitive bid event for 24 Compute Nodes and high-throughput NVMe SAN cluster ($520,000 est value). Auto-draft bid with Ava.',
    metricHighlight: '$520,000 est',
    metricHighlightType: 'CURRENCY',
    actionLabel: 'Prepare Bid',
    actionType: 'NAV_RFP',
    actionPayload: { eventId: 'src-apex-01' },
    status: 'PENDING'
  },
  {
    id: 'task-comp-1',
    refCode: 'DOC-ACORD-2026',
    title: 'Annual ACORD 25 Certificate Renewal',
    category: 'COMPLIANCE',
    categoryLabel: 'Insurance COI',
    priority: 'MEDIUM',
    priorityLabel: 'Normal',
    buyerName: 'OmniRetail Logistics Network',
    buyerOrgId: 'buyer-org-3',
    buyerInitials: 'OM',
    dueDate: 'In 20 Days',
    dueUrgency: 'NORMAL',
    description: 'Commercial General Liability policy renewal required for active transit network accounts. Upload updated policy binder.',
    metricHighlight: 'Document Vault',
    metricHighlightType: 'STATUS',
    actionLabel: 'Renew COI',
    actionType: 'NAV_DOCS',
    actionPayload: {},
    status: 'PENDING'
  }
];

// In-Memory Shared Reactive Store
let globalTasks: TaskItem[] = [...INITIAL_SHARED_TASKS];
const listeners = new Set<(tasks: TaskItem[]) => void>();

function notify() {
  const snapshot = [...globalTasks];
  listeners.forEach(l => l(snapshot));
}

export const taskService = {
  getTasks(): TaskItem[] {
    return [...globalTasks];
  },
  setTasks(newTasks: TaskItem[]) {
    globalTasks = [...newTasks];
    notify();
  },
  toggleTaskStatus(id: string): TaskItem | undefined {
    let updated: TaskItem | undefined;
    globalTasks = globalTasks.map(t => {
      if (t.id === id || t.refCode === id) {
        const nextStatus = t.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
        updated = {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'COMPLETED' ? new Date().toISOString() : undefined
        };
        return updated;
      }
      return t;
    });
    notify();
    return updated;
  },
  completeTask(id: string): TaskItem | undefined {
    let updated: TaskItem | undefined;
    globalTasks = globalTasks.map(t => {
      if (t.id === id || t.refCode === id) {
        updated = { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() };
        return updated;
      }
      return t;
    });
    notify();
    return updated;
  },
  createTask(task: Partial<TaskItem>): TaskItem {
    const newTask: TaskItem = {
      id: task.id || `task-${Date.now()}`,
      refCode: task.refCode || `TSK-${Date.now().toString().slice(-4)}`,
      title: task.title || 'New Operational Task',
      category: task.category || 'ORDER',
      categoryLabel: task.categoryLabel || 'General Task',
      priority: task.priority || 'HIGH',
      priorityLabel: task.priorityLabel || 'High',
      buyerName: task.buyerName || 'Apex Global Enterprises',
      buyerOrgId: task.buyerOrgId || 'buyer-org-1',
      buyerInitials: task.buyerInitials || 'AP',
      dueDate: task.dueDate || 'In 3 Days',
      dueUrgency: task.dueUrgency || 'WARNING',
      description: task.description || 'Action item generated by Ava Copilot.',
      metricHighlight: task.metricHighlight,
      metricHighlightType: task.metricHighlightType,
      actionLabel: task.actionLabel || 'View Task',
      actionType: task.actionType || 'NAV_ORDER',
      actionPayload: task.actionPayload,
      status: task.status || 'PENDING'
    };
    globalTasks = [newTask, ...globalTasks];
    notify();
    return newTask;
  },
  dismissTask(id: string) {
    globalTasks = globalTasks.filter(t => t.id !== id && t.refCode !== id);
    notify();
  },
  subscribe(listener: (tasks: TaskItem[]) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

// React hook to use the shared task store
export function useSharedTasks() {
  const [tasks, setTasksState] = useState<TaskItem[]>(() => taskService.getTasks());

  useEffect(() => {
    const unsubscribe = taskService.subscribe(newTasks => {
      setTasksState(newTasks);
    });
    return unsubscribe;
  }, []);

  return {
    tasks,
    pendingTasks: tasks.filter(t => t.status === 'PENDING'),
    completedTasks: tasks.filter(t => t.status === 'COMPLETED'),
    urgentTasks: tasks.filter(t => t.priority === 'URGENT' && t.status === 'PENDING'),
    toggleTaskStatus: taskService.toggleTaskStatus,
    completeTask: taskService.completeTask,
    createTask: taskService.createTask,
    dismissTask: taskService.dismissTask,
    setTasks: taskService.setTasks
  };
}

