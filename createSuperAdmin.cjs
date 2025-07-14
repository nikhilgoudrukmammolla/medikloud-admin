require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get email and password from command line arguments or use defaults
const email = process.argv[2] || 'admin@medikloud.com';
const password = process.argv[3] || 'Admin123!';

async function createSuperAdmin() {
  try {
    // Create the user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: 'Super Admin',
    });
    console.log('SuperAdmin user created:', userRecord.uid);
    // Set superAdmin custom claim with all relevant flags true
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role: 'superAdmin',
      forcePasswordChange: true,
      isSuperAdmin: true,
      isActive: true,
      accountCreated: new Date().toISOString()
    });
    console.log('superAdmin role set successfully');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('User already exists. Setting superAdmin claim...');
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(userRecord.uid, { 
          role: 'superAdmin',
          forcePasswordChange: true,
          isSuperAdmin: true,
          isActive: true,
          accountCreated: new Date().toISOString()
        });
        console.log('superAdmin role set successfully for existing user');
        process.exit(0);
      } catch (claimError) {
        console.error('Error setting superAdmin claim:', claimError);
        process.exit(1);
      }
    } else {
      console.error('Error creating superAdmin user:', error);
      process.exit(1);
    }
  }
}

createSuperAdmin(); 