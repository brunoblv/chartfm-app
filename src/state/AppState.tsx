import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { ChartSong } from "../data/mock";
import { CoverArt } from "../components/Cover";

export interface SpotlightSong {
  title: string;
  artist: string;
  spotifyId?: string | null;
  songId?: string | null;
  cover: CoverArt;
}

export type SpotlightCategory = "flashback" | "destaque" | "nacional" | "push" | "radar";

/**
 * Tri-state: `undefined` = usuário nunca abriu a tela de Destaques nesta sessão
 * (não manda a chave no body do publish/update — não sobrescreve o que já está
 * salvo). `null` = usuário limpou a indicação explicitamente. Objeto = escolhida.
 */
export type SpotlightDraft = SpotlightSong | null | undefined;

interface AppStateValue {
  chart: ChartSong[];
  setChart: (songs: ChartSong[]) => void;
  addSong: (song: ChartSong) => void;
  removeSong: (index: number) => void;
  showGamification: boolean;
  setShowGamification: (v: boolean) => void;
  copaVote: "a" | "b" | null;
  setCopaVote: (v: "a" | "b" | null) => void;
  isPublicProfile: boolean;
  setIsPublicProfile: (v: boolean) => void;
  lastfmConnected: boolean;
  setLastfmConnected: (v: boolean) => void;
  isOffline: boolean;
  setIsOffline: (v: boolean) => void;
  paradaId: string | null;
  setParadaId: (id: string | null) => void;
  weekDate: string | null;
  setWeekDate: (d: string | null) => void;
  spotlights: Record<SpotlightCategory, SpotlightDraft>;
  setSpotlight: (category: SpotlightCategory, song: SpotlightDraft) => void;
  resetDraft: () => void;
}

const EMPTY_SPOTLIGHTS: Record<SpotlightCategory, SpotlightDraft> = {
  flashback: undefined,
  destaque: undefined,
  nacional: undefined,
  push: undefined,
  radar: undefined,
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [chart, setChartState] = useState<ChartSong[]>([]);
  const [showGamification, setShowGamification] = useState(true);
  const [copaVote, setCopaVote] = useState<"a" | "b" | null>(null);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [lastfmConnected, setLastfmConnected] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [paradaId, setParadaId] = useState<string | null>(null);
  const [weekDate, setWeekDate] = useState<string | null>(null);
  const [spotlights, setSpotlights] = useState<Record<SpotlightCategory, SpotlightDraft>>(EMPTY_SPOTLIGHTS);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return unsubscribe;
  }, []);

  const setChart = useCallback((songs: ChartSong[]) => setChartState(songs), []);

  const addSong = useCallback((song: ChartSong) => {
    setChartState((prev) => (prev.some((s) => s.t === song.t) ? prev : [...prev, song]));
  }, []);

  const removeSong = useCallback((index: number) => {
    setChartState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setSpotlight = useCallback((category: SpotlightCategory, song: SpotlightDraft) => {
    setSpotlights((prev) => ({ ...prev, [category]: song }));
  }, []);

  const resetDraft = useCallback(() => {
    setChartState([]);
    setParadaId(null);
    setWeekDate(null);
    setSpotlights(EMPTY_SPOTLIGHTS);
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      chart,
      setChart,
      addSong,
      removeSong,
      showGamification,
      setShowGamification,
      copaVote,
      setCopaVote,
      isPublicProfile,
      setIsPublicProfile,
      lastfmConnected,
      setLastfmConnected,
      isOffline,
      setIsOffline,
      paradaId,
      setParadaId,
      weekDate,
      setWeekDate,
      spotlights,
      setSpotlight,
      resetDraft,
    }),
    [
      chart,
      showGamification,
      copaVote,
      isPublicProfile,
      lastfmConnected,
      isOffline,
      paradaId,
      weekDate,
      spotlights,
      setChart,
      addSong,
      removeSong,
      setSpotlight,
      resetDraft,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
