import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LiveFeatures from "@/live/LiveFeatures";
import { loadPass, mergeAwakening, PASS_EVENT, type FanPass } from "@/lib/fanPass";
import { useEffect, useState } from "react";
import { Lock, Radio, ScanLine } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { setGateScanned, clearGateScanned, isGateScanned, onGateScanned } from "@/lib/gate";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Show Night — FanDrop" },
      { name: "description", content: "Exclusive events for tonight's show only — unlocks when your pass is scanned at the gate." },
      { property: "og:title", content: "Show Night — FanDrop" },
      { property: "og:description", content: "Exclusive events for tonight's show only — unlocks when your pass is scanned at the gate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Live,
});


function Live() {
  const [scanned, setScanned] = useState(false);
  const [pass, setPass] = useState<FanPass | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    setPass(loadPass());
    const f = () => setPass(loadPass());
    window.addEventListener(PASS_EVENT, f);
    return () => window.removeEventListener(PASS_EVENT, f);
  }, []);
  const features = (
    <LiveFeatures
      gateScanned={scanned}
      event={{ id: "jb-toronto-2026-10-20", artist: "Justin Bieber", tour: "Live · Scotiabank Arena" }}
      profile={pass ? { fanId: pass.id, nickname: pass.name, mood: pass.vibe } : null}
      onProfileChange={(next) => mergeAwakening((next as { awakening?: unknown }).awakening)}
      onNavigatePass={() => navigate({ to: "/pass" })}
      onScan={setGateScanned}
    />
  );

  useEffect(() => {
    setScanned(isGateScanned());
    return onGateScanned(() => setScanned(isGateScanned()));
  }, []);

  return (
    <AppShell kicker="Concert mode ◎ tonight only" title="Show night">
      {scanned ? (
        <>
          <div className="rounded-3xl bg-primary p-5 text-primary-foreground pop-sm">
            <p className="sticker opacity-80">Scotiabank Arena · Toronto</p>
            <p className="mt-2 font-display text-3xl font-extrabold leading-none">Concert mode ON ✦</p>
            <p className="mt-3 text-sm opacity-90">
              Gate scanned — you're in. Exclusive moments for tonight's crowd drop right here, all show long.
            </p>
            <p className="mt-4 flex items-center gap-2 font-mono text-xs opacity-80">
              <Radio className="h-4 w-4 animate-pulse" /> LIVE · doors open
            </p>
          </div>
          {features}

          <button
            type="button"
            onClick={clearGateScanned}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-muted-foreground/30 px-5 py-3 font-display text-sm font-extrabold text-muted-foreground press"
          >
            <Lock className="h-4 w-4" /> Lock it again — run the demo from the top
          </button>

          <p className="mt-5 text-center font-mono text-xs text-muted-foreground">
            More surprises land here on show night ✦
          </p>
        </>
      ) : (
        <>
          <div className="rounded-3xl bg-cobalt p-5 text-cobalt-foreground pop-sm">
            <p className="sticker opacity-80">Scotiabank Arena · Toronto</p>
            <p className="mt-2 font-display text-3xl font-extrabold leading-none">Doors 7:00 PM</p>
            <p className="mt-3 text-sm opacity-90">
              This tab unlocks the moment your pass is scanned at the gate — exclusive moments, only for tonight's crowd.
            </p>
            <p className="mt-4 flex items-center gap-2 font-mono text-xs opacity-80">
              <Lock className="h-4 w-4" /> LOCKED · waiting for gate scan
            </p>
          </div>

          <button type="button" onClick={setGateScanned} className="mt-4 flex w-full items-center gap-3 rounded-2xl border-2 bg-primary p-4 text-left text-primary-foreground pop-sm press">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
              <ScanLine className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-bold">Tap to scan my pass now ✦</span>
              <span className="block text-sm opacity-80">
                Demo gate scan — unlocks all three activities. (Or use the ticket on the Show tab.)
              </span>
            </span>
          </button>
          {features}
        </>
      )}
    </AppShell>
  );
}
