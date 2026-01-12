interface Props {
  reasons: string[];
  className?: string;
}

function renderReason(reason: string) {
  const separatorIndex = reason.indexOf(': ');
  if (separatorIndex === -1) {
    return reason;
  }
  const label = reason.slice(0, separatorIndex);
  const detail = reason.slice(separatorIndex + 2);
  return (
    <>
      <strong>{label}</strong>: {detail}
    </>
  );
}

export function ReasonList({ reasons, className }: Props) {
  return (
    <ul className={className}>
      {reasons.map((reason) => (
        <li key={reason}>{renderReason(reason)}</li>
      ))}
    </ul>
  );
}
