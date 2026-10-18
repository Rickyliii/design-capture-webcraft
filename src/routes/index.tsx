import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AppShell } from "@/components/AppShell";
import { ExclusiveMerch } from "@/components/ExclusiveMerch";
import { isGateScanned, setGateScanned } from "@/lib/gate";
import { MessageCircle, Gift, ArrowRight, Ticket, X, ScanLine } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FanDrop — Your Show Space" },
      { name: "description", content: "Your ticket just unlocked a space with the artist and fans going to the same show." },
      { property: "og:title", content: "FanDrop — Your Show Space" },
      { property: "og:description", content: "Message the artist, sing on the big screen before the show." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const next = [
  { to: "/messages", icon: MessageCircle, title: "Justin sent a voice note", sub: "Rehearsal warm-up · 2m ago", tone: "bg-accent text-accent-foreground" },
  { to: "/rewards", icon: Gift, title: "Fan rewards", sub: "Stage 1 of 4 · unlock your next reward", tone: "bg-primary text-primary-foreground" },
] as const;

function Index() {
  const [showPass, setShowPass] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    setScanned(isGateScanned());
  }, []);

  const scanGate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGateScanned();
    setScanned(true);
    setShowPass(false);
  };

  return (
    <AppShell kicker="You're in ✦" title="Justin Bieber · Live">
      <button type="button" onClick={() => setShowPass(true)} className="relative block w-full overflow-hidden rounded-3xl bg-cobalt p-5 text-left text-cobalt-foreground pop press">
        <span className="sticker absolute right-4 top-4 rotate-6 rounded-full bg-primary px-2 py-1 text-primary-foreground animate-wiggle">
          your 4th show!
        </span>
        <p className="sticker opacity-80">Scotiabank Arena · Toronto</p>
        <p className="mt-2 font-display text-5xl font-extrabold leading-none">OCT 20</p>
        <p className="font-mono text-sm opacity-80">Doors 7:00 PM</p>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t-2 border-dashed border-cobalt-foreground/40 pt-4 text-center">
          {[["Section", "B"], ["Row", "12"], ["Seat", "07"]].map(([k, v]) => (
            <div key={k}>
              <p className="sticker opacity-70">{k}</p>
              <p className="font-display text-2xl font-extrabold">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-xs text-cobalt-foreground/70">
          <ScanLine className="h-3.5 w-3.5" /> {scanned ? "Gate scanned ✦ Live unlocked" : "Tap for your entry pass"}
        </p>
      </button>

      <Link to="/tickets" className="mt-4 flex items-center justify-between rounded-2xl bg-accent p-4 font-extrabold text-accent-foreground pop-sm press">
        <span className="flex items-center gap-2"><Ticket className="h-5 w-5" /> Get tickets for a friend</span>
        <ArrowRight className="h-5 w-5" />
      </Link>

      <ExclusiveMerch />

      <h2 className="mb-3 mt-8 text-xl font-extrabold">Before the show</h2>
      <div className="space-y-3">
        {next.map(({ to, icon: Icon, title, sub, tone }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl bg-card p-3 pop-sm press">
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-bold">{title}</span>
              <span className="block text-sm text-muted-foreground">{sub}</span>
            </span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        ))}
      </div>

      {showPass && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6" onClick={() => setShowPass(false)}>
          <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white">
            <X className="h-5 w-5" />
          </span>
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center text-black pop" onClick={(e) => e.stopPropagation()}>
            <span className="sticker inline-block -rotate-2 rounded-full bg-primary px-3 py-1 text-primary-foreground">GATE SCAN</span>
            <div className="mt-4 rounded-2xl border-2 border-dashed border-black/20 p-4">
              <QRCodeSVG value="FANDROP-JB-20261020-B12-07" size={176} className="mx-auto" />
            </div>
            <p className="mt-4 font-display text-2xl font-extrabold leading-none">Justin Bieber · Live</p>
            <p className="mt-1 font-mono text-sm text-black/60">Scotiabank Arena · Oct 20 · Doors 7:00 PM</p>
            <div className="mt-4 grid grid-cols-3 border-t-2 border-dashed border-black/20 pt-3 text-center">
              {[["Section", "B"], ["Row", "12"], ["Seat", "07"]].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] uppercase tracking-widest text-black/60">{k}</p>
                  <p className="font-display text-xl font-extrabold">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={scanGate}
            className="mt-5 w-full max-w-xs rounded-full bg-primary px-6 py-3 font-display text-lg font-extrabold text-primary-foreground pop press"
          >
            I'm at the gate — scan me ✦
          </button>
          <p className="mt-3 flex items-center gap-2 font-mono text-xs text-white/70">
            <ScanLine className="h-4 w-4" /> {scanned ? "Gate scanned ✦ Live unlocked" : "Show this at the gate · tap anywhere to close"}
          </p>
        </div>
      )}
    </AppShell>
  );
}
