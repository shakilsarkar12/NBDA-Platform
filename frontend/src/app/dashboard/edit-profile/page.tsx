"use client";

import { Header } from "@/components/layout/Header";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { patchJson } from "@/lib/api";
import { useEffect, useState } from "react";

type ProfileForm = {
  name: string;
  phone: string;
  bloodGroup: string;
  division: string;
  district: string;
  upazila: string;
  village: string;
  profileImageUrl: string;
  isAvailable: boolean;
};

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    bloodGroup: "",
    division: "",
    district: "",
    upazila: "",
    village: "",
    profileImageUrl: "",
    isAvailable: true,
  });

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: user.name,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      division: user.division,
      district: user.district,
      upazila: user.upazila,
      village: user.village,
      profileImageUrl: user.profileImageUrl ?? "",
      isAvailable: user.isAvailable,
    });
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      showToast("Please login first", "error");
      return;
    }

    try {
      setLoading(true);
      await patchJson(
        "/auth/profile",
        {
          name: form.name,
          bloodGroup: form.bloodGroup,
          division: form.division,
          district: form.district,
          upazila: form.upazila,
          village: form.village,
          profileImageUrl: form.profileImageUrl,
          isAvailable: form.isAvailable,
        },
        { token }
      );
      await refreshUser();
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8">
        <h1 className="text-2xl font-black text-zinc-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-zinc-600">Keep your donor profile up to date.</p>

        <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
            <Field label="Phone (Read-only)" value={form.phone} onChange={() => {}} disabled />
            <Field label="Blood Group" value={form.bloodGroup} onChange={(v) => setForm((p) => ({ ...p, bloodGroup: v }))} />
            <Field label="Division" value={form.division} onChange={(v) => setForm((p) => ({ ...p, division: v }))} />
            <Field label="District" value={form.district} onChange={(v) => setForm((p) => ({ ...p, district: v }))} />
            <Field label="Upazila" value={form.upazila} onChange={(v) => setForm((p) => ({ ...p, upazila: v }))} />
            <Field label="Village" value={form.village} onChange={(v) => setForm((p) => ({ ...p, village: v }))} />
            <Field
              label="Profile Picture URL"
              value={form.profileImageUrl}
              onChange={(v) => setForm((p) => ({ ...p, profileImageUrl: v }))}
            />
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700">Availability Status</label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isAvailable: !p.isAvailable }))}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                    form.isAvailable ? "bg-emerald-600" : "bg-zinc-600"
                  }`}
                >
                  {form.isAvailable ? "Available" : "Busy"}
                </button>
                <span className="text-xs text-zinc-600">
                  Upload support placeholder: file upload integration can be added next.
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-xl bg-[#DC2626] px-5 py-3 text-sm font-bold text-white hover:bg-[#b91c1c] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-zinc-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:bg-zinc-100"
      />
    </div>
  );
}

