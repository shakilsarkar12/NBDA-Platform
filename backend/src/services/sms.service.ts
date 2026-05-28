import { env } from "../config/env.js";

/**
 * SMS delivery abstraction.
 *
 * Production integrations (plug in when credentials are available):
 * - Greenweb SMS API: https://greenweb.com.bd/
 * - BulkSMSBD API: https://www.bulksmsbd.com/
 *
 * Example Greenweb (pseudo):
 *   await fetch('https://api.greenweb.com.bd/api.php', {
 *     method: 'POST',
 *     body: new URLSearchParams({
 *       token: env.greenwebToken,
 *       to: phone,
 *       message: `Your NBDA verification code is ${code}. Valid for 5 minutes.`,
 *     }),
 *   });
 *
 * Example BulkSMSBD (pseudo):
 *   await fetch('http://bulksmsbd.net/api/smsapi', {
 *     method: 'POST',
 *     body: new URLSearchParams({
 *       api_key: env.bulksmsbdApiKey,
 *       senderid: env.smsSenderId,
 *       number: phone,
 *       message: `NBDA OTP: ${code}`,
 *     }),
 *   });
 */

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  // Keep terminal log for local visibility.
  console.log("────────────────────────────────────────");
  console.log("[sms:otp] OTP delivery request");
  console.log(`[sms:otp] To:   ${phone}`);
  console.log(`[sms:otp] Code: ${code}`);
  console.log("[sms:otp] Expires in 5 minutes");
  console.log("────────────────────────────────────────");

  // Telegram forwarding is optional. If env vars are missing, skip silently.
  if (!env.telegramBotToken || !env.telegramChatId) {
    console.log("[sms:telegram] skipped (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set)");
    return;
  }

  const normalizedPhone = phone.startsWith("0")
    ? `+880${phone.slice(1)}`
    : phone;

  const message = [
    "🔔 NBDA Platform - New Registration Request!",
    `📱 Phone: ${normalizedPhone}`,
    `🔑 OTP Code: ${code}`,
  ].join("\n");

  try {
    const endpoint = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;
    const query = new URLSearchParams({
      chat_id: env.telegramChatId,
      text: message,
    });

    const response = await fetch(`${endpoint}?${query.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(
        `[sms:telegram] failed (${response.status}): ${responseText}`
      );
      return;
    }

    console.log("[sms:telegram] OTP forwarded successfully");
  } catch (error) {
    // Must never break registration flow if Telegram is down.
    console.error("[sms:telegram] request error:", error);
  }
}
