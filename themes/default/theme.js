// Theme initialization and runtime functionality
(function() {
  // Initialize theme settings
  function initTheme() {
    const root = document.documentElement
    const theme = JSON.parse(document.getElementById('theme-data')?.textContent || '{}')

    // Apply theme settings to CSS variables
    Object.entries(theme.settings || {}).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--${key}-${subKey}`, subValue)
        })
      } else {
        root.style.setProperty(`--${key}`, value)
      }
    })
  }

  // Handle system color scheme changes
  function handleColorScheme() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateColorScheme = (e: MediaQueryListEvent | MediaQueryList) => {
      document.documentElement.classList.toggle('dark', e.matches)
    }

    darkModeMediaQuery.addEventListener('change', updateColorScheme)
    updateColorScheme(darkModeMediaQuery)
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme)
  } else {
    initTheme()
  }

  // Handle color scheme
  handleColorScheme()
})()