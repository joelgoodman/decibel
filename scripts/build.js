const { build } = require('vite')
const { resolve } = require('path')
const fs = require('fs/promises')

async function buildFrontend() {
  try {
    // Clean dist directory
    await fs.rm('dist', { recursive: true, force: true })

    // Build the application
    await build({
      configFile: resolve(__dirname, '../vite.config.ts'),
      mode: process.env.NODE_ENV || 'production',
    })

    // Copy static assets
    await fs.cp('public', 'dist/public', { recursive: true })

    // Generate build report
    const stats = await fs.stat('dist')
    console.log(`Build completed: ${(stats.size / 1024 / 1024).toFixed(2)}MB`)

  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

buildFrontend()