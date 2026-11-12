import React from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { SupplierRfpsList } from './SupplierRfpsList.js';
import { SupplierRfpDetail } from './SupplierRfpDetail.js';

export * from '../../services/rfpService.js';

/**
 * Unified RFP Sourcing Router:
 * - Directs to Proposal & Bid Studio Detail Page when viewing a specific event
 * - Directs to RFPs & Bids Directory List View otherwise
 */
export const SupplierRfps: React.FC = () => {
  const { currentRoute, routeState } = usePortal();

  const isDetailView = 
    currentRoute.startsWith('/rfps/detail') || 
    currentRoute.startsWith('/rfp/') ||
    Boolean(routeState?.autoDetail || routeState?.eventId || routeState?.eventNumber);

  if (isDetailView) {
    return <SupplierRfpDetail />;
  }

  return <SupplierRfpsList />;
};
