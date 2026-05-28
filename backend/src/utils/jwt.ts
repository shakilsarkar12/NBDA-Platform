import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./errors.js";

export interface AccessTokenPayload {
  sub: string;
  phone: string;
  role: string;
  uniqueId?: string;
  iat?: number;
  exp?: number;
}

export function extractBearerToken(header?: string): string {
  if (!header) {
    throw new AppError("Authorization header missing", "UNAUTHORIZED", 401);
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AppError("Invalid Authorization header", "UNAUTHORIZED", 401);
  }

  return token;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
  } catch {
    throw new AppError("Invalid or expired access token", "UNAUTHORIZED", 401);
  }
}

