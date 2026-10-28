import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { 
  SupplierApplication, 
  ApplicationFieldValue, 
  OnboardingDocument, 
  ExtractedFieldItem 
} from '../../types/index.js';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Edit3, 
  Save, 
  Mail, 
  ShieldCheck, 
  RefreshCw,
  Lock,
  Layers,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationReviewWorkspaceProps {
  applicationId: string;
}

export const ApplicationReviewWorkspace: React.FC<ApplicationReviewWorkspaceProps> = ({ applicationId }) => {
  const { navigate, setSelectedAppId } = usePortal();
  const { currentUser } = useAuth();
  
  const [app, setApp] = useState<SupplierApplication | null>(null);
  const [fields, setFields] = useState<ApplicationFieldValue[]>([]);
  const [documents, setDocuments] = useState<OnboardingDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<OnboardingDocument | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>('legal_entity_name');
  const [unmaskedFields, setUnmaskedFields] = useState<Record<string, string>>({});
  
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [clarificationDraft, setClarificationDraft] = useState({ subject: '', body: '' });
  const [sendingClarification, setSendingClarification] = useState(false);

  const [approving, setApproving] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getApplication(applicationId);
      if (res.application) {
        setApp(res.application);
        setFields(res.fields || []);
        setDocuments(res.documents || []);
        if (res.documents && res.documents.length > 0) {
          setActiveDoc(res.documents[0]);
        }
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  // Unmask sensitive field (e.g. Tax ID, Bank Account)
  const handleUnmask = async (fieldId: string) => {
    try {
      const res = await ApiClient.unmaskField(applicationId, fieldId);
      if (res.unmaskedValue) {
        setUnmaskedFields(prev => ({ ...prev, [fieldId]: res.unmaskedValue }));
      }
    } catch (e: any) {
      alert(e.message || 'Unauthorized to unmask');
    }
  };

  // Verify field value
  const handleVerifyField = async (fieldId: string, status: string, correctedVal?: string) => {
    try {
      await ApiClient.verifyField(applicationId, fieldId, status, correctedVal);
      setEditingFieldId(null);
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Prepare & open AI clarification email modal
  const handleOpenClarificationModal = async () => {
    try {
      const res = await ApiClient.draftClarification(applicationId);
      if (res.draft) {
        setClarificationDraft(res.draft);
        setClarificationModalOpen(true);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Dispatch clarification email to supplier
  const handleSendClarification = async () => {
    setSendingClarification(true);
    try {
      await ApiClient.sendMessage(applicationId, {
        subject: clarificationDraft.subject,
        message: clarificationDraft.body,
        isInternalNote: false
      });
      // Move application to CHANGES_REQUESTED
      await ApiClient.transitionApplication(applicationId, 'CHANGES_REQUESTED', 'Clarification email dispatched');
      setClarificationModalOpen(false);
      setActionSuccessMsg('Clarification request dispatched to supplier. State set to CHANGES_REQUESTED.');
      await loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSendingClarification(false);
    }
  };

  // Approve application and activate ERP vendor
  const handleApproveApplication = async () => {
    setApproving(true);
    try {
      const res = await ApiClient.transitionApplication(applicationId, 'APPROVED', 'All compliance and document evidence verified.');
      if (res.error) {
        setActionErrorMsg(res.error);
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setActionSuccessMsg(`Application APPROVED! ERP Vendor Master ID: ${res.application.erpVendorId}`);
        await loadData();
      }
    } catch (e: any) {
      setActionErrorMsg(e.message);
    } finally {
      setApproving(false);
    }
  };

  if (loading || !app) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
        Loading AI-assisted review workspace...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans bg-slate-100">
      {/* Workspace Top Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-600">{app.caseReference}</span>
              <span className="text-slate-300">•</span>
              <h1 className="text-sm font-bold text-slate-900">{app.supplierName}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
              }`}>
                {app.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              AI Evidence Extraction & 4-Eye Review Workspace
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenClarificationModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>Request Clarification</span>
          </button>

          {app.status !== 'APPROVED' && (
            <button
              onClick={handleApproveApplication}
              disabled={approving}
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Activate ERP Vendor</span>
            </button>
          )}
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-800 text-xs px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg('')} className="text-rose-700 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* Main Split Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Source Document Viewer with Bounding Boxes */}
        <div className="w-1/2 border-r border-slate-200 bg-slate-900 flex flex-col overflow-hidden">
          {/* Document Tab Selector */}
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">
              Source Docs:
            </span>
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition ${
                  activeDoc?.id === doc.id
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px]">{doc.title}</span>
                {doc.verificationStatus === 'VERIFIED' && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
              </button>
            ))}
          </div>

          {/* Interactive Document Preview Canvas */}
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center relative">
            {activeDoc ? (
              <div className="w-[520px] min-h-[640px] bg-white rounded-lg shadow-2xl p-8 relative select-none text-slate-800 border border-slate-300">
                {/* Simulated Real Document Certificate Preview */}
                <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold uppercase tracking-tight">{activeDoc.title}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">Verified OCR Stream • Page 1 of 1</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 font-mono px-2 py-0.5 rounded border border-slate-200">
                    {activeDoc.checksum.slice(0, 16)}...
                  </span>
                </div>

                {/* Simulated Document Body Lines with interactive bounding boxes */}
                <div className="space-y-4 text-xs font-mono relative">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase">Entity Legal Identification</div>
                    <div className="font-bold text-slate-900 mt-1">{app.supplierName}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">500 Howard Street, Suite 400, San Francisco, CA 94105</div>
                  </div>

                  {activeDoc.docType === 'IRS_W9' && (
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase">Part I: Taxpayer Identification Number (TIN)</div>
                      <div className="font-bold text-slate-900 mt-1">Social Security / Employer ID: 84-1294821</div>
                    </div>
                  )}

                  {activeDoc.docType === 'CERT_INCORPORATION' && (
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase">State of Delaware • Corporate Succession</div>
                      <div className="font-bold text-slate-900 mt-1">Surviving Entity: Nexura Global Analytics Inc.</div>
                      <div className="text-slate-600">Predecessor Entity: Apex Analytics LLC (DE #4920194)</div>
                    </div>
                  )}

                  {activeDoc.docType === 'BANK_VERIFICATION_LETTER' && (
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase">Silicon Valley Bank Deposit Verification</div>
                      <div className="font-bold text-slate-900 mt-1">Beneficiary: Nexura Global Analytics Inc.</div>
                      <div>Routing (ABA): 121000358 • Account: 489201948210</div>
                    </div>
                  )}

                  {/* Render Visual Bounding Box Highlights for Extractions */}
                  {activeDoc.extractions?.map((ext, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-indigo-50/90 border border-indigo-400 text-indigo-950 font-sans text-xs relative cursor-pointer hover:bg-indigo-100 transition"
                      onClick={() => setSelectedFieldKey(ext.fieldKey)}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700">
                        <span>{ext.label}</span>
                        <span className="font-mono bg-indigo-200/80 px-1.5 rounded">{Math.round(ext.confidence * 100)}% Conf</span>
                      </div>
                      <div className="font-semibold mt-0.5">{String(ext.value)}</div>
                      <div className="text-[10px] text-indigo-500 italic mt-0.5">{ext.rawSnippet}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
                  <span>Authorized Digital Signature Pinned</span>
                  <span>Document ID: {activeDoc.id}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs">No document selected.</div>
            )}
          </div>
        </div>

        {/* Right Side: AI-Assisted Extracted Field Review & Human Verification Controls */}
        <div className="w-1/2 bg-white flex flex-col overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Extracted Data & Provenance Inspector
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review OCR extractions against source documents. Banking and Tax coordinates require explicit human verification.
            </p>
          </div>

          {/* Fields List */}
          <div className="space-y-3.5">
            {fields.map((field) => {
              const isSensitive = field.isSensitive;
              const isUnmasked = Boolean(unmaskedFields[field.id]);
              const displayValue = isSensitive && !isUnmasked ? (field.maskedValue || '••••••••') : (unmaskedFields[field.id] || field.value);
              const isEditing = editingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    selectedFieldKey === field.fieldKey
                      ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  onClick={() => setSelectedFieldKey(field.fieldKey)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {field.fieldKey.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {/* Provenance Badge */}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          field.provenance === 'DOCUMENT_EXTRACTED'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : field.provenance === 'SUPPLIER_ENTERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {field.provenance}
                        </span>
                        {/* Verification Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          field.verificationStatus === 'HUMAN_VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : field.verificationStatus === 'AI_CONFIRMED'
                            ? 'bg-sky-100 text-sky-800'
                            : field.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {field.verificationStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Source: {field.sourceReference} • Confidence: {Math.round(field.confidence * 100)}%
                      </div>
                    </div>

                    {/* Sensitive unmask toggle */}
                    {isSensitive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isUnmasked) {
                            setUnmaskedFields(prev => {
                              const copy = { ...prev };
                              delete copy[field.id];
                              return copy;
                            });
                          } else {
                            handleUnmask(field.id);
                          }
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition"
                      >
                        {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isUnmasked ? 'Mask' : 'Reveal'}</span>
                      </button>
                    )}
                  </div>

                  {/* Value Row / Edit mode */}
                  <div className="mt-2.5">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 text-xs border border-brand-500 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                        <button
                          onClick={() => handleVerifyField(field.id, 'HUMAN_VERIFIED', editValue)}
                          className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingFieldId(null)}
                          className="px-2.5 py-1.5 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 font-mono">
                          {displayValue}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingFieldId(field.id);
                              setEditValue(String(field.value));
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                            title="Correct proposed value"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleVerifyField(field.id, 'HUMAN_VERIFIED')}
                            className="p-1 hover:bg-emerald-50 rounded text-emerald-600 hover:text-emerald-800"
                            title="Accept and verify field"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleVerifyField(field.id, 'REJECTED')}
                            className="p-1 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-700"
                            title="Mark unresolved / reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conflict Notice if present */}
                  {field.conflictValues && field.conflictValues.length > 0 && (
                    <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Contradictory Value Detected:</strong> '{field.conflictValues[0].value}' from {field.conflictValues[0].source}.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clarification Draft Modal */}
      {clarificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI-Drafted Clarification Notice
              </h3>
              <button onClick={() => setClarificationModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={clarificationDraft.subject}
                onChange={(e) => setClarificationDraft({ ...clarificationDraft, subject: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded px-3 py-2 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Body</label>
              <textarea
                rows={8}
                value={clarificationDraft.body}
                onChange={(e) => setClarificationDraft({ ...clarificationDraft, body: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded p-3 font-mono leading-relaxed"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setClarificationModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendClarification}
                disabled={sendingClarification}
                className="px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded shadow-xs"
              >
                {sendingClarification ? 'Dispatching...' : 'Approve & Send to Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
