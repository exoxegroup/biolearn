
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Gender } from '../types';
import { mockLogin, mockRegister, mockUpdateProfile } from '../services/mockApi';
import { Spinner } from '../components/common/Spinner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, role: UserRole, gender: Gender) => Promise<User | null>;
  updateProfile: (data: { phone: string; address: string }) => Promise<void>;
  reloadUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    const loggedInUser = await mockLogin(email);
    if (loggedInUser) {
      setUser(loggedInUser);
      sessionStorage.setItem('user', JSON.stringify(loggedInUser));
    }
    setLoading(false);
    return loggedInUser;
  };
  
  const register = async (name: string, email: string, role: UserRole, gender: Gender) => {
    setLoading(true);
    const newUser = await mockRegister(name, email, role, gender);
    // In a real app, you might auto-login or direct to login page.
    // For this mock, we don't auto-login.
    setLoading(false);
    return newUser;
  };

  const updateProfile = async (data: { phone: string; address: string }) => {
    if (!user) return;
    setLoading(true);
    const updatedUser = await mockUpdateProfile(user.id, data);
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setLoading(false);
  }

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const reloadUser = () => {
    setLoading(true);
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, register, updateProfile, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
