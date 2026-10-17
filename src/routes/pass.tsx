import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MemoryShelf } from "@/components/memory/MemoryShelf";
import { MBTI, zodiacFor } from "@/lib/zodiac";

export const Route = createFileRoute("/pass")({
  head: () => ({
    meta: [
      { title: "My Profile — FanDrop" },
      { name: "description", content: "Your fan card and a memory card for every show you've been to." },
      { property: "og:title", content: "My Profile — FanDrop" },
      { property: "og:description", content: "Your fan card and your concert memories, all in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

const avatars = [
  { e: "🌙", n: "Dreamer" },
  { e: "🦉", n: "Night Owl" },
  { e: "🎤", n: "Vocalist" },
  { e: "⭐", n: "Starlight" },
  { e: "🧭", n: "Explorer" },
  { e: "💜", n: "Superfan" },
];
const vibes = ["Electric", "Emotional", "Nostalgic", "Dreamy"];
const KEY = "fandrop-profile";
type ProfileData = { name: string; avatar: number; vibe: string; artist?: string; birthday?: string; mbti?: string };
const inputCls = "mt-2 w-full rounded-2xl border-2 bg-card px-4 py-3 font-bold outline-none focus:border-accent";

function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>({ name: "", avatar: 0, vibe: vibes[0]! });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  const open = () => { setDraft(profile ?? { name: "", avatar: 0, vibe: vibes[0]! }); setEditing(true); };
  const save = () => {
    const p = { ...draft, name: draft.name.trim() };
    setProfile(p);
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
    setEditing(false);
  };
  const a = avatars[profile?.avatar ?? 0] ?? avatars[0]!;
  const sign = profile?.birthday ? zodiacFor(profile.birthday) : null;
  const facts = profile ? ([
    ["Fave artist", profile.artist],
    ["Birthday", profile.birthday ? new Date(profile.birthday + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""],
    ["MBTI", profile.mbti],
    ["Sign", sign ? `${sign.emoji} ${sign.name}` : ""],
  ] as const).filter(([, v]) => v) : [];
  const draftSign = draft.birthday ? zodiacFor(draft.birthday) : null;

  return (
    <AppShell kicker="Your concert. Your story." title="My profile">
      <button type="button" onClick={open} className="block w-full rounded-2xl bg-foreground p-3 text-left text-background pop-sm press">
        <span className="flex items-center gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-3xl">{profile ? a.e : "?"}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="sticker rounded-full bg-primary px-2 py-0.5 text-primary-foreground">Fan pass</span>
            {profile && <span className="sticker rounded-full bg-accent px-2 py-0.5 text-accent-foreground">✦ Welcome badge</span>}
          </span>
          <span className="mt-1 block truncate font-display text-xl font-extrabold leading-tight">{profile ? profile.name : "Make your fan card"}</span>
          <span className="block text-xs opacity-70">{profile ? `${a.n} · ${profile.vibe} vibe` : "Name, avatar and vibe"}</span>
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-background/15"><Pencil className="h-4 w-4" /></span>
        </span>
        {facts.length > 0 && (
          <span className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-background/20 pt-3 text-xs">
            {facts.map(([k, v]) => (
              <span key={k} className="min-w-0"><span className="block opacity-60">{k}</span><span className="block truncate font-bold">{v}</span></span>
            ))}
          </span>
        )}
      </button>

      <MemoryShelf />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60" onClick={() => setEditing(false)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-2 bg-background p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold">Edit fan card</h2>
              <button aria-label="Close" onClick={() => setEditing(false)} className="grid h-9 w-9 place-items-center rounded-full border-2"><X className="h-4 w-4" /></button>
            </div>
            <label className="sticker text-muted-foreground">01 · What should we call you?</label>
            <input value={draft.name} maxLength={20} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Your name"
              className="mt-2 w-full rounded-2xl border-2 bg-card px-4 py-3 font-bold outline-none focus:border-accent" />
            <label className="sticker mt-5 block text-muted-foreground">02 · Favourite artist</label>
            <input value={draft.artist ?? ""} maxLength={30} onChange={(e) => setDraft({ ...draft, artist: e.target.value })} placeholder="e.g. Justin Bieber" className={inputCls} />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="sticker text-muted-foreground">03 · Birthday
                <input type="date" value={draft.birthday ?? ""} onChange={(e) => setDraft({ ...draft, birthday: e.target.value })} className={inputCls + " text-sm"} />
              </label>
              <label className="sticker text-muted-foreground">04 · MBTI
                <select value={draft.mbti ?? ""} onChange={(e) => setDraft({ ...draft, mbti: e.target.value })} className={inputCls + " text-sm"}>
                  <option value="">—</option>
                  {MBTI.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-2 text-sm font-bold">{draftSign ? `Your sign: ${draftSign.emoji} ${draftSign.name}` : "Your star sign fills in from your birthday"}</p>
            <p className="sticker mt-5 text-muted-foreground">05 · Choose your avatar</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {avatars.map((v, i) => (
                <button key={v.n} onClick={() => setDraft({ ...draft, avatar: i })}
                  className={`rounded-2xl border-2 p-2 text-center ${i === draft.avatar ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  <div className="text-2xl">{v.e}</div>
                  <div className="text-xs font-bold">{v.n}</div>
                </button>
              ))}
            </div>
            <p className="sticker mt-5 text-muted-foreground">06 · What's your vibe?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {vibes.map((v) => (
                <button key={v} onClick={() => setDraft({ ...draft, vibe: v })}
                  className={`rounded-2xl border-2 py-2 text-sm font-bold ${v === draft.vibe ? "bg-accent text-accent-foreground" : "bg-card"}`}>{v}</button>
              ))}
            </div>
            <button disabled={!draft.name.trim()} onClick={save}
              className="mt-6 w-full rounded-2xl bg-foreground py-3.5 font-bold text-primary pop-sm disabled:opacity-40">Save</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
