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
        <p>Scan on your phone</p>
        <p className="text-sm opacity-80">No app download needed.</p>
        <Button asChild disabled={!url}><a href={url || undefined}>JOIN LIVE</a></Button>
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