import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/light.functions", () => ({ getShowClock: vi.fn().mockImplementation(() => Promise.resolve(Date.now())) }));
import { MusicShowConsole } from "@/components/MusicShowConsole";
import type { ShowState } from "@/lib/light";
const state: ShowState = { event_id: "test", mode: "awakening", global_color: null, sequence_name: null, sequence_start_time: new Date(Date.now() - 5000).toISOString(), is_show_active: true, updated_at: new Date().toISOString() };
afterEach(cleanup);
describe("animation-only presenter controls", () => {
  it("starts the shared opening", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    render(<MusicShowConsole state={null} onState={vi.fn()} send={send} />);
    fireEvent.click(screen.getByRole("button", { name: "START", exact: true }));
    await waitFor(() => expect(send).toHaveBeenCalledWith("awakening", "START OPENING ANIMATION"));
  });
  it("pauses the shared opening rather than stopping it", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    render(<MusicShowConsole state={state} onState={vi.fn()} send={send} />);
    fireEvent.click(screen.getByRole("button", { name: "PAUSE", exact: true }));
    await waitFor(() => expect(send).toHaveBeenCalledWith("pause", "PAUSE OPENING ANIMATION"));
  });
  it("START resumes a paused opening", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    render(<MusicShowConsole state={{ ...state, mode: "awakening_paused" }} onState={vi.fn()} send={send} />);
    fireEvent.click(screen.getByRole("button", { name: "START", exact: true }));
    await waitFor(() => expect(send).toHaveBeenCalledWith("resume", "RESUME OPENING ANIMATION"));
  });
  it("restarts from zero through a fresh opening command", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    render(<MusicShowConsole state={state} onState={vi.fn()} send={send} />);
    fireEvent.click(screen.getByRole("button", { name: "RESTART", exact: true }));
    await waitFor(() => expect(send).toHaveBeenCalledWith("awakening", "RESTART OPENING ANIMATION"));
  });
});
