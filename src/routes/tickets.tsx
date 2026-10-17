import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Minus, Plus, Check, CreditCard, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Get Tickets — Justin Bieber Live | FanDrop" },
      { name: "description", content: "Pick your seats for Justin Bieber at Scotiabank Arena and unlock your FanDrop show space." },
      { property: "og:title", content: "Get Tickets — Justin Bieber Live | FanDrop" },
      { property: "og:description", content: "Buy your ticket and unlock the artist forum and fan rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tickets,
});

const tiers = [
  { id: "floor", name: "Floor GA", sub: "Standing · closest to stage", price: 289, left: 12, tone: "bg-accent text-accent-foreground" },
  { id: "lower", name: "Section B · Lower Bowl", sub: "Reserved seat · great view", price: 189, left: 48, tone: "bg-primary text-primary-foreground" },
  { id: "upper", name: "Upper Bowl", sub: "Reserved seat · full-arena view", price: 99, left: 230, tone: "bg-cobalt text-cobalt-foreground" },
] as const;

const FEE = 0.12;

function Tickets() {
  const [tier, setTier] = useState<(typeof tiers)[number]["id"]>("lower");
  const [qty, setQty] = useState(1);
  const [stage, setStage] = useState<"pick" | "paying" | "done">("pick");
  const t = tiers.find((x) => x.id === tier) ?? tiers[1];
  const subtotal = t.price * qty;
  const fees = Math.round(subtotal * FEE);
  const total = subtotal + fees;

  const pay = () => {
    setStage("paying");
    setTimeout(() => setStage("done"), 1400);
  };

  if (stage === "done") {
    return (
      <AppShell kicker="Payment done ✦" title="You're going!">
        <div className="rounded-3xl bg-cobalt p-5 text-cobalt-foreground pop">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-6 w-6" />
          </span>
          <p className="mt-4 font-display text-3xl font-extrabold leading-none">Justin Bieber · Live</p>
          <p className="mt-1 font-mono text-sm opacity-80">Scotiabank Arena · Oct 20 · Doors 7:00 PM</p>
          <div className="mt-4 border-t-2 border-dashed border-cobalt-foreground/40 pt-4 text-sm">
            <p className="font-bold">{qty} × {t.name}</p>
            <p className="font-mono opacity-80">Paid ${total} CAD · Order #FD-{1000 + qty * 37}</p>
          </div>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Your ticket just unlocked your show space — message Justin and start earning fan rewards.
        </p>
        <Link to="/" className="mt-5 block rounded-2xl bg-primary py-4 text-center font-extrabold text-primary-foreground pop press">
          Enter my show space
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">Demo only — no real money was charged.</p>
      </AppShell>
    );
  }

  return (
    <AppShell kicker="Oct 20 · Scotiabank Arena" title="Get tickets">
      <div className="space-y-3">
        {tiers.map((x) => (
          <button
            key={x.id}
            onClick={() => setTier(x.id)}
            className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left press ${tier === x.id ? "bg-foreground text-background pop" : "bg-card pop-sm"}`}
          >
            <span className={`grid h-12 w-12 place-items-center rounded-xl font-display text-lg font-extrabold ${x.tone}`}>
              ${x.price}
            </span>
            <span className="flex-1">
              <span className="block font-bold">{x.name}</span>
              <span className={`block text-sm ${tier === x.id ? "opacity-70" : "text-muted-foreground"}`}>{x.sub}</span>
            </span>
            <span className="sticker opacity-70">{x.left} left</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-3 pop-sm">
        <span className="font-bold">Tickets</span>
        <div className="flex items-center gap-3">
          <button aria-label="Fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-muted press">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center font-display text-xl font-extrabold">{qty}</span>
          <button aria-label="More" onClick={() => setQty((q) => Math.min(6, q + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-muted press">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1 rounded-2xl bg-card p-4 font-mono text-sm pop-sm">
        <div className="flex justify-between"><span>{qty} × ${t.price}</span><span>${subtotal}</span></div>
        <div className="flex justify-between text-muted-foreground"><span>Service fees</span><span>${fees}</span></div>
        <div className="mt-2 flex justify-between border-t-2 border-dashed pt-2 text-base font-bold"><span>Total</span><span>${total} CAD</span></div>
      </div>

      <button
        onClick={pay}
        disabled={stage === "paying"}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-extrabold text-primary-foreground pop press disabled:opacity-70"
      >
        {stage === "paying" ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
        {stage === "paying" ? "Processing…" : `Pay $${total}`}
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">Demo checkout — no card needed, nothing is charged.</p>
    </AppShell>
  );
}
