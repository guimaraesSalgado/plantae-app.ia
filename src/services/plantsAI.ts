import { Planta } from '@/types'
import { addDays } from 'date-fns'

const API_URL = import.meta.env.VITE_PLANT_API_URL
const API_KEY = import.meta.env.VITE_PLANT_API_KEY

interface AIAnalysisResult extends Partial<Planta> {
  confidence?: number
}

// Fallback mock data generator
const generateMockAnalysis = (): AIAnalysisResult => {
  const healthRoll = Math.random()
  let status: Planta['status_saude'] = 'saudavel'
  if (healthRoll < 0.2) status = 'critico'
  else if (healthRoll < 0.5) status = 'atencao'

  const plantTypes = [
    { name: 'Monstera Deliciosa', care: 'Rega moderada, luz indireta' },
    {
      name: 'Sansevieria (Espada de São Jorge)',
      care: 'Pouca água, resistente',
    },
    { name: 'Ficus Lyrata', care: 'Muita luz, umidade constante' },
    { name: 'Suculenta Echeveria', care: 'Sol pleno, pouca água' },
    { name: 'Orquídea Phalaenopsis', care: 'Luz filtrada, rega semanal' },
  ]

  const randomPlant = plantTypes[Math.floor(Math.random() * plantTypes.length)]

  return {
    nome_conhecido: randomPlant.name,
    status_saude: status,
    pontos_positivos: [
      'Folhas com boa coloração',
      'Sem sinais visíveis de pragas',
      'Crescimento aparente adequado',
    ],
    pontos_negativos:
      status === 'saudavel'
        ? []
        : [
            'Algumas folhas amareladas',
            'Solo parece muito seco',
            'Possível falta de nutrientes',
          ],
    cuidados_recomendados: [
      {
        descricao: 'Regar quando o solo estiver seco',
        tipo_cuidado: 'rega',
        frequencia_sugerida: 'A cada 5 dias',
        intervalo_dias: 5,
      },
      {
        descricao: 'Manter em local iluminado',
        tipo_cuidado: 'luz',
        frequencia_sugerida: 'Diariamente',
        intervalo_dias: 1,
      },
      {
        descricao: 'Aplicar fertilizante NPK 10-10-10',
        tipo_cuidado: 'adubacao',
        frequencia_sugerida: 'Mensalmente',
        intervalo_dias: 30,
      },
    ],
    vitaminas_e_adubos: [
      {
        nome: 'NPK 10-10-10',
        descricao: 'Fertilizante equilibrado',
        indicacao_uso: 'Diluir em água e aplicar no solo',
      },
    ],
    datas_importantes: {
      ultima_analise: new Date().toISOString(),
      proxima_rega_sugerida: addDays(new Date(), 5).toISOString(),
      proxima_adubacao_sugerida: addDays(new Date(), 30).toISOString(),
    },
  }
}

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
      // Transform API data to our model (Simplified mapping logic)
      // This is a placeholder for the actual mapping logic depending on the specific API provider
      if (data && data.suggestions && data.suggestions.length > 0) {
        const suggestion = data.suggestions[0]
        return {
          ...generateMockAnalysis(), // Merge with mock for care details not always present in ID APIs
          nome_conhecido: suggestion.plant_name,
          confidence: suggestion.probability,
        }
      }
    } catch (error) {
      console.warn('API call failed, falling back to mock', error)
    }
  }

  // Fallback to mock simulation with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockAnalysis())
    }, 2000)
  })
}
