import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../storage/keys';
import { obtenerPolitica, editarPolitica } from '../services/api';
import { DevicePolicy } from '../models/DevicePolicy';

export const PoliciesRepository = {
  getPolicy: async (token: string, childId: string): Promise<DevicePolicy | null> => {
    try {
      if (!token) throw new Error("No token");

      const policyAPI = await obtenerPolitica(token, childId);
      
      // Actualizar caché específico de este hijo
      const localDataStr = await AsyncStorage.getItem(STORAGE_KEYS.POLICIES) || "{}";
      const localData = JSON.parse(localDataStr);
      localData[childId] = policyAPI;
      await AsyncStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(localData));

      return policyAPI;
    } catch (error) {
      throw error;
    }
  },

  updatePolicy: async (token: string, childId: string, payload: Partial<DevicePolicy>): Promise<DevicePolicy> => {
      if (!token) throw new Error("No token");

      const res = await editarPolitica(token, childId, payload);
      
      // Actualizar caché
      const localDataStr = await AsyncStorage.getItem(STORAGE_KEYS.POLICIES) || "{}";
      const localData = JSON.parse(localDataStr);
      localData[childId] = res;
      await AsyncStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(localData));

      return res;
  }
};
