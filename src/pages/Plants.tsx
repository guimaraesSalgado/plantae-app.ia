import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, History as HistoryIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlantCard } from '@/components/PlantCard'
import { PlantsService } from '@/services/plants'
import { ActivityService, ActivityLog } from '@/services/activity'
import { Planta } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LazyImage } from '@/components/LazyImage'
import { PlantListSkeleton, ActivityLogSkeleton } from '@/components/Skeletons'

export default function Plants() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [plants, setPlants] = useState<Planta[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoadingPlants, setIsLoadingPlants] = useState(true)
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)

  // Pagination for Plants
  const [plantsPage, setPlantsPage] = useState(1)
  const [hasMorePlants, setHasMorePlants] = useState(true)
  const plantsObserver = useRef<IntersectionObserver | null>(null)

  // Pagination for Activities
  const [activitiesPage, setActivitiesPage] = useState(1)
  const [hasMoreActivities, setHasMoreActivities] = useState(true)
  const activitiesObserver = useRef<IntersectionObserver | null>(null)

  const loadPlants = useCallback(async () => {
    setIsLoadingPlants(true)
    try {
      const newPlants = await PlantsService.getPlants(plantsPage, 20)
      if (newPlants.length < 20) setHasMorePlants(false)
      setPlants((prev) =>
        plantsPage === 1 ? newPlants : [...prev, ...newPlants],
      )
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar plantas',
      })
    } finally {
      setIsLoadingPlants(false)
    }
  }, [plantsPage, toast])

  const loadActivities = useCallback(async () => {
    setIsLoadingActivities(true)
    try {
      const newActivities = await ActivityService.getActivities(
        activitiesPage,
        20,
      )
      if (newActivities.length < 20) setHasMoreActivities(false)
      setActivities((prev) =>
        activitiesPage === 1 ? newActivities : [...prev, ...newActivities],
      )
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar histórico',
      })
    } finally {
      setIsLoadingActivities(false)
    }
  }, [activitiesPage, toast])

  useEffect(() => {
    loadPlants()
  }, [loadPlants])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const lastPlantRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingPlants) return
      if (plantsObserver.current) plantsObserver.current.disconnect()
      plantsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMorePlants) {
          setPlantsPage((prev) => prev + 1)
        }
      })
      if (node) plantsObserver.current.observe(node)
    },
    [isLoadingPlants, hasMorePlants],
  )

  const lastActivityRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingActivities) return
      if (activitiesObserver.current) activitiesObserver.current.disconnect()
      activitiesObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreActivities) {
          setActivitiesPage((prev) => prev + 1)
        }
      })
      if (node) activitiesObserver.current.observe(node)
    },
    [isLoadingActivities, hasMoreActivities],
  )

  const handlePlantClick = (id: string) => {
    navigate(`/plant/${id}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="feature-title">Minhas Plantas</h1>
        <p className="text-muted-foreground">
          Gerencie seu jardim e acompanhe o histórico de cuidados.
        </p>
      </div>

      <Tabs defaultValue="plants" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="plants" className="gap-2">
            <Sprout className="h-4 w-4" />
            Plantas
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <HistoryIcon className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plants" className="space-y-4 animate-slide-up">
          {plants.length === 0 && !isLoadingPlants ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="bg-secondary/50 p-6 rounded-full">
                <Sprout className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Nenhuma planta cadastrada
              </h2>
              <p className="text-muted-foreground max-w-xs">
                Adicione sua primeira planta para começar a monitorar.
              </p>
              <button
                onClick={() => navigate('/add')}
                className="text-primary font-medium hover:underline"
              >
                Adicionar Planta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plants.map((plant, index) => {
                const isLast = index === plants.length - 1
                return (
                  <div
                    key={plant.id}
                    ref={isLast ? lastPlantRef : null}
                    className="w-full"
                  >
                    <PlantCard
                      plant={plant}
                      onClick={handlePlantClick}
                      variant="list"
                    />
                  </div>
                )
              })}
              {isLoadingPlants &&
                Array.from({ length: 4 }).map((_, i) => (
                  <PlantListSkeleton key={i} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 animate-slide-up">
          {activities.length === 0 && !isLoadingActivities ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="bg-secondary/50 p-6 rounded-full">
                <HistoryIcon className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
              <p className="text-muted-foreground">
                Nenhuma atividade registrada ainda.
              </p>
            </div>
          ) : (
            <div className="relative pl-4 border-l-2 border-border space-y-6">
              {activities.map((log, index) => {
                const isLast = index === activities.length - 1
                return (
                  <div
                    key={log.id}
                    ref={isLast ? lastActivityRef : null}
                    className="relative"
                  >
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background ring-2 ring-border" />
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                          {log.tipo === 'create'
                            ? 'Criação'
                            : log.tipo === 'update'
                              ? 'Edição'
                              : log.tipo === 'care'
                                ? 'Cuidado'
                                : log.tipo === 'ia'
                                  ? 'IA'
                                  : 'Atividade'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(log.data_hora), 'dd MMM HH:mm', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        {log.descricao_resumida}
                      </p>
                      {log.plants && (
                        <div className="mt-2 flex items-center gap-2 bg-secondary/30 p-1.5 rounded-lg w-fit">
                          <LazyImage
                            src={log.plants.foto_url}
                            alt={log.plants.apelido}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs text-muted-foreground">
                            {log.plants.apelido}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {isLoadingActivities &&
                Array.from({ length: 3 }).map((_, i) => (
                  <ActivityLogSkeleton key={i} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
