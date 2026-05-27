export function isValidBdPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) return true;
  if (digits.startsWith("01") && digits.length === 11) return true;
  return false;
}

