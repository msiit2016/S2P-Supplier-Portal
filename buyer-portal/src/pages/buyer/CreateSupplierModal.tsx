import React, { useState } from 'react';
import { ApiClient } from '../../api/client.js';
import { OnboardingChannel } from '../../types/index.js';
import { 
  X, 
  Send, 
  Mail, 
  FileUp, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  Building,
  HelpCircle
} from 'lucide-react';

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newApp: any) => void;
}

export const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [selectedMethod, setSelectedMethod] = useState<OnboardingChannel>('SUPPLIER_SELF_SERVICE');
  const [supplierName, setSupplierName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [supplyCategory, setSupplyCategory] = useState('IT_HARDWARE_SERVICES');
  const [onboardingReason, setOnboardingReason] = useState('');
  const [initialTaxId, setInitialTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Duplicate check state
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRunDuplicateCheck = async () => {
    if (!supplierName.trim()) return;
    setIsCheckingDuplicate(true);
    setErrorMsg('');
    try {
      const res = await ApiClient.checkDuplicate({
        legalName: supplierName,
        taxId: initialTaxId,
        businessEmail
      });
      setDuplicateCheck(res.duplicateCheck);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !businessEmail.trim()) {
      setErrorMsg('Supplier Legal Name and Business Email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await ApiClient.createApplication({
        supplierName,
        businessEmail,
        supplyCategory,
        onboardingReason,
        channel: selectedMethod,
        initialTaxId: initialTaxId.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onCreated(res.application);
        onClose();
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Initiate Supplier Onboarding</h2>
              <p className="text-xs text-slate-400">Create new onboarding case with AI duplicate resolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Choose Onboarding Method (3 options as per spec) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Onboarding Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Self-Service Invitation */}
              <div
                onClick={() => setSelectedMethod('SUPPLIER_SELF_SERVICE')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedMethod === 'SUPPLIER_SELF_SERVICE'
                    ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <Mail className={`w-4 h-4 ${selectedMethod === 'SUPPLIER_SELF_SERVICE' ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-slate-800">Invite Supplier</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Send secure self-service portal invite link to supplier.
                </p>
              </div>

              {/* Option 2: Email & Documents Assisted */}
              <div
                onClick={() => setSelectedMethod('EMAIL_ASSISTED')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedMethod === 'EMAIL_ASSISTED'
                    ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <FileUp className={`w-4 h-4 ${selectedMethod === 'EMAIL_ASSISTED' ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-slate-800">From Email / Docs</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  AI extracts draft data from supplier emails and attachments.
                </p>
              </div>

              {/* Option 3: Buyer On Behalf Of Direct Entry */}
              <div
                onClick={() => setSelectedMethod('BUYER_ASSISTED')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedMethod === 'BUYER_ASSISTED'
                    ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <Building className={`w-4 h-4 ${selectedMethod === 'BUYER_ASSISTED' ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-slate-800">On Behalf Of</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Authorized procurement buyer completes draft on supplier's behalf.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Supplier Identification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legal Supplier Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => {
                  setSupplierName(e.target.value);
                  setDuplicateCheck(null);
                }}
                onBlur={handleRunDuplicateCheck}
                placeholder="e.g. Acme Cloud Solutions Inc."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Business Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="vendor.contact@company.com"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Optional Tax ID with live duplicate resolution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Tax Identifier / EIN (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleRunDuplicateCheck}
                  disabled={isCheckingDuplicate || !supplierName}
                  className="text-[11px] text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>Pre-Check Duplicate</span>
                </button>
              </div>
              <input
                type="text"
                value={initialTaxId}
                onChange={(e) => {
                  setInitialTaxId(e.target.value);
                  setDuplicateCheck(null);
                }}
                placeholder="e.g. 84-1294821 or 12-3456789"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Procurement Supply Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={supplyCategory}
                onChange={(e) => setSupplyCategory(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="IT_HARDWARE_SERVICES">IT Hardware, Software & Cloud Services</option>
                <option value="LOGISTICS_FREIGHT">Logistics, Carrier & Freight Operations</option>
                <option value="FACILITIES_MRO">Facilities, MRO & Office Supplies</option>
                <option value="PROFESSIONAL_SERVICES">Legal, Consulting & Professional Services</option>
                <option value="DIRECT_RAW_MATERIALS">Direct Manufacturing & Raw Materials</option>
              </select>
            </div>
          </div>

          {/* Duplicate Detection Alert Box */}
          {duplicateCheck && (
            <div className={`p-3.5 rounded-xl text-xs border transition-all ${
              duplicateCheck.hasConflict
                ? duplicateCheck.matchType === 'CORPORATE_SUCCESSION'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <div className="flex items-start space-x-2.5">
                {duplicateCheck.hasConflict ? (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                )}
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>
                      {duplicateCheck.matchType === 'CORPORATE_SUCCESSION' && 'Corporate Succession Detected'}
                      {duplicateCheck.matchType === 'EXACT_DUPLICATE' && 'Exact Duplicate Vendor Master'}
                      {duplicateCheck.matchType === 'NEAR_MATCH' && 'Possible Near Match'}
                      {duplicateCheck.matchType === 'NO_MATCH' && 'Clean Record - No Conflicts'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10">
                      {Math.round(duplicateCheck.confidence * 100)}% match
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {duplicateCheck.explanation}
                  </p>
                  {duplicateCheck.recommendedAction && (
                    <div className="text-[11px] font-semibold underline mt-1">
                      Recommended: {duplicateCheck.recommendedAction}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Onboarding Business Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Onboarding Business Reason
            </label>
            <textarea
              rows={2}
              value={onboardingReason}
              onChange={(e) => setOnboardingReason(e.target.value)}
              placeholder="e.g. Awarded Q4 global telemetry analytics contract..."
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Initiating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Create Application Draft</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
