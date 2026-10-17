import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LIGHT_EVENT_ID, STAR_COLORS, type Command, type ShowState } from "@/lib/light";
import { amIAdmin, getShowStats, sendShowCommand } from "@/lib/light.functions";

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
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">LIVE SHOW CONTROL</h1>
        <p className="font-mono text-xs opacity-60">Justin Bieber · Scotiabank Arena · event {LIGHT_EVENT_ID}</p>
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

const BUTTONS: { cmd: Command; label: string; bg?: string }[] = [
  { cmd: "violet", label: "ALL VIOLET", bg: STAR_COLORS.violet.hex },
  { cmd: "rose", label: "ALL ROSE", bg: STAR_COLORS.rose.hex },
  { cmd: "gold", label: "ALL GOLD", bg: STAR_COLORS.gold.hex },
  { cmd: "blue", label: "ALL BLUE", bg: STAR_COLORS.blue.hex },
  { cmd: "team", label: "RESTORE TEAM COLORS" },
  { cmd: "breathing", label: "START BREATHING" },
  { cmd: "awakening", label: "START AWAKENING" },
  { cmd: "stop", label: "STOP SHOW" },
];

function Panel({ session }: { session: Session }) {
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getShowStats>> | null>(null);
  const [state, setState] = useState<ShowState | null>(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState<Command | null>(null);

  useEffect(() => { amIAdmin().then(setAdmin).catch(() => setAdmin(false)); }, [session.user.id]);
  useEffect(() => {
    if (!admin) return;
    const load = () => getShowStats().then(setStats).catch(() => {});
    load();
    supabase.from("show_state").select("*").eq("event_id", LIGHT_EVENT_ID).maybeSingle().then(({ data }) => data && setState(data as ShowState));
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [admin]);

  async function send(cmd: Command, label: string) {
    setBusy(cmd);
    try {
      const row = await sendShowCommand({ data: { command: cmd } });
      setState(row as ShowState);
      setToast(`✓ ${label} sent to all connected phones`);
    } catch { setToast("✕ Command failed — try again"); }
    setBusy(null);
    setTimeout(() => setToast(""), 3000);
  }

  const out = <button onClick={() => supabase.auth.signOut()} className="text-sm underline opacity-60">Sign out ({session.user.email})</button>;
  if (admin === null) return <p className="mt-8 opacity-70">Checking access…</p>;
  if (!admin) return <div className="mt-8 space-y-2"><p>This account isn't a show admin, so it can't control the lights.</p>{out}</div>;

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Registered fans", stats?.registered], ["Lightsticks activated", stats?.activated], ["Lights sent", stats?.lights], ["Constellations done", stats?.challenges]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border border-background/20 p-4"><p className="font-mono text-xs opacity-60">{l}</p><p className="font-display text-3xl font-extrabold">{v ?? "–"}</p></div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        {stats && (Object.keys(STAR_COLORS) as (keyof typeof STAR_COLORS)[]).map((c) => (
          <span key={c} className="flex items-center gap-2 rounded-full border border-background/20 px-3 py-1"><span className="h-3 w-3 rounded-full" style={{ background: STAR_COLORS[c].hex }} />Team {STAR_COLORS[c].label}: {stats.teams[c] ?? 0}</span>
        ))}
      </div>
      <div className="rounded-2xl border border-background/20 p-4 font-mono text-sm">
        <p>Mode: <b>{state?.is_show_active ? state.mode.toUpperCase() : "STOPPED"}</b>{state?.global_color ? ` · ${state.global_color.toUpperCase()}` : ""}{state?.sequence_name ? ` · ${state.sequence_name}` : ""}</p>
        <p className="opacity-60">Last command: {state ? new Date(state.updated_at).toLocaleTimeString() : "–"}</p>
        <p className="opacity-60">Counts are registrations, not live connections.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {BUTTONS.map((b) => (
          <button key={b.cmd} disabled={!!busy} onClick={() => send(b.cmd, b.label)}
            className={`min-h-24 rounded-2xl border-2 border-background/30 p-4 font-display text-lg font-extrabold disabled:opacity-50 ${b.bg ? "text-white" : ""}`}
            style={b.bg ? { background: b.bg, borderColor: b.bg } : undefined}>
            {busy === b.cmd ? "Sending…" : b.label}
          </button>
        ))}
      </div>
      {toast && <p role="status" className="rounded-xl bg-background p-3 text-center font-bold text-foreground">{toast}</p>}
      <div className="flex justify-between">{out}<Link to="/light" className="text-sm underline opacity-60">Open fan lightstick</Link></div>
    </div>
  );
}
