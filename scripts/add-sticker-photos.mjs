// Adiciona um fotoUrl (placemonkeys.com) a cada figurinha em
// src/infra/figurinhas.json. O parametro extra (fig=<id>) so serve pra cada
// figurinha ter uma URL distinta (senao o cache de imagem do app trataria
// todas como o mesmo recurso). Rodar com: node scripts/add-sticker-photos.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../src/infra/figurinhas.json', import.meta.url);
const figurinhas = JSON.parse(readFileSync(path, 'utf-8'));

const atualizadas = figurinhas.map((f) => ({
  ...f,
  fotoUrl: `https://www.placemonkeys.com/500?random&fig=${f.id}`,
}));

writeFileSync(path, JSON.stringify(atualizadas, null, 2) + '\n');
console.log(`OK: fotoUrl adicionado em ${atualizadas.length} figurinhas.`);
