import React from 'react';

const DemoCredentials: React.FC = () => (
  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
    <p className="text-xs text-blue-700 font-medium mb-2">Demo Credentials:</p>
    <p className="text-xs text-blue-600">
      Email: <span className="font-mono">admin@medikloud.com</span>
    </p>
    <p className="text-xs text-blue-600">
      Password: <span className="font-mono">Admin123!</span>
    </p>
  </div>
);

export default DemoCredentials; 