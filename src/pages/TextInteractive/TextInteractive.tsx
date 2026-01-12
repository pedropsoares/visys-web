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
import { useContexts } from '../../hooks/useContexts';
import {
  analyzeSelectionSignals,
  analyzeWordSignals,
} from '../../services/contextSignalsService';
import {
  buildDictionaryCandidates,
  findDictionaryMatch,
} from '../../services/dictionaryService';

export function TextInteractive() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { activeText } = useActiveText();
  const rawText = state?.text ?? activeText?.rawText ?? '';
  const words = extractWords(rawText);

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dictionaryMatch, setDictionaryMatch] = useState<string | null>(null);
  function returnHome() {
    navigate('/');
  }
  const { wordsMap, upsertWord } = useWordsMap();
  const { contexts, refresh, upsertContext } = useContexts();
  const translationUsage = useTranslationUsage();

  const contextsByIndex = useWordContexts(words, contexts);

  const wordSignals = useMemo(
    () => words.map((_, index) => analyzeWordSignals(words, index)),
    [words],
  );

  const baseSelectionSignals = useMemo(
    () => analyzeSelectionSignals(words, selectedIndexes),
    [words, selectedIndexes],
  );

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
    if (!rawText.trim()) {
      navigate('/');
    }
  }, [navigate, rawText]);

  function handlesSeletionIndex(index: number, SelectedIndexes: number[]) {
    const lastSelected = SelectedIndexes[SelectedIndexes.length - 1];

    return Math.abs(index - lastSelected) > 1;
  }

  function toggleWord(index: number) {
    setSelectedIndexes((prev) => {
      if (handlesSeletionIndex(index, prev)) return prev;

      return prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];
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
              onSaved={({ context }) => {
                upsertContext(context);
                refresh();
              }}
            />
          ))}
      </div>
    </div>
  );
}
