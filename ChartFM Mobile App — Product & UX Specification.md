# ChartFM Mobile App — Product & UX Specification

## 1. Visão do projeto

Criar o aplicativo oficial do **ChartFM**, uma plataforma social para fãs de música criarem seus próprios charts, descobrirem músicas, acompanharem rankings e participarem de eventos e comunidades musicais.

O aplicativo não deve ser uma cópia do site ChartFM.

O objetivo é criar uma experiência **mobile-first, rápida, pessoal, social e recorrente**, fazendo com que o usuário tenha motivos para abrir o aplicativo várias vezes por semana.

O site continuará sendo a experiência mais completa e voltada para:

- SEO;
- descoberta via Google;
- conteúdo editorial;
- páginas públicas;
- informações detalhadas;
- funcionalidades administrativas;
- experiências complexas.

O aplicativo deve ser focado em:

- uso recorrente;
- personalização;
- comunidade;
- charts;
- rankings;
- eventos;
- notificações;
- interação rápida.

---

# 2. Stack tecnológica

## Obrigatório

A arquitetura deve facilitar o lançamento posterior para iOS.

### Mobile

**React Native + Expo + TypeScript**

Não criar versões independentes em Kotlin e Swift.

O mesmo projeto deve gerar:

- Android;
- iOS.

### Backend

O aplicativo deve consumir APIs existentes/novas do ChartFM.

O aplicativo NÃO deve acessar diretamente o banco de dados.

Arquitetura:

```text
                 ChartFM API
                     |
          +----------+----------+
          |                     |
       Website                Mobile App
       Next.js              React Native
                              + Expo
          |                     |
          +----------+----------+
                     |
                  Database
```

## Princípios

Toda funcionalidade importante do aplicativo deve ser construída sobre APIs.

Exemplo:

```text
GET /api/home
GET /api/charts
GET /api/charts/:id
GET /api/global
GET /api/discover
GET /api/events
GET /api/community
GET /api/notifications
GET /api/profile
```

O frontend mobile não deve conter regras de negócio que deveriam estar no backend.

---

# 3. Filosofia do aplicativo

O conceito principal é:

> **O site permite descobrir o ChartFM. O aplicativo permite viver o ChartFM.**

O usuário deve sentir que o app foi criado especificamente para celular.

Não transformar o website em WebView.

Não simplesmente reproduzir a navegação do website.

Não tentar colocar todas as funcionalidades do site no aplicativo.

---

# 4. Público

O público principal são pessoas que:

- gostam muito de música;
- gostam de rankings;
- gostam de criar Top 10/Top 20;
- acompanham artistas;
- gostam de descobrir músicas;
- participam de fandoms;
- gostam de competições musicais;
- gostam de compartilhar suas opiniões;
- gostam de acompanhar o que outras pessoas estão ouvindo.

O aplicativo deve conversar principalmente com usuários apaixonados por música, e não com usuários casuais.

---

# 5. Navegação principal

Utilizar uma **Bottom Tab Navigation**.

Cinco áreas principais:

```text
┌─────────────────────────────────────┐
│                                     │
│             APP CONTENT             │
│                                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Home   Discover   +   Eventos  Eu  │
│   🏠       🔥      ＋      🏆     👤 │
│                                     │
└─────────────────────────────────────┘
```

## Tabs

### 1. Home

Central personalizada do usuário.

### 2. Discover

Descoberta de música e comunidade.

### 3. +

Criar/atualizar conteúdo.

### 4. Eventos

Copa, Push, Clube do Álbum e outros eventos.

### 5. Eu

Perfil, charts, badges, estatísticas e configurações.

---

# 6. Home

A Home é a tela mais importante do aplicativo.

Ela não deve ser simplesmente um feed.

Ela deve funcionar como um **dashboard pessoal do ChartFM**.

Exemplo:

```text
Bom dia, Bruno 👋

Seu Chart
━━━━━━━━━━━━━━━━━━

Está na hora de atualizar sua parada.

[ Atualizar meu Chart ]

🔥 Em alta

3 músicas que podem interessar a você

🌎 Global 100

#1 Artist
#2 Artist
#3 Artist

🏆 Eventos

Copa do Mundo
Você ainda não votou.

💬 Comunidade

Maria comentou no seu Chart.
```

A Home deve ser personalizada de acordo com o estado do usuário.

---

# 7. Home para usuário novo

Usuários novos devem receber uma experiência diferente.

Exemplo:

```text
Bem-vindo ao ChartFM 🎵

Crie sua própria parada musical.

Escolha suas músicas favoritas,
monte seu Top 20 e descubra
como suas escolhas se comparam
com outros fãs.

[ Criar meu primeiro Chart ]

ou

[ Importar do Last.fm ]
```

A prioridade é levar o usuário para sua primeira ação.

Não sobrecarregar o novo usuário com dezenas de recursos.

---

# 8. Home para usuário ativo

Usuários recorrentes devem receber informações relevantes.

Exemplo:

```text
🎵 Seu Chart

Atualize sua parada semanal.

[ Atualizar ]

━━━━━━━━━━━━━━━━━━

🔥 Para você

Taylor Swift subiu no Global 100.

━━━━━━━━━━━━━━━━━━

🏆 Copa

Você ainda não votou nesta rodada.

[ Votar ]

━━━━━━━━━━━━━━━━━━

💬 Atividade

2 pessoas interagiram com seus charts.
```

A Home deve mudar de acordo com o comportamento do usuário.

---

# 9. Discover

O Discover deve ser uma experiência de descoberta.

Priorizar:

- charts populares;
- músicas em alta;
- artistas em alta;
- álbuns;
- usuários;
- comunidade;
- recomendações;
- novos lançamentos;
- conteúdo relevante.

Estrutura possível:

```text
🔥 Discover

[ Buscar ]

Em alta
━━━━━━━━━━━━

Charts populares
━━━━━━━━━━━━

Músicas em alta
━━━━━━━━━━━━

Álbuns
━━━━━━━━━━━━

Usuários para seguir
━━━━━━━━━━━━

Comunidade
━━━━━━━━━━━━
```

O conteúdo deve ser apresentado em cards visualmente fortes.

Música é uma experiência visual.

Utilizar:

- capas;
- fotos de artistas;
- rankings;
- badges;
- números;
- pequenas animações.

---

# 10. Criar Chart

O botão central "+" deve ser uma ação extremamente importante.

Ao tocar:

```text
Criar

🎵 Meu Chart

💿 Ranking de Álbuns

🎤 Ranking de Artistas

📥 Importar do Last.fm
```

---

# 11. Editor de Chart

A criação e edição de charts deve ser especialmente otimizada para touchscreen.

Exemplo:

```text
Meu Top 20

1  🎵 Song A       ☰
2  🎵 Song B       ☰
3  🎵 Song C       ☰
4  🎵 Song D       ☰
5  🎵 Song E       ☰
```

O usuário deve poder arrastar itens para alterar posições.

Utilizar drag-and-drop / gesture interaction adequada ao React Native.

A experiência deve ser muito mais confortável no celular do que uma tabela tradicional de desktop.

---

# 12. Importação do Last.fm

O Last.fm deve ser uma das formas mais fáceis de criar o primeiro Chart.

Fluxo:

```text
Importar do Last.fm
        ↓
Conectar conta
        ↓
Escolher período
        ↓
Últimos 7 dias
        ↓
Mostrar músicas encontradas
        ↓
Gerar Chart
        ↓
Usuário confirma
```

Exemplo:

```text
Seu Top da semana

1. Song A
2. Song B
3. Song C
...
20. Song T

[ Criar meu Chart ]
```

---

# 13. Global 100

O Global 100 deve possuir uma experiência própria no aplicativo.

Exemplo:

```text
🌎 GLOBAL 100

Semana atual

#1
Album / Song
Artist

#2
Album / Song
Artist

#3
Album / Song
Artist
```

O usuário deve conseguir:

- abrir a música;
- abrir artista;
- abrir chart;
- visualizar evolução;
- compartilhar.

Usar microanimações para entrada/alteração de posições quando apropriado.

---

# 14. Eventos

Criar uma área dedicada para eventos.

Eventos iniciais:

- Copa do Mundo de Músicas;
- Push;
- Clube do Álbum;
- outros eventos futuros.

Exemplo:

```text
🏆 EVENTOS

Copa do Mundo

Oitavas de final

[ VOTAR ]

━━━━━━━━━━━━━━━━━━

🔥 Push

Rodada 12

[ PARTICIPAR ]

━━━━━━━━━━━━━━━━━━

💿 Clube do Álbum

Álbum da semana

[ AVALIAR ]
```

O usuário deve visualizar rapidamente:

- eventos ativos;
- eventos próximos;
- eventos nos quais participou;
- resultados.

---

# 15. Sistema de votação

Votações devem ser extremamente simples no celular.

Exemplo:

```text
🏆 COPA

Qual música passa para a próxima fase?

┌─────────────────┐
│     Song A      │
│                 │
│    ARTIST A     │
└─────────────────┘

        VS

┌─────────────────┐
│     Song B      │
│                 │
│    ARTIST B     │
└─────────────────┘

[ VOTAR EM A ] [ VOTAR EM B ]
```

Depois do voto:

```text
Seu voto foi registrado! 🎵

Song A — 63%
Song B — 37%
```

---

# 16. Comunidade

O aplicativo deve possuir uma experiência social simples.

Usuários podem:

- visualizar atividade;
- comentar;
- curtir;
- seguir usuários;
- visualizar charts;
- compartilhar descobertas;
- interagir com eventos.

Não transformar imediatamente o app em uma rede social genérica.

A música deve continuar sendo o centro.

---

# 17. Perfil

A tela de perfil deve destacar identidade musical.

Exemplo:

```text
           @username

       🎵 27 Charts
       🏆 14 Badges
       🔥 82 dias

━━━━━━━━━━━━━━━━━━━━

Meu Chart

Global

Álbuns

Atividade

━━━━━━━━━━━━━━━━━━━━

🏆 Badges

🎵 Curador de Paradas
🔥 Em Chama
🔎 Descobridor
🎬 Cinéfilo do Clipe
```

---

# 18. Gamificação

O aplicativo deve incentivar retorno.

Criar elementos como:

- badges;
- níveis;
- sequência de atividade;
- progresso;
- ranking de usuários;
- conquistas.

Exemplo:

```text
🔥 SEU PROGRESSO

████████████░░░

82%

Próxima conquista:

🏆 Crítico Musical

Faltam 3 avaliações.
```

Não exagerar em gamificação.

Ela deve complementar a experiência musical.

---

# 19. Notificações Push

Push notifications são uma das principais razões para existir um aplicativo.

Criar categorias:

### Chart

> 🎵 Está na hora de atualizar seu Chart.

### Ranking

> 🌎 Seu artista subiu 8 posições no Global 100.

### Evento

> 🏆 Uma nova rodada da Copa começou.

### Comunidade

> 💬 Maria comentou no seu Chart.

### Badge

> 🏆 Você desbloqueou uma nova conquista!

### Personalização

As notificações devem ser relevantes.

Não enviar spam.

O usuário deve conseguir controlar categorias de notificações.

---

# 20. Deep Links

As notificações devem abrir diretamente a tela relevante.

Exemplo:

```text
Push:
"Seu Chart está pronto para atualizar."

↓ toque

App

↓ 

/ charts / current
```

Outro exemplo:

```text
"Começou uma nova rodada da Copa."

↓

/ events / copa / current
```

Outro:

```text
"Maria comentou no seu Chart."

↓

/ charts / 123 / comments
```

Isso deve ser planejado desde o início.

---

# 21. Compartilhamento

O aplicativo deve aproveitar as funções nativas de compartilhamento.

Exemplo:

Usuário abre seu Chart:

```text
Meu Top 20

#1 Song
#2 Song
#3 Song
...
```

Botão:

**Compartilhar**

Possibilidades:

- Instagram Stories;
- WhatsApp;
- X;
- copiar link;
- compartilhamento nativo.

Criar imagens de compartilhamento visualmente atraentes usando a identidade ChartFM.

---

# 22. Design visual

O design deve preservar a identidade atual do ChartFM, mas adaptá-la para mobile.

Prioridades:

- visual musical;
- moderno;
- jovem;
- social;
- forte uso de capas;
- hierarquia clara;
- cards;
- tipografia forte;
- números de ranking grandes;
- animações sutis.

Evitar:

- aparência de aplicativo corporativo;
- tabelas complexas;
- excesso de informações;
- excesso de cores;
- navegação profunda.

---

# 23. Dark Mode

O aplicativo deve suportar:

- Dark Mode;
- Light Mode.

Priorizar Dark Mode se isso estiver alinhado à identidade atual do ChartFM.

O sistema deve respeitar a preferência do sistema operacional.

Permitir configuração:

```text
Sistema
Claro
Escuro
```

---

# 24. Design para diferentes tamanhos

O layout não pode ser projetado apenas para um modelo específico.

Deve funcionar adequadamente em:

- celulares pequenos;
- celulares grandes;
- Android;
- iPhone;
- diferentes proporções;
- diferentes densidades de tela.

Evitar dimensões fixas.

Utilizar layouts responsivos e componentes adaptáveis.

---

# 25. Componentização

Criar uma biblioteca de componentes reutilizáveis.

Exemplos:

```text
ChartCard
SongCard
AlbumCard
ArtistCard
UserCard
RankingItem
Badge
EventCard
VoteCard
NotificationItem
ProfileHeader
BottomNavigation
SearchBar
PrimaryButton
SecondaryButton
EmptyState
LoadingState
ErrorState
```

Os componentes devem ser reutilizáveis entre telas.

---

# 26. Estados de interface

Todas as telas devem considerar:

### Loading

Skeleton/loading adequado.

### Empty

Exemplo:

> Você ainda não criou nenhum Chart.

[ Criar meu primeiro Chart ]

### Error

> Não conseguimos carregar este conteúdo.

[ Tentar novamente ]

### Offline

> Você está sem conexão.

Mostrar o máximo possível de conteúdo previamente armazenado.

---

# 27. Performance

O aplicativo deve priorizar performance.

Objetivos:

- abertura rápida;
- navegação instantânea;
- imagens otimizadas;
- listas virtualizadas;
- carregamento progressivo;
- cache;
- evitar chamadas desnecessárias à API.

Não carregar todo o conteúdo da Home de uma vez.

---

# 28. Cache e experiência offline

Algumas informações podem ser armazenadas localmente.

Exemplos:

- perfil;
- último conteúdo da Home;
- rankings recentemente visualizados;
- configurações;
- estado de navegação.

O app deve continuar apresentando uma experiência razoável quando a conexão oscilar.

Não é necessário tornar todo o ChartFM offline.

---

# 29. Autenticação

O aplicativo deve utilizar a mesma conta do ChartFM Web.

Fluxo:

```text
Login
Email / usuário
Senha

[ Entrar ]

[ Criar conta ]

[ Esqueci minha senha ]
```

Se a autenticação atual utilizar tokens, criar uma estratégia segura de token storage no dispositivo.

Não armazenar senha localmente.

---

# 30. Segurança

O aplicativo nunca deve:

- acessar diretamente o banco;
- armazenar senhas;
- expor secrets;
- expor API keys privadas;
- executar regras administrativas no cliente.

Secrets devem permanecer no backend.

---

# 31. Arquitetura sugerida

Estrutura conceitual:

```text
src/

  app/

  screens/

    Home/
    Discover/
    CreateChart/
    Events/
    Profile/

  components/

  navigation/

  services/

    api/
    auth/
    notifications/

  hooks/

  store/

  types/

  utils/

  assets/
```

A estrutura pode ser adaptada conforme a arquitetura escolhida pelo projeto, mas deve manter clara separação entre:

- UI;
- navegação;
- estado;
- API;
- autenticação;
- serviços;
- modelos.

---

# 32. Estado global

Utilizar uma solução adequada para estado global.

Evitar colocar todo o estado no componente.

Exemplos de estado global:

- usuário atual;
- autenticação;
- preferências;
- notificações;
- configurações;
- estado relevante de eventos.

Dados remotos devem possuir estratégia adequada de cache e invalidação.

---

# 33. API

Criar uma camada de API no aplicativo.

Exemplo:

```text
apiClient
  |
  +-- auth
  +-- users
  +-- charts
  +-- global
  +-- discover
  +-- events
  +-- community
  +-- notifications
  +-- lastfm
```

Não espalhar chamadas HTTP diretamente pelas telas.

---

# 34. Analytics

Instrumentar o aplicativo desde a primeira versão.

Eventos importantes:

```text
app_open
sign_up
login
chart_create_start
chart_create_complete
chart_update
lastfm_connect
lastfm_import
global_view
event_view
event_vote
community_interaction
profile_view
notification_received
notification_open
share_chart
```

A métrica mais importante não deve ser apenas instalação.

Medir:

- usuários ativos;
- retenção D1;
- retenção D7;
- retenção D30;
- charts criados;
- charts atualizados;
- participação em eventos;
- abertura de notificações.

---

# 35. Deep linking

Implementar estrutura de links capaz de abrir conteúdo específico no app.

Exemplos:

```text
chartfm://chart/123
chartfm://artist/456
chartfm://event/789
```

Também preparar links HTTPS universais/app links.

Objetivo:

```text
Link recebido
      ↓
App instalado?
      ↓
SIM → abre conteúdo no app
NÃO → abre página correspondente no website
```

Isso deve funcionar tanto no Android quanto no iOS.

---

# 36. Compartilhamento entre Web e App

URLs públicas do ChartFM devem continuar funcionando.

Exemplo:

```text
https://chartfm.com.br/chart/123
```

Se o usuário tiver o app:

→ abrir o app.

Se não tiver:

→ abrir o site.

Isso deve ser considerado desde o início.

---

# 37. MVP

A primeira versão não deve tentar conter tudo.

### MVP obrigatório

- Login;
- Cadastro;
- Home;
- Discover;
- Perfil;
- Criar Chart;
- Editar Chart;
- Importar Last.fm;
- Global 100;
- Eventos;
- notificações;
- compartilhamento;
- configurações.

---

# 38. Segunda fase

Depois do MVP:

- comunidade mais avançada;
- comentários;
- seguidores;
- feed;
- badges;
- gamificação;
- recomendações;
- estatísticas;
- notificações inteligentes.

---

# 39. Terceira fase

Possíveis recursos:

- ChartFM+;
- recursos premium;
- personalização avançada;
- estatísticas avançadas;
- temas;
- recursos exclusivos;
- experiências especiais para fandoms.

---

# 40. Monetização

Não criar monetização como prioridade da primeira versão.

Arquitetura deve permitir futuramente:

### Gratuito

- charts;
- rankings;
- comunidade;
- eventos;
- anúncios.

### ChartFM+

- sem anúncios;
- estatísticas avançadas;
- recursos especiais;
- personalização;
- badges/recursos premium.

A monetização deve ser implementada somente depois de identificar quais funcionalidades possuem valor real para os usuários.

---

# 41. Diferenças entre Web e App

## Website

Priorizar:

- SEO;
- descoberta;
- conteúdo;
- páginas públicas;
- artistas;
- músicas;
- artigos;
- páginas institucionais;
- funcionalidades completas.

## App

Priorizar:

- personalização;
- velocidade;
- recorrência;
- notificações;
- comunidade;
- criação/atualização de charts;
- eventos;
- interação.

O app não precisa reproduzir todas as páginas do website.

---

# 42. Regra de ouro de UX

Sempre perguntar:

> "Essa função precisa realmente existir no aplicativo?"

Se a resposta for não, manter no website.

O aplicativo deve ser pequeno, rápido e focado.

---

# 43. Experiência de primeira abertura

Primeira abertura:

```text
CHARTFM

Sua música.
Sua parada.
Sua comunidade.

[ Começar ]
```

Depois:

```text
Crie seu primeiro Chart

Escolha suas músicas favoritas
e monte seu Top 20.

[ Criar Chart ]

ou

[ Importar do Last.fm ]
```

O objetivo é fazer o usuário chegar à primeira experiência de valor rapidamente.

---

# 44. Objetivo principal do produto

O aplicativo deve transformar o ChartFM em um hábito.

A jornada ideal:

```text
Descobre o ChartFM
       ↓
Cria conta
       ↓
Cria primeiro Chart
       ↓
Segue usuários/artistas
       ↓
Participa de evento
       ↓
Recebe notificação
       ↓
Volta ao aplicativo
       ↓
Atualiza Chart
       ↓
Interage com comunidade
       ↓
Cria hábito semanal
```

---

# 45. Princípio final

Não construir um "site dentro de um aplicativo".

Construir um **produto mobile do ChartFM**.

O website e o aplicativo devem compartilhar:

- backend;
- banco;
- usuários;
- autenticação;
- charts;
- rankings;
- eventos;
- regras de negócio;
- APIs.

Mas devem possuir experiências de usuário diferentes.

O app deve ser:

**mais rápido + mais pessoal + mais social + mais recorrente.**

---

# 46. Ordem de desenvolvimento recomendada

### Etapa 1

Definir arquitetura mobile.

### Etapa 2

Organizar/criar APIs necessárias.

### Etapa 3

Criar design system mobile.

### Etapa 4

Implementar autenticação.

### Etapa 5

Implementar navegação.

### Etapa 6

Implementar Home.

### Etapa 7

Implementar criação/edição de Chart.

### Etapa 8

Implementar Last.fm.

### Etapa 9

Implementar Discover.

### Etapa 10

Implementar Global 100.

### Etapa 11

Implementar Eventos.

### Etapa 12

Implementar Perfil.

### Etapa 13

Implementar Push Notifications.

### Etapa 14

Implementar compartilhamento e deep links.

### Etapa 15

Analytics e testes.

### Etapa 16

Beta Android.

### Etapa 17

Correções.

### Etapa 18

Publicação Android.

### Etapa 19

Preparação/publicação iOS.

---

# 47. Instrução para o Claude Design

Ao criar os protótipos, não desenhar o aplicativo como uma réplica do website.

Criar uma experiência mobile-first.

Priorizar:

1. Home personalizada;
2. criação de Chart;
3. Discover;
4. eventos;
5. comunidade;
6. notificações;
7. perfil.

Todas as telas devem ser pensadas para toque.

Utilizar componentes consistentes.

Priorizar hierarquia visual.

Evitar excesso de informação.

Usar imagens de artistas e capas de álbuns/músicas como elementos visuais importantes.

Criar estados de loading, empty, error e offline.

Criar protótipos para:

- usuário novo;
- usuário ativo;
- usuário sem Chart;
- usuário com Chart;
- usuário participando da Copa;
- usuário recebendo notificação;
- usuário atualizando Chart;
- usuário importando do Last.fm.

O design deve ser compatível conceitualmente com uma implementação em React Native + Expo e deve evitar componentes ou interações que dependam exclusivamente de recursos específicos da web.

A experiência final deve funcionar naturalmente tanto em Android quanto em iOS.