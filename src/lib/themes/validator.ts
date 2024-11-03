import { themeSchema, type Theme } from './types'

export async function validateTheme(theme: Theme) {
  // Validate schema
  const validated = themeSchema.parse(theme)

  // Validate file paths
  const invalidPaths = validated.files.filter(file => !isValidPath(file.path))
  if (invalidPaths.length > 0) {
    throw new Error(`Invalid file paths: ${invalidPaths.map(f => f.path).join(', ')}`)
  }

  // Validate required files
  const requiredFiles = ['theme.css', 'theme.js']
  const missingFiles = requiredFiles.filter(
    file => !validated.files.some(f => f.path === file)
  )
  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`)
  }

  return validated
}

function isValidPath(path: string): boolean {
  // Prevent directory traversal
  if (path.includes('..')) return false

  // Only allow certain file extensions
  const allowedExtensions = ['.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg']
  const hasAllowedExtension = allowedExtensions.some(ext => path.endsWith(ext))
  if (!hasAllowedExtension) return false

  // Only allow alphanumeric characters, hyphens, underscores, dots, and forward slashes
  const validPathRegex = /^[a-zA-Z0-9\-_./]+$/
  return validPathRegex.test(path)
}