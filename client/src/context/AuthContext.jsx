import { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services/authService'

// 1. Creamos el espacio de memoria flotante
const AuthContext = createContext({})

// 2. Creamos el Proveedor (el componente que va a envolver la app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)         // Guarda datos del usuario (nombre, rol, etc.)
  const [loading, setLoading] = useState(true)   // Para saber si está verificando la sesión al arrancar

  // Efecto para chequear si el usuario ya estaba logueado de antes
useEffect(() => {
    const token = localStorage.getItem('spa_token')
    const savedUser = localStorage.getItem('spa_user')

    // Modificamos esto con un try/catch para que sea ultra seguro
    if (token && savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error("Error al parsear el usuario del localStorage:", e)
        localStorage.removeItem('spa_user')
        localStorage.removeItem('spa_token')
      }
    }
    setLoading(false)
  }, [])

  // Función para manejar el inicio de sesión
const loginUser = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      
      // data trae: { success, message, token, user: { id_usuario, nombre, rol, ... } }
      const usuarioLogueado = data.user 

      localStorage.setItem('spa_token', data.token)
      localStorage.setItem('spa_user', JSON.stringify(usuarioLogueado))
      
      setUser(usuarioLogueado)
      return usuarioLogueado // Le pasamos el objeto 'user' limpio a la pantalla
    } catch (error) {
      throw error
    }
  }

  // Función para cerrar sesión
  const logoutUser = () => {
    localStorage.removeItem('spa_token')
    localStorage.removeItem('spa_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Hook personalizado para usar el contexto de forma fácil en cualquier archivo
export const useAuth = () => useContext(AuthContext)