import { WorkOS } from '@workos-inc/node';
import { updateUserRoles, getUserWithRoles } from '../models/user';
import { logger } from '../lib/logger';
import { auditLogger, AuditAction } from '../lib/audit';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function syncUserRoles(userId: string, workosUserId: string): Promise<void> {
  try {
    // Get user roles from WorkOS
    const { roles } = await workos.userManagement.user.get(workosUserId);
    
    // Get current user roles from our database
    const user = await getUserWithRoles(userId);
    const currentRoles = user?.roles || [];
    
    // Map WorkOS roles to our system roles
    const workosRoles = roles.map(role => mapWorkOSRole(role.slug));
    
    // Only update if roles have changed
    if (!arraysEqual(currentRoles, workosRoles)) {
      await updateUserRoles(userId, workosRoles);
      
      logger.info({
        message: 'User roles synced with WorkOS',
        userId,
        previousRoles: currentRoles,
        newRoles: workosRoles
      });

      auditLogger.log({
        action: AuditAction.UPDATE,
        resource: 'USER',
        details: {
          id: userId,
          type: 'roles',
          previous: currentRoles,
          current: workosRoles
        }
      });
    }
  } catch (error) {
    logger.error('Failed to sync user roles with WorkOS:', error);
    throw error;
  }
}

// Map WorkOS role slugs to our system roles
function mapWorkOSRole(workosRole: string): string {
  const roleMap: Record<string, string> = {
    'owner': 'owner',
    'admin': 'admin',
    'editor': 'editor',
    'author': 'author',
    'subscriber': 'subscriber'
  };
  
  return roleMap[workosRole] || 'subscriber';
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}