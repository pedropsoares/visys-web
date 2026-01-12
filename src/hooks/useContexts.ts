import { useCallback, useEffect, useState } from 'react';
import { fetchAllContexts } from '../services/contextService';
import type { ContextPhrase } from '../domain/entities';

export function useContexts() {
  const [contexts, setContexts] = useState<ContextPhrase[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllContexts();
      setContexts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsertContext = useCallback((context: ContextPhrase) => {
    setContexts((prev) => {
      const index = prev.findIndex((item) => item.id === context.id);
      if (index === -1) return [...prev, context];
      const updated = [...prev];
      updated[index] = context;
      return updated;
    });
  }, []);

  return { contexts, refresh, loading, upsertContext };
}
