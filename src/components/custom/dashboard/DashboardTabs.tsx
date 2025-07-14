import React from 'react';

type DashboardTabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: any[];
};

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, setActiveTab, notifications }) => (
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
    <button
      className={`px-6 py-2 font-semibold rounded-t-lg transition-all duration-150 ${activeTab === 'notifications' ? 'bg-white shadow text-blue-700' : 'bg-gray-100 text-gray-500 hover:text-blue-600'}`}
      onClick={() => setActiveTab('notifications')}
    >
      Notifications
      {notifications.filter(n => !n.read).length > 0 && (
        <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
          {notifications.filter(n => !n.read).length}
        </span>
      )}
    </button>
  </div>
);

export default DashboardTabs; 