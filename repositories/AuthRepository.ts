import { STORAGE_KEYS } from '../storage/keys';
import { storage } from '../storage/storage';
import { registerPadre, loginPadre } from '../services/api';
import { Padre } from '../models/Padre';
import { Hijo } from '../models/Hijo';

export const AuthRepository = {
  saveParentToken: async (token: string): Promise<void> => {
    await storage.clearAll();
    await storage.setItem(STORAGE_KEYS.PARENT_TOKEN, token);
  },
  getParentToken: async (): Promise<string | null> => {
    return await storage.getItem<string>(STORAGE_KEYS.PARENT_TOKEN);
  },
  removeParentToken: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.PARENT_TOKEN);
  },
  saveParentData: async (data: Padre): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.PARENT_DATA, data);
  },
  getParentData: async (): Promise<Padre | null> => {
    return await storage.getItem<Padre>(STORAGE_KEYS.PARENT_DATA);
  },
  removeParentData: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.PARENT_DATA);
  },

  // Métodos de autenticación de hijos para simetría
  saveChildToken: async (token: string): Promise<void> => {
    await storage.clearAll();
    await storage.setItem(STORAGE_KEYS.CHILD_TOKEN, token);
  },
  getChildToken: async (): Promise<string | null> => {
    return await storage.getItem<string>(STORAGE_KEYS.CHILD_TOKEN);
  },
  removeChildToken: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.CHILD_TOKEN);
  },
  saveChildData: async (data: Hijo): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.CHILD_DATA, data);
  },
  getChildData: async (): Promise<Hijo | null> => {
    return await storage.getItem<Hijo>(STORAGE_KEYS.CHILD_DATA);
  },
  removeChildData: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.CHILD_DATA);
  },

  // Limpieza de logout
  clearAll: async (): Promise<void> => {
    await storage.clearAll();
  },

  // Wrappers de API
  registerPadre: async (datos: any) => {
    return await registerPadre(datos.nombre, datos.apellido, datos.email, datos.password);
  },
  loginPadre: async (datos: any) => {
    return await loginPadre(datos.email, datos.password);
  }
};
