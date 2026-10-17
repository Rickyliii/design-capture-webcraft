import { useEffect } from "react";

/** Keep the browser's exposed safe areas in step with the current light. */
export function useLightSurface(color: string) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--concert-light");
    const hadAttribute = root.hasAttribute("data-concert-light");
    root.setAttribute("data-concert-light", "");
    root.style.setProperty("--concert-light", color);
    const existing = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
    const saved = existing.map(meta => meta.content);
    const metas = existing.length ? existing : [document.createElement("meta")];
    if (!existing.length) { metas[0]?.setAttribute("name", "theme-color"); if (metas[0]) document.head.appendChild(metas[0]); }
    metas.forEach(meta => { meta.content = color; });
    return () => {
      if (previous) root.style.setProperty("--concert-light", previous); else root.style.removeProperty("--concert-light");
      if (!hadAttribute) root.removeAttribute("data-concert-light");
      metas.forEach((meta, i) => { if (existing.length) meta.content = saved[i] ?? ""; else meta.remove(); });
    };
  }, [color]);
}