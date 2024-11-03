import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Theme } from '@/lib/themes/types'
import { ThemeCard } from './theme-card'

interface ThemeListProps {
  themes: Theme[]
  isLoading: boolean
  onActivate: (themeId: string) => void
  onUninstall: (themeId: string) => void
}

export function ThemeList({
  themes,
  isLoading,
  onActivate,
  onUninstall,
}: ThemeListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-48 animate-pulse bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          onActivate={() => onActivate(theme.id)}
          onUninstall={() => onUninstall(theme.id)}
        />
      ))}
    </div>
  )
}