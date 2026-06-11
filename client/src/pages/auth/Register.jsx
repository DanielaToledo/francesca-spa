import { useState } from 'react'
import { authService } from '../../services/authService'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!nombre || !apellido || !dni || !email || !password) {
      setError('Por favor, completa todos los campos obligatorios.')
      return
    }

    try {
      setLoading(true)
      // Mandamos los datos al endpoint inteligente del backend que los encripta
      await authService.register({ 
        nombre, 
        apellido, 
        dni, 
        email, 
        password,
        id_rol: 4 // Cliente por defecto
      })
      
      setSuccess(true)
      // Esperamos 2 segundos para que lea el mensaje de éxito y lo mandamos a loguearse
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err) {
      setError(err.message || 'Hubo un problema al crear tu cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Crear Cuenta ✨</h2>
        <p className="text-sm text-slate-500 text-center mb-6">Regístrate para gestionar tus turnos en el Spa</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-200">
            ¡Tu cuenta fue creada con éxito! Redirigiéndote al ingreso...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Daniela"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Toledo"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">DNI / Identificación</label>
            <input
              type="text"
              required
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="37910888"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@correo.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:bg-indigo-400 mt-2"
          >
            {loading ? 'Procesando registro...' : 'Registrarme'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}