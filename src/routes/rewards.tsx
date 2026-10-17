import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Check, Lock, Sparkles, Star, Award, Gift, Vote, MessageCircle, Ticket, ArrowRight } from "lucide-react";
import { ACTIONS, STAGES, AFTERLIGHT_EVENT, energyOf, stageOf, loadActions, markAction, resetActions, type ActionId } from "@/lib/afterlight";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "The Afterlight Journey — FanDrop" },
      { name: "description", content: "Your loyalty is measured by the moments you create, not what you spend." },
      { property: "og:title", content: "The Afterlight Journey — FanDrop" },
      { property: "og:description", content: "Four stages of a fan journey built on meaningful moments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rewards,
});

const ICONS = [[Ticket, Award, Sparkles, Gift], [Star, Sparkles, Gift, Vote], [Award, MessageCircle, Sparkles, Gift], [Award, Ticket, Gift, MessageCircle]];
const rewards = STAGES.flatMap((s, i) =>
  s.perks.map((name, j) => ({ name, stage: s.n, Icon: ICONS[i]?.[j] ?? Gift, ...(i === 0 && j === 0 ? { to: "/pass" as const, cta: "View pass" } : {}) })),
) as { name: string; stage: number; Icon: typeof Ticket; to?: "/pass"; cta?: string }[];

const activities: { id: ActionId; title: string; why: string }[] = [
  { id: "pass", title: "Create your Fan Pass", why: "Your spark — the start of every journey." },
  { id: "light", title: "Join the Collective Opening", why: "Awaken your star and send light on the Live tab." },
  { id: "qa", title: "Support a Fan Question", why: "Ask or upvote in Ask Justin Bieber during the show." },
  { id: "encore", title: "Vote for the Hidden Encore", why: "Help choose tonight's rare song." },
  { id: "return", title: "Return for Your Memory Capsule", why: "Come back after the concert to keep the night alive." },
  { id: "drop", title: "Join a Future Artist Drop", why: "Take part when the next drop opens." },
];

function Rewards() {
  const [done, setDone] = useState<ActionId[]>([]);
  useEffect(() => {
    const sync = () => setDone(loadActions());
    sync();
    window.addEventListener(AFTERLIGHT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(AFTERLIGHT_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  const energy = energyOf(done);
  const stage = stageOf(done);
  const cur = STAGES[stage - 1];
  const next = STAGES[stage];
  const prevNeed = cur?.need ?? 0;
  const pct = next ? Math.min(100, Math.round(((energy - prevNeed) / Math.max(1, next.need - prevNeed)) * 100)) : 100;
  const nextAction = stage === 0 ? activities[0] : null;

  return (
    <AppShell kicker="Fan Rewards ✦ Afterlight" title="The Afterlight Journey">
      <p className="-mt-2 mb-5 text-sm text-muted-foreground">Your loyalty isn't measured by how much you spend. It's measured by the moments you create.</p>

      {/* A — status */}
      <section className="rounded-3xl bg-foreground p-5 text-background pop">
        <p className="sticker opacity-70">Your Afterlight Journey</p>
        <p className="mt-2 font-display text-2xl font-extrabold leading-tight">
          {cur ? `Stage ${cur.n} — ${cur.name}` : "Not started yet"}
        </p>
        <p className="mt-1 font-mono text-sm"><span className="text-3xl font-bold text-primary">{energy}</span> ENERGY</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/20">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-sm">
          {nextAction ? (
            <><span className="opacity-60">Next: </span>{nextAction.title} to join as The Spark.</>
          ) : next ? (
            <><span className="opacity-60">Next: </span>{(next.need - energy).toLocaleString()} more Energy to unlock {next.name}.</>
          ) : "Inner Circle reached ✦"}
        </p>
      </section>

      {/* B — timeline */}
      <section className="mt-7">
        <h2 className="sticker mb-3 text-muted-foreground">Journey</h2>
        <ol className="relative space-y-2 border-l-2 border-dashed border-border pl-5">
          {STAGES.map((s) => {
            const complete = stage > s.n;
            const active = stage === s.n;
            return (
              <li key={s.n} className={`relative rounded-2xl p-3 ${active ? "bg-primary text-primary-foreground pop-sm" : complete ? "bg-card" : "bg-card opacity-60"}`}>
                <span className="absolute -left-[33px] top-3 grid h-6 w-6 place-items-center rounded-full border-2 bg-background text-xs text-foreground">
                  {complete || active ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.symbol}</span>
                  <p className="font-display text-lg font-extrabold">{s.name}</p>
                  <span className="sticker ml-auto opacity-70">Stage {s.n}</span>
                </div>
                <p className="mt-1 font-mono text-[11px] font-bold opacity-80">{s.range} · {s.theme}</p>
                <p className="mt-1 text-sm opacity-80">{s.desc}</p>
                <ul className="mt-2 space-y-0.5 text-xs">
                  {s.perks.map((p) => <li key={p}>✦ {p}</li>)}
                </ul>
                <p className="mt-2 text-xs font-bold">{complete || active ? "Unlocked ✦" : `Unlocks at ${s.need.toLocaleString()} Energy`}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* C — vault */}
      <section className="mt-7">
        <h2 className="sticker mb-3 text-muted-foreground">Reward vault</h2>
        {[{ label: "Available now", items: rewards.filter((r) => r.stage <= stage) }, { label: "Coming next", items: rewards.filter((r) => r.stage > stage) }].map((g) => (
          <div key={g.label} className="mb-4">
            <p className="mb-2 text-xs font-bold">{g.label} · {g.items.length}</p>
            {g.items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing here yet.</p> : (
              <div className="grid grid-cols-2 gap-2">
                {g.items.map((r) => {
                  const open = r.stage <= stage;
                  return (
                    <div key={r.name} className={`flex flex-col rounded-2xl border-2 p-3 ${open ? "bg-accent text-accent-foreground pop-sm" : "bg-card opacity-60"}`}>
                      <r.Icon className="h-5 w-5" />
                      <p className="mt-2 text-sm font-bold leading-tight">{r.name}</p>
                      <p className="mt-1 text-[11px] opacity-70">{open ? (r.to ? "Unlocked" : "Unlocked · demo preview") : `Stage ${r.stage}`}</p>
                      {open && r.to && <Link to={r.to} className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline">{r.cta} <ArrowRight className="h-3 w-3" /></Link>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* D — how to progress */}
      <section className="mt-7">
        <h2 className="sticker mb-3 text-muted-foreground">How to progress</h2>
        <ul className="space-y-2">
          {activities.map((a) => {
            const ok = done.includes(a.id);
            return (
              <li key={a.id} className={`flex items-start gap-3 rounded-2xl border-2 p-3 ${ok ? "bg-muted" : "bg-card"}`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${ok ? "bg-primary text-primary-foreground" : ""}`}>{ok ? <Check className="h-4 w-4" /> : <Sparkles className="h-3.5 w-3.5" />}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.why}</p>
                </div>
                <span className="font-mono text-xs font-bold">{ok ? "Done" : `+${ACTIONS[a.id].energy}`}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Demo controls */}
      <details className="mt-8 rounded-2xl border-2 border-dashed p-3 text-sm">
        <summary className="cursor-pointer font-bold text-muted-foreground">Demo controls (for presenting only)</summary>
        <p className="mt-2 text-xs text-muted-foreground">Simulate actions that aren't connected yet. Each counts once.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {activities.map((a) => (
            <button key={a.id} disabled={done.includes(a.id)} onClick={() => markAction(a.id)} className="rounded-full border-2 px-3 py-1 text-xs font-bold disabled:opacity-40">{a.title}</button>
          ))}
          <button onClick={resetActions} className="rounded-full border-2 px-3 py-1 text-xs font-bold">Reset demo energy</button>
        </div>
      </details>
    </AppShell>
  );
}
