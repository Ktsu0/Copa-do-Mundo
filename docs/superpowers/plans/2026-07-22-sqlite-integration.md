# SQLite Integration (Plan 1 of 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `expo-sqlite` into the app: a pre-generated `.db` file built from `src/infra/*.json`, bundled as an asset, opened once at app boot, and consumed by every existing repository that currently reads `times_detalhes.json`, `fase_grupo.json`, `jogos.json`, and `recompensas.json` via direct `import`.

**Architecture:** A Node build script (`scripts/build-sqlite-db.mjs`, using the built-in `node:sqlite` module — no new dev dependency) reads the JSON files and writes a real SQLite file to `assets/db/copa.db`, committed to the repo like the existing generated `figurinhaFotos.ts`/`assets/figurinhas/*.webp`. At runtime, a module-level singleton (`src/shareds/infrastructure/sqlite/db.ts`) copies that bundled asset into the app's writable SQLite directory and opens it once during boot (`src/app/_layout.tsx`), mirroring how `firebaseClient.ts` exposes `auth`/`db` as plain singletons rather than React context — this lets the existing plain-class repositories (`new XRepository()`, not hooks) keep calling a synchronous accessor (`getDbSync()`) instead of threading `useSQLiteContext()` through every call site. Because `expo-sqlite` exposes both async and sync query methods on the same connection, and the boot sequence gates splash-hide on the DB being ready, every repository swap in this plan keeps its current synchronous `.find()`/`.map()` shape — no async ripple into callers.

**Tech Stack:** `expo-sqlite` (SDK 57), `expo-asset`, `expo-file-system` (new `File`/`Directory` class API, not the deprecated function-based one), `node:sqlite` (Node ≥22.5, used only in the build script, zero new npm dependency).

## Global Constraints

- Follow `AGENTS.md`: Expo SDK 57 changed several APIs from older docs/training knowledge — this plan already reflects the current `expo-sqlite`/`expo-file-system` APIs (verified against `https://docs.expo.dev/versions/v57.0.0/` during planning); do not fall back to the old `FileSystem.documentDirectory`/`FileSystem.copyAsync` function-based API.
- The bundled database is always overwritten on every app boot (`forceOverwrite`-equivalent via manual delete+copy) — it is a read-only reference catalog rebuilt from source at every build, never something the app writes back to. User-specific data (points, collected stickers, bets) stays in Firestore, untouched by this plan.
- This is **Plan 1 of 2**. Scope here is: SQLite plumbing + migrating `times_detalhes.json`, `fase_grupo.json`, `jogos.json`, `recompensas.json`. It intentionally does **not** touch `figurinhas.json`, the `database.ts` player dataset, or `usuario.album_jogador` in Firestore — that is a separate, higher-risk plan (rarity is being dropped, the sticker catalog balloons from ~120 to ~1363 rows, and the pack-reveal UI needs adjusting). Ask for that plan separately once this one ships.
- No test runner is configured in this project (no Jest, no `"test"` script). Tasks that touch plain Node code (the build script) get real automated tests via the built-in `node:test` + `node:assert` — no new dependency. Tasks that touch React Native/`expo-sqlite` runtime code have no automated test harness available; verification is manual, via the `run` skill, against a real emulator/device — this is called out explicitly per task instead of faking a test step.
- Preserve existing behavior exactly (artificial `setTimeout` delays, field shapes, sort orders) unless a step says otherwise — this plan is a storage-layer swap, not a rewrite.

---

## File Structure

**New files:**
- `scripts/build-sqlite-db.mjs` — generates `assets/db/copa.db` from the 4 JSON files.
- `scripts/build-sqlite-db.test.mjs` — `node:test` coverage for the build script.
- `assets/db/copa.db` — generated binary artifact, committed (same convention as `assets/figurinhas/*.webp`).
- `src/shareds/infrastructure/sqlite/db.ts` — runtime singleton: `initDb()` (async, called once at boot) + `getDbSync()` (sync accessor used everywhere else).

**Modified files:**
- `package.json` — add `expo-sqlite`, `expo-asset`, `expo-file-system`; add `"db:build"` script.
- `src/app/_layout.tsx` — call `initDb()` during boot, gate splash-hide on it.
- `src/shareds/infrastructure/teams/timeHelpers.ts` — `getTeamName`/`getFlagUrl` read from SQLite instead of `times_detalhes.json`.
- `src/shareds/infrastructure/storage/localDb.ts` — drop `getJogos`/`getRecompensas`/`getFaseGrupo` (now SQLite-backed per call site), keep `getFigurinhas` (Plan 2 territory).
- `src/shareds/infrastructure/firebase/apurarPalpites.ts` — swap its local `getTeamName` + `localDb.getJogos()` for SQLite.
- `src/features/team-page/infrastructure/repositories/mockTeamRepository.ts` — swap `times_detalhes.json` + `fase_grupo.json` for SQLite.
- `src/features/team-detail-page/infrastructure/repositories/mockTeamDetailRepository.ts` — swap `times_detalhes.json` + `fase_grupo.json` for SQLite (keeps `figurinhas.json` for the squad list — Plan 2).
- `src/features/album-page/infrastructure/repositories/AlbumRepository.ts` — swap `fase_grupo.json` + `times_detalhes.json` for SQLite (keeps `figurinhas.json` — Plan 2).
- `src/features/rewards-page/infrastructure/repositories/RewardRepository.ts` — swap `localDb.getRecompensas()` for SQLite (keeps `figurinhas.json` — Plan 2).
- `src/features/upcoming-matches-page/infrastructure/repositories/BetRepository.ts` — swap `localDb.getJogos()` for SQLite.
- `src/features/betting-page/infrastructure/repositories/BettingRepository.ts` — swap `localDb.getJogos()` for SQLite.
- `src/features/match-schedule-page/infrastructure/repositories/MatchScheduleRepository.ts` — swap `localDb.getFaseGrupo()` + `localDb.getJogos()` for SQLite.
- `src/features/home-page/infrastructure/repositories/HomeRepository.ts` — swap `localDb.getJogos()` for SQLite.

**Deleted at the end (Task 10), once nothing imports them:**
- `src/infra/times.json` (already empty/unused today), `src/infra/times_detalhes.json`, `src/infra/fase_grupo.json`, `src/infra/jogos.json`, `src/infra/recompensas.json`.

---

## Task 1: Add dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `expo-sqlite`, `expo-asset`, `expo-file-system` available as imports for all later tasks.

- [ ] **Step 1: Install the packages with the Expo-aware installer (not plain npm install — it pins versions compatible with SDK 57)**

Run: `npx expo install expo-sqlite expo-asset expo-file-system`

Expected: `package.json` gains three new entries under `"dependencies"`, e.g. `"expo-sqlite": "~..."`, `"expo-asset": "~..."`, `"expo-file-system": "~..."` (exact versions chosen by the installer for SDK 57 — do not hand-pick versions).

- [ ] **Step 2: Add the DB build script alias**

In `package.json`, inside `"scripts"`, add one line after `"lint": "expo lint"`:

```json
    "lint": "expo lint",
    "db:build": "node scripts/build-sqlite-db.mjs"
```

- [ ] **Step 3: Verify install**

Run: `npx tsc --noEmit`
Expected: no new errors (nothing imports the new packages yet).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add expo-sqlite, expo-asset, expo-file-system dependencies"
```

---

## Task 2: Build script — generate `assets/db/copa.db`

**Files:**
- Create: `scripts/build-sqlite-db.mjs`
- Create: `scripts/build-sqlite-db.test.mjs`
- Create (by running the script): `assets/db/copa.db`

**Interfaces:**
- Consumes: `src/infra/times_detalhes.json`, `src/infra/fase_grupo.json`, `src/infra/jogos.json`, `src/infra/recompensas.json` (existing files, read-only).
- Produces: `assets/db/copa.db` with tables `times`, `fase_grupo`, `jogos`, `recompensas` (exact schema below) — Task 3 depends on these exact table/column names.

Schema:

```sql
CREATE TABLE times (
  id TEXT PRIMARY KEY,
  sigla TEXT NOT NULL,
  nome TEXT NOT NULL,
  confederacao TEXT NOT NULL,
  apelido TEXT,
  escudo_url TEXT,
  titulos_copa_do_mundo INTEGER NOT NULL,
  gols_fase_atual INTEGER NOT NULL,
  jogos_fase_atual INTEGER NOT NULL,
  jogadores_convocados INTEGER NOT NULL,
  conquistas_json TEXT NOT NULL
);

CREATE TABLE fase_grupo (
  time_id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  grupo TEXT NOT NULL,
  posicao_final INTEGER,
  jogos INTEGER NOT NULL,
  vitorias INTEGER NOT NULL,
  empates INTEGER NOT NULL,
  derrotas INTEGER NOT NULL,
  pontos INTEGER NOT NULL,
  gols_pro INTEGER,
  gols_contra INTEGER,
  saldo_gols INTEGER
);
CREATE INDEX idx_fase_grupo_grupo ON fase_grupo(grupo);

CREATE TABLE jogos (
  id TEXT PRIMARY KEY,
  fase TEXT NOT NULL,
  data TEXT,
  status TEXT NOT NULL,
  time_casa_id TEXT,
  time_fora_id TEXT,
  placar_casa INTEGER,
  placar_fora INTEGER,
  penaltis_casa INTEGER,
  penaltis_fora INTEGER,
  time_casa_origem_jogo_id TEXT,
  time_fora_origem_jogo_id TEXT
);
CREATE INDEX idx_jogos_fase ON jogos(fase);
CREATE INDEX idx_jogos_status ON jogos(status);

CREATE TABLE recompensas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  requisito_progresso INTEGER NOT NULL,
  premio_tipo TEXT NOT NULL,
  premio_quantidade INTEGER NOT NULL
);
```

Notes confirmed against the actual data during planning: `times_detalhes.json` has 10 rows (a curated subset, not all 48 World Cup teams — existing behavior, not something to fix here); `fase_grupo.json` has 48 rows and `posicao_final` is never null in the current data but is nullable in the type since nothing guarantees it stays that way; `jogos.json` has 28 rows and no entry has ever had a `minuto` field (so it's intentionally not a column — call sites that read `raw.minuto` keep getting `null`, matching current behavior exactly).

- [ ] **Step 1: Write the build script**

Create `scripts/build-sqlite-db.mjs`:

```js
// Gera assets/db/copa.db a partir dos JSONs estaticos em src/infra/. Roda
// com: npm run db:build (ou node scripts/build-sqlite-db.mjs)
// Precisa rodar de novo sempre que um dos JSONs fonte mudar -- o arquivo
// .db gerado fica versionado no repo, igual assets/figurinhas/*.webp.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(rootDir, 'assets', 'db');
const outPath = path.join(outDir, 'copa.db');

function readJson(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf-8'));
}

export function buildDatabase(outputPath) {
  if (existsSync(outputPath)) {
    unlinkSync(outputPath);
  }

  const db = new DatabaseSync(outputPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('BEGIN TRANSACTION;');

  db.exec(`
    CREATE TABLE times (
      id TEXT PRIMARY KEY,
      sigla TEXT NOT NULL,
      nome TEXT NOT NULL,
      confederacao TEXT NOT NULL,
      apelido TEXT,
      escudo_url TEXT,
      titulos_copa_do_mundo INTEGER NOT NULL,
      gols_fase_atual INTEGER NOT NULL,
      jogos_fase_atual INTEGER NOT NULL,
      jogadores_convocados INTEGER NOT NULL,
      conquistas_json TEXT NOT NULL
    );
    CREATE TABLE fase_grupo (
      time_id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      grupo TEXT NOT NULL,
      posicao_final INTEGER,
      jogos INTEGER NOT NULL,
      vitorias INTEGER NOT NULL,
      empates INTEGER NOT NULL,
      derrotas INTEGER NOT NULL,
      pontos INTEGER NOT NULL,
      gols_pro INTEGER,
      gols_contra INTEGER,
      saldo_gols INTEGER
    );
    CREATE INDEX idx_fase_grupo_grupo ON fase_grupo(grupo);
    CREATE TABLE jogos (
      id TEXT PRIMARY KEY,
      fase TEXT NOT NULL,
      data TEXT,
      status TEXT NOT NULL,
      time_casa_id TEXT,
      time_fora_id TEXT,
      placar_casa INTEGER,
      placar_fora INTEGER,
      penaltis_casa INTEGER,
      penaltis_fora INTEGER,
      time_casa_origem_jogo_id TEXT,
      time_fora_origem_jogo_id TEXT
    );
    CREATE INDEX idx_jogos_fase ON jogos(fase);
    CREATE INDEX idx_jogos_status ON jogos(status);
    CREATE TABLE recompensas (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      requisito_progresso INTEGER NOT NULL,
      premio_tipo TEXT NOT NULL,
      premio_quantidade INTEGER NOT NULL
    );
  `);

  const times = readJson('src/infra/times_detalhes.json');
  const insertTime = db.prepare(`
    INSERT INTO times (id, sigla, nome, confederacao, apelido, escudo_url, titulos_copa_do_mundo, gols_fase_atual, jogos_fase_atual, jogadores_convocados, conquistas_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const t of times) {
    insertTime.run(
      t.id, t.sigla, t.nome, t.confederacao, t.apelido ?? null, t.escudoUrl ?? null,
      t.titulosCopaDoMundo, t.golsFaseAtual, t.jogosFaseAtual, t.jogadoresConvocados,
      JSON.stringify(t.conquistas ?? [])
    );
  }

  const faseGrupo = readJson('src/infra/fase_grupo.json');
  const insertFaseGrupo = db.prepare(`
    INSERT INTO fase_grupo (time_id, nome, grupo, posicao_final, jogos, vitorias, empates, derrotas, pontos, gols_pro, gols_contra, saldo_gols)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const f of faseGrupo) {
    insertFaseGrupo.run(
      f.timeId, f.nome, f.grupo, f.posicaoFinal ?? null, f.jogos, f.vitorias, f.empates,
      f.derrotas, f.pontos, f.golsPro ?? null, f.golsContra ?? null, f.saldoGols ?? null
    );
  }

  const jogos = readJson('src/infra/jogos.json');
  const insertJogo = db.prepare(`
    INSERT INTO jogos (id, fase, data, status, time_casa_id, time_fora_id, placar_casa, placar_fora, penaltis_casa, penaltis_fora, time_casa_origem_jogo_id, time_fora_origem_jogo_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const j of jogos) {
    insertJogo.run(
      j.id, j.fase, j.data ?? null, j.status, j.timeCasaId ?? null, j.timeForaId ?? null,
      j.placarCasa ?? null, j.placarFora ?? null,
      j.penaltis?.casa ?? null, j.penaltis?.fora ?? null,
      j.timeCasaOrigemJogoId ?? null, j.timeForaOrigemJogoId ?? null
    );
  }

  const recompensas = readJson('src/infra/recompensas.json');
  const insertRecompensa = db.prepare(`
    INSERT INTO recompensas (id, titulo, descricao, requisito_progresso, premio_tipo, premio_quantidade)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const r of recompensas) {
    insertRecompensa.run(r.id, r.titulo, r.descricao, r.requisitoProgresso, r.premioTipo, r.premioQuantidade);
  }

  db.exec('COMMIT;');
  db.close();

  return { times: times.length, faseGrupo: faseGrupo.length, jogos: jogos.length, recompensas: recompensas.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(outDir, { recursive: true });
  const counts = buildDatabase(outPath);
  console.log(`OK: ${outPath}`);
  console.log(counts);
}
```

- [ ] **Step 2: Write the test**

Create `scripts/build-sqlite-db.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildDatabase } from './build-sqlite-db.mjs';

test('buildDatabase writes all four tables with the expected row counts', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'copa-db-test-'));
  const dbPath = path.join(dir, 'test.db');

  const counts = buildDatabase(dbPath);

  const db = new DatabaseSync(dbPath);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM times').get().n, counts.times);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM fase_grupo').get().n, counts.faseGrupo);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM jogos').get().n, counts.jogos);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM recompensas').get().n, counts.recompensas);

  const brasil = db.prepare('SELECT nome, titulos_copa_do_mundo, conquistas_json FROM times WHERE id = ?').get('BRA');
  assert.equal(brasil.nome, 'Brasil');
  assert.equal(brasil.titulos_copa_do_mundo, 5);
  assert.ok(JSON.parse(brasil.conquistas_json).length > 0);

  const jogoComPenaltis = db.prepare('SELECT penaltis_casa, penaltis_fora FROM jogos WHERE id = ?').get('R32-02');
  assert.equal(jogoComPenaltis.penaltis_casa, 3);
  assert.equal(jogoComPenaltis.penaltis_fora, 4);

  db.close();
  rmSync(dir, { recursive: true, force: true });
});
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `node --test scripts/build-sqlite-db.test.mjs`
Expected: `# pass 1`, `# fail 0`.

- [ ] **Step 4: Generate the real asset**

Run: `npm run db:build`
Expected: prints `OK: .../assets/db/copa.db` and a counts object `{ times: 10, faseGrupo: 48, jogos: 28, recompensas: 5 }`.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-sqlite-db.mjs scripts/build-sqlite-db.test.mjs assets/db/copa.db
git commit -m "feat: add SQLite build script generating assets/db/copa.db"
```

---

## Task 3: Runtime singleton — `src/shareds/infrastructure/sqlite/db.ts`

**Files:**
- Create: `src/shareds/infrastructure/sqlite/db.ts`

**Interfaces:**
- Consumes: `assets/db/copa.db` (from Task 2).
- Produces: `initDb(): Promise<void>` and `getDbSync(): SQLite.SQLiteDatabase` — every later repository task imports `getDbSync` from this exact path.

- [ ] **Step 1: Write the singleton**

Create `src/shareds/infrastructure/sqlite/db.ts`:

```ts
import { Asset } from 'expo-asset';
import { Directory, File } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'copa.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<void> | null = null;

async function copyBundledDatabase(): Promise<void> {
  const directory = new Directory(SQLite.defaultDatabaseDirectory);
  if (!directory.exists) {
    directory.create({ intermediates: true });
  }

  const targetFile = new File(directory, DATABASE_NAME);

  // O catalogo estatico e reconstruido a cada build (ver scripts/build-sqlite-db.mjs)
  // -- sempre sobrescreve a copia anterior pra nao ficar presa numa versao
  // antiga entre atualizacoes do app.
  if (targetFile.exists) {
    targetFile.delete();
  }

  const asset = Asset.fromModule(require('../../../../assets/db/copa.db'));
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error('Falha ao baixar o asset assets/db/copa.db.');
  }
  const sourceFile = new File(asset.localUri);
  await sourceFile.copy(targetFile);
}

// Chamado uma vez no boot do app (ver src/app/_layout.tsx). Copia o banco
// pre-gerado pra area gravavel do SQLite e abre a conexao, guardando o
// resultado em cache pro resto do app usar via getDbSync().
export function initDb(): Promise<void> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await copyBundledDatabase();
      dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    })();
  }
  return dbPromise;
}

// Acesso sincrono usado pelos repositorios (a maioria faz .find()/.map()
// sincronos sobre os dados estaticos hoje, dentro de metodos ja async). So
// funciona depois de initDb() ter resolvido no boot -- ver _layout.tsx, que
// so libera a splash screen depois disso.
export function getDbSync(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('SQLite ainda nao foi inicializado -- initDb() precisa resolver antes de qualquer query (ver _layout.tsx).');
  }
  return dbInstance;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If `expo-sqlite`'s `getFirstSync`/`getAllSync`/`defaultDatabaseDirectory` typings differ from what later tasks assume, this is the file to reconcile against `node_modules/expo-sqlite/build/*.d.ts` before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/shareds/infrastructure/sqlite/db.ts
git commit -m "feat: add SQLite runtime singleton (initDb/getDbSync)"
```

---

## Task 4: Wire into app boot

**Files:**
- Modify: `src/app/_layout.tsx`

**Interfaces:**
- Consumes: `initDb` from `@/shareds/infrastructure/sqlite/db` (Task 3).

- [ ] **Step 1: Read the current file to confirm no drift**

Run: `cat src/app/_layout.tsx` (or open it) — confirm it still matches the version referenced below (imports `useAuthStore`, `useAuthHeartbeat`, `apurarPalpitesPendentes`, `Stack`, `SplashScreen`).

- [ ] **Step 2: Add DB init, gated splash-hide**

Replace the full contents of `src/app/_layout.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shareds/infrastructure/http/queryClient';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { useAuthHeartbeat } from '@/shareds/presentation/hooks/useAuthHeartbeat';
import { apurarPalpitesPendentes } from '@/shareds/infrastructure/firebase/apurarPalpites';
import { initDb } from '@/shareds/infrastructure/sqlite/db';
import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const initAuth = useAuthStore((s) => s.initAuth);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Falha aqui nao trava o app pra sempre num spinner -- as telas que
    // dependem desses dados ja tem seus proprios estados de erro/loading.
    initDb()
      .catch((err) => console.error('Erro ao inicializar SQLite', err))
      .finally(() => setDbReady(true));
  }, []);

  useEffect(() => {
    if (status === 'loading' || !dbReady) return;
    SplashScreen.hideAsync();
    if (status === 'authenticated') {
      apurarPalpitesPendentes().catch((err) => console.error('Erro na apuração de palpites', err));
    }
  }, [status, dbReady]);

  useAuthHeartbeat();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="team/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="small-packet" options={{ presentation: 'modal' }} />
          <Stack.Screen name="rewards" />
          <Stack.Screen name="bet/[jogoId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="match-schedule" options={{ presentation: 'card' }} />
          <Stack.Screen name="album-sticker" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat: initialize SQLite during app boot, gate splash on it"
```

---

## Task 5: Prove the pipeline end-to-end

No file changes — this is a manual checkpoint before touching any repository, per the stated priority of proving SQLite works before migrating everything onto it.

- [ ] **Step 1: Add a temporary smoke log**

Temporarily add to `src/app/_layout.tsx`, inside the `initDb().catch(...).finally(...)` chain, right after `setDbReady(true)`:

```ts
      .finally(() => {
        setDbReady(true);
        if (__DEV__) {
          import('@/shareds/infrastructure/sqlite/db').then(({ getDbSync }) => {
            const row = getDbSync().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM times');
            console.log('[sqlite smoke test] times rows:', row?.n);
          });
        }
      });
```

- [ ] **Step 2: Run the app and check the log**

Use the `run` skill to launch the app on the Android emulator/device already used in this project (per the earlier conversation, `expo run:android` triggers a full native rebuild — expected once, since `expo-sqlite`/`expo-asset`/`expo-file-system` are new native modules).

Expected in the Metro log: `[sqlite smoke test] times rows: 10`. If it logs an error instead (asset copy failure, `defaultDatabaseDirectory` shape mismatch, etc.), fix `src/shareds/infrastructure/sqlite/db.ts` before proceeding — every later task depends on this working.

- [ ] **Step 3: Remove the temporary smoke log**

Revert the `_layout.tsx` change from Step 1 (keep only what Task 4 added).

- [ ] **Step 4: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "chore: remove SQLite smoke-test log after manual verification"
```

(If Step 1's diff never got committed, this step is a no-op — just confirm `git status` is clean before moving on.)

---

## Task 6: Migrate `timeHelpers.ts` + trim `localDb.ts`

**Files:**
- Modify: `src/shareds/infrastructure/teams/timeHelpers.ts`
- Modify: `src/shareds/infrastructure/storage/localDb.ts`

**Interfaces:**
- Consumes: `getDbSync` from `@/shareds/infrastructure/sqlite/db`.
- Produces: `getTeamName(timeId)`, `getFlagUrl(timeId, width?)` keep their exact existing signatures — every task after this one relies on that.

- [ ] **Step 1: Rewrite `timeHelpers.ts`**

Replace the full contents of `src/shareds/infrastructure/teams/timeHelpers.ts` with:

```ts
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';

const countryCodeMap: Record<string, string> = {
  ENG: 'gb-eng', WAL: 'gb-wls', KSA: 'sa', RSA: 'za', SUI: 'ch',
  CRO: 'hr', POR: 'pt', GER: 'de', JPN: 'jp', MAR: 'ma', URU: 'uy',
  KOR: 'kr', IRN: 'ir', SEN: 'sn', USA: 'us', ARG: 'ar', FRA: 'fr',
  BRA: 'br', ESP: 'es', NED: 'nl', BEL: 'be', AUS: 'au', QAT: 'qa',
  ECU: 'ec', CAN: 'ca', MEX: 'mx', TUN: 'tn', CPV: 'cv', SWE: 'se', GHA: 'gh',
};

// Monta a URL da bandeira no flagcdn.com a partir da sigla do time (ex: "BRA").
// `width` segue os tamanhos ja usados no app: 40 (grupos do album), 80
// (listas de jogo/apostas), 640 (card/detalhe de time).
export function getFlagUrl(timeId: string | null | undefined, width: 40 | 80 | 640 = 80): string {
  if (!timeId) return '';
  const cc = countryCodeMap[timeId] ?? timeId.substring(0, 2).toLowerCase();
  return `https://flagcdn.com/w${width}/${cc}.png`;
}

export function getTeamName(timeId: string | null | undefined): string {
  if (!timeId) return '???';
  const row = getDbSync().getFirstSync<{ nome: string }>('SELECT nome FROM times WHERE id = ?', [timeId]);
  return row ? row.nome : timeId;
}
```

- [ ] **Step 2: Trim `localDb.ts`**

Replace the full contents of `src/shareds/infrastructure/storage/localDb.ts` with:

```ts
import defaultFigurinhas from '../../../infra/figurinhas.json';

// Catalogo de figurinhas -- ainda nao migrou pro SQLite (ver plano de
// migracao do catalogo em docs/superpowers/plans, Plan 2). times, jogos,
// fase_grupo e recompensas agora vivem no SQLite -- ver
// src/shareds/infrastructure/sqlite/db.ts.
export const localDb = {
  getFigurinhas: () => defaultFigurinhas,
};
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors in every file still calling `localDb.getJogos()`/`getRecompensas()`/`getFaseGrupo()` — that's expected, they get fixed in Tasks 7–9. Confirm the error list matches exactly: `BetRepository.ts`, `BettingRepository.ts`, `MatchScheduleRepository.ts` (two calls), `HomeRepository.ts`, `RewardRepository.ts` (two calls), `apurarPalpites.ts`. If any other file errors, stop and investigate before continuing.

- [ ] **Step 4: Commit**

```bash
git add src/shareds/infrastructure/teams/timeHelpers.ts src/shareds/infrastructure/storage/localDb.ts
git commit -m "feat: read team names/flags from SQLite instead of times_detalhes.json"
```

(This commit intentionally leaves the repo red — `tsc` fails until Tasks 7–9 land. That's fine for a feature branch; do not merge to `main` mid-plan.)

---

## Task 7: Migrate team screens

**Files:**
- Modify: `src/features/team-page/infrastructure/repositories/mockTeamRepository.ts`
- Modify: `src/features/team-detail-page/infrastructure/repositories/mockTeamDetailRepository.ts`

**Interfaces:**
- Consumes: `getDbSync` from `@/shareds/infrastructure/sqlite/db`, `getFlagUrl` from `timeHelpers` (unchanged signature, Task 6).

- [ ] **Step 1: Rewrite `mockTeamRepository.ts`**

Replace the full contents of `src/features/team-page/infrastructure/repositories/mockTeamRepository.ts` with:

```ts
import { TimeResumo } from '../../domain/entities/TimeResumo';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';

interface TimeRow {
  id: string;
  nome: string;
  escudo_url: string | null;
  titulos_copa_do_mundo: number;
}

interface FaseGrupoRow {
  time_id: string;
  grupo: string;
}

class TeamRepository implements ITeamRepository {
  async getTeams(): Promise<TimeResumo[]> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDbSync();
        const times = db.getAllSync<TimeRow>('SELECT id, nome, escudo_url, titulos_copa_do_mundo FROM times');
        const faseGrupo = db.getAllSync<FaseGrupoRow>('SELECT time_id, grupo FROM fase_grupo');
        const grupoPorTime = new Map(faseGrupo.map((f) => [f.time_id, f.grupo]));

        const teams = times.map((t) => {
          let subtitulo = `${t.titulos_copa_do_mundo} TÍTULO${t.titulos_copa_do_mundo !== 1 ? 'S' : ''}`;
          if (t.id === 'ARG') {
            subtitulo = 'ATUAL CAMPEÃO';
          }

          const grupo = grupoPorTime.get(t.id);

          return {
            id: t.id.toLowerCase(),
            nome: t.nome,
            grupo: grupo ? `Grupo ${grupo}` : 'Grupo ?',
            subtitulo,
            bandeiraUrl: t.escudo_url || getFlagUrl(t.id, 640),
            isFavorito: t.id === 'BRA',
          };
        });

        resolve(teams);
      }, 500);
    });
  }
}

export const mockTeamRepository = new TeamRepository();
```

- [ ] **Step 2: Rewrite `mockTeamDetailRepository.ts`**

Replace the full contents of `src/features/team-detail-page/infrastructure/repositories/mockTeamDetailRepository.ts` with:

```ts
import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { ITeamDetailRepository } from '../../domain/repositories/ITeamDetailRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import figurinhasData from '../../../../infra/figurinhas.json';

interface TimeRow {
  id: string;
  nome: string;
  confederacao: string;
  escudo_url: string | null;
  titulos_copa_do_mundo: number;
  jogadores_convocados: number;
}

interface FaseGrupoRow {
  grupo: string;
}

class TeamDetailRepository implements ITeamDetailRepository {
  async getTeamDetail(id: string): Promise<TimeDetalhe | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const upperId = id.toUpperCase();
        const db = getDbSync();
        const teamData = db.getFirstSync<TimeRow>(
          'SELECT id, nome, confederacao, escudo_url, titulos_copa_do_mundo, jogadores_convocados FROM times WHERE id = ?',
          [upperId]
        );

        if (!teamData) {
          resolve(null);
          return;
        }

        const fase = db.getFirstSync<FaseGrupoRow>('SELECT grupo FROM fase_grupo WHERE time_id = ?', [upperId]);

        const bandeiraUrl = teamData.escudo_url || getFlagUrl(upperId, 640);

        let titulosInfo = `${teamData.titulos_copa_do_mundo} Títulos Mundiais`;
        if (teamData.titulos_copa_do_mundo === 1) titulosInfo = `1 Título Mundial`;

        const elenco = figurinhasData
          .filter(f => f.timeId === upperId)
          .map((f, index) => ({
            id: f.id,
            nome: f.jogadorNome,
            posicao: f.posicao === 'GOL' ? 'Goleiro' : f.posicao === 'ZAG' ? 'Zagueiro' : f.posicao === 'LAT' ? 'Lateral' : f.posicao === 'MEI' ? 'Meio-Campo' : 'Atacante',
            numero: String(index + 1).padStart(2, '0'),
            fotoUrl: `https://i.pravatar.cc/150?u=${f.id}`,
          }));

        const detail: TimeDetalhe = {
          id: id.toLowerCase(),
          nome: teamData.nome,
          bandeiraUrl,
          titulosInfo,
          federacao: teamData.confederacao,
          isFavorito: upperId === 'BRA',
          estatisticas: {
            jogadores: teamData.jogadores_convocados,
            rankingFifa: 'N/A', // Mocking FIFA ranking as N/A since it's not in the JSON
            grupo: fase ? `Grupo ${fase.grupo}` : 'N/A',
          },
          elenco,
        };

        resolve(detail);
      }, 500);
    });
  }
}

export const mockTeamDetailRepository = new TeamDetailRepository();
```

(`figurinhasData`/`elenco` deliberately untouched — Plan 2 territory.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: these two files no longer error; the remaining errors are exactly the ones listed in Task 6 Step 3 minus nothing (this task doesn't touch any of those files).

- [ ] **Step 4: Manual verification**

Use the `run` skill: open the Teams tab, confirm the list still shows 10 teams with correct group/flag/subtitle; tap into a team detail screen, confirm titles/stats/squad still render.

- [ ] **Step 5: Commit**

```bash
git add src/features/team-page/infrastructure/repositories/mockTeamRepository.ts src/features/team-detail-page/infrastructure/repositories/mockTeamDetailRepository.ts
git commit -m "feat: read team list/detail from SQLite instead of times_detalhes.json"
```

---

## Task 8: Migrate Album + Rewards repositories

**Files:**
- Modify: `src/features/album-page/infrastructure/repositories/AlbumRepository.ts`
- Modify: `src/features/rewards-page/infrastructure/repositories/RewardRepository.ts`

- [ ] **Step 1: Rewrite `AlbumRepository.ts`**

Replace the full contents of `src/features/album-page/infrastructure/repositories/AlbumRepository.ts` with:

```ts
import { AlbumOverview } from '../../domain/entities/Album';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import figurinhasData from '../../../../infra/figurinhas.json';

interface FaseGrupoRow {
  time_id: string;
  nome: string;
  grupo: string;
}

interface TimeRow {
  id: string;
  escudo_url: string | null;
}

export class AlbumRepository {
  async getAlbumOverview(): Promise<AlbumOverview> {
    const usuario = await UsuarioRepository.getUsuario();
    const albumJogador = usuario?.album_jogador ?? [];
    const total = figurinhasData.length;
    const progress = {
      collected: albumJogador.length,
      total,
      percentage: total > 0 ? parseFloat(((albumJogador.length / total) * 100).toFixed(1)) : 0,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDbSync();
        const faseGrupos = db.getAllSync<FaseGrupoRow>('SELECT time_id, nome, grupo FROM fase_grupo');
        const times = db.getAllSync<TimeRow>('SELECT id, escudo_url FROM times');
        const escudoPorTime = new Map(times.map((t) => [t.id, t.escudo_url]));

        // Group teams by their group
        const groupsMap = new Map<string, any[]>();
        faseGrupos.forEach((teamFase) => {
          if (!groupsMap.has(teamFase.grupo)) {
            groupsMap.set(teamFase.grupo, []);
          }

          groupsMap.get(teamFase.grupo)!.push({
            id: teamFase.time_id,
            name: teamFase.nome,
            flagUrl: escudoPorTime.get(teamFase.time_id) || getFlagUrl(teamFase.time_id, 40),
          });
        });

        const groups = Array.from(groupsMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([groupId, teams]) => ({
            id: groupId,
            name: `Grupo ${groupId}`,
            teams: teams,
          }));

        resolve({
          progress,
          groups,
        });
      }, 500);
    });
  }
}
```

- [ ] **Step 2: Rewrite `RewardRepository.ts`**

Replace the full contents of `src/features/rewards-page/infrastructure/repositories/RewardRepository.ts` with:

```ts
import { IRewardRepository } from '../../domain/repositories/IRewardRepository';
import { Reward } from '../../domain/entities/Reward';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import { UsuarioRepository, UsuarioFirestore } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import figurinhasData from '../../../../infra/figurinhas.json';

interface RecompensaRow {
  id: string;
  titulo: string;
  descricao: string;
  requisito_progresso: number;
  premio_tipo: string;
  premio_quantidade: number;
}

function recompensaNumero(id: string): number {
  return parseInt(id.split('-')[1], 10);
}

function calcularProgresso(usuario: UsuarioFirestore | null): number {
  const total = figurinhasData.length;
  const collected = usuario?.album_jogador?.length ?? 0;
  return total > 0 ? parseFloat(((collected / total) * 100).toFixed(1)) : 0;
}

function getRecompensas(): RecompensaRow[] {
  return getDbSync().getAllSync<RecompensaRow>('SELECT id, titulo, descricao, requisito_progresso, premio_tipo, premio_quantidade FROM recompensas');
}

export class RewardRepository implements IRewardRepository {
  async getRewards(): Promise<Reward[]> {
    const usuario = await UsuarioRepository.getUsuario();
    const progress = calcularProgresso(usuario);
    const conquistas = new Set(usuario?.conquistas ?? []);
    const rewards = getRecompensas();

    return rewards.map((r) => {
      const resgatado = conquistas.has(recompensaNumero(r.id));
      return {
        id: r.id,
        titulo: r.titulo,
        descricao: r.descricao,
        requisitoProgresso: r.requisito_progresso,
        // r.premio_tipo vem do SQLite como `string` -- o dominio exige o
        // union literal 'pacotes' | 'pontos'. O JSON original nao garantia
        // isso em tempo de compilacao (era lido como `any`); aqui e explicito.
        premioTipo: r.premio_tipo as Reward['premioTipo'],
        premioQuantidade: r.premio_quantidade,
        resgatado,
        resgatavel: progress >= r.requisito_progresso && !resgatado,
      };
    });
  }

  async claimReward(id: string): Promise<boolean> {
    const rewards = getRecompensas();
    const reward = rewards.find((r) => r.id === id);
    if (!reward) return false;

    const usuario = await UsuarioRepository.getUsuario();
    if (!usuario) return false;

    const numero = recompensaNumero(id);
    const conquistas = usuario.conquistas ?? [];
    if (conquistas.includes(numero)) return false;

    const progress = calcularProgresso(usuario);
    if (progress < reward.requisito_progresso) return false;

    const updates: Partial<UsuarioFirestore> = { conquistas: [...conquistas, numero] };

    if (reward.premio_tipo === 'pacotes') {
      updates.qtd_pacotes = (usuario.qtd_pacotes ?? 0) + reward.premio_quantidade;
    } else if (reward.premio_tipo === 'pontos') {
      updates.pontos = (usuario.pontos ?? 0) + reward.premio_quantidade;
    }

    await UsuarioRepository.updateUsuario(updates);
    return true;
  }
}
```

- [ ] **Step 3: Check the `Reward` domain entity matches the object shape returned above**

Run: `grep -n "interface Reward" -A 12 src/features/rewards-page/domain/entities/Reward.ts` (or open the file). Confirm the fields `titulo`, `descricao`, `requisitoProgresso`, `premioTipo`, `premioQuantidade`, `resgatado`, `resgatavel`, `id` all exist with matching types to what `getRewards()` now returns explicitly (the old code spread `...r` directly from the JSON's camelCase shape; this version builds the object by hand since the SQLite row is snake_case — same field names as before on the `Reward` side, only the source column names changed).

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: these two files no longer error.

- [ ] **Step 5: Manual verification**

Use the `run` skill: open the Album tab (group list + progress %), and the Rewards screen (list, claim a reward if one is claimable in current seed data). Confirm both match pre-migration behavior.

- [ ] **Step 6: Commit**

```bash
git add src/features/album-page/infrastructure/repositories/AlbumRepository.ts src/features/rewards-page/infrastructure/repositories/RewardRepository.ts
git commit -m "feat: read fase_grupo/recompensas from SQLite in Album and Rewards"
```

---

## Task 9: Migrate match/betting/home repositories + `apurarPalpites`

**Files:**
- Modify: `src/features/upcoming-matches-page/infrastructure/repositories/BetRepository.ts`
- Modify: `src/features/betting-page/infrastructure/repositories/BettingRepository.ts`
- Modify: `src/features/match-schedule-page/infrastructure/repositories/MatchScheduleRepository.ts`
- Modify: `src/features/match-schedule-page/domain/entities/GroupSchedule.ts`
- Modify: `src/features/home-page/infrastructure/repositories/HomeRepository.ts`
- Modify: `src/shareds/infrastructure/firebase/apurarPalpites.ts`

- [ ] **Step 0: Widen `Standing`'s nullable fields**

The current `fase_grupo.json` data genuinely has `null` for `golsPro`/`golsContra`/`saldoGols` on teams (e.g. group winners before those stats are known) — this was always possible at runtime but silently passed through untyped `any` in the pre-SQLite code. Typing the SQLite row properly (Step 4 below) surfaces the mismatch, so fix the domain type first.

In `src/features/match-schedule-page/domain/entities/GroupSchedule.ts`, replace:
```ts
export interface Standing {
  posicao: number;
  timeId: string;
  nome: string;
  bandeira: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
}
```
with:
```ts
export interface Standing {
  posicao: number;
  timeId: string;
  nome: string;
  bandeira: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number | null;
  golsContra: number | null;
  saldoGols: number | null;
}
```

`GroupStandingsTable.tsx` only renders `s.saldoGols` inside a bare `<Text>` — React Native already rendered `null` there as an empty cell before this plan (the JSON value flowed through untyped), so this is a type correction, not a behavior change.

- [ ] **Step 1: Add a shared `jogos` row/query helper**

These five files all read the same `jogos` table shape. Rather than repeat the row interface five times, create one shared helper.

Create `src/shareds/infrastructure/sqlite/jogosQueries.ts`:

```ts
import { getDbSync } from './db';

export interface JogoRow {
  id: string;
  fase: string;
  data: string | null;
  status: string;
  time_casa_id: string | null;
  time_fora_id: string | null;
  placar_casa: number | null;
  placar_fora: number | null;
  penaltis_casa: number | null;
  penaltis_fora: number | null;
  time_casa_origem_jogo_id: string | null;
  time_fora_origem_jogo_id: string | null;
}

export function getAllJogos(): JogoRow[] {
  return getDbSync().getAllSync<JogoRow>('SELECT * FROM jogos');
}

export function getJogoById(id: string): JogoRow | null {
  return getDbSync().getFirstSync<JogoRow>('SELECT * FROM jogos WHERE id = ?', [id]);
}
```

- [ ] **Step 2: Rewrite `BetRepository.ts`**

In `src/features/upcoming-matches-page/infrastructure/repositories/BetRepository.ts`, replace the import line and the two functions that use `localDb.getJogos()`:

Replace:
```ts
import { IBetRepository } from '../../domain/repositories/IBetRepository';
import { Bet, BetChoice, MatchDetail } from '../../domain/entities/Bet';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { PalpiteFirestore, UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

export class BetRepository implements IBetRepository {
  async getMatchForBet(jogoId: string): Promise<MatchDetail | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const jogos = localDb.getJogos() as any[];
        const jogo = jogos.find((j: any) => j.id === jogoId);
        if (!jogo || !jogo.timeCasaId || !jogo.timeForaId) {
          resolve(null);
          return;
        }
        resolve({
          id: jogo.id,
          fase: jogo.fase,
          data: jogo.data,
          status: jogo.status,
          timeCasaId: jogo.timeCasaId,
          timeForaId: jogo.timeForaId,
          timeCasaNome: getTeamName(jogo.timeCasaId),
          timeForaNome: getTeamName(jogo.timeForaId),
          timeCasaFlagUrl: getFlagUrl(jogo.timeCasaId),
          timeForaFlagUrl: getFlagUrl(jogo.timeForaId),
          placarCasa: jogo.placarCasa,
          placarFora: jogo.placarFora,
        });
      }, 200);
    });
  }
```

With:
```ts
import { IBetRepository } from '../../domain/repositories/IBetRepository';
import { Bet, BetChoice, MatchDetail } from '../../domain/entities/Bet';
import { getAllJogos, getJogoById } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { PalpiteFirestore, UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

export class BetRepository implements IBetRepository {
  async getMatchForBet(jogoId: string): Promise<MatchDetail | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const jogo = getJogoById(jogoId);
        if (!jogo || !jogo.time_casa_id || !jogo.time_fora_id) {
          resolve(null);
          return;
        }
        resolve({
          id: jogo.id,
          fase: jogo.fase,
          data: jogo.data,
          status: jogo.status,
          timeCasaId: jogo.time_casa_id,
          timeForaId: jogo.time_fora_id,
          timeCasaNome: getTeamName(jogo.time_casa_id),
          timeForaNome: getTeamName(jogo.time_fora_id),
          timeCasaFlagUrl: getFlagUrl(jogo.time_casa_id),
          timeForaFlagUrl: getFlagUrl(jogo.time_fora_id),
          placarCasa: jogo.placar_casa,
          placarFora: jogo.placar_fora,
        });
      }, 200);
    });
  }
```

Then, further down in the same file, replace:
```ts
  async saveBet(bet: Bet): Promise<boolean> {
    const jogos = localDb.getJogos() as any[];
    const jogo = jogos.find((j: any) => j.id === bet.jogoId);
    if (!jogo || jogo.status !== 'agendado') {
      return false;
    }
```

With:
```ts
  async saveBet(bet: Bet): Promise<boolean> {
    const jogo = getJogoById(bet.jogoId);
    if (!jogo || jogo.status !== 'agendado') {
      return false;
    }
```

(`getBetForMatch` doesn't touch `jogos` for team names beyond what's already covered by `getTeamName`/`getFlagUrl` from Task 6 — no change needed there beyond the removed `localDb` import, already handled by the import-line replacement above.)

- [ ] **Step 3: Rewrite `BettingRepository.ts`**

Replace the full contents of `src/features/betting-page/infrastructure/repositories/BettingRepository.ts` with:

```ts
import { IBettingRepository } from '../../domain/repositories/IBettingRepository';
import { Match, MatchFilter } from '../../domain/entities/Match';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

export class BettingRepository implements IBettingRepository {
  async getMatches(filtro: MatchFilter): Promise<Match[]> {
    const usuario = await UsuarioRepository.getUsuario();
    const palpiteIds = new Set((usuario?.palpites ?? []).map((p) => p.id_palpite));

    return new Promise((resolve) => {
      setTimeout(() => {
        const jogos = getAllJogos();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const filtered = jogos.filter((j) => {
          if (j.status === 'aguardando_definicao') return false;
          if (!j.time_casa_id || !j.time_fora_id) return false;

          if (filtro === 'hoje') {
            if (!j.data) return false;
            const jDate = new Date(j.data);
            return jDate >= today && jDate < tomorrow;
          }
          return j.fase === filtro;
        });

        // If "hoje" has no matches, fallback to showing all agendado + ao_vivo
        const source = (filtro === 'hoje' && filtered.length === 0)
          ? jogos.filter((j) => (j.status === 'agendado' || j.status === 'ao_vivo') && j.time_casa_id && j.time_fora_id).slice(0, 6)
          : filtered;

        const matches: Match[] = source.map((j) => ({
          id: j.id,
          // JogoRow.fase/status sao `string` (a tabela SQLite nao restringe
          // valores) -- o dominio Match usa unions literais mais estreitas;
          // o JSON original passava por esse mesmo cast implicitamente via
          // `any`, aqui e explicito.
          fase: j.fase as Match['fase'],
          data: j.data,
          status: j.status as Match['status'],
          timeCasaId: j.time_casa_id,
          timeForaId: j.time_fora_id,
          timeCasaNome: getTeamName(j.time_casa_id),
          timeForaNome: getTeamName(j.time_fora_id),
          timeCasaFlagUrl: getFlagUrl(j.time_casa_id),
          timeForaFlagUrl: getFlagUrl(j.time_fora_id),
          placarCasa: j.placar_casa,
          placarFora: j.placar_fora,
          temPalpite: palpiteIds.has(j.id),
        }));

        resolve(matches);
      }, 300);
    });
  }
}
```

- [ ] **Step 4: Rewrite `MatchScheduleRepository.ts`**

Replace the full contents of `src/features/match-schedule-page/infrastructure/repositories/MatchScheduleRepository.ts` with:

```ts
import { IMatchScheduleRepository } from '../../domain/repositories/IMatchScheduleRepository';
import { GroupSchedule, Standing } from '../../domain/entities/GroupSchedule';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

interface FaseGrupoRow {
  time_id: string;
  nome: string;
  grupo: string;
  posicao_final: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  pontos: number;
  gols_pro: number | null;
  gols_contra: number | null;
  saldo_gols: number | null;
}

export class MatchScheduleRepository implements IMatchScheduleRepository {
  async getGroupSchedule(grupo: string): Promise<GroupSchedule | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getDbSync();
        const groupTeams = db.getAllSync<FaseGrupoRow>('SELECT * FROM fase_grupo WHERE grupo = ?', [grupo]);
        if (groupTeams.length === 0) {
          resolve(null);
          return;
        }

        const standings: Standing[] = groupTeams.map((t) => ({
          posicao: t.posicao_final,
          timeId: t.time_id,
          nome: t.nome ?? getTeamName(t.time_id),
          bandeira: getFlagUrl(t.time_id),
          pontos: t.pontos,
          jogos: t.jogos,
          vitorias: t.vitorias,
          empates: t.empates,
          derrotas: t.derrotas,
          golsPro: t.gols_pro,
          golsContra: t.gols_contra,
          saldoGols: t.saldo_gols,
        })).sort((a: Standing, b: Standing) => a.posicao - b.posicao);

        const groupTeamIds = new Set(standings.map(s => s.timeId));

        const jogos = getAllJogos();
        const groupMatches = jogos.filter((j) =>
          j.fase === 'dezesseis_avos' &&
          j.time_casa_id && j.time_fora_id &&
          groupTeamIds.has(j.time_casa_id) &&
          groupTeamIds.has(j.time_fora_id)
        );

        const matches: any[] = groupMatches.map((j) => ({
          id: j.id,
          data: j.data,
          timeCasaId: j.time_casa_id,
          timeCasaNome: getTeamName(j.time_casa_id),
          timeCasaFlagUrl: getFlagUrl(j.time_casa_id),
          timeForaId: j.time_fora_id,
          timeForaNome: getTeamName(j.time_fora_id),
          timeForaFlagUrl: getFlagUrl(j.time_fora_id),
          placarCasa: j.placar_casa,
          placarFora: j.placar_fora,
          status: j.status,
          fase: j.fase || 'dezesseis_avos',
          temPalpite: false
        }));

        resolve({
          grupo,
          standings,
          matches,
        });
      }, 300);
    });
  }
}
```

- [ ] **Step 5: Rewrite `HomeRepository.ts`**

In `src/features/home-page/infrastructure/repositories/HomeRepository.ts`, replace:
```ts
import { IHomeRepository } from '../../domain/repositories/IHomeRepository';
import { HomeData, FeaturedMatch } from '../../domain/entities/HomeData';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';
```
with:
```ts
import { IHomeRepository } from '../../domain/repositories/IHomeRepository';
import { HomeData, FeaturedMatch } from '../../domain/entities/HomeData';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';
```

And replace:
```ts
        const jogos = localDb.getJogos() as any[];

        // Find featured match: prefer live, then first upcoming
        const live = jogos.find((j: any) => j.status === 'ao_vivo' && j.timeCasaId && j.timeForaId);
        const upcoming = jogos.find((j: any) => j.status === 'agendado' && j.timeCasaId && j.timeForaId);
        const raw = live ?? upcoming;

        let featuredMatch: FeaturedMatch | null = null;
        if (raw) {
          featuredMatch = {
            id: raw.id,
            timeCasaId: raw.timeCasaId,
            timeForaId: raw.timeForaId,
            timeCasaNome: getTeamName(raw.timeCasaId),
            timeForaNome: getTeamName(raw.timeForaId),
            flagCasa: getFlagUrl(raw.timeCasaId),
            flagFora: getFlagUrl(raw.timeForaId),
            placarCasa: raw.placarCasa,
            placarFora: raw.placarFora,
            status: raw.status,
            minuto: raw.minuto ?? null,
          };
        }
```
with:
```ts
        const jogos = getAllJogos();

        // Find featured match: prefer live, then first upcoming
        const live = jogos.find((j) => j.status === 'ao_vivo' && j.time_casa_id && j.time_fora_id);
        const upcoming = jogos.find((j) => j.status === 'agendado' && j.time_casa_id && j.time_fora_id);
        const raw = live ?? upcoming;

        let featuredMatch: FeaturedMatch | null = null;
        if (raw) {
          featuredMatch = {
            id: raw.id,
            timeCasaId: raw.time_casa_id!,
            timeForaId: raw.time_fora_id!,
            timeCasaNome: getTeamName(raw.time_casa_id),
            timeForaNome: getTeamName(raw.time_fora_id),
            flagCasa: getFlagUrl(raw.time_casa_id),
            flagFora: getFlagUrl(raw.time_fora_id),
            placarCasa: raw.placar_casa,
            placarFora: raw.placar_fora,
            status: raw.status,
            minuto: null,
          };
        }
```

- [ ] **Step 6: Rewrite `apurarPalpites.ts`**

Replace the full contents of `src/shareds/infrastructure/firebase/apurarPalpites.ts` with:

```ts
import { getAllJogos, JogoRow } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { PalpiteFirestore, UsuarioRepository } from './UsuarioRepository';
import { getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

const PONTOS_PLACAR_EXATO = 500;
const PONTOS_VENCEDOR = 200;

// Observacao: os jogos (tabela sqlite `jogos`) nao guardam quem marcou o
// primeiro gol, entao nao ha como apurar o palpite de "primeiro time a
// marcar" (BET_REWARDS.primeiroMarcar fica sem uso ate essa informacao
// existir em algum lugar).

function resultadoReal(jogo: JogoRow): 'casa' | 'fora' | 'empate' {
  if ((jogo.placar_casa ?? 0) > (jogo.placar_fora ?? 0)) return 'casa';
  if ((jogo.placar_casa ?? 0) < (jogo.placar_fora ?? 0)) return 'fora';
  return 'empate';
}

function apurarPalpite(palpite: PalpiteFirestore, jogo: JogoRow): number {
  let pontos = 0;

  if (palpite.placar_time_1 === jogo.placar_casa && palpite.placar_time_2 === jogo.placar_fora) {
    pontos += PONTOS_PLACAR_EXATO;
  }

  const resultado = resultadoReal(jogo);
  const nomeVencedor = resultado === 'empate'
    ? 'Empate'
    : getTeamName(resultado === 'casa' ? jogo.time_casa_id : jogo.time_fora_id);

  if (palpite.ganhador_empate === nomeVencedor) {
    pontos += PONTOS_VENCEDOR;
  }

  return pontos;
}

// Roda no boot do app: credita pontos dos palpites cujo jogo ja terminou e
// que ainda estao com status "Pendente", e marca cada um como
// "Acertou"/"Errou" no Firestore.
export async function apurarPalpitesPendentes(): Promise<void> {
  const usuario = await UsuarioRepository.getUsuario();
  if (!usuario?.palpites?.length) return;

  const jogos = getAllJogos();
  let pontosGanhos = 0;
  let mudou = false;

  const palpitesAtualizados = usuario.palpites.map((palpite) => {
    if (palpite.status.trim() !== 'Pendente') return palpite;

    const jogo = jogos.find((j) => j.id === palpite.id_palpite);
    if (!jogo || jogo.status !== 'finalizado' || jogo.placar_casa == null || jogo.placar_fora == null) {
      return palpite;
    }

    const pontos = apurarPalpite(palpite, jogo);
    pontosGanhos += pontos;
    mudou = true;

    return { ...palpite, status: pontos > 0 ? 'Acertou' : 'Errou' };
  });

  if (!mudou) return;

  await UsuarioRepository.updateUsuario({
    palpites: palpitesAtualizados,
    pontos: (usuario.pontos ?? 0) + pontosGanhos,
  });
}
```

Note: this drops the file's own duplicated `getTeamName` helper in favor of the shared one from `timeHelpers.ts` (both did the exact same lookup against the same team data — now that it's a SQLite query instead of a raw JSON `.find()`, keeping two copies would mean two separate queries doing the same thing for no reason).

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors project-wide — this clears every error introduced back in Task 6 Step 3.

- [ ] **Step 8: Manual verification**

Use the `run` skill: open Home (featured match card), Betting tab (filters: hoje/oitavas/quartas/semifinal/final), Match Schedule (pick a group, confirm standings + round-of-32 matches), and place/update a bet on an `agendado` match to confirm `BetRepository.saveBet`'s `jogo.status !== 'agendado'` gate still works. If any finalized bet exists with a real Firestore test account, confirm `apurarPalpitesPendentes` still credits points on next boot (or trust the code review — this path only differs in its data source, not its logic).

- [ ] **Step 9: Commit**

```bash
git add src/shareds/infrastructure/sqlite/jogosQueries.ts src/features/upcoming-matches-page/infrastructure/repositories/BetRepository.ts src/features/betting-page/infrastructure/repositories/BettingRepository.ts src/features/match-schedule-page/infrastructure/repositories/MatchScheduleRepository.ts src/features/home-page/infrastructure/repositories/HomeRepository.ts src/shareds/infrastructure/firebase/apurarPalpites.ts
git commit -m "feat: read jogos from SQLite in bet/betting/schedule/home repositories and apuracao"
```

---

## Task 10: Delete dead JSON files, full-app pass

**Files:**
- Delete: `src/infra/times.json`, `src/infra/times_detalhes.json`, `src/infra/fase_grupo.json`, `src/infra/jogos.json`, `src/infra/recompensas.json`

- [ ] **Step 1: Confirm nothing imports them anymore**

Run:
```bash
grep -rn "infra/times_detalhes.json\|infra/fase_grupo.json\|infra/jogos.json\|infra/recompensas.json\|infra/times.json" src/
```
Expected: no output. If anything shows up, that file was missed in Tasks 6–9 — fix it before deleting.

- [ ] **Step 2: Delete the files**

```bash
git rm src/infra/times.json src/infra/times_detalhes.json src/infra/fase_grupo.json src/infra/jogos.json src/infra/recompensas.json
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 4: Full manual pass**

Use the `run` skill: exercise Home, Betting, Match Schedule, Teams, Team Detail, Album, Rewards. Every screen should look and behave exactly as before this plan started — this is a storage-layer swap, nothing should look different to a user.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: remove JSON files now fully replaced by SQLite"
```

---

## Self-Review Notes (for whoever executes this plan)

- **Spec coverage:** "criar na hora do build" → Task 2 (Node script → `.db` file, run manually via `npm run db:build`, not auto-hooked into `npm start`/`expo run:android` — same manual-script convention already used by `scripts/generate-sticker-photos-map.mjs`). "carregar na hora de abrir o app" → Tasks 3–4 (`initDb()` in `_layout.tsx`, gates splash). "usar suas bibliotecas... no padrão" → `expo-sqlite` is the official Expo library, `node:sqlite` avoids a new native-compiling dev dependency. Firebase/`album_jogador` and the `database.ts` player catalog are explicitly deferred to Plan 2 per the Global Constraints section — flagged to the user, not silently dropped.
- **Known implementation risk:** the exact TypeScript generics on `getFirstSync`/`getAllSync` and the exact shape of `SQLite.defaultDatabaseDirectory` (string vs. object) could not be confirmed from prose docs alone during planning — Task 3 Step 2 calls this out explicitly as the point to reconcile against the installed package's `.d.ts` if `tsc` disagrees.
- **Type consistency:** `getDbSync`/`initDb` names and `JogoRow`/`getAllJogos`/`getJogoById` names are used identically across Tasks 6–9; double-checked against each task's own code block above.
