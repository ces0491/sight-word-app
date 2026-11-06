import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';
import { ConfigError } from './errors';

/**
 * Wrap an API route so an uncaught error becomes a JSON response: 503 for
 * missing configuration, 500 otherwise. The detail goes to the server log only.
 * @param {(req: import('next').NextApiRequest, res: import('next').NextApiResponse) => Promise<unknown>} handler
 */
export function withApiErrors(handler) {
  return async function apiRoute(req, res) {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error(`Unhandled error in ${req.method} ${req.url}:`, error);
      if (res.headersSent) return undefined;
      if (error instanceof ConfigError) {
        return res.status(503).json({
          message: 'This service is not configured yet. Please contact the administrator.',
          code: 'SERVICE_NOT_CONFIGURED',
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Return the signed-in session, or send a 401 and return null.
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export async function requireSession(req, res) {
  // Without the secret, NextAuth throws in production; answer with the 503 for missing configuration instead
  if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
    throw new ConfigError('NEXTAUTH_SECRET is not set');
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return session;
}

/**
 * Send a 405 with the Allow header set.
 * @param {import('next').NextApiResponse} res
 * @param {string[]} allowed
 */
export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  return res.status(405).json({ message: 'Method not allowed' });
}

/**
 * Send a 400 listing the fields that failed validation.
 * @param {import('next').NextApiResponse} res
 * @param {import('zod').ZodError} error
 * @param {string} [message] - Shown to the user; defaults to a generic one
 */
export function sendValidationError(res, error, message = 'Invalid request') {
  return res.status(400).json({
    message,
    issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  });
}
