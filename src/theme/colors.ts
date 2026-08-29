export type ThemeName = "light" | "dark";

export interface ThemeColors {
  accent: string;
  accentTint: string;
  bg: string;
  bgTopbar: string;
  surface: string;
  surfaceElevated: string;
  fillSubtle: string;
  fillInset: string;
  text: string;
  textSubtle: string;
  textMuted: string;
  textDisabled: string;
  divider: string;
  dividerSoft: string;
  dividerStrong: string;
  gradientHero: [string, string];
  shadowHeroColor: string;
  btnDarkBg: string;
  btnDarkFg: string;
  upBg: string;
  upFg: string;
  downBg: string;
  downFg: string;
  sameBg: string;
  sameFg: string;
  newBg: string;
  newFg: string;
}

export const light: ThemeColors = {
  accent: "#FA243C",
  accentTint: "rgba(250, 36, 60, 0.08)",
  bg: "#FBFBFD",
  bgTopbar: "rgba(251, 251, 253, 0.92)",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  fillSubtle: "rgba(120, 120, 128, 0.10)",
  fillInset: "rgba(0, 0, 0, 0.04)",
  text: "#1D1D1F",
  textSubtle: "#6B6B70",
  textMuted: "#86868B",
  textDisabled: "#C7C7CC",
  divider: "rgba(0, 0, 0, 0.06)",
  dividerSoft: "rgba(0, 0, 0, 0.04)",
  dividerStrong: "rgba(0, 0, 0, 0.10)",
  gradientHero: ["#FA243C", "#FF5858"],
  shadowHeroColor: "rgba(250, 36, 60, 0.25)",
  btnDarkBg: "#1D1D1F",
  btnDarkFg: "#FFFFFF",
  upBg: "#E8F8EE",
  upFg: "#1B873F",
  downBg: "#FDECEC",
  downFg: "#C5291C",
  sameBg: "#F2F2F7",
  sameFg: "#6B6B70",
  newBg: "#000000",
  newFg: "#FFFFFF",
};

export const dark: ThemeColors = {
  accent: "#FF3B5C",
  accentTint: "rgba(255, 59, 92, 0.14)",
  bg: "#000000",
  bgTopbar: "rgba(10, 10, 12, 0.92)",
  surface: "#1C1C1E",
  surfaceElevated: "#2C2C2E",
  fillSubtle: "rgba(255, 255, 255, 0.06)",
  fillInset: "rgba(255, 255, 255, 0.04)",
  text: "#F5F5F7",
  textSubtle: "#C7C7CC",
  textMuted: "#8E8E93",
  textDisabled: "#48484A",
  divider: "rgba(255, 255, 255, 0.08)",
  dividerSoft: "rgba(255, 255, 255, 0.04)",
  dividerStrong: "rgba(255, 255, 255, 0.14)",
  gradientHero: ["#E81E37", "#FF5872"],
  shadowHeroColor: "rgba(232, 30, 55, 0.45)",
  btnDarkBg: "#F5F5F7",
  btnDarkFg: "#0A0A0C",
  upBg: "rgba(48, 209, 88, 0.18)",
  upFg: "#30D158",
  downBg: "rgba(255, 105, 97, 0.18)",
  downFg: "#FF6961",
  sameBg: "rgba(142, 142, 147, 0.18)",
  sameFg: "#8E8E93",
  newBg: "#F5F5F7",
  newFg: "#0A0A0C",
};

export const themes: Record<ThemeName, ThemeColors> = { light, dark };
