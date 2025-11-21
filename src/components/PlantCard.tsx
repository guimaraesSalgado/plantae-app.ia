import { Planta } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import {
  Trash2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LazyImage } from '@/components/LazyImage'
import { memo } from 'react'

interface PlantCardProps {
  plant: Planta
  onClick: (id: string) => void
  onDelete?: (id: string) => void
  variant?: 'grid' | 'list' | 'carousel'
}

export const PlantCard = memo(function PlantCard({
  plant,
  onClick,
  onDelete,
  variant = 'grid',
}: PlantCardProps) {
  const statusConfig = {
    saudavel: {
      color: 'bg-green-500',
      label: 'Saudável',
      icon: CheckCircle2,
      bg: 'bg-green-100',
      text: 'text-green-700',
    },
    atencao: {
      color: 'bg-yellow-500',
      label: 'Atenção',
      icon: AlertTriangle,
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
    },
    critico: {
      color: 'bg-red-500',
      label: 'Crítico',
      icon: AlertCircle,
      bg: 'bg-red-100',
      text: 'text-red-700',
    },
    desconhecido: {
      color: 'bg-gray-400',
      label: 'Desconhecido',
      icon: HelpCircle,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
    },
  }

  const config = statusConfig[plant.status_saude] || statusConfig.desconhecido
  const StatusIcon = config.icon

  if (variant === 'carousel') {
    return (
      <Card
        className="overflow-hidden cursor-pointer group relative border-none shadow-md hover:shadow-lg transition-all duration-300 w-[280px] h-[140px] rounded-2xl flex-shrink-0 mx-2 bg-card active:scale-95"
        onClick={() => onClick(plant.id)}
      >
        <CardContent className="p-0 h-full flex">
          <div className="w-1/3 h-full relative image-overlay">
            <LazyImage
              src={plant.foto_url}
              alt={plant.apelido}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
          </div>
          <div className="w-2/3 p-4 flex flex-col justify-center relative">
            <div
              className={cn(
                'absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center shadow-sm',
                config.color,
              )}
              title={config.label}
            >
              <StatusIcon className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-lg text-foreground truncate pr-6">
              {plant.apelido}
            </h3>
            <p className="text-xs text-muted-foreground truncate mb-2">
              {plant.nome_conhecido}
            </p>
            <div className="mt-auto">
              <span
                className={cn(
                  'text-[10px] font-medium px-2 py-1 rounded-full border uppercase tracking-wide',
                  config.bg,
                  config.text,
                  'border-transparent',
                )}
              >
                {config.label}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'list') {
    return (
      <Card
        className="overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group relative border border-border shadow-sm rounded-xl mb-3 bg-card active:scale-95"
        onClick={() => onClick(plant.id)}
      >
        <CardContent className="p-3 flex items-center gap-4">
          <div className="relative h-14 w-14 flex-shrink-0 image-overlay">
            <LazyImage
              src={plant.foto_url}
              alt={plant.apelido}
              className="h-full w-full object-cover rounded-lg border border-border"
            />
            <div
              className={cn(
                'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card',
                config.color,
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-foreground">
              {plant.apelido}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {plant.nome_conhecido}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block',
                config.bg,
                config.text,
              )}
            >
              {config.label}
            </span>
            {onDelete && (
              <div onClick={(e) => e.stopPropagation()}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover Planta</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover{' '}
                        <strong>{plant.apelido}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(plant.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-elevation transition-all duration-300 cursor-pointer group relative border-none shadow-subtle rounded-2xl h-full flex flex-col bg-card active:scale-95"
      onClick={() => onClick(plant.id)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden image-overlay">
        <LazyImage
          src={plant.foto_url}
          alt={plant.apelido}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <div
          className={cn(
            'absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm flex items-center gap-1',
            config.color,
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col justify-between bg-card">
        <div className="min-w-0">
          <h3 className="font-bold text-lg truncate text-foreground leading-tight mb-1">
            {plant.apelido}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {plant.nome_conhecido}
          </p>
        </div>

        {onDelete && (
          <div
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-destructive shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Planta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover{' '}
                    <strong>{plant.apelido}</strong>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(plant.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
