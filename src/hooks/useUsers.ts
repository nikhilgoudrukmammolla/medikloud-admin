import { useState } from 'react';
import { getAuth } from 'firebase/auth';

export interface User {
  uid: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
  emailVerified?: boolean;
  forcePasswordChange?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = getAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: User[] = await res.json();
      setUsers(data.map((u: User) => ({
        ...u,
        name: (u as any).displayName || '',
        phone: (u as any).phoneNumber || '',
      })));
    } catch (err: unknown) {
      if (err instanceof Error) setError('Failed to fetch users.');
      else setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    setLoading(true);
    setError('');
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/users/${uid}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      setUsers((prev) => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (err: unknown) {
      if (err instanceof Error) setError('Failed to update role.');
      else setError('Failed to update role.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    setLoading(true);
    setError('');
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/users/${uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter(u => u.uid !== uid));
    } catch (err: unknown) {
      if (err instanceof Error) setError('Failed to delete user.');
      else setError('Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    handleRoleChange,
    handleDeleteUser,
    setUsers,
  };
} 