import React, { createContext, useContext, useMemo, useState } from "react";
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

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("dark");
  const [lang, setLang] = useState<Language>("pt");

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
