// Gera src/shareds/infrastructure/assets/figurinhaFotos.ts: um mapa estatico
// id -> require(...) para as fotos locais em assets/figurinhas/. O Metro so
// consegue empacotar imagens referenciadas por um require() literal (nao da
// pra fazer require(variavel)), entao esse arquivo precisa listar todas
// explicitamente. Rodar com: node scripts/generate-sticker-photos-map.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const figurinhasPath = new URL('../src/infra/figurinhas.json', import.meta.url);
const outPath = new URL('../src/shareds/infrastructure/assets/figurinhaFotos.ts', import.meta.url);

const figurinhas = JSON.parse(readFileSync(figurinhasPath, 'utf-8'));

const linhas = figurinhas
  .map((f) => `  '${f.id}': require('../../../../assets/figurinhas/${f.id}.webp'),`)
  .join('\n');

const conteudo = `// GERADO por scripts/generate-sticker-photos-map.mjs -- nao editar a mao.
// Mapa id da figurinha -> asset local (ver scripts/download-sticker-photos.mjs).
export const FIGURINHA_FOTOS: Record<string, number> = {
${linhas}
};
`;

writeFileSync(outPath, conteudo);
console.log(`OK: ${figurinhas.length} entradas escritas em ${outPath.pathname}`);
