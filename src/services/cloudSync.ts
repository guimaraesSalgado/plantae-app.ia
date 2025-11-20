import {
  getPlants,
  savePlantsBulk,
  getSyncConfig,
  saveSyncConfig,
} from '@/lib/storage'
import { Planta, SyncStatus } from '@/types'

// Mock Cloud Storage Key
const CLOUD_STORAGE_KEY = 'guia-das-plantas-cloud-mock'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const CloudSyncService = {
  async uploadData(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Sem conexão com a internet')
    }

    await delay(1500) // Simulate upload time

    const localPlants = getPlants()
    // In a real app, we would encrypt here
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(localPlants))

    const config = getSyncConfig()
    saveSyncConfig({ ...config, lastSync: new Date().toISOString() })
  },

  async downloadData(): Promise<Planta[]> {
    if (!navigator.onLine) {
      throw new Error('Sem conexão com a internet')
    }

    await delay(1500) // Simulate download time

    const cloudData = localStorage.getItem(CLOUD_STORAGE_KEY)
    if (!cloudData) return []

    return JSON.parse(cloudData) as Planta[]
  },

  async syncData(): Promise<SyncStatus> {
    try {
      if (!navigator.onLine) return 'offline'

      // 1. Get Local and Cloud Data
      const localPlants = getPlants()
      const cloudPlants = await this.downloadData()

      // 2. Merge Strategy: Last Modified Wins (using updatedAt)
      const mergedMap = new Map<string, Planta>()

      // Add all local plants to map
      localPlants.forEach((p) => mergedMap.set(p.id, p))

      // Merge cloud plants
      cloudPlants.forEach((cloudP) => {
        const localP = mergedMap.get(cloudP.id)

        if (!localP) {
          // Only in cloud, add to local
          mergedMap.set(cloudP.id, cloudP)
        } else {
          // Conflict: Compare timestamps
          const localTime = localP.updatedAt
            ? new Date(localP.updatedAt).getTime()
            : 0
          const cloudTime = cloudP.updatedAt
            ? new Date(cloudP.updatedAt).getTime()
            : 0

          if (cloudTime > localTime) {
            mergedMap.set(cloudP.id, cloudP)
          }
        }
      })

      const mergedPlants = Array.from(mergedMap.values())

      // 3. Save merged data to both Local and Cloud
      savePlantsBulk(mergedPlants)
      localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(mergedPlants))

      // 4. Update Config
      const config = getSyncConfig()
      saveSyncConfig({ ...config, lastSync: new Date().toISOString() })

      return 'success'
    } catch (error) {
      console.error('Sync failed:', error)
      return 'error'
    }
  },

  async restoreFromCloud(): Promise<void> {
    const cloudPlants = await this.downloadData()
    savePlantsBulk(cloudPlants)
    const config = getSyncConfig()
    saveSyncConfig({ ...config, lastSync: new Date().toISOString() })
  },
}
