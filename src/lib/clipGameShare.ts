/**
 * Espelha lib/clip-game/share.ts do site: grade de quadrados sem revelar
 * música nem artista, sempre em português (o site também não traduz esse
 * texto — é conteúdo copiável para fora do app, não interface).
 */

const CLIP_GAME_TOTAL_LEVELS = 5;
const SQUARE_WRONG = "🟥";
const SQUARE_CORRECT = "🟩";
const SQUARE_UNUSED = "⬜";

function buildClipGameShareGrid(levelReached: number | null, totalLevels: number = CLIP_GAME_TOTAL_LEVELS): string {
  const wrongCount = levelReached ? levelReached - 1 : totalLevels;
  const squares: string[] = [];
  for (let i = 0; i < totalLevels; i++) {
    if (i < wrongCount) squares.push(SQUARE_WRONG);
    else if (levelReached !== null && i === wrongCount) squares.push(SQUARE_CORRECT);
    else squares.push(SQUARE_UNUSED);
  }
  return squares.join(" ");
}

export function buildClipGameShareText(input: {
  gameNumber: number;
  levelReached: number | null;
  score: number;
  currentStreak: number;
  url: string;
}): string {
  const grid = buildClipGameShareGrid(input.levelReached);
  const resultLine =
    input.levelReached !== null
      ? `Acertei com ${input.levelReached} ${input.levelReached === 1 ? "imagem" : "imagens"}.`
      : "Não acertei dessa vez.";

  return [
    `Qual é o Clipe? #${input.gameNumber}`,
    "",
    grid,
    "",
    resultLine,
    `+${input.score} pontos`,
    "",
    `🔥 Sequência: ${input.currentStreak} ${input.currentStreak === 1 ? "dia" : "dias"}`,
    "",
    input.url,
  ].join("\n");
}
