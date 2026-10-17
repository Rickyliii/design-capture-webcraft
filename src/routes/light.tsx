import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Radio, Star, Sun, Waves, WifiOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadPass } from "@/lib/fanPass";
import { markAction } from "@/lib/afterlight";
import {
  LIGHT_EVENT_ID, STAR_COLORS, STAR_TYPES, displayFor, isStarColor,
  type ShowState, type StarColor, type StarType,
} from "@/lib/light";
import { getFan, getTeamBoard, recordActivity, registerFan, type LightFan } from "@/lib/light.functions";

export const Route = createFileRoute("/light")({
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

  useEffect(() => {
    const fid = fanId();
    setId(fid);
    getFan({ data: { fanId: fid } }).then(setFan).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || !id) return <Shell><p className="text-center font-mono text-sm opacity-70">Finding your star…</p></Shell>;
  if (!fan) return <Onboarding fanId={id} onDone={setFan} />;
  if (stick) return <Lightstick fan={fan} onExit={() => setStick(false)} />;
  return <StarHome fan={fan} fanId={id} setFan={setFan} onActivate={async () => {
    setStick(true);
    try { const r = await recordActivity({ data: { fanId: id, kind: "lightstick_activated" } }); setFan(r.fan); } catch {}
  }} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-foreground px-5 py-8 text-background"><div className="mx-auto max-w-md">{children}</div></div>;
}

function Onboarding({ fanId, onDone }: { fanId: string; onDone: (f: LightFan) => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<StarColor>("violet");
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
            {(Object.keys(STAR_COLORS) as StarColor[]).map((c) => (
              <button type="button" key={c} onClick={() => setColor(c)} aria-pressed={color === c}
                className={`rounded-2xl py-4 text-sm font-bold text-white ${color === c ? "ring-4 ring-background" : "opacity-70"}`}
                style={{ background: STAR_COLORS[c].hex }}>{STAR_COLORS[c].label}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="font-bold">Star type</span>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {STAR_TYPES.map((t) => (
              <button type="button" key={t} onClick={() => setType(t)} aria-pressed={type === t}
                className={`rounded-2xl border-2 py-3 text-sm font-bold ${type === t ? "border-background bg-background text-foreground" : "border-background/30"}`}>{t}</button>
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
        <button disabled={busy} className="w-full rounded-full py-4 font-display text-lg font-extrabold text-white" style={{ background: STAR_COLORS[color].hex }}>
          {busy ? "Creating…" : "Create my star ✦"}
        </button>
        <p className="text-center font-mono text-[11px] opacity-50">No email, phone or real name needed.</p>
      </form>
    </Shell>
  );
}

function StarHome({ fan, fanId, setFan, onActivate }: { fan: LightFan; fanId: string; setFan: (f: LightFan) => void; onActivate: () => void }) {
  const color = isStarColor(fan.star_color) ? fan.star_color : "violet";
  const hex = STAR_COLORS[color].hex;
  const [board, setBoard] = useState<Record<StarColor, { members: number; lights: number }> | null>(null);
  const [note, setNote] = useState("");
  const refresh = () => getTeamBoard().then((b) => setBoard(b as Record<StarColor, { members: number; lights: number }>)).catch(() => {});
  useEffect(() => { refresh(); }, []);
  async function sendLight() {
    try {
      const r = await recordActivity({ data: { fanId, kind: "light_sent" } });
      setFan(r.fan);
      markAction("light");
      setNote(r.first ? `YOUR LIGHT JOINED TEAM ${STAR_COLORS[color].label.toUpperCase()}.` : "Your light is already in — one per fan.");
      refresh();
    } catch { setNote("Couldn't send — try again."); }
  }
  const achievements = [
    ["Star Created", true], ["Lightstick Activated", fan.activated], ["Collective Opening Contributor", fan.light_sent], ["Constellation Challenge Completed", fan.challenge_done],
  ] as const;
  return (
    <Shell>
      <Link to="/live" className="inline-flex items-center gap-1 font-mono text-xs opacity-70"><ArrowLeft className="h-3 w-3" /> Back to Live</Link>
      <div className="mt-6 rounded-3xl p-6 text-center text-white" style={{ background: `radial-gradient(circle at 50% 35%, ${hex}, #000 85%)` }}>
        <Star className="mx-auto h-20 w-20 drop-shadow-[0_0_24px_rgba(255,255,255,0.8)]" fill="currentColor" />
        <p className="mt-4 font-display text-3xl font-extrabold uppercase">{fan.nickname}'s star</p>
        <p className="mt-1 font-mono text-sm tracking-widest">{STAR_COLORS[color].label.toUpperCase()} {fan.star_type.toUpperCase()}</p>
        <p className="mt-3 text-sm opacity-90">You're part of tonight's constellation.</p>
      </div>
      <button onClick={onActivate} className="mt-5 w-full rounded-full py-5 font-display text-xl font-extrabold text-white" style={{ background: hex, boxShadow: `0 0 40px ${hex}` }}>
        ACTIVATE MY LIGHT
      </button>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Star Battle</h2>
        <p className="text-sm opacity-70">Friendly team glow. Every team lights the opening together.</p>
        <button onClick={sendLight} disabled={fan.light_sent} className="mt-3 w-full rounded-full border-2 py-3 font-bold disabled:opacity-60" style={{ borderColor: hex }}>
          {fan.light_sent ? "Light sent ✓" : "SEND YOUR LIGHT"}
        </button>
        {note && <p className="mt-2 text-center font-mono text-xs">{note}</p>}
        <ul className="mt-4 space-y-2">
          {board && (Object.keys(STAR_COLORS) as StarColor[]).sort((a, b) => board[b].lights - board[a].lights).map((c) => {
            const max = Math.max(1, ...Object.values(board).map((x) => x.lights));
            return (
              <li key={c} className="rounded-2xl border border-background/20 p-3">
                <div className="flex justify-between text-sm font-bold"><span>TEAM {STAR_COLORS[c].label.toUpperCase()}</span><span className="font-mono">{board[c].lights} lights · {board[c].members} stars</span></div>
                <div className="mt-2 h-2 rounded-full bg-background/10"><div className="h-2 rounded-full transition-all" style={{ width: `${(board[c].lights / max) * 100}%`, background: STAR_COLORS[c].hex }} /></div>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 font-mono text-[11px] opacity-50">Real counts from fans who joined — nothing simulated.</p>
      </section>

      <ConnectStars done={fan.challenge_done} onComplete={async () => {
        try { const r = await recordActivity({ data: { fanId, kind: "challenge_completed" } }); setFan(r.fan); } catch {}
      }} />

      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Tonight's achievements</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {achievements.map(([l, ok]) => (
            <li key={l} className={`rounded-2xl border-2 p-3 text-sm font-bold ${ok ? "" : "opacity-40"}`} style={ok ? { borderColor: hex } : undefined}>{ok ? "✦ " : "○ "}{l}</li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[11px] opacity-50">Each counts once per show. Sending your light also counts toward Rewards.</p>
      </section>
    </Shell>
  );
}

const STARS = [[15, 70], [35, 30], [55, 55], [75, 20], [88, 65]];
function ConnectStars({ done, onComplete }: { done: boolean; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [miss, setMiss] = useState(false);
  const complete = step >= STARS.length;
  function tap(i: number) {
    if (complete) return;
    if (i === step) { setStep(step + 1); setMiss(false); if (step + 1 === STARS.length) onComplete(); }
    else setMiss(true);
  }
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl font-extrabold">Connect the Stars</h2>
      <p className="text-sm opacity-70">Tap the stars in order, 1 → 5. {done && "Starlight Explorer Badge earned ✦"}</p>
      <div className="relative mt-3 aspect-[4/3] rounded-3xl bg-background/5">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {STARS.slice(0, Math.max(0, step)).map((s, i) => i > 0 && (
            <line key={i} x1={STARS[i - 1]![0]} y1={STARS[i - 1]![1]} x2={s[0]} y2={s[1]} stroke="currentColor" strokeWidth="0.8" />
          ))}
        </svg>
        {STARS.map(([x, y], i) => (
          <button key={i} onClick={() => tap(i)} aria-label={`Star ${i + 1}`}
            className={`absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono text-xs font-bold ${i < step ? "bg-background text-foreground shadow-[0_0_20px_currentColor]" : "border-2 border-background/50"}`}
            style={{ left: `${x}%`, top: `${y}%` }}>{i + 1}</button>
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-xs">{complete ? "CONSTELLATION COMPLETE." : miss ? `Try star ${step + 1}` : " "}</p>
      {complete && <button onClick={() => setStep(0)} className="mx-auto mt-1 block text-xs underline opacity-70">Play again</button>}
    </section>
  );
}

type Mode = "solid" | "breathing" | "sync";
function Lightstick({ fan, onExit }: { fan: LightFan; onExit: () => void }) {
  const own: StarColor = isStarColor(fan.star_color) ? fan.star_color : "violet";
  const [mode, setMode] = useState<Mode>("solid");
  const [state, setState] = useState<ShowState | null>(null);
  const [status, setStatus] = useState<"connecting" | "live" | "lost">("connecting");
  const [now, setNow] = useState(Date.now());
  const lastGood = useRef<string>(STAR_COLORS[own].hex);

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
    supabase.from("show_state").select("*").eq("event_id", LIGHT_EVENT_ID).maybeSingle().then(({ data }) => data && setState(data as ShowState));
    const ch = supabase
      .channel(`show-${LIGHT_EVENT_ID}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "show_state", filter: `event_id=eq.${LIGHT_EVENT_ID}` }, (p) => setState(p.new as ShowState))
      .subscribe((s) => {
        if (s === "SUBSCRIBED") {
          setStatus("live");
          supabase.from("show_state").select("*").eq("event_id", LIGHT_EVENT_ID).maybeSingle().then(({ data }) => data && setState(data as ShowState));
        } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") setStatus("lost");
      });
    return () => { supabase.removeChannel(ch); };
  }, [mode, fan.fan_id]);

  useEffect(() => {
    if (mode !== "sync" || state?.mode !== "awakening") return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [mode, state?.mode]);

  let hex: string = STAR_COLORS[own].hex, breathing = mode === "breathing", message: string | undefined, waiting = false;
  if (mode === "sync") {
    if (status === "lost") hex = lastGood.current;
    else {
      const d = displayFor(state, own, now);
      hex = d.hex; breathing = d.breathing; message = d.message; waiting = !!d.waiting;
      lastGood.current = hex;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white" style={{ background: hex, transition: "background-color 1.2s ease" }}>
      <div className={`pointer-events-none absolute inset-0 bg-black ${breathing ? "animate-breathe" : "opacity-0"}`} />
      <div className="relative flex items-center justify-between p-4">
        <button onClick={onExit} className="flex items-center gap-1 rounded-full bg-black/30 px-4 py-2 text-sm font-bold backdrop-blur"><X className="h-4 w-4" /> EXIT LIGHTSTICK</button>
        {mode === "sync" && (
          <span className="flex items-center gap-1 rounded-full bg-black/30 px-3 py-2 font-mono text-[11px] backdrop-blur">
            {status === "live" ? <><Radio className="h-3 w-3 animate-pulse" /> CONNECTED</> : status === "lost" ? <><WifiOff className="h-3 w-3" /> CONNECTION LOST</> : "CONNECTING…"}
          </span>
        )}
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Star className="h-40 w-40 drop-shadow-[0_0_60px_rgba(255,255,255,0.9)]" fill="currentColor" />
        {mode === "sync" && status === "lost" && <p className="mt-6 font-bold">Lost connection to the show. Holding your color — it'll reconnect.</p>}
        {mode === "sync" && status !== "lost" && waiting && (
          <><p className="mt-6 font-display text-2xl font-extrabold">CONNECTED TO LIVE</p><p className="mt-1 opacity-90">Waiting for the opening ceremony.</p></>
        )}
        {message && <p className="mt-6 font-display text-3xl font-extrabold">{message}</p>}
      </div>
      <div className="relative grid grid-cols-3 gap-2 p-4 pb-8">
        {([["solid", "Solid", Sun], ["breathing", "Breathe", Waves], ["sync", "Concert Sync", Radio]] as const).map(([m, l, Icon]) => (
          <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
            className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-bold backdrop-blur ${mode === m ? "bg-white/90 text-black" : "bg-black/30"}`}>
            <Icon className="h-5 w-5" />{l}
          </button>
        ))}
      </div>
    </div>
  );
}
