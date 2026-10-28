import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { ApiClient } from '../api/client.js';

interface AuthContextType {
  currentUser: User | null;
  demoUsers: User[];
  switchUser: (userId: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await ApiClient.getDemoUsers();
        if (data.users && data.users.length > 0) {
          setDemoUsers(data.users);
          const saved = localStorage.getItem('active_user');
          if (saved) {
            setCurrentUser(JSON.parse(saved));
          } else {
            // Default to Marcus Vance (Buyer Reviewer)
            const defaultUser = data.users.find((u: User) => u.id === 'user-buyer-2') || data.users[0];
            setCurrentUser(defaultUser);
            localStorage.setItem('active_user', JSON.stringify(defaultUser));
          }
        }
      } catch (err) {
        console.error('Failed to load demo users', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const switchUser = (userId: string) => {
    const found = demoUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('active_user', JSON.stringify(found));
    }
  };

  const logout = () => {
    localStorage.removeItem('active_user');
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
