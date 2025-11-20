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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { UserService } from '@/services/user'
import { StorageService } from '@/services/storage'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

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
        // Auto save avatar
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
    setIsLoading(true)

    // Update Profile Data
    const { error: profileError } = await UserService.updateProfile(user.id, {
      nome: name,
    })

    // Update Password if provided
    let passwordError = null
    if (password) {
      const { error } = await UserService.updatePassword(password)
      passwordError = error
    }

    setIsLoading(false)

    if (profileError || passwordError) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: profileError?.message || passwordError?.message,
      })
    } else {
      await refreshProfile()
      toast({
        title: 'Perfil atualizado',
        description: 'Seus dados foram salvos com sucesso.',
        className: 'bg-brand-green text-white border-none',
      })
      setPassword('') // Clear password field
    }
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
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
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

      <div className="space-y-4 bg-card p-6 rounded-2xl shadow-sm border">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              placeholder="Seu nome"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="pl-10 bg-secondary/50"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            O email não pode ser alterado.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <Label htmlFor="password">Nova Senha (Opcional)</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              placeholder="Deixe em branco para manter"
              minLength={6}
            />
          </div>
        </div>
      </div>

      <Button
        className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg"
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
