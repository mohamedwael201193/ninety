/**
 * Server-rendered stand-in for a page whose form needs the browser (saved trips live in
 * localStorage). Shown until the client panel mounts, and all that is shown without JavaScript.
 */
export function PageShell({ title, lead, fields }: { title: string; lead: string; fields: string[] }) {
  return (
    <div data-testid="page-shell" className="mx-auto max-w-page space-y-6 px-5 py-16">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="max-w-prose text-ink-hushed">{lead}</p>
      <form aria-label={title} className="max-w-prose space-y-3">
        {fields.map((f) => (
          <label key={f} className="block text-sm">
            {f}
            <input disabled className="mt-1 block h-11 w-full rounded-xl border border-black/10 bg-black/[0.03] px-3" />
          </label>
        ))}
      </form>
      <noscript><p className="font-medium">This form runs in your browser and needs JavaScript. Your trips are never sent to a server.</p></noscript>
    </div>
  );
}
