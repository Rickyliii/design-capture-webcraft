import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toPng } from "html-to-image";
import { AppShell } from "@/components/AppShell";
import { MemoryAlbum } from "@/components/memory/MemoryAlbum";
import { AlbumUpload } from "@/components/memory/AlbumUpload";
import { formatDate, getEvent, MESSAGE_LIMIT, MOODS, songsFor } from "@/lib/memory-data";
import { useMemory } from "@/lib/use-memory";
import { recordActivity } from "@/lib/light.functions";
import { LIGHT_ID_KEY } from "@/lib/light-identity";

export const Route = createFileRoute("/pass_/memory/$eventId")({
  loader: ({ params }) => {
    const event = getEvent(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.event.artist} ${loaderData.event.tour} memory — FanDrop` : "Memory card — FanDrop";
    return {
      meta: [
        { title: t },
        { name: "description", content: "Your memory card for this show: photos, favourite song, mood and message." },
        { property: "og:title", content: t },
        { property: "og:description", content: "A concert memory card you can save and share." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: MemoryPage,
});

const STEPS = ["Photos & song", "Mood & message", "Save"];

function MemoryPage() {
  const { event } = Route.useLoaderData();
  const { memory, update, step, setStep, media, activeId, setActiveId, addMedia, removeMedia, loaded } = useMemory(event);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "save" | "share">(null);
  const [toast, setToast] = useState("");
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(""), 2500); };

  const render = async () => {
    const node = cardRef.current;
    if (!node) throw new Error("Card not ready");
    // html-to-image can't capture <video>, so freeze the current frame.
    const video = node.querySelector("video");
    let frame: HTMLImageElement | null = null;
    if (video && video.videoWidth) {
      video.pause();
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      frame = document.createElement("img");
      frame.src = canvas.toDataURL("image/jpeg", 0.92);
      frame.className = "absolute inset-0 h-full w-full object-cover";
      video.replaceWith(frame);
      await frame.decode().catch(() => {});
    }
    const opts = { pixelRatio: 3, filter: (n: HTMLElement) => !(n.tagName === "IMG" && n.classList?.contains("opacity-0")) };
    try {
      await toPng(node, opts); // warm-up pass (Safari)
      return await toPng(node, opts);
    } finally {
      if (frame && video) { frame.replaceWith(video); video.play().catch(() => {}); }
    }
  };

  const track = (kind: "memory_card_saved" | "memory_card_shared") => {
    const fanId = localStorage.getItem(LIGHT_ID_KEY);
    if (fanId) recordActivity({ data: { fanId, kind } }).catch(() => {});
  };
  const fileName = `fandrop-${event.id}-memory.png`;
  const download = (url: string) => { const a = document.createElement("a"); a.href = url; a.download = fileName; a.click(); };
  const save = async () => {
    setBusy("save");
    try { download(await render()); flash("Memory saved ✦"); track("memory_card_saved"); } catch { flash("Couldn't create the image, try again"); } finally { setBusy(null); }
  };
  const share = async () => {
    setBusy("share");
    try {
      const url = await render();
      const file = new File([await (await fetch(url)).blob()], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: "My concert memory" }); track("memory_card_shared"); }
      else { download(url); flash("Sharing isn't supported here — downloaded instead"); }
    } catch (e) {
      if ((e as Error).name !== "AbortError") flash("Couldn't share, try saving instead");
    } finally { setBusy(null); }
  };

  return (
    <AppShell kicker={`${event.tour} · ${formatDate(event.date)}`} title="My memory card">
      <Link to="/pass" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back to my profile</Link>

      <div className="mx-auto max-w-[300px]">
        <MemoryAlbum cardRef={cardRef} event={event} memory={memory} media={media} activeId={activeId} onSelect={setActiveId} />
      </div>

      <ol className="mb-4 mt-6 flex gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <button onClick={() => setStep(i)} className="w-full text-left">
              <div className={`h-2 rounded-full border-2 ${i <= step ? "bg-accent" : "bg-card"}`} />
              <span className={`sticker mt-1.5 block ${i === step ? "" : "text-muted-foreground"}`}>{i + 1}. {label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="rounded-3xl bg-card p-4 pop-sm">
        {step === 0 && (
          <div className="space-y-4">
            <AlbumUpload media={media} activeId={activeId} onSelect={setActiveId} onAdd={addMedia} onRemove={removeMedia} loaded={loaded} />
            <p className="sticker text-muted-foreground">Favourite song of the night</p>
            <div className="space-y-2">
              {songsFor(event.artist).map((s) => {
                const on = s.id === memory.songId;
                return (
                  <button key={s.id} onClick={() => update({ songId: s.id })}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-2 pr-4 text-left ${on ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                    <img src={s.image} alt="" loading="lazy" className="h-12 w-12 rounded-xl object-cover" />
                    <span className="flex-1"><span className="block font-bold">{s.title}</span><span className="block text-xs opacity-70">{s.vibe}</span></span>
                    {on && "✓"}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <p className="sticker text-muted-foreground">How did it feel?</p>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button key={m.id} onClick={() => update({ moodId: m.id })}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-2 ${m.id === memory.moodId ? "bg-accent text-accent-foreground" : "bg-card"}`}>
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-bold">{m.label}</span>
                </button>
              ))}
            </div>
            <label className="block">
              <span className="sticker text-muted-foreground">Your message</span>
              <textarea value={memory.message} maxLength={MESSAGE_LIMIT} rows={3}
                onChange={(e) => update({ message: e.target.value.slice(0, MESSAGE_LIMIT) })}
                placeholder="What made this night unforgettable?"
                className="mt-2 w-full resize-none rounded-2xl border-2 bg-background p-3 outline-none focus:border-accent" />
              <span className="block text-right font-mono text-xs text-muted-foreground">{memory.message.length}/{MESSAGE_LIMIT}</span>
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Saves the card you're looking at as an image. Videos save the current frame.</p>
            <button onClick={save} disabled={!!busy} className="w-full rounded-2xl bg-foreground py-3.5 font-bold text-primary pop-sm press disabled:opacity-50">
              {busy === "save" ? "Creating…" : "Save image"}
            </button>
            <button onClick={share} disabled={!!busy} className="w-full rounded-2xl border-2 py-3.5 font-bold disabled:opacity-50">
              {busy === "share" ? "Preparing…" : "Share"}
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-between">
          <button onClick={() => setStep(Math.max(0, step - 1))} className={`text-sm font-bold text-muted-foreground ${step === 0 ? "invisible" : ""}`}>← Back</button>
          {step < 2 && <button onClick={() => setStep(step + 1)} className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-foreground">Next →</button>}
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] text-muted-foreground">Song scenes are AI-generated illustrations.</p>
      {toast && <div className="fixed bottom-28 left-1/2 z-30 -translate-x-1/2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background">{toast}</div>}
    </AppShell>
  );
}
