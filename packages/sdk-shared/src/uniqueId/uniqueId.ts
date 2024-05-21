import { nanoid } from 'nanoid';

export function uniqueId(size?: number): string {
  return nanoid(size);
}
