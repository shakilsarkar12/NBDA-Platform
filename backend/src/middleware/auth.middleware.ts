import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";
import { extractBearerToken, verifyAccessToken } from "../utils/jwt.js";

function readTokenFromCookie(req: Request): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;

  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("nbda_token="));

  if (!match) return null;
  return decodeURIComponent(match.slice("nbda_token=".length));
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token =
      req.headers.authorization
        ? extractBearerToken(req.headers.authorization)
        : readTokenFromCookie(req);

    if (!token) {
      throw new AppError("Authentication required", "UNAUTHORIZED", 401);
    }

    const payload = verifyAccessToken(token);

    req.auth = {
      userId: payload.sub,
      phone: payload.phone,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function assertAuthenticated(req: Request): NonNullable<Request["auth"]> {
  if (!req.auth) {
    throw new AppError("Authentication required", "UNAUTHORIZED", 401);
  }
  return req.auth;
}

