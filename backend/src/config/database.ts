import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
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

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log("[mongodb] disconnected");
}
