import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { ApiClient } from '../../api/client.js';
import { EmailIntakeRecord, SupplierApplication } from '../../types/index.js';
import { 
  Inbox, 
  Mail, 
  Paperclip, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Link, 
  FileText, 
  RefreshCw,
  Plus,
  Send,
  Building
} from 'lucide-react';

export const EmailIntakeQueue: React.FC = () => {
  const { navigate, setSelectedAppId } = usePortal();
  const [queue, setQueue] = useState<EmailIntakeRecord[]>([]);
  const [applications, setApplications] = useState<SupplierApplication[]>([]);
  const [selectedIntake, setSelectedIntake] = useState<EmailIntakeRecord | null>(null);
  const [associateModalOpen, setAssociateModalOpen] = useState(false);
  const [targetAppId, setTargetAppId] = useState('');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [emailRes, appRes] = await Promise.all([
        ApiClient.getEmailIntake(),
        ApiClient.getApplications()
      ]);
      if (emailRes.emailIntakeQueue) {
        setQueue(emailRes.emailIntakeQueue);
        if (emailRes.emailIntakeQueue.length > 0) {
          setSelectedIntake(emailRes.emailIntakeQueue[0]);
        }
      }
      if (appRes.applications) {
        setApplications(appRes.applications);
        if (appRes.applications.length > 0) {
          setTargetAppId(appRes.applications[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate receiving an inbound email from a supplier
  const handleSimulateInboundEmail = async () => {
    setIsSimulating(true);
    try {
      await ApiClient.simulateIncomingEmail({
        senderEmail: 'procurement@novastream.io',
        senderName: 'Rachel Green (NovaStream Technologies)',
        subject: 'NovaStream Technologies Inc. Onboarding Documents Pack',
        bodyText: 'Attached are our official IRS Form W-9, ACORD 25 Certificate of Liability, and Bank Deposit authorization for our vendor account.',
        attachments: [
          { filename: 'NovaStream_IRS_W9_2026.pdf', fileType: 'application/pdf', size: 310000, docType: 'IRS_W9' },
          { filename: 'NovaStream_ACORD_Insurance.pdf', fileType: 'application/pdf', size: 480000, docType: 'CERT_INSURANCE_ACORD' }
        ]
      });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Associate email with an application
  const handleAssociateEmail = async () => {
    if (!selectedIntake || !targetAppId) return;
    try {
      await ApiClient.associateEmail(selectedIntake.id, targetAppId);
      setAssociateModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Automated Email & Mailbox Intake
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Autonomous Ingestion Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingests offline supplier documents, correlates by case reference or entity domain, and extracts structured fields.
          </p>
        </div>

        <button
          onClick={handleSimulateInboundEmail}
          disabled={isSimulating}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          <span>Simulate Inbound Supplier Email</span>
        </button>
      </div>

      {/* Main Mailbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List Left Column */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Incoming Mailbox Queue ({queue.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Auto-Refreshed</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {queue.map(item => {
              const isSelected = selectedIntake?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIntake(item)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900 truncate max-w-[180px]">{item.senderName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 line-clamp-1">{item.subject}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">{item.bodySnippet}</div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500 font-mono">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      {item.attachments.length} files
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'PROCESSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'MATCHED'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Email Detailed Inspector (Right 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between h-[650px] overflow-y-auto">
          {selectedIntake ? (
            <div className="space-y-6">
              {/* Message Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedIntake.subject}</h2>
                    <div className="text-xs text-slate-500 mt-1">
                      From: <strong className="text-slate-800">{selectedIntake.senderName}</strong> &lt;{selectedIntake.senderEmail}&gt;
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                      selectedIntake.status === 'PROCESSED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {selectedIntake.status === 'PROCESSED' ? 'Auto-Associated & Parsed' : 'Unresolved Case'}
                    </span>
                  </div>
                </div>

                {/* Case Match Status Box */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>
                      {selectedIntake.associatedCaseReference ? (
                        <>
                          Linked Case: <strong className="text-brand-600">{selectedIntake.associatedCaseReference}</strong> ({selectedIntake.suggestedMatchSupplierName})
                        </>
                      ) : (
                        <>Suggested Candidate: <strong>{selectedIntake.suggestedMatchSupplierName || 'Unknown Supplier'}</strong></>
                      )}
                    </span>
                  </div>

                  {selectedIntake.associatedApplicationId ? (
                    <button
                      onClick={() => {
                        setSelectedAppId(selectedIntake.associatedApplicationId!);
                        navigate(`/supplier-applications/${selectedIntake.associatedApplicationId}`);
                      }}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
                    >
                      View Case 360 →
                    </button>
                  ) : (
                    <button
                      onClick={() => setAssociateModalOpen(true)}
                      className="px-2.5 py-1 bg-brand-600 text-white rounded text-xs font-semibold hover:bg-brand-700"
                    >
                      Manually Link to Case
                    </button>
                  )}
                </div>
              </div>

              {/* Message Body Content */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Content</h3>
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line border border-slate-200">
                  {selectedIntake.bodySnippet}
                </div>
              </div>

              {/* Attachments & Extractions */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  Attached Vendor Documents ({selectedIntake.attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedIntake.attachments.map(att => (
                    <div
                      key={att.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">{att.filename}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {Math.round(att.size / 1024)} KB • {att.docType || 'PDF'}
                          </div>
                        </div>
                      </div>

                      {att.processed ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          OCR Extracted
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select an email from the queue to inspect.
            </div>
          )}
        </div>
      </div>

      {/* Manual Case Association Modal */}
      {associateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Associate Email to Onboarding Case</h3>
            <p className="text-xs text-slate-500">
              Select the active supplier application to attach these email documents and run OCR extractions:
            </p>
            <select
              value={targetAppId}
              onChange={(e) => setTargetAppId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white"
            >
              {applications.map(a => (
                <option key={a.id} value={a.id}>
                  {a.caseReference} - {a.supplierName} ({a.status})
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setAssociateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAssociateEmail}
                className="px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded shadow-xs"
              >
                Confirm Association
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
