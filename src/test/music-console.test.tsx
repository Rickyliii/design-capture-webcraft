import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({ start: vi.fn(), clock: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/light.functions", () => ({ startMusicShow: calls.start, getShowClock: calls.clock }));
import { MusicShowConsole } from "@/components/MusicShowConsole";
describe("presenter music safety", () => {
  beforeEach(() => {
    calls.start.mockReset(); calls.clock.mockReset(); calls.clock.mockResolvedValue(Date.now());
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    calls.start.mockResolvedValue({ mode: "music", is_show_active: true, updated_at: "now" });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });
  it("never starts a shared show without selected audio unless silent mode is explicit", () => {
    render(<MusicShowConsole state={null} onState={vi.fn()} send={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "START MUSIC SHOW" }));
    expect(calls.start).not.toHaveBeenCalled();
    expect(calls.clock).not.toHaveBeenCalled();
  });
  it("preview is local and does not send a shared START command", async () => {
    render(<MusicShowConsole state={null} onState={vi.fn()} send={vi.fn()} />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "PREVIEW MUSIC + LIGHTS" }));
    await waitFor(() => expect(calls.clock).toHaveBeenCalledOnce());
    expect(calls.start).not.toHaveBeenCalled();
  });
  it("silent start persists the actual editable six-cue configuration", async () => {
    render(<MusicShowConsole state={null} onState={vi.fn()} send={vi.fn()} />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText("THE DROP start seconds"), { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "START MUSIC SHOW" }));
    await waitFor(() => expect(calls.start).toHaveBeenCalledOnce());
    expect(calls.start.mock.calls[0]?.[0].data.timeline).toMatchObject({ silent: true, cues: [0, 5, 11, 18, 25, 27], bpm: 120 });
  });
  it("STOP cancels an in-flight preparation before it can start phones", async () => {
    let resolve: (n: number) => void = () => {};
    calls.clock.mockImplementation(() => new Promise<number>(r => { resolve = r; }));
    const send = vi.fn().mockResolvedValue(undefined);
    render(<MusicShowConsole state={null} onState={vi.fn()} send={send} />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "START MUSIC SHOW" }));
    fireEvent.click(screen.getByRole("button", { name: "STOP SHOW" }));
    resolve(Date.now());
    await waitFor(() => expect(send).toHaveBeenCalledWith("stop", "STOP MUSIC SHOW"));
    expect(calls.start).not.toHaveBeenCalled();
  });
  it("opening replay sends the shared opening command without requiring music", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    render(<MusicShowConsole state={null} onState={vi.fn()} send={send} />);
    fireEvent.click(screen.getByRole("button", { name: "START / REPLAY STAGE ANIMATION · 27s" }));
    await waitFor(() => expect(send).toHaveBeenCalledWith("awakening", "START OPENING ANIMATION"));
    expect(calls.start).not.toHaveBeenCalled();
  });
});