import dbConnect from '../../../lib/dbConnect';
import { methodNotAllowed, sendValidationError, withApiErrors } from '../../../lib/apiHelpers';
import { registerSchema } from '../../../lib/validation';
import User, { EMAIL_COLLATION } from '../../../models/User';

const DUPLICATE_KEY = 11000;
const ALREADY_REGISTERED = 'An account with this email already exists.';

async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  // Validated before any query, so the body can't put query operators into the email
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, parsed.error.issues[0].message);
  const { name, email, password } = parsed.data;

  await dbConnect();

  try {
    // Case-insensitive, so ana@example.com can't sign up beside an existing Ana@example.com
    const existingUser = await User.findOne({ email }).collation(EMAIL_COLLATION);
    if (existingUser) {
      return res.status(400).json({ message: ALREADY_REGISTERED });
    }

    // Password hashing is handled in the User model
    const user = await User.create({ name, email, password, role: 'teacher' });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Two sign-ups with the same email at once: the unique index stops the second
    if (error?.code === DUPLICATE_KEY) {
      return res.status(400).json({ message: ALREADY_REGISTERED });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Error creating user' });
  }
}

export default withApiErrors(handler);
