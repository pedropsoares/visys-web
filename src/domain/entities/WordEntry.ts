import { WordStatus } from '../enums';

export interface Word {
  text: string;
  status: WordStatus;
  translation?: string;
  updatedAt: number;
}
