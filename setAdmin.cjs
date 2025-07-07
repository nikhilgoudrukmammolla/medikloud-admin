const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "e48NNfOquLbSJfqPfVCmr03MVr92"; // Your admin user's UID

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("Custom claim set for admin user");
    process.exit(0);
  })
  .catch(console.error); 