import ContributionGraph, { type Day } from "./ContributionGraph";

async function getContributions(user: string) {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${user}?y=last`,
      { next: { revalidate: 60 * 60 * 12 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      total: { lastYear: number };
      contributions: Day[];
    };
    return { total: data.total.lastYear, days: data.contributions };
  } catch {
    return null;
  }
}

export default async function GithubContributions({ user }: { user: string }) {
  const data = await getContributions(user);
  if (!data) return null;

  // Pad the front so the first column starts on Sunday, like GitHub's graph.
  const lead = new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay();
  const cells: (Day | null)[] = [...Array(lead).fill(null), ...data.days];

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold">Contributions</h2>
        <a
          href={`https://github.com/${user}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-foreground/50 transition-colors hover:text-foreground"
        >
          {data.total.toLocaleString()} in the last year ↗
        </a>
      </div>
      <div
        className="mt-3 overflow-x-auto pb-1"
        role="img"
        aria-label={`${data.total} GitHub contributions in the last year`}
      >
        <ContributionGraph cells={cells} />
      </div>
    </section>
  );
}
