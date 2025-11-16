#!/usr/bin/env node
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "quiz_app";
const email = (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase();
const pass = process.env.ADMIN_PASS || "admin@123";

if (!uri) {
  console.error("MONGODB_URI must be set. Example: export MONGODB_URI=\"mongodb+srv://...\"");
  process.exit(1);
}

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      console.log("Admin already exists:", existing.email);
      return;
    }

    const hash = await bcrypt.hash(pass, 10);
    const res = await users.insertOne({
      email,
      passwordHash: hash,
      role: "admin",
      createdAt: new Date(),
    });
    console.log("Inserted admin with id", res.insertedId.toString());
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
