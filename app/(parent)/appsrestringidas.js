import BackendState from '../../components/BackendState';
import { useBackendResource } from '../../hooks/useBackendResource';
import { obtenerCatalogoApps } from '../../services/api';
import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from "react";
import { usePoliciesViewModel } from '../../viewmodels/usePoliciesViewModel';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarraNavegacion from "../../components/BarraNavegacion";
import { Colors, Fonts, Shadows } from "../../styles/globalStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AppsRestringidas() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const childId = params.childId;
    
    const { policy, fetchPolicy, updatePolicy, error, loading } = usePoliciesViewModel();
    const { data: catalogo, loading: loadingCatalogo, error: errorCatalogo, reload } = useBackendResource(obtenerCatalogoApps, 'parent');
    const [apps, setApps] = useState([]);
    const [saving, setSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (childId) {
                fetchPolicy(childId);
            }
        }, [childId])
    );

    useEffect(() => {
        if (catalogo && policy?.restricted_apps) {
            const restrictedIds = Array.isArray(policy.restricted_apps) ? policy.restricted_apps : [];
            setApps(catalogo.map(app => ({
                ...app,
                restricted: restrictedIds.includes(app.id)
            })));
        }
    }, [policy, catalogo]);

    const handleBackPress = () => router.back();

    const toggleRestriction = async (id) => {
        if (saving || !policy) return;
        setSaving(true);
        const appToToggle = apps.find(a => a.id === id);
        if(!appToToggle) { setSaving(false); return; }
        
        const newRestrictedState = !appToToggle.restricted;
        
        setApps(prev => prev.map(app =>
            app.id === id ? { ...app, restricted: newRestrictedState } : app
        ));
        
        let currentRestricted = apps.filter(a => a.restricted).map(a => a.id);
        if (newRestrictedState) {
             if(!currentRestricted.includes(id)) currentRestricted.push(id);
        } else {
             currentRestricted = currentRestricted.filter(aId => aId !== id);
        }

        try {
             await updatePolicy(childId, {
                  restricted_apps: currentRestricted
             });
        } catch (e) {
             Alert.alert("No se pudo guardar", e.message);
             // Rollback
             setApps(prev => prev.map(app =>
                 app.id === id ? { ...app, restricted: !newRestrictedState } : app
             ));
        } finally { setSaving(false); }
    };

    const renderAppItem = (app) => (
        <View key={app.id} style={styles.appItem}>
            <View style={styles.appInfo}>
                <View style={[styles.iconWrapper, { backgroundColor: app.color }]}>
                    <Ionicons name="apps" size={20} color="#7E22CE" />
                </View>
                <Text style={styles.appName}>{app.name}</Text>
            </View>

            <TouchableOpacity
                style={[styles.statusButton, app.restricted ? styles.btnRestricted : styles.btnRestrict]}
                disabled={saving || loading}
                onPress={() => toggleRestriction(app.id)}
            >
                <Text style={styles.btnText}>
                    {app.restricted ? 'Restringida' : 'Restringir'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const categories = [...new Set((catalogo || []).map(app => app.category))];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={32} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Apps restringidas</Text>
                <View style={styles.lockIconContainer}>
                    <AntDesign name="lock" size={24} color="white" />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <BackendState loading={loading || loadingCatalogo} error={error || errorCatalogo || (!childId ? 'Selecciona un hijo' : null)} onRetry={() => { reload(); fetchPolicy(childId); }} />
                <View style={styles.mainCard}>
                    {categories.map(category => (
                        <View key={category} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{category}</Text>
                            {apps.filter(app => app.category === category).map(renderAppItem)}
                        </View>
                    ))}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <BarraNavegacion activeTab="inicio" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SCREEN_HEIGHT * 0.08,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: SCREEN_WIDTH * 0.07,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
        flex: 1,
    },
    lockIconContainer: {
        backgroundColor: '#FF0032',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FACC15',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    mainCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    categorySection: {
        marginBottom: 25,
    },
    categoryTitle: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 15,
    },
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    appInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        fontSize: 16,
        fontFamily: Fonts.figtreeRegular,
        color: '#4B5563',
    },
    statusButton: {
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 10,
        minWidth: 100,
        alignItems: 'center',
    },
    btnRestricted: {
        backgroundColor: '#FF5E5E',
    },
    btnRestrict: {
        backgroundColor: '#9CA3AF',
    },
    btnText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: Fonts.figtreebold,
        fontWeight: 'bold',
    },
});
