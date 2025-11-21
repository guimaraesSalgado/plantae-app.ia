import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isVisible: boolean
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Leaf className="w-12 h-12 text-primary animate-sway" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Carregando...
        </p>
      </div>
    </div>
  )
}
