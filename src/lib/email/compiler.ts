import mjml2html from 'mjml';
import type { MJMLParseResults } from 'mjml-core';

interface CompileOptions {
  minify?: boolean;
  validationLevel?: 'strict' | 'soft' | 'skip';
  keepComments?: boolean;
}

export function compileMjml(mjmlContent: string, options: CompileOptions = {}): MJMLParseResults {
  try {
    return mjml2html(mjmlContent, {
      minify: options.minify ?? true,
      validationLevel: options.validationLevel ?? 'soft',
      keepComments: options.keepComments ?? false
    });
  } catch (error) {
    console.error('MJML compilation error:', error);
    throw new Error('Failed to compile email template');
  }
}

export function renderTemplate(template: string, data: Record<string, any>): string {
  // Simple template variable replacement
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = key.trim().split('.').reduce((obj: any, k: string) => obj?.[k], data);
    return value ?? match;
  });
}

export function compileTemplate(mjmlTemplate: string, data: Record<string, any>): string {
  const renderedMjml = renderTemplate(mjmlTemplate, data);
  const { html, errors } = compileMjml(renderedMjml);

  if (errors.length > 0) {
    console.error('MJML template errors:', errors);
    throw new Error('Email template contains errors');
  }

  return html;
}