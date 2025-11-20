import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlantCard } from '@/components/PlantCard'
import { getPlants, deletePlant } from '@/lib/storage'
import { Planta } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const [plants, setPlants] = useState<Planta[]>([])
  const navigate = useNavigate()
  const { toast } = useToast()

  const loadPlants = () => {
    setPlants(getPlants())
  }

  useEffect(() => {
    loadPlants()
  }, [])

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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Minhas Plantas</h1>
        <p className="text-muted-foreground">Gerencie e cuide do seu jardim.</p>
      </div>

      {plants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
          <div className="bg-secondary/50 p-6 rounded-full">
            <img
              src="https://img.usecurling.com/i?q=potted%20plant&color=green&shape=lineal-color"
              alt="Empty State"
              className="w-24 h-24 opacity-80"
            />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Nenhuma planta por aqui
          </h2>
          <p className="text-muted-foreground max-w-xs">
            Você ainda não tem plantas cadastradas. Que tal adicionar a
            primeira?
          </p>
          <Button
            onClick={() => navigate('/add')}
            className="mt-4 bg-primary hover:bg-primary/90 text-white rounded-full px-8"
          >
            Adicionar planta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onClick={handlePlantClick}
              onDelete={handleDeletePlant}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button for mobile, or regular button for desktop if list is not empty */}
      {plants.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => navigate('/add')}
            size="icon"
            className="h-14 w-14 rounded-full shadow-elevation bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Adicionar planta</span>
          </Button>
        </div>
      )}
    </div>
  )
}
