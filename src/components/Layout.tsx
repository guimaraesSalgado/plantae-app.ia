import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Home,
  PlusCircle,
  User,
  LogOut,
  Settings,
  History,
  Bell,
  Leaf,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Badge } from '@/components/ui/badge'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
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

  const navItems = [
    { path: '/', label: 'Plantas', icon: Home },
    { path: '/add', label: 'Adicionar', icon: PlusCircle },
    { path: '/history', label: 'Histórico', icon: History },
    { path: '/notifications', label: 'Notificações', icon: Bell },
    { path: '/profile', label: 'Perfil', icon: User },
    { path: '/sync-backup', label: 'Configurações', icon: Settings },
  ]

  const handleNavigation = (path: string) => {
    if (location.pathname === path) {
      setIsSheetOpen(false)
      return
    }

    setIsSheetOpen(false)
    setTimeout(() => {
      navigate(path)
    }, 300)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handleBellClick = () => {
    setIsSheetOpen(false)
    navigate('/notifications')
  }

  const getWelcomeMessage = () => {
    const name =
      profile?.nome?.split(' ')[0] || profile?.username || 'Jardineiro'
    if (unreadCount > 0) {
      return (
        <>
          Olá, {name}! 🌱 <br />
          Você tem <span className="font-bold text-white">
            {unreadCount}
          </span>{' '}
          notificações.
        </>
      )
    }
    return (
      <>
        Olá, {name}! 🌿 <br />
        Tudo pronto hoje?
      </>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-secondary transition-colors"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[350px] border-r-border bg-card p-0 flex flex-col"
            >
              <div className="bg-gradient-to-br from-[#065f46] to-[#10b981] p-6 pt-10 text-white relative overflow-hidden">
                <Leaf className="absolute top-4 right-4 text-white/10 w-24 h-24 rotate-12" />

                <div className="flex flex-col items-center gap-4 mb-4 relative z-10">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg rounded-full">
                      <AvatarImage
                        src={profile?.foto_perfil_url || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-white/20 text-white text-3xl">
                        {profile?.nome?.charAt(0).toUpperCase() ||
                          user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full border-2 border-[#10b981] opacity-50 pointer-events-none" />
                  </div>

                  <div className="text-center animate-fade-in">
                    <p className="text-lg font-medium leading-snug text-white/95">
                      {getWelcomeMessage()}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto bg-gradient-to-b from-background to-secondary/20">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path
                  return (
                    <div key={item.path}>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 w-full text-left group relative overflow-hidden',
                          'hover:bg-secondary active:scale-95 active:opacity-80',
                          'animate-drawer-item',
                          isActive
                            ? 'bg-secondary text-primary shadow-sm'
                            : 'text-foreground/80 hover:text-primary bg-transparent',
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-colors duration-200',
                            isActive
                              ? 'text-primary'
                              : 'text-muted-foreground group-hover:text-primary',
                          )}
                        />
                        {item.label}
                        {item.path === '/notifications' && unreadCount > 0 && (
                          <Badge className="ml-auto bg-red-500 hover:bg-red-600 text-white border-none h-5 min-w-[20px] px-1.5">
                            {unreadCount}
                          </Badge>
                        )}
                      </button>
                    </div>
                  )
                })}

                <button
                  onClick={handleLogout}
                  className="mt-auto flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 w-full text-left text-destructive hover:bg-destructive/10 animate-drawer-item"
                  style={{ animationDelay: '350ms' }}
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 font-display font-bold text-xl text-brand-dark dark:text-foreground tracking-tight">
          plantae
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

      <main className="flex-1 pt-20 pb-8 px-4 container mx-auto max-w-md md:max-w-2xl lg:max-w-4xl overflow-hidden">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
