import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthRepository } from '../../repositories/AuthRepository';
import BarraNavegacion from "../../components/BarraNavegacion";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PerfilConfigHijo() {
    const router = useRouter();

const handleLogoutPress = async () => {
        try {
            await AuthRepository.clearAll();
            router.replace('/');
        } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
        }
    };
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                {/* Decorative Circles */}
                <View style={[styles.circle, styles.circlePink]} />
                <View style={[styles.circle, styles.circleDarkPurple]} />
                <View style={[styles.circle, styles.circleCyan]} />

                <View style={styles.headerContent}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={require('../../assets/images/capicons.png')}
                                style={styles.avatar}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.nameBadge}>
                            <Text style={styles.nameText}>Ángel</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Menu Options */}
            <View style={styles.content}>
                <View style={styles.card}>
                    {/* Avatar Option */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/personalizaravatar')}
                    >
                        <View style={styles.iconContainer}>
                            <FontAwesome5 name="paw" size={28} color="#5B21B6" />
                        </View>
                        <Text style={styles.menuText}>Avatar</Text>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Mi progreso Option */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/progresohijo')}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="trending-up" size={32} color="#5B21B6" />
                        </View>
                        <Text style={styles.menuText}>Mi progreso</Text>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Ayuda Option */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/preguntashijo')}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="help-circle" size={36} color="#5B21B6" />
                        </View>
                        <Text style={styles.menuText}>Ayuda</Text>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                    {/* Eliminar despues solo para pruebas */}
                    {/* Cerrar sesión Option */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleLogoutPress()}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="log-out" size={36} color="#5B21B6" />
                        </View>
                        <Text style={styles.menuText}>Cerrar sesión</Text>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </View>

            <BarraNavegacion activeTab="perfil" userType="hijo" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        height: SCREEN_HEIGHT * 0.26,
        backgroundColor: '#7C3AED', // Púrpura vibrante
        overflow: 'hidden',
        justifyContent: 'center',
        paddingTop: 30,
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    circlePink: {
        width: 140,
        height: 140,
        backgroundColor: '#EC4899', // Rosa vibrante
        bottom: -20,
        left: -60,
        opacity: 0.9,
    },
    circleDarkPurple: {
        width: 180,
        height: 180,
        backgroundColor: '#4C1D95',
        top: -40,
        right: -40,
        opacity: 0.8,
    },
    circleCyan: {
        width: 60,
        height: 60,
        backgroundColor: '#06B6D4',
        bottom: -25,
        right: 120,
        opacity: 0.8,
    },
    headerContent: {
        paddingHorizontal: 25,
        zIndex: 10,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centrar la fila de perfil
    },
    avatarWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
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
        width: 75,
        height: 75,
    },
    nameBadge: {
        backgroundColor: Colors.white,
        paddingVertical: 10,
        paddingHorizontal: 40,
        paddingLeft: 50, // Espacio extra para compensar el avatar
        borderRadius: 18,
        marginLeft: -40,
        zIndex: 1,
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    nameText: {
        fontSize: 34,
        fontFamily: Fonts.figtreebold,
        color: '#6D28D9',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        marginTop: 15,
        alignItems: 'center',
    },
    card: {
        width: SCREEN_WIDTH * 0.88, // Recuadro más definido y centrado
        backgroundColor: Colors.white,
        borderRadius: 28,
        paddingVertical: 10,
        paddingHorizontal: 20,
        ...Shadows.button,
        shadowOpacity: 0.08,
        elevation: 6,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 22,
    },
    iconContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    menuText: {
        flex: 1,
        fontSize: 20,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        marginLeft: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 15,
    }
});
