require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get email and password from command line arguments or use defaults
const email = process.argv[2] || 'demo@medikloud.com';
const password = process.argv[3] || 'Demo123!';

async function createDemoSuperAdmin() {
  try {
    // Create the user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: 'Demo Super Admin',
      emailVerified: true // Set email as verified for demo
    });
    console.log('Demo SuperAdmin user created:', userRecord.uid);
    
    // Set demo superAdmin custom claim with forcePasswordChange: false
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role: 'superAdmin',
      forcePasswordChange: false, // No password change required for demo
      isSuperAdmin: true,
      isActive: true,
      isDemo: true, // Flag to identify this as a demo account
      accountCreated: new Date().toISOString()
    });
    console.log('Demo superAdmin role set successfully');
    
    console.log('\n=== Demo Super Admin Created ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('UID:', userRecord.uid);
    console.log('===============================\n');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('User already exists. Setting demo superAdmin claim...');
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // Update user to set email as verified
        await admin.auth().updateUser(userRecord.uid, {
          emailVerified: true
        });
        
        await admin.auth().setCustomUserClaims(userRecord.uid, { 
          role: 'superAdmin',
          forcePasswordChange: false, // No password change required for demo
          isSuperAdmin: true,
          isActive: true,
          isDemo: true, // Flag to identify this as a demo account
          accountCreated: new Date().toISOString()
        });
        console.log('Demo superAdmin role set successfully for existing user');
        
        console.log('\n=== Demo Super Admin Info ===');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('UID:', userRecord.uid);
        console.log('============================\n');
        
        process.exit(0);
      } catch (claimError) {
        console.error('Error setting demo superAdmin claim:', claimError);
        process.exit(1);
      }
    } else {
      console.error('Error creating demo superAdmin user:', error);
      process.exit(1);
    }
  }
}

createDemoSuperAdmin(); 