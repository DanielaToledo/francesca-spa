import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const { loginUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Obtenemos la ruta previa donde estaba el usuario, o null si vino directo al login
    const from = location.state?.from?.pathname || null

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
            
            // 🚀 Lógica de redirección inteligente
            if (from) {
                // Si el usuario intentó entrar a una página protegida, lo enviamos de vuelta allí
                navigate(from, { replace: true })
            } else {
                // Si entró al login directamente, lo enviamos según su rol
                if (usuario.rol === 'Cliente') {
                    navigate('/cliente/dashboard')
                } else if (usuario.rol === 'Recepcion' || usuario.rol === 'Recepción') { 
                    navigate('/recepcion/agenda')
                } else if (usuario.rol === 'Admin' || usuario.rol === 'Administrador') {
                    navigate('/admin/dashboard')
                } else if (usuario.rol === 'Especialista') {
                    navigate('/especialista/agenda')
                } else {
                    setError(`Acceso concedido, pero el rol "${usuario.rol}" no tiene un panel asignado.`)
                }
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FBF9F8] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#F4CFCC]/40">
                
                <h2 className="text-3xl font-bold text-[#A87379] text-center mb-2">¡Hola otra vez! 💆‍♀️</h2>
                <p className="text-sm text-slate-500 text-center mb-6">Ingresa tus datos para gestionar el Spa</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@spa.com"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EAA0AB] text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EAA0AB] text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#A87379] hover:bg-[#A87379]/90 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm disabled:bg-slate-400"
                    >
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-50 text-center text-sm text-slate-500">
                    ¿Eres nuevo en el Spa?{' '}
                    <Link 
                        to="/register" 
                        className="text-[#A87379] hover:text-[#A87379]/80 font-bold transition-colors hover:underline"
                    >
                        Regístrate acá
                    </Link>
                </div>
            </div>
        </div>
    )
}