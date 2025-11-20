import { Planta } from '@/types'

const STORAGE_KEY = 'guia-das-plantas-db'

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

  if (existingIndex >= 0) {
    plants[existingIndex] = plant
  } else {
    plants.push(plant)
  }

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
