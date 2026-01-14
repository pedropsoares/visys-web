import type { ContextLink, ContextPhrase } from '../domain/entities';
import {
  getAllContexts,
  getContext,
  getContextsByTokens,
  saveContextPhrase,
} from '../storage/contextRepository';
import {
  getContextLinksByText,
  saveContextLink,
} from '../storage/contextLinkRepository';

export async function fetchAllContexts(): Promise<ContextPhrase[]> {
  return getAllContexts();
}

export async function fetchContextsByTokens(
  tokens: string[],
): Promise<ContextPhrase[]> {
  return getContextsByTokens(tokens);
}

export async function fetchContext(
  id: string,
): Promise<ContextPhrase | null> {
  return getContext(id);
}

export async function persistContextPhrase(
  context: ContextPhrase,
): Promise<void> {
  await saveContextPhrase(context);
}

export async function persistContextLink(link: ContextLink): Promise<void> {
  await saveContextLink(link);
}

export async function fetchContextLinksByText(
  textId: string,
): Promise<ContextLink[]> {
  return getContextLinksByText(textId);
}
