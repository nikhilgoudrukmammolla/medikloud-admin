import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { BarChart3, Package, Clock, Truck, User, Calendar, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  orderId: string;
  uid: string;
  patientName: string;
  phone: string;
  altPhone?: string | null;
  address?: any;
  files: string[];
  status: 'Received' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any;
  notes?: string;
  flat?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  type?: string;
}

interface OrderListProps {
  orders: Order[];
  stats: {
    total: number;
    received: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  canChangeStatus: boolean;
  onChangeStatus: (orderId: string, newStatus: Order['status']) => void;
  onViewOrder: (order: Order) => void;
}

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

const OrderList: React.FC<OrderListProps> = ({ orders, stats, canChangeStatus, onChangeStatus, onViewOrder }) => {
  return (
    <>
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
            <span><BarChart3 className="w-5 h-5 text-blue-500" /></span>
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
                        {canChangeStatus && (
                          <Select
                            value={order.status}
                            onValueChange={(value: Order['status']) => onChangeStatus(order.id, value)}
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
                          onClick={() => onViewOrder(order)}
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
    </>
  );
};

export default OrderList; 