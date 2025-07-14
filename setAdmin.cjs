require('dotenv').config();
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "e48NNfOquLbSJfqPfVCmr03MVr92"; // Your admin user's UID

admin.auth().setCustomUserClaims(uid, { 
  role: 'admin',
  forcePasswordChange: true,
  accountCreated: new Date().toISOString()
})
  .then(() => {
    console.log("Custom claim set for admin user");
    process.exit(0);
  })
  .catch(console.error); 