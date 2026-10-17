import { lazy, Suspense, useEffect, useState } from "react";
import type { openingFrame } from "@/lib/opening";

const Sky = lazy(() => import("@/components/awakening/CollectiveSky"));
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
  const copy: Record<string, string> = { sky: "YOUR LIGHT", darkness: "Before the first note.", awakening: "A thousand lights. One heartbeat.", convergence: "Together, we become something more.", supernova: "Every light. One extraordinary moment.", reveal: "Justin Bieber" };
  const labels: Record<string, string> = { sky: "THE AWAKENING", darkness: "I / FIRST LIGHT", awakening: "II / GALAXY AWAKENS", convergence: "III / CONVERGENCE", supernova: "IV / SUPERNOVA", reveal: "FROM YOUR LIGHT, A NEW WORLD" };
  return <div className="opening-scene absolute inset-0" data-phase={phase}>
    {mounted && <Suspense fallback={<div className="opening-loading absolute inset-0 flex items-center justify-center"><p className="font-mono text-xs">PREPARING THE SKY…</p></div>}><Sky phase={phase} seconds={reduced ? 27 : frame.seconds} reduced={reduced} color={color} /></Suspense>}
    <div className={`opening-copy pointer-events-none absolute inset-0 flex flex-col items-center px-6 text-center ${phase === "reveal" ? "justify-center" : "justify-end pb-28 sm:pb-32"}`}>
      <p className="font-mono text-xs opacity-70">{labels[phase]}</p>
      <h2 className={`mt-5 max-w-3xl font-display font-bold leading-tight ${phase === "reveal" ? "text-5xl sm:text-7xl" : "text-2xl sm:text-4xl"}`}>{copy[phase]}</h2>
      {phase === "reveal" && <><p className="mt-5 font-mono text-sm">FANDROP LIVE EXPERIENCE</p><p className="mt-8 font-mono text-sm">YOU ARE THE AFTERLIGHT.</p></>}
    </div>
  </div>;
}