import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function Splash() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (session) {
          navigate('/')
        } else {
          navigate('/login')
        }
      }, 2500) // 2.5 seconds duration

      return () => clearTimeout(timer)
    }
  }, [loading, session, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#065f46] to-[#10b981] relative overflow-hidden">
      {/* Wind Particles */}
      <div
        className="absolute top-1/4 left-0 w-2 h-2 bg-white/20 rounded-full animate-wind-particle"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute top-1/3 left-0 w-1 h-1 bg-white/30 rounded-full animate-wind-particle"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 left-0 w-3 h-3 bg-white/10 rounded-full animate-wind-particle"
        style={{ animationDelay: '4s' }}
      />

      {/* Logo and Animation */}
      <div className="flex flex-col items-center z-10 animate-fade-in">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
          <Leaf className="w-24 h-24 text-white animate-sway drop-shadow-lg" />
        </div>
        <h1 className="text-5xl font-display font-bold text-white tracking-tight drop-shadow-md animate-slide-up">
          plantae
        </h1>
        <p
          className="text-white/80 mt-2 font-medium animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          Seu jardim, conectado.
        </p>
      </div>
    </div>
  )
}
