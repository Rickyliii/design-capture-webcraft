// Afterlight Journey: energy is awarded once per action; stages need energy AND a mandatory action.
export type ActionId = "pass" | "light" | "qa" | "encore" | "return" | "drop";

export const ACTIONS: Record<ActionId, { label: string; energy: number }> = {
  pass: { label: "Create Fan Pass", energy: 50 },
  light: { label: "Awaken Star and Send Light", energy: 100 },
  qa: { label: "Submit or Upvote Q&A", energy: 50 },
  encore: { label: "Hidden Encore Vote", energy: 100 },
  return: { label: "Return After Show", energy: 100 },
  drop: { label: "Future Artist Drop", energy: 100 },
};

export const STAGES = [
  { n: 1, name: "The Spark", symbol: "✧", need: 0, requires: "pass" as ActionId, desc: "Every connection starts with a spark.", unlock: "Create your Fan Pass" },
  { n: 2, name: "The Awakened", symbol: "☾", need: 150, requires: "light" as ActionId, desc: "Your light became part of something bigger.", unlock: "150 Energy + send your light" },
  { n: 3, name: "The Collaborator", symbol: "✺", need: 350, requires: "return" as ActionId, desc: "You help shape what comes next.", unlock: "350 Energy + return after the show" },
  { n: 4, name: "Inner Circle", symbol: "◉", need: 500, requires: "drop" as ActionId, desc: "Closer to the music. Closer to the artist.", unlock: "500 Energy + join a future Artist Drop" },
];

export function energyOf(done: Iterable<ActionId>): number {
  let t = 0;
  for (const a of new Set(done)) t += ACTIONS[a]?.energy ?? 0;
  return t;
}

/** Highest stage reached in order; 0 = not started. */
export function stageOf(done: Iterable<ActionId>): number {
  const set = new Set(done);
  const e = energyOf(set);
  let s = 0;
  for (const st of STAGES) {
    if (e >= st.need && set.has(st.requires)) s = st.n;
    else break;
  }
  return s;
}

const KEY = "fandrop-afterlight";
export const AFTERLIGHT_EVENT = "fandrop:afterlight";

export function loadActions(): ActionId[] {
  if (typeof window === "undefined") return [];
  let list: ActionId[] = [];
  try { list = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch {}
  const set = new Set(list.filter((a) => a in ACTIONS));
  // Derive from existing app data.
  try {
    const p = JSON.parse(localStorage.getItem("fandrop-profile") ?? "null");
    if (p?.name) set.add("pass");
  } catch {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith("fandrop.live.v1:") && JSON.parse(localStorage.getItem(k) ?? "{}")?.lightSent) set.add("light");
    }
  } catch {}
  return [...set];
}

export function markAction(a: ActionId): void {
  if (typeof window === "undefined") return;
  const cur = loadActions();
  if (cur.includes(a)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify([...cur, a]));
    window.dispatchEvent(new Event(AFTERLIGHT_EVENT));
  } catch {}
}

export function resetActions(): void {
  try { localStorage.removeItem(KEY); window.dispatchEvent(new Event(AFTERLIGHT_EVENT)); } catch {}
}
