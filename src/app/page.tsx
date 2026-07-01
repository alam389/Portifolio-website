import { profile } from "@/data";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">{profile.name}</h1>
      <p className="text-lg text-foreground/70">{profile.subtitle}</p>
      <p className="text-sm text-foreground/50">
        Fresh Next.js + TypeScript + Tailwind v4 scaffold. Your content is
        preserved in <code className="font-mono">src/data/</code> — build your
        components on top of it.
      </p>
    </main>
  );
}
