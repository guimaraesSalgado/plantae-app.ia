import { Planta, CareLog, SyncConfig } from '@/types'

const STORAGE_KEY = 'guia-das-plantas-db'
const ONBOARDING_KEY = 'guia-das-plantas-onboarding'
const SYNC_CONFIG_KEY = 'guia-das-plantas-sync-config'
const VIEW_PREF_KEY = 'guia-das-plantas-view-pref'

// --- IndexedDB Helper for Robust Storage (iOS/PWA) ---
const DB_NAME = 'GuiaDasPlantasDB'
const DB_VERSION = 1
const STORE_NAME = 'plants'

class SimpleIDB {
  private db: IDBDatabase | null = null

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }
    })
  }

  async getAll(): Promise<Planta[]> {
    try {
      const db = await this.open()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result as Planta[])
        request.onerror = () => reject(request.error)
      })
    } catch (e) {
      console.error('IDB Error:', e)
      return []
    }
  }

  async saveAll(plants: Planta[]): Promise<void> {
    try {
      const db = await this.open()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        // Clear and rewrite for simplicity in this sync model
        // In a real app, we might merge, but here we treat LS as source of truth for UI
        store.clear().onsuccess = () => {
          let completed = 0
          if (plants.length === 0) {
            resolve()
            return
          }

          plants.forEach((plant) => {
            const req = store.put(plant)
            req.onsuccess = () => {
              completed++
              if (completed === plants.length) resolve()
            }
            req.onerror = () => reject(req.error)
          })
        }
      })
    } catch (e) {
      console.error('IDB Save Error:', e)
    }
  }
}

const idb = new SimpleIDB()

// --- Main Storage Functions ---

// We use LocalStorage as the primary synchronous cache for UI performance
// But we backup to IndexedDB for robustness

export const getPlants = (): Planta[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    // If LS is empty, we might want to check IDB, but getPlants is sync.
    // The app should handle hydration on startup (see App.tsx or Layout.tsx)
    return []
  } catch (error) {
    console.error('Error reading from storage', error)
    return []
  }
}

// Async function to hydrate from IDB if LS is empty (Robustness)
export const hydrateStorage = async (): Promise<boolean> => {
  try {
    const lsData = localStorage.getItem(STORAGE_KEY)
    if (!lsData || JSON.parse(lsData).length === 0) {
      const dbData = await idb.getAll()
      if (dbData.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbData))
        return true // Hydrated
      }
    }
    return false
  } catch (e) {
    console.error('Hydration failed', e)
    return false
  }
}

export const getPlantById = (id: string): Planta | undefined => {
  const plants = getPlants()
  return plants.find((p) => p.id === id)
}

export const savePlant = (plant: Planta): void => {
  const plants = getPlants()
  const existingIndex = plants.findIndex((p) => p.id === plant.id)

  // Update timestamp
  plant.updatedAt = new Date().toISOString()

  if (existingIndex >= 0) {
    plants[existingIndex] = plant
  } else {
    plants.push(plant)
  }

  const json = JSON.stringify(plants)
  localStorage.setItem(STORAGE_KEY, json)

  // Async backup to IDB
  idb
    .saveAll(plants)
    .catch((e) => console.error('Background IDB save failed', e))
}

export const savePlantsBulk = (plants: Planta[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
  // Async backup to IDB
  idb
    .saveAll(plants)
    .catch((e) => console.error('Background IDB save failed', e))
}

export const deletePlant = (id: string): void => {
  const plants = getPlants()
  const filtered = plants.filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  // Async backup to IDB
  idb
    .saveAll(filtered)
    .catch((e) => console.error('Background IDB save failed', e))
}

export const updatePlantDates = (
  id: string,
  updates: Partial<Planta['datas_importantes']>,
): void => {
  const plant = getPlantById(id)
  if (plant) {
    plant.datas_importantes = { ...plant.datas_importantes, ...updates }
    savePlant(plant)
  }
}

export const addCareLog = (plantId: string, log: CareLog): void => {
  const plant = getPlantById(plantId)
  if (plant) {
    const logs = plant.logs || []
    plant.logs = [log, ...logs]
    savePlant(plant)
  }
}

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
