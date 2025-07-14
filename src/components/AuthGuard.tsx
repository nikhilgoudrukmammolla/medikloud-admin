import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from './ui/button';
import { LogOut, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AuthGuardProps {
  children: React.ReactNode;
  onLogout: () => void;
}

// --- Confirmation Dialog Component (copied from Dashboard for reuse) ---
interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ConfirmationDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, onLogout }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Force refresh the token to get the latest claims
          const tokenResult = await user.getIdTokenResult(true);
          const userRole = (tokenResult.claims.role as string) || null;
          
          console.log('[AUTHGUARD] User authenticated:', {
            uid: user.uid,
            email: user.email,
            role: userRole
          });
          
          setRole(userRole);
        } catch (error) {
          console.error('[AUTHGUARD] Error getting user claims:', error);
          setRole(null);
        }
      } else {
        console.log('[AUTHGUARD] No user');
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('[AUTHGUARD] Logout error:', error);
    } finally {
      setLogoutLoading(false);
      setShowLogoutDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl text-gray-800">Authentication Required</CardTitle>
            <p className="text-gray-600">Please sign in to access the admin dashboard</p>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl text-gray-800">Access Denied</CardTitle>
            <p className="text-gray-600">
              Your account does not have a valid role. Please contact your administrator.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Admin Header with Logout */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-gray-200/50">
          <div className="text-sm text-gray-600">
            Signed in as: <span className="font-medium text-gray-800">{user.email}</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{role}</span>
          </div>
          <Button 
            onClick={() => setShowLogoutDialog(true)} 
            variant="outline" 
            size="sm"
            className="bg-slate-200 text-black  hover:bg-gray-50 border-gray-200 hover:border-gray-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {React.cloneElement(children as React.ReactElement<any>, { user, role })}
      <ConfirmationDialog
        open={showLogoutDialog}
        title="Logout?"
        description="Are you sure you want to log out? You will need to sign in again to access the dashboard."
        confirmText="Logout"
        cancelText="Cancel"
        loading={logoutLoading}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default AuthGuard; 