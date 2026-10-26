import { registerForPushNotifications } from '../hooks/usePushNotifications';
import { useState } from 'react';
import { AuthRepository } from '../repositories/AuthRepository';

export const useAuthViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginPadre = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AuthRepository.loginPadre({ email, password });
      
      // Guarda el token y los datos en cache
      if (data.access_token) {
        await AuthRepository.saveParentToken(data.access_token);
      }
      if (data.padre) {
        await AuthRepository.saveParentData(data.padre);
      }
      
      void registerForPushNotifications();
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const registerPadre = async (nombre, apellido, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AuthRepository.registerPadre({ nombre, apellido, email, password });
      
      // Guarda el token y los datos en cache
      if (data.access_token) {
        await AuthRepository.saveParentToken(data.access_token);
      }
      if (data.padre) {
        await AuthRepository.saveParentData(data.padre);
      }
      
      void registerForPushNotifications();
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Error al registrarse');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutPadre = async () => {
    // Para cerrar sesion, borramos toda la cache y tokens locales
    await AuthRepository.clearAll();
  };

  return {
    loading,
    error,
    loginPadre,
    registerPadre,
    logoutPadre
  };
};
