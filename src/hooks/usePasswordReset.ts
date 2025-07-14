import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function usePasswordReset() {
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess('Password reset email sent! Please check your inbox.');
      setResetEmail('');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'Failed to send password reset email.');
      else setError('Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return {
    resetEmail,
    setResetEmail,
    loading,
    error,
    success,
    handlePasswordReset,
    setError,
    setSuccess,
    showReset,
    setShowReset,
  };
} 