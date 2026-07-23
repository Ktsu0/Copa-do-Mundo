# SQLite no Copa do Mundo

Este documento explica só a parte do **SQLite**: o que ele guarda, como entra no app, e qual arquivo faz o quê. Não cobre Firestore/autenticação — só o catálogo estático (times, jogos, jogadores, etc.).

## Ideia geral

O app tem dois tipos de dado bem diferentes:

- **Dado estático de referência** (times da Copa, tabela de jogos, fases de grupo, recompensas, catálogo de jogadores) — não muda por usuário, não muda em tempo real, é o mesmo para todo mundo que abre o app. **Isso vive no SQLite.**
- **Dado por usuário** (pontos, palpites, álbum coletado, pacotinhos) — vive no **Firestore**, sem relação com este documento.

Antes do SQLite, o dado estático vinha de arquivos `.json` soltos em `src/infra/`, importados direto no código (`import times from '../infra/times.json'`). Isso funcionava, mas significava reler e filtrar arrays JavaScript toda hora em vez de fazer uma consulta. A migração trocou esses imports por um banco SQLite real, empacotado dentro do app.

## O ciclo de vida do banco

```
scripts/build-sqlite-db.mjs          (roda no seu computador, ao editar dados)
        │  gera/atualiza
        ▼
assets/db/copa.db                    (arquivo binário, comitado no git)
        │  empacotado como asset no bundle do app
        ▼
src/shareds/infrastructure/sqlite/db.ts   (roda no boot do celular/emulador)
        │  copia o .db pra área gravável do dispositivo e abre a conexão
        ▼
getDbSync() → repositórios fazem SELECT
```

Ou seja: o banco **não é gerado no celular do usuário**. Ele é gerado uma vez neste repositório (por quem mexe nos dados), commitado como um arquivo binário, e cada instalação do app só copia esse arquivo pronto pra dentro de si mesma e faz `SELECT`s nele. Ninguém faz `INSERT`/`UPDATE` no SQLite em produção — é só leitura.

## Arquivo por arquivo

### 1. `scripts/build-sqlite-db.mjs` — gera o banco
Roda no seu PC com `npm run db:build`. Usa `node:sqlite` (nativo do Node, sem dependência nova) pra ler os JSONs de `src/infra/` e escrever `assets/db/copa.db`.

Importante: hoje ele é **incremental**, não um rebuild total:
- `times`, `fase_grupo`, `jogos`, `recompensas` — os JSONs-fonte desses 4 (`times_detalhes.json`, `fase_grupo.json`, `jogos.json`, `recompensas.json`) foram **deletados** depois que o banco inicial foi gerado. Essas 4 tabelas viraram um artefato permanente: o script só as repopula **se** o JSON ainda existir; senão preserva o que já está no `.db`.
- `jogadores` — continua 100% regenerável a partir de `src/infra/jogadores.json`, que ainda existe. Rodar `npm run db:build` de novo sempre que esse arquivo mudar.

Ou seja: hoje, na prática, rodar esse script só atualiza a tabela `jogadores`.

### 2. `scripts/build-sqlite-db.test.mjs` — teste do script acima
Testa `buildDatabase()` numa cópia temporária do `assets/db/copa.db` real, confirmando que a tabela `jogadores` é recriada corretamente e que as outras 4 tabelas não são mexidas. Roda com `node --test scripts/build-sqlite-db.test.mjs`.

### 3. `assets/db/copa.db` — o banco em si
Arquivo binário SQLite, comitado no git (mesma lógica de commitar imagens geradas). Embutido no bundle do app como asset estático.

**Schema (5 tabelas):**

| Tabela | O que guarda | De onde vem |
|---|---|---|
| `times` | 10 times "detalhados" (nome, confederação, títulos, escudo) | *(baked-in, sem JSON-fonte mais)* |
| `fase_grupo` | Todos os 48 times da Copa, com posição/pontos/saldo de gols por grupo | *(baked-in)* |
| `jogos` | Os 28 jogos (fase, placar, status, pênaltis) | *(baked-in)* |
| `recompensas` | As 5 recompensas do álbum (requisito, prêmio) | *(baked-in)* |
| `jogadores` | 1256 jogadores reais (nome, time, posição, código, foto) | `src/infra/jogadores.json` |

### 4. `src/shareds/infrastructure/sqlite/db.ts` — o singleton de runtime
Isso roda **dentro do app**, não no seu PC. Duas funções:

- **`initDb()`** — chamada uma vez no boot (`_layout.tsx`). Copia o `copa.db` empacotado pra pasta gravável do SQLite no dispositivo (sempre sobrescrevendo a cópia anterior, pra nunca ficar presa numa versão velha) e abre a conexão com `expo-sqlite`.
- **`getDbSync()`** — acesso síncrono usado por todo repositório que precisa consultar o banco. Lança erro se chamado antes do `initDb()` resolver.

Tem um fix específico de Android aqui: `SQLite.defaultDatabaseDirectory` devolve um path sem `file://` no Android (funciona por acidente no iOS), o que quebra o `Directory`/`File` do `expo-file-system`. O helper `toFileUri()` corrige isso.

### 5. `src/app/_layout.tsx` — onde o boot acontece
Chama `initDb()` assim que o app sobe, em paralelo com a autenticação, e **só esconde a splash screen depois que o SQLite estiver pronto** (`dbReady`). Se `initDb()` falhar, o erro só vai pro console — não trava o app pra sempre, porque cada tela já tem seu próprio loading/erro.

### 6. Helpers de consulta (uma camada fina sobre `getDbSync()`)
Em vez de todo repositório escrever SQL cru, duas tabelas mais usadas têm um helper dedicado:

- **`src/shareds/infrastructure/sqlite/jogosQueries.ts`** — `getAllJogos()`, `getJogoById(id)`.
- **`src/shareds/infrastructure/sqlite/jogadoresQueries.ts`** — `getJogadoresByTime(timeId)`, `getAllJogadores()`, `getJogadoresTotal()`.

As outras tabelas (`times`, `fase_grupo`, `recompensas`) não têm helper — os repositórios chamam `getDbSync().getAllSync(...)`/`getFirstSync(...)` direto com o SQL inline, por serem consultas mais simples/únicas.

### 7. `src/shareds/infrastructure/teams/timeHelpers.ts`
Não é "sobre" o SQLite, mas depende dele: `getTeamName(timeId)` faz `SELECT nome FROM times WHERE id = ?`. `getFlagUrl()` não usa banco nenhum (monta URL do flagcdn.com a partir do código do país).

## Quem consulta o quê

| Repositório / arquivo | Tabelas que consulta |
|---|---|
| `mockTeamRepository.ts` (lista de times) | `times`, `fase_grupo` |
| `mockTeamDetailRepository.ts` (detalhe do time) | `times`, `fase_grupo`, `jogadores` |
| `AlbumRepository.ts` (visão geral do álbum) | `fase_grupo`, `times` |
| `RewardRepository.ts` / `RewardsScreen.tsx` (recompensas) | `recompensas`, `jogadores` (só a contagem total) |
| `StickerRepository.ts` (álbum de figurinhas) | `times`, `jogadores` |
| `PacketRepository.ts` (abrir pacotinho) | `jogadores` |
| `BetRepository.ts` / `BettingRepository.ts` (apostas) | `jogos` |
| `MatchScheduleRepository.ts` (calendário/grupo) | `fase_grupo`, `jogos` |
| `HomeRepository.ts` (jogo em destaque) | `jogos` |
| `apurarPalpites.ts` (apurar pontos no boot) | `jogos` |
| `ProfileRepository.ts` (perfil) | `jogadores` (só a contagem total) |

Todos passam por `getDbSync()` (direto ou via um dos dois helpers) — nenhum repositório abre sua própria conexão.

## Coisas importantes de saber

- **É só leitura em produção.** O app nunca escreve no SQLite — só lê. Escrita de dado do usuário é sempre no Firestore.
- **O banco é fixo por versão do app.** Atualizar `jogadores.json` (ou, se algum dia voltar a existir, os outros 4 JSONs) exige rodar `npm run db:build` de novo e commitar o `.db` atualizado — não existe sincronização remota.
- **Se `initDb()` nunca resolver**, `getDbSync()` lança erro. Isso só deveria acontecer se o asset `copa.db` estiver corrompido ou o dispositivo não conseguir escrever no diretório do SQLite.
- **Testado até agora:** só `npx tsc --noEmit` (typecheck limpo) e o teste do build script. Ainda não foi testado rodando de verdade num emulador/device nesta leva de mudanças — ver `docs/superpowers/plans/2026-07-22-sqlite-integration-STATUS.md` pro estado detalhado disso.
