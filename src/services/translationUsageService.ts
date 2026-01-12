type UsageState = {
  totalChars: number;
  startedAt: number;
};

const STORAGE_KEY = 'visys_translation_usage';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const TRANSLATION_USAGE_EVENT = 'translation-usage-updated';

function isExpired(startedAt: number) {
  return Date.now() - startedAt > TTL_MS;
}

function readState(): UsageState {
  if (typeof window === 'undefined') {
    return { totalChars: 0, startedAt: Date.now() };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { totalChars: 0, startedAt: Date.now() };
    }
    const parsed = JSON.parse(raw) as UsageState;
    if (!parsed.startedAt || isExpired(parsed.startedAt)) {
      return { totalChars: 0, startedAt: Date.now() };
    }
    return parsed;
  } catch {
    return { totalChars: 0, startedAt: Date.now() };
  }
}

function writeState(state: UsageState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent(TRANSLATION_USAGE_EVENT, { detail: state.totalChars }),
    );
  } catch {
    // ignore storage errors
  }
}

export function getTranslationUsage(): number {
  return readState().totalChars;
}

export function addTranslationUsage(chars: number): number {
  const safeChars = Math.max(0, Math.floor(chars));
  const current = readState();
  const updated = {
    startedAt: current.startedAt,
    totalChars: current.totalChars + safeChars,
  };
  writeState(updated);
  return updated.totalChars;
}
