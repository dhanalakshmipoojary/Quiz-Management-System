#!/usr/bin/env node
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "quiz_app";
const email = "admin@gmail.com";
const password = "admin@123";

if (!uri) {
  console.error("MONGODB_URI must be set.");
  process.exit(1);
}

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    console.log(`\nChecking for user: ${email} in database: ${dbName}\n`);

    const user = await users.findOne({ email });
    if (!user) {
      console.log("❌ User NOT found in database");
      console.log("\nRun the seed script to create the admin:");
      console.log(`  MONGODB_URI="your-uri" ADMIN_EMAIL="admin@gmail.com" ADMIN_PASS="admin@123" node scripts/seed-admin.js`);
    } else {
      console.log("✓ User found:");
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role || "N/A"}`);
      console.log(`  PasswordHash: ${user.passwordHash.substring(0, 20)}...`);

      // Test password verification
      const isValid = await bcrypt.compare(password, user.passwordHash);
      console.log(`\n  Password "${password}" is ${isValid ? "✓ VALID" : "❌ INVALID"}`);

      if (!isValid) {
        console.log("\n  Troubleshooting:");
        console.log("  - Check that the password used in seed matches what you're trying");
        console.log("  - Consider re-seeding with a new password");
      }
    }

    // List all users for debugging
    const allUsers = await users.find({}).toArray();
    console.log(`\n\nTotal users in collection: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log("Users:");
      allUsers.forEach((u) => {
        console.log(`  - ${u.email} (role: ${u.role})`);
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
