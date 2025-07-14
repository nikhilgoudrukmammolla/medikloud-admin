import React from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import OrderList from './custom/order/OrderList';
import NotificationList from './custom/notification/NotificationList';
import CreateUserForm from './custom/user/CreateUserForm';
import PlaceOrderForm from './custom/order/PlaceOrderForm';
import UserManagementTable from './custom/user/UserManagementTable';
import UserRoleSummaryCards from './custom/user/UserRoleSummaryCards';
import LinkEmailForm from './custom/user/LinkEmailForm';
import LoadingScreen from './custom/dashboard/LoadingScreen';
import DashboardTabs from './custom/dashboard/DashboardTabs';
import ConfirmationDialog from './custom/ConfirmationDialog';
import OrderDetailsModal from './custom/OrderDetailsModal';
import InteractiveMapModal from './custom/InteractiveMapModal';

const Dashboard: React.FC = () => {
  const {
    user,
    role,
    orders,
    users,
    notifications,
    modal,
    setModal,
  } = useDashboardContext();

  // Loading state
  if (orders.loading) {
    return <LoadingScreen message="Loading orders..." subtext="Fetching latest data from database" />;
  }

  // Tab navigation
  const [activeTab, setActiveTab] = React.useState('orders');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications.notifications} />
      {activeTab === 'orders' && (
        <>
          {role === 'user' && <PlaceOrderForm
            onSubmit={() => {}}
            loading={false}
            error={''}
            success={''}
          />}
          <OrderList
            orders={orders.orders}
            stats={orders.stats}
            canChangeStatus={['superAdmin', 'admin', 'agent'].includes(role)}
            onChangeStatus={orders.updateOrderStatus}
            onViewOrder={order => {
              orders.setSelectedOrder(order);
              orders.setShowOrderDetails(true);
            }}
          />
        </>
      )}
      {activeTab === 'users' && (
        <>
          <UserManagementTable
            users={users.users}
            role={role}
            userLoading={users.loading}
            userError={users.error}
            handleRoleChange={users.handleRoleChange}
            handleDeleteUser={users.handleDeleteUser}
            handleSendVerification={() => {}}
          />
          <CreateUserForm
            email={''}
            password={''}
            role={''}
            loading={false}
            error={''}
            success={''}
            onEmailChange={() => {}}
            onPasswordChange={() => {}}
            onRoleChange={() => {}}
            onSubmit={() => {}}
          />
        </>
      )}
      {activeTab === 'create' && (
        <CreateUserForm
          email={''}
          password={''}
          role={''}
          loading={false}
          error={''}
          success={''}
          onEmailChange={() => {}}
          onPasswordChange={() => {}}
          onRoleChange={() => {}}
          onSubmit={() => {}}
        />
      )}
      {activeTab === 'notifications' && (
        <NotificationList notifications={notifications.notifications} loading={notifications.loading} />
      )}
      <LinkEmailForm
        email={''}
        password={''}
        loading={false}
        status={''}
        onEmailChange={() => {}}
        onPasswordChange={() => {}}
        onSubmit={() => {}}
      />
      {/* Modals and dialogs */}
      <ConfirmationDialog
        open={false}
        title={''}
        description={''}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
      <OrderDetailsModal
        open={false}
        order={null}
        onClose={() => {}}
        onShowMap={() => {}}
        zoomImage={null}
        setZoomImage={() => {}}
      />
    </div>
  );
};

export default Dashboard; 