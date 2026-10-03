# ChartFM Fórum — briefing de UI para Claude Design

## Objetivo

Desenhar a experiência de um fórum musical dentro do ChartFM, com aparência editorial e social, integrado ao design system atual. O fórum deve aumentar recorrência e conversa entre fãs sem parecer um fórum antigo, uma lista técnica ou uma rede social genérica.

O foco da primeira versão é permitir que as pessoas descubram discussões, criem tópicos, comentem, respondam, curtam, salvem e denunciem conteúdo. Música é o eixo principal. Filmes e séries ficam agrupados em uma área secundária chamada **Tela & Cultura**.

Projetar as telas em português, nos temas claro e escuro, com versões desktop e mobile. No mobile, respeitar a linguagem visual do app React Native atual.

---

## Direção visual

- Produto: ChartFM, comunidade musical com charts, reviews, lançamentos e eventos.
- Sensação: contemporânea, editorial, energética, organizada e humana.
- Evitar: aparência de fórum dos anos 2000, excesso de caixas, tabela densa, gradientes em todos os cards, gamificação infantil e feed igual ao X/Reddit.
- Cor de destaque: `#FA243C` no tema claro e `#FF3B5C` no escuro.
- Fundo claro: `#FBFBFD`; fundo escuro: `#000000`.
- Superfície clara: `#FFFFFF`; superfície escura: `#1C1C1E`.
- Texto principal claro: `#1D1D1F`; escuro: `#F5F5F7`.
- Bordas discretas, raio entre 12 e 18 px, bastante espaço em branco e hierarquia tipográfica forte.
- Capas de álbuns, singles e thumbnails de clipes são os principais elementos visuais.
- Ícones em traço fino. Usar Lucide ou equivalente.
- Tipografia: Inter ou SF Pro. Títulos com peso 700/800 e letter-spacing levemente negativo.
- Todo elemento interativo precisa ter estado normal, hover/pressed, foco, desabilitado e loading.

### Tags de formato

Cada tópico tem uma tag principal, sempre acompanhada de ícone e rótulo. Não depender apenas da cor.

| Tag | Ícone sugerido | Uso |
|---|---|---|
| Álbum | disco/vinil | lançamento, review ou discussão sobre álbum/EP |
| Single | nota musical | faixa ou single novo |
| Clipe | play dentro de retângulo | videoclipe, performance ou visualizer |
| Notícia | jornal | notícia e atualização |
| Debate | balões de conversa | pergunta aberta ou opinião |
| Lista | lista ordenada | ranking, top, indicação ou seleção |
| Evento | calendário | premiação, festival, show ou evento ChartFM |
| Filme & Série | claquete | conteúdo de Tela & Cultura |

As tags aparecem como pílulas compactas. Tags musicais podem ganhar um pequeno quadrado com a capa ao lado quando houver uma entidade vinculada.

---

## Arquitetura da informação

### Entrada principal

Nome da área: **Fórum**.

No desktop, incluir Fórum na navegação principal do site. No mobile, Fórum entra dentro de **Descobrir**, com atalho forte na Home; não criar uma sexta aba inferior.

### Categorias

1. **Em alta** — seleção dinâmica de tópicos com atividade recente.
2. **Lançamentos** — álbuns, singles, EPs e clipes novos.
3. **Música** — artistas, gêneros, shows, charts e debates gerais.
4. **Reviews** — avaliações e conversas que podem se conectar ao CriticsFM.
5. **Eventos ChartFM** — Global 100, Copa, Push, Clube do Álbum e jogos.
6. **Tela & Cultura** — filmes, séries, documentários e cultura pop relacionada.
7. **Off-topic** — conversas livres dentro das regras.

Filtros de conteúdo dentro das categorias: Todos, Álbum, Single, Clipe, Notícia, Debate e Lista. Usar scroll horizontal no mobile.

---

## Navegação e fluxo principal

```text
Fórum
├── Início / Em alta
├── Categoria
│   └── Tópico
│       ├── Curtir
│       ├── Salvar
│       ├── Compartilhar
│       ├── Comentar
│       └── Responder comentário
├── Busca e filtros
├── Criar tópico
│   ├── Escolher categoria
│   ├── Escolher tag
│   ├── Vincular música/álbum/artista/clipe
│   └── Revisar e publicar
├── Meus tópicos
├── Salvos
└── Regras do fórum
```

---

## Tela 1 — Início do Fórum

### Desktop

Layout de três zonas:

- Conteúdo principal com largura entre 680 e 760 px.
- Sidebar direita entre 280 e 320 px.
- Container total máximo de 1180 px.

Header da página:

- Eyebrow `COMUNIDADE`.
- Título grande `Fórum`.
- Texto `Converse sobre música, lançamentos e tudo que está movimentando a comunidade.`
- Busca com placeholder `Buscar tópicos, artistas, álbuns...`.
- Botão primário `Criar tópico`.

Abaixo do header, mostrar abas horizontais: Em alta, Recentes, Seguindo e Sem respostas. Em uma segunda linha, chips de categoria com ícone.

Conteúdo principal:

1. Card hero `Assunto do momento`, com capa grande, gradiente escuro sobre a imagem, tag, título, resumo, autor, quantidade de respostas e avatares sobrepostos.
2. Lista de tópicos em cards separados por borda suave.
3. Paginação por `Carregar mais`, preservando a posição de leitura.

Sidebar:

- Card `Categorias` com contagem de tópicos ativos.
- Card `Em alta agora` com cinco links numerados.
- Card `Quem movimenta o fórum` com três usuários e métrica semanal.
- Link discreto para regras e moderação.

### Mobile

- Header compacto com `Fórum`, ícone de busca e avatar.
- Busca abre uma tela dedicada.
- Chips de categoria em carrossel horizontal.
- Card hero com proporção aproximada 16:10.
- Feed em uma coluna, sem sidebar.
- Botão flutuante circular com ícone `+` e label de acessibilidade `Criar tópico`.
- Preservar a barra inferior atual do app.

---

## Componente — Card de tópico

O card precisa comunicar assunto, contexto musical e atividade sem ficar pesado.

Estrutura:

- Linha superior: avatar 32 px, nome, handle ou selo, tempo relativo e menu de três pontos.
- Tag principal com ícone: `Álbum`, `Single`, `Clipe`, `Notícia`, `Debate` etc.
- Título com no máximo duas linhas.
- Trecho do texto com no máximo duas linhas no desktop e uma no mobile.
- Entidade vinculada opcional: mini card horizontal com capa 56 px, nome, artista, ano e tipo.
- Thumbnail opcional 120 × 90 px no desktop; no mobile, imagem abaixo do texto em largura total.
- Rodapé: respostas, curtidas, visualizações e salvar.
- Indicadores opcionais: `Fixado`, `Novo`, `Resolvido`, `Discussão quente`.

Exemplo de conteúdo:

- Tag: Álbum
- Título: `O novo álbum da Rosalía entrega tudo que prometeu?`
- Trecho: `Depois de três audições, ainda acho que a produção é mais interessante que as letras...`
- Entidade: capa + `LUX · Rosalía · 2026`
- Meta: `42 respostas · 186 curtidas · 1,8 mil visualizações`

Estados do card:

- Normal.
- Não lido, com ponto vermelho e título mais forte.
- Fixado, com selo neutro.
- Fechado, com cadeado e ações de resposta desabilitadas.
- Removido pela moderação, mantendo contexto mínimo.

---

## Tela 2 — Categoria

Header com ícone, nome, descrição e métricas. Exemplo:

- `Lançamentos`
- `Álbuns, singles, EPs e clipes que acabaram de chegar.`
- `2.481 tópicos · 38 ativos hoje`

Controles:

- Seguir/deixar de seguir categoria.
- Ordenação: Em alta, Mais recentes, Mais curtidos, Sem respostas.
- Filtros por tag.
- Período: Hoje, Esta semana, Este mês, Sempre.

Usar a mesma lista de cards do início. No desktop, a sidebar mostra regras específicas, tags populares e moderadores da categoria.

---

## Tela 3 — Detalhe do tópico

### Cabeçalho

- Breadcrumb no desktop: `Fórum / Lançamentos / Álbum`.
- Tag com ícone.
- Título grande, máximo ideal de 80 caracteres.
- Autor, avatar, tempo, edição e contagem de visualizações.
- Ações: seguir tópico, salvar, compartilhar e menu.

### Post original

- Corpo com tipografia confortável, 16 px e line-height entre 1.55 e 1.7.
- Suporte a parágrafos, listas, citações, links, imagens e spoiler.
- Card musical vinculado em destaque. Para álbum/single: capa quadrada, título, artista, data e botão contextual `Ver no ChartFM`. Para clipe: thumbnail 16:9 com play.
- Bloco de reações abaixo: curtir, responder, citar e compartilhar.
- Mostrar usuários que curtiram por avatares pequenos e texto `Ana e outras 35 pessoas`.

### Respostas

- Cabeçalho `42 respostas`, ordenação `Mais relevantes` ou `Mais recentes`.
- Comentário com avatar 36 px, nome, tempo, corpo e ações.
- Resposta a comentário com apenas um nível visual de recuo. Threads mais profundas usam `Ver 4 respostas` em vez de aumentar o recuo.
- Comentário do autor do tópico recebe selo `Autor`.
- Comentário da moderação recebe selo `Moderação`.
- Melhor resposta opcional recebe borda e selo `Resposta em destaque`.
- Composer fixo no rodapé no mobile quando o teclado não está aberto: `Escreva uma resposta...`.

### Desktop

Coluna principal de 760 px e sidebar de 280 px com tópico relacionado, participantes e regras rápidas.

### Mobile

Header com voltar, título truncado e menu. O conteúdo ocupa toda a largura. As ações principais ficam em uma barra compacta abaixo do post.

---

## Tela 4 — Criar tópico

Fluxo em uma única tela no desktop e em etapas curtas no mobile.

Campos:

1. Categoria — obrigatório.
2. Tipo do tópico/tag — obrigatório.
3. Título — obrigatório, contador de 10 a 80 caracteres.
4. Entidade musical — opcional para Debate/Notícia e recomendada para Álbum, Single e Clipe.
5. Corpo do tópico — obrigatório.
6. Imagens — até quatro.
7. Opções: permitir respostas, marcar como spoiler, receber notificações.

Regra de produto: artista, música, álbum ou clipe deve ser escolhido por busca no Spotify/banco do ChartFM, nunca por campo de texto livre.

### Seletor de entidade

- Busca com autocomplete.
- Abas: Músicas, Álbuns, Artistas e Clipes.
- Resultado com capa, título, artista, ano e badge de tipo.
- Ao selecionar, mostrar preview do card que aparecerá no tópico.

### Editor

- Toolbar enxuta: negrito, itálico, lista, citação, link, imagem e spoiler.
- Placeholder: `O que você quer conversar com a comunidade?`
- Preview opcional, principalmente no desktop.
- Rodapé com `Salvar rascunho`, `Cancelar` e botão primário `Publicar tópico`.
- Antes de publicar, mostrar aviso curto das regras, sem checkbox obrigatório.

### Estados

- Validação inline.
- Rascunho salvo automaticamente.
- Confirmação de saída quando houver alterações ainda não salvas.
- Sucesso leva ao tópico publicado.

---

## Tela 5 — Busca do fórum

- Campo de busca em destaque e histórico recente.
- Sugestões enquanto digita: tópicos, artistas, álbuns e pessoas.
- Filtros: categoria, tag, autor, período e status.
- Resultados agrupáveis por `Tópicos` e `Comentários`.
- Cada termo encontrado aparece destacado no trecho.
- Estado vazio com sugestões de termos e categorias, sem ilustração genérica.

---

## Tela 6 — Perfil no fórum

Esta é uma aba dentro do perfil já existente, chamada `Atividade`.

Seções:

- Tópicos criados.
- Respostas.
- Curtidos, visível apenas para o próprio usuário.
- Salvos, visível apenas para o próprio usuário.
- Categorias seguidas.

Resumo no topo: `24 tópicos · 318 respostas · 1,4 mil curtidas recebidas`. Evitar transformar reputação em competição agressiva.

Selos possíveis e discretos: `Membro antigo`, `Top colaborador`, `Crítico`, `Descobridor` e `Moderador`.

---

## Tela 7 — Notificações do fórum

Integrar à central de notificações já existente.

Tipos:

- Responderam seu tópico.
- Responderam seu comentário.
- Curtiram seu tópico ou comentário.
- Mencionaram você.
- Um tópico seguido recebeu novas respostas.
- A moderação tomou uma ação em seu conteúdo.

Agrupar eventos repetidos: `Bruno e outras 8 pessoas curtiram seu tópico`.

---

## Tela 8 — Denúncia e moderação

### Denúncia do usuário

Bottom sheet no mobile e modal no desktop:

- Spam ou divulgação.
- Assédio ou ataque pessoal.
- Discurso de ódio.
- Conteúdo sexual ou violento.
- Informação enganosa.
- Violação de direito autoral.
- Outro, com campo opcional.

Após o envio, mostrar confirmação e opção de bloquear o usuário.

### Ferramentas do moderador

No menu do tópico/comentário:

- Ocultar.
- Excluir.
- Fixar/desafixar.
- Fechar/reabrir.
- Mover de categoria.
- Alterar tag.
- Marcar como destaque.
- Advertir ou suspender usuário.

No desktop, criar uma tela administrativa em tabela com filtros por status, motivo, categoria e data. Não expor ferramentas administrativas no app para usuários comuns.

---

## Estados obrigatórios para prototipar

Desenhar pelo menos estes estados:

1. Feed carregado com variedade de cards.
2. Feed em loading com skeletons da mesma altura aproximada.
3. Categoria sem tópicos.
4. Erro de conexão com ação `Tentar novamente`.
5. Tópico aberto com respostas e sub-respostas.
6. Tópico fechado.
7. Criar tópico vazio.
8. Criar tópico com álbum selecionado e validação ativa.
9. Busca com resultados.
10. Busca sem resultado.
11. Denúncia aberta.
12. Tema escuro em mobile.

---

## Componentes para o arquivo de design

Criar componentes reutilizáveis com variantes:

- `ForumHeader`
- `ForumSearch`
- `CategoryChip`
- `TopicTypeTag`
- `TopicCard`
- `TopicHeroCard`
- `LinkedMusicCard`
- `TopicActions`
- `CommentCard`
- `ReplyThread`
- `CommentComposer`
- `UserMiniRow`
- `ForumEmptyState`
- `ForumSkeleton`
- `ReportSheet`
- `ForumSidebarCard`
- `ForumFilterBar`

Variantes principais: light/dark, desktop/mobile, selected/unselected, read/unread, open/closed, loading/error.

---

## Responsividade

- Breakpoint principal em torno de 900 px.
- Sidebar desaparece abaixo do breakpoint; seu conteúdo vira blocos no final do feed ou bottom sheets.
- Chips usam rolagem horizontal, nunca quebram em três linhas no mobile.
- Alvos de toque com mínimo de 44 × 44 px.
- Cards não devem ter padding lateral menor que 16 px no mobile.
- Respostas usam no máximo um nível de recuo visível.
- Editor mobile abre em tela inteira.
- Imagens respeitam proporção e nunca causam scroll horizontal.

---

## Acessibilidade e conteúdo

- Contraste AA em texto, ícones e estados de foco.
- Tags sempre têm texto e ícone; cor é apenas reforço.
- Contadores têm labels para leitor de tela.
- Conteúdo removido ou fechado explica o estado em linguagem simples.
- Curtir, salvar e seguir precisam de feedback imediato e reversível.
- Usar datas relativas no feed (`há 12 min`) e data completa no detalhe via tooltip ou menu de acessibilidade.
- Preparar os layouts para português e inglês. Textos podem crescer cerca de 35%.

---

## Conteúdo de exemplo para o protótipo

Usar dados plausíveis para que a UI pareça um produto real:

- `O novo álbum da Rosalía entrega tudo que prometeu?` — Álbum — 42 respostas.
- `Lady Gaga anuncia single novo para sexta-feira` — Notícia — 18 respostas.
- `Qual foi o melhor clipe lançado este mês?` — Clipe — 76 respostas.
- `Monte seu top 5 de discos dos anos 2000` — Lista — 103 respostas.
- `A volta das trilhas sonoras originais nas séries` — Filme & Série — 29 respostas.
- `Global 100: surpresa no topo da semana` — Evento — 51 respostas.

Usar nomes e avatares variados, tempos relativos diferentes, tópicos lidos e não lidos, um tópico fixado e um tópico fechado.

---

## Entrega esperada do Claude Design

Produzir um arquivo navegável com:

- Design system local do fórum.
- Fluxo desktop completo: início → categoria → tópico → resposta → criar tópico.
- Fluxo mobile completo: início → tópico → responder → criar tópico → denúncia.
- Temas claro e escuro para as telas principais.
- Componentes com variantes e auto layout.
- Protótipo clicável das interações centrais.
- Anotações curtas sobre comportamento responsivo e estados.

Priorizar primeiro estas cinco telas: Início do Fórum, Categoria, Detalhe do Tópico, Criar Tópico e Busca. Perfil, notificações e moderação entram como segunda rodada.
