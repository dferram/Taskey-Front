import { STORAGE_KEYS } from '../storage/keys';
import { storage } from '../storage/storage';
import { obtenerPerfilPapa, actualizarPerfilPapa } from '../services/api';
import { Padre } from '../models/Padre';

export const PadreRepository = {
  getPerfil: async (token: string): Promise<Padre | null> => {
    try {
      // Intenta obtener los datos de la API
      const apiData = await obtenerPerfilPapa(token);
      
      // Actualiza el cache
      await storage.setItem(STORAGE_KEYS.PARENT_DATA, apiData);
      return apiData;
    } catch (error) {
      throw error;
    }
  },

  actualizarPerfil: async (token: string, datos: any): Promise<Padre> => {
    // Llama a la API
    const apiData = await actualizarPerfilPapa(token, datos);
    
    // Actualiza el cache local
    const currentCache = await storage.getItem<any>(STORAGE_KEYS.PARENT_DATA);
    const newCache = { ...currentCache, ...datos, ...apiData };
    await storage.setItem(STORAGE_KEYS.PARENT_DATA, newCache);
    
    return apiData;
  }
};
