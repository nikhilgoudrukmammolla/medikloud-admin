import { useEffect, useState } from 'react';
import { collection, doc, updateDoc, query, orderBy, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Order {
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

export function useOrders(user: { uid: string }, role: string) {
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
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const userOrderRef = doc(db, 'users', order.uid, 'orders', order.id);
        await setDoc(userOrderRef, { status: newStatus }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
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

  const visibleOrders = role === 'user' ? orders.filter(o => o.uid === user.uid) : orders;

  return {
    orders: visibleOrders,
    loading,
    updateOrderStatus,
    selectedOrder,
    setSelectedOrder,
    showOrderDetails,
    setShowOrderDetails,
    stats,
  };
} 