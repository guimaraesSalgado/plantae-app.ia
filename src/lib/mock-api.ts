import { Planta } from '@/types'
import { addDays } from 'date-fns'

// Simulates AI analysis delay and response
export const analyzePlantImage = async (
  image: string,
): Promise<Partial<Planta>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Randomize outcome for demo purposes
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

      const randomPlant =
        plantTypes[Math.floor(Math.random() * plantTypes.length)]

      const response: Partial<Planta> = {
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

      resolve(response)
    }, 2500) // 2.5s delay
  })
}
