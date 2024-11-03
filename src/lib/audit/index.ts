import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { NextRequest } from 'next/server'

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'restore'
  | 'login'
  | 'logout'
  | 'settings_change'

export interface AuditLogOptions {
  action: AuditAction
  entityType: string
  entityId: string
  metadata?: Record<string, any>
  userId?: string
}

export async function createAuditLog(
  req: NextRequest,
  options: AuditLogOptions
) {
  const session = await getSession(req)
  const userId = options.userId || session?.userId

  if (!userId) {
    throw new Error('User ID is required for audit logging')
  }

  return prisma.auditLog.create({
    data: {
      userId,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      metadata: options.metadata,
    },
  })
}

export async function getAuditLogs(options: {
  userId?: string
  entityType?: string
  entityId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  return prisma.auditLog.findMany({
    where: {
      ...(options.userId && { userId: options.userId }),
      ...(options.entityType && { entityType: options.entityType }),
      ...(options.entityId && { entityId: options.entityId }),
      ...(options.startDate && options.endDate && {
        createdAt: {
          gte: options.startDate,
          lte: options.endDate,
        },
      }),
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
    skip: options.offset,
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })
}