/**
 * Sending email through Resend. Used for share emails.
 *
 * To try it without sending anything, set RESEND_BASE_URL to a local server:
 * the SDK reads it, so the request arrives there and never reaches Resend.
 */

import { Resend } from 'resend';

/**
 * Email settings from the environment, or null when email isn't set up.
 * EMAIL_FROM must use an address at a domain verified in Resend.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ apiKey: string, from: string } | null}
 */
export function getEmailConfig(env = process.env) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

/**
 * Send one email. Resend reports a refused email in its response rather than
 * by throwing, so this throws, and the route answers with an error.
 * @param {{ apiKey: string, from: string }} config
 * @param {{ to: string, subject: string, text: string, html: string }} mail
 * @returns {Promise<{ id: string }>}
 */
export async function sendEmail(config, mail) {
  const resend = new Resend(config.apiKey);
  const { data, error } = await resend.emails.send({ from: config.from, ...mail });
  if (error) {
    throw new Error(`Resend refused the email: ${error.name} (${error.statusCode ?? 'no status'}): ${error.message}`);
  }
  return data;
}
