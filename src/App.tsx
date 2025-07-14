import { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';
import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Helper to refresh user and role after login or claim change
  const refreshUserAndRole = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Always force refresh to get latest claims
      const tokenResult = await currentUser.getIdTokenResult(true);
      const roleClaim = typeof tokenResult.claims.role === 'string' ? tokenResult.claims.role : null;
      const forcePasswordChange = (tokenResult.claims.forcePasswordChange as boolean) || false;
      const emailVerified = currentUser.emailVerified;
      const isDemo = (tokenResult.claims.isDemo as boolean) || false;
      // Check if user needs verification (skip for demo accounts)
      const userNeedsVerification = (forcePasswordChange || !emailVerified) && !isDemo;
      setUser(currentUser);
      setRole(roleClaim);
      setNeedsVerification(userNeedsVerification);
    } else {
      setUser(null);
      setRole(null);
      setNeedsVerification(false);
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
        const forcePasswordChange = (tokenResult.claims.forcePasswordChange as boolean) || false;
        const emailVerified = firebaseUser.emailVerified;
        const isDemo = (tokenResult.claims.isDemo as boolean) || false;
        // Check if user needs verification (skip for demo accounts)
        const userNeedsVerification = (forcePasswordChange || !emailVerified) && !isDemo;
        setUser(firebaseUser);
        setRole(roleClaim);
        setNeedsVerification(userNeedsVerification);
      } else {
        setUser(null);
        setRole(null);
        setNeedsVerification(false);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) {
    return <div className='justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden'>Loading <Loader2/></div>;
  }

  return (
    <div className="text-white p-4">
      {!user || needsVerification ? (
        <AuthProvider onLoginSuccess={refreshUserAndRole}>
          <Login onLoginSuccess={refreshUserAndRole} />
        </AuthProvider>
      ) : (
        <DashboardProvider user={user} role={role || ''}>
          <AuthGuard onLogout={() => setUser(null)}>
            <Dashboard />
          </AuthGuard>
        </DashboardProvider>
      )}
    </div>
  );
}

export default App;
