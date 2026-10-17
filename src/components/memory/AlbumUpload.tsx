import { useRef, useState } from "react";
import { ImagePlus, Play, Trash2 } from "lucide-react";
import { MAX_VIDEO_SECONDS, isAllowedVideoDuration, mediaKind, type AlbumMedia } from "@/lib/album-media";

async function validateFile(file: File): Promise<string | null> {
  const kind = mediaKind(file.type);
  if (!kind) return `${file.name}: pick a photo or video`;
  const url = URL.createObjectURL(file);
  try {
    if (kind === "image") {
      const image = new Image();
      image.src = url;
      await image.decode();
      return null;
    }
    const duration = await new Promise<number>((resolve, reject) => {
      const video = document.createElement("video");
      const timeout = setTimeout(() => reject(new Error("timeout")), 15000);
      video.preload = "metadata";
      video.onloadedmetadata = () => { clearTimeout(timeout); resolve(video.duration); };
      video.onerror = () => { clearTimeout(timeout); reject(new Error("video")); };
      video.src = url;
    });
    return isAllowedVideoDuration(duration) ? null : `${file.name}: videos must be ${MAX_VIDEO_SECONDS}s or shorter`;
  } catch { return `${file.name}: couldn't read this file`; }
  finally { URL.revokeObjectURL(url); }
}

export function AlbumUpload({ media, activeId, onSelect, onAdd, onRemove, loaded }: {
  media: AlbumMedia[]; activeId: string | null; onSelect: (id: string) => void;
  onAdd: (files: File[]) => Promise<void>; onRemove: (id: string) => Promise<void>; loaded: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const upload = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true); setErrors([]);
    try {
      const results = await Promise.all(files.map(validateFile));
      const valid = files.filter((_, i) => results[i] === null);
      if (valid.length) await onAdd(valid);
      setErrors(results.filter((v): v is string => v !== null));
    } catch { setErrors(["Couldn't save — check your phone's free space"]); }
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-3">
      <button type="button" disabled={busy || !loaded} onClick={() => input.current?.click()}
        className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed bg-card py-4 font-bold disabled:opacity-50">
        <ImagePlus className="h-5 w-5" />
        {busy ? "Adding…" : media.length ? "Add more photos / videos" : "Add your photos / videos"}
        <span className="text-xs font-normal text-muted-foreground">Pick several at once · videos up to {MAX_VIDEO_SECONDS}s</span>
      </button>
      <input ref={input} type="file" multiple accept="image/*,video/*" aria-label="Upload photos and videos" className="hidden"
        onChange={(e) => { const files = Array.from(e.target.files ?? []); e.target.value = ""; void upload(files); }} />
      {errors.length > 0 && <div role="alert" className="space-y-1 text-xs text-destructive">{errors.map((e, i) => <p key={i}>{e}</p>)}</div>}
      {media.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {media.map((item, index) => (
            <div key={item.id} className="relative">
              <button type="button" onClick={() => onSelect(item.id)} aria-label={`Show ${item.name}`}
                className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 ${activeId === item.id ? "border-accent" : ""}`}>
                {item.kind === "image" ? <img src={item.url} alt="" className="h-full w-full object-cover" />
                  : <><video src={item.url} preload="metadata" muted playsInline className="h-full w-full object-cover" /><Play className="absolute bottom-1 left-1 h-4 w-4 text-background" /></>}
                <span className="absolute left-1 top-1 rounded bg-background px-1 font-mono text-[10px]">{index + 1}</span>
              </button>
              <button type="button" disabled={busy} aria-label="Remove" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background"
                onClick={async () => { setBusy(true); try { await onRemove(item.id); } catch { setErrors(["Couldn't remove, try again"]); } finally { setBusy(false); } }}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
