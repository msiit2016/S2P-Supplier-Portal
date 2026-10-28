import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.js';

export type PortalType = 'BUYER' | 'SUPPLIER';

interface PortalContextType {
  portal: PortalType;
  setPortal: (p: PortalType) => void;
  currentRoute: string;
  navigate: (path: string, state?: any) => void;
  routeState: any;
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  toggleAiDrawer: () => void;
  selectedAppId: string | null;
  setSelectedAppId: (id: string | null) => void;
  selectedBuyerId: string;
  setSelectedBuyerId: (id: string) => void;
  selectedBuyerTab: string;
  setSelectedBuyerTab: (tab: string) => void;
  openBuyerWorkspace: (buyerId: string, tab?: string) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [portal, setPortal] = useState<PortalType>('SUPPLIER');
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');
  const [routeState, setRouteState] = useState<any>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>('app-0042');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('ALL');
  const [selectedBuyerTab, setSelectedBuyerTab] = useState<string>('ONBOARDING');

  const openBuyerWorkspace = (buyerId: string = 'ALL', tab?: string) => {
    setSelectedBuyerId(buyerId);
    if (tab) {
      setSelectedBuyerTab(tab);
    }
    navigate('/workspaces', { buyerId, tab: tab || selectedBuyerTab });
  };

  // Sync portal mode automatically when user switches
  useEffect(() => {
    if (currentUser) {
      if (currentUser.userType === 'SUPPLIER' && portal !== 'SUPPLIER') {
        setPortal('SUPPLIER');
        setCurrentRoute('/dashboard');
      } else if (currentUser.userType === 'BUYER' && portal !== 'BUYER') {
        setPortal('BUYER');
        setCurrentRoute('/dashboard');
      }
    }
  }, [currentUser]);

  const navigate = (path: string, state?: any) => {
    setCurrentRoute(path);
    setRouteState(state || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAiDrawer = () => setAiDrawerOpen(prev => !prev);

  return (
    <PortalContext.Provider
      value={{
        portal,
        setPortal,
        currentRoute,
        navigate,
        routeState,
        aiDrawerOpen,
        setAiDrawerOpen,
        toggleAiDrawer,
        selectedAppId,
        setSelectedAppId,
        selectedBuyerId,
        setSelectedBuyerId,
        selectedBuyerTab,
        setSelectedBuyerTab,
        openBuyerWorkspace
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
