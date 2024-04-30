const savedIds = new Set<string>();

export function uniqueId(): string {
  let id: string;

  do
    id = Math.random().toString(36).slice(2);
  while (savedIds.has(id));

  savedIds.add(id);

  return id;
}
