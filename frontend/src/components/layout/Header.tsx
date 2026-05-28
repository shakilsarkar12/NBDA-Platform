"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { useLanguage } from "../providers/LanguageProvider";
import { useToast } from "../providers/ToastProvider";
import { postJson } from "@/lib/api";

const navItems = [
  { href: "/", en: "Home", bn: "হোম" },
  { href: "/requests", en: "Request Blood", bn: "রক্তের অনুরোধ" },
  { href: "/donors", en: "Find Donors", bn: "ডোনার খুঁজুন" },
];

export function Header() {
  const { language, setLanguage } = useLanguage();
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    try {
      await postJson("/auth/logout", {}, { token });
    } catch {
      // ignore network errors on logout cleanup
    }
    logout();
    showToast("Logged out successfully", "success");
    setOpen(false);
    router.push("/login");
  }

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
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-zinc-900 ${pathname === item.href ? "text-zinc-900 font-bold" : ""}`}
            >
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

          {!loading && !user && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
              >
                {language === "bn" ? "লগইন" : "Login"}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#DC2626] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c]"
              >
                {language === "bn" ? "রেজিস্টার" : "Register"}
              </Link>
            </div>
          )}

          {!loading && user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="h-10 w-10 overflow-hidden rounded-full border border-zinc-300 bg-zinc-100"
              >
                {user.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profileImageUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-sm font-bold text-zinc-700">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
                  <div className="border-b border-zinc-100 pb-2">
                    <div className="text-sm font-bold text-zinc-900">{user.name}</div>
                    <div className="text-xs text-zinc-600">{user.uniqueId || "NBDA User"}</div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-2 py-2 hover:bg-zinc-100"
                    >
                      My Dashboard
                    </Link>
                    <Link
                      href="/dashboard/edit-profile"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-2 py-2 hover:bg-zinc-100"
                    >
                      Edit Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-2 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

