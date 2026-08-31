export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://chartfm.com.br").replace(/\/$/, "");

/**
 * Alguns uploads (ex.: avatar enviado direto, não via Google) voltam da API como caminho
 * relativo (`/api/uploads/...`). `Image` do RN não resolve URIs relativas como um navegador
 * faria, então precisamos prefixar com a base da API antes de passar pro componente.
 */
export function resolveMediaUrl<T extends string | null | undefined>(url: T): T {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}` as T;
}

/** Extrai um parâmetro de query sem depender do global `URL` (nem sempre polyfilled no RN). */
export function getQueryParam(url: string, key: string): string | null {
  const match = new RegExp(`[?&]${key}=([^&#]*)`).exec(url);
  if (!match) return null;
  return decodeURIComponent(match[1].replace(/\+/g, " "));
}
