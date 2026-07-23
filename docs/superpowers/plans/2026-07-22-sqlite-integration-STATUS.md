# Status: Integração SQLite (Planos 1 e 2) — refeita do zero neste computador

**Última atualização:** 2026-07-23. Plano 1 (schema base) refeito do zero nesta sessão porque a implementação anterior nunca foi pushada de outro computador. Na sequência, **Plano 2 também foi executado** (catálogo real de jogadores), direto — sem escrever um doc de plano formal, a pedido do usuário, que já tinha aprovado as decisões de produto via perguntas pontuais antes de eu começar.

## Onde as coisas estão

- **Branch:** `feature/sqlite-integration`, criada a partir de `main` no commit `2d8e5a9`.
- **Todos os commits estão locais neste computador.** Push para `origin` ainda **não foi feito** — não solicitado pelo usuário nesta sessão.
- **Plano 1 completo:** `docs/superpowers/plans/2026-07-22-sqlite-integration.md` (10 tarefas, todas com o código exato).
- **Plano 2:** não tem doc formal — executado diretamente após uma pesquisa de blast-radius (agente Explore) e 4 perguntas de decisão de produto respondidas pelo usuário (ver "Decisões já tomadas").
- O computador anterior (onde a primeira tentativa do Plano 1 foi feita) não foi tocado — se aqueles commits locais ainda existirem lá, são um histórico paralelo não reconciliado com este.

## Desvios encontrados em relação ao texto do Plano 1 (código-fonte, não histórico)

1. **Bug de portabilidade no script de build:** a checagem `import.meta.url === \`file://${process.argv[1]}\`` falha silenciosamente com path relativo. Corrigido com `pathToFileURL(process.argv[1]).href`.
2. **`StickerRepository.ts`** também lia `times_detalhes.json` direto (arquivo que o Plano 1 original esqueceu de listar) — migrado pra SQLite.
3. **Fix do Android `toFileUri()`** (já conhecido de uma sessão anterior) incorporado desde a primeira escrita de `db.ts`, não precisou ser redescoberto.
4. **`app.json`** — o `npx expo install` registrou os config plugins `expo-sqlite`/`expo-asset` mas isso não tinha sido commitado junto com a Tarefa 1; corrigido num commit separado (`884ba48`).

## O que o Plano 2 fez

Migrou o catálogo de jogadores/figurinhas do arquivo órfão `database.ts` (1363 registros reais, sem `overall`/`raridade`) para o SQLite, substituindo o antigo `figurinhas.json` (120 registros fictícios com `overall`/`raridade`/fotos locais falsas).

**Decisões de produto tomadas pelo usuário antes de eu escrever código** (perguntadas via 4 questões pontuais, todas resposta recomendada):
- **ESCUDO/SPECIAL** (107 das 1363 linhas — escudo de time e cartas especiais "fifa") **excluídas** do pool de jogadores. Só as 1256 linhas GOL/DEF/MEI/ATA viram figurinha colecionável.
- **Raridade/overall removidos por completo** — sem substituto visual (sem borda dourada, sem número overall no card).
- **Fotos**: trocado o pipeline de assets locais empacotados (`require`, `FIGURINHA_FOTOS`) por imagem remota (`imageUrl` do thesportsdb) com fallback de ícone (`Ionicons person`) quando ausente.
- **Label de posição**: `DEF` (que substitui a antiga distinção ZAG/LAT que não existe no dado novo) vira "Defensor".

**Mudanças técnicas:**
- `scripts/build-sqlite-db.mjs` reescrito pra ser **incremental**: `times`/`fase_grupo`/`jogos`/`recompensas` não têm mais JSON fonte (deletados no Plano 1) — viraram artefato permanente, só preservado; `jogadores` continua 100% regenerável a partir de `src/infra/jogadores.json` (extraído uma vez de `database.ts`, filtrado, com `timeId` convertido pra maiúsculo).
- Nova tabela `jogadores` (id, nome, time_id, posicao, codigo, imagem_url) + helper `src/shareds/infrastructure/sqlite/jogadoresQueries.ts`.
- `UsuarioFirestore.album_jogador` mudou de `number[]` para `string[]` (os IDs agora são `"p_bra_2"`, não mais sequenciais parseáveis via `FIG-0001`).
- Reescritos: `StickerRepository.ts`, `PacketRepository.ts` (sorteio do pacotinho continua uniforme, sem peso por raridade — isso já era assim antes), `mockTeamDetailRepository.ts` (elenco agora vem de todos os 48 times, não só os 10 curados de `times_detalhes`), `AlbumRepository.ts`/`RewardRepository.ts`/`RewardsScreen.tsx`/`ProfileRepository.ts` (total de figurinhas agora é `COUNT(*)` no SQLite em vez de `.length` no JSON).
- Deletados: `database.ts`, `src/infra/figurinhas.json`, `localDb.ts` (ficou sem nenhum export usado), `figurinhaFotos.ts`, `assets/figurinhas/*.webp` (120 arquivos, 3.8MB), e os 3 scripts que geravam esse pipeline local (`add-sticker-photos.mjs`, `download-sticker-photos.mjs`, `generate-sticker-photos-map.mjs`).

**`npx tsc --noEmit` limpo em todo o projeto** (zero erros, inclusive o antigo erro do `database.ts` sumiu junto com o arquivo). `node --test scripts/build-sqlite-db.test.mjs` passa.

## O que precisa acontecer antes de testar/mergear

1. **Copiar o arquivo `.env`** (chaves do Firebase) — não existe neste checkout, ignorado pelo git de propósito. Sem ele o app não inicializa.
2. **Nada foi testado ao vivo nesta sessão** — nem o Plano 1 nem o Plano 2. Rodar o smoke test do SQLite (Task 5 do plano 1) e depois exercitar manualmente: Home, Times, Detalhe de Time, Álbum, Álbum de Figurinhas (grid + fallback de imagem), Abertura de Pacotinho (cards revelados sem borda de raridade), Recompensas, Perfil (progresso %), Apostas, Calendário de Jogos.
3. Build nativo (`npx expo run:android`) demora ~6-8min na primeira vez. Evitar rodar de dentro de diretório com ponto no nome (bug conhecido do `react-native-nitro-modules` no Windows).

## O que falta

- [ ] Testar manualmente todas as telas (nenhuma foi clicada nesta sessão em nenhum dos dois planos).
- [ ] Revisão final da branch inteira.
- [ ] Decidir se faz `git push`, abre PR pra `main` ou faz merge direto.
- [ ] Nenhum plano adicional conhecido além destes dois.

## Decisões já tomadas (não precisa perguntar de novo)

- Raridade/overall abandonados (dataset novo não tem) — confirmado e executado.
- SQLite migra TUDO de `src/infra/*.json`, incluindo agora o catálogo de jogadores.
- `album_jogador` no Firestore é `string[]` (quebra de compatibilidade aceita, sem usuário real em produção).
- ESCUDO/SPECIAL excluídos do pool de figurinhas colecionáveis.
- Fotos de jogador vêm de URL remota com fallback de ícone; pipeline de asset local abandonado.
- Sem testes automatizados pro lado RN/native-module — verificação é manual, rodando o app de verdade.
