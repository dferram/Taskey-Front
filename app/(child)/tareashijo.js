import BackendState from '../../components/BackendState';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { useTareasHijoViewModel } from "../../viewmodels/useTareasHijoViewModel";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NOMBRES_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const COLORES_TITULO = ['#FF8A3D', '#00AEEF', '#8844EE', '#ADD633', '#FF009B', '#F59E0B'];
const TEXTO_ESTADO = {
    assigned: 'Pendiente',
    in_progress: 'En progreso',
    completed: 'Solicitud de confirmación enviada',
    verified: 'Completada',
};

// Genera los 4 "chips" de día a partir de hoy, para no depender de una fecha fija
function generarDias() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return Array.from({ length: 4 }, (_, i) => {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        return { id: i + 1, day: NOMBRES_DIAS[fecha.getDay()], num: fecha.getDate(), date: fecha };
    });
}

function formatearFechaLimite(dueDate, dueTime) {
    if (!dueDate) return 'Sin fecha límite';
    try {
        const [year, month, day] = dueDate.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        const fechaStr = `${NOMBRES_DIAS[fecha.getDay()]} ${day}/${month}`;
        return dueTime ? `${fechaStr} ${dueTime.slice(0, 5)}` : fechaStr;
    } catch {
        return dueDate;
    }
}

function formatearDuracion(horas, minutos) {
    const h = horas || 0;
    const m = minutos || 0;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h} hora${h > 1 ? 's' : ''}`;
    return `${m} minutos`;
}

// Ubica la tarea en uno de los 4 dias visibles; si esta fuera de rango (vencida o muy
// lejana) se muestra en el dia mas cercano para que nunca desaparezca de la lista.
function calcularDayId(dueDate) {
    if (!dueDate) return 1;
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const [year, month, day] = dueDate.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        const diffDias = Math.round((fecha - hoy) / 86400000);
        if (diffDias < 0) return 1;
        if (diffDias > 3) return 4;
        return diffDias + 1;
    } catch {
        return 1;
    }
}

function mapearTarea(task, index) {
    const assignment = (task.assignments || [])[0];
    const status = assignment?.status || 'assigned';
    const esCompletada = status === 'completed' || status === 'verified';

    return {
        id: assignment?.id || task.id,
        title: task.title,
        description: task.description || '',
        deadline: formatearFechaLimite(task.due_date, task.due_time),
        status: esCompletada ? 'completada' : 'pendiente',
        statusText: TEXTO_ESTADO[status] || 'Pendiente',
        estadoAsignacion: status,
        titleColor: COLORES_TITULO[index % COLORES_TITULO.length],
        dayId: calcularDayId(task.due_date),
        keys: String(task.reward_keys ?? 0),
        duration: formatearDuracion(task.duration_hours, task.duration_minutes),
    };
}

export default function TareasHijo() {
    const router = useRouter();
    const [filter, setFilter] = useState('Todas');
    const [selectedDayId, setSelectedDayId] = useState(1);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const { tareas, loading, error, fetchTareas } = useTareasHijoViewModel();

    useFocusEffect(
        useCallback(() => {
            fetchTareas();
        }, [fetchTareas])
    );

    const DAYS = useMemo(() => generarDias(), []);
    const misiones = useMemo(() => tareas.map(mapearTarea), [tareas]);

    const filteredTasks = misiones.filter(task => {
        const matchesDay = task.dayId === selectedDayId;
        if (!matchesDay) return false;

        if (filter === 'Todas') return true;
        if (filter === 'Pendientes') return task.status === 'pendiente';
        if (filter === 'Completadas') return task.status === 'completada';
        return true;
    });

    const handleBackPress = () => router.back();

    const toggleFilterModal = () => setIsFilterVisible(!isFilterVisible);

    const selectFilter = (value) => {
        setFilter(value);
        setIsFilterVisible(false);
    };

    const handleTaskPress = (task) => {
        router.push({
            pathname: '/detalletarea',
            params: {
                id: task.id,
                title: task.title,
                description: task.description,
                deadline: task.deadline,
                color: task.titleColor,
                keys: task.keys,
                duration: task.duration,
                status: task.estadoAsignacion
            }
        });
    };

    return (
        <View style={styles.container}>
            {/* Header decorativo */}
            <View style={styles.headerDecor}>
                <View style={[styles.circle, styles.circlePink]} />
                <View style={[styles.circle, styles.circleGreen]} />
                <View style={[styles.circle, styles.circleCyan]} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={32} color="black" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Misiones</Text>

                <Text style={styles.todayLabel}>Hoy</Text>

                {/* Selector de días */}
                <View style={styles.daysRow}>
                    {DAYS.map((item) => {
                        const isActive = selectedDayId === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.dayCard, isActive && styles.dayCardActive]}
                                onPress={() => setSelectedDayId(item.id)}
                            >
                                <Text style={[styles.dayNum, isActive && styles.dayTextActive]}>{item.num}</Text>
                                <Text style={[styles.dayName, isActive && styles.dayTextActive]}>{item.day}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Filtro Dropdown */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={toggleFilterModal}
                    >
                        <Text style={styles.filterButtonText}>{filter}</Text>
                        <Ionicons name="chevron-down" size={20} color="white" />
                    </TouchableOpacity>

                    {isFilterVisible && (
                        <View style={styles.dropdownMenu}>
                            {['Todas', 'Pendientes', 'Completadas'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.dropdownItem}
                                    onPress={() => selectFilter(option)}
                                >
                                    <Text style={styles.dropdownItemText}>{option}</Text>
                                    <View style={styles.radioButton}>
                                        {filter === option && <View style={styles.radioButtonActive} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Lista de Tareas */}
                <BackendState error={error} onRetry={fetchTareas} />
                <View style={styles.taskList}>
                    {loading && misiones.length === 0 ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
                    ) : filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() => handleTaskPress(task)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.taskTitle, { color: task.titleColor }]}>{task.title}</Text>
                                <Text style={styles.taskDescription}>{task.description}</Text>
                                <Text style={styles.taskDeadline}>
                                    Fecha límite: <Text style={styles.deadlineValue}>{task.deadline}</Text>
                                </Text>

                                <View style={styles.statusRow}>
                                    {task.status === 'completada' ? (
                                        <>
                                            <View style={styles.checkCircle}>
                                                <Ionicons name="checkmark" size={16} color="white" />
                                            </View>
                                            <Text style={styles.statusCompletada}>{task.statusText}</Text>
                                        </>
                                    ) : (
                                        <Text style={styles.statusPendiente}>{task.statusText}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.noTasksContainer}>
                            <Text style={styles.noTasksText}>No hay misiones para este día</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <BarraNavegacion activeTab="inicio" userType="hijo" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    headerDecor: {
        height: SCREEN_HEIGHT * 0.15,
        backgroundColor: Colors.primary,
        overflow: 'hidden',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    circlePink: {
        width: 80,
        height: 80,
        backgroundColor: '#FF009B',
        bottom: 10,
        left: -20,
    },
    circleGreen: {
        width: 60,
        height: 60,
        backgroundColor: '#ADD633',
        top: -10,
        left: 140,
    },
    circleCyan: {
        width: 40,
        height: 40,
        backgroundColor: '#00AEEF',
        bottom: 20,
        right: 180,
    },
    content: {
        flex: 1,
        marginTop: -30,
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 20,
    },
    backButton: {
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 42,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 10,
    },
    todayLabel: {
        fontSize: 22,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        marginBottom: 15,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    dayCard: {
        width: '23%',
        paddingVertical: 12,
        borderRadius: 15,
        backgroundColor: Colors.white,
        alignItems: 'center',
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    dayCardActive: {
        backgroundColor: '#7E22CE',
    },
    dayNum: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    dayName: {
        fontSize: 12,
        fontFamily: Fonts.figtreeRegular,
        color: Colors.black,
    },
    dayTextActive: {
        color: Colors.white,
    },
    filterContainer: {
        alignItems: 'flex-end',
        zIndex: 100,
        marginBottom: 20,
    },
    filterButton: {
        backgroundColor: '#7E22CE',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        minWidth: 120,
        justifyContent: 'space-between',
    },
    filterButtonText: {
        color: Colors.white,
        fontFamily: Fonts.figtreeRegular,
        fontSize: 14,
        marginRight: 5,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 15,
        width: 180,
        paddingVertical: 10,
        ...Shadows.button,
        elevation: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    dropdownItemText: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: Colors.black,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonActive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.black,
    },
    taskList: {
        gap: 15,
    },
    taskCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    taskTitle: {
        fontSize: 22,
        fontFamily: Fonts.figtreebold,
        marginBottom: 8,
    },
    taskDescription: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: '#4B5563',
        marginBottom: 10,
        lineHeight: 22,
    },
    taskDeadline: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        marginBottom: 15,
    },
    deadlineValue: {
        fontFamily: Fonts.figtreeRegular,
        fontWeight: 'normal',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#ADD633',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statusCompletada: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        color: '#ADD633',
    },
    statusPendiente: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        color: '#F1C40F',
    },
    noTasksContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    noTasksText: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: '#9CA3AF',
    }
});
