import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface LinkEmailFormProps {
  email: string;
  password: string;
  loading: boolean;
  status: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LinkEmailForm: React.FC<LinkEmailFormProps> = ({
  email,
  password,
  loading,
  status,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Link Email to Your Account</CardTitle>
      <p className="text-gray-500 text-sm">Add an email/password to your phone-auth superAdmin account.</p>
    </CardHeader>
    <CardContent>
      <form onSubmit={onSubmit} className="space-y-4 max-w-sm">
        <input
          type="email"
          placeholder="New email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
          disabled={loading}
        />
        <Button type="submit" className="w-full" disabled={loading}>Link Email</Button>
        {status && <div className="text-sm mt-2">{status}</div>}
      </form>
    </CardContent>
  </Card>
);

export default LinkEmailForm; 