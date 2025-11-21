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
  frequencia_sugerida: string
  intervalo_dias?: number
}

export interface VitaminaAdubo {
  nome: string
  descricao: string
  indicacao_uso: string
}

export interface DatasImportantes {
  ultima_analise?: string
  proxima_rega_sugerida?: string
  proxima_adubacao_sugerida?: string
}

export interface CareLog {
  id: string
  date: string
  type: 'rega' | 'adubacao' | 'poda' | 'foto' | 'pragas' | 'outro'
  note?: string
}

export interface Planta {
  id: string
  user_id?: string
  apelido: string
  nome_conhecido: string
  nome_cientifico?: string
  foto_url: string
  status_saude: 'saudavel' | 'atencao' | 'critico' | 'desconhecido'
  pontos_positivos: string[]
  pontos_negativos: string[]
  cuidados_recomendados: CuidadoRecomendado[]
  vitaminas_e_adubos: VitaminaAdubo[]
  datas_importantes: DatasImportantes
  logs: CareLog[]
  observacoes?: string
  createdAt: string
  updatedAt?: string
}

export interface NotificationItem {
  id: string
  plantId?: string
  plantName?: string
  type:
    | 'rega'
    | 'adubacao'
    | 'saude'
    | 'inatividade'
    | 'outro'
    | 'ia'
    | 'alerta'
    | 'geral'
    | 'poda'
  description: string // Used for backward compatibility or mapped from message
  dueDate: Date // Used for backward compatibility or mapped from data_hora
  isOverdue: boolean
  priority: 'high' | 'medium' | 'low'
}

export interface Notification {
  id: string
  user_id: string
  tipo: string
  titulo: string
  mensagem: string | null
  data_hora: string
  lida: boolean
}

export interface SyncConfig {
  enabled: boolean
  autoSync: boolean
  lastSync?: string
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline'

export interface UserProfile {
  id: string
  email: string
  nome: string | null
  foto_perfil_url: string | null
  data_criacao: string
}
