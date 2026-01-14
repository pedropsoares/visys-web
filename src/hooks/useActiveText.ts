import { useEffect, useState } from 'react';
import type { TextEntry } from '../domain/entities';
import { fetchActiveText } from '../services/textService';

export function useActiveText() {
  const [activeText, setActiveText] = useState<TextEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchActiveText()
      .then((text) => {
        if (mounted) setActiveText(text);
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load text'));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { activeText, loading, error, setActiveText };
}
