// Pluralizacao de "Titulo(s) Mundial(is)" -- estava duplicada e ja
// divergente (maiuscula vs nao, com/sem "Mundial") entre mockTeamRepository
// e mockTeamDetailRepository. Este formato foi escolhido como canonico por
// ser o mais completo/correto gramaticalmente.
export function formatarTitulos(qtd: number): string {
  return qtd === 1 ? '1 Título Mundial' : `${qtd} Títulos Mundiais`;
}
