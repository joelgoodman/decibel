import { z } from 'zod';

// Define valid roles that match WorkOS configuration
export const validRoles = [
  'owner',
  'admin',
  'editor',
  'author',
  'subscriber'
] as const;

export const roleSchema = z.enum(validRoles);

export const rolePermissions: Record<typeof validRoles[number], string[]> = {
  owner: ['*'],
  admin: [
    'manage:users',
    'manage:content',
    'manage:taxonomies',
    'manage:settings',
    'publish:content'
  ],
  editor: [
    'read:content',
    'write:content',
    'publish:content',
    'manage:taxonomies'
  ],
  author: [
    'read:content',
    'write:content',
    'read:taxonomies'
  ],
  subscriber: [
    'read:content'
  ]
};

export function hasPermission(userRoles: string[], requiredPermission: string): boolean {
  // Check if user has owner role which grants all permissions
  if (userRoles.includes('owner')) return true;

  // Get all permissions for the user's roles
  const permissions = userRoles.flatMap(role => 
    rolePermissions[role as typeof validRoles[number]] || []
  );

  // Check if user has the specific permission
  return permissions.includes(requiredPermission) || permissions.includes('*');
}