import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Upload,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Leaf,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { identifyPlant, AIAnalysisResult } from '@/services/plantsAI'
import { savePlant } from '@/lib/storage'
import { Planta } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { ScanningEffect } from '@/components/ScanningEffect'
import { Badge } from '@/components/ui/badge'

export default function AddPlant() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(
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
      // Auto-fill nickname if empty
      if (!nickname && result.nome_conhecido) {
        setNickname(result.nome_conhecido)
      }
      toast({
        title: 'Análise concluída!',
        description: `Identificamos sua planta como ${result.nome_conhecido}.`,
        className: 'bg-brand-green text-white border-none',
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

  const handleRetake = () => {
    setImagePreview(null)
    setAnalysisResult(null)
    setNickname('')
    fileInputRef.current?.click()
  }

  const handleSave = () => {
    if (!imagePreview || !analysisResult) return

    const newPlant: Planta = {
      id: uuidv4(),
      apelido: nickname || analysisResult.nome_conhecido || 'Minha Planta',
      nome_conhecido: analysisResult.nome_conhecido || 'Desconhecida',
      nome_cientifico: analysisResult.nome_cientifico,
      foto_url: imagePreview,
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
    <div className="space-y-6 pb-10 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-brand-dark">Nova Planta</h1>
      </div>

      <div className="space-y-6">
        {/* Image Upload Area */}
        <div className="flex justify-center">
          <div
            className="relative w-full max-w-sm aspect-square rounded-3xl bg-secondary/30 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-secondary/50 transition-all duration-300 shadow-sm group"
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <ScanningEffect active={isAnalyzing} />
                {!isAnalyzing && !analysisResult && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2">
                      <Camera className="h-5 w-5" /> Alterar foto
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-6 text-muted-foreground group-hover:scale-105 transition-transform">
                <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                  <Camera className="h-8 w-8 text-brand-green" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  Tirar ou escolher foto
                </p>
                <p className="text-sm mt-1">
                  Para identificar sua planta automaticamente
                </p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isAnalyzing}
            />
          </div>
        </div>

        {/* Analysis Result or Initial Form */}
        {analysisResult ? (
          <div className="animate-slide-up space-y-6">
            <Card className="border-brand-green/30 bg-brand-light/30 overflow-hidden">
              <div className="bg-brand-green/10 p-3 border-b border-brand-green/10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-brand-dark font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-brand-green" />
                  <span>Identificação Concluída</span>
                </div>
                {analysisResult.confidence && (
                  <Badge
                    variant="secondary"
                    className="bg-white text-brand-dark"
                  >
                    {(analysisResult.confidence * 100).toFixed(0)}% de precisão
                  </Badge>
                )}
              </div>
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                    Espécie Identificada
                  </p>
                  <p className="text-2xl font-bold text-brand-dark mt-1">
                    {analysisResult.nome_conhecido}
                  </p>
                  {analysisResult.nome_cientifico && (
                    <p className="text-sm text-muted-foreground italic">
                      {analysisResult.nome_cientifico}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Saúde</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          analysisResult.status_saude === 'saudavel'
                            ? 'bg-green-500'
                            : analysisResult.status_saude === 'atencao'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <span className="capitalize font-medium text-sm">
                        {analysisResult.status_saude}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">
                      Cuidados
                    </p>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-brand-green" />
                      <span className="font-medium text-sm">
                        {analysisResult.cuidados_recomendados?.length || 0}{' '}
                        sugestões
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="nickname">Apelido da planta</Label>
              <Input
                id="nickname"
                placeholder="Como você quer chamar ela?"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-white h-12 text-lg"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-brand-earth/20 text-brand-earth hover:bg-brand-light"
                onClick={handleRetake}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar outra
              </Button>
              <Button
                className="flex-[2] h-12 rounded-xl bg-brand-green hover:bg-brand-dark text-white shadow-lg shadow-brand-green/20"
                onClick={handleSave}
              >
                Adicionar ao Jardim
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {imagePreview && (
              <Button
                className="w-full h-14 text-lg rounded-xl bg-brand-dark hover:bg-brand-dark/90 text-white shadow-lg transition-all hover:scale-[1.02]"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando imagem...
                  </>
                ) : (
                  <>
                    <Leaf className="mr-2 h-5 w-5" />
                    Identificar Planta
                  </>
                )}
              </Button>
            )}

            {!imagePreview && (
              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start text-blue-800 text-sm">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>
                  Tire uma foto clara e bem iluminada da sua planta para que
                  nossa IA possa identificar a espécie e sugerir os melhores
                  cuidados.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
