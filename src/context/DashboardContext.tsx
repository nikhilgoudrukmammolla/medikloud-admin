import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useUsers } from '../hooks/useUsers';
import { useNotifications } from '../hooks/useNotifications';

interface DashboardContextValue {
  user: any; // Replace with your User type if available
  role: string;
  orders: ReturnType<typeof useOrders>;
  users: ReturnType<typeof useUsers>;
  notifications: ReturnType<typeof useNotifications>;
  modal: { type: string; data?: unknown } | null;
  setModal: React.Dispatch<React.SetStateAction<{ type: string; data?: unknown } | null>>;
}

interface DashboardProviderProps {
  user: any; // Replace with your User type if available
  role: string;
  children: ReactNode;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ user, role, children }) => {
  const ordersState = useOrders(user, role);
  const usersState = useUsers();
  const notificationsState = useNotifications(user, role);
  const [modal, setModal] = useState<{ type: string; data?: unknown } | null>(null);

  const value: DashboardContextValue = {
    user,
    role,
    orders: ordersState,
    users: usersState,
    notifications: notificationsState,
    modal,
    setModal,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboardContext must be used within a DashboardProvider');
  return ctx;
}; 