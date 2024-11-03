# Theme System

## Overview

The theme system provides a flexible way to customize the appearance and layout of the application.

## Theme Structure

```typescript
interface Theme {
  id: string
  name: string
  description: string
  version: string
  author: string
  preview?: string
  settings?: ThemeSettings
  files: ThemeFile[]
}

interface ThemeSettings {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  typography: {
    fontFamily: string
    headings: {
      fontFamily: string
      fontWeight: string
    }
  }
  spacing: {
    unit: number
    container: {
      maxWidth: string
      padding: string
    }
  }
  borderRadius: string
  boxShadow: string
}
```

## Creating Themes

1. Create a new directory in `themes/`:
```
themes/
  my-theme/
    theme.json
    theme.css
    theme.js
    assets/
```

2. Define theme metadata in `theme.json`:
```json
{
  "id": "my-theme",
  "name": "My Theme",
  "description": "A custom theme",
  "version": "1.0.0",
  "author": "Your Name",
  "settings": {
    "colors": {
      "primary": "#2563eb"
    }
  }
}
```

3. Add styles in `theme.css`:
```css
:root {
  --primary: theme('colors.primary');
}

.container {
  max-width: var(--container-max-width);
}
```

## Installing Themes

```typescript
import { installTheme } from '@/lib/themes/manager'

await installTheme({
  id: 'my-theme',
  // ... theme data
})
```

## Activating Themes

```typescript
import { activateTheme } from '@/lib/themes/manager'

await activateTheme('my-theme')
```