import { site } from "@/lib/site";

export function ProsePage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-10 pt-12">
      <h1 className="font-display text-5xl font-bold tracking-tight">{title}</h1>
      {updated ? <p className="chip mt-4 bg-sun">Last updated {updated}</p> : null}
      <div className="sticker mt-8 space-y-5 p-6 font-semibold leading-7 text-mute md:p-10 [&_a]:font-bold [&_a]:text-grape [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </main>
  );
}

export function ContactLine() {
  return site.contactEmail ? (
    <p>
      Contact us at <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
    </p>
  ) : null;
}
