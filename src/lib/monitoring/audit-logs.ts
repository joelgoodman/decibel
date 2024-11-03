import { prisma } from '../prisma'

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

export interface AuditLogEntry {
  action: AuditAction
  entityType: string
  entityId: string
  userId: string
  metadata?: Record<string, any>
}

export async function createAuditLog({
  action,
  entityType,
  entityId,
  userId,
  metadata,
}: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        metadata,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs({
  entityType,
  entityId,
  userId,
  startDate,
  endDate,
  limit = 50,
  offset = 0,
}: {
  entityType?: string
  entityId?: string
  userId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  return prisma.auditLog.findMany({
    where: {
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(userId && { userId }),
      ...(startDate && endDate && {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      }),
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}