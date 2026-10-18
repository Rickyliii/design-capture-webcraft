import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShowClock } from "@/lib/light.functions";
import type { Command, ShowState } from "@/lib/light";
import { openingFrame } from "@/lib/opening";

export function MusicShowConsole({ state, send }: {
  state: ShowState | null; onState: (s: ShowState) => void;
  send: (cmd: Command, label: string, hex?: string) => Promise<void>;
}) {
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const clock = useServerFn(getShowClock);
  useEffect(() => {
    let disposed = false;
    let offset = 0;
    async function calibrate() {
      const before = Date.now();
      try {
        const server = await clock();
        if (!disposed) offset = server - (before + Date.now()) / 2;
      } catch { /* Retain the last calibrated clock. */ }
    }
    void calibrate();
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now() + offset), 100);
    const calibration = setInterval(() => void calibrate(), 30000);
    return () => { disposed = true; clearInterval(timer); clearInterval(calibration); };
  }, [clock]);
  const frame = openingFrame(state, now);
  const paused = state?.mode === "awakening_paused" && state.is_show_active;
  const playing = state?.mode === "awakening" && state.is_show_active && !frame.complete;
  async function command(cmd: Command, label: string) {
    setBusy(true);
    try { await send(cmd, label); } finally { setBusy(false); }
  }
  return <section className="music-console space-y-5 border-y border-background/20 py-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-bold">Opening animation</h2>
      <span className="font-mono text-xs opacity-70">{paused ? "PAUSED" : frame.complete ? "COMPLETE" : playing ? "PLAYING" : "STANDBY"} · {Math.floor(frame.playbackSeconds)} / {frame.durationSeconds}s</span>
    </header>
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Button className="min-h-16 px-2" disabled={busy || playing} onClick={() => void command(paused ? "resume" : "awakening", paused ? "RESUME OPENING ANIMATION" : "START OPENING ANIMATION")}><Play />START</Button>
      <Button variant="secondary" className="min-h-16 px-2" disabled={busy || !playing} onClick={() => void command("pause", "PAUSE OPENING ANIMATION")}><Pause />PAUSE</Button>
      <Button variant="secondary" className="min-h-16 px-2" disabled={busy} onClick={() => void command("awakening", "RESTART OPENING ANIMATION")}><RotateCcw />RESTART</Button>
    </div>
  </section>;
}
