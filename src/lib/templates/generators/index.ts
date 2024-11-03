import { type Template, type TemplateConfig } from '../types'
import { generateReactTemplate } from './react'
import { generateVueTemplate } from './vue'
import { generateSvelteTemplate } from './svelte'

export async function generateTemplate(config: TemplateConfig): Promise<Template> {
  switch (config.framework) {
    case 'react':
      return generateReactTemplate(config)
    case 'vue':
      return generateVueTemplate(config)
    case 'svelte':
      return generateSvelteTemplate(config)
    default:
      throw new Error(`Unsupported framework: ${config.framework}`)
  }
}