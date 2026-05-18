import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Layout } from './components/ui/Layout'
import { Dashboard } from './pages/Dashboard'
import { CalendarPage } from './pages/CalendarPage'
import { ClientsPage } from './pages/ClientsPage'
import { SynthesePage } from './pages/SynthesePage'
import { ParametresPage } from './pages/ParametresPage'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendrier" element={<CalendarPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/synthese" element={<SynthesePage />} />
            <Route path="/parametres" element={<ParametresPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
