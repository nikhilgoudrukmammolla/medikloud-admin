import React from 'react';

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...', subtext }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
      {subtext && <p className="text-gray-400 text-sm mt-2">{subtext}</p>}
    </div>
  </div>
);

export default LoadingScreen; 