import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { AlertCircle, Eye, EyeOff, Shield, Sparkles, Lock } from 'lucide-react';
import { validatePassword, getPasswordStrengthText, getPasswordStrengthColor } from '../lib/passwordUtils';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Force password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userBlocked, setUserBlocked] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [showResetCard, setShowResetCard] = useState(false);
  const [resetCardEmail, setResetCardEmail] = useState('');
  const [resetCardSent, setResetCardSent] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUserBlocked(false);
    setNotAuthorized(false);
    setShowResetCard(false);
    setResetCardSent(false);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Always force refresh to get latest claims
      const idTokenResult = await user.getIdTokenResult(true);
      const claims = idTokenResult.claims;
      console.log('User claims after login:', claims);

      // Block 'user' role and any non-admin/agent/superAdmin
      if (claims.role === 'user' || !['admin', 'superAdmin', 'agent'].includes(claims.role)) {
        await signOut(auth);
        setNotAuthorized(true);
        setLoading(false);
        setUserBlocked(true);
        setError('You are not authorized to sign in. Try authorized credentials.');
        return;
      }

      // If forcePasswordChange is true, attempt to clear it if the user just reset their password
      if (claims.forcePasswordChange) {
        console.log('forcePasswordChange detected after login, attempting to clear...');
        // Call backend to clear the forcePasswordChange claim
        const token = await user.getIdToken();
        const clearRes = await fetch(`${API_URL}/users/clear-force-password-change`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({})
        });
        if (clearRes.ok) {
          // Force refresh token and check claims again
          await user.getIdToken(true);
          const refreshedClaims = (await user.getIdTokenResult(true)).claims;
          console.log('Claims after clearing forcePasswordChange:', refreshedClaims);
          if (!refreshedClaims.forcePasswordChange) {
            // Record login event
            try {
              const token2 = await user.getIdToken();
              await fetch(`${API_URL}/record-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
                body: JSON.stringify({})
              });
            } catch (err) {
              console.warn('Failed to record login event:', err);
            }
            onLoginSuccess();
            setLoading(false);
            return;
          }
        }
        // If claim is still present, force password reset
        await sendPasswordResetEmail(auth, email);
        await signOut(auth);
        setShowResetCard(true);
        setResetCardEmail(email);
        setLoading(false);
        setError('You must reset your password before accessing the dashboard. Check your email for a reset link.');
        return;
      }

      // Record login event
      try {
        const token = await user.getIdToken();
        await fetch(`${API_URL}/record-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({})
        });
      } catch (err) {
        console.warn('Failed to record login event:', err);
      }

      // Proceed to dashboard
      onLoginSuccess();
    } catch (error: any) {
      setError('Invalid credentials or you are not authorized to sign in. Try authorized credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced password change handler: after password reset, force refresh token and clear claim if needed
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.feedback.join('. '));
      setLoading(false);
      return;
    }
    try {
      // Update password in Firebase
      await updatePassword(currentUser, newPassword);
      // Force refresh token to get updated claims
      await currentUser.getIdToken(true);
      // Check if forcePasswordChange is still present
      const refreshedTokenResult = await currentUser.getIdTokenResult(true);
      console.log('Claims after password change:', refreshedTokenResult.claims);
      if (refreshedTokenResult.claims.forcePasswordChange) {
        // Call backend to clear the forcePasswordChange claim
        const token = await currentUser.getIdToken();
        await fetch(`${API_URL}/users/clear-force-password-change`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({})
        });
        // Force refresh token again
        await currentUser.getIdToken(true);
      }
      setSuccess('Password changed successfully!');
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, resetEmail || email);
      setSuccess('Password reset email sent! Please check your inbox.');
      setShowReset(false);
      setResetEmail('');
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetCard = async () => {
    setLoading(true);
    setResetCardSent(false);
    setError('');
    try {
      await sendPasswordResetEmail(auth, resetCardEmail);
      setResetCardSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // If showing password change form
  if (showPasswordChange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Change Password Required
            </h1>
            <p className="text-gray-600 mt-2">You must change your password before continuing</p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Set New Password
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Create a strong password for your account
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-3 p-4 text-sm border border-red-200 bg-red-50 text-red-700 rounded-xl">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-3 p-4 text-sm border border-green-200 bg-green-50 text-green-700 rounded-xl">
                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
                
                                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        disabled={loading}
                        className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${getPasswordStrengthColor(validatePassword(newPassword).score)}`}>
                            {getPasswordStrengthText(validatePassword(newPassword).score)}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6].map((level) => (
                              <div
                                key={level}
                                className={`h-1 w-4 rounded-full ${
                                  validatePassword(newPassword).score >= level
                                    ? getPasswordStrengthColor(validatePassword(newPassword).score).replace('text-', 'bg-')
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {validatePassword(newPassword).feedback.length > 0 && (
                          <ul className="text-xs text-gray-600 space-y-1">
                            {validatePassword(newPassword).feedback.map((feedback, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-red-500 mt-0.5">•</span>
                                {feedback}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                      className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Changing Password...
                    </div>
                  ) : (
                    'Change Password & Continue'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Regular login form
  if (userBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-md w-full">
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold text-gray-800">
                User Logins Disabled
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">
                User logins are temporarily disabled. Please contact your administrator for access or support.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <Button className="mt-4" onClick={() => window.location.reload()}>Back to Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (notAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-md w-full">
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Not Authorized
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">
                You are not authorized to sign in. Please use authorized credentials.<br />
                If you believe this is an error, contact your administrator.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Button className="mt-4" onClick={() => window.location.reload()}>Back to Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  if (showResetCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-md w-full">
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Reset Password Required
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">
                For your security, you must reset your password before signing in for the first time.<br />
                Click the button below to receive a password reset link at <span className="font-mono">{resetCardEmail}</span>.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {resetCardSent ? (
                <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-4">
                  A password reset link has been sent to your email.<br />
                  Please check your inbox, verify your email, and set a new password to continue.
                </div>
              ) : (
                <Button className="mt-4" onClick={handleResetCard} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Password Reset Email'}
                </Button>
              )}
              <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
                Back to Login
              </Button>
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MediKloud Admin
          </h1>
          <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Secure Admin Portal
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Sign in to access your admin dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {showReset ? (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-3 p-4 text-sm border border-red-200 bg-red-50 text-red-700 rounded-xl">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-3 p-4 text-sm border border-green-200 bg-green-50 text-green-700 rounded-xl">
                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="resetEmail" className="text-sm font-medium text-gray-700">
                    Enter your email address
                  </label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Password Reset Email'}
                </Button>
                <div className="text-center">
                  <button type="button" className="text-blue-600 hover:underline text-sm mt-2" onClick={() => { setShowReset(false); setError(''); setSuccess(''); }} disabled={loading}>
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-3 p-4 text-sm border border-red-200 bg-red-50 text-red-700 rounded-xl">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-3 p-4 text-sm border border-green-200 bg-green-50 text-green-700 rounded-xl">
                      <Sparkles className="w-5 h-5 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@medikloud.com"
                        required
                        disabled={loading}
                        className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                        className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </Button>
                </form>

                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => { setShowReset(true); setError(''); setSuccess(''); }}
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Demo credentials hint */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-2">Demo Credentials:</p>
                  <p className="text-xs text-blue-600">
                    Email: <span className="font-mono">admin@medikloud.com</span>
                  </p>
                  <p className="text-xs text-blue-600">
                    Password: <span className="font-mono">Admin123!</span>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Secure access to MediKloud prescription management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 