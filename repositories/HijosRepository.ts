import { STORAGE_KEYS } from '../storage/keys';
import { storage } from '../storage/storage';
import { listarHijos, crearHijo, editarHijo, eliminarHijo, generarCodigoVinculacion } from '../services/api';
import { Hijo } from '../models/Hijo';

export const HijosRepository = {
  getHijos: async (token: string): Promise<Hijo[]> => {
    try {
      // Intenta obtener los datos de la API
      const apiHijos = await listarHijos(token);
      
      // Actualiza el cache
      await storage.setItem(STORAGE_KEYS.HIJOS, apiHijos);
      return apiHijos;
    } catch (error) {
      throw error;
    }
  },

  crearHijo: async (token: string, datos: any): Promise<Hijo> => {
    const nuevoHijo = await crearHijo(token, datos);
    
    // Actualiza el cache local sin buscar de nuevo
    const currentHijos = await storage.getItem<Hijo[]>(STORAGE_KEYS.HIJOS) || [];
    await storage.setItem(STORAGE_KEYS.HIJOS, [...currentHijos, nuevoHijo]);
    
    return nuevoHijo;
  },

  editarHijo: async (token: string, id: string, datos: any): Promise<Hijo> => {
    const hijoEditado = await editarHijo(token, id, datos);
    
    // Actualiza el cache local 
    const currentHijos = await storage.getItem<Hijo[]>(STORAGE_KEYS.HIJOS) || [];
    const updatedHijos = currentHijos.map(h => h.id === id ? { ...h, ...datos, ...hijoEditado } : h);
    await storage.setItem(STORAGE_KEYS.HIJOS, updatedHijos);
    
    return hijoEditado;
  },

  eliminarHijo: async (token: string, id: string): Promise<boolean> => {
    await eliminarHijo(token, id);
    
    // Actualiza el cache local
    const currentHijos = await storage.getItem<Hijo[]>(STORAGE_KEYS.HIJOS) || [];
    const updatedHijos = currentHijos.filter(h => h.id !== id);
    await storage.setItem(STORAGE_KEYS.HIJOS, updatedHijos);
    
    return true;
  },

  generarCodigoVinculacion: async (token: string, id: string): Promise<any> => {
    // Solo se necesita la API para esto
    return await generarCodigoVinculacion(token, id);
  }
};
