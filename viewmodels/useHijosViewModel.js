import { useState, useCallback } from 'react';
import { HijosRepository } from '../repositories/HijosRepository';
import { AuthRepository } from '../repositories/AuthRepository';

export const useHijosViewModel = () => {
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHijos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await HijosRepository.getHijos(token);
      setHijos(data);
    } catch (err) {
      setHijos([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearHijo = async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await HijosRepository.crearHijo(token, datos);
      
      // Actualiza el estado local sin buscar de nuevo
      setHijos(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const editarHijo = async (id, datos) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await HijosRepository.editarHijo(token, id, datos);
      
      // Actualiza el estado local 
      setHijos(prev => prev.map(h => h.id === id ? { ...h, ...datos, ...data } : h));
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const eliminarHijo = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      await HijosRepository.eliminarHijo(token, id);
      
      // Actualiza el estado local
      setHijos(prev => prev.filter(h => h.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const generarCodigoVinculacion = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await HijosRepository.generarCodigoVinculacion(token, id);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    hijos,
    loading,
    error,
    fetchHijos,
    crearHijo,
    editarHijo,
    eliminarHijo,
    generarCodigoVinculacion
  };
};
