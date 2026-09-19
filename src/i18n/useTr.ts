import { useAppTheme } from "../theme/ThemeProvider";
import { en } from "./en";

/** Traduz um texto escrito em português; em português (ou sem tradução) devolve o próprio texto. */
export function useTr() {
  const { lang } = useAppTheme();
  return (pt: string): string => (lang === "en" ? en[pt] ?? pt : pt);
}
