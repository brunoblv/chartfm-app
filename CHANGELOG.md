# Changelog

Notas de versão do ChartFM. Atualize este arquivo a cada nova versão enviada ao Google Play (uma seção por `versionName`), antes ou logo depois do `eas build`.

Formato de cada entrada: o que mudou, pensado para o texto de "Notas da versão" do Play Console (linguagem simples, focada no usuário) mais um bloco técnico para referência interna.

## [Não lançado]

### Notas da versão (Play Console)
-

### Técnico
-

---

## 1.0.1 (2026-09-04)

### Notas da versão (Play Console)
- Denúncia agora pede um motivo, inclusive abuso ou exploração sexual infantil.
- Link para os padrões de segurança infantil nas configurações.

### Técnico
- `ReportSheet` passou a exigir motivo. O de segurança infantil grava o prefixo `[child_safety]`.
- Configurações ganhou o link para `/child-safety-standards`.
- `versionName` 1.0.1. O `versionCode` sobe no EAS (`appVersionSource: remote`).

---

## 1.0.0 (2026-09-03)

### Notas da versão (Play Console)
- Correção de estabilidade: o app não abria em alguns dispositivos após a instalação.

### Técnico
- Fix: `expo-font` estava resolvendo para `57.0.2` (via `@expo/vector-icons`) em vez de `~14.0.12`, versão compatível com Expo SDK 54. Causava `NoSuchMethodError` no `FontLoaderModule` e crash no boot do app.
- Fix: `applicationId`/`namespace` do projeto Android nativo estava divergente (`com.chartfm.app`) do pacote cadastrado no Google Play (`br.com.chartfm`). Corrigido via `npx expo prebuild --clean`.
