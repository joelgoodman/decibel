import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(import.meta.env.VITE_WORKOS_API_KEY);
const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID;

export async function sendMagicLink(email: string, redirectUri: string) {
  try {
    const session = await workos.passwordless.createSession({
      email,
      type: 'MagicLink',
      redirectUri,
    });
    return session;
  } catch (error) {
    console.error('Error sending magic link:', error);
    throw new Error('Failed to send magic link');
  }
}

export async function authenticateSession(code: string) {
  try {
    const { user } = await workos.passwordless.authenticateSession({
      code,
      clientId,
    });
    return user;
  } catch (error) {
    console.error('Error authenticating session:', error);
    throw new Error('Failed to authenticate session');
  }
}

export async function getUserRoles(userId: string) {
  try {
    const { roles } = await workos.userManagement.user.get(userId);
    return roles.map(role => role.slug);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw new Error('Failed to fetch user roles');
  }
}