import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  success: string;
  showPassword: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onShowPasswordToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  loading,
  error,
  success,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onSubmit,
  onForgotPassword,
}) => {
  return (
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
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => onEmailChange(e.target.value)}
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
                onChange={e => onPasswordChange(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
              />
              <button
                type="button"
                onClick={onShowPasswordToggle}
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
            onClick={onForgotPassword}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm; 