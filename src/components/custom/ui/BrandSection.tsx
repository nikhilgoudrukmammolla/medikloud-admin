import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

const BrandSection: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
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
    {children}
  </div>
);

export default BrandSection; 