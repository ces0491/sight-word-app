import crypto from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '../../../../lib/dbConnect';
import Story from '../../../../models/Story';
import { requireSession, methodNotAllowed, sendValidationError, withApiErrors } from '../../../../lib/apiHelpers';
import { shareRequestSchema } from '../../../../lib/validation';
import { enforceRateLimit } from '../../../../lib/rateLimit';
import { RATE_LIMITS } from '../../../../lib/limits';
import { buildShareEmail, getSmtpConfig, sendMail } from '../../../../lib/shareEmail';

async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = await requireSession(req, res);
  if (!session) return;

  const smtp = getSmtpConfig();
  const baseUrl = process.env.NEXTAUTH_URL;
  if (!smtp || !baseUrl) {
    return res.status(503).json({
      message: 'Email service not configured. Please contact the administrator.',
      code: 'EMAIL_NOT_CONFIGURED',
    });
  }

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Story not found' });
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

    // One token per story, reused for later shares so earlier links keep working.
    if (!story.shareToken) {
      story.shareToken = crypto.randomBytes(32).toString('base64url');
      await story.save();
    }

    const link = `${baseUrl.replace(/\/+$/, '')}/shared-stories/${story._id}?token=${encodeURIComponent(story.shareToken)}`;
    const mail = buildShareEmail({ senderName: session.user.name, story, link, message });
    await sendMail(smtp, { to: email, ...mail });

    await Story.updateOne({ _id: story._id }, { $addToSet: { sharedWith: email } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sharing story:', error);
    return res.status(500).json({ message: 'Error sharing story' });
  }
}

export default withApiErrors(handler);
