import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Radio, Users, Zap, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getArtistStats } from "@/lib/artist.functions";
import { PRESENCE_CHANNEL, TEAMS, TEAM_IDS } from "@/lib/light";
import { activationRate, audienceRetentionRate, formatMinutes, participationActivities, type ParticipationStats } from "@/lib/artist-stats";

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
  return <AppShell kicker="Artists version" title="Artist Impact">
    <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground"><BarChart3 className="h-4 w-4" />The Awakening · Live participation</div>
    <Impact />
  </AppShell>;
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
        const next = await getArtistStats();
        if (active) { setStats(next); setUpdated(new Date()); setError(""); }
      } catch {
        if (active) setError("Live data could not refresh. Please try again.");
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
  const retention = stats ? audienceRetentionRate(stats) : null;
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
    {stats?.afterShow && <section className="border-t py-5"><h2 className="mb-1 text-lg font-bold">After the show</h2><p className="mb-4 text-xs text-muted-foreground">Memory cards fans saved after joining the light show · Includes demo activity</p><div className="mb-5 border-b pb-5"><div className="flex items-end justify-between gap-3"><div><h3 className="text-sm font-bold">Audience retention rate</h3><p className="mt-1 text-xs text-muted-foreground">{stats.afterShow.memoryCards} of {stats.registered} registered fans saved a memory card</p></div><p className="shrink-0 font-display text-4xl font-extrabold text-primary" data-metric="Audience retention rate">{retention === null ? "—" : `${retention}%`}</p></div><p className="mt-3 text-xs text-muted-foreground">Post-show engagement · Not repeat-visit tracking</p></div><div className="grid grid-cols-3 gap-2">{[{ label: "Memory cards", value: stats.afterShow.memoryCards.toLocaleString() }, { label: "Shared", value: stats.afterShow.shared.toLocaleString() }, { label: "Median time to card", value: formatMinutes(stats.afterShow.medianMinutes) }].map(m => <div key={m.label} className="rounded-md border p-3"><p className="font-display text-2xl font-extrabold">{m.value}</p><p className="mt-1 text-xs text-muted-foreground">{m.label}</p></div>)}</div><p className="mt-3 text-xs text-muted-foreground">Time measured from creating a star to saving the first memory card.</p></section>}
    <div className="border-t py-4 text-xs text-muted-foreground"><p className="mt-2">{updated ? `Updated ${updated.toLocaleTimeString()} · Refreshes every 5 seconds` : "Awaiting first update"}</p><p className="mt-1">Connected now counts synced devices, not verified attendance.</p></div>
  </>;
}