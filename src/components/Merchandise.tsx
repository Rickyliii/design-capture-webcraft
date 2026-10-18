import merchandiseCollection from "@/assets/merchandise-collection.jpg";
import { ShoppingBag } from "lucide-react";

const items = [
  { name: "Oversized tee", color: "Black" },
  { name: "Everyday cap", color: "Lavender" },
  { name: "Canvas tote", color: "Natural" },
];

export function Merchandise() {
  return (
    <section aria-labelledby="merchandise-heading" className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="merchandise-heading" className="flex items-center gap-2 text-xl font-extrabold">
          <ShoppingBag className="h-5 w-5 text-accent" /> Merchandise
        </h2>
        <span className="sticker text-muted-foreground">Sample collection</span>
      </div>
      <img
        src={merchandiseCollection}
        alt="Sample concert merchandise: a black oversized tee, lavender cap and natural canvas tote"
        width={1536}
        height={1024}
        loading="lazy"
        className="block aspect-[3/2] w-full rounded-lg border-2 object-cover"
      />
      <div className="mt-3 grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.name}>
            <h3 className="text-sm font-bold leading-snug tracking-normal">{item.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.color}</p>
          </div>
        ))}
      </div>
    </section>
  );
}