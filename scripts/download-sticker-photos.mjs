// Baixa UMA VEZ a foto de cada figurinha (placemonkeys.com) e salva em
// assets/figurinhas/<id>.webp, pra virar asset local do app -- carrega
// instantaneo, sem depender de rede/servico externo em runtime.
// Rodar com: node scripts/download-sticker-photos.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const figurinhasPath = new URL('../src/infra/figurinhas.json', import.meta.url);
const outDir = new URL('../assets/figurinhas/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const figurinhas = JSON.parse(readFileSync(figurinhasPath, 'utf-8'));

const CONCORRENCIA = 8;
const TENTATIVAS = 3;

async function baixarUm(fig) {
  const destino = new URL(`${fig.id}.webp`, outDir);
  if (existsSync(destino)) {
    return { id: fig.id, status: 'ja-existia' };
  }

  const url = `https://www.placemonkeys.com/500?random&fig=${fig.id}`;

  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buffer = Buffer.from(await resp.arrayBuffer());
      if (buffer.length < 500) throw new Error('resposta suspeita (muito pequena)');
      writeFileSync(destino, buffer);
      return { id: fig.id, status: 'ok', bytes: buffer.length };
    } catch (err) {
      if (tentativa === TENTATIVAS) {
        return { id: fig.id, status: 'falhou', erro: err.message };
      }
    }
  }
}

async function main() {
  const fila = [...figurinhas];
  const resultados = [];

  async function worker() {
    while (fila.length > 0) {
      const fig = fila.shift();
      const r = await baixarUm(fig);
      resultados.push(r);
      process.stdout.write(
        r.status === 'falhou' ? `X ${r.id}: ${r.erro}\n` : `. ${r.id} (${r.status})\n`
      );
    }
  }

  await Promise.all(Array.from({ length: CONCORRENCIA }, worker));

  const falhas = resultados.filter((r) => r.status === 'falhou');
  console.log(`\nTotal: ${resultados.length} | Falhas: ${falhas.length}`);
  if (falhas.length > 0) {
    console.log('Figurinhas que falharam:', falhas.map((f) => f.id).join(', '));
    process.exitCode = 1;
  }
}

main();
