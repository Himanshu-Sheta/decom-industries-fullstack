'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, ApiError } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  isAccountModalOpen: boolean;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openAccountModal: () => void;
  closeAccountModal: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    businessName?: string;
    city?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    businessName?: string | null;
    city?: string | null;
  }) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Hydrate logged-in user directly from Backend HttpOnly Cookie on mount!
  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openAccountModal = () => setIsAccountModalOpen(true);
  const closeAccountModal = () => setIsAccountModalOpen(false);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      setIsAuthModalOpen(false);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof ApiError ? err.message : 'Unable to connect to backend API.',
      };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    businessName?: string;
    city?: string;
  }) => {
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      setIsAuthModalOpen(false);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldError = err.fieldErrors
          ? Object.values(err.fieldErrors).flat()[0]
          : undefined;
        return { ok: false, error: firstFieldError || err.message };
      }
      return { ok: false, error: 'Unable to connect to backend API.' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsAccountModalOpen(false);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    businessName?: string | null;
    city?: string | null;
  }) => {
    try {
      const res = await authApi.updateProfile(data);
      setUser(res.user);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof ApiError ? err.message : 'Profile update failed.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        isAccountModalOpen,
        openAuthModal,
        closeAuthModal,
        openAccountModal,
        closeAccountModal,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
