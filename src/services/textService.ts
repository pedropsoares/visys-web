import type { TextEntry } from '../domain/entities';
import {
  clearActiveText,
  getActiveText,
  saveActiveText,
} from '../storage/textRepository';

export async function fetchActiveText(): Promise<TextEntry | null> {
  return getActiveText();
}

export async function persistActiveText(rawText: string): Promise<TextEntry> {
  const data: TextEntry = {
    id: 'active',
    rawText,
    createdAt: Date.now(),
  };
  await saveActiveText(data);
  return data;
}

export async function removeActiveText(): Promise<void> {
  await clearActiveText();
}
