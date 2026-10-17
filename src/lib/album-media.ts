export const MAX_VIDEO_SECONDS = 20;

export type StoredMedia = { id: string; name: string; kind: "image" | "video"; blob: Blob };
export type AlbumMedia = Omit<StoredMedia, "blob"> & { url: string };

export function isAllowedVideoDuration(seconds: number) {
  return Number.isFinite(seconds) && seconds > 0 && seconds <= MAX_VIDEO_SECONDS;
}

export function mediaKind(type: string): "image" | "video" | null {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  return null;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("fandrop-memories", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("album")) request.result.createObjectStore("album");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// One album per show, keyed by the show id.
export async function loadAlbum(eventId: string): Promise<StoredMedia[]> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction("album").objectStore("album").get(eventId);
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => reject(req.error);
    });
  } finally { db.close(); }
}

export async function persistAlbum(eventId: string, items: StoredMedia[]) {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("album", "readwrite");
      tx.objectStore("album").put(items, eventId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
