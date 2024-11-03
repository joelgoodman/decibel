import { useEffect } from 'react'

type Modifier = 'alt' | 'ctrl' | 'meta' | 'shift'
type Key = string
type Handler = (e: KeyboardEvent) => void
type Hotkey = [string, Handler]

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

function parseHotkey(hotkey: string): { modifiers: Set<Modifier>; key: Key } {
  const keys = hotkey.toLowerCase().split('+')
  const modifiers = new Set<Modifier>()
  
  keys.forEach((key) => {
    if (key === 'mod') {
      modifiers.add(isMac ? 'meta' : 'ctrl')
    } else if (key === 'alt' || key === 'ctrl' || key === 'meta' || key === 'shift') {
      modifiers.add(key)
    }
  })

  return {
    modifiers,
    key: keys[keys.length - 1],
  }
}

function matchesHotkey(event: KeyboardEvent, hotkey: string): boolean {
  const { modifiers, key } = parseHotkey(hotkey)
  
  const eventKey = event.key.toLowerCase()
  const eventModifiers = new Set<Modifier>()
  
  if (event.altKey) eventModifiers.add('alt')
  if (event.ctrlKey) eventModifiers.add('ctrl')
  if (event.metaKey) eventModifiers.add('meta')
  if (event.shiftKey) eventModifiers.add('shift')

  return (
    eventKey === key &&
    modifiers.size === eventModifiers.size &&
    Array.from(modifiers).every((mod) => eventModifiers.has(mod))
  )
}

export function useHotkeys(hotkeys: Hotkey[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const [hotkey, handler] of hotkeys) {
        if (matchesHotkey(event, hotkey)) {
          handler(event)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hotkeys])
}