import { useEffect, useState } from 'react';
import { WordStatus } from '../../domain/enums';

import './ContextPhraseModal.css';
import type { ContextPhrase } from '../../domain/entities';
import { getContext, saveContextPhrase } from '../../storage/contextRepository';
import { WordInPhrase } from '../WordInPhrase/WordInPhrase';

export type ContextPhraseResult = {
  contextId: string;
  wordIndexes: number[];
};

interface Props {
  phrase: string[];
  wordIndexes: number[];
  contextPhaseId: string;
  onClose: () => void;
  onSaved: (result: ContextPhraseResult) => void;
}

function normalizePhrase(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s']/gu, '');
}

function hash(text: string): string {
  return btoa(text).replace(/=+/g, '').slice(0, 16);
}

export function ContextPhraseModal({
  phrase,
  wordIndexes,
  contextPhaseId,
  onClose,
  onSaved,
}: Props) {
  const [translation, setTranslation] = useState<string | null>('');

  useEffect(() => {
    if (!contextPhaseId) return;
    async function loadContext() {
      const context = await getContext(contextPhaseId);
      setTranslation(context?.translation ?? '');
    }
    loadContext();
  }, [contextPhaseId]);

  async function handleSave(status: WordStatus) {
    const text = phrase.join(' ');
    const normalized = normalizePhrase(text);
    const id = `ctx_${hash(normalized)}`;

    const data: ContextPhrase = {
      id,
      text,
      tokens: phrase,
      translation: translation?.trim() ?? '',
      status,
      normalizedText: normalized,
      tokenCount: phrase.length,
    };
    await saveContextPhrase(data);


    onSaved({
      contextId: id,
      wordIndexes,
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
            🔴
          </button>
          <button
            className="phrase-modal__status-group-button"
            onClick={() => handleSave(WordStatus.LEARNING)}
          >
            🟡
          </button>
          <button
            className="phrase-modal__status-group-button"
            onClick={() => handleSave(WordStatus.LEARNED)}
          >
            🟢
          </button>
        </div>

        <button className="phrase-modal__close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
