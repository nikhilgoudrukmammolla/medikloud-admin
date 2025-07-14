import { useState } from 'react';
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useVerificationFlow(API_URL: string, onLoginSuccess: () => void) {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [userForVerification, setUserForVerification] = useState<null | { sendEmailVerification: () => Promise<void> }>(null);
  const [emailSendCount, setEmailSendCount] = useState(0);
  const [lastEmailSendTime, setLastEmailSendTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Example: handleSendVerification
  const handleSendVerification = async () => {
    if (!userForVerification) return;
    const now = Date.now();
    const timeSinceLastSend = now - lastEmailSendTime;
    const maxEmails = 3;
    const timeWindow = 5 * 60 * 1000;
    if (emailSendCount >= maxEmails && timeSinceLastSend < timeWindow) {
      const remainingTime = Math.ceil((timeWindow - timeSinceLastSend) / 1000 / 60);
      setError(`Too many email requests. Please wait ${remainingTime} minutes before trying again.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await userForVerification.sendEmailVerification();
      await sendPasswordResetEmail(auth, verificationEmail);
      setEmailSendCount(prev => prev + 1);
      setLastEmailSendTime(now);
      setVerificationSent(true);
      setSuccess('Verification and password reset emails sent! Please check your inbox.');
    } catch (err: unknown) {
      setError('Failed to send verification emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    showVerificationDialog,
    setShowVerificationDialog,
    verificationEmail,
    setVerificationEmail,
    verificationSent,
    setVerificationSent,
    userForVerification,
    setUserForVerification,
    emailSendCount,
    setEmailSendCount,
    lastEmailSendTime,
    setLastEmailSendTime,
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    showPasswordChange,
    setShowPasswordChange,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSendVerification,
    // ...other handlers
  };
} 