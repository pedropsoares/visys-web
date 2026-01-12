import { useState } from 'react';
import { translateText } from '../../services/deeplService';
import { addTranslationUsage } from '../../services/translationUsageService';

import './TranslationButton.css';

interface Props {
  text: string;
  className?: string;
  label?: string;
  onTranslated?: (translated: string) => void;
  onUsageChange?: (totalChars: number) => void;
  disabled?: boolean;
}

export function TranslationButton({
  text,
  className,
  label = 'Tradução',
  onTranslated,
  onUsageChange,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const hasText = Boolean(text.trim());
  const isDisabled = disabled || !hasText;

  async function handleTranslate() {
    if (isDisabled || loading) return;
    setLoading(true);
    try {
      const result = await translateText(text);
      const total = addTranslationUsage(text.length);
      if (result.text) {
        onTranslated?.(result.text);
      }
      onUsageChange?.(total);
    } catch (error) {
      console.error('translateText failed', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={['translate-button', className].filter(Boolean).join(' ')}
      onClick={handleTranslate}
      disabled={isDisabled || loading}
    >
      {loading ? 'Traduzindo…' : label}
    </button>
  );
}
