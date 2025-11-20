import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Leaf,
  Home,
  PlusCircle,
  Cloud,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { requestNotificationPermission } from '@/services/notifications'
import { CareMonitorService } from '@/services/careMonitor'
import { CloudSyncService } from '@/services/cloudSync'
import { getSyncConfig } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, profile, signOut } = useAuth()

  // Check for notifications and permissions
  useEffect(() => {
    requestNotificationPermission()

    const checkStatus = async () => {
      // Run Care Monitor (background check only)
      CareMonitorService.checkPlantStatus()

      // Run Auto Sync if enabled
      const syncConfig = getSyncConfig()
      if (syncConfig.enabled && syncConfig.autoSync && navigator.onLine) {
        await CloudSyncService.syncData()
      }
    }

    checkStatus()
    // Poll every minute
    const interval = setInterval(checkStatus, 60000)

    // Reconnection listener for iOS robustness
    const handleOnline = () => {
      const syncConfig = getSyncConfig()
      if (syncConfig.enabled && syncConfig.autoSync) {
        CloudSyncService.syncData()
      }
    }
    window.addEventListener('online', handleOnline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
    }
  }, [location.pathname])

  const navItems = [
    { path: '/', label: 'Plantas', icon: Home },
    { path: '/add', label: 'Adicionar Planta', icon: PlusCircle },
    { path: '/profile', label: 'Editar Dados Cadastrais', icon: User },
    { path: '/sync-backup', label: 'Configurações', icon: Settings }, // Mapped SyncBackup to Settings for now as per user story
  ]

  const handleNavigation = (path: string) => {
    if (location.pathname === path) {
      setIsSheetOpen(false)
      return
    }

    setIsSheetOpen(false)
    // Wait for sheet close animation (approx 300ms) before navigating
    setTimeout(() => {
      navigate(path)
    }, 300)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      {/* Fixed Header */}
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
              {/* Menu Header with Gradient */}
              <div className="bg-gradient-to-br from-[#065f46] to-[#10b981] p-6 pt-10 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-white/50 shadow-md">
                    <AvatarImage src={profile?.foto_perfil_url || undefined} />
                    <AvatarFallback className="bg-white/20 text-white text-xl">
                      {profile?.nome?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate">
                      {profile?.nome || 'Jardineiro'}
                    </h3>
                    <p className="text-xs text-white/80 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 w-full text-left group',
                        'hover:bg-secondary active:scale-95 active:opacity-80', // Microinteractions
                        'animate-drawer-item', // Fade-in animation
                        isActive
                          ? 'bg-secondary text-primary shadow-sm' // Active styles
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
                    </button>
                  )
                })}

                {/* Theme Toggle in Menu */}
                <div
                  className="mt-auto px-4 py-3 flex items-center justify-between border-t border-border animate-drawer-item"
                  style={{ animationDelay: '200ms' }}
                >
                  <div className="flex items-center gap-3 text-foreground/80">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                    <span className="font-medium">Modo Escuro</span>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 w-full text-left text-destructive hover:bg-destructive/10 animate-drawer-item"
                  style={{ animationDelay: '250ms' }}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 font-display font-bold text-xl text-brand-dark dark:text-foreground tracking-tight">
          plantae
        </div>

        <div className="w-10" />
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
