"use client";

import Link from "next/link";
import { useLanguage } from "../providers/LanguageProvider";

const navItems = [
  { href: "/request-blood", en: "Request Blood", bn: "রক্তের জন্য অনুরোধ করুন" },
  { href: "/register", en: "Register as Donor", bn: "রক্তদাতা হোন" },
  { href: "/login", en: "Login", bn: "লগইন" },
];

export function Header() {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#DC2626] text-white grid place-items-center font-black">
            NB
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-zinc-900">
              NBDA Platform
            </div>
            <div className="text-xs text-zinc-600">
              Naldanga Blood Donors Association
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-700">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-900">
              {language === "bn" ? item.bn : item.en}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="language" className="text-xs font-semibold text-zinc-600">
              {language === "bn" ? "ভাষা" : "Language"}
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value === "bn" ? "bn" : "en")}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900"
              aria-label="Language selector"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>

          <div className="md:hidden">
            <Link
              href="/request-blood"
              className="rounded-md bg-[#DC2626] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c]"
            >
              {language === "bn" ? "অনুরোধ" : "Request"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

