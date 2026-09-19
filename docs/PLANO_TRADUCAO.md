# Plano de tradução PT → EN do app

Mecanismo: `useTr()` (`src/i18n/useTr.ts`) + dicionário `src/i18n/en.ts` (chave = texto em português).
Idioma e tema ficam salvos no aparelho (`ThemeProvider`).

Fora do escopo do app: texto gerado pelo servidor (corpo de notificações, nomes de eventos,
resenhas). As notificações têm tradutor por padrões em `src/api/notifications.ts`.

| Fase | Telas | Status |
|------|-------|--------|
| 0 | Notificações, Ajustes, Home, TabBar | feito |
| 1 | Biblioteca, Perfil, ProfileSheet, Buscar, Discover, Global100 | feito |
| 2 | Login, Signup, Onboarding, EditProfile, UserActions, Report, BlockedUsers, Seguidores | feito |
| 3 | Criar/Editor: CreateSheet, CreateGuided, ChooseParada, Editor, AddSong, ParadasList, ParadaWeekPicker, Push*, Lastfm | feito |
| 4 | Detalhes: Artist, Album, Music, UserDetail, Chart/Parada, WriteReview, RecommendSong, Stats, History, Achievements | feito |
| 5 | Social e eventos: CriticsFM, Clube, Bubble, Events, Copa, Spotlights, Conversas, componentes soltos (ErrorState, OfflineBanner, MovementBadge…) | feito |

Cada fase termina com `npx tsc --noEmit` limpo. Erros de rede e `Alert.alert` entram em cada tela.

Verificação: `python scripts/check_i18n.py` lista os `tr("...")` sem tradução em `src/i18n/en.ts`.

Notificações: o site traduz o texto na leitura (`lib/notification-i18n.ts` em `C:\ChartFM`, com teste). O app
pede `/api/notifications?lang=en`; a rota também entende Accept-Language. Modelo novo de notificação no site
precisa de um padrão em `EN_PATTERNS` no mesmo commit.

Limites conhecidos: mensagens de erro da API têm tradução em `src/i18n/apiErrors.ts` (só as mais comuns; as demais saem como vieram); nomes de conquistas/eventos/resenhas ainda saem em português;
avisos digitados por admin não são traduzidos. No site, só a tela de notificações usa `timeAgo` em inglês; os
outros usos (comentários de parada, playlists, cards da home) seguem em português.
