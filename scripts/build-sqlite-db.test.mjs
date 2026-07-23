import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from './build-sqlite-db.mjs';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const realDbPath = path.join(rootDir, 'assets', 'db', 'copa.db');

test('buildDatabase refreshes jogadores and preserves the other tables already baked into copa.db', () => {
  assert.ok(existsSync(realDbPath), 'assets/db/copa.db precisa existir (rodar npm run db:build ao menos uma vez antes)');

  const dir = mkdtempSync(path.join(tmpdir(), 'copa-db-test-'));
  const dbPath = path.join(dir, 'test.db');
  copyFileSync(realDbPath, dbPath);

  const before = new DatabaseSync(dbPath);
  const timesBefore = before.prepare('SELECT COUNT(*) AS n FROM times').get().n;
  const faseGrupoBefore = before.prepare('SELECT COUNT(*) AS n FROM fase_grupo').get().n;
  const jogosBefore = before.prepare('SELECT COUNT(*) AS n FROM jogos').get().n;
  const recompensasBefore = before.prepare('SELECT COUNT(*) AS n FROM recompensas').get().n;
  before.close();

  const counts = buildDatabase(dbPath);

  // times/fase_grupo/jogos/recompensas: sem JSON fonte neste checkout de
  // teste -- devem ficar exatamente como estavam na copia.
  assert.equal(counts.times, timesBefore);
  assert.equal(counts.faseGrupo, faseGrupoBefore);
  assert.equal(counts.jogos, jogosBefore);
  assert.equal(counts.recompensas, recompensasBefore);

  const db = new DatabaseSync(dbPath);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM times').get().n, timesBefore);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM jogadores').get().n, counts.jogadores);

  const jogadoresPositions = db.prepare('SELECT DISTINCT posicao FROM jogadores ORDER BY posicao').all().map((r) => r.posicao);
  assert.deepEqual(jogadoresPositions, ['ATA', 'DEF', 'GOL', 'MEI']);

  const brasilGol = db.prepare("SELECT nome, codigo FROM jogadores WHERE time_id = 'BRA' AND posicao = 'GOL' LIMIT 1").get();
  assert.ok(brasilGol, 'esperava pelo menos um goleiro do Brasil em jogadores');
  assert.ok(brasilGol.codigo.startsWith('BRA'));

  db.close();
  rmSync(dir, { recursive: true, force: true });
});
