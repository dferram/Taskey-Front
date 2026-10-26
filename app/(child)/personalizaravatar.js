import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BarraNavegacion from '../../components/BarraNavegacion';
import BackendState from '../../components/BackendState';
import { useBackendResource } from '../../hooks/useBackendResource';
import { Colors, Fonts, Shadows } from '../../styles/globalStyles';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { obtenerAvatares, obtenerResumenHijo, guardarAvatar } from '../../services/api';
import { AuthRepository } from '../../repositories/AuthRepository';
import { avatarImage } from '../../constants/avatars';
const fetchAvatar = async token => {
  const [catalogo, resumen] = await Promise.all([obtenerAvatares(token), obtenerResumenHijo(token)]);
  return { catalogo, perfil: resumen.perfil };
};
export default function PersonalizarAvatar() {
  const router = useRouter();
  const { data, loading, error, reload } = useBackendResource(fetchAvatar);
  const [saving, setSaving] = useState(false);
  const selectAvatar = async id => {
    setSaving(true);
    try {
      const token = await AuthRepository.getChildToken();
      await guardarAvatar(token, id);
      await reload();
    } catch (err) { Alert.alert('No se pudo guardar', err.message); }
    finally { setSaving(false); }
  };
  return <View style={styles.container}>
    <View style={styles.previewSection}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="chevron-back" size={32} /></TouchableOpacity>
        {data && <Text style={styles.keyText}>{data.perfil.llaves_disponibles} llaves</Text>}
      </View>
      <BackendState loading={loading} error={error} onRetry={reload} />
      {data && <View style={styles.avatarContainer}><Image source={avatarImage(data.perfil.avatar_id)} style={styles.avatarImage} resizeMode="contain" /></View>}
    </View>
    {data && <View style={styles.shopSection}>
      <Text style={{ fontSize: 22, padding: 16 }}>Elige tu avatar</Text>
      <Text style={{ paddingHorizontal: 16 }}>Avatares disponibles sin costo</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 16 }}>
        {data.catalogo.map(item => <TouchableOpacity key={item.id} disabled={saving} onPress={() => selectAvatar(item.id)} accessibilityLabel={`Elegir ${item.nombre}`}
          style={{ width: '48%', padding: 12, borderWidth: data.perfil.avatar_id === item.id ? 3 : 1, borderColor: '#7E22CE', borderRadius: 16, margin: '1%' }}>
          <Image source={avatarImage(item.id)} style={{ width: 80, height: 80, alignSelf: 'center' }} resizeMode="contain" />
          <Text style={{ textAlign: 'center' }}>{item.nombre}</Text>
        </TouchableOpacity>)}
      </View>
      {saving && <Text style={{ textAlign: 'center' }}>Guardando…</Text>}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5E7EB', // Fondo gris claro para el preview
    },
    previewSection: {
        height: SCREEN_HEIGHT * 0.5,
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 5,
    },
    keyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF9C3', // Amarillo suave
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 15,
        ...Shadows.button,
        shadowOpacity: 0.1,
    },
    keyIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    keyText: {
        fontSize: 18,
        fontFamily: Fonts.figtreebold,
        color: Colors.black,
    },
    avatarContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: '80%',
        height: '80%',
    },
    shopSection: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 0, // Recto como en la imagen? No, parece redondeado pero muy suave
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    categoriesBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoryBtn: {
        padding: 10,
        borderRadius: 15,
    },
    activeCategory: {
        backgroundColor: '#F3F4F6',
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 20,
    },
    gridItem: {
        width: '33.33%',
        aspectRatio: 1,
        padding: 10,
    },
    itemBox: {
        flex: 1,
        backgroundColor: '#D1D5DB', // Gris para los placeholders
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    lockedBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: Colors.white,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.button,
    },
    lockedText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontFamily: Fonts.figtreebold,
    }
});
