import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificación de sesión al cargar la app
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('spa_token');
      const savedUser = localStorage.getItem('spa_user');

      if (token && savedUser && savedUser !== 'undefined') {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && (parsedUser.id_usuario || parsedUser.id_especialista)) {
            setUser(parsedUser);
          } else {
            throw new Error("Estructura de usuario inválida");
          }
        } catch (e) {
          console.error("Error al validar sesión:", e);
          logoutUser(); 
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Sincronización entre pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'spa_token' && !e.newValue) {
        logoutUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

 
const loginUser = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      let usuarioLogueado = data.user;

      // 🛡️ CORRECCIÓN DE SEGURIDAD DE IDs:
      // Si el rol es Especialista y por alguna razón id_especialista vino undefined, 
      // nos aseguramos de que no se pierda o lo mapeamos de forma segura.
      if (usuarioLogueado.rol === 'Especialista' && !usuarioLogueado.id_especialista) {
        // Si el backend mandó id_operativo (que tu backend también calculaba), lo usamos
        usuarioLogueado.id_especialista = data.id_operativo || usuarioLogueado.id_usuario;
      }

      // Nos aseguramos de limpiar los 'undefined' para que JSON.stringify no borre cosas importantes
      const usuarioA_Guardar = {
        id_usuario: usuarioLogueado.id_usuario,
        id_especialista: usuarioLogueado.id_especialista || null,
        nombre: usuarioLogueado.nombre,
        apellido: usuarioLogueado.apellido,
        email: usuarioLogueado.email,
        rol: usuarioLogueado.rol
      };

      localStorage.setItem('spa_token', data.token);
      localStorage.setItem('spa_user', JSON.stringify(usuarioA_Guardar));

      setUser(usuarioA_Guardar);
      return usuarioA_Guardar;
    } catch (error) {
      console.error("Login fallido:", error);
      throw error;
    }
  };


  const logoutUser = () => {
    // Limpieza profunda
    localStorage.removeItem('spa_token');
    localStorage.removeItem('spa_user');
    localStorage.clear(); 
    
    setUser(null);
    
    // Forzamos la redirección para limpiar el estado de la memoria del navegador
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);