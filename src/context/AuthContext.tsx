import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { useVerificationFlow } from '../hooks/useVerificationFlow';

interface AuthContextValue {
  user: any; // Replace with your User type if available
  loading: boolean;
  error: string;
  success: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
  setError: (err: string) => void;
  setSuccess: (msg: string) => void;
  passwordReset: ReturnType<typeof usePasswordReset>;
  verificationFlow: ReturnType<typeof useVerificationFlow>;
}

interface AuthProviderProps {
  apiUrl?: string;
  onLoginSuccess: () => void;
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ apiUrl = '', onLoginSuccess, children }) => {
  const authState = useAuth();
  const passwordResetState = usePasswordReset();
  const verificationFlowState = useVerificationFlow(apiUrl, onLoginSuccess);

  const value: AuthContextValue = {
    ...authState,
    passwordReset: passwordResetState,
    verificationFlow: verificationFlowState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}; 