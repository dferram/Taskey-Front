import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AuthRepository } from '../repositories/AuthRepository';

export function useBackendResource(fetcher, role = 'child') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true); setError(null);
    try {
      const token = await (role === 'child' ? AuthRepository.getChildToken() : AuthRepository.getParentToken());
      if (!token) throw new Error('Inicia sesión para continuar');
      const result = await fetcher(token);
      if (request === sequence.current) setData(result);
    } catch (err) {
      if (request === sequence.current) { setData(null); setError(err.message || 'No se pudo conectar con el servidor'); }
    } finally { if (request === sequence.current) setLoading(false); }
  }, [fetcher, role]);
  useFocusEffect(useCallback(() => { reload(); return () => { sequence.current += 1; }; }, [reload]));
  return { data, loading, error, reload };
}
