export function SocialSection() {
  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-zinc-900">
              Community on Facebook
            </div>
            <div className="mt-1 text-sm text-zinc-600">
              Mock widget placeholder to mirror recent community activity.
            </div>
          </div>

          <a
            href="https://www.facebook.com/NBDA.2020"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c]"
          >
            <span
              className="grid h-6 w-6 place-items-center rounded bg-white/20"
              aria-hidden="true"
            >
              f
            </span>
            Visit Facebook
          </a>
        </div>

        <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
          Embedded feed will be added later. For now, this card links directly to:
          <div className="mt-2 font-mono text-xs text-zinc-500">
            https://www.facebook.com/NBDA.2020
          </div>
        </div>
      </div>
    </section>
  );
}

