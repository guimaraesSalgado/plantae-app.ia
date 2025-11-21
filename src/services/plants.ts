import { supabase } from '@/lib/supabase/client'
import { Planta, HistoryLogItem } from '@/types'

export const PlantsService = {
  async getPlants(): Promise<Planta[]> {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching plants:', error)
      return []
    }

    return data.map((p: any) => ({
      ...p,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })) as Planta[]
  },

  async getPlantById(id: string): Promise<Planta | null> {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching plant:', error)
      return null
    }

    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Planta
  },

  async createPlant(
    plant: Omit<Planta, 'id' | 'createdAt'>,
  ): Promise<Planta | null> {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session?.user) throw new Error('User not authenticated')

    const dbPlant = {
      user_id: sessionData.session.user.id,
      apelido: plant.apelido,
      nome_conhecido: plant.nome_conhecido,
      nome_cientifico: plant.nome_cientifico,
      foto_url: plant.foto_url,
      status_saude: plant.status_saude,
      pontos_positivos: plant.pontos_positivos,
      pontos_negativos: plant.pontos_negativos,
      cuidados_recomendados: plant.cuidados_recomendados,
      vitaminas_e_adubos: plant.vitaminas_e_adubos,
      datas_importantes: plant.datas_importantes,
      logs: plant.logs,
      observacoes: plant.observacoes,
    }

    const { data, error } = await supabase
      .from('plants')
      .insert(dbPlant)
      .select()
      .single()

    if (error) {
      console.error('Error creating plant:', error)
      return null
    }

    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Planta
  },

  async updatePlant(
    id: string,
    updates: Partial<Planta>,
  ): Promise<Planta | null> {
    const dbUpdates: any = { ...updates }
    if (updates.createdAt) delete dbUpdates.createdAt
    if (updates.updatedAt) delete dbUpdates.updatedAt
    dbUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('plants')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating plant:', error)
      return null
    }

    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Planta
  },

  async deletePlant(id: string): Promise<boolean> {
    const { error } = await supabase.from('plants').delete().eq('id', id)
    if (error) {
      console.error('Error deleting plant:', error)
      return false
    }
    return true
  },

  async getHistoryLogs(
    page: number = 1,
    limit: number = 10,
  ): Promise<HistoryLogItem[]> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error } = await supabase
      .from('plant_logs_view')
      .select('*')
      .order('log_date', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching history logs:', error)
      return []
    }

    return data as HistoryLogItem[]
  },
}
