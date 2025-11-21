import { PlantsService } from '@/services/plants'
import {
  NotificationsService,
  sendNotification,
} from '@/services/notifications'
import { Planta, CareLog } from '@/types'
import {
  addDays,
  differenceInDays,
  isBefore,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase/client'
import { ActivityService } from './activity'

export const CareMonitorService = {
  async checkPlantStatus(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const plants = await PlantsService.getPlants()
    const now = new Date()
    const today = startOfDay(now)

    // Fetch recent notifications to prevent spam (Excess Control)
    const existingNotifications = await NotificationsService.getNotifications()

    // Helper to check if a notification of type/title exists recently (e.g. last 24h)
    const hasRecentNotification = (
      plantId: string,
      type: string,
      days: number = 1,
    ) => {
      return existingNotifications.some((n) => {
        const nDate = parseISO(n.data_hora)
        const diff = differenceInDays(now, nDate)
        return n.plant_id === plantId && n.tipo === type && diff < days
      })
    }

    for (const plant of plants) {
      // 1. Check Watering (Rega)
      // Rule: proxima_data_rega <= now
      const regaDate =
        plant.proxima_data_rega || plant.datas_importantes.proxima_rega_sugerida

      if (regaDate) {
        const due = parseISO(regaDate)

        if (isBefore(due, now) || differenceInDays(due, today) <= 0) {
          const type = 'rega'

          if (!hasRecentNotification(plant.id, type, 1)) {
            const title = `Sua planta precisa de água 💧`
            const message = `Está na hora de regar a planta ${plant.apelido}.`

            await NotificationsService.createNotification({
              user_id: user.id,
              plant_id: plant.id,
              tipo: type,
              titulo: title,
              mensagem: message,
            })
            sendNotification(title, message)

            // Log alert activity
            await ActivityService.logActivity(
              'ia',
              `Alerta de rega para ${plant.apelido}`,
              plant.id,
              'system',
            )
          }
        }
      }

      // 2. Check Healthy Growth (Parabéns)
      // Rule: status == 'saudavel' AND recent care in last 7 days
      if (plant.status_saude === 'saudavel') {
        const type = 'parabens'

        // Check if we already congratulated recently (e.g. last 7 days)
        if (!hasRecentNotification(plant.id, type, 7)) {
          // Check for recent activities
          const { data: activities } = await supabase
            .from('user_activities')
            .select('*')
            .eq('planta_id', plant.id)
            .gte('data_hora', subDays(now, 7).toISOString())
            .in('tipo', ['care', 'update']) // Care or updates count as activity
            .limit(1)

          if (activities && activities.length > 0) {
            const title = `Sua planta está indo muito bem 🌱`
            const message = `Parabéns! A planta ${plant.apelido} está crescendo forte graças aos seus cuidados.`

            await NotificationsService.createNotification({
              user_id: user.id,
              plant_id: plant.id,
              tipo: type,
              titulo: title,
              mensagem: message,
            })
            sendNotification(title, message)
          }
        }
      }

      // 3. Check Problem (Problema)
      // Rule: status == 'atencao' OR 'critico'
      if (
        plant.status_saude === 'atencao' ||
        plant.status_saude === 'critico'
      ) {
        const type = 'problema'

        // Don't spam problem alerts, maybe once every 3 days
        if (!hasRecentNotification(plant.id, type, 3)) {
          const title = `Sua planta precisa de atenção ⚠️`
          const message = `Identificamos um problema na planta ${plant.apelido}. Abra o app para ver dicas de como resolver.`

          await NotificationsService.createNotification({
            user_id: user.id,
            plant_id: plant.id,
            tipo: type,
            titulo: title,
            mensagem: message,
          })
          sendNotification(title, message)
        }
      }
    }
  },

  async completeCare(plantId: string, type: string) {
    const plant = await PlantsService.getPlantById(plantId)
    if (!plant) return

    const updates: Partial<Planta> = {
      datas_importantes: { ...plant.datas_importantes },
    }

    const newLog: CareLog = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type:
        type === 'saude' || type === 'inatividade' ? 'outro' : (type as any),
      note: `Cuidado realizado via notificação`,
    }

    const logs = plant.logs || []
    updates.logs = [newLog, ...logs]

    if (type === 'rega') {
      const care = plant.cuidados_recomendados.find(
        (c) => c.tipo_cuidado === 'rega',
      )
      const interval = care?.intervalo_dias || 3
      const nextDate = addDays(new Date(), interval).toISOString()
      updates.datas_importantes!.proxima_rega_sugerida = nextDate
      updates.proxima_data_rega = nextDate
    } else if (type === 'adubacao') {
      const care = plant.cuidados_recomendados.find(
        (c) => c.tipo_cuidado === 'adubacao',
      )
      const interval = care?.intervalo_dias || 30
      updates.datas_importantes!.proxima_adubacao_sugerida = addDays(
        new Date(),
        interval,
      ).toISOString()
    }

    await PlantsService.updatePlant(plantId, updates)
  },

  async snoozeCare(plantId: string, type: string) {
    const plant = await PlantsService.getPlantById(plantId)
    if (!plant) return

    const updates: Partial<Planta> = {
      datas_importantes: { ...plant.datas_importantes },
    }

    if (type === 'rega') {
      const nextDate = addDays(new Date(), 1).toISOString()
      updates.datas_importantes!.proxima_rega_sugerida = nextDate
      updates.proxima_data_rega = nextDate
    } else if (type === 'adubacao') {
      updates.datas_importantes!.proxima_adubacao_sugerida = addDays(
        new Date(),
        1,
      ).toISOString()
    }

    await PlantsService.updatePlant(plantId, updates)
  },
}
