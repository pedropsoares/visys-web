import { useEffect, useState } from 'react';
import { WordStatus } from '../../domain/enums';

import './ContextPhraseModal.css';
import type { ContextPhrase } from '../../domain/entities';
import {
  fetchContext,
  persistContextPhrase,
} from '../../services/contextService';
import { WordInPhrase } from '../WordInPhrase/WordInPhrase';
import type { ContextSignals } from '../../services/contextSignalsService';
import { buildContextId, normalizeContext } from '../../core/semantic';
import { TranslationButton } from '../TranslationButton/TranslationButton';
import { ReasonList } from '../ReasonList/ReasonList';
import { TranslationUsageCounter } from '../TranslationUsageCounter/TranslationUsageCounter';
import { getTranslationUsage } from '../../services/translationUsageService';

export type ContextPhraseResult = {
  contextId: string;
  wordIndexes: number[];
  context: ContextPhrase;
};

interface Props {
  phrase: string[];
  wordIndexes: number[];
  contextPhaseId: string;
  signals?: ContextSignals;
  onClose: () => void;
  onSaved: (result: ContextPhraseResult) => void;
}

export function ContextPhraseModal({
  phrase,
  wordIndexes,
  contextPhaseId,
  signals,
  onClose,
  onSaved,
}: Props) {
  const [translation, setTranslation] = useState<string | null>('');
  const [usageTotal, setUsageTotal] = useState(() => getTranslationUsage());
  const hasSavedTranslation = Boolean(translation?.trim());

  const phraseText = phrase.join(' ');

  useEffect(() => {
    if (!contextPhaseId) return;
    async function loadContext() {
      const context = await fetchContext(contextPhaseId);
      setTranslation(context?.translation ?? '');
    }
    loadContext();
  }, [contextPhaseId]);

  async function handleSave(status: WordStatus) {
    const text = phrase.join(' ');
    const normalized = normalizeContext(text);
    const id = buildContextId(normalized);

    const data: ContextPhrase = {
      id,
      text,
      tokens: phrase,
      translation: translation?.trim() ?? '',
      status,
      normalizedText: normalized,
      tokenCount: phrase.length,
    };
    await persistContextPhrase(data);

    onSaved({
      contextId: id,
      wordIndexes,
      context: data,
    });

    onClose();
  }

  return (
    <div className="phrase-modal__overlay" onClick={onClose}>
      <div className="phrase-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phrase-container">
          {phrase.map((word, index) => (
            <WordInPhrase key={`${word}-${index}`} word={word} />
          ))}
        </div>

        <TranslationButton
          text={phraseText}
          className="phrase-modal__translate"
          onTranslated={setTranslation}
          onUsageChange={setUsageTotal}
          disabled={hasSavedTranslation}
        />

        <TranslationUsageCounter
          totalChars={usageTotal}
          className="phrase-modal__usage"
        />

        {signals && signals.reasons.length > 0 && (
          <div className="phrase-modal__context-alert">
            <p className="phrase-modal__context-title">
              Contexto recomendado
            </p>
            <ReasonList
              reasons={signals.reasons}
              className="phrase-modal__context-reasons"
            />
          </div>
        )}

        {translation === null ? (
          <p className="phrase-modal__loading">Loading…</p>
        ) : (
          <textarea
            className="phrase-modal__input"
            placeholder="Write the meaning in your own words…"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            rows={3}
          />
        )}

        <div className="phrase-modal__status-group">
          <button
            className="phrase-modal__status-group-button"
            onClick={() => handleSave(WordStatus.NOT_LEARNED)}
          >
            <span className="phrase-modal__status-dot phrase-modal__status-dot--not-learned" />
            Não aprendida
          </button>
          <button
            className="phrase-modal__status-group-button"
            onClick={() => handleSave(WordStatus.LEARNING)}
          >
            <span className="phrase-modal__status-dot phrase-modal__status-dot--learning" />
            Aprendendo
          </button>
          <button
            className="phrase-modal__status-group-button"
            onClick={() => handleSave(WordStatus.LEARNED)}
          >
            <span className="phrase-modal__status-dot phrase-modal__status-dot--learned" />
            Aprendida
          </button>
        </div>

        <button className="phrase-modal__close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
