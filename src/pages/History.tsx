import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  History as HistoryIcon,
  Droplets,
  Edit,
  PlusCircle,
  AlertTriangle,
  Star,
  RefreshCw,
  Trash2,
  Circle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActivityService, ActivityLog } from '@/services/activity'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LazyImage } from '@/components/LazyImage'
import { ActivityLogSkeleton } from '@/components/Skeletons'

export default function History() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const lastLogElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })

      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore],
  )

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true)
      const newLogs = await ActivityService.getActivities(page, 20)

      if (newLogs.length < 20) {
        setHasMore(false)
      }

      setLogs((prev) => (page === 1 ? newLogs : [...prev, ...newLogs]))
      setIsLoading(false)
    }

    loadLogs()
  }, [page])

  const getIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <PlusCircle className="h-4 w-4 text-green-600" />
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />
      case 'care':
        return <Droplets className="h-4 w-4 text-blue-400" />
      case 'ia':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'status_change':
        return <Star className="h-4 w-4 text-purple-500" />
      case 'refresh':
        return <RefreshCw className="h-4 w-4 text-teal-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'create':
        return 'Planta Adicionada'
      case 'update':
        return 'Planta Editada'
      case 'delete':
        return 'Planta Removida'
      case 'care':
        return 'Cuidado Realizado'
      case 'ia':
        return 'Alerta IA'
      case 'status_change':
        return 'Mudança de Status'
      case 'refresh':
        return 'Atualização de Saúde'
      default:
        return 'Atividade'
    }
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="feature-title mb-0">Histórico de Atividades</h1>
      </div>

      <div className="relative pl-4 border-l-2 border-border space-y-8">
        {logs.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 ml-[-16px]">
            <div className="bg-secondary/50 p-6 rounded-full">
              <HistoryIcon className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground">
              Nenhuma atividade registrada ainda.
            </p>
          </div>
        ) : (
          logs.map((log, index) => {
            const isLast = index === logs.length - 1
            return (
              <div
                key={log.id}
                ref={isLast ? lastLogElementRef : null}
                className="relative animate-slide-up"
              >
                <div className="absolute -left-[25px] top-0 bg-background border-2 border-border rounded-full p-1">
                  {getIcon(log.tipo)}
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-foreground text-sm">
                      {getLabel(log.tipo)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(log.data_hora), "dd MMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {log.descricao_resumida}
                  </p>
                  {log.plants && (
                    <div className="mt-2 flex items-center gap-2 bg-secondary/30 p-2 rounded-lg">
                      <LazyImage
                        src={log.plants.foto_url}
                        alt={log.plants.apelido}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium">
                        {log.plants.apelido}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <ActivityLogSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
