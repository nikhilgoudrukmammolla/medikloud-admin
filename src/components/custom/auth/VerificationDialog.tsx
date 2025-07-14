import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { AlertCircle, Shield, Sparkles } from 'lucide-react';

interface VerificationDialogProps {
  email: string;
  loading: boolean;
  error: string;
  success: string;
  verificationSent: boolean;
  onSendVerification: () => void;
  onCompleteVerification: () => void;
  onRefreshStatus: () => void;
  onManualClaimClear: () => void;
  onCancel: () => void;
}

const VerificationDialog: React.FC<VerificationDialogProps> = ({
  email,
  loading,
  error,
  success,
  verificationSent,
  onSendVerification,
  onCompleteVerification,
  onRefreshStatus,
  onManualClaimClear,
  onCancel,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-md w-full">
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Account Verification Required
            </CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Welcome! This appears to be your first login. Please verify your email and set a new password to continue.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Email: <span className="font-mono text-blue-600">{email}</span>
              </p>
              {!verificationSent ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    We'll send you:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Email verification link</li>
                    <li>• Password reset link</li>
                  </ul>
                  <Button 
                    onClick={onSendVerification} 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {loading ? 'Sending...' : 'Send Verification Emails'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-green-600 font-medium">
                    ✅ Verification emails sent successfully!
                  </p>
                  <p className="text-sm text-gray-600">
                    Please check your inbox and:
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 text-left">
                    <li>1. Click the email verification link</li>
                    <li>2. Click the password reset link</li>
                    <li>3. Set a new password</li>
                    <li>4. Return here and click "Complete Verification"</li>
                  </ol>
                  <div className="flex gap-2">
                    <Button 
                      onClick={onCompleteVerification} 
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {loading ? 'Checking...' : 'Complete Verification'}
                    </Button>
                    <Button 
                      onClick={onSendVerification} 
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      Resend Emails
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={onRefreshStatus} 
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      {loading ? 'Refreshing...' : 'Refresh Status'}
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Reload Page
                    </Button>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">
                      If you've already completed both steps but are still stuck, try:
                    </p>
                    <Button 
                      onClick={onManualClaimClear} 
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      {loading ? 'Processing...' : 'Force Clear Password Requirement'}
                    </Button>
                  </div>
                </div>
              )}
              <Button 
                onClick={onCancel} 
                variant="outline" 
                className="w-full"
              >
                Cancel & Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationDialog; 