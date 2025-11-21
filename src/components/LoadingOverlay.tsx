import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function LoadingOverlay({
  isVisible,
  message = 'Carregando...',
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300',
        isVisible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none',
      )}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Leaf className="w-16 h-16 text-primary animate-sway drop-shadow-lg" />
        </div>
        <p className="text-lg font-medium text-foreground/80 animate-pulse font-display tracking-wide">
          {message}
        </p>
      </div>
    </div>,
    document.body,
  )
}
