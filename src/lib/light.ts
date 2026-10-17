// FanDrop Live Light — shared, pure helpers (safe for browser + server).
import { musicDisplay, validateTimeline, type MusicTimeline } from "./music-show";
export const LIGHT_EVENT_ID = "jb-toronto-2026-10-20";

export const TEAMS = {
  violet: { label: "Violet", hex: "#8B5CF6" },
  blue: { label: "Blue", hex: "#2563EB" },
  rose: { label: "Rose", hex: "#F43F8C" },
  gold: { label: "Gold", hex: "#FACC15" },
} as const;
export type Team = keyof typeof TEAMS;
export const TEAM_IDS = Object.keys(TEAMS) as Team[];

/** The 8 personal Star Colors, each belonging to one team. */
export const PALETTE = {
  electric_violet: { label: "Electric Violet", hex: "#8B5CF6", team: "violet" },
  lavender: { label: "Lavender", hex: "#B49AFF", team: "violet" },
  cosmic_blue: { label: "Cosmic Blue", hex: "#2563EB", team: "blue" },
  ice_cyan: { label: "Ice Cyan", hex: "#38BDF8", team: "blue" },
  sunset_rose: { label: "Sunset Rose", hex: "#F43F8C", team: "rose" },
  crimson_red: { label: "Crimson Red", hex: "#EF4444", team: "rose" },
  solar_gold: { label: "Solar Gold", hex: "#FACC15", team: "gold" },
  amber: { label: "Amber", hex: "#F59E0B", team: "gold" },
} as const satisfies Record<string, { label: string; hex: string; team: Team }>;
export type PaletteColor = keyof typeof PALETTE;
export const PALETTE_IDS = Object.keys(PALETTE) as PaletteColor[];

/** Stars created before the 8-color palette stored a team key; they stay valid. */
const LEGACY: Record<Team, PaletteColor> = { violet: "electric_violet", blue: "cosmic_blue", rose: "sunset_rose", gold: "solar_gold" };
export type StarColor = PaletteColor | Team;

export function isStarColor(v: unknown): v is StarColor {
  return typeof v === "string" && (v in PALETTE || v in TEAMS);
}
export function colorInfo(c: string) {
  const id: PaletteColor = c in PALETTE ? (c as PaletteColor) : c in TEAMS ? LEGACY[c as Team] : "electric_violet";
  return { id, ...PALETTE[id] };
}
export const teamOf = (c: string): Team => colorInfo(c).team;

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

export const COMMANDS = ["violet", "blue", "rose", "gold", "custom", "team", "breathing", "aurora", "awakening", "stop"] as const;
export type Command = (typeof COMMANDS)[number];
export const isHex = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);

export type ShowState = {
  event_id: string;
  mode: string;
  global_color: string | null;
  sequence_name: string | null;
  sequence_start_time: string | null;
  is_show_active: boolean;
  updated_at: string;
  music_timeline?: unknown;
};

/** Presentation opening duration, anchored to one shared start timestamp. */
export const AWAKENING_LENGTH = 22;
export function awakeningPhase(elapsedSec: number): Team | "own" | "done" {
  if (elapsedSec >= AWAKENING_LENGTH) return "done";
  elapsedSec = elapsedSec * 27 / AWAKENING_LENGTH;
  if (elapsedSec < 4) return "own";
  if (elapsedSec < 8) return "violet";
  if (elapsedSec < 12) return "blue";
  if (elapsedSec < 16) return "gold";
  if (elapsedSec < 27) return "own";
  return "done";
}

export type Display = { hex: string; breathing: boolean; aurora: boolean; message?: string; waiting?: boolean; halo?: boolean };

/** What a synced phone should show for a given show state. */
export function displayFor(state: ShowState | null, own: string, nowMs: number): Display {
  const mine = colorInfo(own).hex;
  const off = { breathing: false, aurora: false };
  if (!state || !state.is_show_active) return { hex: mine, ...off, waiting: true };
  switch (state.mode) {
    case "music": {
      let timeline: MusicTimeline;
      try { timeline = validateTimeline(state.music_timeline); } catch { return { hex: mine, ...off, waiting: true }; }
      const start = state.sequence_start_time ? Date.parse(state.sequence_start_time) : NaN;
      if (!Number.isFinite(start)) return { hex: mine, ...off, waiting: true };
      return musicDisplay(timeline, (nowMs - start) / 1000, mine, teamOf(own));
    }
    case "color": {
      const g = state.global_color;
      const hex = isHex(g) ? g : g && g in TEAMS ? TEAMS[g as Team].hex : mine;
      return { hex, ...off };
    }
    case "breathing":
      return { hex: mine, ...off, breathing: true };
    case "aurora":
      return { hex: mine, ...off, aurora: true };
    case "awakening": {
      const start = state.sequence_start_time ? Date.parse(state.sequence_start_time) : nowMs;
      const p = awakeningPhase(Math.max(0, (nowMs - start) / 1000));
      if (p === "done") return { hex: mine, ...off, message: "YOU ARE THE AFTERLIGHT." };
      return { hex: p === "own" ? mine : TEAMS[p].hex, ...off };
    }
    default:
      return { hex: mine, ...off };
  }
}

/** Map a host command to the new show state fields. */
export function stateForCommand(cmd: Command, now: Date, hex?: string) {
  const base = { updated_at: now.toISOString(), sequence_name: null as string | null, sequence_start_time: null as string | null };
  const on = (mode: string, global_color: string | null = null) => ({ ...base, mode, global_color, is_show_active: true });
  if (cmd === "stop") return { ...base, mode: "idle", global_color: null, is_show_active: false };
  if (cmd === "team") return on("team");
  if (cmd === "breathing") return on("breathing");
  if (cmd === "aurora") return on("aurora");
  if (cmd === "custom") {
    if (!isHex(hex)) throw new Error("Invalid color");
    return on("color", hex.toUpperCase());
  }
  if (cmd === "awakening")
    // Start 2s ahead so every phone receives it before phase 1.
    return { ...on("awakening"), sequence_name: "THE AWAKENING", sequence_start_time: new Date(now.getTime() + 2000).toISOString() };
  return on("color", cmd);
}

export const PRESENCE_CHANNEL = `presence-${LIGHT_EVENT_ID}`;
export const SHOW_BROADCAST_CHANNEL = `show-bc-${LIGHT_EVENT_ID}`;
