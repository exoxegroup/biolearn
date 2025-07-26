
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Gender } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { registerUser, loginUser, updateUserProfile, getCurrentUser } from '../../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole, gender: Gender) => Promise<User | null>;
  updateProfile: (data: { phone: string; address: string }) => Promise<void>;
  reloadUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const currentUser = await getCurrentUser(token);
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token, user: loggedInUser } = await loginUser({ email, password });
      setUser(loggedInUser);
      localStorage.setItem('authToken', token);
      return loggedInUser;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string, role: UserRole, gender: Gender) => {
    setLoading(true);
    try {
      const { token, user: newUser } = await registerUser({ name, email, password, role, gender });
      setUser(newUser);
      localStorage.setItem('authToken', token);
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { phone: string; address: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token');
      const updatedUser = await updateUserProfile(data, token);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const reloadUser = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch (error) {
        console.error('Reload user failed:', error);
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  };

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
