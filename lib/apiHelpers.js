import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';

/**
 * Return the signed-in session, or send a 401 and return null.
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export async function requireSession(req, res) {
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
 */
export function sendValidationError(res, error) {
  return res.status(400).json({
    message: 'Invalid request',
    issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  });
}
