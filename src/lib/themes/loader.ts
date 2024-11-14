import type { Theme } from './types';

const THEME_REGISTRY = '/api/themes';

export async function loadTheme(name: string): Promise<Theme> {
  try {
    // Fetch theme metadata
    const response = await fetch(`${THEME_REGISTRY}/${name}`);
    if (!response.ok) {
      throw new Error(`Failed to load theme: ${name}`);
    }

    const theme = await response.json();

    // Load theme assets
    await Promise.all([
      loadStyles(theme.assets.styles),
      loadScripts(theme.assets.scripts)
    ]);

    return theme;
  } catch (error) {
    console.error('Theme loading error:', error);
    throw error;
  }
}

async function loadStyles(urls: string[]): Promise<void> {
  const head = document.head;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    head.appendChild(link);
  });
}

async function loadScripts(urls: string[]): Promise<void> {
  await Promise.all(urls.map(url => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }));
}