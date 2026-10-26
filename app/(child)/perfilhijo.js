import BackendState from '../../components/BackendState';
import { useBackendResource } from '../../hooks/useBackendResource';
import { obtenerResumenHijo } from '../../services/api';
import { avatarImage } from '../../constants/avatars';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { obtenerPerfilHijo } from '../../services/api';
import { AuthRepository } from '../../repositories/AuthRepository';
import { useTareasHijoViewModel } from '../../viewmodels/useTareasHijoViewModel';
import BarraNavegacion from "../../components/BarraNavegacion";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PerfilHijo() {
    const router = useRouter();
    const { data: resumen, loading, error, reload } = useBackendResource(obtenerResumenHijo);
    const childData = resumen?.perfil;
    const { tareas, fetchTareas, error: tareasError } = useTareasHijoViewModel();
    useFocusEffect(useCallback(() => { fetchTareas(); }, [fetchTareas]));

    const pendientesCount = tareas.filter(t =>
        (t.assignments || []).some(a => a.status === 'assigned' || a.status === 'in_progress')
    ).length;

    if (loading && !childData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={{ marginTop: 10, fontFamily: Fonts.figtreeRegular, color: '#6B7280' }}>Cargando perfil...</Text>
            </View>
        );
    }

    const childName = childData?.nombre || 'Hijo';

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                {/* Decorative Circles */}
                <View style={[styles.circle, styles.circleLime]} />
                <View style={[styles.circle, styles.circlePink]} />
                <View style={[styles.circle, styles.circleDarkPurple]} />
                <View style={[styles.circle, styles.circleCyan]} />
                <View style={[styles.circle, styles.circleOrange]} />

                <View style={styles.headerContent}>
                    <View style={styles.profileRow}>
                        <TouchableOpacity style={styles.avatarWrapper} onPress={() => router.push('/personalizaravatar')}>
                            <Image
                                source={avatarImage(childData?.avatar_id)}
                                style={styles.avatar}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                        <View style={styles.nameBadge}>
                            <Text style={styles.nameText}>{childName}</Text>
                        </View>
                    </View>

                    <View style={styles.timeContainer}>
                        <Text style={styles.timeLabel}>{resumen?.politica ? `${resumen.politica.available_screen_time_minutes} min` : 'Sin tiempo asignado'}</Text>
                        <Text style={styles.timeSubtext}>Límite de tiempo</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <BackendState loading={loading} error={error || tareasError} onRetry={() => { reload(); fetchTareas(); }} />
                <View style={styles.grid}>
                    {/* Misiones Card */}
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: '#FFF7ED' }]}
                        onPress={() => router.push('/tareashijo')}
                    >
                        <Text style={[styles.cardTitle, { color: '#EA580C' }]}>Misiones</Text>
                        <Text style={styles.cardSubtitle}>{pendientesCount} pendiente{pendientesCount === 1 ? '' : 's'}</Text>
                        <View style={[styles.indicator, { backgroundColor: '#F97316' }]} />
                    </TouchableOpacity>

                    {/* Recompensas Card */}
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: '#FDF2F4' }]}
                        onPress={() => router.push('/recompensashijo')}
                    >
                        <Text style={[styles.cardTitle, { color: '#DB2777' }]}>Recompensas</Text>
                        <Text style={styles.cardSubtitle}>{childData?.llaves_disponibles ?? '—'} llaves disponibles</Text>
                        <View style={[styles.indicator, { backgroundColor: '#EC4899' }]} />
                    </TouchableOpacity>

                    {/* Logros Card */}
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: '#EFF6FF' }]}
                        onPress={() => router.push('/logroshijo')}
                    >
                        <Text style={[styles.cardTitle, { color: '#2563EB' }]}>Logros</Text>
                        <Text style={styles.cardSubtitle}>Consulta tus logros y objetivos</Text>
                        <View style={[styles.indicator, { backgroundColor: '#3B82F6' }]} />
                    </TouchableOpacity>

                    {/* Racha Card */}
                    <TouchableOpacity style={[styles.card, { backgroundColor: '#F7FEE7' }]} onPress={() => router.push('/progresohijo')}>
                        <Text style={[styles.cardTitle, { color: '#65A30D' }]}>Racha</Text>
                        <View style={styles.rachaContainer}>
                            <Image
                                source={require('../../assets/images/tareas.png')}
                                style={styles.rachaImage}
                                resizeMode="contain"
                            />
                            <View>
                                <Text style={styles.rachaCount}>{resumen?.progreso.racha_actual ?? '—'}</Text>
                                <Text style={styles.rachaLabel}>días</Text>
                            </View>
                        </View>
                        <View style={[styles.indicator, { backgroundColor: '#84CC16' }]} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <BarraNavegacion activeTab="inicio" userType="hijo" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4FB', // Gris azulado más limpio
    },
    header: {
        height: SCREEN_HEIGHT * 0.36,
        backgroundColor: '#7C3AED',
        overflow: 'hidden',
        justifyContent: 'center',
        paddingTop: 10,
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    circleLime: {
        width: 140,
        height: 140,
        backgroundColor: '#AAD62D',
        top: -60,
        left: '20%',
        opacity: 0.9,
    },
    circlePink: {
        width: 160,
        height: 160,
        backgroundColor: '#EC4899',
        bottom: 20,
        left: -70,
        opacity: 0.9,
    },
    circleDarkPurple: {
        width: 180,
        height: 180,
        backgroundColor: '#4C1D95',
        top: -50,
        right: -40,
        opacity: 0.7,
    },
    circleCyan: {
        width: 60,
        height: 60,
        backgroundColor: '#06B6D4',
        bottom: 40,
        right: 30,
        opacity: 0.8,
    },
    circleOrange: {
        width: 120,
        height: 120,
        backgroundColor: '#FB923C',
        top: 130,
        right: -50,
        opacity: 0.9,
    },
    headerContent: {
        paddingHorizontal: 25,
        zIndex: 10,
        marginTop: 15,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    avatarWrapper: {
        width: 86,
        height: 86,
        borderRadius: 43,
        backgroundColor: '#DDD6FE',
        borderWidth: 4,
        borderColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    avatar: {
        width: 65,
        height: 65,
    },
    nameBadge: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 35,
        paddingLeft: 45,
        borderRadius: 16,
        marginLeft: -35,
        zIndex: 1,
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    nameText: {
        fontSize: 28,
        fontFamily: Fonts.figtreebold,
        color: '#6D28D9',
        fontWeight: 'bold',
    },
    timeContainer: {
        alignItems: 'center',
        marginTop: 5,
    },
    timeLabel: {
        fontSize: 42,
        fontFamily: Fonts.figtreebold,
        color: Colors.white,
        letterSpacing: -1,
    },
    timeSubtext: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: -4,
    },
    content: {
        flex: 1,
        marginTop: -30,
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    scrollContent: {
        paddingTop: 30,
        paddingHorizontal: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', // Centrar las tarjetas
        gap: 15, // Usar Gap para espaciado limpio
    },
    card: {
        width: (SCREEN_WIDTH - 55) / 2, // Cálculo exacto para dos columnas con gap
        borderRadius: 24,
        padding: 18,
        minHeight: 150,
        ...Shadows.button,
        shadowOpacity: 0.06,
        elevation: 3,
        position: 'relative',
        overflow: 'hidden',
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: Fonts.figtreebold,
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 13,
        fontFamily: Fonts.figtreeRegular,
        color: '#4B5563',
        lineHeight: 18,
    },
    indicator: {
        position: 'absolute',
        bottom: 14,
        right: 14,
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    rachaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    rachaImage: {
        width: 55,
        height: 55,
        marginRight: 8,
        tintColor: '#84CC16',
    },
    rachaCount: {
        fontSize: 24,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        textAlign: 'center',
    },
    rachaLabel: {
        fontSize: 13,
        fontFamily: Fonts.figtreeRegular,
        color: Colors.black,
    }
});
