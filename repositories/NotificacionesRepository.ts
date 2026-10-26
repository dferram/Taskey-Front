import { STORAGE_KEYS } from '../storage/keys';
import { storage } from '../storage/storage';
import {
    obtenerNotificaciones,
    marcarNotificacionesLeidas,
    registrarDeviceToken,
} from '../services/api';
import { Notificacion } from '../models/Notificacion';

export const NotificacionesRepository = {
    getNotificaciones: async (token: string): Promise<Notificacion[]> => {
        try {
            const data = await obtenerNotificaciones(token);
            // Actualiza la caché
            await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, data);
            return data;
        } catch (error) {
            throw error;
        }
    },

    marcarLeidas: async (token: string, ids: string[]): Promise<void> => {
        await marcarNotificacionesLeidas(token, ids);

        // Actualizar caché local para reflejar el cambio inmediatamente
        const cached = await storage.getItem<Notificacion[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
        const updated = cached.map(n =>
            ids.includes(n.id) ? { ...n, leida: true } : n
        );
        await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    },

    registrarDeviceToken: async (token: string, deviceToken: string, plataforma: 'android' | 'ios' | 'expo'): Promise<void> => {
        const registrationKey = `${STORAGE_KEYS.DEVICE_TOKEN}_${plataforma}`;
        const savedToken = await storage.getItem<string>(registrationKey);
        
        // Solo registrar si el token cambió o no fue registrado antes
        if (savedToken === deviceToken) {
            console.log('[NotificacionesRepository] Device token ya registrado, omitiendo.');
            return;
        }

        await registrarDeviceToken(token, deviceToken, plataforma);
        await storage.setItem(registrationKey, deviceToken);
        console.log('[NotificacionesRepository] Device token registrado exitosamente.');
    },
};
