import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { TransactionComment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ShoppingCart, 
  Receipt, 
  Clock, 
  User, 
  CheckCircle2, 
  Bot,
  AlertCircle
} from 'lucide-react';

export const SupplierCommunications: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeEntityType, setActiveEntityType] = useState<'PO' | 'INVOICE'>('PO');
  const [activeEntityId, setActiveEntityId] = useState<string>('po-101');
  const [comments, setComments] = useState<TransactionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);

  const entities = [
    { type: 'PO', id: 'po-101', label: 'PO-2026-101 (Cloud Server Deployment)', amount: '$45,000.00' },
    { type: 'PO', id: 'po-102', label: 'PO-2026-102 (Cybersecurity Auditing)', amount: '$28,500.00' },
    { type: 'INVOICE', id: 'inv-201', label: 'INV-2026-8801 (Matched Invoice)', amount: '$45,000.00' },
    { type: 'INVOICE', id: 'inv-202', label: 'INV-2026-8802 (Hardware Settlement)', amount: '$8,250.00' },
  ];

  const loadComments = async (type: string, id: string) => {
    try {
      setLoading(true);
      const res = await ApiClient.getTransactionComments(type, id);
      if (res && res.comments) {
        setComments(res.comments);
      }
    } catch (err) {
      console.error('Failed to load transaction comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(activeEntityType, activeEntityId);
  }, [activeEntityType, activeEntityId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await ApiClient.addTransactionComment(activeEntityType, activeEntityId, newComment.trim());
      if (res && res.comment) {
        setComments(prev => [...prev, res.comment]);
        setNewComment('');
      }
    } catch (err) {
      alert('Failed to send comment');
    }
  };

  const handleAiDraftSuggestion = () => {
    setAiDrafting(true);
    setTimeout(() => {
      if (activeEntityType === 'PO') {
        setNewComment("Hello Buyer Team, we have scheduled dispatch for the remaining balance under line 2. Tracking details will be posted to the ASN portal by 14:00 EST tomorrow.");
      } else {
        setNewComment("Hello Accounts Payable, we confirm the 3-way match alignment and would like to proceed with the Dynamic Discounting early payout schedule. Thank you.");
      }
      setAiDrafting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Contextual S2P Collaboration & Dispute Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Transactional Communication Threads</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Communicate directly with buyer procurement agents and AP specialists attached directly to specific Purchase Orders and Invoices, preserving complete contextual audit history.
          </p>
        </div>
      </div>

      {/* Main Grid: Channels & Chat Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction Objects (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction Contexts</h2>
            <span className="text-[11px] text-slate-400">Select Thread</span>
          </div>

          <div className="space-y-2">
            {entities.map((ent) => {
              const isSelected = activeEntityType === ent.type && activeEntityId === ent.id;
              const Icon = ent.type === 'PO' ? ShoppingCart : Receipt;
              return (
                <div
                  key={`${ent.type}-${ent.id}`}
                  onClick={() => {
                    setActiveEntityType(ent.type as any);
                    setActiveEntityId(ent.id);
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      ent.type === 'PO' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-slate-900 truncate">{ent.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{ent.amount} • {ent.type} Thread</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Chat Thread (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-slate-900 uppercase">
                  Context: {activeEntityType} • {activeEntityId}
                </span>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                  Active Collaboration
                </span>
              </div>
              <button
                onClick={handleAiDraftSuggestion}
                disabled={aiDrafting}
                className="flex items-center space-x-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{aiDrafting ? 'Drafting...' : 'AI Draft Message'}</span>
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {loading ? (
                <div className="text-center text-slate-400 py-12 text-xs">Loading contextual messages...</div>
              ) : comments.length === 0 ? (
                <div className="text-center text-slate-400 py-12 text-xs">
                  No messages yet on this transaction object. Type below to begin collaboration.
                </div>
              ) : (
                comments.map((c) => {
                  const isMe = c.authorRole === 'SUPPLIER';
                  return (
                    <div
                      key={c.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold text-slate-700">{c.authorName}</span>
                        <span>•</span>
                        <span>{c.authorRole}</span>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-none shadow-xs'
                            : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        {c.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendComment} className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type contextual response or dispute inquiry..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded-xl transition shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
