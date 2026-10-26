import BackendState from '../../components/BackendState';
import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from "react";
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";
import { useTareasViewModel } from "../../viewmodels/useTareasViewModel";
import { useHijosViewModel } from "../../viewmodels/useHijosViewModel";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AdminTareas() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // ViewModels offline first
    const { tareas: tasks, fetchTareas, eliminarTarea, asignarTarea, cambiarEstadoAsignacion, desasignarTarea, error, loading: loadingTasks } = useTareasViewModel();
    const { hijos, fetchHijos } = useHijosViewModel();

    const [expandedTask, setExpandedTask] = useState(null);

    // Modal States
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [unassignModalVisible, setUnassignModalVisible] = useState(false);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [targetUser, setTargetUser] = useState('');
    const [targetAssignment, setTargetAssignment] = useState(null);
    const [evidence, setEvidence] = useState(null);
    const [busy, setBusy] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchTareas();
            fetchHijos();
        }, [])
    );

    const handleBackPress = () => {
        router.back();
    };

    const handleNewTaskPress = () => {
        router.push('/nuevatarea');
    };

    const toggleDropdown = (taskId) => {
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };

    const openDeleteAlert = (task) => {
        setSelectedTask(task);
        setDeleteModalVisible(true);
    };

    const openUnassignAlert = (task, user, assignment) => {
        setSelectedTask(task);
        setTargetUser(user);
        setTargetAssignment(assignment);
        setUnassignModalVisible(true);
        setExpandedTask(null); 
    };

    const openAssignModal = (task) => {
        setSelectedTask(task);
        setAssignModalVisible(true);
        setExpandedTask(null);
    };

    const runAction = async (action, onSuccess) => {
        if (busy) return;
        setBusy(true);
        try {
            const result = await action();
            if (result?.success) onSuccess?.();
            else Alert.alert('No se pudo guardar', result?.error || 'Intenta de nuevo');
        } catch (err) { Alert.alert('No se pudo guardar', err.message); }
        finally { setBusy(false); }
    };
    const handleAssignProfile = childId => selectedTask && runAction(
        () => asignarTarea(selectedTask.id, childId), () => setAssignModalVisible(false));
    const handleDeleteConfirm = () => selectedTask && runAction(
        () => eliminarTarea(selectedTask.id), () => { setDeleteModalVisible(false); setSelectedTask(null); });
    const handleUnassignConfirm = () => targetAssignment && runAction(
        () => desasignarTarea(targetAssignment.id), () => setUnassignModalVisible(false));
    const handleVerify = assignment => {
        if (assignment.evidencia_foto) setEvidence(assignment);
        else Alert.alert('Sin evidencia', 'Esta tarea no tiene una foto guardada. ¿Quieres aprobarla?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Aprobar', onPress: () => runAction(() => cambiarEstadoAsignacion(assignment.id, 'verified')) }
        ]);
    };

    // Helper functions for UI rendering mapping
    const getAssignedNames = (assignments) => {
        if (!assignments || !hijos) return [];
        return assignments.map(a => {
            const h = hijos.find(hijo => hijo.id === a.child_id);
            return { name: h ? h.nombre : 'Desconocido', assignment: a };
        });
    };

    return (
        <View style={styles.container}>
            <Modal visible={!!evidence} transparent onRequestClose={() => setEvidence(null)}>
                <View style={{ flex: 1, backgroundColor: '#000C', justifyContent: 'center', padding: 24 }}>
                    {evidence && <Image source={{ uri: evidence.evidencia_foto }} style={{ width: '100%', height: '65%' }} resizeMode="contain" />}
                    <TouchableOpacity disabled={busy} onPress={() => runAction(() => cambiarEstadoAsignacion(evidence.id, 'verified'), () => setEvidence(null))} style={{ backgroundColor: 'white', padding: 18, marginTop: 12 }}>
                        <Text>{busy ? 'Guardando…' : 'Aprobar misión'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={busy} onPress={() => setEvidence(null)} style={{ padding: 18 }}><Text style={{ color: 'white' }}>Cerrar</Text></TouchableOpacity>
                </View>
            </Modal>
            {/* Header Content */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Administrar tareas</Text>
            </View>

            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Botón Nueva Tarea */}
                <TouchableOpacity style={styles.newButton} onPress={handleNewTaskPress}>
                    <View style={styles.newButtonContent}>
                        <FontAwesome5 name="clipboard-list" size={34} color="#FACC15" style={styles.clipboardIcon} />
                        <View style={styles.plusBadge}>
                            <Ionicons name="add" size={12} color="white" />
                        </View>
                        <Text style={styles.newButtonText}>Nueva tarea</Text>
                    </View>
                </TouchableOpacity>

                {/* Lista de Tareas */}
                <BackendState loading={loadingTasks} error={error} onRetry={fetchTareas} />
                {!loadingTasks && !error && tasks.length === 0 && <Text>No hay tareas. Crea la primera.</Text>}
                {tasks.map((task) => {
                    const assignedNames = getAssignedNames(task.assignments);
                    return (
                    <View key={task.id} style={styles.taskCard}>

                        {/* Header de la tarjeta con tiempo y llaves */}
                        <View style={styles.cardHeader}>
                            <View style={styles.rewardContainer}>
                                <MaterialIcons name="timer" size={20} color={Utils.getColor(task.color)} />
                                <Text style={styles.rewardText}>{task.duration_hours || 0}h {task.duration_minutes || 0}m</Text>
                            </View>
                            <View style={styles.rewardContainer}>
                                <FontAwesome5 name="key" size={16} color="#DAA520" />
                                <Text style={styles.rewardText}>{task.reward_keys || 0}</Text>
                            </View>
                        </View>

                        {/* Contenido Principal */}
                        <Text style={[styles.taskTitle, { color: task.color || Colors.primary }]}>{task.title}</Text>
                        <Text style={styles.taskDescription}>{task.description}</Text>
                        <Text style={styles.deadline}>Fecha límite: <Text style={styles.deadlineValue}>{task.due_date} {task.due_time}</Text></Text>

                        {/* Acciones Footer */}
                        <View style={styles.cardFooter}>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.iconButton} onPress={() => openDeleteAlert(task)}>
                                    <Feather name="trash-2" size={22} color="black" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => router.push({
                                        pathname: "/nuevatarea",
                                        params: {
                                            mode: 'edit',
                                            id: task.id,
                                            title: task.title,
                                            description: task.description,
                                            keys: task.reward_keys,
                                            duration_hours: task.duration_hours,
                                            duration_minutes: task.duration_minutes,
                                            due_date: task.due_date,
                                            due_time: task.due_time,
                                            color: task.color || Colors.primary
                                        }
                                    })}
                                >
                                    <Feather name="edit-2" size={22} color="black" />
                                </TouchableOpacity>
                            </View>

                            {/* Dropdown Asignada a */}
                            <View style={styles.assignContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.assignButton,
                                        expandedTask === task.id && styles.assignButtonActive
                                    ]}
                                    onPress={() => toggleDropdown(task.id)}
                                >
                                    <Text style={styles.assignButtonText}>Asignada a</Text>
                                    <Ionicons
                                        name={expandedTask === task.id ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color="white"
                                    />
                                </TouchableOpacity>

                                {expandedTask === task.id && (
                                    <View style={styles.dropdownMenu}>
                                        {assignedNames.map((item, idx) => (
                                            <View key={idx}>
                                                <View style={styles.dropdownItem}>
                                                    <Text style={styles.dropdownText}>{item.name}</Text>
                                                    <View style={styles.dropdownItemActions}>
                                                        {item.assignment?.status === 'completed' && (
                                                            <TouchableOpacity testID={`verify-${item.assignment.id}`} onPress={() => handleVerify(item.assignment)}>
                                                                <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                                                            </TouchableOpacity>
                                                        )}
                                                        {item.assignment?.status === 'verified' && (
                                                            <Ionicons name="checkmark-done-circle" size={22} color="#9CA3AF" />
                                                        )}
                                                        <TouchableOpacity onPress={() => openUnassignAlert(task, item.name, item.assignment)}>
                                                            <View style={styles.dash} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                {idx < (assignedNames.length - 1 || 0) && <View style={styles.divider} />}
                                            </View>
                                        ))}
                                        {assignedNames.length > 0 && <View style={styles.divider} />}
                                        <TouchableOpacity style={styles.dropdownItem} onPress={() => openAssignModal(task)}>
                                            <Text style={styles.dropdownInfoText}>Asignar a otro perfil +</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )})}

                {/* Espacio extra para que no tape la barra de navegación */}
                <View style={{ height: 100 }} />
            </ScrollView>

            <BarraNavegacion activeTab="inicio" />

            {/* Delete Alert Modal */}
            <Modal
                transparent={true}
                visible={deleteModalVisible}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.alertBox}>
                        <View style={styles.iconWrapper}>
                            <Ionicons name="warning" size={50} color="#FBBF24" />
                        </View>
                        <Text style={styles.alertTitle}>
                            ¿Estás seguro de eliminar <Text style={styles.boldText}>{selectedTask?.title}</Text>?
                        </Text>
                        <Text style={styles.alertMessage}>
                            Esta tarea desaparecerá de los perfiles en la que está asignada
                        </Text>

                        <View style={styles.alertButtons}>
                            <TouchableOpacity
                                style={[styles.alertButton, styles.cancelButton]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.alertButton, styles.deleteButtonConfirm]}
                                onPress={handleDeleteConfirm}
                            >
                                <Text style={styles.confirmButtonText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Unassign Alert Modal */}
            <Modal
                transparent={true}
                visible={unassignModalVisible}
                animationType="fade"
                onRequestClose={() => setUnassignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.alertBox}>
                        <View style={styles.iconWrapper}>
                            {/* Custom File Off Icon Composition */}
                            <View style={{ position: 'relative' }}>
                                <FontAwesome5 name="file-alt" size={45} color="#D1D5DB" />
                                <View style={styles.redXCircle}>
                                    <Ionicons name="close" size={16} color="white" />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.alertTitle}>
                            ¿Desasignar <Text style={styles.boldText}>{selectedTask?.title}</Text>?
                        </Text>
                        <Text style={styles.alertMessage}>
                            La tarea desaparecerá del perfil de <Text style={styles.boldText}>{targetUser}</Text>
                        </Text>

                        <View style={styles.alertButtons}>
                            <TouchableOpacity
                                style={[styles.alertButton, styles.cancelButton]}
                                onPress={() => setUnassignModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.alertButton, styles.desasignarButton]}
                                onPress={handleUnassignConfirm}
                            >
                                <Text style={styles.confirmButtonText}>Desasignar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Assign Modal */}
            <Modal
                transparent={true}
                visible={assignModalVisible}
                animationType="fade"
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.assignModalContainer}>
                        <TouchableOpacity
                            style={styles.closeAssignModal}
                            onPress={() => setAssignModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity>

                        <ScrollView style={styles.assignList} showsVerticalScrollIndicator={false}>
                            {(hijos || []).map((profile) => {
                                const isAssigned = selectedTask?.assignments?.some(a => a.child_id === profile.id);
                                return (
                                <View key={profile.id} style={styles.assignProfileItem}>
                                    <View style={styles.assignProfileInfo}>
                                        {/* Avatar temporal, luego de S3 se cargará con URI real */}
                                        <Image source={require('../../assets/images/capicons.png')} style={styles.assignAvatar} resizeMode="contain" />
                                        <Text style={styles.assignName}>{profile.nombre}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.assignActionButton,
                                            isAssigned && styles.assignActionButtonDisabled
                                        ]}
                                        onPress={() => handleAssignProfile(profile.id)}
                                        disabled={isAssigned}
                                    >
                                        <Text style={styles.assignActionText}>
                                            {isAssigned ? 'Asignada' : 'Asignar'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )})}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const Utils = {
    getColor: (color) => color || Colors.primary
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SCREEN_HEIGHT * 0.06,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    newButton: {
        backgroundColor: Colors.primary,
        borderRadius: 20,
        height: 60,
        justifyContent: 'center',
        marginBottom: 25,
        ...Shadows.button,
    },
    newButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    clipboardIcon: {
        marginRight: 15,
    },
    plusBadge: {
        position: 'absolute',
        top: 10,
        left: 40,
        backgroundColor: '#A855F7',
        borderRadius: 10,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    newButtonText: {
        color: Colors.white,
        fontSize: 20,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
    },
    taskCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...Shadows.button,
        shadowOpacity: 0.1,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
    },
    rewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    rewardText: {
        fontFamily: Fonts.figtreebold,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4,
        color: Colors.black,
    },
    taskTitle: {
        fontSize: 20,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    taskDescription: {
        fontFamily: Fonts.figtreeRegular,
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
        lineHeight: 20,
    },
    deadline: {
        fontFamily: Fonts.figtreebold,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    deadlineValue: {
        fontFamily: Fonts.figtreeRegular,
        fontWeight: 'normal',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        zIndex: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
        padding: 4,
    },
    assignContainer: {
        position: 'relative',
    },
    assignButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
    },
    assignButtonActive: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    assignButtonText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 14,
    },
    dropdownMenu: {
        position: 'absolute',
        bottom: '100%',
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 8,
        minWidth: 160,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 5,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    dropdownItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dropdownText: {
        fontFamily: Fonts.figtreebold,
        fontSize: 16,
        color: Colors.black,
        fontWeight: 'bold',
    },
    dropdownInfoText: {
        fontFamily: Fonts.figtreeRegular,
        fontSize: 13,
        color: '#6B7280',
    },
    dash: {
        width: 10,
        height: 3,
        backgroundColor: Colors.black,
        borderRadius: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 4,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    alertBox: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 10,
    },
    iconWrapper: {
        marginBottom: 16,
    },
    alertTitle: {
        fontFamily: Fonts.figtreebold,
        fontSize: 18,
        fontWeight: 'bold', // Extra enforcement
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 10,
    },
    boldText: {
        fontWeight: '900',
        fontFamily: Fonts.figtreeBlack,
    },
    alertMessage: {
        fontFamily: Fonts.figtreeRegular,
        fontSize: 15,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    alertButtons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        justifyContent: 'center',
    },
    alertButton: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        minWidth: 110,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cancelButton: {
        backgroundColor: Colors.primary,
    },
    deleteButtonConfirm: {
        backgroundColor: '#FF4C4C', // Red for delete
    },
    desasignarButton: {
        backgroundColor: '#FF4C4C', // Red for desasignar
    },
    cancelButtonText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButtonText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 16,
    },
    redXCircle: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#EF4444',
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    // Assign Modal Styles
    assignModalContainer: {
        backgroundColor: Colors.white,
        borderRadius: 25,
        padding: 20,
        width: '85%',
        maxHeight: '60%',
        ...Shadows.button,
        shadowOpacity: 0.2,
        elevation: 15,
        position: 'relative',
    },
    closeAssignModal: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
    },
    assignList: {
        marginTop: 20,
    },
    assignProfileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    assignProfileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    assignAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    assignName: {
        fontFamily: Fonts.figtreebold,
        fontSize: 20,
        color: Colors.black,
        fontWeight: 'bold',
    },
    assignActionButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 15,
    },
    assignActionButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    assignActionText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
