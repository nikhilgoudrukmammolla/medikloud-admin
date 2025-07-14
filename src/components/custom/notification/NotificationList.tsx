import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, loading }) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading notifications...</div>;
  }
  return (
    <div className="p-4">
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications</h3>
          <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/60 backdrop-blur-sm ${
                !notification.read ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-gray-800">{notification.title}</div>
                  <div className="text-gray-600 text-sm">{notification.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleString() : ''}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList; 