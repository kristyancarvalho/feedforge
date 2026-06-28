import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  inferLanguage,
  persistLanguage,
  readStoredLanguage,
  translate,
  type Language
} from "./index";

type TranslateValues = Record<string, string | number>;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (path: string, values?: TranslateValues) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    inferLanguage(readStoredLanguage(), typeof navigator === "undefined" ? null : navigator.language)
  );

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    persistLanguage(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (path, values) => translate(language, path, values)
    }),
    [language, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation() {
  return useI18n();
}
