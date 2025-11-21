import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Save,
  Loader2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
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

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Password States
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Visibility States
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation State
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setName(profile.nome || '')
      setAvatarUrl(profile.foto_perfil_url)
    }
  }, [profile])

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

    // Reset errors
    setPasswordError(null)

    // Validate Passwords
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError(
          'As senhas não coincidem. Verifique e tente novamente.',
        )
        return
      }
      if (!oldPassword) {
        toast({
          variant: 'destructive',
          title: 'Senha atual necessária',
          description:
            'Por favor, digite sua senha atual para autorizar a mudança.',
        })
        return
      }
    }

    setIsLoading(true)

    // 1. Update Profile Data
    const { error: profileError } = await UserService.updateProfile(user.id, {
      nome: name,
    })

    if (profileError) {
      setIsLoading(false)
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: profileError.message,
      })
      return
    }

    // 2. Update Password (if provided)
    if (newPassword) {
      // Verify old password by trying to sign in (Authorization check)
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: oldPassword,
      })

      if (authError) {
        setIsLoading(false)
        toast({
          variant: 'destructive',
          title: 'Senha incorreta',
          description: 'A senha atual digitada está incorreta.',
        })
        return
      }

      // If authorized, update password
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
    }

    setIsLoading(false)
    await refreshProfile()

    // Success Feedback
    toast({
      title: 'Perfil atualizado com sucesso!',
      description: 'Seus dados foram salvos.',
      className: 'bg-brand-green text-white border-none animate-scale-press',
    })

    // Clear password fields
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="feature-title mb-0">Editar Perfil</h1>
      </div>

      <div className="flex flex-col items-center space-y-4">
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
        <p className="text-sm text-muted-foreground">
          Toque para alterar a foto
        </p>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-2xl shadow-subtle border border-border/50">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-brand-dark font-medium">
            Nome Completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 rounded-xl border-border focus:border-primary focus:ring-primary/20"
              placeholder="Seu nome"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-brand-dark font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="pl-10 bg-secondary/30 rounded-xl border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="font-medium text-brand-dark flex items-center gap-2">
            <Lock className="h-4 w-4" /> Alterar Senha
          </h3>

          <div className="space-y-2">
            <Label htmlFor="oldPassword">Senha Atual</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="pr-10 rounded-xl"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showOldPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10 rounded-xl"
                placeholder="Digite a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
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
                  passwordError
                    ? 'border-destructive focus:ring-destructive/20'
                    : '',
                )}
                placeholder="Confirme a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-sm text-destructive mt-1 animate-fade-in">
                {passwordError}
              </p>
            )}
          </div>
        </div>
      </div>

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
    </div>
  )
}
