import { describe, expect, it } from "vitest";
import { openingFrame } from "@/lib/opening";
import { DEFAULT_TIMELINE } from "@/lib/music-show";
import { stateForCommand, type ShowState } from "@/lib/light";
const start = Date.parse("2026-10-17T22:00:00Z");
const state: ShowState = { event_id: "test", mode: "music", global_color: null, sequence_name: null, sequence_start_time: new Date(start).toISOString(), is_show_active: true, updated_at: new Date(start).toISOString(), music_timeline: DEFAULT_TIMELINE };
describe("shared opening choreography", () => {
  it("pause freezes the same frame for stage and late-joining phones", () => {
    const opening = { ...state, mode: "awakening" };
    const paused = { ...opening, ...stateForCommand("pause", new Date(start + 7000), undefined, opening) };
    expect(openingFrame(paused, start + 8000).playbackSeconds).toBe(7);
    expect(openingFrame(paused, start + 20000)).toEqual(openingFrame(paused, start + 8000));
  });
  it("resume excludes paused time from the 22-second duration", () => {
    const opening = { ...state, mode: "awakening" };
    const paused = { ...opening, ...stateForCommand("pause", new Date(start + 7000), undefined, opening) };
    const resumed = { ...paused, ...stateForCommand("resume", new Date(start + 17000), undefined, paused) };
    expect(openingFrame(resumed, start + 17000).playbackSeconds).toBe(7);
    expect(openingFrame(resumed, start + 31999).complete).toBe(false);
    expect(openingFrame(resumed, start + 32000)).toMatchObject({ complete: true, playbackSeconds: 22 });
  });
  it("presenter opening runs all five uploaded phases for exactly 22 seconds", () => {
    const opening = { ...state, mode: "awakening", music_timeline: null };
    expect([0, 7, 12, 16.5, 19].map(s => openingFrame(opening, start + s * 1000).phase)).toEqual(["darkness", "awakening", "convergence", "supernova", "reveal"]);
    expect(openingFrame(opening, start + 21999).visible).toBe(true);
    expect(openingFrame(opening, start + 22000)).toMatchObject({ visible: false, complete: true, playbackSeconds: 22, durationSeconds: 22 });
  });
  it("waits until presenter start and never animates a stopped show", () => {
    expect(openingFrame(state, start - 1).visible).toBe(false);
    expect(openingFrame({ ...state, is_show_active: false }, start + 12000).visible).toBe(false);
  });
  it("late-joining phone and stage recover the same convergence phase", () => {
    const phone = openingFrame(state, start + 18000);
    expect(phone.phase).toBe("convergence");
    expect(phone).toEqual(openingFrame(state, start + 18000));
    expect(phone.seconds).toBe(16);
  });
  it("returns phones to personal lighting at the afterlight cue", () => {
    expect(openingFrame(state, start + 27000)).toMatchObject({ visible: false, phase: "reveal", complete: true });
  });
  it("retimes gathering to editable music boundaries", () => {
    expect(openingFrame({ ...state, music_timeline: { ...DEFAULT_TIMELINE, cues: [0, 4, 8, 12, 16, 20] } }, start + 20000).complete).toBe(true);
  });
});