import { useLayoutEffect, useRef } from "react";

/** Keep the browser's exposed safe areas in step with the current light. */
export function useLightSurface(color: string) {
  const currentColor = useRef(color);
  currentColor.current = color;
  const applyColor = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previous = root.style.getPropertyValue("--concert-light");
    const hadAttribute = root.hasAttribute("data-concert-light");
    const surfaces = [root, body].map(element => ({ element, background: element.style.getPropertyValue("background-color"), priority: element.style.getPropertyPriority("background-color") }));
    root.setAttribute("data-concert-light", "");
    const existing = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
    const saved = existing.map(meta => meta.content);
    const metas = existing.length ? existing : [document.createElement("meta")];
    if (!existing.length) { metas[0]?.setAttribute("name", "theme-color"); if (metas[0]) document.head.appendChild(metas[0]); }
    const apply = () => {
      const value = currentColor.current;
      const resolved = value.startsWith("var(") ? getComputedStyle(root).getPropertyValue(value.slice(4, -1)).trim() : value;
      root.style.setProperty("--concert-light", resolved);
      // iOS samples the document surface as well as theme-color for its toolbar tint.
      surfaces.forEach(({ element }) => element.style.setProperty("background-color", resolved, "important"));
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => { if (meta.content !== resolved) meta.content = resolved; });
    };
    applyColor.current = apply;
    apply();
    // Keep the tint when the router reconciles metadata during live updates.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true });
    return () => {
      observer.disconnect();
      applyColor.current = null;
      if (previous) root.style.setProperty("--concert-light", previous); else root.style.removeProperty("--concert-light");
      if (!hadAttribute) root.removeAttribute("data-concert-light");
      surfaces.forEach(({ element, background, priority }) => { if (background) element.style.setProperty("background-color", background, priority); else element.style.removeProperty("background-color"); });
      metas.forEach((meta, i) => { if (existing.length) meta.content = saved[i] ?? ""; else meta.remove(); });
    };
  }, []);
  useLayoutEffect(() => { applyColor.current?.(); }, [color]);
}