import React from 'react';

interface UserRoleStats {
  total: number;
  superAdmins: number;
  admins: number;
  agents: number;
  regularUsers: number;
  withPhone: number;
  withEmail: number;
}

interface UserRoleSummaryCardsProps {
  stats: UserRoleStats;
}

const UserRoleSummaryCards: React.FC<UserRoleSummaryCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 text-center shadow">
      <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
      <div className="text-xs text-gray-600 mt-1">Total Users</div>
    </div>
    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 text-center shadow">
      <div className="text-2xl font-bold text-purple-700">{stats.superAdmins}</div>
      <div className="text-xs text-gray-600 mt-1">Super Admins</div>
    </div>
    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 text-center shadow">
      <div className="text-2xl font-bold text-green-700">{stats.admins}</div>
      <div className="text-xs text-gray-600 mt-1">Admins</div>
    </div>
    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 text-center shadow">
      <div className="text-2xl font-bold text-yellow-700">{stats.agents}</div>
      <div className="text-xs text-gray-600 mt-1">Agents</div>
    </div>
    <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-4 text-center shadow">
      <div className="text-2xl font-bold text-pink-700">{stats.regularUsers}</div>
      <div className="text-xs text-gray-600 mt-1">Regular Users</div>
    </div>
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 text-center shadow">
      <div className="text-2xl font-bold text-gray-700">{stats.withPhone}</div>
      <div className="text-xs text-gray-600 mt-1">With Phone</div>
    </div>
    <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl p-4 text-center shadow">
      <div className="text-2xl font-bold text-indigo-700">{stats.withEmail}</div>
      <div className="text-xs text-gray-600 mt-1">With Email</div>
    </div>
  </div>
);

export default UserRoleSummaryCards; 