# ChartFM — Referência do Backend para o Mobile

Documento vivo. Atualizado ao final de cada fase da migração (nunca reescrito do zero, exceto
passes de limpeza como este). Fonte de verdade real: `C:\ChartFM\app\api\**\route.ts` e
`C:\ChartFM\prisma\schema.prisma` (não existe spec OpenAPI/Swagger/Postman no backend).

## 0. Status geral — o que já foi migrado

**⚠️ Pendência de deploy ativa (2026-08-30):** a VPS de produção (`https://chartfm.com.br`)
está rodando um build mais antigo que o `HEAD` do repo local. Confirmado testando ao vivo:
`/api/global/leaderboard` responde 404 em produção mesmo com o arquivo de rota commitado e
presente no histórico — ou seja, o Global 100 do mobile está quebrado em produção só por
falta de rebuild/restart, não por bug de código. Os endpoints novos desta fase (`/api/home/hub`,
`/api/home/discovery`, `/api/feed`, `/api/user/notification-prefs`) e as 13 rotas de
interação migradas para `getApiUser` (seção 4.9) **também não existem em produção ainda** pelo
mesmo motivo. Precisa dar `git pull` + rebuild + restart na VPS antes de qualquer teste real
no app.

| Área | Status | Detalhe |
|---|---|---|
| Auth (login, cadastro, sessão) | ✅ Completo | Seção 2 |
| Home / Global 100 / Discover / Search | ✅ Completo no código — 🔴 bloqueado por deploy | Seção 4.1 |
| Chart pessoal (criar + editar) | ✅ Completo | Seção 4.2 |
| Copa | 🟡 Placar corrigido, votação e hub prontos — falta tabela de grupos na UI | Seção 5 |
| Push (indicar + avaliar) | ✅ Completo | Seção 4.4 |
| Clube do Álbum | ✅ Completo | Seção 4.5 |
| Perfil / social (ver, seguir) | ✅ Completo | Seção 4.6 |
| Edição de perfil (nome/handle/gêneros/avatar) | ✅ Completo | Seção 4.6 |
| Notificações (lista + prefs por categoria) | ✅ Completo (2 de 5 categorias têm notificação real) | Seção 4.7 |
| Last.fm (conectar + importar) | ✅ Completo | Seção 4.7 |
| Conquistas (detalhe/requisitos por família) | ✅ Completo, catálogo espelhado no mobile | Seção 4.6 |
| Home Hub (resumo semanal, charts de amigos, pessoas p/ conhecer, reviews, lançamentos) | ✅ Completo no código — 🔴 bloqueado por deploy | Seção 4.8 |
| Feed de posts (paradas, recomendações, editorial, sistema) | 🟡 Leitura + curtir/repostar completos; comentar sem UI — 🔴 bloqueado por deploy | Seção 4.9 |
| Modo offline real | ✅ Completo | Seção 6 |
| Spotify/YouTube connect | ❌ Não iniciado | — |
| MusicDetailScreen (trajetória real) | ❌ Não iniciado | Seção 7 |
| Discover "Paradas populares"/"Pessoas parecidas" | ❌ Não iniciado (mocks antigos ainda na tela Discover; a Home Hub cobre um caso parecido com dado real) | Seção 7 |

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
  com código nativo é adicionada (`expo-secure-store`, `expo-web-browser`,
  `@react-native-community/netinfo`, e mais recentemente `expo-image-picker`), o binário
  instalado no dispositivo/emulador precisa ser recompilado com `npx expo run:android` (ou
  `run:ios`, ou um build novo via EAS) — só rodar `npm start`/`expo start` reconecta ao binário
  antigo e o módulo aparece como `null` em runtime ("NativeModule.X is null").
- **Toda imagem vinda da API passa por `resolveMediaUrl()` (`src/lib/api.ts`).** Nem todo
  campo de imagem devolve URL absoluta — avatar de upload direto (vs. login Google) volta como
  caminho relativo (`/api/uploads/...`), que o `Image` do RN não resolve sozinho. Qualquer tela
  nova que renderize avatar/capa deve passar o valor por esse helper antes do `uri`.
- **401 de uma chamada autenticada força logout automático.** `apiClient.ts` chama um handler
  registrado por `AuthContext` (`setUnauthorizedHandler`) sempre que uma resposta 401 vem de uma
  chamada com `auth: true`; o `RootNavigator` usa `key={isSignedIn ? "signed-in" : "signed-out"}`
  no `Stack.Navigator` pra garantir que a troca de tela (voltar pro Onboarding/Login) realmente
  aconteça — sem essa `key`, `initialRouteName` só é lido na montagem inicial e o app fica preso
  na tela autenticada mesmo depois de deslogado.

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

### 4.2 Chart pessoal — ✅ completo (criar e editar)
- **`POST /api/charts`** — migrado para `getApiUser`. Body:
  `{entries: [{title, artist, album?, spotifyId?, songId?}], weekDate?}`. Usado por
  `EditorScreen.tsx` (`usePublishChartMutation` em `src/api/charts.ts`) e por
  `LastfmScreen.tsx` (monta os `entries` a partir da importação real). **Não faz upsert**: se
  já existe parada publicada nesse período, retorna 409 com `{id, error}` (o `id` é o da parada
  já existente).
- **Achado + correção (2026-08-30)**: o `EditorScreen` sempre chamava só o `POST`, então
  "editar" uma parada já publicada na semana sempre batia no 409 acima e falhava — era a causa
  real do "editar parada está mockado" reportado pelo usuário, não um bug de UI. Corrigido em
  duas pontas:
  1. **Pré-carregamento**: `EditorScreen.tsx` agora busca `useProfileQuery(user.handle)` e, se
     o rascunho local (`AppState.chart`) estiver vazio, pré-preenche com
     `profile.user.charts[0].entries` (a parada mais recente — pode ser a desta semana, se já
     publicada, ou a da semana passada, servindo como ponto de partida).
  2. **Fallback automático**: `EditorScreen.handlePublish` tenta `POST` primeiro; se vier 409
     com `id` no corpo, chama a nova `useUpdateChartMutation` (`PATCH /api/charts/[id]`) com o
     mesmo `id`, em vez de mostrar erro. Ver `existingChartIdFromConflict()` em
     `src/api/charts.ts`.
- **`GET/PATCH/DELETE /api/charts/[id]`** — migrados para `getApiUser`. `PATCH` agora é
  **consumido** (fluxo acima). `GET`/`DELETE` ainda não têm tela.
- **`GET /api/charts/latest`** — migrado para `getApiUser`, mas **ainda não consumido** — devolve
  a parada do período *anterior* ao informado (pensado para o fluxo web de "começar da semana
  passada"), não a parada da semana atual; não confundir com o pré-carregamento acima, que usa
  `GET /api/profile/[handle]` porque esse já trazia a parada mais recente pronta.
- Ainda não usados: `GET /api/charts/weeks`, `GET /api/charts/[id]/overlap|video-clips|mytrl-daily`.
  `POST /api/charts/[id]/like|repost|comment` **agora são usados** — ver seção 4.9 (Feed).
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
- **Avatar — ✅ completo (2026-08-30)**: `expo-image-picker` adicionado como dependência nativa
  (**precisa rebuild do app**, ver seção 1). `EditProfileScreen.tsx` ganhou UI de trocar/remover
  foto: `ImagePicker.launchImageLibraryAsync` → `POST /api/user/avatar` via `FormData`
  multipart (`useUploadAvatarMutation`/`useDeleteAvatarMutation` em `src/api/account.ts`, fora
  do `apiRequest` genérico porque este força `Content-Type: application/json`). Após upload,
  chama `refreshUser()` e invalida `["profile"]`.
- **Achado + correção (2026-08-30) — capas/avatares "não aparecem"**: confirmado testando a API
  de produção que **avatar enviado por upload direto volta como caminho relativo**
  (`/api/uploads/avatars/<id>.jpg?v=...`), enquanto avatar de login Google e capas do Spotify
  vêm como URL absoluta. `Image` do React Native não resolve URI relativa como um navegador
  faria — por isso ficava em branco. Corrigido com `resolveMediaUrl()` em `src/lib/api.ts`
  (prefixa com `API_BASE_URL` quando a URL não começa com `http`), aplicado em `Cover.tsx` e em
  todo `<Image source={{uri:...}}>` de avatar/capa do app (Profile, UserDetail, Home, Search,
  Clube, AddSong, PushRank, PushSubmit, Lastfm). **Sempre passar imageUrl/coverUrl/avatarUrl por
  esse helper em telas novas.**
- **Conquistas — detalhe por família (2026-08-30)**: `ProfileScreen.tsx` agora abre um modal
  (`AchievementDetailModal.tsx`) ao tocar num card de conquista, mostrando descrição, os 4 tiers
  (bronze/prata/ouro/platina) com limiar e XP de cada um, e qual já foi desbloqueado. Os
  limiares/descrições vivem em `src/data/achievements.ts`, **copiados** de
  `C:\ChartFM\lib\progression\achievements-catalog.ts` (`ACHIEVEMENT_FAMILIES`) — não há
  endpoint que devolva os 4 limiares por família, só o progresso atual
  (`ProfileFamilyProgress.nextThreshold`, um de cada vez). **Se os limiares mudarem no backend
  (só descem, nunca sobem — ver comentário no catálogo), `src/data/achievements.ts` fica
  desatualizado silenciosamente.** Considerar expor os 4 limiares completos em
  `GET /api/profile/[handle]` (`progression.families[].thresholds`) numa fase futura para
  eliminar essa cópia.
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
- **Preferências de notificação — ✅ reais para 2 de 5 categorias (2026-08-30)**: schema ganhou
  `User.notifPrefs Json?` (`@map("notif_prefs")`, nullable, migration
  `prisma/migrations/20260830120000_user_notif_prefs` — aditiva, sem backfill, ausência de
  preferência = categoria habilitada). Nova rota `GET/PATCH /api/user/notification-prefs`
  (`getApiUser`) lê/grava `{chart, social}`. `lib/notifications.ts#createNotification` agora
  checa a preferência do destinatário antes de criar a notificação, via um mapa fixo
  `TYPE_CATEGORY` (tipo de notificação → categoria).
  - **Só 2 categorias têm notificação real hoje**: `chart` (tipo `milestone`, streak) e
    `social` (`like, comment, comment_reply, comment_like, repost, follow,
    weekly_playlist_comment*, community_join_approved`). "Ranking" e "Conquistas" (categorias
    que já existiam na UI mobile) **nunca disparam notificação no backend atual** — não existe
    `Notification` para conquista desbloqueada (só `XpTransaction`) nem para movimento no
    Global 100. `SettingsScreen.tsx` mostra os 5 toggles, mas "Ranking"/"Eventos"/"Conquistas"
    ficam visualmente desabilitados com nota "Em breve" — só "Minha parada" e "Comunidade" são
    reais (`src/api/notificationPrefs.ts`, `NOTIF_ROWS` em `SettingsScreen.tsx`).
  - `src/data/notifPrefs.ts` (mock local) e o `notifPrefs`/`toggleNotifPref` do `AppState`
    foram removidos — não têm mais uso.
  - Tipos sem categoria mapeada (`support_reply`, `support_ticket`, etc.) nunca são suprimidos
    — comunicação transacional, não engajamento.

### 4.8 Home Hub (nova Home mobile, 2026-08-30) — ✅ completo no código, 🔴 bloqueado por deploy

A Home web (`app/page.tsx`) nunca teve API própria — é 100% renderizada no servidor (RSC),
consumindo `lib/*` direto com Prisma. Pra existir no mobile, cada seção pessoal virou uma rota
nova (todas em `getApiUser`, nenhuma existia antes desta fase):

- **`GET /api/home/hub`** (autenticado) — um único GET cobrindo as seções pessoais, pra evitar
  4 idas e voltas do app:
  - `weekStatus`: `{streak, daysLeft, paradaNome, primaryParadaId, thisWeekChartId}` — espelha
    `YourWeekCard`/`app/page.tsx` (o card vermelho de "publique sua parada").
  - `recap`: `WeeklyRecap` de `lib/weekly-recap.ts#getWeeklyRecap` (não mudou, só passou a ser
    exposto) — "Sua semana no ChartFM".
  - `friendCharts`: `lib/home-hub-data.ts#getFriendCharts` — "Charts de quem você segue".
  - `people`: `lib/home-hub-data.ts#getPeopleToMeet` — "Pessoas para conhecer". **Sem "X% de
    compatibilidade"** — só `commonGenres.length` (contagem de gêneros em comum); a doc de
    design menciona percentual, mas não está implementado em lugar nenhum do backend.
- **`GET /api/home/discovery`** (público, sem `getApiUser`) — `reviews` e `releases`, via
  `lib/public-home-data.ts#getPublicHomeData` (já cacheada 300s por semana+locale, igual à
  web). Não é dado por usuário, por isso não exige auth.
- Mobile: `src/api/homeHub.ts` (`useHomeHubQuery`, `useHomeDiscoveryQuery`), componentes em
  `src/components/home/*` (`WeekStatusCard`, `WeeklyRecapCard`, `FriendChartsRow`,
  `PeopleToMeetRow`, `ReviewsRow`, `ReleasesRow`), compostos em `HomeScreen.tsx` sob a aba
  "Início". Textos de `recapItemLabel()` em `src/api/homeHub.ts` são cópia manual das chaves
  i18n de `lib/i18n/messages/pages-pt-BR.ts` (`homeHub.recap*`) — **se o texto mudar na web,
  não propaga sozinho pro mobile.**
- `HomeScreen.tsx` também ganhou o `hasChart` derivado de `useProfileQuery` (antes vinha de um
  `AppState.hasChart` local que tinha sido removido, deixando a Home sempre presa na tela de
  onboarding) e um avatar/notificação real no header (badge do sino só aparece com notificação
  não lida de verdade).

### 4.9 Feed de posts (2026-08-30) — 🟡 leitura + curtir/repostar completos, comentar sem UI

- **`getTimelineFeed`/`mapChartRow`** (antes função local dentro de `app/page.tsx`) foram
  **extraídos** para `lib/timeline-feed.ts`, reutilizável — `app/page.tsx` importa de lá agora,
  comportamento da web não muda (só refatoração, confirmado por typecheck).
- **`GET /api/feed?tab=for-you|following&cursor=&limit=&locale=`** (autenticado) — mistura
  `getTimelineFeed` (paradas publicadas) + `getRecommendationsFeed` + `getSystemFeedPosts` +
  `getEditorialPicksSorted` via `lib/home-mixed-feed.ts#mergeHomeFeed` (já existia, reaproveitado
  sem alteração). Reviews **não entram** no feed misto — mesma escolha da própria web (tem seção
  própria, já coberta pela Home Hub acima).
  - **Paginação é nova, desenhada do zero**: a web nunca paginou o feed (renderiza tudo de uma
    vez com `take` fixo por fonte). A rota monta um pool de até 200 itens mesclados e pagina
    dentro dele por `createdAt` (string ISO, cursor = `createdAt` do último item da página).
    Passar do fim do pool = fim do feed por ora. Se isso incomodar (usuário rolando muito),
    a alavanca é aumentar `POOL_LIMIT` em `app/api/feed/route.ts`, não reescrever a paginação.
- **13 rotas de interação migradas de `getServerSession` para `getApiUser`** (nenhuma delas
  aceitava Bearer JWT antes — qualquer botão de curtir/comentar/repostar do feed mobile daria
  401 sem isso):
  `charts/[id]/like`, `charts/[id]/repost`, `charts/[id]/comment` (GET+POST),
  `charts/[id]/comment/[commentId]` (DELETE), `charts/[id]/comment/[commentId]/like`,
  `charts/[id]/comment/[commentId]/replies` (GET+POST),
  `recommendations/[id]/like`, `recommendations/[id]/comments` (GET+POST),
  `recommendations/[id]/comments/[commentId]/like`,
  `recommendations/[id]/comments/[commentId]/replies` (GET+POST),
  `editorial-posts/[slug]/like`, `editorial-posts/[slug]/comment` (GET+POST),
  `editorial-posts/comments/[commentId]/like`.
  Troca mecânica igual ao padrão da seção 8 (`getServerSession` → `getApiUser`,
  `session.user.id` → `apiUser.id`), sem mudança de comportamento pro client web.
- Mobile: `src/api/feed.ts` (`useFeedQuery` com `useInfiniteQuery`, `useLikeChartMutation`,
  `useRepostChartMutation`, `useLikeRecommendationMutation`), cards por tipo em
  `src/components/feed/*` (`ChartFeedCard`, `RecommendationFeedCard`, `SystemFeedCard`,
  `EditorialFeedCard`), lista com scroll infinito em `FeedList.tsx`. `HomeScreen.tsx` ganhou a
  aba "Feed" (com sub-abas "Para você"/"Seguindo"), ao lado da aba "Início" da seção 4.8.
- **Deliberadamente fora do escopo desta fase**: compor/ver comentários e respostas — as rotas
  já estão migradas e prontas (`GET/POST /api/charts/[id]/comment`, etc.), só falta a tela
  mobile (lista de comentários + campo de texto + respostas aninhadas). Curtir e repostar
  paradas funcionam; curtir recomendação funciona; curtir/comentar em post editorial **não tem
  hook no mobile ainda** (rota migrada, mas `src/api/feed.ts` não expõe mutation pra isso —
  post editorial no feed mobile é só leitura por ora).

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
  ainda mockados (a tela `Discover`, não a Home). Não foi encontrado endpoint equivalente
  específico pra essa tela — a Home Hub (seção 4.8) resolve um caso parecido ("Pessoas para
  conhecer", "Charts de quem você segue") com dado real, mas `DiscoverScreen.tsx` em si não foi
  tocado nesta fase.
- **Global100Screen abas Álbuns/Clipes**: confirmado que não existe ranking de Álbuns nem de
  Clipes no `GlobalSnapshot` — a tela mostra "ainda não está disponível" nessas abas.
- **Spotify/YouTube connect**: sem equivalente ao fluxo de status do Last.fm investigado.
- **Comentários do Feed sem UI mobile**: ver seção 4.9 — rotas prontas, falta a tela.
- **Preferências de notificação "Ranking"/"Eventos"/"Conquistas"**: sem notificação real
  correspondente no backend hoje — ver seção 4.7.
- **Achievement thresholds duplicados no mobile**: `src/data/achievements.ts` copia
  `ACHIEVEMENT_FAMILIES` do backend à mão — ver nota na seção 4.6.

### Resolvidos nesta fase (2026-08-30) — ficam registrados por contexto, não por ação pendente
- ~~**Global 100 não carrega**~~: não era bug de código — a rota existe e está correta, mas a
  VPS está com deploy desatualizado (ver aviso no topo da seção 0).
- ~~**Capas/avatares não aparecem**~~: `Image` do RN não resolvia caminho relativo de avatar
  de upload direto — corrigido com `resolveMediaUrl()` (seção 4.6).
- ~~**Listas de álbum/música não rolam**~~: em `DiscoverScreen.tsx`, três fileiras horizontais
  ("Em alta esta semana", "Paradas populares", "Pessoas com gosto parecido") eram `View` com
  `flexDirection: row` sem `ScrollView` horizontal ao redor — bug de mobile puro, sem relação
  com o backend.
- ~~**Editar parada mockado**~~: não era mock — era o `POST /api/charts` retornando 409 (sem
  upsert) e o `EditorScreen` nunca tentando `PATCH`. Corrigido na seção 4.2.
- ~~**Home sempre presa na tela de "criar minha primeira parada"**~~: regressão local — um
  `AppState.hasChart` tinha sido removido sem atualizar `HomeScreen.tsx`, que ainda o
  destructurava (virava `undefined`, sempre falsy). Corrigido derivando de
  `useProfileQuery` (seção 4.8).
- ~~**Copa dando "Unauthorized"**~~: não havia bug no endpoint de voto em si (já usa
  `getApiUser`), mas o app não tinha *nenhum* tratamento de 401 expirado — `RootNavigator`
  não trocava de tela ao deslogar (`initialRouteName` só lido na montagem). Corrigido com
  `setUnauthorizedHandler()` em `apiClient.ts` (força logout em qualquer 401 autenticado) +
  `key={isSignedIn ? "signed-in" : "signed-out"}` no `Stack.Navigator` pra remontar e navegar
  de verdade.

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
`/api/user/handle`, `/api/user/genres`, `/api/user/avatar` (POST/DELETE),
`/api/user/notification-prefs` (GET/PATCH, rota nova),
`/api/charts/[id]/like`, `/api/charts/[id]/repost`, `/api/charts/[id]/comment` (GET/POST),
`/api/charts/[id]/comment/[commentId]` (DELETE),
`/api/charts/[id]/comment/[commentId]/like`,
`/api/charts/[id]/comment/[commentId]/replies` (GET/POST),
`/api/recommendations/[id]/like`, `/api/recommendations/[id]/comments` (GET/POST),
`/api/recommendations/[id]/comments/[commentId]/like`,
`/api/recommendations/[id]/comments/[commentId]/replies` (GET/POST),
`/api/editorial-posts/[slug]/like`, `/api/editorial-posts/[slug]/comment` (GET/POST),
`/api/editorial-posts/comments/[commentId]/like`.
Rotas novas que já nasceram em `getApiUser` (nunca usaram `getServerSession`):
`/api/home/hub`, `/api/home/discovery` (esta não exige auth), `/api/feed`.

**Ainda não migradas**: a maioria das ~185 rotas restantes (comunidades, mensagens diretas,
admin, etc.) — migrar sob demanda, só quando uma fase futura precisar delas. Rotas
de leitura pública que já degradam bem sem sessão (`/api/search`, `/api/discover/mystery-track`,
`/api/recommendations`, `/api/global/leaderboard`, `/api/copa`, `/api/copa/[id]/fixtures`,
`/api/push`, `/api/clube`) não precisam de migração — funcionam no mobile mesmo sem
`getApiUser`, porque tratam sessão ausente como "anônimo" em vez de 401.

## 9. Perguntas em aberto para o time de backend

- Confirmar shape exato de resposta de `GET /api/global/top` (Álbuns/Artistas/Clipes existem
  como variação de query em algum lugar não encontrado, ou de fato não existem?).
- ~~Confirmar se existe endpoint de "atividade"/feed para a HomeScreen~~ — **respondido nesta
  fase**: não existia nenhum (a home web é 100% RSC sem API própria); `GET /api/feed` e
  `GET /api/home/hub`/`GET /api/home/discovery` foram criados pra cobrir isso (seções 4.8/4.9).
- Confirmar se `Clube do Álbum` deve mesmo virar uma feature geral do app (decisão tomada do
  lado mobile) ou se há alguma regra de acesso do lado do backend que precise ser replicada
  (ex.: `app/criticsfm/**` pode ter algum gate de role que não foi encontrado).
- Decidir se vale expor os 4 limiares de cada família de conquista em
  `GET /api/profile/[handle]` pra eliminar a cópia manual em `src/data/achievements.ts`
  (ver seção 4.6).
- Confirmar se "Ranking"/"Conquistas" devem ganhar notificação real (`Notification` row) no
  futuro, ou se ficam permanentemente fora do sistema de preferências por categoria (ver
  seção 4.7) — hoje a UI mobile mostra os toggles desabilitados esperando essa decisão.
- Priorizar (ou não) uma tela de comentários pro Feed mobile — as 13 rotas de interação já
  estão migradas e prontas (seção 4.9), só falta o trabalho de UI.
