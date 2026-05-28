import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    await cleanupLegacyUserIndexes();
    console.log("[mongodb] connected");
  } catch (error) {
    console.error("\n[mongodb] connection failed");
    console.error(`  URI: ${env.mongodbUri}`);
    console.error(
      "  Fix: Start MongoDB locally, or set MONGODB_URI in backend/.env (e.g. MongoDB Atlas)."
    );
    console.error(
      "  Quick start: from repo root run  npm run docker:up\n"
    );
    throw error;
  }
}

async function cleanupLegacyUserIndexes(): Promise<void> {
  // Legacy schema previously had a unique `email` index; current user model
  // no longer uses email. If the index still exists, it can cause E11000
  // duplicate key errors on `email: null` for new registrations.
  const collections = ["Users", "users"];

  for (const collectionName of collections) {
    try {
      await mongoose.connection.collection(collectionName).dropIndex("email_1");
      console.log(`[mongodb] dropped legacy ${collectionName}.email_1 index`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes("index not found") ||
        message.includes("ns not found")
      ) {
        continue;
      }
      console.warn(
        `[mongodb] could not drop legacy ${collectionName}.email_1 index:`,
        message
      );
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log("[mongodb] disconnected");
}
