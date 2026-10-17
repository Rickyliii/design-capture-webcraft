import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { participationUrl } from "@/lib/participation";

export function ParticipationQR() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setUrl(participationUrl(window.location.origin)); }, []);
  return <section className="border-y border-current/20 py-6" aria-label="Phone participation QR code">
    <h2 className="flex items-center gap-2 font-display text-xl font-bold"><QrCode /> JOIN THE AWAKENING</h2>
    <div className="mt-4 flex flex-wrap items-center gap-6">
      <div className="participation-qr grid h-48 w-48 shrink-0 place-items-center rounded-md">
        {url && <QRCodeSVG value={url} size={168} marginSize={2} title="Scan to join The Awakening" />}
      </div>
      <div className="min-w-0 flex-1 basis-52 space-y-3">
        <p>Scan on your phone · 扫码参与</p>
        <p className="text-sm opacity-80">Create your star, then tap JOIN CONCERT SYNC. Only this page’s light follows the show. Exit or choose Solid anytime.</p>
        <p className="text-sm opacity-80">建立 Star 后，点 JOIN CONCERT SYNC；仅网页灯光跟随演出，可随时退出。</p>
        {url && <a href={url} className="block break-all font-mono text-xs underline">{url}</a>}
        <Button variant="secondary" disabled={!url} onClick={async () => {
          try { await navigator.clipboard.writeText(url); setCopied(true); setError(""); }
          catch { setError("Copy the link above to share it."); }
        }}>{copied ? <Check /> : <Copy />}{copied ? "COPIED" : "COPY PARTICIPANT LINK"}</Button>
        {error && <p role="alert" className="text-sm">{error}</p>}
      </div>
    </div>
  </section>;
}