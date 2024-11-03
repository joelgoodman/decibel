import { type Theme } from './types'

export async function loadTheme(theme: Theme) {
  // Create theme directory if it doesn't exist
  const themeDir = `/themes/${theme.id}`
  await createDirectory(themeDir)

  // Write theme files
  await Promise.all(
    theme.files.map(async (file) => {
      const filePath = `${themeDir}/${file.path}`
      await writeFile(filePath, file.content)
    })
  )

  // Load theme CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `/themes/${theme.id}/theme.css`
  document.head.appendChild(link)

  // Load theme JavaScript
  const script = document.createElement('script')
  script.src = `/themes/${theme.id}/theme.js`
  document.body.appendChild(script)

  // Apply theme settings
  if (theme.settings) {
    applyThemeSettings(theme.settings)
  }
}

async function createDirectory(path: string) {
  try {
    await fetch('/api/admin/themes/directory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
  } catch (error) {
    console.error('Failed to create theme directory:', error)
    throw error
  }
}

async function writeFile(path: string, content: string) {
  try {
    await fetch('/api/admin/themes/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
    })
  } catch (error) {
    console.error('Failed to write theme file:', error)
    throw error
  }
}

function applyThemeSettings(settings: Record<string, any>) {
  const root = document.documentElement

  // Apply CSS variables
  Object.entries(settings).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        root.style.setProperty(`--${key}-${subKey}`, subValue as string)
      })
    } else {
      root.style.setProperty(`--${key}`, value as string)
    }
  })
}