import { cn } from '@/lib/utils'

interface ScanningEffectProps {
  active: boolean
  className?: string
}

export function ScanningEffect({ active, className }: ScanningEffectProps) {
  if (!active) return null

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10',
        className,
      )}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-green/80 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-scan" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/70 text-white px-5 py-2.5 rounded-full text-sm font-medium backdrop-blur-md animate-pulse flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
          Identificando planta...
        </div>
      </div>
    </div>
  )
}
