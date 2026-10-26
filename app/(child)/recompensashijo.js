import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BarraNavegacion from '../../components/BarraNavegacion';
import BackendState from '../../components/BackendState';
import { useBackendResource } from '../../hooks/useBackendResource';
import { Colors, Fonts, Shadows } from '../../styles/globalStyles';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { RecompensasRepository } from '../../repositories/RecompensasRepository';
export default function RecompensasHijo() {
  const router = useRouter();
  const { data, loading, error, reload } = useBackendResource(RecompensasRepository.getRecompensas);
  return <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.titleRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="chevron-back" size={32} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Recompensas</Text>
      </View>
      <BackendState loading={loading} error={error} onRetry={reload} />
      {data && <>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBoxTime}><Text style={styles.summaryTextTime}>{data.minutos} min</Text></View>
          <View style={styles.summaryBoxKeys}><Text style={styles.summaryTextKeys}>{data.llaves} llaves</Text></View>
        </View>
        <View style={styles.rewardList}>
          {data.historial.length === 0 && <Text>Aún no tienes misiones aprobadas. Tus recompensas aparecerán aquí.</Text>}
          {data.historial.map(reward => <View key={reward.id} style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>{reward.title}</Text>
            <View style={styles.rewardDetails}>
              <Text style={styles.detailText}>+{reward.keys} llaves</Text>
              <Text style={styles.detailText}>+{reward.minutes} minutos</Text>
            </View>
            <Text style={styles.timeAgoText}>{reward.completed_at ? new Date(reward.completed_at).toLocaleString('es-MX') : ''}</Text>
          </View>)}
        </View>
      </>}
    </ScrollView>
    <BarraNavegacion activeTab="inicio" userType="hijo" />
  </View>;
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
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    circlePink: {
        width: 80,
        height: 80,
        backgroundColor: '#FF009B',
        top: 20,
        left: -30,
    },
    circleCyan: {
        width: 50,
        height: 50,
        backgroundColor: '#00AEEF',
        top: 50,
        left: 150,
    },
    circleGreen: {
        width: 70,
        height: 70,
        backgroundColor: '#ADD633',
        bottom: -20,
        right: 80,
    },
    content: {
        flex: 1,
        marginTop: -40,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 30,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 38,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    summaryBoxTime: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00AEEF',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '48%',
        ...Shadows.button,
    },
    summaryBoxKeys: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF9C3',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '48%',
        ...Shadows.button,
    },
    iconCircleTime: {
        backgroundColor: Colors.white,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        position: 'relative',
    },
    checkMini: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#ADD633',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.white,
    },
    summaryTextTime: {
        color: Colors.white,
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
    },
    keyIconSummary: {
        width: 36,
        height: 36,
        marginRight: 10,
    },
    summaryTextKeys: {
        color: '#E67E22',
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
    },
    rewardList: {
        gap: 15,
    },
    rewardCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    rewardTitle: {
        fontSize: 20,
        fontFamily: Fonts.figtreebold,
        marginBottom: 15,
    },
    rewardDetails: {
        flexDirection: 'row',
        gap: 25,
        marginBottom: 15,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    detailText: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    iconCircleTimeSmall: {
        backgroundColor: '#F3F4F6',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        position: 'relative',
    },
    checkMiniSmall: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        backgroundColor: '#ADD633',
        width: 10,
        height: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeAgoText: {
        fontSize: 14,
        fontFamily: Fonts.figtreeRegular,
        color: '#9CA3AF',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.white,
        width: '85%',
        borderRadius: 40,
        padding: 30,
        alignItems: 'center',
        ...Shadows.button,
    },
    congratsImage: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    congratsTitle: {
        fontSize: 32,
        fontFamily: Fonts.figtreebold,
        color: '#7E22CE',
        marginBottom: 25,
    },
    popupRewardRow: {
        width: '100%',
        gap: 15,
        marginBottom: 30,
    },
    rewardStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        width: '100%',
        height: 80,
    },
    rewardStripText: {
        color: Colors.white,
        fontSize: 32,
        fontFamily: Fonts.figtreebold,
    },
    keyIconPopup: {
        width: 50,
        height: 50,
    },
    iconCircleTimePopup: {
        backgroundColor: Colors.white,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    checkMiniPopup: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#ADD633',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    acceptButton: {
        backgroundColor: '#ADD633',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 30,
        ...Shadows.button,
    },
    acceptButtonText: {
        color: Colors.white,
        fontSize: 22,
        fontFamily: Fonts.figtreebold,
    }
});
