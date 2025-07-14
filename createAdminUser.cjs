require('dotenv').config();
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get email and password from command line arguments or use defaults
const adminEmail = process.argv[2] || "nikhilgoud2002@gmail.com";
const adminPassword = process.argv[3] || "Admin123!";

async function createAdminUser() {
  try {
    // Create the user
    const userRecord = await admin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: "MediKloud Admin"
    });

    console.log("Admin user created successfully:", userRecord.uid);

    // Set admin custom claim with force password change
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role: 'admin',
      forcePasswordChange: true,
      accountCreated: new Date().toISOString()
    });
    console.log("Admin claim set successfully");

    console.log("\n=== Admin User Created ===");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("UID:", userRecord.uid);
    console.log("========================\n");

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log("User already exists. Setting admin claim...");
      try {
        // Get the existing user
        const userRecord = await admin.auth().getUserByEmail(adminEmail);
        
        // Set admin custom claim with force password change
        await admin.auth().setCustomUserClaims(userRecord.uid, { 
          role: 'admin',
          forcePasswordChange: true,
          accountCreated: new Date().toISOString()
        });
        console.log("Admin claim set successfully for existing user");
        
        console.log("\n=== Admin User Info ===");
        console.log("Email:", adminEmail);
        console.log("Password:", adminPassword);
        console.log("UID:", userRecord.uid);
        console.log("======================\n");
        
        process.exit(0);
      } catch (claimError) {
        console.error("Error setting admin claim:", claimError);
        process.exit(1);
      }
    } else {
      console.error("Error creating admin user:", error);
      process.exit(1);
    }
  }
}

createAdminUser(); 