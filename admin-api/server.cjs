require('dotenv').config();
require('dotenv').config({ path: '../.env' });
console.log('Admin API server starting...');
console.log('Current working directory:', process.cwd());
console.log('All env variables:', Object.keys(process.env).filter(key => key.includes('FIREBASE')));
console.log('FIREBASE_SERVICE_ACCOUNT_KEY exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
console.log('FIREBASE_SERVICE_ACCOUNT_KEY length:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0);
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const admin = require('firebase-admin');
// Use service account from env variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const { sendWelcomeEmail, sendVerificationEmail } = require('./emailService');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const fastify = Fastify({ logger: true });

// Register CORS with proper headers for Firebase Auth
fastify.register(cors, {
  origin: true, // allow all origins or specify your frontend URL
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type']
});

// Middleware: verify Firebase ID token and check role
async function verifyTokenAndRole(request, reply, requiredRoles = []) {
  console.log('verifyTokenAndRole called for', request.raw.url);
  const authHeader = request.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Missing or invalid Authorization header' });
    return null;
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Block users with role 'user' from all protected endpoints
    if (decoded.role === 'user') {
      reply.code(403).send({ error: 'User logins are temporarily disabled. Please contact your administrator.' });
      return null;
    }
    if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
      reply.code(403).send({ error: 'Insufficient role' });
      return null;
    }
    return decoded;
  } catch (err) {
    reply.code(401).send({ error: 'Invalid token' });
    return null;
  }
}

// GET /users - List all users (admin/superAdmin)
fastify.get('/users', async (request, reply) => {
  const decoded = await verifyTokenAndRole(request, reply, ['admin', 'superAdmin']);
  if (!decoded) return;
  const users = [];
  let nextPageToken;
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    users.push(...result.users.map(u => ({
      uid: u.uid,
      email: u.email,
      role: u.customClaims?.role || 'user',
    })));
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  reply.send(users);
});

// POST /users - Create new user (admin/superAdmin)
fastify.post('/users', async (request, reply) => {
  const decoded = await verifyTokenAndRole(request, reply, ['admin', 'superAdmin']);
  if (!decoded) return;
  const { email, password, role } = request.body;
  
  if (!email || !password || !role) {
    return reply.code(400).send({ error: 'Email, password, and role are required' });
  }
  
  if (!['superAdmin', 'admin', 'agent', 'user'].includes(role)) {
    return reply.code(400).send({ error: 'Invalid role' });
  }
  
  // Only superAdmin can create superAdmin users
  if (role === 'superAdmin' && decoded.role !== 'superAdmin') {
    return reply.code(403).send({ error: 'Only superAdmin can create superAdmin users' });
  }
  
  try {
    // Create the user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false, // Force email verification
    });
    
    // Set custom claims with role and force password change
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role,
      forcePasswordChange: true,
      accountCreated: new Date().toISOString()
    });

    // Log user creation
    console.log(`[CREATE USER] Created user ${userRecord.uid} (${email}) with role ${role}`);

    // Create user document in Firestore (for users only)
    if (role === 'user') {
      try {
        await admin.firestore().collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: userRecord.email,
          role,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          emailVerified: false,
          forcePasswordChange: true
        });
        console.log(`[FIRESTORE] Created user doc for ${userRecord.uid} in users collection`);
      } catch (firestoreError) {
        console.error('[FIRESTORE ERROR] Failed to create user document in Firestore:', firestoreError);
        // Don't fail the user creation if Firestore fails
      }
    }
    
    // Send welcome email with temporary password
    try {
      await sendWelcomeEmail(email, password, role);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    // Create notification for superAdmin users about new user creation
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
          message: `New user ${email} has been created with role: ${role}`,
          type: 'user',
          newUserEmail: email,
          newUserRole: role,
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
      console.log(`[NOTIFICATION] User creation notifications created for ${superAdminUsers.docs.length} superAdmin users`);
    } catch (notificationError) {
      console.error('[NOTIFICATION ERROR] Failed to create user notification:', notificationError);
      // Don't fail the user creation if notification fails
    }
    
    reply.send({ 
      success: true, 
      uid: userRecord.uid,
      message: 'User created successfully. Welcome email sent.',
      tempPassword: password // Remove this in production
    });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return reply.code(400).send({ error: 'User with this email already exists' });
    }
    if (error.code === 'auth/invalid-password') {
      return reply.code(400).send({ error: 'Password must be at least 6 characters long' });
    }
    console.error('Error creating user:', error);
    reply.code(500).send({ error: 'Failed to create user' });
  }
});

// POST /users/:uid/role - Assign role (admin/superAdmin)
fastify.post('/users/:uid/role', async (request, reply) => {
  const decoded = await verifyTokenAndRole(request, reply, ['admin', 'superAdmin']);
  if (!decoded) return;
  const { uid } = request.params;
  const { role } = request.body;
  if (!['superAdmin', 'admin', 'agent', 'user'].includes(role)) {
    return reply.code(400).send({ error: 'Invalid role' });
  }
  // Only superAdmin can assign superAdmin
  if (role === 'superAdmin' && decoded.role !== 'superAdmin') {
    return reply.code(403).send({ error: 'Only superAdmin can assign superAdmin role' });
  }
  await admin.auth().setCustomUserClaims(uid, { role });
  reply.send({ success: true });
});

// DELETE /users/:uid - Delete user (superAdmin only)
fastify.delete('/users/:uid', async (request, reply) => {
  const decoded = await verifyTokenAndRole(request, reply, ['superAdmin']);
  if (!decoded) return;
  const { uid } = request.params;
  await admin.auth().deleteUser(uid);
  reply.send({ success: true });
});

// POST /users/clear-force-password-change - Clear force password change flag
fastify.post('/users/clear-force-password-change', async (request, reply) => {
  console.log('clear-force-password-change endpoint hit');
  const decoded = await verifyTokenAndRole(request, reply, ['superAdmin', 'admin', 'agent', 'user']);
  if (!decoded) return;
  
  try {
    // Get current user's custom claims
    const userRecord = await admin.auth().getUser(decoded.uid);
    const currentClaims = userRecord.customClaims || {};
    
    // Remove forcePasswordChange flag
    const updatedClaims = { ...currentClaims };
    delete updatedClaims.forcePasswordChange;
    
    // Update custom claims
    await admin.auth().setCustomUserClaims(decoded.uid, updatedClaims);
    
    reply.send({ 
      success: true, 
      message: 'Password change requirement cleared' 
    });
  } catch (error) {
    console.error('Error clearing force password change:', error);
    reply.code(500).send({ error: 'Failed to clear password change requirement' });
  }
});

// POST /users/send-verification - Send email verification
fastify.post('/users/send-verification', async (request, reply) => {
  const decoded = await verifyTokenAndRole(request, reply, ['superAdmin', 'admin']);
  if (!decoded) return;
  
  const { uid } = request.body;
  
  if (!uid) {
    return reply.code(400).send({ error: 'User ID is required' });
  }
  
  try {
    // Get user record
    const userRecord = await admin.auth().getUser(uid);
    
    if (userRecord.emailVerified) {
      return reply.code(400).send({ error: 'User email is already verified' });
    }
    
    // Generate verification link
    const verificationLink = await admin.auth().generateEmailVerificationLink(userRecord.email);
    
    // Send verification email
    try {
      await sendVerificationEmail(userRecord.email, verificationLink);
      reply.send({ 
        success: true, 
        message: 'Verification email sent successfully'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      reply.send({ 
        success: true, 
        message: 'Verification link generated',
        verificationLink // Fallback for development
      });
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    reply.code(500).send({ error: 'Failed to send verification email' });
  }
});

// POST /record-login - Record login event in Firestore
fastify.post('/record-login', async (request, reply) => {
  console.log('record-login endpoint hit');
  const decoded = await verifyTokenAndRole(request, reply, ['superAdmin', 'admin', 'agent', 'user']);
  if (!decoded) return;
  const { uid, email, role } = decoded;
  let collection = 'users';
  if (role === 'admin') collection = 'admins';
  if (role === 'superAdmin') collection = 'superadmins';
  if (role === 'agent') collection = 'agents';
  try {
    // Get user record from Firebase Auth for more details
    const userRecord = await admin.auth().getUser(uid);
    await admin.firestore().collection(collection).doc(uid).set({
      uid,
      email,
      role,
      displayName: userRecord.displayName || '',
      phoneNumber: userRecord.phoneNumber || '',
      photoURL: userRecord.photoURL || '',
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
    }, { merge: true });
    console.log(`[FIRESTORE] Recorded login for ${uid} in ${collection} collection`);
    reply.send({ success: true });
  } catch (err) {
    console.error('[FIRESTORE ERROR] Failed to record login:', err);
    reply.code(500).send({ error: 'Failed to record login' });
  }
});

// Start server
fastify.listen({ port: 4000, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err;
  console.log(`Admin API listening at ${address}`);
}); 