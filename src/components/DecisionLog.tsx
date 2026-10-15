import type { Decision } from "@/data";

// Architecture decision records as a numbered list. Each one is a <details>,
// so the titles scan in a few seconds and the reasoning is a click away.
export default function DecisionLog({ decisions }: { decisions: Decision[] }) {
  return (
    <ol className="flex flex-col divide-y divide-foreground/10 border-y border-foreground/10">
      {decisions.map((d, i) => (
        <li key={d.id} id={`adr-${d.id}`} className="scroll-mt-8">
          <details className="group py-3">
            <summary className="flex cursor-pointer list-none items-baseline gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground/40 [&::-webkit-details-marker]:hidden">
              <span className="shrink-0 font-mono text-xs text-muted">
                ADR {String(i + 1).padStart(3, "0")}
              </span>
              <span className="flex-1 font-medium">{d.title}</span>
              <span aria-hidden className="shrink-0 font-mono text-xs text-muted transition-transform group-open:rotate-90 motion-reduce:transition-none">
                ›
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3 pb-2 text-sm leading-relaxed sm:pl-[4.5rem]">
              <p className="font-mono text-xs text-muted">
                {d.status === "accepted" ? "Accepted" : "Superseded"} · {d.date}
              </p>
              <Field label="Context">{d.context}</Field>
              <Field label="Decision">{d.decision}</Field>
              <Field label="Consequences">{d.consequences}</Field>
              {d.alternatives && d.alternatives.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-muted">Considered</p>
                  <ul className="mt-1 flex list-disc flex-col gap-1 pl-4 text-foreground/75">
                    {d.alternatives.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}

function Field({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-foreground/85">{children}</p>
    </div>
  );
}
