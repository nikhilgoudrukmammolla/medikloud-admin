import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { AlertCircle, Eye, EyeOff, Sparkles, Lock } from 'lucide-react';

interface PasswordChangeFormProps {
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  success: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onNewPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onShowNewPasswordToggle: () => void;
  onShowConfirmPasswordToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  newPassword,
  confirmPassword,
  loading,
  error,
  success,
  showNewPassword,
  showConfirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onShowNewPasswordToggle,
  onShowConfirmPasswordToggle,
  onSubmit,
}) => {
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
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => onNewPasswordChange(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                    className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={onShowNewPasswordToggle}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                    onChange={e => onConfirmPasswordChange(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                    className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={onShowConfirmPasswordToggle}
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
};

export default PasswordChangeForm; 