/**
 * Normalizes Bangladesh-style phone numbers to digits-only storage format.
 * Accepts 01XXXXXXXXX or +8801XXXXXXXXX.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("880") && digits.length === 13) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith("01") && digits.length === 11) {
    return digits;
  }

  throw new Error("Invalid phone number. Use format 01XXXXXXXXX.");
}

export function isValidPhone(phone: string): boolean {
  try {
    normalizePhone(phone);
    return true;
  } catch {
    return false;
  }
}
