import { Planta } from '@/types'
import { supabase } from '@/lib/supabase/client'

export interface AIAnalysisResult extends Partial<Planta> {
  confidence?: number
}

export const identifyPlant = async (
  imageBase64: string,
): Promise<AIAnalysisResult> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'identify-plant-with-ai',
      {
        body: { image: imageBase64 },
      },
    )

    if (error) throw error
    if (data.error) throw new Error(data.error)

    // Map the response to our internal type structure
    return {
      nome_conhecido: data.nome_popular,
      nome_cientifico: data.nome_cientifico,
      observacoes: data.descricao,
      cuidados_recomendados: data.cuidados_recomendados || [],
      pontos_positivos: data.pontos_positivos || [],
      pontos_negativos: data.pontos_negativos || [],
      status_saude: data.status_saude || 'desconhecido',
      sexo: data.sexo,
      tempo_de_vida_aproximado_dias: data.tempo_de_vida_aproximado_dias,
      vitaminas_e_adubos: [], // AI might not return this specific structure yet
      datas_importantes: {
        ultima_analise: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('AI Identification failed:', error)
    throw error
  }
}
