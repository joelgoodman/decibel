import { prisma } from '../prisma'
import { type Theme } from './types'
import { validateTheme } from './validator'
import { loadTheme } from './loader'

export async function installTheme(theme: Theme) {
  // Validate theme before installation
  await validateTheme(theme)

  // Save theme to database
  await prisma.settings.upsert({
    where: { key: `theme_${theme.id}` },
    update: {
      value: theme,
      type: 'THEME',
    },
    create: {
      key: `theme_${theme.id}`,
      value: theme,
      type: 'THEME',
    },
  })

  // Set as active theme if none is set
  const activeTheme = await prisma.settings.findFirst({
    where: { key: 'active_theme' },
  })

  if (!activeTheme) {
    await prisma.settings.create({
      data: {
        key: 'active_theme',
        value: { id: theme.id },
        type: 'THEME',
      },
    })
  }
}

export async function activateTheme(themeId: string) {
  const theme = await prisma.settings.findFirst({
    where: { key: `theme_${themeId}` },
  })

  if (!theme) {
    throw new Error('Theme not found')
  }

  await prisma.settings.upsert({
    where: { key: 'active_theme' },
    update: {
      value: { id: themeId },
    },
    create: {
      key: 'active_theme',
      value: { id: themeId },
      type: 'THEME',
    },
  })

  // Load theme files and apply settings
  await loadTheme(theme.value as Theme)
}

export async function uninstallTheme(themeId: string) {
  const activeTheme = await prisma.settings.findFirst({
    where: { key: 'active_theme' },
  })

  if (activeTheme?.value.id === themeId) {
    throw new Error('Cannot uninstall active theme')
  }

  await prisma.settings.delete({
    where: { key: `theme_${themeId}` },
  })
}

export async function listThemes() {
  const themes = await prisma.settings.findMany({
    where: {
      type: 'THEME',
      NOT: { key: 'active_theme' },
    },
  })

  return themes.map(t => t.value as Theme)
}

export async function getActiveTheme(): Promise<Theme | null> {
  const active = await prisma.settings.findFirst({
    where: { key: 'active_theme' },
  })

  if (!active) return null

  const theme = await prisma.settings.findFirst({
    where: { key: `theme_${active.value.id}` },
  })

  return theme ? (theme.value as Theme) : null
}