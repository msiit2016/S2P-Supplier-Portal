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
  CheckCheck
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

  // Active section filter in Master Profile
  const [activeMasterSection, setActiveMasterSection] = useState<string>('ALL');

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
              <p className="text-[11px] text-slate-500">Universal master profile and buyer-specific relationship credentials</p>
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
            <button
              onClick={() => setActiveTab('AGENTIC_SYNC')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'AGENTIC_SYNC'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Agentic Sync</span>
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
          {/* Identity & Public Passport Summary Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-slate-900">{globalProfile.legalName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verisource Certified Enterprise</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-700">
                  DUNS: {globalProfile.dunsNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                {globalProfile.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {globalProfile.hqAddress}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Incorporated: {globalProfile.incorporationDate}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono"><Hash className="w-3.5 h-3.5 text-slate-400" /> Tax ID: {globalProfile.taxIdMasked}</span>
              </div>
            </div>

            {/* Public Profile Share Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0 w-full lg:w-88 space-y-2 text-xs">
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
      {/* TAB 2: BUYER-SPECIFIC PROFILES (DETAILED BUYER RELATIONSHIP WORKSPACE)     */}
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

            <button
              onClick={handleRunAiSync}
              disabled={syncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{syncing ? 'Syncing...' : 'AI Profile Sync'}</span>
            </button>
          </div>

          {/* Selected Buyer Profile Workspace */}
          {selectedBuyer && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Buyer Relationship, Banking & Terms (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Enterprise Connection Status Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Enterprise Buyer</div>
                      <h2 className="text-base font-bold text-slate-900 mt-0.5">{selectedBuyer.buyerName}</h2>
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
                        <span className="font-extrabold text-slate-900 font-mono">${selectedBuyer.annualSpendVolume.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Sync progress bar */}
                  <div className="pt-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
                      <Landmark className="w-4 h-4 text-emerald-600" />
                      <span>Dedicated Remittance Account</span>
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Isolated
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Disbursements from {selectedBuyer.buyerName} are routed exclusively to these coordinates.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">{selectedBuyer.customRemittanceAccount.accountNickName}</div>
                    <div className="text-slate-600 font-medium">{selectedBuyer.customRemittanceAccount.bankName}</div>
                    <div className="font-mono text-[11px] text-slate-500">
                      Account Ending in: ••••{selectedBuyer.customRemittanceAccount.accountEnding} ({selectedBuyer.customRemittanceAccount.currency})
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Routing Masked: {selectedBuyer.customRemittanceAccount.routingNumberMasked}
                    </div>
                  </div>
                </div>

                {/* Negotiated Terms */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
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
                    {selectedBuyer.negotiatedTerms.customDiscountRate && (
                      <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500">Early Pay Discount:</span>
                        <span className="font-bold text-emerald-700">{selectedBuyer.negotiatedTerms.customDiscountRate}% 10 Days</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Custom Questionnaires, Document Overrides & Rate Cards (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Inherited Master Profile Verification Notice */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950">Inherited Master Profile Credentials</div>
                      <div className="text-emerald-700 text-[11px]">
                        IRS Form W-9, ISO 27001, SOC 2, and D-U-N-S coordinates are automatically shared from your Master Public Profile.
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                    Auto-Synced
                  </span>
                </div>

                {/* Buyer-Specific Policy Questionnaires */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
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

                {/* Buyer-Specific Document Overrides & Additional Insured Endorsements */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Buyer-Dedicated Documents & Addenda
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Certificates or NDAs customized with {selectedBuyer.buyerName} named as party or additional insured.
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedBuyer.customDocumentOverrides.length} Documents
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

                {/* Contracted Catalog & Price Tier */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
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

      {/* ========================================================================= */}
      {/* TAB 3: AGENTIC PROFILE SYNC & AUTO-FILL                                   */}
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

              <button
                onClick={handleRunAiSync}
                disabled={syncing}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
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
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-700/20 cursor-pointer"
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
