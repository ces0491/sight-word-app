import crypto from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '../../../../lib/dbConnect';
import Story from '../../../../models/Story';
import { requireSession, methodNotAllowed, sendValidationError, withApiErrors } from '../../../../lib/apiHelpers';
import { shareRequestSchema } from '../../../../lib/validation';
import { enforceRateLimit } from '../../../../lib/rateLimit';
import { RATE_LIMITS } from '../../../../lib/limits';
import { buildShareEmail } from '../../../../lib/shareEmail';
import { getEmailConfig, sendEmail } from '../../../../lib/email';

/**
 * The story's share token, created if it has none. One token per story,
 * reused for later shares so earlier links keep working. The update only
 * applies while no token is set, so two first shares at once agree on one.
 */
async function ensureShareToken(story) {
  if (story.shareToken) return story.shareToken;
  await Story.updateOne(
    { _id: story._id, shareToken: null },
    { $set: { shareToken: crypto.randomBytes(32).toString('base64url') } }
  );
  const stored = await Story.findById(story._id).select('+shareToken');
  return stored.shareToken;
}

/** POST: email a link to the story. */
async function share(req, res, session, id) {
  const emailConfig = getEmailConfig();
  const baseUrl = process.env.NEXTAUTH_URL;
  if (!emailConfig || !baseUrl) {
    return res.status(503).json({
      message: 'Email service not configured. Please contact the administrator.',
      code: 'EMAIL_NOT_CONFIGURED',
    });
  }

  const parsed = shareRequestSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { email, message } = parsed.data;

  await dbConnect();

  try {
    const story = await Story.findOne({ _id: id, userId: session.user.id }).select('+shareToken');
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const allowed = await enforceRateLimit(res, {
      scope: 'shareEmail',
      key: session.user.id,
      ...RATE_LIMITS.shareEmail,
    });
    if (!allowed) return;

    const token = await ensureShareToken(story);
    const link = `${baseUrl.replace(/\/+$/, '')}/shared-stories/${story._id}?token=${encodeURIComponent(token)}`;
    const mail = buildShareEmail({ senderName: session.user.name, story, link, message });
    await sendEmail(emailConfig, { to: email, ...mail });

    await Story.updateOne({ _id: story._id }, { $addToSet: { sharedWith: email } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sharing story:', error);
    return res.status(500).json({ message: 'Error sharing story' });
  }
}

/** DELETE: stop sharing. Every link sent so far stops working; a later share sends a new one. */
async function stopSharing(res, session, id) {
  await dbConnect();

  try {
    const result = await Story.updateOne(
      { _id: id, userId: session.user.id },
      { $unset: { shareToken: 1 }, $set: { sharedWith: [] } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Story not found' });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error stopping sharing:', error);
    return res.status(500).json({ message: 'Error stopping sharing' });
  }
}

async function handler(req, res) {
  if (!['POST', 'DELETE'].includes(req.method)) return methodNotAllowed(res, ['POST', 'DELETE']);

  const session = await requireSession(req, res);
  if (!session) return;

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Story not found' });
  }

  return req.method === 'POST' ? share(req, res, session, id) : stopSharing(res, session, id);
}

export default withApiErrors(handler);
