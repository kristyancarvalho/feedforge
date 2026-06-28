import { en, type Dictionary } from "./en";
import { ptBR } from "./pt-BR";

export type Language = "en" | "pt-BR";

export const LANGUAGES: Language[] = ["en", "pt-BR"];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  "pt-BR": "Português"
};

export const dictionaries: Record<Language, Dictionary> = {
  en,
  "pt-BR": ptBR
};

const STORAGE_KEY = "feedforge:lang";

export function inferLanguage(stored: string | null, navigatorLanguage: string | null): Language {
  if (stored === "en" || stored === "pt-BR") {
    return stored;
  }
  if (navigatorLanguage && navigatorLanguage.toLowerCase().startsWith("pt")) {
    return "pt-BR";
  }
  return "en";
}

export function readStoredLanguage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistLanguage(language: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    return;
  }
}

function resolvePath(dictionary: Dictionary, path: string): string | undefined {
  const segments = path.split(".");
  let current: unknown = dictionary;
  for (const segment of segments) {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

export function translate(
  language: Language,
  path: string,
  values?: Record<string, string | number>
): string {
  const resolved = resolvePath(dictionaries[language], path) ?? resolvePath(en, path);
  if (resolved === undefined) {
    return path;
  }
  return interpolate(resolved, values);
}

export function flattenKeys(dictionary: Dictionary): string[] {
  const keys: string[] = [];
  const walk = (node: unknown, prefix: string) => {
    if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        walk(value, prefix ? `${prefix}.${key}` : key);
      }
    } else {
      keys.push(prefix);
    }
  };
  walk(dictionary, "");
  return keys.sort();
}
