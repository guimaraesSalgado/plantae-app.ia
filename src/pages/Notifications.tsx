import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Clock, Droplets, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getPlants, updatePlantDates } from '@/lib/storage'
import { Planta, NotificationItem } from '@/types'
import {
  addDays,
  format,
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Notifications() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    const plants = getPlants()
    const items: NotificationItem[] = []
    const now = new Date()

    plants.forEach((plant) => {
      // Check Watering
      if (plant.datas_importantes.proxima_rega_sugerida) {
        const dueDate = parseISO(plant.datas_importantes.proxima_rega_sugerida)
        if (isBefore(dueDate, addDays(now, 1))) {
          // Due today or past
          items.push({
            id: `${plant.id}-rega`,
            plantId: plant.id,
            plantName: plant.apelido,
            type: 'rega',
            description: `Regar ${plant.apelido}`,
            dueDate: dueDate,
            isOverdue: isBefore(dueDate, new Date(now.setHours(0, 0, 0, 0))),
          })
        }
      }

      // Check Fertilizing
      if (plant.datas_importantes.proxima_adubacao_sugerida) {
        const dueDate = parseISO(
          plant.datas_importantes.proxima_adubacao_sugerida,
        )
        if (isBefore(dueDate, addDays(now, 2))) {
          // Due soon
          items.push({
            id: `${plant.id}-adubacao`,
            plantId: plant.id,
            plantName: plant.apelido,
            type: 'adubacao',
            description: `Adubar ${plant.apelido}`,
            dueDate: dueDate,
            isOverdue: isBefore(dueDate, new Date(now.setHours(0, 0, 0, 0))),
          })
        }
      }
    })

    // Sort by date
    items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    setNotifications(items)
  }

  const handleComplete = (item: NotificationItem) => {
    const plant = getPlants().find((p) => p.id === item.plantId)
    if (!plant) return

    const updates: Partial<Planta['datas_importantes']> = {}

    // Calculate next date based on care recommendations
    if (item.type === 'rega') {
      const care = plant.cuidados_recomendados.find(
        (c) => c.tipo_cuidado === 'rega',
      )
      const interval = care?.intervalo_dias || 3 // Default 3 days
      updates.proxima_rega_sugerida = addDays(
        new Date(),
        interval,
      ).toISOString()
    } else if (item.type === 'adubacao') {
      const care = plant.cuidados_recomendados.find(
        (c) => c.tipo_cuidado === 'adubacao',
      )
      const interval = care?.intervalo_dias || 30 // Default 30 days
      updates.proxima_adubacao_sugerida = addDays(
        new Date(),
        interval,
      ).toISOString()
    }

    updatePlantDates(item.plantId, updates)

    toast({
      title: 'Cuidado registrado!',
      description: `Você cuidou de ${item.plantName}.`,
    })

    loadNotifications()
  }

  const handleSnooze = (item: NotificationItem) => {
    const updates: Partial<Planta['datas_importantes']> = {}

    if (item.type === 'rega') {
      updates.proxima_rega_sugerida = addDays(new Date(), 1).toISOString()
    } else if (item.type === 'adubacao') {
      updates.proxima_adubacao_sugerida = addDays(new Date(), 1).toISOString()
    }

    updatePlantDates(item.plantId, updates)

    toast({
      title: 'Lembrete adiado',
      description: 'Vamos te lembrar novamente amanhã.',
    })

    loadNotifications()
  }

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Hoje'
    if (isTomorrow(date)) return 'Amanhã'
    return format(date, "dd 'de' MMM", { locale: ptBR })
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Alertas de Cuidados</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
          <div className="bg-green-100 p-6 rounded-full text-green-600">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Tudo em dia! 🎉
          </h2>
          <p className="text-muted-foreground max-w-xs">
            Você está em dia com os cuidados das suas plantas. Aproveite seu
            jardim!
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={`border-l-4 ${item.isOverdue ? 'border-l-red-500' : 'border-l-primary'}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-full ${item.type === 'rega' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}
                    >
                      {item.type === 'rega' ? (
                        <Droplets className="h-4 w-4" />
                      ) : (
                        <Sprout className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {item.description}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.plantName}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.isOverdue ? 'destructive' : 'secondary'}>
                    {formatDate(item.dueDate)}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-4 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSnooze(item)}
                    className="text-muted-foreground"
                  >
                    <Clock className="mr-1 h-4 w-4" />
                    Adiar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleComplete(item)}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Feito
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
