"use client";

import React, { useMemo, useState } from "react";
import { BLOOD_GROUPS } from "@/constants";

type EmergencyRequestPayload = {
  patientName: string;
  bloodGroup: string;
  bagsNeeded: number;
  hospitalNameAndAddress: string;
  relativeContact: string;
  deadline: string;
};

const initialPayload: EmergencyRequestPayload = {
  patientName: "",
  bloodGroup: BLOOD_GROUPS[0] ?? "A+",
  bagsNeeded: 1,
  hospitalNameAndAddress: "",
  relativeContact: "",
  deadline: "",
};

export function EmergencyRequestForm() {
  const [payload, setPayload] = useState<EmergencyRequestPayload>(initialPayload);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return (
      payload.patientName.trim().length > 0 &&
      payload.bloodGroup.trim().length > 0 &&
      payload.bagsNeeded > 0 &&
      payload.hospitalNameAndAddress.trim().length > 0 &&
      payload.relativeContact.trim().length > 0 &&
      payload.deadline.trim().length > 0
    );
  }, [payload]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!isValid) {
      setMessage("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Week 3 UI-only: backend integration comes in later weeks.
      setMessage("Emergency request saved locally (UI placeholder).");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="emergency-request" className="mt-10 scroll-mt-24">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900">
              Emergency Blood Request Post
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Submit emergency blood needs with clear hospital and contact details.
            </p>
          </div>
          <div className="rounded-xl bg-[#DC2626]/10 px-3 py-2 text-xs font-semibold text-[#DC2626]">
            UI Layout (Week 3)
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-zinc-700">Patient Name</label>
            <input
              value={payload.patientName}
              onChange={(e) =>
                setPayload((p) => ({ ...p, patientName: e.target.value }))
              }
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="e.g. Rahim Uddin"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-zinc-700">Blood Group</label>
            <select
              value={payload.bloodGroup}
              onChange={(e) =>
                setPayload((p) => ({ ...p, bloodGroup: e.target.value }))
              }
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              required
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-zinc-700">Bags Needed</label>
            <input
              type="number"
              min={1}
              value={payload.bagsNeeded}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  bagsNeeded: Number(e.target.value),
                }))
              }
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-zinc-700">
              Relative&apos;s Contact
            </label>
            <input
              value={payload.relativeContact}
              onChange={(e) =>
                setPayload((p) => ({ ...p, relativeContact: e.target.value }))
              }
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="e.g. 017XXXXXXXXX"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-zinc-700">
              Hospital Name & Address
            </label>
            <textarea
              value={payload.hospitalNameAndAddress}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  hospitalNameAndAddress: e.target.value,
                }))
              }
              className="mt-2 w-full min-h-[96px] resize-y rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="Hospital + full address"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-zinc-700">Deadline</label>
            <input
              type="datetime-local"
              value={payload.deadline}
              onChange={(e) =>
                setPayload((p) => ({ ...p, deadline: e.target.value }))
              }
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit Request
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
            {message}
          </div>
        )}
      </div>
    </section>
  );
}

