'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  demoLogin: () => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  demoLogin: async () => false,
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('defi_token');
        const storedUser = localStorage.getItem('defi_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          try {
            const res = await api.getMe();
            if (res.success && res.user) {
              setUser(res.user);
              localStorage.setItem('defi_user', JSON.stringify(res.user));
            }
          } catch (e) {
            // Token might be expired, fallback to demo session
            await triggerDemoLogin();
          }
        } else {
          // Auto-initiate Demo Institutional Treasury session for seamless first-visit experience
          await triggerDemoLogin();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const triggerDemoLogin = async (): Promise<boolean> => {
    try {
      const res = await api.demoLogin();
      if (res.success && res.token) {
        localStorage.setItem('defi_token', res.token);
        localStorage.setItem('defi_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Demo login API unreachable, using local fallback demo state:', e);
      const fallbackUser: User = {
        id: 'demo_user_001',
        name: 'Sarah Lin (Chief Risk Officer)',
        email: 'treasury@horizoncapital.fi',
        role: 'institutional_treasurer',
        organization: 'Horizon Capital DAO Treasury',
        riskTolerance: 'Balanced',
        preferredChains: ['Ethereum', 'Arbitrum', 'Polygon'],
        portfolioStats: {
          totalInvested: 250000,
          currentValue: 268420,
          earnedYield: 18420,
          weightedApy: 7.35,
          averageRiskScore: 84,
        },
      };
      setUser(fallbackUser);
      setToken('demo_mock_token');
      return true;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('defi_token', res.token);
        localStorage.setItem('defi_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return true;
      }
      return false;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Login failed.');
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        localStorage.setItem('defi_token', res.token);
        localStorage.setItem('defi_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return true;
      }
      return false;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('defi_token');
    localStorage.removeItem('defi_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('defi_user', JSON.stringify(res.user));
      }
    } catch (e) {
      console.warn('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin: triggerDemoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
