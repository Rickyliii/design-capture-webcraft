import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Forward } from "lucide-react";
import { MemoryCard } from "./MemoryCard";
import { attendedEvents, EVENTS, readMemory, type Memory, type ShowEvent } from "@/lib/memory-data";
import { isGateScanned, onGateScanned } from "@/lib/gate";

/** Profile shelf: one memory card per show attended. */
export function MemoryShelf() {
  const [scanned, setScanned] = useState(false);
  const [cards, setCards] = useState<{ event: ShowEvent; memory: Memory }[]>([]);
  useEffect(() => {
    const refresh = () => {
      const s = isGateScanned();
      setScanned(s);
      setCards(attendedEvents(s).map((event) => ({ event, memory: readMemory(event) })));
    };
    refresh();
    return onGateScanned(refresh);
  }, []);
  const upcoming = EVENTS.filter((e) => e.needsGateScan && !scanned);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-extrabold">My memory cards</h2>
        <span className="sticker text-muted-foreground">{cards.length} shows</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ event, memory }) => (
          <div key={event.id} className="relative">
            <Link to="/pass/memory/$eventId" params={{ eventId: event.id }} className="block press">
              <MemoryCard event={event} memory={memory} compact />
            </Link>
            <Link to="/messages" search={{ share: event.id }} aria-label="Share to forum" title="Share to forum"
              className="absolute right-1.5 top-1.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground pop-sm press">
              <Forward className="h-4 w-4" />
            </Link>
          </div>
        ))}
        {upcoming.map((e) => (
          <div key={e.id} className="flex aspect-[9/16] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed p-2 text-center text-muted-foreground">
            <Lock className="h-5 w-5" />
            <span className="text-xs font-bold">Oct 20 card unlocks at the gate scan</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Every show you go to adds a new card. Tap one to add your photos, song and message.</p>
    </section>
  );
}
