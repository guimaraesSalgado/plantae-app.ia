import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { setOnboardingCompleted } from '@/lib/storage'
import { ArrowRight, Check, Leaf, Bell, Camera } from 'lucide-react'

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'Bem-vindo ao Guia das Plantas',
      description:
        'Seu assistente pessoal para cuidar do seu jardim com inteligência e carinho.',
      icon: <Leaf className="w-16 h-16 text-primary" />,
      color: 'bg-green-50',
    },
    {
      title: 'Identifique suas Plantas',
      description:
        'Tire uma foto e nossa IA irá identificar a espécie e sugerir os melhores cuidados.',
      icon: <Camera className="w-16 h-16 text-blue-500" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Nunca mais esqueça',
      description:
        'Receba lembretes automáticos de rega, adubação e outros cuidados essenciais.',
      icon: <Bell className="w-16 h-16 text-amber-500" />,
      color: 'bg-amber-50',
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setOnboardingCompleted(true)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-fade-in">
        <div
          className={`p-8 rounded-full ${steps[step].color} shadow-elevation transition-colors duration-500`}
        >
          {steps[step].icon}
        </div>

        <div className="space-y-4 max-w-xs mx-auto">
          <h1 className="text-2xl font-bold text-foreground transition-all duration-300">
            {steps[step].title}
          </h1>
          <p className="text-muted-foreground transition-all duration-300">
            {steps[step].description}
          </p>
        </div>

        <div className="flex gap-2 mt-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-primary' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 pb-10">
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg rounded-xl shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          {step === steps.length - 1 ? (
            <>
              Começar <Check className="ml-2 h-5 w-5" />
            </>
          ) : (
            <>
              Próximo <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
