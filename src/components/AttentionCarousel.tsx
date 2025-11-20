import { Planta } from '@/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { PlantCard } from '@/components/PlantCard'
import { AlertTriangle } from 'lucide-react'

interface AttentionCarouselProps {
  plants: Planta[]
  onPlantClick: (id: string) => void
}

export function AttentionCarousel({
  plants,
  onPlantClick,
}: AttentionCarouselProps) {
  if (plants.length === 0) return null

  return (
    <div className="w-full space-y-3 animate-fade-in">
      <div className="flex items-center gap-2 px-1">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <h2 className="text-lg font-bold text-foreground">
          Precisam de Atenção
        </h2>
      </div>
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4 pb-4">
          {plants.map((plant) => (
            <CarouselItem
              key={plant.id}
              className="pl-2 md:pl-4 basis-auto" // Auto basis allows cards to size themselves
            >
              <PlantCard
                plant={plant}
                onClick={onPlantClick}
                variant="carousel"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Only show navigation on larger screens or if many items */}
        <div className="hidden md:block">
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </div>
      </Carousel>
    </div>
  )
}
