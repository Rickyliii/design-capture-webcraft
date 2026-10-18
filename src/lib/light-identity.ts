export const LIGHT_ID_KEY = "fandrop-light-fan-id";

export function lightEntryId(storage: Pick<Storage, "getItem" | "setItem">, fresh: boolean, createId: () => string) {
  const saved = fresh ? null : storage.getItem(LIGHT_ID_KEY);
  if (saved) return saved;
  const id = createId();
  storage.setItem(LIGHT_ID_KEY, id);
  return id;
}