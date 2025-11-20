import { PlantsService } from '@/services/plants'
import { sendNotification } from '@/services/notifications'
import { NotificationItem, Planta, CareLog } from '@/types'
import {
  addDays,
  differenceInDays,
  isBefore,
  parseISO,
  startOfDay,
} from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

export const CareMonitorService = {
  async checkPlantStatus(): Promise<NotificationItem[]> {
    const plants = await PlantsService.getPlants()
    const notifications: NotificationItem[] = []
    const now = new Date()
    const today = startOfDay(now)

    plants.forEach((plant) => {
      // 1. Check Watering (Rega)
      if (plant.datas_importantes.proxima_rega_sugerida) {
        const due = parseISO(plant.datas_importantes.proxima_rega_sugerida)
        const daysUntil = differenceInDays(due, today)

        if (daysUntil <= 1) {
          notifications.push({
            id: `${plant.id}-rega`,
            plantId: plant.id,
            plantName: plant.apelido,
            type: 'rega',
            description:
              daysUntil < 0
                ? 'Rega atrasada'
                : daysUntil === 0
                  ? 'Regar hoje'
                  : 'Regar amanhã',
            dueDate: due,
            isOverdue: daysUntil < 0,
            priority: daysUntil < 0 ? 'high' : 'medium',
          })
        }
      }

      // 2. Check Fertilizing (Adubação)
      if (plant.datas_importantes.proxima_adubacao_sugerida) {
        const due = parseISO(plant.datas_importantes.proxima_adubacao_sugerida)
        if (isBefore(due, addDays(now, 1))) {
          const daysUntil = differenceInDays(due, today)
          notifications.push({
            id: `${plant.id}-adubacao`,
            plantId: plant.id,
            plantName: plant.apelido,
            type: 'adubacao',
            description: daysUntil < 0 ? 'Adubação atrasada' : 'Adubar agora',
            dueDate: due,
            isOverdue: daysUntil < 0,
            priority: daysUntil < 0 ? 'high' : 'medium',
          })
        }
      }

      // 3. Check Critical Health (Saúde Crítica)
      if (plant.status_saude === 'critico') {
        notifications.push({
          id: `${plant.id}-saude`,
          plantId: plant.id,
          plantName: plant.apelido,
          type: 'saude',
          description: 'Saúde crítica detectada',
          dueDate: now,
          isOverdue: true,
          priority: 'high',
        })
      }

      // 4. Check Inactivity (Inatividade > 7 days)
      const lastUpdate = plant.updatedAt || plant.createdAt
      if (lastUpdate) {
        const daysInactive = differenceInDays(now, parseISO(lastUpdate))
        if (daysInactive >= 7) {
          notifications.push({
            id: `${plant.id}-inatividade`,
            plantId: plant.id,
            plantName: plant.apelido,
            type: 'inatividade',
            description: 'Planta sem atualizações recentes',
            dueDate: now,
            isOverdue: true,
            priority: 'low',
          })
        }
      }
    })

    return notifications.sort((a, b) => {
      // Sort by priority then date
      const priorityScore = { high: 3, medium: 2, low: 1 }
      if (priorityScore[a.priority] !== priorityScore[b.priority]) {
        return priorityScore[b.priority] - priorityScore[a.priority]
      }
      return a.dueDate.getTime() - b.dueDate.getTime()
    })
  },

  async runDailyCheck() {
    const notifications = await this.checkPlantStatus()

    // Send push notifications for high priority items
    notifications.forEach((item) => {
      if (item.priority === 'high' || item.priority === 'medium') {
        sendNotification(
          `Sua ${item.plantName} precisa de atenção`,
          item.description,
        )
      }
    })
  },

  async completeCare(plantId: string, type: NotificationItem['type']) {
    const plant = await PlantsService.getPlantById(plantId)
    if (!plant) return

    const updates: Partial<Planta> = {
      datas_importantes: { ...plant.datas_importantes },
    }

    // Log completion
    const newLog: CareLog = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type:
        type === 'saude' || type === 'inatividade' ? 'outro' : (type as any),
      note: `Cuidado realizado via alerta: ${type}`,
    }

    const logs = plant.logs || []
    updates.logs = [newLog, ...logs]

    // Recalculate dates
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

    // Update plant
    await PlantsService.updatePlant(plantId, updates)
  },

  async snoozeCare(plantId: string, type: NotificationItem['type']) {
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
