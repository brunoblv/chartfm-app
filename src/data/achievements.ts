export type AchievementTierId = "bronze" | "silver" | "gold" | "platinum";

export const TIER_ORDER: AchievementTierId[] = ["bronze", "silver", "gold", "platinum"];

export const TIER_LABEL: Record<AchievementTierId, string> = {
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
};

export const TIER_XP: Record<AchievementTierId, number> = {
  bronze: 20,
  silver: 60,
  gold: 150,
  platinum: 400,
};

interface AchievementMeta {
  title: string;
  description: string;
  unit: string;
  thresholds: [number, number, number, number];
}

/**
 * Espelha `ACHIEVEMENT_FAMILIES` e as descrições de `loadAchievements` do backend
 * (c:\ChartFM\lib\progression\achievements-catalog.ts e achievements-data.ts).
 * Os limiares são estáveis (só descem por decisão do dono, nunca sobem), então
 * é seguro manter uma cópia aqui para exibir os requisitos sem endpoint novo.
 */
export const ACHIEVEMENT_META: Record<string, AchievementMeta> = {
  HITMAKER: {
    title: "Hitmaker",
    description: "Publique paradas semanais. Cada parada da sua principal conta um ponto.",
    unit: "paradas publicadas",
    thresholds: [1, 25, 100, 250],
  },
  UNSTOPPABLE: {
    title: "Imparável",
    description: "Publique paradas em semanas seguidas, sem pular nenhuma. Vale o seu maior recorde, mesmo que a sequência atual tenha parado.",
    unit: "semanas seguidas (recorde)",
    thresholds: [4, 12, 26, 52],
  },
  DISCOVERER: {
    title: "Descobridor",
    description: "Recomende músicas para outras pessoas.",
    unit: "recomendações enviadas",
    thresholds: [10, 50, 200, 500],
  },
  MUSIC_CRITIC: {
    title: "Crítico Musical",
    description: "Publique reviews de álbuns.",
    unit: "reviews publicadas",
    thresholds: [1, 25, 100, 250],
  },
  CONVERSATIONALIST: {
    title: "Conversador",
    description: "Comente em paradas, em posts ou responda outras pessoas.",
    unit: "comentários e respostas",
    thresholds: [3, 100, 500, 2000],
  },
  BELOVED: {
    title: "Querido",
    description: "Receba curtidas nas suas paradas.",
    unit: "curtidas recebidas",
    thresholds: [50, 250, 1000, 5000],
  },
  CONNECTED: {
    title: "Conectado",
    description: "Siga outras pessoas no ChartFM.",
    unit: "pessoas seguidas",
    thresholds: [3, 50, 150, 300],
  },
  INFLUENTIAL: {
    title: "Influente",
    description: "Conquiste seguidores.",
    unit: "seguidores",
    thresholds: [3, 50, 250, 1000],
  },
  SCOUT: {
    title: "Batedor",
    description: "Indique músicas para o destaque semanal da comunidade.",
    unit: "indicações",
    thresholds: [5, 20, 50, 150],
  },
  CUP_COMPETITOR: {
    title: "Competidor da Copa",
    description: "Participe de edições da Copa ChartFM.",
    unit: "participações na Copa",
    thresholds: [1, 5, 15, 30],
  },
  PUSHER: {
    title: "Empurrador",
    description: "Envie músicas nas rodadas do Push.",
    unit: "envios no Push",
    thresholds: [5, 25, 75, 200],
  },
  ALBUM_CLUB: {
    title: "Clube do Álbum",
    description: "Indique álbuns no Clube do Álbum.",
    unit: "indicações de álbum",
    thresholds: [5, 20, 50, 100],
  },
  COLLECTOR: {
    title: "Colecionador",
    description: "Salve músicas e álbuns na sua biblioteca.",
    unit: "itens salvos",
    thresholds: [25, 100, 500, 1500],
  },
};
