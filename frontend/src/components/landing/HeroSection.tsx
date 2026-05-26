"use client";

import { useLanguage } from "../providers/LanguageProvider";

export function HeroSection() {
  const { language } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#DC2626]/10 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#DC2626]">
            Naldanga Blood Donors Association
          </p>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            এগিয়ে আসুন রক্তদানে, মুমূর্ষু রোগী বাঁচুক প্রাণে
          </h1>

          {language === "en" && (
            <p className="mt-4 text-base leading-7 text-zinc-600">
              Come forward for blood donation; let the patient live with life.
            </p>
          )}

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#emergency-request"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#b91c1c] sm:w-auto"
            >
              <span className="leading-tight">
                <span className="block text-base">রক্তের জন্য অনুরোধ করুন</span>
                <span className="block text-sm opacity-90">
                  Request Blood
                </span>
              </span>
            </a>

            <a
              href="#auth-registration"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#b91c1c] sm:w-auto"
            >
              <span className="leading-tight">
                <span className="block text-base">রক্তদাতা হোন</span>
                <span className="block text-sm opacity-90">
                  Register as Donor
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

