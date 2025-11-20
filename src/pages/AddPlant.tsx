import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { identifyPlant } from '@/services/plantsAI'
import { savePlant } from '@/lib/storage'
import { Planta } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export default function AddPlant() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<Partial<Planta> | null>(
    null,
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setAnalysisResult(null) // Reset analysis if image changes
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!imagePreview) return

    setIsAnalyzing(true)
    try {
      const result = await identifyPlant(imagePreview)
      setAnalysisResult(result)
      toast({
        title: 'Análise concluída!',
        description: `Identificamos sua planta como ${result.nome_conhecido}.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro na análise',
        description: 'Não foi possível identificar a planta. Tente novamente.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = () => {
    if (!imagePreview || !analysisResult) return

    const newPlant: Planta = {
      id: uuidv4(),
      apelido: nickname || analysisResult.nome_conhecido || 'Minha Planta',
      foto_url: imagePreview,
      nome_conhecido: analysisResult.nome_conhecido || 'Desconhecida',
      status_saude: analysisResult.status_saude || 'desconhecido',
      pontos_positivos: analysisResult.pontos_positivos || [],
      pontos_negativos: analysisResult.pontos_negativos || [],
      cuidados_recomendados: analysisResult.cuidados_recomendados || [],
      vitaminas_e_adubos: analysisResult.vitaminas_e_adubos || [],
      datas_importantes: analysisResult.datas_importantes || {},
      logs: [],
      createdAt: new Date().toISOString(),
    }

    savePlant(newPlant)
    toast({
      title: 'Planta salva!',
      description: 'Sua planta foi adicionada ao jardim.',
    })
    navigate('/')
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Nova Planta</h1>
      </div>

      <div className="space-y-6">
        {/* Image Upload */}
        <div className="flex justify-center">
          <div
            className="relative w-full max-w-xs aspect-square rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-secondary/80 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Toque para adicionar foto</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Nickname Input */}
        <div className="space-y-2">
          <Label htmlFor="nickname">Apelido da planta (opcional)</Label>
          <Input
            id="nickname"
            placeholder="Ex: Samambaia da Sala"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-white"
          />
        </div>

        {/* Analyze Button */}
        {!analysisResult && (
          <Button
            className="w-full h-12 text-lg rounded-xl"
            onClick={handleAnalyze}
            disabled={!imagePreview || isAnalyzing}
            variant="outline"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Analisar planta
              </>
            )}
          </Button>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <div className="animate-slide-up space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Identificação Concluída</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Nome identificado:
                  </p>
                  <p className="text-lg font-bold">
                    {analysisResult.nome_conhecido}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saúde:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        analysisResult.status_saude === 'saudavel'
                          ? 'bg-green-500'
                          : analysisResult.status_saude === 'atencao'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    />
                    <span className="capitalize font-medium">
                      {analysisResult.status_saude}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white"
              onClick={handleSave}
            >
              Salvar planta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
