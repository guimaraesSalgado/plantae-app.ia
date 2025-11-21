import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ManageAlerts() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center animate-fade-in">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="bg-primary/10 p-8 rounded-full mb-6 animate-float">
        <BellRing className="w-16 h-16 text-primary" />
      </div>

      <h1 className="text-2xl font-display font-bold text-foreground mb-2">
        Gerenciar Alertas
      </h1>
      <p className="text-muted-foreground max-w-xs mx-auto">
        Em breve você poderá gerenciar seus alertas aqui!
      </p>
    </div>
  )
}
