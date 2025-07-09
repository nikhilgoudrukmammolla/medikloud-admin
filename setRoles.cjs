const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Map of UIDs to roles
const userRoles = {
  'e48NNfOquLbSJfqPfVCmr03MVr92': 'superAdmin',
  'C7tKaoQrY5aiDl1aBrvm3FmvuYx2': 'admin',
};

async function setRoles() {
  for (const [uid, role] of Object.entries(userRoles)) {
    try {
      await admin.auth().setCustomUserClaims(uid, { role });
      console.log(`Set role '${role}' for user ${uid}`);
    } catch (error) {
      console.error(`Error setting role for user ${uid}:`, error);
    }
  }
  process.exit();
}

setRoles(); 