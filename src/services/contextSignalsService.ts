type PosGuess = 'noun' | 'verb' | 'adj' | 'adv' | 'unknown';

export type ContextSignals = {
  posGuess: PosGuess;
  ambiguityScore: number;
  isCandidatePhrasalVerb: boolean;
  isIdiomaticCandidate: boolean;
  recommendation: 'word' | 'context';
  reasons: string[];
};

const ARTICLES = new Set(['a', 'an', 'the']);
const TO_MARKER = new Set(['to']);
const ADJ_ADV_MODIFIERS = new Set(['very', 'so', 'too']);
const PREPOSITIONS = new Set(['of', 'to', 'for', 'with']);
const PARTICLES = new Set([
  'up',
  'down',
  'out',
  'in',
  'on',
  'off',
  'over',
  'away',
  'back',
  'through',
]);

const SUFFIX_HINTS: Array<{ suffix: string; pos: PosGuess; reason: string }> = [
  { suffix: 'ly', pos: 'adv', reason: "termina com '-ly'" },
  { suffix: 'ing', pos: 'verb', reason: "termina com '-ing'" },
  { suffix: 'ed', pos: 'verb', reason: "termina com '-ed'" },
  { suffix: 'tion', pos: 'noun', reason: "termina com '-tion'" },
  { suffix: 'ment', pos: 'noun', reason: "termina com '-ment'" },
  { suffix: 'ous', pos: 'adj', reason: "termina com '-ous'" },
  { suffix: 'able', pos: 'adj', reason: "termina com '-able'" },
];

function isWordToken(token: string): boolean {
  return /[\p{L}\p{M}]/u.test(token);
}

function isPunctuation(token: string): boolean {
  return /^[\p{P}\p{S}]+$/u.test(token);
}

function normalizeToken(token: string): string {
  return token.toLowerCase();
}

function getPrevWord(tokens: string[], index: number): string | null {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (isWordToken(tokens[i])) return tokens[i];
  }
  return null;
}

function getNextWord(tokens: string[], index: number): string | null {
  for (let i = index + 1; i < tokens.length; i += 1) {
    if (isWordToken(tokens[i])) return tokens[i];
  }
  return null;
}

function getNextNextWord(tokens: string[], index: number): string | null {
  let foundNext = false;
  for (let i = index + 1; i < tokens.length; i += 1) {
    if (!isWordToken(tokens[i])) continue;
    if (!foundNext) {
      foundNext = true;
      continue;
    }
    return tokens[i];
  }
  return null;
}

function uniqueReasons(reasons: string[]): string[] {
  return Array.from(new Set(reasons));
}

export function analyzeWordSignals(
  tokens: string[],
  index: number,
): ContextSignals {
  const token = tokens[index];
  if (!token || isPunctuation(token)) {
    return {
      posGuess: 'unknown',
      ambiguityScore: 0,
      isCandidatePhrasalVerb: false,
      isIdiomaticCandidate: false,
      recommendation: 'word',
      reasons: [],
    };
  }

  const lower = normalizeToken(token);
  const reasons: string[] = [];
  const posHints = new Set<PosGuess>();

  const isSentenceInitial =
    index === 0 && token[0] && token[0] === token[0].toUpperCase();
  if (isSentenceInitial) {
    reasons.push('capitalização no início da frase');
  }

  for (const hint of SUFFIX_HINTS) {
    if (lower.length > hint.suffix.length + 1 && lower.endsWith(hint.suffix)) {
      posHints.add(hint.pos);
      reasons.push(hint.reason);
      break;
    }
  }

  const prevWord = getPrevWord(tokens, index);
  const prevLower = prevWord ? normalizeToken(prevWord) : null;

  if (prevLower && ARTICLES.has(prevLower)) {
    posHints.add('noun');
    reasons.push(`aparece após o artigo "${prevLower}"`);
  }

  if (prevLower && TO_MARKER.has(prevLower)) {
    posHints.add('verb');
    reasons.push('aparece após "to"');
  }

  if (prevLower && ADJ_ADV_MODIFIERS.has(prevLower)) {
    posHints.add('adj');
    posHints.add('adv');
    reasons.push(`aparece após "${prevLower}"`);
  }

  const nextWord = getNextWord(tokens, index);
  const nextLower = nextWord ? normalizeToken(nextWord) : null;

  let isCandidatePhrasalVerb = false;
  let isIdiomaticCandidate = false;

  if (nextLower && PARTICLES.has(nextLower)) {
    isCandidatePhrasalVerb = true;
    reasons.push(`seguido pela partícula "${nextLower}"`);
  }

  const nextNextWord = getNextNextWord(tokens, index);
  const nextNextLower = nextNextWord ? normalizeToken(nextNextWord) : null;
  if (
    nextNextLower &&
    PARTICLES.has(nextNextLower) &&
    nextLower &&
    !PARTICLES.has(nextLower)
  ) {
    isCandidatePhrasalVerb = true;
    reasons.push(
      `padrão separável (verbo + objeto + "${nextNextLower}")`,
    );
  }

  if (nextLower && PREPOSITIONS.has(nextLower)) {
    isIdiomaticCandidate = true;
    reasons.push(`seguido por "${nextLower}"`);
  }

  let ambiguityScore = 0;
  if (posHints.size >= 2) ambiguityScore += 2;
  else if (posHints.size === 1) ambiguityScore += 1;
  if (isSentenceInitial) ambiguityScore += 1;
  if (isCandidatePhrasalVerb) ambiguityScore += 2;
  if (isIdiomaticCandidate) ambiguityScore += 1;

  const posGuess =
    posHints.size === 1 ? Array.from(posHints)[0] : 'unknown';

  const recommendation =
    ambiguityScore >= 3 || isCandidatePhrasalVerb || isIdiomaticCandidate
      ? 'context'
      : 'word';

  return {
    posGuess,
    ambiguityScore,
    isCandidatePhrasalVerb,
    isIdiomaticCandidate,
    recommendation,
    reasons: uniqueReasons(reasons),
  };
}

export function analyzeSelectionSignals(
  tokens: string[],
  indexes: number[],
): ContextSignals {
  if (indexes.length === 0) {
    return {
      posGuess: 'unknown',
      ambiguityScore: 0,
      isCandidatePhrasalVerb: false,
      isIdiomaticCandidate: false,
      recommendation: 'word',
      reasons: [],
    };
  }

  const reasons: string[] = [];
  let maxScore = 0;
  let hasPhrasal = false;
  let hasIdiom = false;

  const selection = indexes.map((i) => tokens[i]).filter(Boolean);
  if (indexes.length > 1) {
    reasons.push('seleção com várias palavras');
  }
  if (selection.some((token) => isPunctuation(token))) {
    reasons.push('seleção inclui pontuação');
  }

  indexes.forEach((i) => {
    const signal = analyzeWordSignals(tokens, i);
    maxScore = Math.max(maxScore, signal.ambiguityScore);
    hasPhrasal = hasPhrasal || signal.isCandidatePhrasalVerb;
    hasIdiom = hasIdiom || signal.isIdiomaticCandidate;
    const token = tokens[i];
    if (token && !isPunctuation(token)) {
      reasons.push(...signal.reasons.map((reason) => `${token}: ${reason}`));
    }
  });

  const recommendation =
    maxScore >= 3 ||
    hasPhrasal ||
    hasIdiom ||
    indexes.length > 1 ||
    selection.some((token) => isPunctuation(token))
      ? 'context'
      : 'word';

  return {
    posGuess: 'unknown',
    ambiguityScore: maxScore,
    isCandidatePhrasalVerb: hasPhrasal,
    isIdiomaticCandidate: hasIdiom,
    recommendation,
    reasons: uniqueReasons(reasons),
  };
}
