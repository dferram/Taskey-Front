import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
export default function BackendState({ loading, error, onRetry }) {
  if (!loading && !error) return null;
  return <View style={{ padding: 24, alignItems: 'center' }}>
    {loading ? <ActivityIndicator color="#7E22CE" /> : <>
      <Text accessibilityRole="alert" style={{ color: '#B91C1C', textAlign: 'center' }}>{error}</Text>
      <TouchableOpacity onPress={onRetry} style={{ padding: 12 }}><Text>Reintentar</Text></TouchableOpacity>
    </>}
  </View>;
}
