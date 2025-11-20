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
import { getPlantById, savePlant, addCareLog } from '@/lib/storage'
import { identifyPlant } from '@/services/plantsAI'
import { Planta, CareLog } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CareHistory } from '@/components/CareHistory'
import { v4 as uuidv4 } from 'uuid'

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

  useEffect(() => {
    if (id) {
      const foundPlant = getPlantById(id)
      if (foundPlant) {
        setPlant(foundPlant)
      } else {
        navigate('/404')
      }
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

          const updatedPlant: Planta = {
            ...plant,
            status_saude: result.status_saude || plant.status_saude,
            pontos_positivos: result.pontos_positivos || plant.pontos_positivos,
            pontos_negativos: result.pontos_negativos || plant.pontos_negativos,
            cuidados_recomendados:
              result.cuidados_recomendados || plant.cuidados_recomendados,
            vitaminas_e_adubos:
              result.vitaminas_e_adubos || plant.vitaminas_e_adubos,
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
          updatedPlant.logs = [log, ...(updatedPlant.logs || [])]

          savePlant(updatedPlant)
          setPlant(updatedPlant)
          toast({
            title: 'Saúde atualizada!',
            description: 'As informações da planta foram renovadas.',
          })
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

  const handleAddLog = () => {
    if (!plant) return

    const log: CareLog = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type: newLogType as CareLog['type'],
      note: newLogNote,
    }

    addCareLog(plant.id, log)
    setPlant(getPlantById(plant.id)) // Refresh
    setIsLogDialogOpen(false)
    setNewLogNote('')
    toast({
      title: 'Histórico atualizado',
      description: 'O cuidado foi registrado com sucesso.',
    })
  }

  if (!plant) return null

  const statusColors = {
    saudavel: 'bg-green-100 text-green-800 border-green-200',
    atencao: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critico: 'bg-red-100 text-red-800 border-red-200',
    desconhecido: 'bg-gray-100 text-gray-800 border-gray-200',
  }

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
      <div className="relative rounded-3xl overflow-hidden shadow-elevation aspect-[4/3]">
        <img
          src={plant.foto_url}
          alt={plant.apelido}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20 text-white">
          <h1 className="text-3xl font-bold">{plant.apelido}</h1>
          <p className="text-white/90 font-medium">{plant.nome_conhecido}</p>
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
          {/* Observations */}
          {plant.observacoes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">
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
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
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
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
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
              <CardTitle className="text-lg flex items-center gap-2">
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
                <CardTitle className="text-lg flex items-center gap-2">
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
            <h3 className="text-lg font-semibold flex items-center gap-2">
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
          <CareHistory logs={plant.logs || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
