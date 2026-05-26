import type { Request, Response } from "express";
import type { Redis } from "ioredis";
import { getRedis } from "../config/redis.js";

export interface GraphQLContext {
  req: Request;
  res: Response;
  redis: Redis;
}

export function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): GraphQLContext {
  return {
    req,
    res,
    redis: getRedis(),
  };
}
