import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Music2, Play, Square, RotateCcw, Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShowClock, startMusicShow } from "@/lib/light.functions";
import { CUE_NAMES, DEFAULT_TIMELINE, musicCue, musicDisplay, scheduledMusicStart, validateTimeline, type MusicTimeline } from "@/lib/music-show";
import type { Command, ShowState } from "@/lib/light";

export function MusicShowConsole({ state, onState, send }: {
  state: ShowState | null; onState: (s: ShowState) => void;
  send: (cmd: Command, label: string, hex?: string) => Promise<void>;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const url = useRef<string | null>(null);
  const [file, setFile] = useState("");
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [timeline, setTimeline] = useState<MusicTimeline>({ ...DEFAULT_TIMELINE, cues: [...DEFAULT_TIMELINE.cues] });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [silentStart, setSilentStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const offset = useRef(0);
  const operation = useRef(0);
  const startShow = useServerFn(startMusicShow);
  const clock = useServerFn(getShowClock);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + offset.current), 100);
    return () => { operation.current++; audio.current?.pause(); clearInterval(timer); if (url.current) URL.revokeObjectURL(url.current); };
  }, []);
  useEffect(() => {
    if (state && (state.mode !== "music" || !state.is_show_active)) { operation.current++; audio.current?.pause(); setSilentStart(null); setPreview(false); }
  }, [state?.updated_at]);
  function selectFile(f?: File) {
    if (!f) return;
    if (!/\.(mp3|wav)$/i.test(f.name)) return setError("Choose an MP3 or WAV file.");
    audio.current?.pause();
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = URL.createObjectURL(f); setFile(f.name); setDuration(0); setPosition(0); setError("");
    if (audio.current) { audio.current.src = url.current; audio.current.load(); }
  }
  async function begin(isPreview: boolean) {
    const token = ++operation.current;
    setError("");
    let t: MusicTimeline;
    try { t = validateTimeline({ ...timeline, version: timeline.version + 1 }); }
    catch (e) { return setError((e as Error).message); }
    const a = audio.current;
    if (!t.silent && (!a || !file)) return setError("Select your local music file first, or choose Silent Demo Mode.");
    if (!t.silent && duration < t.audioOffset + t.lead + t.duration) return setError("The track must cover the music offset, preparation time, and complete show.");
    setBusy(true); setPreview(isPreview);
    try {
      // play() is invoked before any network await, directly from the presenter's tap.
      if (a) a.pause();
      if (!t.silent && a) { a.currentTime = t.audioOffset; await a.play(); }
      if (token !== operation.current) return;
      const before = Date.now(); const server = await clock(); const after = Date.now();
      offset.current = server - (before + after) / 2;
      if (token !== operation.current) return;
      const measured = Date.now() + offset.current;
      const start = t.silent ? measured + t.lead * 1000 : scheduledMusicStart(t, a?.currentTime ?? 0, measured);
      if (!t.silent && a?.paused) throw new Error("Audio did not begin. The shared show was not started.");
      setTimeline(t); setSilentStart(start);
      if (!isPreview) {
        const row = await startShow({ data: { timeline: t, scheduledStart: start } }) as ShowState;
        if (token !== operation.current) { await send("stop", "CANCELLED START — STOP"); return; }
        onState(row);
      }
    } catch (e) {
      a?.pause(); setSilentStart(null); setError((e as Error).message || "Music could not start.");
    } finally { setBusy(false); }
  }
  async function stop(label = "STOP MUSIC SHOW") {
    operation.current++;
    audio.current?.pause(); setSilentStart(null); setPreview(false);
    await send("stop", label);
  }
  const stored = (() => { try { return validateTimeline(state?.music_timeline); } catch { return timeline; } })();
  const start = preview ? silentStart : state?.mode === "music" && state.sequence_start_time ? Date.parse(state.sequence_start_time) : silentStart;
  const activeTimeline = preview ? timeline : stored;
  const elapsed = start === null ? -1 : (now - start) / 1000;
  const cue = musicCue(activeTimeline, elapsed);
  const running = state?.mode === "music" && state.is_show_active && cue < 6;
  const visual = musicDisplay(activeTimeline, elapsed, "#38BDF8", "blue");
  return <section className="music-console space-y-5 border-y border-background/20 py-6">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-primary">THE AWAKENING / 3.0</p><h2 className="mt-1 font-display text-2xl font-bold">MUSIC SHOW</h2></div><span className="font-mono text-xs opacity-60">{preview ? "LOCAL PREVIEW" : state?.mode === "music" && state.is_show_active ? cue === 6 ? "COMPLETE" : cue < 0 ? "PREPARING" : "ON AIR" : state?.mode === "awakening" && state.is_show_active ? "OPENING" : "STANDBY"}</span></header>
    <audio ref={audio} onLoadedMetadata={() => setDuration(audio.current?.duration ?? 0)} onTimeUpdate={() => {
      const at = audio.current?.currentTime ?? 0; setPosition(at);
      if (running && !preview && !stored.silent && start !== null && Math.abs(scheduledMusicStart(stored, at, Date.now() + offset.current) - start) > 1000) { setError("Audio timing changed. Lighting stopped to prevent an out-of-sync show."); void stop("AUDIO TIMING — STOP"); }
    }} onWaiting={() => { if (running && !preview && !stored.silent) { setError("Audio paused to buffer. Lighting stopped; restart when ready."); void stop("AUDIO BUFFERING — STOP"); } }} onError={() => { setError("This audio file could not be played. Select another MP3 or WAV."); if (state?.mode === "music") void stop("AUDIO ERROR — STOP"); }} onEnded={() => { if (state?.mode === "music" && elapsed < stored.duration) { setError("Music ended early. Lighting stopped."); void stop("AUDIO ENDED — STOP"); } }} />
    <div className="flex flex-wrap items-center gap-4"><label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-background/30 px-4 font-bold"><Upload size={18} /> UPLOAD MUSIC<input type="file" accept="audio/mpeg,audio/wav,.mp3,.wav" className="sr-only" onChange={e => selectFile(e.target.files?.[0])} disabled={busy || (state?.mode === "music" && cue < 6 && state.is_show_active)} /></label><div className="min-w-0 flex-1"><p className="break-all font-bold">{file || "No local track selected"}</p><p className="font-mono text-xs opacity-60">{position.toFixed(1)}s / {duration.toFixed(1)}s · PRESENTER AUDIO ONLY</p></div><Music2 className="text-primary" /></div>
    <details className="border-y border-background/20 py-3"><summary className="cursor-pointer font-bold">Advanced timing & silent test</summary><div className="mt-4 space-y-4">
    <label className="flex items-center gap-3 font-mono text-sm"><input type="checkbox" checked={timeline.silent} onChange={e => setTimeline({ ...timeline, silent: e.target.checked })} /> SILENT DEMO MODE</label>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{([
      ["BPM", "bpm", 40, 240], ["Music offset (s)", "audioOffset", 0, 3600], ["Preparation (s)", "lead", 5, 20], ["Sync offset (s)", "syncOffset", -2, 2], ["Show duration (s)", "duration", 6, 600],
    ] as const).map(([label, key, min, max]) => <label key={key} className="text-xs opacity-90">{label}<input type="number" min={min} max={max} step={key === "bpm" ? 1 : 0.1} value={timeline[key]} onChange={e => setTimeline({ ...timeline, [key]: Number(e.target.value) })} className="mt-2 w-full rounded-md border border-background/25 bg-transparent p-3 font-mono text-base" /></label>)}</div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="font-mono text-xs opacity-60"><tr><th className="py-3">LIGHTING CUE</th><th>START / SECONDS</th></tr></thead><tbody>{CUE_NAMES.map((name, i) => <tr key={name} className={`border-t border-background/15 ${cue === i && start !== null ? "text-primary" : ""}`}><td className="py-3 font-bold"><span className="mr-3 font-mono opacity-50">0{i + 1}</span>{name}</td><td><input aria-label={`${name} start seconds`} type="number" min={0} max={timeline.duration} step={0.1} disabled={i === 0} value={timeline.cues[i]} onChange={e => setTimeline({ ...timeline, cues: timeline.cues.map((n, j) => j === i ? Number(e.target.value) : n) })} className="w-24 rounded-md border border-background/25 bg-transparent p-2 font-mono" /></td></tr>)}</tbody></table></div>
    </div></details>
    <div className="flex items-center gap-3 border-y border-background/20 py-4"><span className="music-preview h-10 w-10 shrink-0 rounded-full" style={{ "--preview-light": visual.hex } as React.CSSProperties} /><p className="font-mono text-xs">{start === null ? "NO ACTIVE CUE" : cue < 0 ? `PREPARING · ${Math.max(0, -elapsed).toFixed(1)}s` : cue === 6 ? "YOU ARE THE AFTERLIGHT." : `${CUE_NAMES[cue]} · ${elapsed.toFixed(1)}s`}</p></div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Button className="min-h-14 whitespace-normal" disabled={busy || running} onClick={() => begin(false)}><Play />{busy ? "STARTING…" : "START MUSIC SHOW"}</Button><Button variant="destructive" className="min-h-14" onClick={() => stop()}><Square />STOP SHOW</Button><Button variant="secondary" className="min-h-14 whitespace-normal" disabled={busy} onClick={() => { operation.current++; audio.current?.pause(); setSilentStart(null); setPreview(false); void send("awakening", "START OPENING ANIMATION"); }}><RotateCcw />PLAY / REPLAY OPENING</Button></div>
    <details className="border-y border-background/20 py-3"><summary className="cursor-pointer font-bold">Preview & safety tools</summary><div className="mt-3 grid gap-3 sm:grid-cols-2"><Button variant="secondary" disabled={busy || running} onClick={() => begin(true)}><Play />PREVIEW MUSIC + LIGHTS</Button><Button variant="secondary" onClick={() => { operation.current++; audio.current?.pause(); setSilentStart(null); void send("team", "EMERGENCY STATIC MODE"); }}><Shield />EMERGENCY STATIC MODE</Button><Button variant="secondary" onClick={() => { void stop("RESET DEMO STATE"); if (audio.current) audio.current.currentTime = 0; setPosition(0); }}><RotateCcw />RESET DEMO STATE</Button><Button variant="ghost" className="whitespace-normal border border-background/30" onClick={() => { operation.current++; audio.current?.pause(); void send("team", "RESTORE PERSONAL COLORS"); }}>RESTORE PERSONAL COLORS</Button></div></details>
    {error && <p role="alert" className="border-l-2 border-destructive pl-3 text-sm">{error}</p>}
  </section>;
}