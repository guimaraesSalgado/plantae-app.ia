import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Droplets,
  Sun,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sprout,
  Calendar,
  Edit,
  History,
  Plus,
  Dna,
  Clock,
  Hourglass,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { PlantsService } from '@/services/plants'
import { identifyPlant } from '@/services/plantsAI'
import { Planta, CareLog } from '@/types'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CareHistory } from '@/components/CareHistory'
import { v4 as uuidv4 } from 'uuid'
import { ScanningEffect } from '@/components/ScanningEffect'
import { cn } from '@/lib/utils'

export default function PlantDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [plant, setPlant] = useState<Planta | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual Log State
  const [newLogType, setNewLogType] = useState<string>('rega')
  const [newLogNote, setNewLogNote] = useState('')
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)

  // Editable Lifespan State
  const [lifespan, setLifespan] = useState<string>('')
  const [lifespanError, setLifespanError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      PlantsService.getPlantById(id).then((foundPlant) => {
        if (foundPlant) {
          setPlant(foundPlant)
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

  const handleRefreshHealth = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && plant) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const newImage = reader.result as string
        setIsRefreshing(true)
        try {
          const result = await identifyPlant(newImage)

          const updates: Partial<Planta> = {
            status_saude: result.status_saude || plant.status_saude,
            pontos_positivos: result.pontos_positivos || plant.pontos_positivos,
            pontos_negativos: result.pontos_negativos || plant.pontos_negativos,
            cuidados_recomendados:
              result.cuidados_recomendados || plant.cuidados_recomendados,
            vitaminas_e_adubos:
              result.vitaminas_e_adubos || plant.vitaminas_e_adubos,
            sexo: result.sexo || plant.sexo,
            tempo_de_vida_aproximado_dias:
              result.tempo_de_vida_aproximado_dias ||
              plant.tempo_de_vida_aproximado_dias,
            datas_importantes: {
              ...plant.datas_importantes,
              ultima_analise: new Date().toISOString(),
              ...result.datas_importantes,
            },
          }

          // Add log for photo update
          const log: CareLog = {
            id: uuidv4(),
            date: new Date().toISOString(),
            type: 'foto',
            note: 'Análise de saúde via foto',
          }
          updates.logs = [log, ...(plant.logs || [])]

          const updatedPlant = await PlantsService.updatePlant(
            plant.id,
            updates,
          )

          if (updatedPlant) {
            setPlant(updatedPlant)
            setLifespan(
              updatedPlant.tempo_de_vida_aproximado_dias
                ? updatedPlant.tempo_de_vida_aproximado_dias.toString()
                : '',
            )
            toast({
              title: 'Saúde atualizada!',
              description: 'As informações da planta foram renovadas.',
            })
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao atualizar',
            description: 'Não foi possível reavaliar a planta.',
          })
        } finally {
          setIsRefreshing(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddLog = async () => {
    if (!plant) return

    const log: CareLog = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type: newLogType as CareLog['type'],
      note: newLogNote,
    }

    const updatedLogs = [log, ...(plant.logs || [])]
    const updatedPlant = await PlantsService.updatePlant(plant.id, {
      logs: updatedLogs,
    })

    if (updatedPlant) {
      setPlant(updatedPlant)
      setIsLogDialogOpen(false)
      setNewLogNote('')
      toast({
        title: 'Histórico atualizado',
        description: 'O cuidado foi registrado com sucesso.',
      })
    }
  }

  const handleSexChange = async (value: string) => {
    if (!plant) return
    const updatedPlant = await PlantsService.updatePlant(plant.id, {
      sexo: value as any,
    })
    if (updatedPlant) {
      setPlant(updatedPlant)
      toast({
        title: 'Informação atualizada',
        description: 'Sexo da planta atualizado.',
      })
    }
  }

  const handleLifespanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLifespan(val)
    setLifespanError(null)
  }

  const handleLifespanSave = async () => {
    if (!plant) return

    const numVal = parseInt(lifespan)
    if (isNaN(numVal) || numVal <= 0) {
      setLifespanError('Digite um número positivo.')
      return
    }

    const updatedPlant = await PlantsService.updatePlant(plant.id, {
      tempo_de_vida_aproximado_dias: numVal,
    })

    if (updatedPlant) {
      setPlant(updatedPlant)
      toast({
        title: 'Informação atualizada',
        description: 'Tempo de vida aproximado salvo.',
      })
    }
  }

  if (!plant) return null

  const statusColors = {
    saudavel: 'bg-green-100 text-green-800 border-green-200',
    atencao: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critico: 'bg-red-100 text-red-800 border-red-200',
    desconhecido: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const daysOfLife = differenceInDays(new Date(), parseISO(plant.createdAt))

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate(`/plant/${plant.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
            onClick={handleRefreshHealth}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? '...' : 'Saúde'}
          </Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-elevation aspect-[4/3] group">
        <img
          src={plant.foto_url}
          alt={plant.apelido}
          className="w-full h-full object-cover"
        />
        <ScanningEffect active={isRefreshing} />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 text-white">
          <h1 className="text-3xl font-bold leading-tight">{plant.apelido}</h1>
          <div className="flex flex-col">
            <p className="text-white/90 font-medium text-lg">
              {plant.nome_conhecido}
            </p>
            {plant.nome_cientifico && (
              <p className="text-white/70 text-sm italic">
                {plant.nome_cientifico}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`px-3 py-1 text-sm capitalize ${statusColors[plant.status_saude]}`}
        >
          Status: {plant.status_saude}
        </Badge>
        {plant.datas_importantes.ultima_analise && (
          <span className="text-xs text-muted-foreground">
            Atualizado em{' '}
            {format(
              parseISO(plant.datas_importantes.ultima_analise),
              "dd 'de' MMM",
              { locale: ptBR },
            )}
          </span>
        )}
      </div>

      {/* Tabs for Details and History */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 animate-fade-in">
          {/* Basic Info Card */}
          <Card className="border-border shadow-subtle">
            <CardHeader className="pb-2">
              <CardTitle className="section-title mb-0">
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Idade no Jardim</span>
                </div>
                <span className="font-medium">
                  Aproximadamente {daysOfLife} dias
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Dna className="h-4 w-4" />
                  <span>Sexo da planta</span>
                </div>
                <Select
                  value={plant.sexo || ''}
                  onValueChange={handleSexChange}
                >
                  <SelectTrigger className="w-[140px] h-8 rounded-lg border-border">
                    <SelectValue placeholder="Definir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Hermafrodita">Hermafrodita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hourglass className="h-4 w-4" />
                    <span>Tempo de vida aproximado</span>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={lifespan}
                      onChange={handleLifespanChange}
                      placeholder="Ex: 365"
                      className={cn(
                        'h-9 rounded-lg border-border',
                        lifespanError && 'border-destructive',
                      )}
                    />
                    {lifespanError && (
                      <p className="text-xs text-destructive mt-1">
                        {lifespanError}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLifespanSave}
                    className="h-9 px-3"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Em dias. Estimativa de vida total da espécie.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          {plant.observacoes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="section-title mb-0">
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{plant.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Attention Points */}
          {plant.pontos_negativos.length > 0 && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <CardTitle className="section-title mb-0 text-yellow-700 dark:text-yellow-500">
                  <AlertTriangle className="h-5 w-5" />
                  Pontos de Atenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plant.pontos_negativos.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Health Signs */}
          {plant.pontos_positivos.length > 0 && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="section-title mb-0 text-green-700 dark:text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  Sinais de Saúde
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plant.pontos_positivos.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Care Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="section-title mb-0">
                <Calendar className="h-5 w-5 text-primary" />
                Cuidados Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {plant.cuidados_recomendados.map((care, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="p-2 bg-white rounded-full shadow-sm text-primary">
                    {care.tipo_cuidado === 'rega' && (
                      <Droplets className="h-4 w-4" />
                    )}
                    {care.tipo_cuidado === 'luz' && <Sun className="h-4 w-4" />}
                    {care.tipo_cuidado === 'adubacao' && (
                      <Sprout className="h-4 w-4" />
                    )}
                    {care.tipo_cuidado === 'temperatura' && (
                      <Thermometer className="h-4 w-4" />
                    )}
                    {!['rega', 'luz', 'adubacao', 'temperatura'].includes(
                      care.tipo_cuidado,
                    ) && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {care.tipo_cuidado}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {care.descricao}
                    </p>
                    <p className="text-xs font-semibold text-primary mt-1">
                      {care.frequencia_sugerida}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Nutrition */}
          {plant.vitaminas_e_adubos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="section-title mb-0">
                  <Sprout className="h-5 w-5 text-primary" />
                  Nutrição e Ambiente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {plant.vitaminas_e_adubos.map((item, idx) => (
                    <li key={idx} className="space-y-1">
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.descricao}
                      </p>
                      <p className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded inline-block mt-1">
                        {item.indicacao_uso}
                      </p>
                      {idx < plant.vitaminas_e_adubos.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h3 className="section-title mb-0">
              <History className="h-5 w-5 text-primary" />
              Linha do Tempo
            </h3>
            <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Registrar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Cuidado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipo de Cuidado</Label>
                    <Select value={newLogType} onValueChange={setNewLogType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rega">Rega</SelectItem>
                        <SelectItem value="adubacao">Adubação</SelectItem>
                        <SelectItem value="poda">Poda</SelectItem>
                        <SelectItem value="pragas">
                          Tratamento de Pragas
                        </SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações (Opcional)</Label>
                    <Input
                      value={newLogNote}
                      onChange={(e) => setNewLogNote(e.target.value)}
                      placeholder="Ex: Usei fertilizante X..."
                    />
                  </div>
                  <Button onClick={handleAddLog} className="w-full">
                    Salvar Registro
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* History Container with fixed height and gradient overlay */}
          <div className="relative rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="h-[400px] overflow-y-auto p-4 pb-12 scroll-smooth">
              <CareHistory logs={plant.logs || []} />
            </div>
            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
