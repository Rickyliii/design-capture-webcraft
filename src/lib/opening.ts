import { AWAKENING_LENGTH, type ShowState } from "./light";
import { validateTimeline } from "./music-show";

export function openingFrame(state: ShowState | null, now: number) {
  const idle = { visible: false, seconds: null as number | null, playbackSeconds: 0, durationSeconds: AWAKENING_LENGTH, phase: "sky", complete: false };
  if (!state?.is_show_active || !state.sequence_start_time) return idle;
  const start = Date.parse(state.sequence_start_time);
  if (!Number.isFinite(start)) return idle;
  const at = state.mode === "awakening_paused" ? Date.parse(state.updated_at) : now;
  const elapsed = (at - start) / 1000;
  if (!Number.isFinite(elapsed)) return idle;
  if (elapsed < 0) return idle;
  let seconds: number;
  let durationSeconds = AWAKENING_LENGTH;
  if (state.mode === "music") {
    let timeline;
    try { timeline = validateTimeline(state.music_timeline); } catch { return idle; }
    const end = timeline.cues[5] ?? timeline.duration;
    durationSeconds = end;
    // Map editable music cues to the original gathering/reveal choreography.
    const stops = [0, 5, 12, 16, 19, 27];
    const i = Math.min(4, timeline.cues.findIndex((n, j) => j > 0 && n > elapsed) - 1);
    if (elapsed >= end) return { visible: false, seconds: 27, playbackSeconds: end, durationSeconds, phase: "reveal", complete: true };
    const index = Math.max(0, i);
    const from = timeline.cues[index] ?? 0;
    const to = timeline.cues[index + 1] ?? end;
    seconds = (stops[index] ?? 0) + (elapsed - from) / (to - from) * ((stops[index + 1] ?? 27) - (stops[index] ?? 0));
  } else if (state.mode === "awakening" || state.mode === "awakening_paused") {
    // Preserve the uploaded renderer's 27-second choreography while playing it in 22 seconds.
    seconds = elapsed * 27 / AWAKENING_LENGTH;
    if (elapsed >= AWAKENING_LENGTH) return { visible: false, seconds: 27, playbackSeconds: AWAKENING_LENGTH, durationSeconds, phase: "reveal", complete: true };
  } else return idle;
  const phase = seconds < 5 ? "darkness" : seconds < 12 ? "awakening" : seconds < 19 ? "convergence" : seconds < 22 ? "supernova" : "reveal";
  return { visible: true, seconds, playbackSeconds: elapsed, durationSeconds, phase, complete: false };
}