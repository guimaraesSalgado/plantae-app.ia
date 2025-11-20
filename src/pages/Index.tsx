import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutGrid, List as ListIcon, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PlantCard } from '@/components/PlantCard'
import { AttentionCarousel } from '@/components/AttentionCarousel'
import {
  getPlants,
  deletePlant,
  isOnboardingCompleted,
  getViewPreference,
  saveViewPreference,
  ViewMode,
} from '@/lib/storage'
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
import { CareMonitorService } from '@/services/careMonitor'
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

  const loadPlants = () => {
    setIsLoading(true)
    // Simulate small delay for smooth feel
    setTimeout(() => {
      setPlants(getPlants())
      setIsLoading(false)
    }, 300)
  }

  useEffect(() => {
    if (!isOnboardingCompleted()) {
      navigate('/onboarding')
      return
    }
    setViewMode(getViewPreference())
    loadPlants()
  }, [navigate])

  const handlePlantClick = (id: string) => {
    navigate(`/plant/${id}`)
  }

  const handleDeletePlant = (id: string) => {
    deletePlant(id)
    loadPlants()
    toast({
      title: 'Planta removida',
      description: 'A planta foi removida com sucesso.',
    })
  }

  const handleViewModeChange = (value: string) => {
    if (value) {
      const mode = value as ViewMode
      setViewMode(mode)
      saveViewPreference(mode)
    }
  }

  // Filter Logic
  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      // Search Filter
      const matchesSearch =
        plant.apelido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.nome_conhecido.toLowerCase().includes(searchQuery.toLowerCase())

      // Status Filter
      let matchesStatus = true
      if (statusFilter === 'Bem') {
        matchesStatus = plant.status_saude === 'saudavel'
      } else if (statusFilter === 'Estável') {
        matchesStatus = plant.status_saude === 'atencao'
      } else if (statusFilter === 'Crítico') {
        matchesStatus = plant.status_saude === 'critico'
      }

      return matchesSearch && matchesStatus
    })
  }, [plants, searchQuery, statusFilter])

  // Pagination Logic
  const totalPages = Math.ceil(filteredPlants.length / ITEMS_PER_PAGE)
  const paginatedPlants = filteredPlants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Attention Plants Logic
  const attentionPlants = useMemo(() => {
    const notifications = CareMonitorService.checkPlantStatus()
    const attentionIds = new Set(notifications.map((n) => n.plantId))
    return plants.filter(
      (p) =>
        p.status_saude === 'critico' ||
        p.status_saude === 'atencao' ||
        attentionIds.has(p.id),
    )
  }, [plants])

  const filterTags = ['Todas', 'Bem', 'Estável', 'Crítico']

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
          Meu Jardim
        </h1>
        <p className="text-muted-foreground">
          Gerencie e cuide das suas plantas com carinho.
        </p>
      </div>

      {/* Attention Carousel */}
      {attentionPlants.length > 0 && (
        <AttentionCarousel
          plants={attentionPlants}
          onPlantClick={handlePlantClick}
        />
      )}

      {/* Controls Section - Only show if there are plants */}
      {plants.length > 0 && (
        <div className="space-y-4 sticky top-16 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border/40 transition-all duration-300 animate-fade-in">
          {/* Search and View Toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar planta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/50 transition-all"
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
                className="rounded-lg data-[state=on]:bg-white data-[state=on]:shadow-sm"
              >
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="rounded-lg data-[state=on]:bg-white data-[state=on]:shadow-sm"
              >
                <ListIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Filter Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setStatusFilter(tag)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border',
                  statusFilter === tag
                    ? 'bg-[#065f46] text-white border-[#065f46] shadow-md'
                    : 'bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-primary',
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plants.length === 0 ? (
          // Empty State - No plants at all
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
          // Empty State - No results for filter
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

            {/* Pagination */}
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
