"use client";

import { getJson, postJson } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../providers/ToastProvider";
import { Skeleton } from "../ui/Skeleton";

type RequestItem = {
  id: string;
  patientName: string;
  bloodGroup: string;
  bagsNeeded: number;
  hospitalNameAndAddress: string;
  deadline: string;
  createdAt: string;
  maskedContact: string;
  contactTargetUserId: string | null;
};

export function LiveRequestFeed({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null),
    []
  );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getJson<{ success: boolean; requests: RequestItem[] }>("/requests");
        setItems(res.requests);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to load requests", "error");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [showToast]);

  async function handleViewContact(item: RequestItem) {
    if (!item.contactTargetUserId) {
      showToast("Contact unavailable for this request", "error");
      return;
    }
    if (!token) {
      showToast("Please login to view contact", "error");
      return;
    }
    try {
      const res = await postJson<{ success: boolean; phone: string }>(
        "/donors/view-contact",
        { donorId: item.contactTargetUserId },
        { token }
      );
      setRevealed((prev) => ({ ...prev, [item.id]: res.phone }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to view contact", "error");
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-zinc-900">Live Urgent Blood Request Feed</h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
          Urgent
        </span>
      </div>

      {loading && (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <Skeleton className="mt-4 h-9 w-28" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className={`grid gap-4 ${compact ? "lg:grid-cols-2" : ""}`}>
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">{item.patientName}</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Hospital: {item.hospitalNameAndAddress}
                  </div>
                </div>
                <span className="rounded-full bg-[#DC2626]/10 px-3 py-1 text-xs font-bold text-[#DC2626]">
                  {item.bloodGroup}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-700">
                <div>Bags Needed: {item.bagsNeeded}</div>
                <div>Deadline: {new Date(item.deadline).toLocaleString()}</div>
              </div>

              <div className="mt-3 text-xs text-zinc-700">
                Contact: {revealed[item.id] ?? item.maskedContact}
              </div>

              {!revealed[item.id] && (
                <button
                  type="button"
                  onClick={() => handleViewContact(item)}
                  className="mt-3 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
                >
                  View Contact
                </button>
              )}
            </article>
          ))}
          {items.length === 0 && (
            <p className="rounded-xl border border-zinc-200 bg-white px-4 py-6 text-sm text-zinc-600">
              No active urgent requests right now.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

