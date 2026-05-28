"use client";

import { Header } from "@/components/layout/Header";
import { getJson, patchJson, postJson } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

type DashboardUser = {
  _id: string;
  uniqueId: string;
  name: string;
  role: string;
  bloodGroup: string;
  points: number;
  impactMetrics: number;
  isAvailable: boolean;
};

type DonorPreview = {
  id: string;
  name: string;
  bloodGroup: string;
  role: string;
  isAvailable: boolean;
  maskedPhone: string;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [busyToggle, setBusyToggle] = useState(false);
  const [donors, setDonors] = useState<DonorPreview[]>([]);
  const [revealedContact, setRevealedContact] = useState<Record<string, string>>({});

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          setError("Please login to access dashboard.");
          return;
        }

        const me = await getJson<{ success: boolean; user: DashboardUser }>(
          "/auth/me",
          { token }
        );
        setUser(me.user);

        const donorRes = await getJson<{ success: boolean; donors: DonorPreview[] }>(
          "/donors/search",
          { token }
        );
        setDonors(donorRes.donors);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  async function handleAvailabilityToggle(nextValue: boolean) {
    if (!token || !user) return;

    try {
      setBusyToggle(true);
      const res = await patchJson<{ success: boolean; user: DashboardUser }>(
        "/auth/availability",
        { isAvailable: nextValue },
        { token }
      );
      setUser(res.user);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusyToggle(false);
    }
  }

  async function handleViewContact(donorId: string) {
    if (!token) return;
    try {
      const res = await postJson<{ success: boolean; phone: string }>(
        "/donors/view-contact",
        { donorId },
        { token }
      );
      setRevealedContact((prev) => ({ ...prev, [donorId]: res.phone }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to view contact");
    }
  }

  async function handleLogDonation() {
    if (!token) return;
    try {
      const res = await postJson<{ success: boolean; user: DashboardUser }>(
        "/auth/donation/log",
        {},
        { token }
      );
      setUser(res.user);
      alert("Donation logged. Availability set to Busy.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to log donation");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 px-4 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl pb-16 pt-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h1 className="text-2xl font-black text-zinc-900">Profile Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Enterprise profile card with live availability management.
            </p>

            {loading && <p className="mt-6 text-sm text-zinc-600">Loading profile...</p>}
            {error && (
              <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            {user && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ProfileRow label="Unique ID" value={user.uniqueId} />
                <ProfileRow label="Name" value={user.name} />
                <ProfileRow label="Role" value={user.role} />
                <ProfileRow label="Blood Group" value={user.bloodGroup} />
                <ProfileRow label="Total Points" value={String(user.points)} />
                <ProfileRow label="Impact Metrics" value={String(user.impactMetrics)} />

                <div className="sm:col-span-2 mt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    disabled={busyToggle}
                    onClick={() => handleAvailabilityToggle(!user.isAvailable)}
                    className={`inline-flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                      user.isAvailable ? "bg-emerald-600" : "bg-zinc-600"
                    } disabled:opacity-60`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        user.isAvailable ? "bg-emerald-200" : "bg-zinc-300"
                      }`}
                    />
                    Status: {user.isAvailable ? "Available" : "Busy"}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogDonation}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                  >
                    Log Donation (120-day lock)
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900">Donor Search (Masked)</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Phone numbers are masked by default for privacy.
            </p>
            <div className="mt-4 space-y-3">
              {donors.slice(0, 8).map((donor) => (
                <div key={donor.id} className="rounded-xl border border-zinc-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{donor.name}</div>
                      <div className="text-xs text-zinc-600">
                        {donor.bloodGroup} • {donor.role}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        donor.isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {donor.isAvailable ? "Available" : "Busy"}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-zinc-700">
                    Contact: {revealedContact[donor.id] ?? donor.maskedPhone}
                  </div>

                  {!revealedContact[donor.id] && (
                    <button
                      type="button"
                      onClick={() => handleViewContact(donor.id)}
                      className="mt-2 rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#b91c1c]"
                    >
                      View Contact
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

