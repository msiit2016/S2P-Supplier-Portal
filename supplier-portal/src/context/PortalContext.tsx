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
  copilotViewMode: 'DOCK' | 'FLOAT' | 'FULL' | 'MINIMIZE';
  setCopilotViewMode: (mode: 'DOCK' | 'FLOAT' | 'FULL' | 'MINIMIZE') => void;
  selectedAppId: string | null;
  setSelectedAppId: (id: string | null) => void;
  selectedBuyerId: string;
  setSelectedBuyerId: (id: string) => void;
  selectedBuyerTab: string;
  setSelectedBuyerTab: (tab: string) => void;
  openBuyerWorkspace: (buyerId: string, tab?: string, threadId?: string) => void;
  unreadThreadIds: string[];
  markThreadAsRead: (threadId: string) => void;
  markThreadAsUnread: (threadId: string) => void;
  toggleThreadRead: (threadId: string) => void;
  markAllThreadsAsRead: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [portal, setPortal] = useState<PortalType>('SUPPLIER');
  const getInitialRoute = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path && path !== '/') {
        return path;
      }
      if (window.location.search.includes('view=public')) {
        return '/p/acme-industrial-tech';
      }
      if (window.location.hash) {
        return window.location.hash.replace(/^#/, '');
      }
      const saved = localStorage.getItem('active_supplier_user');
      if (saved && saved !== 'LOGGED_OUT') {
        return '/dashboard';
      }
      return '/login';
    }
    return '/login';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [routeState, setRouteState] = useState<any>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [copilotViewMode, setCopilotViewMode] = useState<'DOCK' | 'FLOAT' | 'FULL' | 'MINIMIZE'>('DOCK');
  const [selectedAppId, setSelectedAppId] = useState<string | null>('app-0042');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('ALL');
  const [selectedBuyerTab, setSelectedBuyerTab] = useState<string>('GOVERNANCE');
  const [unreadThreadIds, setUnreadThreadIds] = useState<string[]>(['po-9450', 'asn-8801', 'inv-201']);

  const normalizeThreadId = (id: string) => id.replace(/^msg-/, '');

  const markThreadAsRead = (threadId: string) => {
    const norm = normalizeThreadId(threadId);
    setUnreadThreadIds(prev => prev.filter(id => normalizeThreadId(id) !== norm));
  };

  const markThreadAsUnread = (threadId: string) => {
    const norm = normalizeThreadId(threadId);
    setUnreadThreadIds(prev => prev.map(normalizeThreadId).includes(norm) ? prev : [...prev, norm]);
  };

  const toggleThreadRead = (threadId: string) => {
    const norm = normalizeThreadId(threadId);
    setUnreadThreadIds(prev => {
      const hasIt = prev.map(normalizeThreadId).includes(norm);
      if (hasIt) {
        return prev.filter(id => normalizeThreadId(id) !== norm);
      } else {
        return [...prev, norm];
      }
    });
  };

  const markAllThreadsAsRead = () => {
    setUnreadThreadIds([]);
  };

  const openBuyerWorkspace = (buyerId: string = 'ALL', tab?: string, threadId?: string) => {
    setSelectedBuyerId(buyerId);
    if (tab) {
      setSelectedBuyerTab(tab);
    }
    const tabUpper = (tab || '').toUpperCase();
    if (tabUpper === 'ORDERS' || tabUpper === 'PO') {
      navigate('/orders', { buyerId, buyerOrgId: buyerId });
    } else if (tabUpper === 'INVOICES' || tabUpper === 'INVOICE') {
      navigate('/invoices', { buyerId, buyerOrgId: buyerId });
    } else if (tabUpper === 'ASN' || tabUpper === 'SHIPPING') {
      navigate('/asns', { buyerId, buyerOrgId: buyerId });
    } else if (tabUpper === 'MESSAGES') {
      navigate('/communications', { buyerId, buyerOrgId: buyerId, threadId });
    } else if (tabUpper === 'ONBOARDING') {
      navigate('/onboarding/detail', { buyerId, buyerOrgId: buyerId });
    } else {
      navigate('/orders', { buyerId, buyerOrgId: buyerId, tab: tab || selectedBuyerTab, threadId });
    }
  };

  // Listen to popstate (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname || '/dashboard';
        setCurrentRoute(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync portal mode automatically when user switches, keeping public links intact
  useEffect(() => {
    if (currentUser) {
      const isPublicLink = currentRoute.startsWith('/p/') || currentRoute.startsWith('/passport/');
      if (!isPublicLink) {
        if (currentUser.userType === 'SUPPLIER' && portal !== 'SUPPLIER') {
          setPortal('SUPPLIER');
        } else if (currentUser.userType === 'BUYER' && portal !== 'BUYER') {
          setPortal('BUYER');
        }
      }
    }
  }, [currentUser]);

  const navigate = (path: string, state?: any) => {
    const isSameRoute = currentRoute === path;
    setCurrentRoute(path);
    setRouteState(state || null);
    // Reset global selectedBuyerId when navigating to general pages without explicit buyer filter state
    if (!state?.buyerOrgId && !state?.buyerId) {
      setSelectedBuyerId('ALL');
    }
    if (typeof window !== 'undefined' && window.history) {
      try {
        window.history.pushState(state || {}, '', path);
      } catch (e) {
        // Ignore in restricted environments
      }
    }

    // Scroll reset: Ensure window and all primary scrollable containers reset to top (0, 0)
    if (typeof document !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: isSameRoute ? 'smooth' : 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const scrollTargets = document.querySelectorAll<HTMLElement>('main, #main-scroll-container, [data-scroll-container]');
      scrollTargets.forEach((el) => {
        if (isSameRoute) {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollTop = 0;
        }
      });

      // Secondary check on next animation frame after component re-renders
      requestAnimationFrame(() => {
        scrollTargets.forEach((el) => {
          if (!isSameRoute) {
            el.scrollTop = 0;
          }
        });
        window.scrollTo(0, 0);
      });
    }
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
        copilotViewMode,
        setCopilotViewMode,
        selectedAppId,
        setSelectedAppId,
        selectedBuyerId,
        setSelectedBuyerId,
        selectedBuyerTab,
        setSelectedBuyerTab,
        openBuyerWorkspace,
        unreadThreadIds,
        markThreadAsRead,
        markThreadAsUnread,
        toggleThreadRead,
        markAllThreadsAsRead
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
