# Telas do site vs app

Levantado em 2026-09-05. Fonte do site: rotas user-facing em `C:\ChartFM\app` (sem `/admin/**`). Fonte do app: `src/navigation/RootNavigator.tsx` e as telas em `src/screens/`.

O núcleo do app existe: home logada, parada, perfil, catálogo, Global 100, DMs, criar e editar chart, Copa ao vivo, Clube. O que o site ganhou depois do layout (comunidades, editorial, jogos completos, progressão, institucionais) quase não chegou no app.

A `ProfileSheet` já admite parte do buraco: Biblioteca, Estatísticas, Bolha, Comunidades e Loja ficaram de fora de propósito.

## Como ler

| Status | O que quer dizer |
|---|---|
| **Pronto** | Tela nativa cobre o trabalho principal |
| **Parcial** | Tela nativa existe, mas falta bloco, sub-rota ou profundidade do site |
| **Abre no site** | Só `Linking.openURL` para a página web |
| **Falta** | Sem tela nativa e sem atalho no app |

Rotas do site usam o path interno. Em produção elas vivem sob `/pt` ou `/en`.

## Fora do recorte

Não entram na conta:

- Tudo em `/admin/**`
- Edição de catálogo (`/song/*/edit`, `/album/*/edit`, `/artist/*/edit`): só ADMIN/DEV
- `/retro`: restrito ao @bruno
- `/manutencao`: página estática de sistema
- Variantes `?visual=podium|grid|video_clip` da parada: nota na linha da parada, não linhas próprias

## Resumo

| Status | Quantidade |
|---|---|
| Pronto | 22 |
| Parcial | 15 |
| Abre no site | 4 |
| Falta | 62 |
| **Total comparado** | **103** |

| Grupo | Telas | Pronto | Parcial | Abre no site | Falta |
|---|---|---|---|---|---|
| Home e feed | 2 | 0 | 2 | 0 | 0 |
| Descoberta | 12 | 0 | 3 | 1 | 8 |
| Charts oficiais | 7 | 1 | 2 | 0 | 4 |
| Catálogo | 5 | 4 | 0 | 0 | 1 |
| Paradas | 6 | 4 | 1 | 0 | 1 |
| Perfil e progressão | 10 | 5 | 1 | 0 | 4 |
| Comunidades | 9 | 0 | 0 | 0 | 9 |
| Editorial e guias | 13 | 0 | 0 | 0 | 13 |
| CriticsFM e Clube | 5 | 1 | 1 | 0 | 3 |
| Jogos | 12 | 2 | 3 | 0 | 7 |
| Conta | 10 | 5 | 2 | 0 | 3 |
| Institucionais | 12 | 0 | 0 | 3 | 9 |

## 1. Home e feed

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Home | `/` | Home (tab) | `src/screens/HomeScreen.tsx` | Parcial | Só o hub logado (recap, feed, Global, Copa). Sem portal público. |
| Feed | `/feed` | seção na Home | `src/components/feed/FeedList.tsx` | Parcial | Misturado na Home. Sem tela própria nem filtro por URL. |

## 2. Descoberta

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Descobrir | `/discover` | Discover (tab) | `src/screens/DiscoverScreen.tsx` | Parcial | Tem em alta e pessoas. Sem hub em quatro grupos, gênero, playlists cooperativas, Faixa Misteriosa. |
| Descobrir por gênero | `/discover/genre/[slug]` | — | — | Falta | |
| Ranking de curadores | `/discover/curators` | — | — | Falta | |
| Busca | `/search` | Search | `src/screens/SearchScreen.tsx` | Parcial | Só músicas, artistas e pessoas. Site tem álbum, review e comunidade. |
| Descobertas | `/descobertas` | — | — | Falta | Login no site. Sugestões com motivo medido. |
| Explorar paradas | `/explorar` | — | — | Falta | |
| Minha Bolha | `/bolha` | — | — | Falta | Login no site. A ProfileSheet cita de propósito. |
| Playlists cooperativas | `/playlists` | — | — | Falta | |
| Playlist da semana | `/playlists/[category]/[weekIndex]` | — | — | Falta | |
| Lançamentos | `/lancamentos` | faixa na Home | `src/components/home/ReleasesRow.tsx` | Parcial | Sem hub com abas. |
| Histórico de lançamentos | `/lancamentos/historico` | — | — | Falta | |
| Votação da Semana | `/votacao-da-semana` | — | `EventsScreen` via `Linking` | Abre no site | CTA do Push em SUBMISSION. |

## 3. Charts oficiais

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Charts (hub) | `/global` | Global (tab) | `src/screens/Global100Screen.tsx` | Parcial | A tab é o Global 100, não o hub com Airplay, Álbuns e gêneros. |
| Global 100 | `/global/100` | Global / Global100 | `src/screens/Global100Screen.tsx` | Pronto | Músicas e artistas, troca de semana. |
| Arquivo Global 100 | `/global/100/arquivo` | troca de semana no Global100 | `src/screens/Global100Screen.tsx` | Parcial | Dá para voltar semana a semana. Sem tela de arquivo. |
| Global Airplay | `/global/airplay` | — | — | Falta | Aba "em breve" no Global100. |
| Global Álbuns | `/global/albums` | — | — | Falta | Aba "em breve" no Global100. |
| Global por gênero | `/global/genre/[slug]` | — | — | Falta | |
| Retrospectiva 2026 | `/global/retrospectiva-2026` | — | — | Falta | |

## 4. Catálogo

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Hub Música | `/song/[slug]` | MusicDetail | `src/screens/MusicDetailScreen.tsx` | Pronto | Mais raso que o hub web. Lê API. |
| Hub Álbum | `/album/[slug]` | AlbumDetail | `src/screens/AlbumDetailScreen.tsx` | Pronto | Ficha, reviews, nota. |
| Hub Artista | `/artist/[name]` | ArtistDetail | `src/screens/ArtistDetailScreen.tsx` | Pronto | Ficha e presença. |
| Álbuns (browse) | `/albums` | — | — | Falta | `src/api/criticsfm.ts` existe, nenhuma tela chama. |
| Permalink de review | `/review/[id]` | ReviewDetail | `src/screens/ReviewDetailScreen.tsx` | Pronto | |

Edição de catálogo (`/*/edit`) ficou de fora: só ADMIN/DEV no site, e o app não tem equivalente.

## 5. Paradas

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Parada | `/chart/[id]` | ChartDetail | `src/screens/ChartDetailScreen.tsx` | Pronto | Só lista. Sem pódio, grade nem clipes. |
| Editar parada | `/chart/[id]/edit` | Editor | `src/screens/EditorScreen.tsx` | Pronto | Fluxo unificado criar e editar. |
| Configuração da parada | `/chart/setup` | — | — | Falta | Nome, frequência, tamanho, principal, auto-update. |
| Escolher método | `/create/start` | CreateGuided | `src/screens/CreateGuidedScreen.tsx` | Pronto | Do zero vs Last.fm. |
| Monte sua parada | `/create` | Editor | `src/screens/EditorScreen.tsx` | Pronto | Sheets: ChooseParada, AddSong, Spotlights, ParadaWeekPicker. |
| Modo guiado | `/create/guided` | CreateGuided | `src/screens/CreateGuidedScreen.tsx` | Parcial | Só a escolha do método. Sem o passo a passo do site. |

## 6. Perfil e progressão

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Perfil | `/profile/[handle]` | Profile / UserDetail | `src/screens/ProfileScreen.tsx`, `src/screens/UserDetailScreen.tsx` | Pronto | Próprio na tab. Outra pessoa em UserDetail. |
| Paradas do perfil | `/profile/[handle]/paradas` | ParadasList | `src/screens/ParadasListScreen.tsx` | Pronto | |
| Detalhe de uma parada | `/profile/[handle]/paradas/[paradaId]` | ParadaDetail | `src/screens/ParadaDetailScreen.tsx` | Pronto | |
| Seguidores | `/profile/[handle]/followers` | Followers | `src/screens/FollowersScreen.tsx` | Pronto | Seguidores e seguindo. |
| Estatísticas | `/profile/[handle]/estatisticas` | — | — | Falta | Só dois números no perfil. A ProfileSheet cita de propósito. |
| Histórico | `/profile/[handle]/historico` | History | `src/screens/HistoryScreen.tsx` | Pronto | |
| Conquistas | `/profile/[handle]/conquistas` | cards + modal | `src/components/AchievementDetailModal.tsx` | Parcial | Cards no perfil. Sem página própria. |
| Comparador | `/profile/[handle]/comparar` | — | — | Falta | Login no site. |
| Histórico na comunidade | `/profile/[handle]/comunidades/[slug]/historico` | — | — | Falta | |
| Biblioteca | `/biblioteca` | — | — | Falta | Login no site. A ProfileSheet cita de propósito. |

## 7. Comunidades

Nenhuma rota de comunidade tem tela nativa. A ProfileSheet deixou o grupo de fora de propósito.

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Comunidades | `/communities` | — | — | Falta | |
| Comunidade | `/community/[slug]` | — | — | Falta | |
| Criar comunidade | `/community/create` | — | — | Falta | |
| Membros | `/community/[slug]/members` | — | — | Falta | |
| Parada da comunidade | `/community/[slug]/parada` | — | — | Falta | |
| Airplay da comunidade | `/community/[slug]/airplay` | — | — | Falta | |
| Álbuns da comunidade | `/community/[slug]/albums` | — | — | Falta | |
| Votação da comunidade | `/community/[slug]/votacao` | — | — | Falta | |
| Configurações da comunidade | `/community/[slug]/settings` | — | — | Falta | Dono e mods no site. |

## 8. Editorial e guias

Nenhuma rota editorial ou de guia tem tela nativa. O card de editorial no feed (`EditorialFeedCard`) não abre o artigo.

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Editorial | `/editorial` | — | — | Falta | Card no feed não navega. |
| Artigo | `/editorial/[slug]` | — | — | Falta | |
| Autor | `/author/[slug]` | — | — | Falta | |
| Guias | `/guides` | — | — | Falta | |
| Como criar sua parada | `/guides/como-criar-sua-parada` | — | — | Falta | |
| Como funciona o Global 100 | `/guides/como-funciona-o-global-100` | — | — | Falta | |
| Como funciona a pontuação | `/guides/como-funciona-a-pontuacao` | — | — | Falta | |
| Como importar histórico | `/guides/como-importar-historico` | — | — | Falta | |
| Como participar de comunidades | `/guides/como-participar-de-comunidades` | — | — | Falta | |
| Como avaliar álbuns | `/guides/como-avaliar-albuns` | — | — | Falta | |
| Como descobrir músicas | `/guides/como-descobrir-musicas` | — | — | Falta | |
| Como funciona a Copa | `/guides/como-funciona-a-copa` | — | — | Falta | |
| Glossário | `/guides/glossario` | — | — | Falta | |

## 9. CriticsFM e Clube do Álbum

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| CriticsFM | `/criticsfm` | — | `src/api/criticsfm.ts` | Falta | Cliente de API existe, sem tela. |
| Álbum no CriticsFM | `/criticsfm/[albumId]` | AlbumDetail | `src/screens/AlbumDetailScreen.tsx` | Parcial | O site aponta canonical para `/album/...`. Avaliar existe via WriteReview. |
| Reviews | `/criticsfm/reviews` | — | — | Falta | |
| Clube do Álbum | `/criticsfm/clube` | Clube | `src/screens/ClubeScreen.tsx` | Pronto | Indicar, votar, avaliar na rodada. |
| Histórico do Clube | `/criticsfm/clube/historico` | — | — | Falta | |

## 10. Jogos

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Jogos | `/jogos` | Events | `src/screens/EventsScreen.tsx` | Pronto | Hub Copa + Push + Clube. |
| Copa (home) | `/copa` | Copa | `src/screens/CopaScreen.tsx` | Parcial | Sem tarja de abertura, fase, grupos. A tela nativa só vota confronto LIVE. |
| Copa ao vivo | `/copa/ao-vivo` | Copa | `src/screens/CopaScreen.tsx` | Pronto | É o que a tela nativa faz. |
| Grupos | `/copa/grupos` | — | — | Falta | |
| Chaveamento | `/copa/chaveamento` | — | — | Falta | |
| Regras | `/copa/regras` | — | — | Falta | |
| Meu time | `/copa/meu-time` | — | — | Falta | Claim, faixas, desistir. |
| Jogo | `/copa/jogo/[id]` | Copa | `src/screens/CopaScreen.tsx` | Parcial | Voto inline na lista LIVE. Sem tela do confronto. |
| Push | `/push` | Events + PushSubmit / PushRank | `src/screens/PushSubmitScreen.tsx`, `src/screens/PushRankScreen.tsx` | Parcial | PushSubmit é o fluxo legado. Rodada nova em SUBMISSION manda para o site. |
| Ranking Push | `/push/ranking` | — | — | Falta | |
| Histórico Push | `/push/historico` | — | — | Falta | |
| Sobre o Push | `/push/sobre` | — | — | Falta | |

## 11. Conta

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Entrar | `/login` | Login | `src/screens/LoginScreen.tsx` | Pronto | Google e e-mail. |
| Criar conta | `/signup` | Cadastro | `src/screens/SignupScreen.tsx` | Pronto | |
| Esqueci a senha | `/forgot-password` | — | — | Falta | |
| Redefinir senha | `/reset-password` | — | — | Falta | |
| Verificar e-mail | `/verify-email` | — | — | Falta | |
| Onboarding | `/onboarding` | Onboarding | `src/screens/OnboardingScreen.tsx` | Parcial | Splash de boas-vindas. Sem os 3 passos (handle, Last.fm, gêneros). |
| Configurações | `/settings` | Settings + EditProfile | `src/screens/SettingsScreen.tsx`, `src/screens/EditProfileScreen.tsx` | Parcial | Tema, idioma, prefs, Last.fm, bloqueados. Sem exclusão com sucessor. "Baixar meus dados" e Spotify são linhas mortas. |
| Notificações | `/notifications` | Notifications | `src/screens/NotificationsScreen.tsx` | Pronto | |
| Conversas | `/conversas` | Conversas | `src/screens/ConversasScreen.tsx` | Pronto | |
| Conversa | `/conversas/[id]` | ConversationThread | `src/screens/ConversationThreadScreen.tsx` | Pronto | |

## 12. Institucionais

| Tela | Rota no site | Tela no app | Arquivo | Status | Nota |
|---|---|---|---|---|---|
| Sobre | `/about` | — | — | Falta | |
| Contato | `/contact` | — | — | Falta | |
| FAQ | `/faq` | — | — | Falta | |
| Termos de Uso | `/terms-of-use` | — | `SettingsScreen` via `Linking` | Abre no site | Também no cadastro. |
| Privacidade | `/privacy-policy` | — | `SettingsScreen` via `Linking` | Abre no site | Também no cadastro. |
| Apoie | `/apoie` | — | — | Falta | |
| O Que Há de Novo | `/whats-new` | — | — | Falta | |
| Central de Ajuda | `/ajuda` | — | — | Falta | |
| Suporte | `/support` | — | — | Falta | |
| Exclusão de dados | `/data-deletion` | — | — | Falta | |
| Padrões de segurança infantil | `/child-safety-standards` | — | `SettingsScreen` via `Linking` | Abre no site | |
| Loja | `/store` | — | — | Falta | A ProfileSheet cita de propósito. |

## Telas só do app

Não são buraco no site. O site resolve no fluxo de outra página ou numa folha.

| Tela no app | Rota | Arquivo | Espelha no site |
|---|---|---|---|
| Folha Criar | CreateSheet | `src/screens/CreateSheetScreen.tsx` | Folha do botão do meio na BottomNav |
| Folha Perfil | ProfileSheet | `src/screens/ProfileSheetScreen.tsx` | Folha "Eu" da BottomNav |
| Escolher parada | ChooseParada | `src/screens/ChooseParadaSheet.tsx` | Parte de `/create` e `/chart/setup` |
| Adicionar faixa | AddSong | `src/screens/AddSongScreen.tsx` | Busca do editor |
| Semana da parada | ParadaWeekPicker | `src/components/ParadaWeekPickerSheet.tsx` | Calendário do editor |
| Destaques da chart | Spotlights | `src/screens/SpotlightsScreen.tsx` | Extras do criar/editar |
| Recomendar música | RecommendSong | `src/screens/RecommendSongScreen.tsx` | Ação do botão + |
| Avaliar álbum | WriteReview | `src/screens/WriteReviewScreen.tsx` | Ação do botão + e CriticsFM |
| Last.fm | Lastfm | `src/screens/LastfmScreen.tsx` | Onboarding passo 2 e Settings |
| Ações do usuário | UserActionsSheet | `src/screens/UserActionsSheet.tsx` | Mutar, bloquear, denunciar |
| Denúncia | ReportSheet | `src/screens/ReportSheet.tsx` | `ReportModal` do site |
| Contas bloqueadas | BlockedUsers | `src/screens/BlockedUsersScreen.tsx` | Dentro de Settings no site |

## Próximas candidatas

Sem ordem de prioridade. São os buracos que a ProfileSheet já nomeou, mais o que completa jogos e o que o site trata como produto:

- Biblioteca
- Estatísticas
- Bolha
- Comunidades (pelo menos índice e detalhe)
- Loja
- Copa completa (home, grupos, chaveamento, meu time)
- Push ranking e histórico
- Configuração da parada
- Editorial (abrir o artigo a partir do card do feed)

## Como atualizar

Quando uma tela nativa entrar: mover a linha de Falta para Pronto ou Parcial, preencher a coluna do app e a nota. Não reler o site inteiro. A conta do resumo precisa bater com as tabelas.
