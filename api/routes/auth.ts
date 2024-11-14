import { Router } from 'express';
import { z } from 'zod';
import { createUser, getUserByEmail } from '../models/user';
import { 
  generateTokenPair, 
  rotateTokens, 
  revokeSession, 
  revokeAllUserSessions,
  syncUserRoles 
} from '../services/auth';
import { auditLogger, AuditAction } from '../lib/audit';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

const authCallbackSchema = z.object({
  code: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
  }),
});

router.post('/callback', async (req, res, next) => {
  try {
    const { user } = authCallbackSchema.parse(req.body);
    
    // Create or update user
    let dbUser = await getUserByEmail(user.email);
    if (!dbUser) {
      const name = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : null;
      dbUser = await createUser({ email: user.email, name });
    }

    // Sync roles with WorkOS
    await syncUserRoles(dbUser.id, user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokenPair(
      dbUser.id,
      req.ip
    );

    // Set HTTP-only cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    auditLogger.log(req, AuditAction.LOGIN, 'USER', {
      id: dbUser.id,
      email: dbUser.email
    });

    res.json({ user: dbUser });
  } catch (error) {
    next(error);
  }
});

// ... rest of the auth routes remain the same