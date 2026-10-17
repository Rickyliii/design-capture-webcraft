import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const [picked, setPicked] = useState<number | null>(null);
  const sel = STAGES.find((x) => x.n === picked);
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

      {/* Stages — tap to see rewards */}
      <section className="mt-7">
        <h2 className="sticker mb-3 text-muted-foreground">Stages</h2>
        <div className="grid grid-cols-2 gap-3">
          {STAGES.map((s) => {
            const open = stage >= s.n;
            return (
              <button key={s.n} onClick={() => setPicked(s.n)}
                className={`flex aspect-square flex-col items-start justify-between rounded-3xl border-2 p-4 text-left press ${stage === s.n ? "bg-primary text-primary-foreground pop" : open ? "bg-card pop-sm" : "bg-card opacity-70"}`}>
                <span className="flex w-full items-center justify-between">
                  <span className="text-3xl">{s.symbol}</span>
                  {open ? <Check className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                </span>
                <span>
                  <span className="sticker block opacity-70">Stage {s.n}</span>
                  <span className="font-display text-xl font-extrabold leading-tight">{s.name}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Dialog open={picked !== null} onOpenChange={(o) => !o && setPicked(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          {sel && (
            <>
              <DialogHeader>
                <p className="sticker text-muted-foreground">Stage {sel.n} · {sel.range}</p>
                <DialogTitle className="font-display text-3xl font-extrabold">{sel.symbol} {sel.name}</DialogTitle>
                <DialogDescription>{sel.theme} — {sel.desc}</DialogDescription>
              </DialogHeader>
              <ul className="space-y-2">
                {sel.perks.map((p) => (
                  <li key={p} className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-sm font-bold ${stage >= sel.n ? "bg-accent text-accent-foreground" : ""}`}>
                    {stage >= sel.n ? <Gift className="h-4 w-4 shrink-0" /> : <Lock className="h-4 w-4 shrink-0" />}{p}
                  </li>
                ))}
              </ul>
              <p className="text-xs font-bold text-muted-foreground">{stage >= sel.n ? "Unlocked ✦" : `Unlocks at ${sel.need.toLocaleString()} Energy`}</p>
            </>
          )}
        </DialogContent>
      </Dialog>

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
