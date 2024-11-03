const { build } = require('vite')
const { resolve } = require('path')
const fs = require('fs/promises')

async function buildTheme(themePath) {
  try {
    const themeConfig = JSON.parse(
      await fs.readFile(resolve(themePath, 'theme.json'), 'utf-8')
    )

    // Build theme assets
    await build({
      root: themePath,
      build: {
        outDir: resolve('dist/themes', themeConfig.id),
        emptyOutDir: true,
        rollupOptions: {
          input: {
            theme: resolve(themePath, 'theme.js'),
          },
          output: {
            entryFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
          },
        },
      },
    })

    // Copy theme metadata
    await fs.copyFile(
      resolve(themePath, 'theme.json'),
      resolve('dist/themes', themeConfig.id, 'theme.json')
    )

    console.log(`Theme "${themeConfig.name}" built successfully`)
  } catch (error) {
    console.error(`Theme build failed:`, error)
    process.exit(1)
  }
}

// Build all themes in the themes directory
async function buildAllThemes() {
  const themesDir = resolve(__dirname, '../themes')
  const themes = await fs.readdir(themesDir)

  for (const theme of themes) {
    const themePath = resolve(themesDir, theme)
    const stat = await fs.stat(themePath)
    if (stat.isDirectory()) {
      await buildTheme(themePath)
    }
  }
}

buildAllThemes()