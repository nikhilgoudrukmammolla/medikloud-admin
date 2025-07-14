import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, id, error, children }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
  </div>
);

export default FormField; 