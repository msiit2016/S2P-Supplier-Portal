import React, { useState, useEffect } from 'react';
import { TransactionComment } from '../types/index.js';

export interface SourcingLineItem {
  itemNumber: string;
  description: string;
  quantity: number;
  uom: string;
  targetPrice?: number;
  bidUnitPrice: number;
}

export interface SourcingQuestion {
  id: string;
  question: string;
  answer: string;
  aiDrafted?: boolean;
}

export interface SourcingEvent {
  id: string;
  eventNumber: string;
  type: 'RFP' | 'RFI' | 'BID';
  title: string;
  buyerName: string;
  buyerOrgId: string;
  category: string;
  estimatedValue: number;
  publishedDate: string;
  submissionDeadline: string;
  status: 'INVITED' | 'IN_PROGRESS' | 'SUBMITTED' | 'AWARDED' | 'UNDER_EVALUATION';
  description: string;
  lineItems: SourcingLineItem[];
  technicalQuestions: SourcingQuestion[];
}

export const DEFAULT_RFP_COMMENTS: Record<string, TransactionComment[]> = {
  'RFP-2026-APEX-09': [
    {
      id: 'comm-rfp-apex-1',
      entityType: 'RFP',
      entityId: 'src-apex-01',
      authorId: 'usr-buyer-elena',
      authorName: 'Elena Rostova (Strategic Sourcing Director)',
      authorRole: 'BUYER',
      text: 'Vendor clarification response submitted for Enterprise Compute Nodes ($520k est). Electronic bid submission deadline is Nov 15.',
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      id: 'comm-rfp-apex-2',
      entityType: 'RFP',
      entityId: 'src-apex-01',
      authorId: 'usr-buyer-elena',
      authorName: 'Elena Rostova (Strategic Sourcing Director)',
      authorRole: 'BUYER',
      text: 'Please confirm high-throughput NVMe storage cluster specs include MTTR benchmarks and Scope 2 carbon offset attestations before finalizing submission.',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    }
  ],
  'RFI-2026-NOVA-14': [
    {
      id: 'comm-rfi-aero-1',
      entityType: 'RFP',
      entityId: 'src-nova-02',
      authorId: 'usr-buyer-david',
      authorName: 'David Miller (Lead Systems Engineer)',
      authorRole: 'BUYER',
      text: 'Mil-Spec radiation-hardened telemetry transmission specifications validated. Please provide test bench calibration report.',
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
    }
  ]
};

export const INITIAL_SOURCING_EVENTS: SourcingEvent[] = [
  {
    id: 'src-apex-01',
    eventNumber: 'RFP-2026-APEX-09',
    type: 'RFP',
    title: 'Global Enterprise Cloud Compute Nodes & High-Throughput Storage Cluster',
    buyerName: 'Apex Global Enterprises',
    buyerOrgId: 'buyer-org-1',
    category: 'Cloud Infrastructure & High-Performance Hardware',
    estimatedValue: 520000,
    publishedDate: 'Oct 20, 2026',
    submissionDeadline: 'Nov 15, 2026',
    status: 'INVITED',
    description: 'Apex Global is seeking competitive enterprise bids for redundant high-throughput compute nodes across 3 availability zones with 99.99% uptime SLA.',
    lineItems: [
      { itemNumber: 'ACM-NODE-64GB', description: 'Enterprise Compute Node 64GB DDR5 / 32-Core Xeon', quantity: 24, uom: 'EA', targetPrice: 8500, bidUnitPrice: 8200 },
      { itemNumber: 'ACM-NVME-SAN', description: '100TB High-Throughput NVMe All-Flash Storage Array', quantity: 4, uom: 'EA', targetPrice: 42000, bidUnitPrice: 39500 },
      { itemNumber: 'ACM-SLA-PREM', description: '24/7 Platinum Mission-Critical Hardware Maintenance (1 Yr)', quantity: 1, uom: 'YR', targetPrice: 38000, bidUnitPrice: 34000 }
    ],
    technicalQuestions: [
      {
        id: 'q-sla',
        question: 'What is your guaranteed Mean Time to Repair (MTTR) and replacement parts SLA for hardware failures?',
        answer: '',
        aiDrafted: false
      },
      {
        id: 'q-security',
        question: 'Are your storage clusters certified compliant with SOC 2 Type II and ISO 27001 data isolation controls?',
        answer: '',
        aiDrafted: false
      },
      {
        id: 'q-sustainability',
        question: 'Provide PUE (Power Usage Effectiveness) efficiency benchmarks and Scope 2 carbon offset attestations.',
        answer: '',
        aiDrafted: false
      }
    ]
  },
  {
    id: 'src-nova-02',
    eventNumber: 'RFI-2026-NOVA-14',
    type: 'RFI',
    title: 'Radiation-Tolerant Telemetry Transceivers & Embedded Sensor Arrays',
    buyerName: 'NovaTech Aerospace & Defense',
    buyerOrgId: 'buyer-org-2',
    category: 'Aerospace & Mission-Critical Telemetry',
    estimatedValue: 850000,
    publishedDate: 'Oct 24, 2026',
    submissionDeadline: 'Nov 15, 2026',
    status: 'IN_PROGRESS',
    description: 'Request for Information regarding radiation-hardened telemetry transmission modules capable of operating in extreme thermal environments (-40C to +125C).',
    lineItems: [
      { itemNumber: 'AERO-TRANS-RT', description: 'Radiation-Hardened Telemetry Transceiver Module', quantity: 120, uom: 'EA', targetPrice: 5200, bidUnitPrice: 4950 },
      { itemNumber: 'AERO-CAL-TEST', description: 'Mil-Spec Environmental Stress Screening & Calibration Certificate', quantity: 120, uom: 'EA', targetPrice: 800, bidUnitPrice: 750 }
    ],
    technicalQuestions: [
      {
        id: 'q-milspec',
        question: 'Confirm compliance with MIL-STD-810H and AS9100 Rev D aerospace manufacturing quality management.',
        answer: '',
        aiDrafted: false
      }
    ]
  },
  {
    id: 'src-meridian-03',
    eventNumber: 'BID-2026-MER-03',
    type: 'BID',
    title: 'Clinical Telehealth Hardware Nodes & HIPAA Encrypted Gateway Gateways',
    buyerName: 'Meridian Health Systems',
    buyerOrgId: 'buyer-org-3',
    category: 'Clinical Medical Hardware & HIPAA Gateways',
    estimatedValue: 310000,
    publishedDate: 'Oct 22, 2026',
    submissionDeadline: 'Dec 01, 2026',
    status: 'SUBMITTED',
    description: 'Formal competitive sealed bid for hospital ward telemetry gateway terminals with integrated biometric and smartcard authentication.',
    lineItems: [
      { itemNumber: 'MED-GATE-01', description: 'Clinical Bedside Telemetry Gateway (FDA Class II Exempt)', quantity: 80, uom: 'EA', targetPrice: 3200, bidUnitPrice: 2950 }
    ],
    technicalQuestions: [
      {
        id: 'q-hipaa',
        question: 'Attest to AES-256 at-rest encryption and BAA (Business Associate Agreement) execution readiness.',
        answer: 'Attested. All gateway storage volumes enforce hardware-level FIPS 140-2 Level 3 AES-256 encryption. Standard BAA pre-executed in Master Public Profile.',
        aiDrafted: true
      }
    ]
  },
  {
    id: 'src-starlight-04',
    eventNumber: 'RFP-2026-STAR-05',
    type: 'RFP',
    title: 'Tactical Rugged Avionics Power Supply Units & DC Converters',
    buyerName: 'Starlight Defense Systems',
    buyerOrgId: 'buyer-org-4',
    category: 'Aerospace & Defense Electronics',
    estimatedValue: 420000,
    publishedDate: 'Oct 28, 2026',
    submissionDeadline: 'Dec 10, 2026',
    status: 'INVITED',
    description: 'Starlight Defense is sourcing ruggedized 28V DC power distribution units conformed to MIL-STD-704F with active surge mitigation.',
    lineItems: [
      { itemNumber: 'AERO-PWR-28V', description: 'Mil-Spec 28V DC Ruggedized Power Inverter Unit', quantity: 40, uom: 'EA', targetPrice: 7500, bidUnitPrice: 7100 },
      { itemNumber: 'AERO-EMI-SHIELD', description: 'EMI/RFI Shielded Chassis & Harness Enclosure', quantity: 40, uom: 'EA', targetPrice: 3200, bidUnitPrice: 3400 }
    ],
    technicalQuestions: [
      {
        id: 'q-star-1',
        question: 'Confirm ITAR registration and US manufacturing facility compliance for defense avionics.',
        answer: '',
        aiDrafted: false
      }
    ]
  },
  {
    id: 'src-omni-05',
    eventNumber: 'BID-2026-OMNI-22',
    type: 'BID',
    title: 'Automated Warehouse Fleet Telemetry Sensors & RFID Portals',
    buyerName: 'OmniRetail Logistics Network',
    buyerOrgId: 'buyer-org-5',
    category: 'Industrial IoT & Supply Chain Automation',
    estimatedValue: 640000,
    publishedDate: 'Oct 30, 2026',
    submissionDeadline: 'Dec 18, 2026',
    status: 'IN_PROGRESS',
    description: 'Competitive procurement for high-speed conveyor RFID reader portals and automated forklift collision-avoidance LiDAR telemetry modules.',
    lineItems: [
      { itemNumber: 'IOT-RFID-GATE', description: 'High-Speed Conveyor RFID Reader Gate Portal', quantity: 16, uom: 'EA', targetPrice: 28000, bidUnitPrice: 26500 },
      { itemNumber: 'IOT-SENS-LIDAR', description: 'AGV Forklift Collision Avoidance LiDAR Sensor Module', quantity: 48, uom: 'EA', targetPrice: 4500, bidUnitPrice: 4350 }
    ],
    technicalQuestions: [
      {
        id: 'q-omni-1',
        question: 'Detail ingress protection rating and dust resistance standards for industrial hubs.',
        answer: '',
        aiDrafted: false
      }
    ]
  }
];

// Reactive Store Singletons
let globalEvents: SourcingEvent[] = [...INITIAL_SOURCING_EVENTS];
let globalComments: Record<string, TransactionComment[]> = { ...DEFAULT_RFP_COMMENTS };
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(fn => fn());
};

export const rfpService = {
  getEvents(): SourcingEvent[] {
    return globalEvents;
  },

  getEventById(idOrNum: string): SourcingEvent | undefined {
    if (!idOrNum) return undefined;
    const q = idOrNum.trim().toLowerCase();
    return globalEvents.find(e => 
      e.id.toLowerCase() === q || 
      e.eventNumber.toLowerCase() === q ||
      e.eventNumber.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q.replace(/[^a-z0-9]/g, ''))
    );
  },

  getComments(eventNumber: string): TransactionComment[] {
    return globalComments[eventNumber] || [];
  },

  getAllComments(): Record<string, TransactionComment[]> {
    return globalComments;
  },

  addComment(eventNumber: string, comment: TransactionComment) {
    const existing = globalComments[eventNumber] || [];
    globalComments = {
      ...globalComments,
      [eventNumber]: [...existing, comment]
    };
    notify();
  },

  updateLineItemPrice(eventId: string, itemIndex: number, newPrice: number) {
    globalEvents = globalEvents.map(ev => {
      if (ev.id === eventId || ev.eventNumber === eventId) {
        const updated = [...ev.lineItems];
        if (updated[itemIndex]) {
          updated[itemIndex] = { ...updated[itemIndex], bidUnitPrice: newPrice };
        }
        return { 
          ...ev, 
          lineItems: updated,
          status: ev.status === 'INVITED' ? 'IN_PROGRESS' : ev.status
        };
      }
      return ev;
    });
    notify();
  },

  updateLineItemDiscount(eventId: string, itemIndex: number, discountPercent: number) {
    globalEvents = globalEvents.map(ev => {
      if (ev.id === eventId || ev.eventNumber === eventId) {
        const updated = [...ev.lineItems];
        const item = updated[itemIndex];
        if (item) {
          const basePrice = item.targetPrice || item.bidUnitPrice;
          const newPrice = Math.max(0, Math.round(basePrice * (1 - discountPercent / 100)));
          updated[itemIndex] = { ...item, bidUnitPrice: newPrice };
        }
        return { 
          ...ev, 
          lineItems: updated,
          status: ev.status === 'INVITED' ? 'IN_PROGRESS' : ev.status
        };
      }
      return ev;
    });
    notify();
  },

  applyAdvantage(eventId: string, percent: number) {
    globalEvents = globalEvents.map(ev => {
      if (ev.id === eventId || ev.eventNumber === eventId) {
        const updated = ev.lineItems.map(item => ({
          ...item,
          bidUnitPrice: Math.round((item.targetPrice || item.bidUnitPrice) * (1 - percent / 100))
        }));
        return { 
          ...ev, 
          lineItems: updated, 
          status: ev.status === 'INVITED' ? 'IN_PROGRESS' : ev.status 
        };
      }
      return ev;
    });
    notify();
  },

  resetToTarget(eventId: string) {
    globalEvents = globalEvents.map(ev => {
      if (ev.id === eventId || ev.eventNumber === eventId) {
        const updated = ev.lineItems.map(item => ({
          ...item,
          bidUnitPrice: item.targetPrice || item.bidUnitPrice
        }));
        return { ...ev, lineItems: updated };
      }
      return ev;
    });
    notify();
  },

  updateTechnicalAnswer(eventId: string, qIndex: number, text: string) {
    globalEvents = globalEvents.map(ev => {
      if (ev.id === eventId || ev.eventNumber === eventId) {
        const updated = [...ev.technicalQuestions];
        if (updated[qIndex]) {
          updated[qIndex] = { 
            ...updated[qIndex], 
            answer: text,
            aiDrafted: text.trim() === '' ? false : updated[qIndex].aiDrafted 
          };
        }
        return { 
          ...ev, 
          technicalQuestions: updated,
          status: ev.status === 'INVITED' ? 'IN_PROGRESS' : ev.status
        };
      }
      return ev;
    });
    notify();
  },

  autoDraftResponses(eventId: string) {
    const DRAFT_DICTIONARY: Record<string, string> = {
      'q-sla': 'Guaranteed 4-hour on-site MTTR response with dedicated enterprise stocking depots in Austin, Chicago, and San Jose. Backed by financial SLA penalties of 5% monthly fee credit per hour beyond 4 hours.',
      'q-security': 'Certified SOC 2 Type II (audited by Ernst & Young, issued Nov 2025) and ISO 27001:2022 compliant. Complete certification binders are verified in our Master Public Profile.',
      'q-sustainability': 'Average data center PUE benchmark is 1.15. 100% of compute operations are matched with regional wind and solar RECs adhering to GHG Protocol Scope 2 guidance.',
      'q-star-1': 'Attested. Registered with Directorate of Defense Trade Controls (DDTC) with full ITAR compliance and cage code pre-cleared.',
      'q-milspec': 'Fully compliant. All production facilities hold certified AS9100 Rev D and ISO 9001 credentials with 100% lot traceability.',
      'q-hipaa': 'Attested. All gateway storage volumes enforce hardware-level FIPS 140-2 Level 3 AES-256 encryption. Standard BAA pre-executed in Master Public Profile.',
      'q-omni-1': 'IP67 rated water and dust resistance, operating from -20C to +60C with continuous vibration tolerance.'
    };

    globalEvents = globalEvents.map(ev => {
      if (ev.id === eventId || ev.eventNumber === eventId) {
        return {
          ...ev,
          status: ev.status === 'INVITED' ? 'IN_PROGRESS' : ev.status,
          technicalQuestions: ev.technicalQuestions.map(q => ({
            ...q,
            answer: DRAFT_DICTIONARY[q.id] || q.answer || 'Attested & compliant with enterprise manufacturing, cybersecurity, and delivery standards per Master Public Profile golden record.',
            aiDrafted: true
          }))
        };
      }
      return ev;
    });
    notify();
  },

  submitProposal(eventId: string) {
    let submittedEv: SourcingEvent | undefined;
    globalEvents = globalEvents.map(ev => {
      if (ev.id === eventId || ev.eventNumber === eventId) {
        submittedEv = { ...ev, status: 'SUBMITTED' };
        return submittedEv;
      }
      return ev;
    });
    notify();
    return submittedEv;
  },

  reviseProposal(eventId: string) {
    let revisedEv: SourcingEvent | undefined;
    globalEvents = globalEvents.map(ev => {
      if (ev.id === eventId || ev.eventNumber === eventId) {
        revisedEv = { ...ev, status: 'IN_PROGRESS' };
        return revisedEv;
      }
      return ev;
    });
    notify();
    return revisedEv;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

// React hook for RFPs & Sourcing Events
export function useSharedRfps() {
  const [events, setEventsState] = useState<SourcingEvent[]>(() => rfpService.getEvents());
  const [commentsMap, setCommentsMapState] = useState<Record<string, TransactionComment[]>>(() => rfpService.getAllComments());

  useEffect(() => {
    const unsubscribe = rfpService.subscribe(() => {
      setEventsState([...rfpService.getEvents()]);
      setCommentsMapState({ ...rfpService.getAllComments() });
    });
    return unsubscribe;
  }, []);

  return {
    events,
    commentsMap,
    getEventById: rfpService.getEventById,
    getComments: rfpService.getComments,
    addComment: rfpService.addComment,
    updateLineItemPrice: rfpService.updateLineItemPrice,
    updateLineItemDiscount: rfpService.updateLineItemDiscount,
    applyAdvantage: rfpService.applyAdvantage,
    resetToTarget: rfpService.resetToTarget,
    updateTechnicalAnswer: rfpService.updateTechnicalAnswer,
    autoDraftResponses: rfpService.autoDraftResponses,
    submitProposal: rfpService.submitProposal,
    reviseProposal: rfpService.reviseProposal
  };
}

