import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AuthFlowService } from '@/services/auth-flow'
import { UserService } from '@/services/user'

// Validation Schemas
const step1Schema = z
  .object({
    fullName: z.string().min(1, 'Preencha todos os campos.'),
    username: z.string().min(1, 'Preencha todos os campos.'),
    email: z
      .string()
      .min(1, 'Preencha todos os campos.')
      .email('E-mail em formato inválido.'),
    password: z.string().min(1, 'Preencha todos os campos.'),
    confirmPassword: z.string().min(1, 'Preencha todos os campos.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

const step2Schema = z.object({
  securityQuestion: z
    .string()
    .min(1, 'Selecione uma pergunta de segurança e forneça uma resposta.'),
  securityAnswer: z
    .string()
    .min(1, 'Selecione uma pergunta de segurança e forneça uma resposta.'),
})

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Forms
  const form1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const form2 = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { securityQuestion: '', securityAnswer: '' },
  })

  const onStep1Submit = async (data: any) => {
    setIsLoading(true)
    // Check username uniqueness
    const isAvailable = await UserService.checkUsernameAvailable(data.username)
    setIsLoading(false)

    if (!isAvailable) {
      form1.setError('username', {
        type: 'manual',
        message: 'Este nome de usuário já está em uso.',
      })
      return
    }

    setFormData((prev: any) => ({ ...prev, ...data }))
    setStep(2)
  }

  const onStep2Submit = async (data: any) => {
    const finalData = { ...formData, ...data }
    setIsLoading(true)

    try {
      const { error } = await AuthFlowService.registerUser(finalData)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro no cadastro',
          description:
            error.message ||
            'Não foi possível criar sua conta. Verifique os dados informados e tente novamente.',
        })
      } else {
        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Enviamos um e-mail para você confirmar sua conta.',
          className: 'bg-green-600 text-white border-none',
        })
        navigate('/login')
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description:
          'Não foi possível criar sua conta. Verifique os dados informados e tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => (step === 1 ? navigate('/login') : setStep(1))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 1 ? 'Voltar para Login' : 'Voltar'}
        </Button>

        <Card className="border-none shadow-elevation bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-2 bg-secondary w-full">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          <CardHeader>
            <CardTitle className="text-2xl font-display font-bold text-center">
              {step === 1 ? 'Crie sua conta' : 'Proteja sua conta'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? 'Preencha seus dados para começar.'
                : 'Escolha uma pergunta de segurança para recuperar sua senha.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <form
                onSubmit={form1.handleSubmit(onStep1Submit)}
                className="space-y-4 animate-slide-up"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Seu nome"
                      className="pl-10 rounded-xl"
                      {...form1.register('fullName')}
                    />
                  </div>
                  {form1.formState.errors.fullName && (
                    <p className="text-xs text-destructive">
                      {form1.formState.errors.fullName.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Seu usuário único"
                      className="pl-10 rounded-xl"
                      {...form1.register('username')}
                    />
                  </div>
                  {form1.formState.errors.username && (
                    <p className="text-xs text-destructive">
                      {form1.formState.errors.username.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 rounded-xl"
                      {...form1.register('email')}
                    />
                  </div>
                  {form1.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form1.formState.errors.email.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="******"
                      className="pl-10 pr-10 rounded-xl"
                      {...form1.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {form1.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {form1.formState.errors.password.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmação de senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="******"
                      className="pl-10 pr-10 rounded-xl"
                      {...form1.register('confirmPassword')}
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
                  {form1.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {form1.formState.errors.confirmPassword.message as string}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Continuar'
                  )}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form
                onSubmit={form2.handleSubmit(onStep2Submit)}
                className="space-y-6 animate-slide-up"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <ShieldCheck className="w-12 h-12 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pergunta de Segurança</Label>
                  <Select
                    onValueChange={(val) =>
                      form2.setValue('securityQuestion', val)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Selecione uma pergunta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Qual o nome do seu primeiro pet?">
                        Qual o nome do seu primeiro pet?
                      </SelectItem>
                      <SelectItem value="Qual a sua cidade natal?">
                        Qual a sua cidade natal?
                      </SelectItem>
                      <SelectItem value="Qual o nome da sua mãe?">
                        Qual o nome da sua mãe?
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {form2.formState.errors.securityQuestion && (
                    <p className="text-xs text-destructive">
                      {
                        form2.formState.errors.securityQuestion
                          .message as string
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityAnswer">Sua Resposta</Label>
                  <Input
                    id="securityAnswer"
                    placeholder="Digite sua resposta"
                    className="h-12 rounded-xl"
                    {...form2.register('securityAnswer')}
                  />
                  {form2.formState.errors.securityAnswer && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.securityAnswer.message as string}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    'Criar Conta'
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
