import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import hoodieAsset from "@/assets/merch-hoodie.jpg.asset.json";
import keychainAsset from "@/assets/merch-keychain.jpg.asset.json";

const products = [
  { id: "hoodie", name: "First Light Hoodie", edition: "THE AFTERLIGHT EDITION", image: hoodieAsset.url, description: "A midnight-black oversized hoodie with a bright star at its heart. A little piece of the night, wherever you go.", options: ["S", "M", "L", "XL"], optionLabel: "Size" },
  { id: "keychain", name: "Your Star Keychain", edition: "THE ORIGIN EDITION", image: keychainAsset.url, description: "An iridescent star that catches the light. Carry your concert constellation long after the final song.", options: ["Iridescent"], optionLabel: "Finish" },
] as const;

export function ExclusiveMerch() {
  const [selected, setSelected] = useState<(typeof products)[number] | null>(null);
  const [option, setOption] = useState("");
  const [ordered, setOrdered] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!selected) return;
    previous.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); previous.current?.focus(); };
  }, [selected]);
  function open(product: (typeof products)[number]) { setSelected(product); setOption(product.options[0]); setOrdered(false); }
  return <section className="mt-8" aria-label="FanDrop exclusive merchandise">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="sticker text-muted-foreground">ONLY ON FANDROP</p><h2 className="mt-1 text-xl font-extrabold">Keep a piece of tonight.</h2></div><span className="rounded-full border border-border px-2 py-1 font-mono text-[10px]">CONCEPT DEMO</span></div>
    <div className="grid grid-cols-2 gap-3">{products.map(product => <article key={product.id} className="overflow-hidden rounded-lg border-2 border-border bg-card text-card-foreground">
      <Button variant="ghost" className="h-auto w-full rounded-none p-0" aria-label={`View ${product.name}`} onClick={() => open(product)}><img src={product.image} alt={product.name} loading="lazy" width={1024} height={1024} className="aspect-square w-full object-cover" /></Button>
      <div className="p-3"><p className="font-mono text-[9px] text-muted-foreground">FANDROP EXCLUSIVE</p><h3 className="mt-1 min-h-10 text-sm font-bold leading-5">{product.name}</h3><Button variant="ghost" className="mt-2 h-auto w-full justify-between whitespace-normal border-t border-border px-0 pt-3 text-xs" onClick={() => open(product)}>View drop<ArrowUpRight /></Button></div>
    </article>)}</div>
    {selected && <dialog ref={dialog} className="merch-dialog m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-lg border-2 border-border bg-card p-0 text-card-foreground" aria-label={selected.name} onCancel={e => { e.preventDefault(); setSelected(null); }}>
      <div className="relative"><img src={selected.image} alt={selected.name} width={1024} height={1024} className="aspect-square w-full object-cover" /><Button variant="secondary" size="icon" className="absolute right-3 top-3" aria-label="Close merchandise preview" onClick={() => setSelected(null)}><X /></Button></div>
      <div className="p-5"><p className="sticker text-muted-foreground">{selected.edition} · CONCEPT DEMO</p><h2 className="mt-2 text-2xl font-extrabold">{selected.name}</h2>
      {ordered ? <div role="status" className="mt-5 space-y-3"><Check className="h-8 w-8" /><h3 className="text-xl font-bold">Demo order complete!</h3><p className="text-sm text-muted-foreground">{selected.name} · {option}</p><p className="text-sm">No payment taken. No real order placed.</p><Button className="w-full" onClick={() => setSelected(null)}>Back to the show</Button></div> : <><p className="mt-3 text-sm text-muted-foreground">{selected.description}</p><fieldset className="mt-5"><legend className="mb-2 text-sm font-bold">{selected.optionLabel}</legend><div className="flex flex-wrap gap-2">{selected.options.map(value => <Button key={value} variant={option === value ? "default" : "outline"} aria-pressed={option === value} onClick={() => setOption(value)}>{value}</Button>)}</div></fieldset><Button className="mt-5 min-h-12 w-full" onClick={() => setOrdered(true)}><ShoppingBag />Try demo purchase</Button><p className="mt-3 text-center text-xs text-muted-foreground">Concept product · No payment or shipping</p></>}
      </div>
    </dialog>}
  </section>;
}