import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, History as HistoryIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlantsService } from '@/services/plants'
import { HistoryLogItem } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Droplets, Sprout, Scissors, Camera, Bug, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function History() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<HistoryLogItem[]>([])
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
      const newLogs = await PlantsService.getHistoryLogs(page, 15)

      if (newLogs.length < 15) {
        setHasMore(false)
      }

      setLogs((prev) => (page === 1 ? newLogs : [...prev, ...newLogs]))
      setIsLoading(false)
    }

    loadLogs()
  }, [page])

  const getIcon = (type: string) => {
    switch (type) {
      case 'rega':
        return <Droplets className="h-4 w-4 text-blue-500" />
      case 'adubacao':
        return <Sprout className="h-4 w-4 text-green-500" />
      case 'poda':
        return <Scissors className="h-4 w-4 text-amber-500" />
      case 'foto':
        return <Camera className="h-4 w-4 text-purple-500" />
      case 'pragas':
        return <Bug className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'rega':
        return 'Rega'
      case 'adubacao':
        return 'Adubação'
      case 'poda':
        return 'Poda'
      case 'foto':
        return 'Foto'
      case 'pragas':
        return 'Pragas'
      default:
        return 'Outro'
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

      <div className="space-y-4">
        {logs.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
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
                key={`${log.log_id}-${index}`}
                ref={isLast ? lastLogElementRef : null}
                className="flex gap-4 items-start bg-card p-4 rounded-xl border border-border shadow-sm animate-slide-up"
              >
                <div className="relative h-12 w-12 flex-shrink-0">
                  <img
                    src={log.plant_photo}
                    alt={log.plant_name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-background p-1 rounded-full border border-border shadow-sm">
                    {getIcon(log.log_type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-foreground truncate">
                      {log.plant_name}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(parseISO(log.log_date), 'dd MMM HH:mm', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary/80">
                    {getLabel(log.log_type)}
                  </p>
                  {log.log_note && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {log.log_note}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}

        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!hasMore && logs.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">
            Fim do histórico
          </p>
        )}
      </div>
    </div>
  )
}
