import type { Frame, Palette } from "./sprites";

/**
 * Paints one frame onto a canvas the frame's size, one fillRect per pixel. The
 * canvas is scaled up by CSS with `image-rendering: pixelated`, so it stays
 * tiny and repainting (frame change, theme swap) is cheap.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  palette: Palette,
  flip = false,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  frame.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === ".") continue;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(flip ? row.length - 1 - x : x, y, 1, 1);
    }
  });
}

/**
 * The CSS scale nearest `scale` that lands on whole device pixels, so every
 * sprite pixel is the same width (3x at 150% zoom would be 4.5px otherwise).
 */
export function crispScale(scale: number, dpr: number) {
  return Math.max(1, Math.round(scale * dpr)) / dpr;
}
