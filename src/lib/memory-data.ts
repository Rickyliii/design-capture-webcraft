import peaches from "@/assets/memory-peaches.jpg.asset.json";
import yukon from "@/assets/memory-yukon.jpg.asset.json";
import sorry from "@/assets/memory-sorry.jpg.asset.json";
import baby from "@/assets/memory-baby.jpg.asset.json";
import ghost from "@/assets/memory-ghost.jpg.asset.json";
import cruelSummer from "@/assets/memory-cruel-summer.jpg.asset.json";
import loveStory from "@/assets/memory-love-story.jpg.asset.json";
import antiHero from "@/assets/memory-anti-hero.jpg.asset.json";

export type Song = { id: string; artist: string; title: string; vibe: string; image: string };

// AI-generated demo concert scenes, not real performance photos.
export const SONGS: Song[] = [
  { id: "peaches", artist: "Justin Bieber", title: "Peaches", vibe: "Colour explosion", image: peaches.url },
  { id: "yukon", artist: "Justin Bieber", title: "YUKON", vibe: "Dreamy sparkle", image: yukon.url },
  { id: "sorry", artist: "Justin Bieber", title: "Sorry", vibe: "Dramatic crimson", image: sorry.url },
  { id: "baby", artist: "Justin Bieber", title: "Baby", vibe: "Golden throwback", image: baby.url },
  { id: "ghost", artist: "Justin Bieber", title: "Ghost", vibe: "Purple & pink euphoria", image: ghost.url },
  { id: "ts-cruel-summer", artist: "Taylor Swift", title: "Cruel Summer", vibe: "Purple & pink euphoria", image: ghost.url },
  { id: "ts-love-story", artist: "Taylor Swift", title: "Love Story", vibe: "Golden throwback", image: baby.url },
  { id: "ts-anti-hero", artist: "Taylor Swift", title: "Anti-Hero", vibe: "Dreamy sparkle", image: yukon.url },
  { id: "dr-gods-plan", artist: "Drake", title: "God's Plan", vibe: "Dramatic crimson", image: sorry.url },
  { id: "dr-one-dance", artist: "Drake", title: "One Dance", vibe: "Colour explosion", image: peaches.url },
  { id: "dr-hotline-bling", artist: "Drake", title: "Hotline Bling", vibe: "Purple & pink euphoria", image: ghost.url },
];

export type Mood = { id: string; label: string; emoji: string };
export const MOODS: Mood[] = [
  { id: "excited", label: "Excited", emoji: "🤩" },
  { id: "emotional", label: "Emotional", emoji: "🥹" },
  { id: "happy", label: "Happy", emoji: "🥰" },
  { id: "energetic", label: "Energetic", emoji: "🔥" },
  { id: "nostalgic", label: "Nostalgic", emoji: "💜" },
];

export const MESSAGE_LIMIT = 150;

export type Memory = { songId: string; moodId: string; message: string };

export type ShowEvent = {
  id: string;
  artist: string;
  tour: string;
  venue: string;
  date: string; // yyyy-mm-dd
  seat: string;
  needsGateScan: boolean; // tonight's show only appears once the pass is scanned
  defaults: Memory;
};

// Sample show history (invented) — tonight plus three past shows.
export const EVENTS: ShowEvent[] = [
  { id: "jb-2026-live", artist: "Justin Bieber", tour: "Live", venue: "Scotiabank Arena · Toronto", date: "2026-10-20", seat: "B · 12-07", needsGateScan: true, defaults: { songId: "peaches", moodId: "excited", message: "" } },
  { id: "ts-2024-eras", artist: "Taylor Swift", tour: "The Eras Tour", venue: "Rogers Centre · Toronto", date: "2024-11-15", seat: "524 · 3-11", needsGateScan: false, defaults: { songId: "ts-cruel-summer", moodId: "emotional", message: "Screamed the bridge with 50,000 people." } },
  { id: "dr-2023-blur", artist: "Drake", tour: "It's All A Blur Tour", venue: "Scotiabank Arena · Toronto", date: "2023-07-14", seat: "Floor GA", needsGateScan: false, defaults: { songId: "dr-gods-plan", moodId: "nostalgic", message: "Hometown show, my very first concert 💜" } },
  { id: "jb-2022-justice", artist: "Justin Bieber", tour: "Justice Tour", venue: "Scotiabank Arena · Toronto", date: "2022-08-12", seat: "104 · 12-08", needsGateScan: false, defaults: { songId: "ghost", moodId: "emotional", message: "Cried during Ghost. Not even sorry." } },
];

export const songsFor = (artist: string) => SONGS.filter((s) => s.artist === artist);
export const getEvent = (id: string) => EVENTS.find((e) => e.id === id);
export const getSong = (id: string) => SONGS.find((s) => s.id === id) ?? SONGS[0]!;
export const getMood = (id: string) => MOODS.find((m) => m.id === id) ?? MOODS[0]!;

/** Shows that have a memory card: past shows, plus tonight's once the gate scan happened. */
export function attendedEvents(gateScanned: boolean) {
  return EVENTS.filter((e) => !e.needsGateScan || gateScanned);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const memoryKey = (eventId: string) => `fandrop-memory-${eventId}`;

export function readMemory(event: ShowEvent): Memory {
  try {
    const raw = localStorage.getItem(memoryKey(event.id));
    if (raw) return { ...event.defaults, ...JSON.parse(raw).memory };
  } catch {}
  return event.defaults;
}
