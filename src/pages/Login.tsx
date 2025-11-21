import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf, Lock, Eye, EyeOff, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { LoadingOverlay } from '@/components/LoadingOverlay'

export default function Login() {
  const navigate = useNavigate()
  const { refreshProfile, session } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Form States
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      navigate('/')
    }
  }, [session, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call Edge Function for Username/Email Login
      const { data, error } = await supabase.functions.invoke(
        'login-with-username',
        {
          body: { username, password },
        },
      )

      // Handle Network/System Errors
      if (error) {
        console.error('System Error:', error)
        throw new Error(
          'Não foi possível conectar. Verifique sua internet ou tente novamente mais tarde.',
        )
      }

      // Handle Logical Errors (User not found, Wrong password) returned by Edge Function
      if (data?.error) {
        throw new Error(data.error)
      }

      // Manually set session if the edge function returns it
      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession(
          data.session,
        )
        if (sessionError) throw sessionError
      }

      // Refresh profile data
      if (refreshProfile) {
        await refreshProfile()
      }

      // Success - Navigate to home
      navigate('/')
    } catch (error: any) {
      console.error('Login Error:', error)
      let message =
        'Não foi possível conectar. Verifique sua internet ou tente novamente mais tarde.'

      // Map specific error messages if needed, though Edge Function now returns them directly
      if (error.message) {
        message = error.message
      }

      toast({
        variant: 'destructive',
        title: 'Erro ao entrar',
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <LoadingOverlay isVisible={isLoading} message="Entrando..." />

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-brand-dark/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '2s' }}
      />

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 animate-sway">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Bem-vindo ao Plantae
          </h1>
          <p className="text-muted-foreground mt-2">
            Cuide do seu jardim com inteligência.
          </p>
        </div>

        <Card className="border-none shadow-elevation bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center sr-only">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Nome de usuário"
                    className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    className="pl-10 pr-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não tem conta?{' '}
                <Link
                  to="/onboarding"
                  className="text-primary font-medium hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
