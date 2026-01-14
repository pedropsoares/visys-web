import { useEffect, useCallback, useState } from 'react';
import { WordStatus } from '../../domain/enums';
import { fetchWord, persistWord } from '../../services/wordService';
import type { Word } from '../../domain/entities';
import type { ContextSignals } from '../../services/contextSignalsService';
import { TranslationButton } from '../TranslationButton/TranslationButton';
import { ReasonList } from '../ReasonList/ReasonList';
import { TranslationUsageCounter } from '../TranslationUsageCounter/TranslationUsageCounter';
import { getTranslationUsage } from '../../services/translationUsageService';

import './WordModal.css';

interface Props {
  word: string;
  signals?: ContextSignals;
  onClose: () => void;
  onSaved: (word: Word) => void;
}

export function WordModal({ word, signals, onClose, onSaved }: Props) {
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(true);
  const [usageTotal, setUsageTotal] = useState(() => getTranslationUsage());
  const [translateError, setTranslateError] = useState<string | null>(null);
  const hasSavedTranslation = Boolean(translation.trim());

  const load = useCallback(async () => {
    try {
      const existing = await fetchWord(word);
      setTranslation(existing?.translation ?? '');
    } finally {
      setLoading(false);
    }
  }, [word]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(status: WordStatus) {
    const data: Word = {
      text: word,
      translation: translation.trim(),
      status,
      updatedAt: Date.now(),
    };
    await persistWord(data);
    onSaved(data);
    onClose();
  }

  return (
    <div className="word-modal__overlay" onClick={onClose}>
      <div className="word-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="word-modal__title">{word}</h3>

        {signals && signals.reasons.length > 0 && (
          <div className="word-modal__context-alert">
            <p className="word-modal__context-title">
              Contexto recomendado
            </p>
            <ReasonList
              reasons={signals.reasons}
              className="word-modal__context-reasons"
            />
          </div>
        )}

        <TranslationButton
          text={word}
          className="word-modal__translate"
          onTranslated={(value) => {
            setTranslateError(null);
            setTranslation(value);
          }}
          onUsageChange={setUsageTotal}
          onError={() => setTranslateError('Falha ao traduzir. Tente novamente.')}
          disabled={hasSavedTranslation}
        />

        {translateError && (
          <p className="word-modal__error">{translateError}</p>
        )}

        <TranslationUsageCounter
          totalChars={usageTotal}
          className="word-modal__usage"
        />

        {loading ? (
          <p className="word-modal__loading">Loading…</p>
        ) : (
          <textarea
            className="word-modal__input"
            placeholder="Write the meaning in your own words…"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            rows={3}
          />
        )}

        <div className="word-modal__status-group">
          <button
            className="word-modal__status-group-button"
            onClick={() => handleSave(WordStatus.NOT_LEARNED)}
          >
            <span className="word-modal__status-dot word-modal__status-dot--not-learned" />
            Não aprendida
          </button>
          <button
            className="word-modal__status-group-button"
            onClick={() => handleSave(WordStatus.LEARNING)}
          >
            <span className="word-modal__status-dot word-modal__status-dot--learning" />
            Aprendendo
          </button>
          <button
            className="word-modal__status-group-button"
            onClick={() => handleSave(WordStatus.LEARNED)}
          >
            <span className="word-modal__status-dot word-modal__status-dot--learned" />
            Aprendida
          </button>
        </div>

        <button className="word-modal__close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
