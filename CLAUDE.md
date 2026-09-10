# ChartFM Mobile App

App mobile (React Native + Expo + TypeScript) do ChartFM. Consome as APIs do site (repo separado em `C:\ChartFM`, Next.js).

## Regra permanente: este app é espelho do site

O app precisa sempre acompanhar o site (`C:\ChartFM`). Sempre que o usuário pedir uma mudança de produto ou funcionalidade lá, ela deve ser implementada aqui também, sem esperar um pedido separado.

Na prática: funcionalidade nova ou alterada no site geralmente expõe uma API (`app/api/...` no repo do site) para este app consumir, e precisa de uma tela ou ajuste de tela correspondente aqui. Se algo do site não fizer sentido no app (puramente administrativo, ou específico de SEO/AdSense), deixar isso registrado em vez de simplesmente ignorar.

Ver `ChartFM Mobile App — Product & UX Specification.md` para o escopo de MVP e as telas já desenhadas.
