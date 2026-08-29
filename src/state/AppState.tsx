import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CHART, ChartSong } from "../data/mock";
import { DEFAULT_NOTIF_PREFS, NotifPref } from "../data/notifPrefs";

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
  notifPrefs: NotifPref[];
  toggleNotifPref: (id: string) => void;
  lastfmConnected: boolean;
  setLastfmConnected: (v: boolean) => void;
  isOffline: boolean;
  setIsOffline: (v: boolean) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hasChart, setHasChart] = useState(true);
  const [chart, setChartState] = useState<ChartSong[]>(CHART);
  const [showGamification, setShowGamification] = useState(true);
  const [copaVote, setCopaVote] = useState<"a" | "b" | null>(null);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState<NotifPref[]>(DEFAULT_NOTIF_PREFS);
  const [lastfmConnected, setLastfmConnected] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const toggleNotifPref = useCallback((id: string) => {
    setNotifPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, on: !p.on } : p)));
  }, []);

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
      notifPrefs,
      toggleNotifPref,
      lastfmConnected,
      setLastfmConnected,
      isOffline,
      setIsOffline,
    }),
    [
      hasChart,
      chart,
      showGamification,
      copaVote,
      isPublicProfile,
      notifPrefs,
      lastfmConnected,
      isOffline,
      setChart,
      addSong,
      removeSong,
      publishChart,
      toggleNotifPref,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
