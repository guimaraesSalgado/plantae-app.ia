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
  sexo?: 'Masculino' | 'Feminino' | 'Hermafrodita' | null
  tempo_de_vida_aproximado_dias?: number | null
  pontos_positivos: string[]
  pontos_negativos: string[]
  cuidados_recomendados: CuidadoRecomendado[]
  vitaminas_e_adubos: VitaminaAdubo[]
  datas_importantes: DatasImportantes
  logs: CareLog[]
  observacoes?: string
  createdAt: string
  updatedAt?: string
  proxima_data_rega?: string | null
  ultima_analise?: string | null
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
    | 'parabens'
    | 'problema'
  description: string
  dueDate: Date
  isOverdue: boolean
  priority: 'high' | 'medium' | 'low'
}

export interface AppNotification {
  id: string
  user_id: string
  plant_id?: string | null
  tipo: string
  titulo: string
  mensagem: string | null
  data_hora: string
  lida: boolean
  plants?: {
    apelido: string
    foto_url: string
  }
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
  username: string | null
  foto_perfil_url: string | null
  data_criacao: string
  username_change_count?: number
  is_temporary_password_active?: boolean
}

export type ActivityType =
  | 'create'
  | 'update'
  | 'delete'
  | 'care'
  | 'ia'
  | 'status_change'
  | 'refresh'

export interface ActivityLog {
  id: string
  user_id: string
  tipo: ActivityType
  planta_id?: string
  data_hora: string
  descricao_resumida: string
  origem: 'user' | 'system' | 'ia'
  plants?: {
    apelido: string
    foto_url: string
  }
}

export interface HistoryLogItem {
  plant_id: string
  plant_name: string
  plant_photo: string
  user_id: string
  log_id: string
  log_date: string
  log_type: CareLog['type']
  log_note: string
}
