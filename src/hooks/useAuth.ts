import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<any>(null); // Use your own User type if available
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setSuccess('Login successful!');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'Login failed.');
      else setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError('');
    try {
      await signOut(auth);
      setUser(null);
      setSuccess('Logged out successfully.');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'Logout failed.');
      else setError('Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    success,
    login,
    logout,
    setUser,
    setError,
    setSuccess,
  };
} 