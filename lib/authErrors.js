/**
 * Sign-in error codes shared by the server (lib/authOptions.js) and the
 * sign-in forms. Kept apart from authOptions so the forms don't pull
 * server code into the browser bundle.
 */

import { RATE_LIMITS } from './limits';

/** Thrown by authorize() when sign-in attempts are over the limit; NextAuth passes it to signIn() as `error`. */
export const TOO_MANY_SIGN_INS = 'TooManySignInAttempts';

const windowMinutes = Math.round(RATE_LIMITS.signInIp.windowMs / 60000);

/** What to tell the person signing in for an `error` from signIn(). */
export const signInErrorMessage = (error) =>
  error === TOO_MANY_SIGN_INS
    ? `Too many sign-in attempts. Please wait up to ${windowMinutes} minutes and try again.`
    : 'Invalid email or password.';
