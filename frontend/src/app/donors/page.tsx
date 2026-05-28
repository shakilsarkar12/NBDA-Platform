"use client";

import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/Skeleton";
import { getJson, postJson } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

type Donor = {
  id: string;
  name: string;
  uniqueId: string;
  bloodGroup: string;
  role: string;
  isAvailable: boolean;
  division: string;
  district: string;
  upazila: string;
  maskedPhone: string;
};

export default function DonorsPage() {
  const [loading, setLoading] = useState(true);
  const [allDonors, setAllDonors] = useState<Donor[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    bloodGroup: "",
    division: "",
    district: "",
    upazila: "",
  });
  const { showToast } = useToast();

  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null),
    []
  );

  const divisions = useMemo(
    () => Array.from(new Set(allDonors.map((d) => d.division))).filter(Boolean),
    [allDonors]
  );
  const districts = useMemo(() => {
    const scope = filters.division
      ? allDonors.filter((d) => d.division === filters.division)
      : allDonors;
    return Array.from(new Set(scope.map((d) => d.district))).filter(Boolean);
  }, [allDonors, filters.division]);
  const upazilas = useMemo(() => {
    const scope = allDonors.filter(
      (d) =>
        (!filters.division || d.division === filters.division) &&
        (!filters.district || d.district === filters.district)
    );
    return Array.from(new Set(scope.map((d) => d.upazila))).filter(Boolean);
  }, [allDonors, filters.division, filters.district]);

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.bloodGroup) params.set("bloodGroup", filters.bloodGroup);
      if (filters.division) params.set("division", filters.division);
      if (filters.district) params.set("district", filters.district);
      if (filters.upazila) params.set("upazila", filters.upazila);

      const res = await getJson<{ success: boolean; donors: Donor[] }>(
        `/donors/search${params.toString() ? `?${params.toString()}` : ""}`
      );
      setDonors(res.donors);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load donors", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadAll() {
      try {
        const res = await getJson<{ success: boolean; donors: Donor[] }>("/donors/search");
        setAllDonors(res.donors);
      } catch {
        // no-op
      }
    }
    void loadAll();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.bloodGroup, filters.division, filters.district, filters.upazila]);

  async function handleViewNumber(donorId: string) {
    if (!token) {
      showToast("Please login to view number", "error");
      return;
    }
    try {
      const res = await postJson<{ success: boolean; phone: string }>(
        "/donors/view-contact",
        { donorId },
        { token }
      );
      setRevealed((prev) => ({ ...prev, [donorId]: res.phone }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to view number", "error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <h1 className="text-2xl font-black text-zinc-900">Find Donors</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Advanced filters with privacy-first masked contacts.
        </p>

        <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Blood Group"
              value={filters.bloodGroup}
              onChange={(bloodGroup) => setFilters((p) => ({ ...p, bloodGroup }))}
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            />
            <Select
              label="Division"
              value={filters.division}
              onChange={(division) =>
                setFilters((p) => ({ ...p, division, district: "", upazila: "" }))
              }
              options={divisions}
            />
            <Select
              label="District"
              value={filters.district}
              onChange={(district) => setFilters((p) => ({ ...p, district, upazila: "" }))}
              options={districts}
            />
            <Select
              label="Upazila"
              value={filters.upazila}
              onChange={(upazila) => setFilters((p) => ({ ...p, upazila }))}
              options={upazilas}
            />
          </div>
        </section>

        <section className="mt-5">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-4 w-24" />
                  <Skeleton className="mt-3 h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {donors.map((donor) => (
                <article
                  key={donor.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="text-sm font-bold text-zinc-900">{donor.name}</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {donor.uniqueId || "NBDA-UNASSIGNED"}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#DC2626]/10 px-2 py-1 text-xs font-semibold text-[#DC2626]">
                      {donor.bloodGroup}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        donor.isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {donor.isAvailable ? "Available / রক্তদানে প্রস্তুত" : "On Medical Rest"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-600">
                    {donor.division}, {donor.district}, {donor.upazila}
                  </div>
                  <div className="mt-2 text-xs text-zinc-700">
                    Contact: {revealed[donor.id] ?? donor.maskedPhone}
                  </div>
                  {!revealed[donor.id] && (
                    <button
                      type="button"
                      onClick={() => handleViewNumber(donor.id)}
                      className="mt-3 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
                    >
                      View Number
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
    >
      <option value="">All {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

