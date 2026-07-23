import { Asset } from 'expo-asset';
import { Directory, File } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'copa.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<void> | null = null;

// No Android, SQLite.defaultDatabaseDirectory devolve um path puro (sem
// "file://"), o que quebra o construtor de Directory/File do
// expo-file-system ("URI is not absolute"). No iOS o path puro funciona
// por acaso (fallback nativo do proprio iOS), entao o bug so aparece
// rodando de verdade num device/emulador Android.
function toFileUri(rawPath: string): string {
  return rawPath.startsWith('file://') ? rawPath : `file://${rawPath}`;
}

async function copyBundledDatabase(): Promise<void> {
  const directory = new Directory(toFileUri(SQLite.defaultDatabaseDirectory));
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
