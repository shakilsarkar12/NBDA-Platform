"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type AppLanguage = "en" | "bn";

const STORAGE_KEY = "nbda_lang";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function detectInitialLanguage(): AppLanguage {
  if (typeof navigator === "undefined") return "en";

  const preferred = navigator.language?.toLowerCase() ?? "";
  if (preferred.startsWith("bn")) return "bn";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      if (typeof window === "undefined") return "en";
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "bn" || saved === "en") return saved;
    } catch {
      // ignore (fallback below)
    }
    return detectInitialLanguage();
  });

  const setLanguage = useMemo(
    () => (lang: AppLanguage) => {
      setLanguageState(lang);
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // ignore
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

