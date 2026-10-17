// Bridges the Profile fan card (stored under "fandrop-profile") to the Live activities.
const KEY = "fandrop-profile";
export const PASS_EVENT = "fandrop:pass";

export type FanPass = { id: string; name: string; avatar: number; vibe: string; awakening?: unknown };

export function loadPass(): FanPass | null {
  if (typeof window === "undefined") return null;
  try {
    const p = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (!p || typeof p.name !== "string" || !p.name) return null;
    if (typeof p.id !== "string") {
      p.id = crypto.randomUUID();
      window.localStorage.setItem(KEY, JSON.stringify(p));
    }
    return p;
  } catch {
    return null;
  }
}

export function mergeAwakening(awakening: unknown): void {
  const prev = loadPass();
  if (!prev) return;
  window.localStorage.setItem(KEY, JSON.stringify({ ...prev, awakening }));
}
