<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Handlebars from 'handlebars';
  import { loadTheme } from './loader';
  import type { Theme, ThemeContext } from './types';

  export let themeName: string;
  export let data: Record<string, any> = {};

  const themeStore = writable<Theme | null>(null);
  const error = writable<string | null>(null);
  let rendered = '';

  // Register custom helpers
  Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
    return new Date(date).toLocaleDateString();
  });

  Handlebars.registerHelper('markdown', (content: string) => {
    // Sanitize and render markdown content
    return new Handlebars.SafeString(content);
  });

  onMount(async () => {
    try {
      const theme = await loadTheme(themeName);
      themeStore.set(theme);
      
      // Register theme partials
      Object.entries(theme.partials).forEach(([name, content]) => {
        Handlebars.registerPartial(name, content);
      });

      // Create theme context
      const context: ThemeContext = {
        theme: {
          name: theme.name,
          version: theme.version,
          assets: theme.assets
        },
        data,
        helpers: theme.helpers || {}
      };

      // Render theme template
      const template = Handlebars.compile(theme.template);
      rendered = template(context);
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Failed to load theme');
    }
  });
</script>

{#if $error}
  <div class="theme-error">
    <p>Error loading theme: {$error}</p>
  </div>
{:else if rendered}
  {@html rendered}
{:else}
  <div class="theme-loading">
    Loading theme...
  </div>
{/if}

<style>
  .theme-error {
    padding: var(--space-4);
    color: var(--error);
    text-align: center;
  }

  .theme-loading {
    padding: var(--space-4);
    color: var(--text-secondary);
    text-align: center;
  }
</style>