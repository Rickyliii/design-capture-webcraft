import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LIGHT_EVENT_ID, PRESENCE_CHANNEL, TEAMS, TEAM_IDS, isHex, type Command, type ShowState } from "@/lib/light";
import { amIAdmin, getShowStats, sendShowCommand } from "@/lib/light.functions";
import { ParticipationQR } from "@/components/ParticipationQR";
import { MusicShowConsole } from "@/components/MusicShowConsole";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/show-control")({
  head: () => ({
    meta: [
      { title: "Live Show Control — FanDrop" },
      { name: "description", content: "Presenter control center for FanDrop Live Light." },
      { property: "og:title", content: "Live Show Control — FanDrop" },
      { property: "og:description", content: "Presenter control center for FanDrop Live Light." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShowControl,
});

function ShowControl() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <div className="min-h-screen bg-foreground p-5 text-background">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-mono text-xs opacity-60">FANDROP · SHOW CONTROL</p><h1 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">The Awakening</h1></div><Button variant="secondary" asChild><Link to="/stage" target="_blank"><ExternalLink className="h-4 w-4" />OPEN STAGE SCREEN</Link></Button></header>
        {session === undefined ? null : session ? <Panel session={session} /> : <SignIn />}
      </div>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [signup, setSignup] = useState(false);
  const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    if (signup) {
      const { data, error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${window.location.origin}/show-control` } });
      if (error) return setMsg(error.message);
      if (!data.session) setMsg("Check your inbox to confirm your email, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message);
    }
  }
  return (
    <form onSubmit={go} className="mt-8 max-w-sm space-y-3">
      <p className="opacity-80">Presenter sign-in. Only accounts with the admin role can control the lights.</p>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border-2 border-background/30 bg-transparent px-4 py-3" />
      <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="w-full rounded-xl border-2 border-background/30 bg-transparent px-4 py-3" />
      <button className="w-full rounded-xl bg-background py-3 font-bold text-foreground">{signup ? "Create account" : "Sign in"}</button>
      <button type="button" onClick={() => setSignup(!signup)} className="text-sm underline opacity-70">{signup ? "Have an account? Sign in" : "First time? Create the presenter account"}</button>
      {msg && <p role="alert" className="text-sm">{msg}</p>}
    </form>
  );
}

const COLOR_BUTTONS: { cmd: Command; label: string; bg: string }[] = TEAM_IDS.map((t) => ({ cmd: t, label: `ALL ${TEAMS[t].label.toUpperCase()}`, bg: TEAMS[t].hex }));
const SHOW_BUTTONS: { cmd: Command; label: string }[] = [
  { cmd: "team", label: "RESTORE PERSONAL COLORS" },
  { cmd: "breathing", label: "START BREATHING" },
  { cmd: "aurora", label: "START AURORA" },
];

function describe(state: ShowState | null) {
  if (!state) return "–";
  if (!state.is_show_active) return "STOPPED — phones waiting";
  if (state.mode === "color") return `SOLID · ${state.global_color && state.global_color in TEAMS ? `ALL ${state.global_color.toUpperCase()}` : state.global_color}`;
  if (state.mode === "team") return "PERSONAL COLORS";
  if (state.mode === "awakening") return "THE AWAKENING";
  if (state.mode === "awakening_paused") return "THE AWAKENING · PAUSED";
  return state.mode.toUpperCase();
}

function Panel({ session }: { session: Session }) {
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getShowStats>> | null>(null);
  const [state, setState] = useState<ShowState | null>(null);
  const [online, setOnline] = useState<number | null>(null);
  const [last, setLast] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [custom, setCustom] = useState("#22D3EE");

  useEffect(() => { amIAdmin().then(setAdmin).catch(() => setAdmin(false)); }, [session.user.id]);
  useEffect(() => {
    if (!admin) return;
    const load = () => { getShowStats().then(setStats).catch(() => {}); supabase.from("show_state").select("*").eq("event_id", LIGHT_EVENT_ID).maybeSingle().then(({ data }) => data && setState(data as ShowState)); };
    load();
    supabase.from("show_state").select("*").eq("event_id", LIGHT_EVENT_ID).maybeSingle().then(({ data }) => data && setState(data as ShowState));
    const t = setInterval(load, 5000);
    // Live state echo: confirms the command actually landed in the shared backend.
    const ch = supabase.channel(`ctrl-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "show_state", filter: `event_id=eq.${LIGHT_EVENT_ID}` }, (p) => setState(p.new as ShowState))
      .subscribe();
    const pres = supabase.channel(PRESENCE_CHANNEL);
    pres.on("presence", { event: "sync" }, () => setOnline(Object.keys(pres.presenceState()).length)).subscribe();
    return () => { clearInterval(t); supabase.removeChannel(ch); supabase.removeChannel(pres); };
  }, [admin]);

  async function send(cmd: Command, label: string, hex?: string) {
    if (cmd !== "stop" && busy) return;
    setBusy(label);
    try {
      const row = await sendShowCommand({ data: { command: cmd, hex } });
      setState(row as ShowState);
      setLast({ ok: true, text: `${label} — sent ${new Date().toLocaleTimeString()}` });
    } catch (e) { setLast({ ok: false, text: `${label} failed: ${(e as Error).message || "try again"}` }); }
    setBusy(null);
  }

  const out = <button onClick={() => supabase.auth.signOut()} className="text-sm underline opacity-60">Sign out ({session.user.email})</button>;
  if (admin === null) return <p className="mt-8 opacity-70">Checking access…</p>;
  if (!admin) return <div className="mt-8 space-y-2"><p>This account isn't a show admin, so it can't control the lights.</p>{out}</div>;

  const big = "min-h-24 rounded-2xl border-2 p-4 font-display text-lg font-extrabold transition active:scale-95 disabled:opacity-50";
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Registered fans", stats?.registered],
          ["Connected now", online],
        ].map(([l, v, small]) => (
          <div key={l as string} className="rounded-md border border-background/20 p-4">
            <p className="font-mono text-xs opacity-60">{l as string}</p>
            <p className={`font-display font-extrabold ${small ? "text-base" : "text-3xl"}`}>{(v as string | number | null | undefined) ?? "–"}</p>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs opacity-70">{describe(state)}</p>
      <MusicShowConsole state={state} onState={setState} send={send} />
      {last && <p role="status" className={`font-mono text-xs ${last.ok ? "opacity-70" : "text-destructive"}`}>{last.ok ? "✓ " : "✕ "}{last.text}</p>}
      <details className="border-y border-background/20 py-4"><summary className="cursor-pointer font-bold">Participant QR code</summary><ParticipationQR /></details>
      <details className="border-y border-background/20 py-3"><summary className="cursor-pointer font-bold">Command history & team counts</summary><p className={`mt-3 p-3 font-mono text-sm ${last && !last.ok ? "text-destructive" : "opacity-60"}`} role="status">
        Last command: {last ? `${last.ok ? "✓" : "✕"} ${last.text}` : "none yet this session"}
      </p><p className="font-mono text-xs opacity-60">Lights sent: {stats?.lights ?? "–"}</p></details>

      <details className="border-y border-background/20 py-4"><summary className="cursor-pointer font-bold">Manual lighting</summary><div className="mt-4 space-y-6">
      <section>
        <h2 className="sticker mb-2 opacity-70">Whole-crowd color</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {COLOR_BUTTONS.map((b) => (
            <button key={b.cmd} disabled={!!busy} onClick={() => send(b.cmd, b.label)} className={`${big} text-white`} style={{ background: b.bg, borderColor: b.bg }}>
              {busy === b.label ? "Sending…" : b.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="sticker mb-2 opacity-70">Custom color</h2>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-background/20 p-3">
          <input type="color" value={custom} onChange={(e) => setCustom(e.target.value.toUpperCase())} aria-label="Pick a color" className="h-16 w-20 cursor-pointer rounded-xl border-0 bg-transparent" />
          <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={7} aria-label="Hex color" className="w-28 rounded-xl border-2 border-background/30 bg-transparent px-3 py-3 font-mono" />
          <button disabled={!!busy || !isHex(custom)} onClick={() => send("custom", `COLOR ${custom.toUpperCase()}`, custom)}
            className="min-h-16 flex-1 rounded-2xl px-5 font-display text-lg font-extrabold text-white disabled:opacity-50" style={{ background: isHex(custom) ? custom : undefined }}>
            SEND COLOR TO FANS
          </button>
        </div>
      </section>

      <section>
        <h2 className="sticker mb-2 opacity-70">Show moments</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SHOW_BUTTONS.map((b) => (
            <button key={b.cmd} disabled={!!busy} onClick={() => send(b.cmd, b.label)} className={`${big} border-background/30`}>
              {busy === b.label ? "Sending…" : b.label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 text-sm">
        {stats && TEAM_IDS.map((c) => (
          <span key={c} className="flex items-center gap-2 rounded-full border border-background/20 px-3 py-1"><span className="h-3 w-3 rounded-full" style={{ background: TEAMS[c].hex }} />Team {TEAMS[c].label}: {stats.teams[c] ?? 0}</span>
        ))}
      </div>
      </div></details>
      <div className="flex flex-wrap justify-between gap-3">{out}<Link to="/light" className="text-sm underline opacity-60">Open fan lightstick</Link></div>
    </div>
  );
}
