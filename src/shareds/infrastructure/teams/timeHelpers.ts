import { getDbSync } from '@/shareds/infrastructure/sqlite/db';

const countryCodeMap: Record<string, string> = {
  ENG: 'gb-eng', WAL: 'gb-wls', KSA: 'sa', RSA: 'za', SUI: 'ch',
  CRO: 'hr', POR: 'pt', GER: 'de', JPN: 'jp', MAR: 'ma', URU: 'uy',
  KOR: 'kr', IRN: 'ir', SEN: 'sn', USA: 'us', ARG: 'ar', FRA: 'fr',
  BRA: 'br', ESP: 'es', NED: 'nl', BEL: 'be', AUS: 'au', QAT: 'qa',
  ECU: 'ec', CAN: 'ca', MEX: 'mx', TUN: 'tn', CPV: 'cv', SWE: 'se', GHA: 'gh',
};

// Monta a URL da bandeira no flagcdn.com a partir da sigla do time (ex: "BRA").
// `width` segue os tamanhos ja usados no app: 40 (grupos do album), 80
// (listas de jogo/apostas), 640 (card/detalhe de time).
export function getFlagUrl(timeId: string | null | undefined, width: 40 | 80 | 640 = 80): string {
  if (!timeId) return '';
  const cc = countryCodeMap[timeId] ?? timeId.substring(0, 2).toLowerCase();
  return `https://flagcdn.com/w${width}/${cc}.png`;
}

export function getTeamName(timeId: string | null | undefined): string {
  if (!timeId) return '???';
  const row = getDbSync().getFirstSync<{ nome: string }>('SELECT nome FROM times WHERE id = ?', [timeId]);
  return row ? row.nome : timeId;
}
