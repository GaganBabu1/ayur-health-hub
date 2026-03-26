import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { authService, User as AuthServiceUser, SignupData as AuthSignupData } from '@/services/authService';

export type UserRole = 'patient' | 'admin' | 'doctor';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  lifestyle?: string;
  sleepQuality?: number;
  diseaseHistory?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  lifestyle?: string;
  sleepQuality?: number;
  diseaseHistory?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Convert backend User format to component User format
 */
const convertBackendUser = (backendUser: AuthServiceUser): User => {
  return {
    id: backendUser._id,
    _id: backendUser._id,
    name: backendUser.name,
    email: backendUser.email,
    role: backendUser.role as UserRole,
    age: backendUser.age,
    gender: backendUser.gender,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(convertBackendUser(currentUser));
      }
    } catch (err) {
      console.error('Failed to load user from storage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backendUser = await authService.login({ email, password });
      const convertedUser = convertBackendUser(backendUser);
      setUser(convertedUser);
      return { success: true, message: 'Login successful!' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const signupPayload: AuthSignupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: (data.role || 'patient') as 'patient' | 'doctor',
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        lifestyle: data.lifestyle,
        sleepQuality: data.sleepQuality,
        diseaseHistory: data.diseaseHistory,
      };

      const backendUser = await authService.register(signupPayload);
      const convertedUser = convertBackendUser(backendUser);
      setUser(convertedUser);
      return { success: true, message: 'Account created successfully!' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
