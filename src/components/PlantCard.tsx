import { Planta } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
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

interface PlantCardProps {
  plant: Planta
  onClick: (id: string) => void
  onDelete?: (id: string) => void
  variant?: 'grid' | 'list' | 'carousel'
}

export function PlantCard({
  plant,
  onClick,
  onDelete,
  variant = 'grid',
}: PlantCardProps) {
  const statusColors = {
    saudavel: 'bg-[#10b981]', // Green
    atencao: 'bg-yellow-400', // Yellow
    critico: 'bg-red-400', // Red
    desconhecido: 'bg-gray-400',
  }

  const statusLabels = {
    saudavel: 'Saudável',
    atencao: 'Atenção',
    critico: 'Crítico',
    desconhecido: 'Desconhecido',
  }

  const getStatusIcon = (status: Planta['status_saude']) => {
    switch (status) {
      case 'saudavel':
        return <CheckCircle2 className="h-4 w-4 text-white" />
      case 'atencao':
        return <AlertTriangle className="h-4 w-4 text-white" />
      case 'critico':
        return <AlertCircle className="h-4 w-4 text-white" />
      default:
        return null
    }
  }

  // Carousel Variant - Organic Material Design
  if (variant === 'carousel') {
    return (
      <Card
        className="overflow-hidden cursor-pointer group relative border-none shadow-md hover:shadow-lg transition-all duration-300 w-[280px] h-[140px] rounded-2xl flex-shrink-0 mx-2 bg-card active:scale-95"
        onClick={() => onClick(plant.id)}
      >
        <CardContent className="p-0 h-full flex">
          <div className="w-1/3 h-full relative image-overlay">
            <img
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
                statusColors[plant.status_saude],
              )}
              title={statusLabels[plant.status_saude]}
            >
              {getStatusIcon(plant.status_saude)}
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
                  'text-[10px] font-medium px-2 py-1 rounded-full bg-secondary text-foreground border border-border uppercase tracking-wide',
                )}
              >
                {statusLabels[plant.status_saude]}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // List Variant - Minimalist
  if (variant === 'list') {
    return (
      <Card
        className="overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group relative border border-border shadow-sm rounded-xl mb-3 bg-card active:scale-95"
        onClick={() => onClick(plant.id)}
      >
        <CardContent className="p-3 flex items-center gap-4">
          <div className="relative h-14 w-14 flex-shrink-0 image-overlay">
            <img
              src={plant.foto_url}
              alt={plant.apelido}
              className="h-full w-full object-cover rounded-lg border border-border"
            />
            <div
              className={cn(
                'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card',
                statusColors[plant.status_saude],
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
                plant.status_saude === 'saudavel'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : plant.status_saude === 'atencao'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : plant.status_saude === 'critico'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
              )}
            >
              {statusLabels[plant.status_saude]}
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

  // Grid Variant (Default) - 4:3 Aspect Ratio
  return (
    <Card
      className="overflow-hidden hover:shadow-elevation transition-all duration-300 cursor-pointer group relative border-none shadow-subtle rounded-2xl h-full flex flex-col bg-card active:scale-95"
      onClick={() => onClick(plant.id)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden image-overlay">
        <img
          src={plant.foto_url}
          alt={plant.apelido}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <div
          className={cn(
            'absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm',
            statusColors[plant.status_saude],
          )}
        >
          {statusLabels[plant.status_saude]}
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
}
