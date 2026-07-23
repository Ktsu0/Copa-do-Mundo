# Status: Integração SQLite (Plano 1) — continuar em outro computador

**Última atualização:** 2026-07-22, sessão interrompida a pedido do usuário durante a revisão final da branch inteira (todo o código já estava pronto e commitado).

## Onde as coisas estão

- **Branch:** `feature/sqlite-integration`, criada a partir de `main` no commit `2d8e5a9`.
- **Todos os commits estão locais.** Push para `origin` ainda **não foi feito** — bloqueado pelo classificador de permissão do Claude Code (precisa de aprovação manual do usuário; tentar `git push` de novo deve disparar um prompt de confirmação).
- **Plano completo:** `docs/superpowers/plans/2026-07-22-sqlite-integration.md` (10 tarefas, todas com o código exato).
- **Ledger de progresso (histórico detalhado de cada tarefa, decisões, desvios):** `.superpowers/sdd/progress.md` na raiz do repo — **esse arquivo é git-ignored**, não vai junto no push/clone. Se quiser preservar esse histórico, copie manualmente ou leia antes de trocar de máquina.

## O que precisa acontecer no computador novo, antes de continuar

1. **Clonar/puxar o repositório** e garantir que a branch `feature/sqlite-integration` está disponível (via `git fetch` + `git checkout feature/sqlite-integration`, depois de eu conseguir fazer o push — ou copiar o repo local se o push não tiver sido feito ainda).
2. **Copiar o arquivo `.env` manualmente** — ele é ignorado pelo git de propósito (contém as chaves do Firebase) e não vai em nenhum clone/push. Sem ele, o app quebra na inicialização (erro `auth/invalid-api-key`, spam de erros no `_layout.tsx`). Copie de `Copa-do-Mundo/.env` para a raiz do novo checkout.
3. **Rodar `npm install`** normalmente.
4. Se for testar num emulador Android: o build nativo (`npx expo run:android`) demora ~6-8 min na primeira vez (módulos nativos como `react-native-nitro-modules`/`react-native-reanimated` compilam do zero). **Evite rodar de dentro de um diretório com ponto no nome** (tipo `.worktrees/`) — encontramos um bug real do `react-native-nitro-modules` no CMake/ninja que quebra o build nesse caso no Windows. Se for usar git worktree, use um caminho curto sem ponto (ex: `C:\wt\algumacoisa`).

## O que já está pronto (commitado, revisado, testado ao vivo no emulador)

Todas as 10 tarefas do plano + 2 correções de bug encontradas durante teste manual real:

1. Dependências (`expo-sqlite`, `expo-asset`, `expo-file-system`) instaladas.
2. Script `scripts/build-sqlite-db.mjs` gera `assets/db/copa.db` a partir dos JSONs (`node:sqlite`, sem dependência nova). Rodar com `npm run db:build` sempre que os JSONs fonte mudarem.
3. Singleton `src/shareds/infrastructure/sqlite/db.ts` (`initDb()`/`getDbSync()`) — copia o `.db` empacotado pra área gravável e abre a conexão no boot.
4. `_layout.tsx` inicializa o SQLite no boot, junto com a autenticação.
5. **Tarefas 6-9:** todos os repositórios que liam `times_detalhes.json`, `fase_grupo.json`, `jogos.json`, `recompensas.json` via `import` direto agora consultam o SQLite (`timeHelpers.ts`, `localDb.ts`, `mockTeamRepository.ts`, `mockTeamDetailRepository.ts`, `AlbumRepository.ts`, `RewardRepository.ts`, `BetRepository.ts`, `BettingRepository.ts`, `MatchScheduleRepository.ts`, `HomeRepository.ts`, `apurarPalpites.ts`, e `StickerRepository.ts` — esse último foi um arquivo que o plano original esqueceu de listar, corrigido durante a Tarefa 10).
6. Os 5 arquivos JSON agora mortos (`times.json`, `times_detalhes.json`, `fase_grupo.json`, `jogos.json`, `recompensas.json`) foram deletados. `figurinhas.json` **continua existindo de propósito** — faz parte do Plano 2 (não escrito ainda).
7. **Bug real encontrado e corrigido rodando no emulador Android de verdade:** `expo-sqlite`'s `defaultDatabaseDirectory` devolve um path puro no Android (sem `file://`), o que quebra o `Directory`/`File` do `expo-file-system` ("URI is not absolute"). No iOS o path puro funciona por acaso (fallback nativo do próprio iOS). Corrigido em `db.ts` com um helper `toFileUri()`. **Esse bug só aparece rodando de verdade — nenhuma revisão de código/typecheck pega isso.**

**Verificação manual feita ao vivo no emulador (screenshots tiradas, log do dispositivo checado):** telas Home, Times, Palpite (apostas) e Álbum abrem sem nenhum erro no console, mostrando dados reais vindos do SQLite (times com títulos/grupo corretos, jogos com placar/status ao vivo corretos, progresso do álbum). `npx tsc --noEmit` limpo em todo o projeto, exceto um erro pré-existente e não relacionado em `database.ts` (arquivo solto na raiz, órfão, fora do escopo — é dado do Plano 2).

**Não testado manualmente ainda** (só revisado por código, deveria funcionar mas não foi clicado na tela): Team Detail, Match Schedule, Rewards, Bet Detail (colocar um palpite de verdade), Ranking, Small Packet.

## O que falta

- [ ] **Fazer o `git push` de `main` e `feature/sqlite-integration`** (bloqueado, precisa de aprovação manual).
- [ ] Revisão final da branch inteira (code review de arquitetura, consistência entre as 9 migrações, segurança) — estava rodando quando a sessão foi interrompida, não chegou a produzir resultado.
- [ ] Testar manualmente as telas que faltaram (lista acima).
- [ ] Decidir se abre PR pra `main` ou faz merge direto (nenhuma das duas coisas foi feita ainda — a branch está isolada, pronta pra revisão).
- [ ] **Plano 2** (não escrito): migrar o catálogo de figurinhas de `database.ts` (1363 registros, sem raridade) pro SQLite, trocar `usuario.album_jogador` no Firestore pra `string[]`, ajustar a tela de abertura de pacotinho (que hoje depende de `raridade`/`overall`, que o dataset novo não tem).

## Decisões já tomadas (não precisa perguntar de novo)

- Raridade/overall abandonados no Plano 2 (dataset novo não tem).
- SQLite migra TUDO de `src/infra/*.json`, não só figurinhas.
- `album_jogador` no Firestore vira `string[]` (ok quebrar compatibilidade, sem usuário real em produção ainda).
- Sem testes automatizados pro lado RN/native-module (não tem test runner no projeto) — verificação é manual, rodando o app de verdade.
