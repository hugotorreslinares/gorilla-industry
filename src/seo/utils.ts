import seo from "./seo.json";

export const defaultSeoLang = "en";

/**
 * All page SEO copy (title, description, keywords, OG locale) lives in
 * seo.json — not in component files — so it can be edited without
 * touching any .astro code. Add a new locale block there, not here.
 */
export function getSeo(lang: string | undefined) {
  const locale = seo.locales[(lang as keyof typeof seo.locales) ?? defaultSeoLang] ?? seo.locales[defaultSeoLang];

  return {
    ...locale,
    siteName: seo.siteName,
    ogImage: seo.ogImage,
    twitterCard: seo.twitterCard,
  };
}
