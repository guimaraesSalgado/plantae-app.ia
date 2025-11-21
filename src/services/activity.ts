import { supabase } from '@/lib/supabase/client'
import { ActivityType, ActivityLog } from '@/types'

export const ActivityService = {
  async logActivity(
    tipo: ActivityType,
    descricao: string,
    plantaId?: string,
    origem: 'user' | 'system' | 'ia' = 'user',
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('user_activities').insert({
      user_id: user.id,
      tipo,
      planta_id: plantaId,
      descricao_resumida: descricao,
      origem,
    })

    if (error) {
      console.error('Error logging activity:', error)
    }
  },

  async getActivities(
    page: number = 1,
    limit: number = 20,
  ): Promise<ActivityLog[]> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error } = await supabase
      .from('user_activities')
      .select('*, plants(apelido, foto_url)')
      .order('data_hora', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching activities:', error)
      return []
    }

    return data as ActivityLog[]
  },
}
