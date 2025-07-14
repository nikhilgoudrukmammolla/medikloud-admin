import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

interface CreateUserFormProps {
  email: string;
  password: string;
  role: string;
  loading: boolean;
  error: string;
  success: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRoleChange: (role: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  email,
  password,
  role,
  loading,
  error,
  success,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <p className="text-gray-500 text-sm">Create a new user account.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            required
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={role}
            onChange={e => onRoleChange(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="superAdmin">Super Admin</option>
          </select>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateUserForm; 