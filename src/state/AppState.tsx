import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CHART, ChartSong } from "../data/mock";

interface AppStateValue {
  hasChart: boolean;
  chart: ChartSong[];
  setChart: (songs: ChartSong[]) => void;
  addSong: (song: ChartSong) => void;
  removeSong: (index: number) => void;
  publishChart: () => void;
  showGamification: boolean;
  setShowGamification: (v: boolean) => void;
  copaVote: "a" | "b" | null;
  setCopaVote: (v: "a" | "b" | null) => void;
  isPublicProfile: boolean;
  setIsPublicProfile: (v: boolean) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hasChart, setHasChart] = useState(true);
  const [chart, setChartState] = useState<ChartSong[]>(CHART);
  const [showGamification, setShowGamification] = useState(true);
  const [copaVote, setCopaVote] = useState<"a" | "b" | null>(null);
  const [isPublicProfile, setIsPublicProfile] = useState(true);

  const setChart = useCallback((songs: ChartSong[]) => setChartState(songs), []);

  const addSong = useCallback((song: ChartSong) => {
    setChartState((prev) => (prev.some((s) => s.t === song.t) ? prev : [...prev, song]));
  }, []);

  const removeSong = useCallback((index: number) => {
    setChartState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const publishChart = useCallback(() => setHasChart(true), []);

  const value = useMemo<AppStateValue>(
    () => ({
      hasChart,
      chart,
      setChart,
      addSong,
      removeSong,
      publishChart,
      showGamification,
      setShowGamification,
      copaVote,
      setCopaVote,
      isPublicProfile,
      setIsPublicProfile,
    }),
    [hasChart, chart, showGamification, copaVote, isPublicProfile, setChart, addSong, removeSong, publishChart]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
