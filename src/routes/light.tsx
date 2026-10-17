import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Radio, Sparkles, Sun, Waves, WifiOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadPass } from "@/lib/fanPass";
import { markAction } from "@/lib/afterlight";
import { Button } from "@/components/ui/button";
import { ConcertStar } from "@/components/ConcertStar";
import {
  LIGHT_EVENT_ID, SHOW_BROADCAST_CHANNEL, PALETTE, PALETTE_IDS, PRESENCE_CHANNEL, STAR_TYPES, TEAMS, TEAM_IDS, colorInfo, displayFor,
  type PaletteColor, type ShowState, type StarType, type Team,
} from "@/lib/light";
import { changeStarColor, getFan, getShowClock, getTeamBoard, recordActivity, registerFan, type LightFan } from "@/lib/light.functions";

export const Route = createFileRoute("/light")({
  validateSearch: (search: Record<string, unknown>) => ({ concert: search.concert === true || search.concert === "true" }),
  head: () => ({
    meta: [
      { title: "Live Light — FanDrop" },
      { name: "description", content: "Your Light. Your Moment. Our Show. Turn your phone into a synced concert lightstick." },
      { property: "og:title", content: "Live Light — FanDrop" },
      { property: "og:description", content: "Your Light. Your Moment. Our Show. Turn your phone into a synced concert lightstick." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LightPage,
});

const ID_KEY = "fandrop-light-fan-id";
function fanId() {
  let id = localStorage.getItem(ID_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(ID_KEY, id); }
  return id;
}

function LightPage() {
  const [id, setId] = useState<string | null>(null);
  const [fan, setFan] = useState<LightFan | null>(null);
  const [loading, setLoading] = useState(true);
  const [stick, setStick] = useState(false);
  const [initialMode, setInitialMode] = useState<Mode>("solid");
  const [editColor, setEditColor] = useState(false);

  useEffect(() => {
    const fid = fanId();
    setId(fid);
    getFan({ data: { fanId: fid } }).then(setFan).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || !id) return <Shell><p className="text-center font-mono text-sm opacity-70">Finding your star…</p></Shell>;
  if (!fan) return <Onboarding fanId={id} onDone={setFan} />;
  if (editColor) return <ColorEditor fan={fan} onCancel={() => setEditColor(false)} onSave={next => { setFan(next); setEditColor(false); }} />;
  if (stick) return <Lightstick fan={fan} initialMode={initialMode} onExit={() => setStick(false)} onChangeColor={() => { setStick(false); setEditColor(true); }} />;
  return <StarHome fan={fan} fanId={id} setFan={setFan} onChangeColor={() => setEditColor(true)} onActivate={async (sync: boolean) => {
    setInitialMode(sync ? "sync" : "solid"); setStick(true);
    try { const r = await recordActivity({ data: { fanId: id, kind: "lightstick_activated" } }); setFan(r.fan); } catch {}
  }} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-foreground px-5 py-8 text-background"><div className="mx-auto max-w-md">{children}</div></div>;
}

function ColorEditor({ fan, onCancel, onSave }: { fan: LightFan; onCancel: () => void; onSave: (fan: LightFan) => void }) {
  const [color, setColor] = useState<PaletteColor>(colorInfo(fan.star_color).id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setBusy(true); setError("");
    try { onSave(await changeStarColor({ data: { fanId: fan.fan_id, color } })); }
    catch { setError("Couldn't save your color. Please try again."); }
    finally { setBusy(false); }
  }
  return <Shell><Button variant="ghost" className="border border-background/30" disabled={busy} onClick={onCancel}><ArrowLeft />Back to my star</Button>
    <h1 className="mt-8 font-display text-3xl font-bold">Choose your star color</h1>
    <div className="mt-6 grid grid-cols-2 gap-3">{PALETTE_IDS.map(c => <Button key={c} variant="ghost" className={`min-h-20 whitespace-normal border border-background/30 ${color === c ? "bg-background text-foreground" : ""}`} aria-label={PALETTE[c].label} aria-pressed={color === c} disabled={busy} onClick={() => setColor(c)}><span className={`star-swatch star-swatch-${c}`} aria-hidden="true" />{PALETTE[c].label}</Button>)}</div>
    <p className="mt-4 font-mono text-sm">{PALETTE[color].label} · Team {TEAMS[PALETTE[color].team].label}</p>
    <Button className="mt-6 min-h-14 w-full" disabled={busy} onClick={save}>{busy ? "Saving…" : "SAVE COLOR"}</Button>
    {error && <p role="alert" className="mt-3">{error}</p>}
  </Shell>;
}

function Onboarding({ fanId, onDone }: { fanId: string; onDone: (f: LightFan) => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<PaletteColor>("electric_violet");
  const [type, setType] = useState<StarType>("Nova");
  const [first, setFirst] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    const p = loadPass();
    if (p?.name) setName(p.name);
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Give your star a nickname.");
    setBusy(true); setErr("");
    try { onDone(await registerFan({ data: { fanId, nickname: name, color, type, first: first || undefined } })); }
    catch { setErr("Couldn't save your star. Check your connection and try again."); }
    setBusy(false);
  }
  return (
    <Shell>
      <Link to="/live" className="inline-flex items-center gap-1 font-mono text-xs opacity-70"><ArrowLeft className="h-3 w-3" /> FanDrop</Link>
      <p className="sticker mt-6 opacity-70">FanDrop Live Light</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold leading-none">BE PART OF THE LIGHT.</h1>
      <p className="mt-3 opacity-80">Create your star and become part of tonight's opening.</p>
      <form onSubmit={submit} className="mt-6 space-y-6">
        <label className="block">
          <span className="font-bold">Nickname</span>
          <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" className="mt-2 w-full rounded-2xl border-2 border-background/30 bg-transparent px-4 py-3 text-lg outline-none focus:border-background" />
        </label>
        <div>
          <span className="font-bold">Star color</span>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {PALETTE_IDS.map((c) => (
              <button type="button" key={c} onClick={() => setColor(c)} aria-pressed={color === c} aria-label={PALETTE[c].label}
                className={`flex min-h-16 items-end rounded-2xl p-2 text-left text-[11px] font-bold leading-tight text-white transition ${color === c ? "scale-105 ring-4 ring-background" : "opacity-75"}`}
                style={{ background: PALETTE[c].hex, textShadow: "0 1px 3px rgba(0,0,0,.5)" }}>{PALETTE[c].label}</button>
            ))}
          </div>
          <p className="mt-2 font-mono text-xs opacity-70">{PALETTE[color].label} · joins Team {TEAMS[PALETTE[color].team].label}</p>
        </div>
        <div>
          <span className="font-bold">Star shape</span>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {STAR_TYPES.map((t) => (
              <Button variant="ghost" type="button" key={t} onClick={() => setType(t)} aria-pressed={type === t}
                className={`h-24 flex-col gap-2 rounded-md border ${type === t ? "border-background bg-background text-foreground" : "border-background/30"}`}><ConcertStar type={t} className="h-10 w-10" />{t}</Button>
            ))}
          </div>
        </div>
        <div>
          <span className="font-bold">Is this your first concert of this tour? <span className="font-normal opacity-60">(optional)</span></span>
          <div className="mt-2 flex gap-2">
            {[["yes", "Yes"], ["no", "No"], ["prefer_not", "Prefer not to say"]].map(([v, l]) => (
              <button type="button" key={v} onClick={() => setFirst(first === v ? "" : v ?? "")} className={`rounded-full border-2 px-3 py-2 text-sm ${first === v ? "border-background bg-background text-foreground" : "border-background/30"}`}>{l}</button>
            ))}
          </div>
        </div>
        {err && <p role="alert" className="text-sm">{err}</p>}
        <button disabled={busy} className="w-full rounded-full py-4 font-display text-lg font-extrabold text-white" style={{ background: PALETTE[color].hex }}>
          {busy ? "Creating…" : "Create my star ✦"}
        </button>
        <p className="text-center font-mono text-[11px] opacity-50">No email, phone or real name needed.</p>
      </form>
    </Shell>
  );
}

function StarHome({ fan, fanId, setFan, onActivate, onChangeColor }: { fan: LightFan; fanId: string; setFan: (f: LightFan) => void; onActivate: (sync: boolean) => void; onChangeColor: () => void }) {
  const info = colorInfo(fan.star_color);
  const hex = info.hex;
  const [board, setBoard] = useState<Record<Team, { members: number; lights: number }> | null>(null);
  const [note, setNote] = useState("");
  const refresh = () => getTeamBoard().then((b) => setBoard(b as Record<Team, { members: number; lights: number }>)).catch(() => {});
  useEffect(() => { refresh(); }, []);
  async function sendLight() {
    try {
      const r = await recordActivity({ data: { fanId, kind: "light_sent" } });
      setFan(r.fan);
      markAction("light");
      setNote(r.first ? `YOUR LIGHT JOINED TEAM ${TEAMS[info.team].label.toUpperCase()}.` : "Your light is already in — one per fan.");
      refresh();
    } catch { setNote("Couldn't send — try again."); }
  }
  return (
    <Shell>
      <Link to="/live" className="inline-flex items-center gap-1 font-mono text-xs opacity-70"><ArrowLeft className="h-3 w-3" /> Back to Live</Link>
      <div className="mt-6 rounded-3xl p-6 text-center text-white" style={{ background: `radial-gradient(circle at 50% 35%, ${hex}, #000 85%)` }}>
        <ConcertStar type={fan.star_type} className="mx-auto h-24 w-24" />
        <p className="mt-4 font-display text-3xl font-extrabold uppercase">{fan.nickname}'s star</p>
        <p className="mt-1 font-mono text-sm tracking-widest">{info.label.toUpperCase()} {fan.star_type.toUpperCase()} · TEAM {TEAMS[info.team].label.toUpperCase()}</p>
        <p className="mt-3 text-sm opacity-90">You're part of tonight's constellation.</p>
      </div>
      <h2 className="mt-6 font-display text-2xl font-bold">The Awakening</h2>
      <p className="mt-2 text-sm opacity-80">Concert Sync lets the presenter change this page’s light with the music. It does not control your phone. Choose Solid or EXIT anytime.</p>
      <p className="mt-2 text-sm opacity-80">加入演唱会模式后，网页灯光会跟随中控；可随时切回纯色或退出。</p>
      <Button onClick={() => onActivate(true)} className="mt-5 min-h-16 w-full whitespace-normal font-display text-lg font-bold"><Radio /> JOIN CONCERT SYNC</Button>
      <Button variant="ghost" onClick={() => onActivate(false)} className="mt-3 min-h-12 w-full border border-background/30"><Sun /> MY LIGHT ONLY</Button>
      <Button variant="ghost" className="mt-3 min-h-12 w-full border border-background/30" onClick={onChangeColor}>CHANGE STAR COLOR</Button>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Star Battle</h2>
        <p className="text-sm opacity-70">Friendly team glow. Every team lights the opening together.</p>
        <button onClick={sendLight} disabled={fan.light_sent} className="mt-3 w-full rounded-full border-2 py-3 font-bold disabled:opacity-60" style={{ borderColor: hex }}>
          {fan.light_sent ? "Light sent ✓" : "SEND YOUR LIGHT"}
        </button>
        {note && <p className="mt-2 text-center font-mono text-xs">{note}</p>}
        <ul className="mt-4 space-y-2">
          {board && [...TEAM_IDS].sort((a, b) => board[b].lights - board[a].lights).map((c) => {
            const max = Math.max(1, ...Object.values(board).map((x) => x.lights));
            return (
              <li key={c} className="rounded-2xl border border-background/20 p-3">
                <div className="flex justify-between text-sm font-bold"><span>TEAM {TEAMS[c].label.toUpperCase()}</span><span className="font-mono">{board[c].lights} lights · {board[c].members} stars</span></div>
                <div className="mt-2 h-2 rounded-full bg-background/10"><div className="h-2 rounded-full transition-all" style={{ width: `${(board[c].lights / max) * 100}%`, background: TEAMS[c].hex }} /></div>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 font-mono text-[11px] opacity-50">Real counts from fans who joined — nothing simulated.</p>
      </section>

    </Shell>
  );
}

type Mode = "solid" | "breathing" | "aurora" | "sync";
function Lightstick({ fan, initialMode, onExit, onChangeColor }: { fan: LightFan; initialMode: Mode; onExit: () => void; onChangeColor: () => void }) {
  const ownHex: string = colorInfo(fan.star_color).hex;
  const [mode, setMode] = useState<Mode>(initialMode);
  const [state, setState] = useState<ShowState | null>(null);
  const [status, setStatus] = useState<"connecting" | "live" | "lost">("connecting");
  const [now, setNow] = useState(Date.now());
  const lastGood = useRef<string>(ownHex);
  const clockOffset = useRef(0);

  // Fullscreen + wake lock after the tap that opened this screen.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    document.documentElement.requestFullscreen?.().catch(() => {});
    (navigator as any).wakeLock?.request("screen").then((l: any) => (lock = l)).catch(() => {});
    return () => {
      lock?.release().catch(() => {});
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (mode !== "sync") return;
    setStatus("connecting");
    recordActivity({ data: { fanId: fan.fan_id, kind: "concert_sync_entered" } }).catch(() => {});
    let active = true;
    const calibrate = async () => {
      const before = Date.now();
      try { const server = await getShowClock(); const after = Date.now(); if (active) clockOffset.current = server - (before + after) / 2; } catch {}
    };
    void calibrate();
    const clockPoll = setInterval(calibrate, 30000);
    const fetchState = () => supabase.from("show_state").select("*").eq("event_id", LIGHT_EVENT_ID).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) { setStatus("lost"); return; }
      if (data) { setState(previous => previous && Date.parse(previous.updated_at) > Date.parse(data.updated_at) ? previous : data as ShowState); setNow(Date.now() + clockOffset.current); setStatus("live"); }
    });
    fetchState();
    const ch = supabase
      .channel(`show-${LIGHT_EVENT_ID}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "show_state", filter: `event_id=eq.${LIGHT_EVENT_ID}` }, () => fetchState())
      .subscribe((s) => {
        if (s === "SUBSCRIBED") { setStatus("live"); fetchState(); }
        else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") setStatus("lost");
      });
    const bc = supabase.channel(SHOW_BROADCAST_CHANNEL)
      // A broadcast is only a "wake up" ping: re-read the admin-only table so nobody can spoof colors.
      .on("broadcast", { event: "state" }, () => fetchState())
      .subscribe();
    const poll = setInterval(fetchState, 4000);
    // Presence: lets Show Control count phones that are actually connected right now.
    const pres = supabase.channel(PRESENCE_CHANNEL, { config: { presence: { key: fan.fan_id } } });
    pres.subscribe((s) => { if (s === "SUBSCRIBED") pres.track({ at: Date.now() }).catch(() => {}); });
    // Safety net: re-read state when the phone wakes or regains focus.
    const onVis = () => { if (document.visibilityState === "visible") { void calibrate(); fetchState(); } };
    document.addEventListener("visibilitychange", onVis);
    return () => { active = false; clearInterval(clockPoll); clearInterval(poll); supabase.removeChannel(ch); supabase.removeChannel(bc); supabase.removeChannel(pres); document.removeEventListener("visibilitychange", onVis); };
  }, [mode, fan.fan_id]);

  useEffect(() => {
    if (mode !== "sync" || (state?.mode !== "awakening" && state?.mode !== "music")) return;
    setNow(Date.now() + clockOffset.current);
    const t = setInterval(() => setNow(Date.now() + clockOffset.current), 100);
    return () => clearInterval(t);
  }, [mode, state?.mode]);

  let hex: string = ownHex, breathing = mode === "breathing", aurora = mode === "aurora", message: string | undefined, waiting = false;
  if (mode === "sync") {
    if (status === "lost" && state?.mode !== "music") hex = lastGood.current;
    else {
      const d = displayFor(state, fan.star_color, now);
      hex = d.hex; breathing = d.breathing; aurora = d.aurora; message = d.message; waiting = !!d.waiting;
      lastGood.current = hex;
    }
  }

  return (
    <div className="lightstick fixed inset-0 z-50 flex flex-col overflow-hidden text-white" style={{ background: hex, ["--glow" as string]: hex }}>
      {aurora && <div className="lightstick-aurora pointer-events-none absolute inset-0" />}
      <div className={`pointer-events-none absolute inset-0 bg-black ${breathing ? "animate-breathe" : "opacity-0"}`} />
      <div className="relative flex items-center justify-between p-3">
        <button onClick={onExit} aria-label="Exit lightstick" className="flex min-h-11 items-center gap-1 rounded-full bg-black/35 px-4 text-sm font-bold backdrop-blur"><X className="h-4 w-4" /> EXIT</button>
        <Button variant="ghost" className="min-h-11 border border-background/40 bg-foreground/50 text-background" onClick={onChangeColor}>CHANGE COLOR</Button>
        {mode === "sync" && (
          <span className="flex items-center gap-1 rounded-full bg-black/35 px-3 py-2 font-mono text-[11px] backdrop-blur">
            {status === "live" ? <><Radio className="h-3 w-3 animate-pulse" /> LIVE</> : status === "lost" ? <><WifiOff className="h-3 w-3" /> RECONNECTING</> : "CONNECTING…"}
          </span>
        )}
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="lightstick-star"><ConcertStar type={fan.star_type} className="h-44 w-44" /></div>
        {mode === "sync" && status === "lost" && <p className="mt-6 rounded-2xl bg-black/30 px-4 py-2 font-bold">Lost connection. Holding your color — reconnecting.</p>}
        {mode === "sync" && status !== "lost" && waiting && (
          <div className="mt-6 rounded-2xl bg-black/25 px-5 py-3 backdrop-blur"><p className="font-display text-2xl font-extrabold">CONNECTED TO THE AWAKENING</p><p className="text-sm opacity-90">Waiting for the music to begin.</p></div>
        )}
        {message && <p className="mt-6 font-display text-3xl font-extrabold drop-shadow">{message}</p>}
      </div>
      <div className="relative grid grid-cols-4 gap-2 p-3 pb-6">
        {([["solid", "Solid", Sun], ["breathing", "Breathe", Waves], ["aurora", "Aurora", Sparkles], ["sync", "Concert Sync", Radio]] as const).map(([m, l, Icon]) => (
          <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold backdrop-blur ${mode === m ? "bg-white/90 text-black" : "bg-black/35"}`}>
            <Icon className="h-5 w-5" />{l}
          </button>
        ))}
      </div>
    </div>
  );
}
