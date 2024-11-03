const { build } = require('vite')
const { visualizer } = require('rollup-plugin-visualizer')
const { resolve } = require('path')

async function analyzeBuild() {
  try {
    await build({
      configFile: resolve(__dirname, '../vite.config.ts'),
      mode: 'production',
      plugins: [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    })
  } catch (error) {
    console.error('Build analysis failed:', error)
    process.exit(1)
  }
}

analyzeBuild()