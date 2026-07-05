// Decorative minimap strip (.impeccable.md: authentic editor details).
// Deterministic bars — no randomness, so SSR and client always match.

const BARS: Array<{ w: number; i: number; c: string }> = [
  { w: 46, i: 0, c: "--syn-yellow" },
  { w: 0, i: 0, c: "--foreground" },
  { w: 82, i: 0, c: "--foreground" },
  { w: 74, i: 0, c: "--foreground" },
  { w: 58, i: 8, c: "--foreground" },
  { w: 0, i: 0, c: "--foreground" },
  { w: 38, i: 0, c: "--syn-aqua" },
  { w: 66, i: 8, c: "--foreground" },
  { w: 71, i: 8, c: "--foreground" },
  { w: 30, i: 16, c: "--syn-orange" },
  { w: 55, i: 16, c: "--foreground" },
  { w: 62, i: 8, c: "--foreground" },
  { w: 0, i: 0, c: "--foreground" },
  { w: 42, i: 0, c: "--syn-aqua" },
  { w: 78, i: 8, c: "--foreground" },
  { w: 50, i: 8, c: "--foreground" },
  { w: 34, i: 16, c: "--syn-green" },
  { w: 68, i: 16, c: "--foreground" },
  { w: 26, i: 8, c: "--foreground" },
  { w: 0, i: 0, c: "--foreground" },
  { w: 44, i: 0, c: "--syn-orange" },
  { w: 76, i: 8, c: "--foreground" },
  { w: 60, i: 8, c: "--foreground" },
  { w: 52, i: 16, c: "--foreground" },
  { w: 36, i: 8, c: "--syn-yellow" },
  { w: 70, i: 8, c: "--foreground" },
  { w: 28, i: 0, c: "--foreground" },
];

export function Minimap() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-6 right-3 top-6 hidden w-14 select-none lg:block"
    >
      {/* viewport indicator */}
      <div className="absolute -left-1 -right-1 top-0 h-14 rounded-[2px] bg-hover" />
      {BARS.map((bar, idx) =>
        bar.w === 0 ? (
          <div key={idx} className="h-[5px]" />
        ) : (
          <div
            key={idx}
            className="mb-[3px] h-[3px] rounded-[1px]"
            style={{
              width: `${bar.w}%`,
              marginLeft: bar.i,
              background: `var(${bar.c})`,
              opacity: 0.28,
            }}
          />
        ),
      )}
    </div>
  );
}
