import { Planta, CareLog, SyncConfig } from '@/types'

const STORAGE_KEY = 'guia-das-plantas-db'
const ONBOARDING_KEY = 'guia-das-plantas-onboarding'
const SYNC_CONFIG_KEY = 'guia-das-plantas-sync-config'

export const getPlants = (): Planta[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading from storage', error)
    return []
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
}

export const savePlantsBulk = (plants: Planta[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
}

export const deletePlant = (id: string): void => {
  const plants = getPlants()
  const filtered = plants.filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
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
