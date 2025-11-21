import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Save,
  Loader2,
  User,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  Moon,
  Sun,
  Bell,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { UserService } from '@/services/user'
import { StorageService } from '@/services/storage'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/lib/theme'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile, signOut } = useAuth()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [usernameChangeCount, setUsernameChangeCount] = useState(0)

  // Password States
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        const fullProfile = await UserService.getProfile(user.id)
        if (fullProfile) {
          setName(fullProfile.nome || '')
          setUsername(fullProfile.username || '')
          setAvatarUrl(fullProfile.foto_perfil_url)
          setUsernameChangeCount(fullProfile.username_change_count || 0)
        }
      }
    }
    loadProfileData()
  }, [user, profile])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && user) {
      setIsLoading(true)
      const url = await StorageService.uploadImage(file, 'avatars')
      if (url) {
        setAvatarUrl(url)
        await UserService.updateProfile(user.id, { foto_perfil_url: url })
        await refreshProfile()
        toast({ title: 'Foto atualizada com sucesso!' })
      } else {
        toast({ variant: 'destructive', title: 'Erro ao enviar foto' })
      }
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setPasswordError(null)

    if (oldPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('As senhas não coincidem.')
        return
      }
      if (!newPassword) {
        setPasswordError('Digite a nova senha.')
        return
      }
    }

    setIsLoading(true)

    // 1. Update Name
    const updates: any = { nome: name }
    const { error: profileError } = await UserService.updateProfile(
      user.id,
      updates,
    )

    if (profileError) {
      setIsLoading(false)
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: profileError.message,
      })
      return
    }

    // 2. Update Username (if changed)
    if (username !== profile?.username) {
      if (usernameChangeCount >= 2) {
        toast({
          variant: 'destructive',
          title: 'Limite atingido',
          description:
            'Você já alterou seu nome de usuário duas vezes. Não é mais possível modificá-lo.',
        })
        // Revert username in UI
        setUsername(profile?.username || '')
      } else {
        const result = await UserService.updateUsername(username)
        if (!result.success) {
          setIsLoading(false)
          toast({
            variant: 'destructive',
            title: 'Erro ao atualizar usuário',
            description: result.message || 'Erro desconhecido',
          })
          return
        }
      }
    }

    // 3. Update Password
    if (oldPassword && newPassword) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: oldPassword,
      })

      if (authError) {
        setIsLoading(false)
        toast({
          variant: 'destructive',
          title: 'Senha atual incorreta.',
        })
        return
      }

      const { error: updateError } =
        await UserService.updatePassword(newPassword)

      if (updateError) {
        setIsLoading(false)
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar senha',
          description: updateError.message,
        })
        return
      }
      toast({ title: 'Senha atualizada com sucesso.' })
    }

    setIsLoading(false)
    await refreshProfile()
    // Reload local state to get new count
    const updatedProfile = await UserService.getProfile(user.id)
    if (updatedProfile) {
      setUsernameChangeCount(updatedProfile.username_change_count || 0)
    }

    toast({
      title: 'Perfil atualizado com sucesso!',
      className: 'bg-brand-green text-white border-none',
    })

    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setIsLoading(true)
    const { error } = await UserService.deleteAccount(user.id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar conta',
        description: 'Tente novamente mais tarde.',
      })
      setIsLoading(false)
    } else {
      await signOut()
      navigate('/login')
      toast({
        title: 'Conta deletada',
        description: 'Sua conta foi removida com sucesso.',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="feature-title">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e preferências.
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4 py-4">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg rounded-full">
            <AvatarImage
              src={avatarUrl || undefined}
              className="object-cover"
            />
            <AvatarFallback className="text-4xl bg-secondary text-primary">
              {name?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white h-8 w-8" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {name || 'Jardineiro'}
          </h2>
          <p className="text-sm text-muted-foreground">
            @{username || 'usuario'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <Card className="border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={usernameChangeCount >= 2}
                className={cn(
                  'rounded-xl border-transparent',
                  usernameChangeCount >= 2
                    ? 'bg-secondary/30'
                    : 'bg-background border-input',
                )}
              />
              <p className="text-xs text-muted-foreground">
                {usernameChangeCount >= 2
                  ? 'Você já atingiu o limite permitido de alterações.'
                  : 'Você pode alterar seu nome de usuário apenas duas vezes.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-secondary/30 rounded-xl border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pr-10 rounded-xl"
                  placeholder="Digite para alterar"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showOldPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Collapsible open={oldPassword.length > 0}>
              <CollapsibleContent className="space-y-4 animate-slide-up pt-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        'pr-10 rounded-xl',
                        passwordError ? 'border-destructive' : '',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  Tema Escuro
                </div>
                <div className="text-sm text-muted-foreground">
                  Alternar entre claro e escuro
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </div>
                <div className="text-sm text-muted-foreground">
                  Ver histórico de alertas
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/notifications')}
              >
                Ver
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg active:scale-95 transition-all"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Salvar Alterações
            </>
          )}
        </Button>

        <div className="pt-6 border-t border-border space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair da Conta
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive text-sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar Conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Isso excluirá permanentemente
                  sua conta e removerá todos os seus dados de nossos servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sim, deletar minha conta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
