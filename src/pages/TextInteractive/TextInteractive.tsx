import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { extractWords } from '../../services/textProcessingService';
import { WordModal } from '../../components/WordModal/WordModal';
import { Word } from '../../components/Word';
import { useWordsMap } from '../../hooks/useWordsMap';
import { TranslationUsageCounter } from '../../components/TranslationUsageCounter/TranslationUsageCounter';
import { useTranslationUsage } from '../../hooks/useTranslationUsage';
import { useActiveText } from '../../hooks/useActiveText';
import { removeActiveText } from '../../services/textService';

import './TextInteractive.css';
import { ContextPhraseModal } from '../../components/ContextPhraseModal/ContextPhraseModal';
import { useWordContexts } from '../../hooks/useWordContexts';
import { useContextLinks } from '../../hooks/useContextLinks';
import { useContexts } from '../../hooks/useContexts';
import {
  analyzeSelectionSignals,
  analyzeWordSignals,
} from '../../services/contextSignalsService';
import {
  buildDictionaryCandidates,
  findDictionaryMatch,
} from '../../services/dictionaryService';
import { normalizeWord } from '../../core/semantic';
import { persistContextLink } from '../../services/contextService';

export function TextInteractive() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    activeText,
    loading: activeTextLoading,
    error: activeTextError,
  } = useActiveText();
  const rawText = state?.text ?? activeText?.rawText ?? '';
  const words = useMemo(() => extractWords(rawText), [rawText]);

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dictionaryMatch, setDictionaryMatch] = useState<string | null>(null);
  function returnHome() {
    navigate('/');
  }
  const {
    wordsMap,
    upsertWord,
    loading: wordsLoading,
    error: wordsError,
  } = useWordsMap(words);
  const {
    contexts,
    upsertContext,
    loading: contextsLoading,
    error: contextsError,
  } = useContexts(words);
  const translationUsage = useTranslationUsage();

  const textId = activeText?.id ?? 'active';
  const {
    links: contextLinks,
    loading: linksLoading,
    error: linksError,
  } = useContextLinks(textId);

  const contextsByIndex = useWordContexts(words, contexts, contextLinks);

  const wordSignals = useMemo(
    () => words.map((_, index) => analyzeWordSignals(words, index)),
    [words],
  );

  const baseSelectionSignals = useMemo(
    () => analyzeSelectionSignals(words, selectedIndexes),
    [words, selectedIndexes],
  );

  const canRenderWords = useMemo(() => {
    return (
      !wordsLoading &&
      !contextsLoading &&
      !wordsError &&
      !contextsError &&
      !activeTextError
    );
  }, [
    activeTextError,
    contextsError,
    contextsLoading,
    wordsError,
    wordsLoading,
  ]);

  useEffect(() => {
    let isActive = true;
    async function loadDictionaryMatch() {
      if (selectedIndexes.length === 0) {
        if (isActive) setDictionaryMatch(null);
        return;
      }
      const candidates = buildDictionaryCandidates(words, selectedIndexes);
      if (candidates.length === 0) {
        if (isActive) setDictionaryMatch(null);
        return;
      }
      const match = await findDictionaryMatch(candidates);
      if (isActive) {
        setDictionaryMatch(match?.term ?? null);
      }
    }
    loadDictionaryMatch();
    return () => {
      isActive = false;
    };
  }, [words, selectedIndexes]);

  const selectionSignals = useMemo(() => {
    if (!dictionaryMatch) return baseSelectionSignals;
    const reasons = [
      ...baseSelectionSignals.reasons,
      `expressão encontrada no dicionário: "${dictionaryMatch}"`,
    ];
    return {
      ...baseSelectionSignals,
      isIdiomaticCandidate: true,
      recommendation: 'context' as const,
      ambiguityScore: Math.max(baseSelectionSignals.ambiguityScore, 3),
      reasons: Array.from(new Set(reasons)),
    };
  }, [baseSelectionSignals, dictionaryMatch]);

  useEffect(() => {
    if (activeTextLoading) return;
    if (!rawText.trim()) {
      navigate('/');
    }
  }, [activeTextLoading, navigate, rawText]);

  function toggleWord(index: number) {
    setSelectedIndexes((prev) => {
      const next = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];

      if (next.length === 0) return [];
      const minIndex = Math.min(...next);
      const maxIndex = Math.max(...next);
      return Array.from(
        { length: maxIndex - minIndex + 1 },
        (_, i) => minIndex + i,
      );
    });
  }

  function resetSelection() {
    setIsModalOpen(false);
    setSelectedIndexes([]);
  }

  async function handleFinishText() {
    await removeActiveText();
    navigate('/');
  }

  const selectedWords = selectedIndexes
    .sort((a, b) => a - b)
    .map((i) => words[i]);
  return (
    <div className="page">
      <div className="text-interactive">
        <div className="text-interactive__header">
          <button
            className="text-interactive__button back-button"
            onClick={returnHome}
          >
            Voltar
          </button>
          <TranslationUsageCounter totalChars={translationUsage} />
        </div>
        {(wordsLoading || contextsLoading || linksLoading) && (
          <p className="text-interactive__status text-interactive__status--loading">
            <span className="spinner" />
            Carregando dados salvos…
          </p>
        )}
        {(wordsError || contextsError || activeTextError || linksError) && (
          <p className="text-interactive__status text-interactive__status--error">
            Falha ao carregar dados salvos.
          </p>
        )}

        {canRenderWords && (
          <>
            <div className="text-interactive__words">
              {words.map((word, index) => {
                const key = word.toLowerCase();
                const signal = wordSignals[index];
                return (
                  <Word
                    key={`${word}-${index}`}
                    text={word}
                    status={wordsMap[key]?.status}
                    isSelected={selectedIndexes.includes(index)}
                    contextId={contextsByIndex[index] ?? ''}
                    contextRecommendation={signal?.recommendation === 'context'}
                    onClick={() => toggleWord(index)}
                  />
                );
              })}
            </div>

            <div className="text-interactive__footer">
              <button
                className="text-interactive__finish"
                onClick={handleFinishText}
                disabled={!activeText}
              >
                Concluir texto
              </button>

              <button
                className="text-interactive__button__translate-button"
                disabled={selectedIndexes.length === 0}
                onClick={() => setIsModalOpen(true)}
              >
                Traduzir seleção
              </button>
            </div>
          </>
        )}

        {isModalOpen &&
          (selectedIndexes.length === 1 ? (
            <WordModal
              word={selectedWords[0]}
              onClose={resetSelection}
              onSaved={upsertWord}
              signals={selectionSignals}
            />
          ) : (
            <ContextPhraseModal
              phrase={selectedWords}
              wordIndexes={selectedIndexes}
              onClose={resetSelection}
              contextPhaseId={contextsByIndex[selectedIndexes[0]]}
              signals={selectionSignals}
              onSaved={async ({ context }) => {
                upsertContext(context);
                await persistContextLink({
                  textId,
                  contextId: context.id,
                  wordIndexes: selectedIndexes,
                  normalizedTokens: selectedWords
                    .filter((token) => /[\p{L}\p{M}]/u.test(token))
                    .map((token) => normalizeWord(token)),
                  tokenCount: selectedWords.length,
                  updatedAt: Date.now(),
                });
              }}
            />
          ))}
      </div>
    </div>
  );
}
