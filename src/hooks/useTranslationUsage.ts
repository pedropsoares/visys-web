import { useEffect, useState } from 'react';
import {
  getTranslationUsage,
  TRANSLATION_USAGE_EVENT,
} from '../services/translationUsageService';

export function useTranslationUsage() {
  const [totalChars, setTotalChars] = useState(() => getTranslationUsage());

  useEffect(() => {
    function handleUsageUpdate(event: Event) {
      if (event instanceof CustomEvent) {
        setTotalChars(Number(event.detail) || 0);
        return;
      }
      setTotalChars(getTranslationUsage());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === 'visys_translation_usage') {
        setTotalChars(getTranslationUsage());
      }
    }

    window.addEventListener(TRANSLATION_USAGE_EVENT, handleUsageUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(TRANSLATION_USAGE_EVENT, handleUsageUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return totalChars;
}
