import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { BarChart3, Radio, Users, Zap, RefreshCw, LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getShowStats } from "@/lib/light.functions";
import { PRESENCE_CHANNEL, TEAMS, TEAM_IDS } from "@/lib/light";
import { activationRate, participationActivities, type ParticipationStats } from "@/lib/artist-stats";

export const Route = createFileRoute("/artists")({
  head: () => ({ meta: [
    { title: "Artist Impact — FanDrop" },
    { name: "description", content: "Artist view of live FanDrop audience participation and lightstick activation." },
    { property: "og:title", content: "Artist Impact — FanDrop" },
    { property: "og:description", content: "Live audience participation and lightstick activation for the artist team." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Artists,
});

function Artists() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  return <AppShell kicker="Artists version" title="Artist Impact">
    <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground"><BarChart3 className="h-4 w-4" />The Awakening · Live participation</div>
    {session === undefined ? <p role="status">Loading artist view…</p> : session ? <Impact key={session.user.id} /> : <ArtistSignIn />}
  </AppShell>;
}

function ArtistSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <section className="border-y py-6">
    <h2 className="text-xl font-bold">Artist team sign-in</h2>
    <p className="mt-2 text-sm text-muted-foreground">Use your existing show administrator account to view live participation.</p>
    <form className="mt-5 space-y-4" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError("");
      try {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) setError(result.error.message);
      } catch { setError("Unable to sign in. Please try again."); }
      finally { setBusy(false); }
    }}>
      <label className="block text-sm font-bold">Email<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-md border bg-card px-3 py-3 font-normal" /></label>
      <label className="block text-sm font-bold">Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-md border bg-card px-3 py-3 font-normal" /></label>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  </section>;
}

function Impact() {
  const [stats, setStats] = useState<ParticipationStats | null>(null);
  const [online, setOnline] = useState<number | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let pending = false;
    const load = async () => {
      if (pending) return;
      pending = true;
      try {
        const next = await getShowStats();
        if (active) { setStats(next); setUpdated(new Date()); setError(""); }
      } catch (e) {
        if (active) setError(e instanceof Error && e.message.includes("Not authorized") ? "Artist data is available to show administrators only." : "Live data could not refresh. Please try again.");
      } finally { pending = false; }
    };
    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => { active = false; clearInterval(timer); };
  }, [retry]);
  const hasStats = stats !== null;
  useEffect(() => {
    if (!hasStats) return;
    const channel = supabase.channel(PRESENCE_CHANNEL);
    channel.on("presence", { event: "sync" }, () => setOnline(Object.keys(channel.presenceState()).length))
      .subscribe(status => { if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") setOnline(null); });
    return () => { void supabase.removeChannel(channel); };
  }, [hasStats]);
  const rate = stats ? activationRate(stats) : null;
  return <>
    <section className="-mx-5 bg-foreground px-5 py-6 text-background">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Audience pulse</h2>
        <span className="flex items-center gap-1.5 text-xs font-bold text-primary"><Radio className="h-3.5 w-3.5" />{error ? "RECONNECTING" : updated ? "LIVE" : "CONNECTING"}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{ label: "Registered fans", value: stats?.registered, icon: Users }, { label: "Connected now", value: online, icon: Radio }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-md border border-background/20 p-4"><Icon className="mb-3 h-5 w-5 text-primary" /><p className="font-display text-3xl font-extrabold" data-metric={label}>{value?.toLocaleString() ?? "—"}</p><p className="mt-1 text-xs text-background/70">{label}</p></div>)}
      </div>
      <div className="mt-5 flex items-end justify-between border-t border-background/20 pt-5"><div><p className="flex items-center gap-2 text-sm"><Zap className="h-4 w-4 text-accent" />Lightstick activation</p><p className="mt-1 text-xs text-background/60">{stats ? `${stats.activated} of ${stats.registered} registered fans` : "Awaiting participation data"}</p></div><p className="font-display text-4xl font-extrabold text-primary">{rate === null ? "—" : `${rate}%`}</p></div>
    </section>
    {error && <div className="mt-4 flex items-center gap-3" role="alert"><p className="flex-1 text-sm text-destructive">{error}{stats ? " Showing the last successful update." : ""}</p><Button variant="outline" size="icon" aria-label="Retry live data" onClick={() => setRetry(v => v + 1)}><RefreshCw className="h-4 w-4" /></Button></div>}
    <section className="py-6">
      <h2 className="mb-5 text-xl font-bold">Engagement by activity</h2>
      <div className="space-y-5">{stats ? participationActivities(stats).map(activity => <div key={activity.label}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{activity.label}</span><strong>{activity.count.toLocaleString()}</strong></div><progress className="artist-progress" aria-label={activity.label} value={activity.count} max={Math.max(1, stats.registered)} /></div>) : <p role="status" className="text-sm text-muted-foreground">{error ? "Live metrics unavailable." : "Loading participation…"}</p>}</div>
      <p className="mt-4 text-xs text-muted-foreground">Unique fans per activity · This event</p>
    </section>
    {stats && <section className="border-t py-5"><h2 className="mb-4 text-lg font-bold">Crowd colors</h2><div className="grid grid-cols-4 gap-2">{TEAM_IDS.map(team => <div key={team} className="text-center"><span className={`star-swatch star-swatch-${team === "violet" ? "electric_violet" : team === "blue" ? "cosmic_blue" : team === "rose" ? "sunset_rose" : "solar_gold"} mx-auto mb-2 block`} /><p className="text-lg font-bold">{stats.teams[team] ?? 0}</p><p className="text-xs text-muted-foreground">{TEAMS[team].label}</p></div>)}</div></section>}
    <div className="border-t py-4 text-xs text-muted-foreground"><p>Post-show return · Not tracked yet</p><p className="mt-2">{updated ? `Updated ${updated.toLocaleTimeString()} · Refreshes every 5 seconds` : "Awaiting first update"}</p><p className="mt-1">Connected now counts synced devices, not verified attendance.</p></div>
    <Button variant="ghost" size="sm" onClick={() => void supabase.auth.signOut()}><LogOut className="h-4 w-4" />Sign out</Button>
  </>;
}