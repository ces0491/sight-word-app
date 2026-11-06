import bcrypt from 'bcrypt';
import dbConnect from '../../lib/dbConnect';
import { requireSession, methodNotAllowed, sendValidationError, withApiErrors } from '../../lib/apiHelpers';
import { deleteAccountSchema } from '../../lib/validation';
import { enforceRateLimit } from '../../lib/rateLimit';
import { RATE_LIMITS } from '../../lib/limits';
import User from '../../models/User';
import Story from '../../models/Story';

/**
 * DELETE: delete the signed-in account and its saved stories, after checking
 * the password again. Share links for those stories stop working with them.
 * Word usage counts aren't linked to accounts, so they stay. The client
 * signs out afterwards.
 */
async function handler(req, res) {
  if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE']);

  const session = await requireSession(req, res);
  if (!session) return;

  const parsed = deleteAccountSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, parsed.error.issues[0].message);

  await dbConnect();

  // Each attempt checks the password, so a stolen session can't use this to guess it
  const allowed = await enforceRateLimit(res, {
    scope: 'deleteAccount',
    key: session.user.id,
    ...RATE_LIMITS.deleteAccount,
  });
  if (!allowed) return;

  try {
    const user = await User.findById(session.user.id);
    if (!user) return res.status(404).json({ message: 'Account not found' });

    const passwordMatches = await bcrypt.compare(parsed.data.password, user.password);
    if (!passwordMatches) return res.status(403).json({ message: "That password isn't right." });

    const { deletedCount } = await Story.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    return res.status(200).json({ success: true, storiesDeleted: deletedCount });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ message: 'Error deleting account' });
  }
}

export default withApiErrors(handler);
