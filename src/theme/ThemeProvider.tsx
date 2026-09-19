import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setCurrentLang } from "../i18n/lang";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "react-native";
import { ThemeColors, ThemeName, themes } from "./colors";

export type ThemePreference = "system" | "light" | "dark";
export type Language = "pt" | "en";

interface ThemeContextValue {
  theme: ThemeName;
  colors: ThemeColors;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const LANG_KEY = "chartfm.lang";
const THEME_KEY = "chartfm.theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");
  const [lang, setLangState] = useState<Language>("pt");

  // Restaura as escolhas salvas; sem isso o app volta ao padrão a cada abertura.
  useEffect(() => {
    SecureStore.getItemAsync(LANG_KEY)
      .then((v) => (v === "pt" || v === "en") && setLangState(v))
      .catch(() => {});
    SecureStore.getItemAsync(THEME_KEY)
      .then((v) => (v === "system" || v === "light" || v === "dark") && setPreferenceState(v))
      .catch(() => {});
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    SecureStore.setItemAsync(LANG_KEY, l).catch(() => {});
  };
  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    SecureStore.setItemAsync(THEME_KEY, p).catch(() => {});
  };

  setCurrentLang(lang);

  const theme: ThemeName =
    preference === "system" ? (system === "light" ? "light" : "dark") : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, colors: themes[theme], preference, setPreference, lang, setLang }),
    [theme, preference, lang]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}
