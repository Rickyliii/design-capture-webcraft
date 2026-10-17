import type { StarType } from "@/lib/light";

export function ConcertStar({ type, className = "" }: { type: StarType; className?: string }) {
  return <svg viewBox="0 0 100 100" className={className} aria-label={`${type} star`} role="img" fill="currentColor">
    {type === "Nova" ? <path d="M50 3 Q56 39 97 50 Q56 59 50 97 Q44 59 3 50 Q44 39 50 3Z" />
      : type === "Comet" ? <><path d="M72 5 64 43 95 48 62 59 66 83 48 65 10 94 37 56 18 40 47 40Z" /><circle cx="53" cy="51" r="9" /></>
      : type === "Nebula" ? <><path d="m50 4 11 29 30-8-17 25 17 25-30-8-11 29-11-29-30 8 17-25L9 25l30 8Z" /><circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="2" /></>
      : <><path d="m50 3 7 35 27-22-22 27 35 7-35 7 22 27-27-22-7 35-7-35-27 22 22-27-35-7 35-7-22-27 27 22Z" /><circle cx="50" cy="50" r="10" /></>}
  </svg>;
}