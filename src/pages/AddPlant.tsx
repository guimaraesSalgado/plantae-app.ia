import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Loader2,
  ArrowLeft,
  Save,
  Leaf,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { identifyPlant, AIAnalysisResult } from '@/services/plantsAI'
import { PlantsService } from '@/services/plants'
import { StorageService } from '@/services/storage'
import { Planta } from '@/types'
import { ScanningEffect } from '@/components/ScanningEffect'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AddPlant() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<Partial<Planta>>({
    apelido: '',
    nome_conhecido: '',
    nome_cientifico: '',
    observacoes: '',
    cuidados_recomendados: [],
  })

  const analyzeImage = useCallback(
    async (image: string) => {
      setIsAnalyzing(true)
      setAnalysisError(null)

      try {
        const result = await identifyPlant(image)

        setFormData((prev) => ({
          ...prev,
          nome_conhecido: result.nome_conhecido || '',
          nome_cientifico: result.nome_cientifico || '',
          observacoes: result.observacoes || '',
          cuidados_recomendados: result.cuidados_recomendados || [],
          status_saude: result.status_saude,
          pontos_positivos: result.pontos_positivos,
          pontos_negativos: result.pontos_negativos,
          sexo: result.sexo,
          tempo_de_vida_aproximado_dias: result.tempo_de_vida_aproximado_dias,
          // Auto-fill nickname if empty
          apelido: prev.apelido || result.nome_conhecido || '',
        }))

        toast({
          title: 'Planta identificada!',
          description: 'Encontramos algumas informações sobre a sua planta.',
          className: 'bg-green-600 text-white border-none',
        })
      } catch (error) {
        console.error(error)
        setAnalysisError(
          'Não conseguimos identificar essa planta automaticamente. Você pode preencher os dados manualmente.',
        )
        toast({
          variant: 'destructive',
          title: 'Erro na identificação',
          description: 'Preencha os dados manualmente.',
        })
      } finally {
        setIsAnalyzing(false)
      }
    },
    [toast],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Auto-analyze when image changes
  useEffect(() => {
    if (imagePreview) {
      analyzeImage(imagePreview)
    }
  }, [imagePreview, analyzeImage])

  const handleSave = async () => {
    if (!imagePreview) return
    if (!formData.apelido) {
      toast({ variant: 'destructive', title: 'O apelido é obrigatório' })
      return
    }

    setIsSaving(true)
    try {
      const publicUrl = await StorageService.uploadBase64Image(
        imagePreview,
        'plant-photos',
      )
      if (!publicUrl) throw new Error('Falha ao enviar imagem')

      const newPlant: Omit<Planta, 'id' | 'createdAt'> = {
        apelido: formData.apelido,
        nome_conhecido: formData.nome_conhecido || 'Desconhecida',
        nome_cientifico: formData.nome_cientifico,
        foto_url: publicUrl,
        status_saude: formData.status_saude || 'desconhecido',
        sexo: formData.sexo,
        tempo_de_vida_aproximado_dias: formData.tempo_de_vida_aproximado_dias,
        pontos_positivos: formData.pontos_positivos || [],
        pontos_negativos: formData.pontos_negativos || [],
        cuidados_recomendados: formData.cuidados_recomendados || [],
        vitaminas_e_adubos: [],
        datas_importantes: {},
        logs: [],
        observacoes: formData.observacoes,
        proxima_data_rega: null,
        ultima_analise: new Date().toISOString(),
      }

      const savedPlant = await PlantsService.createPlant(newPlant)

      if (savedPlant) {
        toast({
          title: 'Planta salva!',
          description: 'Adicionada ao seu jardim.',
        })
        navigate('/')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="feature-title mb-0">Adicionar Planta</h1>
      </div>

      <div className="space-y-6">
        {/* Image Selection */}
        <div
          className="relative w-full aspect-video rounded-2xl bg-secondary/30 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-secondary/50 transition-all group"
          onClick={() =>
            !isAnalyzing && !isSaving && fileInputRef.current?.click()
          }
        >
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <ScanningEffect active={isAnalyzing} />
              {!isAnalyzing && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium flex items-center gap-2">
                    <Camera className="h-5 w-5" /> Trocar foto
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              <div className="bg-background p-4 rounded-full shadow-sm inline-block mb-3">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium text-foreground">
                Toque para adicionar foto
              </p>
              <p className="text-sm">Câmera ou Galeria</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isAnalyzing || isSaving}
          />
        </div>

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Analisando sua planta...</span>
          </div>
        )}

        {analysisError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro na identificação</AlertTitle>
            <AlertDescription>{analysisError}</AlertDescription>
          </Alert>
        )}

        {/* Form Fields */}
        <div
          className={`space-y-4 transition-opacity duration-500 ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="space-y-2">
            <Label htmlFor="apelido">Apelido (Obrigatório)</Label>
            <Input
              id="apelido"
              value={formData.apelido}
              onChange={(e) =>
                setFormData({ ...formData, apelido: e.target.value })
              }
              placeholder="Ex: Minha Jiboia"
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_conhecido">Nome Popular</Label>
              <Input
                id="nome_conhecido"
                value={formData.nome_conhecido}
                onChange={(e) =>
                  setFormData({ ...formData, nome_conhecido: e.target.value })
                }
                placeholder="Identificado pela IA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_cientifico">Nome Científico</Label>
              <Input
                id="nome_cientifico"
                value={formData.nome_cientifico}
                onChange={(e) =>
                  setFormData({ ...formData, nome_cientifico: e.target.value })
                }
                placeholder="Identificado pela IA"
                className="italic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Descrição / Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Detalhes sobre a planta..."
              className="min-h-[100px]"
            />
          </div>

          {/* Care Recommendations Preview/Edit */}
          <div className="space-y-2">
            <Label>Cuidados Recomendados</Label>
            {formData.cuidados_recomendados &&
            formData.cuidados_recomendados.length > 0 ? (
              <div className="grid gap-3">
                {formData.cuidados_recomendados.map((care, idx) => (
                  <Card key={idx} className="bg-secondary/20 border-border">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold capitalize text-primary">
                          {care.tipo_cuidado}
                        </span>
                        <span className="text-xs bg-background px-2 py-1 rounded border">
                          {care.frequencia_sugerida}
                        </span>
                      </div>
                      <Input
                        value={care.descricao}
                        onChange={(e) => {
                          const newCare = [
                            ...(formData.cuidados_recomendados || []),
                          ]
                          newCare[idx] = {
                            ...newCare[idx],
                            descricao: e.target.value,
                          }
                          setFormData({
                            ...formData,
                            cuidados_recomendados: newCare,
                          })
                        }}
                        className="h-8 text-sm mt-1"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-xl text-center">
                Nenhum cuidado identificado automaticamente.
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <Button
          className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg mt-6"
          onClick={handleSave}
          disabled={isAnalyzing || isSaving || !imagePreview}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Salvar Planta
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
