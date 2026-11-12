import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { PortalProvider, usePortal } from './context/PortalContext.js';
import { SupplierLayout } from './components/layout/SupplierLayout.js';
import { VerisourceLogo } from './components/common/VerisourceLogo.js';

// Supplier Pages
import { SupplierLanding } from './pages/supplier/SupplierLanding.js';
import { SupplierDashboard } from './pages/supplier/SupplierDashboard.js';
import { SupplierAuth } from './pages/supplier/SupplierAuth.js';
import { SupplierMultiProfile } from './pages/supplier/SupplierMultiProfile.js';
import { AllTransactionsView } from './pages/supplier/AllTransactionsView.js';
import { OnboardingWizard } from './pages/supplier/OnboardingWizard.js';
import { OnboardingRequest } from './pages/supplier/OnboardingRequest.js';
import { OnboardingRequestsList } from './pages/supplier/OnboardingRequestsList.js';
import { OnboardingStatus } from './pages/supplier/OnboardingStatus.js';
import { SupplierOrders } from './pages/supplier/SupplierOrders.js';
import { SupplierInvoices } from './pages/supplier/SupplierInvoices.js';
import { SupplierAsns } from './pages/supplier/SupplierAsns.js';
import { SupplierDataExchange } from './pages/supplier/SupplierDataExchange.js';
import { SupplierDocVault } from './pages/supplier/SupplierDocVault.js';
import { SupplierCatalogVault } from './pages/supplier/SupplierCatalogVault.js';
import { SupplierCommunications } from './pages/supplier/SupplierCommunications.js';
import { SupplierProfileSettings } from './pages/supplier/SupplierProfileSettings.js';
import { SupplierRfps } from './pages/supplier/SupplierRfps.js';
import { SupplierTasks } from './pages/supplier/SupplierTasks.js';

const AppContent: React.FC = () => {
  const { currentRoute, navigate, routeState } = usePortal();
  const { currentUser, loading } = useAuth();

  // Redirect deprecated aliases (/early-payment to /invoices)
  React.useEffect(() => {
    if (currentRoute.startsWith('/early-payment')) {
      navigate('/invoices');
    }
  }, [currentRoute, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span>Initializing Verisource Portal...</span>
      </div>
    );
  }

  // Unauthenticated Public Routes
  if (currentRoute === '/landing') {
    return <SupplierLanding />;
  }

  // Public View-Only Supplier Profile (Access via shareable URL without requiring login)
  if (
    currentRoute.startsWith('/p/') || 
    currentRoute.startsWith('/passport/') || 
    currentRoute.startsWith('/share/') ||
    (currentRoute.startsWith('/public-profile/') && currentRoute.split('/').length > 2 && !currentUser)
  ) {
    const parts = currentRoute.split('/');
    const slug = parts[2] || 'acme-industrial-tech';
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 antialiased">
        {/* Public Global Network Navbar */}
        <header className="bg-slate-900 border-b border-slate-800 text-white select-none sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <VerisourceLogo size="sm" theme="dark" onClick={() => window.location.href = '/landing'} />
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                B2B Verified Supplier Registry
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => window.location.href = '/login'}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <SupplierMultiProfile isPublicView={true} publicSlug={slug} />
        </main>
      </div>
    );
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
  } else if (currentRoute.startsWith('/workspaces') || currentRoute.startsWith('/clients')) {
    content = <OnboardingRequestsList />;
  } else if (currentRoute.startsWith('/profiles') || currentRoute.startsWith('/public-profile') || currentRoute.startsWith('/master-profile')) {
    // Universal Master Public Profile
    content = <SupplierMultiProfile />;
  } else if (currentRoute.startsWith('/rfp') || currentRoute.startsWith('/sourcing') || currentRoute.startsWith('/bids')) {
    // Enterprise Sourcing, RFPs, RFIs & Bids (List & Detail Router)
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
    // Step-by-Step Vendor Onboarding
    content = <OnboardingWizard />;
  } else if (currentRoute === '/onboarding' || currentRoute === '/onboarding/requests' || currentRoute === '/onboarding-requests') {
    // Dedicated Onboarding Requests List Directory
    if (routeState?.autoDetail || routeState?.invitationId) {
      content = <OnboardingRequest />;
    } else {
      content = <OnboardingRequestsList />;
    }
  } else if (currentRoute.startsWith('/onboarding/detail') || currentRoute.startsWith('/onboarding-request') || currentRoute.startsWith('/onboarding/')) {
    // Dedicated Onboarding Request Details Page with multi-step questionnaire & Ava Copilot
    content = <OnboardingRequest />;
  } else if (currentRoute.startsWith('/orders') || currentRoute.startsWith('/purchase-orders')) {
    content = <SupplierOrders />;
  } else if (currentRoute.startsWith('/invoices')) {
    content = <SupplierInvoices />;
  } else if (currentRoute.startsWith('/asns') || currentRoute.startsWith('/shipping') || currentRoute.startsWith('/shipments')) {
    content = <SupplierAsns />;
  } else if (currentRoute.startsWith('/early-payment')) {
    content = <SupplierInvoices />;
  } else if (currentRoute.startsWith('/data-exchange')) {
    content = <SupplierCatalogVault />;
  } else if (currentRoute.startsWith('/communications') || currentRoute.startsWith('/messages')) {
    // Restored Direct Collaboration & Inquiries Center
    content = <SupplierCommunications />;
  } else if (currentRoute.startsWith('/settings')) {
    content = <SupplierProfileSettings />;
  } else if (currentRoute.startsWith('/tasks')) {
    content = <SupplierTasks />;
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
