// Este archivo es para guardar, eliminar y purgar totalmente el almacenamiento local de la app
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const isSecureKey = (key: string) => key.includes('TOKEN') || key.includes('PASSWORD');

export const storage = {
  // Lee un valor de AsyncStorage y lo deserializa de JSON a su tipo original <T>.  
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      // Determinar si es una llave de alta seguridad
      let jsonValue = null;
      if (isSecureKey(key)) {
          jsonValue = await SecureStore.getItemAsync(key);
      } else {
          jsonValue = await AsyncStorage.getItem(key);
      }
      
      // Si no hay nada, devolvemos null directamente
      if (jsonValue === null) {
        return null;
      }
      
      // Deserializa el string a su tipo original <T>
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`[Storage Error] Fallo al leer la key: ${key}`, error);
      throw error;
    }
  },
  // Serializa el valor pasado a JSON y lo guarda en AsyncStorage.  
  setItem: async <T>(key: string, value: T): Promise<void> => {
    try {
      // Transformamos el tipo TypeScript a un String compatible con SQLite/AsyncStorage
      const jsonValue = JSON.stringify(value);
      
      // Ejecutamos la inserción en el chip cifrado o en el disco estándar
      if (isSecureKey(key)) {
          await SecureStore.setItemAsync(key, jsonValue);
      } else {
          await AsyncStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      console.error(`[Storage Error] Fallo al guardar en la key: ${key}`, error);
    }
  },
  // Elimina permanentemente un valor específico del storage.  
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isSecureKey(key)) {
          await SecureStore.deleteItemAsync(key);
      } else {
          await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`[Storage Error] Fallo al eliminar la key: ${key}`, error);
    }
  },
  // Limpia todo el almacenamiento local de la app  
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error(`[Storage Error] Fallo al limpiar todo el almacenamiento local.`, error);
    }
  }
};

