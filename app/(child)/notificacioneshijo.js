import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { useNotificacionesViewModel } from "../../viewmodels/useNotificacionesViewModel";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mapeo entre los tipos del backend y el icono/color que se muestra en la tarjeta
const TIPO_CONFIG = {
    TAREA_CONFIRMADA: { icon: 'checkmark-circle', iconColor: '#ADD633' },
    TAREA_COMPLETADA: { icon: 'checkmark-circle', iconColor: '#ADD633' },
    TAREA_FALLIDA: { icon: 'close-circle', iconColor: '#EF4444' },
    TIEMPO_LIMITE: { icon: 'warning', iconColor: '#FACC15' },
    META_SEMANAL: { icon: 'star', iconColor: '#FACC15' },
};

function formatearFecha(fechaStr) {
    try {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDias = Math.floor(diffHrs / 24);

        if (diffMin < 1) return 'Ahora mismo';
        if (diffMin < 60) return `Hace ${diffMin} min`;
        if (diffHrs < 24) return `Hace ${diffHrs} hora${diffHrs > 1 ? 's' : ''}`;
        if (diffDias === 1) return 'Ayer';
        return `Hace ${diffDias} días`;
    } catch {
        return '';
    }
}

export default function NotificacionesHijo() {
    const router = useRouter();
    const { notificaciones, loading, fetchNotificaciones, marcarLeidas } = useNotificacionesViewModel();

    useFocusEffect(
        useCallback(() => {
            fetchNotificaciones();
        }, [fetchNotificaciones])
    );

    const handleTocarNoti = (noti) => {
        if (!noti.leida) marcarLeidas([noti.id]);
        if (noti.tipo === 'TAREA_CONFIRMADA' || noti.tipo === 'TAREA_COMPLETADA') router.push('/tareashijo');
        if (noti.tipo === 'META_SEMANAL') router.push('/recompensashijo');
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.headerTitle}>Notificaciones</Text>

                {loading && notificaciones.length === 0 ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
                ) : notificaciones.length === 0 ? (
                    <Text style={styles.emptyText}>No tienes notificaciones todavía</Text>
                ) : (
                    <View style={styles.notisList}>
                        {notificaciones.map((noti) => {
                            const config = TIPO_CONFIG[noti.tipo] || TIPO_CONFIG.TAREA_CONFIRMADA;
                            return (
                                <TouchableOpacity
                                    key={noti.id}
                                    style={[styles.notiCard, !noti.leida && styles.notiCardNoLeida]}
                                    onPress={() => handleTocarNoti(noti)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.notiHeader}>
                                        <View style={styles.iconWrapper}>
                                            <Ionicons name={config.icon} size={40} color={config.iconColor} />
                                        </View>
                                        <View style={styles.textWrapper}>
                                            <Text style={styles.notiText}>{noti.mensaje}</Text>
                                            <Text style={styles.notiTime}>{formatearFecha(noti.fecha_creacion)}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <BarraNavegacion activeTab="notificaciones" userType="hijo" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 38,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 30,
    },
    notisList: {
        gap: 15,
    },
    notiCard: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 15,
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    notiCardNoLeida: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 40,
    },
    notiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    miniIcon: {
        width: 40,
        height: 40,
    },
    textWrapper: {
        flex: 1,
    },
    notiText: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        marginBottom: 4,
        lineHeight: 20,
    },
    notiTime: {
        fontSize: 14,
        fontFamily: Fonts.figtreeRegular,
        color: '#9CA3AF',
    },
    actionButton: {
        backgroundColor: Colors.primary,
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 25,
        alignSelf: 'flex-end',
        marginTop: 10,
        ...Shadows.button,
    },
    actionButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontFamily: Fonts.figtreebold,
    }
});
