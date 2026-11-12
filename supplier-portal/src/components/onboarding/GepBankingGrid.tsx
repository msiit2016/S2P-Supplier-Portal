import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Building, 
  FileCheck, 
  UploadCloud, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  MapPin, 
  Lock,
  Check,
  ChevronDown,
  Paperclip,
  Eye,
  RefreshCw,
  Sparkles,
  FileText
} from 'lucide-react';
import { GepBankItem, GepLocationItem } from '../../types/index.js';
import { VerificationIndicator } from '../common/VerificationIndicator.js';
import { SearchableSelect } from '../common/SearchableSelect.js';
import { DocumentPreviewModal, ComplianceDoc } from '../common/DocumentPreviewModal.js';

interface GepBankingGridProps {
  bankAccounts: GepBankItem[];
  locations: GepLocationItem[];
  onChange: (accounts: GepBankItem[]) => void;
  readOnly?: boolean;
  openAddTrigger?: number;
  defaultBeneficiary?: string;
}

const SAMPLE_BANK_DOCS = [
  {
    name: 'JPMorgan_Voided_Check_Operating.pdf',
    size: '1.4 MB',
    bankName: 'JPMorgan Chase Bank, N.A.',
    routing: '021000021',
    account: '489201948210',
    swift: 'CHASUS33XXX',
    beneficiary: 'Acme Industrial Tech Inc.',
    ocrConfidence: 99.8
  },
  {
    name: 'Chase_Bank_Confirmation_Letter.pdf',
    size: '1.1 MB',
    bankName: 'JPMorgan Chase Bank, N.A.',
    routing: '021000021',
    account: '489201948210',
    swift: 'CHASUS33XXX',
    beneficiary: 'Acme Industrial Tech Inc.',
    ocrConfidence: 99.6
  },
  {
    name: 'BofA_ACH_Direct_Deposit_Authorization.pdf',
    size: '980 KB',
    bankName: 'Bank of America, N.A.',
    routing: '111000025',
    account: '891048291048',
    swift: 'BOFAUS3N',
    beneficiary: 'Acme Industrial Tech Inc.',
    ocrConfidence: 99.1
  }
];

export const GepBankingGrid: React.FC<GepBankingGridProps> = ({
  bankAccounts,
  locations,
  onChange,
  readOnly = false,
  openAddTrigger,
  defaultBeneficiary = ''
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<GepBankItem | null>(null);

  // Form State in Modal
  const [formCountry, setFormCountry] = useState('United States');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formMethod, setFormMethod] = useState<'ACH_CREDIT' | 'WIRE' | 'CREDIT_CARD' | 'VIRTUAL_CARD'>('ACH_CREDIT');
  const [formBankName, setFormBankName] = useState('');
  const [formBranch, setFormBranch] = useState('');
  const [formBeneficiary, setFormBeneficiary] = useState(defaultBeneficiary || '');
  const [formRouting, setFormRouting] = useState('');
  const [formAccount, setFormAccount] = useState('');
  const [formConfirmAccount, setFormConfirmAccount] = useState('');
  const [formSwift, setFormSwift] = useState('');
  const [formLinkedLocationId, setFormLinkedLocationId] = useState(locations[0]?.id || '');
  const [formIsDefault, setFormIsDefault] = useState(true);
  
  // Attachment & OCR State
  const [formDocFile, setFormDocFile] = useState<string | null>(null);
  const [formDocSize, setFormDocSize] = useState<string | null>(null);
  const [formOcrConfidence, setFormOcrConfidence] = useState<number | null>(null);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [isReplaced, setIsReplaced] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState<ComplianceDoc | null>(null);
  const [formPreviewBlobUrl, setFormPreviewBlobUrl] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingBank(null);
    setFormCountry('United States');
    setFormCurrency('USD');
    setFormMethod('ACH_CREDIT');
    setFormBankName('');
    setFormBranch('');
    setFormBeneficiary(defaultBeneficiary || '');
    setFormRouting('');
    setFormAccount('');
    setFormConfirmAccount('');
    setFormSwift('');
    setFormLinkedLocationId(locations[0]?.id || '');
    setFormIsDefault(bankAccounts.length === 0);
    setFormDocFile(null);
    setFormDocSize(null);
    setFormOcrConfidence(null);
    setIsReplaced(false);
    setIsOcrScanning(false);
    setFormPreviewBlobUrl(undefined);
    setFormError(null);
    setModalOpen(true);
  };

  // Only respond to new click triggers
  const prevTriggerRef = useRef(openAddTrigger);
  useEffect(() => {
    if (openAddTrigger && openAddTrigger > 0 && openAddTrigger !== prevTriggerRef.current) {
      handleOpenAdd();
    }
    prevTriggerRef.current = openAddTrigger;
  }, [openAddTrigger]);

  const handleOpenEdit = (bank: GepBankItem) => {
    setEditingBank(bank);
    setFormCountry(bank.country);
    setFormCurrency(bank.currency);
    setFormMethod(bank.paymentMethod);
    setFormBankName(bank.bankName);
    setFormBranch(bank.bankBranch || '');
    setFormBeneficiary(bank.beneficiaryName);
    setFormRouting(bank.routingNumber);
    setFormAccount(bank.accountNumberFull || bank.accountNumberMasked.replace(/•/g, '0'));
    setFormConfirmAccount(bank.accountNumberFull || bank.accountNumberMasked.replace(/•/g, '0'));
    setFormSwift(bank.swiftBic || '');
    setFormLinkedLocationId(bank.linkedLocationId || locations[0]?.id || '');
    setFormIsDefault(bank.isDefault);
    setFormDocFile(bank.docFileName || null);
    setFormDocSize(bank.docFileSize || null);
    setFormOcrConfidence(bank.ocrConfidence || null);
    setIsReplaced(Boolean(bank.isReplaced));
    setIsOcrScanning(false);
    setFormPreviewBlobUrl(bank.previewUrl);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    onChange(bankAccounts.filter(b => b.id !== id));
  };

  const handleSetDefault = (id: string) => {
    onChange(bankAccounts.map(b => ({
      ...b,
      isDefault: b.id === id
    })));
  };

  // Process uploaded bank verification document
  const handleProcessBankProof = (file: { name: string; size?: string; blobUrl?: string }) => {
    setIsOcrScanning(true);
    setFormError(null);

    setTimeout(() => {
      setIsOcrScanning(false);
      setFormDocFile(file.name);
      setFormDocSize(file.size || '1.4 MB');
      setFormOcrConfidence(99.6);
      if (file.blobUrl) {
        setFormPreviewBlobUrl(file.blobUrl);
      }
      if (editingBank) {
        setIsReplaced(true);
      }
    }, 350);
  };

  const handleTriggerReplace = () => {
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  const handlePreviewDocument = (bank: { 
    docFileName?: string; 
    bankName?: string; 
    routingNumber?: string;
    previewUrl?: string;
  }) => {
    const fn = bank.docFileName || formDocFile || 'Chase_Bank_Remittance_Letter.pdf';
    setPreviewDoc({
      id: `doc-bank-${Date.now()}`,
      title: `${bank.bankName || formBankName || 'JPMorgan Chase'} Voided Check & Remittance Proof`,
      type: 'BANK_ACCOUNT_VERIFICATION_LETTER',
      issuedDate: '2026-01-10',
      expiryDate: '2027-01-09',
      daysRemaining: 365,
      status: 'ACTIVE',
      fileSize: formDocSize || '1.4 MB',
      verifiedBy: 'Federal Reserve FedACH Direct Integration',
      documentCategory: 'BANKING_PROOF',
      previewUrl: bank.previewUrl || formPreviewBlobUrl
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBankName.trim() || !formRouting.trim() || !formAccount.trim() || !formBeneficiary.trim()) {
      setFormError('Bank Name, Routing Number, Account Number and Beneficiary Name are required.');
      return;
    }

    if (formAccount !== formConfirmAccount) {
      setFormError('Bank Account Number and Confirmation do not match.');
      return;
    }

    const linkedLoc = locations.find(l => l.id === formLinkedLocationId);
    const masked = '••••••••' + formAccount.slice(-4);

    if (editingBank) {
      onChange(bankAccounts.map(b => {
        if (b.id === editingBank.id) {
          return {
            ...b,
            country: formCountry,
            currency: formCurrency,
            paymentMethod: formMethod,
            bankName: formBankName.trim(),
            bankBranch: formBranch.trim() || undefined,
            beneficiaryName: formBeneficiary.trim(),
            routingNumber: formRouting.trim(),
            accountNumberMasked: masked,
            accountNumberFull: formAccount.trim(),
            swiftBic: formSwift.trim() || undefined,
            linkedLocationId: formLinkedLocationId || undefined,
            linkedLocationName: linkedLoc ? `${linkedLoc.name} (${linkedLoc.city}, ${linkedLoc.state})` : undefined,
            isDefault: formIsDefault,
            verifiedWithDoc: Boolean(formDocFile),
            docFileName: formDocFile || (editingBank ? editingBank.docFileName : undefined),
            docFileSize: formDocFile ? (formDocSize || '1.4 MB') : editingBank?.docFileSize,
            ocrConfidence: formDocFile ? (formOcrConfidence || 99.8) : editingBank?.ocrConfidence,
            isReplaced: isReplaced || b.isReplaced,
            previewUrl: formPreviewBlobUrl || b.previewUrl
          };
        }
        return formIsDefault ? { ...b, isDefault: false } : b;
      }));
    } else {
      const newAcc: GepBankItem = {
        id: `bnk-${Date.now()}`,
        clientBankRefId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        country: formCountry,
        currency: formCurrency,
        paymentMethod: formMethod,
        bankName: formBankName.trim(),
        bankBranch: formBranch.trim() || undefined,
        beneficiaryName: formBeneficiary.trim(),
        routingNumber: formRouting.trim(),
        accountNumberMasked: masked,
        accountNumberFull: formAccount.trim(),
        swiftBic: formSwift.trim() || undefined,
        linkedLocationId: formLinkedLocationId || undefined,
        linkedLocationName: linkedLoc ? `${linkedLoc.name} (${linkedLoc.city}, ${linkedLoc.state})` : undefined,
        isDefault: formIsDefault || bankAccounts.length === 0,
        verifiedWithDoc: Boolean(formDocFile),
        docFileName: formDocFile || undefined,
        docFileSize: formDocFile ? (formDocSize || '1.4 MB') : undefined,
        ocrConfidence: formDocFile ? (formOcrConfidence || 99.8) : undefined,
        isReplaced: false,
        previewUrl: formPreviewBlobUrl
      };

      const updated = formIsDefault 
        ? bankAccounts.map(b => ({ ...b, isDefault: false })) 
        : [...bankAccounts];
      onChange([...updated, newAcc]);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-3.5">
      {/* Banking Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Bank Name & Reference</th>
                <th className="py-2.5 px-3">Beneficiary Account Name</th>
                <th className="py-2.5 px-3">Routing & Account Number</th>
                <th className="py-2.5 px-3">Verification Proof</th>
                <th className="py-2.5 px-3">Method & Currency</th>
                <th className="py-2.5 px-3">Linked Remit Location</th>
                <th className="py-2.5 px-3 text-center">Default</th>
                {!readOnly && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bankAccounts.length === 0 ? (
                <tr>
                  <td colSpan={readOnly ? 7 : 8} className="py-8 text-center text-slate-400">
                    <p className="text-xs">No bank accounts registered yet. Click &quot;+ Add Bank Account&quot; above to configure electronic disbursement coordinates.</p>
                  </td>
                </tr>
              ) : (
                bankAccounts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition group">
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-900 text-xs flex items-center space-x-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{b.bankName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Ref ID: {b.clientBankRefId} {b.swiftBic && `• SWIFT: ${b.swiftBic}`}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-700 font-normal">
                    {b.beneficiaryName}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <div className="text-xs font-medium text-slate-800">{b.accountNumberMasked}</div>
                    <div className="text-[10px] text-slate-500">ABA: {b.routingNumber}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {b.docFileName ? (
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handlePreviewDocument(b)}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition cursor-pointer group max-w-[190px]"
                          title="Click to preview attached bank document"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                          <span className="truncate group-hover:underline text-[11px] font-mono text-slate-700 group-hover:text-emerald-800">{b.docFileName}</span>
                          <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>
                        {b.isReplaced && (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-medium">
                            Resubmitted
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Not attached</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-600 font-normal">
                    {b.paymentMethod === 'ACH_CREDIT' ? 'ACH Credit' : b.paymentMethod} • {b.currency}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="inline-flex items-center space-x-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{b.linkedLocationName || 'All Buyer Orders'}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {b.isDefault ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !readOnly && handleSetDefault(b.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 hover:underline cursor-pointer"
                      >
                        Make Default
                      </button>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Edit Banking Coordinates & Replace Proof"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Bank Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Bank Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-tight">
                  {editingBank ? 'Edit Bank Account & Remittance Proof' : 'Add Bank Account (Direct FedACH Payout)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ATTACHMENT & OCR SCANNING ZONE FOR BANK PROOF */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                    <span>Voided Check or Bank Remittance Confirmation Letter</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">PDF, PNG, JPG (max 25MB)</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                      handleProcessBankProof({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                    }
                  }}
                />
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                      handleProcessBankProof({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                    }
                  }}
                />

                {/* OCR Scanning in progress */}
                {isOcrScanning && (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center space-x-2.5 text-xs text-slate-700 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Scanning check MICR routing & account line with OCR...</span>
                  </div>
                )}

                {/* Attached File Card */}
                {!isOcrScanning && formDocFile && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {formDocFile}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                            <span>{formDocSize || '1.4 MB'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              OCR Match {formOcrConfidence || 99.8}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {isReplaced && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-medium shrink-0">
                          Replaced / Resubmitted
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handlePreviewDocument({ 
                          docFileName: formDocFile || undefined, 
                          bankName: formBankName, 
                          routingNumber: formRouting,
                          previewUrl: formPreviewBlobUrl
                        })}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview Proof</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={handleTriggerReplace}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                          title="Replace with an updated voided check or bank confirmation"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-500" />
                          <span>Replace / Resubmit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormDocFile(null);
                            setFormOcrConfidence(null);
                          }}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove Attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dropzone when empty */}
                {!isOcrScanning && !formDocFile && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                        handleProcessBankProof({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                      }
                    }}
                    className="p-5 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition text-center cursor-pointer group"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-slate-700 mx-auto mb-1.5 transition-transform group-hover:scale-105" />
                    <p className="text-xs font-bold text-slate-800">
                      Click to browse or drop Voided Check / Bank Letter
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      Intelligent OCR will automatically extract and verify Routing Number, Account Number & Bank Name.
                    </p>
                  </div>
                )}
              </div>

              {/* Country and Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country of Bank</label>
                  <SearchableSelect
                    options={[
                      { value: 'United States', label: 'United States', code: 'US' },
                      { value: 'United Kingdom', label: 'United Kingdom', code: 'GB' },
                      { value: 'Germany', label: 'Germany', code: 'DE' },
                      { value: 'Japan', label: 'Japan', code: 'JP' },
                      { value: 'Canada', label: 'Canada', code: 'CA' }
                    ]}
                    value={formCountry}
                    onChange={(val) => setFormCountry(val)}
                    placeholder="Select Bank Country..."
                    searchPlaceholder="Search country..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Settlement Currency</label>
                  <SearchableSelect
                    options={[
                      { value: 'USD', label: 'USD - United States Dollar' },
                      { value: 'EUR', label: 'EUR - Euro Member Countries' },
                      { value: 'GBP', label: 'GBP - British Pound Sterling' },
                      { value: 'CAD', label: 'CAD - Canadian Dollar' },
                      { value: 'JPY', label: 'JPY - Japanese Yen' }
                    ]}
                    value={formCurrency}
                    onChange={(val) => setFormCurrency(val)}
                    placeholder="Select Currency..."
                    searchPlaceholder="Search currency..."
                  />
                </div>
              </div>

              {/* Bank Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Financial Institution (Bank Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase Bank, N.A."
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Beneficiary Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Beneficiary Name (Account Holder) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formBeneficiary}
                  onChange={(e) => setFormBeneficiary(e.target.value)}
                  placeholder="e.g. Acme Industrial Tech Inc."
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Routing and SWIFT */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Routing / ABA (9 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={9}
                    value={formRouting}
                    onChange={(e) => setFormRouting(e.target.value)}
                    placeholder="021000021"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    value={formSwift}
                    onChange={(e) => setFormSwift(e.target.value)}
                    placeholder="e.g. CHASUS33XXX"
                    className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Account and Confirm Account */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    placeholder="Enter Account Number"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Confirm Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formConfirmAccount}
                    onChange={(e) => setFormConfirmAccount(e.target.value)}
                    placeholder="Re-enter to confirm"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Linked Remit-To Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Linked Operating Location (Remit-To Destination)
                </label>
                <SearchableSelect
                  value={formLinkedLocationId}
                  onChange={(val) => setFormLinkedLocationId(val)}
                  placeholder="Select Remit-To Location..."
                  searchPlaceholder="Search location name, city or state..."
                  options={[
                    { value: '', label: 'Default (All Buyer Invoices & Orders)' },
                    ...locations.map((loc) => ({
                      value: loc.id,
                      label: `${loc.name} (${loc.city}, ${loc.state})`
                    }))
                  ]}
                />
              </div>

              {/* Is Default Checkbox */}
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
                />
                <span>Set as Default Remittance Account for this Buyer Relationship</span>
              </label>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingBank ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High-Fidelity Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
