# Menu Management

## Overview

The menu management system allows for creating and managing navigation menus throughout the application.

## Menu Structure

```typescript
interface MenuItem {
  id: string
  label: string
  type: 'link' | 'page' | 'category' | 'custom'
  url?: string
  pageId?: string
  categoryId?: string
  target: '_self' | '_blank'
  icon?: string
  children: MenuItem[]
  visibility: {
    loggedIn: boolean
    roles: string[]
    devices: ('desktop' | 'tablet' | 'mobile')[]
  }
}

interface Menu {
  id: string
  name: string
  location: 'header' | 'footer' | 'sidebar'
  items: MenuItem[]
  settings: {
    showIcons: boolean
    expandable: boolean
    maxDepth: number
    mobileBreakpoint: number
  }
}
```

## Usage

### Creating a Menu

```typescript
const menu = await createMenu({
  name: 'Main Navigation',
  location: 'header',
  items: [
    {
      label: 'Home',
      type: 'link',
      url: '/',
      target: '_self'
    },
    {
      label: 'Blog',
      type: 'page',
      pageId: 'blog-page-id',
      children: [
        {
          label: 'Categories',
          type: 'category',
          categoryId: 'categories-id'
        }
      ]
    }
  ]
})
```

### Rendering Menus

```typescript
import { getMenuByLocation } from '@/lib/menu/menu-manager'

const menu = await getMenuByLocation('header')
```