import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Leaf,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Login() {
  const navigate = useNavigate()
  const { refreshProfile, session } = useAuth()

  // Form States
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // UI States
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      navigate('/')
    }
  }, [session, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Empty Fields Validation
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Preencha usuário e senha para continuar.')
      return
    }

    setIsLoading(true)

    try {
      // Timeout Promise (8 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 8000)
      })

      // Login Request Promise
      const loginPromise = supabase.functions.invoke('login-with-username', {
        body: { username, password },
      })

      // Race between login and timeout
      const result: any = await Promise.race([loginPromise, timeoutPromise])
      const { data, error } = result

      // Handle Network/System Errors from Supabase SDK
      if (error) {
        console.error('System Error:', error)
        throw new Error('NETWORK_ERROR')
      }

      // Handle Logical Errors returned by Edge Function
      if (data?.error) {
        // Map backend errors to specific user story requirement
        if (
          data.error === 'Usuário não encontrado.' ||
          data.error === 'Senha incorreta.' ||
          data.error.includes('Invalid login credentials')
        ) {
          throw new Error('INVALID_CREDENTIALS')
        }
        throw new Error(data.error)
      }

      // Success Handling
      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession(
          data.session,
        )
        if (sessionError) throw sessionError

        // Refresh profile data if method exists
        if (refreshProfile) {
          await refreshProfile()
        }

        // Redirect immediately
        navigate('/')
      } else {
        throw new Error('NO_SESSION')
      }
    } catch (error: any) {
      console.error('Login Error:', error)
      setIsLoading(false) // Stop loading immediately on error

      // Error Message Handling
      if (error.message === 'TIMEOUT') {
        setErrorMessage(
          'Não foi possível conectar. Verifique sua internet ou tente novamente.',
        )
      } else if (error.message === 'INVALID_CREDENTIALS') {
        setErrorMessage('Usuário ou senha incorretos. Tente novamente.')
        setPassword('') // Clear password field
      } else if (
        error.message === 'NETWORK_ERROR' ||
        error.message === 'NO_SESSION'
      ) {
        setErrorMessage(
          'Ocorreu um erro ao acessar o servidor. Tente novamente em alguns instantes.',
        )
      } else {
        // Generic fallback for other errors
        setErrorMessage(
          'Ocorreu um erro ao acessar o servidor. Tente novamente em alguns instantes.',
        )
      }
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
              <div className="space-y-4">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    User
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Nome de usuário"
                      className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      className="pl-10 pr-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-1"
                      disabled={isLoading}
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Exibir senha'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
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
              </div>

              {/* Error Message Area */}
              {errorMessage && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 border-red-200 text-red-800 animate-fade-in"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2 text-sm font-medium">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Entrar'
                )}
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
