// maior_idade no Firestore e um snapshot calculado uma vez no cadastro e
// nunca mais atualizado -- se o usuario corrigir a data de nascimento depois
// (ou o cadastro tiver sido feito com data errada), o campo fica desatualizado
// pra sempre. Em vez de recalcular em lote pra todo mundo periodicamente,
// essas funcoes recalculam na hora, a partir de data_nascimento, sempre que o
// app precisa decidir se o usuario pode apostar (ver BetRepository e
// useBetDetail) -- calculo trivial, nao precisa de cache nem job.
export function isMaiorDeIdade(nascimento: Date, hoje: Date = new Date()): boolean {
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade >= 18;
}

// data_nascimento no Firestore fica no formato ISO "AAAA-MM-DD" (ver
// AuthRepository.dataParaISO).
export function isMaiorDeIdadePorDataISO(dataNascimentoISO: string): boolean {
  const [ano, mes, dia] = dataNascimentoISO.split('-').map(Number);
  return isMaiorDeIdade(new Date(ano, mes - 1, dia));
}
