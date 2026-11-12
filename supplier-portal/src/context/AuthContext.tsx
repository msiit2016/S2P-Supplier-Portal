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
              if (parsed && (parsed.organizationName === 'Nexura Global Analytics Inc.' || !parsed.organizationName)) {
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

    let found = demoUsers.find(
      u => u.id === userIdOrEmail || u.email.toLowerCase() === userIdOrEmail.toLowerCase()
    );

    if (!found) {
      // Dynamic fallback for any entered email
      const newUser: User = {
        id: `user-supp-${Date.now()}`,
        name: customName || userIdOrEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: userIdOrEmail,
        role: 'SUPPLIER_ADMIN',
        userType: 'SUPPLIER',
        organizationName: customOrgName || 'Acme Industrial Tech Inc.',
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
