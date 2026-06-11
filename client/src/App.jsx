import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 antialiased text-slate-900">
        <AppRoutes />
      </div>
    </Router>
  )
}

export default App