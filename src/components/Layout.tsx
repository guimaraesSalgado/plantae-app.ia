import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, User, Bell, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import {
  requestNotificationPermission,
  NotificationsService,
} from '@/services/notifications'
import { CareMonitorService } from '@/services/careMonitor'
import { CloudSyncService } from '@/services/cloudSync'
import { getSyncConfig } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    requestNotificationPermission()

    const checkStatus = async () => {
      await CareMonitorService.checkPlantStatus()
      const count = await NotificationsService.getUnreadCount()
      setUnreadCount(count)

      const syncConfig = getSyncConfig()
      if (syncConfig.enabled && syncConfig.autoSync && navigator.onLine) {
        await CloudSyncService.syncData()
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 60000)

    return () => clearInterval(interval)
  }, [location.pathname])

  const handleBellClick = () => {
    navigate('/notifications')
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/plants', label: 'Plantas', icon: Sprout },
    { path: '/add', label: 'Adicionar', icon: PlusCircle },
    { path: '/profile', label: 'Perfil', icon: User },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="font-display font-bold text-xl text-brand-dark dark:text-foreground tracking-tight">
            plantae
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-foreground hover:bg-secondary transition-colors"
            onClick={handleBellClick}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
            )}
            <span className="sr-only">Notificações</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-24 px-4 container mx-auto max-w-md md:max-w-2xl lg:max-w-4xl overflow-hidden">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 active:scale-95',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-xl transition-all duration-300',
                    isActive && 'bg-primary/10',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-6 w-6 transition-all duration-300',
                      isActive ? 'fill-current' : 'stroke-current',
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-all duration-200',
                    isActive ? 'font-bold' : 'font-normal',
                  )}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
