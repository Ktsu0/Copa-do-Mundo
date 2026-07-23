# Status: Integração SQLite (Plano 1) — refeita do zero neste computador

**Última atualização:** 2026-07-23. A sessão anterior (2026-07-22) tinha implementado tudo num outro computador, mas os commits nunca foram pushados pra `origin` — ao retomar neste computador, a branch `feature/sqlite-integration` e todo o código do SQLite simplesmente não existiam aqui (só este doc e o plano, commitados em `main` via `5f9c70b`). A pedido do usuário, **refiz as 10 tarefas do zero** neste checkout em vez de depender do outro computador.

## Onde as coisas estão

- **Branch:** `feature/sqlite-integration`, criada a partir de `main` no commit `2d8e5a9` (mesma base da tentativa anterior).
- **Todos os commits estão locais neste computador.** Push para `origin` ainda **não foi feito** — não solicitado pelo usuário nesta sessão.
- **Plano completo:** `docs/superpowers/plans/2026-07-22-sqlite-integration.md` (10 tarefas, todas com o código exato — seguido à risca, com pequenos ajustes onde a realidade divergiu do prosa do plano, listados abaixo).
- O computador anterior (onde a primeira tentativa foi feita) não foi tocado — se aqueles commits locais ainda existirem lá, são um histórico paralelo e não foram reconciliados com este.

## Desvios encontrados em relação ao texto do plano (código-fonte, não histórico)

1. **Bug de portabilidade no script de build:** a checagem `import.meta.url === \`file://${process.argv[1]}\`` em `scripts/build-sqlite-db.mjs` falha silenciosamente quando o script roda com um path relativo (ex: `node scripts/build-sqlite-db.mjs`) — `process.argv[1]` não é absoluto, mas `import.meta.url` sim. Corrigido usando `pathToFileURL(process.argv[1]).href` em vez da concatenação manual de string. Sem esse fix, `npm run db:build` roda sem erro mas não escreve nada nem imprime nada.
2. **`StickerRepository.ts`** (`src/features/album-sticker-page/infrastructure/repositories/`) — mesmo arquivo que a sessão anterior já tinha identificado como esquecido pelo plano original. Lia `times_detalhes.json` direto pra montar a lista de times do cabeçalho do álbum de figurinhas; migrado pra uma query SQLite (`SELECT id, nome FROM times`). `figurinhas.json` continua intocado (Plano 2).
3. **Fix do Android `toFileUri()`** já documentado pela sessão anterior foi incorporado desde a primeira escrita de `db.ts` nesta sessão (não precisou ser redescoberto rodando no emulador).

## O que precisa acontecer antes de testar/mergear

1. **Copiar o arquivo `.env` manualmente** — ignorado pelo git de propósito (chaves do Firebase), não existe neste checkout. Sem ele o app quebra na inicialização (`auth/invalid-api-key`). **Ainda pendente** — usuário optou por pular a verificação manual nesta sessão.
2. Depois de ter o `.env`: `npm install` já foi rodado nesta sessão, não precisa repetir a menos que `package.json` mude de novo.
3. Se for testar num emulador Android: o build nativo (`npx expo run:android`) demora ~6-8 min na primeira vez. **Evite rodar de dentro de um diretório com ponto no nome** (tipo `.worktrees/`) — bug conhecido do `react-native-nitro-modules` no CMake/ninja no Windows.

## O que já está pronto (commitado neste computador, typecheck limpo, NÃO testado ao vivo)

Todas as 10 tarefas do plano + a correção do `StickerRepository.ts`:

1. Dependências (`expo-sqlite`, `expo-asset`, `expo-file-system`) instaladas.
2. Script `scripts/build-sqlite-db.mjs` gera `assets/db/copa.db` a partir dos JSONs (`node:sqlite`, sem dependência nova; ver fix do entry-point acima). Rodar com `npm run db:build` sempre que os JSONs fonte mudarem.
3. Singleton `src/shareds/infrastructure/sqlite/db.ts` (`initDb()`/`getDbSync()`) — copia o `.db` empacotado pra área gravável e abre a conexão no boot. Já inclui o fix `toFileUri()` pro bug conhecido do Android.
4. `_layout.tsx` inicializa o SQLite no boot, junto com a autenticação.
5. **Tarefas 6-9:** todos os repositórios que liam `times_detalhes.json`, `fase_grupo.json`, `jogos.json`, `recompensas.json` via `import` direto agora consultam o SQLite (`timeHelpers.ts`, `localDb.ts`, `mockTeamRepository.ts`, `mockTeamDetailRepository.ts`, `AlbumRepository.ts`, `RewardRepository.ts`, `BetRepository.ts`, `BettingRepository.ts`, `MatchScheduleRepository.ts`, `HomeRepository.ts`, `apurarPalpites.ts`, `StickerRepository.ts`).
6. Os 5 arquivos JSON agora mortos (`times.json`, `times_detalhes.json`, `fase_grupo.json`, `jogos.json`, `recompensas.json`) foram deletados. `figurinhas.json` **continua existindo de propósito** — faz parte do Plano 2 (não escrito ainda).

**`npx tsc --noEmit` limpo em todo o projeto**, exceto o mesmo erro pré-existente e não relacionado em `database.ts` (arquivo solto na raiz, órfão, fora do escopo — é dado do Plano 2). `node --test scripts/build-sqlite-db.test.mjs` passa.

**Nada foi testado ao vivo nesta sessão** — sem `.env`, o app nem inicializa (Firebase quebra antes de chegar no SQLite). O bug do Android (`toFileUri`) foi corrigido preventivamente com base no que a sessão anterior já tinha descoberto, mas **não foi reverificado rodando de verdade neste checkout**.

## O que falta

- [ ] **Copiar o `.env`** e rodar o smoke test do Task 5 do plano (log `[sqlite smoke test] times rows: 10`) antes de confiar que a Tarefa 3/4 funcionam de verdade num device.
- [ ] Testar manualmente todas as telas (Home, Times, Detalhe de Time, Álbum, Álbum de Figurinhas, Recompensas, Apostas, Detalhe de Aposta, Calendário de Jogos) — nenhuma tela foi clicada nesta sessão.
- [ ] Revisão final da branch inteira (code review de arquitetura, consistência entre as migrações, segurança).
- [ ] Decidir se faz `git push` da branch, abre PR pra `main` ou faz merge direto.
- [ ] **Plano 2** (não escrito): migrar o catálogo de figurinhas de `database.ts` (1363 registros, sem raridade) pro SQLite, trocar `usuario.album_jogador` no Firestore pra `string[]`, ajustar a tela de abertura de pacotinho (que hoje depende de `raridade`/`overall`, que o dataset novo não tem).

## Decisões já tomadas (não precisa perguntar de novo)

- Raridade/overall abandonados no Plano 2 (dataset novo não tem).
- SQLite migra TUDO de `src/infra/*.json`, não só figurinhas.
- `album_jogador` no Firestore vira `string[]` (ok quebrar compatibilidade, sem usuário real em produção ainda).
- Sem testes automatizados pro lado RN/native-module (não tem test runner no projeto) — verificação é manual, rodando o app de verdade.
