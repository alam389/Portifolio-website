import { profile, skills } from "@/data";

export default function About() {
  const { education } = profile;

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <div className="mt-4 flex flex-col gap-4 text-foreground/80">
          {profile.summary.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Education</h2>
        <p className="mt-3 font-medium">{education.school}</p>
        <p className="text-foreground/70">
          {education.degree} · GPA {education.gpa}
        </p>
        <p className="font-mono text-sm text-foreground/50">{education.period}</p>
        <p className="mt-2 text-sm text-foreground/70">
          Coursework: {education.coursework.join(", ")}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Skills</h2>
        <dl className="mt-3 flex flex-col gap-3">
          {skills.map((group) => (
            <div key={group.label}>
              <dt className="text-sm text-foreground/50">{group.label}</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-foreground/5 px-2 py-1 font-mono text-xs"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
