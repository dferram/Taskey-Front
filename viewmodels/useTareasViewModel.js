import { useState, useCallback } from 'react';
import { TareasRepository } from '../repositories/TareasRepository';
import { AuthRepository } from '../repositories/AuthRepository';

export const useTareasViewModel = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTareas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await TareasRepository.getTareas(token);
      setTareas(data);
    } catch (err) {
      setTareas([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearTarea = async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await TareasRepository.crearTarea(token, datos);
      setTareas(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const editarTarea = async (id, datos) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await TareasRepository.editarTarea(token, id, datos);
      setTareas(prev => prev.map(t => t.id === id ? { ...t, ...datos, ...data } : t));
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const eliminarTarea = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      await TareasRepository.eliminarTarea(token, id);
      setTareas(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const asignarTarea = async (tareaId, childId) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await TareasRepository.asignarTarea(token, tareaId, childId);
      
      // Update local state to add assignment
      setTareas(prev => prev.map(t => {
        if (t.id === tareaId) {
           const currentAssignments = t.assignments || [];
           return { ...t, assignments: [...currentAssignments, data] };
        }
        return t;
      }));
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoAsignacion = async (assignmentId, estado) => {
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error('No token found');

      const data = await TareasRepository.cambiarEstadoAsignacion(token, assignmentId, estado);

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

  const desasignarTarea = async (id) => {
    try {
      const token = await AuthRepository.getParentToken();
      await TareasRepository.desasignarTarea(token, id);
      setTareas(prev => prev.map(t => ({ ...t, assignments: (t.assignments || []).filter(a => a.id !== id) })));
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  return {
    desasignarTarea,
    tareas,
    loading,
    error,
    fetchTareas,
    crearTarea,
    editarTarea,
    eliminarTarea,
    asignarTarea,
    cambiarEstadoAsignacion
  };
};
