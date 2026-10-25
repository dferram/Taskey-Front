import { useState, useCallback } from 'react';
import { TareasRepository } from '../repositories/TareasRepository';
import { AuthRepository } from '../repositories/AuthRepository';

export const useTareasHijoViewModel = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTareas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getChildToken();
      if (!token) throw new Error('No hay sesión de hijo activa');

      const data = await TareasRepository.getTareasHijo(token);
      setTareas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const cambiarEstado = async (assignmentId, estado) => {
    setError(null);
    try {
      const token = await AuthRepository.getChildToken();
      if (!token) throw new Error('No hay sesión de hijo activa');

      const data = await TareasRepository.cambiarEstadoAsignacionHijo(token, assignmentId, estado);

      // Actualizacion optimista en memoria
      setTareas(prev => prev.map(t => ({
        ...t,
        assignments: (t.assignments || []).map(a => a.id === assignmentId ? { ...a, ...data } : a),
      })));

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    tareas,
    loading,
    error,
    fetchTareas,
    cambiarEstado,
  };
};
