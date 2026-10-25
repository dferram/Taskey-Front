import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { useTareasHijoViewModel } from "../../viewmodels/useTareasHijoViewModel";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DetalleTarea() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { cambiarEstado } = useTareasHijoViewModel();

    const task = {
        title: params.title || 'Misión',
        description: params.description || '',
        deadline: params.deadline || 'Sin fecha',
        color: params.color || '#00AEEF',
        keys: params.keys || '20',
        duration: params.duration || '15 minutos'
    };

    const [hasEvidence, setHasEvidence] = useState(!!params.photoUri);
    const [evidenceUri, setEvidenceUri] = useState(params.photoUri || null);
    const [isSent, setIsSent] = useState(params.status === 'completed' || params.status === 'verified');
    const [sending, setSending] = useState(false);

    // Sync evidence state if param changes
    useEffect(() => {
        if (params.photoUri) {
            setEvidenceUri(params.photoUri);
            setHasEvidence(true);
        }
    }, [params.photoUri]);

    const handleBackPress = () => router.back();

    const handleTakePhoto = () => {
        router.push({
            pathname: '/camara',
            params: { ...params }
        });
    };

    const handleDeletePhoto = () => {
        setEvidenceUri(null);
        setHasEvidence(false);
    };

    const handleSend = async () => {
        if (!evidenceUri) {
            Alert.alert("Falta evidencia", "Por favor, toma una foto de la evidencia antes de enviar.");
            return;
        }
        if (!params.id) {
            setIsSent(true);
            return;
        }
        setSending(true);
        const result = await cambiarEstado(params.id, 'completed');
        setSending(false);
        if (result.success) {
            setIsSent(true);
        } else {
            Alert.alert("Error", result.error || "No se pudo enviar la misión, intenta de nuevo.");
        }
    };

    const handleCancelSend = async () => {
        if (!params.id) {
            setIsSent(false);
            return;
        }
        setSending(true);
        const result = await cambiarEstado(params.id, 'in_progress');
        setSending(false);
        if (result.success) {
            setIsSent(false);
        } else {
            Alert.alert("Error", result.error || "No se pudo anular el envío, intenta de nuevo.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={32} color="black" />
                </TouchableOpacity>

                <View style={[styles.taskInfo, isSent && { opacity: 0.5 }]}>
                    <Text style={[styles.title, { color: task.color }]}>{task.title}</Text>
                    <Text style={styles.deadline}>Fecha límite: {task.deadline}</Text>

                    <View style={[styles.separator, { backgroundColor: task.color, opacity: 0.3 }]} />

                    <Text style={styles.description}>{task.description}</Text>

                    <View style={[styles.separator, { backgroundColor: task.color, opacity: 0.3 }]} />

                    <View style={styles.rewardsRow}>
                        <View style={styles.rewardItem}>
                            <View style={styles.iconCircle}>
                                <Image source={require('../../assets/images/capillave.png')} style={styles.rewardIcon} resizeMode="contain" />
                            </View>
                            <Text style={styles.rewardText}>+{task.keys}</Text>
                        </View>

                        <View style={styles.rewardItem}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="clock-outline" size={24} color="#00AEEF" />
                                <View style={styles.checkBadge}>
                                    <Ionicons name="checkmark" size={10} color="white" />
                                </View>
                            </View>
                            <Text style={styles.rewardText}>+{task.duration}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Evidence Section */}
            <View style={styles.evidencePanel}>
                <View style={styles.handle} />

                <View style={styles.evidenceHeader}>
                    <Text style={styles.evidenceLabel}>Evidencia</Text>
                    <Text style={[styles.statusLabel, isSent && { color: '#7E22CE' }]}>
                        {isSent ? 'Completada' : 'Pendiente'}
                    </Text>
                </View>

                {isSent ? (
                    <View style={styles.sentContent}>
                        <Text style={styles.sentSubtext}>Solicitud de confirmación enviada</Text>
                        <TouchableOpacity
                            style={styles.cancelSendButton}
                            onPress={handleCancelSend}
                            activeOpacity={0.8}
                            disabled={sending}
                        >
                            <Text style={styles.cancelSendButtonText}>{sending ? 'Anulando...' : 'Anular envío'}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {evidenceUri ? (
                            <View style={styles.evidenceCard}>
                                <Image source={{ uri: evidenceUri }} style={styles.evidencePreview} />
                                <View style={styles.evidenceFileDetails}>
                                    <Text style={styles.evidenceFileName}>{task.title}</Text>
                                    <Text style={styles.evidenceFileExt}>.jpg</Text>
                                </View>
                                <TouchableOpacity onPress={handleDeletePhoto} style={styles.deleteEvidenceBtn}>
                                    <Ionicons name="close" size={24} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.photoButton}
                                onPress={handleTakePhoto}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="camera-outline" size={24} color="black" style={styles.cameraIcon} />
                                <Text style={styles.photoButtonText}>Tomar foto</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                !evidenceUri && styles.sendButtonDisabled,
                                evidenceUri && styles.sendButtonActive
                            ]}
                            onPress={handleSend}
                            activeOpacity={0.8}
                            disabled={sending}
                        >
                            <Text style={[
                                styles.sendButtonText,
                                !evidenceUri && styles.sendButtonTextDisabled,
                                evidenceUri && styles.sendButtonTextActive
                            ]}>{sending ? 'Enviando...' : 'Enviar'}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <BarraNavegacion activeTab="inicio" userType="hijo" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4FB',
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 50,
    },
    backButton: {
        marginBottom: 20,
    },
    taskInfo: {
        marginTop: 10,
    },
    title: {
        fontSize: 42,
        fontFamily: Fonts.figtreebold,
        marginBottom: 10,
        lineHeight: 48,
    },
    deadline: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: '#64748B',
        marginBottom: 20,
    },
    separator: {
        height: 1,
        width: '100%',
        marginVertical: 20,
    },
    description: {
        fontSize: 18,
        fontFamily: Fonts.figtreeRegular,
        color: '#334155',
        lineHeight: 26,
    },
    rewardsRow: {
        flexDirection: 'row',
        gap: 30,
        marginTop: 10,
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    rewardIcon: {
        width: 24,
        height: 24,
    },
    rewardText: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        color: '#334155',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4ade80',
        borderRadius: 6,
        width: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
    },
    evidencePanel: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 15,
        paddingBottom: 110, // Avoid navigation bar
        ...Shadows.button,
        shadowOpacity: 0.1,
        elevation: 10,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    evidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    evidenceLabel: {
        fontSize: 22,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    statusLabel: {
        fontSize: 14,
        fontFamily: Fonts.figtreebold,
        color: '#64748B',
    },
    evidenceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 10,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginBottom: 15,
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    evidencePreview: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 15,
    },
    evidenceFileDetails: {
        flex: 1,
    },
    evidenceFileName: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    evidenceFileExt: {
        fontSize: 12,
        fontFamily: Fonts.figtreeRegular,
        color: '#64748B',
    },
    deleteEvidenceBtn: {
        padding: 5,
    },
    photoButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        ...Shadows.button,
        shadowOpacity: 0.05,
        backgroundColor: 'white',
    },
    cameraIcon: {
        marginRight: 10,
    },
    photoButtonText: {
        fontSize: 16,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    sendButton: {
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#7E22CE',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    sendButtonActive: {
        backgroundColor: '#7E22CE',
        borderColor: '#7E22CE',
    },
    sendButtonDisabled: {
        borderColor: '#E2E8F0',
    },
    sendButtonText: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        color: '#7E22CE',
    },
    sendButtonTextActive: {
        color: 'white',
    },
    sendButtonTextDisabled: {
        color: '#CBD5E1',
    },
    sentContent: {
        alignItems: 'center',
    },
    sentSubtext: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: '#000',
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    cancelSendButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        backgroundColor: '#7E22CE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelSendButtonText: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        color: 'white',
    }
});
