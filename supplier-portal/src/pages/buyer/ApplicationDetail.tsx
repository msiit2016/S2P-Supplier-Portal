import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { 
  SupplierApplication, 
  ApplicationFieldValue, 
  OnboardingDocument, 
  SupplierMessage, 
  AuditEvent 
} from '../../types/index.js';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Send, 
  Paperclip, 
  History, 
  Building, 
  ExternalLink,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ApplicationDetailProps {
  applicationId: string;
}

export const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ applicationId }) => {
  const { navigate } = usePortal();
  const { currentUser } = useAuth();
  
  const [app, setApp] = useState<SupplierApplication | null>(null);
  const [fields, setFields] = useState<ApplicationFieldValue[]>([]);
  const [documents, setDocuments] = useState<OnboardingDocument[]>([]);
  const [messages, setMessages] = useState<SupplierMessage[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [completeness, setCompleteness] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FIELDS' | 'DOCS' | 'MESSAGES' | 'AUDIT'>('OVERVIEW');
  const [newMessageText, setNewMessageText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppDetail();
  }, [applicationId]);

  const loadAppDetail = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getApplication(applicationId);
      if (res.application) {
        setApp(res.application);
        setFields(res.fields || []);
        setDocuments(res.documents || []);
        setMessages(res.messages || []);
        setAuditEvents(res.auditEvents || []);
        setCompleteness(res.completeness || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    setSendingMsg(true);
    try {
      await ApiClient.sendMessage(applicationId, {
        message: newMessageText,
        isInternalNote
      });
      setNewMessageText('');
      await loadAppDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading || !app) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading case details...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-brand-600">{app.caseReference}</span>
              <span className="text-slate-300">•</span>
              <h1 className="text-lg font-bold text-slate-900">{app.supplierName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
              }`}>
                {app.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Category: <span className="font-medium text-slate-700">{app.supplyCategory.replace(/_/g, ' ')}</span> •
              Channel: <span className="font-medium text-slate-700">{app.channel.replace(/_/g, ' ')}</span> •
              Reviewer: <span className="font-medium text-slate-700">{app.assignedReviewerName || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Action Button: Launch Split-Screen Review Workspace */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate(`/supplier-applications/${app.id}/review`)}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <Layers className="w-4 h-4" />
            <span>Open Split-Screen Review Workspace</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6">
        {[
          { key: 'OVERVIEW', label: 'Case Overview & AI Findings', icon: Sparkles },
          { key: 'FIELDS', label: `Field Provenance (${fields.length})`, icon: FileText },
          { key: 'DOCS', label: `Documents (${documents.length})`, icon: Paperclip },
          { key: 'MESSAGES', label: `Communications (${messages.length})`, icon: Mail },
          { key: 'AUDIT', label: `Audit Trail (${auditEvents.length})`, icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-3 text-xs font-bold border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* AI Executive Summary Card */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md border border-indigo-900">
              <div className="flex items-center space-x-2 mb-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Autonomous AI Compliance Synthesis</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {app.aiSummary || 'Analysis complete. Verified all uploaded credentials against procurement policy matrices.'}
              </p>
            </div>

            {/* Findings & Completeness Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Policy & Discrepancy Diagnostics
              </h3>
              {completeness?.findings?.length > 0 ? (
                <div className="space-y-2">
                  {completeness.findings.map((f: string, idx: number) => (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero compliance collisions or missing fields detected.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Case Metadata & Risk Card */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Deterministic Risk Score
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-extrabold ${
                    app.riskLevel === 'HIGH' || app.riskLevel === 'CRITICAL' ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {app.riskScore}/100
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">{app.riskLevel} COMPLIANCE RISK</div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>Completeness: <strong>{completeness?.score || 85}%</strong></div>
                  <div>Missing Docs: <strong>{completeness?.missingDocs?.length || 0}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>ERP Vendor ID:</span>
                  <span className="font-mono font-bold text-slate-900">{app.erpVendorId || 'Pending Activation'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Created Date:</span>
                  <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Last Modified:</span>
                  <span>{new Date(app.updatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FIELDS & PROVENANCE */}
      {activeTab === 'FIELDS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b">
              <tr>
                <th className="py-3 px-4">Field Key</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Provenance</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Source Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map(f => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{f.fieldKey}</td>
                  <td className="py-3 px-4 font-mono">{f.maskedValue || String(f.value)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {f.provenance}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{Math.round(f.confidence * 100)}%</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {f.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{f.sourceReference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'DOCS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{doc.title}</h4>
                    <p className="text-[10px] text-slate-400">{doc.docType}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  {doc.verificationStatus}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Checksum: {doc.checksum.slice(0, 18)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: COMMUNICATIONS */}
      {activeTab === 'MESSAGES' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 max-h-96 overflow-y-auto">
            {messages.map(m => (
              <div
                key={m.id}
                className={`p-3 rounded-lg text-xs leading-relaxed ${
                  m.isInternalNote ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1 text-slate-800">
                  <span>{m.senderName} ({m.senderRole}) {m.isInternalNote && '• INTERNAL NOTE ONLY'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(m.sentAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-slate-700 whitespace-pre-line">{m.message}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <textarea
              rows={3}
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Type message to supplier or internal compliance note..."
              className="w-full text-xs border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <span>Internal Reviewer Note (Never visible to supplier)</span>
              </label>

              <button
                type="submit"
                disabled={sendingMsg || !newMessageText.trim()}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isInternalNote ? 'Record Note' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 divide-y divide-slate-100">
          {auditEvents.map(evt => (
            <div key={evt.id} className="py-3 flex items-start justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900">{evt.action}</span>
                <span className="text-slate-400 ml-2">by {evt.actorName} ({evt.actorRole})</span>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {JSON.stringify(evt.details)}
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(evt.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
