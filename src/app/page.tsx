import { Twin } from "@/components/Twin";
import PixelSky from "@/components/PixelSky";

// "/" — the chat-first digital twin over an 8-bit night sky (twinkling pixel
// stars, drifting blocky clouds, the occasional shooting star).

export default function Home() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <PixelSky />
      </div>
      <div className="relative h-dvh">
        <Twin />
      </div>
    </>
  );
}
