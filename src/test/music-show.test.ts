import { describe, expect, it } from "vitest";
import { DEFAULT_TIMELINE as t, musicCue, musicDisplay, scheduledMusicStart, validateTimeline } from "@/lib/music-show";
import { displayFor, stateForCommand, type ShowState } from "@/lib/light";
describe("music show rules", () => {
  it("defaults to 120 BPM", () => expect(t.bpm).toBe(120));
  it("follows all six specified demo cue boundaries and ends at 30s", () => {
    expect([-1, 0, 4.99, 5, 11, 18, 24, 27, 30].map(s => musicCue(t, s))).toEqual([-1, 0, 0, 1, 2, 3, 4, 5, 6]);
  });
  it("supports manually changing the drop time", () => {
    const changed = validateTimeline({ ...t, cues: [0, 5, 11, 18, 25, 28] });
    expect(musicCue(changed, 24)).toBe(3);
    expect(musicCue(changed, 25)).toBe(4);
  });
  it("rejects unordered or nonfinite cues", () => {
    expect(() => validateTimeline({ ...t, cues: [0, 5, 11, 18, 17, 27] })).toThrow();
    expect(() => validateTimeline({ ...t, bpm: NaN })).toThrow();
  });
  it("uses actual audio position with a five-second preparation lead", () => {
    expect(scheduledMusicStart(t, 1.5, 10000)).toBe(13500);
  });
  it("returns personal colors before starting and after finishing", () => {
    expect(musicDisplay(t, -1, "#F59E0B", "gold")).toMatchObject({ hex: "#F59E0B", waiting: true });
    expect(musicDisplay(t, 31, "#F59E0B", "gold")).toMatchObject({ hex: "#F59E0B", breathing: false, message: "YOU ARE THE AFTERLIGHT." });
  });
  it("late joiners use the current cue instead of restarting", () => {
    expect(musicDisplay(t, 25, "#38BDF8", "blue")).toMatchObject({ cue: 4, hex: "#facc15" });
  });
  it("STOP overrides a running music timeline", () => {
    const state: ShowState = { event_id: "e", mode: "music", global_color: null, is_show_active: true, updated_at: "", sequence_name: "music", sequence_start_time: new Date(0).toISOString(), music_timeline: t };
    expect(displayFor({ ...state, ...stateForCommand("stop", new Date()) }, "amber", 25000)).toMatchObject({ hex: "#F59E0B", waiting: true, breathing: false });
  });
});