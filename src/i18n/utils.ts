import en from "./en.json";
import es from "./es.json";

export const defaultLang = "en";

export const dictionaries = { en, es } as const;

export type Lang = keyof typeof dictionaries;

export function useTranslations(lang: string | undefined) {
  return dictionaries[(lang as Lang) ?? defaultLang] ?? dictionaries[defaultLang];
}
