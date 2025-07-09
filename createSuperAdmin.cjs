const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = 'admin@medikloud.com';
const password = 'Admin123!';

async function createSuperAdmin() {
  try {
    // Create the user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: 'Super Admin',
    });
    console.log('SuperAdmin user created:', userRecord.uid);
    // Set superAdmin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'superAdmin' });
    console.log('superAdmin role set successfully');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('User already exists. Setting superAdmin claim...');
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'superAdmin' });
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