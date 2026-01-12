import type { ContextPhrase } from '../domain/entities';
import {
  getAllContexts,
  getContext,
  saveContextPhrase,
} from '../storage/contextRepository';

export async function fetchAllContexts(): Promise<ContextPhrase[]> {
  return getAllContexts();
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
