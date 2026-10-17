import React, { useEffect, useRef, useState } from 'react';

// Seeded coordinates keep the same sky across visits; these are illustrative stars.
const stars = Array.from({ length: 720 }, (_, i) => {
  const random = n => { const x = Math.sin((i + 1) * n) * 43758.5453; return x - Math.floor(x); };
  return { x: random(12.98), y: random(78.23), z: random(39.47), a: random(25.19) * Math.PI * 2 };
});
export default function CollectiveSky({ phase = 'sky', reduced = false, color = '#e4c08a', personal = true }) {
  const canvas = useRef(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const el = canvas.current;
    let ctx;
    try { ctx = el.getContext('2d'); } catch { /* Use static sky below. */ }
    if (!ctx) { setFallback(true); return; }
    let frame, width = 0, height = 0, last = 0;
    const start = performance.now();
    function resize() {
      const rect = el.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      el.width = width * dpr; el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const observer = new ResizeObserver(() => { resize(); if (reduced) { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); } }); observer.observe(el); resize();
    function draw(now) {
      frame = requestAnimationFrame(draw);
      if (document.hidden || now - last < 32) return;
      last = now;
      const t = reduced ? 0 : (now - start) / 1000;
      const progress = reduced ? 1 : Math.min(t / (phase === 'convergence' ? 6 : 4), 1);
      ctx.clearRect(0, 0, width, height);
      const cx = width * .5, cy = height * .47, radius = Math.min(width, height) * .29;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.7);
      glow.addColorStop(0, phase === 'darkness' ? '#221a2610' : '#94716326');
      glow.addColorStop(.45, '#59445518'); glow.addColorStop(1, '#09090e00');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (phase === 'darkness' && i > 22) continue;
        if (phase === 'awakening' && i / stars.length > .06 + progress * .94) continue;
        let x = s.x * width, y = s.y * height;
        const angle = s.a + t * .025;
        const sphereX = cx + Math.cos(angle) * Math.sqrt(1 - (s.y * 2 - 1) ** 2) * radius;
        const sphereY = cy + (s.y * 2 - 1) * radius * .82;
        if (phase === 'convergence' || phase === 'reveal') {
          const mix = phase === 'reveal' ? 1 : progress * progress * (3 - 2 * progress);
          x += (sphereX - x) * mix; y += (sphereY - y) * mix;
        } else if (!reduced) {
          x += Math.sin(t * .16 + s.a) * 5; y += Math.cos(t * .13 + s.a) * 4;
        }
        if (phase === 'awakening') { x += (cx - x) * progress * .12; y += (cy - y) * progress * .12; }
        const alpha = (.25 + s.z * .65) * (phase === 'darkness' ? .45 : 1);
        ctx.globalAlpha = alpha; ctx.fillStyle = i % 7 === 0 ? color : '#ead9c9';
        const size = .45 + s.z * 1.25;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
        if (s.z > .95) { ctx.globalAlpha = alpha * .35; ctx.fillRect(x - 5, y - .35, 10, .7); ctx.fillRect(x - .35, y - 5, .7, 10); }
      }
      if (personal && phase === 'sky') {
        const x = width * .61, y = height * .42;
        ctx.globalAlpha = 1; ctx.fillStyle = color;
        ctx.shadowColor = color; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 3, y - 3); ctx.lineTo(x + 12, y); ctx.lineTo(x + 3, y + 3); ctx.lineTo(x, y + 12); ctx.lineTo(x - 3, y + 3); ctx.lineTo(x - 12, y); ctx.lineTo(x - 3, y - 3); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#ddd0c4'; ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.fillText('YOUR LIGHT', x, y - 24);
      }
      ctx.globalAlpha = 1;
      if (reduced) cancelAnimationFrame(frame);
    }
    frame = requestAnimationFrame(draw);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [phase, reduced, color, personal]);
  return <div className={`collective-canvas phase-${phase}`} role="img" aria-label={`Illustrated collective sky. ${phase === 'sky' ? 'Your personal star is highlighted among hundreds of simulated audience stars.' : `Opening ceremony: ${phase}.`}`}>
    <canvas ref={canvas} aria-hidden="true"/>
    {fallback && <div className="static-sky" aria-hidden="true">{stars.slice(0, 180).map((s, i) => <i key={i} style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, opacity: .3 + s.z * .7 }}/>)}</div>}
    <div className="sky-horizon"/>
  </div>;
}
