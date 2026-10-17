import { useEffect, useState } from "react";
import { Plus, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function HomeScreenPrompt() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIos(isIos);
    setVisible(!standalone && (isIos || /Android/.test(navigator.userAgent)));
  }, []);
  if (!visible) return null;
  return <>
    <Button variant="ghost" className="mt-3 min-h-12 w-full border border-background/30" onClick={() => setOpen(true)}><Smartphone className="h-4 w-4" />ADD TO HOME SCREEN</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-auto rounded-md">
        <DialogTitle>Your concert light, edge to edge</DialogTitle>
        <DialogDescription>Open FanDrop from your home screen for fewer browser bars. An internet connection is still required.</DialogDescription>
        {ios ? <ol className="space-y-4 text-sm"><li>1. Open this participation link in Safari.</li><li className="flex items-center gap-2">2. Tap <Share className="h-4 w-4 shrink-0" /> Share, then More if needed.</li><li className="flex items-center gap-2">3. Choose <Plus className="h-4 w-4 shrink-0" /> Add to Home Screen.</li><li>4. Keep Open as Web App enabled, then tap Add.</li><li>5. Open FanDrop from the new icon and tap JOIN CONCERT SYNC.</li></ol> : <p className="text-sm">Open this link in Chrome, then choose Add to Home screen or Install app from the browser menu. Open the new icon and tap JOIN CONCERT SYNC.</p>}
        <p className="text-xs text-muted-foreground">A guest preview link may expire. Use the public participation link when available. If your star is not carried over, create it in the home-screen app.</p>
        <Button onClick={() => setOpen(false)}>GOT IT</Button>
      </DialogContent>
    </Dialog>
  </>;
}