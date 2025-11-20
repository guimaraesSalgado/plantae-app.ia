/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import AddPlant from './pages/AddPlant'
import PlantDetails from './pages/PlantDetails'
import EditPlant from './pages/EditPlant'
import SyncBackup from './pages/SyncBackup'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ScrollToTop from './components/ScrollToTop'
import { useEffect } from 'react'
import { hydrateStorage } from './lib/storage'

// Protected Route Wrapper
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth()

  if (loading) return null // Or a loading spinner

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/splash" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/add" element={<AddPlant />} />
        <Route path="/plant/:id" element={<PlantDetails />} />
        <Route path="/plant/:id/edit" element={<EditPlant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Navigate to="/" replace />} />
        <Route path="/sync-backup" element={<SyncBackup />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => {
  // Attempt to hydrate storage from IndexedDB on app launch (Robustness for iOS)
  useEffect(() => {
    hydrateStorage()
  }, [])

  return (
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <AuthProvider>
        <ScrollToTop />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
