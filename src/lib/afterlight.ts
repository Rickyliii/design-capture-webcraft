// Afterlight Journey: energy is awarded once per action; stage is decided by total energy alone.
export type ActionId = "pass" | "light" | "qa" | "encore" | "return" | "drop";

export const ACTIONS: Record<ActionId, { label: string; energy: number }> = {
  pass: { label: "Create Fan Pass", energy: 100 },
  light: { label: "Awaken Star and Send Light", energy: 400 },
  qa: { label: "Submit or Upvote Q&A", energy: 300 },
  encore: { label: "Hidden Encore Vote", energy: 500 },
  return: { label: "Return After Show", energy: 700 },
  drop: { label: "Future Artist Drop", energy: 2000 },
};

export const STAGES = [
  { n: 1, name: "The Spark", symbol: "✧", need: 0, range: "0–499 Energy", theme: "Discover & Join",
    desc: "Join automatically when you sign up and start building your FanDrop identity.",
    perks: ["Digital Fan Passport", "Starter badge", "Concert interactions", "Basic rewards"] },
  { n: 2, name: "The Awakened", symbol: "☾", need: 500, range: "500–1,499 Energy", theme: "Engage & Participate",
    desc: "Go deeper with exclusive skins, early drops and limited challenges.",
    perks: ["Exclusive animated Star Skin", "Early Artist Drop alerts", "Advanced digital collectibles", "Limited interactive challenges"] },
  { n: 3, name: "The Collaborator", symbol: "✺", need: 1500, range: "1,500–3,999 Energy", theme: "Create & Influence",
    desc: "Help shape what comes next alongside the artist.",
    perks: ["Co-Creator Badge", "Submit to exclusive artist Q&A", "Special Fan Collaboration opportunities", "Limited content"] },
  { n: 4, name: "Inner Circle", symbol: "◉", need: 4000, range: "4,000+ Energy", theme: "Belong & Get Recognized",
    desc: "The closest circle — recognized and first in line.",
    perks: ["Limited Inner Circle Badge", "Priority entry to special event draws", "Limited-edition collectibles", "Exclusive fan community events"] },
];

export function energyOf(done: Iterable<ActionId>): number {
  let t = 0;
  for (const a of new Set(done)) t += ACTIONS[a]?.energy ?? 0;
  return t;
}

/** Stage from energy; 0 = not joined yet (no Fan Pass). */
export function stageFromEnergy(e: number): number {
  let s = 1;
  for (const st of STAGES) if (e >= st.need) s = st.n;
  return s;
}

export function stageOf(done: Iterable<ActionId>): number {
  const set = new Set(done);
  if (!set.has("pass")) return 0;
  return stageFromEnergy(energyOf(set));
}

const KEY = "fandrop-afterlight";
export const AFTERLIGHT_EVENT = "fandrop:afterlight";

export function loadActions(): ActionId[] {
  if (typeof window === "undefined") return [];
  let list: ActionId[] = [];
  try { list = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch {}
  const set = new Set(list.filter((a) => a in ACTIONS));
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
