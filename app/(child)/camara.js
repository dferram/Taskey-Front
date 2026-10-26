import { saveEvidenceDraft } from '../../storage/evidenceDraft';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Button, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Fonts } from "../../styles/globalStyles";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const cameraRef = useRef(null);
    const router = useRouter();
    const params = useLocalSearchParams();

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Necesitamos tu permiso para usar la cámara</Text>
                <Button onPress={requestPermission} title="Dar permiso" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    function toggleFlash() {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    }

    async function takePicture() {
        if (cameraRef.current) {
            try {
                if (!params.id) throw new Error('No se encontró la asignación');
                const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.35 });
                if (!photo.base64) throw new Error('No se pudo preparar la foto');
                const evidence = `data:image/jpeg;base64,${photo.base64}`;
                if (evidence.length > 4000000) throw new Error('La foto es demasiado grande. Intenta tomar otra.');
                saveEvidenceDraft(params.id, evidence);
                router.back();
            } catch (e) {
                Alert.alert('No se pudo tomar la foto', e.message);
            }
        }
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                flash={flash}
                ref={cameraRef}
            />
            <View style={styles.controlsContainer}>
                {/* Top Controls */}
                <View style={styles.topContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
                        <MaterialIcons
                            name={flash === 'on' ? "flash-on" : "flash-off"}
                            size={28}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomContainer}>
                    <View style={styles.shutterContainer}>
                        <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                        <Ionicons name="camera-reverse-outline" size={32} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
        fontFamily: Fonts.figtreeRegular,
    },
    camera: {
        flex: 1,
    },
    controlsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        padding: 40,
    },
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 20,
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    shutterContainer: {
        flex: 1,
        alignItems: 'center',
        marginLeft: 40, // offset the flip button weight
    },
    shutterButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
    },
    flipButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
