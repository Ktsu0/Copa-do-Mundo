import defaultFigurinhas from '../../../infra/figurinhas.json';

// Catalogo de figurinhas -- ainda nao migrou pro SQLite (ver plano de
// migracao do catalogo em docs/superpowers/plans, Plan 2). times, jogos,
// fase_grupo e recompensas agora vivem no SQLite -- ver
// src/shareds/infrastructure/sqlite/db.ts.
export const localDb = {
  getFigurinhas: () => defaultFigurinhas,
};
