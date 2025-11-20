import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Cloud,
  CloudDownload,
  CloudUpload,
  RefreshCw,
  ShieldCheck,
  WifiOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { getSyncConfig, saveSyncConfig } from '@/lib/storage'
import { CloudSyncService } from '@/services/cloudSync'
import { SyncStatus } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function SyncBackup() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [config, setConfig] = useState(getSyncConfig())
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>(
    config.lastSync,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check initial online status
    if (!navigator.onLine) setStatus('offline')

    const handleOnline = () => {
      setStatus('idle')
      setErrorMessage(null)
    }
    const handleOffline = () => setStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleToggleEnabled = (checked: boolean) => {
    const newConfig = { ...config, enabled: checked }
    setConfig(newConfig)
    saveSyncConfig(newConfig)

    if (checked) {
      handleBackupNow()
    }
  }

  const handleToggleAutoSync = (checked: boolean) => {
    const newConfig = { ...config, autoSync: checked }
    setConfig(newConfig)
    saveSyncConfig(newConfig)
    toast({
      title: checked
        ? 'Sincronização automática ativada'
        : 'Sincronização automática desativada',
      description: checked
        ? 'Seus dados serão salvos automaticamente.'
        : 'Você precisará sincronizar manualmente.',
    })
  }

  const handleBackupNow = async () => {
    if (status === 'offline') {
      toast({
        variant: 'destructive',
        title: 'Sem conexão',
        description: 'Verifique sua internet.',
      })
      return
    }

    setStatus('syncing')
    setErrorMessage(null)
    try {
      await CloudSyncService.uploadData()
      setStatus('success')
      setLastSyncTime(new Date().toISOString())
      toast({
        title: 'Backup realizado!',
        description: 'Seus dados estão seguros na nuvem.',
        className: 'bg-[#065f46] text-white border-none', // Dark green success
      })
    } catch (error) {
      setStatus('error')
      setErrorMessage('Falha ao conectar com o servidor. Tentando novamente...')
      toast({
        variant: 'destructive',
        title: 'Erro no backup',
        description: 'Tente novamente mais tarde.',
      })
    } finally {
      setTimeout(() => {
        if (status !== 'error') setStatus('idle')
      }, 3000)
    }
  }

  const handleRestore = async () => {
    if (status === 'offline') {
      toast({
        variant: 'destructive',
        title: 'Sem conexão',
        description: 'Verifique sua internet.',
      })
      return
    }

    if (
      !confirm(
        'Isso irá substituir seus dados locais pelos dados da nuvem. Deseja continuar?',
      )
    )
      return

    setStatus('syncing')
    setErrorMessage(null)
    try {
      await CloudSyncService.restoreFromCloud()
      setStatus('success')
      setLastSyncTime(new Date().toISOString())
      toast({
        title: 'Dados restaurados!',
        description: 'Seus dados foram recuperados com sucesso.',
        className: 'bg-[#065f46] text-white border-none',
      })
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        'Não foi possível baixar os dados. Verifique sua conexão.',
      )
      toast({
        variant: 'destructive',
        title: 'Erro na restauração',
        description: 'Não foi possível baixar os dados.',
      })
    } finally {
      setTimeout(() => {
        if (status !== 'error') setStatus('idle')
      }, 3000)
    }
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="feature-title mb-0">Sincronização e Backup</h1>
      </div>

      {/* Status Card */}
      <Card className="border-none shadow-elevation bg-gradient-to-br from-primary to-brand-dark text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cloud className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'syncing' ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : status === 'offline' ? (
              <WifiOff className="h-6 w-6" />
            ) : status === 'error' ? (
              <AlertCircle className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
            {status === 'syncing'
              ? 'Sincronizando...'
              : status === 'offline'
                ? 'Sem Conexão'
                : status === 'error'
                  ? 'Erro na Sincronização'
                  : 'Status da Nuvem'}
          </CardTitle>
          <CardDescription className="text-white/80">
            {lastSyncTime
              ? `Última sincronização: ${format(new Date(lastSyncTime), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}`
              : 'Nenhum backup realizado ainda'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  status === 'success'
                    ? 'bg-white'
                    : status === 'error'
                      ? 'bg-red-400'
                      : status === 'syncing'
                        ? 'bg-yellow-400'
                        : 'bg-white/50',
                )}
              />
              <span className="font-medium">
                {status === 'success'
                  ? 'Sincronizado'
                  : status === 'error'
                    ? 'Falha na operação'
                    : status === 'syncing'
                      ? 'Processando...'
                      : 'Aguardando ação'}
              </span>
            </div>
            {errorMessage && (
              <p className="text-sm text-red-200 bg-red-900/20 p-2 rounded mt-2">
                {errorMessage}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="space-y-4">
        <Card className="border-border shadow-subtle bg-card">
          <CardHeader>
            <CardTitle className="section-title mb-0">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium text-foreground">
                  Ativar Backup na Nuvem
                </div>
                <div className="text-sm text-muted-foreground">
                  Salvar seus dados remotamente
                </div>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={handleToggleEnabled}
              />
            </div>

            {config.enabled && (
              <div className="flex items-center justify-between animate-fade-in">
                <div className="space-y-0.5">
                  <div className="font-medium text-foreground">
                    Sincronização Automática
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Manter dados sempre atualizados
                  </div>
                </div>
                <Switch
                  checked={config.autoSync}
                  onCheckedChange={handleToggleAutoSync}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {config.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            <Button
              onClick={handleBackupNow}
              disabled={status === 'syncing' || status === 'offline'}
              className="h-24 flex flex-col gap-2 bg-card hover:bg-secondary text-foreground border border-border shadow-sm active:scale-95 transition-all"
              variant="outline"
            >
              <CloudUpload className="h-8 w-8 text-primary" />
              <span className="font-semibold">Realizar Backup Agora</span>
            </Button>

            <Button
              onClick={handleRestore}
              disabled={status === 'syncing' || status === 'offline'}
              className="h-24 flex flex-col gap-2 bg-card hover:bg-secondary text-foreground border border-border shadow-sm active:scale-95 transition-all"
              variant="outline"
            >
              <CloudDownload className="h-8 w-8 text-foreground" />
              <span className="font-semibold">Restaurar Dados</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
