import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutGrid, List as ListIcon, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PlantCard } from '@/components/PlantCard'
import { AttentionCarousel } from '@/components/AttentionCarousel'
import { getViewPreference, saveViewPreference, ViewMode } from '@/lib/storage'
import { PlantsService } from '@/services/plants'
import { Planta } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

export default function Index() {
  const [plants, setPlants] = useState<Planta[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Todas')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()
  const { toast } = useToast()

  const loadPlants = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await PlantsService.getPlants()
      setPlants(data)
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar plantas',
        description: 'Não foi possível buscar suas plantas.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    setViewMode(getViewPreference())
    loadPlants()
  }, [navigate, loadPlants])

  const handlePlantClick = (id: string) => {
    navigate(`/plant/${id}`)
  }

  const handleDeletePlant = async (id: string) => {
    const success = await PlantsService.deletePlant(id)
    if (success) {
      loadPlants()
      toast({
        title: 'Planta removida',
        description: 'A planta foi removida com sucesso.',
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover',
        description: 'Tente novamente.',
      })
    }
  }

  const handleViewModeChange = (value: string) => {
    if (value) {
      const mode = value as ViewMode
      setViewMode(mode)
      saveViewPreference(mode)
    }
  }

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const matchesSearch =
        plant.apelido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.nome_conhecido.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesStatus = true
      if (statusFilter === 'Saudável') {
        matchesStatus = plant.status_saude === 'saudavel'
      } else if (statusFilter === 'Atenção') {
        matchesStatus = plant.status_saude === 'atencao'
      } else if (statusFilter === 'Crítico') {
        matchesStatus = plant.status_saude === 'critico'
      }

      return matchesSearch && matchesStatus
    })
  }, [plants, searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredPlants.length / ITEMS_PER_PAGE)
  const paginatedPlants = filteredPlants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const attentionPlants = useMemo(() => {
    return plants.filter(
      (p) => p.status_saude === 'critico' || p.status_saude === 'atencao',
    )
  }, [plants])

  const filterTags = ['Todas', 'Saudável', 'Atenção', 'Crítico']

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="feature-title">Meu Jardim</h1>
        <p className="text-muted-foreground">
          Gerencie e cuide das suas plantas com carinho.
        </p>
      </div>

      {attentionPlants.length > 0 && (
        <AttentionCarousel
          plants={attentionPlants}
          onPlantClick={handlePlantClick}
        />
      )}

      {plants.length > 0 && (
        <div className="space-y-4 sticky top-16 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border/40 transition-all duration-300 animate-fade-in">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar planta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/50 transition-all"
              />
            </div>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={handleViewModeChange}
              className="bg-secondary/30 p-1 rounded-xl border border-transparent"
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <ListIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setStatusFilter(tag)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border',
                  statusFilter === tag
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary',
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
            <div className="bg-secondary/50 p-6 rounded-full">
              <img
                src="https://img.usecurling.com/i?q=potted%20plant&color=green&shape=lineal-color"
                alt="Empty State"
                className="w-24 h-24 opacity-80"
              />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Nenhuma planta cadastrada
            </h2>
            <p className="text-muted-foreground max-w-xs">
              Adicione sua primeira planta através do menu lateral.
            </p>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
            <div className="bg-secondary/50 p-6 rounded-full">
              <Search className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Nenhuma planta encontrada
            </h2>
            <p className="text-muted-foreground max-w-xs">
              Tente ajustar seus filtros de busca.
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1',
              )}
            >
              {paginatedPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onClick={handlePlantClick}
                  onDelete={handleDeletePlant}
                  variant={viewMode}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
