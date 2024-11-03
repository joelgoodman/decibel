import { prisma } from '@/lib/prisma'
import { type Menu } from '@prisma/client'
import { validateMenu } from './validator'

export async function createMenu(data: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>) {
  // Validate menu before saving
  await validateMenu(data)

  return prisma.menu.create({
    data,
  })
}

export async function updateMenu(
  id: string,
  data: Partial<Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>>
) {
  const menu = await prisma.menu.findUnique({
    where: { id },
  })

  if (!menu) {
    throw new Error('Menu not found')
  }

  // Validate updated menu
  await validateMenu({
    ...menu,
    ...data,
  })

  return prisma.menu.update({
    where: { id },
    data,
  })
}

export async function deleteMenu(id: string) {
  return prisma.menu.delete({
    where: { id },
  })
}

export async function getMenu(id: string) {
  return prisma.menu.findUnique({
    where: { id },
  })
}

export async function listMenus() {
  return prisma.menu.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getMenuByLocation(location: string) {
  return prisma.menu.findFirst({
    where: { location },
  })
}