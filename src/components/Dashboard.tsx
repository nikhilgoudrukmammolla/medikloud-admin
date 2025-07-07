import React, { useState, useEffect } from 'react';
import { collection, doc, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
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

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
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
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MediKloud Admin
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Order Management Dashboard
              </p>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                <p className="text-sm opacity-90">Total Orders</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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

        {/* Orders List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Recent Orders
            </h2>
            <p className="text-gray-600 text-sm mt-1">Manage and update order statuses</p>
          </div>
          
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h3>
                <p className="text-gray-500">Orders will appear here once customers place them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
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

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Order Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrderDetails(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Order ID</label>
                  <p className="text-gray-800 font-mono">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Patient Name</label>
                  <p className="text-gray-800">{selectedOrder.patientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-800 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {selectedOrder.phone}
                  </p>
                </div>
              </div>
              
              {selectedOrder.altPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Alternative Phone</label>
                  <p className="text-gray-800">{selectedOrder.altPhone}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipCode}
                  </p>
                </div>
              </div>
              
              {selectedOrder.files && selectedOrder.files.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Prescription Files</label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.files.map(( index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">File {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowOrderDetails(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 