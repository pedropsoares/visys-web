interface Props {
  totalChars: number;
  className?: string;
}

export function TranslationUsageCounter({ totalChars, className }: Props) {
  return (
    <p className={className}>
      Uso de caracteres (30 dias): {totalChars.toLocaleString('pt-BR')}
    </p>
  );
}
