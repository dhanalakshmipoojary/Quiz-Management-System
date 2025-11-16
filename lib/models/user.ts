import { getDb } from "../mongodb";
import { ObjectId } from "mongodb";

export type User = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  role?: string;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection<User>("users").findOne({ email });
  return user;
}

export async function createUser(user: { email: string; passwordHash: string; role?: string }) {
  const db = await getDb();
  const res = await db.collection("users").insertOne(user);
  return { _id: res.insertedId, ...user } as User;
}
