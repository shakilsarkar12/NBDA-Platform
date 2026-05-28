import type { UserRole } from "./enums.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        phone: string;
        role: UserRole | string;
      };
    }
  }
}

export {};

