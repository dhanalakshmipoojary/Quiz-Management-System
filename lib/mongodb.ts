import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
if (!uri) {
  // Don't throw here so the server can still start in environments without env configured.
  // The route will error later if the DB is actually needed.
  console.warn("MONGODB_URI not set");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getClient() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getDb() {
  if (cachedDb) return cachedDb;
  const client = await getClient();
  // Prefer explicit env DB name, otherwise default to 'quiz_app'
  const dbName = process.env.MONGODB_DB || "quiz_app";
  const db = client.db(dbName);
  cachedDb = db;
  return db;
}
