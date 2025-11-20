import { SyncConfig, Planta } from '@/types'

const ONBOARDING_KEY = 'guia-das-plantas-onboarding'
const SYNC_CONFIG_KEY = 'guia-das-plantas-sync-config'
const VIEW_PREF_KEY = 'guia-das-plantas-view-pref'
const PLANTS_KEY = 'guia-das-plantas-data'

// --- Preferences Storage (Local Only) ---

export const isOnboardingCompleted = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export const setOnboardingCompleted = (completed: boolean): void => {
  localStorage.setItem(ONBOARDING_KEY, String(completed))
}

// Sync Configuration
export const getSyncConfig = (): SyncConfig => {
  try {
    const data = localStorage.getItem(SYNC_CONFIG_KEY)
    return data
      ? JSON.parse(data)
      : { enabled: false, autoSync: false, lastSync: undefined }
  } catch {
    return { enabled: false, autoSync: false, lastSync: undefined }
  }
}

export const saveSyncConfig = (config: SyncConfig): void => {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config))
}

// View Preference
export type ViewMode = 'grid' | 'list'

export const getViewPreference = (): ViewMode => {
  return (localStorage.getItem(VIEW_PREF_KEY) as ViewMode) || 'grid'
}

export const saveViewPreference = (mode: ViewMode): void => {
  localStorage.setItem(VIEW_PREF_KEY, mode)
}

// Data Storage (Plants)
export const hydrateStorage = (): void => {
  // Placeholder for future hydration logic (e.g. IndexedDB to localStorage)
  if (!localStorage.getItem(PLANTS_KEY)) {
    localStorage.setItem(PLANTS_KEY, '[]')
  }
}

export const getPlants = (): Planta[] => {
  try {
    const data = localStorage.getItem(PLANTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const savePlantsBulk = (plants: Planta[]): void => {
  try {
    localStorage.setItem(PLANTS_KEY, JSON.stringify(plants))
  } catch (error) {
    console.error('Failed to save plants to local storage:', error)
  }
}
