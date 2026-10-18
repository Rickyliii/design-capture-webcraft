/** Shared browser-safe, validated music timing. Audio never leaves the presenter. */
export const CUE_NAMES = ["FIRST LIGHT", "AWAKENING", "RISING ENERGY", "THE CONVERGENCE", "THE DROP", "THE AFTERLIGHT"] as const;
export type MusicTimeline = {
  bpm: number;
  cues: number[];
  duration: number;
  audioOffset: number;
  lead: number;
  syncOffset: number;
  silent: boolean;
  sequenceId: string;
  version: number;
};
export const DEFAULT_TIMELINE: MusicTimeline = {
  bpm: 120, cues: [0, 5, 11, 18, 24, 27], duration: 30,
  audioOffset: 0, lead: 5, syncOffset: 0, silent: false,
  sequenceId: "awakening-music", version: 1,
};
export function validateTimeline(value: unknown): MusicTimeline {
  if (!value || typeof value !== "object") throw new Error("Invalid music cues");
  const t = value as MusicTimeline;
  const finite = (n: unknown, min: number, max: number) => typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
  if (!finite(t.bpm, 40, 240) || !finite(t.duration, 6, 600) || !finite(t.audioOffset, 0, 3600) || !finite(t.lead, 5, 20) || !finite(t.syncOffset, -2, 2)) throw new Error("Music settings are out of range");
  if (!Array.isArray(t.cues) || t.cues.length !== 6 || t.cues[0] !== 0 || t.cues.some((n, i) => !finite(n, 0, t.duration) || (i > 0 && n <= (t.cues[i - 1] ?? 0))) || (t.cues[5] ?? 0) >= t.duration) throw new Error("Six cues must be in increasing order, starting at 0 and ending before the show duration");
  if (typeof t.silent !== "boolean" || t.sequenceId !== "awakening-music" || !Number.isInteger(t.version) || t.version < 1 || t.version > 1000000) throw new Error("Invalid sequence version");
  return { bpm: t.bpm, cues: [...t.cues], duration: t.duration, audioOffset: t.audioOffset, lead: t.lead, syncOffset: t.syncOffset, silent: t.silent, sequenceId: t.sequenceId, version: t.version };
}
export function scheduledMusicStart(t: MusicTimeline, audioPosition: number, measuredAt: number) {
  return measuredAt + (t.audioOffset + t.lead + t.syncOffset - audioPosition) * 1000;
}
export function musicCue(t: MusicTimeline, elapsed: number) {
  if (elapsed < 0) return -1;
  if (elapsed >= t.duration) return 6;
  return t.cues.reduce((active, start, i) => elapsed >= start ? i : active, 0);
}
const COLORS = { violet: "#8B5CF6", blue: "#2563EB", rose: "#F43F8C", gold: "#FACC15", warm: "#FFE6A3" };
function blend(a: string, b: string, p: number) {
  const f = Math.max(0, Math.min(1, p));
  return "#" + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - f) + parseInt(b.slice(i, i + 2), 16) * f).toString(16).padStart(2, "0")).join("");
}
export function musicDisplay(t: MusicTimeline, elapsed: number, own: string, team: string) {
  const cue = musicCue(t, elapsed);
  const base = { breathing: false, wave: false, cue, waiting: cue < 0 };
  if (cue < 0) return { ...base, hex: own };
  if (cue === 6) return { ...base, hex: own, message: "YOU ARE THE AFTERLIGHT." };
  const start = t.cues[cue] ?? 0;
  const end = t.cues[cue + 1] ?? t.duration;
  const progress = (elapsed - start) / (end - start);
  if (cue === 0) return { ...base, hex: own, breathing: true };
  if (cue === 1) return { ...base, hex: blend(COLORS.violet, COLORS.blue, (1 - Math.cos(progress * Math.PI * 2)) / 2) };
  if (cue === 2) {
    const order = ["violet", "blue", "rose", "gold"];
    const active = order[Math.min(3, Math.floor(progress * 4))];
    return { ...base, hex: blend(own, team === active ? COLORS.warm : own, team === active ? Math.sin((progress * 4 % 1) * Math.PI) * 0.65 : 0) };
  }
  if (cue === 3) return { ...base, hex: blend(own, COLORS.warm, progress) };
  if (cue === 4) return { ...base, hex: blend(COLORS.warm, COLORS.gold, Math.min(1, progress * 3)), halo: true };
  return { ...base, hex: blend(COLORS.gold, own, Math.min(1, progress * 3)), message: "YOU ARE THE AFTERLIGHT." };
}