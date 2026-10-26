import { useState, useCallback } from 'react';
import { PoliciesRepository } from '../repositories/PoliciesRepository';
import { AuthRepository } from '../repositories/AuthRepository';

export function usePoliciesViewModel() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPolicy = useCallback(async (childId) => {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error("No token");

      const data = await PoliciesRepository.getPolicy(token, childId);
      setPolicy(data);
    } catch (err) {
      setPolicy(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicy = async (childId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthRepository.getParentToken();
      if (!token) throw new Error("No token");

      const data = await PoliciesRepository.updatePolicy(token, childId, payload);
      setPolicy(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { policy, loading, error, fetchPolicy, updatePolicy };
}
