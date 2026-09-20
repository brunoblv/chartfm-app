# ChartFM Mobile App

App mobile (React Native + Expo + TypeScript) do ChartFM. Consome as APIs do site (repo separado em `C:\ChartFM`, Next.js).

## Regra permanente: este app é espelho do site

O app precisa sempre acompanhar o site (`C:\ChartFM`). Sempre que o usuário pedir uma mudança de produto ou funcionalidade lá, ela deve ser implementada aqui também, sem esperar um pedido separado.

Na prática: funcionalidade nova ou alterada no site geralmente expõe uma API (`app/api/...` no repo do site) para este app consumir, e precisa de uma tela ou ajuste de tela correspondente aqui. Se algo do site não fizer sentido no app (puramente administrativo, ou específico de SEO/AdSense), deixar isso registrado em vez de simplesmente ignorar.

Ver `ChartFM Mobile App — Product & UX Specification.md` para o escopo de MVP e as telas já desenhadas.

## Regra permanente: cadastro de artista/música é sempre via busca (Spotify/banco)

Toda vez que uma feature envolver cadastro de algo que tenha artista e música (ex.: clipe, álbum), a seleção do artista/música é sempre feita por busca no Spotify/banco (autocomplete), nunca por digitação livre no admin. O padrão antigo usado em lançamentos-clipes (digitação manual) está incorreto e não deve ser replicado em novas telas, nem aqui no app nem no site (`C:\ChartFM`).

Isso é relevante principalmente para o admin do site (fora do escopo deste app mobile), mas fica registrado aqui porque é uma regra de produto que vale para qualquer tela nova que envolva cadastro de artista/música.

## Regra permanente: nunca expor caminho de rota nem coisa de dev/admin em elemento voltado para o usuário

Vale para texto de tela, link, notificação, mensagem de erro, qualquer coisa que o usuário comum vê no app. Nada de citar rota técnica (`/lancamentos`, `/api/bolha`, nome de tela do RootNavigator) como se fosse instrução para a pessoa. Ou vira navegação de verdade (botão/link que leva para lá), ou vira linguagem comum ("na aba Lançamentos", "na sua Biblioteca"). O usuário não sabe o que é uma rota e não precisa saber disso. Vale nos dois repos, aqui e no site (`C:\ChartFM`).

## Nota: Central de Mídias Sociais não tem espelho no app

A Central de Mídias Sociais do site (`/admin/midias`, spec em `C:\ChartFM\docs\Central_de_Redes_Sociais_Specification.md`) é interna: o admin sobe um criativo, vincula a uma música, publica nas redes do ChartFM e acompanha as métricas. Não existe tela correspondente aqui, e não é esquecimento da regra de espelhamento: é funcionalidade administrativa, sem nada que o usuário do app veja ou use.

Se um dia parte disso virar conteúdo público (por exemplo, um recorte dos números aparecer para a comunidade), aí sim vale trazer para o app.

## Nota: Central de Mídias como hub criativo não tem espelho no app

A Central de Mídias do site agora reúne o antigo Gerador de Imagens (aba Estúdio de imagens) e o controle dos posts automáticos (aba Posts automáticos: liga/desliga por tipo e prévia da arte). `/admin/gerador-de-imagens` redireciona para lá. É puramente administrativo, sem tela correspondente no app.

## Nota: Analytics (Site e Redes sociais) não tem espelho no app

O Analytics do admin do site (abas Site e Redes sociais: métricas de tráfego, coleta de Instagram/Facebook/YouTube/Threads, insights, atribuição por UTM) é puramente administrativo, sem nada que o usuário do app veja ou use. Não é esquecimento da regra de espelhamento. A única parte que toca o app é a atribuição de cadastro: se o app passar a ter cadastro próprio, ele deve enviar a origem (UTM/campanha) ao site para não cair em "Não atribuído".

## Nota: landing da playlist New & Hot não tem espelho no app

A landing `/playlist/new-hot` do site (`C:\ChartFM`, `app/playlist/new-hot/page.tsx`) é uma página de captação de tráfego externo: quem chega por campanha ou busca segue a playlist no Spotify e só depois decide se quer criar conta. É deliberadamente standalone — sem Shell, sem gate de login — e visitante deslogado nunca é redirecionado para a home pública nem para `/landing`.

Não existe tela correspondente aqui e não deve existir: quem já tem o app instalado vê esse conteúdo na aba de charts. Não é esquecimento da regra de espelhamento.

Detalhe em aberto no site: ainda não há uma playlist "New & Hot" própria no Spotify do ChartFM — o CTA aponta para a playlist do Global 100 (`GlobalSnapshot.spotifyPlaylistId`) e, na falta dela, para o perfil do ChartFM.

## Nota: organização do admin (site)

O admin do site (`C:\ChartFM`) deve seguir sempre um layout de sistema organizado (menus agrupados, tabelas em vez de listas soltas empilhadas, sem seções "soltas"). Isso é administrativo/puramente do site — não se aplica a telas do app mobile — mas fica registrado aqui pois é uma diretriz permanente de produto.

## Regra permanente: toda tela nova nasce em português e inglês

Ao criar uma tela (ou texto novo em tela existente), a versão em inglês é obrigatória, no mesmo commit. Nada de texto fixo em português na tela.

Na prática: use `const tr = useTr()` (`src/i18n/useTr.ts`) e envolva cada texto visível: `tr("Texto em português")`, com a tradução adicionada em `src/i18n/en.ts` (a chave é o texto exato em português). Vale para títulos, botões, placeholders, estados vazios, mensagens de erro e textos de acessibilidade. Texto com variável usa duas frases completas (`lang === "en" ? ... : ...`), não concatenação. Mensagens de erro que o site devolve em português entram em `src/i18n/apiErrors.ts` (o cliente da API e os `*ErrorMessage` já passam por ele). Conteúdo de outro tipo que vem do servidor não é traduzido no app; se a tela exibir texto gerado pela API, o site precisa devolvê-lo no idioma certo.

Plano de tradução das telas antigas: `docs/PLANO_TRADUCAO.md`. Depois de mexer em textos, rode `python scripts/check_i18n.py` para achar `tr("...")` sem tradução.

## Nota: aba "Parada da semana" do admin não tem espelho no app

Em `/admin/parada-global` (site) há uma aba que mostra o Global 100 da semana para os admins antes da publicação: prévia calculada na hora (sem gravar) desde a segunda, e o snapshot congelado depois que o cron publica. É puramente administrativa, sem tela correspondente no app. Não é esquecimento da regra de espelhamento.

## Regra permanente: o corte das paradas fecha SEMPRE domingo às 23:59 (BRT)

O corte de envio das paradas pessoais para o Global 100 é fixo: a semana fecha domingo às 23:59 (BRT), ou seja, só entra `publishedAt < segunda 00:00 BRT`. Ele NÃO depende do horário de publicação configurado em `/admin/parada-global` e nunca foi "1h antes da publicação" (isso era um desvio do código, corrigido). Nunca reintroduzir corte relativo à publicação.

- O ranking é calculado a partir da segunda às 01:00 (BRT) e fica visível para os admins na aba "Parada da semana" de `/admin/parada-global`.
- A publicação ao público (página, notificações, playlists, posts nas redes) acontece no dia/horário programado nessa mesma tela, sempre depois do corte.
- No código: `getGlobalSnapshotDeadline` (corte, fixo) e `getGlobalPublishAt` (publicação, pelo slot) em `lib/chart-week.ts` no site (`C:\ChartFM`). Os textos públicos (FAQ, guias, artigo editorial, PT e EN) dizem "domingo às 23:59" via `formatGlobalDeadlineSlot`.
- O app não calcula nem exibe o corte por conta própria: qualquer texto sobre prazo de envio no app deve dizer domingo às 23:59.
