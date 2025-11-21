import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { PlantsService } from '@/services/plants'
import { Planta } from '@/types'
import { cn } from '@/lib/utils'

export default function EditPlant() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [plant, setPlant] = useState<Planta | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [apelido, setApelido] = useState('')
  const [nomeConhecido, setNomeConhecido] = useState('')
  const [nomeCientifico, setNomeCientifico] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [sexo, setSexo] = useState<string>('')
  const [lifespan, setLifespan] = useState<string>('')
  const [lifespanError, setLifespanError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      PlantsService.getPlantById(id).then((foundPlant) => {
        if (foundPlant) {
          setPlant(foundPlant)
          setApelido(foundPlant.apelido)
          setNomeConhecido(foundPlant.nome_conhecido)
          setNomeCientifico(foundPlant.nome_cientifico || '')
          setObservacoes(foundPlant.observacoes || '')
          setSexo(foundPlant.sexo || '')
          setLifespan(
            foundPlant.tempo_de_vida_aproximado_dias
              ? foundPlant.tempo_de_vida_aproximado_dias.toString()
              : '',
          )
        } else {
          navigate('/404')
        }
      })
    }
  }, [id, navigate])

  const handleSave = async () => {
    if (!plant) return

    setLifespanError(null)
    let numLifespan: number | null = null

    if (lifespan) {
      numLifespan = parseInt(lifespan)
      if (isNaN(numLifespan) || numLifespan <= 0) {
        setLifespanError('Digite um número positivo.')
        return
      }
    }

    setIsLoading(true)

    const updates: Partial<Planta> = {
      apelido,
      nome_conhecido: nomeConhecido,
      nome_cientifico: nomeCientifico,
      observacoes,
      sexo: sexo as any,
      tempo_de_vida_aproximado_dias: numLifespan,
    }

    const updatedPlant = await PlantsService.updatePlant(plant.id, updates)
    setIsLoading(false)

    if (updatedPlant) {
      toast({
        title: 'Planta atualizada',
        description: 'As informações foram salvas com sucesso.',
      })
      navigate(`/plant/${plant.id}`)
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar a planta.',
      })
    }
  }

  if (!plant) return null

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/plant/${plant.id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="feature-title mb-0">Editar Planta</h1>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={plant.foto_url}
              alt={plant.apelido}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-4 bg-card p-6 rounded-2xl shadow-sm border">
          <div className="space-y-2">
            <Label htmlFor="apelido">Apelido</Label>
            <Input
              id="apelido"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              placeholder="Ex: Minha Jiboia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Espécie</Label>
            <Input
              id="nome"
              value={nomeConhecido}
              onChange={(e) => setNomeConhecido(e.target.value)}
              placeholder="Ex: Jiboia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cientifico">Nome Científico</Label>
            <Input
              id="cientifico"
              value={nomeCientifico}
              onChange={(e) => setNomeCientifico(e.target.value)}
              placeholder="Ex: Epipremnum aureum"
              className="italic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo da Planta</Label>
              <Select value={sexo} onValueChange={setSexo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Hermafrodita">Hermafrodita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifespan">Tempo de Vida (dias)</Label>
              <Input
                id="lifespan"
                type="number"
                value={lifespan}
                onChange={(e) => setLifespan(e.target.value)}
                placeholder="Ex: 365"
                className={cn(lifespanError && 'border-destructive')}
              />
              {lifespanError && (
                <p className="text-xs text-destructive">{lifespanError}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas sobre onde ela fica, quando foi comprada, etc."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <Button
          className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
