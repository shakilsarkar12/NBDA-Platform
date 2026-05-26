export function LiveCounterBadge() {
  return (
    <section className="mt-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Total Registered Donors
          </div>
          <div className="mt-2 text-3xl font-black text-zinc-900">
            1,250
          </div>
          <div className="mt-1 text-sm text-zinc-600">Mock placeholder</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Bags Managed
          </div>
          <div className="mt-2 text-3xl font-black text-zinc-900">
            3,480
          </div>
          <div className="mt-1 text-sm text-zinc-600">Mock placeholder</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Active Live Requests
          </div>
          <div className="mt-2 text-3xl font-black text-zinc-900">
            12
          </div>
          <div className="mt-1 text-sm text-zinc-600">Mock placeholder</div>
        </div>
      </div>
    </section>
  );
}

