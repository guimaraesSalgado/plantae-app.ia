import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Clock,
  Droplets,
  Sprout,
  AlertTriangle,
  Leaf,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { NotificationItem } from '@/types'
import { CareMonitorService } from '@/services/careMonitor'
import { format, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function Notifications() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    const items = CareMonitorService.checkPlantStatus()
    setNotifications(items)
  }

  const handleComplete = (item: NotificationItem) => {
    CareMonitorService.completeCare(item.plantId, item.type)
    toast({
      title: 'Cuidado registrado!',
      description: `Você cuidou de ${item.plantName}.`,
      className: 'bg-brand-green text-white border-none',
    })
    loadNotifications()
  }

  const handleSnooze = (item: NotificationItem) => {
    CareMonitorService.snoozeCare(item.plantId, item.type)
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

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'rega':
        return <Droplets className="h-5 w-5" />
      case 'adubacao':
        return <Sprout className="h-5 w-5" />
      case 'saude':
        return <AlertTriangle className="h-5 w-5" />
      case 'inatividade':
        return <Clock className="h-5 w-5" />
      default:
        return <Leaf className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low':
        return 'bg-brand-light text-brand-earth border-brand-earth/20'
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="feature-title mb-0">Alertas e Cuidados</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
          <div className="bg-brand-light p-6 rounded-full text-brand-green">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-semibold text-brand-dark">
            Tudo em dia! 🎉
          </h2>
          <p className="text-muted-foreground max-w-xs">
            Você está em dia com os cuidados das suas plantas. Aproveite seu
            jardim!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'border-l-4 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden',
                item.priority === 'high'
                  ? 'border-l-brand-dark'
                  : 'border-l-brand-green',
              )}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-full',
                        item.type === 'rega'
                          ? 'bg-blue-100 text-blue-600'
                          : item.type === 'adubacao'
                            ? 'bg-green-100 text-green-600'
                            : item.type === 'saude'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {item.description}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {item.plantName}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      'capitalize',
                      getPriorityColor(item.priority),
                    )}
                  >
                    {formatDate(item.dueDate)}
                  </Badge>
                </div>

                <div className="flex gap-3 mt-4 justify-end border-t border-border pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSnooze(item)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Lembrar depois
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleComplete(item)}
                    className="bg-brand-green hover:bg-brand-dark text-white shadow-sm transition-colors"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Concluir agora
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
