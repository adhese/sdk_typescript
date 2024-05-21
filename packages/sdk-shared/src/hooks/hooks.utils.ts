export function add<Callback extends Function>(callback: Callback, {
  callbacks,
  onAdd,
}: {
  callbacks: Set<Callback>;
  onAdd?(hookSet: Set<Callback>): void;
}): () => void {
  callbacks.add(callback);

  onAdd?.(callbacks);

  return () => {
    callbacks?.delete(callback);
  };
}
