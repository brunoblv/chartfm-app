import { CoverArt } from "../components/Cover";
import { MovementStatus } from "../components/MovementBadge";

const cv = (a: string, b: string, seed: number): CoverArt => ({ palette: [a, b], seed });

export interface ChartSong {
  t: string;
  a: string;
  mv?: MovementStatus;
  d?: number;
  cover: CoverArt;
  /** Preenchidos quando a música veio de uma busca real (não mock) — necessários para publicar no backend. */
  album?: string | null;
  spotifyId?: string | null;
  songId?: string | null;
}

export interface GlobalSong extends ChartSong {
  p: number;
  meta: string;
}

export const GLOBAL: GlobalSong[] = [
  { p: 1, t: "Espresso", a: "Sabrina Carpenter", mv: "same", meta: "12 semanas · pico #1", cover: cv("#FFB347", "#FF6B6B", 1) },
  { p: 2, t: "Fortnight", a: "Taylor Swift, Post Malone", mv: "up", d: 3, meta: "6 semanas · pico #2", cover: cv("#7C4DFF", "#00C6FF", 2) },
  { p: 3, t: "Not Like Us", a: "Kendrick Lamar", mv: "up", d: 8, meta: "9 semanas · pico #3", cover: cv("#1D1D1F", "#5B5B60", 3) },
  { p: 4, t: "Birds of a Feather", a: "Billie Eilish", mv: "down", d: 2, meta: "14 semanas · pico #1", cover: cv("#2E7D6E", "#9BE15D", 4) },
  { p: 5, t: "Good Luck, Babe!", a: "Chappell Roan", mv: "new", meta: "1 semana", cover: cv("#FF4E8B", "#FFC371", 0) },
  { p: 6, t: "Beautiful Things", a: "Benson Boone", mv: "down", d: 1, meta: "22 semanas · pico #2", cover: cv("#3A6073", "#16222A", 1) },
  { p: 7, t: "Von Dutch", a: "Charli XCX", mv: "return", meta: "4 semanas · pico #5", cover: cv("#8BC34A", "#CDDC39", 2) },
  { p: 8, t: "Sailor Song", a: "Gigi Perez", mv: "up", d: 4, meta: "3 semanas · pico #8", cover: cv("#264653", "#2A9D8F", 3) },
];

export const CHART: ChartSong[] = [
  { t: "Espresso", a: "Sabrina Carpenter", mv: "same", cover: cv("#FFB347", "#FF6B6B", 1) },
  { t: "Not Like Us", a: "Kendrick Lamar", mv: "up", d: 2, cover: cv("#1D1D1F", "#5B5B60", 3) },
  { t: "Good Luck, Babe!", a: "Chappell Roan", mv: "new", cover: cv("#FF4E8B", "#FFC371", 0) },
  { t: "Fortnight", a: "Taylor Swift", mv: "down", d: 1, cover: cv("#7C4DFF", "#00C6FF", 2) },
  { t: "Sailor Song", a: "Gigi Perez", mv: "up", d: 5, cover: cv("#264653", "#2A9D8F", 3) },
  { t: "Birds of a Feather", a: "Billie Eilish", mv: "down", d: 3, cover: cv("#2E7D6E", "#9BE15D", 4) },
  { t: "Von Dutch", a: "Charli XCX", mv: "same", cover: cv("#8BC34A", "#CDDC39", 2) },
  { t: "Houdini", a: "Dua Lipa", mv: "new", cover: cv("#E52D27", "#B31217", 1) },
  { t: "Lunch", a: "Billie Eilish", mv: "up", d: 4, cover: cv("#00B4DB", "#0083B0", 0) },
  { t: "Please Please Please", a: "Sabrina Carpenter", mv: "down", d: 2, cover: cv("#F7971E", "#FFD200", 4) },
];

export const TRENDING = [
  { t: "BRAT", a: "Charli XCX", why: "Quem curte Dua Lipa ouviu", cover: cv("#8BC34A", "#CDDC39", 2) },
  { t: "Cowboy Carter", a: "Beyoncé", why: "Subiu 12 no Global", cover: cv("#C9A227", "#FFF1A8", 3) },
  { t: "Hit Me Hard", a: "Billie Eilish", why: "Novo na sua bolha", cover: cv("#2E7D6E", "#9BE15D", 4) },
];

export const IMPORTED = [
  { p: 1, t: "Espresso", a: "Sabrina Carpenter", plays: "34", cover: cv("#FFB347", "#FF6B6B", 1) },
  { p: 2, t: "Von Dutch", a: "Charli XCX", plays: "28", cover: cv("#8BC34A", "#CDDC39", 2) },
  { p: 3, t: "Not Like Us", a: "Kendrick Lamar", plays: "26", cover: cv("#1D1D1F", "#5B5B60", 3) },
  { p: 4, t: "Sailor Song", a: "Gigi Perez", plays: "21", cover: cv("#264653", "#2A9D8F", 3) },
  { p: 5, t: "Good Luck, Babe!", a: "Chappell Roan", plays: "19", cover: cv("#FF4E8B", "#FFC371", 0) },
];

export const PERIODS_PT = [
  { id: "7d", label: "Últimos 7 dias", scrobbles: "312 scrobbles" },
  { id: "1m", label: "Último mês", scrobbles: "1.148" },
  { id: "3m", label: "Últimos 3 meses", scrobbles: "3.402" },
  { id: "12m", label: "Últimos 12 meses", scrobbles: "12.981" },
  { id: "all", label: "Desde sempre", scrobbles: "68.204" },
];

export const POPULAR = [
  {
    handle: "@lelezinha",
    initial: "L",
    meta: "1.2 mil pontos",
    avatar: ["#7C4DFF", "#00C6FF"] as [string, string],
    top: [
      { p: 1, t: "Von Dutch", cover: cv("#8BC34A", "#CDDC39", 2) },
      { p: 2, t: "Espresso", cover: cv("#FFB347", "#FF6B6B", 1) },
      { p: 3, t: "Lunch", cover: cv("#00B4DB", "#0083B0", 0) },
    ],
  },
  {
    handle: "@discotecario",
    initial: "D",
    meta: "980 pontos",
    avatar: ["#FA243C", "#FF5858"] as [string, string],
    top: [
      { p: 1, t: "Not Like Us", cover: cv("#1D1D1F", "#5B5B60", 3) },
      { p: 2, t: "Sailor Song", cover: cv("#264653", "#2A9D8F", 3) },
      { p: 3, t: "Houdini", cover: cv("#E52D27", "#B31217", 1) },
    ],
  },
  {
    handle: "@marifm",
    initial: "M",
    meta: "874 pontos",
    avatar: ["#2E7D6E", "#9BE15D"] as [string, string],
    top: [
      { p: 1, t: "Fortnight", cover: cv("#7C4DFF", "#00C6FF", 2) },
      { p: 2, t: "Good Luck, Babe!", cover: cv("#FF4E8B", "#FFC371", 0) },
      { p: 3, t: "BRAT", cover: cv("#8BC34A", "#CDDC39", 4) },
    ],
  },
];

export const PEOPLE = [
  { handle: "@lelezinha", initial: "L", match: "92% parecido", avatar: ["#7C4DFF", "#00C6FF"] as [string, string] },
  { handle: "@marifm", initial: "M", match: "88% parecido", avatar: ["#2E7D6E", "#9BE15D"] as [string, string] },
  { handle: "@rafaelbr", initial: "R", match: "81% parecido", avatar: ["#F7971E", "#FFD200"] as [string, string] },
];

export const BADGES = [
  { mark: "★", name: "Curador de Paradas", note: "27 paradas publicadas", unlocked: true },
  { mark: "▲", name: "Em Chama", note: "82 semanas seguidas", unlocked: true },
  { mark: "◎", name: "Descobridor", note: "14 estreias no Global", unlocked: true },
  { mark: "✎", name: "Crítico Musical", note: "faltam 3 avaliações", unlocked: false },
];

export const SONG_POOL: ChartSong[] = [
  { t: "Cruel Summer", a: "Taylor Swift", cover: cv("#FF7EB3", "#FF9A9E", 2) },
  { t: "As It Was", a: "Harry Styles", cover: cv("#42275a", "#734b6d", 0) },
  { t: "Flowers", a: "Miley Cyrus", cover: cv("#F09819", "#EDDE5D", 1) },
  { t: "Anti-Hero", a: "Taylor Swift", cover: cv("#654ea3", "#eaafc8", 3) },
  { t: "Vampire", a: "Olivia Rodrigo", cover: cv("#0f2027", "#2c5364", 4) },
  { t: "Water", a: "Tyla", cover: cv("#02aab0", "#00cdac", 0) },
  { t: "Snooze", a: "SZA", cover: cv("#3a1c71", "#d76d77", 2) },
  { t: "Texas Hold 'Em", a: "Beyoncé", cover: cv("#C9A227", "#FFF1A8", 3) },
];

export const COPA_A = { t: "Not Like Us", a: "Kendrick Lamar", cover: cv("#1D1D1F", "#5B5B60", 3) };
export const COPA_B = { t: "Espresso", a: "Sabrina Carpenter", cover: cv("#FFB347", "#FF6B6B", 1) };
export const CLUBE_COVER = cv("#8BC34A", "#CDDC39", 4);

export const NOTIFS_TODAY = [
  { mark: "≡", text: "Está na hora de atualizar sua parada da semana 35.", when: "há 2 h", unread: true },
  { mark: "▲", text: "Charli XCX subiu 8 posições no Global 100.", when: "há 5 h", unread: true },
  { mark: "♦", text: "Uma nova rodada da Copa começou: oitavas de final.", when: "há 9 h", unread: false },
];

export const NOTIFS_WEEK = [
  { mark: "@", text: "Maria comentou na sua parada da semana 34.", when: "terça" },
  { mark: "★", text: "Você desbloqueou a conquista Em Chama.", when: "segunda" },
  { mark: "◎", text: "Seu Top 20 da semana 34 entrou no Global com 6 músicas.", when: "domingo" },
];

export const OTHER_USER = {
  name: "Lelezinha",
  handle: "@lelezinha",
  initial: "L",
  avatar: ["#7C4DFF", "#00C6FF"] as [string, string],
  charts: 41,
  followers: 312,
  match: "92%",
  top: GLOBAL.slice(0, 5),
};

export const TRACK_DETAIL: GlobalSong = { ...GLOBAL[6], meta: GLOBAL[6].meta };
