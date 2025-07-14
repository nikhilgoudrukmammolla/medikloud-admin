import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import LoginForm from './custom/auth/LoginForm';
import PasswordResetForm from './custom/auth/PasswordResetForm';
import VerificationDialog from './custom/auth/VerificationDialog';
import PasswordChangeForm from './custom/auth/PasswordChangeForm';
import BrandSection from './custom/ui/BrandSection';
import DemoCredentials from './custom/ui/DemoCredentials';

const Login: React.FC<{ onLoginSuccess: () => void }> = () => {
  const {
    user,
    loading,
    error,
    success,
    login,
    passwordReset,
    verificationFlow,
  } = useAuthContext();

  // Local state for login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Render password change form if needed
  if (verificationFlow.showPasswordChange) {
    return <PasswordChangeForm {...verificationFlow} />;
  }

  // Render verification dialog if needed
  if (verificationFlow.showVerificationDialog) {
    return <VerificationDialog {...verificationFlow} />;
  }

  // Render password reset form if needed
  if (passwordReset.showReset) {
    return (
      <PasswordResetForm
        resetEmail={passwordReset.resetEmail}
        loading={passwordReset.loading}
        error={passwordReset.error}
        success={passwordReset.success}
        onResetEmailChange={passwordReset.setResetEmail}
        onSubmit={passwordReset.handlePasswordReset}
        onBackToSignIn={() => passwordReset.setShowReset(false)}
      />
    );
  }

  // Default: render login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <BrandSection />
        <LoginForm
          email={email}
          password={password}
          loading={loading}
          error={error}
          success={success}
          showPassword={showPassword}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onShowPasswordToggle={() => setShowPassword((v) => !v)}
          onSubmit={e => {
            e.preventDefault();
            login(email, password);
          }}
          onForgotPassword={() => passwordReset.setShowReset(true)}
        />
        <DemoCredentials />
      </div>
    </div>
  );
};

export default Login; 