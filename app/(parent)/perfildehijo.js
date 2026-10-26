import BackendState from '../../components/BackendState';
import { useBackendResource } from '../../hooks/useBackendResource';
import { obtenerCatalogoApps } from '../../services/api';
import { useHijosViewModel } from '../../viewmodels/useHijosViewModel';
import { useTareasViewModel } from '../../viewmodels/useTareasViewModel';
import { usePoliciesViewModel } from '../../viewmodels/usePoliciesViewModel';
import { Entypo, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState, useEffect } from "react";
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colores para los avatares
const AVATAR_COLORS = ['#DDD6FE', '#FEF3C7', '#DCFCE7', '#FDE68A', '#BFDBFE', '#FBCFE8'];

const renderAppIcon = (app) => {
    if (app.type === 'FontAwesome5') return <FontAwesome5 name={app.icon} size={16} color="white" />;
    if (app.type === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={app.icon} size={16} color="white" />;
    if (app.type === 'Entypo') return <Entypo name={app.icon} size={16} color="white" />;
    return <Ionicons name="apps" size={16} color="#7E22CE" />;
};

export default function PerfilDeHijo() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { data: catalogo, error: errorCatalogo, reload: reloadCatalogo } = useBackendResource(obtenerCatalogoApps, 'parent');
    const [activeTab, setActiveTab] = useState('Semana');
    const [selectedChildId, setSelectedChildId] = useState(params.id || null);
    
    // ViewModel logic
    const { hijos: children, loading: loadingHijos, error: hijosError, fetchHijos } = useHijosViewModel();
    const { tareas, fetchTareas, loading: loadingTareas, error: tareasError } = useTareasViewModel();
    const { policy, fetchPolicy, loading: loadingPolicy, error: policyError } = usePoliciesViewModel();

    useFocusEffect(
        useCallback(() => {
            fetchHijos().then(() => {
                // Seleccionar hijo por params o el primero
                if (!selectedChildId && children.length > 0) {
                    if (params.id) {
                        setSelectedChildId(params.id);
                    } else if (params.name) {
                        const found = children.find(h => h.nombre === params.name);
                        setSelectedChildId(found ? found.id : children[0].id);
                    } else {
                        setSelectedChildId(children[0].id);
                    }
                }
            }).catch((err) => {
                 if (err?.message?.includes('No token')) {
                     router.replace('/loginpapa');
                 }
            });
            fetchTareas();
        }, [])
    );

    // Hijo actualmente seleccionado
    const currentChild = children.find(c => c.id === selectedChildId) || children[0];
    const currentIndex = children.findIndex(c => c.id === selectedChildId);

    // Reaccionar cuando cambiamos de niño o vuelve a enfocarse la pantalla
    useFocusEffect(
        useCallback(() => {
            if (currentChild?.id) {
                fetchPolicy(currentChild.id);
            }
        }, [currentChild?.id, fetchPolicy])
    );

    // Filtrar tareas asignadas al hijo seleccionado
    const childTasks = tareas.filter(t => {
        if (!t.assignments?.some(a => a.child_id === currentChild?.id)) return false;
        const start = new Date(); start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        const date = t.due_date ? new Date(`${t.due_date}T00:00:00`) : null;
        return activeTab === 'Anteriores' ? date && date < start : !date || date >= start;
    });

    const handleBackPress = () => router.back();
    const handleAssignTask = () => router.push({
        pathname: '/asignartarea',
        params: { name: currentChild?.nombre, id: currentChild?.id }
    });

    const handleSwitchChild = (child) => {
        setSelectedChildId(child.id);
    };

    // Obtener texto de vinculación
    const getLinkedText = (child) => {
        if (!child) return null;
        if (child.estado_vinculacion === 'vinculado') {
            return { text: '1 dispositivo vinculado', color: '#AAD62D', icon: 'checkmark-circle' };
        }
        if (child.estado_vinculacion === 'pendiente') {
            return { text: 'Pendiente de vincular', color: '#F59E0B', icon: 'time' };
        }
        return { text: 'Sin vincular', color: '#9CA3AF', icon: 'alert-circle-outline' };
    };

    const linkedInfo = getLinkedText(currentChild);

    const renderTask = (task) => {
        const assignment = task.assignments?.find(a => a.child_id === currentChild?.id);
        const statusMap = {
            'assigned': { text: 'Pendiente', color: '#9CA3AF' },
            'in_progress': { text: 'En progreso', color: '#F59E0B' },
            'completed': { text: 'En espera de aprobación', color: '#F97316' },
            'verified': { text: 'Completada', color: '#84CC16' }
        };
        const taskStatusInfo = statusMap[assignment?.status || 'assigned'];

        return (
            <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDescription}>{task.description}</Text>
                    <Text style={styles.taskDeadline}>Fecha límite: <Text style={styles.deadlineValue}>{task.due_date} {task.due_time}</Text></Text>

                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Estado:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: taskStatusInfo.color }]}>
                            <Text style={styles.statusBadgeText}>{taskStatusInfo.text}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.taskAction}>
                    {assignment?.status !== 'verified' ? (
                        <Ionicons name="close-circle-sharp" size={32} color="#F87171" />
                    ) : (
                        <View style={styles.completedSpacer} />
                    )}
                </View>
            </View>
        );
    };

    const isInitialLoading = (loadingHijos && children.length === 0) 
                          || (loadingTareas && tareas.length === 0) 
                          || (loadingPolicy && !policy);

    return (
        <View style={styles.container}>
                <BackendState error={errorCatalogo || hijosError || tareasError || policyError} onRetry={() => { reloadCatalogo(); fetchHijos(); fetchTareas(); if (currentChild?.id) fetchPolicy(currentChild.id); }} />
            {/* Header Section with Decorative Circles and Switcher */}
            <View style={styles.header}>
                <View style={[styles.circle, styles.circlePink]} />
                <View style={[styles.circle, styles.circleGreen]} />
                <View style={[styles.circle, styles.circleCyan]} />

                <View style={styles.headerContent}>
                    {/* Flecha de retroceso */}
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>

                    {/* Carrusel de hijos reales */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.switcherContent}
                        style={styles.switcher}
                        snapToInterval={96}
                        decelerationRate="fast"
                    >
                        {children.map((child, index) => (
                            <TouchableOpacity
                                key={child.id}
                                style={[
                                    styles.switcherItem,
                                    child.id === selectedChildId && styles.switcherItemActive
                                ]}
                                onPress={() => handleSwitchChild(child)}
                            >
                                <View style={[
                                    styles.switcherAvatarWrapper,
                                    child.id === selectedChildId && styles.switcherAvatarActive
                                ]}>
                                    <View style={[styles.switcherInitialCircle, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                                        <Text style={styles.switcherInitial}>
                                            {child.nombre ? child.nombre.charAt(0).toUpperCase() : '?'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[
                                    styles.switcherName,
                                    child.id === selectedChildId && styles.switcherNameActive
                                ]}>{child.nombre}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Estado de vinculación real */}
                    {linkedInfo && (
                        <View style={styles.linkedContainer}>
                            <Ionicons name={linkedInfo.icon} size={18} color={linkedInfo.color} />
                            <Text style={[styles.linkedText, { color: linkedInfo.color }]}>{linkedInfo.text}</Text>
                        </View>
                    )}
                </View>
            </View>

            {isInitialLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : children.length === 0 ? (
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
                    <Ionicons name="people-outline" size={60} color={Colors.darkgraytext} />
                    <Text style={{ fontFamily: Fonts.figtreebold, fontSize: 18, color: Colors.darkgraytext, marginTop: 15 }}>
                        No hay hijos registrados
                    </Text>
                    <TouchableOpacity
                        style={{ marginTop: 20, backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20 }}
                        onPress={() => router.push('/perfilnuevo')}
                    >
                        <Text style={{ color: Colors.white, fontFamily: Fonts.figtreebold, fontWeight: 'bold' }}>Agregar hijo</Text>
                    </TouchableOpacity>
                </View>
            ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Restricted Apps */}
                <Text style={styles.sectionTitle}>Aplicaciones restringidas</Text>
                <TouchableOpacity
                    style={styles.appsCard}
                    onPress={() => router.push({
                        pathname: '/appsrestringidas',
                        params: { childId: currentChild?.id, childName: currentChild?.nombre }
                    })}
                >
                    <View style={styles.appsContainer}>
                        {(policy?.restricted_apps && Array.isArray(policy.restricted_apps) && policy.restricted_apps.length > 0) ? (
                            policy.restricted_apps.map((appId, idx) => {
                                const app = (catalogo || []).find(a => a.id === appId);
                                return app ? (
                                    <View key={appId} style={[styles.appIcon, { backgroundColor: app.color }]}>
                                        {renderAppIcon(app)}
                                    </View>
                                ) : null;
                            })
                        ) : (
                            <Text style={{ fontFamily: Fonts.figtreeRegular, color: Colors.darkgraytext }}>Ninguna app restringida</Text>
                        )}
                    </View>
                    <Feather name="chevron-right" size={24} color="black" />
                </TouchableOpacity>

                {/* Sleep Schedule */}
                <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Horas de sueño</Text>
                <View style={styles.sleepCard}>
                    <View style={styles.sleepInfo}>
                        <Text style={styles.timeLabel}>De:</Text>
                        <Text style={styles.timeValue}>{policy?.sleep_enabled !== false && policy?.sleep_start_time ? policy.sleep_start_time.substring(0,5) : '--:--'}</Text>
                        <Text style={[styles.timeLabel, { marginLeft: 15 }]}>Hasta:</Text>
                        <Text style={styles.timeValue}>{policy?.sleep_enabled !== false && policy?.sleep_end_time ? policy.sleep_end_time.substring(0,5) : '--:--'}</Text>
                        <Text style={styles.daysText}>{policy?.sleep_enabled !== false ? policy?.sleep_days : 'Sin horario activo'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editSleepButton}
                        onPress={() => router.push({
                            pathname: '/horariodesueno',
                            params: { name: currentChild?.nombre, id: currentChild?.id }
                        })}
                    >
                        <Text style={styles.editSleepButtonText}>Editar</Text>
                    </TouchableOpacity>
                </View>

                {/* Tasks */}
                <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Tareas</Text>

                <TouchableOpacity style={styles.assignButton} onPress={handleAssignTask}>
                    <Text style={styles.assignButtonText}>Asignar tarea</Text>
                    <Image source={require('../../assets/images/tareas.png')} style={styles.miniClipboard} resizeMode="contain" />
                </TouchableOpacity>

                {/* Tabs */}
                <View style={styles.tabsWrapper}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Semana' && styles.activeTab]}
                        onPress={() => setActiveTab('Semana')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Semana' && styles.activeTabText]}>Esta semana</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Anteriores' && styles.activeTab]}
                        onPress={() => setActiveTab('Anteriores')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Anteriores' && styles.activeTabText]}>Anteriores</Text>
                    </TouchableOpacity>
                </View>

                {/* Task List */}
                <View style={styles.taskList}>
                    {childTasks.map(renderTask)}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
            )}

            <BarraNavegacion activeTab="inicio" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray,
    },
    header: {
        height: SCREEN_HEIGHT * 0.34,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        justifyContent: 'center',
        paddingTop: 40,
        ...Shadows.button,
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    circlePink: {
        width: 100,
        height: 100,
        backgroundColor: '#FF009B',
        top: -20,
        left: -20,
        opacity: 0.6,
    },
    circleGreen: {
        width: 120,
        height: 120,
        backgroundColor: '#AAD62D',
        bottom: -30,
        right: 40,
        opacity: 0.6,
    },
    circleCyan: {
        width: 70,
        height: 70,
        backgroundColor: '#00AEEB',
        top: 20,
        right: -10,
        opacity: 0.6,
    },
    headerContent: {
        alignItems: 'center',
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        top: -30,
        left: 15,
        zIndex: 20,
        padding: 5,
    },
    switcher: {
        width: '100%',
        marginBottom: 15,
    },
    switcherContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 20,
    },
    switcherItem: {
        alignItems: 'center',
        opacity: 0.6,
    },
    switcherItemActive: {
        opacity: 1,
    },
    switcherAvatarWrapper: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    switcherAvatarActive: {
        backgroundColor: Colors.white,
        borderColor: '#AAD62D',
        transform: [{ scale: 1.1 }],
    },
    switcherInitialCircle: {
        width: 55,
        height: 55,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    switcherInitial: {
        fontSize: 24,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: '#6B21A8',
    },
    switcherName: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontSize: 14,
        marginTop: 5,
    },
    switcherNameActive: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    linkedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 5,
    },
    linkedText: {
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 14,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 15,
    },
    appsCard: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    appsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    appIcon: {
        width: 35,
        height: 35,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    netflixLetter: {
        color: '#E50914',
        fontWeight: 'bold',
        fontSize: 20,
    },
    assignButton: {
        backgroundColor: '#7E22CE',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
        width: '60%',
        ...Shadows.button,
    },
    assignButtonText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 16,
    },
    miniClipboard: {
        width: 24,
        height: 24,
        tintColor: 'white'
    },
    tabsWrapper: {
        flexDirection: 'row',
        marginTop: 20,
        backgroundColor: Colors.white,
        borderRadius: 10,
        overflow: 'hidden',
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#7E22CE',
    },
    tabText: {
        fontFamily: Fonts.figtreebold,
        color: '#7E22CE',
        fontSize: 14,
        fontWeight: 'bold',
    },
    activeTabText: {
        color: Colors.white,
    },
    taskList: {
        marginTop: 15,
    },
    taskCard: {
        backgroundColor: Colors.white,
        borderRadius: 0,
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 13,
        color: '#4B5563',
        fontFamily: Fonts.figtreeRegular,
        marginBottom: 6,
    },
    taskDeadline: {
        fontSize: 12,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 8,
    },
    deadlineValue: {
        fontWeight: 'normal',
        color: '#6B7280',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusLabel: {
        fontSize: 13,
        fontFamily: Fonts.figtreeRegular,
        color: Colors.black,
    },
    statusBadge: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    statusBadgeText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    taskAction: {
        justifyContent: 'center',
        paddingLeft: 10,
    },
    completedSpacer: {
        width: 32,
    },
    sleepCard: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    sleepInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 14,
        fontFamily: Fonts.figtreeRegular,
        color: Colors.black,
        marginRight: 8,
    },
    timeValue: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
    },
    daysText: {
        fontSize: 14,
        fontFamily: Fonts.figtreeRegular,
        color: '#6B7280',
        marginLeft: 15,
    },
    editSleepButton: {
        backgroundColor: '#7E22CE',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    editSleepButtonText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
    },
});