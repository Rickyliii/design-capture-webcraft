import { lazy, Suspense, useEffect, useState } from "react";
import type { openingFrame } from "@/lib/opening";

const Sky = lazy(() => import("@/live/components/CollectiveSky"));
export function OpeningScene({ frame, color }: { frame: ReturnType<typeof openingFrame>; color: string }) {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches); update();
    query.addEventListener("change", update); return () => query.removeEventListener("change", update);
  }, []);
  const phase = reduced && frame.visible ? "reveal" : frame.phase;
  const copy: Record<string, string> = { sky: "THE AWAKENING", darkness: "YOUR LIGHT. OUR BEGINNING.", awakening: "A THOUSAND LIGHTS. ONE HEARTBEAT.", convergence: "TOGETHER, WE BECOME MORE.", supernova: "ONE EXTRAORDINARY MOMENT.", reveal: "YOU ARE THE AFTERLIGHT." };
  return <div className="opening-scene absolute inset-0" data-phase={phase}>
    {mounted && <Suspense fallback={<div className="opening-loading absolute inset-0 flex items-center justify-center"><p className="font-mono text-xs">PREPARING THE SKY…</p></div>}><Sky phase={phase} seconds={reduced ? 27 : frame.seconds} reduced={reduced} color={color} /></Suspense>}
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center px-6 pb-32 text-center">
      <h2 className="max-w-xl font-display text-2xl font-bold leading-tight sm:text-3xl">{copy[phase]}</h2>
    </div>
  </div>;
}