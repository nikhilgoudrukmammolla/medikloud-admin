import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { AlertCircle, Sparkles } from 'lucide-react';

interface PasswordResetFormProps {
  resetEmail: string;
  loading: boolean;
  error: string;
  success: string;
  onResetEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToSignIn: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  resetEmail,
  loading,
  error,
  success,
  onResetEmailChange,
  onSubmit,
  onBackToSignIn,
}) => {
  return (
    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Reset Password
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Enter your email to receive a password reset link
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
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
              onChange={e => onResetEmailChange(e.target.value)}
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
            <button type="button" className="text-blue-600 hover:underline text-sm mt-2" onClick={onBackToSignIn} disabled={loading}>
              Back to Sign In
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordResetForm; 