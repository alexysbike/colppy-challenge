import { AppNavbar } from './components/layout'
import { DashboardScreen } from './screens/DashboardScreen'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <DashboardScreen />
      </main>
    </div>
  )
}

export default App
