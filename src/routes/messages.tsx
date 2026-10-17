import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ArrowBigUp, MessageSquare, BadgeCheck, ImageIcon, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { attendedEvents, formatDate, getMood, getSong, readMemory, type ShowEvent } from "@/lib/memory-data";
import { isGateScanned } from "@/lib/gate";
import { loadAlbum } from "@/lib/album-media";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Fan Forum — FanDrop" },
      { name: "description", content: "A Reddit-style forum where fans and the artist post, vote and share memory cards." },
      { property: "og:title", content: "Fan Forum — FanDrop" },
      { property: "og:description", content: "Fans and Justin post together, and fans share their concert memories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { share?: string } => (typeof s["share"] === "string" ? { share: s["share"] } : {}),
  component: Forum,
});

type Media = { kind: "image" | "video"; url: string };
type Shared = { title: string; image: string; caption: string; media: Media[] };
type Comment = { author: string; text: string; artist?: boolean };

// Demo-only canned replies from Justin (written for this demo, not real quotes).
const JUSTIN_REPLIES = [
  "love this so much, thank you for being there 🙏",
  "this made my day fr. see you Oct 20 ❤️",
  "saving this one. you guys are the best fans in the world",
  "ok I might have to play that one just for you 👀",
];
type Post = {
  id: number; author: string; artist?: boolean; time: string; title: string; body: string;
  votes: number; voted?: boolean; comments: Comment[]; memory?: Shared;
};

const seed: Post[] = [
  { id: 1, author: "Justin Bieber", artist: true, time: "2h", title: "first day of rehearsals at the arena 🥹", body: "the room sounds unreal. what song do you want to hear most on Oct 20?", votes: 4821, comments: [{ author: "maya.b", text: "PEACHES PLEASE" }, { author: "leo.r", text: "Ghost would end me 😭" }, { author: "Justin Bieber", artist: true, text: "noted 👀 both of them maybe" }] },
  { id: 2, author: "maya.b", time: "5h", title: "My 2022 Justice Tour memory card", body: "Still not over this night.", votes: 312, comments: [{ author: "priya.k", text: "the lighting in this 😍" }, { author: "Justin Bieber", artist: true, text: "I remember this night. Ghost hits different with you all singing it back. thank you Maya ❤️" }], memory: { title: "Justice Tour · Ghost", image: getSong("ghost").image, caption: "Cried during Ghost. Not even sorry.", media: ["ghost", "peaches", "baby"].map((id) => ({ kind: "image" as const, url: getSong(id).image })) } },
  { id: 3, author: "jay_section_b", time: "1d", title: "Anyone in Section B want to meet before doors?", body: "Thinking 6:15 by the north entrance. Bringing friendship bracelets!", votes: 98, comments: [{ author: "leo.r", text: "I'm in!" }, { author: "priya.k", text: "row 12 here 👋" }] },
];

function Forum() {
  const [posts, setPosts] = useState(seed);
  const [tab, setTab] = useState<"hot" | "artist">("hot");
  const { share } = Route.useSearch();
  const [composing, setComposing] = useState(!!share);
  const [open, setOpen] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [viewing, setViewing] = useState<Shared | null>(null);
  const [typing, setTyping] = useState<number | null>(null);

  // Demo: Justin replies to a fan a few seconds after they post or comment.
  const justinReplies = (id: number) => {
    setTimeout(() => setTyping(id), 900);
    setTimeout(() => {
      setTyping(null);
      const text = JUSTIN_REPLIES[Math.floor(Math.random() * JUSTIN_REPLIES.length)]!;
      setPosts((p) => p.map((x) => x.id === id ? { ...x, comments: [...x.comments, { author: "Justin Bieber", artist: true, text }] } : x));
      setOpen(id);
    }, 3200);
  };

  const vote = (id: number) => setPosts((p) => p.map((x) => x.id === id ? { ...x, voted: !x.voted, votes: x.votes + (x.voted ? -1 : 1) } : x));
  const addComment = (id: number) => {
    if (!reply.trim()) return;
    setPosts((p) => p.map((x) => x.id === id ? { ...x, comments: [...x.comments, { author: "you", text: reply }] } : x));
    setReply("");
    justinReplies(id);
  };
  const list = (tab === "artist" ? posts.filter((p) => p.artist) : [...posts].sort((a, b) => b.votes - a.votes));

  return (
    <AppShell kicker="Forum · r/JustinBieber" title="Fan Forum">
      <div className="mb-4 flex gap-2">
        {(["hot", "artist"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-bold pop-sm ${tab === t ? "bg-foreground text-primary" : "bg-card"}`}>
            {t === "hot" ? "🔥 Hot" : "✦ From Justin"}
          </button>
        ))}
        <button onClick={() => setComposing(true)} className="ml-auto rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground pop-sm press">+ Post</button>
      </div>

      <div className="space-y-4">
        {list.map((p) => (
          <article key={p.id} className={`rounded-3xl p-4 pop-sm ${p.artist ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            <p className="flex items-center gap-1 text-xs font-bold opacity-70">
              {p.author}{p.artist && <BadgeCheck className="h-4 w-4" />}{p.artist && <span className="sticker">Artist</span>} · {p.time}
            </p>
            <h2 className="mt-1 text-lg font-extrabold leading-tight">{p.title}</h2>
            {p.body && <p className="mt-1 text-sm">{p.body}</p>}
            {p.memory && (
              <button onClick={() => setViewing(p.memory!)} className="relative mt-3 block w-full overflow-hidden rounded-2xl text-left">
                <img src={p.memory.image} alt={p.memory.title} className="aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-foreground/80 p-3 text-background">
                  <p className="sticker text-primary">Memory card · {p.memory.title}</p>
                  {p.memory.caption && <p className="text-sm">{p.memory.caption}</p>}
                  <p className="mt-1 text-xs font-bold opacity-80">Tap to view {p.memory.media.length} photo{p.memory.media.length === 1 ? "" : "s"} / video{p.memory.media.length === 1 ? "" : "s"} →</p>
                </div>
                {p.memory.media.some((m) => m.kind === "video") && <span className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1.5 text-background"><Play className="h-4 w-4" /></span>}
              </button>
            )}
            {open !== p.id && typing === p.id && <p className="mt-2 text-xs font-bold animate-pulse">Justin is typing…</p>}
            {open !== p.id && p.comments.some((c) => c.artist) && !p.artist && (
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-primary"><BadgeCheck className="h-3.5 w-3.5" /> Justin replied</p>
            )}
            <div className="mt-3 flex gap-2 text-sm font-bold">
              <button onClick={() => vote(p.id)} aria-label="Upvote" className={`flex items-center gap-1 rounded-full px-3 py-1 ${p.voted ? "bg-accent text-accent-foreground" : "bg-background/60 text-foreground"}`}>
                <ArrowBigUp className="h-4 w-4" />{p.votes.toLocaleString()}
              </button>
              <button onClick={() => setOpen(open === p.id ? null : p.id)} className="flex items-center gap-1 rounded-full bg-background/60 px-3 py-1 text-foreground">
                <MessageSquare className="h-4 w-4" />{p.comments.length}
              </button>
            </div>
            {open === p.id && (
              <div className="mt-3 space-y-2 rounded-2xl bg-background p-3 text-foreground">
                {p.comments.map((c, i) => c.artist ? (
                  <div key={i} className="rounded-2xl bg-primary p-2 text-sm text-primary-foreground">
                    <p className="flex items-center gap-1 text-xs font-bold">Justin Bieber <BadgeCheck className="h-3.5 w-3.5" /> <span className="sticker">Artist reply</span></p>
                    <p>{c.text}</p>
                  </div>
                ) : <p key={i} className="text-sm"><b>{c.author}</b> {c.text}</p>)}
                {typing === p.id && <p className="text-xs font-bold opacity-70 animate-pulse">Justin is typing…</p>}
                <form onSubmit={(e) => { e.preventDefault(); addComment(p.id); }} className="flex gap-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Add a comment…" className="flex-1 rounded-full bg-card px-3 py-2 text-sm outline-none" />
                  <button className="rounded-full bg-accent px-3 text-sm font-bold text-accent-foreground">Reply</button>
                </form>
              </div>
            )}
          </article>
        ))}
      </div>

      {composing && (
        <Composer
          initialMem={share}
          onClose={() => setComposing(false)}
          onPost={(post) => { const id = Date.now(); setPosts((p) => [{ ...post, id, time: "now", votes: 1, voted: true, comments: [] }, ...p]); setComposing(false); setTab("hot"); if (!post.artist) justinReplies(id); }}
        />
      )}
      {viewing && <Viewer memory={viewing} onClose={() => setViewing(null)} />}
    </AppShell>
  );
}

function Composer({ initialMem, onClose, onPost }: { initialMem?: string | undefined; onClose: () => void; onPost: (p: Omit<Post, "id" | "time" | "votes" | "comments">) => void }) {
  const [asArtist, setAsArtist] = useState(false);
  const [title, setTitle] = useState(initialMem ? "Sharing my memory card ✦" : "");
  const [body, setBody] = useState("");
  const [events, setEvents] = useState<ShowEvent[]>([]);
  const [memId, setMemId] = useState<string | null>(initialMem ?? null);
  useEffect(() => setEvents(attendedEvents(isGateScanned())), []);

  const submit = async () => {
    if (!title.trim()) return;
    const ev = events.find((e) => e.id === memId);
    let memory: Shared | undefined;
    if (ev) {
      const m = readMemory(ev);
      const album = await loadAlbum(ev.id).catch(() => []);
      const media: Media[] = album.map((a) => ({ kind: a.kind, url: URL.createObjectURL(a.blob) }));
      const image = getSong(m.songId).image;
      memory = { title: `${ev.tour} · ${getSong(m.songId).title}`, image: media.find((x) => x.kind === "image")?.url ?? image, caption: m.message || `${getMood(m.moodId).emoji} ${formatDate(ev.date)}`, media: media.length ? media : [{ kind: "image", url: image }] };
    }
    onPost({ author: asArtist ? "Justin Bieber" : "you", artist: asArtist, title, body, ...(memory ? { memory } : {}) });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-foreground/60" onClick={onClose}>
      <div className="mx-auto w-full max-w-md space-y-3 rounded-t-3xl bg-background p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">New post</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex gap-2 text-sm font-bold">
          {[false, true].map((a) => (
            <button key={String(a)} onClick={() => setAsArtist(a)} className={`rounded-full px-3 py-1 pop-sm ${asArtist === a ? "bg-foreground text-primary" : "bg-card"}`}>
              {a ? "Post as Justin (demo)" : "Post as fan"}
            </button>
          ))}
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-2xl bg-card px-4 py-3 font-bold outline-none" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What's on your mind?" rows={3} className="w-full rounded-2xl bg-card px-4 py-3 outline-none" />
        {!asArtist && (
          <div>
            <p className="mb-2 flex items-center gap-1 text-sm font-bold"><ImageIcon className="h-4 w-4" /> Share a memory card</p>
            <div className="flex gap-2 overflow-x-auto">
              {events.map((e) => {
                const song = getSong(readMemory(e).songId);
                return (
                  <button key={e.id} onClick={() => setMemId(memId === e.id ? null : e.id)} className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border-4 ${memId === e.id ? "border-accent" : "border-transparent"}`}>
                    <img src={song.image} alt={e.tour} className="h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-foreground/70 text-[10px] font-bold text-background">{e.date.slice(0, 4)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <button onClick={submit} disabled={!title.trim()} className="w-full rounded-full bg-accent py-3 font-bold text-accent-foreground pop-sm press disabled:opacity-50">Post</button>
      </div>
    </div>
  );
}

function Viewer({ memory, onClose }: { memory: Shared; onClose: () => void }) {
  const [i, setI] = useState(0);
  const n = memory.media.length;
  const m = memory.media[i]!;
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-foreground text-background" onClick={onClose}>
      <div className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
        <p className="sticker text-primary">Memory card · {memory.title}</p>
        <button onClick={onClose} aria-label="Close"><X className="h-6 w-6" /></button>
      </div>
      <div className="flex gap-1 px-4">
        {memory.media.map((_, k) => <span key={k} className={`h-1 flex-1 rounded-full ${k <= i ? "bg-background" : "bg-background/30"}`} />)}
      </div>
      <div className="relative mx-auto flex w-full max-w-md flex-1 items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        {m.kind === "video"
          ? <video key={m.url} src={m.url} controls autoPlay playsInline loop className="max-h-full w-full rounded-2xl" />
          : <img key={m.url} src={m.url} alt={memory.title} className="max-h-full w-full rounded-2xl object-contain" />}
        {n > 1 && <>
          <button aria-label="Previous" onClick={() => setI((i - 1 + n) % n)} className="absolute left-2 rounded-full bg-foreground/70 p-2"><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="Next" onClick={() => setI((i + 1) % n)} className="absolute right-2 rounded-full bg-foreground/70 p-2"><ChevronRight className="h-5 w-5" /></button>
        </>}
      </div>
      {memory.caption && <p className="p-4 text-center text-sm" onClick={(e) => e.stopPropagation()}>{memory.caption} · {i + 1}/{n}</p>}
    </div>
  );
}
