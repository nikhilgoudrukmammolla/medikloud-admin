import { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';

function App() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // Helper to refresh user and role after login or claim change
  const refreshUserAndRole = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Always force refresh to get latest claims
      const tokenResult = await currentUser.getIdTokenResult(true);
      const roleClaim = typeof tokenResult.claims.role === 'string' ? tokenResult.claims.role : null;
      setUser(currentUser);
      setRole(roleClaim);
    } else {
      setUser(null);
      setRole(null);
    }
    setChecking(false);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Always force refresh to get latest claims
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const roleClaim = typeof tokenResult.claims.role === 'string' ? tokenResult.claims.role : null;
        setUser(firebaseUser);
        setRole(roleClaim);
      } else {
        setUser(null);
        setRole(null);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) {
    return <div>Loading...</div>;
  }

  return (
    <div className="text-white p-4">
      {!user ? (
        <Login onLoginSuccess={refreshUserAndRole} />
      ) : (
        <AuthGuard onLogout={() => setUser(null)}>
          <Dashboard user={user} role={role || ''} />
        </AuthGuard>
      )}
    </div>
  );
}

export default App;
