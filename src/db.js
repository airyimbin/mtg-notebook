//For improvement of search performance, it is recommended to have composite indexes on commonly used fields such as name, type_line, oracle_text, color_identity.
// Tim
// MongoDB connection helper for Railway/Atlas
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client;
let db;

export async function connectDB() {
  if (db) return { client, db };
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DBNAME || "mtg_deck_notebook";
  if (!uri) throw new Error("MONGODB_URI missing in .env");

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS:
      Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 0) || undefined,
  });
  await client.connect();
  db = client.db(dbName);
  return { client, db };
}

export function getDB() {
  if (!db) throw new Error("DB not connected yet");
  return db;
}
