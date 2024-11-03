import { useState, useEffect, useRef } from 'react'
import { useDebounce } from './use-debounce'

interface AutosaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  interval?: number
  debounceMs?: number
}

export function useAutosave<T>({
  data,
  onSave,
  interval = 30000,
  debounceMs = 1000,
}: AutosaveOptions<T>) {
  const [isDirty, setIsDirty] = useState(false)
  const lastSavedData = useRef<T>(data)
  const debouncedData = useDebounce(data, debounceMs)

  useEffect(() => {
    const hasChanged = JSON.stringify(debouncedData) !== JSON.stringify(lastSavedData.current)
    setIsDirty(hasChanged)
  }, [debouncedData])

  useEffect(() => {
    if (!isDirty) return

    const saveData = async () => {
      try {
        await onSave(debouncedData)
        lastSavedData.current = debouncedData
        setIsDirty(false)
      } catch (error) {
        console.error('Autosave failed:', error)
      }
    }

    const timeoutId = setTimeout(saveData, interval)
    return () => clearTimeout(timeoutId)
  }, [debouncedData, isDirty, interval, onSave])

  return { isDirty }
}