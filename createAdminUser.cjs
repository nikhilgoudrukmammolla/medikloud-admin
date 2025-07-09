const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Admin user credentials
const adminEmail = "nikhilgoud2002@gmail.com";
const adminPassword = "Admin123!";

async function createAdminUser() {
  try {
    // Create the user
    const userRecord = await admin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: "MediKloud Admin"
    });

    console.log("Admin user created successfully:", userRecord.uid);

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
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
        
        // Set admin custom claim
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
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