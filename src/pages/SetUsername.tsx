import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { UserService } from '@/services/user'

export default function SetUsername() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const handleUsernameChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value.toLowerCase().replace(/\s/g, '')
    setUsername(val)
    setIsAvailable(null)

    if (val.length > 2) {
      setIsChecking(true)
      const available = await UserService.checkUsernameAvailable(val)
      setIsAvailable(available)
      setIsChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isAvailable) return

    setIsLoading(true)
    const { error } = await UserService.setUsername(user.id, username)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o nome de usuário.',
      })
      setIsLoading(false)
    } else {
      await refreshProfile()
      toast({
        title: 'Sucesso!',
        description: 'Nome de usuário definido.',
      })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10 animate-fade-in">
        <Card className="border-none shadow-elevation bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-display font-bold text-center">
              Escolha seu Usuário
            </CardTitle>
            <CardDescription className="text-center">
              Para continuar, defina um nome de usuário único.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="nome_de_usuario"
                    className={`pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all ${
                      isAvailable === true
                        ? 'border-green-500 focus:border-green-500'
                        : isAvailable === false
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                    }`}
                    value={username}
                    onChange={handleUsernameChange}
                    required
                    minLength={3}
                  />
                  <div className="absolute right-3 top-3">
                    {isChecking ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : isAvailable === true ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : isAvailable === false ? (
                      <X className="h-5 w-5 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {isAvailable === false && (
                  <p className="text-xs text-red-500 ml-1">
                    Este nome de usuário já está em uso.
                  </p>
                )}
                <p className="text-xs text-muted-foreground ml-1">
                  Sem espaços, mínimo de 3 caracteres.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium active:scale-95 transition-transform"
                disabled={isLoading || !isAvailable}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  'Continuar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
