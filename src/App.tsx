/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import AddPlant from './pages/AddPlant'
import PlantDetails from './pages/PlantDetails'
import EditPlant from './pages/EditPlant'
import SyncBackup from './pages/SyncBackup'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/add" element={<AddPlant />} />
          <Route path="/plant/:id" element={<PlantDetails />} />
          <Route path="/plant/:id/edit" element={<EditPlant />} />
          {/* Redirect notifications to home as per user story */}
          <Route path="/notifications" element={<Navigate to="/" replace />} />
          <Route path="/sync-backup" element={<SyncBackup />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
