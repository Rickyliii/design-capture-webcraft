import { useEffect, useRef, useState } from "react";
import { memoryKey, readMemory, type Memory, type ShowEvent } from "./memory-data";
import { loadAlbum, persistAlbum, type AlbumMedia, type StoredMedia } from "./album-media";

export function useMemory(event: ShowEvent) {
  const [memory, setMemory] = useState<Memory>(event.defaults);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [media, setMedia] = useState<AlbumMedia[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const stored = useRef<StoredMedia[]>([]);
  const urls = useRef(new Set<string>());

  useEffect(() => {
    let disposed = false;
    setMemory(readMemory(event));
    loadAlbum(event.id).then((items) => {
      if (disposed) return;
      stored.current = items;
      const entries = items.map(({ blob, ...item }) => {
        const url = URL.createObjectURL(blob);
        urls.current.add(url);
        return { ...item, url };
      });
      setMedia(entries);
      setActiveId(entries[0]?.id ?? null);
    }).catch(() => {}).finally(() => { if (!disposed) setLoaded(true); });
    return () => {
      disposed = true;
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current.clear();
    };
  }, [event]);

  useEffect(() => {
    if (loaded) {
      try { localStorage.setItem(memoryKey(event.id), JSON.stringify({ memory })); } catch {}
    }
  }, [memory, loaded, event.id]);

  const update = (patch: Partial<Memory>) => setMemory((m) => ({ ...m, ...patch }));
  const addMedia = async (files: File[]) => {
    const additions: StoredMedia[] = files.map((file) => ({ id: crypto.randomUUID(), name: file.name, kind: file.type.startsWith("video/") ? "video" : "image", blob: file }));
    const next = [...stored.current, ...additions];
    await persistAlbum(event.id, next);
    stored.current = next;
    const entries = additions.map(({ blob, ...item }) => {
      const url = URL.createObjectURL(blob);
      urls.current.add(url);
      return { ...item, url };
    });
    setMedia((previous) => [...previous, ...entries]);
    setActiveId(entries[0]?.id ?? null);
  };
  const removeMedia = async (id: string) => {
    const next = stored.current.filter((item) => item.id !== id);
    await persistAlbum(event.id, next);
    stored.current = next;
    const removed = media.find((item) => item.id === id);
    const remaining = media.filter((item) => item.id !== id);
    if (activeId === id) setActiveId(remaining[Math.min(media.findIndex((item) => item.id === id), remaining.length - 1)]?.id ?? null);
    setMedia(remaining);
    if (removed) {
      URL.revokeObjectURL(removed.url);
      urls.current.delete(removed.url);
    }
  };
  return { memory, update, step, setStep, media, activeId, setActiveId, addMedia, removeMedia, loaded };
}
