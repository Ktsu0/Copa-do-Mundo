import { isMaiorDeIdade, isMaiorDeIdadePorDataISO } from '@/shareds/domain/idade';

describe('isMaiorDeIdade', () => {
  const hoje = new Date(2026, 6, 28); // 28/07/2026

  it('retorna true para quem já fez 18 anos há tempo', () => {
    expect(isMaiorDeIdade(new Date(2000, 0, 1), hoje)).toBe(true);
  });

  it('retorna false para quem ainda não fez 18 anos', () => {
    expect(isMaiorDeIdade(new Date(2010, 0, 1), hoje)).toBe(false);
  });

  it('retorna true no dia exato do aniversário de 18 anos', () => {
    expect(isMaiorDeIdade(new Date(2008, 6, 28), hoje)).toBe(true);
  });

  it('retorna false no dia anterior ao aniversário de 18 anos', () => {
    expect(isMaiorDeIdade(new Date(2008, 6, 29), hoje)).toBe(false);
  });

  it('retorna true no dia seguinte ao aniversário de 18 anos', () => {
    expect(isMaiorDeIdade(new Date(2008, 6, 27), hoje)).toBe(true);
  });

  it('considera o mês do aniversário ainda não alcançado no ano corrente', () => {
    expect(isMaiorDeIdade(new Date(2008, 11, 1), hoje)).toBe(false);
  });

  it('nascido em 29 de fevereiro só é considerado maior de idade a partir de 1º de março em ano não bissexto', () => {
    // 2008 foi bissexto; 2026 não é, então não existe 29/02/2026 -- a
    // implementação (comparação de mês/dia) só reconhece o aniversário a
    // partir de 1º de março nesse caso, um dia "depois" do ideal.
    expect(isMaiorDeIdade(new Date(2008, 1, 29), new Date(2026, 1, 28))).toBe(false);
    expect(isMaiorDeIdade(new Date(2008, 1, 29), new Date(2026, 2, 1))).toBe(true);
  });
});

describe('isMaiorDeIdadePorDataISO', () => {
  it('interpreta corretamente uma data ISO "AAAA-MM-DD"', () => {
    const hoje = new Date(2026, 6, 28);
    expect(isMaiorDeIdade(new Date(2000, 0, 1), hoje)).toBe(true);
    expect(isMaiorDeIdadePorDataISO('2000-01-01')).toBe(true);
  });

  it('retorna false para nascimento recente', () => {
    const anoQueGarantidamenteEhMenorDeIdade = new Date().getFullYear() - 1;
    expect(isMaiorDeIdadePorDataISO(`${anoQueGarantidamenteEhMenorDeIdade}-01-01`)).toBe(false);
  });
});
