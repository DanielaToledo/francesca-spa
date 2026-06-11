import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom' // <-- Asegúrate de que tenga 'Link'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const { loginUser } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(false)

        if (!email || !password) {
            setError('Por favor, completa todos los campos.')
            return
        }

        try {
      setLoading(true)
      const usuario = await loginUser(email, password)
      
      // Macheamos exactamente con 'usuario.rol' que viene de r.nombre_rol de tu base de datos
      if (usuario.rol === 'Cliente') {
        navigate('/cliente/dashboard')
      } else if (usuario.rol === 'Recepcion' || usuario.rol === 'Recepción') { 
        // Por las dudas cubrimos si lleva tilde en tu tabla de PostgreSQL
        navigate('/recepcion/agenda')
      } else if (usuario.rol === 'Admin' || usuario.rol === 'Administrador') {
        navigate('/admin/dashboard')
      } else {
        setError(`Acceso concedido, pero el rol "${usuario.rol}" no tiene un panel asignado.`)
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">¡Hola otra vez! 💆‍♀️</h2>
                <p className="text-sm text-slate-500 text-center mb-6">Ingresa tus datos para gestionar el Spa</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@spa.com"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:bg-indigo-400"
                    >
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* --- AGREGA ESTE BLOQUE DE ABAJO --- */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          ¿Eres nuevo en el Spa?{' '}
          <Link 
            to="/register" 
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors hover:underline"
          >
            Regístrate acá
          </Link>
        </div>
        {/* ---------------------------------- */}
            </div>
        </div>
    )
}