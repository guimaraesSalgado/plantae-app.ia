import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, Leaf, Home, PlusCircle, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { requestNotificationPermission } from '@/services/notifications'
import { CareMonitorService } from '@/services/careMonitor'
import { CloudSyncService } from '@/services/cloudSync'
import { getSyncConfig } from '@/lib/storage'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [notificationCount, setNotificationCount] = useState(0)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Check for notifications and permissions
  useEffect(() => {
    requestNotificationPermission()

    const checkStatus = async () => {
      // Run Care Monitor
      const notifications = CareMonitorService.checkPlantStatus()
      setNotificationCount(notifications.length)

      // Run Auto Sync if enabled
      const syncConfig = getSyncConfig()
      if (syncConfig.enabled && syncConfig.autoSync && navigator.onLine) {
        await CloudSyncService.syncData()
      }
    }

    checkStatus()
    // Poll every minute
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [location.pathname])

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/add', label: 'Adicionar Planta', icon: PlusCircle },
    { path: '/notifications', label: 'Alertas e Cuidados', icon: Bell },
    { path: '/sync-backup', label: 'Sincronização e Backup', icon: Cloud },
  ]

  const handleNavigation = (path: string) => {
    if (location.pathname === path) {
      setIsSheetOpen(false)
      return
    }

    setIsSheetOpen(false)
    // Wait for sheet close animation (approx 300ms) before navigating
    // This ensures smooth transition and prevents visual glitches
    setTimeout(() => {
      navigate(path)
    }, 300)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-brand-light/50 transition-colors"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[350px] border-r-brand-light"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-brand-green text-xl font-display">
                  <Leaf className="h-6 w-6" />
                  Guia das Plantas
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-2">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 w-full text-left group',
                        'hover:bg-brand-light/80 active:scale-95 active:opacity-80', // Microinteractions
                        'animate-drawer-item', // Fade-in animation
                        isActive
                          ? 'bg-brand-light text-brand-dark shadow-sm' // Active styles
                          : 'text-foreground/80 hover:text-brand-dark bg-transparent',
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 transition-colors duration-200',
                          isActive
                            ? 'text-brand-green'
                            : 'text-muted-foreground group-hover:text-brand-green',
                        )}
                      />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 font-display font-bold text-xl text-brand-green tracking-tight">
          Guia das Plantas
        </div>

        <Link to="/notifications" className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-brand-light/50 transition-colors"
          >
            <Bell className="h-6 w-6 group-hover:text-brand-green transition-colors" />
            <span className="sr-only">Notificações</span>
          </Button>
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full animate-pulse"
            >
              {notificationCount}
            </Badge>
          )}
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-8 px-4 container mx-auto max-w-md md:max-w-2xl lg:max-w-4xl overflow-hidden">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
