import { useEffect, type RefObject } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MemoryCard } from "./MemoryCard";
import type { Memory, ShowEvent } from "@/lib/memory-data";
import type { AlbumMedia } from "@/lib/album-media";

export function MemoryAlbum({ event, memory, media, activeId, onSelect, cardRef }: {
  event: ShowEvent; memory: Memory; media: AlbumMedia[]; activeId: string | null;
  onSelect: (id: string) => void; cardRef: RefObject<HTMLDivElement | null>;
}) {
  const selected = Math.max(0, media.findIndex((item) => item.id === activeId));
  const [viewportRef, api] = useEmblaCarousel({ loop: false, startIndex: selected });
  useEffect(() => {
    if (!api) return;
    const select = () => {
      const item = media[api.selectedScrollSnap()];
      if (item) onSelect(item.id);
    };
    api.on("select", select);
    return () => { api.off("select", select); };
  }, [api, media, onSelect]);
  useEffect(() => {
    api?.reInit();
    api?.scrollTo(selected, true);
  }, [api, media.length, selected]);

  const nav = "grid h-10 w-10 place-items-center rounded-full border-2 bg-card disabled:opacity-30";
  return (
    <div role="region" aria-label="Memory album" aria-roledescription="carousel">
      <div ref={viewportRef} className="overflow-hidden rounded-3xl pop">
        <div className="flex">
          {media.length ? media.map((item, index) => (
            <div key={item.id} data-album-active={index === selected} className="min-w-0 flex-[0_0_100%]">
              <MemoryCard ref={index === selected ? cardRef : undefined} event={event} memory={memory} media={item} active={index === selected} />
            </div>
          )) : <div className="min-w-0 flex-[0_0_100%]"><MemoryCard ref={cardRef} event={event} memory={memory} /></div>}
        </div>
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-5">
          <button className={nav} aria-label="Previous" disabled={selected === 0} onClick={() => api?.scrollPrev()}><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-mono text-sm">{selected + 1} / {media.length}</span>
          <button className={nav} aria-label="Next" disabled={selected === media.length - 1} onClick={() => api?.scrollNext()}><ChevronRight className="h-5 w-5" /></button>
        </div>
      )}
    </div>
  );
}
