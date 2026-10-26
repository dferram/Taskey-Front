import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BarraNavegacion from '../../components/BarraNavegacion';
import BackendState from '../../components/BackendState';
import { useBackendResource } from '../../hooks/useBackendResource';
import { Colors, Fonts, Shadows } from '../../styles/globalStyles';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { obtenerLogrosHijo } from '../../services/api';
import { avatarImage } from '../../constants/avatars';
export default function LogrosHijo() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Míos');
  const { data, loading, error, reload } = useBackendResource(obtenerLogrosHijo);
  const items = (data || []).filter(item => item.obtenido === (activeTab === 'Míos'));
  return <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="chevron-back" size={28} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Logros</Text>
      </View>
      <View style={styles.tabsContainer}>{['Míos', 'Por cumplir'].map(tab =>
        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab ? styles.tabActive : styles.tabInactive]}>
          <Text style={styles.tabText}>{tab}</Text>
        </TouchableOpacity>)}</View>
      <BackendState loading={loading} error={error} onRetry={reload} />
      {data && <View style={styles.achievementsContainer}>
        {!items.length && <Text style={{ padding: 20 }}>Todavía no hay logros en esta sección.</Text>}
        {items.map(item => <View key={item.id} style={styles.achievementCard}>
          <View style={styles.imageWrapper}><Image source={avatarImage(item.avatar_id)} style={styles.achievementImage} resizeMode="contain" /></View>
          <View style={styles.textContainer}>
            <Text style={styles.achievementTitle}>{item.title}</Text>
            <Text style={styles.achievementDescription}>{item.description}</Text>
            <Text>{item.actual} / {item.objetivo}</Text>
          </View>
        </View>)}
      </View>}
    </ScrollView>
    <BarraNavegacion activeTab="inicio" userType="hijo" />
  </View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 60,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    backButton: {
        width: 45,
        height: 45,
        backgroundColor: Colors.white,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        ...Shadows.button,
        shadowOpacity: 0.05,
    },
    headerTitle: {
        fontSize: 34,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        zIndex: 2,
    },
    tab: {
        paddingVertical: 14,
        paddingHorizontal: 25,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        minWidth: 120,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#581C87', // Morado muy oscuro/potente
    },
    tabInactive: {
        backgroundColor: '#E5E7EB',
    },
    tabText: {
        fontSize: 15,
        fontFamily: Fonts.figtreebold,
    },
    tabTextActive: {
        color: Colors.white,
    },
    tabTextInactive: {
        color: '#581C87',
    },
    achievementsContainer: {
        backgroundColor: '#581C87',
        borderTopRightRadius: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginHorizontal: 10,
        padding: 20,
        minHeight: SCREEN_HEIGHT * 0.65,
        zIndex: 1,
        ...Shadows.button,
        shadowOpacity: 0.2,
    },
    achievementCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    imageWrapper: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    achievementImage: {
        width: 85,
        height: 85,
    },
    textContainer: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 22,
        fontFamily: Fonts.figtreebold,
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    achievementDescription: {
        fontSize: 15,
        fontFamily: Fonts.figtreeRegular,
        color: '#374151',
        lineHeight: 20,
    }
});
