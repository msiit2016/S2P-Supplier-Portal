import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { useSupplierSettings, SupplierPortalSettings } from '../../services/supplierSettingsService.js';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Globe, 
  FolderLock, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  Bell, 
  KeyRound, 
  RotateCcw,
  Sliders,
  Check,
  Clock,
  Layers,
  Zap,
  Percent,
  CheckSquare,
  X
} from 'lucide-react';

export const SupplierProfileSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = usePortal();
  const { settings, updateSettings, resetSettings } = useSupplierSettings();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'AI' | 'OPERATIONS' | 'NOTIFICATIONS' | 'SECURITY'>('PROFILE');

  // Local draft state for editing before explicit save
  const [draft, setDraft] = useState<SupplierPortalSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Settings successfully saved.');
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, durationMs: number = 3500) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    setSavedToast(true);
    toastTimerRef.current = setTimeout(() => {
      setSavedToast(false);
      toastTimerRef.current = null;
    }, durationMs);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setSavedToast(false);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Security password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Sync draft whenever upstream settings change externally
  useEffect(() => {
    setDraft(settings);
    setIsDirty(false);
  }, [settings]);

  // Helper to update a draft property
  const updateDraft = <K extends keyof SupplierPortalSettings>(key: K, value: SupplierPortalSettings[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = (tabName?: string) => {
    updateSettings(draft);
    setIsDirty(false);
    const labelMap: Record<string, string> = {
      'Company Profile': 'Company profile updated successfully',
      'AI Preferences': 'AI copilot preferences saved',
      'Operations': 'Display & operations settings saved',
      'Notifications': 'Notification preferences updated'
    };
    showToast(tabName ? (labelMap[tabName] || `${tabName} settings saved`) : 'Settings saved successfully');
  };

  const handleReset = () => {
    setDraft(settings);
    setIsDirty(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Account password updated successfully.');
    }, 1000);
  };

  return (
    <div className="space-y-4 pb-20 font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* 1. COMPACT HEADER BANNER                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Company Brand Emblem (Exact match to Public Profile) */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base tracking-tight shrink-0 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs">
            {draft.logoUrl ? (
              <img
                src={draft.logoUrl}
                alt={draft.legalName}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <span>{draft.legalName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {draft.legalName}
            </h1>

            {/* Verified Badge Icon with Hover Tooltip */}
            <div 
              className="relative inline-flex items-center group cursor-pointer"
              onMouseEnter={() => setShowVerifiedTooltip(true)}
              onMouseLeave={() => setShowVerifiedTooltip(false)}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 transition hover:bg-emerald-100 hover:scale-105 shadow-2xs" title="Verisource Verified">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>

              {showVerifiedTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg border border-slate-800 whitespace-nowrap pointer-events-none flex items-center gap-1.5 animate-in fade-in-50 zoom-in-95">
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Verisource Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Industry Standard Floating Toast (Bottom-Center Aligned, Zero Truncation, Sonner/Linear Style) */}
      {savedToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-800/90 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 select-none max-w-[92vw] whitespace-nowrap">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="text-slate-100 font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={dismissToast}
            className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition cursor-pointer shrink-0 ml-1.5"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS (Matching Collaboration Page Design Language)     */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 select-none">
        {[
          { id: 'PROFILE', label: 'Company Profile', icon: Building2 },
          { id: 'AI', label: 'Ava AI & Automation', icon: Sparkles },
          { id: 'OPERATIONS', label: 'Display & Operations', icon: Sliders },
          { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
          { id: 'SECURITY', label: 'Security & Login', icon: KeyRound }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 focus:outline-none ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMPANY PROFILE                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Organization Coordinates
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Shared across purchase orders, invoice remittances, and buyer onboarding.
                </p>
              </div>
              {isDirty && (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Unsaved Changes
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Legal Corporate Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={draft.legalName}
                  onChange={(e) => updateDraft('legalName', e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DBA / Trade Name
                </label>
                <input
                  type="text"
                  value={draft.tradeName}
                  onChange={(e) => updateDraft('tradeName', e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white transition"
                  placeholder="Doing business as (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Business Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={draft.email}
                    onChange={(e) => updateDraft('email', e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Telephone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={draft.phone}
                    onChange={(e) => updateDraft('phone', e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Headquarters Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={draft.headquarters}
                  onChange={(e) => updateDraft('headquarters', e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Website
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={draft.website}
                    onChange={(e) => updateDraft('website', e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operating Timezone
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={draft.timezone}
                    onChange={(e) => updateDraft('timezone', e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3.5 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty}
                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Discard</span>
              </button>

              <div className="flex items-center gap-2">
                {savedToast && (
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Saved</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleSave('Company Profile')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-medium shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AVA AI PREFERENCES (Linked to RFP, Onboarding, Orders & Invoices)  */}
      {/* ========================================================================= */}
      {activeTab === 'AI' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ava AI Copilot Preferences</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Controls AI auto-drafting, bid discounting calculations, and 1-click execution across pages.
              </p>
            </div>
            {isDirty && (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {/* Setting 1: Early Payment & Liquidity Acceleration Policy */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Early Payment &amp; Liquidity Acceleration</span>
                  {draft.earlyPaymentHighlighting ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      Program Active • Opted In
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Disabled across Invoices &amp; Dashboard
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  When enabled, unlocks interactive dynamic discounting sliders and fast Fedwire disbursements on eligible invoices.
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateDraft('earlyPaymentHighlighting', !draft.earlyPaymentHighlighting)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  draft.earlyPaymentHighlighting ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                  draft.earlyPaymentHighlighting ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Treasury Policy Controls (Visible when earlyPaymentHighlighting is active) */}
            {draft.earlyPaymentHighlighting && (
              <div className="py-3.5 pl-4 pr-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl my-2 space-y-3.5 text-xs">
                {/* 1. Target Acceleration Days */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Default Acceleration Target</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Initial slider baseline when opening early payment cashout offers.
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[10, 15, 20, 25].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => updateDraft('defaultAccelerationDays', days)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          (draft.defaultAccelerationDays || 20) === days
                            ? 'bg-amber-500 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {days}d {days === 20 ? '(Target)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Maximum Discount Fee Tolerance */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-600" />
                      <span>Maximum Discount Fee Tolerance</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Corporate policy ceiling; flags invoices where buyer discount exceeds threshold.
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[1.0, 1.5, 2.0, 2.5].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => updateDraft('maxDiscountTolerance', rate)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          (draft.maxDiscountTolerance || 2.0) === rate
                            ? 'bg-amber-500 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {rate.toFixed(1)}%{rate === 2.0 ? ' (Policy)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Preferred Depository Bank */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Early Liquidity Depository Account</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Direct deposit rail for same-day Fedwire dynamic discounting payouts.
                    </div>
                  </div>
                  <select
                    value={draft.preferredLiquidityBank || 'Silicon Valley Bank (SVB) ••••4492'}
                    onChange={(e) => updateDraft('preferredLiquidityBank', e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer shadow-2xs"
                  >
                    <option value="Silicon Valley Bank (SVB) ••••4492">Silicon Valley Bank (SVB) ••••4492 (Primary Operating)</option>
                    <option value="JPMorgan Chase Commercial ••••4921">JPMorgan Chase Commercial ••••4921 (Secondary Wire)</option>
                    <option value="Citibank NA Escrow ••••8812">Citibank NA Escrow ••••8812 (Capital Treasury)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Setting 2: Auto-Draft RFP Bidding Discounts */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900">Auto-Draft RFP Bidding Discounts</div>
                <div className="text-[11px] text-slate-500">
                  Calculates competitive pricing against buyer target ceilings when preparing tender bids.
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateDraft('autoDraftBids', !draft.autoDraftBids)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  draft.autoDraftBids ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                  draft.autoDraftBids ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Setting 3: Default Discount Rate */}
            {draft.autoDraftBids && (
              <div className="py-3 pl-4 flex items-center justify-between gap-4 bg-slate-50/60 rounded-xl my-1 p-2.5 border border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-slate-500" />
                    <span>Default Discount Rate</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Applied to tender line items relative to buyer target ceiling.
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[3, 5, 7, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => updateDraft('defaultBidDiscount', pct)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        draft.defaultBidDiscount === pct
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Setting 4: AI Onboarding Questionnaire Pre-Fill */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900">AI Onboarding Questionnaire Pre-Fill</div>
                <div className="text-[11px] text-slate-500">
                  Pre-populates buyer questionnaires using verified W-9, insurance COI, and security certificates.
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateDraft('autoFillOnboarding', !draft.autoFillOnboarding)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  draft.autoFillOnboarding ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                  draft.autoFillOnboarding ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Setting 5: 1-Click PO Flip */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900">1-Click Purchase Order to Invoice Flip</div>
                <div className="text-[11px] text-slate-500">
                  Shows 1-Click Flip button on Orders and Tasks to instantly generate compliant invoices.
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateDraft('autoPoFlip', !draft.autoPoFlip)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  draft.autoPoFlip ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                  draft.autoPoFlip ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Setting 6: Proactive Ava Drawer */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900">Auto-Open Ava Copilot on Action Items</div>
                <div className="text-[11px] text-slate-500">
                  Automatically slides open Ava Copilot when opening urgent tasks or RFP bids.
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateDraft('autoOpenAvaDrawer', !draft.autoOpenAvaDrawer)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  draft.autoOpenAvaDrawer ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                  draft.autoOpenAvaDrawer ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <div className="pt-3.5 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Discard</span>
            </button>

            <div className="flex items-center gap-2">
              {savedToast && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Saved</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSave('AI Preferences')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-medium shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DISPLAY & OPERATIONS (New Relevant Settings!)                       */}
      {/* ========================================================================= */}
      {activeTab === 'OPERATIONS' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Display &amp; Operational Preferences</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Customize data grid density, SLA threshold warnings, and invoice matching variance tolerance.
              </p>
            </div>
            {isDirty && (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {/* Setting 1: Table Row Density */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-900">Directory Table Row Density</div>
                <div className="text-[11px] text-slate-500">
                  Controls table row spacing across Invoices, Orders, RFPs, and Task Queue.
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateDraft('tableDensity', 'COMFORTABLE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    draft.tableDensity === 'COMFORTABLE'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => updateDraft('tableDensity', 'COMPACT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    draft.tableDensity === 'COMPACT'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Setting 2: SLA Urgency Warning Threshold */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-900">SLA Urgency Warning Threshold</div>
                <div className="text-[11px] text-slate-500">
                  Highlight deliverable tasks with red urgency badge when due within:
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {[5, 10, 14].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updateDraft('slaUrgencyDays', days)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      draft.slaUrgencyDays === days
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Setting 3: Invoice Matching Tolerance */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-900">Touchless Invoice Match Strictness</div>
                <div className="text-[11px] text-slate-500">
                  Variance tolerance for automated 2-Way and 3-Way match auto-clearance.
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateDraft('invoiceMatchTolerance', 'ZERO_TOLERANCE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    draft.invoiceMatchTolerance === 'ZERO_TOLERANCE'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Strict 0% Variance
                </button>
                <button
                  type="button"
                  onClick={() => updateDraft('invoiceMatchTolerance', 'ONE_PERCENT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    draft.invoiceMatchTolerance === 'ONE_PERCENT'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  1% Penny Rounding
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3.5 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Discard</span>
            </button>

            <div className="flex items-center gap-2">
              {savedToast && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Saved</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSave('Operations')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-medium shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: NOTIFICATIONS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-600" />
                <span>Email &amp; Notification Preferences</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage email delivery endpoints and transactional alerts.
              </p>
            </div>
            {isDirty && (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Unsaved Changes
              </span>
            )}
          </div>

          {/* Destination Email */}
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispatch Transaction Alerts To
            </label>
            <input
              type="email"
              value={draft.notificationEmail}
              onChange={(e) => updateDraft('notificationEmail', e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={draft.notifRfps}
                onChange={(e) => updateDraft('notifRfps', e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">RFP &amp; Sourcing Tender Invitations</span>
                <span className="text-slate-500 text-[11px] block">Alert when enterprise buyers invite you to submit bids.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={draft.notifOrders}
                onChange={(e) => updateDraft('notifOrders', e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">Purchase Orders &amp; Amendments</span>
                <span className="text-slate-500 text-[11px] block">Alert when buyers issue or amend purchase orders.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={draft.notifPayments}
                onChange={(e) => updateDraft('notifPayments', e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">Payment &amp; Remittance Confirmations</span>
                <span className="text-slate-500 text-[11px] block">Notice when automated electronic payouts settle in JPMorgan Chase.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={draft.notifCompliance}
                onChange={(e) => updateDraft('notifCompliance', e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">Compliance &amp; Document Expiry Warnings</span>
                <span className="text-slate-500 text-[11px] block">30-day notice prior to COI or certificate expiration.</span>
              </div>
            </label>
          </div>

          <div className="pt-3.5 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Discard</span>
            </button>

            <div className="flex items-center gap-2">
              {savedToast && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Saved</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSave('Notifications')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-medium shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SECURITY & LOGIN                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-600" />
              <span>Account Security &amp; Credentials</span>
            </h2>
            <span className="text-[11px] text-slate-400">Manage login credentials</span>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            <div className="pt-2 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-900">Account Password</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Last updated 45 days ago • 12 characters</div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Change Password
              </button>
            </div>

            <div className="pt-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>Two-Factor Authentication (2FA)</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Authenticator app verification required on new sign-ins.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !twoFactorEnabled;
                  setTwoFactorEnabled(nextVal);
                  showToast(`Two-Factor Authentication ${nextVal ? 'enabled' : 'disabled'}.`);
                }}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </button>
            </div>

            <div className="pt-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-900">Current Session</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Chrome on macOS • Austin, Texas (IP: 198.51.100.24)</div>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Now</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Change Password
              </h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {passwordSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-slate-900">Password Updated!</div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
