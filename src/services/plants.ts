import { supabase } from '@/lib/supabase/client'
import { Planta, HistoryLogItem } from '@/types'
import { ActivityService } from './activity'

export const PlantsService = {
  async getPlants(page?: number, limit: number = 20): Promise<Planta[]> {
    let query = supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false })

    if (page !== undefined) {
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
    }

    const { data, error } = await query

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

    // Sync JSONB dates to columns
    const proxima_data_rega =
      plant.datas_importantes?.proxima_rega_sugerida || null
    const ultima_analise = plant.datas_importantes?.ultima_analise || null

    const dbPlant = {
      user_id: sessionData.session.user.id,
      apelido: plant.apelido,
      nome_conhecido: plant.nome_conhecido,
      nome_cientifico: plant.nome_cientifico,
      foto_url: plant.foto_url,
      status_saude: plant.status_saude,
      sexo: plant.sexo,
      tempo_de_vida_aproximado_dias: plant.tempo_de_vida_aproximado_dias,
      pontos_positivos: plant.pontos_positivos,
      pontos_negativos: plant.pontos_negativos,
      cuidados_recomendados: plant.cuidados_recomendados,
      vitaminas_e_adubos: plant.vitaminas_e_adubos,
      datas_importantes: plant.datas_importantes,
      logs: plant.logs,
      observacoes: plant.observacoes,
      proxima_data_rega,
      ultima_analise,
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

    // Log Activity
    await ActivityService.logActivity(
      'create',
      `Adicionou a planta ${data.apelido}`,
      data.id,
    )

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

    // Sync JSONB dates to columns if datas_importantes is being updated
    if (updates.datas_importantes) {
      if (updates.datas_importantes.proxima_rega_sugerida) {
        dbUpdates.proxima_data_rega =
          updates.datas_importantes.proxima_rega_sugerida
      }
      if (updates.datas_importantes.ultima_analise) {
        dbUpdates.ultima_analise = updates.datas_importantes.ultima_analise
      }
    }

    // Also allow direct updates to columns if passed
    if (updates.proxima_data_rega)
      dbUpdates.proxima_data_rega = updates.proxima_data_rega
    if (updates.ultima_analise)
      dbUpdates.ultima_analise = updates.ultima_analise

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

    // Determine activity type based on updates
    if (updates.logs && updates.logs.length > 0) {
      // Assuming the first log is the new one
      const latestLog = updates.logs[0]
      let type: any = 'care'
      if (latestLog.type === 'foto') type = 'refresh'
      await ActivityService.logActivity(
        type,
        latestLog.note || `Atualização de ${latestLog.type}`,
        id,
      )
    } else if (updates.status_saude) {
      await ActivityService.logActivity(
        'status_change',
        `Status alterado para ${updates.status_saude}`,
        id,
      )
    } else {
      await ActivityService.logActivity(
        'update',
        `Editou informações de ${data.apelido}`,
        id,
      )
    }

    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Planta
  },

  async deletePlant(id: string): Promise<boolean> {
    // Get plant name before deleting for log
    const plant = await this.getPlantById(id)
    const name = plant?.apelido || 'Planta'

    const { error } = await supabase.from('plants').delete().eq('id', id)
    if (error) {
      console.error('Error deleting plant:', error)
      return false
    }

    await ActivityService.logActivity('delete', `Removeu a planta ${name}`, id)
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
