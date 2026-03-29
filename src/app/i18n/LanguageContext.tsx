import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  type AppLanguage,
  SUPPORTED_LANGUAGES,
  type TranslationKey,
  translations,
} from "./translations";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
};

const LANGUAGE_STORAGE_KEY = "cyberguard-language";

const LanguageContext = createContext<LanguageContextValue | null>(null);

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === "undefined") {
    return "en";
  }
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!stored) {
    return "en";
  }
  if (SUPPORTED_LANGUAGES.has(stored as AppLanguage)) {
    return stored as AppLanguage;
  }
  return "en";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language][key] ?? translations.en[key],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
