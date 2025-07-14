import React from 'react';
import { Button } from '../../ui/button';
import UserRoleSummaryCards from './UserRoleSummaryCards';

interface User {
  uid: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
  emailVerified?: boolean;
  forcePasswordChange?: boolean;
}

type UserManagementTableProps = {
  users: User[];
  role: string;
  userLoading: boolean;
  userError: string;
  handleRoleChange: (uid: string, newRole: string) => void;
  handleDeleteUser: (uid: string) => void;
  handleSendVerification: (uid: string) => void;
};

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  role,
  userLoading,
  userError,
  handleRoleChange,
  handleDeleteUser,
  handleSendVerification,
}) => {
  // Role summary
  const getRoleStats = () => {
    const stats = {
      total: users.length,
      superAdmins: users.filter(u => u.role === 'superAdmin').length,
      admins: users.filter(u => u.role === 'admin').length,
      agents: users.filter(u => u.role === 'agent').length,
      regularUsers: users.filter(u => u.role === 'user').length,
      withPhone: users.filter(u => u.phone).length,
      withEmail: users.filter(u => u.email).length,
    };
    return stats;
  };
  const stats = getRoleStats();
  const visibleUsers = role === 'admin' ? users.filter(u => u.role !== 'superAdmin') : users;

  return (
    <div className="mb-8">
      <div className="mb-4">
        <UserRoleSummaryCards stats={stats} />
      </div>
      {userError && <div className="text-red-600 mb-2">{userError}</div>}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-gray-700 bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              {(role === 'superAdmin' || role === 'admin') && <th className="px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u.uid} className="border-b hover:bg-blue-50/30">
                <td className="px-4 py-2 font-medium">{u.name || '-'}</td>
                <td className="px-4 py-2">{u.email || '-'}</td>
                <td className="px-4 py-2">{u.phone || '-'}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.uid, e.target.value)}
                    disabled={userLoading || (role === 'admin' && u.role === 'superAdmin')}
                    className="border rounded px-2 py-1 bg-gray-50"
                  >
                    <option value="admin">admin</option>
                    <option value="agent">agent</option>
                    <option value="user">user</option>
                    {role === 'superAdmin' && <option value="superAdmin">superAdmin</option>}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2 py-1 rounded ${u.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {u.emailVerified ? 'Email Verified' : 'Email Pending'}
                    </span>
                    {(u as any).forcePasswordChange && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                        Password Change Required
                      </span>
                    )}
                    {!u.emailVerified && (
                      <button
                        onClick={() => handleSendVerification(u.uid)}
                        className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        Send Verification
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  {(role === 'superAdmin' || (role === 'admin' && u.role !== 'superAdmin')) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(u.uid)}
                      disabled={userLoading}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementTable; 