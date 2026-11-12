import { useState, useEffect } from 'react';

export interface SupplierPortalSettings {
  // 1. Company Profile (Editable)
  legalName: string;
  tradeName: string;
  email: string;
  phone: string;
  headquarters: string;
  website: string;
  timezone: string;
  logoUrl?: string;

  // 2. Ava AI & Automation Preferences
  autoDraftBids: boolean; // Auto-Draft RFP Bidding Margins
  defaultBidDiscount: number; // e.g. 5 for -5% Edge
  autoFillOnboarding: boolean; // AI Compliance Questionnaire Pre-Fill
  autoPoFlip: boolean; // 1-Click Purchase Order to Invoice Flip
  earlyPaymentHighlighting: boolean; // Early Payment Discount Highlighting
  defaultAccelerationDays: number; // Default acceleration target (e.g. 20 days)
  maxDiscountTolerance: number; // Maximum discount fee tolerance ceiling (e.g. 2.0%)
  preferredLiquidityBank: string; // Preferred depository account for early payouts
  autoOpenAvaDrawer: boolean; // Proactively open Ava Copilot on action items

  // 3. Display & Operations
  tableDensity: 'COMFORTABLE' | 'COMPACT'; // Table row density
  invoiceMatchTolerance: 'ZERO_TOLERANCE' | 'ONE_PERCENT'; // Variance tolerance threshold
  slaUrgencyDays: number; // Days remaining to flag SLA as urgent (e.g. 7, 10, 14)

  // 4. Notifications & Alerts
  notificationEmail: string;
  notifRfps: boolean;
  notifOrders: boolean;
  notifPayments: boolean;
  notifCompliance: boolean;
}

export const DEFAULT_SUPPLIER_SETTINGS: SupplierPortalSettings = {
  legalName: 'Acme Industrial Tech Inc.',
  tradeName: 'Acme Tech Solutions',
  email: 'elena@acmeindustrial.com',
  phone: '+1 (512) 555-0199',
  headquarters: '100 Industrial Parkway, Suite 400, Austin, TX 78701',
  website: 'https://acmeindustrial.com',
  timezone: 'America/Chicago (Central Time - UTC-06:00)',

  autoDraftBids: true,
  defaultBidDiscount: 5,
  autoFillOnboarding: true,
  autoPoFlip: true,
  earlyPaymentHighlighting: true,
  defaultAccelerationDays: 20,
  maxDiscountTolerance: 2.0,
  preferredLiquidityBank: 'Silicon Valley Bank (SVB) ••••4492',
  autoOpenAvaDrawer: true,

  tableDensity: 'COMFORTABLE',
  invoiceMatchTolerance: 'ZERO_TOLERANCE',
  slaUrgencyDays: 10,

  notificationEmail: 'elena@acmeindustrial.com',
  notifRfps: true,
  notifOrders: true,
  notifPayments: true,
  notifCompliance: true,
};

const STORAGE_KEY = 'verisource_supplier_settings_v1';

function loadStoredSettings(): SupplierPortalSettings {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SUPPLIER_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to load settings from localStorage, falling back to defaults', err);
  }
  return { ...DEFAULT_SUPPLIER_SETTINGS };
}

let currentSettings: SupplierPortalSettings = loadStoredSettings();
const listeners = new Set<(settings: SupplierPortalSettings) => void>();

function notifyListeners() {
  const snapshot = { ...currentSettings };
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      window.dispatchEvent(new CustomEvent('verisource_settings_updated', { detail: snapshot }));
    }
  } catch (err) {
    console.warn('Failed to persist settings to localStorage', err);
  }
  listeners.forEach(fn => fn(snapshot));
}

export const supplierSettingsService = {
  getSettings(): SupplierPortalSettings {
    return { ...currentSettings };
  },

  updateSettings(partial: Partial<SupplierPortalSettings>): SupplierPortalSettings {
    currentSettings = { ...currentSettings, ...partial };
    notifyListeners();
    return { ...currentSettings };
  },

  resetToDefaults(): SupplierPortalSettings {
    currentSettings = { ...DEFAULT_SUPPLIER_SETTINGS };
    notifyListeners();
    return { ...currentSettings };
  },

  subscribe(listener: (settings: SupplierPortalSettings) => void): () => void {
    listeners.add(listener);
    listener({ ...currentSettings });
    return () => {
      listeners.delete(listener);
    };
  }
};

/**
 * React Hook to access and update reactive settings anywhere in the app
 */
export function useSupplierSettings() {
  const [settings, setSettings] = useState<SupplierPortalSettings>(supplierSettingsService.getSettings());

  useEffect(() => {
    const unsubscribe = supplierSettingsService.subscribe(setSettings);
    return () => {
      unsubscribe();
    };
  }, []);

  const updateSettings = (partial: Partial<SupplierPortalSettings>) => {
    return supplierSettingsService.updateSettings(partial);
  };

  const resetSettings = () => {
    return supplierSettingsService.resetToDefaults();
  };

  return { settings, updateSettings, resetSettings };
}

