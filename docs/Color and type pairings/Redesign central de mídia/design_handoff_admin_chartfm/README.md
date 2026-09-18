# Handoff: Admin do ChartFM — Central de Mídias, Analytics, Edição de Dados, Lançamentos e Índice

## Overview
Redesenho do painel `/admin` do ChartFM (repo `brunoblv/music-app`, branch `main`, Next.js App Router). O ponto de partida foi a Central de Mídias, descrita pelo product owner como "amadora e não funcional": navegação em pílulas, agenda semanal com cartões enormes, e nenhuma visão do que sai hoje. A partir dela o desenho foi estendido para um índice do admin e três telas prioritárias (Analytics, Edição de Dados, Lançamentos).

Objetivos do redesenho:
1. Reduzir cliques nas operações do dia a dia (editar dado, aprovar lançamento, remarcar post).
2. Tornar tabelas densas legíveis (dor explícita do usuário: "as tabelas são ilegíveis, principalmente na edição de dados").
3. Dar à Central de Mídias uma agenda que caiba a semana inteira na tela.
4. Manter tudo dentro do chrome real do app (TopNav + tokens do design system ChartFM).

## About the Design Files
Os arquivos em `design/` são **referências de design feitas em HTML** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar**. A tarefa é **recriar estas telas no codebase existente** (`brunoblv/music-app`: Next.js 14 App Router, React Server/Client Components, TypeScript, CSS custom properties em `app/globals.css`), usando os padrões já estabelecidos lá:

- Server Component de página em `app/admin/<rota>/page.tsx` + Client Component para interação.
- Chrome já existente: `components/layout/Shell.tsx` e `components/layout/TopNav.tsx` — **não recriar** o topo; as telas entram no conteúdo do Shell.
- Tokens: as variáveis `--accent`, `--surface`, `--divider*`, `--text*`, `--up-*`, `--down-*` etc. já existem em `app/globals.css` / no design system ChartFM. Usar `var(--*)`, nunca hex solto.
- Os protótipos usam um runtime próprio (`support.js`, arquivos `.dc.html`). Ignorar esse runtime: ele só serve para abrir os arquivos no navegador. O que importa é a estrutura, a hierarquia visual, os valores de token, as medidas e os comportamentos descritos abaixo.

Para visualizar: abrir qualquer `design/*.dc.html` direto no navegador (precisa da pasta `design/_ds/` ao lado, já incluída).

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamento, raios, estados de hover e interações são finais. Todos os valores de cor vêm de tokens do design system ChartFM (exceto o par âmbar de alerta, documentado em Design Tokens). Recriar pixel-perfeito usando os componentes e utilitários do codebase.

---

## Screens / Views

Todas as telas compartilham:

- **Chrome**: TopNav fixo (`position: sticky; top: 0`), altura do conteúdo 14px vertical / 40px horizontal, `background: var(--bg-topbar)`, `backdrop-filter: blur(20px) saturate(160%)`, `border-bottom: 1px solid var(--divider)`. Logo = `ChartFM.ChartFMLogo` do design system, `size={26}`. Avatar 34×34, `border-radius: 50%`, `background: #FA243C`, inicial branca 14px/700.
- **Container de conteúdo**: `max-width: 1200px` (1360px na Edição de Dados, 1240px em Lançamentos), `margin: 0 auto`, `padding: 32–36px 40px 80px`.
- **Título de página**: 40–44px / 700 / `letter-spacing: -0.04em` / `line-height: 1.05`. Subtítulo 15px / `var(--text-muted)` / `letter-spacing: -0.01em`, `margin-top: 6px`.
- **Breadcrumb** (telas internas): 12.5px `var(--text-muted)`, formato `Admin · <seção>`, `margin-bottom: 8px`.
- **Botão de tema** no TopNav: pílula 6px/12px, 12px/600, borda `var(--divider-strong)`. Existe só porque os protótipos precisam demonstrar os dois temas — no app real o tema já é global; **não portar esse botão**.
- **Cartão padrão**: `background: var(--surface)`, `border: 1px solid var(--divider)`, `border-radius: 14–18px` (14 = cartão pequeno/lista, 16 = tabela, 18 = seção).
- **Botão primário**: `background: var(--accent)`, texto `#fff`, `border-radius: 100px`, `padding: 11–12px 20–24px`, 13.5–14px/700, `box-shadow: 0 2px 8px rgba(250,36,60,0.25)`.
- **Botão secundário**: fundo transparente ou `var(--surface)`, `border: 1px solid var(--divider-strong)`, texto `var(--text)`, mesma pílula.
- **Botão terciário**: sem borda, sem fundo, texto `var(--text-muted)` 13px/600.
- **Abas**: linha com `border-bottom: 1px solid var(--divider)`, `overflow-x: auto; overflow-y: hidden`. Cada aba: `padding: 10px 4px`, `margin-right: 22px`, 14px, peso 700 (ativa) / 500 (inativa), cor `var(--text)` / `var(--text-muted)`, `border-bottom: 2px solid var(--accent)` na ativa, `margin-bottom: -1px` para cobrir a divisória. Contadores ao lado do rótulo: 11.5px/700 `var(--text-muted)`.
- **Pílula de filtro (segmented)**: container `border: 1px solid var(--divider-strong)`, `border-radius: 100px`, `padding: 2px`; item ativo `background: var(--accent)`, texto `#fff`; inativo transparente com `var(--text-subtle)`; item `padding: 6–7px 13–14px`, 12.5px/700.
- **Chip de filtro (solto)**: pílula `padding: 8px 15px`, 12.5–13px/700; ativo = `var(--accent)` + `#fff`; inativo = `var(--surface)` + borda `var(--divider-strong)` + `var(--text-subtle)`.
- **Números**: sempre `font-variant-numeric: tabular-nums`.
- **Hover de linha de lista/tabela**: `background: var(--fill-subtle)`.
- **Tipografia**: stack nativa do design system — `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif`, `-webkit-font-smoothing: antialiased`. Nenhuma webfont.

---

### 1. Admin — Índice (`design/Admin - Índice.dc.html`)
Rota sugerida: `app/admin/page.tsx` (hoje não existe índice, só o menu suspenso do TopNav).

**Purpose**: ponto de entrada do admin. O operador encontra a tela pelo nome e vê primeiro o que está pendente.

**Layout**
1. Título "Admin" + subtítulo "Tudo que o ChartFM publica, corrige e mede."
2. Linha de busca: input pílula (`padding: 11px 15px`, `border-radius: 100px`, `border: 1px solid var(--divider-strong)`, `background: var(--surface)`, 14px, `flex: 1; min-width: 220px; max-width: 340px`) + chips de seção ("Tudo", "Editorial", "Vídeo", "Comunidade", "Dados", "Usuários", "Sistema"). `margin-bottom: 26px`.
3. Seção "Precisa de atenção" — só aparece com busca vazia e filtro "Tudo". Grid `repeat(4, minmax(0,1fr))`, gap 12px. Cada cartão é um `<a>`: número 30px/700/`-0.04em` na cor do tom, rótulo 13.5px/600, origem 12px `var(--text-muted)`. Borda na cor do tom.
   - `312` Pendências de dados → Edição de Dados (tom accent)
   - `48` Duplicados → Merge Center (tom warn)
   - `12` Tickets abertos → Suporte (tom warn)
   - `1` Publicação com falha → Central de Mídias (tom bad)
4. Seis seções, cada uma com cabeçalho 12px/700/`letter-spacing: 0.06em`/uppercase/`var(--text-muted)` + contagem em `var(--text-disabled)`, e grid `repeat(3, minmax(0,1fr))`, gap 12px.
5. Cartão de link: `display: flex; gap: 12px`, `padding: 15px 16px`, `border-radius: 14px`. Ícone 32×32, `border-radius: 9px`, `background: var(--accent-tint)`, letra inicial `var(--accent)` 13px/700. Nome 14px/650/`-0.01em`; dica 12.5px `var(--text-muted)`, `line-height: 1.4`, `margin-top: 3px`. Badge opcional: altura 19px, `padding: 0 8px`, `border-radius: 999px`, 10.5px/700, nas cores do tom.
   **Hover**: `border-color: var(--accent)`, transição 0.12s.
6. Busca sem resultado: "Nenhuma tela com esse nome." centralizado, `padding: 48px`, 14px `var(--text-muted)`.

**Conteúdo (verbatim)**
- Conteúdo editorial: Lançamentos (badge "semana aberta", accent) · Radar de Lançamentos · Editorial · Nostalgia · Postagens · Avisos
- Vídeo: Central de Mídias (badge "1 falha", bad) · Disk MTV · Videoparada · Lower Thirds YouTube · Gerador de Imagens
- Comunidade e jogos: Clube · Copa · Push · Parada Global
- Dados e catálogo: Edição de Dados (badge "312 pendências", accent) · Duplicados (badge "48", warn) · Merge Center · Álbuns · Artistas · Músicas · Gêneros · Playlists Last.fm · Crownnote Export
- Usuários e suporte: Usuários · Verificações pendentes (badge "7", warn) · Suporte (badge "12 abertos", warn)
- Sistema: Analytics · Logs de API · Backups

As dicas de cada cartão estão no arquivo (`GROUPS` na classe de lógica) — copiar verbatim.

---

### 2. Central de Mídias (`design/Central de Midias.dc.html`)
Rota: `app/admin/midias/page.tsx`. A versão antiga está recriada em `design/Central de Midias - atual.dc.html` para comparação.

**Purpose**: planejar, publicar e medir os posts do ChartFM nas redes.

**O que mudou em relação ao atual**
| Antes | Agora |
|---|---|
| 4 abas em pílula vermelha dentro de um cartão | 7 abas com sublinhado, no nível da página, com contadores |
| Agenda = 7 colunas de cartões de ~150px com thumb 44px | Grade semanal em janelas de 30 min, chip de 26px de altura, thumb 18px |
| Faixas de erro empilhadas dentro do cartão da agenda | Faixa única de problemas com ação "Resolver agora" |
| Sem detalhe de post | Painel lateral com preview, status por rede e retry só na rede que falhou |
| Criar = formulário cru | Duas colunas: validação do criativo, redes em grade, legenda + override por rede, preview 9:16 |

**Abas**: Visão geral · Agenda (contador 7) · Criar publicação · Publicações (contador 126) · Insights · Contas · Gerar vídeo.

**2.1 Visão geral**
- 5 tiles, grid `repeat(5, minmax(0,1fr))`, gap 12px, `border-radius: 16px`, `padding: 14px 16px`: rótulo 11px/600/uppercase/`0.04em`/`var(--text-muted)`, valor 30px/700/`-0.04em`, dica 12px `var(--text-muted)`. Hoje 4 · Esta semana 18 · Aguardando 7 · Publicados 126 · Falhas 1 (este último com borda e valor em `var(--down-fg)`).
- Faixa de problemas: `border: 1px solid var(--down-fg)`, `background: var(--down-bg)`, `border-radius: 12px`, `padding: 12px 16px`; título 13.5px/700 em `var(--down-fg)`; explicação 12.5px `var(--text-subtle)`; botão "Resolver agora" com borda e texto `var(--down-fg)` → vai para Publicações com filtro "Com erro".
- Grid `minmax(0,1fr) 320px`, gap 24px.
  - **Próximas publicações**: lista com grid `54px 40px minmax(0,1fr) auto auto`, gap 14px, `padding: 12px 20px`, linhas separadas por `1px solid var(--divider-soft)`. Hora 15px/700/`-0.02em`; capa 40×40 `border-radius: 10px` `var(--accent-tint)` com inicial `var(--accent)` 15px/700; título 14px/600 truncado; meta 12px `var(--text-muted)`; siglas de rede; status.
  - **Aside**: "Desempenho — 30 dias" (4 números 20px/700 + rótulo 12px) e "Contas" (lista com bolinha 8px de estado, rede 13.5px/600, handle 12px `var(--text-muted)`, link "Gerenciar").

**2.2 Agenda** — a mudança central.
- Barra: setas ‹ › + "Hoje" em pílula segmentada; label da semana 15px/700; à direita "Janelas de 30 min, 09–21h · clique num horário livre para criar" 12.5px `var(--text-muted)`.
- Faixa de problemas com cartões clicáveis (atrasado / falhou), cada um abrindo o painel lateral.
- Grade: `display: grid; grid-template-columns: 58px repeat(<dias>, minmax(0,1fr))`, dentro de cartão `border-radius: 18px`, `overflow: hidden`; corpo com `max-height: 620px; overflow-y: auto`.
  - Cabeçalho de dia: coluna com sigla 11px/700/uppercase/`0.06em`/`var(--text-muted)` e número 15px/700; dia de hoje com `background: var(--accent-tint)`; `border-left: 1px solid var(--divider-soft)`.
  - Uma linha por janela de 30 min. Hora só na janela cheia (`:00`), 11px `var(--text-muted)`, alinhada à direita, `padding: 5px 8px`. Linha da hora cheia usa `border-top: 1px solid var(--divider)`; a meia hora usa `var(--divider-soft)`.
  - Célula: `min-height: 26px`, `padding: 2px 4px`, `border-left: 1px solid var(--divider-soft)`, cursor pointer.
  - Célula vazia: mostra `+` 13px/700 `var(--accent)` só no hover, e no hover pinta `var(--accent-tint)`. Clique → aba "Criar publicação" com data e hora preenchidas (aparece um aviso `var(--accent-tint)` com borda accent: "21/09/2026 — 13:00 · horário vindo da agenda").
  - Chip de post: `background: var(--surface-elevated)`, `border: 1px solid var(--divider)`, `border-left: 3px solid var(--accent)` (ou `var(--text-muted)` se rascunho), `border-radius: 7px`, `padding: 3px 7px`, `cursor: grab`. Dentro: thumb 18×18 `border-radius: 6px`, título 11.5px/600 truncado, siglas das redes 10px/700 `var(--text-muted)`.
  - **Drag & drop**: `draggable` no chip; `onDragOver` previne default; `onDrop` move o post para (dia, hora) da célula. Nota sob a grade: "Arraste um post para mover de horário. Dois posts no mesmo horário são permitidos: a Central avisa, mas não bloqueia."
- **Painel lateral** (clique no chip): overlay `rgba(0,0,0,0.32)`; painel `width: 380px; max-width: 92vw`, `background: var(--surface-elevated)`, `border-left: 1px solid var(--divider)`, `box-shadow: -8px 0 28px rgba(0,0,0,0.18)`, `padding: 20px`, scroll próprio. Conteúdo: quando (11px/600/uppercase), título 20px/700/`-0.02em`, meta 13px, preview 9:16 (`max-height: 300px`, `var(--gradient-hero)`), legenda 13.5px `line-height: 1.5`, lista "Por rede" com estado por rede (publicado/agendado/erro) e botão "Tentar de novo" **só na rede com erro**, e ações: Publicar agora / Editar / Duplicar / Cancelar post.

**2.3 Criar publicação** — grid `minmax(0,1fr) 340px`, gap 28px.
- Cartão do criativo: placeholder 92×124 `border-radius: 12px` `var(--fill-inset)` com borda tracejada e rótulo "9:16"; nome do arquivo 14px/600; metadados `1080 × 1920 · 9:16 · 00:24 · 18,4 MB` 12.5px; chips de validação (verde `var(--up-bg)`/`var(--up-fg)` para "✓ Instagram Reels", "✓ YouTube Shorts", "✓ Facebook Reels"; vermelho `var(--down-bg)`/`var(--down-fg)` para "Feed recomenda 4:5"); botão "Trocar".
- "Publicar em": grid `repeat(2, minmax(0,1fr))`, gap 8px, com os **8 destinos do código**: Instagram Reels, Facebook Reels, YouTube Shorts, TikTok (manual), Instagram Feed, Instagram Story, Facebook, Threads. Cada item é um toggle: checkbox 18×18 `border-radius: 5px`, item `border-radius: 10px`, `padding: 10px 12px`; selecionado = borda `var(--accent)` + `background: var(--accent-tint)`; nota à direita 11px (`manual` para TikTok, `sugerido` para os não marcados). Pré-selecionados: Instagram Reels, Facebook, YouTube Shorts, Threads.
- Campos: Data / Hora (`step=1800`) / Categoria interna (Global 100, Charts, Lançamentos, Review, Curiosidade, Nostalgia, Disk MTV, Comunidade) em grid de 3; Música do post; Legenda geral (textarea 3 linhas, controlada — reflete no preview em tempo real); Hashtags como chips + botão tracejado "+ adicionar".
- "Personalizar por rede": link accent 13px/700 que revela três blocos (Instagram Reels, YouTube Shorts, Threads) com o texto específico de cada rede em caixa `var(--fill-inset)`.
- Ações: Agendar (primário) · Salvar rascunho (secundário) · Publicar agora (terciário).
- Aside sticky (`top: 100px`): preview 9:16 com `var(--gradient-hero)`, "Semana 38" 11px/700/uppercase e "Top 10 Global" 22px/800; abas IGr/YT/TH; sob o preview, handle `@chartfm_` 13px/700, legenda ao vivo, hashtags em `var(--accent)`; nota de contexto que muda por rede (YouTube: "No YouTube o título e a descrição substituem a legenda.").

**2.4 Publicações** — chips de filtro (Todas, Agendadas, Publicadas, Rascunhos, Com erro) + tabela com grid `44px minmax(0,1fr) 150px 190px 120px`: capa 44px, título+meta, siglas de rede coloridas pelo resultado (verde publicado, vermelho falhou, neutro pendente), números (`49,2k views · 3,3k ❤ · 227 ↗`), status. Linha abre o painel lateral.

**2.5 Insights** — 5 cartões (Alcance 152,4K +12%, Visualizações 283,1K +18%, Interações 19,8K +7%, Novos seguidores +1.284 +3%, Engajamento 7,0% −0,4%); "Performance por rede" com barras 8px `border-radius: 999px` (Instagram 48%, YouTube 31%, Facebook 14%, Threads 7%); "Melhor horário" heatmap 5 faixas × 7 dias, células 26px `border-radius: 6px`, `background: var(--accent)` com `opacity: 0.12 + v*0.78`, subtítulo explicando que é engajamento real dos posts (não seguidores online), base "96 posts, últimas 8 semanas"; "Formato e duração" com barras; "Assuntos que mais funcionam" (categorias internas, ranqueadas); "O que estamos aprendendo" com 4 frases + base analisada em 11.5px.

**2.6 Contas** — grid `repeat(2, minmax(0,1fr))`: bolinha de estado 10px (verde `var(--up-fg)` ok, âmbar warn, `var(--text-muted)` manual), rede 15px/700, `handle · status`, botão de ação (Detalhes / Reconectar / Instruções), rodapé do cartão com validade do token acima de `border-top: 1px solid var(--divider-soft)`. Instagram @chartfm_ ok · Facebook ChartFM ok · Threads @chartfm_ warn (expira em 6 dias) · YouTube ChartFM ok · TikTok @chartfm manual.

**2.7 Gerar vídeo** — mantida como aba (decisão do usuário). Grid `minmax(0,420px) minmax(0,1fr)`: formulário (Parada, Semana, Quantas músicas) + lista de gerações recentes com duração e status (Publicado / Processando / Rascunho). Texto de apoio: o resultado entra como rascunho na Central.

---

### 3. Analytics (`design/Admin - Analytics.dc.html`)
Rota: `app/admin/analytics/page.tsx`.

**Purpose**: entender audiência, o que ela lê e por onde chega.

- Header com seletor de período segmentado (7 dias / 30 dias / 90 dias / 12 meses) + "Exportar CSV".
- Abas: Visão geral · Conteúdo · Público · Aquisição · Técnico.
- **5 KPIs clicáveis** que trocam a série do gráfico (é o atalho que elimina cliques): Visitas 184,3K +9,2% · Usuários 62,1K +6,8% · Tempo médio 4m 12s +18s · Cadastros 2.847 +14,1% · Rejeição 38,4% +1,6% (delta em `var(--down-fg)`). KPI ativo ganha `border-color: var(--accent)`. Valor 28px/700/`-0.04em`, delta 12px/600 verde/vermelho.
- **Gráfico**: 30 barras, altura 200px, gap 3px. Cada barra tem uma sombra do período anterior (`var(--fill-inset)`, 88% do valor) atrás da barra atual (`var(--accent)`, `opacity: 0.55 + v/max*0.45`), `border-radius: 3px 3px 0 0`. Eixo com três marcas (19 ago / 03 set / 17 set). Título do gráfico muda com o KPI selecionado.
- Grid `minmax(0,1.35fr) minmax(0,1fr)`, gap 20px:
  - **Páginas mais vistas**: grid `minmax(0,1fr) 90px 80px 80px`; título 13.5px/600 + path em monospace 11.5px `var(--text-muted)`; Views 13px/600; Tempo 12.5px; Saída 12.5px/600 em `var(--down-fg)` acima de 40%.
  - **Origem do tráfego**: barras 7px (Busca orgânica 38%, Instagram 24%, Direto 16%, YouTube 11%, Threads 7%, Outros 4%).
  - **Retenção por semana de entrada**: coorte 5×5, células 28px `border-radius: 6px`, `var(--accent)` com opacidade proporcional, rótulo `%` 10.5px/700 (branco acima de 60%), células futuras em `var(--fill-inset)` com `opacity: 0.4`.
  - **Dispositivo**: barra empilhada 10px com gap 2px (Celular 71% accent, Desktop 24% `var(--same-fg)`, Tablet 5% `var(--text-muted)`) + legenda com bolinhas.

---

### 4. Edição de Dados (`design/Admin - Edicao de Dados.dc.html`)
Rota: `app/admin/dados/…` (hoje a tela é o principal alvo da reclamação de legibilidade e excesso de cliques).

**Purpose**: corrigir músicas, artistas e álbuns em massa, sem sair da tabela.

**Decisões de design que resolvem a dor**
1. **Edição na própria célula**: clique em qualquer célula → input inline (`border: 1px solid var(--accent)`, `border-radius: 6px`, `padding: 4px 7px`, autofocus). **Enter** salva, **Esc** cancela, **blur** salva, **Tab** segue para a próxima. Nenhum modal, nenhuma tela de detalhe.
2. **O erro aparece no campo errado**: célula problemática recebe `text-decoration: underline wavy var(--down-fg)` com `text-underline-offset: 3px` e texto em `var(--down-fg)`; campo vazio mostra a palavra "vazio" em `var(--text-disabled)`.
3. **Sugestão em um clique**: quando existe correção conhecida, a linha mostra no hover um botão `→ Bohemian Rhapsody` (`background: var(--accent-tint)`, `color: var(--accent)`, pílula 4px/10px, 11.5px/700). Um clique aplica e limpa o problema. No topo, "Aplicar N sugestões" aplica todas as visíveis.
4. **Filas por tipo de problema** em vez de uma tabela única: 5 cartões clicáveis (Todas as pendências 312 · Caixa e acentuação 104 · Campos em branco 87 · Artista duplicado 48 · Valores inválidos 31), `border-radius: 14px`, `padding: 12px 14px`, valor 24px/700, rótulo 12.5px/600; ativo com borda accent.
5. **Ações em lote**: checkbox 17×17 por linha + no cabeçalho; com seleção aparece uma barra flutuante centralizada (`position: fixed; bottom: 24px`, `border-radius: 100px`, `padding: 10px 14px`, `box-shadow: 0 8px 28px rgba(0,0,0,0.28)`): "N selecionadas" | Aplicar sugestões · Definir gênero · Unificar artista · Marcar como ok · fechar. Linha selecionada com `background: var(--accent-tint)`.
6. **Densidade alternável**: compacta (`padding: 7px 16px`) ou confortável (`13px 16px`), botão no canto direito da barra de filtros.

**Tabela**: grid `28px minmax(0,1.5fr) minmax(0,1.2fr) minmax(0,1.2fr) 58px 128px 96px minmax(0,1fr)`, gap 10px. Colunas: seleção · Título · Artista · Álbum · Ano (alinhado à direita, tabular) · ISRC (monospace 11.5px) · Gênero · Problema. Cabeçalho 10.5px/700/uppercase/`0.04em` com `background: var(--surface-elevated)`. Texto 13px, título em 600, truncamento com ellipsis em todas as células. Hover de célula: `box-shadow: inset 0 0 0 1px var(--divider-strong)`, `border-radius: 6px` (sinaliza que é editável sem poluir).

**Badge de problema**: pílula 20px, 11px/700; vermelho (`var(--down-bg)`/`var(--down-fg)`) para "inválido"/"duplicado", neutro (`var(--fill-inset)`/`var(--text-muted)`) para o resto.

**Barra de filtros**: busca ("Buscar por título, artista, ISRC ou id") + segmented Músicas/Artistas/Álbuns + contagem de linhas. Rodapé: "Mostrando N de 312 pendências" + "Carregar mais".

**Dados de exemplo** (12 linhas) e as regras de sugestão estão em `DATA` no arquivo; os problemas cobertos são: caixa do título, caixa do artista, álbum em caixa baixa, sem álbum, single sem álbum, sem ISRC, sem gênero, ano inválido (2204 → 2024), artista duplicado (Sabrina Carpender → Sabrina Carpenter).

---

### 5. Lançamentos (`design/Admin - Lancamentos.dc.html`)
Rota: `app/admin/lancamentos/page.tsx`.

**Purpose**: triagem semanal de álbuns, EPs e clipes — decidir sem abrir cada item.

- Header: navegador de semana (‹ "Semana 38 · 19 set" ›) + "Buscar lançamentos" (secundário) + "Publicar a semana" (primário).
- **Barra de progresso da semana**: cartão `padding: 14px 18px`, quatro pares número/rótulo (pendentes accent, aprovados `var(--up-fg)`, destaques `var(--text)`, recusados `var(--text-muted)`), número 22px/700; à direita a frase de estado: "Faltam N decisões para fechar a semana." ou "Semana revisada. Pode publicar."
- Filtros: chips (Pendentes · N, Aprovados, Recusados, Destaques, Tudo) + segmented Tudo/Álbuns/Clipes.
- **Linha de item**: grid `52px minmax(0,1fr) 78px 300px`, gap 14px, `padding: 13px 18px`. Capa 52×52 `border-radius: 9px` `var(--accent-tint)` com inicial accent 18px/700. Título 15px/650 + badge de tipo (`var(--fill-inset)`, 10.5px/700: Álbum/EP/Clipe) + badge "destaque" (`var(--accent)`, texto branco). Artista 13px `var(--text-subtle)`; meta 12px `var(--text-muted)` (`19 set · 17 faixas · Island`). Popularidade 12.5px tabular.
- **Ações na linha** (elimina o clique de abrir o item): Aprovar (primário pequeno, `padding: 7px 15px`) · Destacar (secundário) · Recusar (terciário), em `opacity: 0.45` que vai a 1 no hover da linha. Decidido: mostra pílula de status (Aprovado verde / Recusado neutro) + "desfazer" 12px/600. Linha recusada com `opacity: 0.55`.
- Lista vazia: "Nada nessa lista. A semana está limpa.", `padding: 44px`.

---

## Interactions & Behavior

**Central de Mídias**
- Troca de aba: estado local, sem navegação; painel lateral fecha ao trocar.
- Clique em célula vazia da agenda → aba Criar com `prefill = "DD/09/2026 — HH:MM"`, exibido como aviso accent.
- Clique em chip → painel lateral. Fecha no overlay ou no ×.
- Drag & drop: `dragstart` guarda o id; `drop` grava `{day, time}` da célula. Sem validação de conflito (por decisão: avisar, não bloquear).
- Toggle de destino no Criar; legenda controlada espelhada no preview; abas de preview trocam a nota explicativa.
- Filtro de Publicações mapeia para conjuntos de status: Agendadas → SCHEDULED; Publicadas → PUBLISHED, PARTIAL; Rascunhos → DRAFT; Com erro → FAILED, PARTIAL, OVERDUE.
- "Resolver agora" na faixa de problemas → Publicações com filtro "Com erro".

**Analytics**: KPI selecionado troca série e título do gráfico; período e abas são estado local; `title` em cada barra e célula de coorte serve de tooltip nativo.

**Edição de Dados**: um único `editing: "<id>:<campo>"` por vez + `draft`. Ao salvar, o campo sai de `bad`; se `bad` esvazia, o `issue` da linha é limpo e a sugestão desaparece. `applyFix` aplica o objeto `fix` inteiro. Seleção múltipla independente do filtro; ao trocar de fila a seleção permanece (deliberado: permite montar um lote atravessando filas).

**Lançamentos**: `setStatus(id, status, highlight?)`; "Destacar" também aprova. "desfazer" volta para `pending`. Contadores e a frase de estado recalculam na hora.

**Transições**: só `opacity`/`border-color`/`background` em 0.12s ease. Nenhuma animação de entrada.

**Estados de carregamento e erro**: os protótipos não os desenham. Ao implementar, usar os padrões já existentes no admin do codebase (skeleton/spinner do `AdminPanel`), mantendo a altura das linhas para não deslocar a tabela.

**Responsivo**: as telas foram desenhadas para desktop (o admin é usado em desktop). Os grids fixos (`repeat(5, …)`, `58px repeat(7, …)`, `minmax(0,1fr) 320px`) devem colapsar em uma coluna abaixo de ~900px; a grade da agenda deve passar a mostrar um dia por vez em telas estreitas.

## State Management
Tudo estado local de client component; nenhum estado global novo. Por tela:

- **Índice**: `query`, `group`.
- **Central de Mídias**: `tab`, `weekOffset`, `posts[]`, `panelId`, `filter`, `prefill`, `customOpen`, `previewNet`, `caption`, `selectedTargets[]`, `dragId`.
- **Analytics**: `tab`, `metric`, `range`.
- **Edição de Dados**: `data[]`, `selected[]`, `editing`, `draft`, `query`, `queue`, `entity`, `dense`.
- **Lançamentos**: `items[]`, `filter`, `kind`, `week`.

**Dados reais a ligar**: posts agendados e resultados por rede (`lib/social-media/*`), métricas de post, catálogo e fila de pendências (tabelas de músicas/artistas/álbuns), lançamentos importados, métricas de audiência. Todos os números nos arquivos são exemplos plausíveis, não dados de produção.

## Design Tokens
Do design system ChartFM (`_ds_bundle.css` / `app/globals.css`) — usar sempre `var(--*)`:

`--accent` (#FA243C) · `--accent-hover` · `--accent-tint` · `--gradient-hero` · `--shadow-hero` · `--bg` · `--bg-topbar` · `--surface` · `--surface-elevated` · `--sidebar-bg` · `--fill-subtle` · `--fill-inset` · `--text` · `--text-subtle` · `--text-muted` · `--text-disabled` · `--divider` · `--divider-soft` · `--divider-strong` · `--up-bg`/`--up-fg` · `--down-bg`/`--down-fg` · `--same-bg`/`--same-fg` · `--new-bg`/`--new-fg`.

**Única cor fora dos tokens**: o par âmbar de alerta ("warn"), usado em badges de pendência e bolinha de token expirando, porque o design system não define um tom de atenção. É dependente de tema, por contraste:
- tema escuro: texto `#F2BE6A` sobre `rgba(232,163,61,0.18)`, borda `rgba(232,163,61,0.5)`
- tema claro: texto `#7A4D00` sobre `rgba(232,163,61,0.20)`, borda `rgba(232,163,61,0.55)`

Se o codebase ganhar um token de atenção, substituir por ele.

**Escala de espaçamento**: 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 26 · 28 · 32 · 40 px.
**Raios**: 5–6 (checkbox, célula), 7 (chip da agenda), 9–10 (capa, ícone), 12 (faixa, placeholder), 14 (cartão pequeno), 16 (tabela, tile), 18 (seção), 100/999 (pílula), 50% (avatar).
**Escala de texto**: 10.5 · 11 · 11.5 · 12 · 12.5 · 13 · 13.5 · 14 · 15 · 17 · 20 · 22 · 24 · 26 · 28 · 30 · 40 · 44 px. Pesos 400/500/600/650/700/800.
**Letter-spacing**: −0.04em em títulos e números grandes, −0.02em em 15–22px, −0.01em em corpo destacado, +0.04em/+0.06em em rótulos uppercase.
**Sombras**: `0 2px 8px rgba(250,36,60,0.25)` (botão primário) · `0 8px 28px rgba(0,0,0,0.28)` (barra flutuante) · `-8px 0 28px rgba(0,0,0,0.18)` (painel lateral) · `blur(20px) saturate(160%)` (TopNav).

## Assets
Nenhuma imagem. Os elementos visuais são:
- `ChartFM.ChartFMLogo` do design system (já no codebase).
- Capas de álbum/post: placeholders com inicial sobre `var(--accent-tint)`. **Na implementação, trocar pelo componente `Cover` do design system** (`cover={{ palette, seed, imageUrl }}`) com a capa real; o `VideoClipCover` serve para thumbnails de clipe 16:9.
- Preview de post: `var(--gradient-hero)`. Trocar pelo frame real do vídeo.
- Ícones: nenhum ícone vetorial novo; estados usam bolinhas coloridas e siglas de rede (IGr, IGf, IGs, FBr, FB, YT, TH, TT). Se o codebase tiver ícones de rede, usá-los no lugar das siglas mantendo o tamanho da caixa (mín. 26×20, `border-radius: 6px`).
- Emoji ❤ e ↗ aparecem apenas dentro de strings de métrica; substituir pelos ícones do codebase.

## Files
Em `design/` (abra no navegador; precisam da pasta `design/_ds/` ao lado):

| Arquivo | Tela |
|---|---|
| `Admin - Índice.dc.html` | Índice do admin |
| `Central de Midias.dc.html` | Central de Mídias redesenhada (7 abas) |
| `Central de Midias - atual.dc.html` | Recriação fiel da Central atual, só para comparação |
| `Admin - Analytics.dc.html` | Analytics |
| `Admin - Edicao de Dados.dc.html` | Edição de Dados |
| `Admin - Lancamentos.dc.html` | Lançamentos |
| `support.js` | Runtime dos protótipos — **não portar** |
| `_ds/chartfm-.../` | Bundle do design system ChartFM (tokens + componentes) |

Cada `.dc.html` traz o markup inline no topo e, no fim, a classe de lógica com os dados de exemplo, os handlers e todos os estilos calculados (cores de status, tons, grids). Para valores exatos, ler o arquivo.

Repositório de origem e mapa de telas: `github.md` na raiz do projeto de design.

## Ainda não desenhado
As outras telas do admin seguem na fila, na mesma linguagem: Duplicados e Merge Center (tabela igual à da Edição de Dados), Suporte e Verificações pendentes, Postagens, Avisos, Editorial, Nostalgia, Radar, Disk MTV, Videoparada, Lower Thirds, Gerador de Imagens, Clube, Copa, Push, Parada Global, Álbuns, Artistas, Músicas, Gêneros, Playlists Last.fm, Crownnote Export, Usuários, Logs de API, Backups.
