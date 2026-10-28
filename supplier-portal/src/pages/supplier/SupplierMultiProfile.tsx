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
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  Briefcase,
  UserCheck,
  FileCheck2,
  BadgePercent,
  Check,
  Search,
  Landmark,
  Shield,
  Layers,
  CheckCheck,
  ArrowDownUp,
  UploadCloud,
  CheckSquare,
  X,
  Send,
  KeyRound
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
  const [syncingToMaster, setSyncingToMaster] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSyncDetails, setShowSyncDetails] = useState(false);

  // Active section filter in Master Profile
  const [activeMasterSection, setActiveMasterSection] = useState<string>('ALL');

  // Active section filter in Buyer Profile
  const [activeBuyerSection, setActiveBuyerSection] = useState<string>('ALL');

  // Connect New Buyer Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMethod, setConnectMethod] = useState<'EMAIL_INVITE' | 'ENTER_CODE'>('EMAIL_INVITE');
  const [newBuyerName, setNewBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerContactName, setBuyerContactName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [customMessage, setCustomMessage] = useState(
    'We would like to share our verified Verisource Master Profile, IRS Form W-9, and banking coordinates for zero-keying onboarding.'
  );
  const [isSubmittingConnect, setIsSubmittingConnect] = useState(false);

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

  // 1. Agentic Sync: Pull/align from Master Profile to this Buyer Profile
  const handleRunAiSync = async () => {
    if (!selectedBuyer) return;
    try {
      setSyncing(true);
      const res = await ApiClient.syncBuyerProfileAi(selectedBuyer.buyerOrgId);
      setSyncResult(res);
      setSuccessMessage(`AI Autonomous Sync Completed: ${res.syncedFieldsCount} fields verified and aligned with ${selectedBuyer.buyerName}.`);
      setShowSyncDetails(true);
      await loadProfileData();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      alert('Failed to run AI sync');
    } finally {
      setSyncing(false);
    }
  };

  // 2. Bi-Directional Sync: Push updates from this Buyer Profile back to Master Profile
  const handleSyncToMaster = async () => {
    if (!selectedBuyer) return;
    try {
      setSyncingToMaster(true);
      const updates = {
        defaultPaymentTerms: selectedBuyer.negotiatedTerms.paymentTerms,
        description: globalProfile?.description
      };
      const res = await ApiClient.syncToMaster(updates, selectedBuyer.buyerName);
      setSuccessMessage(`Bi-Directional Sync Completed: Master Public Profile aligned with updates from ${selectedBuyer.buyerName}. Zero data inconsistencies!`);
      await loadProfileData();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      alert('Failed to sync updates to Master Profile');
    } finally {
      setSyncingToMaster(false);
    }
  };

  const handleConnectBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingConnect(true);
      const res = await ApiClient.connectNewBuyer({
        buyerName: newBuyerName,
        buyerEmail: connectMethod === 'EMAIL_INVITE' ? buyerEmail : undefined,
        buyerContactName: connectMethod === 'EMAIL_INVITE' ? buyerContactName : undefined,
        invitationCode: connectMethod === 'ENTER_CODE' ? invitationCode : undefined,
        connectionMethod: connectMethod,
        customMessage
      });
      setShowConnectModal(false);
      setNewBuyerName('');
      setBuyerEmail('');
      setBuyerContactName('');
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
    } finally {
      setIsSubmittingConnect(false);
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
    <div className="space-y-4">
      {/* Compact Unified Header Bar - Consistent with Catalog Vault & Doc Vault */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Title, Badge & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Public Profile</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Master company profile and connected enterprise relationships</p>
            </div>
          </div>
        </div>

        {/* Integrated Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Switcher Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('GLOBAL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'GLOBAL'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Master Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('BUYERS')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'BUYERS'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Buyer Profiles ({buyerProfiles.length})</span>
            </button>
          </div>

          {/* Quick Actions */}
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Copy Public Profile URL"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>{copiedLink ? 'Copied Link!' : 'Share Link'}</span>
          </button>

          <button
            onClick={() => setShowConnectModal(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Buyer</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MASTER PUBLIC PROFILE (COMPREHENSIVE DETAILED SECTIONS)             */}
      {/* ========================================================================= */}
      {activeTab === 'GLOBAL' && (
        <div className="space-y-4">
          {/* Identity & Public Passport Summary Bar - FIXED ALIGNMENT */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{globalProfile.legalName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verisource Certified Enterprise</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 shrink-0">
                  DUNS: {globalProfile.dunsNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                {globalProfile.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {globalProfile.hqAddress}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Incorporated: {globalProfile.incorporationDate}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono"><Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Tax ID: {globalProfile.taxIdMasked}</span>
              </div>
            </div>

            {/* Public Profile Share Box - Fixed standard responsive width */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 w-full lg:w-80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Universal Public Passport</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Network Active
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 font-mono text-[11px] truncate flex items-center justify-between">
                <span className="truncate">{globalProfile.passportUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 font-sans font-semibold shrink-0 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Zero-keying onboarding enabled for all buyers</span>
              </div>
            </div>
          </div>

          {/* Section Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL', label: 'All Sections' },
              { id: 'ENTITY', label: 'Company & Legal' },
              { id: 'CONTACTS', label: 'Key Contacts' },
              { id: 'BANKING', label: 'Banking & Remittance' },
              { id: 'TAX', label: 'Tax & Compliance' },
              { id: 'INSURANCE', label: 'Insurance & Risk' },
              { id: 'CERTS', label: 'Certifications & ESG' }
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveMasterSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 cursor-pointer ${
                  activeMasterSection === 'ALL'
                    ? (sec.id === 'ALL' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')
                    : (activeMasterSection === sec.id ? 'bg-slate-900 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* SECTION 1: Company & Legal Entity Details */}
          {(activeMasterSection === 'ALL' || activeMasterSection === 'ENTITY') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Company & Legal Entity Details</h3>
                    <p className="text-[11px] text-slate-500">Official registered corporate profile and business classification</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  IRS & Secretary of State Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Legal Entity Name</span>
                  <div className="font-bold text-slate-900 mt-0.5">{globalProfile.legalName}</div>
                  <div className="text-[11px] text-slate-500 mt-1">DBA / Trade: <strong>{globalProfile.tradeName}</strong></div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Entity Structure & State</span>
                  <div className="font-bold text-slate-900 mt-0.5">C-Corporation (Private)</div>
                  <div className="text-[11px] text-slate-500 mt-1">Delaware, USA • Incorp: {globalProfile.incorporationDate}</div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">D-U-N-S Number</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{globalProfile.dunsNumber}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">Dun & Bradstreet Active Verified</div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Industry & Sector</span>
                  <div className="font-bold text-slate-900 mt-0.5">{globalProfile.industryCategory}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Size: {globalProfile.employeeCountRange}</div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Corporate Headquarters</span>
                  <div className="font-bold text-slate-900 mt-0.5">{globalProfile.hqAddress}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Country: {globalProfile.country}</div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Official Web & Communications</span>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">{globalProfile.website}</div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">{globalProfile.businessEmail} • {globalProfile.phone}</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Key Corporate Contacts */}
          {(activeMasterSection === 'ALL' || activeMasterSection === 'CONTACTS') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Key Corporate Contacts & Authorized Signatories</h3>
                    <p className="text-[11px] text-slate-500">Designated representatives for procurement, billing, security, and contracts</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  4 Verified Officers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Executive & Business</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Elena Rostova</div>
                    <div className="text-slate-500 text-[11px]">VP of Enterprise Partnerships</div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> elena@acmeindustrial.com</div>
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> +1 (512) 555-0199</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Billing & Accounts Receivable</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Marcus Vance</div>
                    <div className="text-slate-500 text-[11px]">Corporate Controller / Treasury</div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> billing@acmeindustrial.com</div>
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> +1 (512) 555-0199 x104</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Cybersecurity & Compliance</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">David K. Chen</div>
                    <div className="text-slate-500 text-[11px]">Chief Information Security Officer</div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> security@acmeindustrial.com</div>
                    <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" /> ISO/SOC2 Lead</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Legal & Contract Signatory</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Sarah Jenkins, Esq.</div>
                    <div className="text-slate-500 text-[11px]">General Counsel</div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> legal@acmeindustrial.com</div>
                    <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Master Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Banking & Remittance Coordinates */}
          {(activeMasterSection === 'ALL' || activeMasterSection === 'BANKING') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Master Banking & Remittance Coordinates</h3>
                    <p className="text-[11px] text-slate-500">Verified corporate depository account tokenized via Nacha & Plaid API</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Plaid / EWS Tokenized
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Depository Institution</span>
                  <div className="font-bold text-slate-900 text-sm">JPMorgan Chase Bank, N.A.</div>
                  <div className="text-[11px] text-slate-500">Primary Corporate Operating Checking</div>
                  <div className="font-mono text-[11px] text-slate-700 pt-1">SWIFT / BIC: <strong>CHASUS33</strong></div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Account Coordinates</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">••••4921 (USD)</div>
                  <div className="font-mono text-[11px] text-slate-600">Routing (ABA): <strong>••••0021</strong></div>
                  <div className="text-[11px] text-emerald-600 font-semibold pt-1">Early Warning Services (EWS) Active Match</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Disbursement & Settlement Rails</span>
                  <div className="font-bold text-slate-900">ACH Credit (CCD+), Fedwire, Virtual Card</div>
                  <div className="text-[11px] text-slate-500">Default Payment Terms: <strong>{globalProfile.defaultPaymentTerms}</strong></div>
                  <div className="text-[11px] text-slate-500">Remittance: Automated EDI 820 & Email PDF</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Tax & Regulatory Compliance */}
          {(activeMasterSection === 'ALL' || activeMasterSection === 'TAX') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Tax & Regulatory Compliance</h3>
                    <p className="text-[11px] text-slate-500">IRS Form W-9, federal TIN validation, and daily OFAC/sanctions screening</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  IRS TIN Match 100%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">US Federal Tax ID (EIN)</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{globalProfile.taxIdMasked}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">IRS TIN Match API Verified</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Tax Form On File</span>
                  <div className="font-bold text-slate-900 mt-0.5">IRS Form W-9</div>
                  <div className="text-[11px] text-slate-500 mt-1">Revision 2024 • Certified Signed</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">State Tax Registration</span>
                  <div className="font-bold text-slate-900 mt-0.5">Texas & Multi-State</div>
                  <div className="text-[11px] text-slate-500 mt-1">Comptroller ID #32081928491</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Global Sanctions Screen</span>
                  <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OFAC / PEP Clear
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Daily Automated Autonomous Audit</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: Insurance, Risk & Liability Coverage */}
          {(activeMasterSection === 'ALL' || activeMasterSection === 'INSURANCE') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Insurance, Risk & Liability Coverage</h3>
                    <p className="text-[11px] text-slate-500">Commercial general liability, cyber risk, umbrella, and workers' compensation</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active • Valid until {globalProfile.masterVault.insuranceExpiryDate}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Commercial General Liability</span>
                  <div className="font-bold text-slate-900 mt-0.5">$5,000,000 Aggregate</div>
                  <div className="text-[11px] text-slate-500 mt-1">$2,000,000 Each Occurrence</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Umbrella / Excess Liability</span>
                  <div className="font-bold text-slate-900 mt-0.5">$10,000,000 Aggregate</div>
                  <div className="text-[11px] text-slate-500 mt-1">Travelers Property Casualty Co. (A++)</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Cyber Risk & Tech E&O</span>
                  <div className="font-bold text-slate-900 mt-0.5">$5,000,000 Aggregate</div>
                  <div className="text-[11px] text-slate-500 mt-1">Lloyd's Syndicate • Zero Breaches</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Workers' Compensation</span>
                  <div className="font-bold text-slate-900 mt-0.5">Statutory Limits</div>
                  <div className="text-[11px] text-slate-500 mt-1">$1,000,000 Employer's Liability</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: Certifications, Cybersecurity & ESG Standards */}
          {(activeMasterSection === 'ALL' || activeMasterSection === 'CERTS') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Cybersecurity, Quality & ESG Standards</h3>
                    <p className="text-[11px] text-slate-500">Third-party audited certifications, security accreditations, and sustainability ratings</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  4 Active Global Accreditations
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">ISO / IEC 27001</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Audited</span>
                  </div>
                  <div className="text-[11px] text-slate-600">ISMS Certificate #IS-782190</div>
                  <div className="text-[10px] text-slate-400">Annual surveillance audit cleared</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">SOC 2 Type II</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                  </div>
                  <div className="text-[11px] text-slate-600">Deloitte & Touche LLP Attestation</div>
                  <div className="text-[10px] text-slate-400">Security, Availability & Confidentiality</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Diversity (MBE)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">Certified</span>
                  </div>
                  <div className="text-[11px] text-slate-600">National Council #MBE-TX-2024-91</div>
                  <div className="text-[10px] text-slate-400">Minority Business Enterprise</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">EcoVadis Gold</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Top 5%</span>
                  </div>
                  <div className="text-[11px] text-slate-600">Sustainability Score: 74/100</div>
                  <div className="text-[10px] text-slate-400">Scope 1, 2, 3 ESG Audited</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUYER-SPECIFIC PROFILES WITH EMBEDDED AGENTIC SYNC & SECTIONS      */}
      {/* ========================================================================= */}
      {activeTab === 'BUYERS' && (
        <div className="space-y-4">
          {/* Buyer Selector Strip */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
              {buyerProfiles.map((b) => {
                const isSelected = selectedBuyer?.buyerOrgId === b.buyerOrgId;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuyerId(b.buyerOrgId)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
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
                      {b.relationshipStatus.replace(/_/g, ' ')}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowConnectModal(true)}
                className="px-3 py-1.5 rounded-xl font-bold border border-dashed border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition flex items-center space-x-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect Buyer</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Selected: <strong className="text-slate-800">{selectedBuyer?.buyerName}</strong></span>
            </div>
          </div>

          {selectedBuyer && (
            <div className="space-y-4">
              {/* EMBEDDED AGENTIC SYNC TOOLBAR DIRECTLY IN THE INDIVIDUAL BUYER PROFILE */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-900" />
                      Agentic Auto-Sync Active
                    </span>
                    <span className="text-xs text-indigo-200 font-medium">
                      Completeness: <strong className="text-emerald-400 font-bold">{selectedBuyer.syncCompletenessScore}%</strong>
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-300">
                      Partner Since {selectedBuyer.connectedSince}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedBuyer.buyerName} Onboarding & Schema Sync
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Auto-fetches master profile credentials (TIN, W-9, Banking Coordinates, ISO/SOC2, Contacts) and maps them into {selectedBuyer.buyerName}'s ERP vendor schema with zero manual re-entry.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleRunAiSync}
                    disabled={syncing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Auto-Fetching...' : 'Auto-Sync from Master'}</span>
                  </button>

                  <button
                    onClick={handleSyncToMaster}
                    disabled={syncingToMaster}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    title="Push any negotiated terms or buyer-specific answers back to canonical Master Profile"
                  >
                    <ArrowDownUp className="w-3.5 h-3.5 text-amber-300" />
                    <span>{syncingToMaster ? 'Aligning...' : 'Sync Updates to Master'}</span>
                  </button>
                </div>
              </div>

              {/* Sync Audit Report Card (Expandable on Sync) */}
              {syncResult && showSyncDetails && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-xs space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{syncResult.message}</span>
                    </div>
                    <button
                      onClick={() => setShowSyncDetails(false)}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                    >
                      Hide Details
                    </button>
                  </div>
                  <p className="text-emerald-800 text-[11px]">{syncResult.autonomousAgentNote}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                    {syncResult.syncedFields.map((f: any, i: number) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                        <span className="font-medium text-slate-800 truncate">{f.field}</span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">100% Match</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Filter Pills for Buyer Profile */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'ALL', label: 'All Buyer Sections' },
                  { id: 'STATUS', label: 'Onboarding & ERP' },
                  { id: 'BANKING', label: 'Dedicated Banking' },
                  { id: 'TERMS', label: 'Commercial Terms' },
                  { id: 'DECLARATIONS', label: 'Questionnaires' },
                  { id: 'DOCS', label: 'Documents & Addenda' },
                  { id: 'CATALOG', label: 'Contracted Rates' },
                  { id: 'INHERITED', label: 'Inherited Credentials' }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveBuyerSection(sec.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 cursor-pointer ${
                      activeBuyerSection === 'ALL'
                        ? (sec.id === 'ALL' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')
                        : (activeBuyerSection === sec.id ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* BUYER SECTION 1: Onboarding Status & ERP Master ID */}
              {(activeBuyerSection === 'ALL' || activeBuyerSection === 'STATUS') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Enterprise Onboarding & Relationship Status</h3>
                        <p className="text-[11px] text-slate-500">Official vendor record in {selectedBuyer.buyerName}'s ERP and procurement system</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedBuyer.relationshipStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {selectedBuyer.relationshipStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">ERP Vendor Master ID</span>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{selectedBuyer.erpVendorId || 'Pending Activation'}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Live in SAP / Coupa Vendor Master</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Connected Since</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedBuyer.connectedSince}</div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">Active Trading Partner</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Annual Spend Volume</span>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                        ${(selectedBuyer.annualSpendVolume || 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">YTD Processed Disbursements</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Schema Alignment</span>
                      <div className="font-bold text-emerald-700 text-sm mt-0.5">{selectedBuyer.syncCompletenessScore}% Complete</div>
                      <div className="text-[11px] text-slate-500 mt-1">Zero unfulfilled requirements</div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUYER SECTION 2: Dedicated Remittance Account */}
              {(activeBuyerSection === 'ALL' || activeBuyerSection === 'BANKING') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Dedicated Remittance & Banking Coordinates</h3>
                        <p className="text-[11px] text-slate-500">Isolated account assigned specifically for {selectedBuyer.buyerName} disbursements</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      SOX 404 Isolated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Designated Bank</span>
                      <div className="font-bold text-slate-900 text-sm">{selectedBuyer.customRemittanceAccount.bankName}</div>
                      <div className="text-[11px] text-slate-500">{selectedBuyer.customRemittanceAccount.accountNickName}</div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Account Coordinates</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">••••{selectedBuyer.customRemittanceAccount.accountEnding} ({selectedBuyer.customRemittanceAccount.currency})</div>
                      <div className="font-mono text-[11px] text-slate-500">Routing Masked: {selectedBuyer.customRemittanceAccount.routingNumberMasked}</div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Isolation Security Controls</span>
                      <div className="font-semibold text-emerald-700">Strict Buyer Segregation Active</div>
                      <div className="text-[11px] text-slate-500">Dual-authorization required for bank coordinate modifications</div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUYER SECTION 3: Negotiated Commercial Terms */}
              {(activeBuyerSection === 'ALL' || activeBuyerSection === 'TERMS') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Negotiated Commercial & Payment Terms</h3>
                        <p className="text-[11px] text-slate-500">Contracted payment terms, dynamic discounting, and disbursement rails</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Contractual
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Agreed Payment Terms</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedBuyer.negotiatedTerms.paymentTerms}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Standard Settlement Timeline</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Settlement Method</span>
                      <div className="font-semibold text-slate-900 text-sm mt-0.5">{selectedBuyer.negotiatedTerms.preferredPaymentMethod}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Automated Clearing House Direct Credit</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Dynamic Discounting</span>
                      <div className="font-bold text-emerald-700 text-sm mt-0.5">
                        {selectedBuyer.negotiatedTerms.customDiscountRate ? `${selectedBuyer.negotiatedTerms.customDiscountRate}% 10 Days` : 'Standard Only'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Accelerated Cash Flow Rail</div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUYER SECTION 4: Buyer Compliance Declarations & Policy Questionnaires */}
              {(activeBuyerSection === 'ALL' || activeBuyerSection === 'DECLARATIONS') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{selectedBuyer.buyerName} Policy & Compliance Declarations</h3>
                        <p className="text-[11px] text-slate-500">Custom questionnaire responses tailored specifically to {selectedBuyer.buyerName}'s procurement policies</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedBuyer.customQuestionnaires.length} Attestations Verified
                    </span>
                  </div>

                  <div className="space-y-2.5">
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
              )}

              {/* BUYER SECTION 5: Buyer-Dedicated Documents & Addenda */}
              {(activeBuyerSection === 'ALL' || activeBuyerSection === 'DOCS') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Buyer-Dedicated Documents & Addenda</h3>
                        <p className="text-[11px] text-slate-500">Endorsements or NDAs naming {selectedBuyer.buyerName} specifically</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedBuyer.customDocumentOverrides.length} Files
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedBuyer.customDocumentOverrides.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
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
              )}

              {/* BUYER SECTION 6: Contracted Catalog Tier & Master Volume Discounts */}
              {(activeBuyerSection === 'ALL' || activeBuyerSection === 'CATALOG') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Contracted Catalog & Negotiated Price Schedule</h3>
                        <p className="text-[11px] text-slate-500">Special rate tier synced with {selectedBuyer.buyerName}'s e-procurement punchout cart</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Contracted Active
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-emerald-900">Assigned Catalog Tier: {selectedBuyer.customCatalogTier}</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">PunchOut catalog items automatically reflect this price tier in buyer cart.</div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg shrink-0">
                      Auto-Applied
                    </span>
                  </div>
                </div>
              )}

              {/* BUYER SECTION 7: Inherited Master Profile Verification Credentials */}
              {(activeBuyerSection === 'ALL' || activeBuyerSection === 'INHERITED') && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Inherited Master Profile Verification Credentials</h3>
                        <p className="text-[11px] text-slate-500">Universal credentials cascading from your Master Public Profile with zero re-entry</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Auto-Synced from Master
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">IRS Form W-9</span>
                      <div className="font-bold text-slate-900 mt-0.5">Tax Year 2026 Certified</div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">EIN XX-XXX8812 Verified</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Cybersecurity Audit</span>
                      <div className="font-bold text-slate-900 mt-0.5">ISO 27001 & SOC 2</div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">Deloitte & Touche Attestation</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Global Sanctions</span>
                      <div className="font-bold text-slate-900 mt-0.5">OFAC / PEP Cleared</div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">Autonomous Daily Audit</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Commercial Liability</span>
                      <div className="font-bold text-slate-900 mt-0.5">$5,000,000 Policy</div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">Valid until June 30, 2027</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AGENTIC PROFILE SYNC ENGINE WORKSPACE                              */}
      {/* ========================================================================= */}
      {activeTab === 'AGENTIC_SYNC' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Autonomous Profile Synchronization Engine</h2>
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

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAiSync}
                  disabled={syncing}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{syncing ? 'Analyzing Schemas...' : 'Execute AI Auto-Sync Audit'}</span>
                </button>

                <button
                  onClick={handleSyncToMaster}
                  disabled={syncingToMaster}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowDownUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{syncingToMaster ? 'Aligning Master...' : 'Align Canonical Master'}</span>
                </button>
              </div>
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

      {/* Connect New Buyer Modal - Two-Way Connection Hub */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Connect Enterprise Buyer</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your verified Master Public Profile with a buyer enterprise
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connection Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setConnectMethod('EMAIL_INVITE')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  connectMethod === 'EMAIL_INVITE'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Invite Buyer by Email</span>
              </button>
              <button
                type="button"
                onClick={() => setConnectMethod('ENTER_CODE')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  connectMethod === 'ENTER_CODE'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Enter Buyer Invite Code</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConnectBuyer} className="p-5 space-y-4 text-xs">
              {connectMethod === 'EMAIL_INVITE' ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Buyer Organization Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lockheed Precision Systems Inc."
                      value={newBuyerName}
                      onChange={(e) => setNewBuyerName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Procurement Contact Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="procurement@buyer.example.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Contact Person / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Miller • Sourcing Director"
                        value={buyerContactName}
                        onChange={(e) => setBuyerContactName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Onboarding Invitation Note</label>
                    <textarea
                      rows={2}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-600 resize-none text-[11px]"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-emerald-950 space-y-1 text-[11px]">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zero-Keying Onboarding Invitation</span>
                    </div>
                    <div className="text-emerald-800">
                      The buyer will receive an invitation containing your verified Master Public Passport link, pre-populating their vendor schema with your W-9, banking coordinates, and certifications.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Buyer Organization Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Boeing Defense & Space"
                      value={newBuyerName}
                      onChange={(e) => setNewBuyerName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Invitation Code / Token *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. INV-LOCKHEED-2026"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-blue-950 space-y-1 text-[11px]">
                    <div className="font-bold flex items-center gap-1.5 text-blue-900">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      <span>Instant Buyer Activation</span>
                    </div>
                    <div className="text-blue-800">
                      Verifies the token provided by the buyer and establishes a dedicated buyer workspace with isolated remittance coordinates.
                    </div>
                  </div>
                </>
              )}

              {/* Quick Universal Link Copy Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-500 truncate">Or copy Public Passport Link:</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-emerald-700 hover:text-emerald-800 font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConnect}
                  className={`px-4 py-2 text-white rounded-lg font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                    connectMethod === 'EMAIL_INVITE'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-700/20'
                  }`}
                >
                  {connectMethod === 'EMAIL_INVITE' ? (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingConnect ? 'Sending...' : 'Send Onboarding Invite'}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isSubmittingConnect ? 'Connecting...' : 'Connect with Code'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
