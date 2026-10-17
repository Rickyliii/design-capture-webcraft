import { createFileRoute, Link } from "@tanstack/react-router";
import { Maximize, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpeningScene } from "@/components/OpeningScene";
import { openingFrame } from "@/lib/opening";
import { colorInfo } from "@/lib/light";
import { useShowSync } from "@/hooks/use-show-sync";

export const Route = createFileRoute("/stage")({
  head: () => ({ meta: [
    { title: "The Awakening — FanDrop Stage Screen" },
    { name: "description", content: "The synchronized collective-star opening for FanDrop's concert stage screen." },
    { property: "og:title", content: "The Awakening — FanDrop Stage Screen" },
    { property: "og:description", content: "The synchronized collective-star opening for FanDrop's concert stage screen." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Stage,
});
function Stage() {
  const { state, now } = useShowSync();
  const frame = openingFrame(state, now);
  return <main className="relative h-dvh overflow-hidden bg-foreground text-background">
    <OpeningScene frame={frame} color={colorInfo("solar_gold").hex} />
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 p-5">
      <p className="font-mono text-xs">FANDROP · THE AWAKENING · {frame.visible ? "ON AIR" : frame.complete ? "AFTERLIGHT" : "WAITING FOR PRESENTER"}</p>
      <div className="flex gap-2"><Button variant="secondary" size="icon" aria-label="Fullscreen stage" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}><Maximize /></Button><Button variant="secondary" size="icon" asChild><Link to="/live" aria-label="Exit stage"><X /></Link></Button></div>
    </div>
  </main>;
}