const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

// Cloud Function to create notifications when orders are created
exports.createOrderNotification = onDocumentCreated('orders/{orderId}', async (event) => {
  const orderData = event.data.data();
  const orderId = event.params.orderId;

  try {
    // Get all users with admin roles
    const adminUsers = await admin.firestore()
      .collection('users')
      .where('role', 'in', ['admin', 'superAdmin', 'agent'])
      .get();

    // Create notification for each admin user
    const notificationPromises = adminUsers.docs.map(async (userDoc) => {
      const notificationData = {
        title: 'New Order Received',
        message: `Order #${orderData.orderId} has been received from ${orderData.patientName}`,
        type: 'order',
        orderId: orderId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        orderUserId: orderData.uid || null
      };

      // Add to user's personal notifications subcollection
      return admin.firestore()
        .collection('users')
        .doc(userDoc.id)
        .collection('notifications')
        .add(notificationData);
    });

    await Promise.all(notificationPromises);
    console.log(`Notifications created for ${adminUsers.docs.length} admin users for order ${orderId}`);
    return null;
  } catch (error) {
    console.error('Error creating notifications:', error);
    return null;
  }
});

// Cloud Function to create user creation notifications (triggered from backend API)
exports.createUserNotification = onCall(async (request) => {
  // Check if user is authenticated and has admin role
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { newUserEmail, newUserRole } = request.data;

  if (!newUserEmail || !newUserRole) {
    throw new Error('New user email and role are required');
  }

  try {
    // Get all superAdmin users
    const superAdminUsers = await admin.firestore()
      .collection('users')
      .where('role', '==', 'superAdmin')
      .get();

    // Create notification for each superAdmin user
    const notificationPromises = superAdminUsers.docs.map(async (adminDoc) => {
      const notificationData = {
        title: 'New User Created',
        message: `New user ${newUserEmail} has been created with role: ${newUserRole}`,
        type: 'user',
        newUserEmail: newUserEmail,
        newUserRole: newUserRole,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Add to superAdmin's personal notifications subcollection
      return admin.firestore()
        .collection('users')
        .doc(adminDoc.id)
        .collection('notifications')
        .add(notificationData);
    });

    await Promise.all(notificationPromises);
    console.log(`User creation notifications created for ${superAdminUsers.docs.length} superAdmin users`);
    return { success: true };
  } catch (error) {
    console.error('Error creating user notifications:', error);
    throw new Error('Failed to create user notifications');
  }
});

// HTTP function to mark notification as read
exports.markNotificationRead = onCall(async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { notificationId } = request.data;

  if (!notificationId) {
    throw new Error('Notification ID is required');
  }

  try {
    // Mark notification as read in user's personal notifications
    await admin.firestore()
      .collection('users')
      .doc(request.auth.uid)
      .collection('notifications')
      .doc(notificationId)
      .update({ read: true });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
});

// Function to create system notifications
exports.createSystemNotification = onCall(async (request) => {
  // Check if user is authenticated and has admin role
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { title, message, targetRoles } = request.data;

  if (!title || !message) {
    throw new Error('Title and message are required');
  }

  try {
    let usersQuery = admin.firestore().collection('users');
    
    // If targetRoles specified, filter by roles
    if (targetRoles && targetRoles.length > 0) {
      usersQuery = usersQuery.where('role', 'in', targetRoles);
    }

    const users = await usersQuery.get();

    // Create notification for each user
    const notificationPromises = users.docs.map(async (userDoc) => {
      const notificationData = {
        title: title,
        message: message,
        type: 'system',
        targetRoles: targetRoles || null,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Add to user's personal notifications subcollection
      return admin.firestore()
        .collection('users')
        .doc(userDoc.id)
        .collection('notifications')
        .add(notificationData);
    });

    await Promise.all(notificationPromises);
    console.log(`System notifications created for ${users.docs.length} users`);
    return { success: true };
  } catch (error) {
    console.error('Error creating system notifications:', error);
    throw new Error('Failed to create system notifications');
  }
}); 