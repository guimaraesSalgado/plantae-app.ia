import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Loader2, KeyRound } from 'lucide-react'
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

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [identifier, setIdentifier] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campo obrigatório',
        description: 'Informe seu e-mail para continuar.',
      })
      return
    }

    setIsLoading(true)

    const { data, error } =
      await AuthFlowService.initiateTemporaryPasswordReset(identifier)

    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          error.message ||
          'Não encontramos uma conta com esses dados. Verifique e tente novamente.',
      })
    } else {
      setIsSent(true)
      // For demo purposes, if the backend returned the password in debug field, log it
      if (data?.debug_temp_password) {
        console.log('DEBUG: Temporary Password:', data.debug_temp_password)
      }
      toast({
        title: 'Senha enviada',
        description: 'Enviamos uma senha temporária para o seu e-mail.',
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Login
        </Button>

        <Card className="border-none shadow-elevation bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-display font-bold text-center">
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-center">
              Informe seus dados para receber uma senha temporária.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <KeyRound className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-foreground font-medium">
                  Enviamos uma senha temporária para o seu e-mail. Use-a para
                  acessar o aplicativo e redefinir sua senha.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/login')}
                >
                  Voltar ao Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="E-mail ou Nome de Usuário"
                      className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
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
                    'Enviar Senha Temporária'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
