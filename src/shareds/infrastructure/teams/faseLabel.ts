// Rotulo de exibicao pra cada fase da competicao. Compartilhado entre
// MatchCard (betting-page) e MatchHeader (upcoming-matches-page), que
// mostravam o mesmo mapa duplicado.
export const FASE_LABEL: Record<string, string> = {
  dezesseis_avos: 'FASE DE GRUPOS',
  oitavas: 'OITAVAS DE FINAL',
  quartas: 'QUARTAS DE FINAL',
  semifinal: 'SEMIFINAL',
  final: 'FINAL',
};
