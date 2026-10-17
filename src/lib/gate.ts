const KEY = "fandrop-gate-scanned";
export const GATE_EVENT = "fandrop:gate";

export function isGateScanned(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function setGateScanned(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event(GATE_EVENT));
}

export function clearGateScanned(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(GATE_EVENT));
}

export function onGateScanned(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(GATE_EVENT, cb);
  return () => window.removeEventListener(GATE_EVENT, cb);
}
