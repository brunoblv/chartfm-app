# ChartFM — Referência do Backend para o Mobile

Documento vivo. Atualizado ao final de cada fase da migração (nunca reescrito do zero, exceto
passes de limpeza como este). Fonte de verdade real: `C:\ChartFM\app\api\**\route.ts` e
`C:\ChartFM\prisma\schema.prisma` (não existe spec OpenAPI/Swagger/Postman no backend).

## 0. Status geral — o que já foi migrado

| Área | Status | Detalhe |
|---|---|---|
| Auth (login, cadastro, sessão) | ✅ Completo | Seção 2 |
| Home / Global 100 / Discover / Search | ✅ Completo | Seção 4.1 |
| Chart pessoal (criar) | 🟡 Parcial — falta editar/apagar | Seção 4.2 |
| Copa | 🟡 Placar corrigido, votação e hub prontos — falta tabela de grupos na UI | Seção 5 |
| Push (indicar + avaliar) | ✅ Completo | Seção 4.4 |
| Clube do Álbum | ✅ Completo | Seção 4.5 |
| Perfil / social (ver, seguir) | ✅ Completo | Seção 4.6 |
| Edição de perfil (nome/handle/gêneros) | ✅ Completo — falta avatar | Seção 4.6 |
| Notificações | ✅ Completo | Seção 4.7 |
| Last.fm (conectar + importar) | ✅ Completo | Seção 4.7 |
| Modo offline real | ✅ Completo | Seção 6 |
| Spotify/YouTube connect | ❌ Não iniciado | — |
| MusicDetailScreen (trajetória real) | ❌ Não iniciado | Seção 7 |
| Discover "Paradas populares"/"Pessoas parecidas" | ❌ Não iniciado | Seção 7 |

## 1. Overview & convenções

- Backend é um **monólito Next.js 16 (App Router)**, não uma API separada. Roda em
  `C:\ChartFM` via `npm run dev` (porta 3000, requer Postgres local via `npm run db:up`,
  docker-compose expõe a porta 5433).
- Produção: `https://chartfm.com.br`. Dev local: `http://<IP-da-LAN>:3000` — **nunca
  `localhost`**, pois dispositivo físico/Expo Go não resolve o loopback da máquina host.
- Base URL do app mobile vem de `EXPO_PUBLIC_API_BASE_URL` (`src/lib/api.ts`).
- Todas as rotas `/api/**` são isentas do middleware de prefixo de idioma
  (`isLocaleExemptPath` em `C:\ChartFM\lib\i18n\path.ts:28`) — chamadas diretas sem
  `/pt` ou `/en` funcionam normalmente.
- Formato de erro observado: `{ error: string }` no corpo, com status HTTP não-2xx.
  `src/lib/apiClient.ts` já normaliza isso em `ApiError { status, message, body }`.
- Não há WebSocket/SignalR. Qualquer feature "ao vivo" (Copa live-feed, live-comments)
  é implementada via polling sobre jobs cron — ver seção 6.
- **Dependências nativas exigem rebuild do app, não só reload do Metro.** Toda vez que uma lib
  com código nativo é adicionada (`expo-secure-store`, `expo-web-browser`, e mais recentemente
  `@react-native-community/netinfo`), o binário instalado no dispositivo/emulador precisa ser
  recompilado com `npx expo run:android` (ou `run:ios`, ou um build novo via EAS) — só rodar
  `npm start`/`expo start` reconecta ao binário antigo e o módulo aparece como `null` em
  runtime ("NativeModule.X is null").

## 2. Autenticação — ✅ completo

Duas camadas coexistem no backend: sessão web via NextAuth (cookie) e **JWT stateless
para mobile** (o que interessa aqui), implementado em:
- `C:\ChartFM\lib\mobile-jwt.ts` — assina/verifica JWT HS256 via `jose`, segredo
  `NEXTAUTH_SECRET`, issuer `chartfm-mobile`, audience `chartfm-mobile-app`, expiração
  30 dias.
- `C:\ChartFM\lib\mobile-auth.ts` — `getMobileUser(req)` lê `Authorization: Bearer <token>`.

### Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/auth/mobile/google/start` | Inicia OAuth Google para mobile (abre em `WebBrowser.openAuthSessionAsync`). |
| GET | `/api/auth/mobile/google/callback` | Callback do Google; troca code, resolve usuário, emite JWT mobile, redireciona para `chartfm://auth-callback?token=...`. |
| GET | `/api/auth/mobile/me` | Retorna `{ user: AuthUser }` dado um Bearer token válido. Usado no boot do app para restaurar sessão. |
| POST | `/api/auth/mobile/login` | **Criado nesta migração.** Body `{email, password}` → `{token, user}`. Espelha `signMobileAccessToken` do callback do Google. Erros: `missing_fields` (400), `invalid_credentials` (401), `email_not_verified` (403), `rate_limited` (429). |
| POST | `/api/auth/register` | Body `{name, email, password}` → `{ok, emailSent}`. Não emite token — usuário confirma email e então usa `/api/auth/mobile/login`. |

Contrato do deep link: `chartfm://auth-callback` — precisa bater com `scheme` em
`app.json` do `chartfm-app`. Parâmetros de query: `token` (sucesso) ou `error` (falha).

Shape de `AuthUser` (mobile, ver `src/state/AuthContext.tsx`):
```ts
{ id, handle, name, email, image, needsHandle: boolean, role: "USER" | "ADMIN" | "DEV" }
```
`AuthContext` também expõe `refreshUser()` — re-busca `/api/auth/mobile/me` e atualiza o
estado local depois de uma edição de perfil (o `user` do contexto não é React Query, não se
atualiza sozinho).

### Ainda não conectado no mobile

- Fluxos de verificação de email (`/api/auth/verify-email`, `/resend-verification`) e
  reset de senha (`/api/auth/forgot-password`, `/reset-password`) existem no backend e
  são agnósticos de plataforma (páginas web). O link "Esqueci minha senha" no
  `LoginScreen.tsx` continua decorativo.
- `needsHandle` (escolha de @handle no primeiro login) é retornado pela API mas o
  mobile ainda não tem uma tela de onboarding de handle dedicada (a edição de handle existe
  em `EditProfileScreen.tsx`, mas não há fluxo forçado no primeiro login).

## 3. Cheatsheet do domínio (subconjunto relevante ao mobile)

Fonte completa: `C:\ChartFM\prisma\schema.prisma` (~70 models, 2588 linhas).

- **User**: `id, handle, name, email, image, googleId, passwordHash, emailVerifiedAt,
  role, followers, following, streak, verified, genres[], xpTotal, level`, tokens OAuth
  de spotify/youtube/lastfm.
- **Chart / ChartEntry**: parada semanal do usuário. `Chart`: `weekIndex, chartType,
  communityId?`. `ChartEntry`: `position, points, delta, prevPos, peak, weeks`.
- **Artist / Album / Song**: catálogo, IDs do Spotify.
- **Copa\***: ver seção 5.
- **PushRound / PushSubmission / PushVote / PushSeasonChampion**: jogo semanal de
  submissão/votação.
- **AlbumClubRound / Nomination / PollVote / Winner**: "Clube do Álbum".
- **Community / CommunityMember**: grupos de usuários.
- **Notification, UserFollow, SongVideoClip, AlbumReview, XpTransaction**: social,
  reviews, gamificação.

## 4. Endpoints por feature

### 4.1 Global / Discover / Search — ✅ completo
- `GET /api/global/top` — usado só pelo widget da home **web**, devolve top 5 resumido. Não foi tocado.
- **`GET /api/global/leaderboard?type=songs|artists&scope=weekly|overall&week=<N>&limit=100`** —
  **novo endpoint**, criado em `C:\ChartFM\app\api\global\leaderboard\route.ts`, já que não
  existia JSON público com o ranking completo (a página `/global/100` é renderizada no
  servidor, sem API própria). Reaproveita o `GlobalSnapshot` já congelado semanalmente, sem
  recalcular agregação. Retorna `{weekIndex, weekLabel, dateRange, hasPrevWeek, hasNextWeek,
  prevWeekIndex, nextWeekIndex, items[]}`. Público. Usado por `Global100Screen.tsx` (abas
  Músicas/Artistas), `HomeScreen.tsx` (Global 100 top 3) e `DiscoverScreen.tsx` (Subindo
  rápido = itens com `movement: "up"`).
- `GET /api/search?q=` — usado por `SearchScreen.tsx`, `AddSongScreen.tsx`,
  `PushSubmitScreen.tsx` e o seletor de álbuns do `ClubeScreen.tsx`. Público. Shape:
  `{songs, artists, albums, users, communities, reviews}`.
- `GET /api/discover/mystery-track` — público. Hook pronto em `src/api/discover.ts`
  (`useMysteryTrackQuery`), ainda não consumido por nenhuma tela.
- `GET /api/recommendations` — feed social (não é "trending" no sentido do mock, é um feed de
  posts tipo "Fulano recomendou"). Fonte de `DiscoverScreen.tsx`/`HomeScreen.tsx` "Em alta".
- **`GET /api/me/progression`** — migrado para `getApiUser`. Usado em `HomeScreen.tsx` para
  nível/XP reais.

### 4.2 Chart pessoal — 🟡 parcial (criar sim, editar/apagar não)
- **`POST /api/charts`** — migrado para `getApiUser`. Body:
  `{entries: [{title, artist, album?, spotifyId?, songId?}], weekDate?}`. Usado por
  `EditorScreen.tsx` (`usePublishChartMutation` em `src/api/charts.ts`) e por
  `LastfmScreen.tsx` (monta os `entries` a partir da importação real).
- **`GET/PATCH/DELETE /api/charts/[id]`** e **`GET /api/charts/latest`** — migrados para
  `getApiUser`, mas **ainda não consumidos** por nenhuma tela — hoje o `EditorScreen` sempre
  cria uma parada nova via `POST`, nunca edita uma já publicada.
- Ainda não usados: `GET /api/charts/weeks`, `POST /api/charts/[id]/like|repost|comment`,
  `GET /api/charts/[id]/overlap|video-clips|mytrl-daily`.
- `AddSongScreen.tsx` reaproveita `GET /api/search` em vez de `manual-create`/`manual-lookup`
  — cobre o caso comum (música já no catálogo/Spotify). Entrada manual de música fora do
  catálogo ficou pendente.

### 4.3 Copa — ✅ placar corrigido, votação e hub reais

Ver seção 5 para a mecânica completa (a correção do placar foi o achado mais importante desta
migração). Resumo do que está implementado:
- `GET /api/copa` e `GET /api/copa/[id]/fixtures` — usados via `src/api/copa.ts`
  (`useCopaQuery`, `useCopaFixturesQuery`, polling a cada 60s).
- **`POST /api/copa/[id]/vote`** — migrado para `getApiUser`.
- **`GET /api/copa/[id]/standings`** — **novo endpoint**
  (`C:\ChartFM\app\api\copa\[id]\standings\route.ts`), reaproveita `computeStandings()`.
  Hook pronto (`useCopaStandingsQuery`), **ainda não consumido** — `CopaScreen.tsx` foca no
  fluxo de votar um confronto por vez; a tabela de grupos completa não tem tela ainda.
- `CopaScreen.tsx`, `EventsScreen.tsx` e `HomeScreen.tsx` mostram placar/status reais.
- Ainda não usados: `GET/POST /api/copa/[id]/join|claim|singles`, `GET /api/copa/live-feed`,
  `/live-comments`.

### 4.4 Push — ✅ completo (indicar e avaliar)
- **`GET /api/push`** — público. Retorna a rodada atual com `submissions`/`myVotes`/
  `mySubmission` prontos. `src/api/push.ts` (`usePushRoundQuery`).
- **`POST /api/push/[roundId]/submit`** — migrado para `getApiUser`. Tela
  `src/screens/PushSubmitScreen.tsx` (rota `PushSubmit`), acessível via "Indicar música" na
  `EventsScreen` quando `round.phase === "SUBMISSION"`. Reaproveita `GET /api/search`.
- **`POST /api/push/[roundId]/vote`** — migrado para `getApiUser`. Tela
  `src/screens/PushRankScreen.tsx` (rota `PushRank`), acessível via "Avaliar indicações"
  quando a fase é `LISTENING`/`RANKING`. Usa `react-native-draggable-flatlist` (mesmo padrão
  do `EditorScreen`) para gerar `{submissionId, position}` a partir da ordem arrastada.
- Não usados: `GET /api/push/historico`, `/rankings`.

### 4.5 Clube do Álbum — ✅ completo
- **Achado**: a feature vive sob `app/criticsfm/**` ("Critics FM") no backend. Decisão do
  usuário: tratar como feature geral do app mobile mesmo assim.
- **`GET /api/clube`** — **novo endpoint** (`C:\ChartFM\app\api\clube\route.ts`), reaproveita
  `getActiveClubeRound()` de `lib/clube-album.ts` (mesma função da página web
  `app/criticsfm/clube/page.tsx`). Retorna fase (`"0"` a `"4"`), indicações (nomes mascarados
  até revelação), vencedores, `myNominations`, `myVoteNominationIds`, `minPollVotes`.
- **`POST /api/clube/nominations`** e **`/votes`** — migrados para `getApiUser`.
- Tela `src/screens/ClubeScreen.tsx` (rota `Clube`): fase `"1"` usa um seletor de 2 álbuns via
  `GET /api/search`; fase `"2"` lista indicações com checkbox; fases `"3"`/`"4"` mostram
  vencedores com nota (`score`). Card em `EventsScreen.tsx` mostra tema/fase reais.

### 4.6 Profile / Social — ✅ completo (ver, seguir, editar nome/handle/gêneros)
- **`GET /api/profile/[handle]`** e **`GET /api/profile/[handle]/followers`** — migrados para
  `getApiUser`. Mobile usa: `user.{id,handle,name,avatar,followers,following,streak,charts[]}`,
  `imageUrl`, `isFollowing`, `totalCharts`, `genres`, `progression.{level,families[]}`
  (conquistas reais, substituindo o mock `BADGES`). `user.charts[0]` é a parada mais recente.
- **`POST /api/user/follow`** — migrado para `getApiUser`. Body `{targetId}` → `{following}`
  (toggle).
- **Gap de navegação corrigido**: `RootStackParamList.UserDetail` ganhou
  `{handle: string} | undefined`. `SearchScreen.tsx` (aba Pessoas) já passa handle real;
  `DiscoverScreen.tsx` (Pessoas com gosto parecido) e `MusicDetailScreen.tsx` (Quem tem no
  Top 20) ainda navegam sem handle (seções de origem continuam mockadas) — `UserDetailScreen`
  cai num fallback com aviso de "perfil de exemplo" em vez de quebrar.
- **Edição de perfil**: tela `src/screens/EditProfileScreen.tsx` (rota `EditProfile`, via
  "Editar" em `SettingsScreen.tsx`) — nome, `@handle`, gêneros (chips, lista fixa em
  `GENRE_OPTIONS` de `src/api/account.ts`, sem catálogo oficial exposto pela API).
  - **`PATCH /api/user/handle`** — migrado de `getToken()` direto (não suportava mobile) para
    `getApiUser`.
  - **`PATCH /api/user/genres`** — migrado para `getApiUser`.
- **Avatar — auth migrada, sem UI**: `POST/DELETE /api/user/avatar` migrados para `getApiUser`,
  prontos, mas sem tela — exigiria `expo-image-picker` (nova dependência nativa) + `FormData`
  multipart.
- Não usados: `GET /api/profile/[handle]/paradas|reviews`, `/api/user/chart-name|account|
  export-data`.

### 4.7 Notificações / Last.fm — ✅ completo
- **`GET/PATCH /api/notifications`** — migrados para `getApiUser`. `NotificationsScreen.tsx`
  mostra dados reais, separados em Hoje/Anteriores por data real; "Marcar lidas" funciona.
- **`GET /api/lastfm/status`** — migrado para `getApiUser`. Usado em `LastfmScreen.tsx` e
  `SettingsScreen.tsx`.
- **OAuth do Last.fm para mobile**: par dedicado espelhando o padrão do Google:
  - `GET /api/lastfm/connect/mobile/start?token=<jwt-mobile>` — o token mobile viaja como
    query param porque `WebBrowser.openAuthSessionAsync` não manda header `Authorization`;
    verificado com `verifyMobileAccessToken`, curto e consumido na hora (mesmo padrão de
    risco aceito pelo `state` assinado do fluxo web).
  - `GET /api/lastfm/connect/mobile/callback` — troca o token do Last.fm por sessão, salva
    `lastfmUser`/`lastfmSessionKey`, redireciona para `chartfm://lastfm-callback?status=
    connected` (ou `?error=...`).
  - Mobile: `useConnectLastfmMutation` em `src/api/lastfm.ts`.
- **Importação real de scrobbles**: `POST /api/lastfm/import` migrado para `getApiUser`. Body
  `{period: "7days"|"30days", limit}` → `{songs: [{title, artist, album, spotifyId,
  imageUrl}], total, periodLabel}`. `LastfmScreen.tsx` usa isso no passo 2
  (`useLastfmImportMutation`); passo 3 publica via o mesmo `usePublishChartMutation` da
  Fase 3. Só 7 e 30 dias existem na API — os demais períodos do mock foram removidos da tela.
- Não usados: `/api/spotify/**`, `/api/youtube/**` (`SettingsScreen` mostra Spotify como
  "Não conectado" estático).
- **Preferências de notificação continuam só locais** (`NotifPref`/`DEFAULT_NOTIF_PREFS` em
  `AppState`, memória) — não foi encontrado modelo/endpoint de prefs por categoria no schema.

## 5. Copa (Cup) — mecânica real confirmada

**Correção crítica vs. mock**: o mock mobile original mostrava barras de **porcentagem**
(63%/37%, hardcoded) simulando disputa de votos. O backend real **nunca expõe porcentagem** —
ele converte votos em **placar de gols inteiro**.

- `CopaEdition`: `status (REGISTRATION|GROUP_STAGE|KNOCKOUT|FINISHED)`, `type
  (NORMAL|PUSH)`, `votesPerGoal` (default 2).
- `CopaArtist`: participante ("time"): `groupLetter, slotInGroup, color, initials, image`.
- `CopaSingle`: músicas por artista ("elenco").
- `CopaFixture`: partida — `phase (GROUP|R16|QF|SF|THIRD_PLACE|FINAL|R32)`,
  `artistAId/BId, singleAIdx/BIdx, status (UPCOMING|LIVE|DONE)`.
- `CopaVote`: um voto por usuário por fixture (`side: "A"|"B"`), sem campo de gol.

Conversão (`C:\ChartFM\lib\copa.ts`):
```ts
votesToGoals(votes, votesPerGoal = 2) = Math.floor(votes / votesPerGoal)
```

`GET /api/copa/[id]/fixtures` e `/fixtures/[fid]` retornam:
```ts
{ votesA, votesB, goalsA, goalsB, status, myVote }
```

- **Fase de grupos**: tabela de classificação real via `computeStandings()` — P, W, D,
  L, GF, GA, GD, VF/VA/VD (votos como desempate extra), Pts (3 vitória, 1 empate).
- **Mata-mata**: `resolveKnockoutWinner()` não permite empate; desempata em ordem:
  1) gols → 2) votos brutos → 3) posição no Global 100 → 4) moeda determinística.

**Implicação para a UI mobile**: `CopaScreen.tsx` exibe placar "A x B" (`goalsA` x `goalsB`)
como dado primário, com `votesA`/`votesB` como informação secundária/desempate — implementado
na Fase 4 (ver 4.3).

## 6. Modo offline e polling

- **Modo offline real**: `@react-native-community/netinfo` instalado; `src/state/AppState.tsx`
  escuta `NetInfo.addEventListener` e atualiza `isOffline` de verdade (era um toggle de
  simulação em `SettingsScreen.tsx`, agora é só um aviso informativo quando `isOffline` é
  real). **Lembrete**: como é dependência nativa, precisa de rebuild do app (ver seção 1) para
  funcionar — reload do Metro não basta.
- Não há WebSocket. `CopaAutoVoteQueue` é processada a **1 item por minuto** — piso de
  sensatez para `refetchInterval` do react-query em Copa/Push.

## 7. Log de mismatches mock vs. backend (pendências conhecidas)

- **MusicDetailScreen**: continua 100% mockado (`TRACK_DETAIL`, `PEOPLE`). Bloqueadores: (1)
  nenhuma tela passa um `songId` real via navegação (todos os `navigate("MusicDetail")` são
  sem parâmetros); (2) não existe endpoint de "detalhe de música" nem de "trajetória histórica
  de posição"; (3) não existe endpoint de "quem tem essa música no Top 20". Precisa de
  plumbing de navegação + endpoints novos no backend.
- **DiscoverScreen "Paradas populares" (POPULAR) e "Pessoas com gosto parecido" (PEOPLE)**:
  ainda mockados. Não foi encontrado endpoint equivalente — precisa investigação dedicada
  (talvez `/api/communities` ou overlap client-side sobre `/api/charts/[id]/overlap`).
- **HomeScreen "Atividade"** e o texto "faltam 2 dias · sequência de X" no card de parada:
  ainda mockados (dependem de um feed de atividade e cálculo de prazo que não foram mapeados).
- **Global100Screen abas Álbuns/Clipes**: confirmado que não existe ranking de Álbuns nem de
  Clipes no `GlobalSnapshot` — a tela mostra "ainda não está disponível" nessas abas.
- **Avatar**: rota migrada, sem UI (precisa `expo-image-picker`).
- **Spotify/YouTube connect**: sem equivalente ao fluxo de status do Last.fm investigado.

## 8. Auth compartilhada mobile+web nas rotas (`lib/api-auth.ts`)

**Achado crítico**: das ~230 rotas em `app/api/**`, originalmente só `/api/auth/mobile/me`
usava `getMobileUser` (Bearer JWT). Praticamente todas as outras rotas autenticadas usam
`getServerSession(authOptions)`, que só entende cookie de sessão do NextAuth — **inacessível
ao app mobile**. Sem tratamento, toda rota que exige login responderia 401 para o app mobile
mesmo com token válido.

Solução: `C:\ChartFM\lib\api-auth.ts` exporta `getApiUser(req)`, que tenta o Bearer primeiro
(`getMobileUser`) e cai para `getServerSession(authOptions)` quando não há header — mesmo
comportamento para o client web, comportamento novo (funcional) para o mobile. Troca mecânica
por rota: `getServerSession(authOptions); session.user.id` vira `getApiUser(req); user.id`.

**Rotas já migradas** (uma a uma, conforme cada tela mobile passou a chamá-las):
`/api/me/progression`, `/api/charts` (POST), `/api/charts/[id]` (GET/PATCH/DELETE),
`/api/charts/latest`, `/api/copa/[id]/vote`, `/api/push/[roundId]/submit`,
`/api/push/[roundId]/vote`, `/api/clube/nominations`, `/api/clube/votes`,
`/api/profile/[handle]`, `/api/profile/[handle]/followers`, `/api/user/follow`,
`/api/notifications` (GET/PATCH), `/api/lastfm/status`, `/api/lastfm/import`,
`/api/user/handle`, `/api/user/genres`, `/api/user/avatar` (POST/DELETE).

**Ainda não migradas**: a maioria das ~200 rotas restantes (comunidades, mensagens diretas,
editorial, admin, etc.) — migrar sob demanda, só quando uma fase futura precisar delas. Rotas
de leitura pública que já degradam bem sem sessão (`/api/search`, `/api/discover/mystery-track`,
`/api/recommendations`, `/api/global/leaderboard`, `/api/copa`, `/api/copa/[id]/fixtures`,
`/api/push`, `/api/clube`) não precisam de migração — funcionam no mobile mesmo sem
`getApiUser`, porque tratam sessão ausente como "anônimo" em vez de 401.

## 9. Perguntas em aberto para o time de backend

- Confirmar shape exato de resposta de `GET /api/global/top` (Álbuns/Artistas/Clipes existem
  como variação de query em algum lugar não encontrado, ou de fato não existem?).
- Confirmar se existe endpoint de "atividade"/feed para a HomeScreen, ou se deve vir de
  `/api/posts` / `/api/editorial-posts`.
- Confirmar se `Clube do Álbum` deve mesmo virar uma feature geral do app (decisão tomada do
  lado mobile) ou se há alguma regra de acesso do lado do backend que precise ser replicada
  (ex.: `app/criticsfm/**` pode ter algum gate de role que não foi encontrado).
