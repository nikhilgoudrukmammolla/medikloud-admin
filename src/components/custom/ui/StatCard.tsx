import React from 'react';

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color = 'text-blue-700', icon }) => (
  <div className={`bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 text-center shadow`}>
    {icon && <div className="mb-2 flex justify-center">{icon}</div>}
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-600 mt-1">{label}</div>
  </div>
);

export default StatCard; 