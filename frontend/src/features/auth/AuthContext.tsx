import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/user';
import { getCurrentUser } from '../../api/users';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../../api/auth';
import { getAccessToken } from '../../api/client';
import type { LoginRequest, RegisterRequest } from '../../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    await apiLogin(data);
    const userData = await getCurrentUser();
    setUser(userData);
    if (!userData.onboarding?.is_completed) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
  };

  const register = async (data: RegisterRequest) => {
    await apiRegister(data);
    const userData = await getCurrentUser();
    setUser(userData);
    navigate('/onboarding');
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
