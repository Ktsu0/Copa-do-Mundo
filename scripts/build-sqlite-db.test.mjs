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
