"use client";

import React, { useMemo, useState } from "react";
import { postJson } from "@/lib/api";
import { BLOOD_GROUPS } from "@/constants";
import type { AppLanguage } from "../providers/LanguageProvider";
import { useLanguage } from "../providers/LanguageProvider";

type RegisterStep = 1 | 2;
type BloodGroup = (typeof BLOOD_GROUPS)[number];

type RegisterResponse = {
  success: boolean;
  message: string;
  expiresAt: string;
};

type VerifyResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  user: {
    id: string;
    uniqueId?: string;
    name: string;
    phone: string;
  };
};

const passwordHint =
  "Use a strong password (minimum 8 characters). OTP is printed to the backend terminal (mock SMS).";

export function RegistrationForm() {
  const { language } = useLanguage();

  const [step, setStep] = useState<RegisterStep>(1);

  const [form, setForm] = useState<{
    name: string;
    phone: string;
    bloodGroup: BloodGroup;
    division: string;
    district: string;
    upazila: string;
    village: string;
    role: string;
  }>({
    name: "",
    phone: "",
    bloodGroup: (BLOOD_GROUPS[0] ?? "A+") as BloodGroup,
    division: "",
    district: "",
    upazila: "",
    village: "",
    role: "User",
  });

  const [otp, setOtp] = useState({
    code: "",
    password: "",
  });

  const [otpMeta, setOtpMeta] = useState<{ phone: string; expiresAt: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const t = useMemo(() => getCopy(language), [language]);

  const step1Valid =
    form.name.trim() &&
    form.phone.trim() &&
    form.bloodGroup.trim() &&
    form.division.trim() &&
    form.district.trim() &&
    form.upazila.trim() &&
    form.village.trim();

  const step2Valid = otp.code.trim().length === 6 && otp.password.trim().length >= 8;

  async function onRegisterStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!step1Valid) {
      setError(t.errorFillAll);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        bloodGroup: form.bloodGroup,
        division: form.division,
        district: form.district,
        upazila: form.upazila,
        village: form.village,
        role: form.role,
      };

      const result = await postJson<RegisterResponse>("/auth/register", payload);
      setOtpMeta({ phone: form.phone, expiresAt: result.expiresAt });
      setStep(2);
      setSuccessMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!otpMeta) {
      setError("OTP session missing. Please start registration again.");
      return;
    }
    if (!step2Valid) {
      setError(t.errorInvalidOtpOrPassword);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        phone: otpMeta.phone,
        code: otp.code,
        password: otp.password,
      };

      const result = await postJson<VerifyResponse>("/auth/verify-otp-and-register", payload);
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      setSuccessMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="auth-registration" className="scroll-mt-24">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900">{t.registerTitle}</h2>
            <p className="mt-1 text-sm text-zinc-600">{t.registerSubtitle}</p>
          </div>
          <div className="rounded-xl bg-[#DC2626]/10 px-3 py-2 text-xs font-semibold text-[#DC2626]">
            Week 3
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={onRegisterStep1} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700">
                {t.fullNameLabel}
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="e.g. Rahim Uddin"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-zinc-700">{t.phoneLabel}</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="017XXXXXXXXX"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-zinc-700">
                {t.bloodGroupLabel}
              </label>
              <select
                value={form.bloodGroup}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    bloodGroup: e.target.value as BloodGroup,
                  }))
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
              <label className="text-sm font-semibold text-zinc-700">{t.divisionLabel}</label>
              <input
                value={form.division}
                onChange={(e) => setForm((p) => ({ ...p, division: e.target.value }))}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="e.g. Dhaka"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-zinc-700">{t.districtLabel}</label>
              <input
                value={form.district}
                onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="e.g. Dhaka"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-zinc-700">{t.upazilaLabel}</label>
              <input
                value={form.upazila}
                onChange={(e) => setForm((p) => ({ ...p, upazila: e.target.value }))}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="e.g. Mirpur"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-zinc-700">{t.villageLabel}</label>
              <input
                value={form.village}
                onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="e.g. Test Village"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700">
                Role (default: User)
              </label>
              <input
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="User"
              />
              <p className="mt-2 text-xs text-zinc-500">{passwordHint}</p>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={!step1Valid || loading}
                className="w-full rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t.loading : t.sendOtpButton}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={onVerifyStep2} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                <div className="font-semibold text-zinc-900">{t.step2Header}</div>
                <div className="mt-1">
                  Phone:{" "}
                  <span className="font-mono text-xs text-zinc-600">
                    {otpMeta?.phone}
                  </span>
                </div>
                {otpMeta?.expiresAt && (
                  <div className="mt-1">
                    Expires at:{" "}
                    <span className="font-mono text-xs text-zinc-600">
                      {new Date(otpMeta.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-zinc-700">{t.otpLabel}</label>
              <input
                value={otp.code}
                onChange={(e) => setOtp((p) => ({ ...p, code: e.target.value }))}
                inputMode="numeric"
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="6-digit OTP"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-semibold text-zinc-700">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                value={otp.password}
                onChange={(e) =>
                  setOtp((p) => ({ ...p, password: e.target.value }))
                }
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                placeholder="StrongPassw0rd!"
                required
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(1)}
                className="w-1/2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.backToRegister}
              </button>

              <button
                type="submit"
                disabled={!step2Valid || loading}
                className="w-1/2 rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t.loading : t.verifyAndRegisterButton}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}

function getCopy(language: AppLanguage) {
  if (language === "bn") {
    return {
      registerTitle: "ডোনার হিসেবে রেজিস্টার করুন",
      registerSubtitle: "মোবাইলে OTP পাঠানো হবে (ডেভেলপমেন্টে টার্মিনালে লগ হবে)।",
      fullNameLabel: "নাম",
      phoneLabel: "মোবাইল নম্বর",
      bloodGroupLabel: "রক্তের গ্রুপ",
      divisionLabel: "বিভাগ",
      districtLabel: "জেলা",
      upazilaLabel: "উপজেলা",
      villageLabel: "গ্রাম",
      sendOtpButton: "OTP পাঠান",
      loading: "লোড হচ্ছে...",
      errorFillAll: "অনুগ্রহ করে সব তথ্য দিন।",
      step2Header: "OTP যাচাই এবং অ্যাকাউন্ট তৈরি",
      otpLabel: "OTP কোড",
      passwordLabel: "পাসওয়ার্ড",
      backToRegister: "পেছনে",
      verifyAndRegisterButton: "যাচাই করুন এবং রেজিস্টার করুন",
      errorInvalidOtpOrPassword: "OTP বা পাসওয়ার্ড সঠিক নয়।",
    };
  }

  return {
    registerTitle: "Register as a Donor",
    registerSubtitle: "We will send a verification OTP to your phone (mocked to server terminal).",
    fullNameLabel: "Full Name",
    phoneLabel: "Phone",
    bloodGroupLabel: "Blood Group",
    divisionLabel: "Division",
    districtLabel: "District",
    upazilaLabel: "Upazila",
    villageLabel: "Village",
    sendOtpButton: "Send OTP",
    loading: "Loading...",
    errorFillAll: "Please fill all fields.",
    step2Header: "Verify OTP and create your account",
    otpLabel: "OTP Code",
    passwordLabel: "Password",
    backToRegister: "Back",
    verifyAndRegisterButton: "Verify & Register",
    errorInvalidOtpOrPassword: "Invalid OTP or password.",
  };
}

