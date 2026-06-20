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
      const usuarioLogueado = data.user;

      localStorage.setItem('spa_token', data.token);
      localStorage.setItem('spa_user', JSON.stringify(usuarioLogueado));

      setUser(usuarioLogueado);
      return usuarioLogueado;
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