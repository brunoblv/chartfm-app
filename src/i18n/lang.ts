import type { Language } from "../theme/ThemeProvider";

/** Idioma atual para código fora de componente (cliente da API). O ThemeProvider mantém em dia. */
let current: Language = "pt";

export function setCurrentLang(l: Language) {
  current = l;
}

export function getCurrentLang(): Language {
  return current;
}
