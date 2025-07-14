import { useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: any;
  // Add more fields as needed
}

export function useNotifications(user: { uid: string }, role: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    try {
      const notificationsRef = collection(db, 'users', user.uid, 'notifications');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notificationsData);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      setLoading(false);
      return undefined;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'users', user.uid, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    loading,
    fetchNotifications,
    markNotificationAsRead,
    setNotifications,
  };
} 