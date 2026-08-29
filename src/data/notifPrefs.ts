export interface NotifPref {
  id: string;
  label: string;
  note: string;
  on: boolean;
}

export const DEFAULT_NOTIF_PREFS: NotifPref[] = [
  { id: "chart", label: "Minha parada", note: "Lembrete semanal de atualizar", on: true },
  { id: "rank", label: "Ranking", note: "Quando suas músicas sobem no Global", on: true },
  { id: "events", label: "Eventos", note: "Copa, Push e Clube do Álbum", on: true },
  { id: "social", label: "Comunidade", note: "Seguidores, comentários e menções", on: false },
  { id: "badges", label: "Conquistas", note: "Novos níveis e badges", on: true },
];
