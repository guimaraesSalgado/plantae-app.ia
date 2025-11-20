import { CareLog } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Droplets, Sprout, Scissors, Camera, Bug, Circle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CareHistoryProps {
  logs: CareLog[]
}

export function CareHistory({ logs }: CareHistoryProps) {
  const getIcon = (type: CareLog['type']) => {
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

  const getLabel = (type: CareLog['type']) => {
    switch (type) {
      case 'rega':
        return 'Rega'
      case 'adubacao':
        return 'Adubação'
      case 'poda':
        return 'Poda'
      case 'foto':
        return 'Atualização de Foto'
      case 'pragas':
        return 'Tratamento de Pragas'
      default:
        return 'Outro'
    }
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border">
        <p>Nenhum histórico de cuidados ainda.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="relative space-y-6 pl-4 before:absolute before:left-[11px] before:top-2 before:h-full before:w-[2px] before:bg-border">
        {logs.map((log) => (
          <div key={log.id} className="relative flex gap-4 items-start">
            <div className="absolute left-[-16px] mt-1 h-6 w-6 rounded-full bg-background border-2 border-border flex items-center justify-center z-10">
              {getIcon(log.type)}
            </div>
            <div className="flex-1 bg-card p-3 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm text-foreground">
                  {getLabel(log.type)}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(log.date), "dd MMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              {log.note && (
                <p className="text-sm text-muted-foreground mt-1">{log.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
