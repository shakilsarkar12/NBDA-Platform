import { randomInt, timingSafeEqual } from "node:crypto";

/** Cryptographically secure 6-digit OTP (100000–999999). */
export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

export function verifyOtpCode(stored: string, provided: string): boolean {
  const a = Buffer.from(stored.padStart(6, "0"));
  const b = Buffer.from(provided.padStart(6, "0"));

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}
