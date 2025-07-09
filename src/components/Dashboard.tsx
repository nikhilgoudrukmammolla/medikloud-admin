import React, { useState, useEffect } from 'react';
import { collection, doc, updateDoc, query, orderBy, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  Phone,
  MapPin,
  User,
  FileText,
  AlertCircle,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getAuth, EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { Input } from './ui/input';

interface Order {
  id: string;
  orderId: string;
  uid: string;
  patientName: string;
  phone: string;
  altPhone?: string;
  address: any;
  files: string[];
  status: 'Received' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any;
}

interface User {
  uid: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
  emailVerified?: boolean;
  forcePasswordChange?: boolean;
}

interface DashboardProps {
  user: any;
  role: string;
}

const API_URL = 'http://localhost:4000';

const Dashboard: React.FC<DashboardProps> = ({ user, role }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [linkStatus, setLinkStatus] = useState('');
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [createUserEmail, setCreateUserEmail] = useState('');
  const [createUserPassword, setCreateUserPassword] = useState('');
  const [createUserRole, setCreateUserRole] = useState('user');
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');
  const [createdUserCredentials, setCreatedUserCredentials] = useState<any>(null);

  const auth = getAuth();

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Update in main orders collection
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });

      // Find the order to get the uid
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const userOrderRef = doc(db, 'users', order.uid, 'orders', order.id);
        console.log('Updating user order:', order.uid, order.id);
        await setDoc(userOrderRef, { status: newStatus }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Received':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'Processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'Received':
        return 'default';
      case 'Processing':
        return 'secondary';
      case 'Shipped':
        return 'outline';
      case 'Delivered':
        return 'default';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const stats = {
    total: orders.length,
    received: orders.filter(o => o.status === 'Received').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  // Filter orders for user role
  const visibleOrders = role === 'user'
    ? orders.filter(o => o.uid === user.uid)
    : orders;

  const fetchUsers = async () => {
    setUserLoading(true);
    setUserError('');
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: User[] = await res.json();
      setUsers(data.map((u: User) => ({
        ...u,
        name: (u as any).displayName || '',
        phone: (u as any).phoneNumber || '',
      })));
    } catch (err) {
      setUserError('Failed to fetch users.');
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'superAdmin' || role === 'admin') {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [role]);

  const handleRoleChange = async (uid: string, newRole: string) => {
    setUserLoading(true);
    setUserError('');
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/users/${uid}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      setUsers((prev) => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (err) {
      setUserError('Failed to update role.');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    setUserLoading(true);
    setUserError('');
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/users/${uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter(u => u.uid !== uid));
    } catch (err) {
      setUserError('Failed to delete user.');
    } finally {
      setUserLoading(false);
    }
  };

  const handleSendVerification = async (uid: string) => {
    setUserLoading(true);
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/users/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send verification email');
      }
      const data = await res.json();
      if (data.verificationLink) {
        alert(`Verification email sent! Link: ${data.verificationLink}`);
      } else {
        alert('Verification email sent successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send verification email');
    } finally {
      setUserLoading(false);
    }
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkStatus('');
    const user = auth.currentUser;
    if (!user) {
      setLinkStatus('You must be signed in as the phone user.');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(linkEmail, linkPassword);
      await linkWithCredential(user, credential);
      setLinkStatus('Email linked successfully!');
    } catch (error: any) {
      setLinkStatus(error.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserLoading(true);
    setCreateUserError('');
    setCreateUserSuccess('');
    setCreatedUserCredentials(null);
    
    // Password validation
    if (createUserPassword.length < 6) {
      setCreateUserError('Password must be at least 6 characters long');
      setCreateUserLoading(false);
      return;
    }
    
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: createUserEmail,
          password: createUserPassword,
          role: createUserRole,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      const data = await res.json();
      setCreateUserSuccess('User created successfully!');
      setCreatedUserCredentials({
        email: createUserEmail,
        password: data.tempPassword,
        role: createUserRole
      });
      setCreateUserEmail('');
      setCreateUserPassword('');
      setCreateUserRole('user');
      // Refresh users list
      fetchUsers();
    } catch (err: any) {
      setCreateUserError(err.message || 'Failed to create user.');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const getRoleStats = () => {
    const total = users.length;
    const superAdmins = users.filter(u => u.role === 'superAdmin').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const agents = users.filter(u => u.role === 'agent').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const withPhone = users.filter(u => u.phone).length;
    const withEmail = users.filter(u => u.email).length;
    return { total, superAdmins, admins, agents, regularUsers, withPhone, withEmail };
  };

  // --- UI for user management (superAdmin/admin only) ---
  const renderUserManagement = () => {
    if (role === 'superAdmin' || role === 'admin') {
      const stats = getRoleStats();
      // For admin, filter out superAdmin users
      const visibleUsers = role === 'admin' ? users.filter(u => u.role !== 'superAdmin') : users;
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Roles Management</CardTitle>
            <p className="text-gray-500 text-sm">View all users, assign roles{role === 'superAdmin' ? ', delete users' : ', delete users (except superAdmin)'}.</p>
          </CardHeader>
          <CardContent>
            {/* Role summary cards */}
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
                          {/* Only superAdmin can assign superAdmin role */}
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
                        {/* Both superAdmin and admin can delete users, but admin cannot delete superAdmin */}
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
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  // --- UI for placing orders (user only) ---
  const renderPlaceOrder = () => {
    if (role === 'user') {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
            <p className="text-gray-500 text-sm">Create a new order.</p>
          </CardHeader>
          <CardContent>
            {/* TODO: Order placement form */}
            <div className="text-gray-400 text-sm">[Order placement form goes here]</div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  // --- UI for editing orders (superAdmin/admin/agent) ---
  const canEditOrders = role === 'superAdmin' || role === 'admin';
  const canChangeStatus = canEditOrders || role === 'agent';

  const renderLinkEmailForm = () => {
    // Show only for superAdmin with no email
    if (role === 'superAdmin' && !user.email) {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Link Email to Your Account</CardTitle>
            <p className="text-gray-500 text-sm">Add an email/password to your phone-auth superAdmin account.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLinkEmail} className="space-y-4 max-w-sm">
              <input
                type="email"
                placeholder="New email"
                value={linkEmail}
                onChange={e => setLinkEmail(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder="New password"
                value={linkPassword}
                onChange={e => setLinkPassword(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              />
              <Button type="submit" className="w-full">Link Email</Button>
              {linkStatus && <div className="text-sm mt-2">{linkStatus}</div>}
            </form>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const renderCreateUser = () => {
    if (role === 'superAdmin' || role === 'admin') {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <p className="text-gray-500 text-sm">Create a new user account and assign a role. User will need to verify email and change password on first login.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
              {createUserError && (
                <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{createUserError}</div>
              )}
              {createUserSuccess && (
                <div className="text-green-600 text-sm p-3 bg-green-50 rounded-lg">{createUserSuccess}</div>
              )}
              {createdUserCredentials && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">User Created Successfully!</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Email:</strong> {createdUserCredentials.email}</p>
                    <p><strong>Temporary Password:</strong> {createdUserCredentials.password}</p>
                    <p><strong>Role:</strong> {createdUserCredentials.role}</p>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Share these credentials with the user. They must verify their email and change password on first login.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="createEmail" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="createEmail"
                  type="email"
                  value={createUserEmail}
                  onChange={(e) => setCreateUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  disabled={createUserLoading}
                  className="h-10 px-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="createPassword" className="text-sm font-medium text-gray-700">
                  Temporary Password (min 6 characters)
                </label>
                <Input
                  id="createPassword"
                  type="password"
                  value={createUserPassword}
                  onChange={(e) => setCreateUserPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  required
                  disabled={createUserLoading}
                  className="h-10 px-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
                <p className="text-xs text-gray-500">User will be required to change this password on first login</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="createRole" className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="createRole"
                  value={createUserRole}
                  onChange={(e) => setCreateUserRole(e.target.value)}
                  disabled={createUserLoading}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                  {role === 'superAdmin' && <option value="superAdmin">Super Admin</option>}
                </select>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg"
                disabled={createUserLoading}
              >
                {createUserLoading ? 'Creating...' : 'Create User'}
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching latest data from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Tabs for Orders, User Roles, and Create User */}
      {role === 'superAdmin' || role === 'admin' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              className={`px-6 py-2 font-semibold rounded-t-lg transition-all duration-150 ${activeTab === 'orders' ? 'bg-white shadow text-blue-700' : 'bg-gray-100 text-gray-500 hover:text-blue-600'}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button
              className={`px-6 py-2 font-semibold rounded-t-lg transition-all duration-150 ${activeTab === 'users' ? 'bg-white shadow text-blue-700' : 'bg-gray-100 text-gray-500 hover:text-blue-600'}`}
              onClick={() => setActiveTab('users')}
            >
              User Roles
            </button>
            <button
              className={`px-6 py-2 font-semibold rounded-t-lg transition-all duration-150 ${activeTab === 'create' ? 'bg-white shadow text-blue-700' : 'bg-gray-100 text-gray-500 hover:text-blue-600'}`}
              onClick={() => setActiveTab('create')}
            >
              Create User
            </button>
          </div>
          {activeTab === 'orders' && (
            <>
              {renderPlaceOrder()}
              {/* Orders Table (all roles, but filtered for user) */}
              <div className="max-w-7xl mx-auto pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                      <p className="text-xs text-gray-500 mt-1">All orders</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Received</CardTitle>
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{stats.received}</div>
                      <p className="text-xs text-gray-500 mt-1">New orders</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
                      <p className="text-xs text-gray-500 mt-1">In progress</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Shipped</CardTitle>
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                        <Truck className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
                      <p className="text-xs text-gray-500 mt-1">On the way</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
                      <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                      <p className="text-xs text-gray-500 mt-1">Completed</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
                      <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                        <XCircle className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                      <p className="text-xs text-gray-500 mt-1">Cancelled</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-0 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200/50">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Recent Orders
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Manage and update order statuses</p>
                  </div>
                  
                  <div className="p-6">
                    {visibleOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h3>
                        <p className="text-gray-500">Orders will appear here once customers place them.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {visibleOrders.map((order) => (
                          <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/60 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                    {getStatusIcon(order.status)}
                                  </div>
            <div>
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                      Order #{order.orderId}
                                      <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                                        {order.status}
                                      </Badge>
                                    </h3>
                                    <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                                      <User className="w-4 h-4" />
                                      {order.patientName}
                                    </p>
                                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  {canChangeStatus && (
                                    <Select
                                      value={order.status}
                                      onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Received">Received</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setShowOrderDetails(true);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          {activeTab === 'users' && (
            <>
              {renderUserManagement()}
              {renderCreateUser()}
            </>
          )}
          {activeTab === 'create' && (
            <>{renderCreateUser()}</>
          )}
        </div>
      ) : role === 'agent' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Only Orders tab for agent */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              className="px-6 py-2 font-semibold rounded-t-lg bg-white shadow text-blue-700"
              disabled
            >
              Orders
            </button>
          </div>
          {/* Orders Table for agent (can only change status) */}
          <div className="max-w-7xl mx-auto pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">All orders</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Received</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.received}</div>
                  <p className="text-xs text-gray-500 mt-1">New orders</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
                  <p className="text-xs text-gray-500 mt-1">In progress</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Shipped</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
                  <p className="text-xs text-gray-500 mt-1">On the way</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                    <XCircle className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                  <p className="text-xs text-gray-500 mt-1">Cancelled</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200/50">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Recent Orders
                </h2>
                <p className="text-gray-600 text-sm mt-1">Manage and update order statuses</p>
              </div>
              
              <div className="p-6">
                {visibleOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h3>
                    <p className="text-gray-500">Orders will appear here once customers place them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleOrders.map((order) => (
                      <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                {getStatusIcon(order.status)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                  Order #{order.orderId}
                                  <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                                    {order.status}
                                  </Badge>
                                </h3>
                                <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                                  <User className="w-4 h-4" />
                                  {order.patientName}
                                </p>
                                <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {canChangeStatus && (
                                <Select
                                  value={order.status}
                                  onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Received">Received</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Shipped">Shipped</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderDetails(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {renderPlaceOrder()}
          {/* Orders Table (all roles, but filtered for user) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All orders</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Received</CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Package className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.received}</div>
              <p className="text-xs text-gray-500 mt-1">New orders</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Shipped</CardTitle>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Truck className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
              <p className="text-xs text-gray-500 mt-1">On the way</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <XCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <p className="text-xs text-gray-500 mt-1">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Recent Orders
            </h2>
            <p className="text-gray-600 text-sm mt-1">Manage and update order statuses</p>
          </div>
          
          <div className="p-6">
                {visibleOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h3>
                <p className="text-gray-500">Orders will appear here once customers place them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                    {visibleOrders.map((order) => (
                  <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              Order #{order.orderId}
                              <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                                {order.status}
                              </Badge>
                            </h3>
                            <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                              <User className="w-4 h-4" />
                              {order.patientName}
                            </p>
                            <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                              {canChangeStatus && (
                          <Select
                            value={order.status}
                            onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Received">Received</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                              )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}
      {/* Link Email Form (superAdmin) */}
      {renderLinkEmailForm()}
    </div>
  );
};

export default Dashboard; 