import { Planta } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
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
  onDelete: (id: string) => void
}

export function PlantCard({ plant, onClick, onDelete }: PlantCardProps) {
  const statusColors = {
    saudavel: 'bg-green-500',
    atencao: 'bg-yellow-500',
    critico: 'bg-red-500',
    desconhecido: 'bg-gray-400',
  }

  const statusLabels = {
    saudavel: 'Saudável',
    atencao: 'Atenção',
    critico: 'Crítico',
    desconhecido: 'Desconhecido',
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-elevation transition-all duration-300 cursor-pointer group relative border-none shadow-subtle"
      onClick={() => onClick(plant.id)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0">
          <img
            src={plant.foto_url}
            alt={plant.apelido}
            className="h-full w-full object-cover rounded-full border-2 border-white shadow-sm"
          />
          <div
            className={cn(
              'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white',
              statusColors[plant.status_saude],
            )}
            title={statusLabels[plant.status_saude]}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate text-foreground">
            {plant.apelido}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {plant.nome_conhecido}
          </p>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover Planta</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover{' '}
                  <strong>{plant.apelido}</strong>? Esta ação não pode ser
                  desfeita.
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
      </CardContent>
    </Card>
  )
}
