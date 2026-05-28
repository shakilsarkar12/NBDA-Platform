import type { Request, Response } from "express";
import type { Redis } from "ioredis";
import { getRedis } from "../config/redis.js";
import { extractBearerToken, verifyAccessToken } from "../utils/jwt.js";

export interface GraphQLContext {
  req: Request;
  res: Response;
  redis: Redis;
  authUserId: string | null;
}

export function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): GraphQLContext {
  const readTokenFromCookie = () => {
    const cookie = req.headers.cookie;
    if (!cookie) return null;
    const match = cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("nbda_token="));
    if (!match) return null;
    return decodeURIComponent(match.slice("nbda_token=".length));
  };

  let authUserId: string | null = null;
  try {
    const token = req.headers.authorization
      ? extractBearerToken(req.headers.authorization)
      : readTokenFromCookie();
    if (!token) {
      throw new Error("Missing token");
    }
    authUserId = verifyAccessToken(token).sub;
  } catch {
    authUserId = null;
  }

  return {
    req,
    res,
    redis: getRedis(),
    authUserId,
  };
}
