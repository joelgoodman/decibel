import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Theme } from '@/lib/themes/types'

interface ThemeCardProps {
  theme: Theme
  onActivate: () => void
  onUninstall: () => void
}

export function ThemeCard({ theme, onActivate, onUninstall }: ThemeCardProps) {
  return (
    <Card className="overflow-hidden">
      {theme.preview && (
        <div className="relative h-48">
          <img
            src={theme.preview}
            alt={`${theme.name} preview`}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{theme.name}</h3>
          <Badge>v{theme.version}</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-4">{theme.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">By {theme.author}</p>
          <div className="space-x-2">
            <Button variant="outline" onClick={onUninstall}>
              Uninstall
            </Button>
            <Button onClick={onActivate}>
              Activate
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}