// Minecraft-style block-break particle burst. DOM squares + Web Animations
// API, self-cleaning, no-op under prefers-reduced-motion. Call with the
// clicked element; particles spawn across its face and tumble away.

const COLORS = ["#cfd8e4", "#9fb0c2", "#7d8ea1", "#ffffff"];

export function pixelPoof(el: HTMLElement) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = el.getBoundingClientRect();
  const count = 12;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const size = 4 + Math.floor(Math.random() * 5);
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    p.style.cssText = [
      "position:fixed",
      `left:${x.toFixed(0)}px`,
      `top:${y.toFixed(0)}px`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${COLORS[i % COLORS.length]}`,
      "pointer-events:none",
      "z-index:9999",
    ].join(";");
    document.body.appendChild(p);

    // arc: kick up and out, then fall past the start point while fading
    const ang = Math.random() * Math.PI * 2;
    const dist = 26 + Math.random() * 46;
    const dx = Math.cos(ang) * dist;
    const dyUp = -Math.abs(Math.sin(ang)) * dist * 0.7 - 8;
    const dyDown = 36 + Math.random() * 44;

    p.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        {
          transform: `translate(${(dx * 0.6).toFixed(1)}px, ${dyUp.toFixed(1)}px)`,
          opacity: 1,
          offset: 0.4,
        },
        {
          transform: `translate(${dx.toFixed(1)}px, ${dyDown.toFixed(1)}px)`,
          opacity: 0,
        },
      ],
      { duration: 550 + Math.random() * 200, easing: "cubic-bezier(.25,.5,.5,1)" },
    ).onfinish = () => p.remove();
  }
}
