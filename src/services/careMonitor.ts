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

    const existingNotifications = await NotificationsService.getNotifications()
    const recentNotifications = existingNotifications.filter((n) => {
      const nDate = parseISO(n.data_hora)
      return differenceInDays(now, nDate) < 1
    })

    for (const plant of plants) {
      // 1. Check Watering (Rega)
      if (plant.datas_importantes.proxima_rega_sugerida) {
        const due = parseISO(plant.datas_importantes.proxima_rega_sugerida)
        const daysUntil = differenceInDays(due, today)

        if (daysUntil <= 0) {
          const title =
            daysUntil < 0
              ? `Rega atrasada: ${plant.apelido}`
              : `Hora de regar: ${plant.apelido}`
          const type = 'rega'

          const hasDuplicate = recentNotifications.some(
            (n) => n.tipo === type && n.titulo === title,
          )

          if (!hasDuplicate) {
            await NotificationsService.createNotification({
              user_id: user.id,
              tipo: type,
              titulo: title,
              mensagem: `Sua ${plant.nome_conhecido} precisa de água.`,
            })
            sendNotification(
              title,
              `Sua ${plant.nome_conhecido} precisa de água.`,
            )
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

      // 2. Check Fertilizing (Adubação)
      if (plant.datas_importantes.proxima_adubacao_sugerida) {
        const due = parseISO(plant.datas_importantes.proxima_adubacao_sugerida)
        if (isBefore(due, addDays(now, 1))) {
          const daysUntil = differenceInDays(due, today)
          const title =
            daysUntil < 0
              ? `Adubação atrasada: ${plant.apelido}`
              : `Hora de adubar: ${plant.apelido}`
          const type = 'adubacao'

          const hasDuplicate = recentNotifications.some(
            (n) => n.tipo === type && n.titulo === title,
          )

          if (!hasDuplicate) {
            await NotificationsService.createNotification({
              user_id: user.id,
              tipo: type,
              titulo: title,
              mensagem: `Sua ${plant.nome_conhecido} precisa de nutrientes.`,
            })
            sendNotification(
              title,
              `Sua ${plant.nome_conhecido} precisa de nutrientes.`,
            )
            await ActivityService.logActivity(
              'ia',
              `Alerta de adubação para ${plant.apelido}`,
              plant.id,
              'system',
            )
          }
        }
      }

      // 3. Check Critical Health
      if (plant.status_saude === 'critico') {
        const title = `Atenção: ${plant.apelido} está crítica`
        const type = 'saude'
        const hasDuplicate = recentNotifications.some(
          (n) => n.tipo === type && n.titulo === title,
        )

        if (!hasDuplicate) {
          await NotificationsService.createNotification({
            user_id: user.id,
            tipo: type,
            titulo: title,
            mensagem: `Verifique a saúde da sua planta.`,
          })
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
      updates.datas_importantes!.proxima_rega_sugerida = addDays(
        new Date(),
        interval,
      ).toISOString()
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
      updates.datas_importantes!.proxima_rega_sugerida = addDays(
        new Date(),
        1,
      ).toISOString()
    } else if (type === 'adubacao') {
      updates.datas_importantes!.proxima_adubacao_sugerida = addDays(
        new Date(),
        1,
      ).toISOString()
    }

    await PlantsService.updatePlant(plantId, updates)
  },
}
