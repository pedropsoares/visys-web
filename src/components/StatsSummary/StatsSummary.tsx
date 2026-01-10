interface Props {
  learned: number;
  learning: number;
}

import './StatsSummary.css'

export function StatsSummary({ learned, learning }: Props) {
  return (
    <div className="stats-summary">
      <span className="stats-summary__item stats-summary__item--learned">Aprendidas {learned}</span>
      <span className="stats-summary__item stats-summary__item--learning">Em aprendizado {learning}</span>
    </div>
  );
}
