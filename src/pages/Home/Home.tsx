import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/TextInput';
import { StatsSummary } from '../../components/StatsSummary/StatsSummary';
import { useWordStats } from '../../hooks/useWordStats';

import './Home.css';

export function Home() {
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const stats = useWordStats();

  function handleSubmit() {
    if (!text.trim()) return;
    navigate('/text', { state: { text } });
  }

  return (
    <div className="page">
      <div className="title">
        <h1>Visys</h1>
        <h3>Vocabulary Intelligence System</h3>
      </div>

      <StatsSummary learned={stats.learned} learning={stats.learning} />

      <TextInput value={text} onChange={setText} />

      <button onClick={handleSubmit}>Analisar texto</button>
    </div>
  );
}


;