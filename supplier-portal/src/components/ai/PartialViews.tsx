/**
 * Verisource Agentic Partial Views (Interactive Micro-UI Components)
 * 
 * Implements Jira Agentic / Atlassian Rovo style inline interactive partial views
 * inside the Ava chat conversation stream:
 * 
 * 1. FormCardPartialView: Interactive mini-forms embedded in chat (matches uploaded user snap)
 * 2. ReviewDiffPartialView: Before vs Proposed diff with human-in-the-loop confirmation
 * 3. OcrExtractionPartialView: Extracted sheet/document entities with 1-click page populator
 * 4. EarlyPayoutPartialView: Interactive dynamic discounting slider with direct Fedwire trigger
 */

import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck2,
  FileText,
  DollarSign,
  Sparkles,
  Zap,
  Clock,
  ChevronDown,
  Check,
  X,
  CreditCard,
  Building2,
  Layers,
  ArrowUpRight,
  UploadCloud,
  FileUp,
  FileCheck,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { dispatchPageAction, PageAction } from '../../services/pageActionBridge.js';

// ==============================================================================
// 1. INTERACTIVE MINI-FORM PARTIAL VIEW (Matches User Snapshot)
// ==============================================================================

export interface FormCardField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'number';
  placeholder?: string;
  required?: boolean;
  value: string;
  options?: string[];
}

export interface FormCardPartialViewData {
  type: 'FORM_CARD';
  title: string;
  description?: string;
  targetContext?: string; // e.g. 'ONBOARDING_BASIC_DETAILS'
  fields: FormCardField[];
  submitLabel?: string;
  isSubmitted?: boolean;
  submittedAt?: string;
  actionPayload?: PageAction;
}

export const FormCardPartialView: React.FC<{
  data: FormCardPartialViewData;
  onSubmitted?: (values: Record<string, string>) => void;
}> = ({ data, onSubmitted }) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    data.fields.forEach(f => {
      initial[f.id] = f.value || '';
    });
    return initial;
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(data.isSubmitted));
  const [submittedAt, setSubmittedAt] = useState<string | undefined>(data.submittedAt);

  const filledCount = data.fields.filter(f => Boolean(formValues[f.id]?.trim())).length;
  const totalCount = data.fields.length;
  const allRequiredFilled = data.fields
    .filter(f => f.required !== false)
    .every(f => Boolean(formValues[f.id]?.trim()));

  const handleChange = (fieldId: string, val: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequiredFilled) return;

    setIsSubmitted(true);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSubmittedAt(nowTime);

    // Dispatch action to update live page state
    if (data.actionPayload) {
      dispatchPageAction({
        ...data.actionPayload,
        payload: {
          ...data.actionPayload.payload,
          ...formValues
        }
      });
    } else {
      // Default fallback action
      dispatchPageAction({
        action: 'UPDATE_ONBOARDING_FIELD',
        payload: { ...formValues }
      });
    }

    onSubmitted?.(formValues);
  };

  return (
    <div className="mt-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm text-slate-800 transition-all select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
            {data.title || 'Basic Details'}
          </h4>
          {data.description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{data.description}</p>
          )}
        </div>
        {isSubmitted ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Applied to Page</span>
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            Interactive Form
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {data.fields.map((f) => (
            <div key={f.id} className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                {f.required !== false && <span className="text-rose-500 mr-1">*</span>}
                {f.label}
              </label>

              {f.type === 'select' ? (
                <div className="relative">
                  <select
                    value={formValues[f.id]}
                    onChange={(e) => handleChange(f.id, e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50/80 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none cursor-pointer shadow-2xs"
                  >
                    <option value="">Select...</option>
                    {(f.options || ['Private Limited', 'Corporation', 'LLC', 'Partnership', 'Sole Proprietorship']).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <input
                  type={f.type || 'text'}
                  value={formValues[f.id]}
                  onChange={(e) => handleChange(f.id, e.target.value)}
                  placeholder={f.placeholder || f.label}
                  className="w-full text-xs p-2 bg-slate-50/80 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer with Filled Counter & Update Button */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
            <span className={filledCount === totalCount ? 'font-bold text-emerald-700' : 'font-semibold'}>
              {filledCount}/{totalCount} filled
            </span>
            {isSubmitted && (
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Updated at {submittedAt}</span>
              </span>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={!allRequiredFilled}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
            >
              <span>{data.submitLabel || 'Update'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// ==============================================================================
// 2. REVIEW VERSION / PROPOSED DIFF PARTIAL VIEW (Atlassian Rovo Agentic Pattern)
// ==============================================================================

export interface ReviewDiffField {
  fieldName: string;
  label: string;
  currentValue: string;
  proposedValue: string;
  diffType?: 'ADDED' | 'MODIFIED' | 'REMOVED';
}

export interface ReviewDiffPartialViewData {
  type: 'REVIEW_DIFF';
  title: string;
  summary: string;
  pageContext: string;
  diffs: ReviewDiffField[];
  status: 'PENDING_REVIEW' | 'APPLIED' | 'DISCARDED';
  appliedAt?: string;
  actionPayload?: PageAction;
}

export const ReviewDiffPartialView: React.FC<{
  data: ReviewDiffPartialViewData;
  onConfirm?: () => void;
  onDiscard?: () => void;
}> = ({ data, onConfirm, onDiscard }) => {
  const [status, setStatus] = useState<'PENDING_REVIEW' | 'APPLIED' | 'DISCARDED'>(data.status || 'PENDING_REVIEW');
  const [appliedAt, setAppliedAt] = useState<string | undefined>(data.appliedAt);

  const handleConfirm = () => {
    setStatus('APPLIED');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAppliedAt(nowTime);

    if (data.actionPayload) {
      dispatchPageAction(data.actionPayload);
    }
    onConfirm?.();
  };

  const handleDiscard = () => {
    setStatus('DISCARDED');
    onDiscard?.();
  };

  return (
    <div className={`mt-3 border rounded-2xl p-4 transition-all shadow-sm select-none ${
      status === 'APPLIED'
        ? 'bg-emerald-50/70 border-emerald-300'
        : status === 'DISCARDED'
        ? 'bg-slate-50/80 border-slate-200 opacity-70'
        : 'bg-white border-slate-200/90'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>{data.title || 'Review Version (Proposed Changes)'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                {data.pageContext}
              </span>
            </h4>
          </div>
        </div>

        <div>
          {status === 'APPLIED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Check className="w-3 h-3" />
              <span>Applied to Page ({appliedAt})</span>
            </span>
          ) : status === 'DISCARDED' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600">
              <X className="w-3 h-3" />
              <span>Discarded</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
              Pending Review
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
        {data.summary}
      </p>

      {/* Diffs Table */}
      <div className="mt-3 bg-slate-50/90 rounded-xl border border-slate-200 overflow-hidden text-xs">
        <div className="divide-y divide-slate-200">
          {data.diffs.map((diff, idx) => (
            <div key={idx} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-semibold text-slate-700 min-w-[140px] text-[11px]">
                {diff.label || diff.fieldName}:
              </div>
              <div className="flex items-center gap-2 flex-1 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 line-through truncate max-w-[150px]">
                  {diff.currentValue || '—'}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 truncate max-w-[180px]">
                  {diff.proposedValue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {status === 'PENDING_REVIEW' && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm & Apply to Page</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// 3. DOCUMENT OCR & EXTRACTION PARTIAL VIEW
// ==============================================================================

export interface OcrExtractionPartialViewData {
  type: 'OCR_EXTRACTION';
  fileName: string;
  fileSize: string;
  documentType: string;
  confidence: number;
  extractedEntities: Array<{
    field: string;
    value: string;
    targetFieldKey?: string;
  }>;
  status?: 'EXTRACTED' | 'APPLIED';
  actionPayload?: PageAction;
}

export const OcrExtractionPartialView: React.FC<{
  data: OcrExtractionPartialViewData;
  onApply?: () => void;
  onDiscard?: () => void;
}> = ({ data, onApply, onDiscard }) => {
  const [status, setStatus] = useState<'PENDING_CONFIRMATION' | 'APPLIED' | 'DISCARDED'>(
    data.status === 'APPLIED' ? 'APPLIED' : 'PENDING_CONFIRMATION'
  );
  const [appliedAt, setAppliedAt] = useState<string | undefined>();

  const handleConfirm = () => {
    setStatus('APPLIED');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAppliedAt(nowTime);
    if (data.actionPayload) {
      dispatchPageAction(data.actionPayload);
    }
    onApply?.();
  };

  const handleDiscard = () => {
    setStatus('DISCARDED');
    onDiscard?.();
  };

  return (
    <div className={`mt-3 border rounded-2xl p-4 shadow-sm text-slate-800 select-none transition-all ${
      status === 'APPLIED' ? 'bg-emerald-50/70 border-emerald-300' : status === 'DISCARDED' ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200/90'
    }`}>
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{data.fileName}</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span>{data.documentType}</span>
              <span>•</span>
              <span>{data.fileSize}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{(data.confidence * 100).toFixed(0)}% OCR Confidence</span>
            </div>
          </div>
        </div>

        {status === 'APPLIED' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Applied to Page ({appliedAt})</span>
          </span>
        ) : status === 'DISCARDED' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600">
            <X className="w-3 h-3" />
            <span>Discarded</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
            Confirmation Required
          </span>
        )}
      </div>

      {/* Extracted Entities Grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {data.extractedEntities.map((ent, idx) => (
          <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ent.field}</div>
            <div className="font-semibold text-slate-800 truncate mt-0.5 font-mono">{ent.value}</div>
          </div>
        ))}
      </div>

      {/* Confirmation Call to Action */}
      {status === 'PENDING_CONFIRMATION' && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
          <div className="text-xs font-semibold text-emerald-950">
            Confirm and update page data from attachment?
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-md hover:bg-slate-100 transition cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Update Page Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// 4. EARLY PAYOUT LIQUIDITY ACCELERATOR PARTIAL VIEW
// ==============================================================================

export interface EarlyPayoutPartialViewData {
  type: 'EARLY_PAYOUT_SLIDER';
  invoiceNumber: string;
  buyerName: string;
  invoiceTotal: number;
  defaultDaysEarly: number;
  maxDaysEarly: number;
  annualRatePct: number;
  depositoryAccount: string;
  status?: 'INTERACTIVE' | 'CONFIRMED';
  confirmedAmount?: number;
}

export const EarlyPayoutPartialView: React.FC<{
  data: EarlyPayoutPartialViewData;
  onConfirmPayout?: (amount: number) => void;
}> = ({ data, onConfirmPayout }) => {
  const [daysEarly, setDaysEarly] = useState<number>(data.defaultDaysEarly || 20);
  const [confirmed, setConfirmed] = useState(data.status === 'CONFIRMED');

  const discountRate = (daysEarly / 360) * (data.annualRatePct || 27);
  const discountFee = Number(((data.invoiceTotal * discountRate) / 100).toFixed(2));
  const netPayout = Number((data.invoiceTotal - discountFee).toFixed(2));

  const handleConfirm = () => {
    setConfirmed(true);
    dispatchPageAction({
      action: 'ACCEPT_EARLY_PAYMENT',
      payload: {
        invoiceNumber: data.invoiceNumber,
        netPayout,
        daysEarly,
        discountFee
      }
    });
    onConfirmPayout?.(netPayout);
  };

  return (
    <div className={`mt-3 border rounded-2xl p-4 transition-all shadow-sm select-none ${
      confirmed
        ? 'bg-emerald-50/70 border-emerald-300'
        : 'bg-white border-slate-200/90'
    }`}>
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Accelerate Early Payment</h4>
            <div className="text-[10px] text-slate-500 font-mono">
              {data.invoiceNumber} • {data.buyerName}
            </div>
          </div>
        </div>

        {confirmed && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3" />
            <span>Nacha Fedwire Confirmed</span>
          </span>
        )}
      </div>

      {!confirmed ? (
        <div className="mt-3 space-y-3">
          {/* Days Early Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Accelerate payout by:</span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {daysEarly} days early (-{discountRate.toFixed(2)}% fee)
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={data.maxDaysEarly || 30}
              step={1}
              value={daysEarly}
              onChange={(e) => setDaysEarly(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Numbers Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Gross Invoice:</span>
              <span className="font-mono font-semibold">${data.invoiceTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-amber-700 text-[11px]">
              <span>Early Cash Discount ({discountRate.toFixed(2)}%):</span>
              <span className="font-mono font-semibold">-${discountFee.toFixed(2)}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-800">Net Immediate Payout:</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                ${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Direct deposit to {data.depositoryAccount}</span>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Zap className="w-3 h-3" />
              <span>Confirm Payout (${netPayout.toFixed(0)})</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 p-3 bg-emerald-100/60 border border-emerald-300 rounded-xl text-xs text-emerald-900">
          <div className="font-bold">✓ Early Payout Request Scheduled</div>
          <div className="text-[11px] text-emerald-800 mt-0.5">
            ${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD queued for same-day Fedwire transfer to {data.depositoryAccount}.
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// 5. UPLOAD BANNER & AI OCR VISION EXTRACTION PARTIAL VIEW
// ==============================================================================

export interface UploadBannerPartialViewData {
  type: 'UPLOAD_BANNER';
  title?: string;
  description?: string;
  targetPage?: string;
  pageContext?: any;
  defaultDocumentType?: string;
  actionPayload?: PageAction;
}

export const UploadBannerPartialView: React.FC<{
  data: UploadBannerPartialViewData;
  onApplied?: () => void;
}> = ({ data, onApplied }) => {
  type BannerPhase = 'AWAITING_UPLOAD' | 'PROCESSING' | 'CONFIRMATION' | 'APPLIED' | 'DISCARDED';

  const [phase, setPhase] = useState<BannerPhase>('AWAITING_UPLOAD');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('Initializing AI Vision parser...');
  const [appliedAt, setAppliedAt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract contextual values from pageContext if present
  const ctx = data.pageContext || {};
  const currentLegalName = ctx.legalName || ctx.companyName || 'Acme Industrial Tech Inc.';
  const currentTradeName = ctx.tradeName || ctx.doingBusinessAs || 'Acme Tech Solutions';
  const currentDuns = ctx.dunsNumber || '09-842-1928';
  const currentManager = ctx.supplierManager || 'Sarah Jenkins (Senior Director)';
  const currentBuyer = ctx.buyerName || ctx.header?.buyerName || 'Apex Global Enterprises';

  const sampleDocs = [
    { name: 'IRS_Form_W9_Signed_2026.pdf', size: '1.4 MB', type: 'IRS Form W-9 / Taxpayer Identification' },
    { name: 'ACORD_25_Liability_COI.pdf', size: '1.8 MB', type: 'ACORD 25 Certificate of Liability' },
    { name: 'Tax_Residency_Certificate_2026.pdf', size: '920 KB', type: 'Corporate Tax Certificate' }
  ];

  const triggerProcessing = (fileInfo: { name: string; size: string }) => {
    setSelectedFile(fileInfo);
    setPhase('PROCESSING');
    setProcessingProgress(15);
    setProcessingStatus(`Uploading & scanning ${fileInfo.name}...`);

    setTimeout(() => {
      setProcessingProgress(50);
      setProcessingStatus('Performing AI Vision OCR layout analysis & entity extraction...');
    }, 300);

    setTimeout(() => {
      setProcessingProgress(85);
      setProcessingStatus('Reconciling corporate Tax ID (EIN), DUNS & legal identifiers...');
    }, 600);

    setTimeout(() => {
      setProcessingProgress(100);
      setPhase('CONFIRMATION');
    }, 850);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : Math.max(1, Math.round(file.size / 1024)) + ' KB';
      triggerProcessing({ name: file.name, size: sizeStr });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeStr = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : Math.max(1, Math.round(file.size / 1024)) + ' KB';
      triggerProcessing({ name: file.name, size: sizeStr });
    }
  };

  const handleConfirmAndApply = () => {
    setPhase('APPLIED');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAppliedAt(nowTime);

    // Dispatch update to live page state
    const payload = {
      legalName: currentLegalName,
      tradeName: currentTradeName,
      dunsNumber: currentDuns,
      supplierManager: currentManager,
      ein: '84-1294812',
      registeredAddress: '100 Innovation Way, Austin, TX 78701',
      taxClassification: 'Corporation (C-Corp)',
      hasDuns: true
    };

    if (data.actionPayload) {
      dispatchPageAction({
        ...data.actionPayload,
        payload: {
          ...data.actionPayload.payload,
          ...payload
        }
      });
    } else {
      dispatchPageAction({
        action: 'UPDATE_ONBOARDING_FIELD',
        page: 'onboarding',
        payload
      });
    }

    onApplied?.();
  };

  const handleDiscard = () => {
    setPhase('DISCARDED');
  };

  return (
    <div className="mt-3 text-slate-800 select-none">
      {/* ─────────────────────────────────────────────────────────────
          PHASE 1: AWAITING UPLOAD BANNER
         ───────────────────────────────────────────────────────────── */}
      {phase === 'AWAITING_UPLOAD' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 transition-all bg-white shadow-sm ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400/20'
              : 'border-slate-300 hover:border-emerald-400'
          }`}
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
            className="hidden"
          />

          {/* Banner Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  {data.title || 'Upload Document for AI Vision OCR'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {data.description || 'Upload W-9, Tax Cert, or invoice to extract & populate page fields'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              AI OCR Active
            </span>
          </div>

          {/* Dropzone Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-center cursor-pointer transition group"
          >
            <FileUp className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mx-auto transition" />
            <div className="mt-1.5 text-xs font-semibold text-slate-700 group-hover:text-slate-900">
              Drag & drop document here, or <span className="text-emerald-600 underline">browse device</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Supports PDF, PNG, JPG, CSV (Max 25MB)
            </div>
          </div>

          {/* Quick-Test Sample Documents */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Quick Test Samples</span>
              <span className="text-[9px] text-slate-400 font-normal">Click to test instant extraction</span>
            </div>
            <div className="space-y-1.5">
              {sampleDocs.map((doc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => triggerProcessing({ name: doc.name, size: doc.size })}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/90 hover:border-emerald-400 hover:bg-emerald-50/30 transition cursor-pointer text-left group"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-emerald-900 truncate">
                      {doc.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {doc.size}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHASE 2: PROCESSING (AI Vision OCR Scanning)
         ───────────────────────────────────────────────────────────── */}
      {phase === 'PROCESSING' && (
        <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Scanning Document with AI Vision OCR...
              </h4>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {selectedFile?.name} ({selectedFile?.size})
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3.5">
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
              <span>{processingStatus}</span>
              <span className="font-mono text-emerald-700 font-bold">{processingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHASE 3: CONFIRMATION (Review Extracted Entities & Ask User)
         ───────────────────────────────────────────────────────────── */}
      {phase === 'CONFIRMATION' && (
        <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm animate-in fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {selectedFile?.name || 'IRS_Form_W9_Signed_2026.pdf'}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span>IRS Form W-9 / Taxpayer Identification</span>
                  <span>•</span>
                  <span>{selectedFile?.size || '1.4 MB'}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">99.8% OCR Confidence</span>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
              Confirmation Required
            </span>
          </div>

          {/* Extracted Entities Grid */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Legal Company Name
              </div>
              <div className="font-semibold text-slate-800 truncate mt-0.5">
                {currentLegalName}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Federal Tax ID (EIN)
              </div>
              <div className="font-semibold text-slate-800 font-mono truncate mt-0.5">
                84-1294812
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Doing Business As (DBA)
              </div>
              <div className="font-semibold text-slate-800 truncate mt-0.5">
                {currentTradeName}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                D&B DUNS Number
              </div>
              <div className="font-semibold text-slate-800 font-mono truncate mt-0.5">
                {currentDuns}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Registered Address
              </div>
              <div className="font-semibold text-slate-800 truncate mt-0.5">
                100 Innovation Way, Austin, TX 78701
              </div>
            </div>
          </div>

          {/* Explicit User Confirmation Card */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
            <div className="text-xs font-semibold text-emerald-950">
              Confirm and update page data from attachment?
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleConfirmAndApply}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Update Page Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHASE 4: APPLIED (Updated & Synced to Page)
         ───────────────────────────────────────────────────────────── */}
      {phase === 'APPLIED' && (
        <div className="border border-emerald-300 bg-emerald-50/80 rounded-2xl p-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">
                  Document Data Applied to Page
                </h4>
                <div className="text-[10px] text-emerald-700">
                  Extracted from {selectedFile?.name || 'W-9'} • Verified and synchronized
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Check className="w-3 h-3" />
              <span>Applied to Page ({appliedAt})</span>
            </span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800">
            ✓ Legal name, DBA, Tax ID (EIN 84-1294812), and DUNS ({currentDuns}) have been populated directly into the active onboarding questionnaire.
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PHASE 5: DISCARDED
         ───────────────────────────────────────────────────────────── */}
      {phase === 'DISCARDED' && (
        <div className="border border-slate-200 bg-slate-50 rounded-2xl p-3.5 shadow-sm flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4 text-slate-400" />
            <span>Attachment extraction discarded. No changes made to page.</span>
          </div>
          <button
            type="button"
            onClick={() => setPhase('AWAITING_UPLOAD')}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            Upload another
          </button>
        </div>
      )}
    </div>
  );
};

