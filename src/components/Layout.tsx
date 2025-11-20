import { Outlet, Link, useLocation } from 'react-router-dom'
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

export default function Layout() {
  const location = useLocation()
  const [notificationCount, setNotificationCount] = useState(0)

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-brand-green">
                  <Leaf className="h-6 w-6" />
                  Guia das Plantas
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-2 text-lg font-medium hover:bg-brand-light rounded-md transition-colors text-brand-dark"
                >
                  <Home className="h-5 w-5" />
                  Início
                </Link>
                <Link
                  to="/add"
                  className="flex items-center gap-3 px-4 py-2 text-lg font-medium hover:bg-brand-light rounded-md transition-colors text-brand-dark"
                >
                  <PlusCircle className="h-5 w-5" />
                  Adicionar Planta
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center gap-3 px-4 py-2 text-lg font-medium hover:bg-brand-light rounded-md transition-colors text-brand-dark"
                >
                  <Bell className="h-5 w-5" />
                  Alertas e Cuidados
                </Link>
                <Link
                  to="/sync-backup"
                  className="flex items-center gap-3 px-4 py-2 text-lg font-medium hover:bg-brand-light rounded-md transition-colors text-brand-dark"
                >
                  <Cloud className="h-5 w-5" />
                  Sincronização e Backup
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 font-display font-bold text-xl text-brand-green tracking-tight">
          Guia das Plantas
        </div>

        <Link to="/notifications" className="relative">
          <Button variant="ghost" size="icon" className="text-foreground">
            <Bell className="h-6 w-6" />
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
      <main className="flex-1 pt-16 pb-6 px-4 container mx-auto max-w-md md:max-w-2xl lg:max-w-4xl animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}
