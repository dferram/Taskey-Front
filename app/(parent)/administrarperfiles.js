import BackendState from '../../components/BackendState';
import { useHijosViewModel } from '../../viewmodels/useHijosViewModel';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colores para los avatares cuando no hay imagen
const AVATAR_COLORS = ['#DDD6FE', '#FEF3C7', '#DCFCE7', '#FDE68A', '#BFDBFE', '#FBCFE8'];

export default function AdministrarPerfiles() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // ViewModel logic
    const { hijos: profiles, loading, error, fetchHijos, eliminarHijo, generarCodigoVinculacion } = useHijosViewModel();

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdProfileName, setCreatedProfileName] = useState('');
    const [createdCode, setCreatedCode] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkCode, setLinkCode] = useState('');
    const [generatingCode, setGeneratingCode] = useState(false);

    useEffect(() => {
        fetchHijos().catch(err => {
             if (err?.message?.includes('No token')) {
                 router.replace('/loginpapa');
             }
        });
    }, [fetchHijos]);

    // Cuando regresa de crear un perfil nuevo, actualiza la lista
    useEffect(() => {
        if (params.createdName && params.createdCode) {
            setCreatedProfileName(params.createdName);
            setCreatedCode(params.createdCode);
            setShowSuccessModal(true);
            // Actualiza la lista
            fetchHijos();
        }
    }, [params.createdName, params.createdCode]);

    // Actualiza la lista
    useEffect(() => {
        if (params.updatedProfile) {
            fetchHijos();
        }
    }, [params.updatedProfile]);

    const handleBackPress = () => {
        router.back();
    };

    const handleAddProfile = () => {
        router.push('/perfilnuevo');
    };

    const handleEditProfile = (profile) => {
        router.push({
            pathname: '/perfilnuevo',
            params: {
                mode: 'edit',
                id: profile.id,
                name: profile.nombre,
                apellido: profile.apellido || '',
                genero: profile.genero || '',
                fecha_nacimiento: profile.fecha_nacimiento || '',
            }
        });
    };

    const handleDeletePress = (profile) => {
        setProfileToDelete(profile);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!profileToDelete) return;
        setDeleting(true);
        
        await eliminarHijo(profileToDelete.id);
        
        setShowDeleteModal(false);
        setProfileToDelete(null);
        setDeleting(false);
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
    };

    // Genera y muestra codigo de vinculacion
    const handlePendingIconPress = async (profile) => {
        setGeneratingCode(true);
        setShowLinkModal(true);
        
        const result = await generarCodigoVinculacion(profile.id);
        if (result.success) {
            setLinkCode(result.data.codigo);
        } else {
            setLinkCode('Error al generar');
        }
        
        setGeneratingCode(false);
    };

    const renderProfileItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: '/perfildehijo',
                params: { name: item.nombre, id: item.id }
            })}
        >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <View style={[styles.avatarCircle, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                    <Text style={styles.avatarInitial}>
                        {item.nombre ? item.nombre.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.nameText}>{item.nombre}</Text>
                    {item.estado_vinculacion === 'vinculado' && (
                        <Ionicons name="checkmark-circle" size={18} color="#84CC16" style={styles.statusIcon} />
                    )}
                    {item.estado_vinculacion === 'pendiente' && (
                        <TouchableOpacity onPress={() => handlePendingIconPress(item)}>
                            <FontAwesome5 name="hourglass-half" size={16} color="#3B82F6" style={styles.statusIcon} />
                        </TouchableOpacity>
                    )}
                </View>
                {item.fecha_nacimiento && (
                    <Text style={styles.ageText}>{item.fecha_nacimiento}</Text>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeletePress(item)}>
                    <FontAwesome5 name="trash-alt" size={20} color={Colors.black} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEditProfile(item)}>
                    <FontAwesome5 name="pen" size={20} color={Colors.black} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <BackendState error={error} onRetry={fetchHijos} />
            {/* Custom Decorated Header */}
            <View style={styles.headerBackground}>
                <View style={styles.circlePink} />
                <View style={styles.circleGreen} />
                <View style={styles.circleCyan} />
                <View style={styles.circleOrange} />
            </View>

            {/* Header Content */}
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfiles</Text>
            </View>

            {/* Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddProfile}>
                <View style={styles.addIconContainer}>
                    <Ionicons name="person-add" size={20} color={Colors.white} />
                </View>
                <Text style={styles.addButtonText}>Agregar perfil</Text>
            </TouchableOpacity>

            {/* List */}
            <FlatList
                data={profiles}
                renderItem={renderProfileItem}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    loading ? (
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={50} color={Colors.darkgraytext} />
                            <Text style={styles.emptyText}>No hay perfiles registrados</Text>
                            <Text style={styles.emptySubtext}>Agrega un perfil para comenzar</Text>
                        </View>
                    )
                }
            />

            <BarraNavegacion activeTab="inicio" />

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¡Perfil creado!</Text>

                        <Text style={styles.modalSubtitle}>
                            Código de vinculación de <Text style={styles.highlightName}>{createdProfileName}</Text>:
                        </Text>

                        <View style={styles.codeContainer}>
                            <Text style={styles.codeText}>{createdCode}</Text>
                        </View>

                        <TouchableOpacity style={styles.acceptButton} onPress={handleCloseModal}>
                            <Text style={styles.acceptButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Delete Modal */}
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.deleteModalContent}>
                        {/* Composite Image Area */}
                        <View style={styles.warningImageContainer}>
                            <Image
                                source={require('../../assets/images/capitriste.png')}
                                style={styles.sadCapiImage}
                                resizeMode="contain"
                            />
                            <View style={styles.warningIconBadge}>
                                <Ionicons name="warning" size={30} color="#000" />
                            </View>
                        </View>

                        <Text style={styles.deleteTitle}>
                            ¿Estás seguro de eliminar a <Text style={{ fontWeight: 'bold' }}>{profileToDelete?.nombre}</Text>?
                        </Text>

                        <Text style={styles.deleteMessage}>
                            El dispositivo vinculado a este perfil cerrará sesión en Task Key automáticamente y la información del perfil se perderá.
                        </Text>

                        <View style={styles.deleteButtonsRow}>
                            <TouchableOpacity
                                style={[styles.deleteButton, styles.cancelButton]}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.deleteButton, styles.confirmDeleteButton, deleting && { opacity: 0.5 }]}
                                onPress={handleDeleteConfirm}
                                disabled={deleting}
                            >
                                <Text style={styles.confirmDeleteText}>{deleting ? 'Eliminando...' : 'Eliminar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Link Pending Modal */}
            <Modal
                visible={showLinkModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLinkModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.linkModalContent}>
                        {/* Link Icon */}
                        <View style={styles.linkIconContainer}>
                            <FontAwesome5 name="link" size={40} color="#FACC15" />
                        </View>

                        <Text style={styles.linkMessage}>
                            Este perfil aún no ha sido vinculado a un dispositivo.
                        </Text>

                        <Text style={styles.linkCodeTitle}>
                            Código de vinculación:
                        </Text>
                        {generatingCode ? (
                            <ActivityIndicator size="small" color={Colors.primary} style={{ marginBottom: 25 }} />
                        ) : (
                            <Text style={styles.linkCodeValue}>
                                {linkCode}
                            </Text>
                        )}

                        <TouchableOpacity
                            style={styles.linkAcceptButton}
                            onPress={() => setShowLinkModal(false)}
                        >
                            <Text style={styles.linkAcceptButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray,
    },
    headerBackground: {
        height: SCREEN_HEIGHT * 0.12,
        backgroundColor: Colors.primary,
        overflow: 'hidden',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.primary,
        marginLeft: 10,
    },
    circlePink: {
        position: 'absolute',
        top: -20,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF009B',
    },
    circleGreen: {
        position: 'absolute',
        top: 20,
        left: '30%',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#AAD62D',
    },
    circleCyan: {
        position: 'absolute',
        top: 50,
        right: '25%',
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: '#00AEEB',
    },
    circleOrange: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primaryDark,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginBottom: 20,
        ...Shadows.button,
    },
    addIconContainer: {
        marginRight: 10,
    },
    addButtonText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 16,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    avatarContainer: {
        marginRight: 15,
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 22,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: '#6B21A8',
    },
    infoContainer: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameText: {
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 18,
        color: Colors.black,
        marginRight: 5,
    },
    statusIcon: {
        marginTop: 2,
    },
    ageText: {
        fontFamily: Fonts.figtreeRegular,
        fontSize: 14,
        color: '#6B7280',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    actionButton: {
        padding: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 10,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.darkgraytext,
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: Fonts.figtreeRegular,
        color: '#9CA3AF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#7E22CE',
        width: '85%',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        marginBottom: 20,
    },
    modalSubtitle: {
        fontSize: 16,
        color: Colors.white,
        fontFamily: Fonts.figtreeRegular,
        textAlign: 'center',
        marginBottom: 15,
    },
    highlightName: {
        color: '#AAD62D',
        fontWeight: 'bold',
        fontFamily: Fonts.figtreebold,
    },
    codeContainer: {
        backgroundColor: Colors.white,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 15,
        marginBottom: 25,
        width: '100%',
        alignItems: 'center',
    },
    codeText: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    acceptButton: {
        backgroundColor: Colors.white,
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    acceptButtonText: {
        color: '#7E22CE',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Fonts.figtreebold,
    },
    deleteModalContent: {
        backgroundColor: Colors.white,
        width: '85%',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
    },
    warningImageContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sadCapiImage: {
        width: 80,
        height: 80,
    },
    warningIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 10,
        backgroundColor: '#F59E0B',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    deleteTitle: {
        fontSize: 18,
        fontFamily: Fonts.figtreeRegular,
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 10,
    },
    deleteMessage: {
        fontSize: 14,
        fontFamily: Fonts.figtreeRegular,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    deleteButtonsRow: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        justifyContent: 'center',
    },
    deleteButton: {
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#7E22CE',
    },
    confirmDeleteButton: {
        backgroundColor: '#FF5E5E',
        shadowColor: '#FF5E5E',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3
    },
    cancelButtonText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
    },
    confirmDeleteText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
    },
    linkModalContent: {
        backgroundColor: Colors.white,
        width: '85%',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        elevation: 5,
    },
    linkIconContainer: {
        marginBottom: 20,
    },
    linkMessage: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    linkCodeTitle: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: '#7E22CE',
    },
    linkCodeValue: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 25,
    },
    linkAcceptButton: {
        backgroundColor: '#7E22CE',
        paddingVertical: 10,
        paddingHorizontal: 50,
        borderRadius: 25,
        ...Shadows.button,
    },
    linkAcceptButtonText: {
        color: Colors.white,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
