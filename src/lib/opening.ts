import type { ShowState } from "./light";
import { validateTimeline } from "./music-show";

export function openingFrame(state: ShowState | null, now: number) {
  const idle = { visible: false, seconds: null as number | null, phase: "sky", complete: false };
  if (!state?.is_show_active || !state.sequence_start_time) return idle;
  const start = Date.parse(state.sequence_start_time);
  if (!Number.isFinite(start)) return idle;
  const elapsed = (now - start) / 1000;
  if (elapsed < 0) return idle;
  let seconds: number;
  if (state.mode === "music") {
    let timeline;
    try { timeline = validateTimeline(state.music_timeline); } catch { return idle; }
    const end = timeline.cues[5] ?? timeline.duration;
    // Map editable music cues to the original gathering/reveal choreography.
    const stops = [0, 5, 12, 16, 19, 27];
    const i = Math.min(4, timeline.cues.findIndex((n, j) => j > 0 && n > elapsed) - 1);
    if (elapsed >= end) return { visible: false, seconds: 27, phase: "reveal", complete: true };
    const index = Math.max(0, i);
    const from = timeline.cues[index] ?? 0;
    const to = timeline.cues[index + 1] ?? end;
    seconds = (stops[index] ?? 0) + (elapsed - from) / (to - from) * ((stops[index + 1] ?? 27) - (stops[index] ?? 0));
  } else if (state.mode === "awakening") {
    seconds = elapsed / 20 * 27;
    if (elapsed >= 20) return { visible: false, seconds: 27, phase: "reveal", complete: true };
  } else return idle;
  const phase = seconds < 5 ? "darkness" : seconds < 12 ? "awakening" : seconds < 19 ? "convergence" : seconds < 22 ? "supernova" : "reveal";
  return { visible: true, seconds, phase, complete: false };
}