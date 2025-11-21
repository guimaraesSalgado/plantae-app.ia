import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Loader2,
  Check,
  ShieldCheck,
  User,
  Mail,
  Calendar,
  Lock,
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
import { cn } from '@/lib/utils'

// Validation Schemas
const step1Schema = z.object({
  fullName: z
    .string()
    .min(1, 'Por favor, preencha todos os campos obrigatórios.'),
  username: z.string().min(3, 'O usuário deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
})

const step2Schema = z
  .object({
    dateOfBirth: z
      .string()
      .min(1, 'Por favor, preencha todos os campos obrigatórios.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z
      .string()
      .min(1, 'Por favor, preencha todos os campos obrigatórios.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

const step3Schema = z.object({
  securityQuestion: z
    .string()
    .min(1, 'Por favor, escolha uma pergunta de segurança.'),
  securityAnswer: z
    .string()
    .min(1, 'Por favor, digite a resposta para sua pergunta de segurança.'),
})

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})

  // Forms
  const form1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { fullName: '', username: '', email: '' },
  })
  const form2 = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { dateOfBirth: '', password: '', confirmPassword: '' },
  })
  const form3 = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: { securityQuestion: '', securityAnswer: '' },
  })

  const onStep1Submit = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }))
    setStep(2)
  }

  const onStep2Submit = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }))
    setStep(3)
  }

  const onStep3Submit = async (data: any) => {
    const finalData = { ...formData, ...data }
    setIsLoading(true)

    try {
      const { error } = await AuthFlowService.registerUser(finalData)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro no cadastro',
          description: error.message || 'Ocorreu um erro inesperado.',
        })
      } else {
        toast({
          title: 'Cadastro concluído!',
          description: 'Agora você já pode acessar o app.',
          className: 'bg-green-600 text-white border-none',
        })
        navigate('/login')
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: 'Não foi possível completar o cadastro. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        {step === 1 && (
          <Button
            variant="ghost"
            className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Login
          </Button>
        )}

        <Card className="border-none shadow-elevation bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-2 bg-secondary w-full">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <CardHeader>
            <CardTitle className="text-2xl font-display font-bold text-center">
              {step === 1 && 'Bem-vindo(a) ao Guia das Plantas!'}
              {step === 2 && 'Quase lá! Agora, crie sua senha.'}
              {step === 3 && 'Proteja sua conta!'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 &&
                'Para começar, precisamos de algumas informações básicas.'}
              {step === 2 &&
                'Sua senha deve ser segura e fácil de lembrar para você.'}
              {step === 3 &&
                'Escolha uma pergunta de segurança para recuperar sua senha facilmente no futuro.'}
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
                  <Label htmlFor="username">User</Label>
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

                <Button type="submit" className="w-full h-12 rounded-xl mt-4">
                  Continuar
                </Button>
              </form>
            )}

            {step === 2 && (
              <form
                onSubmit={form2.handleSubmit(onStep2Submit)}
                className="space-y-4 animate-slide-up"
              >
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Data de nascimento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="pl-10 rounded-xl"
                      {...form2.register('dateOfBirth')}
                    />
                  </div>
                  {form2.formState.errors.dateOfBirth && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.dateOfBirth.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="******"
                      className="pl-10 rounded-xl"
                      {...form2.register('password')}
                    />
                  </div>
                  {form2.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.password.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmação de senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="******"
                      className="pl-10 rounded-xl"
                      {...form2.register('confirmPassword')}
                    />
                  </div>
                  {form2.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.confirmPassword.message as string}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-[2] h-12 rounded-xl">
                    Concluir
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form
                onSubmit={form3.handleSubmit(onStep3Submit)}
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
                      form3.setValue('securityQuestion', val)
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
                  {form3.formState.errors.securityQuestion && (
                    <p className="text-xs text-destructive">
                      {
                        form3.formState.errors.securityQuestion
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
                    {...form3.register('securityAnswer')}
                  />
                  {form3.formState.errors.securityAnswer && (
                    <p className="text-xs text-destructive">
                      {form3.formState.errors.securityAnswer.message as string}
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
                    'Salvar Pergunta de Segurança'
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
