import data from "@/data/verification.json";

/** The verified numbers, each linking its source (src/data/verification.json). Shown on / and /proof. */
export default function VerifiedNumbers({ heading = true }: { heading?: boolean }) {
  return (
    <div data-testid="verified-numbers">
      {heading ? <h2 className="mb-1 text-xl font-medium">Verified on every pull request</h2> : null}
      <p className="mb-4 text-sm text-ink-hushed">As of {data.asOf}. Every number links to where it comes from.</p>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {data.items.map((it) => (
          <li key={it.id} data-testid={`verified-${it.id}`} className="card-soft p-4">
            <a href={it.href} className="block hover:underline underline-offset-4">
              <span className="block text-2xl font-semibold tabular-nums">{it.value}</span>
              <span className="mt-1 block text-xs text-ink-hushed">{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
