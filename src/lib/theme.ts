import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

const THEME_KEY = 'guia-das-plantas-theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'system'
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const setThemePreference = (newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme)
    setTheme(newTheme)
  }

  return { theme, setTheme: setThemePreference }
}
