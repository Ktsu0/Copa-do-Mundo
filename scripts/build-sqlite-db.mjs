// Gera assets/db/copa.db a partir dos JSONs estaticos em src/infra/. Roda
// com: npm run db:build (ou node scripts/build-sqlite-db.mjs)
// Precisa rodar de novo sempre que um dos JSONs fonte mudar -- o arquivo
// .db gerado fica versionado no repo, igual assets/figurinhas/*.webp.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(outDir, { recursive: true });
  const counts = buildDatabase(outPath);
  console.log(`OK: ${outPath}`);
  console.log(counts);
}
