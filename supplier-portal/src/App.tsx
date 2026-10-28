import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { PortalProvider, usePortal } from './context/PortalContext.js';
import { SupplierLayout } from './components/layout/SupplierLayout.js';

// Supplier Pages
import { SupplierLanding } from './pages/supplier/SupplierLanding.js';
import { SupplierDashboard } from './pages/supplier/SupplierDashboard.js';
import { SupplierAuth } from './pages/supplier/SupplierAuth.js';
import { BuyerWorkspaceHub } from './pages/supplier/BuyerWorkspaceHub.js';
import { SupplierMultiProfile } from './pages/supplier/SupplierMultiProfile.js';
import { AllTransactionsView } from './pages/supplier/AllTransactionsView.js';
import { OnboardingWizard } from './pages/supplier/OnboardingWizard.js';
import { OnboardingRequest } from './pages/supplier/OnboardingRequest.js';
import { OnboardingStatus } from './pages/supplier/OnboardingStatus.js';
import { SupplierOrders } from './pages/supplier/SupplierOrders.js';
import { SupplierInvoices } from './pages/supplier/SupplierInvoices.js';
import { SupplierEarlyPayment } from './pages/supplier/SupplierEarlyPayment.js';
import { SupplierDataExchange } from './pages/supplier/SupplierDataExchange.js';
import { SupplierDocVault } from './pages/supplier/SupplierDocVault.js';
import { SupplierCatalogVault } from './pages/supplier/SupplierCatalogVault.js';
import { SupplierCommunications } from './pages/supplier/SupplierCommunications.js';
import { SupplierProfileSettings } from './pages/supplier/SupplierProfileSettings.js';
import { SupplierRfps } from './pages/supplier/SupplierRfps.js';

const AppContent: React.FC = () => {
  const { currentRoute } = usePortal();
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span>Initializing Verisource Supplier OS...</span>
      </div>
    );
  }

  // Unauthenticated Public Routes
  if (currentRoute === '/landing') {
    return <SupplierLanding />;
  }

  if (currentRoute === '/login' || (!currentUser && currentRoute !== '/landing')) {
    return <SupplierAuth initialTab="LOGIN" />;
  }

  if (currentRoute === '/signup' || currentRoute === '/register') {
    return <SupplierAuth initialTab="SIGNUP" />;
  }

  // Authenticated Supplier Pages inside SupplierLayout
  let content: React.ReactNode = null;

  if (currentRoute === '/' || currentRoute === '/dashboard') {
    // Executive Home Dashboard
    content = <SupplierDashboard />;
  } else if (currentRoute.startsWith('/workspaces')) {
    // Dedicated Buyer Workspace (Onboarding, PO, Invoice, ASN)
    content = <BuyerWorkspaceHub />;
  } else if (currentRoute.startsWith('/profiles') || currentRoute.startsWith('/public-profile') || currentRoute.startsWith('/master-profile')) {
    // Universal Master Public Profile
    content = <SupplierMultiProfile />;
  } else if (currentRoute.startsWith('/rfps') || currentRoute.startsWith('/sourcing') || currentRoute.startsWith('/bids')) {
    // Enterprise Sourcing, RFPs, RFIs & Bids
    content = <SupplierRfps />;
  } else if (currentRoute.startsWith('/transactions')) {
    // Cross-Buyer Ledger
    content = <AllTransactionsView />;
  } else if (currentRoute.startsWith('/documents') || currentRoute.startsWith('/vault') || currentRoute.startsWith('/doc-vault')) {
    // Dedicated Enterprise Document Vault
    content = <SupplierDocVault />;
  } else if (currentRoute.startsWith('/catalog') || currentRoute.startsWith('/catalog-vault')) {
    // Dedicated Catalog Items
    content = <SupplierCatalogVault />;
  } else if (currentRoute.startsWith('/onboarding/status')) {
    // Application Verification & Tracking
    content = <OnboardingStatus />;
  } else if (currentRoute.startsWith('/onboarding-wizard')) {
    // Legacy Step-by-Step Wizard
    content = <OnboardingWizard />;
  } else if (currentRoute.startsWith('/onboarding') || currentRoute.startsWith('/onboarding-request')) {
    // Dual-pane Onboarding Request with Qi Copilot Agent
    content = <OnboardingRequest />;
  } else if (currentRoute.startsWith('/orders')) {
    content = <SupplierOrders />;
  } else if (currentRoute.startsWith('/invoices')) {
    content = <SupplierInvoices />;
  } else if (currentRoute.startsWith('/early-payment')) {
    content = <SupplierEarlyPayment />;
  } else if (currentRoute.startsWith('/data-exchange')) {
    content = <SupplierCatalogVault />;
  } else if (currentRoute.startsWith('/communications') || currentRoute.startsWith('/messages')) {
    // Restored Direct Collaboration & Inquiries Center
    content = <SupplierCommunications />;
  } else if (currentRoute.startsWith('/settings')) {
    content = <SupplierProfileSettings />;
  } else {
    content = <SupplierDashboard />;
  }

  return (
    <SupplierLayout>
      {content}
    </SupplierLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <PortalProvider>
        <AppContent />
      </PortalProvider>
    </AuthProvider>
  );
};

export default App;
