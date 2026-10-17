// FanDrop Live Light — shared, pure helpers (safe for browser + server).
export const LIGHT_EVENT_ID = "jb-toronto-2026-10-20";

export const STAR_COLORS = {
  violet: { label: "Violet", hex: "#8B5CF6" },
  rose: { label: "Rose", hex: "#F43F5E" },
  gold: { label: "Gold", hex: "#F5B83D" },
  blue: { label: "Blue", hex: "#3B82F6" },
} as const;
export type StarColor = keyof typeof STAR_COLORS;
export const STAR_TYPES = ["Nova", "Comet", "Nebula", "Pulsar"] as const;
export type StarType = (typeof STAR_TYPES)[number];
export const FIRST_CONCERT = ["yes", "no", "prefer_not"] as const;

export const ACTIVITY_KINDS = [
  "star_created",
  "lightstick_activated",
  "team_joined",
  "light_sent",
  "challenge_completed",
  "concert_sync_entered",
] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export const COMMANDS = ["violet", "rose", "gold", "blue", "team", "breathing", "awakening", "stop"] as const;
export type Command = (typeof COMMANDS)[number];

export type ShowState = {
  event_id: string;
  mode: string;
  global_color: string | null;
  sequence_name: string | null;
  sequence_start_time: string | null;
  is_show_active: boolean;
  updated_at: string;
};

export function isStarColor(v: unknown): v is StarColor {
  return typeof v === "string" && v in STAR_COLORS;
}

/** The Awakening: 20s total, one shared start timestamp. */
export const AWAKENING_LENGTH = 20;
export function awakeningPhase(elapsedSec: number): StarColor | "own" | "done" {
  if (elapsedSec < 4) return "own";
  if (elapsedSec < 8) return "violet";
  if (elapsedSec < 12) return "blue";
  if (elapsedSec < 16) return "gold";
  if (elapsedSec < AWAKENING_LENGTH) return "own";
  return "done";
}

export type Display = { hex: string; breathing: boolean; message?: string; waiting?: boolean };

/** What a synced phone should show for a given show state. */
export function displayFor(state: ShowState | null, own: StarColor, nowMs: number): Display {
  const mine = STAR_COLORS[own].hex;
  if (!state || !state.is_show_active) return { hex: mine, breathing: false, waiting: true };
  switch (state.mode) {
    case "color":
      return { hex: isStarColor(state.global_color) ? STAR_COLORS[state.global_color].hex : mine, breathing: false };
    case "breathing":
      return { hex: mine, breathing: true };
    case "awakening": {
      const start = state.sequence_start_time ? Date.parse(state.sequence_start_time) : nowMs;
      const p = awakeningPhase(Math.max(0, (nowMs - start) / 1000));
      if (p === "done") return { hex: mine, breathing: false, message: "YOU ARE THE AFTERLIGHT." };
      return { hex: p === "own" ? mine : STAR_COLORS[p].hex, breathing: false };
    }
    default:
      return { hex: mine, breathing: false };
  }
}

/** Map a host command to the new show state fields. */
export function stateForCommand(cmd: Command, now: Date) {
  const base = { updated_at: now.toISOString(), sequence_name: null as string | null, sequence_start_time: null as string | null };
  if (cmd === "stop") return { ...base, mode: "idle", global_color: null, is_show_active: false };
  if (cmd === "team") return { ...base, mode: "team", global_color: null, is_show_active: true };
  if (cmd === "breathing") return { ...base, mode: "breathing", global_color: null, is_show_active: true };
  if (cmd === "awakening")
    // Start 2s ahead so every phone receives it before phase 1.
    return { ...base, mode: "awakening", global_color: null, is_show_active: true, sequence_name: "THE AWAKENING", sequence_start_time: new Date(now.getTime() + 2000).toISOString() };
  return { ...base, mode: "color", global_color: cmd, is_show_active: true };
}
