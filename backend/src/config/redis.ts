import { Redis } from "ioredis";
import { env } from "./env.js";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
    });
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  try {
    const pong = await client.ping();
    console.log(`[redis] connected (${pong})`);
  } catch (error) {
    console.error("\n[redis] connection failed");
    console.error(`  URL: ${env.redisUrl}`);
    console.error(
      "  Fix: Start Redis locally, or set REDIS_URL in backend/.env."
    );
    console.error("  Quick start: from repo root run  npm run docker:up\n");
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("[redis] disconnected");
  }
}
