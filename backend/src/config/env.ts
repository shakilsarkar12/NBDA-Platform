import "dotenv/config";

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),
  mongodbUri: requireEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/nbda"),
  redisUrl: requireEnv("REDIS_URL", "redis://127.0.0.1:6379"),
  clientUrl: requireEnv("CLIENT_URL", "http://localhost:3000"),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  isProduction: process.env.NODE_ENV === "production",
} as const;
