import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificacionesRepository } from '../repositories/NotificacionesRepository';
import { AuthRepository } from '../repositories/AuthRepository';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const usePushNotifications = () => {
    const notificationListener = useRef(null);
    const responseListener = useRef(null);

    useEffect(() => {
        registerForPushNotifications();

        // Escucha notificaciones recibidas mientras la app está en foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('[Push] Notificación recibida en foreground:', notification);
        });

        // Escucha cuando el usuario toca una notificación
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('[Push] Usuario tocó la notificación:', response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);
};

// Pide permisos y registra AMBOS tokens en el backend:
//  Expo Push Token
//  Token nativo FCM/APNs
export const registerForPushNotifications = async () => {
    try {
        // Pedir permisos al usuario
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('[Push] Permisos de notificación denegados por el usuario.');
            return;
        }

        // Configurar canal en Android (requerido para Android 8+)
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('taskey-default', {
                name: 'Taskey Notificaciones',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#5B9FED',
            });
        }

        // Obtener token de autenticación (padre)
        const authToken = (await AuthRepository.getParentToken()) || (await AuthRepository.getChildToken());
        if (!authToken) {
            console.warn('[Push] No hay sesión activa para registrar los tokens.');
            return;
        }

        try {
            const expoTokenData = await Notifications.getExpoPushTokenAsync();
            await NotificacionesRepository.registrarDeviceToken(authToken, expoTokenData.data, 'expo');
        } catch (err) {
            console.warn('[Push] No se pudo obtener Expo Push Token:', err.message);
        }

        try {
            const nativeTokenData = await Notifications.getDevicePushTokenAsync();
            const plataforma = Platform.OS === 'ios' ? 'ios' : 'android';
            await NotificacionesRepository.registrarDeviceToken(authToken, nativeTokenData.data, plataforma);
        } catch (err) {
            console.warn('[Push] No se pudo obtener token nativo FCM/APNs:', err.message);
        }

    } catch (error) {
        console.error('[Push] Error registrando push notifications:', error);
    }
};
