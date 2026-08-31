import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { ChartSong } from "../data/mock";

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
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [chart, setChartState] = useState<ChartSong[]>([]);
  const [showGamification, setShowGamification] = useState(true);
  const [copaVote, setCopaVote] = useState<"a" | "b" | null>(null);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [lastfmConnected, setLastfmConnected] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

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
    }),
    [chart, showGamification, copaVote, isPublicProfile, lastfmConnected, isOffline, setChart, addSong, removeSong]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
