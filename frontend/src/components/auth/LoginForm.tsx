"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/api";
import { isValidBdPhone } from "@/lib/validators";
import { useLanguage, type AppLanguage } from "../providers/LanguageProvider";

type LoginResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  user: {
    id: string;
    uniqueId?: string;
    name: string;
    phone: string;
    role: string;
  };
};

export function LoginForm() {
  const { language } = useLanguage();
  const router = useRouter();
  const t = useMemo(() => getCopy(language), [language]);

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = isValidBdPhone(form.phone) && form.password.trim().length >= 8;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError(t.errorInvalid);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        phone: form.phone,
        password: form.password,
      };

      const result = await postJson<LoginResponse>("/auth/login", payload);
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));
      setSuccess(result.message);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="auth-login" className="scroll-mt-24">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900">{t.title}</h2>
            <p className="mt-1 text-sm text-zinc-600">{t.subtitle}</p>
          </div>
          <div className="rounded-xl bg-[#DC2626]/10 px-3 py-2 text-xs font-semibold text-[#DC2626]">
            REST Auth
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-zinc-700">{t.phoneLabel}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="017XXXXXXXXX"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-700">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="Your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}

function getCopy(language: AppLanguage) {
  if (language === "bn") {
    return {
      title: "লগইন",
      subtitle: "ফোন ও পাসওয়ার্ড দিয়ে অ্যাকাউন্টে প্রবেশ করুন।",
      phoneLabel: "মোবাইল নম্বর",
      passwordLabel: "পাসওয়ার্ড",
      submit: "লগইন করুন",
      loading: "লোড হচ্ছে...",
      errorInvalid: "অনুগ্রহ করে বৈধ ফোন ও পাসওয়ার্ড দিন।",
    };
  }

  return {
    title: "Login",
    subtitle: "Authenticate using phone and password.",
    phoneLabel: "Phone",
    passwordLabel: "Password",
    submit: "Login",
    loading: "Loading...",
    errorInvalid: "Please provide a valid phone and password.",
  };
}

