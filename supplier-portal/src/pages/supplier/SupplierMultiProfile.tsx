import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { GlobalSupplierProfile, BuyerSpecificProfile } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  Globe, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  CreditCard, 
  FileText, 
  ChevronRight, 
  Plus, 
  Sliders, 
  Share2, 
  Eye, 
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';

export const SupplierMultiProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'BUYERS' | 'AGENTIC_SYNC'>('GLOBAL');
  const [globalProfile, setGlobalProfile] = useState<GlobalSupplierProfile | null>(null);
  const [buyerProfiles, setBuyerProfiles] = useState<BuyerSpecificProfile[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('buyer-org-1');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Connect New Buyer Modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [gRes, bRes] = await Promise.all([
        ApiClient.getGlobalProfile(),
        ApiClient.getBuyerProfiles()
      ]);
      if (gRes?.profile) setGlobalProfile(gRes.profile);
      if (bRes?.buyerProfiles) {
        setBuyerProfiles(bRes.buyerProfiles);
        if (bRes.buyerProfiles.length > 0 && !selectedBuyerId) {
          setSelectedBuyerId(bRes.buyerProfiles[0].buyerOrgId);
        }
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  const selectedBuyer = buyerProfiles.find(b => b.buyerOrgId === selectedBuyerId) || buyerProfiles[0];

  const handleCopyLink = () => {
    if (globalProfile?.passportUrl) {
      navigator.clipboard.writeText(globalProfile.passportUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleRunAiSync = async () => {
    if (!selectedBuyer) return;
    try {
      setSyncing(true);
      const res = await ApiClient.syncBuyerProfileAi(selectedBuyer.buyerOrgId);
      setSyncResult(res);
      setSuccessMessage(`AI Autonomous Sync Completed: ${res.syncedFieldsCount} fields verified with ${res.syncScore}% completeness.`);
      await loadProfileData();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      alert('Failed to run AI sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.connectNewBuyer({
        buyerName: newBuyerName,
        invitationCode
      });
      setShowConnectModal(false);
      setNewBuyerName('');
      setInvitationCode('');
      setSuccessMessage(res.message);
      await loadProfileData();
      if (res.buyerProfile) {
        setSelectedBuyerId(res.buyerProfile.buyerOrgId);
        setActiveTab('BUYERS');
      }
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      alert('Failed to connect new buyer');
    }
  };

  if (loading || !globalProfile) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
        Loading Verisource Supplier Identity Network...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Verisource Multi-Enterprise B2B Identity</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Master Public Profile & Buyer-Specific Profiles</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Maintain one canonical master profile and share tailored individual profiles, custom remittance bank accounts, and negotiated compliance packages across all connected enterprise buyers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('GLOBAL')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'GLOBAL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Master Public Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('BUYERS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'BUYERS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Buyer Profiles ({buyerProfiles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('AGENTIC_SYNC')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'AGENTIC_SYNC'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Agentic Sync</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: GLOBAL MASTER PASSPORT */}
      {activeTab === 'GLOBAL' && (
        <div className="space-y-6">
          {/* Public Trust Passport Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-slate-900">{globalProfile.legalName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verisource Certified Enterprise</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-700">
                  DUNS: {globalProfile.dunsNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                {globalProfile.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                <span>HQ: <strong>{globalProfile.hqAddress}</strong></span>
                <span>•</span>
                <span>Incorporated: <strong>{globalProfile.incorporationDate}</strong></span>
                <span>•</span>
                <span>Tax ID: <strong className="font-mono">{globalProfile.taxIdMasked}</strong></span>
              </div>
            </div>

            {/* Public Profile URL & Share controls */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 w-full lg:w-96 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Universal Public Profile</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Network Active
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 font-mono text-[11px] truncate flex items-center justify-between">
                <span className="truncate">{globalProfile.passportUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 font-sans font-semibold shrink-0 text-xs flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Zero-keying onboarding: Buyers can invite & onboard via this public profile.</span>
              </div>
            </div>
          </div>

          {/* Master Verification Badges */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tax ID / TIN</div>
              <div className="mt-1 font-bold text-slate-900 text-xs flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> IRS Verified
              </div>
              <div className="text-[10px] text-slate-500 mt-1">IRS TIN Match API</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Banking Token</div>
              <div className="mt-1 font-bold text-slate-900 text-xs flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Plaid / EWS Valid
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Nacha & Nacha EWS</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Global Sanctions</div>
              <div className="mt-1 font-bold text-slate-900 text-xs flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> OFAC / PEP Clear
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Autonomous Daily Screen</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Cybersecurity</div>
              <div className="mt-1 font-bold text-slate-900 text-xs flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> ISO 27001 & SOC 2
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Certified Active Vault</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Diversity</div>
              <div className="mt-1 font-bold text-slate-900 text-xs flex items-center gap-1 text-indigo-600">
                <Award className="w-3.5 h-3.5" /> MBE Certified
              </div>
              <div className="text-[10px] text-slate-500 mt-1">National Council Certified</div>
            </div>
          </div>

          {/* Master Vault Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Universal Master Compliance Vault</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core compliance documents stored in your vault automatically populate buyer onboarding requests.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Last Synchronized: {new Date(globalProfile.updatedAt).toLocaleDateString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">IRS Form W-9</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                </div>
                <div className="text-slate-500 text-[11px]">Taxpayer Identification Number & Legal Name Certified</div>
                <div className="text-[10px] text-slate-400">Applies universally to all US buyers</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">ACORD 25 Insurance</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
                </div>
                <div className="text-slate-500 text-[11px]">{globalProfile.masterVault.insuranceCoverageAmount}</div>
                <div className="text-[10px] text-emerald-600 font-medium">Valid until {globalProfile.masterVault.insuranceExpiryDate}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">ISO / IEC 27001</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Audited</span>
                </div>
                <div className="text-slate-500 text-[11px]">Information Security Management System Certificate</div>
                <div className="text-[10px] text-slate-400">Annual surveillance audit cleared</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Bank Verification</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Tokenized</span>
                </div>
                <div className="text-slate-500 text-[11px]">JPMorgan Chase Official Corporate Letter on file</div>
                <div className="text-[10px] text-slate-400">Masked coordinates protected under SOX controls</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUYER-SPECIFIC PROFILES */}
      {activeTab === 'BUYERS' && (
        <div className="space-y-6">
          {/* Buyer Selector Strip */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {buyerProfiles.map((b) => {
                const isSelected = selectedBuyer?.buyerOrgId === b.buyerOrgId;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuyerId(b.buyerOrgId)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-extrabold">
                      {b.buyerLogoText.slice(0, 2)}
                    </span>
                    <span>{b.buyerName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {b.relationshipStatus}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowConnectModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-dashed border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect New Buyer</span>
              </button>
            </div>

            <button
              onClick={handleRunAiSync}
              disabled={syncing}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{syncing ? 'Syncing...' : 'AI Profile Sync'}</span>
            </button>
          </div>

          {/* Selected Buyer Profile Workspace */}
          {selectedBuyer && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Buyer Relationship Summary (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Connected Enterprise</div>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedBuyer.buyerName}</h2>
                      <div className="text-xs text-slate-500 mt-0.5">Partner Since {selectedBuyer.connectedSince}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedBuyer.relationshipStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {selectedBuyer.relationshipStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ERP Vendor Master ID:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedBuyer.erpVendorId || 'Pending Activation'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Profile Completeness:</span>
                      <span className="font-bold text-emerald-600">{selectedBuyer.syncCompletenessScore}%</span>
                    </div>
                    {selectedBuyer.annualSpendVolume !== undefined && selectedBuyer.annualSpendVolume > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Annual Spend Volume:</span>
                        <span className="font-extrabold text-slate-900">${selectedBuyer.annualSpendVolume.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Sync progress bar */}
                  <div className="pt-2">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedBuyer.syncCompletenessScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Dedicated Remittance Account */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Dedicated Remittance Account</span>
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Isolated
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    All disbursements from {selectedBuyer.buyerName} are routed to this specific bank coordinates.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">{selectedBuyer.customRemittanceAccount.accountNickName}</div>
                    <div className="text-slate-600 font-medium">{selectedBuyer.customRemittanceAccount.bankName}</div>
                    <div className="font-mono text-[11px] text-slate-500">
                      Account Ending in: ••••{selectedBuyer.customRemittanceAccount.accountEnding} ({selectedBuyer.customRemittanceAccount.currency})
                    </div>
                  </div>
                </div>

                {/* Negotiated Terms */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-teal-600" />
                    <span>Negotiated Commercial Terms</span>
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">Agreed Payment Terms:</span>
                      <span className="font-bold text-slate-900">{selectedBuyer.negotiatedTerms.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">Settlement Rail:</span>
                      <span className="font-semibold text-slate-900">{selectedBuyer.negotiatedTerms.preferredPaymentMethod}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">Dynamic Discounting:</span>
                      <span className="font-semibold text-emerald-600">
                        {selectedBuyer.negotiatedTerms.earlyPaymentEligible ? 'Enabled (Coupa Pay / SAP Aligned)' : 'Standard Only'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Custom Questionnaires, Document Overrides & Rate Cards (8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                {/* Buyer-Specific Policy Questionnaires */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {selectedBuyer.buyerName} Specific Compliance Declarations
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        These answers are customized specifically for this enterprise buyer's procurement policy.
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedBuyer.customQuestionnaires.length} Buyer Overrides
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedBuyer.customQuestionnaires.map((q) => (
                      <div key={q.questionId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{q.questionText}</span>
                          <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-white border border-slate-200">
                            {q.category}
                          </span>
                        </div>
                        <div className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                          {q.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buyer-Specific Document Overrides & Additional Insured Endorsements */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Buyer-Dedicated Documents & Addenda
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Certificates or NDAs customized with {selectedBuyer.buyerName} named as party or additional insured.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {selectedBuyer.customDocumentOverrides.map((doc, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-900">{doc.documentName}</div>
                            {doc.note && <div className="text-[11px] text-amber-700 mt-0.5">{doc.note}</div>}
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'COMPLIANT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {doc.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contracted Catalog & Price Tier */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2 text-xs">
                  <h3 className="text-sm font-bold text-slate-900">
                    Negotiated Catalog & Price Schedule
                  </h3>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold">Assigned Catalog Tier:</span> {selectedBuyer.customCatalogTier}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700">Contracted</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AGENTIC PROFILE SYNC & AUTO-FILL */}
      {activeTab === 'AGENTIC_SYNC' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Autonomous Profile Synchronization Engine</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  How Verisource eliminates redundant questionnaires: Your master public profile data automatically maps to each buyer's unique vendor schema.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-900">Current Target Workspace:</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">{selectedBuyer?.buyerName}</div>
                <div className="text-xs text-slate-500">Compares Master Public Profile vs {selectedBuyer?.buyerName} Procurement Schema</div>
              </div>

              <button
                onClick={handleRunAiSync}
                disabled={syncing}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{syncing ? 'Analyzing Schemas...' : 'Execute AI Auto-Sync Audit'}</span>
              </button>
            </div>

            {/* Sync Results View */}
            {syncResult && (
              <div className="space-y-4 pt-2 animate-fade-in">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{syncResult.message}</span>
                  </div>
                  <p className="mt-1">{syncResult.autonomousAgentNote}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Auto-populated fields */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Auto-Populated Fields ({syncResult.syncedFields.length})
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {syncResult.syncedFields.map((f: any, i: number) => (
                        <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                          <span className="font-medium text-slate-800">{f.field}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                            100% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flagged deltas */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Flagged Requirements / Deltas ({syncResult.unfulfilledDeltas.length})
                    </h4>
                    {syncResult.unfulfilledDeltas.length === 0 ? (
                      <div className="text-xs text-slate-400 py-6 text-center">
                        Zero unfulfilled deltas! All buyer requirements satisfied by your Master Public Profile.
                      </div>
                    ) : (
                      syncResult.unfulfilledDeltas.map((d: any, i: number) => (
                        <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1">
                          <div className="font-bold text-amber-900">{d.document}</div>
                          <div className="text-amber-800 text-[11px]">{d.requirement}</div>
                          <div className="text-indigo-700 font-semibold text-[10px] flex items-center gap-1 pt-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>{d.suggestedAction}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connect New Buyer Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Connect New Enterprise Buyer</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter the buyer organization name or invitation token. Your Master Public Profile will pre-populate their onboarding workspace.
            </p>

            <form onSubmit={handleConnectBuyer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer Organization Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lockheed Precision Systems Inc."
                  value={newBuyerName}
                  onChange={(e) => setNewBuyerName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invitation Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. INV-BUYER-9921"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                <div className="font-semibold text-slate-800">What happens next?</div>
                <div>Your verified Master Public Profile will be shared, creating a dedicated Buyer Profile with isolated remittance banking.</div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-700/20"
                >
                  Connect & Share Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
