export interface CuidadoRecomendado {
  descricao: string
  tipo_cuidado:
    | 'rega'
    | 'adubacao'
    | 'luz'
    | 'poda'
    | 'solo'
    | 'umidade'
    | 'temperatura'
    | 'outro'
  frequencia_sugerida: string // Ex: "A cada 3 dias", "Mensalmente"
  intervalo_dias?: number // Helper for calculation
}

export interface VitaminaAdubo {
  nome: string
  descricao: string
  indicacao_uso: string
}

export interface DatasImportantes {
  ultima_analise?: string // ISO Date string
  proxima_rega_sugerida?: string // ISO Date string
  proxima_adubacao_sugerida?: string // ISO Date string
}

export interface Planta {
  id: string
  apelido: string
  nome_conhecido: string
  foto_url: string
  status_saude: 'saudavel' | 'atencao' | 'critico' | 'desconhecido'
  pontos_positivos: string[]
  pontos_negativos: string[]
  cuidados_recomendados: CuidadoRecomendado[]
  vitaminas_e_adubos: VitaminaAdubo[]
  datas_importantes: DatasImportantes
  createdAt: string
}

export interface NotificationItem {
  id: string
  plantId: string
  plantName: string
  type: 'rega' | 'adubacao' | 'outro'
  description: string
  dueDate: Date
  isOverdue: boolean
}
