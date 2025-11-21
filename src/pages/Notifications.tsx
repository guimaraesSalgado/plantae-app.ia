import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Clock,
  Droplets,
  AlertTriangle,
  Leaf,
  Trash2,
  CheckCheck,
  Scissors,
  Heart,
  Bell,
  Sprout,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { AppNotification } from '@/types'
import { NotificationsService } from '@/services/notifications'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { LazyImage } from '@/components/LazyImage'

export default function Notifications() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    const items = await NotificationsService.getNotifications()
    setNotifications(items)
    setIsLoading(false)
  }

  const handleMarkAllRead = async () => {
    const success = await NotificationsService.markAllAsRead()
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })))
      toast({
        title: 'Tudo lido!',
        description: 'Todas as notificações foram marcadas como lidas.',
      })
    }
  }

  const handleDelete = async (id: string) => {
    const success = await NotificationsService.deleteNotification(id)
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast({
        title: 'Removido',
        description: 'Notificação excluída.',
      })
    }
  }

  const handleMarkRead = async (id: string) => {
    const success = await NotificationsService.markAsRead(id)
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
      )
    }
  }

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.lida) {
      handleMarkRead(notification.id)
    }
    if (notification.plant_id) {
      navigate(`/plant/${notification.plant_id}`)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return format(date, "'Hoje às' HH:mm", { locale: ptBR })
    if (isTomorrow(date))
      return format(date, "'Amanhã às' HH:mm", { locale: ptBR })
    return format(date, "dd 'de' MMM 'às' HH:mm", { locale: ptBR })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'rega':
        return <Droplets className="h-5 w-5" />
      case 'adubacao':
        return <Leaf className="h-5 w-5" />
      case 'poda':
        return <Scissors className="h-5 w-5" />
      case 'saude':
        return <Heart className="h-5 w-5" />
      case 'alerta':
      case 'problema':
        return <AlertTriangle className="h-5 w-5" />
      case 'parabens':
        return <Sprout className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rega':
        return 'bg-blue-100 text-blue-600'
      case 'adubacao':
        return 'bg-green-100 text-green-600'
      case 'saude':
        return 'bg-red-100 text-red-600'
      case 'alerta':
      case 'problema':
        return 'bg-amber-100 text-amber-600'
      case 'parabens':
        return 'bg-emerald-100 text-emerald-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="feature-title mb-0">Notificações</h1>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-primary hover:text-primary/80"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Ler todas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
          <div className="bg-brand-light p-6 rounded-full text-brand-green">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-semibold text-brand-dark">Tudo limpo!</h2>
          <p className="text-muted-foreground max-w-xs">
            Você não tem novas notificações no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group active:scale-[0.99] cursor-pointer',
                item.lida
                  ? 'bg-card opacity-80'
                  : 'bg-gradient-to-r from-white to-brand-light/30 dark:from-card dark:to-secondary/10',
              )}
              onClick={() => handleNotificationClick(item)}
            >
              {!item.lida && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              <CardContent className="p-4 flex gap-4 items-start">
                <div
                  className={cn(
                    'p-3 rounded-full flex-shrink-0 shadow-sm',
                    getTypeColor(item.tipo),
                  )}
                >
                  {getIcon(item.tipo)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      'font-semibold text-base leading-tight mb-1',
                      item.lida ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {item.titulo}
                  </h3>
                  {item.mensagem && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.mensagem}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.data_hora)}
                    </p>

                    {item.plants && (
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-full">
                        <LazyImage
                          src={item.plants.foto_url}
                          alt={item.plants.apelido}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[80px]">
                          {item.plants.apelido}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
