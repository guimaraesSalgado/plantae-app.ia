import { Planta } from '@/types'
import { addDays } from 'date-fns'

const API_URL = import.meta.env.VITE_PLANT_API_URL
const API_KEY = import.meta.env.VITE_PLANT_API_KEY

export interface AIAnalysisResult extends Partial<Planta> {
  confidence?: number
}

// Deterministic hash function to simulate consistent AI results for the same image
const getHash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Detailed mock data for common plants
const MOCK_PLANTS: AIAnalysisResult[] = [
  {
    nome_conhecido: 'Espada de São Jorge',
    nome_cientifico: 'Sansevieria trifasciata',
    status_saude: 'saudavel',
    confidence: 0.98,
    pontos_positivos: [
      'Folhas eretas e firmes',
      'Coloração verde vibrante com bordas amarelas definidas',
      'Sem sinais de fungos ou pragas',
    ],
    pontos_negativos: [],
    cuidados_recomendados: [
      {
        descricao: 'Deixe o solo secar completamente antes de regar novamente.',
        tipo_cuidado: 'rega',
        frequencia_sugerida: 'A cada 15-20 dias',
        intervalo_dias: 15,
      },
      {
        descricao: 'Luz indireta a meia-sombra. Tolera pouca luz.',
        tipo_cuidado: 'luz',
        frequencia_sugerida: 'Diariamente',
        intervalo_dias: 1,
      },
      {
        descricao: 'Limpar as folhas com pano úmido para remover poeira.',
        tipo_cuidado: 'outro',
        frequencia_sugerida: 'Mensalmente',
        intervalo_dias: 30,
      },
    ],
    vitaminas_e_adubos: [
      {
        nome: 'NPK 10-10-10',
        descricao: 'Adubo padrão equilibrado',
        indicacao_uso:
          'Aplicar na terra a cada 2 meses durante a primavera/verão',
      },
    ],
    datas_importantes: {
      ultima_analise: new Date().toISOString(),
      proxima_rega_sugerida: addDays(new Date(), 15).toISOString(),
      proxima_adubacao_sugerida: addDays(new Date(), 60).toISOString(),
    },
  },
  {
    nome_conhecido: 'Costela de Adão',
    nome_cientifico: 'Monstera deliciosa',
    status_saude: 'atencao',
    confidence: 0.95,
    pontos_positivos: ['Folhas grandes e fenestradas', 'Crescimento vigoroso'],
    pontos_negativos: [
      'Leve amarelamento nas bordas',
      'Solo parece compactado',
    ],
    cuidados_recomendados: [
      {
        descricao: 'Manter o solo levemente úmido, não encharcado.',
        tipo_cuidado: 'rega',
        frequencia_sugerida: 'A cada 5-7 dias',
        intervalo_dias: 5,
      },
      {
        descricao: 'Luz indireta brilhante. Evite sol direto forte.',
        tipo_cuidado: 'luz',
        frequencia_sugerida: 'Diariamente',
        intervalo_dias: 1,
      },
    ],
    vitaminas_e_adubos: [
      {
        nome: 'Húmus de Minhoca',
        descricao: 'Adubo orgânico rico em nutrientes',
        indicacao_uso: 'Misturar na superfície do solo mensalmente',
      },
    ],
    datas_importantes: {
      ultima_analise: new Date().toISOString(),
      proxima_rega_sugerida: addDays(new Date(), 5).toISOString(),
      proxima_adubacao_sugerida: addDays(new Date(), 30).toISOString(),
    },
  },
  {
    nome_conhecido: 'Jiboia',
    nome_cientifico: 'Epipremnum aureum',
    status_saude: 'saudavel',
    confidence: 0.92,
    pontos_positivos: ['Folhas brilhantes', 'Muitos brotos novos'],
    pontos_negativos: [],
    cuidados_recomendados: [
      {
        descricao: 'Regar quando o topo do solo estiver seco.',
        tipo_cuidado: 'rega',
        frequencia_sugerida: 'Semanalmente',
        intervalo_dias: 7,
      },
      {
        descricao: 'Adapta-se bem a diversos níveis de luz.',
        tipo_cuidado: 'luz',
        frequencia_sugerida: 'Diariamente',
        intervalo_dias: 1,
      },
    ],
    vitaminas_e_adubos: [
      {
        nome: 'Fertilizante Líquido Verde',
        descricao: 'Para folhagens',
        indicacao_uso: 'Diluir na água da rega quinzenalmente',
      },
    ],
    datas_importantes: {
      ultima_analise: new Date().toISOString(),
      proxima_rega_sugerida: addDays(new Date(), 7).toISOString(),
      proxima_adubacao_sugerida: addDays(new Date(), 15).toISOString(),
    },
  },
  {
    nome_conhecido: 'Suculenta Echeveria',
    nome_cientifico: 'Echeveria elegans',
    status_saude: 'critico',
    confidence: 0.89,
    pontos_positivos: ['Formato de roseta preservado'],
    pontos_negativos: [
      'Folhas da base translúcidas (excesso de água)',
      'Estiolamento (falta de luz)',
    ],
    cuidados_recomendados: [
      {
        descricao: 'Suspender rega até o solo secar totalmente.',
        tipo_cuidado: 'rega',
        frequencia_sugerida: 'A cada 10-15 dias',
        intervalo_dias: 10,
      },
      {
        descricao: 'Precisa de sol direto por pelo menos 4h.',
        tipo_cuidado: 'luz',
        frequencia_sugerida: 'Diariamente',
        intervalo_dias: 1,
      },
    ],
    vitaminas_e_adubos: [
      {
        nome: 'Adubo para Cactos e Suculentas',
        descricao: 'Baixo nitrogênio',
        indicacao_uso: 'Aplicar a cada 3 meses',
      },
    ],
    datas_importantes: {
      ultima_analise: new Date().toISOString(),
      proxima_rega_sugerida: addDays(new Date(), 10).toISOString(),
      proxima_adubacao_sugerida: addDays(new Date(), 90).toISOString(),
    },
  },
]

export const identifyPlant = async (
  imageBase64: string,
): Promise<AIAnalysisResult> => {
  // If API URL and Key are present, try to fetch
  if (API_URL && API_KEY) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': API_KEY,
        },
        body: JSON.stringify({
          images: [imageBase64],
          modifiers: ['crops_fast', 'similar_images'],
          plant_language: 'pt',
          plant_details: [
            'common_names',
            'url',
            'name_authority',
            'wiki_description',
            'taxonomy',
            'synonyms',
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      if (data && data.suggestions && data.suggestions.length > 0) {
        const suggestion = data.suggestions[0]
        // Merge with a mock template to ensure we have care data (APIs often don't provide care info directly)
        const template = MOCK_PLANTS[0]
        return {
          ...template,
          nome_conhecido: suggestion.plant_name,
          nome_cientifico: suggestion.plant_details?.scientific_name,
          confidence: suggestion.probability,
        }
      }
    } catch (error) {
      console.warn('API call failed, falling back to mock', error)
    }
  }

  // Fallback to robust mock simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      // Use hash to pick a plant deterministically based on image content length/data
      // This ensures that if the user uploads the same image, they get the same result
      const hash = getHash(imageBase64)
      const index = hash % MOCK_PLANTS.length

      const baseResult = MOCK_PLANTS[index]

      // Clone to avoid mutating the constant
      const result = { ...baseResult }

      // Update timestamp
      result.datas_importantes = {
        ...result.datas_importantes,
        ultima_analise: new Date().toISOString(),
      }

      resolve(result)
    }, 3000) // 3s delay to allow scanning animation to play
  })
}
