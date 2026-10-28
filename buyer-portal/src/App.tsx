import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { PortalProvider, usePortal } from './context/PortalContext.js';
import { BuyerLayout } from './components/layout/BuyerLayout.js';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard.js';
import { ApplicationDetail } from './pages/buyer/ApplicationDetail.js';
import { ApplicationReviewWorkspace } from './pages/buyer/ApplicationReviewWorkspace.js';
import { CreateSupplierModal } from './pages/buyer/CreateSupplierModal.js';
import { EmailIntakeQueue } from './pages/buyer/EmailIntakeQueue.js';
import { SuppliersList } from './pages/buyer/SuppliersList.js';
import { ReviewQueue } from './pages/buyer/ReviewQueue.js';
import { AuditLogViewer } from './pages/buyer/AuditLogViewer.js';
import { UsersManagement } from './pages/buyer/UsersManagement.js';
import { BuyerSettings } from './pages/buyer/BuyerSettings.js';
import { BuyerOrders } from './pages/buyer/BuyerOrders.js';
import { BuyerInvoices } from './pages/buyer/BuyerInvoices.js';

const BuyerAppContent: React.FC = () => {
  const { currentRoute, navigate, selectedAppId, setSelectedAppId } = usePortal();
  const [createSupplierOpen, setCreateSupplierOpen] = useState(false);

  const handleSupplierCreated = (newApp: any) => {
    setSelectedAppId(newApp.id);
    navigate(`/supplier-applications/${newApp.id}`);
  };

  let content: React.ReactNode = null;

  if (currentRoute === '/dashboard' || currentRoute === '/' || currentRoute === '/supplier-applications') {
    content = <BuyerDashboard onCreateSupplierClick={() => setCreateSupplierOpen(true)} />;
  } else if (currentRoute.includes('/review')) {
    const appId = selectedAppId || 'app-0042';
    content = <ApplicationReviewWorkspace applicationId={appId} />;
  } else if (currentRoute.startsWith('/supplier-applications/')) {
    const parts = currentRoute.split('/');
    const appId = parts[2] || selectedAppId || 'app-0042';
    content = <ApplicationDetail applicationId={appId} />;
  } else if (currentRoute === '/suppliers') {
    content = <SuppliersList onCreateSupplierClick={() => setCreateSupplierOpen(true)} />;
  } else if (currentRoute === '/email-intake') {
    content = <EmailIntakeQueue />;
  } else if (currentRoute === '/review-queue') {
    content = <ReviewQueue />;
  } else if (currentRoute === '/orders') {
    content = <BuyerOrders />;
  } else if (currentRoute === '/invoices') {
    content = <BuyerInvoices />;
  } else if (currentRoute === '/audit-log') {
    content = <AuditLogViewer />;
  } else if (currentRoute === '/users') {
    content = <UsersManagement />;
  } else if (currentRoute === '/settings') {
    content = <BuyerSettings />;
  } else {
    content = <BuyerDashboard onCreateSupplierClick={() => setCreateSupplierOpen(true)} />;
  }

  return (
    <BuyerLayout onCreateSupplierClick={() => setCreateSupplierOpen(true)}>
      {content}
      <CreateSupplierModal
        isOpen={createSupplierOpen}
        onClose={() => setCreateSupplierOpen(false)}
        onCreated={handleSupplierCreated}
      />
    </BuyerLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <PortalProvider>
        <BuyerAppContent />
      </PortalProvider>
    </AuthProvider>
  );
};

export default App;
