// Formula de "% concluido" reescrita em varios repositorios/telas
// (recompensas, album, figurinhas) de forma identica -- centralizada aqui.
export function calculateProgress(collected: number, total: number): number {
  return total > 0 ? parseFloat(((collected / total) * 100).toFixed(1)) : 0;
}
