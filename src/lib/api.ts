export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://chartfm.com.br").replace(/\/$/, "");

/** Extrai um parâmetro de query sem depender do global `URL` (nem sempre polyfilled no RN). */
export function getQueryParam(url: string, key: string): string | null {
  const match = new RegExp(`[?&]${key}=([^&#]*)`).exec(url);
  if (!match) return null;
  return decodeURIComponent(match[1].replace(/\+/g, " "));
}
