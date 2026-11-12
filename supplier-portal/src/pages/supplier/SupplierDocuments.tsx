import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { OnboardingDocument, TransactionComment } from '../../types/index.js';
import { 
  Files, 
  FileText, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Sparkles, 
  X,
  Lock,
  Download,
  AlertTriangle,
  Building2
} from 'lucide-react';

const DEFAULT_VAULT_DOCS = [
  {
    id: 'doc-coi',
    title: 'ACORD 25 Certificate of Liability Insurance',
    docType: 'COI_INSURANCE',
    verificationStatus: 'VERIFIED',
    fileSize: 1420000,
    checksum: '8f4c9a201b73e5d8a901f4c3',
    uploadedAt: '2026-10-15T10:00:00Z',
    expiryDate: 'Nov 15, 2026',
    issuer: 'Marsh McLennan'
  },
  {
    id: 'doc-w9',
    title: 'IRS Form W-9 (Taxpayer ID & Certification)',
    docType: 'TAX_W9',
    verificationStatus: 'VERIFIED',
    fileSize: 840000,
    checksum: 'e3b0c44298fc1c149afbf4c8',
    uploadedAt: '2026-10-12T14:30:00Z',
    expiryDate: 'Dec 31, 2026',
    issuer: 'Internal Revenue Service'
  },
  {
    id: 'doc-iso',
    title: 'ISO/IEC 27001:2022 & SOC 2 Type II Security Certificate',
    docType: 'INFOSEC_CERT',
    verificationStatus: 'VERIFIED',
    fileSize: 2100000,
    checksum: '7d5a1b3c9e4f0a2d8b6c4e1a',
    uploadedAt: '2026-10-18T09:15:00Z',
    expiryDate: 'Oct 18, 2027',
    issuer: 'BSI Assurance Services'
  },
  {
    id: 'doc-bank',
    title: 'JPMorgan Chase Voided Check & ACH Letter',
    docType: 'BANK_LETTER',
    verificationStatus: 'VERIFIED',
    fileSize: 920000,
    checksum: '4b8e2a1d9c7f3e0a5d6c8b2f',
    uploadedAt: '2026-10-20T16:45:00Z',
    expiryDate: 'Permanent',
    issuer: 'JPMorgan Chase Bank, N.A.'
  }
];

const DEFAULT_DOC_COMMENTS: Record<string, TransactionComment[]> = {
  'doc-coi': [
    {
      id: 'comm-coi-1',
      entityType: 'COI_INSURANCE',
      entityId: 'doc-coi',
      authorId: 'usr-buyer-clara',
      authorName: 'Dr. Clara Oswald (Clinical Procurement & Compliance)',
      authorRole: 'BUYER',
      text: 'Annual ACORD 25 Certificate of Liability insurance rider verified. Please confirm updated certificate naming Meridian Health Network as Additional Insured on the General Liability schedule ($2M aggregate limit).',
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
    }
  ],
  'doc-w9': [
    {
      id: 'comm-w9-1',
      entityType: 'TAX_W9',
      entityId: 'doc-w9',
      authorId: 'tax-bot',
      authorName: 'Tax Verification Engine',
      authorRole: 'BUYER',
      text: 'IRS Form W-9 TIN 84-2910482 matches registered corporate legal identity Acme Industrial Tech Inc. Monitored for annual renewal.',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
    }
  ]
};

export const SupplierDocuments: React.FC = () => {
  const { navigate, routeState } = usePortal();
  const { currentUser } = useAuth();
  const [docs, setDocs] = useState<any[]>(DEFAULT_VAULT_DOCS);
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-coi');
  const [showCollabDrawer, setShowCollabDrawer] = useState<boolean>(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, TransactionComment[]>>(DEFAULT_DOC_COMMENTS);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [aiDrafting, setAiDrafting] = useState<boolean>(false);

  useEffect(() => {
    loadDocs();
  }, [currentUser]);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const apps = await ApiClient.getApplications();
      if (apps.applications && apps.applications.length > 0) {
        const myApp = apps.applications.find((a: any) => a.supplierOrgId === currentUser?.organizationId) || apps.applications[0];
        const res = await ApiClient.getDocuments(myApp.id);
        if (res.documents && res.documents.length > 0) {
          // Merge API documents with default vault documents
          const merged = [...DEFAULT_VAULT_DOCS];
          res.documents.forEach((d: any) => {
            if (!merged.some(m => m.id === d.id)) merged.push(d);
          });
          setDocs(merged);
        }
      }
    } catch (e) {
      console.warn('Using default vault documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeState) {
      const targetDoc = routeState.doc || routeState.docId || routeState.activeEntityId;
      if (targetDoc) {
        const found = docs.find(d => 
          d.id.toLowerCase() === targetDoc.toLowerCase() || 
          d.docType?.toLowerCase() === targetDoc.toLowerCase() ||
          targetDoc.toLowerCase().includes(d.id.toLowerCase())
        );
        if (found) {
          setSelectedDocId(found.id);
        }
      }
      if (routeState.openCollab || routeState.openMessages) {
        setShowCollabDrawer(true);
      } else {
        setShowCollabDrawer(false);
      }
    }
  }, [routeState, docs]);

  const activeDoc = docs.find(d => d.id === selectedDocId) || docs[0];
  const activeComments = commentsMap[activeDoc?.id] || [];

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc || !newCommentText.trim()) return;
    const newMsg: TransactionComment = {
      id: `comm-doc-${Date.now()}`,
      entityType: activeDoc.docType || 'COI_INSURANCE',
      entityId: activeDoc.id,
      authorId: currentUser?.id || 'usr-current',
      authorName: currentUser?.name || 'Elena Rostova (Acme Industrial)',
      authorRole: 'SUPPLIER',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    setCommentsMap(prev => ({
      ...prev,
      [activeDoc.id]: [...(prev[activeDoc.id] || []), newMsg]
    }));
    setNewCommentText('');
  };

  const handleAiDraftComment = () => {
    if (!activeDoc) return;
    setAiDrafting(true);
    setTimeout(() => {
      setNewCommentText(`Confirming compliance update for ${activeDoc.title}: Marsh McLennan has issued the endorsement rider naming the buyer as Additional Insured. Electronic PDF uploaded with SHA-256 verification.`);
      setAiDrafting(false);
    }, 400);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Supplier Document Vault
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Encrypted & Audited
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified tax certificates, liability insurance, and banking letters conformed to buyer compliance standards.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCollabDrawer(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              showCollabDrawer 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
            }`}
            title="Compliance & Audit Collaboration Thread"
          >
            <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
            <span>Compliance Thread</span>
            {activeComments.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                showCollabDrawer ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {activeComments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Document Cards + Split Collaboration Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Document Cards Column */}
        <div className={`${showCollabDrawer ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-200 space-y-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {docs.map(doc => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <div 
                  key={doc.id} 
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`bg-white p-5 rounded-2xl border transition cursor-pointer space-y-3 relative ${
                    isSelected
                      ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {doc.verificationStatus || 'VERIFIED'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {doc.docType} • {Math.round((doc.fileSize || 1024000) / 1024)} KB
                    </p>
                    {doc.issuer && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Issuer: <strong>{doc.issuer}</strong> • Exp: <strong>{doc.expiryDate || 'Active'}</strong>
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono truncate pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>SHA: {doc.checksum ? doc.checksum.slice(0, 16) + '...' : '8f4c9a201b...'}</span>
                    {commentsMap[doc.id]?.length > 0 && (
                      <span className="flex items-center gap-1 text-emerald-700 font-sans font-bold">
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        {commentsMap[doc.id].length} msg
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Split Tab: Compliance & Audit Collaboration Drawer */}
        {showCollabDrawer && (
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Compliance & Audit Hub
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                  {activeDoc?.docType || 'COI'}
                </span>
                <button
                  onClick={() => setShowCollabDrawer(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                  title="Close collaboration thread"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Context Banner */}
            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl mb-4 text-xs">
              <div className="font-semibold text-rose-900 mb-0.5 truncate">
                {activeDoc?.title}
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Direct compliance correspondence with buyer legal counsel, risk underwriters, and compliance officers.
              </p>
            </div>

            {/* Message List */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {activeComments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-500">No compliance inquiries yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Contact buyer risk & compliance officer regarding this credential.</p>
                </div>
              ) : (
                activeComments.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-xs ${
                      msg.authorRole === 'SUPPLIER'
                        ? 'bg-rose-50/40 border-rose-200 ml-4'
                        : 'bg-slate-50 border-slate-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-[11px]">
                        {msg.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Message Composer */}
            <form onSubmit={handleSendComment} className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reply as Compliance Lead</span>
                <button
                  type="button"
                  onClick={handleAiDraftComment}
                  disabled={aiDrafting}
                  className="text-[10px] font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span>{aiDrafting ? 'Drafting...' : 'AI Auto-Draft'}</span>
                </button>
              </div>
              <textarea
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Inquire on ACORD endorsement rider, certificate renewal, or TIN attestation..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Compliance Update</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
