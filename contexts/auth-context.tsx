'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '@/services/auth.service';
import { LoginPayload, RegisterPayload, Role, User } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  demoLogin: (role: Role) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      try {
        const currentUser = await authService.getMe();
        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const loggedInUser = await authService.login(payload);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const demoLogin = useCallback(async (role: Role): Promise<User> => {
    const loggedInUser = await authService.demoLogin(role);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const registeredUser = await authService.register(payload);
      setUser(registeredUser);
      return registeredUser;
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      demoLogin,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, demoLogin, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

