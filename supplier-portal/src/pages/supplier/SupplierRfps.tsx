import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  FileText, 
  Send, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Download, 
  Upload, 
  Calculator, 
  Bot, 
  Check, 
  Calendar, 
  Filter, 
  Search, 
  ShieldCheck, 
  FileCheck2,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  lineItems: Array<{
    itemNumber: string;
    description: string;
    quantity: number;
    uom: string;
    targetPrice?: number;
    bidUnitPrice: number;
  }>;
  technicalQuestions: Array<{
    id: string;
    question: string;
    answer: string;
    aiDrafted?: boolean;
  }>;
}

export const SupplierRfps: React.FC = () => {
  const { navigate } = usePortal();
  const { currentUser } = useAuth();

  const [events, setEvents] = useState<SourcingEvent[]>([
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
        { itemNumber: 'SKU-NODE-64GB', description: 'Enterprise Compute Node 64GB DDR5 / 32-Core Xeon', quantity: 24, uom: 'EA', targetPrice: 8500, bidUnitPrice: 8200 },
        { itemNumber: 'SKU-NVME-SAN', description: '100TB High-Throughput NVMe All-Flash Storage Array', quantity: 4, uom: 'EA', targetPrice: 42000, bidUnitPrice: 39500 },
        { itemNumber: 'SKU-SLA-PREM', description: '24/7 Platinum Mission-Critical Hardware Maintenance (1 Yr)', quantity: 1, uom: 'YR', targetPrice: 38000, bidUnitPrice: 34000 }
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
      submissionDeadline: 'Nov 22, 2026',
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
          answer: 'Fully compliant. All production facilities hold certified AS9100 Rev D and ISO 9001 credentials with 100% lot traceability.',
          aiDrafted: true
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
    }
  ]);

  const [selectedEventId, setSelectedEventId] = useState<string>('src-apex-01');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [aiDrafting, setAiDrafting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  // Calculations for active event bid
  const totalBidAmount = activeEvent.lineItems.reduce((sum, item) => sum + (item.quantity * item.bidUnitPrice), 0);
  const totalTargetAmount = activeEvent.lineItems.reduce((sum, item) => sum + (item.quantity * (item.targetPrice || item.bidUnitPrice)), 0);
  const variancePercent = totalTargetAmount > 0 ? (((totalBidAmount - totalTargetAmount) / totalTargetAmount) * 100).toFixed(1) : '0';

  // AI Bid Assistant: Auto-Draft Technical Responses from Public Profile & Vault
  const handleAiDraftResponses = async () => {
    setAiDrafting(true);
    setToastMsg('AI Sourcing Copilot analyzing RFP specifications against your Master Public Profile and Document Vault...');
    
    await new Promise(r => setTimeout(r, 1200));

    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEvent.id) {
        return {
          ...ev,
          technicalQuestions: ev.technicalQuestions.map(q => {
            if (q.id === 'q-sla') {
              return {
                ...q,
                answer: 'Guaranteed 4-hour on-site MTTR response with dedicated enterprise stocking depots in Austin, Chicago, and San Jose. Backed by financial SLA penalties of 5% monthly fee credit per hour beyond 4 hours.',
                aiDrafted: true
              };
            }
            if (q.id === 'q-security') {
              return {
                ...q,
                answer: 'Certified SOC 2 Type II (audited by Ernst & Young, issued Nov 2025) and ISO 27001:2022 compliant. Complete certification binders are verified in our Master Public Profile.',
                aiDrafted: true
              };
            }
            if (q.id === 'q-sustainability') {
              return {
                ...q,
                answer: 'Average data center PUE benchmark is 1.15. 100% of compute operations are matched with regional wind and solar RECs (Renewable Energy Certificates) adhering to GHG Protocol Scope 2 guidance.',
                aiDrafted: true
              };
            }
            return q;
          })
        };
      }
      return ev;
    }));

    setAiDrafting(false);
    setToastMsg('✨ AI Sourcing Copilot successfully drafted all technical questionnaire responses with verified citations!');
    setTimeout(() => setToastMsg(null), 6000);
  };

  const handleUpdateBidPrice = (itemIndex: number, newPrice: number) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEvent.id) {
        const updatedItems = [...ev.lineItems];
        updatedItems[itemIndex].bidUnitPrice = newPrice;
        return { ...ev, lineItems: updatedItems };
      }
      return ev;
    }));
  };

  const handleUpdateAnswer = (qIndex: number, text: string) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEvent.id) {
        const updatedQuestions = [...ev.technicalQuestions];
        updatedQuestions[qIndex].answer = text;
        return { ...ev, technicalQuestions: updatedQuestions };
      }
      return ev;
    }));
  };

  const handleSubmitBid = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEvent.id) {
        return { ...ev, status: 'SUBMITTED' };
      }
      return ev;
    }));

    setIsSubmitting(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setToastMsg(`🎉 Bid for ${activeEvent.eventNumber} successfully submitted to ${activeEvent.buyerName}! Procurement team notified.`);
    setTimeout(() => setToastMsg(null), 6000);
  };

  const filteredEvents = events.filter(e => {
    if (filterType === 'ALL') return true;
    return e.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-r-xl shadow-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 font-bold hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Cockpit */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Autonomous Sourcing & Tenders
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              3 Active Enterprise Events
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Enterprise RFPs, RFIs & Sourcing Bids</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Review incoming requests for proposals from enterprise buyers, prepare competitive rate cards, and leverage AI to draft compliant technical proposals.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => navigate('/catalog')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Review Catalog Rates
          </button>
          <button
            onClick={handleAiDraftResponses}
            disabled={aiDrafting}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{aiDrafting ? 'Drafting...' : 'AI Sourcing Copilot'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setFilterType('RFP')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterType === 'RFP'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            RFPs (Proposals)
          </button>
          <button
            onClick={() => setFilterType('RFI')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterType === 'RFI'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            RFIs (Information)
          </button>
          <button
            onClick={() => setFilterType('BID')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterType === 'BID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Formal Bids
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Showing <strong>{filteredEvents.length}</strong> sourcing opportunities
        </span>
      </div>

      {/* Main Grid: Left Event List + Right Bid Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: SOURCING EVENTS LIST */}
        <div className="lg:col-span-5 space-y-3">
          {filteredEvents.map((ev) => {
            const isSelected = activeEvent.id === ev.id;
            return (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{ev.eventNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          ev.type === 'RFP' ? 'bg-indigo-100 text-indigo-800' : ev.type === 'RFI' ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ev.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                        {ev.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.buyerName}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      ev.status === 'SUBMITTED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ev.status === 'IN_PROGRESS'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ev.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    Est. Value: <strong className="text-slate-900 font-mono">${(ev.estimatedValue / 1000).toFixed(0)}k</strong>
                  </div>
                  <div className="flex items-center text-slate-500 gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Closes: <strong className="text-slate-800">{ev.submissionDeadline}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: INTERACTIVE BID & PROPOSAL WORKBENCH */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Workbench Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-indigo-600">{activeEvent.eventNumber}</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-700">{activeEvent.buyerName}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{activeEvent.title}</h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Category: <strong>{activeEvent.category}</strong> • Deadline: <strong className="text-amber-700">{activeEvent.submissionDeadline}</strong>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bid Value</div>
              <div className="text-xl font-bold text-slate-900 font-mono">
                ${totalBidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className={`text-[10px] font-semibold ${Number(variancePercent) <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {Number(variancePercent) <= 0 ? `${variancePercent}% Competitive Advantage` : `+${variancePercent}% vs Target`}
              </span>
            </div>
          </div>

          {/* Line Item Pricing Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bill of Materials & Pricing Schedule</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                {activeEvent.lineItems.length} Deliverable Line Items
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item / Description</th>
                    <th className="py-2.5 px-3 text-center">Qty / UOM</th>
                    <th className="py-2.5 px-3 text-right">Target Price</th>
                    <th className="py-2.5 px-3 text-right">Your Bid Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeEvent.lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-mono">{item.itemNumber}</div>
                        <div className="text-slate-500 text-[11px]">{item.description}</div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-semibold">
                        {item.quantity} {item.uom}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        ${item.targetPrice?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          value={item.bidUnitPrice}
                          onChange={(e) => handleUpdateBidPrice(idx, parseFloat(e.target.value) || 0)}
                          className="w-24 text-right border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                        ${(item.quantity * item.bidUnitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical RFP Questionnaires & AI Autocompletion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Technical Specifications & Compliance Attestations</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Buyer procurement questions evaluating capability, SLAs, and security controls.
                </p>
              </div>

              <button
                onClick={handleAiDraftResponses}
                disabled={aiDrafting}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{aiDrafting ? 'Drafting...' : 'Auto-Draft with AI'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {activeEvent.technicalQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      Q{idx + 1}: {q.question}
                    </span>
                    {q.aiDrafted && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                        <span>AI Verified</span>
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    value={q.answer}
                    onChange={(e) => handleUpdateAnswer(idx, e.target.value)}
                    placeholder="Enter your response or click 'Auto-Draft with AI' to populate from your Master Public Profile..."
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submission Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Submitting as: <strong className="text-slate-800">{currentUser?.organizationName || 'Acme Industrial Tech Inc.'}</strong>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setToastMsg('Draft proposal saved.')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleSubmitBid}
                disabled={isSubmitting || activeEvent.status === 'SUBMITTED'}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md ${
                  activeEvent.status === 'SUBMITTED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{activeEvent.status === 'SUBMITTED' ? 'Proposal Submitted' : isSubmitting ? 'Transmitting...' : 'Submit Formal Proposal'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
