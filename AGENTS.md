# ChartFM Mobile App

App mobile (React Native + Expo + TypeScript) do ChartFM. Consome as APIs do site (repo separado em `C:\ChartFM`, Next.js).

## Regra permanente: este app é espelho do site

O app precisa sempre acompanhar o site (`C:\ChartFM`). Sempre que o usuário pedir uma mudança de produto ou funcionalidade lá, ela deve ser implementada aqui também, sem esperar um pedido separado.

Na prática: funcionalidade nova ou alterada no site geralmente expõe uma API (`app/api/...` no repo do site) para este app consumir, e precisa de uma tela ou ajuste de tela correspondente aqui. Se algo do site não fizer sentido no app (puramente administrativo, ou específico de SEO/AdSense), deixar isso registrado em vez de simplesmente ignorar.

Ver `ChartFM Mobile App — Product & UX Specification.md` para o escopo de MVP e as telas já desenhadas.

## Regra permanente: cadastro de artista/música é sempre via busca (Spotify/banco)

Toda vez que uma feature envolver cadastro de algo que tenha artista e música (ex.: clipe, álbum), a seleção do artista/música é sempre feita por busca no Spotify/banco (autocomplete), nunca por digitação livre no admin. O padrão antigo usado em lançamentos-clipes (digitação manual) está incorreto e não deve ser replicado em novas telas, nem aqui no app nem no site (`C:\ChartFM`).

Isso é relevante principalmente para o admin do site (fora do escopo deste app mobile), mas fica registrado aqui porque é uma regra de produto que vale para qualquer tela nova que envolva cadastro de artista/música.

## Nota: organização do admin (site)

O admin do site (`C:\ChartFM`) deve seguir sempre um layout de sistema organizado (menus agrupados, tabelas em vez de listas soltas empilhadas, sem seções "soltas"). Isso é administrativo/puramente do site — não se aplica a telas do app mobile — mas fica registrado aqui pois é uma diretriz permanente de produto.
