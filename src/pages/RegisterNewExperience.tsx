import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RegisterNewExperience() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center animate-fade-in">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/login')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="bg-brand-green/10 p-8 rounded-full mb-6 animate-pulse">
        <Sparkles className="w-16 h-16 text-brand-green" />
      </div>

      <h1 className="text-2xl font-display font-bold text-foreground mb-2">
        Nova Experiência
      </h1>
      <p className="text-muted-foreground max-w-xs mx-auto">
        Nova experiência de cadastro chegando em breve!
      </p>
    </div>
  )
}
