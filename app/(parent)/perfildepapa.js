import BackendState from '../../components/BackendState';
import { usePadreViewModel } from '../../viewmodels/usePadreViewModel';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';
import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PerfilDePapa() {
    const router = useRouter();
    const [tempUsername, setTempUsername] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // ViewModel logic
    const { parentData, loading, error, fetchPerfil, actualizarPerfil } = usePadreViewModel();
    const { logoutPadre } = useAuthViewModel();

    useEffect(() => {
        fetchPerfil().catch((err) => {
             // Si el error es de token invalido, redirigimos
             if (err?.message?.includes('No token')) {
                 router.replace('/loginpapa');
             }
        });
    }, [fetchPerfil]);

    const handlePreguntasPress = () => {
        router.push('/preguntasfrecuentes');
    };

    const handleTyCPress = () => {
        router.push('/terminosycondiciones');
    };

    // Limpia los tokens y datos del padre del cache y redirige a la pantalla inicial
    const handleLogoutPress = async () => {
        try {
            await logoutPadre();
            router.replace('/');
        } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
        }
    };

    const handleOpenModal = () => {
        setTempUsername(`${parentData?.nombre || ''} ${parentData?.apellido || ''}`.trim());
        setIsModalVisible(true);
    };

    // Guardar nombre editado en la API
    const handleSaveUsername = async () => {
        if (tempUsername.trim() === "") return;

        setSaving(true);
        const partes = tempUsername.trim().split(' ');
        const nombre = partes[0];
        const apellido = partes.slice(1).join(' ') || parentData?.apellido || '';

        const result = await actualizarPerfil({ nombre, apellido });
        
        if (result.success) {
            setIsModalVisible(false);
        } else {
            Alert.alert('Error', result.error);
        }
        
        setSaving(false);
    };

    const handleCancelEdit = () => {
        setIsModalVisible(false);
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const displayName = parentData ? `${parentData.nombre} ${parentData.apellido}` : 'Usuario';

    return (
        <View style={styles.container}>
            <BackendState error={error} onRetry={fetchPerfil} />
            {/* Header Section with Decorative Circles */}
            <View style={styles.header}>
                <View style={[styles.circle, styles.circlePink]} />
                <View style={[styles.circle, styles.circleCyan]} />
                <View style={[styles.circle, styles.circleOrange]} />

                <View style={styles.headerContent}>
                    <View style={styles.profileBanner}>
                        <View style={styles.avatarCircle}>
                            <Image
                                source={require("../../assets/images/capinombre.png")}
                                style={styles.capyImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.headerName}>{displayName}</Text>
                            <Text style={styles.headerSubtext}>Configuración de cuenta</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Mi Cuenta</Text>

                    {/* Nombre de Usuario */}
                    <View style={styles.menuItem}>
                        <View style={[styles.iconContainer, { backgroundColor: '#FACC15' }]}>
                            <FontAwesome5 name="user" size={18} color="white" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <View style={styles.labelRow}>
                                <Text style={styles.menuLabel}>Nombre de usuario</Text>
                                <TouchableOpacity onPress={handleOpenModal}>
                                    <Feather name="edit-2" size={16} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.menuValue}>{displayName}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Correo */}
                    <View style={styles.menuItem}>
                        <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' }]}>
                            <MaterialIcons name="email" size={20} color="white" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuLabel}>Correo electrónico</Text>
                            <Text style={styles.menuValue}>{parentData?.email || 'Sin correo'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Preguntas Frecuentes */}
                    <TouchableOpacity style={styles.menuItem} onPress={handlePreguntasPress}>
                        <View style={[styles.iconContainer, { backgroundColor: '#06B6D4' }]}>
                            <FontAwesome5 name="question" size={18} color="white" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuLabel}>Preguntas frecuentes</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Terminos y condiciones */}
                    <TouchableOpacity style={styles.menuItem} onPress={handleTyCPress}>
                        <View style={[styles.iconContainer, { backgroundColor: '#DDD6FE' }]}>
                            <FontAwesome5 name="file-alt" size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuLabel}>Términos y condiciones</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={styles.logoutWrapper}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
                            <MaterialIcons name="logout" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.logoutText}>Cerrar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Modal para Editar Nombre de Usuario */}
            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={handleCancelEdit}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar nombre de usuario</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.modalInput}
                                value={tempUsername}
                                onChangeText={setTempUsername}
                                placeholder="Nombre de usuario"
                                autoFocus={true}
                            />
                            {tempUsername.length > 0 && (
                                <TouchableOpacity onPress={() => setTempUsername("")} style={styles.clearButton}>
                                    <Ionicons name="close" size={24} color="black" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={styles.hintText}>Este campo no debe estar vacío</Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, (tempUsername.trim() === "" || saving) && { opacity: 0.5 }]}
                                onPress={handleSaveUsername}
                                disabled={tempUsername.trim() === "" || saving}
                            >
                                <Text style={styles.buttonText}>{saving ? "Guardando..." : "Guardar"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <BarraNavegacion activeTab="perfil" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        height: SCREEN_HEIGHT * 0.28,
        backgroundColor: Colors.primary,
        overflow: 'hidden',
        justifyContent: 'center',
        paddingTop: 20,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...Shadows.button,
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    circlePink: {
        width: 140,
        height: 140,
        backgroundColor: Colors.pink,
        top: -40,
        left: -20,
        opacity: 0.6,
    },
    circleCyan: {
        width: 100,
        height: 100,
        backgroundColor: '#06B6D4',
        bottom: -20,
        right: 40,
        opacity: 0.6,
    },
    circleOrange: {
        width: 70,
        height: 70,
        backgroundColor: '#F59E0B',
        top: 20,
        right: -10,
        opacity: 0.6,
    },
    headerContent: {
        paddingHorizontal: 25,
        zIndex: 10,
    },
    profileBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 15,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    capyImage: {
        width: 45,
        height: 45,
    },
    nameContainer: {
        flex: 1,
    },
    headerName: {
        fontFamily: Fonts.figtreebold,
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },
    headerSubtext: {
        fontFamily: Fonts.figtreeRegular,
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 20,
        zIndex: 10,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        ...Shadows.button,
        shadowOpacity: 0.08,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTextContainer: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuLabel: {
        fontFamily: Fonts.figtreebold,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 2,
    },
    menuValue: {
        fontFamily: Fonts.figtreebold,
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 4,
    },
    logoutWrapper: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#FEF2F2',
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    logoutText: {
        color: '#EF4444',
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.white,
        width: '85%',
        borderRadius: 30,
        padding: 25,
        ...Shadows.button,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    modalInput: {
        flex: 1,
        paddingVertical: 12,
        fontFamily: Fonts.figtreeRegular,
        fontSize: 16,
        color: Colors.black,
    },
    hintText: {
        fontSize: 12,
        fontFamily: Fonts.figtreeRegular,
        color: '#9CA3AF',
        marginBottom: 25,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 15,
        alignItems: 'center',
        backgroundColor: '#EF4444',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 15,
        alignItems: 'center',
        backgroundColor: Colors.primary,
    },
    buttonText: {
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        fontSize: 16,
        color: Colors.white,
    }
});
