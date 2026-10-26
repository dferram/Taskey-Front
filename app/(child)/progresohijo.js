import BackendState from '../../components/BackendState';
import { useBackendResource } from '../../hooks/useBackendResource';
import { obtenerProgresoMensual } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BarChart = ({ data, yLabel, percentage = false }) => {
    const maxVal = percentage ? 100 : Math.max(5, ...data.map(item => item.value));
    const ticks = Array.from({ length: 6 }, (_, i) => Math.round(maxVal * (5 - i) / 5));
    return (
        <View style={styles.chartCard}>
            <Text style={styles.yLabelTextTop}>{yLabel}</Text>
            <View style={styles.chartContent}>
                {/* Y Axis Labels */}
                <View style={styles.yAxis}>
                    {ticks.map((val, index) => (
                        <Text key={index} style={styles.axisText}>{val}</Text>
                    ))}
                </View>
                {/* Chart Bars */}
                <View style={styles.barsContainer}>
                    <View style={styles.gridLines}>
                        {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={styles.gridLine} />)}
                    </View>
                    <View style={styles.barsRow}>
                        {data.map((item, index) => (
                            <View key={index} style={styles.barColumn}>
                                <View style={styles.barShadow}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(item.value / maxVal) * 100}%`,
                                                backgroundColor: item.color
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.xAxisText}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.xAxisLine} />
                </View>
            </View>
        </View>
    );
};

export default function MiProgresoHijo() {
    const router = useRouter();

    const { data, loading, error, reload } = useBackendResource(obtenerProgresoMensual);
    const colors = ['#00AEEF', '#7E22CE', '#FF009B'];
    const points = field => (data || []).map((item, index) => ({
        label: new Date(`${item.mes}-15T12:00:00`).toLocaleDateString('es-MX', { month: 'short' }),
        value: item[field], color: colors[index % colors.length]
    }));
    const cumplimientoData = points('cumplimiento');
    const intensidadData = points('completadas');

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={32} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mi Progreso</Text>
                </View>

                <BackendState loading={loading} error={error} onRetry={reload} />
                {data && <>
                <Text style={styles.sectionTitle}>Cumplimiento</Text>
                <BarChart data={cumplimientoData} yLabel="Porcentaje (%)" percentage />

                <Text style={[styles.sectionTitle, { marginTop: 40 }]}>Intensidad</Text>
                <BarChart data={intensidadData} yLabel="Tareas aprobadas" />
                <Text>Por mes de asignación. Cumplimiento: tareas aprobadas sobre tareas asignadas.</Text>
                </>}

                <View style={{ height: 120 }} />
            </ScrollView>

            <BarraNavegacion activeTab="perfil" userType="hijo" />
        </View>
    );
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
        paddingTop: 40, // Let the headerRow handle most of the top space
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 14,
        marginRight: 20,
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    headerTitle: {
        fontSize: 34,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        letterSpacing: -0.5,
    },
    sectionTitle: {
        fontSize: 24,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        marginBottom: 16,
        marginLeft: 4,
    },
    chartCard: {
        backgroundColor: Colors.white,
        borderRadius: 30,
        padding: 24,
        paddingBottom: 20,
        marginBottom: 35,
        ...Shadows.button,
        shadowOpacity: 0.06,
        elevation: 4,
    },
    yLabelTextTop: {
        fontSize: 15,
        fontFamily: Fonts.figtreebold,
        color: '#7C3AED',
        marginBottom: 20,
        textAlign: 'left',
        opacity: 0.9,
    },
    chartContent: {
        flexDirection: 'row',
        height: 240, // Increased to fit labels properly
    },
    yAxis: {
        justifyContent: 'space-between',
        paddingRight: 15,
        height: 180,
        paddingBottom: 25, // Space for labels alignment
    },
    axisText: {
        fontSize: 12,
        fontFamily: Fonts.figtreeRegular,
        color: '#9CA3AF',
        textAlign: 'right',
        width: 20,
    },
    xAxisText: {
        fontSize: 14,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
        marginTop: 15,
    },
    barsContainer: {
        flex: 1,
        position: 'relative',
    },
    gridLines: {
        position: 'absolute',
        width: '100%',
        height: 180,
        justifyContent: 'space-between',
        zIndex: 1,
    },
    gridLine: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    barsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 180,
        zIndex: 2,
    },
    barColumn: {
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-start',
    },
    barShadow: {
        width: 38,
        height: 180,
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: 14,
    },
    xAxisLine: {
        height: 2,
        backgroundColor: '#F1F5F9',
        marginTop: 0,
    }
});
