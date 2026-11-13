import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { ApiClient } from '../api/client.js';

const DEFAULT_DEMO_USERS: User[] = [
  {
    id: 'user-supp-acme',
    name: 'Elena Rostova',
    email: 'elena@acmeindustrial.com',
    role: 'SUPPLIER_ADMIN',
    userType: 'SUPPLIER',
    organizationName: 'Acme Industrial Tech Inc.',
    organizationId: 'supp-org-1',
    isEmailVerified: true
  },
  {
    id: 'user-supp-1',
    name: 'Jason Miller',
    email: 'j.miller@acmeindustrial.com',
    role: 'SUPPLIER_ADMIN',
    userType: 'SUPPLIER',
    organizationName: 'Acme Industrial Tech Inc.',
    organizationId: 'supp-org-1',
    isEmailVerified: true
  },
  {
    id: 'user-supp-2',
    name: 'David Reynolds',
    email: 'operations@vanguardfreight.com',
    role: 'SUPPLIER_ADMIN',
    userType: 'SUPPLIER',
    organizationName: 'Vanguard Freight Logistics LLC',
    organizationId: 'supp-org-2',
    isEmailVerified: true
  }
];

interface AuthContextType {
  currentUser: User | null;
  demoUsers: User[];
  switchUser: (userIdOrEmail: string, customOrgName?: string, customName?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>(DEFAULT_DEMO_USERS);
  const [loading, setLoading] = useState<boolean>(true);

  // Helpers to persist a registry of registered supplier users (email -> { orgName, name })
  const getRegisteredUsers = (): Record<string, { organizationName: string; name: string }> => {
    try {
      const raw = localStorage.getItem('verisource_registered_users');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveRegisteredUser = (email: string, organizationName: string, name: string) => {
    try {
      const registry = getRegisteredUsers();
      registry[email.toLowerCase()] = { organizationName, name };
      localStorage.setItem('verisource_registered_users', JSON.stringify(registry));
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      try {
        const data = await ApiClient.getDemoUsers();
        if (data?.users && data.users.length > 0) {
          // Merge with DEFAULT_DEMO_USERS, ensuring Elena Rostova / Acme is first
          const combined = [
            DEFAULT_DEMO_USERS[0],
            ...data.users.filter((u: User) => u.email !== DEFAULT_DEMO_USERS[0].email)
          ];
          setDemoUsers(combined);

          const saved = localStorage.getItem('active_supplier_user');
          if (saved === 'LOGGED_OUT') {
            setCurrentUser(null);
          } else if (saved) {
            try {
              const parsed = JSON.parse(saved);
              // Only fall back to Acme for the specific "Nexura" placeholder, never for real registered suppliers
              if (parsed && parsed.organizationName === 'Nexura Global Analytics Inc.') {
                parsed.organizationName = 'Acme Industrial Tech Inc.';
                localStorage.setItem('active_supplier_user', JSON.stringify(parsed));
              }
              setCurrentUser(parsed);
            } catch {
              setCurrentUser(combined[0]);
            }
          } else {
            // First time visit: start unauthenticated so user sees the login/signup page
            setCurrentUser(null);
          }
        } else {
          const saved = localStorage.getItem('active_supplier_user');
          if (saved && saved !== 'LOGGED_OUT') {
            try {
              setCurrentUser(JSON.parse(saved));
            } catch {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.warn('Using default demo users (offline fallback)', err);
        const saved = localStorage.getItem('active_supplier_user');
        if (saved && saved !== 'LOGGED_OUT') {
          try {
            setCurrentUser(JSON.parse(saved));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const switchUser = (userIdOrEmail: string, customOrgName?: string, customName?: string) => {
    if (userIdOrEmail === 'user-supp-acme' || userIdOrEmail === 'elena@acmeindustrial.com') {
      localStorage.removeItem('is_new_registration');
      localStorage.removeItem('verisource_master_profile');
    }

    // If this is a new registration with org info, persist it in the registry
    if (customOrgName && customName) {
      saveRegisteredUser(userIdOrEmail, customOrgName, customName);
    }

    let found = demoUsers.find(
      u => u.id === userIdOrEmail || u.email.toLowerCase() === userIdOrEmail.toLowerCase()
    );

    if (!found) {
      // For logins without explicit org info, look up from the registry first
      const registry = getRegisteredUsers();
      const registeredEntry = registry[userIdOrEmail.toLowerCase()];
      const resolvedOrg = customOrgName || registeredEntry?.organizationName;
      const resolvedName = customName || registeredEntry?.name;

      const newUser: User = {
        id: `user-supp-${Date.now()}`,
        name: resolvedName || userIdOrEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: userIdOrEmail,
        role: 'SUPPLIER_ADMIN',
        userType: 'SUPPLIER',
        organizationName: resolvedOrg || 'Verified Supplier',
        organizationId: `supp-org-${Date.now()}`,
        isEmailVerified: true
      };
      found = newUser;
      setDemoUsers(prev => [newUser, ...prev]);
    } else if (customOrgName || customName) {
      found = {
        ...found,
        ...(customOrgName ? { organizationName: customOrgName } : {}),
        ...(customName ? { name: customName } : {})
      };
    } else {
      // Existing demo user logging in — check registry for updated org name
      const registry = getRegisteredUsers();
      const registeredEntry = registry[userIdOrEmail.toLowerCase()];
      if (registeredEntry) {
        found = { ...found, organizationName: registeredEntry.organizationName, name: registeredEntry.name };
      }
    }

    const activeUser = found || DEFAULT_DEMO_USERS[0];
    setCurrentUser(activeUser);
    localStorage.setItem('active_supplier_user', JSON.stringify(activeUser));
  };

  const logout = () => {
    localStorage.setItem('active_supplier_user', 'LOGGED_OUT');
    localStorage.removeItem('is_new_registration');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, demoUsers, switchUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
