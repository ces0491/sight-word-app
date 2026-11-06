import crypto from 'crypto';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import dbConnect from './dbConnect';
import User, { EMAIL_COLLATION } from '../models/User';
import { consumeRateLimit } from './rateLimit';
import { RATE_LIMITS } from './limits';
import { clientIp } from './clientIp';
import { TOO_MANY_SIGN_INS } from './authErrors';

/**
 * Check an email and password. Returns the user for the session, or null.
 * Attempts are counted per IP address and per email address before the
 * password is checked; over either limit it throws TOO_MANY_SIGN_INS,
 * which NextAuth hands to signIn() as its `error`.
 *
 * @param {Record<string, unknown>} credentials
 * @param {{ headers?: Record<string, string> }} [req]
 */
export async function authorizeCredentials(credentials, req) {
  // Coerce to strings so a JSON body cannot pass a query object as the email.
  const email = typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : '';
  const password = typeof credentials?.password === 'string' ? credentials.password : '';
  if (!email || !password) return null;

  await dbConnect();

  // The email is hashed so addresses aren't kept in the rate-limit counters
  const emailKey = crypto.createHash('sha256').update(email).digest('hex').slice(0, 32);
  const [byIp, byEmail] = await Promise.all([
    consumeRateLimit({ scope: 'signInIp', key: clientIp(req?.headers), ...RATE_LIMITS.signInIp }),
    consumeRateLimit({ scope: 'signInEmail', key: emailKey, ...RATE_LIMITS.signInEmail }),
  ]);
  if (!byIp.allowed || !byEmail.allowed) throw new Error(TOO_MANY_SIGN_INS);

  // Case-insensitive, so accounts stored before emails were lower-cased still match
  const user = await User.findOne({ email }).collation(EMAIL_COLLATION);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * NextAuth configuration, shared by the auth route and by
 * `getServerSession` in the API routes.
 */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
