import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/TextInput';
import { StatsSummary } from '../../components/StatsSummary/StatsSummary';
import { useWordStats } from '../../hooks/useWordStats';
import { TranslationUsageCounter } from '../../components/TranslationUsageCounter/TranslationUsageCounter';
import { useTranslationUsage } from '../../hooks/useTranslationUsage';
import { useActiveText } from '../../hooks/useActiveText';
import { persistActiveText } from '../../services/textService';

import './Home.css';

export function Home() {
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const stats = useWordStats();
  const translationUsage = useTranslationUsage();
  const { activeText, loading, error: activeTextError } = useActiveText();

  function handleSubmit() {
    if (!text.trim()) return;
    persistActiveText(text).then(() => {
      navigate('/text', { state: { text } });
    });
  }

  return (
    <div className="page">
      <div className="title">
        <h1>Visys</h1>
        <h3>Vocabulary Intelligence System</h3>
      </div>

      <StatsSummary learned={stats.learned} learning={stats.learning} />
      {stats.loading && (
        <p className="home__status home__status--loading">
          <span className="spinner" />
          Carregando estatísticas…
        </p>
      )}
      {stats.error && (
        <p className="home__status home__status--error">
          Falha ao carregar estatísticas.
        </p>
      )}

      <TranslationUsageCounter totalChars={translationUsage} />

      {activeText && (
        <div className="home__active-text">
          <p className="home__active-text-title">
            Você tem um texto em andamento
          </p>
          <p className="home__active-text-preview">
            {activeText.rawText.slice(0, 180)}
            {activeText.rawText.length > 180 ? '…' : ''}
          </p>
          <button
            className="home__active-text-button"
            onClick={() =>
              navigate('/text', { state: { text: activeText.rawText } })
            }
          >
            Continuar texto
          </button>
        </div>
      )}
      {activeTextError && (
        <p className="home__status home__status--error">
          Falha ao carregar texto em andamento.
        </p>
      )}

      <TextInput
        value={text}
        onChange={setText}
        disabled={Boolean(activeText)}
      />

      <button onClick={handleSubmit} disabled={Boolean(activeText) || loading}>
        Analisar texto
      </button>
    </div>
  );
}


;
