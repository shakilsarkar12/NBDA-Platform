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
  // Mock SMS gateway — log OTP to terminal for local/testing use only.
  console.log("────────────────────────────────────────");
  console.log("[sms:mock] OTP delivery (development only)");
  console.log(`[sms:mock] To:   ${phone}`);
  console.log(`[sms:mock] Code: ${code}`);
  console.log("[sms:mock] Expires in 5 minutes");
  console.log("────────────────────────────────────────");

  // TODO: Replace mock with Greenweb or BulkSMSBD when ready:
  // if (env.smsProvider === 'greenweb') await sendViaGreenweb(phone, code);
  // if (env.smsProvider === 'bulksmsbd') await sendViaBulkSmsBd(phone, code);
}
