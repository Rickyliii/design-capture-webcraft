import { forwardRef } from "react";
import { formatDate, getMood, getSong, type Memory, type ShowEvent, SONGS } from "@/lib/memory-data";
import type { AlbumMedia } from "@/lib/album-media";

// 9:16 story card. Song scenes are stacked so switching fades smoothly;
// an uploaded fan photo/video replaces them as the background.
export const MemoryCard = forwardRef<HTMLDivElement, { event: ShowEvent; memory: Memory; media?: AlbumMedia; active?: boolean; compact?: boolean }>(
  ({ event, memory, media, active = true, compact = false }, ref) => {
    const song = getSong(memory.songId);
    const mood = getMood(memory.moodId);
    return (
      <div ref={ref} className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl border-2 bg-foreground text-background">
        {media?.kind === "video" ? (
          <video src={active ? media.url : undefined} autoPlay={active} muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : media?.kind === "image" ? (
          <img src={media.url} alt={media.name} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        ) : (
          SONGS.map((s) => (
            <img key={s.id} src={s.image} alt={`${s.title} concert scene`} crossOrigin="anonymous"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${s.id === song.id ? "opacity-100" : "opacity-0"}`} />
          ))
        )}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-foreground via-foreground/80 to-transparent" />

        <div className={`relative flex h-full flex-col ${compact ? "p-3" : "p-5"}`}>
          <div className="flex items-start justify-between gap-2">
            <span className="sticker rounded-full bg-primary px-2 py-1 text-primary-foreground">Memory</span>
            {!compact && <span className="sticker rounded-full bg-background/20 px-2 py-1">{event.tour}</span>}
          </div>
          <div className={`mt-auto ${compact ? "space-y-1.5" : "space-y-3"}`}>
            <div>
              <p className="sticker opacity-80">{formatDate(event.date)}</p>
              <h2 className={`font-display font-extrabold leading-none break-words ${compact ? "text-lg" : "text-4xl"}`}>{event.artist}</h2>
              {!compact && <p className="mt-1 font-mono text-xs opacity-70">{event.venue}</p>}
            </div>
            <div className={`flex items-center gap-2 rounded-2xl bg-background text-foreground ${compact ? "px-2 py-1.5" : "px-3 py-2.5"}`}>
              {!compact && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">♫</span>}
              <div className="min-w-0">
                {!compact && <p className="sticker text-muted-foreground">Favourite song</p>}
                <p className={`truncate font-bold ${compact ? "text-xs" : ""}`}>{song.title}</p>
              </div>
              <div className="ml-auto text-right">
                <p className={compact ? "text-base leading-none" : "text-2xl leading-none"}>{mood.emoji}</p>
                {!compact && <p className="sticker mt-1">{mood.label}</p>}
              </div>
            </div>
            {!compact && memory.message && <p className="font-display text-lg italic leading-snug break-words">“{memory.message}”</p>}
            {!compact && (
              <div className="flex items-center justify-between border-t border-background/30 pt-2">
                <span className="font-display text-sm font-extrabold">Fan<span className="text-accent">Drop</span></span>
                <span className="sticker opacity-70">Seat {event.seat}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
