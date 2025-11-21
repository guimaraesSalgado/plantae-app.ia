import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
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
import { AuthFlowService } from '@/services/auth-flow'
import { useAuth } from '@/hooks/use-auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'As senhas não coincidem. Tente novamente.',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha fraca',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      })
      return
    }

    setIsLoading(true)

    const { error } = await AuthFlowService.completePasswordReset(newPassword)

    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível redefinir a senha.',
      })
    } else {
      toast({
        title: 'Sucesso!',
        description: 'Senha alterada com sucesso!',
        className: 'bg-green-600 text-white border-none',
      })
      // Logout to force login with new password
      await signOut()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        <Card className="border-none shadow-elevation bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display font-bold text-center">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-center">
              Crie uma nova senha segura para sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Nova senha"
                    className="pl-10 pr-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
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
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmar nova senha"
                    className="pl-10 pr-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium active:scale-95 transition-transform"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  'Salvar nova senha'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
