import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
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
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  citations?: string[];
}

export const AIAssistantDrawer: React.FC = () => {
  const { aiDrawerOpen, setAiDrawerOpen, selectedAppId, portal } = usePortal();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: portal === 'BUYER' 
        ? "Hello! I am your S2P Onboarding Supervisor Agent. I continuously verify document evidence, resolve corporate successions, detect TIN discrepancies, and draft supplier inquiries. How can I help?"
        : "Hello! I am your Onboarding Copilot. I can guide you through required forms (IRS W-9, insurance certificates, banking letters) and explain how your information is safeguarded.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!aiDrawerOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await ApiClient.chatCopilot({
        applicationId: selectedAppId || undefined,
        message: query
      });

      const agentMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: data.reply || 'Agent response recorded.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'Encountered connection error with AI Supervisor agent.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const runQuickAction = (action: string) => {
    if (action === 'summary') {
      handleSend("Please provide an executive compliance summary and risk breakdown for this application.");
    } else if (action === 'succession') {
      handleSend("Explain the corporate succession between Apex Analytics and Nexura Global Analytics.");
    } else if (action === 'clarification') {
      handleSend("Draft a targeted supplier clarification email citing the exact discrepant and missing fields.");
    } else if (action === 'bank_rules') {
      handleSend("What are the mandatory banking verification rules before vendor activation?");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Onboarding Supervisor AI</h3>
            <p className="text-[11px] text-slate-300">Bounded Autonomous Agentic Assistance</p>
          </div>
        </div>
        <button
          onClick={() => setAiDrawerOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2.5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Specialist Agent Actions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {portal === 'BUYER' ? (
            <>
              <button
                onClick={() => runQuickAction('summary')}
                className="text-[11px] bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1 transition shadow-xs"
              >
                <FileSearch className="w-3 h-3 text-indigo-600" />
                Risk Summary
              </button>
              <button
                onClick={() => runQuickAction('succession')}
                className="text-[11px] bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1 transition shadow-xs"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Succession Audit
              </button>
              <button
                onClick={() => runQuickAction('clarification')}
                className="text-[11px] bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1 transition shadow-xs"
              >
                <Mail className="w-3 h-3 text-amber-600" />
                Draft Inquiry
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleSend("What documents are mandatory for IT hardware and SaaS suppliers?")}
                className="text-[11px] bg-white hover:bg-indigo-50 border border-slate-300 text-slate-700 px-2 py-1 rounded-md transition shadow-xs"
              >
                Mandatory Docs
              </button>
              <button
                onClick={() => runQuickAction('bank_rules')}
                className="text-[11px] bg-white hover:bg-indigo-50 border border-slate-300 text-slate-700 px-2 py-1 rounded-md transition shadow-xs"
              >
                Bank Letter Info
              </button>
              <button
                onClick={() => handleSend("Why do you need my official IRS W-9?")}
                className="text-[11px] bg-white hover:bg-indigo-50 border border-slate-300 text-slate-700 px-2 py-1 rounded-md transition shadow-xs"
              >
                Why Tax ID?
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 px-1 text-[11px] text-slate-400">
              {m.sender === 'user' ? (
                <>
                  <span>You ({currentUser?.name})</span>
                  <UserCircle2 className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-indigo-600" />
                  <span className="font-semibold text-indigo-900">Supervisor Agent</span>
                </>
              )}
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>
            <div
              className={`max-w-[88%] text-xs rounded-xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-indigo-600 bg-indigo-50/80 px-3 py-2 rounded-lg border border-indigo-100 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Agent synthesizing policy & evidence...</span>
          </div>
        )}
      </div>

      {/* Drawer Input */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={portal === 'BUYER' ? "Ask about risk, succession, discrepancies..." : "Ask a question about onboarding forms..."}
            className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 text-[10px] text-slate-400 text-center">
          Strict policy controls enforce human approval before final vendor activation.
        </div>
      </div>
    </div>
  );
};
