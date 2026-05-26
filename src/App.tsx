import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { Layout } from './components/ui/Layout'
import { Dashboard } from './pages/Dashboard'
import { CalendarPage } from './pages/CalendarPage'
import { ClientsPage } from './pages/ClientsPage'
import { SynthesePage } from './pages/SynthesePage'
import { ParametresPage } from './pages/ParametresPage'

function LoadingScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center animate-pulse">
        <span className="text-white font-bold text-2xl">S</span>
      </div>
      <p className="text-gray-500 text-sm">Chargement des données…</p>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-2xl">⚠️</div>
      <h2 className="font-semibold text-gray-900">Erreur de connexion</h2>
      <p className="text-sm text-gray-500">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium"
      >
        Réessayer
      </button>
    </div>
  )
}

function AppContent() {
  const { loading, error } = useApp()
  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendrier" element={<CalendarPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/synthese" element={<SynthesePage />} />
        <Route path="/parametres" element={<ParametresPage />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
