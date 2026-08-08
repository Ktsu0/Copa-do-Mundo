import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'copa.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<void> | null = null;

// O catalogo estatico e reconstruido a cada build (ver scripts/build-sqlite-db.mjs)
// -- forceOverwrite garante que a copia anterior nao fique presa numa versao
// antiga entre atualizacoes do app.
//
// Usa a API nativa do proprio expo-sqlite (a mesma que o SQLiteProvider usa
// por baixo dos panos via assetSource) em vez de recriar o diretorio na mao
// com expo-file-system: o Directory/File novo do expo-file-system valida
// permissao de escrita via allowlist de paths (documentDirectory/cacheDirectory)
// e rejeita o diretorio proprio do SQLite ("Missing 'WRITE' permission"),
// enquanto importDatabaseFromAssetAsync mexe direto com java.io.File e nao
// passa por essa checagem.
async function copyBundledDatabase(): Promise<void> {
  await SQLite.importDatabaseFromAssetAsync(DATABASE_NAME, {
    assetId: require('../../../../assets/db/copa.db'),
    forceOverwrite: true,
  });
}

// Chamado uma vez no boot do app (ver src/app/_layout.tsx). Copia o banco
// pre-gerado pra area gravavel do SQLite e abre a conexao, guardando o
// resultado em cache pro resto do app usar via getDbSync().
export function initDb(): Promise<void> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await copyBundledDatabase();
      dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    })().catch((err) => {
      // Sem isso, uma falha unica (disco cheio, permissao, asset corrompido)
      // ficava em cache pra sempre e nenhuma tela conseguia mais consultar
      // jogos/times/jogadores pelo resto da sessao. Limpando o cache aqui, a
      // proxima chamada a initDb() tenta de novo em vez de repetir o erro.
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

// Acesso sincrono usado pelos repositorios (a maioria faz .find()/.map()
// sincronos sobre os dados estaticos hoje, dentro de metodos ja async). So
// funciona depois de initDb() ter resolvido -- por isso os repositorios
// chamam `await initDb()` antes de consultar (ver HomeRepository e afins).
export function getDbSync(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('SQLite ainda nao foi inicializado -- initDb() precisa resolver antes de qualquer query (ver _layout.tsx).');
  }
  return dbInstance;
}
