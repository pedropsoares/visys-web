import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchContextsByTokens } from '../services/contextService';
import type { ContextPhrase } from '../domain/entities';
import { normalizeWord } from '../core/semantic';

function isWordToken(token: string): boolean {
  return /[\p{L}\p{M}]/u.test(token);
}

export function useContexts(tokens: string[] = []) {
  const [contexts, setContexts] = useState<ContextPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const normalizedTokens = useMemo(() => {
    if (!tokens.length) return [];
    return Array.from(
      new Set(
        tokens.filter(isWordToken).map((token) => normalizeWord(token)),
      ),
    );
  }, [tokens]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (normalizedTokens.length === 0) {
        setContexts([]);
        return;
      }
      const data = await fetchContextsByTokens(normalizedTokens);
      setContexts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load contexts'));
    } finally {
      setLoading(false);
    }
  }, [normalizedTokens]);

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

  return { contexts, refresh, loading, error, upsertContext };
}
