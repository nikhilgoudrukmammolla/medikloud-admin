import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';

interface FormAlertProps {
  type: 'error' | 'success';
  message: string;
}

const FormAlert: React.FC<FormAlertProps> = ({ type, message }) => (
  <div className={`flex items-center gap-3 p-4 text-sm border rounded-xl ${type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
    {type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <Sparkles className="w-5 h-5 flex-shrink-0" />}
    <span>{message}</span>
  </div>
);

export default FormAlert; 