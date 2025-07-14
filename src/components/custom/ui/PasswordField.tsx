import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggleShow: () => void;
  label: string;
  id: string;
  error?: string;
  strengthText?: string;
  strengthColor?: string;
  feedback?: string[];
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  show,
  onToggleShow,
  label,
  id,
  error,
  strengthText,
  strengthColor,
  feedback,
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200 w-full"
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {strengthText && (
      <div className={`text-xs font-medium ${strengthColor}`}>{strengthText}</div>
    )}
    {feedback && feedback.length > 0 && (
      <ul className="text-xs text-gray-600 space-y-1">
        {feedback.map((f, i) => (
          <li key={i} className="flex items-start gap-1"><span className="text-red-500 mt-0.5">•</span>{f}</li>
        ))}
      </ul>
    )}
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
  </div>
);

export default PasswordField; 