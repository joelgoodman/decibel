import { writable } from 'svelte/store';

type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
  const { subscribe, set } = writable<Theme>(
    (localStorage.getItem('theme') as Theme) || 'system'
  );

  return {
    subscribe,
    set: (value: Theme) => {
      localStorage.setItem('theme', value);
      set(value);
      updateTheme(value);
    },
    initialize: () => {
      const theme = localStorage.getItem('theme') as Theme || 'system';
      set(theme);
      updateTheme(theme);
    }
  };
}

function updateTheme(theme: Theme) {
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  document.documentElement.classList.toggle('dark', isDark);
}

export const theme = createThemeStore();