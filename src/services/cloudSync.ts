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

// Chunk size for uploads (simulated)
const CHUNK_SIZE = 50 * 1024 // 50KB chunks

export const CloudSyncService = {
  async uploadData(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Sem conexão com a internet')
    }

    const localPlants = getPlants()
    const json = JSON.stringify(localPlants)

    // Simulate Chunked Upload
    const totalChunks = Math.ceil(json.length / CHUNK_SIZE)

    for (let i = 0; i < totalChunks; i++) {
      // Simulate uploading chunk i
      await delay(300) // 300ms per chunk
      // In a real app, we would send slice: json.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    }

    // Finalize upload
    localStorage.setItem(CLOUD_STORAGE_KEY, json)

    const config = getSyncConfig()
    saveSyncConfig({ ...config, lastSync: new Date().toISOString() })
  },

  async downloadData(): Promise<Planta[]> {
    if (!navigator.onLine) {
      throw new Error('Sem conexão com a internet')
    }

    await delay(1000) // Simulate download time

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

      // Upload merged data back to cloud (chunked)
      await this.uploadData()

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
